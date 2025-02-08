// src/services/transactionWorkflow.ts

import { MPCWallet } from '@coinbase/cdp-agentkit-core';
import { parseEther } from 'viem';
import { base } from 'viem/chains';

export type ApprovalRole = 'client' | 'contractor' | 'admin';

export type ApprovalStep = {
  id: string;
  role: ApprovalRole;
  order: number;
  required: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  approver?: string;
  timestamp?: number;
  comments?: string;
};

export type TransactionWorkflow = {
  id: string;
  transactionHash?: string;
  amount: string;
  from: string;
  to: string;
  description: string;
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'rejected';
  steps: ApprovalStep[];
  currentStep: number;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
};

export class TransactionWorkflowService {
  private mpcWallet: MPCWallet;
  private contractAddress: string;

  constructor(wallet: MPCWallet, contractAddress: string) {
    this.mpcWallet = wallet;
    this.contractAddress = contractAddress;
  }

  async createWorkflow(
    amount: string,
    to: string,
    description: string,
    steps: Omit<ApprovalStep, 'status' | 'approver' | 'timestamp'>[]
  ): Promise<TransactionWorkflow> {
    try {
      const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Initialize steps with pending status
      const initializedSteps = steps.map(step => ({
        ...step,
        status: 'pending' as const,
      }));

      const workflow: TransactionWorkflow = {
        id: workflowId,
        amount,
        from: await this.mpcWallet.getAddress(),
        to,
        description,
        status: 'draft',
        steps: initializedSteps,
        currentStep: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      return workflow;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw new Error('Failed to create transaction workflow');
    }
  }

  async processApproval(
    workflow: TransactionWorkflow,
    approverAddress: string,
    role: ApprovalRole,
    approved: boolean,
    comments?: string
  ): Promise<TransactionWorkflow> {
    try {
      const currentStep = workflow.steps[workflow.currentStep];
      
      // Validate approver role
      if (currentStep.role !== role) {
        throw new Error('Unauthorized approval role');
      }

      // Update current step
      const updatedSteps = [...workflow.steps];
      updatedSteps[workflow.currentStep] = {
        ...currentStep,
        status: approved ? 'approved' : 'rejected',
        approver: approverAddress,
        timestamp: Date.now(),
        comments
      };

      // Determine next step and workflow status
      let nextStep = workflow.currentStep;
      let workflowStatus = workflow.status;

      if (approved) {
        // Move to next step if approved
        nextStep = workflow.currentStep + 1;
        
        // Check if workflow is complete
        if (nextStep >= workflow.steps.length) {
          workflowStatus = 'processing';
        } else {
          workflowStatus = 'pending';
        }
      } else {
        // Reject workflow if current step is rejected
        workflowStatus = 'rejected';
      }

      // Update workflow
      const updatedWorkflow: TransactionWorkflow = {
        ...workflow,
        steps: updatedSteps,
        currentStep: nextStep,
        status: workflowStatus,
        updatedAt: Date.now()
      };

      // If workflow is complete, execute transaction
      if (workflowStatus === 'processing') {
        const txHash = await this.executeApprovedTransaction(updatedWorkflow);
        return {
          ...updatedWorkflow,
          transactionHash: txHash,
          status: 'completed'
        };
      }

      return updatedWorkflow;
    } catch (error) {
      console.error('Error processing approval:', error);
      throw new Error('Failed to process approval');
    }
  }

  private async executeApprovedTransaction(
    workflow: TransactionWorkflow
  ): Promise<string> {
    try {
      // Validate all required steps are approved
      const hasAllApprovals = workflow.steps
        .filter(step => step.required)
        .every(step => step.status === 'approved');

      if (!hasAllApprovals) {
        throw new Error('Missing required approvals');
      }

      // Create transaction payload
      const txPayload = {
        to: this.contractAddress,
        value: parseEther(workflow.amount),
        data: this.encodeTransactionData(workflow),
        chainId: base.id
      };

      // Execute transaction with MPC wallet
      const tx = await this.mpcWallet.sendTransaction(txPayload);
      return tx.hash;
    } catch (error) {
      console.error('Error executing transaction:', error);
      throw new Error('Failed to execute approved transaction');
    }
  }

  private encodeTransactionData(workflow: TransactionWorkflow): string {
    // Encode the transaction data for the smart contract
    const abiCoder = new ethers.AbiCoder();
    return abiCoder.encode(
      ['address', 'uint256', 'bytes32', 'bytes[]'],
      [
        workflow.to,
        parseEther(workflow.amount),
        ethers.id(workflow.id),
        workflow.steps
          .filter(step => step.status === 'approved')
          .map(step => ethers.SigningKey.sign(workflow.id))
      ]
    );
  }

  canApprove(
    workflow: TransactionWorkflow,
    address: string,
    role: ApprovalRole
  ): boolean {
    // Check if user can approve current step
    const currentStep = workflow.steps[workflow.currentStep];
    return (
      workflow.status === 'pending' &&
      currentStep?.role === role &&
      currentStep?.status === 'pending' &&
      !currentStep?.approver
    );
  }

  getApprovalStatus(workflow: TransactionWorkflow): {
    completed: number;
    total: number;
    required: number;
  } {
    const total = workflow.steps.length;
    const completed = workflow.steps.filter(
      step => ['approved', 'rejected', 'skipped'].includes(step.status)
    ).length;
    const required = workflow.steps.filter(step => step.required).length;

    return { completed, total, required };
  }
}
