use api_models::{
    CreatePromptRequest, GetPromptsRequest, Prompt, UpdateMetadataRequest, UpdatePromptRequest,
};
use axum::{
    body::Body,
    extract::{Path, Query, State},
    http::{Response, StatusCode},
    response::IntoResponse,
    routing::{get, post, put},
    Json, Router,
};
use cache::{DatabaseError, PromptDb};
use log::{debug, error, info};
use std::env;
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_http::trace::TraceLayer;
use tracing_subscriber::EnvFilter;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

mod api_models;
mod cache;

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
async fn get_prompt(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(metadata): Query<Option<bool>>,
) -> Result<Json<Prompt>, GetPromptError> {
    info!("Requested prompt with id: {}", id);

    let cache = state.cache.lock().await;
    let db_prompt = cache
        .get_prompt(&id, metadata)
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
async fn get_prompt_content(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Query(latest): Query<Option<bool>>,
) -> Result<Json<String>, GetPromptError> {
    info!("Requested prompt with id: {}", id);

    let cache = state.cache.lock().await;
    let content = match latest {
        Some(true) => cache.get_prompt_content_latest_version(&id),
        _ => cache.get_prompt_content(&id),
    }
    .map_err(|e| {
        error!("Failed to get prompt content for id {}: {:?}", id, e);
        match e {
            DatabaseError::NotFound => GetPromptError::NotFound,
            _ => GetPromptError::InternalServerError,
        }
    })?;

    Ok(Json(content))
}

/// Get list of prompts with pagination
#[utoipa::path(
    get,
    path = "/prompts",
    params(
        ("category" = Option<String>, Query, description = "The category of the prompts to return"),
        ("from" = Option<u32>, Query, description = "The pagination offset to start from (0-based)"),
        ("to" = Option<u32>, Query, description = "The pagination offset to end at (exclusive)"),
        ("size" = Option<u32>, Query, description = "The number of prompts to return")
    ),
    responses(
        (status = StatusCode::OK, description = "Successly retrieved all prompts", body = Vec<Prompt>),
        (status = StatusCode::BAD_REQUEST, description = "Invalid request body")
    )
)]
#[axum_macros::debug_handler]
async fn get_prompts(
    State(state): State<AppState>,
    Query(params): Query<GetPromptsRequest>,
) -> Result<Json<Vec<Prompt>>, GetPromptsError> {
    let cache = state.cache.lock().await;
    let prompts = cache
        .get_prompts(
            params.category,
            params.from.unwrap_or(0) as u32,
            params.to.unwrap_or(10) as u32,
            params.size.unwrap_or(10) as u32,
        )
        .map_err(|e| {
            error!("Failed to get prompts: {:?}", e);
            match e {
                DatabaseError::InvalidRequest => GetPromptsError::InvalidRequest,
                _ => GetPromptsError::InternalServerError,
            }
        })?;

    let prompts = prompts.into_iter().map(Prompt::from).collect();

    Ok(Json(prompts))
}

