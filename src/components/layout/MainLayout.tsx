import React from 'react';
import { ConnectKitButton } from 'connectkit';
import Link from 'next/link';
import { Header } from '@coinbase/onchainkit';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        logo={
          <Link href="/" className="text-xl font-bold text-black hover:text-blue-600 transition-colors">
            BasedContracts
          </Link>
        }
        navigationButtons={[
          {
            label: 'Client Dashboard',
            href: '/client',
          },
          {
            label: 'Contractor Dashboard',
            href: '/contractor',
          },
          {
            label: 'Agent Chat',
            href: '/chat',
          },
          {
            label: 'Transactions',
            href: '/transactions',
          },
        ]}
        action={<ConnectKitButton />}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
