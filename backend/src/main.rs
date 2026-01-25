mod indexer;
mod models;
mod api;
mod database;
mod config;

use anyhow::Result;
use tokio::signal;
use tracing::{info, error};
use tracing_subscriber;

use crate::config::Config;
use crate::database::Database;
use crate::indexer::HorizonIndexer;
use crate::api::ApiServer;

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::init();

    // Load configuration
    let config = Config::from_env()?;
    info!("Starting Stellar Pump Backend with config: {:?}", config);

    // Initialize database
    let database = Database::new(&config.database_url).await?;
    database.run_migrations().await?;
    info!("Database initialized and migrations completed");

    // Initialize indexer
    let indexer = HorizonIndexer::new(
        config.horizon_url.clone(),
        config.contract_address.clone(),
        database.clone(),
    );

    // Start indexer in background
    let indexer_handle = tokio::spawn(async move {
        if let Err(e) = indexer.start_indexing().await {
            error!("Indexer error: {}", e);
        }
    });

    // Start API server
    let api_server = ApiServer::new(database.clone(), config.clone());
    let server_handle = tokio::spawn(async move {
        if let Err(e) = api_server.start().await {
            error!("API server error: {}", e);
        }
    });

    info!("Backend services started successfully");

    // Wait for shutdown signal
    signal::ctrl_c().await?;
    info!("Shutdown signal received, stopping services...");

    // Cancel background tasks
    indexer_handle.abort();
    server_handle.abort();

    info!("Backend shutdown complete");
    Ok(())
}