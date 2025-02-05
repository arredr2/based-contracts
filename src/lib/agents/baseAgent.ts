'use client';

import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpToolkit } from "@coinbase/cdp-langchain";

interface AgentResponse {
  message: string;
  error?: string;
}

export class BaseAgent {
  private agent: CdpAgentkit | null = null;
  private toolkit: CdpToolkit | null = null;
  private type: 'client' | 'contractor';
  private initialized: boolean = false;
  private initError: string | null = null;

  constructor(type: 'client' | 'contractor') {
    this.type = type;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check for required environment variables
      if (!process.env.NEXT_PUBLIC_CDP_API_KEY_NAME || !process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY) {
        throw new Error('Missing required CDP API credentials');
      }

      // Initialize CDP Agent with proxy path
      this.agent = new CdpAgentkit({
        apiKeyName: process.env.NEXT_PUBLIC_CDP_API_KEY_NAME,
        apiKeyPrivateKey: process.env.NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY,
        baseUrl: '/api/cdp', // Use the proxy path instead of direct CDP API URL
      });

      // Initialize toolkit with appropriate prompt
      this.toolkit = new CdpToolkit({
        agent: this.agent,
        prompt: this.getAgentPrompt(),
        baseUrl: '/api/cdp', // Use the proxy path for toolkit as well
      });

      this.initialized = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
      this.initError = `CDP Initialization failed: ${errorMessage}`;
      console.error(this.initError);
      
      // Initialize with LLM-only mode if CDP initialization fails
      try {
        this.toolkit = new CdpToolkit({
          prompt: this.getAgentPrompt(),
          llmOnly: true
        });
        this.initialized = true;
        console.log('Initialized in LLM-only mode');
      } catch (llmError) {
        throw new Error(`Failed to initialize in LLM-only mode: ${llmError}`);
      }
    }
  }

  private getAgentPrompt(): string {
    return this.type === 'client' 
      ? `You are an AI agent representing a client seeking contractor services. 
         Your goal is to help negotiate and finalize agreements while protecting the client's interests.
         Focus on understanding requirements, budget constraints, and timeline needs.`
      : `You are an AI agent representing a contractor providing services.
         Your goal is to help communicate service offerings, negotiate terms, and establish clear agreements.
         Focus on understanding client needs while ensuring fair compensation for services.`;
  }

  async chat(message: string): Promise<AgentResponse> {
    try {
      // Check initialization
      if (!this.initialized) {
        await this.initialize();
      }

      if (!this.toolkit) {
        throw new Error('Toolkit not initialized');
      }

      // Use toolkit for message processing
      const response = await this.toolkit.processMessage(message);

      return {
        message: response.text || 'No response received',
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during chat';
      console.error('Chat error:', errorMessage);
      
      // Return a user-friendly error message
      return {
        message: 'I apologize, but I encountered an error processing your message. Please try again.',
        error: errorMessage
      };
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getInitError(): string | null {
    return this.initError;
  }
}

export const initializeAgent = async (type: 'client' | 'contractor'): Promise<BaseAgent> => {
  const agent = new BaseAgent(type);
  try {
    await agent.initialize();
  } catch (error) {
    console.error('Agent initialization failed:', error);
    // Still return the agent - it will operate in LLM-only mode
  }
  return agent;
};
