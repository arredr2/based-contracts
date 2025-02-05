import React, { useState } from 'react';
import { getAgent } from '@/lib/agents/store';
import { useAccount, useBalance, useWriteContract } from 'wagmi';
import { parseEther, formatEther } from 'viem';

// PaymentFlow Component
const PaymentFlow = ({ 
  contractorAddress, 
  amount, 
  agreementId,
  onSuccess,
  onError 
}) => {
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  
  const { data: balance } = useBalance({
    address: address,
  });

  const { writeContract } = useWriteContract();

  const hasSufficientBalance = balance?.value >= parseEther(amount.toString());

  const handlePayment = async () => {
    if (!address || !contractorAddress) {
      setStatus('error');
      onError?.('Missing wallet connection');
      return;
    }

    if (!hasSufficientBalance) {
      setStatus('error');
      onError?.('Insufficient balance');
      return;
    }

    setIsProcessing(true);
    setStatus('processing');

    try {
      const result = await writeContract({
        address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        abi: [
          {
            inputs: [
              { name: 'contractor', type: 'address' },
              { name: 'description', type: 'string' }
            ],
            name: 'createAgreement',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'payable',
            type: 'function'
          }
        ],
        functionName: 'createAgreement',
        args: [contractorAddress, 'Agreement payment'],
        value: parseEther(amount.toString())
      });

      setStatus('success');
      onSuccess?.(result);
    } catch (error) {
      console.error('Payment error:', error);
      setStatus('error');
      onError?.(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-gray-50">
        <div className="flex justify-between mb-2">
          <span className="text-gray-600">Your Balance:</span>
          <span className="font-medium">
            {balance ? `${formatEther(balance.value)} ETH` : 'Loading...'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Payment Amount:</span>
          <span className="font-medium">{amount} ETH</span>
        </div>
      </div>

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {!hasSufficientBalance 
            ? `Insufficient balance. You need ${amount} ETH to proceed.`
            : 'An error occurred while processing the payment.'}
        </div>
      )}

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
          Payment processed successfully!
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={isProcessing || !hasSufficientBalance}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : 'Confirm Payment'}
      </button>
    </div>
  );
};

// Main Chat Component
export default function EnhancedAgentChat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [agreementDetails, setAgreementDetails] = useState(null);

  const handleSendMessage = async (e) => {
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
      setMessages(prev => [...prev, { sender: 'Client', content: newMessage }]);
      
      // Get response from contractor agent
      const response = await contractorAgent.chat(newMessage);
      
      // Add contractor response to chat
      setMessages(prev => [...prev, { sender: 'Contractor', content: response }]);

      // Check if agreement is reached
      if (response.toLowerCase().includes('agree') || response.toLowerCase().includes('deal')) {
        // Extract agreement details
        const amount = response.match(/\d+(\.\d+)? eth/i)?.[0] || '0.1';
        setAgreementDetails({
          name: "Contractor Name",
          service: "Service Description",
          amount: amount.replace(/ eth/i, ''),
          address: "0x...", // You'd get this from your contractor's wallet
          agreementId: Date.now()
        });
        setShowPayment(true);
      }
      
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

  const handlePaymentComplete = (result) => {
    setMessages(prev => [...prev, {
      sender: 'System',
      content: `Payment completed! Transaction hash: ${result.hash}`
    }]);
    setShowPayment(false);
    setAgreementDetails(null);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto">
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

      {showPayment && agreementDetails && (
        <div className="mt-6">
          <PaymentFlow 
            contractorData={agreementDetails}
            onComplete={handlePaymentComplete}
          />
        </div>
      )}
    </div>
  );
}
