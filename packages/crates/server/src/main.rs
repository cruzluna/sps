use api_models::{Prompt, PromptWithoutId};
use axum::{
    body::Body,
    extract::{Path, State},
    http::{Response, StatusCode},
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use cache::{DbPrompt, PromptDb};
use log::{debug, info};
use std::sync::Arc;
use tokio::sync::Mutex;
use tower_http::trace::TraceLayer;
use tracing_subscriber::EnvFilter;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
use uuid::Uuid;

mod api_models;
mod cache;

/// Get prompt
#[utoipa::path(
    get,
    path = "/prompt/{id}",
    params(
        ("id" = String, Path, description = "Prompt identifier")
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
) -> Result<Json<Prompt>, GetPromptError> {
    info!("Requested prompt with id: {}", id);

    let cache = state.cache.lock().await;
    let db_prompt = cache
        .get_prompt(&id)
        .map_err(|_| GetPromptError::InternalServerError)?
        .ok_or(GetPromptError::NotFound)?;

    let prompt = Prompt::to_prompt_from_db_prompt(db_prompt);

    Ok(Json(prompt))
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
    request_body = PromptWithoutId,
    responses(
        (status = StatusCode::CREATED, description = "Successfully created prompt", body = Prompt),
        (status = StatusCode::BAD_REQUEST, description = "Invalid request body")
    )
)]
#[axum_macros::debug_handler]
async fn create_prompt(
    State(state): State<AppState>,
    Json(prompt): Json<PromptWithoutId>,
) -> Result<String, CreatePromptError> {
    info!("Creating prompt: {:?}", prompt);

    let db_prompt = DbPrompt {
        id: Uuid::new_v4().to_string(),
        content: prompt.content,
        // metadata: prompt.metadata,
    };

    let cache = state.cache.lock().await;
    cache
        .insert_prompt(db_prompt)
        .map_err(|e| {
            debug!("Database error: {:?}", e);
            CreatePromptError::InternalServerError
        })
        .map(|prompt| prompt.id)
}

/// Update prompt
#[utoipa::path(
    put,
    path = "/prompt/{id}",
    responses(
        (status = StatusCode::OK, description = "Successly updated prompt", body = String),
        (status = StatusCode::NOT_FOUND, description = "Prompt not found"),
        (status = StatusCode::BAD_REQUEST, description = "Invalid request body")
    )
)]
#[axum_macros::debug_handler]
async fn update_prompt(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(prompt): Json<PromptWithoutId>,
) -> Result<String, UpdatePromptError> {
    // TODO: Implement update prompt
    // let cache = state.cache.lock().await;
    // cache
    //     .update_prompt(db_prompt)
    //     .map_err(|_| UpdatePromptError::InternalServerError)?;

    // Ok(())
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
    paths(get_prompt, create_prompt, update_prompt, delete_prompt),
    info(
        title = "Simple Prompt Storage API",
        version = "0.0.1",
        description = "Simple prompt storage API that enables users to store and retrieve prompts, no longer requiring new deployments for
        prompt updates."
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

    write_openapi_spec().expect("Failed to write OpenAPI spec to file");

    let cache = PromptDb::new()?;
    let state = AppState {
        cache: Arc::new(Mutex::new(cache)),
    };

    let app = Router::new()
        .route("/prompt", post(create_prompt))
        .route(
            "/prompt/{id}",
            get(get_prompt).put(update_prompt).delete(delete_prompt),
        )
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    info!("Server running on http://0.0.0.0:3000");
    info!("Swagger UI available at http://0.0.0.0:3000/swagger-ui/");

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
    Ok(())
}
