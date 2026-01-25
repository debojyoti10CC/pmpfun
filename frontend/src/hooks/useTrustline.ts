import { useState, useEffect } from 'react';
import { trustlineService, TrustlineInfo, TrustlineResult } from '../services/TrustlineService';
import { useWallet } from './useWallet';

export interface UseTrustlineReturn {
  trustlineInfo: TrustlineInfo | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
  createTrustline: () => Promise<TrustlineResult>;
  removeTrustline: () => Promise<TrustlineResult>;
  checkTrustline: () => Promise<void>;
  ensureTrustline: () => Promise<TrustlineResult>;
}

export function useTrustline(
  assetCode: string,
  assetIssuer: string
): UseTrustlineReturn {
  const { publicKey, isConnected } = useWallet();
  const [trustlineInfo, setTrustlineInfo] = useState<TrustlineInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkTrustline = async () => {
    if (!publicKey || !assetCode || !assetIssuer) {
      setTrustlineInfo(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const info = await trustlineService.checkTrustline(publicKey, assetCode, assetIssuer);
      setTrustlineInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check trustline');
      setTrustlineInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const createTrustline = async (): Promise<TrustlineResult> => {
    if (!assetCode || !assetIssuer) {
      return {
        success: false,
        error: 'Invalid asset parameters'
      };
    }

    setIsCreating(true);
    setError(null);

    try {
      const result = await trustlineService.createTrustline(assetCode, assetIssuer);
      
      if (result.success) {
        // Refresh trustline info after successful creation
        await checkTrustline();
      } else {
        setError(result.error || 'Failed to create trustline');
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create trustline';
      setError(error);
      return {
        success: false,
        error
      };
    } finally {
      setIsCreating(false);
    }
  };

  const removeTrustline = async (): Promise<TrustlineResult> => {
    if (!assetCode || !assetIssuer) {
      return {
        success: false,
        error: 'Invalid asset parameters'
      };
    }

    setIsCreating(true);
    setError(null);

    try {
      const result = await trustlineService.removeTrustline(assetCode, assetIssuer);
      
      if (result.success) {
        // Refresh trustline info after successful removal
        await checkTrustline();
      } else {
        setError(result.error || 'Failed to remove trustline');
      }

      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to remove trustline';
      setError(error);
      return {
        success: false,
        error
      };
    } finally {
      setIsCreating(false);
    }
  };

  const ensureTrustline = async (): Promise<TrustlineResult> => {
    if (!assetCode || !assetIssuer) {
      return {
        success: false,
        error: 'Invalid asset parameters'
      };
    }

    // If trustline already exists, return success
    if (trustlineInfo?.exists) {
      return {
        success: true,
        error: 'Trustline already exists'
      };
    }

    // Otherwise, create it
    return await createTrustline();
  };

  // Check trustline when wallet connects or asset changes
  useEffect(() => {
    if (isConnected && publicKey && assetCode && assetIssuer) {
      checkTrustline();
    } else {
      setTrustlineInfo(null);
    }
  }, [publicKey, isConnected, assetCode, assetIssuer]);

  return {
    trustlineInfo,
    isLoading,
    isCreating,
    error,
    createTrustline,
    removeTrustline,
    checkTrustline,
    ensureTrustline,
  };
}