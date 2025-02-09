import React, { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { CdpMPCWallet } from '@coinbase/cdp-agentkit-core';
import { useToast } from '@/components/ui/Toast';
import { Alert, AlertDescription, AlertTitle, Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
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

  const initializeWallet = useCallback(async () => {
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
        status: 'ready',
        pendingTransactions: []
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
  }, [connectedAddress, toast]);

  useEffect(() => {
    if (connectedAddress) {
      initializeWallet();
    }
  }, [connectedAddress, initializeWallet]);

  const handleRecovery = async () => {
    if (!connectedAddress || !wallet) return;

    try {
      setWalletState(prev => ({ ...prev, status: 'recovering' }));
      
      await wallet.initiateRecovery();
      
      toast({
        title: 'Recovery Initiated',
        description: 'Wallet recovery process started. Please wait 24 hours.',
      });

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
