import React from 'react';
import { CheckCircle2, CircleDot } from 'lucide-react';

export interface StepItem {
  id: string;
  title: string;
  description: string;
  status: 'upcoming' | 'current' | 'complete';
}

interface StepsProps {
  items: StepItem[];
}

export const Steps: React.FC<StepsProps> = ({ items }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`flex flex-col items-center relative flex-1 ${
              index !== items.length - 1 ? 'after:content-[""] after:absolute after:top-5 after:w-full after:h-0.5 after:bg-gray-200 after:left-1/2' : ''
            }`}
          >
            {/* Step Icon */}
            <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-gray-200">
              {item.status === 'complete' ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : item.status === 'current' ? (
                <CircleDot className="w-6 h-6 text-blue-500" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200" />
              )}
            </div>

            {/* Step Title */}
            <div className="mt-2 text-sm font-medium text-gray-900">{item.title}</div>

            {/* Step Description */}
            <div className="mt-1 text-xs text-gray-500 text-center max-w-[120px]">
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
