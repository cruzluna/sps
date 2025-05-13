use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

fn now_timestamp() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("System time before UNIX EPOCH")
        .as_secs() as i64
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DbPrompt {
    pub id: String,
    pub content: String,
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
                content TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )",
            [],
        )?;

        Ok(Self { conn })
    }

    pub fn insert_prompt(&self, prompt: DbPrompt) -> Result<DbPrompt> {
        let now = now_timestamp();

        self.conn.execute(
            "INSERT INTO prompts (id, content, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4)",
            params![&prompt.id, &prompt.content, now, now],
        )?;

        Ok(prompt)
    }

    pub fn get_prompt(&self, id: &str) -> Result<Option<DbPrompt>> {
        let mut stmt = self
            .conn
            .prepare("SELECT id, content FROM prompts WHERE id = ?1")?;

        let prompt = stmt.query_row(params![id], |row| {
            Ok(DbPrompt {
                id: row.get(0)?,
                content: row.get(1)?,
            })
        });

        match prompt {
            Ok(prompt) => Ok(Some(prompt)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e),
        }
    }

    pub fn update_prompt(&self, prompt: DbPrompt) -> Result<String> {
        let now = now_timestamp();

        self.conn.execute(
            "UPDATE prompts 
             SET content = ?2, updated_at = ?3
             WHERE id = ?1",
            params![&prompt.id, &prompt.content, now],
        )?;

        Ok(prompt.id)
    }

    pub fn delete_prompt(&self, id: &str) -> Result<bool> {
        let rows_affected = self
            .conn
            .execute("DELETE FROM prompts WHERE id = ?1", params![id])?;
        Ok(rows_affected > 0)
    }
}
