// src/services/securePayment.ts

import { MPCWallet } from '@coinbase/cdp-agentkit-core';
import { parseEther, formatEther } from 'viem';
import { base } from 'viem/chains';

export interface PaymentTransaction {
  id: string;
  amount: string;
  from: string;
  to: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: number;
  hash?: string;
}

export interface TransactionReceipt {
  success: boolean;
  hash?: string;
  error?: string;
}

export class SecurePaymentService {
  private mpcWallet: MPCWallet;

  constructor(wallet: MPCWallet) {
    this.mpcWallet = wallet;
  }

  async createSecureTransaction(
    to: string,
    amount: string,
    contractAddress: string
  ): Promise<PaymentTransaction> {
    try {
      // Create transaction ID
      const txId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Parse amount to Wei
      const amountInWei = parseEther(amount);

      // Create transaction object
      const transaction = {
        id: txId,
        to: contractAddress,
        data: '', // Will be populated with contract method call data
        value: amountInWei,
        chainId: base.id
      };

      // Create initial payment record
      const paymentTx: PaymentTransaction = {
        id: txId,
        amount,
        from: await this.mpcWallet.getAddress(),
        to,
        status: 'pending',
        timestamp: Date.now()
      };

      return paymentTx;
    } catch (error) {
      console.error('Error creating secure transaction:', error);
      throw new Error('Failed to create secure transaction');
    }
  }

  async signTransaction(
    transaction: PaymentTransaction
  ): Promise<TransactionReceipt> {
    try {
      // Get current nonce
      const nonce = await this.mpcWallet.getNonce();

      // Create transaction payload
      const txPayload = {
        to: transaction.to,
        value: parseEther(transaction.amount),
        nonce,
        chainId: base.id
      };

      // Sign with MPC wallet
      const signature = await this.mpcWallet.signTransaction(txPayload);

      // Verify signature
      const isValid = await this.mpcWallet.verifySignature(
        txPayload,
        signature
      );

      if (!isValid) {
        throw new Error('Invalid transaction signature');
      }

      return {
        success: true,
        hash: signature.hash
      };
    } catch (error) {
      console.error('Error signing transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction signing failed'
      };
    }
  }

  async executeTransaction(
    transaction: PaymentTransaction,
    signature: string
  ): Promise<TransactionReceipt> {
    try {
      // Submit signed transaction
      const receipt = await this.mpcWallet.sendTransaction({
        to: transaction.to,
        value: parseEther(transaction.amount),
        signature
      });

      return {
        success: true,
        hash: receipt.hash
      };
    } catch (error) {
      console.error('Error executing transaction:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Transaction execution failed'
      };
    }
  }

  async validateTransaction(transaction: PaymentTransaction): Promise<boolean> {
    try {
      // Get wallet balance
      const balance = await this.mpcWallet.getBalance();
      const amount = parseEther(transaction.amount);

      // Check sufficient balance
      if (balance < amount) {
        throw new Error('Insufficient balance');
      }

      // Validate recipient address
      if (!transaction.to || transaction.to.length !== 42) {
        throw new Error('Invalid recipient address');
      }

      // Validate amount is greater than 0
      if (parseFloat(transaction.amount) <= 0) {
        throw new Error('Invalid amount');
      }

      return true;
    } catch (error) {
      console.error('Transaction validation error:', error);
      return false;
    }
  }

  async getTransactionStatus(txHash: string): Promise<string> {
    try {
      const receipt = await this.mpcWallet.provider.getTransactionReceipt(txHash);
      return receipt.status === 1 ? 'completed' : 'failed';
    } catch (error) {
      console.error('Error getting transaction status:', error);
      throw error;
    }
  }
}
