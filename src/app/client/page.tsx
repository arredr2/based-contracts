'use client';

import MainLayout from '@/components/layout/MainLayout';
import ClientAgentForm from '@/components/forms/ClientAgentForm';

export default function ClientPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Client Dashboard</h2>
          <p className="text-gray-600">
            Train your AI agent by providing your preferences and requirements for contractors.
          </p>
        </div>
        
        <ClientAgentForm />
      </div>
    </MainLayout>
  );
}
