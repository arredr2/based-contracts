import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import CreateAgreementForm from '@/components/forms/CreateAgreementForm';
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
      <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Connect Wallet</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Please connect your wallet to create a contract agreement.
          </p>
        </div>
      </div>
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
        <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Contract Created Successfully</h2>
          </div>
          <div className="p-6">
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
                <button
                  onClick={handleStartNew}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Create Another Contract
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  View My Contracts
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
