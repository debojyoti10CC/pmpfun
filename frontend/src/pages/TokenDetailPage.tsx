import React from 'react';
import { useParams } from 'react-router-dom';
import { TokenTradingCard } from '../components/TokenTradingCard';
import { CONTRACT_CONFIG } from '../config/contracts';

export const TokenDetailPage: React.FC = () => {
  const { tokenId } = useParams<{ tokenId: string }>();

  // For demo purposes, use the tokenId as the token identifier
  // In a real app, you'd fetch the token info from your backend
  const actualTokenId = tokenId || 'DEMO';

  return (
    <div className="max-w-7xl mx-auto neo-grid">
      {/* Token Header */}
      <div className="neo-card p-8">
        <div className="neo-flex justify-between items-start mb-8 flex-wrap">
          <div>
            <h1 className="neo-title text-5xl mb-4">TOKEN DETAILS</h1>
            <p className="neo-subtitle text-2xl mb-4">TOKEN ID: {actualTokenId}</p>
            <p className="neo-text font-neo-mono text-lg">
              Real-time token information loaded from the deployed contract
            </p>
          </div>

          <div className="neo-card p-4 bg-neo-blue">
            <span className="neo-subtitle text-lg text-neo-white">
              📈 LIVE CONTRACT DATA
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trading Interface */}
        <div>
          <TokenTradingCard tokenId={actualTokenId} />
        </div>

        {/* Additional Information */}
        <div className="space-y-8">
          {/* Contract Information */}
          <div className="neo-card neo-card-pink p-6">
            <h3 className="neo-subtitle text-2xl mb-6 text-neo-white">CONTRACT INFORMATION</h3>

            <div className="space-y-4 neo-text font-neo-mono text-neo-white">
              <div className="neo-flex justify-between">
                <span>TOKEN ID:</span>
                <span className="bg-neo-white text-neo-black px-2 py-1 border-2 border-neo-black font-neo-mono text-xs">
                  {actualTokenId}
                </span>
              </div>
              <div className="neo-flex justify-between">
                <span>CONTRACT:</span>
                <span className="bg-neo-white text-neo-black px-2 py-1 border-2 border-neo-black font-neo-mono text-xs">
                  {CONTRACT_CONFIG.LAUNCHPAD_CONTRACT_ID.slice(0, 8)}...{CONTRACT_CONFIG.LAUNCHPAD_CONTRACT_ID.slice(-8)}
                </span>
              </div>
              <div className="neo-flex justify-between">
                <span>NETWORK:</span>
                <span className="bg-neo-yellow text-neo-black px-2 py-1 border-2 border-neo-black">TESTNET</span>
              </div>
              <div className="neo-flex justify-between">
                <span>PLATFORM FEE:</span>
                <span className="bg-neo-cyan text-neo-black px-2 py-1 border-2 border-neo-black">1%</span>
              </div>
              <div className="neo-flex justify-between">
                <span>GRADUATION THRESHOLD:</span>
                <span className="bg-neo-green text-neo-black px-2 py-1 border-2 border-neo-black">85,000 XLM</span>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="neo-card neo-card-cyan p-6">
            <h3 className="neo-subtitle text-2xl mb-6">HOW IT WORKS</h3>
            <ol className="neo-text font-neo-mono space-y-3">
              <li>1. TOKENS ARE CREATED WITH A FIXED SUPPLY</li>
              <li>2. USERS BUY TOKENS AT INCREASING PRICES VIA BONDING CURVE</li>
              <li>3. WHEN GRADUATION THRESHOLD IS REACHED, TOKEN MOVES TO DEX</li>
              <li>4. FREE MARKET TRADING BEGINS WITH NO MORE BONDING CURVE</li>
            </ol>
          </div>

          {/* Security Features */}
          <div className="neo-card neo-card-yellow p-6">
            <h3 className="neo-subtitle text-2xl mb-6">🔒 SECURITY FEATURES</h3>
            <ul className="neo-text font-neo-mono space-y-3">
              <li>• IMMUTABLE SMART CONTRACT</li>
              <li>• NO ADMIN WITHDRAWAL FUNCTIONS</li>
              <li>• TRANSPARENT BONDING CURVE MATHEMATICS</li>
              <li>• AUTOMATIC DEX GRADUATION</li>
              <li>• NO RUG-PULL POSSIBILITY</li>
            </ul>
          </div>

          {/* Links */}
          <div className="neo-card p-6 bg-neo-orange">
            <h3 className="neo-subtitle text-2xl mb-6 text-neo-white">EXTERNAL LINKS</h3>
            <div className="space-y-4">
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_CONFIG.LAUNCHPAD_CONTRACT_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-btn neo-btn-primary w-full block text-center"
              >
                VIEW CONTRACT ON STELLAR EXPERT
              </a>
              <a
                href={`https://lab.stellar.org/r/testnet/contract/${CONTRACT_CONFIG.LAUNCHPAD_CONTRACT_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="neo-btn neo-btn-secondary w-full block text-center"
              >
                VIEW CONTRACT ON STELLAR LAB
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};