'use client';

import { useState } from 'react';

export default function ClientAgentForm() {
  const [criteria, setCriteria] = useState({
    projectType: '',
    budgetRange: '',
    timeframe: '',
    requirements: '',
    location: '',
    qualificationPreferences: ''
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
      console.log('Training client agent with criteria:', criteria);
      // Here we'll add the AI agent training logic
    } catch (error) {
      console.error('Error training agent:', error);
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
            <option value="">Select a project type</option>
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
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Train Agent
        </button>
      </form>
    </div>
  );
}
