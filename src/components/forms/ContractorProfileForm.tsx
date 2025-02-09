// src/components/forms/ContractorProfileForm.tsx
'use client';

import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import { Alert, AlertDescription, useToast } from '@/components/ui';
import { Loader2 } from 'lucide-react';

interface ContractorProfileFormProps {
  inviteId: string;
  clientAddress: string;
  onComplete: () => void;
}

export const ContractorProfileForm: React.FC<ContractorProfileFormProps> = ({
  inviteId,
  clientAddress,
  onComplete
}) => {
  // Rest of your component code stays the same
  const { address } = useAccount();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    serviceType: '',
    experience: '',
    rate: '',
    availability: '',
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contractor-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteId,
          contractorAddress: address,
          clientAddress,
          ...formData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      toast({
        title: 'Profile Created',
        description: 'Your contractor profile has been created successfully.'
      });

      onComplete();
    } catch (error) {
      console.error('Profile creation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create profile',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Your Contractor Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Service Type</label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              required
            >
              <option value="">Select service type</option>
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical</option>
              <option value="carpentry">Carpentry</option>
              <option value="painting">Painting</option>
              <option value="flooring">Flooring</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Years of Experience</label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hourly Rate (ETH)</label>
            <input
              type="text"
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="0.1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Availability</label>
            <input
              type="text"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="e.g., Weekdays 9-5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Service Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              placeholder="e.g., Austin, TX"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create Profile'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Add a default export
export default ContractorProfileForm;
