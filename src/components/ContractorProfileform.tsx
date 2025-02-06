import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

interface ContractorProfileFormProps {
  onComplete: () => void;
  inviteId: string;
  clientAddress: string;
}

interface ProfileFormData {
  businessName: string;
  contactName: string;
  phone: string;
  services: string[];
  experience: string;
  licenseNumber: string;
  serviceArea: string;
  availability: string;
  minimumJobSize: string;
  insuranceInfo: string;
  preferredPaymentMethods: string[];
}

export default function ContractorProfileForm({
  onComplete,
  inviteId,
  clientAddress
}: ContractorProfileFormProps) {
  const { address } = useAccount();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    businessName: '',
    contactName: '',
    phone: '',
    services: [],
    experience: '',
    licenseNumber: '',
    serviceArea: '',
    availability: '',
    minimumJobSize: '',
    insuranceInfo: '',
    preferredPaymentMethods: []
  });

  const serviceOptions = [
    'Flooring',
    'Plumbing',
    'Electrical',
    'Painting',
    'General Renovation',
    'HVAC',
    'Roofing',
    'Landscaping'
  ];

  const paymentOptions = [
    'Crypto',
    'Bank Transfer',
    'Credit Card',
    'Zelle',
    'Venmo'
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceChange = (values: string[]) => {
    setFormData(prev => ({
      ...prev,
      services: values
    }));
  };

  const handlePaymentMethodChange = (values: string[]) => {
    setFormData(prev => ({
      ...prev,
      preferredPaymentMethods: values
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      const requiredFields: (keyof ProfileFormData)[] = [
        'businessName',
        'contactName',
        'phone',
        'services',
        'experience',
        'serviceArea'
      ];

      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Submit profile data
      const response = await fetch('/api/contractor-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          inviteId,
          contractorAddress: address,
          clientAddress
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      toast({
        title: 'Profile Created',
        description: 'Your contractor profile has been created successfully.',
      });

      onComplete();
    } catch (error) {
      console.error('Profile creation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="contactName">Contact Name *</Label>
              <Input
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label>Services Offered *</Label>
              <Select 
                onValueChange={(value) => handleServiceChange([value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select services" />
                </SelectTrigger>
                <SelectContent>
                  {serviceOptions.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="experience">Years of Experience *</Label>
              <Input
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                placeholder="e.g., 5+ years in residential construction"
              />
            </div>

            <div>
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label htmlFor="serviceArea">Service Area *</Label>
              <Input
                id="serviceArea"
                name="serviceArea"
                value={formData.serviceArea}
                onChange={handleInputChange}
                placeholder="e.g., Within 25 miles of Austin, TX"
              />
            </div>

            <div>
              <Label htmlFor="availability">Typical Availability</Label>
              <Input
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                placeholder="e.g., Mon-Fri 9am-5pm"
              />
            </div>

            <div>
              <Label htmlFor="minimumJobSize">Minimum Job Size</Label>
              <Input
                id="minimumJobSize"
                name="minimumJobSize"
                value={formData.minimumJobSize}
                onChange={handleInputChange}
                placeholder="e.g., $1000 minimum"
              />
            </div>

            <div>
              <Label>Preferred Payment Methods</Label>
              <Select 
                onValueChange={(value) => handlePaymentMethodChange([value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment methods" />
                </SelectTrigger>
                <SelectContent>
                  {paymentOptions.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="insuranceInfo">Insurance Information</Label>
            <Textarea
              id="insuranceInfo"
              name="insuranceInfo"
              value={formData.insuranceInfo}
              onChange={handleInputChange}
              placeholder="Details about your insurance coverage..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
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
}
