'use client';

import MainLayout from '@/components/layout/MainLayout';
import CreateAgreementForm from '@/components/forms/CreateAgreementForm';

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Welcome to BasedContracts</h2>
          <p className="text-gray-600">
            Connect your wallet to get started with managing your contractor agreements.
          </p>
        </div>
        
        <CreateAgreementForm />
      </div>
    </MainLayout>
  );
}
