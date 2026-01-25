// Contract configuration for Stellar Pump Launchpad
export const CONTRACT_CONFIG = {
  // Deployed contract address on testnet
  LAUNCHPAD_CONTRACT_ID: 'CDHPDLT7KVICFAGYUO4ICTC5TGGR2XN5ZYT56TWZMNM6ATFVKXKU57HI',
  
  // Network configuration
  NETWORK: {
    TESTNET: {
      networkPassphrase: 'Test SDF Network ; September 2015',
      horizonUrl: 'https://horizon-testnet.stellar.org',
      sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    },
    MAINNET: {
      networkPassphrase: 'Public Global Stellar Network ; September 2015',
      horizonUrl: 'https://horizon.stellar.org',
      sorobanRpcUrl: 'https://soroban-rpc.stellar.org',
    }
  },
  
  // Current environment
  CURRENT_NETWORK: 'TESTNET' as 'TESTNET' | 'MAINNET',
  
  // Contract method names
  METHODS: {
    CREATE_TOKEN: 'create_token',
    BUY_TOKENS: 'buy_tokens',
    GET_TOKEN_INFO: 'get_token_info',
    GET_CURRENT_PRICE: 'get_current_price',
    GET_TOKEN_COUNT: 'get_token_count',
  },
  
  // Platform configuration
  PLATFORM: {
    FEE_PERCENTAGE: 1, // 1% platform fee
    MIN_TOKEN_SUPPLY: 1000000, // 1M tokens minimum
    MAX_TOKEN_SUPPLY: 1000000000, // 1B tokens maximum
    GRADUATION_THRESHOLD: 85000, // XLM threshold for DEX graduation
  }
} as const;

// Helper to get current network config
export const getCurrentNetworkConfig = () => {
  return CONTRACT_CONFIG.NETWORK[CONTRACT_CONFIG.CURRENT_NETWORK];
};

// Helper to get contract address
export const getContractAddress = () => {
  return CONTRACT_CONFIG.LAUNCHPAD_CONTRACT_ID;
};