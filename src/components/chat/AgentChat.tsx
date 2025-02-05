'use client';

import { useState } from 'react';
import { getAgent } from '@/lib/agents/store';

interface ChatMessage {
  sender: string;
  content: string;
  isError?: boolean;
}

export default function AgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const clientAgent = getAgent('client');
    const contractorAgent = getAgent('contractor');

    if (!clientAgent || !contractorAgent) {
      setMessages(prev => [...prev, {
        sender: 'System',
        content: 'Please train both agents first!',
        isError: true
      }]);
      return;
    }

    setIsLoading(true);

    try {
      // Add user message to chat
      setMessages(prev => [...prev, {
        sender: 'You',
        content: newMessage
      }]);
      
      // Get response from contractor agent
      const response = await contractorAgent.chat(newMessage);
      
      // Add contractor response to chat
      setMessages(prev => [...prev, {
        sender: 'Contractor',
        content: response.text,
        isError: !!response.error
      }]);
      
      setNewMessage('');
    } catch (error) {
      console.error('Error in agent communication:', error);
      setMessages(prev => [...prev, {
        sender: 'System',
        content: 'Error in communication. Please try again.',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Agent Communication</h2>
      
      <div className="h-[400px] overflow-y-auto mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`mb-3 max-w-[85%] ${
              msg.sender === 'You' ? 'ml-auto' : 'mr-auto'
            }`}
          >
            <div className={`p-3 rounded-lg shadow-sm ${
              msg.sender === 'You' 
                ? 'bg-blue-600 text-white' 
                : msg.sender === 'Contractor'
                  ? 'bg-white border border-gray-200'
                  : msg.isError
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="font-medium mb-1 text-sm">
                {msg.sender === 'You' 
                  ? '' 
                  : `${msg.sender}:`}
              </div>
              <div className={`${
                msg.sender === 'You'
                  ? 'text-white'
                  : msg.isError
                    ? 'text-red-700'
                    : 'text-gray-700'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
