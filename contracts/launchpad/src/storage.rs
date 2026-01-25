use soroban_sdk::{Address, Env, Vec};
use crate::types::LaunchpadState;

const DAY_IN_LEDGERS: u32 = 17280; // Approximately 24 hours
const INSTANCE_BUMP_AMOUNT: u32 = 7 * DAY_IN_LEDGERS; // 7 days
const INSTANCE_LIFETIME_THRESHOLD: u32 = INSTANCE_BUMP_AMOUNT - DAY_IN_LEDGERS; // 6 days

// Storage keys
const STATE_KEY: &str = "STATE";
const TOKEN_COUNT_KEY: &str = "COUNT";
const CREATOR_TOKENS_KEY: &str = "CREATOR";
const RATE_LIMIT_KEY: &str = "RATE";

/// Extend the TTL for state storage
pub fn extend_state_ttl(env: &Env, token_address: &Address) {
    env.storage()
        .persistent()
        .extend_ttl(token_address, INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

/// Store launchpad state for a token
pub fn set_state(env: &Env, token_address: &Address, state: &LaunchpadState) {
    env.storage().persistent().set(token_address, state);
}

/// Get launchpad state for a token
pub fn get_state(env: &Env, token_address: &Address) -> Option<LaunchpadState> {
    env.storage().persistent().get(token_address)
}

/// Get total token count
pub fn get_token_count(env: &Env) -> u32 {
    env.storage().persistent().get(&TOKEN_COUNT_KEY).unwrap_or(0)
}

/// Increment token count
pub fn increment_token_count(env: &Env) {
    let current_count = get_token_count(env);
    env.storage().persistent().set(&TOKEN_COUNT_KEY, &(current_count + 1));
}

/// Add token to creator's list
pub fn add_creator_token(env: &Env, creator: &Address, token_address: &Address) {
    let key = (CREATOR_TOKENS_KEY, creator);
    let mut tokens: Vec<Address> = env.storage().persistent().get(&key).unwrap_or(Vec::new(env));
    tokens.push_back(token_address.clone());
    env.storage().persistent().set(&key, &tokens);
}

/// Get tokens created by a creator
pub fn get_creator_tokens(env: &Env, creator: &Address) -> Vec<Address> {
    let key = (CREATOR_TOKENS_KEY, creator);
    env.storage().persistent().get(&key).unwrap_or(Vec::new(env))
}

/// Set rate limit timestamp for creator
pub fn set_rate_limit_timestamp(env: &Env, creator: &Address, timestamp: u64) {
    let key = (RATE_LIMIT_KEY, creator);
    env.storage().persistent().set(&key, &timestamp);
}

/// Get rate limit timestamp for creator
pub fn get_rate_limit_timestamp(env: &Env, creator: &Address) -> u64 {
    let key = (RATE_LIMIT_KEY, creator);
    env.storage().persistent().get(&key).unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};
    use crate::types::{CurveParameters, CurveType, LaunchpadState};

    fn create_test_state(env: &Env) -> LaunchpadState {
        LaunchpadState {
            token_address: Address::generate(env),
            distribution_account: Address::generate(env),
            total_supply: 1_000_000,
            tokens_sold: 0,
            xlm_raised: 0,
            launch_threshold_xlm: 100_000_000,
            launch_threshold_percent: 80,
            is_launched: false,
            curve_params: CurveParameters {
                curve_type: CurveType::Linear,
                base_price: 1000,
                price_multiplier: 9000,
            },
            creator: Address::generate(env),
            creation_time: 1234567890,
        }
    }

    #[test]
    fn test_state_storage() {
        let env = Env::default();
        let token_address = Address::generate(&env);
        let state = create_test_state(&env);

        // Test set and get
        set_state(&env, &token_address, &state);
        let retrieved_state = get_state(&env, &token_address);
        
        assert!(retrieved_state.is_some());
        let retrieved_state = retrieved_state.unwrap();
        assert_eq!(retrieved_state.total_supply, state.total_supply);
        assert_eq!(retrieved_state.tokens_sold, state.tokens_sold);
        assert_eq!(retrieved_state.is_launched, state.is_launched);
    }

    #[test]
    fn test_token_count() {
        let env = Env::default();

        // Initial count should be 0
        assert_eq!(get_token_count(&env), 0);

        // Increment and verify
        increment_token_count(&env);
        assert_eq!(get_token_count(&env), 1);

        increment_token_count(&env);
        assert_eq!(get_token_count(&env), 2);
    }

    #[test]
    fn test_creator_tokens() {
        let env = Env::default();
        let creator = Address::generate(&env);
        let token1 = Address::generate(&env);
        let token2 = Address::generate(&env);

        // Initially empty
        let tokens = get_creator_tokens(&env, &creator);
        assert_eq!(tokens.len(), 0);

        // Add first token
        add_creator_token(&env, &creator, &token1);
        let tokens = get_creator_tokens(&env, &creator);
        assert_eq!(tokens.len(), 1);
        assert_eq!(tokens.get(0).unwrap(), token1);

        // Add second token
        add_creator_token(&env, &creator, &token2);
        let tokens = get_creator_tokens(&env, &creator);
        assert_eq!(tokens.len(), 2);
        assert_eq!(tokens.get(0).unwrap(), token1);
        assert_eq!(tokens.get(1).unwrap(), token2);
    }

    #[test]
    fn test_rate_limiting() {
        let env = Env::default();
        let creator = Address::generate(&env);
        let timestamp = 1234567890u64;

        // Initially should be 0
        assert_eq!(get_rate_limit_timestamp(&env, &creator), 0);

        // Set and verify
        set_rate_limit_timestamp(&env, &creator, timestamp);
        assert_eq!(get_rate_limit_timestamp(&env, &creator), timestamp);
    }

    #[test]
    fn test_multiple_creators() {
        let env = Env::default();
        let creator1 = Address::generate(&env);
        let creator2 = Address::generate(&env);
        let token1 = Address::generate(&env);
        let token2 = Address::generate(&env);

        // Add tokens to different creators
        add_creator_token(&env, &creator1, &token1);
        add_creator_token(&env, &creator2, &token2);

        // Verify each creator has their own tokens
        let creator1_tokens = get_creator_tokens(&env, &creator1);
        let creator2_tokens = get_creator_tokens(&env, &creator2);

        assert_eq!(creator1_tokens.len(), 1);
        assert_eq!(creator2_tokens.len(), 1);
        assert_eq!(creator1_tokens.get(0).unwrap(), token1);
        assert_eq!(creator2_tokens.get(0).unwrap(), token2);
    }

    #[test]
    fn test_nonexistent_data() {
        let env = Env::default();
        let fake_address = Address::generate(&env);

        // Test getting nonexistent state
        let state = get_state(&env, &fake_address);
        assert!(state.is_none());

        // Test getting tokens for nonexistent creator
        let tokens = get_creator_tokens(&env, &fake_address);
        assert_eq!(tokens.len(), 0);

        // Test getting rate limit for nonexistent creator
        let timestamp = get_rate_limit_timestamp(&env, &fake_address);
        assert_eq!(timestamp, 0);
    }
}