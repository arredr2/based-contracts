'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import ClientAgentForm from '@/components/forms/ClientAgentForm';

export default function ClientPage() {
  const { address } = useAccount();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {!showForm ? (
        <div className="grid grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="col-span-1 bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <button 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium"
                onClick={() => setShowForm(true)}
              >
                Create New Project
              </button>
              <button 
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium"
                onClick={() => alert('Coming soon!')}
              >
                View Projects
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-2 bg-white shadow rounded-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Client Dashboard</h1>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Active Projects</h3>
                <p className="text-gray-600">No active projects</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
                <p className="text-gray-600">No recent activity</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              ← Back to Dashboard
            </button>
          </div>
          <div className="p-6">
            <ClientAgentForm />
          </div>
        </div>
      )}
    </div>
  );
}
