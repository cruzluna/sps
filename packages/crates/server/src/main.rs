use axum::{
    routing::{get, post, put},
    Router,
};
use cache::CacheConfig;
use log::{debug, info};
use std::env;
use std::sync::Arc;
use tower_http::trace::TraceLayer;
use tracing_subscriber::EnvFilter;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

mod api_models;
mod cache;
mod routes;

#[derive(OpenApi)]
#[openapi(
    paths(
        routes::get_prompt,
        routes::get_prompt_content,
        routes::get_prompts,
        routes::create_prompt,
        routes::update_prompt_metadata,
        routes::delete_prompt
    ),
    info(
        title = "Simple Prompt Storage API",
        version = "0.0.1",
        description = "Simple prompt storage API that enables users to store and retrieve prompts, no longer requiring new deployments for
        prompt updates."
    ),
    servers(
        (url = "https://api.cruzluna.dev", description = "Production path"),
        (url = "http://localhost:8080", description = "Local path")
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
    cache: Arc<CacheConfig>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .or_else(|_| EnvFilter::try_new("debug,axum::rejection=trace,tower_http=warn"))
                .unwrap(),
        )
        .init();

    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let addr = format!("0.0.0.0:{}", port);

    write_openapi_spec().expect("Failed to write OpenAPI spec to file");

    // TODO: Add SQL database as fallback
    // TODO: Object storage for long term storage

    let stage = env::var("STAGE").unwrap_or_else(|_| "dev".to_string());
    debug!("Stage: {}", stage);
    let db_path = match stage.as_str() {
        "prod" => {
            let data_dir = env::var("DATA_DIR").expect("DATA_DIR must be set");
            format!("{}/prompts-prod.db", data_dir)
        }
        "dev" => "prompts-dev.db".to_string(),
        _ => panic!("Invalid stage: {}", stage),
    };

    let cache = CacheConfig::new(&db_path)?;
    let state = AppState {
        cache: Arc::new(cache),
    };

    let app = Router::new()
        .route("/prompt", post(routes::create_prompt))
        .route(
            "/prompt/{id}",
            get(routes::get_prompt).delete(routes::delete_prompt),
        )
        .route("/prompt/{id}/content", get(routes::get_prompt_content))
        .route("/prompt/metadata", put(routes::update_prompt_metadata))
        .route("/prompts", get(routes::get_prompts))
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    info!("Server running on http://{}", addr);
    info!("Swagger UI available at http://{}/swagger-ui/", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
    Ok(())
}
