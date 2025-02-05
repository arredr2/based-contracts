'use client';

import { ChatOpenAI } from "@langchain/openai";

interface AgentResponse {
  text: string;
  error?: string;
}

export class BaseAgent {
  private llm: ChatOpenAI | null = null;
  private type: 'client' | 'contractor';
  private initialized: boolean = false;

  constructor(type: 'client' | 'contractor') {
    this.type = type;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize OpenAI chat model
      if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
        throw new Error('OpenAI API key is required');
      }
      
      this.llm = new ChatOpenAI({
        temperature: 0.7,
        modelName: 'gpt-4',
        openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
      });

      this.initialized = true;
      console.log(`${this.type} agent initialized in LLM-only mode`);
    } catch (error) {
      console.error('LLM initialization failed:', error);
      throw error;
    }
  }

  async chat(message: string): Promise<AgentResponse> {
    try {
      if (!this.initialized || !this.llm) {
        await this.initialize();
      }

      if (!this.llm) {
        throw new Error('LLM not initialized');
      }

      const systemPrompt = this.type === 'client' 
        ? 'You are an AI agent representing a client seeking contractor services. Help negotiate and protect client interests.'
        : 'You are an AI agent representing a contractor providing services. Help communicate offerings and establish clear agreements.';

      const response = await this.llm.invoke([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]);

      return {
        text: response.content.toString()
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during chat';
      console.error('Chat error:', errorMessage);
      
      return {
        text: 'I apologize, but I encountered an error processing your message. Please try again.',
        error: errorMessage
      };
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const initializeAgent = async (type: 'client' | 'contractor'): Promise<BaseAgent> => {
  const agent = new BaseAgent(type);
  try {
    await agent.initialize();
  } catch (error) {
    console.error('Agent initialization failed:', error);
  }
  return agent;
};
