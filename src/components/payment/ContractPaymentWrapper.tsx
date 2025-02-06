import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import CreateAgreementForm from '@/components/CreateAgreementForm';
import PaymentFlow from '@/components/payment/PaymentFlow';

type ContractDetails = {
  contractor: string;
  description: string;
  amount: string;
};

export default function ContractPaymentWrapper() {
  const { address } = useAccount();
  const [step, setStep] = useState<'contract' | 'payment' | 'success'>('contract');
  const [contractDetails, setContractDetails] = useState<ContractDetails | null>(null);
  
  const handleContractSubmit = (details: ContractDetails) => {
    setContractDetails(details);
    setStep('payment');
  };
  
  const handlePaymentComplete = () => {
    setStep('success');
  };

  const handleStartNew = () => {
    setContractDetails(null);
    setStep('contract');
  };
  
  if (!address) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Please connect your wallet to create a contract agreement.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {step === 'contract' && (
        <CreateAgreementForm onSubmit={handleContractSubmit} />
      )}
      
      {step === 'payment' && contractDetails && (
        <PaymentFlow
          amount={contractDetails.amount}
          contractorAddress={contractDetails.contractor}
          projectDescription={contractDetails.description}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
      
      {step === 'success' && (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Contract Created Successfully</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Your contract has been created and payment has been processed.
              </p>
              
              {contractDetails && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div>
                    <span className="font-semibold">Contractor Address:</span>
                    <p className="text-sm text-gray-600">{contractDetails.contractor}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Amount:</span>
                    <p className="text-sm text-gray-600">{contractDetails.amount} ETH</p>
                  </div>
                  <div>
                    <span className="font-semibold">Description:</span>
                    <p className="text-sm text-gray-600">{contractDetails.description}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between mt-6">
                <Button
                  onClick={handleStartNew}
                  variant="outline"
                >
                  Create Another Contract
                </Button>
                <Button
                  onClick={() => window.location.href = '/dashboard'}
                >
                  View My Contracts
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
