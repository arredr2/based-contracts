'use client';

import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  pythActionProvider,
} from "@coinbase/agentkit";
import { ChatOpenAI } from "@langchain/openai";

export const initializeAgent = async (type: 'client' | 'contractor') => {
    if (!process.env.NEXT_PUBLIC_CDP_API_KEY_NAME || !process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY || !process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        throw new Error('Missing required environment variables');
    }

    try {
        // Initialize LLM first since it's more reliable
        const llm = new ChatOpenAI({
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
            model: "gpt-4",
        });

        // Configure CDP Wallet Provider with local API route
        const config = {
            apiKeyName: process.env.NEXT_PUBLIC_CDP_API_KEY_NAME,
            apiKeyPrivateKey: process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            networkId: "base-sepolia",
            baseUrl: '/api/cdp', // Use local API route
        };

        try {
            const walletProvider = await CdpWalletProvider.configureWithWallet(config);
            console.log('Wallet provider configured:', walletProvider);

            const agentkit = await AgentKit.from({
                walletProvider,
                actionProviders: [
                    wethActionProvider(),
                    pythActionProvider(),
                    walletActionProvider(),
                    erc20ActionProvider(),
                    cdpApiActionProvider(config),
                    cdpWalletActionProvider(config),
                ],
            });

            console.log('CDP initialization successful:', agentkit);
        } catch (cdpError) {
            console.warn('CDP initialization failed, continuing with LLM only:', cdpError);
            // Continue execution even if CDP fails
        }

        // Return wrapper with sendMessage method
        return {
            async sendMessage(content: string) {
                try {
                    const result = await llm.invoke([{
                        role: 'system',
                        content: type === 'client'
                            ? 'You are an AI agent representing a client seeking contractor services.'
                            : 'You are an AI agent representing a contractor providing services.'
                    }, {
                        role: 'user',
                        content
                    }]);

                    return {
                        content: result.content || 'No response received',
                        role: type
                    };
                } catch (error) {
                    console.error('Error in sendMessage:', error);
                    throw error;
                }
            }
        };
    } catch (error) {
        console.error('Agent Initialization Error:', error);
        throw error;
    }
};
