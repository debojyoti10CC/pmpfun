import { useState, useEffect } from 'react';
import { walletManager, WalletConnection } from '../services/WalletService';

export interface UseWalletReturn {
  connection: WalletConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectFreighter: () => Promise<void>;
  connectAlbedo: () => Promise<void>;
  disconnect: () => void;
  publicKey: string | null;
  signTransaction: (xdr: string) => Promise<string>;
}

export function useWallet(): UseWalletReturn {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to connection changes
    const unsubscribe = walletManager.onConnectionChange((newConnection) => {
      setConnection(newConnection);
      if (newConnection) {
        setError(null);
      }
    });

    // Check initial connection state
    if (walletManager.isConnected()) {
      const publicKey = walletManager.getPublicKey();
      if (publicKey) {
        setConnection({
          publicKey,
          walletType: 'freighter' // Default assumption, could be improved
        });
      }
    }

    return unsubscribe;
  }, []);

  const connectFreighter = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      await walletManager.connectFreighter();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const connectAlbedo = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      await walletManager.connectAlbedo();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    walletManager.disconnect();
    setError(null);
  };

  const signTransaction = async (xdr: string): Promise<string> => {
    if (!connection) {
      throw new Error('Wallet not connected');
    }
    return await walletManager.signTransaction(xdr);
  };

  return {
    connection,
    isConnected: !!connection,
    isConnecting,
    error,
    connectFreighter,
    connectAlbedo,
    disconnect,
    publicKey: connection?.publicKey || null,
    signTransaction,
  };
}