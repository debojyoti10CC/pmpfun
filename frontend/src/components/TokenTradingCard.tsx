import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { contractService, TokenInfo, BondingCurveInfo } from '../services/ContractService';

interface TokenTradingCardProps {
  tokenId: string;
}

export const TokenTradingCard: React.FC<TokenTradingCardProps> = ({ tokenId }) => {
  const { isConnected, publicKey, signTransaction } = useWallet();
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [trading, setTrading] = useState(false);
  const [xlmAmount, setXlmAmount] = useState('');

  useEffect(() => {
    loadTokenData();
  }, [tokenId]);

  const loadTokenData = async () => {
    setLoading(true);
    try {
      const token = await contractService.getTokenInfo(tokenId);
      setTokenInfo(token);
    } catch (error) {
      console.error('Error loading token data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = async () => {
    if (!isConnected || !publicKey || !tokenInfo) {
      alert('Please connect your wallet first');
      return;
    }

    if (!xlmAmount) {
      alert('Please enter XLM amount');
      return;
    }

    setTrading(true);
    try {
      const xlm = parseFloat(xlmAmount);
      const transactionXDR = await contractService.buyTokens(tokenId, xlm, publicKey);

      const signedXDR = await signTransaction(transactionXDR);
      
      if (signedXDR) {
        console.log('Buy transaction signed:', signedXDR);
        alert('Buy order submitted successfully!');
        
        // Reload token data
        await loadTokenData();
        
        // Clear form
        setXlmAmount('');
      }
    } catch (error) {
      console.error('Error executing trade:', error);
      alert(`Failed to buy tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTrading(false);
    }
  };

  const calculateEstimate = () => {
    if (!tokenInfo || !xlmAmount) return 0;
    
    const xlm = parseFloat(xlmAmount);
    // Simple linear calculation based on current price
    return xlm / tokenInfo.currentPrice;
  };

  if (loading) {
    return (
      <div className="neo-card p-6">
        <div className="neo-flex justify-center">
          <div className="w-8 h-8 border-4 border-neo-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!tokenInfo) {
    return (
      <div className="neo-card neo-card-red p-6">
        <p className="neo-text">Failed to load token information</p>
      </div>
    );
  }

  const estimate = calculateEstimate();

  return (
    <div className="neo-card p-6">
      <h3 className="neo-subtitle text-2xl mb-6">TRADE {tokenInfo.symbol}</h3>

      {/* Token Info */}
      <div className="neo-card neo-card-cyan p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="neo-text font-neo-mono">CURRENT PRICE</p>
            <p className="neo-subtitle text-lg">{tokenInfo.currentPrice.toFixed(8)} XLM</p>
          </div>
          <div>
            <p className="neo-text font-neo-mono">TOTAL RAISED</p>
            <p className="neo-subtitle text-lg">{tokenInfo.xlmRaised.toFixed(2)} XLM</p>
          </div>
          <div>
            <p className="neo-text font-neo-mono">TOKENS SOLD</p>
            <p className="neo-subtitle text-lg">{tokenInfo.tokensSold.toLocaleString()}</p>
          </div>
          <div>
            <p className="neo-text font-neo-mono">STATUS</p>
            <p className={`neo-subtitle text-lg ${tokenInfo.isLaunched ? 'text-green-600' : 'text-yellow-600'}`}>
              {tokenInfo.isLaunched ? 'LAUNCHED' : 'BONDING CURVE'}
            </p>
          </div>
        </div>
      </div>

      {/* Trading Interface */}
      {!tokenInfo.isLaunched && (
        <div className="space-y-6">
          {/* Buy Form */}
          <div className="space-y-4">
            <div>
              <label className="neo-subtitle text-lg mb-3 block">
                XLM AMOUNT
              </label>
              <input
                type="number"
                value={xlmAmount}
                onChange={(e) => setXlmAmount(e.target.value)}
                className="neo-input w-full"
                placeholder="0.0"
                min="0"
                step="0.1"
              />
              {estimate > 0 && (
                <p className="neo-text font-neo-mono mt-2">
                  ≈ {estimate.toFixed(2)} {tokenInfo.symbol}
                </p>
              )}
            </div>

            <button
              onClick={handleTrade}
              disabled={!isConnected || trading || !xlmAmount}
              className="neo-btn neo-btn-success w-full text-lg py-4"
            >
              {trading ? (
                <div className="neo-flex justify-center">
                  <div className="w-6 h-6 border-4 border-neo-black border-t-transparent rounded-full animate-spin mr-4"></div>
                  <span>PROCESSING...</span>
                </div>
              ) : (
                `BUY ${tokenInfo.symbol}`
              )}
            </button>

            {!isConnected && (
              <p className="neo-text font-neo-mono text-center">
                CONNECT YOUR WALLET TO TRADE
              </p>
            )}
          </div>
        </div>
      )}

      {/* Launched Message */}
      {tokenInfo.isLaunched && (
        <div className="neo-card neo-card-green p-4">
          <p className="neo-subtitle text-lg mb-2">🎉 TOKEN LAUNCHED!</p>
          <p className="neo-text font-neo-mono">
            This token has reached the launch threshold and is now trading on Stellar DEX.
          </p>
        </div>
      )}
    </div>
  );
};