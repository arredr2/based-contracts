'use client';

import MainLayout from '@/components/layout/MainLayout';
import AgentChat from '@/components/chat/AgentChat';

export default function ChatPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Agent Chat</h2>
          <p className="text-gray-600">
            Here you can test the communication between your trained client and contractor agents.
          </p>
        </div>
        
        <AgentChat />
      </div>
    </MainLayout>
  );
}
