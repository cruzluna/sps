use crate::api_models::CreatePromptRequest;

#[cfg(not(test))]
use log::{debug, error, info};
use r2d2::Pool;
use r2d2_sqlite::SqliteConnectionManager;
use rusqlite::{params, Result, Statement};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
#[cfg(test)]
use std::{println as info, println as error, println as debug};
use uuid::Uuid;

#[derive(Debug, thiserror::Error)]
pub enum CacheError {
    #[error("record not found")]
    NotFound,

    #[error("unhanded error:`{0}`")]
    UnhandledError(String),

    #[error("invalid request:`{0}`")]
    InvalidRequest(String),

    #[error("error with pool")]
    PoolError(#[from] r2d2::Error),
}

type CacheResult<T> = Result<T, CacheError>;

impl From<rusqlite::Error> for CacheError {
    fn from(err: rusqlite::Error) -> Self {
        match err {
            // Map specific rusqlite errors to more semantic DatabaseError variants
            rusqlite::Error::QueryReturnedNoRows => CacheError::NotFound,
            // TBD
            _ => CacheError::UnhandledError(err.to_string()),
        }
    }
}

pub fn now_timestamp() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("System time before UNIX EPOCH")
        .as_secs() as i64
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DbPrompt {
    pub id: String,
    pub version: i32,
    pub content: String,
    pub parent: String,
    pub branched: Option<bool>,
    // TODO: add an archived date?
    pub archived: Option<bool>,
    pub created_at: i64,
    pub metadata: Option<DbPromptMetadata>,
}

impl From<CreatePromptRequest> for DbPrompt {
    fn from(prompt: CreatePromptRequest) -> Self {
        let id = Uuid::new_v4().to_string();
        let now = now_timestamp();

        let metadata = if prompt.name.is_some()
            || prompt.description.is_some()
            || prompt.category.is_some()
            || prompt.tags.is_some()
        {
            Some(DbPromptMetadata {
                id: id.clone(),
                name: prompt.name,
                description: prompt.description,
                category: prompt.category,
                tags: prompt.tags,
                updated_at: now,
            })
        } else {
            None
        };

        Self {
            id: id.clone(),
            version: 1,
            content: prompt.content,
            parent: prompt.parent.unwrap_or(id.clone()),
            branched: prompt.branched,
            archived: Some(false),
            created_at: now,
            metadata,
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DbPromptMetadata {
    // Reference to the prompt id
    pub id: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub category: Option<String>,
    pub tags: Option<Vec<String>>,
    pub updated_at: i64,
}

impl DbPromptMetadata {
    pub fn tags_to_string(&self) -> Option<String> {
        self.tags.clone().map(|tags| tags.join(","))
    }
}

/*
https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing
connections = ((core_count * 2) + effective_spindle_count)
*/
const MAX_CONNECTIONS: u32 = 4;
pub struct CacheConfig {
    pool: Pool<SqliteConnectionManager>,
}

impl CacheConfig {
    fn configure_pool(db_path: &str) -> Pool<SqliteConnectionManager> {
        let manager = SqliteConnectionManager::file(db_path);
        Pool::builder()
            .max_size(MAX_CONNECTIONS)
            .build(manager)
            .unwrap_or_else(|e| {
                error!("Failed to configure connection pool: {}", e);
                panic!("Pool not configured");
            })
    }

    pub fn new(db_path: &str) -> Result<Self, CacheError> {
        info!("Opening database: {}", db_path);
        let pool = CacheConfig::configure_pool(db_path);

        // Enable WAL mode for better concurrency and performance
        pool.get()?.pragma_update(None, "journal_mode", "WAL")?;
        // Set busy timeout to handle concurrent access
        pool.get()?
            .busy_timeout(std::time::Duration::from_secs(30))?;

        // Create tables if they don't exist
        pool.get()?.execute(
            "CREATE TABLE IF NOT EXISTS prompts (
                id TEXT PRIMARY KEY,
                version INTEGER NOT NULL,
                content TEXT NOT NULL,
                parent TEXT,
                branched BOOLEAN,
                archived BOOLEAN,
                created_at INTEGER NOT NULL
            )",
            [],
        )?;

        // Metadata table
        pool.get()?.execute(
            "CREATE TABLE IF NOT EXISTS metadata (
                id TEXT PRIMARY KEY,
                name TEXT,
                description TEXT,
                category TEXT,
                tags TEXT,
                updated_at INTEGER NOT NULL
            )",
            [],
        )?;

        Ok(Self { pool })
    }

    pub fn insert_prompt(&self, prompt: DbPrompt) -> CacheResult<DbPrompt> {
        info!("Inserting: {}", prompt.id);
        self.pool.get()?.execute(
            "INSERT INTO prompts (id, version, content, parent, branched, archived, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                &prompt.id,
                &prompt.version,
                &prompt.content,
                &prompt.parent,
                &prompt.branched,
                &prompt.archived,
                &prompt.created_at,
            ],
        )?;

        if let Some(metadata) = &prompt.metadata {
            info!("Inserting metadata for prompt: {}", prompt.id);
            self.pool.get()?.execute(
                "INSERT INTO metadata (id, name, description, category, tags, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                params![
                    &metadata.id,
                    &metadata.name,
                    &metadata.description,
                    &metadata.category,
                    &metadata.tags_to_string(),
                    &metadata.updated_at
                ],
            )?;
        }

