'use client';

import { useState } from 'react';
import { getAgent } from '@/lib/agents/store';

export default function AgentChat() {
  const [messages, setMessages] = useState<Array<{ sender: string; content: string }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const clientAgent = getAgent('client');
    const contractorAgent = getAgent('contractor');

    if (!clientAgent || !contractorAgent) {
      alert('Please train both agents first!');
      return;
    }

    setIsLoading(true);

    try {
      // Add user message to chat
      const userMessage = { sender: 'Client', content: newMessage };
      setMessages(prev => [...prev, userMessage]);

      // Send message using the new sendMessage method
      const response = await contractorAgent.sendMessage(newMessage);

      // Add contractor response to chat
      const contractorMessage = { 
        sender: 'Contractor', 
        content: response.content
      };
      setMessages(prev => [...prev, contractorMessage]);

      setNewMessage('');
    } catch (error) {
      console.error('Error in agent communication:', error);
      setMessages(prev => [...prev, { 
        sender: 'System', 
        content: 'Error in communication. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Agent Communication</h2>
      
      <div className="h-64 overflow-y-auto mb-4 border rounded p-4">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`mb-2 p-2 rounded ${
              msg.sender === 'Client' 
                ? 'bg-blue-50 ml-8' 
                : msg.sender === 'Contractor' 
                  ? 'bg-gray-50 mr-8'
                  : 'bg-red-50'
            }`}
          >
            <span className="font-bold">{msg.sender}:</span> {msg.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
