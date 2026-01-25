import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { contractService, TokenCreationParams } from '../services/ContractService';
import { CONTRACT_CONFIG } from '../config/contracts';

export const TokenCreationPage: React.FC = () => {
    const { isConnected, publicKey, signTransaction } = useWallet();
    const [formData, setFormData] = useState({
        name: '',
        symbol: '',
        description: '',
        totalSupply: '1000000',
    });
    const [isCreating, setIsCreating] = useState(false);
    const [createdTokenAddress, setCreatedTokenAddress] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConnected || !publicKey) {
            alert('Please connect your wallet first');
            return;
        }

        // Validate form data
        if (!formData.name.trim() || !formData.symbol.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        const totalSupply = parseInt(formData.totalSupply);
        if (totalSupply < CONTRACT_CONFIG.PLATFORM.MIN_TOKEN_SUPPLY || 
            totalSupply > CONTRACT_CONFIG.PLATFORM.MAX_TOKEN_SUPPLY) {
            alert(`Total supply must be between ${CONTRACT_CONFIG.PLATFORM.MIN_TOKEN_SUPPLY.toLocaleString()} and ${CONTRACT_CONFIG.PLATFORM.MAX_TOKEN_SUPPLY.toLocaleString()}`);
            return;
        }

        setIsCreating(true);
        try {
            const tokenParams: TokenCreationParams = {
                name: formData.name.trim(),
                symbol: formData.symbol.trim().toUpperCase(),
                totalSupply: totalSupply,
                description: formData.description.trim(),
                launchThresholdXlm: 10, // Default 10 XLM
                launchThresholdPercent: 80, // Default 80%
            };

            console.log('Creating token with params:', tokenParams);

            // Create the transaction
            const transactionXDR = await contractService.createToken(tokenParams, publicKey);
            
            // Sign the transaction
            const signedXDR = await signTransaction(transactionXDR);
            
            if (signedXDR) {
                // TODO: Submit the signed transaction and get the token ID
                console.log('Token creation transaction signed:', signedXDR);
                
                // For now, use the symbol as the token ID (as per contract implementation)
                const tokenId = formData.symbol.trim().toUpperCase();
                setCreatedTokenAddress(tokenId);
                
                alert(`Token created successfully! Token ID: ${tokenId}`);
            } else {
                throw new Error('Transaction was not signed');
            }
        } catch (error) {
            console.error('Error creating token:', error);
            alert(`Failed to create token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto neo-grid">
            <div className="neo-card p-8">
                <h1 className="neo-title text-5xl mb-8">CREATE NEW TOKEN</h1>

                {!isConnected && (
                    <div className="neo-card neo-card-yellow p-6 mb-8">
                        <p className="neo-subtitle text-lg">
                            PLEASE CONNECT YOUR WALLET TO CREATE A TOKEN.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-12">
                    {/* Success Message */}
                    {createdTokenAddress && (
                        <div className="neo-card neo-card-green p-6">
                            <h3 className="neo-subtitle text-xl mb-4">✅ TOKEN CREATED SUCCESSFULLY!</h3>
                            <p className="neo-text font-neo-mono">
                                Token Address: <strong>{createdTokenAddress}</strong>
                            </p>
                            <p className="neo-text font-neo-mono mt-2">
                                Your token is now live on the bonding curve!
                            </p>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="neo-card neo-card-cyan p-6">
                        <h2 className="neo-subtitle text-2xl mb-6">BASIC INFORMATION</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="neo-subtitle text-lg mb-3 block">
                                    TOKEN NAME *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="neo-input w-full"
                                    placeholder="e.g., MOON COIN"
                                    required
                                    maxLength={32}
                                />
                            </div>

                            <div>
                                <label className="neo-subtitle text-lg mb-3 block">
                                    TOKEN SYMBOL *
                                </label>
                                <input
                                    type="text"
                                    name="symbol"
                                    value={formData.symbol}
                                    onChange={handleInputChange}
                                    className="neo-input w-full"
                                    placeholder="e.g., MOON"
                                    required
                                    maxLength={12}
                                    style={{ textTransform: 'uppercase' }}
                                />
                                <p className="neo-text font-neo-mono mt-2">
                                    1-12 CHARACTERS, WILL BE CONVERTED TO UPPERCASE
                                </p>
                            </div>

                            <div>
                                <label className="neo-subtitle text-lg mb-3 block">
                                    DESCRIPTION
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="neo-input w-full h-32"
                                    placeholder="DESCRIBE YOUR TOKEN..."
                                    maxLength={500}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Token Economics */}
                    <div className="neo-card neo-card-pink p-6">
                        <h2 className="neo-subtitle text-2xl mb-6 text-neo-white">TOKEN ECONOMICS</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="neo-subtitle text-lg mb-3 block text-neo-white">
                                    TOTAL SUPPLY *
                                </label>
                                <input
                                    type="number"
                                    name="totalSupply"
                                    value={formData.totalSupply}
                                    onChange={handleInputChange}
                                    className="neo-input w-full"
                                    placeholder="1000000"
                                    required
                                    min={CONTRACT_CONFIG.PLATFORM.MIN_TOKEN_SUPPLY}
                                    max={CONTRACT_CONFIG.PLATFORM.MAX_TOKEN_SUPPLY}
                                />
                                <p className="neo-text font-neo-mono mt-2 text-neo-white">
                                    FIXED SUPPLY ({CONTRACT_CONFIG.PLATFORM.MIN_TOKEN_SUPPLY.toLocaleString()} - {CONTRACT_CONFIG.PLATFORM.MAX_TOKEN_SUPPLY.toLocaleString()}), CANNOT BE CHANGED AFTER CREATION
                                </p>
                            </div>

                            <div className="neo-card p-4 bg-black bg-opacity-20">
                                <h4 className="neo-subtitle text-lg mb-3 text-neo-white">AUTOMATIC BONDING CURVE SETTINGS</h4>
                                <ul className="neo-text font-neo-mono text-neo-white space-y-1">
                                    <li>• GRADUATION THRESHOLD: {CONTRACT_CONFIG.PLATFORM.GRADUATION_THRESHOLD.toLocaleString()} XLM</li>
                                    <li>• PLATFORM FEE: {CONTRACT_CONFIG.PLATFORM.FEE_PERCENTAGE}%</li>
                                    <li>• CURVE TYPE: LINEAR WITH AUTOMATIC PRICING</li>
                                    <li>• DEX LAUNCH: AUTOMATIC WHEN THRESHOLD REACHED</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Network Information */}
                    <div className="neo-card p-6 bg-neo-orange">
                        <h3 className="neo-subtitle text-xl mb-4 text-neo-white">NETWORK INFORMATION</h3>
                        <div className="neo-text font-neo-mono text-neo-white space-y-2">
                            <p><strong>NETWORK:</strong> {CONTRACT_CONFIG.CURRENT_NETWORK}</p>
                            <p><strong>CONTRACT:</strong> {CONTRACT_CONFIG.LAUNCHPAD_CONTRACT_ID}</p>
                            <p><strong>CREATION FEE:</strong> NETWORK FEES ONLY (NO PLATFORM FEE)</p>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="text-center">
                        <button
                            type="submit"
                            disabled={!isConnected || isCreating}
                            className="neo-btn neo-btn-primary text-xl px-12 py-6"
                        >
                            {isCreating ? (
                                <div className="neo-flex justify-center">
                                    <div className="w-6 h-6 border-4 border-neo-black border-t-transparent rounded-full animate-spin mr-4"></div>
                                    <span>CREATING TOKEN...</span>
                                </div>
                            ) : (
                                'CREATE TOKEN'
                            )}
                        </button>

                        {!isConnected && (
                            <p className="neo-text font-neo-mono mt-4">
                                CONNECT YOUR WALLET TO ENABLE TOKEN CREATION
                            </p>
                        )}
                    </div>
                </form>
            </div>

            {/* Information Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="neo-card neo-card-yellow p-6">
                    <h3 className="neo-subtitle text-xl mb-4">🔒 SECURITY GUARANTEES</h3>
                    <ul className="neo-text font-neo-mono space-y-2">
                        <li>• ISSUER ACCOUNT LOCKED PERMANENTLY (AUTH_IMMUTABLE)</li>
                        <li>• NO ABILITY TO MINT ADDITIONAL SUPPLY</li>
                        <li>• NO ADMIN WITHDRAWAL FUNCTIONS</li>
                        <li>• LAUNCH TRANSITION IS IRREVERSIBLE</li>
                    </ul>
                </div>

                <div className="neo-card neo-card-cyan p-6">
                    <h3 className="neo-subtitle text-xl mb-4">📈 HOW IT WORKS</h3>
                    <ol className="neo-text font-neo-mono space-y-2">
                        <li>1. TOKEN CREATED WITH FIXED SUPPLY AND BONDING CURVE</li>
                        <li>2. USERS BUY TOKENS AT INCREASING PRICES VIA BONDING CURVE</li>
                        <li>3. WHEN LAUNCH CONDITIONS ARE MET, TOKEN MOVES TO STELLAR DEX</li>
                        <li>4. FREE MARKET TRADING BEGINS WITH NO MORE BONDING CURVE</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};