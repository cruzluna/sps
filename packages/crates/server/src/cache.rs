use log::{error, info};
use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

use crate::api_models::{CreatePromptRequest, UpdatePromptRequest};

#[derive(Debug)]
pub enum DatabaseError {
    NotFound,
    UnhandledError,
}

// impl Display for DatabaseError {
//     fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
//         write!(f, "{:?}", self)
//     }
// }

pub fn now_timestamp() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("System time before UNIX EPOCH")
        .as_secs() as i64
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DbPrompt {
    pub id: String,
    pub version: i32,
    pub content: String,
    pub parent: String,
    pub branched: Option<bool>,
    // TODO: add an archived date?
    pub archived: Option<bool>,
    pub created_at: i64,
}

impl From<CreatePromptRequest> for DbPrompt {
    fn from(prompt: CreatePromptRequest) -> Self {
        let id = Uuid::new_v4().to_string();
        Self {
            id: id.clone(),
            version: 1,
            content: prompt.content,
            parent: prompt.parent.unwrap_or(id.clone()),
            branched: prompt.branched,
            archived: Some(false),
            created_at: now_timestamp(),
        }
    }
}

impl From<UpdatePromptRequest> for DbPrompt {
    fn from(prompt: UpdatePromptRequest) -> Self {
        Self {
            id: prompt.id,
            version: 0,
            content: prompt.content,
            parent: prompt.parent,
            branched: prompt.branched,
            archived: Some(false),
            created_at: now_timestamp(),
        }
    }
}

#[derive(Serialize, Deserialize, Debug)]
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

pub struct PromptDb {
    conn: Connection,
}

impl PromptDb {
    pub fn new(db_path: &str) -> Result<Self> {
        info!("Opening database: {}", db_path);
        let conn = Connection::open(db_path)?;

        // Enable WAL mode for better concurrency and performance
        conn.pragma_update(None, "journal_mode", "WAL")?;
        // Set busy timeout to handle concurrent access
        conn.busy_timeout(std::time::Duration::from_secs(30))?;

        // Create tables if they don't exist
        conn.execute(
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
        conn.execute(
            "CREATE TABLE IF NOT EXISTS metadata (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL,
                tags TEXT NOT NULL,
                updated_at INTEGER NOT NULL
            )",
            [],
        )?;

        Ok(Self { conn })
    }

    pub fn insert_prompt(&self, prompt: DbPrompt) -> Result<DbPrompt> {
        info!("Inserting: {}", prompt.id);
        self.conn.execute(
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

        Ok(prompt)
    }
    pub fn get_prompt_content(&self, id: &str) -> Result<String, DatabaseError> {
        let mut stmt = self
            .conn
            .prepare("SELECT content FROM prompts WHERE id = ?1")
            .map_err(|e| {
                error!(
                    "Failed to prepare statement for get_prompt_content: {:?}",
                    e
                );
                DatabaseError::UnhandledError
            })?;

        let content = stmt
            .query_row(params![id], |row| row.get(0))
            .map_err(|e| match e {
                rusqlite::Error::QueryReturnedNoRows => {
                    error!("No prompt found with id {}", id);
                    DatabaseError::NotFound
                }
                _ => {
                    error!("Database error while getting prompt content: {:?}", e);
                    DatabaseError::UnhandledError
                }
            })?;
        Ok(content)
    }

    pub fn get_prompt_content_latest_version(&self, id: &str) -> Result<String, DatabaseError> {
        let mut stmt = self
            .conn
            .prepare("SELECT content FROM prompts WHERE id = ?1 ORDER DESC limit 1")
            .map_err(|e| {
                error!(
                    "Failed to prepare statement for get_prompt_content_latest_version: {}",
                    e
                );
                DatabaseError::UnhandledError
            })?;

        let content = stmt
            .query_row(params![id], |row| row.get(0))
            .map_err(|e| match e {
                rusqlite::Error::QueryReturnedNoRows => {
                    error!("No prompt found with id {} for latest version", id);
                    DatabaseError::NotFound
                }
                _ => {
                    error!(
                        "Database error while getting latest prompt content: {:?}",
                        e
                    );
                    DatabaseError::UnhandledError
                }
            })?;
        Ok(content)
    }

    pub fn get_prompt(&self, id: &str) -> Result<Option<DbPrompt>, DatabaseError> {
        let mut stmt = self
            .conn
            .prepare("SELECT * FROM prompts WHERE id = ?1")
            .map_err(|e| {
                error!("Failed to prepare statement for get_prompt: {}", e);
                DatabaseError::UnhandledError
            })?;

        let prompt = stmt.query_row(params![id], |row| {
            Ok(DbPrompt {
                id: row.get(0)?,
                version: row.get(1)?,
                content: row.get(2)?,
                parent: row.get(3)?,
                branched: row.get(4)?,
                archived: row.get(5)?,
                created_at: row.get(6)?,
            })
        });

        match prompt {
            Ok(prompt) => Ok(Some(prompt)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => {
                error!("Database error while getting prompt: {}", e);
                Err(DatabaseError::UnhandledError)
            }
        }
    }

    /// Insert a new version of the prompt
    pub fn update_prompt(&self, prompt: DbPrompt) -> Result<String, DatabaseError> {
        let original_prompt = self.get_prompt(&prompt.id)?.ok_or_else(|| {
            error!("Prompt not found for update with id: {}", prompt.id);
            DatabaseError::NotFound
        })?;

        let mut new_prompt = prompt;
        new_prompt.version = original_prompt.version + 1;
        let new_prompt = self.insert_prompt(new_prompt).map_err(|e| {
            error!("Failed to insert updated prompt: {}", e);
            match e {
                rusqlite::Error::QueryReturnedNoRows => DatabaseError::NotFound,
                _ => DatabaseError::UnhandledError,
            }
        })?;

        Ok(new_prompt.id)
    }

    pub fn update_prompt_metadata(
        &self,
        id: &str,
        metadata: DbPromptMetadata,
    ) -> Result<String, DatabaseError> {
        let now = now_timestamp();

        let rows_affected = self.conn.execute(
            "UPDATE metadata SET name = ?2, description = ?3, category = ?4, tags = ?5, updated_at = ?7
             WHERE id = ?1",
            params![&id, &metadata.name, &metadata.description, &metadata.category, &metadata.tags_to_string(), now, now],
        ).map_err(|e| {
                error!("Failed to update prompt metadata: {:?}", e);
                DatabaseError::UnhandledError
            })?;

        match rows_affected {
            0 => Err(DatabaseError::NotFound),
            _ => Ok(id.to_string()),
        }
    }

    pub fn delete_prompt(&self, id: &str) -> Result<bool, DatabaseError> {
        let rows_affected = self
            .conn
            .execute(
                "UPDATE prompts SET archived = true WHERE id = ?1",
                params![id],
            )
            .map_err(|e| {
                error!("Failed to delete prompt with id {}: {}", id, e);
                DatabaseError::UnhandledError
            })?;
        Ok(rows_affected > 0)
    }
}
