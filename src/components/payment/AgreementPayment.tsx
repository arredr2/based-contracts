import React, { useState } from 'react';
import { useAccount, useBalance, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const PaymentFlow = ({ 
  contractorAddress, 
  amount, 
  agreementId,
  onSuccess,
  onError 
}) => {
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  
  // Get client's balance
  const { data: balance } = useBalance({
    address: address,
  });

  const { writeContract } = useWriteContract();

  // Check if client has sufficient balance
  const hasSufficientBalance = balance?.value >= parseEther(amount.toString());

  const handlePayment = async () => {
    if (!address || !contractorAddress) {
      setStatus('error');
      onError?.('Missing wallet connection');
      return;
    }

    if (!hasSufficientBalance) {
      setStatus('error');
      onError?.('Insufficient balance');
      return;
    }

    setIsProcessing(true);
    setStatus('processing');

    try {
      const result = await writeContract({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        abi: [
          {
            inputs: [
              { name: 'agreementId', type: 'uint256' },
              { name: 'contractor', type: 'address' }
            ],
            name: 'createAgreement',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'payable',
            type: 'function'
          }
        ],
        functionName: 'createAgreement',
        args: [agreementId, contractorAddress],
        value: parseEther(amount.toString())
      });

      setStatus('success');
      onSuccess?.(result);
    } catch (error) {
      console.error('Payment error:', error);
      setStatus('error');
      onError?.(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Your Balance:</span>
          <span className="font-medium">
            {balance ? `${formatEther(balance.value)} ETH` : 'Loading...'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Payment Amount:</span>
          <span className="font-medium">{amount} ETH</span>
        </div>
      </div>

      {status === 'error' && (
        <Alert variant="destructive">
          <AlertDescription>
            {!hasSufficientBalance 
              ? `Insufficient balance. You need ${amount} ETH to proceed.`
              : 'An error occurred while processing the payment.'}
          </AlertDescription>
        </Alert>
      )}

      {status === 'success' && (
        <Alert>
          <AlertDescription>
            Payment processed successfully!
          </AlertDescription>
        </Alert>
      )}

      <button
        onClick={handlePayment}
        disabled={isProcessing || !hasSufficientBalance}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <Loader2 className="animate-spin mr-2" />
            Processing...
          </div>
        ) : (
          'Confirm Payment'
        )}
      </button>
    </div>
  );
};

const AgreementPayment = ({ contractorData, onComplete }) => {
  const [step, setStep] = useState('review'); // 'review' | 'payment' | 'complete'
  const [transactionHash, setTransactionHash] = useState('');

  const handlePaymentSuccess = (result) => {
    setTransactionHash(result.hash);
    setStep('complete');
    onComplete?.(result);
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
  };

  return (
    <Card className="w-full max-w-2xl p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Agreement Payment</h2>
      </div>
      
      <div className="mt-4">
        {step === 'review' && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Agreement Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Contractor:</span>
                  <span>{contractorData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span>{contractorData.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span>{contractorData.amount} ETH</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setStep('payment')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Proceed to Payment
            </button>
          </div>
        )}

        {step === 'payment' && (
          <PaymentFlow
            contractorAddress={contractorData.address}
            amount={contractorData.amount}
            agreementId={contractorData.agreementId}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        )}

        {step === 'complete' && (
          <div className="text-center space-y-4">
            <div className="text-green-500 flex justify-center">
              <svg
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium">Payment Complete!</h3>
            <p className="text-gray-500">
              Your agreement has been created and payment has been processed.
            </p>
            {transactionHash && (
              <div className="text-sm text-gray-500 break-all">
                Transaction Hash: {transactionHash}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default AgreementPayment;
