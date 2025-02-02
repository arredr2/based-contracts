'use client';

import { useState } from 'react';

interface ContractorCriteria {
  services: string;
  pricing: string;
  availability: string;
  experience: string;
  licenses: string;
  preferredLocationRange: string;
  minimumJobSize: string;
  specializations: string;
}

export default function ContractorAgentForm() {
  const [criteria, setCriteria] = useState<ContractorCriteria>({
    services: '',
    pricing: '',
    availability: '',
    experience: '',
    licenses: '',
    preferredLocationRange: '',
    minimumJobSize: '',
    specializations: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCriteria(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Training contractor agent with criteria:', criteria);
      // AgentKit integration will go here
    } catch (error) {
      console.error('Error training agent:', error);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Train Your Contractor Agent</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Services Offered
          </label>
          <select
            name="services"
            value={criteria.services}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select primary service</option>
            <option value="flooring">Flooring</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="painting">Painting</option>
            <option value="renovation">General Renovation</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Pricing Structure
          </label>
          <textarea
            name="pricing"
            value={criteria.pricing}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., Hourly rate, fixed price per square foot, minimum charges..."
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Availability
          </label>
          <input
            type="text"
            name="availability"
            value={criteria.availability}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., Mon-Fri 9-5, Weekends only..."
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Years of Experience
          </label>
          <input
            type="text"
            name="experience"
            value={criteria.experience}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., 5+ years in residential flooring"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Licenses & Certifications
          </label>
          <textarea
            name="licenses"
            value={criteria.licenses}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="List relevant licenses and certifications..."
            rows={2}
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Preferred Service Area
          </label>
          <input
            type="text"
            name="preferredLocationRange"
            value={criteria.preferredLocationRange}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., Within 25 miles of Austin, TX"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Minimum Job Size
          </label>
          <input
            type="text"
            name="minimumJobSize"
            value={criteria.minimumJobSize}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., $1000 minimum, 500 sq ft minimum"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Specializations & Additional Skills
          </label>
          <textarea
            name="specializations"
            value={criteria.specializations}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Any specific specializations or additional skills..."
            rows={3}
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Train Agent
        </button>
      </form>
    </div>
  );
}
