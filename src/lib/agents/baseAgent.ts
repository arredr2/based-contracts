'use client';

import { AgentKit, CdpWalletProvider, wethActionProvider, walletActionProvider, erc20ActionProvider, cdpApiActionProvider, cdpWalletActionProvider, pythActionProvider } from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";

export const initializeAgent = async (type: 'client' | 'contractor') => {
    if (!process.env.NEXT_PUBLIC_CDP_API_KEY_NAME || !process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY || !process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        throw new Error('Missing required environment variables');
    }

    try {
        // Initialize LLM
        const llm = new ChatOpenAI({
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
            model: "gpt-4",
        });

        // Configure CDP Wallet Provider
        const config = {
            apiKeyName: process.env.NEXT_PUBLIC_CDP_API_KEY_NAME,
            apiKeyPrivateKey: process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            networkId: "base-sepolia",
        };

        const walletProvider = await CdpWalletProvider.configureWithWallet(config);

        // Initialize AgentKit with all necessary providers
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

        // Get LangChain tools from AgentKit
        const tools = await getLangChainTools(agentkit);

        // Store conversation history in memory
        const memory = new MemorySaver();

        // Create agent configuration
        const agentConfig = { 
            configurable: { 
                thread_id: `BasedContracts-${type}-${Date.now()}` 
            } 
        };

        // Create React Agent using LLM and CDP AgentKit tools
        const agent = createReactAgent({
            llm,
            tools,
            checkpointSaver: memory,
            messageModifier: type === 'client' 
                ? `You are an AI agent representing a client seeking contractor services. Your role is to help negotiate and finalize contractor agreements.`
                : `You are an AI agent representing a contractor providing services. Your role is to help negotiate and finalize client agreements.`
        });

        // Return wrapper with sendMessage method
        return {
            async sendMessage(content: string) {
                try {
                    const stream = await agent.stream(
                        { messages: [new HumanMessage(content)] },
                        agentConfig
                    );

                    let response = '';
                    for await (const chunk of stream) {
                        if ("agent" in chunk) {
                            response += chunk.agent.messages[0].content;
                        } else if ("tools" in chunk) {
                            response += chunk.tools.messages[0].content;
                        }
                    }

                    return {
                        content: response || 'No response received',
                        role: type
                    };
                } catch (error) {
                    console.error('Error in sendMessage:', error);
                    throw error;
                }
            }
        };
    } catch (error) {
        console.error('CDP Initialization Error:', error);
        throw error;
    }
};