        Ok(prompt)
    }

    pub fn get_prompt_content(&self, id: &str) -> CacheResult<String> {
        let pool_conn = self.pool.get()?;
        let mut stmt = pool_conn
            .prepare("SELECT content FROM prompts WHERE id = ?1")
            .inspect_err(|e| {
                error!(
                    "Failed to prepare statement for get_prompt_content: {:?}",
                    e
                )
            })?;

        let content = stmt
            .query_row(params![id], |row| row.get(0))
            .inspect_err(|e| match e {
                rusqlite::Error::QueryReturnedNoRows => {
                    error!("No prompt found with id {}", id);
                }
                _ => {
                    error!("Database error while getting prompt content: {:?}", e);
                }
            })?;
        Ok(content)
    }

    pub fn get_prompt_categories(&self) -> CacheResult<Vec<String>> {
        let pool_conn = self.pool.get()?;
        let mut stmt = pool_conn
            .prepare("SELECT DISTINCT category FROM metadata")
            .inspect_err(|e| {
                error!(
                    "Failed to prepare statement for get_prompt_categories: {}",
                    e
                )
            })?;
        let categories: Vec<String> = stmt
            .query_map([], |row| row.get(0))
            .inspect_err(|e| error!("Failed to query map for get_prompt_categories: {}", e))?
            .map(|res| res.map_err(Into::into))
            .collect::<Result<Vec<String>, CacheError>>()
            .inspect_err(|e| error!("Failed to collect for get_prompt_categories: {}", e))?;
        Ok(categories)
    }

    pub fn get_prompt_content_latest_version(&self, id: &str) -> CacheResult<String> {
        let pool_conn = self.pool.get()?;
        let mut stmt = pool_conn
            .prepare("SELECT content FROM prompts WHERE parent = ?1 ORDER by version DESC limit 1")
            .inspect_err(|e| {
                error!(
                    "Failed to prepare statement for get_prompt_content_latest_version: {}",
                    e
                )
            })?;

        let content = stmt
            .query_row(params![id], |row| row.get(0))
            .inspect_err(|e| match e {
                rusqlite::Error::QueryReturnedNoRows => {
                    error!("No prompt found with id {} for latest version", id);
                }
                _ => {
                    error!(
                        "Database error while getting latest prompt content: {:?}",
                        e
                    );
                }
            })?;
        Ok(content)
    }

