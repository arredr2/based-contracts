import React, { useState, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { formatEther } from 'viem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Hook to get all agreements for an address
const useUserAgreements = (userAddress: string | undefined) => {
  // Get total number of agreements
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

  // Get single agreement data
  const { data: agreements } = useContractRead({
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
    args: [0], // We'll filter results after
    enabled: Boolean(agreementCount && agreementCount > 0)
  });

  // Filter agreements for the user
  const userAgreements = agreements?.filter(
    agreement => agreement?.client === userAddress || agreement?.contractor === userAddress
  ) || [];

  return { agreements: userAgreements, isLoading: !agreements };
};

const TransactionHistory: React.FC = () => {
  const { address } = useAccount();
  const { agreements, isLoading } = useUserAgreements(address);
  const [error, setError] = useState<string | null>(null);

  const getStatusText = (status: number) => {
    const statuses = ['Created', 'In Progress', 'Under Review', 'Completed', 'Cancelled'];
    return statuses[status] || 'Unknown';
  };

  const getStatusBadgeVariant = (status: number) => {
    switch (status) {
      case 3: // Completed
        return 'bg-green-100 text-green-800';
      case 4: // Cancelled
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        {agreements.length === 0 ? (
          <p className="text-gray-500">No transactions found.</p>
        ) : (
          <div className="space-y-4">
            {agreements.map((agreement, index) => (
              <div 
                key={index}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{agreement.description}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(Number(agreement.createdAt) * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={getStatusBadgeVariant(agreement.status)}>
                    {getStatusText(agreement.status)}
                  </Badge>
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Amount: {formatEther(agreement.amount)} ETH</span>
                  <span>{address === agreement.client ? 'Sent' : 'Received'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
