-- Core token information
CREATE TABLE tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_code VARCHAR(12) NOT NULL,
    issuer_address VARCHAR(56) NOT NULL,
    distribution_address VARCHAR(56) NOT NULL,
    contract_address VARCHAR(56) NOT NULL,
    creator_address VARCHAR(56) NOT NULL,
    
    -- Token metadata
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(12) NOT NULL,
    image_url TEXT,
    description TEXT,
    
    -- Supply and economics
    total_supply BIGINT NOT NULL,
    tokens_sold BIGINT DEFAULT 0,
    xlm_raised BIGINT DEFAULT 0,
    current_price BIGINT NOT NULL,
    
    -- Launch configuration
    launch_threshold_xlm BIGINT NOT NULL,
    launch_threshold_percent INTEGER NOT NULL,
    is_launched BOOLEAN DEFAULT FALSE,
    launched_at TIMESTAMP,
    
    -- Curve parameters
    curve_type VARCHAR(20) NOT NULL,
    base_price BIGINT NOT NULL,
    price_multiplier BIGINT NOT NULL,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(asset_code, issuer_address)
);

-- Purchase history
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID REFERENCES tokens(id),
    buyer_address VARCHAR(56) NOT NULL,
    xlm_amount BIGINT NOT NULL,
    tokens_received BIGINT NOT NULL,
    price_per_token BIGINT NOT NULL,
    transaction_hash VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Token holders
CREATE TABLE holders (
    token_id UUID REFERENCES tokens(id),
    holder_address VARCHAR(56) NOT NULL,
    balance BIGINT NOT NULL,
    first_purchase_at TIMESTAMP NOT NULL,
    last_purchase_at TIMESTAMP NOT NULL,
    total_purchased BIGINT NOT NULL,
    
    PRIMARY KEY (token_id, holder_address)
);

-- Aggregated metrics
CREATE TABLE token_metrics (
    token_id UUID PRIMARY KEY REFERENCES tokens(id),
    holder_count INTEGER DEFAULT 0,
    volume_24h BIGINT DEFAULT 0,
    volume_7d BIGINT DEFAULT 0,
    volume_total BIGINT DEFAULT 0,
    purchases_24h INTEGER DEFAULT 0,
    price_change_24h DECIMAL(10,4) DEFAULT 0,
    market_cap BIGINT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tokens_created_at ON tokens(created_at DESC);
CREATE INDEX idx_tokens_is_launched ON tokens(is_launched);
CREATE INDEX idx_purchases_token_id ON purchases(token_id);
CREATE INDEX idx_purchases_created_at ON purchases(created_at DESC);
CREATE INDEX idx_holders_token_id ON holders(token_id);
CREATE INDEX idx_token_metrics_volume_24h ON token_metrics(volume_24h DESC);