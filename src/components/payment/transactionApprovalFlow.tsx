import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { base } from 'viem/chains';
import { Card, CardContent, CardHeader, CardTitle, Button, Alert, AlertDescription, Badge } from '@/components/ui';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { 
  TransactionWorkflowService,
  type TransactionWorkflow,
  type ApprovalRole 
} from '@/services/transactionWorkflow';
import { MPCWallet } from '@/components/wallet/MPCWallet';

interface TransactionApprovalProps {
  amount: string;
  recipientAddress: string;
  description: string;
  userRole: ApprovalRole;
  onComplete: (success: boolean, txHash?: string) => void;
}

const TransactionApproval: React.FC<TransactionApprovalProps> = ({
  amount,
  recipientAddress,
  description,
  userRole,
  onComplete
}) => {
  const { address } = useAccount();
  const [mpcWallet, setMpcWallet] = useState<MPCWallet | null>(null);
  const [workflowService, setWorkflowService] = useState<TransactionWorkflowService | null>(null);
  const [workflow, setWorkflow] = useState<TransactionWorkflow | null>(null);
  const [comments, setComments] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const initializeWorkflow = async () => {
      if (!address) return;

      try {
        // Initialize MPC wallet
        const wallet = new MPCWallet({
          address,
          chainId: base.id,
          threshold: 2,
        });
        setMpcWallet(wallet);

        // Initialize workflow service
        const service = new TransactionWorkflowService(
          wallet,
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!
        );
        setWorkflowService(service);

        // Create initial workflow with approval steps
        const newWorkflow = await service.createWorkflow(
          amount,
          recipientAddress,
          description,
          [
            {
              id: 'client-approval',
              role: 'client',
              order: 0,
              required: true
            },
            {
              id: 'contractor-approval',
              role: 'contractor',
              order: 1,
              required: true
            },
            {
              id: 'admin-review',
              role: 'admin',
              order: 2,
              required: false
            }
          ]
        );
        setWorkflow(newWorkflow);
      } catch (error) {
        console.error('Workflow initialization error:', error);
        setError('Failed to initialize approval workflow');
      }
    };

    initializeWorkflow();
  }, [address, amount, recipientAddress, description]);

  const handleApproval = async (approved: boolean) => {
    if (!workflowService || !workflow || !address) return;

    setIsProcessing(true);
    setError(null);

    try {
      const updatedWorkflow = await workflowService.processApproval(
        workflow,
        address,
        userRole,
        approved,
        comments
      );

      setWorkflow(updatedWorkflow);

      if (updatedWorkflow.status === 'completed') {
        onComplete(true, updatedWorkflow.transactionHash);
      } else if (updatedWorkflow.status === 'rejected') {
        onComplete(false);
      }
    } catch (error) {
      console.error('Approval error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process approval');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStepStatus = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'skipped':
        return <Badge className="bg-gray-100 text-gray-800">Skipped</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const canApprove = workflow && workflowService?.canApprove(workflow, address!, userRole);

  const getProgressStatus = () => {
    if (!workflow) return { completed: 0, total: 0, required: 0 };
    return workflowService?.getApprovalStatus(workflow) || { completed: 0, total: 0, required: 0 };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Transaction Approval Flow
          {workflow && (
            <Badge variant="outline">
              {getProgressStatus().completed} of {getProgressStatus().required} Required Approvals
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Transaction Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Amount</span>
                <p className="font-medium">{amount} ETH</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Status</span>
                <p className="font-medium capitalize">{workflow?.status}</p>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-500">Description</span>
                <p className="font-medium">{description}</p>
              </div>
            </div>
          </div>

          {/* Approval Steps */}
          {workflow && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Approval Steps</h3>
              {workflow.steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium capitalize">{step.role}</span>
                      {step.required && (
                        <Badge variant="secondary">Required</Badge>
                      )}
                    </div>
                    {step.approver && (
                      <p className="text-sm text-gray-500 font-mono mt-1">
                        {step.approver}
                      </p>
                    )}
                    {step.comments && (
                      <p className="text-sm text-gray-600 mt-1">
                        {step.comments}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStepStatus(step.status)}
                    {step.timestamp && (
                      <span className="text-sm text-gray-500">
                        {new Date(step.timestamp).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comments Input */}
          {canApprove && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Comments</h3>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add any comments about your decision..."
                className="w-full h-24 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {canApprove && (
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => handleApproval(false)}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Reject Transaction'
                )}
              </Button>
              <Button
                onClick={() => handleApproval(true)}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Approve Transaction'
                )}
              </Button>
            </div>
          )}

          {/* MPC Wallet */}
          {canApprove && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Your MPC Wallet</h3>
              <MPCWallet />
            </div>
          )}

          {/* Status Messages */}
          {workflow?.status === 'processing' && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Processing transaction with all required approvals...
              </AlertDescription>
            </Alert>
          )}

          {workflow?.status === 'completed' && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                Transaction completed successfully!
                {workflow.transactionHash && (
                  <p className="text-sm font-mono mt-1">
                    Transaction Hash: {workflow.transactionHash}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {workflow?.status === 'rejected' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Transaction has been rejected.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionApproval;
