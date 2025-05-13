use axum::{body::Body, http::Response, response::IntoResponse};
use bytes::Bytes;
use serde::{Deserialize, Serialize};
use std::convert::Infallible;
use utoipa::ToSchema;

use crate::cache::DbPrompt;

#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct PromptWithoutId {
    pub metadata: PromptMetadata,
    pub content: String,
}

#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct Prompt {
    pub id: String,
    // pub metadata: PromptMetadata,
    pub content: String,
}

impl Prompt {
    pub fn to_prompt_from_db_prompt(db_prompt: DbPrompt) -> Self {
        Self {
            id: db_prompt.id,
            content: db_prompt.content,
        }
    }
}

#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct PromptMetadata {
    pub name: String,
    pub description: String,
}
