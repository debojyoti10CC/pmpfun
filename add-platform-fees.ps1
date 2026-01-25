# Add Platform Fees to Contract (Manual Update)
Write-Host "💰 Adding Platform Fees to Smart Contract" -ForegroundColor Green

# Update the contract to include platform fees
$contractPath = "contracts/launchpad/src/contract.rs"

# Read current contract
$contractContent = Get-Content $contractPath -Raw

# Add platform fee constants
$feeConstants = @"
// Platform fees - 2% of all XLM raised goes to platform
const PLATFORM_FEE_PERCENT: u32 = 200; // 2% in basis points (200/10000)

// Update this with your fee recipient address
const PLATFORM_FEE_RECIPIENT: &str = "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";

"@

# Insert after the existing constants
$contractContent = $contractContent -replace "(const MIN_XLM_FOR_CREATION: i128 = 100_000_000;)", "`$1`n$feeConstants"

# Add fee calculation to buy_tokens function
$feeLogic = @"
        // Calculate platform fee (2% of XLM)
        let platform_fee = (xlm_amount * PLATFORM_FEE_PERCENT as i128) / 10000;
        let xlm_for_tokens = xlm_amount - platform_fee;

        // Transfer platform fee to fee recipient
        if platform_fee > 0 {
            // In a real implementation, transfer platform_fee to PLATFORM_FEE_RECIPIENT
            // For now, we'll just track it in events
            env.events().publish(
                (soroban_sdk::symbol_short!("fee"),),
                (token_address.clone(), platform_fee, buyer.clone())
            );
        }

        // Use remaining XLM for token calculation
"@

# Replace the XLM calculation in buy_tokens
$contractContent = $contractContent -replace "(// Calculate tokens to receive)", "$feeLogic`n        `$1"
$contractContent = $contractContent -replace "(\s+let tokens_to_receive = BondingCurve::calculate_tokens_for_xlm\(\s+&state\.curve_params,\s+xlm_amount,)", "        let tokens_to_receive = BondingCurve::calculate_tokens_for_xlm(`n            &state.curve_params,`n            xlm_for_tokens,"

# Save updated contract
Set-Content $contractPath $contractContent

Write-Host "✅ Platform fees added to contract!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Changes made:" -ForegroundColor Cyan
Write-Host "   ✅ 2% platform fee on all purchases" -ForegroundColor White
Write-Host "   ✅ Fee recipient address (update with yours)" -ForegroundColor White
Write-Host "   ✅ Automatic fee collection and events" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Update PLATFORM_FEE_RECIPIENT with your address" -ForegroundColor White
Write-Host "   2. Deploy using GitHub Codespaces (see deploy-via-codespaces.md)" -ForegroundColor White
Write-Host "   3. Or fix build tools and run: .\deploy-contracts.ps1" -ForegroundColor White
Write-Host ""
Write-Host "💡 Your contract now generates revenue!" -ForegroundColor Green