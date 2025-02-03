'use client';

import { useState } from 'react';
import { initializeAgent } from '@/lib/agents/baseAgent';
import { setAgent } from '@/lib/agents/store';

interface ClientCriteria {
  projectType: string;
  budgetRange: string;
  timeframe: string;
  requirements: string;
  location: string;
  qualificationPreferences: string;
}

export default function ClientAgentForm() {
  const [criteria, setCriteria] = useState<ClientCriteria>({
    projectType: '',
    budgetRange: '',
    timeframe: '',
    requirements: '',
    location: '',
    qualificationPreferences: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCriteria(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const agent = await initializeAgent('client');
      
      // Format criteria for agent training
      const trainingPrompt = `
        Project Type: ${criteria.projectType}
        Budget Range: ${criteria.budgetRange}
        Timeframe: ${criteria.timeframe}
        Location: ${criteria.location}
        Required Qualifications: ${criteria.qualificationPreferences}
        Specific Requirements: ${criteria.requirements}
      `;

      setAgent('client', agent);
      console.log('Client agent trained with criteria:', criteria);

      setMessage({ type: 'success', text: 'Agent successfully trained!' });
    } catch (error) {
      console.error('Error training client agent:', error);
      setMessage({ type: 'error', text: 'Error training agent. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-xl font-bold mb-4">Train Your Client Agent</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Project Type
          </label>
          <select
            name="projectType"
            value={criteria.projectType}
            onChange={handleChange}
            className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Select project type</option>
            <option value="flooring">Flooring</option>
            <option value="plumbing">Plumbing</option>
            <option value="electrical">Electrical</option>
            <option value="painting">Painting</option>
            <option value="renovation">General Renovation</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Budget Range
          </label>
          <input
            type="text"
            name="budgetRange"
            value={criteria.budgetRange}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., $5,000 - $10,000"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Preferred Timeframe
          </label>
          <input
            type="text"
            name="timeframe"
            value={criteria.timeframe}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., Within 2 weeks"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={criteria.location}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., Austin, TX"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Contractor Qualification Preferences
          </label>
          <input
            type="text"
            name="qualificationPreferences"
            value={criteria.qualificationPreferences}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="e.g., Licensed, 5+ years experience"
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Specific Requirements
          </label>
          <textarea
            name="requirements"
            value={criteria.requirements}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Any specific requirements or preferences..."
            rows={4}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {isSubmitting ? 'Training Agent...' : 'Train Agent'}
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
