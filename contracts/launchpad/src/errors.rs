use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum ContractError {
    // Authorization errors
    Unauthorized = 1,
    InvalidSigner = 2,
    
    // State errors
    AlreadyLaunched = 10,
    NotLaunched = 11,
    InvalidTokenState = 12,
    TokenNotFound = 13,
    
    // Parameter validation
    InvalidAmount = 20,
    InsufficientFunds = 21,
    InvalidCurveParameters = 22,
    InvalidLaunchThreshold = 23,
    InvalidSupply = 24,
    
    // Asset errors
    AssetNotFound = 30,
    TrustlineRequired = 31,
    IssuerLocked = 32,
    TransferFailed = 33,
    
    // System errors
    CalculationOverflow = 40,
    StorageError = 41,
    NetworkError = 42,
    
    // Rate limiting
    RateLimitExceeded = 50,
    MinimumNotMet = 51,
}