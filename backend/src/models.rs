use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Token {
    pub id: Uuid,
    pub asset_code: String,
    pub issuer_address: String,
    pub distribution_address: String,
    pub contract_address: String,
    pub creator_address: String,
    
    // Token metadata
    pub name: String,
    pub symbol: String,
    pub image_url: Option<String>,
    pub description: Option<String>,
    
    // Supply and economics
    pub total_supply: i64,
    pub tokens_sold: i64,
    pub xlm_raised: i64,
    pub current_price: i64,
    
    // Launch configuration
    pub launch_threshold_xlm: i64,
    pub launch_threshold_percent: i32,
    pub is_launched: bool,
    pub launched_at: Option<DateTime<Utc>>,
    
    // Curve parameters
    pub curve_type: String,
    pub base_price: i64,
    pub price_multiplier: i64,
    
    // Metadata
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Purchase {
    pub id: Uuid,
    pub token_id: Uuid,
    pub buyer_address: String,
    pub xlm_amount: i64,
    pub tokens_received: i64,
    pub price_per_token: i64,
    pub transaction_hash: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Holder {
    pub token_id: Uuid,
    pub holder_address: String,
    pub balance: i64,
    pub first_purchase_at: DateTime<Utc>,
    pub last_purchase_at: DateTime<Utc>,
    pub total_purchased: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct TokenMetrics {
    pub token_id: Uuid,
    pub holder_count: i32,
    pub volume_24h: i64,
    pub volume_7d: i64,
    pub volume_total: i64,
    pub purchases_24h: i32,
    pub price_change_24h: f64,
    pub market_cap: i64,
    pub updated_at: DateTime<Utc>,
}

// API Response models
#[derive(Debug, Serialize, Deserialize)]
pub struct TokenSummary {
    pub id: Uuid,
    pub name: String,
    pub symbol: String,
    pub image_url: Option<String>,
    pub current_price: String,
    pub market_cap: String,
    pub volume_24h: String,
    pub price_change_24h: f64,
    pub holder_count: i32,
    pub launch_progress: f64,
    pub is_launched: bool,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenDetails {
    pub id: Uuid,
    pub name: String,
    pub symbol: String,
    pub image_url: Option<String>,
    pub description: Option<String>,
    pub current_price: String,
    pub market_cap: String,
    pub volume_24h: String,
    pub price_change_24h: f64,
    pub holder_count: i32,
    pub launch_progress: f64,
    pub is_launched: bool,
    pub created_at: DateTime<Utc>,
    
    // Additional details
    pub total_supply: String,
    pub tokens_sold: String,
    pub xlm_raised: String,
    pub launch_threshold_xlm: String,
    pub launch_threshold_percent: i32,
    pub contract_address: String,
    pub issuer_address: String,
    pub creator_address: String,
    pub bonding_curve: BondingCurveInfo,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BondingCurveInfo {
    pub curve_type: String,
    pub base_price: String,
    pub price_multiplier: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PriceHistory {
    pub timestamp: DateTime<Utc>,
    pub price: String,
    pub volume: String,
}

// Contract event models
#[derive(Debug, Clone)]
pub struct TokenCreatedEvent {
    pub transaction_hash: String,
    pub token_address: String,
    pub creator: String,
    pub name: String,
    pub symbol: String,
    pub total_supply: i64,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct TokenPurchaseEvent {
    pub transaction_hash: String,
    pub token_address: String,
    pub buyer: String,
    pub xlm_amount: i64,
    pub tokens_received: i64,
    pub new_price: i64,
    pub timestamp: DateTime<Utc>,
}

#[derive(Debug, Clone)]
pub struct TokenLaunchEvent {
    pub transaction_hash: String,
    pub token_address: String,
    pub final_price: i64,
    pub xlm_raised: i64,
    pub tokens_sold: i64,
    pub timestamp: DateTime<Utc>,
}