import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { formatEther } from 'viem';

const TransactionHistory = () => {
  const { address } = useAccount();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Read agreements from the contract
  const { data: agreementCount } = useContractRead({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    abi: [
      {
        inputs: [],
        name: 'nextAgreementId',
        outputs: [{ type: 'uint256', name: '' }],
        stateMutability: 'view',
        type: 'function'
      }
    ],
    functionName: 'nextAgreementId'
  });

  useEffect(() => {
    const fetchAgreements = async () => {
      if (!address || !agreementCount) return;

      setIsLoading(true);
      setError(null);
      
      try {
        const agreementPromises = [];
        for (let i = 0; i < Number(agreementCount); i++) {
          agreementPromises.push(
            useContractRead({
              address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
              abi: [
                {
                  inputs: [{ type: 'uint256', name: 'agreementId' }],
                  name: 'getAgreement',
                  outputs: [
                    {
                      components: [
                        { name: 'client', type: 'address' },
                        { name: 'contractor', type: 'address' },
                        { name: 'amount', type: 'uint256' },
                        { name: 'description', type: 'string' },
                        { name: 'status', type: 'uint8' },
                        { name: 'createdAt', type: 'uint256' },
                        { name: 'completedAt', type: 'uint256' }
                      ],
                      type: 'tuple'
                    }
                  ],
                  stateMutability: 'view',
                  type: 'function'
                }
              ],
              functionName: 'getAgreement',
              args: [i]
            })
          );
        }

        const agreements = await Promise.all(agreementPromises);
        const userTransactions = agreements.filter(
          agreement => agreement?.client === address || agreement?.contractor === address
        );

        setTransactions(userTransactions);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transaction history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgreements();
  }, [address, agreementCount]);

  const getStatusText = (status) => {
    const statuses = ['Created', 'In Progress', 'Under Review', 'Completed', 'Cancelled'];
    return statuses[status] || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Transaction History</h2>
      
      {transactions.length === 0 ? (
        <p className="text-gray-500">No transactions found.</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <div 
              key={index}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{tx.description}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(Number(tx.createdAt) * 1000).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  tx.status === 3 ? 'bg-green-100 text-green-800' : 
                  tx.status === 4 ? 'bg-red-100 text-red-800' : 
                  'bg-blue-100 text-blue-800'
                }`}>
                  {getStatusText(tx.status)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>Amount: {formatEther(tx.amount)} ETH</span>
                <span>{address === tx.client ? 'Sent' : 'Received'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
