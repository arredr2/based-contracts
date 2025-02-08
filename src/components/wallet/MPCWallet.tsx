import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { CdpMPCWallet } from '@coinbase/cdp-agentkit-core';
import { useToast, Alert, AlertDescription, AlertTitle, Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
import { Loader2 } from 'lucide-react';

interface Transaction {
  id: string;
  to: string;
  amount: string;
  status: 'pending' | 'approved' | 'rejected' | 'failed';
  createdAt: number;
}

interface WalletState {
  address: string | null;
  balance: string;
  status: 'initializing' | 'ready' | 'recovering' | 'error';
  error?: string;
  pendingTransactions: Transaction[];
}

const MPCWallet: React.FC = () => {
  const { address: connectedAddress } = useAccount();
  const { toast } = useToast();
  const [wallet, setWallet] = useState<CdpMPCWallet | null>(null);
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    balance: '0',
    status: 'initializing',
    pendingTransactions: []
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initializeWallet();
  }, [connectedAddress]);

  const initializeWallet = async () => {
    if (!connectedAddress) return;

    try {
      setIsLoading(true);
      // Initialize CDP MPC Wallet
      const response = await fetch('/api/cdp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'mpc',
          threshold: 2, // 2-of-2 threshold signature
          description: `BasedContracts Wallet for ${connectedAddress}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initialize wallet');
      }

      const data = await response.json();
      const newWallet = new CdpMPCWallet(data.wallet);
      
      setWallet(newWallet);
      setWalletState({
        address: newWallet.address,
        balance: await newWallet.getBalance(),
        status: 'ready'
      });

      // Store wallet data securely
      localStorage.setItem(`mpc-wallet-${connectedAddress}`, JSON.stringify({
        address: newWallet.address,
        data: data.wallet
      }));

      toast({
        title: 'Wallet Initialized',
        description: 'Your MPC wallet is ready to use.',
      });
    } catch (error) {
      console.error('Wallet initialization error:', error);
      setWalletState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to initialize wallet'
      }));

      toast({
        title: 'Wallet Error',
        description: 'Failed to initialize MPC wallet',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecovery = async () => {
    if (!connectedAddress || !wallet) return;

    try {
      setWalletState(prev => ({ ...prev, status: 'recovering' }));
      
      // Initiate wallet recovery process
      await wallet.initiateRecovery();
      
      toast({
        title: 'Recovery Initiated',
        description: 'Wallet recovery process started. Please wait 24 hours.',
      });

      // Store recovery state
      localStorage.setItem(`mpc-wallet-recovery-${connectedAddress}`, Date.now().toString());
    } catch (error) {
      console.error('Recovery error:', error);
      toast({
        title: 'Recovery Error',
        description: 'Failed to start wallet recovery',
        variant: 'destructive'
      });
    }
  };

  const createTransaction = async (to: string, amount: string) => {
    if (!wallet) return;

    try {
      const response = await fetch('/api/cdp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'mpc_transaction',
          to,
          amount,
          walletAddress: walletState.address
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create transaction');
      }

      const data = await response.json();
      
      setWalletState(prev => ({
        ...prev,
        pendingTransactions: [
          ...prev.pendingTransactions,
          {
            id: data.transactionId,
            to,
            amount,
            status: 'pending',
            createdAt: Date.now()
          }
        ]
      }));

      toast({
        title: 'Transaction Created',
        description: 'Please approve the transaction in your wallet.',
      });
    } catch (error) {
      console.error('Transaction creation error:', error);
      toast({
        title: 'Transaction Error',
        description: 'Failed to create transaction',
        variant: 'destructive'
      });
    }
  };

  const approveTransaction = async (transactionId: string) => {
    if (!wallet) return;

    try {
      const response = await fetch('/api/cdp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'mpc_approve',
          transactionId,
          walletAddress: walletState.address
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve transaction');
      }

      setWalletState(prev => ({
        ...prev,
        pendingTransactions: prev.pendingTransactions.map(tx =>
          tx.id === transactionId ? { ...tx, status: 'approved' } : tx
        )
      }));

      toast({
        title: 'Transaction Approved',
        description: 'The transaction has been approved and will be processed.',
      });

      // Refresh balance after successful transaction
      await refreshBalance();
    } catch (error) {
      console.error('Transaction approval error:', error);
      toast({
        title: 'Approval Error',
        description: 'Failed to approve transaction',
        variant: 'destructive'
      });
    }
  };

  const rejectTransaction = async (transactionId: string) => {
    if (!wallet) return;

    try {
      const response = await fetch('/api/cdp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'mpc_reject',
          transactionId,
          walletAddress: walletState.address
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject transaction');
      }

      setWalletState(prev => ({
        ...prev,
        pendingTransactions: prev.pendingTransactions.map(tx =>
          tx.id === transactionId ? { ...tx, status: 'rejected' } : tx
        )
      }));

      toast({
        title: 'Transaction Rejected',
        description: 'The transaction has been rejected.',
      });
    } catch (error) {
      console.error('Transaction rejection error:', error);
      toast({
        title: 'Rejection Error',
        description: 'Failed to reject transaction',
        variant: 'destructive'
      });
    }
  };

  const refreshBalance = async () => {
    if (!wallet) return;

    try {
      const balance = await wallet.getBalance();
      setWalletState(prev => ({ ...prev, balance }));
    } catch (error) {
      console.error('Balance refresh error:', error);
    }
  };

  if (!connectedAddress) {
    return (
      <Alert>
        <AlertTitle>Not Connected</AlertTitle>
        <AlertDescription>
          Please connect your wallet to use the MPC wallet features.
        </AlertDescription>
      </Alert>
    );
  }

  if (walletState.status === 'error') {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {walletState.error}
          <Button 
            onClick={initializeWallet}
            className="mt-2"
            variant="outline"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>MPC Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-2xl font-bold">
                  {walletState.status.charAt(0).toUpperCase() + walletState.status.slice(1)}
                </p>
              </div>

              {walletState.address && (
                <div>
                  <p className="text-sm font-medium">Wallet Address</p>
                  <p className="font-mono text-sm">
                    {walletState.address}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium">Balance</p>
                <p className="text-2xl font-bold">
                  {walletState.balance} ETH
                  <Button
                    onClick={refreshBalance}
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                  >
                    Refresh
                  </Button>
                </p>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium">Pending Transactions</h3>
                <div className="mt-2 space-y-4">
                  {walletState.pendingTransactions
                    .filter(tx => tx.status === 'pending')
                    .map(tx => (
                      <Card key={tx.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">To: {tx.to}</p>
                            <p className="text-sm text-gray-500">Amount: {tx.amount} ETH</p>
                            <p className="text-sm text-gray-500">
                              Created: {new Date(tx.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => approveTransaction(tx.id)}
                              variant="default"
                              size="sm"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => rejectTransaction(tx.id)}
                              variant="destructive"
                              size="sm"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  {walletState.pendingTransactions.filter(tx => tx.status === 'pending').length === 0 && (
                    <p className="text-sm text-gray-500">No pending transactions</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <Button
                  onClick={handleRecovery}
                  variant="secondary"
                  disabled={walletState.status !== 'ready'}
                >
                  Initiate Recovery
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MPCWallet;