enum GetPromptsError {
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

enum DeletePromptError {
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

// TODO: https://docs.rs/axum-derive-error/latest/axum_derive_error/
enum GetPromptError {
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

// TODO: https://docs.rs/axum-derive-error/latest/axum_derive_error/
enum CreatePromptError {
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

enum UpdatePromptError {
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

/// Create prompt
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
async fn create_prompt(
    State(state): State<AppState>,
    Json(prompt): Json<CreatePromptRequest>,
) -> Result<String, CreatePromptError> {
    info!("Creating prompt: {:?}", prompt);

    let cache = state.cache.lock().await;
    cache
        .insert_prompt(prompt.into())
        .map_err(|e| {
            debug!("Database error: {:?}", e);
            CreatePromptError::InternalServerError
        })
        .map(|prompt| prompt.id)
}

/// Update prompt
#[utoipa::path(
    put,
    path = "/prompt",
    request_body = UpdatePromptRequest,
    responses(
        (status = StatusCode::OK, description = "Successly updated prompt", body = String),
        (status = StatusCode::NOT_FOUND, description = "Prompt not found"),
        (status = StatusCode::BAD_REQUEST, description = "Invalid request body")
    )
)]
#[axum_macros::debug_handler]
async fn update_prompt(
    State(state): State<AppState>,
    Json(prompt): Json<UpdatePromptRequest>,
) -> Result<String, UpdatePromptError> {
    let id = prompt.id.clone();
    info!("Updating prompt: {:?}", id);

    let cache = state.cache.lock().await;
    cache.update_prompt(prompt.into()).map_err(|e| {
        error!("Database error: {:?}", e);
        match e {
            DatabaseError::NotFound => UpdatePromptError::NotFound,
            _ => UpdatePromptError::InternalServerError,
        }
    })?;

    Ok(id)
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
async fn update_prompt_metadata(
    State(state): State<AppState>,
    Json(prompt): Json<UpdateMetadataRequest>,
) -> Result<String, UpdateMetadataError> {
    let id = prompt.id.clone();
    info!("Updating metadata for prompt: {:?}", id);
    let cache = state.cache.lock().await;
    cache
        .update_prompt_metadata(&id, prompt.into())
        .map_err(|e| {
            error!("Database error: {:?}", e);
            match e {
                DatabaseError::NotFound => UpdateMetadataError::NotFound,
                _ => UpdateMetadataError::InternalServerError,
            }
        })?;

    Ok(id)
}

enum UpdateMetadataError {
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
async fn delete_prompt(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<(), DeletePromptError> {
    let cache = state.cache.lock().await;
    cache
        .delete_prompt(&id)
        .map_err(|_| DeletePromptError::InternalServerError)?
        .then_some(())
        .ok_or(DeletePromptError::NotFoundError)?;

    Ok(())
}

#[derive(OpenApi)]
#[openapi(
    paths(
        get_prompt,
        get_prompt_content,
        get_prompts,
        create_prompt,
        update_prompt,
        update_prompt_metadata,
        delete_prompt
    ),
    info(
        title = "Simple Prompt Storage API",
        version = "0.0.1",
        description = "Simple prompt storage API that enables users to store and retrieve prompts, no longer requiring new deployments for
        prompt updates."
    ),
    servers(
        (url = "https://api.cruzluna.dev", description = "Production path")
    )
)]
struct ApiDoc;

fn write_openapi_spec() -> std::io::Result<()> {
    info!("Writing OpenAPI spec to file");
    let spec = ApiDoc::openapi();
    let yaml_spec = serde_yaml::to_string(&spec).expect("Failed to serialize OpenAPI spec to YAML");
    std::fs::write("openapi.yaml", yaml_spec)
}

#[derive(Clone)]
struct AppState {
    cache: Arc<Mutex<PromptDb>>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .or_else(|_| EnvFilter::try_new("info,tower_http=warn"))
                .unwrap(),
        )
        .init();

    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let addr = format!("0.0.0.0:{}", port);

    write_openapi_spec().expect("Failed to write OpenAPI spec to file");

    // TODO: Add SQL database as fallback
    // TODO: Object storage for long term storage

    let stage = env::var("STAGE").unwrap_or_else(|_| "dev".to_string());
    let db_path = match stage.as_str() {
        "prod" => {
            let data_dir = env::var("DATA_DIR").expect("DATA_DIR must be set");
            format!("{}/prompts-prod.db", data_dir)
        }
        "dev" => "prompts-dev.db".to_string(),
        _ => panic!("Invalid stage: {}", stage),
    };
    info!("Stage: {}", stage);

    let cache = PromptDb::new(&db_path)?;
    let state = AppState {
        cache: Arc::new(Mutex::new(cache)),
    };

    let app = Router::new()
        .route("/prompt", post(create_prompt).put(update_prompt))
        .route("/prompt/{id}", get(get_prompt).delete(delete_prompt))
        .route("/prompt/{id}/content", get(get_prompt_content))
        .route("/prompt/metadata", put(update_prompt_metadata))
        .route("/prompts", get(get_prompts))
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    info!("Server running on http://{}", addr);
    info!("Swagger UI available at http://{}/swagger-ui/", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
    Ok(())
}
