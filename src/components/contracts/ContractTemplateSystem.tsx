import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface ContractTemplate {
  id: string;
  name: string;
  sections: ContractSection[];
}

interface ContractSection {
  id: string;
  title: string;
  content: string;
  isRequired: boolean;
  isEditable: boolean;
}

const ContractTemplateSystem = ({
  onTemplateSelect,
  onGenerateContract,
  selectedTemplate,
}) => {
  const { address } = useAccount();
  const [templates, setTemplates] = useState<ContractTemplate[]>([
    {
      id: 'general-services',
      name: 'General Services Agreement',
      sections: [
        {
          id: 'parties',
          title: 'Parties',
          content: `This agreement is made between [Client Name] ("Client") and [Contractor Name] ("Contractor") on [Date].`,
          isRequired: true,
          isEditable: true,
        },
        {
          id: 'scope',
          title: 'Scope of Work',
          content: `The Contractor agrees to perform the following services:
          
[Detailed description of services]

Timeline: [Start Date] to [End Date]`,
          isRequired: true,
          isEditable: true,
        },
        {
          id: 'payment',
          title: 'Payment Terms',
          content: `Total Payment Amount: [Amount] ETH
Payment Schedule: [Schedule Details]
Payment Method: Base Network Smart Contract`,
          isRequired: true,
          isEditable: true,
        },
        {
          id: 'terms',
          title: 'Terms and Conditions',
          content: `1. The Contractor shall provide all necessary tools and materials.
2. Any modifications to the scope must be agreed upon in writing.
3. The Client agrees to provide necessary access and information.
4. This agreement is governed by [Jurisdiction].`,
          isRequired: true,
          isEditable: true,
        }
      ]
    }
  ]);

  const [editableSections, setEditableSections] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedTemplate) {
      const initialSections = {};
      selectedTemplate.sections.forEach(section => {
        initialSections[section.id] = section.content;
      });
      setEditableSections(initialSections);
    }
  }, [selectedTemplate]);

  const handleSectionChange = (sectionId: string, content: string) => {
    setEditableSections(prev => ({
      ...prev,
      [sectionId]: content
    }));
  };

  const handleGenerateContract = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const contractData = {
        template: selectedTemplate.id,
        sections: editableSections,
        clientAddress: address,
        timestamp: Date.now()
      };

      await onGenerateContract(contractData);
    } catch (error) {
      setError('Failed to generate contract');
      console.error('Contract generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Contract Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(template => (
              <Button
                key={template.id}
                variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                className="h-24 flex flex-col items-start p-4"
                onClick={() => onTemplateSelect(template)}
              >
                <span className="font-semibold">{template.name}</span>
                <span className="text-sm text-gray-500">
                  {template.sections.length} sections
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contract Editor */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Contract Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {selectedTemplate.sections.map(section => (
                <div key={section.id} className="space-y-2">
                  <h3 className="font-medium">
                    {section.title}
                    {section.isRequired && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </h3>
                  <Textarea
                    value={editableSections[section.id] || ''}
                    onChange={(e) => handleSectionChange(section.id, e.target.value)}
                    disabled={!section.isEditable}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              ))}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleGenerateContract}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Contract...
                  </>
                ) : (
                  'Generate Contract'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ContractTemplateSystem;
