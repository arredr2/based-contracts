import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Steps, StepItem } from '@/components/ui/steps';
import ContractTemplateSystem from './ContractTemplateSystem';
import ContractReview from './ContractReview';
import MultiSigContract from './MultiSigContract';

type WorkflowStep = 'template' | 'review' | 'signatures' | 'complete';

interface ContractData {
  template: string;
  sections: Record<string, string>;
  clientAddress: string;
  contractorAddress: string;
  timestamp: number;
}

const ContractWorkflow = () => {
  const { address } = useAccount();
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('template');
  const [contractData, setContractData] = useState<ContractData | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleTemplateGenerate = (templateData) => {
    setContractData({
      ...templateData,
      clientAddress: address!,
      timestamp: Date.now(),
    });
    setCurrentStep('review');
  };

  const handleReviewComplete = (approved: boolean, feedback?: string) => {
    if (approved) {
      setCurrentStep('signatures');
    } else {
      setReviewFeedback(feedback || null);
      setCurrentStep('template');
    }
  };

  const handleSignaturesComplete = (success: boolean) => {
    if (success) {
      setCurrentStep('complete');
    }
  };

  const getRequiredSigners = () => {
    if (!contractData) return [];
    return [contractData.clientAddress, contractData.contractorAddress];
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'template':
        return (
          <ContractTemplateSystem
            onTemplateSelect={handleTemplateSelect}
            onGenerateContract={handleTemplateGenerate}
            selectedTemplate={selectedTemplate}
            previousFeedback={reviewFeedback}
          />
        );

      case 'review':
        return contractData ? (
          <ContractReview
            contractData={contractData}
            onApprove={() => handleReviewComplete(true)}
            onRequestChanges={(feedback) => handleReviewComplete(false, feedback)}
          />
        ) : null;

      case 'signatures':
        return contractData ? (
          <MultiSigContract
            contractId={`${contractData.template}-${contractData.timestamp}`}
            requiredSigners={getRequiredSigners()}
            onComplete={handleSignaturesComplete}
          />
        ) : null;

      case 'complete':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Contract Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-green-600">
                  Contract has been successfully created and signed by all parties!
                </p>
                <Button
                  onClick={() => {
                    setCurrentStep('template');
                    setContractData(null);
                    setReviewFeedback(null);
                    setSelectedTemplate(null);
                  }}
                >
                  Create New Contract
                </Button>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  const steps: StepItem[] = [
    {
      id: 'template',
      title: 'Create Contract',
      description: 'Select and customize contract template',
      status: currentStep === 'template' ? 'current' 
        : currentStep === 'review' || currentStep === 'signatures' || currentStep === 'complete' 
        ? 'complete' : 'upcoming'
    },
    {
      id: 'review',
      title: 'AI Review',
      description: 'Review and analyze contract terms',
      status: currentStep === 'review' ? 'current'
        : currentStep === 'signatures' || currentStep === 'complete'
        ? 'complete' : 'upcoming'
    },
    {
      id: 'signatures',
      title: 'Collect Signatures',
      description: 'Gather required signatures',
      status: currentStep === 'signatures' ? 'current'
        : currentStep === 'complete'
        ? 'complete' : 'upcoming'
    },
    {
      id: 'complete',
      title: 'Complete',
      description: 'Contract finalized',
      status: currentStep === 'complete' ? 'complete' : 'upcoming'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <Steps items={steps} />

      {/* Current Step Content */}
      <div className="mt-8">
        {renderCurrentStep()}
      </div>

      {/* Previous Feedback Alert */}
      {currentStep === 'template' && reviewFeedback && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h3 className="font-medium text-yellow-800">Previous Review Feedback</h3>
          <p className="mt-1 text-sm text-yellow-700">{reviewFeedback}</p>
        </div>
      )}
    </div>
  );
};

export default ContractWorkflow;
