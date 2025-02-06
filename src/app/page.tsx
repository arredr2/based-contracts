'use client';

import MainLayout from '@/components/layout/MainLayout';
import ContractPaymentWrapper from '@/components/payment/ContractPaymentWrapper';
import Logo10Svg from '@/page/basedcontracts_logo_10.svg';

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Welcome to BasedContracts</h2>
            <Logo10Svg className="h-8 w-auto" />
          </div>
          <p className="text-gray-600">
            Connect your wallet to get started with managing your contractor agreements.
          </p>
        </div>

        <ContractPaymentWrapper />
      </div>
    </MainLayout>
  );
}