    // For now don't return metadata since this is just a ui endpoint for now
    pub fn get_prompts(
        &self,
        category: Option<String>,
        offset: u32,
        limit: u32,
    ) -> CacheResult<Vec<DbPrompt>> {
        debug!(
            "Getting prompts with params: category={:?}, offset={}, limit={}",
            category, offset, limit
        );
        if limit <= 0 {
            error!("Invalid request: limit={}", limit);
            return Err(CacheError::InvalidRequest(
                "Invalid limit value".to_string(),
            ));
        }

        let pool_conn = self.pool.get()?;
        let mut stmt: Statement;

        if category.is_none() {
            stmt = pool_conn
                .prepare(
                    "SELECT * FROM prompts p 
                     LEFT JOIN metadata m ON p.id = m.id 
                     LIMIT ?1 OFFSET ?2",
                )
                .inspect_err(|e| error!("Failed to prepare statement for get_prompts: {}", e))?;

            let prompts = stmt
                .query_map([limit, offset], |row| {
                    Ok(DbPrompt {
                        id: row.get(0)?,
                        version: row.get(1)?,
                        content: row.get(2)?,
                        parent: row.get(3)?,
                        branched: row.get(4)?,
                        archived: row.get(5)?,
                        created_at: row.get(6)?,
                        metadata: Some(DbPromptMetadata {
                            id: row.get(7)?,
                            name: row.get(8)?,
                            description: row.get(9)?,
                            category: row.get(10)?,
                            tags: row
                                .get::<_, Option<String>>(11)?
                                .map(|tags| tags.split(',').map(|s| s.to_string()).collect()),
                            updated_at: row.get(12)?,
                        }),
                    })
                })?
                .map(|res| res.map_err(Into::into))
                .collect::<Result<Vec<DbPrompt>, CacheError>>()?;

            return Ok(prompts);
        }
        stmt = pool_conn
            .prepare(
                "SELECT * FROM prompts p 
                 LEFT JOIN metadata m ON p.id = m.id 
                 WHERE m.category = ?1 
                 LIMIT ?2 OFFSET ?3",
            )
            .inspect_err(|e| {
                error!(
                    "Failed to prepare statement for get_prompts with category: {}",
                    e
                )
            })?;

        let prompts = stmt
            .query_map(params![category.unwrap(), limit, offset], |row| {
                Ok(DbPrompt {
                    id: row.get(0)?,
                    version: row.get(1)?,
                    content: row.get(2)?,
                    parent: row.get(3)?,
                    branched: row.get(4)?,
                    archived: row.get(5)?,
                    created_at: row.get(6)?,
                    metadata: Some(DbPromptMetadata {
                        id: row.get(7)?,
                        name: row.get(8)?,
                        description: row.get(9)?,
                        category: row.get(10)?,
                        tags: row
                            .get::<_, Option<String>>(11)?
                            .map(|tags| tags.split(',').map(|s| s.to_string()).collect()),
                        updated_at: row.get(12)?,
                    }),
                })
            })?
            .map(|res| res.map_err(Into::into))
            .collect();

        prompts
    }

