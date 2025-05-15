use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use uuid::Uuid;

use crate::api_models::CreatePromptRequest;

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
    pub archived: Option<bool>,
    pub created_at: i64,
    pub updated_at: i64,
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
            updated_at: now_timestamp(),
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
    pub fn new() -> Result<Self> {
        // TODO: Move this to a better location
        let conn = Connection::open("prompts.db")?;

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
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
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
                tags TEXT NOT NULL
            )",
            [],
        )?;

        Ok(Self { conn })
    }

    pub fn insert_prompt(&self, prompt: DbPrompt) -> Result<DbPrompt> {
        self.conn.execute(
            "INSERT INTO prompts (id, version, content, parent, branched, archived, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                &prompt.id,
                &prompt.version,
                &prompt.content,
                &prompt.parent,
                &prompt.branched,
                &prompt.archived,
                &prompt.created_at,
                &prompt.updated_at
            ],
        )?;

        Ok(prompt)
    }
    pub fn get_prompt_content(&self, id: &str) -> Result<String> {
        let mut stmt = self
            .conn
            .prepare("SELECT content FROM prompts WHERE id = ?1")?;

        let content = stmt.query_row(params![id], |row| row.get(0))?;
        Ok(content)
    }

    pub fn get_prompt_content_latest_version(&self, id: &str) -> Result<String> {
        let mut stmt = self
            .conn
            .prepare("SELECT content FROM prompts WHERE id = ?1 ORDER DESC limit 1")?;

        let content = stmt.query_row(params![id], |row| row.get(0))?;
        Ok(content)
    }

    pub fn get_prompt(&self, id: &str) -> Result<Option<DbPrompt>> {
        let mut stmt = self.conn.prepare("SELECT * FROM prompts WHERE id = ?1")?;

        let prompt = stmt.query_row(params![id], |row| {
            Ok(DbPrompt {
                id: row.get(0)?,
                version: row.get(1)?,
                content: row.get(2)?,
                parent: row.get(3)?,
                branched: row.get(4)?,
                archived: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        });

        match prompt {
            Ok(prompt) => Ok(Some(prompt)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    /// Insert a new version of the prompt
    pub fn update_prompt(&self, prompt: DbPrompt) -> Result<String> {
        let version = prompt.version + 1;

        self.conn.execute(
            "INSERT INTO prompts (id, content, version, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![
                &prompt.id,
                &prompt.content,
                version,
                &prompt.created_at,
                &prompt.updated_at
            ],
        )?;

        Ok(prompt.id)
    }

    pub fn update_prompt_metadata(&self, id: &str, metadata: DbPromptMetadata) -> Result<String> {
        let now = now_timestamp();

        self.conn.execute(
            "UPDATE metadata SET name = ?2, description = ?3, category = ?4, tags = ?5, updated_at = ?7
             WHERE id = ?1",
            params![&id, &metadata.name, &metadata.description, &metadata.category, &metadata.tags_to_string(), now, now],
        )?;

        Ok(id.to_string())
    }

    pub fn delete_prompt(&self, id: &str) -> Result<bool> {
        let now = now_timestamp();
        let rows_affected = self.conn.execute(
            "UPDATE prompts SET archived = true, updated_at = ?2 WHERE id = ?1",
            params![id, now],
        )?;
        Ok(rows_affected > 0)
    }
}
