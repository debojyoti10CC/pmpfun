import React, { useState, useEffect } from 'react';
import { isConnected, isAllowed } from '@stellar/freighter-api';

export const FreighterDebug: React.FC = () => {
  const [freighterStatus, setFreighterStatus] = useState<{
    detected: boolean;
    connected?: boolean;
    isAllowed?: boolean;
    error?: string;
  }>({ detected: false });

  useEffect(() => {
    const checkFreighter = async () => {
      try {
        // Check if Freighter is installed and connected
        const connected = await isConnected();
        
        if (connected) {
          try {
            const allowed = await isAllowed();
            setFreighterStatus({
              detected: true,
              connected: true,
              isAllowed: allowed,
            });
          } catch (error: any) {
            setFreighterStatus({
              detected: true,
              connected: true,
              error: error.message,
            });
          }
        } else {
          setFreighterStatus({
            detected: false,
            connected: false,
            error: 'Freighter not installed or not connected'
          });
        }
      } catch (error: any) {
        setFreighterStatus({
          detected: false,
          error: error.message
        });
      }
    };

    checkFreighter();
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-sm max-w-xs">
      <h4 className="font-bold mb-2">Freighter Debug</h4>
      <div className="space-y-1">
        <div>Detected: {freighterStatus.detected ? '✅' : '❌'}</div>
        {freighterStatus.connected !== undefined && (
          <div>Connected: {freighterStatus.connected ? '✅' : '❌'}</div>
        )}
        {freighterStatus.isAllowed !== undefined && (
          <div>Allowed: {freighterStatus.isAllowed ? '✅' : '❌'}</div>
        )}
        {freighterStatus.error && (
          <div className="text-red-300 text-xs">Error: {freighterStatus.error}</div>
        )}
        <div className="text-xs text-gray-400 mt-2">
          Using @stellar/freighter-api
        </div>
      </div>
    </div>
  );
};