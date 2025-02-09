import React, { useState } from 'react';
import { useAccount, useBalance, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FundButton } from '@coinbase/onchainkit/fund';
import { Loader2 } from 'lucide-react';

interface ContractData {
  contractorAddress: string;
  description: string;
  amount: string;
  duration?: string;
  milestones?: string;
}

interface ContractPaymentFlowProps {
  contractData: ContractData;
  onComplete: (success: boolean, txHash?: string) => void;
}

export function ContractPaymentFlow({ contractData, onComplete }: ContractPaymentFlowProps) {
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // Get user's balance
  const { data: balance } = useBalance({
    address: address,
    watch: true,
  });

  const { writeContract } = useWriteContract();

  // Check if user has sufficient balance
  const hasSufficientBalance = balance?.value && parseEther(contractData.amount) <= balance.value;

  const handlePayment = async () => {
    if (!address || !contractData.contractorAddress) {
      setError('Missing wallet connection or contractor address');
      return;
    }

    if (!hasSufficientBalance) {
      setError('Insufficient balance');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const result = await writeContract({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        abi: [
          {
            inputs: [
              { name: 'contractor', type: 'address' },
              { name: 'description', type: 'string' }
            ],
            name: 'createAgreement',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'payable',
            type: 'function'
          }
        ],
        functionName: 'createAgreement',
        args: [contractData.contractorAddress, contractData.description],
        value: parseEther(contractData.amount)
      });

      onComplete(true, result.hash);
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed');
      onComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">{contractData.amount} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Your Balance:</span>
            <span className="font-medium">
              {balance ? formatEther(balance.value) : '...'} ETH
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Contractor:</span>
            <span className="font-mono text-sm">
              {contractData.contractorAddress}
            </span>
          </div>
        </div>
      </div>

      {/* Fund Options */}
      {!hasSufficientBalance && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Add Funds</h3>
            <div className="space-y-2">
              <FundButton
                text="Buy ETH with Card"
                openIn="popup"
                className="w-full"
              />
              <FundButton
                text="Transfer from Coinbase"
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={isProcessing || !hasSufficientBalance}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          'Complete Payment'
        )}
      </Button>
    </div>
  );
}
