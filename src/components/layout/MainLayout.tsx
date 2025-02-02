'use client';

import React from 'react';
import { ConnectKitButton } from 'connectkit';
import Link from 'next/link';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold">
                  BasedContracts
                </Link>
              </div>
              <div className="ml-6 flex space-x-4 items-center">
                <Link 
                  href="/client"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Client Dashboard
                </Link>
                <Link 
                  href="/contractor"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Contractor Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <ConnectKitButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
