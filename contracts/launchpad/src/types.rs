use soroban_sdk::{contracttype, Address, String};

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum CurveType {
    Linear,
    Quadratic,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct CurveParameters {
    pub curve_type: CurveType,
    pub base_price: i128,        // Starting price in stroops
    pub price_multiplier: i128,  // Price scaling factor
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct LaunchpadState {
    pub token_address: Address,           // Native asset identifier
    pub distribution_account: Address,    // Account holding token supply
    pub total_supply: i128,              // Fixed token supply
    pub tokens_sold: i128,               // Tokens sold via bonding curve
    pub xlm_raised: i128,                // Total XLM collected
    pub launch_threshold_xlm: i128,      // XLM target for launch
    pub launch_threshold_percent: u32,   // % of supply target for launch
    pub is_launched: bool,               // Irreversible launch flag
    pub curve_params: CurveParameters,   // Bonding curve configuration
    pub creator: Address,                // Token creator (no special privileges)
    pub creation_time: u64,              // Launch timestamp
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct TokenInfo {
    pub name: String,
    pub symbol: String,
    pub total_supply: i128,
    pub tokens_sold: i128,
    pub xlm_raised: i128,
    pub current_price: i128,
    pub launch_progress_percent: u32,
    pub is_launched: bool,
    pub creator: Address,
    pub creation_time: u64,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct PurchaseResult {
    pub tokens_received: i128,
    pub new_price: i128,
    pub launch_triggered: bool,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct SellResult {
    pub xlm_received: i128,
    pub new_price: i128,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub struct LaunchEvent {
    pub token_address: Address,
    pub final_price: i128,
    pub xlm_raised: i128,
    pub tokens_sold: i128,
    pub timestamp: u64,
}