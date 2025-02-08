'use client';

import React from 'react';
import { ConnectKitButton } from 'connectkit';
import Link from 'next/link';
import Logo from '@/components/Logo';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center">
                  <div className="h-10 w-40 relative">
                    <Logo variant="banner" className="w-full h-full" />
                  </div>
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
                <Link 
                  href="/chat"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
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
      <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 relative">
                <Logo className="w-full h-full" />
              </div>
              <span className="text-sm text-gray-500">© {new Date().getFullYear()} BasedContracts</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
