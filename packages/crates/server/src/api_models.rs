use axum::{
    body::Body,
    http::{Response, StatusCode},
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::cache::{now_timestamp, DbPrompt, DbPromptMetadata};

#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct CreatePromptRequest {
    /// The content of the prompt
    pub content: String,
    /// The name of the prompt
    pub name: Option<String>,
    /// The description of the prompt
    pub description: Option<String>,
    /// The category of the prompt
    pub category: Option<String>,
    /// The tags of the prompt
    pub tags: Option<Vec<String>>,
    /// The parent of the prompt. If its a new prompt with no lineage, this should be None.
    pub parent: Option<String>,
    /// Whether the prompt is being branched
    pub branched: Option<bool>,
}

#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct UpdateMetadataRequest {
    /// The id of the prompt
    pub id: String,
    /// The name of the prompt
    pub name: Option<String>,
    /// The description of the prompt
    pub description: Option<String>,
    /// The category of the prompt
    pub category: Option<String>,
    /// The tags of the prompt
    pub tags: Option<Vec<String>>,
}

impl From<UpdateMetadataRequest> for DbPromptMetadata {
    fn from(request: UpdateMetadataRequest) -> Self {
        Self {
            id: request.id,
            name: request.name,
            description: request.description,
            category: request.category,
            tags: request.tags,
            updated_at: now_timestamp(),
        }
    }
}
#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct Prompt {
    /// The id of the prompt
    pub id: String,
    /// The content of the prompt
    pub content: String,
    /// The version of the prompt
    pub version: i32,
    /// The parent of the prompt
    pub parent: String,
    /// Whether the prompt is being branched
    pub branched: Option<bool>,
    /// Whether the prompt is archived
    pub archived: Option<bool>,
    /// The creation date of the prompt
    pub created_at: i64,
    /// The metadata of the prompt
    pub metadata: Option<PromptMetadata>,
}

impl From<DbPrompt> for Prompt {
    fn from(db_prompt: DbPrompt) -> Self {
        Self {
            id: db_prompt.id,
            content: db_prompt.content,
            version: db_prompt.version,
            parent: db_prompt.parent,
            branched: db_prompt.branched,
            archived: db_prompt.archived,
            created_at: db_prompt.created_at,
            //TODO: include metadata
            metadata: None,
        }
    }
}

#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct PromptMetadata {
    /// Name of the prompt
    pub name: Option<String>,
    /// Description of the prompt
    pub description: Option<String>,
    // TODO: Determine if category and tags are duplicates
    /// Category of the prompt ie React, typescript, etc.
    pub category: Option<String>,
    /// Tags of the prompt ie [react, typescript, etc.]
    pub tags: Option<Vec<String>>,
}

impl From<DbPromptMetadata> for PromptMetadata {
    fn from(db_prompt_metadata: DbPromptMetadata) -> Self {
        Self {
            name: db_prompt_metadata.name,
            description: db_prompt_metadata.description,
            category: db_prompt_metadata.category,
            tags: db_prompt_metadata.tags,
        }
    }
}

#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct GetPromptsRequest {
    /// The category of the prompts to return
    pub category: Option<String>,
    /// The pagination offset to start from (0-based)
    pub offset: Option<i32>,
    /// The number of prompts to return
    pub limit: Option<i32>,
}

#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct GetPromptContentRequest {
    /// Whether to get the latest version of the prompt
    pub latest: Option<bool>,
}

#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct GetPromptRequest {
    /// Whether to include metadata in the response
    pub metadata: Option<bool>,
}

// TODO: https://docs.rs/axum-derive-error/latest/axum_derive_error/
pub enum GetPromptError {
    NotFound,
    InternalServerError,
}

impl IntoResponse for GetPromptError {
    fn into_response(self) -> Response<Body> {
        let status = match self {
            Self::NotFound => StatusCode::NOT_FOUND,
            Self::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
        };

        status.into_response()
    }
}
pub enum DeletePromptError {
    NotFoundError,
    InternalServerError,
}

impl IntoResponse for DeletePromptError {
    fn into_response(self) -> Response<Body> {
        let status = match self {
            Self::NotFoundError => StatusCode::NOT_FOUND,
            Self::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
        };

        status.into_response()
    }
}

pub enum GetPromptsError {
    InvalidRequest,
    InternalServerError,
}

impl IntoResponse for GetPromptsError {
    fn into_response(self) -> Response<Body> {
        let status = match self {
            Self::InvalidRequest => StatusCode::BAD_REQUEST,
            Self::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
        };

        status.into_response()
    }
}

// TODO: https://docs.rs/axum-derive-error/latest/axum_derive_error/
pub enum CreatePromptError {
    InvalidRequestBody,
    InternalServerError,
}

impl IntoResponse for CreatePromptError {
    fn into_response(self) -> Response<Body> {
        let status = match self {
            Self::InvalidRequestBody => StatusCode::BAD_REQUEST,
            Self::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
        };

        status.into_response()
    }
}

pub enum UpdatePromptError {
    NotFound,
    InternalServerError,
}

impl IntoResponse for UpdatePromptError {
    fn into_response(self) -> Response<Body> {
        let status = match self {
            Self::NotFound => StatusCode::NOT_FOUND,
            Self::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
        };

        status.into_response()
    }
}

pub enum UpdateMetadataError {
    NotFound,
    InternalServerError,
}

impl IntoResponse for UpdateMetadataError {
    fn into_response(self) -> Response<Body> {
        let status = match self {
            Self::NotFound => StatusCode::NOT_FOUND,
            Self::InternalServerError => StatusCode::INTERNAL_SERVER_ERROR,
        };

        status.into_response()
    }
}
