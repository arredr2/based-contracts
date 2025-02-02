'use client';

import { useState } from 'react';
import { parseEther } from 'viem';
import { useWriteContract } from 'wagmi';

// This is your deployed contract address from earlier
const CONTRACT_ADDRESS = '0xC47D123dFbC5DeDBb4508A861e5687Ac6053Cc38';

export default function CreateAgreementForm() {
  const [contractorAddress, setContractorAddress] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  const { writeContract, isLoading, isError, isSuccess } = useWriteContract();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const value = parseEther(amount);
      await writeContract({
        address: CONTRACT_ADDRESS,
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
        args: [contractorAddress, description],
        value
      });
    } catch (error) {
      console.error('Error creating agreement:', error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Create New Agreement</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Contractor Address
          </label>
          <input
            type="text"
            value={contractorAddress}
            onChange={(e) => setContractorAddress(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="0x..."
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Project description..."
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Amount (ETH)
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="0.0"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Agreement'}
        </button>

        {isSuccess && (
          <div className="text-green-600">Agreement created successfully!</div>
        )}

        {isError && (
          <div className="text-red-600">Error creating agreement. Please try again.</div>
        )}
      </form>
    </div>
  );
}
