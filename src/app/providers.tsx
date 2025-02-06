'use client';

import { base } from 'viem/chains';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import { WagmiConfig, createConfig } from 'wagmi';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const config = createConfig(
  getDefaultConfig({
    appName: 'BasedContracts',
    walletConnectProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
    chains: [base],
  })
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={config}>
        <ConnectKitProvider>
          <OnchainKitProvider
            apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
            projectId={process.env.NEXT_PUBLIC_CDP_PROJECT_ID}
            chain={base}
          >
            {children}
          </OnchainKitProvider>
        </ConnectKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
