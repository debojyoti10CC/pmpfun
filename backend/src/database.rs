use anyhow::Result;
use chrono::{DateTime, Utc};
use sqlx::{PgPool, Row};
use uuid::Uuid;

use crate::models::*;

#[derive(Clone)]
pub struct Database {
    pool: PgPool,
}

impl Database {
    pub async fn new(database_url: &str) -> Result<Self> {
        let pool = PgPool::connect(database_url).await?;
        Ok(Database { pool })
    }

    pub async fn run_migrations(&self) -> Result<()> {
        sqlx::migrate!("../database/migrations").run(&self.pool).await?;
        Ok(())
    }

    // Token operations
    pub async fn create_token(&self, token: &Token) -> Result<()> {
        sqlx::query!(
            r#"
            INSERT INTO tokens (
                id, asset_code, issuer_address, distribution_address, contract_address,
                creator_address, name, symbol, image_url, description, total_supply,
                tokens_sold, xlm_raised, current_price, launch_threshold_xlm,
                launch_threshold_percent, is_launched, launched_at, curve_type,
                base_price, price_multiplier, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20, $21, $22, $23
            )
            "#,
            token.id,
            token.asset_code,
            token.issuer_address,
            token.distribution_address,
            token.contract_address,
            token.creator_address,
            token.name,
            token.symbol,
            token.image_url,
            token.description,
            token.total_supply,
            token.tokens_sold,
            token.xlm_raised,
            token.current_price,
            token.launch_threshold_xlm,
            token.launch_threshold_percent,
            token.is_launched,
            token.launched_at,
            token.curve_type,
            token.base_price,
            token.price_multiplier,
            token.created_at,
            token.updated_at,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_token_by_address(&self, asset_address: &str) -> Result<Option<Token>> {
        let token = sqlx::query_as!(
            Token,
            "SELECT * FROM tokens WHERE issuer_address = $1",
            asset_address
        )
        .fetch_optional(&self.pool)
        .await?;

        Ok(token)
    }

    pub async fn update_token_state(
        &self,
        token_id: Uuid,
        tokens_sold: i64,
        xlm_raised: i64,
        current_price: i64,
        is_launched: bool,
        launched_at: Option<DateTime<Utc>>,
    ) -> Result<()> {
        sqlx::query!(
            r#"
            UPDATE tokens 
            SET tokens_sold = $2, xlm_raised = $3, current_price = $4, 
                is_launched = $5, launched_at = $6, updated_at = NOW()
            WHERE id = $1
            "#,
            token_id,
            tokens_sold,
            xlm_raised,
            current_price,
            is_launched,
            launched_at,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    // Purchase operations
    pub async fn create_purchase(&self, purchase: &Purchase) -> Result<()> {
        sqlx::query!(
            r#"
            INSERT INTO purchases (
                id, token_id, buyer_address, xlm_amount, tokens_received,
                price_per_token, transaction_hash, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            "#,
            purchase.id,
            purchase.token_id,
            purchase.buyer_address,
            purchase.xlm_amount,
            purchase.tokens_received,
            purchase.price_per_token,
            purchase.transaction_hash,
            purchase.created_at,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    // Holder operations
    pub async fn upsert_holder(
        &self,
        token_id: Uuid,
        holder_address: &str,
        balance_change: i64,
        purchase_amount: i64,
    ) -> Result<()> {
        sqlx::query!(
            r#"
            INSERT INTO holders (token_id, holder_address, balance, first_purchase_at, last_purchase_at, total_purchased)
            VALUES ($1, $2, $3, NOW(), NOW(), $4)
            ON CONFLICT (token_id, holder_address)
            DO UPDATE SET
                balance = holders.balance + $3,
                last_purchase_at = NOW(),
                total_purchased = holders.total_purchased + $4
            "#,
            token_id,
            holder_address,
            balance_change,
            purchase_amount,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    // Metrics operations
    pub async fn update_token_metrics(&self, token_id: Uuid) -> Result<()> {
        // Calculate holder count
        let holder_count: i64 = sqlx::query_scalar!(
            "SELECT COUNT(*) FROM holders WHERE token_id = $1 AND balance > 0",
            token_id
        )
        .fetch_one(&self.pool)
        .await?;

        // Calculate 24h volume
        let volume_24h: Option<i64> = sqlx::query_scalar!(
            r#"
            SELECT COALESCE(SUM(xlm_amount), 0) 
            FROM purchases 
            WHERE token_id = $1 AND created_at > NOW() - INTERVAL '24 hours'
            "#,
            token_id
        )
        .fetch_one(&self.pool)
        .await?;

        // Calculate 7d volume
        let volume_7d: Option<i64> = sqlx::query_scalar!(
            r#"
            SELECT COALESCE(SUM(xlm_amount), 0) 
            FROM purchases 
            WHERE token_id = $1 AND created_at > NOW() - INTERVAL '7 days'
            "#,
            token_id
        )
        .fetch_one(&self.pool)
        .await?;

        // Calculate total volume
        let volume_total: Option<i64> = sqlx::query_scalar!(
            "SELECT COALESCE(SUM(xlm_amount), 0) FROM purchases WHERE token_id = $1",
            token_id
        )
        .fetch_one(&self.pool)
        .await?;

        // Calculate 24h purchase count
        let purchases_24h: i64 = sqlx::query_scalar!(
            r#"
            SELECT COUNT(*) 
            FROM purchases 
            WHERE token_id = $1 AND created_at > NOW() - INTERVAL '24 hours'
            "#,
            token_id
        )
        .fetch_one(&self.pool)
        .await?;

        // Calculate price change (simplified - using first and last purchase in 24h)
        let price_change_24h = self.calculate_price_change_24h(token_id).await?;

        // Get current token info for market cap
        let token = sqlx::query!(
            "SELECT tokens_sold, current_price FROM tokens WHERE id = $1",
            token_id
        )
        .fetch_one(&self.pool)
        .await?;

        let market_cap = token.tokens_sold * token.current_price;

        // Upsert metrics
        sqlx::query!(
            r#"
            INSERT INTO token_metrics (
                token_id, holder_count, volume_24h, volume_7d, volume_total,
                purchases_24h, price_change_24h, market_cap, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT (token_id)
            DO UPDATE SET
                holder_count = $2,
                volume_24h = $3,
                volume_7d = $4,
                volume_total = $5,
                purchases_24h = $6,
                price_change_24h = $7,
                market_cap = $8,
                updated_at = NOW()
            "#,
            token_id,
            holder_count as i32,
            volume_24h.unwrap_or(0),
            volume_7d.unwrap_or(0),
            volume_total.unwrap_or(0),
            purchases_24h as i32,
            price_change_24h,
            market_cap,
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn calculate_price_change_24h(&self, token_id: Uuid) -> Result<f64> {
        let prices = sqlx::query!(
            r#"
            SELECT price_per_token, created_at
            FROM purchases 
            WHERE token_id = $1 AND created_at > NOW() - INTERVAL '24 hours'
            ORDER BY created_at ASC
            "#,
            token_id
        )
        .fetch_all(&self.pool)
        .await?;

        if prices.len() < 2 {
            return Ok(0.0);
        }

        let first_price = prices.first().unwrap().price_per_token as f64;
        let last_price = prices.last().unwrap().price_per_token as f64;

        if first_price == 0.0 {
            return Ok(0.0);
        }

        let change = ((last_price - first_price) / first_price) * 100.0;
        Ok(change)
    }

    // Query operations for API
    pub async fn get_tokens_list(
        &self,
        limit: i64,
        offset: i64,
        sort_by: &str,
    ) -> Result<Vec<TokenSummary>> {
        let order_clause = match sort_by {
            "newest" => "t.created_at DESC",
            "oldest" => "t.created_at ASC",
            "volume" => "COALESCE(tm.volume_24h, 0) DESC",
            "market_cap" => "COALESCE(tm.market_cap, 0) DESC",
            _ => "t.created_at DESC",
        };

        let query = format!(
            r#"
            SELECT 
                t.id, t.name, t.symbol, t.image_url, t.current_price,
                t.is_launched, t.created_at, t.tokens_sold, t.total_supply,
                t.xlm_raised, t.launch_threshold_xlm,
                COALESCE(tm.volume_24h, 0) as volume_24h,
                COALESCE(tm.price_change_24h, 0) as price_change_24h,
                COALESCE(tm.holder_count, 0) as holder_count,
                COALESCE(tm.market_cap, 0) as market_cap
            FROM tokens t
            LEFT JOIN token_metrics tm ON t.id = tm.token_id
            ORDER BY {}
            LIMIT $1 OFFSET $2
            "#,
            order_clause
        );

        let rows = sqlx::query(&query)
            .bind(limit)
            .bind(offset)
            .fetch_all(&self.pool)
            .await?;

        let tokens = rows
            .into_iter()
            .map(|row| {
                let tokens_sold: i64 = row.get("tokens_sold");
                let total_supply: i64 = row.get("total_supply");
                let xlm_raised: i64 = row.get("xlm_raised");
                let launch_threshold_xlm: i64 = row.get("launch_threshold_xlm");

                let launch_progress = if launch_threshold_xlm > 0 {
                    (xlm_raised as f64 / launch_threshold_xlm as f64 * 100.0).min(100.0)
                } else {
                    (tokens_sold as f64 / total_supply as f64 * 100.0).min(100.0)
                };

                TokenSummary {
                    id: row.get("id"),
                    name: row.get("name"),
                    symbol: row.get("symbol"),
                    image_url: row.get("image_url"),
                    current_price: row.get::<i64, _>("current_price").to_string(),
                    market_cap: row.get::<i64, _>("market_cap").to_string(),
                    volume_24h: row.get::<i64, _>("volume_24h").to_string(),
                    price_change_24h: row.get("price_change_24h"),
                    holder_count: row.get("holder_count"),
                    launch_progress,
                    is_launched: row.get("is_launched"),
                    created_at: row.get("created_at"),
                }
            })
            .collect();

        Ok(tokens)
    }

    pub async fn get_token_details(&self, token_id: Uuid) -> Result<Option<TokenDetails>> {
        let row = sqlx::query!(
            r#"
            SELECT 
                t.*, 
                COALESCE(tm.volume_24h, 0) as volume_24h,
                COALESCE(tm.price_change_24h, 0) as price_change_24h,
                COALESCE(tm.holder_count, 0) as holder_count,
                COALESCE(tm.market_cap, 0) as market_cap
            FROM tokens t
            LEFT JOIN token_metrics tm ON t.id = tm.token_id
            WHERE t.id = $1
            "#,
            token_id
        )
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            let launch_progress = if row.launch_threshold_xlm > 0 {
                (row.xlm_raised as f64 / row.launch_threshold_xlm as f64 * 100.0).min(100.0)
            } else {
                (row.tokens_sold as f64 / row.total_supply as f64 * 100.0).min(100.0)
            };

            Ok(Some(TokenDetails {
                id: row.id,
                name: row.name,
                symbol: row.symbol,
                image_url: row.image_url,
                description: row.description,
                current_price: row.current_price.to_string(),
                market_cap: row.market_cap.to_string(),
                volume_24h: row.volume_24h.to_string(),
                price_change_24h: row.price_change_24h,
                holder_count: row.holder_count,
                launch_progress,
                is_launched: row.is_launched,
                created_at: row.created_at,
                total_supply: row.total_supply.to_string(),
                tokens_sold: row.tokens_sold.to_string(),
                xlm_raised: row.xlm_raised.to_string(),
                launch_threshold_xlm: row.launch_threshold_xlm.to_string(),
                launch_threshold_percent: row.launch_threshold_percent,
                contract_address: row.contract_address,
                issuer_address: row.issuer_address,
                creator_address: row.creator_address,
                bonding_curve: BondingCurveInfo {
                    curve_type: row.curve_type,
                    base_price: row.base_price.to_string(),
                    price_multiplier: row.price_multiplier.to_string(),
                },
            }))
        } else {
            Ok(None)
        }
    }
}