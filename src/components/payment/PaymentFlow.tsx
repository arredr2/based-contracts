import React, { useState } from 'react';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import { parseEther } from 'viem';
import { base } from 'viem/chains';
import { Loader2 } from 'lucide-react';

const PaymentFlow = ({ 
  amount, 
  onPaymentComplete,
  contractorAddress,
  projectDescription 
}) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const [paymentStatus, setPaymentStatus] = useState('initial');

  // Get user's current balance
  const { data: balance } = useBalance({
    address,
    watch: true,
  });

  // Check if user has sufficient balance
  const hasBalance = balance?.value >= parseEther(amount);

  // Initialize payment flow
  const initializePayment = async () => {
    if (!hasBalance) {
      setPaymentStatus('insufficient');
    } else {
      setPaymentStatus('ready');
    }
  };

  // Handle payment confirmation
  const confirmPayment = async () => {
    try {
      setPaymentStatus('processing');
      
      // This would integrate with your smart contract
      // Add your contract interaction logic here
      
      setPaymentStatus('completed');
      onPaymentComplete?.();
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
      </div>

      <div className="p-6 space-y-4">
        {/* Payment Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between mb-2">
            <span>Amount Required:</span>
            <span className="font-bold">{amount} ETH</span>
          </div>
          <div className="flex justify-between">
            <span>Current Balance:</span>
            <span>{balance ? `${Number(balance?.formatted).toFixed(4)} ETH` : '...'}</span>
          </div>
        </div>

        {/* Status Messages */}
        {paymentStatus === 'insufficient' && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            <p>Insufficient balance to complete this payment.</p>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md">
            <p>There was an error processing your payment. Please try again.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {paymentStatus === 'initial' && (
            <button
              onClick={initializePayment}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Continue to Payment
            </button>
          )}

          {paymentStatus === 'ready' && (
            <button
              onClick={confirmPayment}
              disabled={!hasBalance}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Payment
            </button>
          )}

          {paymentStatus === 'processing' && (
            <button
              disabled
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment
            </button>
          )}
        </div>

        {/* Success Message */}
        {paymentStatus === 'completed' && (
          <div className="bg-green-50 text-green-800 p-4 rounded-md">
            <p>Payment completed successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentFlow;
