'use client';

import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpToolkit } from "@coinbase/cdp-langchain";

export const initializeAgent = async (type: 'client' | 'contractor') => {
    process.env.CDP_API_KEY_NAME = process.env.NEXT_PUBLIC_CDP_API_KEY_NAME;
    process.env.CDP_API_KEY_PRIVATE_KEY = process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY;

    try {
        const agentKit = new CdpAgentkit();
        const toolkit = new CdpToolkit({
            agent: agentKit,
            prompt: type === 'client' 
                ? `You are an AI agent representing a client seeking contractor services...`
                : `You are an AI agent representing a contractor providing services...`
        });

        return agentKit; // Return the agent directly since it has the chat method
    } catch (error) {
        console.error('CDP Initialization Error:', error);
        throw error;
    }
};
