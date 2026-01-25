use anyhow::{Result, anyhow};
use chrono::{DateTime, Utc};
use reqwest::Client;
use serde_json::Value;
use std::time::Duration;
use tokio::time::sleep;
use tracing::{info, error, warn, debug};
use uuid::Uuid;

use crate::database::Database;
use crate::models::*;

pub struct HorizonIndexer {
    horizon_url: String,
    contract_address: String,
    database: Database,
    client: Client,
    last_cursor: Option<String>,
}

impl HorizonIndexer {
    pub fn new(horizon_url: String, contract_address: String, database: Database) -> Self {
        Self {
            horizon_url,
            contract_address,
            database,
            client: Client::new(),
            last_cursor: None,
        }
    }

    pub async fn start_indexing(&mut self) -> Result<()> {
        info!("Starting Horizon indexer for contract: {}", self.contract_address);

        // Get the latest cursor from database or start from recent
        self.last_cursor = self.get_last_cursor().await?;

        loop {
            match self.process_transactions().await {
                Ok(_) => {
                    debug!("Transaction processing cycle completed");
                }
                Err(e) => {
                    error!("Error processing transactions: {}", e);
                    sleep(Duration::from_secs(10)).await;
                }
            }

            // Wait before next polling cycle
            sleep(Duration::from_secs(5)).await;
        }
    }

    async fn process_transactions(&mut self) -> Result<()> {
        let url = if let Some(cursor) = &self.last_cursor {
            format!(
                "{}/transactions?cursor={}&order=asc&limit=200",
                self.horizon_url, cursor
            )
        } else {
            format!(
                "{}/transactions?order=desc&limit=200",
                self.horizon_url
            )
        };

        debug!("Fetching transactions from: {}", url);

        let response = self.client.get(&url).send().await?;
        let data: Value = response.json().await?;

        let records = data["_embedded"]["records"]
            .as_array()
            .ok_or_else(|| anyhow!("Invalid response format"))?;

        if records.is_empty() {
            return Ok(());
        }

        for record in records {
            if let Err(e) = self.process_transaction(record).await {
                error!("Error processing transaction: {}", e);
                continue;
            }

            // Update cursor
            if let Some(cursor) = record["paging_token"].as_str() {
                self.last_cursor = Some(cursor.to_string());
            }
        }

        Ok(())
    }

    async fn process_transaction(&self, tx: &Value) -> Result<()> {
        let tx_hash = tx["hash"]
            .as_str()
            .ok_or_else(|| anyhow!("Missing transaction hash"))?;

        // Check if transaction involves our contract
        if !self.is_contract_transaction(tx).await? {
            return Ok(());
        }

        debug!("Processing contract transaction: {}", tx_hash);

        // Get transaction operations
        let operations = self.get_transaction_operations(tx_hash).await?;

        for operation in operations {
            match self.parse_contract_event(&operation).await {
                Ok(Some(event)) => {
                    if let Err(e) = self.handle_contract_event(event, tx_hash).await {
                        error!("Error handling contract event: {}", e);
                    }
                }
                Ok(None) => {
                    // Not a relevant contract event
                }
                Err(e) => {
                    warn!("Error parsing contract event: {}", e);
                }
            }
        }

        Ok(())
    }

    async fn is_contract_transaction(&self, tx: &Value) -> Result<bool> {
        // Check if any operation in the transaction involves our contract
        let operations_url = tx["_links"]["operations"]["href"]
            .as_str()
            .ok_or_else(|| anyhow!("Missing operations link"))?;

        let response = self.client.get(operations_url).send().await?;
        let data: Value = response.json().await?;

        let operations = data["_embedded"]["records"]
            .as_array()
            .ok_or_else(|| anyhow!("Invalid operations response"))?;

        for op in operations {
            if let Some(op_type) = op["type_i"].as_u64() {
                // Check for invoke contract operation (type 24)
                if op_type == 24 {
                    if let Some(contract) = op["contract"].as_str() {
                        if contract == self.contract_address {
                            return Ok(true);
                        }
                    }
                }
            }
        }

        Ok(false)
    }

