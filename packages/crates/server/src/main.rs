use axum::{
    extract::Path,
    routing::{delete, get, post, put},
    Router,
};
use surrealdb::Surreal;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

/// Get hello world message
#[utoipa::path(
    get,
    path = "/",
    responses(
        (status = 200, description = "Success", body = String)
    )
)]
#[axum_macros::debug_handler]
async fn hello_world() -> &'static str {
    "Hello, World!"
}

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
async fn get_prompt(Path(id): Path<String>) -> &'static str {
    println!("Requested prompt with id: {}", id); // Example usage
    "Hello, World! This is prompt with id (to be implemented)"
}

/// Create prompt
#[utoipa::path(
    post,
    path = "/prompt",
    responses(
        (status = StatusCode::CREATED, description = "Successly created prompt", body = String),
        (status = StatusCode::BAD_REQUEST, description = "Invalid request body")
    )
)]
#[axum_macros::debug_handler]
async fn create_prompt() -> &'static str {
    "Hello, World!"
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
async fn update_prompt() -> &'static str {
    "Hello, World!"
}

/// Delete prompt
#[utoipa::path(
    delete,
    path = "/prompt/{id}",
    responses(
        (status = StatusCode::OK, description = "Successly deleted prompt"),
        (status = StatusCode::NOT_FOUND, description = "Prompt not found")
    )
)]
#[axum_macros::debug_handler]
async fn delete_prompt() -> &'static str {
    "Hello, World!"
}

#[derive(OpenApi)]
#[openapi(
    paths(hello_world, get_prompt, create_prompt, update_prompt, delete_prompt),
    info(
        title = "Simple Prompt Storage API",
        version = "0.0.1",
        description = "Simple prompt storage API that enables users to store and retrieve prompts, no longer requiring new deployments for
        prompt updates."
    )
)]
struct ApiDoc;

fn write_openapi_spec() -> std::io::Result<()> {
    let spec = ApiDoc::openapi();
    let yaml_spec = serde_yaml::to_string(&spec).expect("Failed to serialize OpenAPI spec to YAML");
    std::fs::write("openapi.yaml", yaml_spec)
}

#[derive(Clone)]
struct AppState {
    mem_db: Surreal<surrealdb::engine::local::Db>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // TODO: Tracing
    write_openapi_spec().expect("Failed to write OpenAPI spec to file");

    // State
    let mem_db = Surreal::new::<surrealdb::engine::local::Mem>(()).await?;
    let state = AppState { mem_db };

    let app = Router::new()
        .route("/", get(hello_world))
        .route("/prompt", post(create_prompt))
        .route(
            "/prompt/:id",
            get(get_prompt).put(update_prompt).delete(delete_prompt),
        )
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .with_state(state);

    println!("Server running on http://0.0.0.0:3000");
    println!("Swagger UI available at http://0.0.0.0:3000/swagger-ui/");

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
    Ok(())
}
