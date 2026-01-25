import React from 'react';
import { useWallet } from '../hooks/useWallet';

interface WalletConnectorProps {
  className?: string;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({ className = '' }) => {
  const { 
    connection, 
    isConnected, 
    isConnecting, 
    error, 
    connectFreighter, 
    connectAlbedo, 
    disconnect 
  } = useWallet();

  if (isConnected && connection) {
    return (
      <div className={`neo-flex ${className}`}>
        <div className="neo-card p-4 bg-neo-green transform rotate-neo-1">
          <div className="neo-flex items-center">
            <div className="w-4 h-4 bg-neo-black rounded-full mr-3"></div>
            <span className="neo-text font-neo-mono font-bold">
              {connection.publicKey.slice(0, 4)}...{connection.publicKey.slice(-4)}
            </span>
            <span className="neo-text font-neo-mono text-sm ml-2 uppercase">
              {connection.walletType}
            </span>
          </div>
        </div>
        <button
          onClick={disconnect}
          className="neo-btn neo-btn-danger text-sm px-4 py-2"
        >
          DISCONNECT
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {error && (
        <div className="neo-card neo-card-pink p-4 transform rotate-neo-1">
          <p className="neo-text font-neo-mono text-neo-white">{error}</p>
        </div>
      )}
      
      <div className="neo-flex">
        <button
          onClick={connectFreighter}
          disabled={isConnecting}
          className="neo-btn neo-btn-info neo-shake"
        >
          {isConnecting ? (
            <div className="neo-flex items-center">
              <div className="w-5 h-5 border-4 border-neo-black border-t-transparent rounded-full animate-spin mr-3"></div>
              <span>CONNECTING...</span>
            </div>
          ) : (
            <div className="neo-flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm2 2a1 1 0 000 2h.01a1 1 0 100-2H5zm3 0a1 1 0 000 2h3a1 1 0 100-2H8z" clipRule="evenodd" />
              </svg>
              <span>FREIGHTER</span>
            </div>
          )}
        </button>

        <button
          onClick={connectAlbedo}
          disabled={isConnecting}
          className="neo-btn neo-btn-success neo-shake"
        >
          {isConnecting ? (
            <div className="neo-flex items-center">
              <div className="w-5 h-5 border-4 border-neo-black border-t-transparent rounded-full animate-spin mr-3"></div>
              <span>CONNECTING...</span>
            </div>
          ) : (
            <div className="neo-flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
              </svg>
              <span>ALBEDO</span>
            </div>
          )}
        </button>
      </div>

      <div className="neo-card p-4 bg-neo-yellow transform rotate-neo--1">
        <p className="neo-text font-neo-mono mb-3">CONNECT YOUR STELLAR WALLET TO CREATE AND TRADE TOKENS</p>
        <div className="neo-flex">
          <a 
            href="https://freighter.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="neo-btn text-sm px-4 py-2 bg-neo-cyan text-neo-black border-4 border-neo-black"
          >
            GET FREIGHTER
          </a>
          <a 
            href="https://albedo.link/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="neo-btn text-sm px-4 py-2 bg-neo-green text-neo-black border-4 border-neo-black"
          >
            USE ALBEDO
          </a>
        </div>
      </div>
    </div>
  );
};