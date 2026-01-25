import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CONTRACT_CONFIG } from '../config/contracts';

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'trending' | 'launched'>('new');

  // Mock data for demonstration
  const mockTokens = [
    {
      id: '1',
      name: 'Moon Coin',
      symbol: 'MOON',
      currentPrice: '0.001',
      marketCap: '50,000',
      volume24h: '5,000',
      priceChange24h: 15.5,
      holderCount: 42,
      launchProgress: 65,
      isLaunched: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Rocket Token',
      symbol: 'ROCKET',
      currentPrice: '0.005',
      marketCap: '125,000',
      volume24h: '12,000',
      priceChange24h: -5.2,
      holderCount: 89,
      launchProgress: 100,
      isLaunched: true,
      createdAt: new Date().toISOString(),
    },
  ];

  return (
    <div className="neo-grid max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="neo-card neo-card-yellow p-12 text-center">
        <h1 className="neo-title mb-8">
          FAIR LAUNCH<br />
          TOKENS ON<br />
          <span className="text-neo-pink">STELLAR</span>
        </h1>
        <p className="neo-subtitle mb-12 text-neo-black">
          CREATE AND TRADE MEMECOINS WITH<br />
          MATHEMATICAL RUG-PULL PROTECTION
        </p>
        <div className="neo-flex justify-center flex-wrap">
          <Link 
            to="/create" 
            className="neo-btn neo-btn-primary"
          >
            CREATE TOKEN
          </Link>
          <button className="neo-btn neo-btn-info">
            LEARN MORE
          </button>
        </div>
      </div>

      {/* Contract Status Section */}
      <div className="neo-card neo-card-green p-8">
        <h2 className="neo-subtitle text-2xl mb-6">🚀 CONTRACT DEPLOYED & LIVE</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="neo-text font-neo-mono mb-4">
              <strong>CONTRACT ADDRESS:</strong><br />
              <span className="bg-neo-white text-neo-black px-2 py-1 border-2 border-neo-black font-mono text-sm">
                {CONTRACT_CONFIG.LAUNCHPAD_CONTRACT_ID}
              </span>
            </p>
            <p className="neo-text font-neo-mono mb-4">
              <strong>NETWORK:</strong> {CONTRACT_CONFIG.CURRENT_NETWORK}
            </p>
            <p className="neo-text font-neo-mono">
              <strong>STATUS:</strong> <span className="text-green-800">ACTIVE & READY</span>
            </p>
          </div>
          <div>
            <Link 
              to={`/token/${CONTRACT_CONFIG.LAUNCHPAD_CONTRACT_ID}`}
              className="neo-btn neo-btn-primary w-full mb-4"
            >
              TEST THE CONTRACT
            </Link>
            <a
              href={`https://stellar.expert/explorer/testnet/contract/${CONTRACT_CONFIG.LAUNCHPAD_CONTRACT_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="neo-btn neo-btn-secondary w-full"
            >
              VIEW ON STELLAR EXPERT
            </a>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="neo-card neo-card-cyan p-8 text-center">
          <div className="neo-title text-4xl mb-4">0</div>
          <div className="neo-subtitle text-lg">TOTAL TOKENS</div>
        </div>
        <div className="neo-card neo-card-pink p-8 text-center">
          <div className="neo-title text-4xl mb-4 text-neo-white">0 XLM</div>
          <div className="neo-subtitle text-lg text-neo-white">TOTAL VOLUME</div>
        </div>
        <div className="neo-card p-8 text-center bg-neo-green">
          <div className="neo-title text-4xl mb-4">0</div>
          <div className="neo-subtitle text-lg">ACTIVE TRADERS</div>
        </div>
        <div className="neo-card p-8 text-center bg-neo-orange">
          <div className="neo-title text-4xl mb-4 text-neo-white">0</div>
          <div className="neo-subtitle text-lg text-neo-white">TOKENS LAUNCHED</div>
        </div>
      </div>

      {/* Token List */}
      <div className="neo-card p-8">
        <div className="neo-flex justify-between items-center mb-8 flex-wrap">
          <h2 className="neo-title text-4xl">TOKENS</h2>
          
          {/* Tab Navigation */}
          <div className="neo-flex bg-neo-black p-2">
            {[
              { key: 'new', label: 'NEW', color: 'neo-yellow' },
              { key: 'trending', label: 'TRENDING', color: 'neo-pink' },
              { key: 'launched', label: 'LAUNCHED', color: 'neo-cyan' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`neo-btn text-sm px-6 py-3 ${
                  activeTab === tab.key
                    ? `bg-${tab.color} text-neo-black`
                    : 'bg-neo-white text-neo-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Token Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockTokens.map((token) => (
            <Link
              key={token.id}
              to={`/token/${token.id}`}
              className="neo-card p-6 block hover:scale-105 transition-transform duration-200"
            >
              <div className="neo-flex justify-between items-start mb-6">
                <div>
                  <h3 className="neo-subtitle text-2xl mb-2">{token.name}</h3>
                  <p className="neo-text font-neo-mono text-lg">${token.symbol}</p>
                </div>
                <div className={`px-4 py-2 border-4 border-neo-black font-neo font-black text-sm ${
                  token.isLaunched 
                    ? 'bg-neo-green text-neo-black' 
                    : 'bg-neo-blue text-neo-white'
                }`}>
                  {token.isLaunched ? 'LAUNCHED' : 'BONDING CURVE'}
                </div>
              </div>

              <div className="space-y-4 neo-text font-neo-mono">
                <div className="neo-flex justify-between">
                  <span className="font-bold">PRICE:</span>
                  <span className="bg-neo-yellow px-2 py-1 border-2 border-neo-black">{token.currentPrice} XLM</span>
                </div>
                <div className="neo-flex justify-between">
                  <span className="font-bold">MARKET CAP:</span>
                  <span className="bg-neo-cyan px-2 py-1 border-2 border-neo-black">{token.marketCap} XLM</span>
                </div>
                <div className="neo-flex justify-between">
                  <span className="font-bold">24H VOLUME:</span>
                  <span className="bg-neo-pink px-2 py-1 border-2 border-neo-black text-neo-white">{token.volume24h} XLM</span>
                </div>
                <div className="neo-flex justify-between">
                  <span className="font-bold">HOLDERS:</span>
                  <span className="bg-neo-green px-2 py-1 border-2 border-neo-black">{token.holderCount}</span>
                </div>
              </div>

              {!token.isLaunched && (
                <div className="mt-6">
                  <div className="neo-flex justify-between neo-text font-neo-mono font-bold mb-2">
                    <span>LAUNCH PROGRESS</span>
                    <span>{token.launchProgress}%</span>
                  </div>
                  <div className="neo-progress">
                    <div 
                      className="neo-progress-bar"
                      style={{ width: `${token.launchProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {mockTokens.length === 0 && (
          <div className="text-center py-16">
            <div className="neo-title text-6xl mb-8 text-neo-black">NO TOKENS FOUND</div>
            <p className="neo-subtitle mb-12">BE THE FIRST TO CREATE A TOKEN ON STELLAR PUMP!</p>
            <Link 
              to="/create" 
              className="neo-btn neo-btn-primary"
            >
              CREATE FIRST TOKEN
            </Link>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="neo-card neo-card-cyan p-8 text-center">
          <div className="w-16 h-16 bg-neo-black border-4 border-neo-black neo-shadow mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-neo-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.4 7 14.8 8.6 14.8 10V11.5C15.4 11.5 16 12.4 16 13V16C16 17.4 15.4 18 14.8 18H9.2C8.6 18 8 17.4 8 16V13C8 12.4 8.6 11.5 9.2 11.5V10C9.2 8.6 10.6 7 12 7M12 8.2C11.2 8.2 10.5 8.7 10.5 10V11.5H13.5V10C13.5 8.7 12.8 8.2 12 8.2Z"/>
            </svg>
          </div>
          <h3 className="neo-subtitle text-xl mb-4">RUG-PULL PROOF</h3>
          <p className="neo-text font-neo-mono">MATHEMATICAL GUARANTEES PREVENT TOKEN CREATORS FROM STEALING FUNDS OR MINTING MORE SUPPLY.</p>
        </div>

        <div className="neo-card neo-card-pink p-8 text-center">
          <div className="w-16 h-16 bg-neo-white border-4 border-neo-black neo-shadow mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-neo-black" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z"/>
            </svg>
          </div>
          <h3 className="neo-subtitle text-xl mb-4 text-neo-white">FAIR LAUNCH</h3>
          <p className="neo-text font-neo-mono text-neo-white">BONDING CURVE ENSURES FAIR PRICE DISCOVERY WITH NO PRE-SALES OR INSIDER ALLOCATIONS.</p>
        </div>

        <div className="neo-card p-8 text-center bg-neo-green">
          <div className="w-16 h-16 bg-neo-black border-4 border-neo-black neo-shadow mx-auto mb-6 flex items-center justify-center">
            <svg className="w-8 h-8 text-neo-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M11,6V14L17.25,17.15L18.5,15.25L13,12.5V6H11Z"/>
            </svg>
          </div>
          <h3 className="neo-subtitle text-xl mb-4">AUTO DEX LAUNCH</h3>
          <p className="neo-text font-neo-mono">TOKENS AUTOMATICALLY LAUNCH ON STELLAR DEX WHEN CONDITIONS ARE MET FOR FREE MARKET TRADING.</p>
        </div>
      </div>
    </div>
  );
};