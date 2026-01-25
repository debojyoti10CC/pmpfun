use soroban_sdk::{contract, contractimpl, Address, Env, String};
use crate::{
    errors::ContractError,
    types::{CurveParameters, TokenInfo, PurchaseResult},
};

#[contract]
pub struct LaunchpadContract;

#[contractimpl]
impl LaunchpadContract {
    /// Create a new token with bonding curve
    pub fn create_token(
        env: Env,
        creator: Address,
        name: String,
        symbol: String,
        total_supply: i128,
        launch_threshold_xlm: i128,
        launch_threshold_percent: u32,
        curve_params: CurveParameters,
    ) -> Result<String, ContractError> {
        // Authenticate creator
        creator.require_auth();

        // Basic validation
        if total_supply <= 0 {
            return Err(ContractError::InvalidSupply);
        }

        if launch_threshold_xlm <= 0 && launch_threshold_percent == 0 {
            return Err(ContractError::InvalidLaunchThreshold);
        }

        if launch_threshold_percent > 100 {
            return Err(ContractError::InvalidLaunchThreshold);
        }

        // Create a simple token ID using symbol directly
        let token_key = symbol.clone();

        // Store basic token info (simplified)
        env.storage().persistent().set(&token_key, &TokenInfo {
            name: name.clone(),
            symbol: symbol.clone(),
            total_supply,
            tokens_sold: 0,
            xlm_raised: 0,
            current_price: curve_params.base_price,
            launch_progress_percent: 0,
            is_launched: false,
            creator: creator.clone(),
            creation_time: env.ledger().timestamp(),
        });

        // Emit creation event
        env.events().publish(
            (soroban_sdk::symbol_short!("created"),),
            (token_key.clone(), creator, name, symbol, total_supply)
        );

        Ok(token_key)
    }

    /// Purchase tokens with XLM (simplified version)
    pub fn buy_tokens(
        env: Env,
        buyer: Address,
        token_id: String,
        xlm_amount: i128,
    ) -> Result<PurchaseResult, ContractError> {
        buyer.require_auth();

        if xlm_amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }

        // Get token info
        let mut token_info: TokenInfo = env.storage().persistent()
            .get(&token_id)
            .ok_or(ContractError::TokenNotFound)?;

        if token_info.is_launched {
            return Err(ContractError::AlreadyLaunched);
        }

        // Simple linear pricing calculation
        let tokens_to_receive = xlm_amount / token_info.current_price;
        
        if tokens_to_receive <= 0 {
            return Err(ContractError::InvalidAmount);
        }

        // Update token info
        token_info.tokens_sold += tokens_to_receive;
        token_info.xlm_raised += xlm_amount;
        
        // Simple price increase
        token_info.current_price += token_info.current_price / 100; // 1% increase

        // Check launch conditions
        let launch_triggered = token_info.xlm_raised >= 100_000_000; // 10 XLM threshold
        if launch_triggered {
            token_info.is_launched = true;
        }

        // Save updated info
        env.storage().persistent().set(&token_id, &token_info);

        // Emit purchase event
        env.events().publish(
            (soroban_sdk::symbol_short!("purchase"),),
            (token_id, buyer, xlm_amount, tokens_to_receive)
        );

        Ok(PurchaseResult {
            tokens_received: tokens_to_receive,
            new_price: token_info.current_price,
            launch_triggered,
        })
    }

    /// Get current token price
    pub fn get_current_price(env: Env, token_id: String) -> Result<i128, ContractError> {
        let token_info: TokenInfo = env.storage().persistent()
            .get(&token_id)
            .ok_or(ContractError::TokenNotFound)?;

        Ok(token_info.current_price)
    }

    /// Get token information
    pub fn get_token_info(env: Env, token_id: String) -> Result<TokenInfo, ContractError> {
        let token_info: TokenInfo = env.storage().persistent()
            .get(&token_id)
            .ok_or(ContractError::TokenNotFound)?;

        Ok(token_info)
    }

    /// Get total number of tokens created
    pub fn get_token_count(env: Env) -> u32 {
        env.storage().persistent().get(&soroban_sdk::symbol_short!("count")).unwrap_or(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};
    use crate::types::{CurveType, CurveParameters};

    #[test]
    fn test_create_token() {
        let env = Env::default();
        let contract_id = env.register_contract(None, LaunchpadContract);
        let client = LaunchpadContractClient::new(&env, &contract_id);

        let creator = Address::generate(&env);
        let name = String::from_str(&env, "Test Token");
        let symbol = String::from_str(&env, "TEST");
        let total_supply = 1_000_000i128;
        let launch_threshold_xlm = 100_000_000i128; // 10 XLM
        let launch_threshold_percent = 80u32;
        let curve_params = CurveParameters {
            curve_type: CurveType::Linear,
            base_price: 1000,
            price_multiplier: 9000,
        };

        let token_id = client.create_token(
            &creator,
            &name,
            &symbol,
            &total_supply,
            &launch_threshold_xlm,
            &launch_threshold_percent,
            &curve_params,
        );

        // Verify token was created
        let token_info = client.get_token_info(&token_id);
        assert_eq!(token_info.name, name);
        assert_eq!(token_info.symbol, symbol);
        assert_eq!(token_info.total_supply, total_supply);
        assert_eq!(token_info.tokens_sold, 0);
        assert_eq!(token_info.is_launched, false);
    }
}