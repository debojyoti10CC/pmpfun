import {
  Horizon,
  Networks,
  Operation,
  Asset,
  TransactionBuilder,
  Transaction,
  BASE_FEE
} from '@stellar/stellar-sdk';
import { walletManager } from './WalletService';

export interface TrustlineInfo {
  assetCode: string;
  assetIssuer: string;
  balance: string;
  limit: string;
  exists: boolean;
}

export interface TrustlineResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export class TrustlineService {
  private server: Horizon.Server;
  private networkPassphrase: string;

  constructor() {
    const isMainnet = process.env.REACT_APP_STELLAR_NETWORK === 'mainnet';
    this.server = new Horizon.Server(
      isMainnet 
        ? 'https://horizon.stellar.org'
        : 'https://horizon-testnet.stellar.org'
    );
    this.networkPassphrase = isMainnet ? Networks.PUBLIC : Networks.TESTNET;
  }

  /**
   * Check if account has trustline for specific asset
   */
  async checkTrustline(
    accountId: string, 
    assetCode: string, 
    assetIssuer: string
  ): Promise<TrustlineInfo> {
    try {
      const account = await this.server.loadAccount(accountId);
      
      const balance = account.balances.find((balance: any) => {
        if (balance.asset_type === 'native') return false;
        return balance.asset_code === assetCode && balance.asset_issuer === assetIssuer;
      });

      if (balance && balance.asset_type !== 'native') {
        return {
          assetCode,
          assetIssuer,
          balance: balance.balance,
          limit: balance.limit,
          exists: true
        };
      }

      return {
        assetCode,
        assetIssuer,
        balance: '0',
        limit: '0',
        exists: false
      };
    } catch (error) {
      console.error('Error checking trustline:', error);
      return {
        assetCode,
        assetIssuer,
        balance: '0',
        limit: '0',
        exists: false
      };
    }
  }

  /**
   * Create trustline for asset
   */
  async createTrustline(
    assetCode: string,
    assetIssuer: string,
    limit?: string
  ): Promise<TrustlineResult> {
    const publicKey = walletManager.getPublicKey();
    if (!publicKey) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }

    try {
      // Check if trustline already exists
      const trustlineInfo = await this.checkTrustline(publicKey, assetCode, assetIssuer);
      if (trustlineInfo.exists) {
        return {
          success: true,
          error: 'Trustline already exists'
        };
      }

      // Load account
      const account = await this.server.loadAccount(publicKey);
      
      // Create asset
      const asset = new Asset(assetCode, assetIssuer);
      
      // Build transaction
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(
          Operation.changeTrust({
            asset,
            limit: limit || undefined // undefined = maximum limit
          })
        )
        .setTimeout(30)
        .build();

      // Sign transaction
      const signedXdr = await walletManager.signTransaction(transaction.toXDR());
      const signedTransaction = new Transaction(signedXdr, this.networkPassphrase);

      // Submit transaction
      const result = await this.server.submitTransaction(signedTransaction);

      return {
        success: true,
        transactionHash: result.hash
      };

    } catch (error) {
      console.error('Error creating trustline:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create trustline'
      };
    }
  }

  /**
   * Remove trustline for asset (set limit to 0)
   */
  async removeTrustline(
    assetCode: string,
    assetIssuer: string
  ): Promise<TrustlineResult> {
    const publicKey = walletManager.getPublicKey();
    if (!publicKey) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }

    try {
      // Check if trustline exists and has zero balance
      const trustlineInfo = await this.checkTrustline(publicKey, assetCode, assetIssuer);
      if (!trustlineInfo.exists) {
        return {
          success: false,
          error: 'Trustline does not exist'
        };
      }

      if (parseFloat(trustlineInfo.balance) > 0) {
        return {
          success: false,
          error: 'Cannot remove trustline with non-zero balance'
        };
      }

      // Load account
      const account = await this.server.loadAccount(publicKey);
      
      // Create asset
      const asset = new Asset(assetCode, assetIssuer);
      
      // Build transaction to remove trustline
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(
          Operation.changeTrust({
            asset,
            limit: '0' // Setting limit to 0 removes the trustline
          })
        )
        .setTimeout(30)
        .build();

      // Sign transaction
      const signedXdr = await walletManager.signTransaction(transaction.toXDR());
      const signedTransaction = new Transaction(signedXdr, this.networkPassphrase);

      // Submit transaction
      const result = await this.server.submitTransaction(signedTransaction);

      return {
        success: true,
        transactionHash: result.hash
      };

    } catch (error) {
      console.error('Error removing trustline:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove trustline'
      };
    }
  }

  /**
   * Get all trustlines for account
   */
  async getAllTrustlines(accountId: string): Promise<TrustlineInfo[]> {
    try {
      const account = await this.server.loadAccount(accountId);
      
      return account.balances
        .filter((balance: any) => balance.asset_type !== 'native')
        .map((balance: any) => ({
          assetCode: balance.asset_code!,
          assetIssuer: balance.asset_issuer!,
          balance: balance.balance,
          limit: balance.limit,
          exists: true
        }));
    } catch (error) {
      console.error('Error getting trustlines:', error);
      return [];
    }
  }

  /**
   * Automatically create trustline if needed before token purchase
   */
  async ensureTrustline(
    assetCode: string,
    assetIssuer: string
  ): Promise<TrustlineResult> {
    const publicKey = walletManager.getPublicKey();
    if (!publicKey) {
      return {
        success: false,
        error: 'Wallet not connected'
      };
    }

    // Check if trustline already exists
    const trustlineInfo = await this.checkTrustline(publicKey, assetCode, assetIssuer);
    
    if (trustlineInfo.exists) {
      return {
        success: true,
        error: 'Trustline already exists'
      };
    }

    // Create trustline automatically
    return await this.createTrustline(assetCode, assetIssuer);
  }

  /**
   * Get asset balance for account
   */
  async getAssetBalance(
    accountId: string,
    assetCode: string,
    assetIssuer: string
  ): Promise<string> {
    const trustlineInfo = await this.checkTrustline(accountId, assetCode, assetIssuer);
    return trustlineInfo.balance;
  }

  /**
   * Check if account can receive asset (has trustline with sufficient limit)
   */
  async canReceiveAsset(
    accountId: string,
    assetCode: string,
    assetIssuer: string,
    amount: string
  ): Promise<boolean> {
    const trustlineInfo = await this.checkTrustline(accountId, assetCode, assetIssuer);
    
    if (!trustlineInfo.exists) {
      return false;
    }

    const currentBalance = parseFloat(trustlineInfo.balance);
    const limit = parseFloat(trustlineInfo.limit);
    const amountToReceive = parseFloat(amount);

    // Check if receiving this amount would exceed the limit
    return (currentBalance + amountToReceive) <= limit;
  }
}

// Singleton instance
export const trustlineService = new TrustlineService();