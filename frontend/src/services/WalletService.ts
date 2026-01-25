import { 
  Networks
} from '@stellar/stellar-sdk';
import { 
  isConnected, 
  getPublicKey, 
  signTransaction,
  setAllowed,
  isAllowed 
} from '@stellar/freighter-api';

export interface WalletConnection {
  publicKey: string;
  walletType: 'freighter' | 'albedo';
}

export interface TransactionResult {
  hash: string;
  successful: boolean;
  error?: string;
}

export interface WalletService {
  connect(): Promise<WalletConnection>;
  disconnect(): void;
  getPublicKey(): string | null;
  signTransaction(xdr: string): Promise<string>;
  isConnected(): boolean;
}

declare global {
  interface Window {
    freighter?: any;
    freighterApi?: any;
    albedo?: {
      publicKey(): Promise<{ pubkey: string }>;
      tx(options: { xdr: string; network: string }): Promise<{ signed_envelope_xdr: string }>;
    };
  }
}

export class FreighterWalletService implements WalletService {
  private publicKey: string | null = null;

  async connect(): Promise<WalletConnection> {
    try {
      // Check if Freighter is installed
      const connected = await isConnected();
      if (!connected) {
        throw new Error('Freighter wallet not installed. Please install from https://freighter.app/');
      }

      // Check if we're allowed to access Freighter
      const allowed = await isAllowed();
      if (!allowed) {
        await setAllowed();
      }

      // Get the public key
      const publicKey = await getPublicKey();
      this.publicKey = publicKey;
      
      return {
        publicKey,
        walletType: 'freighter'
      };
    } catch (error: any) {
      if (error.message?.includes('User declined access')) {
        throw new Error('Please allow access to Freighter wallet and try again.');
      }
      if (error.message?.includes('not installed')) {
        throw new Error('Freighter wallet not installed. Please install from https://freighter.app/');
      }
      throw new Error(`Failed to connect to Freighter wallet: ${error.message}`);
    }
  }

  disconnect(): void {
    this.publicKey = null;
  }

  getPublicKey(): string | null {
    return this.publicKey;
  }

  async signTransaction(xdr: string): Promise<string> {
    if (!this.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const network = process.env.REACT_APP_STELLAR_NETWORK === 'mainnet' 
        ? 'PUBLIC' 
        : 'TESTNET';
      
      return await signTransaction(xdr, { network });
    } catch (error: any) {
      throw new Error(`Transaction signing failed: ${error.message}`);
    }
  }

  isConnected(): boolean {
    return !!this.publicKey;
  }
}

export class AlbedoWalletService implements WalletService {
  private publicKey: string | null = null;

  async connect(): Promise<WalletConnection> {
    if (!window.albedo) {
      throw new Error('Albedo wallet not available. Please visit https://albedo.link/');
    }

    try {
      const result = await window.albedo.publicKey();
      this.publicKey = result.pubkey;
      
      return {
        publicKey: result.pubkey,
        walletType: 'albedo'
      };
    } catch (error) {
      throw new Error('Failed to connect to Albedo wallet');
    }
  }

  disconnect(): void {
    this.publicKey = null;
  }

  getPublicKey(): string | null {
    return this.publicKey;
  }

  async signTransaction(xdr: string): Promise<string> {
    if (!window.albedo) {
      throw new Error('Albedo wallet not available');
    }

    if (!this.publicKey) {
      throw new Error('Wallet not connected');
    }

    try {
      const network = process.env.REACT_APP_STELLAR_NETWORK === 'mainnet' 
        ? Networks.PUBLIC 
        : Networks.TESTNET;
      
      const result = await window.albedo.tx({
        xdr,
        network
      });
      
      return result.signed_envelope_xdr;
    } catch (error) {
      throw new Error('Transaction signing failed');
    }
  }

  isConnected(): boolean {
    return !!this.publicKey;
  }
}

export class WalletManager {
  private currentWallet: WalletService | null = null;
  private connectionListeners: ((connection: WalletConnection | null) => void)[] = [];

  constructor() {
    // Try to restore connection on page load
    this.restoreConnection();
  }

  async connectFreighter(): Promise<WalletConnection> {
    const wallet = new FreighterWalletService();
    const connection = await wallet.connect();
    
    this.currentWallet = wallet;
    this.saveConnection(connection);
    this.notifyListeners(connection);
    
    return connection;
  }

  async connectAlbedo(): Promise<WalletConnection> {
    const wallet = new AlbedoWalletService();
    const connection = await wallet.connect();
    
    this.currentWallet = wallet;
    this.saveConnection(connection);
    this.notifyListeners(connection);
    
    return connection;
  }

  disconnect(): void {
    if (this.currentWallet) {
      this.currentWallet.disconnect();
      this.currentWallet = null;
    }
    
    localStorage.removeItem('stellar_pump_wallet');
    this.notifyListeners(null);
  }

  getCurrentWallet(): WalletService | null {
    return this.currentWallet;
  }

  getPublicKey(): string | null {
    return this.currentWallet?.getPublicKey() || null;
  }

  async signTransaction(xdr: string): Promise<string> {
    if (!this.currentWallet) {
      throw new Error('No wallet connected');
    }

    return await this.currentWallet.signTransaction(xdr);
  }

  isConnected(): boolean {
    return this.currentWallet?.isConnected() || false;
  }

  onConnectionChange(listener: (connection: WalletConnection | null) => void): () => void {
    this.connectionListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.connectionListeners.indexOf(listener);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  private saveConnection(connection: WalletConnection): void {
    localStorage.setItem('stellar_pump_wallet', JSON.stringify(connection));
  }

  private async restoreConnection(): Promise<void> {
    try {
      const saved = localStorage.getItem('stellar_pump_wallet');
      if (!saved) return;

      const connection: WalletConnection = JSON.parse(saved);
      
      if (connection.walletType === 'freighter') {
        try {
          const connected = await isConnected();
          if (connected) {
            const wallet = new FreighterWalletService();
            await wallet.connect();
            this.currentWallet = wallet;
            this.notifyListeners(connection);
          }
        } catch (error) {
          console.log('Could not restore Freighter connection:', error);
          localStorage.removeItem('stellar_pump_wallet');
        }
      } else if (connection.walletType === 'albedo') {
        // Albedo doesn't persist connections, user needs to reconnect
        localStorage.removeItem('stellar_pump_wallet');
      }
    } catch (error) {
      console.warn('Failed to restore wallet connection:', error);
      localStorage.removeItem('stellar_pump_wallet');
    }
  }

  private notifyListeners(connection: WalletConnection | null): void {
    this.connectionListeners.forEach(listener => listener(connection));
  }
}

// Singleton instance
export const walletManager = new WalletManager();