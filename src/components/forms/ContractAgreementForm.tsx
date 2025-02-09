import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContractFormData {
  contractorAddress: string;
  description: string;
  amount: string;
  duration: string;
  milestones: string;
}

interface ContractAgreementFormProps {
  onSubmit: (data: ContractFormData) => void;
}

export function ContractAgreementForm({ onSubmit }: ContractAgreementFormProps) {
  const [formData, setFormData] = useState<ContractFormData>({
    contractorAddress: '',
    description: '',
    amount: '',
    duration: '',
    milestones: ''
  });

  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Basic validation
    if (!formData.contractorAddress || !formData.description || !formData.amount) {
      setValidationError('Please fill in all required fields');
      return;
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(formData.contractorAddress)) {
      setValidationError('Invalid contractor address format');
      return;
    }

    // Validate amount is a positive number
    if (isNaN(Number(formData.amount)) || parseFloat(formData.amount) <= 0) {
      setValidationError('Amount must be a positive number');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Contractor Address
          <span className="text-red-500">*</span>
        </label>
        <Input
          name="contractorAddress"
          value={formData.contractorAddress}
          onChange={handleChange}
          placeholder="0x..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Project Description
          <span className="text-red-500">*</span>
        </label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the project scope and requirements..."
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Amount (ETH)
          <span className="text-red-500">*</span>
        </label>
        <Input
          name="amount"
          type="number"
          step="0.001"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.0"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Project Duration (days)
        </label>
        <Input
          name="duration"
          type="number"
          value={formData.duration}
          onChange={handleChange}
          placeholder="30"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Milestones
        </label>
        <Textarea
          name="milestones"
          value={formData.milestones}
          onChange={handleChange}
          placeholder="List project milestones..."
          rows={3}
        />
      </div>

      {validationError && (
        <Alert variant="destructive">
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full">
        Create Contract
      </Button>
    </form>
  );
}