    async fn get_transaction_operations(&self, tx_hash: &str) -> Result<Vec<Value>> {
        let url = format!("{}/transactions/{}/operations", self.horizon_url, tx_hash);
        
        let response = self.client.get(&url).send().await?;
        let data: Value = response.json().await?;

        let operations = data["_embedded"]["records"]
            .as_array()
            .ok_or_else(|| anyhow!("Invalid operations response"))?
            .clone();

        Ok(operations)
    }

    async fn parse_contract_event(&self, operation: &Value) -> Result<Option<ContractEvent>> {
        // Check if this is an invoke contract operation
        if operation["type_i"].as_u64() != Some(24) {
            return Ok(None);
        }

        // Check if it's our contract
        if operation["contract"].as_str() != Some(&self.contract_address) {
            return Ok(None);
        }

        // Parse function name and parameters
        let function = operation["function"]
            .as_str()
            .ok_or_else(|| anyhow!("Missing function name"))?;

        let parameters = operation["parameters"]
            .as_array()
            .unwrap_or(&vec![]);

        let timestamp = operation["created_at"]
            .as_str()
            .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
            .map(|dt| dt.with_timezone(&Utc))
            .unwrap_or_else(Utc::now);

        match function {
            "create_token" => {
                Ok(Some(ContractEvent::TokenCreated(self.parse_token_created_event(
                    operation, parameters, timestamp
                )?)))
            }
            "buy_tokens" => {
                Ok(Some(ContractEvent::TokenPurchase(self.parse_token_purchase_event(
                    operation, parameters, timestamp
                )?)))
            }
            "execute_launch_transition" => {
                Ok(Some(ContractEvent::TokenLaunch(self.parse_token_launch_event(
                    operation, parameters, timestamp
                )?)))
            }
            _ => Ok(None),
        }
    }

