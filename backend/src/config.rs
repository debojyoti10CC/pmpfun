use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub database_url: String,
    pub horizon_url: String,
    pub contract_address: String,
    pub server_port: u16,
    pub cors_origin: String,
    pub stellar_network: String,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        dotenv::dotenv().ok(); // Load .env file if it exists

        Ok(Config {
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| "postgresql://stellar_user:stellar_pass@localhost:5432/stellar_pump".to_string()),
            
            horizon_url: env::var("STELLAR_HORIZON_URL")
                .unwrap_or_else(|_| "https://horizon-testnet.stellar.org".to_string()),
            
            contract_address: env::var("LAUNCHPAD_CONTRACT_ADDRESS")
                .expect("LAUNCHPAD_CONTRACT_ADDRESS must be set"),
            
            server_port: env::var("BACKEND_PORT")
                .unwrap_or_else(|_| "3001".to_string())
                .parse()?,
            
            cors_origin: env::var("CORS_ORIGIN")
                .unwrap_or_else(|_| "http://localhost:3000".to_string()),
            
            stellar_network: env::var("STELLAR_NETWORK")
                .unwrap_or_else(|_| "testnet".to_string()),
        })
    }
}