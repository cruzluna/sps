use serde::{Deserialize, Serialize};
use surrealdb::RecordId;

#[derive(Serialize, Deserialize, Debug)]
pub struct DbPrompt {
    pub id: RecordId,
    metadata: DbPromptMetadata,
    content: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DbPromptMetadata {
    name: String,
    description: String,
    version: u128,
    created_at: u128,
    updated_at: u128,
}
