'use client';

import React, { useState, useCallback } from 'react';
import { getAgent } from '@/lib/agents/store';
import { BaseAgent } from '@/lib/agents/baseAgent';

interface ChatMessage {
  id: string;
  sender: 'You' | 'Contractor' | 'System';
  content: string;
  timestamp: number;
  isError?: boolean;
}

export default function AgentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessageEntry: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      ...message
    };
    setMessages(prev => [...prev, newMessageEntry]);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim and validate message
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage) return;

    // Get agents
    const clientAgent = getAgent('client');
    const contractorAgent = getAgent('contractor');

    // Validate agent availability
    if (!clientAgent || !contractorAgent) {
      addMessage({
        sender: 'System',
        content: 'Please train both client and contractor agents first!',
        isError: true
      });
      return;
    }

    // Reset input and set loading state
    setNewMessage('');
    setIsLoading(true);

    try {
      // Add user message to chat
      addMessage({
        sender: 'You',
        content: trimmedMessage
      });
      
      // Get response from contractor agent
      const response = await contractorAgent.chat(trimmedMessage);
      
      // Add contractor response to chat
      addMessage({
        sender: 'Contractor',
        content: response.text,
        isError: !!response.error
      });
    } catch (error) {
      console.error('Error in agent communication:', error);
      addMessage({
        sender: 'System',
        content: 'Communication error. Please try again.',
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Agent Communication</h2>
      
      {/* Chat Messages Container */}
      <div className="h-[400px] overflow-y-auto mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id}
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
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium text-sm">
                    {msg.sender !== 'You' && `${msg.sender}:`}
                  </div>
                  <span className="text-xs opacity-50">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
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
          ))
        )}
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Type your message to the contractor agent..."
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !newMessage.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
