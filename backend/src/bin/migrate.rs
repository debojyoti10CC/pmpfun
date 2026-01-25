use anyhow::Result;
use sqlx::PgPool;
use stellar_pump_backend::config::Config;

#[tokio::main]
async fn main() -> Result<()> {
    // Load configuration
    let config = Config::from_env()?;
    
    // Connect to database
    let pool = PgPool::connect(&config.database_url).await?;
    
    // Run migrations
    println!("Running database migrations...");
    sqlx::migrate!("../database/migrations").run(&pool).await?;
    
    println!("✅ Migrations completed successfully!");
    
    Ok(())
}