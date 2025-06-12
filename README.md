# +--[simple prompt storage]--+
`sps` is a full-stack application designed for storing, versioning, and managing prompts. It consists of a Rust-based backend API and a React-based frontend.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Packages](#packages)
  - [Backend (`packages/crates/server`)](#backend-packagescratesserver)
  - [Frontend (`packages/sps`)](#frontend-packagessps)
- [API Documentation](#api-documentation)

## Overview

The core purpose of `sps` is to provide a centralized system for managing prompts, especially in environments where prompts are frequently updated and versioned. This avoids the need for new application deployments for simple prompt changes. The system supports prompt lineage, branching, and metadata.

## Features

- **CRUD Operations**: Full create, read, update, and delete functionality for prompts.
- **Prompt Versioning**: Tracks changes to prompts over time with a simple versioning system.
- **Prompt Lineage**: Prompts can have parent-child relationships, allowing for tracking of evolution and branching.
- **Rich Metadata**: Associate prompts with names, descriptions, categories, and tags for better organization.
- **RESTful API**: A clean, documented RESTful API for interacting with the prompt storage.
- **Web Interface**: A user-friendly frontend for browsing, creating, and managing prompts.
- **API Documentation UI**: Integrated Swagger UI for exploring the API.

## Architecture

The project is a monorepo containing two main packages:

-   `packages/crates/server`: A Rust backend providing the core API.
-   `packages/sps`: A React frontend for user interaction.

The backend uses a SQLite database to persist prompt data.

## Technology Stack

### Backend
- **Language**: Rust
- **Web Framework**: Axum
- **Async Runtime**: Tokio
- **Database**: SQLite with `r2d2` for connection pooling
- **API Documentation**: Utoipa for OpenAPI spec generation
- **Containerization**: Docker
- **Deployment**: Coolify

### Frontend
- **Framework**: React
- **Routing**: React Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

## Packages

### Backend (`packages/crates/server`)

This package contains the Axum web server that exposes the API for managing prompts.

#### Running with Docker

1.  **Build the Docker image:**
    ```bash
    docker build -t prompt-server ./packages/crates/server
    ```

2.  **Create a volume for the database:**
    ```bash
    docker volume create prompt-db
    ```

3.  **Run the container:**
    ```bash
    docker run -p 8080:8080 \
      -v prompt-db:/data \
      -e STAGE=prod \
      prompt-server
    ```
    The server will be available at `http://localhost:8080`.

### Frontend (`packages/sps`)

This package is a React application that provides a UI for the prompt storage system.

#### Running Locally

1.  **Navigate to the frontend directory:**
    ```bash
    cd packages/sps
    ```
2.  **Install dependencies:**
    ```bash
    bun install
    ```
3.  **Start the development server:**
    ```bash
    bun run dev
    ```
    The frontend will be available at `http://localhost:5173`.

## API Documentation

The API is documented using the OpenAPI standard. When the server is running, the Swagger UI is available at: `http://localhost:8080/swagger-ui/`.

The `openapi.yaml` specification file is also available at the root of the `packages/crates/server` directory.

## Client SDKs

This project uses [Stainless](https://stainlessapi.com/) to generate SDKs from the OpenAPI specification, enabling easy integration with your applications.
