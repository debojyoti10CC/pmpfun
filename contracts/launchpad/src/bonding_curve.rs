use crate::{
    errors::ContractError,
    types::{CurveParameters, CurveType},
};

pub struct BondingCurve;

impl BondingCurve {
    /// Calculate tokens received for XLM amount
    pub fn calculate_tokens_for_xlm(
        curve_params: &CurveParameters,
        xlm_amount: i128,
        tokens_sold: i128,
        total_supply: i128,
    ) -> Result<i128, ContractError> {
        if xlm_amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }

        match curve_params.curve_type {
            CurveType::Linear => {
                let current_price = Self::get_linear_price(curve_params, tokens_sold, total_supply)?;
                Ok(xlm_amount / current_price)
            }
            CurveType::Quadratic => {
                // Simplified quadratic calculation
                let current_price = Self::get_quadratic_price(curve_params, tokens_sold, total_supply)?;
                Ok(xlm_amount / current_price)
            }
        }
    }

    /// Calculate XLM received for token amount (for selling)
    pub fn calculate_xlm_for_tokens(
        curve_params: &CurveParameters,
        token_amount: i128,
        tokens_sold: i128,
        total_supply: i128,
    ) -> Result<i128, ContractError> {
        if token_amount <= 0 {
            return Err(ContractError::InvalidAmount);
        }

        match curve_params.curve_type {
            CurveType::Linear => {
                let price = Self::get_linear_price(curve_params, tokens_sold, total_supply)?;
                Ok(token_amount * price)
            }
            CurveType::Quadratic => {
                let price = Self::get_quadratic_price(curve_params, tokens_sold, total_supply)?;
                Ok(token_amount * price)
            }
        }
    }

    /// Get current price based on tokens sold
    pub fn get_current_price(
        curve_params: &CurveParameters,
        tokens_sold: i128,
        total_supply: i128,
    ) -> Result<i128, ContractError> {
        match curve_params.curve_type {
            CurveType::Linear => Self::get_linear_price(curve_params, tokens_sold, total_supply),
            CurveType::Quadratic => Self::get_quadratic_price(curve_params, tokens_sold, total_supply),
        }
    }

    /// Validate curve parameters
    pub fn validate_curve_params(
        curve_params: &CurveParameters,
        total_supply: i128,
    ) -> Result<(), ContractError> {
        if curve_params.base_price <= 0 {
            return Err(ContractError::InvalidCurveParameters);
        }

        if curve_params.price_multiplier <= 0 {
            return Err(ContractError::InvalidCurveParameters);
        }

        if total_supply <= 0 {
            return Err(ContractError::InvalidSupply);
        }

        Ok(())
    }

    // Private helper functions

    fn get_linear_price(
        curve_params: &CurveParameters,
        tokens_sold: i128,
        total_supply: i128,
    ) -> Result<i128, ContractError> {
        if total_supply <= 0 {
            return Err(ContractError::InvalidSupply);
        }

        // Linear price: base_price + (tokens_sold / total_supply) * price_multiplier
        let progress = (tokens_sold * 10000) / total_supply; // Use basis points for precision
        let price_increase = (progress * curve_params.price_multiplier) / 10000;
        let current_price = curve_params.base_price + price_increase;

        if current_price <= 0 {
            return Err(ContractError::CalculationOverflow);
        }

        Ok(current_price)
    }

    fn get_quadratic_price(
        curve_params: &CurveParameters,
        tokens_sold: i128,
        total_supply: i128,
    ) -> Result<i128, ContractError> {
        if total_supply <= 0 {
            return Err(ContractError::InvalidSupply);
        }

        // Quadratic price: base_price + (tokens_sold / total_supply)^2 * price_multiplier
        let progress = (tokens_sold * 10000) / total_supply; // Use basis points for precision
        let progress_squared = (progress * progress) / 10000;
        let price_increase = (progress_squared * curve_params.price_multiplier) / 10000;
        let current_price = curve_params.base_price + price_increase;

        if current_price <= 0 {
            return Err(ContractError::CalculationOverflow);
        }

        Ok(current_price)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_linear_curve() -> CurveParameters {
        CurveParameters {
            curve_type: CurveType::Linear,
            base_price: 1000,      // 0.0001 XLM
            price_multiplier: 9000, // Increases to 0.001 XLM at full supply
        }
    }

    fn create_quadratic_curve() -> CurveParameters {
        CurveParameters {
            curve_type: CurveType::Quadratic,
            base_price: 1000,
            price_multiplier: 9000,
        }
    }

    #[test]
    fn test_linear_price_calculation() {
        let curve = create_linear_curve();
        let total_supply = 1_000_000i128;

        // Test initial price
        let price = BondingCurve::get_current_price(&curve, 0, total_supply).unwrap();
        assert_eq!(price, 1000);

        // Test price at 50% sold
        let price = BondingCurve::get_current_price(&curve, 500_000, total_supply).unwrap();
        assert_eq!(price, 5500); // 1000 + (0.5 * 9000) = 5500

        // Test price at 100% sold
        let price = BondingCurve::get_current_price(&curve, 1_000_000, total_supply).unwrap();
        assert_eq!(price, 10000); // 1000 + 9000 = 10000
    }

    #[test]
    fn test_quadratic_price_calculation() {
        let curve = create_quadratic_curve();
        let total_supply = 1_000_000i128;

        // Test initial price
        let price = BondingCurve::get_current_price(&curve, 0, total_supply).unwrap();
        assert_eq!(price, 1000);

        // Test price at 50% sold (quadratic should be lower than linear at this point)
        let price = BondingCurve::get_current_price(&curve, 500_000, total_supply).unwrap();
        assert_eq!(price, 3250); // 1000 + (0.5^2 * 9000) = 3250

        // Test price at 100% sold
        let price = BondingCurve::get_current_price(&curve, 1_000_000, total_supply).unwrap();
        assert_eq!(price, 10000); // 1000 + 9000 = 10000
    }

    #[test]
    fn test_tokens_for_xlm_calculation() {
        let curve = create_linear_curve();
        let total_supply = 1_000_000i128;
        let tokens_sold = 0i128;
        let xlm_amount = 10_000i128;

        let tokens = BondingCurve::calculate_tokens_for_xlm(
            &curve,
            xlm_amount,
            tokens_sold,
            total_supply,
        ).unwrap();

        assert_eq!(tokens, 10); // 10_000 / 1000 = 10 tokens
    }

    #[test]
    fn test_xlm_for_tokens_calculation() {
        let curve = create_linear_curve();
        let total_supply = 1_000_000i128;
        let tokens_sold = 0i128;
        let token_amount = 10i128;

        let xlm = BondingCurve::calculate_xlm_for_tokens(
            &curve,
            token_amount,
            tokens_sold,
            total_supply,
        ).unwrap();

        assert_eq!(xlm, 10_000); // 10 * 1000 = 10_000 stroops
    }

    #[test]
    fn test_parameter_validation() {
        let total_supply = 1_000_000i128;

        // Test valid parameters
        let valid_curve = create_linear_curve();
        assert!(BondingCurve::validate_curve_params(&valid_curve, total_supply).is_ok());

        // Test invalid base price
        let invalid_curve = CurveParameters {
            curve_type: CurveType::Linear,
            base_price: 0,
            price_multiplier: 1000,
        };
        assert_eq!(
            BondingCurve::validate_curve_params(&invalid_curve, total_supply),
            Err(ContractError::InvalidCurveParameters)
        );

        // Test invalid price multiplier
        let invalid_curve = CurveParameters {
            curve_type: CurveType::Linear,
            base_price: 1000,
            price_multiplier: 0,
        };
        assert_eq!(
            BondingCurve::validate_curve_params(&invalid_curve, total_supply),
            Err(ContractError::InvalidCurveParameters)
        );

        // Test invalid total supply
        assert_eq!(
            BondingCurve::validate_curve_params(&valid_curve, 0),
            Err(ContractError::InvalidSupply)
        );
    }

    #[test]
    fn test_invalid_amounts() {
        let curve = create_linear_curve();
        let total_supply = 1_000_000i128;
        let tokens_sold = 0i128;

        // Test zero XLM amount
        let result = BondingCurve::calculate_tokens_for_xlm(&curve, 0, tokens_sold, total_supply);
        assert_eq!(result, Err(ContractError::InvalidAmount));

        // Test negative XLM amount
        let result = BondingCurve::calculate_tokens_for_xlm(&curve, -1000, tokens_sold, total_supply);
        assert_eq!(result, Err(ContractError::InvalidAmount));

        // Test zero token amount
        let result = BondingCurve::calculate_xlm_for_tokens(&curve, 0, tokens_sold, total_supply);
        assert_eq!(result, Err(ContractError::InvalidAmount));

        // Test negative token amount
        let result = BondingCurve::calculate_xlm_for_tokens(&curve, -10, tokens_sold, total_supply);
        assert_eq!(result, Err(ContractError::InvalidAmount));
    }
}