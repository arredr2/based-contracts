'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useAccount, useConnect } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { MPCWallet } from '@/components/wallet';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ContractorProfileForm } from '@/components/forms/ContractorProfileForm';

interface ProjectContext {
  projectDetails: string;
  clientAddress: string;
  timestamp: number;
}

interface OnboardingStep {
  id: string;
  title: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  description: string;
}

export default function ContractorOnboard() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'invite',
      title: 'Verify Invitation',
      status: 'pending',
      description: 'Verifying your invitation link...'
    },
    {
      id: 'wallet',
      title: 'Connect Wallet',
      status: 'pending',
      description: 'Connect your existing wallet or create a new one'
    },
    {
      id: 'profile',
      title: 'Create Profile',
      status: 'pending',
      description: 'Set up your contractor profile'
    }
  ]);

  useEffect(() => {
    const verifyInvite = async () => {
      try {
        const inviteId = params.inviteId as string;
        const contextParam = searchParams.get('context');

        if (!contextParam) {
          throw new Error('Invalid invitation link');
        }

        // Decode context from base64
        const decodedContext = JSON.parse(
          Buffer.from(contextParam, 'base64').toString()
        ) as ProjectContext;

        // Verify invitation hasn't expired (7 days)
        const expirationTime = decodedContext.timestamp + 7 * 24 * 60 * 60 * 1000;
        if (Date.now() > expirationTime) {
          throw new Error('Invitation has expired');
        }

        setProjectContext(decodedContext);
        updateStepStatus('invite', 'completed');
        updateStepStatus('wallet', 'active');
      } catch (error) {
        console.error('Verification error:', error);
        updateStepStatus('invite', 'error');
        toast({
          title: 'Invalid Invitation',
          description: error instanceof Error ? error.message : 'Failed to verify invitation',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyInvite();
  }, [params.inviteId, searchParams, toast]);

  useEffect(() => {
    if (isConnected && address) {
      updateStepStatus('wallet', 'completed');
      updateStepStatus('profile', 'active');
    }
  }, [isConnected, address]);

  const updateStepStatus = (stepId: string, status: OnboardingStep['status']) => {
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  const handleConnect = async () => {
    const connector = connectors[0]; // Using first available connector
    if (connector) {
      try {
        await connect({ connector });
      } catch (error) {
        console.error('Connection error:', error);
        toast({
          title: 'Connection Failed',
          description: 'Failed to connect wallet',
          variant: 'destructive'
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Contractor Onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          {projectContext && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Project Details</AlertTitle>
              <AlertDescription>
                {projectContext.projectDetails}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`p-4 rounded-lg border ${
                  step.status === 'active'
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {step.status === 'completed' ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : step.status === 'error' ? (
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    ) : step.status === 'active' ? (
                      <div className="h-6 w-6 rounded-full bg-blue-500" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gray-200" />
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-lg font-medium">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="text-sm text-gray-500">{step.description}</p>

                    {step.status === 'active' && (
                      <div className="mt-4">
                        {step.id === 'wallet' && (
                          <div className="space-y-4">
                            {!isConnected && (
                              <Button onClick={handleConnect}>
                                Connect Wallet
                              </Button>
                            )}
                            <MPCWallet />
                          </div>
                        )}
                        
                        {step.id === 'profile' && (
                          <div className="space-y-4">
                            {projectContext && (
                              <ContractorProfileForm
                                onComplete={() => updateStepStatus('profile', 'completed')}
                                inviteId={params.inviteId as string}
                                clientAddress={projectContext.clientAddress}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
