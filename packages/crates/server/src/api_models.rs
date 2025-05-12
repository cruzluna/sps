use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct PromptWithoutId {
    metadata: PromptMetadata,
    content: String,
}

#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct Prompt {
    id: String,
    metadata: PromptMetadata,
    content: String,
}

#[derive(Serialize, Deserialize, ToSchema, Debug)]
pub struct PromptMetadata {
    name: String,
    description: String,
    // TODO: Move the below fields so that the are not in the
    created_at: u128,
    updated_at: u128,

    version: u128,
}
