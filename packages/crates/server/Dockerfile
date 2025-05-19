FROM rust:1.87-slim-bullseye 

# Install SQLite dependencies, sqlite3 for debugging, and curl for utoipa swagger
RUN apt-get update && \
    apt-get install -y \
    pkg-config \
    libsqlite3-dev \
    sqlite3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the entire project
COPY . .

ENV RUST_LOG=info
ENV PORT=8080
ENV DATA_DIR=/data
ENV STAGE=prod

# Build the application
RUN cargo build --release   

EXPOSE ${PORT}/tcp
CMD ["./target/release/server"]
