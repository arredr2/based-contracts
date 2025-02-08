import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { base } from 'viem/chains';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  MultiSigPaymentService, 
  type MultiSigPayment, 
  type SignatureRequest 
} from '@/services/multiSigPayment';
import { MPCWallet } from '@/components/wallet/MPCWallet';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface MultiSigPaymentFlowProps {
  amount: string;
  contractorAddress: string;
  requiredSigners: string[];
  minSignatures: number;
  onPaymentComplete: (success: boolean, txHash?: string) => void;
}

const MultiSigPaymentFlow: React.FC<MultiSigPaymentFlowProps> = ({
  amount,
  contractorAddress,
  requiredSigners,
  minSignatures,
  onPaymentComplete
}) => {
  const { address } = useAccount();
  const [mpcWallet, setMpcWallet] = useState<MPCWallet | null>(null);
  const [paymentService, setPaymentService] = useState<MultiSigPaymentService | null>(null);
  const [payment, setPayment] = useState<MultiSigPayment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const initializeServices = async () => {
      if (!address) return;

      try {
        // Initialize MPC wallet
        const wallet = new MPCWallet({
          address,
          chainId: base.id,
          threshold: 2, // 2-of-2 MPC
        });
        setMpcWallet(wallet);

        // Initialize payment service
        const service = new MultiSigPaymentService(
          wallet,
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
        );
        setPaymentService(service);

        // Create initial payment
        const newPayment = await service.createMultiSigPayment(
          amount,
          contractorAddress,
          requiredSigners,
          minSignatures
        );
        setPayment(newPayment);
      } catch (error) {
        console.error('Initialization error:', error);
        setError('Failed to initialize payment services');
      }
    };

    initializeServices();
  }, [address, amount, contractorAddress, requiredSigners, minSignatures]);

  const handleSign = async () => {
    if (!paymentService || !payment || !address) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      // Add signature
      const updatedPayment = await paymentService.addSignature(payment, address);
      setPayment(updatedPayment);

      // If we have enough signatures, execute the payment
      if (updatedPayment.status === 'processing') {
        const txHash = await paymentService.executeMultiSigPayment(updatedPayment);
        onPaymentComplete(true, txHash);
      }
    } catch (error) {
      console.error('Signing error:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!paymentService || !payment || !address) return;

    setIsProcessing(true);
    setError(null);

    try {
      const updatedPayment = await paymentService.rejectSignature(payment, address);
      setPayment(updatedPayment);
      if (updatedPayment.status === 'failed') {
        onPaymentComplete(false);
      }
    } catch (error) {
      console.error('Rejection error:', error);
      setError(error instanceof Error ? error.message : 'Failed to reject payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderSignatureStatus = (signature: SignatureRequest) => {
    const statusConfig = {
      pending: { icon: AlertTriangle, color: 'text-yellow-500', text: 'Pending' },
      approved: { icon: CheckCircle2, color: 'text-green-500', text: 'Approved' },
      rejected: { icon: XCircle, color: 'text-red-500', text: 'Rejected' }
    };

    const { icon: Icon, color, text } = statusConfig[signature.status];

    return (
      <div className="flex items-center space-x-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <span>{text}</span>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Multi-Signature Payment
          {payment && (
            <Badge variant="outline">
              {payment.signatures.filter(sig => sig.status === 'approved').length} of {minSignatures} Signatures
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Payment Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Amount</span>
                <p className="font-medium">{amount} ETH</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status</span>
                <p className="font-medium capitalize">{payment?.status}</p>
              </div>
            </div>
          </div>

          {/* Signatures List */}
          {payment && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Required Signatures</h3>
              {payment.signatures.map((sig) => (
                <div
                  key={sig.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-mono text-sm">{sig.signer}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(sig.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {renderSignatureStatus(sig)}
                </div>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          {payment && address && payment.requiredSigners.includes(address) && (
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={isProcessing || payment.signatures.find(sig => sig.signer === address)?.status !== 'pending'}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Reject Payment'
                )}
              </Button>
              <Button
                onClick={handleSign}
                disabled={isProcessing || payment.signatures.find(sig => sig.signer === address)?.status !== 'pending'}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Sign Payment'
                )}
              </Button>
            </div>
          )}

          {/* MPC Wallet */}
          {payment && address && payment.requiredSigners.includes(address) && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Your MPC Wallet</h3>
              <MPCWallet />
            </div>
          )}

          {/* Progress Message */}
          {payment && payment.status === 'processing' && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Processing payment with {payment.signatures.filter(sig => sig.status === 'approved').length} signatures...
              </AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {payment && payment.status === 'completed' && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                Payment completed successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Failure Message */}
          {payment && payment.status === 'failed' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Payment failed. One or more signers rejected the payment.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiSigPaymentFlow;
