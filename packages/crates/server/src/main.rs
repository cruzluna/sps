use axum::{routing::get, Router};
use utoipa::OpenApi;

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

#[derive(OpenApi)]
#[openapi(
    paths(hello_world),
    info(
        title = "Hello World API",
        version = "1.0.0",
        description = "A simple hello world API"
    )
)]
struct ApiDoc;

fn write_openapi_spec() -> std::io::Result<()> {
    let spec = ApiDoc::openapi();
    let yaml_spec = serde_yaml::to_string(&spec).expect("Failed to serialize OpenAPI spec to YAML");
    std::fs::write("openapi.yaml", yaml_spec)
}

#[tokio::main]
async fn main() {
    write_openapi_spec().expect("Failed to write OpenAPI spec to file");

    let app = Router::new().route("/", get(hello_world));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
