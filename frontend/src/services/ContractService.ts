import {
  Contract,
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  xdr,
  Address,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';
import { CONTRACT_CONFIG, getCurrentNetworkConfig } from '../config/contracts';

export interface TokenCreationParams {
  name: string;
  symbol: string;
  totalSupply: number;
  description?: string;
  launchThresholdXlm?: number;
  launchThresholdPercent?: number;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  totalSupply: number;
  tokensSold: number;
  xlmRaised: number;
  currentPrice: number;
  launchProgressPercent: number;
  isLaunched: boolean;
  creator: string;
  creationTime: number;
}

export interface BondingCurveInfo {
  currentPrice: number;
  totalSupply: number;
  reserveBalance: number;
  tokensInCurve: number;
  graduationThreshold: number;
}

export class ContractService {
  private contract: Contract;
  private server: SorobanRpc.Server;
  private networkConfig = getCurrentNetworkConfig();

  constructor() {
    this.server = new SorobanRpc.Server(this.networkConfig.sorobanRpcUrl);
    this.contract = new Contract(CONTRACT_CONFIG.LAUNCHPAD_CONTRACT_ID);
  }

  /**
   * Create a new token on the launchpad
   */
  async createToken(
    params: TokenCreationParams,
    creatorPublicKey: string
  ): Promise<string> {
    try {
      const account = await this.server.getAccount(creatorPublicKey);
      
      // Default curve parameters for linear bonding curve
      const curveParams = {
        curve_type: 'Linear',
        base_price: nativeToScVal(1000, { type: 'i128' }), // 0.0001 XLM in stroops
        price_multiplier: nativeToScVal(9000, { type: 'i128' }),
      };
      
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkConfig.networkPassphrase,
      })
        .addOperation(
          this.contract.call(
            CONTRACT_CONFIG.METHODS.CREATE_TOKEN,
            new Address(creatorPublicKey).toScVal(),
            nativeToScVal(params.name, { type: 'string' }),
            nativeToScVal(params.symbol, { type: 'string' }),
            nativeToScVal(params.totalSupply, { type: 'i128' }),
            nativeToScVal(params.launchThresholdXlm || 10, { type: 'i128' }), // Default 10 XLM
            nativeToScVal(params.launchThresholdPercent || 80, { type: 'u32' }), // Default 80%
            nativeToScVal(curveParams, { type: 'map' })
          )
        )
        .setTimeout(30)
        .build();

      const preparedTransaction = await this.server.prepareTransaction(transaction);
      return preparedTransaction.toXDR();
    } catch (error) {
      console.error('Error creating token:', error);
      throw new Error(`Failed to create token: ${error}`);
    }
  }

  /**
   * Buy tokens from the bonding curve
   */
  async buyTokens(
    tokenId: string,
    xlmAmount: number,
    buyerPublicKey: string
  ): Promise<string> {
    try {
      const account = await this.server.getAccount(buyerPublicKey);
      
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkConfig.networkPassphrase,
      })
        .addOperation(
          this.contract.call(
            CONTRACT_CONFIG.METHODS.BUY_TOKENS,
            new Address(buyerPublicKey).toScVal(),
            nativeToScVal(tokenId, { type: 'string' }),
            nativeToScVal(xlmAmount * 10000000, { type: 'i128' }) // Convert to stroops
          )
        )
        .setTimeout(30)
        .build();

      const preparedTransaction = await this.server.prepareTransaction(transaction);
      return preparedTransaction.toXDR();
    } catch (error) {
      console.error('Error buying tokens:', error);
      throw new Error(`Failed to buy tokens: ${error}`);
    }
  }

  /**
   * Get token information
   */
  async getTokenInfo(tokenId: string): Promise<TokenInfo | null> {
    try {
      const transaction = new TransactionBuilder(
        await this.server.getAccount(CONTRACT_CONFIG.LAUNCHPAD_CONTRACT_ID),
        {
          fee: BASE_FEE,
          networkPassphrase: this.networkConfig.networkPassphrase,
        }
      )
        .addOperation(
          this.contract.call(
            CONTRACT_CONFIG.METHODS.GET_TOKEN_INFO,
            nativeToScVal(tokenId, { type: 'string' })
          )
        )
        .setTimeout(30)
        .build();

      const result = await this.server.simulateTransaction(transaction);
      
      if ('error' in result) {
        console.error('Simulation error:', result.error);
        return null;
      }

      if ('result' in result && result.result?.retval) {
        const tokenData = scValToNative(result.result.retval);
        return {
          name: tokenData.name,
          symbol: tokenData.symbol,
          totalSupply: tokenData.total_supply,
          tokensSold: tokenData.tokens_sold,
          xlmRaised: tokenData.xlm_raised / 10000000, // Convert from stroops
          currentPrice: tokenData.current_price / 10000000,
          launchProgressPercent: tokenData.launch_progress_percent,
          isLaunched: tokenData.is_launched,
          creator: tokenData.creator,
          creationTime: tokenData.creation_time,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  }

  /**
   * Get bonding curve information
   */
  async getBondingCurveInfo(tokenAddress: string): Promise<BondingCurveInfo | null> {
    try {
      // For demo purposes, return mock data
      console.log('Getting bonding curve info for:', tokenAddress);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Return mock bonding curve data
      return {
        currentPrice: 0.0001,
        totalSupply: 1000000,
        reserveBalance: 1250.5,
        tokensInCurve: 875000,
        graduationThreshold: CONTRACT_CONFIG.PLATFORM.GRADUATION_THRESHOLD,
      };
    } catch (error) {
      console.error('Error getting bonding curve info:', error);
      return null;
    }
  }

  /**
   * Calculate tokens received for XLM amount
   */
  calculateTokensForXLM(xlmAmount: number, currentPrice: number): number {
    // Simple linear bonding curve calculation
    // In production, this should match the contract's calculation exactly
    return xlmAmount / currentPrice;
  }

  /**
   * Calculate XLM received for token amount
   */
  calculateXLMForTokens(tokenAmount: number, currentPrice: number): number {
    // Simple linear bonding curve calculation
    // In production, this should match the contract's calculation exactly
    return tokenAmount * currentPrice * 0.99; // 1% slippage
  }
}

// Export singleton instance
export const contractService = new ContractService();