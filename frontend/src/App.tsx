import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Header } from './components/Header';
import { FreighterDebug } from './components/FreighterDebug';
import { LandingPage } from './pages/LandingPage';
import { TokenCreationPage } from './pages/TokenCreationPage';
import { TokenDetailPage } from './pages/TokenDetailPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="neo-container">
          {/* Neobrutalist Header */}
          <header className="neo-header">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="neo-flex justify-between items-center">
                <div>
                  <h1 className="neo-title text-white" style={{ textShadow: '4px 4px 0px #ffff00' }}>
                    STELLAR PUMP
                  </h1>
                  <p className="neo-text text-yellow-400 mt-2 font-mono">
                    &gt; FAIR LAUNCH MEMECOIN PLATFORM_
                  </p>
                </div>
                <Header />
              </div>
            </div>
          </header>

          {/* Navigation */}
          <nav className="bg-yellow-400 border-b-4 border-black p-4">
            <div className="max-w-7xl mx-auto">
              <div className="neo-flex gap-6">
                <a 
                  href="/" 
                  className="neo-btn neo-btn-primary text-sm py-2 px-4 no-underline"
                >
                  HOME
                </a>
                <a 
                  href="/create" 
                  className="neo-btn neo-btn-success text-sm py-2 px-4 no-underline"
                >
                  CREATE TOKEN
                </a>
                <div className="neo-text font-mono ml-auto">
                  &gt; BUILDING THE FUTURE OF FAIR LAUNCHES_
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="min-h-screen bg-white p-4 md:p-8">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/create" element={<TokenCreationPage />} />
              <Route path="/token/:tokenId" element={<TokenDetailPage />} />
            </Routes>
          </main>

          {/* Neobrutalist Footer */}
          <footer className="bg-black text-white border-t-8 border-cyan-400 p-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="neo-subtitle text-cyan-400 mb-4">STELLAR PUMP</h3>
                  <p className="neo-text text-white">
                    The most brutal fair launch platform on Stellar. No rugs, no scams, just pure mathematical guarantees.
                  </p>
                </div>
                <div>
                  <h3 className="neo-subtitle text-yellow-400 mb-4">FEATURES</h3>
                  <ul className="neo-text text-white space-y-2">
                    <li>&gt; Immutable issuer accounts</li>
                    <li>&gt; Bonding curve mathematics</li>
                    <li>&gt; Automatic DEX transition</li>
                    <li>&gt; Zero rug-pull possibility</li>
                  </ul>
                </div>
                <div>
                  <h3 className="neo-subtitle text-pink-400 mb-4">NETWORK</h3>
                  <p className="neo-text text-white">
                    Built on Stellar blockchain with Soroban smart contracts. Testnet deployment ready.
                  </p>
                </div>
              </div>
              <div className="border-t-4 border-white mt-8 pt-8 text-center">
                <p className="neo-text text-yellow-400 font-mono">
                  &gt; POWERED BY STELLAR BLOCKCHAIN &amp; SOROBAN SMART CONTRACTS_
                </p>
              </div>
            </div>
          </footer>

          <FreighterDebug />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;