'use client';

import React from 'react';
import { ConnectKitButton } from 'connectkit';
import Link from 'next/link';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between h-20">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-2xl font-bold">
                  BasedContracts
                </Link>
              </div>
              <div className="ml-12 flex space-x-8 items-center">
                <Link 
                  href="/client"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                >
                  Client Dashboard
                </Link>
                <Link 
                  href="/contractor"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                >
                  Contractor Dashboard
                </Link>
                <Link 
                  href="/chat"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                >
                  Agent Chat
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <ConnectKitButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto py-8 px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
