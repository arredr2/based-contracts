'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';

export default function ChatPage() {
  const { address } = useAccount();
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: newMessage }]);
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Thank you for your message. AI agent integration coming soon!' 
      }]);
    }, 1000);
    setNewMessage('');
  };

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg rounded-l-lg">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Conversations</h2>
        </div>
        <div className="p-4">
          <div className="text-sm text-gray-500">No previous conversations</div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white shadow-lg rounded-r-lg flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">Agent Chat</h1>
        </div>

        {!address ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Please connect your wallet to use the chat.</p>
              <div className="inline-block bg-blue-50 rounded-lg px-4 py-2 text-blue-700">
                Connect wallet to continue
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[70%] p-4 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p className="text-lg mb-2">Welcome to BasedContracts AI Chat</p>
                    <p className="text-sm">Start a conversation to get assistance with your project</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
