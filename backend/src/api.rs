use anyhow::Result;
use axum::{
    routing::{get, post},
    Router,
    extract::{Extension, Path, Query},
    Json,
};
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use uuid::Uuid;
use serde::Deserialize;

use crate::config::Config;
use crate::database::Database;
use crate::models::{TokenSummary, TokenDetails};

pub struct ApiServer {
    database: Database,
    config: Config,
}

impl ApiServer {
    pub fn new(database: Database, config: Config) -> Self {
        Self { database, config }
    }

    pub async fn start(&self) -> Result<()> {
        let app = Router::new()
            .route("/health", get(health_check))
            .route("/tokens", get(list_tokens))
            .route("/tokens/:id", get(get_token))
            .route("/king-of-the-hill", get(get_king_of_the_hill))
            .layer(CorsLayer::permissive())
            .layer(Extension(self.database.clone()));

        let addr = SocketAddr::from(([0, 0, 0, 0], self.config.port));
        println!("API listening on {}", addr);
        
        axum::Server::bind(&addr)
            .serve(app.into_make_service())
            .await?;

        Ok(())
    }
}

async fn health_check() -> &'static str {
    "OK"
}

#[derive(Deserialize)]
struct ListTokensQuery {
    limit: Option<i64>,
    offset: Option<i64>,
    sort: Option<String>,
}

async fn list_tokens(
    Extension(database): Extension<Database>,
    Query(params): Query<ListTokensQuery>,
) -> Json<Vec<TokenSummary>> {
    let limit = params.limit.unwrap_or(20);
    let offset = params.offset.unwrap_or(0);
    let sort = params.sort.unwrap_or_else(|| "newest".to_string());

    match database.get_tokens_list(limit, offset, &sort).await {
        Ok(tokens) => Json(tokens),
        Err(e) => {
            eprintln!("Error listing tokens: {}", e);
            Json(vec![])
        }
    }
}

async fn get_token(
    Extension(database): Extension<Database>,
    Path(id): Path<Uuid>,
) -> Json<Option<TokenDetails>> {
    match database.get_token_details(id).await {
        Ok(token) => Json(token),
        Err(e) => {
            eprintln!("Error getting token: {}", e);
            Json(None)
        }
    }
}

async fn get_king_of_the_hill(
    Extension(database): Extension<Database>,
) -> Json<Option<TokenSummary>> {
    // King of the hill is the token with highest market cap
    match database.get_tokens_list(1, 0, "market_cap").await {
        Ok(tokens) => Json(tokens.first().cloned()),
        Err(e) => {
            eprintln!("Error getting king of the hill: {}", e);
            Json(None)
        }
    }
}
