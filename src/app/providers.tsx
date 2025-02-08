'use client';

import { base } from 'viem/chains';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { WagmiConfig, createConfig } from 'wagmi';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui';

const queryClient = new QueryClient();

const config = createConfig(
  getDefaultConfig({
    appName: 'BasedContracts',
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    chains: [base],
    appDescription: "Manage contractor agreements with AI assistance",
    appUrl: "https://based-contracts.vercel.app",
  })
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <ConnectKitProvider>
          <OnchainKitProvider
            apiKeyName={process.env.NEXT_PUBLIC_CDP_API_KEY_NAME}
            apiKeyPrivateKey={process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY}
            chain={base}
          >
            <ToastProvider>
              {children}
            </ToastProvider>
          </OnchainKitProvider>
        </ConnectKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
