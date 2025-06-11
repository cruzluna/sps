use crate::api_models::{
    CreatePromptError, CreatePromptRequest, DeletePromptError, GetPromptContentRequest,
    GetPromptError, GetPromptRequest, GetPromptsError, GetPromptsRequest, Prompt,
    UpdateMetadataError, UpdateMetadataRequest,
};
use axum::{
    extract::{Path, Query, State},
    Json,
};
use log::{debug, error, info};

use crate::{cache::CacheError, AppState};

/// Get entire prompt with option to include metadata
#[utoipa::path(
    get,
    path = "/prompt/{id}",
    params(
        ("id" = String, Path, description = "Prompt identifier"),
        ("metadata" = Option<bool>, Query, description = "Whether to include metadata in the response")
    ),
    responses(
        (status = StatusCode::OK, description = "Successly retrieved prompt", body = String),
        (status = StatusCode::NOT_FOUND, description = "Prompt not found"),
        (status = StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error")
    )
)]
#[axum_macros::debug_handler]
pub async fn get_prompt(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(params): Query<GetPromptRequest>,
) -> Result<Json<Prompt>, GetPromptError> {
    info!("Requested prompt with id: {}", id);

    let db_prompt = state
        .cache
        .get_prompt(&id, params.metadata)
        .map_err(|e| {
            error!("Failed to get prompt for id {}: {:?}", id, e);
            GetPromptError::InternalServerError
        })?
        .ok_or(GetPromptError::NotFound)?;

    let prompt = Prompt::from(db_prompt);

    Ok(Json(prompt))
}

/// Get prompt content
#[utoipa::path(
    get,
    path = "/prompt/{id}/content",
    params(
        ("id" = String, Path, description = "Prompt identifier"),
        ("latest" = Option<bool>, Query, description = "Latest version of the prompt")
    ),
    responses(
        (status = StatusCode::OK, description = "Successly retrieved prompt content", body = String),
        (status = StatusCode::NOT_FOUND, description = "Prompt not found"),
        (status = StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error")
    )
)]
#[axum_macros::debug_handler]
pub async fn get_prompt_content(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(params): Query<GetPromptContentRequest>,
) -> Result<Json<String>, GetPromptError> {
    info!("Requested prompt with id: {}", id);

    let content = match params.latest {
        Some(true) => state.cache.get_prompt_content_latest_version(&id),
        _ => state.cache.get_prompt_content(&id),
    }
    .map_err(|e| {
        error!("Failed to get prompt content for id {}: {:?}", id, e);
        match e {
            CacheError::NotFound => GetPromptError::NotFound,
            _ => GetPromptError::InternalServerError,
        }
    })?;

    Ok(Json(content))
}

#[axum_macros::debug_handler]
pub async fn get_prompt_categories(
    State(state): State<AppState>,
) -> Result<Json<Vec<String>>, GetPromptError> {
    let categories = state.cache.get_prompt_categories().map_err(|e| {
        error!("Failed to get prompt categories: {:?}", e);
        GetPromptError::InternalServerError
    })?;
    Ok(Json(categories))
}

/// Get list of prompts with pagination
#[utoipa::path(
    get,
    path = "/prompts",
    params(
        ("category" = Option<String>, Query, description = "The category of the prompts to return"),
        ("offset" = Option<u32>, Query, description = "The pagination offset to start from (0-based). Default is 0."),
        ("limit" = Option<u32>, Query, description = "The number of prompts to return. Default is 10.")
    ),
    responses(
        (status = StatusCode::OK, description = "Successly retrieved all prompts", body = Vec<Prompt>),
        (status = StatusCode::BAD_REQUEST, description = "Invalid request body")
    )
)]
#[axum_macros::debug_handler]
pub async fn get_prompts(
    State(state): State<AppState>,
    Query(params): Query<GetPromptsRequest>,
) -> Result<Json<Vec<Prompt>>, GetPromptsError> {
    info!("Requested prompts with params: {:?}", params);
    let prompts = state
        .cache
        .get_prompts(
            params.category,
            params.offset.unwrap_or(0) as u32,
            params.limit.unwrap_or(10) as u32,
        )
        .map_err(|e| {
            error!("Failed to get prompts: {:?}", e);
            match e {
                CacheError::InvalidRequest(_) => GetPromptsError::InvalidRequest,
                _ => GetPromptsError::InternalServerError,
            }
        })?;

    let prompts = prompts.into_iter().map(Prompt::from).collect();

    Ok(Json(prompts))
}

/// Create prompt or update it by passing the parent id
#[utoipa::path(
    post,
    path = "/prompt",
    request_body = CreatePromptRequest,
    responses(
        (status = StatusCode::CREATED, description = "Successfully created prompt", body = Prompt),
        (status = StatusCode::BAD_REQUEST, description = "Invalid request body")
    )
)]
#[axum_macros::debug_handler]
pub async fn create_prompt(
    State(state): State<AppState>,
    Json(prompt): Json<CreatePromptRequest>,
) -> Result<String, CreatePromptError> {
    state
        .cache
        .insert_prompt(prompt.into())
        .map_err(|e| {
            debug!("Database error: {:?}", e);
            CreatePromptError::InternalServerError
        })
        .map(|prompt| prompt.id)
}

/// Update prompt metadata
#[utoipa::path(
    put,
    path = "/prompt/metadata",
    request_body = UpdateMetadataRequest,
    responses(
        (status = StatusCode::OK, description = "Successly updated prompt metadata", body = String),
        (status = StatusCode::NOT_FOUND, description = "Prompt not found"),
        (status = StatusCode::BAD_REQUEST, description = "Invalid request body")
    )
)]
#[axum_macros::debug_handler]
pub async fn update_prompt_metadata(
    State(state): State<AppState>,
    Json(prompt): Json<UpdateMetadataRequest>,
) -> Result<String, UpdateMetadataError> {
    let id = prompt.id.clone();
    info!("Updating metadata for prompt: {:?}", id);
    state
        .cache
        .update_prompt_metadata(&id, prompt.into())
        .map_err(|e| {
            error!("Database error: {:?}", e);
            match e {
                CacheError::NotFound => UpdateMetadataError::NotFound,
                _ => UpdateMetadataError::InternalServerError,
            }
        })?;

    Ok(id)
}

/// Delete prompt
#[utoipa::path(
    delete,
    path = "/prompt/{id}",
    responses(
        (status = StatusCode::OK, description = "Successly deleted prompt"),
        (status = StatusCode::NOT_FOUND, description = "Prompt does not exist"),
        (status = StatusCode::INTERNAL_SERVER_ERROR, description = "Internal server error")
    )
)]
#[axum_macros::debug_handler]
pub async fn delete_prompt(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<(), DeletePromptError> {
    state
        .cache
        .delete_prompt(&id)
        .map_err(|_| DeletePromptError::InternalServerError)?
        .then_some(())
        .ok_or(DeletePromptError::NotFoundError)?;

    Ok(())
}