    fn parse_token_created_event(
        &self,
        operation: &Value,
        _parameters: &[Value],
        timestamp: DateTime<Utc>,
    ) -> Result<TokenCreatedEvent> {
        // In a real implementation, we would parse the contract event data
        // For now, we'll extract what we can from the operation
        
        Ok(TokenCreatedEvent {
            transaction_hash: operation["transaction_hash"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            token_address: "".to_string(), // Would be parsed from event data
            creator: operation["source_account"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            name: "".to_string(), // Would be parsed from event data
            symbol: "".to_string(), // Would be parsed from event data
            total_supply: 0, // Would be parsed from event data
            timestamp,
        })
    }

    fn parse_token_purchase_event(
        &self,
        operation: &Value,
        _parameters: &[Value],
        timestamp: DateTime<Utc>,
    ) -> Result<TokenPurchaseEvent> {
        Ok(TokenPurchaseEvent {
            transaction_hash: operation["transaction_hash"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            token_address: "".to_string(),
            buyer: operation["source_account"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            xlm_amount: 0,
            tokens_received: 0,
            new_price: 0,
            timestamp,
        })
    }

    fn parse_token_launch_event(
        &self,
        operation: &Value,
        _parameters: &[Value],
        timestamp: DateTime<Utc>,
    ) -> Result<TokenLaunchEvent> {
        Ok(TokenLaunchEvent {
            transaction_hash: operation["transaction_hash"]
                .as_str()
                .unwrap_or("")
                .to_string(),
            token_address: "".to_string(),
            final_price: 0,
            xlm_raised: 0,
            tokens_sold: 0,
            timestamp,
        })
    }

    async fn handle_contract_event(&self, event: ContractEvent, tx_hash: &str) -> Result<()> {
        match event {
            ContractEvent::TokenCreated(event) => {
                self.handle_token_created_event(event).await?;
            }
            ContractEvent::TokenPurchase(event) => {
                self.handle_token_purchase_event(event).await?;
            }
            ContractEvent::TokenLaunch(event) => {
                self.handle_token_launch_event(event).await?;
            }
        }

        info!("Processed contract event in transaction: {}", tx_hash);
        Ok(())
    }

    async fn handle_token_created_event(&self, event: TokenCreatedEvent) -> Result<()> {
        // Create token record in database
        let token = Token {
            id: Uuid::new_v4(),
            asset_code: event.symbol.clone(),
            issuer_address: event.token_address.clone(),
            distribution_address: "".to_string(), // Would be extracted from event
            contract_address: self.contract_address.clone(),
            creator_address: event.creator,
            name: event.name,
            symbol: event.symbol,
            image_url: None,
            description: None,
            total_supply: event.total_supply,
            tokens_sold: 0,
            xlm_raised: 0,
            current_price: 0, // Would be calculated from curve params
            launch_threshold_xlm: 0, // Would be extracted from event
            launch_threshold_percent: 0, // Would be extracted from event
            is_launched: false,
            launched_at: None,
            curve_type: "linear".to_string(), // Would be extracted from event
            base_price: 0, // Would be extracted from event
            price_multiplier: 0, // Would be extracted from event
            created_at: event.timestamp,
            updated_at: event.timestamp,
        };

        self.database.create_token(&token).await?;
        info!("Created token record: {} ({})", token.name, token.symbol);

        Ok(())
    }

    async fn handle_token_purchase_event(&self, event: TokenPurchaseEvent) -> Result<()> {
        // Find token by address
        let token = self.database
            .get_token_by_address(&event.token_address)
            .await?
            .ok_or_else(|| anyhow!("Token not found: {}", event.token_address))?;

        // Create purchase record
        let purchase = Purchase {
            id: Uuid::new_v4(),
            token_id: token.id,
            buyer_address: event.buyer.clone(),
            xlm_amount: event.xlm_amount,
            tokens_received: event.tokens_received,
            price_per_token: if event.tokens_received > 0 {
                event.xlm_amount / event.tokens_received
            } else {
                0
            },
            transaction_hash: event.transaction_hash,
            created_at: event.timestamp,
        };

        self.database.create_purchase(&purchase).await?;

        // Update holder record
        self.database
            .upsert_holder(
                token.id,
                &event.buyer,
                event.tokens_received,
                event.tokens_received,
            )
            .await?;

        // Update token state
        let new_tokens_sold = token.tokens_sold + event.tokens_received;
        let new_xlm_raised = token.xlm_raised + event.xlm_amount;

        self.database
            .update_token_state(
                token.id,
                new_tokens_sold,
                new_xlm_raised,
                event.new_price,
                false, // Launch status would be determined from event
                None,
            )
            .await?;

        // Update metrics
        self.database.update_token_metrics(token.id).await?;

        info!("Processed purchase: {} tokens for {} XLM", event.tokens_received, event.xlm_amount);

        Ok(())
    }

    async fn handle_token_launch_event(&self, event: TokenLaunchEvent) -> Result<()> {
        // Find token by address
        let token = self.database
            .get_token_by_address(&event.token_address)
            .await?
            .ok_or_else(|| anyhow!("Token not found: {}", event.token_address))?;

        // Update token as launched
        self.database
            .update_token_state(
                token.id,
                event.tokens_sold,
                event.xlm_raised,
                event.final_price,
                true,
                Some(event.timestamp),
            )
            .await?;

        // Update metrics
        self.database.update_token_metrics(token.id).await?;

        info!("Token launched: {} at final price {}", token.symbol, event.final_price);

        Ok(())
    }

    async fn get_last_cursor(&self) -> Result<Option<String>> {
        // In a real implementation, we would store the last processed cursor
        // For now, we'll start from recent transactions
        Ok(None)
    }
}

#[derive(Debug)]
enum ContractEvent {
    TokenCreated(TokenCreatedEvent),
    TokenPurchase(TokenPurchaseEvent),
    TokenLaunch(TokenLaunchEvent),
}