'use client';

import ContractPaymentWrapper from '@/components/payment/ContractPaymentWrapper';
import Logo from '@/components/Logo';

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white shadow rounded-lg p-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Logo className="h-16 w-16 md:h-20 md:w-20" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Welcome to BasedContracts
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Connect your wallet to get started with managing your contractor agreements.
          </p>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-white shadow rounded-lg">
        <ContractPaymentWrapper />
      </div>
    </div>
  );
}
