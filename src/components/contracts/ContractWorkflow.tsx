import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Steps, type StepItem } from '@/components/ui/Steps';
import { ContractAgreementForm } from '../forms/ContractAgreementForm';
import { ContractPaymentFlow } from '../payment/ContractPaymentFlow';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ContractData {
  contractorAddress: string;
  description: string;
  amount: string;
  duration?: string;
  milestones?: string;
}

const STEPS: StepItem[] = [
  {
    id: 'details',
    title: 'Contract Details',
    description: 'Define the project scope and terms',
    status: 'current'
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Review contract details',
    status: 'upcoming'
  },
  {
    id: 'payment',
    title: 'Payment',
    description: 'Complete the payment',
    status: 'upcoming'
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    description: 'Contract created',
    status: 'upcoming'
  }
];

export default function ContractWorkflow() {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState('details');
  const [isProcessing, setIsProcessing] = useState(false);
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const handleContractSubmit = (data: ContractData) => {
    setContractData(data);
    setCurrentStep('review');
  };

  const handleReview = (approved: boolean) => {
    if (approved) {
      setCurrentStep('payment');
    } else {
      setCurrentStep('details');
    }
  };

  const handlePaymentComplete = (success: boolean, txHash?: string) => {
    if (success && txHash) {
      setTransactionHash(txHash);
      setCurrentStep('confirmation');
    } else {
      setError('Payment failed. Please try again.');
    }
  };

  const getUpdatedSteps = () => {
    const currentIndex = STEPS.findIndex(step => step.id === currentStep);
    
    return STEPS.map((step, index) => ({
      ...step,
      status: index < currentIndex ? 'complete' : 
              index === currentIndex ? 'current' : 'upcoming'
    }));
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'details':
        return (
          <ContractAgreementForm 
            onSubmit={handleContractSubmit}
            initialData={contractData}
          />
        );

      case 'review':
        return contractData ? (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Contractor Address</h3>
                <p className="mt-1 font-mono">{contractData.contractorAddress}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                <p className="mt-1">{contractData.amount} ETH</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1">{contractData.description}</p>
              </div>
              {contractData.duration && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                  <p className="mt-1">{contractData.duration} days</p>
                </div>
              )}
              {contractData.milestones && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Milestones</h3>
                  <p className="mt-1 whitespace-pre-line">{contractData.milestones}</p>
                </div>
              )}
            </div>
            <div className="flex space-x-4 justify-end">
              <Button variant="outline" onClick={() => handleReview(false)}>
                Edit Details
              </Button>
              <Button onClick={() => handleReview(true)}>
                Proceed to Payment
              </Button>
            </div>
          </div>
        ) : null;

      case 'payment':
        return contractData ? (
          <ContractPaymentFlow
            contractData={contractData}
            onComplete={handlePaymentComplete}
          />
        ) : null;

      case 'confirmation':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Contract Created Successfully!
            </h3>
            <p className="text-sm text-gray-500">
              Your contract has been created and payment has been processed.
            </p>
            {transactionHash && (
              <div className="text-sm text-gray-500 font-mono break-all">
                Transaction: {transactionHash}
              </div>
            )}
            <Button
              onClick={() => {
                setCurrentStep('details');
                setContractData(null);
                setTransactionHash(null);
              }}
              className="mt-4"
            >
              Create Another Contract
            </Button>
          </div>
        );

      default:
        return null;
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
    <div className="max-w-4xl mx-auto space-y-8">
      <Steps items={getUpdatedSteps()} />

      <Card>
        <CardHeader>
          <CardTitle>
            {STEPS.find(step => step.id === currentStep)?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isProcessing ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            renderCurrentStep()
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
