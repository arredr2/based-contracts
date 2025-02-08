// src/services/multiSigPayment.ts

import { MPCWallet } from '@coinbase/cdp-agentkit-core';
import { parseEther } from 'viem';
import { base } from 'viem/chains';

export interface SignatureRequest {
  id: string;
  transactionId: string;
  signer: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  signature?: string;
}

export interface MultiSigPayment {
  id: string;
  amount: string;
  from: string;
  to: string;
  requiredSigners: string[];
  minSignatures: number;
  signatures: SignatureRequest[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  timestamp: number;
  hash?: string;
}

export class MultiSigPaymentService {
  private mpcWallet: MPCWallet;
  private contractAddress: string;

  constructor(wallet: MPCWallet, contractAddress: string) {
    this.mpcWallet = wallet;
    this.contractAddress = contractAddress;
  }

  async createMultiSigPayment(
    amount: string,
    to: string,
    requiredSigners: string[],
    minSignatures: number
  ): Promise<MultiSigPayment> {
    try {
      const paymentId = `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Initialize signature requests for all required signers
      const signatures = requiredSigners.map(signer => ({
        id: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        transactionId: paymentId,
        signer,
        status: 'pending' as const,
        timestamp: Date.now()
      }));

      // Create multi-sig payment object
      const payment: MultiSigPayment = {
        id: paymentId,
        amount,
        from: await this.mpcWallet.getAddress(),
        to,
        requiredSigners,
        minSignatures,
        signatures,
        status: 'pending',
        timestamp: Date.now()
      };

      return payment;
    } catch (error) {
      console.error('Error creating multi-sig payment:', error);
      throw new Error('Failed to create multi-signature payment');
    }
  }

  async addSignature(
    payment: MultiSigPayment,
    signerAddress: string
  ): Promise<MultiSigPayment> {
    try {
      // Validate signer is required
      if (!payment.requiredSigners.includes(signerAddress)) {
        throw new Error('Signer not authorized');
      }

      // Find signature request for signer
      const signatureIndex = payment.signatures.findIndex(
        sig => sig.signer === signerAddress && sig.status === 'pending'
      );

      if (signatureIndex === -1) {
        throw new Error('No pending signature request found');
      }

      // Create signature payload
      const payloadToSign = {
        paymentId: payment.id,
        amount: payment.amount,
        to: payment.to,
        from: payment.from,
        timestamp: payment.timestamp
      };

      // Sign with MPC wallet
      const signature = await this.mpcWallet.signMessage(
        JSON.stringify(payloadToSign)
      );

      // Update signature status
      const updatedSignatures = [...payment.signatures];
      updatedSignatures[signatureIndex] = {
        ...payment.signatures[signatureIndex],
        status: 'approved',
        signature,
        timestamp: Date.now()
      };

      // Check if we have enough signatures
      const approvedCount = updatedSignatures.filter(
        sig => sig.status === 'approved'
      ).length;

      const updatedStatus = 
        approvedCount >= payment.minSignatures ? 'processing' : 'pending';

      return {
        ...payment,
        signatures: updatedSignatures,
        status: updatedStatus
      };
    } catch (error) {
      console.error('Error adding signature:', error);
      throw new Error('Failed to add signature');
    }
  }

  async rejectSignature(
    payment: MultiSigPayment,
    signerAddress: string
  ): Promise<MultiSigPayment> {
    try {
      const signatureIndex = payment.signatures.findIndex(
        sig => sig.signer === signerAddress && sig.status === 'pending'
      );

      if (signatureIndex === -1) {
        throw new Error('No pending signature request found');
      }

      const updatedSignatures = [...payment.signatures];
      updatedSignatures[signatureIndex] = {
        ...payment.signatures[signatureIndex],
        status: 'rejected',
        timestamp: Date.now()
      };

      return {
        ...payment,
        signatures: updatedSignatures,
        status: 'failed'
      };
    } catch (error) {
      console.error('Error rejecting signature:', error);
      throw new Error('Failed to reject signature');
    }
  }

  async executeMultiSigPayment(payment: MultiSigPayment): Promise<string> {
    try {
      // Validate we have enough signatures
      const approvedSignatures = payment.signatures.filter(
        sig => sig.status === 'approved'
      );

      if (approvedSignatures.length < payment.minSignatures) {
        throw new Error('Insufficient signatures');
      }

      // Create transaction with all signatures
      const txPayload = {
        to: this.contractAddress,
        value: parseEther(payment.amount),
        data: this.encodeMultiSigPayment(payment, approvedSignatures),
        chainId: base.id
      };

      // Execute transaction
      const tx = await this.mpcWallet.sendTransaction(txPayload);
      return tx.hash;
    } catch (error) {
      console.error('Error executing multi-sig payment:', error);
      throw new Error('Failed to execute multi-signature payment');
    }
  }

  private encodeMultiSigPayment(
    payment: MultiSigPayment,
    signatures: SignatureRequest[]
  ): string {
    // Encode the payment data and signatures for the smart contract
    // This would match your smart contract's expected format
    const abiCoder = new ethers.AbiCoder();
    return abiCoder.encode(
      ['address', 'uint256', 'bytes[]'],
      [
        payment.to,
        parseEther(payment.amount),
        signatures.map(sig => sig.signature)
      ]
    );
  }

  async validateSignatures(
    payment: MultiSigPayment,
    signatures: SignatureRequest[]
  ): Promise<boolean> {
    try {
      // Validate each signature
      for (const sig of signatures) {
        if (!sig.signature) continue;

        const payloadToSign = {
          paymentId: payment.id,
          amount: payment.amount,
          to: payment.to,
          from: payment.from,
          timestamp: payment.timestamp
        };

        const isValid = await this.mpcWallet.verifySignature(
          JSON.stringify(payloadToSign),
          sig.signature
        );

        if (!isValid) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating signatures:', error);
      return false;
    }
  }
}
