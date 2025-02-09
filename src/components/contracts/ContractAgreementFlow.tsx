import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Steps } from '@/components/ui/steps';
import { ContractAgreementForm } from '../forms/ContractAgreementForm';
import { ContractPaymentFlow } from '../payment/ContractPaymentFlow';

const steps = [
  {
    id: 'contract',
    title: 'Create Contract',
    description: 'Set contract terms and details'
  },
  {
    id: 'payment',
    title: 'Payment',
    description: 'Review and complete payment'
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    description: 'Contract created and payment confirmed'
  }
];

export default function ContractAgreementFlow() {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState('contract');
  const [contractData, setContractData] = useState(null);
  const [error, setError] = useState('');

  const handleContractSubmit = (data) => {
    setContractData(data);
    setCurrentStep('payment');
  };

  const handlePaymentComplete = (success, txHash) => {
    if (success) {
      setCurrentStep('confirmation');
    } else {
      setError('Payment failed. Please try again.');
    }
  };

  if (!address) {
    return (
      <Alert>
        <AlertDescription>
          Please connect your wallet to create a contract agreement.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <Steps
        items={steps.map(step => ({
          ...step,
          status: 
            currentStep === step.id ? 'current' :
            steps.findIndex(s => s.id === currentStep) > steps.findIndex(s => s.id === step.id)
              ? 'complete'
              : 'upcoming'
        }))}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            {steps.find(step => step.id === currentStep)?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 'contract' && (
            <ContractAgreementForm onSubmit={handleContractSubmit} />
          )}

          {currentStep === 'payment' && contractData && (
            <ContractPaymentFlow
              contractData={contractData}
              onComplete={handlePaymentComplete}
            />
          )}

          {currentStep === 'confirmation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="bg-green-100 text-green-800 p-4 rounded-full">
                  <svg
                    className="h-8 w-8"
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
              </div>
              <h3 className="text-lg font-medium text-center">
                Contract Created Successfully!
              </h3>
              <p className="text-gray-500 text-center">
                Your contract has been created and payment has been processed.
              </p>
              <Button
                onClick={() => setCurrentStep('contract')}
                className="w-full"
              >
                Create Another Contract
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
