'use client';

import MainLayout from '@/components/layout/MainLayout';
import ContractorAgentForm from '@/components/forms/ContractorAgentForm';

export default function ContractorPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Contractor Dashboard</h2>
          <p className="text-gray-600">
            Train your AI agent by providing your service details and preferences.
          </p>
        </div>
        
        <ContractorAgentForm />
      </div>
    </MainLayout>
  );
}