    pub fn get_prompt(&self, id: &str, metadata: Option<bool>) -> CacheResult<Option<DbPrompt>> {
        debug!(
            "Getting prompt with id: {} and metadata: {:?}",
            id, metadata
        );
        let pool_conn = self.pool.get()?;

        if metadata.is_some_and(|m| m) {
            let mut stmt = pool_conn.prepare(
                "SELECT p.id, p.version, p.content, p.parent, p.branched, p.archived, p.created_at,
                        m.name, m.description, m.category, m.tags, m.updated_at
                 FROM prompts p 
                 LEFT JOIN metadata m ON p.id = m.id 
                 WHERE p.id = ?1",
            )
            .inspect_err(|e| error!("Failed to prepare statement for get_prompt with metadata: {}", e))?;

            let prompt_with_metadata = stmt.query_row(params![id], |row| {
                Ok(DbPrompt {
                    id: row.get(0)?,
                    version: row.get(1)?,
                    content: row.get(2)?,
                    parent: row.get(3)?,
                    branched: row.get(4)?,
                    archived: row.get(5)?,
                    created_at: row.get(6)?,
                    metadata: Some(DbPromptMetadata {
                        id: row.get(0)?,
                        name: row.get(7)?,
                        description: row.get(8)?,
                        category: row.get(9)?,
                        tags: row
                            .get::<_, Option<String>>(10)?
                            .map(|tags| tags.split(',').map(|s| s.to_string()).collect()),
                        updated_at: row.get(11)?,
                    }),
                })
            }); // TODO: use rusqlite optional to avoid norows error handling

            return match prompt_with_metadata {
                Ok(prompt_with_metadata) => Ok(Some(prompt_with_metadata)),
                Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
                Err(e) => {
                    error!("Database error while getting prompt with metadata: {}", e);
                    Err(CacheError::UnhandledError(e.to_string()))
                }
            };
        }

        let mut stmt = pool_conn
            .prepare("SELECT * FROM prompts WHERE id = ?1")
            .inspect_err(|e| {
                error!(
                    "Failed to prepare statement for get_prompt without metadata: {}",
                    e
                )
            })?;

        let prompt_without_metadata = stmt.query_row(params![id], |row| {
            Ok(DbPrompt {
                id: row.get(0)?,
                version: row.get(1)?,
                content: row.get(2)?,
                parent: row.get(3)?,
                branched: row.get(4)?,
                archived: row.get(5)?,
                created_at: row.get(6)?,
                metadata: None,
            })
        });

        return match prompt_without_metadata {
            Ok(prompt) => Ok(Some(prompt)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => {
                error!("Database error while getting prompt: {}", e);
                Err(CacheError::UnhandledError(e.to_string()))
            }
        };
    }

    pub fn update_prompt_metadata(
        &self,
        id: &str,
        metadata: DbPromptMetadata,
    ) -> CacheResult<String> {
        let now = now_timestamp();

        let rows_affected = self.pool.get()?.execute(
            "UPDATE metadata SET name = ?2, description = ?3, category = ?4, tags = ?5, updated_at = ?7
             WHERE id = ?1",
            params![&id, &metadata.name, &metadata.description, &metadata.category, &metadata.tags_to_string(), now, now],
        )
        .inspect_err(|e| error!("Failed to update prompt metadata: {:?}", e))?;

        match rows_affected {
            0 => Err(CacheError::NotFound),
            _ => Ok(id.to_string()),
        }
    }

    pub fn delete_prompt(&self, id: &str) -> CacheResult<bool> {
        let rows_affected = self
            .pool
            .get()?
            .execute(
                "UPDATE prompts SET archived = true WHERE id = ?1",
                params![id],
            )
            .inspect_err(|e| error!("Failed to delete prompt with id {}: {}", id, e))?;
        Ok(rows_affected > 0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_prompt_without_metadata() {
        let temp_dir = tempfile::tempdir().unwrap();
        let db_path = temp_dir
            .path()
            .join("test.db")
            .to_str()
            .unwrap()
            .to_string();

        let db = CacheConfig::new(&db_path).unwrap();
        let inserted_prompt = db.insert_prompt(DbPrompt {
            id: "123".to_string(),
            version: 1,
            content: "Hello, world!".to_string(),
            parent: "123".to_string(),
            branched: Some(false),
            archived: Some(false),
            created_at: now_timestamp(),
            metadata: None,
        });

        assert_eq!(inserted_prompt.as_ref().unwrap().id, "123");
    }

    #[test]
    fn test_get_prompt_content_latest_version() {
        let temp_dir = tempfile::tempdir().unwrap();
        let db_path = temp_dir
            .path()
            .join("test.db")
            .to_str()
            .unwrap()
            .to_string();

        let db = CacheConfig::new(&db_path).unwrap();
        let inserted_prompt = db.insert_prompt(DbPrompt {
            id: "123".to_string(),
            version: 1,
            content: "Hello, world!".to_string(),
            parent: "123".to_string(),
            branched: Some(false),
            archived: Some(false),
            created_at: now_timestamp(),
            metadata: None,
        });
        assert_eq!(inserted_prompt.as_ref().unwrap().id, "123");

        let p = db.get_prompt("123", None).unwrap();
        assert_eq!(p.as_ref().unwrap().id, "123");
        assert_eq!(p.as_ref().unwrap().content, "Hello, world!");

        // insert a new version of the prompt
        let _ = db.insert_prompt(DbPrompt {
            id: "1234".to_string(),
            version: 2,
            content: "updated content".to_string(),
            parent: "123".to_string(),
            branched: Some(false),
            archived: Some(false),
            created_at: now_timestamp(),
            metadata: None,
        });

        let prompt = db.get_prompt_content_latest_version("123").unwrap();
        assert_eq!(prompt, "updated content");

        let check_updated_prompt_content = db.get_prompt_content("1234").unwrap();
        assert_eq!(check_updated_prompt_content, "updated content");

        let check_original_prompt_content = db.get_prompt_content("123").unwrap();
        assert_eq!(check_original_prompt_content, "Hello, world!");
    }

    #[test]
    fn test_get_prompts() {
        let temp_dir = tempfile::tempdir().unwrap();
        let db_path = temp_dir
            .path()
            .join("test.db")
            .to_str()
            .unwrap()
            .to_string();

        let db = CacheConfig::new(&db_path).unwrap();

        // Insert prompts with metadata
        let _ = db.insert_prompt(DbPrompt {
            id: "prompt1".to_string(),
            version: 1,
            content: "Content 1".to_string(),
            parent: "prompt1".to_string(),
            branched: Some(false),
            archived: Some(false),
            created_at: now_timestamp(),
            metadata: Some(DbPromptMetadata {
                id: "prompt1".to_string(),
                name: Some("Test Prompt 1".to_string()),
                description: Some("Description 1".to_string()),
                category: Some("test".to_string()),
                tags: Some(vec!["tag1".to_string()]),
                updated_at: now_timestamp(),
            }),
        });

        let _ = db.insert_prompt(DbPrompt {
            id: "prompt2".to_string(),
            version: 1,
            content: "Content 2".to_string(),
            parent: "prompt2".to_string(),
            branched: Some(false),
            archived: Some(false),
            created_at: now_timestamp(),
            metadata: Some(DbPromptMetadata {
                id: "prompt2".to_string(),
                name: Some("Test Prompt 2".to_string()),
                description: Some("Description 2".to_string()),
                category: Some("other".to_string()),
                tags: Some(vec!["tag2".to_string()]),
                updated_at: now_timestamp(),
            }),
        });

        // Test get all prompts
        let prompts = db.get_prompts(None, 0, 10).unwrap();
        assert_eq!(prompts.len(), 2);

        // Test get prompts by category
        let test_prompts = db.get_prompts(Some("test".to_string()), 0, 10).unwrap();
        assert_eq!(test_prompts.len(), 1);
        assert_eq!(test_prompts[0].id, "prompt1");

        // Test pagination
        let limited_prompts = db.get_prompts(None, 0, 1).unwrap();
        assert_eq!(limited_prompts.len(), 1);
    }

    #[test]
    fn test_get_prompt_with_metadata() {
        let temp_dir = tempfile::tempdir().unwrap();
        let db_path = temp_dir
            .path()
            .join("test.db")
            .to_str()
            .unwrap()
            .to_string();

        let db = CacheConfig::new(&db_path).unwrap();

        let _ = db.insert_prompt(DbPrompt {
            id: "test_id".to_string(),
            version: 1,
            content: "Test content".to_string(),
            parent: "test_id".to_string(),
            branched: Some(false),
            archived: Some(false),
            created_at: now_timestamp(),
            metadata: Some(DbPromptMetadata {
                id: "test_id".to_string(),
                name: Some("Test Name".to_string()),
                description: Some("Test Description".to_string()),
                category: Some("test".to_string()),
                tags: Some(vec!["tag1".to_string(), "tag2".to_string()]),
                updated_at: now_timestamp(),
            }),
        });

        // Test get prompt with metadata
        let prompt_with_metadata = db.get_prompt("test_id", Some(true)).unwrap().unwrap();
        assert_eq!(prompt_with_metadata.id, "test_id");
        assert!(prompt_with_metadata.metadata.is_some());

        let metadata = prompt_with_metadata.metadata.unwrap();
        assert_eq!(metadata.name, Some("Test Name".to_string()));
        assert_eq!(metadata.category, Some("test".to_string()));
        assert_eq!(
            metadata.tags,
            Some(vec!["tag1".to_string(), "tag2".to_string()])
        );

        // Test get prompt without metadata
        let prompt_without_metadata = db.get_prompt("test_id", Some(false)).unwrap().unwrap();
        assert_eq!(prompt_without_metadata.id, "test_id");
        assert!(prompt_without_metadata.metadata.is_none());
    }

    #[test]
    fn test_update_prompt_metadata() {
        let temp_dir = tempfile::tempdir().unwrap();
        let db_path = temp_dir
            .path()
            .join("test.db")
            .to_str()
            .unwrap()
            .to_string();

        let db = CacheConfig::new(&db_path).unwrap();

        let _ = db.insert_prompt(DbPrompt {
            id: "update_test".to_string(),
            version: 1,
            content: "Content".to_string(),
            parent: "update_test".to_string(),
            branched: Some(false),
            archived: Some(false),
            created_at: now_timestamp(),
            metadata: Some(DbPromptMetadata {
                id: "update_test".to_string(),
                name: Some("Original Name".to_string()),
                description: Some("Original Description".to_string()),
                category: Some("original".to_string()),
                tags: Some(vec!["original".to_string()]),
                updated_at: now_timestamp(),
            }),
        });

        // Update metadata
        let updated_metadata = DbPromptMetadata {
            id: "update_test".to_string(),
            name: Some("Updated Name".to_string()),
            description: Some("Updated Description".to_string()),
            category: Some("updated".to_string()),
            tags: Some(vec!["updated".to_string()]),
            updated_at: now_timestamp(),
        };

        let result = db
            .update_prompt_metadata("update_test", updated_metadata)
            .unwrap();
        assert_eq!(result, "update_test");

        // Verify update
        let prompt = db.get_prompt("update_test", Some(true)).unwrap().unwrap();
        let metadata = prompt.metadata.unwrap();
        assert_eq!(metadata.name, Some("Updated Name".to_string()));
        assert_eq!(metadata.category, Some("updated".to_string()));

        // Test updating non-existent prompt
        let non_existent_metadata = DbPromptMetadata {
            id: "non_existent".to_string(),
            name: Some("Test".to_string()),
            description: Some("Test".to_string()),
            category: Some("test".to_string()),
            tags: None,
            updated_at: now_timestamp(),
        };

        let result = db.update_prompt_metadata("non_existent", non_existent_metadata);
        assert!(matches!(result, Err(CacheError::NotFound)));
    }

    #[test]
    fn test_delete_prompt() {
        let temp_dir = tempfile::tempdir().unwrap();
        let db_path = temp_dir
            .path()
            .join("test.db")
            .to_str()
            .unwrap()
            .to_string();

        let db = CacheConfig::new(&db_path).unwrap();

        let _ = db.insert_prompt(DbPrompt {
            id: "delete_test".to_string(),
            version: 1,
            content: "Content to delete".to_string(),
            parent: "delete_test".to_string(),
            branched: Some(false),
            archived: Some(false),
            created_at: now_timestamp(),
            metadata: None,
        });

        // Verify prompt exists before deletion
        let prompt = db.get_prompt("delete_test", None).unwrap();
        assert!(prompt.is_some());
        assert_eq!(prompt.unwrap().archived, Some(false));

        // Delete prompt
        let result = db.delete_prompt("delete_test").unwrap();
        assert!(result);

        // Verify prompt is archived after deletion
        let archived_prompt = db.get_prompt("delete_test", None).unwrap();
        assert!(archived_prompt.is_some());
        assert_eq!(archived_prompt.unwrap().archived, Some(true));

        // Test deleting non-existent prompt
        let result = db.delete_prompt("non_existent").unwrap();
        assert!(!result);
    }

    #[test]
    fn test_get_prompt_categories() {
        let temp_dir = tempfile::tempdir().unwrap();
        let db_path = temp_dir
            .path()
            .join("test.db")
            .to_str()
            .unwrap()
            .to_string();

        let db = CacheConfig::new(&db_path).unwrap();

        let _ = db.insert_prompt(DbPrompt {
            id: "test_id".to_string(),
            version: 1,
            content: "Test content".to_string(),
            parent: "test_id".to_string(),
            branched: Some(false),
            archived: Some(false),
            created_at: now_timestamp(),
            metadata: Some(DbPromptMetadata {
                id: "test_id".to_string(),
                name: Some("Test Name".to_string()),
                description: Some("Test Description".to_string()),
                category: Some("test".to_string()),
                tags: Some(vec!["tag1".to_string(), "tag2".to_string()]),
                updated_at: now_timestamp(),
            }),
        });

        let categories = db.get_prompt_categories().unwrap();
        assert_eq!(categories, vec!["test"]);
    }
}
