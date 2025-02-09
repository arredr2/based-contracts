import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface Signature {
  signer: string;
  status: 'pending' | 'signed' | 'rejected';
  timestamp?: number;
}

interface MultiSigContractProps {
  contractId: string;
  requiredSigners: string[];
  onComplete: (success: boolean) => void;
}

const MultiSigContract: React.FC<MultiSigContractProps> = ({
  contractId,
  requiredSigners,
  onComplete,
}) => {
  const { address } = useAccount();
  const [signatures, setSignatures] = useState<Record<string, Signature>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize signatures state
    const initialSignatures: Record<string, Signature> = {};
    requiredSigners.forEach(signer => {
      initialSignatures[signer] = {
        signer,
        status: 'pending'
      };
    });
    setSignatures(initialSignatures);
  }, [requiredSigners]);

  const canSign = address && requiredSigners.includes(address);
  const hasSigned = address && signatures[address]?.status === 'signed';
  const allSigned = Object.values(signatures).every(sig => sig.status === 'signed');
  const hasRejection = Object.values(signatures).some(sig => sig.status === 'rejected');

  const handleSign = async () => {
    if (!address || !canSign || hasSigned) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Update signatures state
      setSignatures(prev => ({
        ...prev,
        [address]: {
          signer: address,
          status: 'signed',
          timestamp: Date.now()
        }
      }));

      // If all signatures are collected, complete the process
      const updatedSignatures = {
        ...signatures,
        [address]: {
          signer: address,
          status: 'signed',
          timestamp: Date.now()
        }
      };

      if (Object.values(updatedSignatures).every(sig => sig.status === 'signed')) {
        onComplete(true);
      }
    } catch (error) {
      console.error('Signing error:', error);
      setError('Failed to sign contract. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!address || !canSign || hasSigned) return;

    setIsProcessing(true);
    setError(null);

    try {
      setSignatures(prev => ({
        ...prev,
        [address]: {
          signer: address,
          status: 'rejected',
          timestamp: Date.now()
        }
      }));

      onComplete(false);
    } catch (error) {
      console.error('Rejection error:', error);
      setError('Failed to reject contract. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contract Signatures</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Signatures Status */}
          <div className="space-y-2">
            {Object.values(signatures).map(signature => (
              <div
                key={signature.signer}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  {signature.status === 'signed' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : signature.status === 'rejected' ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  )}
                  <span className="font-mono text-sm">
                    {signature.signer}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {signature.timestamp ? (
                    new Date(signature.timestamp).toLocaleString()
                  ) : (
                    'Pending'
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {canSign && !hasSigned && !hasRejection && (
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isProcessing}
                className="flex-1"
              >
                Reject Contract
              </Button>
              <Button
                onClick={handleSign}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Sign Contract'
                )}
              </Button>
            </div>
          )}

          {/* Status Messages */}
          {(allSigned || hasRejection || hasSigned) && (
            <Alert variant={hasRejection ? 'destructive' : 'default'}>
              <AlertDescription>
                {hasRejection
                  ? 'Contract has been rejected'
                  : allSigned
                  ? 'All parties have signed the contract'
                  : 'Waiting for other signatures...'}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiSigContract;
