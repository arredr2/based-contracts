'use client';

import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import { parseEther } from 'viem';
import { FundButton, getOnrampBuyUrl } from '@coinbase/onchainkit/fund';
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
  const [isFunding, setIsFunding] = useState(false);

  // Get user's current balance
  const { data: balance } = useBalance({
    address,
    watch: true,
  });

  // Check if user has sufficient balance
  const hasBalance = balance?.value >= parseEther(amount);

  // Generate custom onramp URL with predefined amount
  const onrampUrl = getOnrampBuyUrl({
    projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID,
    addresses: { [address]: [chain?.id.toString()] },
    assets: ['ETH'],
    presetFiatAmount: Number(amount) * 2000, // Rough ETH to USD conversion for example
    fiatCurrency: 'USD'
  });

  // Handle funding complete
  const handleFundingComplete = () => {
    setIsFunding(false);
    if (hasBalance) {
      setPaymentStatus('ready');
    }
  };

  // Initialize payment flow
  const initializePayment = async () => {
    if (!hasBalance) {
      setIsFunding(true);
    } else {
      setPaymentStatus('ready');
    }
  };

  // Handle payment confirmation
  const confirmPayment = async () => {
    try {
      setPaymentStatus('processing');
      
      // This would integrate with your CreateAgreementForm logic
      // Call your smart contract here
      
      setPaymentStatus('completed');
      onPaymentComplete?.();
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
    }
  };

  // Watch for balance changes
  useEffect(() => {
    if (hasBalance && isFunding) {
      handleFundingComplete();
    }
  }, [hasBalance, isFunding]);

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

        {/* Fund Button Integration */}
        {isFunding && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Add Funds to Your Wallet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose your preferred method to add funds:
            </p>
            <div className="flex flex-col gap-4">
              <FundButton 
                fundingUrl={onrampUrl}
                text="Buy ETH with Card or Bank"
                openIn="popup"
              />
              <FundButton 
                text="Transfer from Coinbase"
                hideIcon={false}
              />
            </div>
            <button
              onClick={() => setIsFunding(false)}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Status Messages */}
        {paymentStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="text-sm">
              There was an error processing your payment. Please try again.
            </p>
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
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment
            </button>
          )}
        </div>

        {/* Success Message */}
        {paymentStatus === 'completed' && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
            <p className="text-sm">
              Payment completed successfully!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentFlow;
