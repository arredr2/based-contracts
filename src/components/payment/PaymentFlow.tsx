import React, { useState, useEffect } from 'react';
import { useAccount, useBalance, useNetwork } from 'wagmi';
import { parseEther } from 'viem';
import { FundButton, getOnrampBuyUrl } from '@coinbase/onchainkit/fund';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <Alert variant="destructive">
            <AlertDescription>
              There was an error processing your payment. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {paymentStatus === 'initial' && (
            <Button
              onClick={initializePayment}
              className="w-full"
            >
              Continue to Payment
            </Button>
          )}

          {paymentStatus === 'ready' && (
            <Button
              onClick={confirmPayment}
              className="w-full"
              disabled={!hasBalance}
            >
              Confirm Payment
            </Button>
          )}

          {paymentStatus === 'processing' && (
            <Button disabled className="w-full">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment
            </Button>
          )}
        </div>

        {/* Success Message */}
        {paymentStatus === 'completed' && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              Payment completed successfully!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentFlow;
