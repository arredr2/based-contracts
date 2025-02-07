// src/services/contractAnalysis.ts

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export interface AIAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  suggestions: Array<{
    id: string;
    type: 'critical' | 'warning' | 'improvement';
    section: string;
    description: string;
    suggestion: string;
  }>;
  summary: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
}

const CONTRACT_ANALYSIS_PROMPT = `
Analyze the following contract sections and provide a detailed review. 
Consider legal completeness, clarity, risk factors, and potential improvements.

Contract Sections:
{sections}

Please provide your analysis in the following JSON format:
{
  "riskLevel": "low|medium|high",
  "suggestions": [
    {
      "id": "string",
      "type": "critical|warning|improvement",
      "section": "string",
      "description": "string",
      "suggestion": "string"
    }
  ],
  "summary": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "recommendations": ["string"]
  }
}

Focus on:
1. Payment terms and milestones
2. Scope clarity and deliverables
3. Legal protections and liability
4. Dispute resolution mechanisms
5. Timeline and deadlines
`;

export class ContractAnalysisService {
  private llm: ChatOpenAI;
  private prompt: PromptTemplate;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.2,
      maxTokens: 2000,
    });

    this.prompt = PromptTemplate.fromTemplate(CONTRACT_ANALYSIS_PROMPT);
  }

  async analyzeContract(contractData: Record<string, string>): Promise<AIAnalysis> {
    try {
      // Format contract sections for analysis
      const sectionsText = Object.entries(contractData)
        .map(([section, content]) => `${section}:\n${content}`)
        .join('\n\n');

      // Generate analysis prompt
      const formattedPrompt = await this.prompt.format({
        sections: sectionsText,
      });

      // Get AI response
      const response = await this.llm.invoke(formattedPrompt);
      
      // Parse and validate response
      const analysis = JSON.parse(response.content);
      
      // Validate response format
      this.validateAnalysis(analysis);

      return analysis;
    } catch (error) {
      console.error('Contract analysis error:', error);
      throw new Error('Failed to analyze contract');
    }
  }

  private validateAnalysis(analysis: any): asserts analysis is AIAnalysis {
    const validRiskLevels = ['low', 'medium', 'high'];
    const validSuggestionTypes = ['critical', 'warning', 'improvement'];

    if (!validRiskLevels.includes(analysis.riskLevel)) {
      throw new Error('Invalid risk level in analysis');
    }

    if (!Array.isArray(analysis.suggestions)) {
      throw new Error('Invalid suggestions format');
    }

    analysis.suggestions.forEach((suggestion: any, index: number) => {
      if (!validSuggestionTypes.includes(suggestion.type)) {
        throw new Error(`Invalid suggestion type at index ${index}`);
      }
      if (!suggestion.id || !suggestion.section || !suggestion.description || !suggestion.suggestion) {
        throw new Error(`Missing required fields in suggestion at index ${index}`);
      }
    });

    if (!analysis.summary || 
        !Array.isArray(analysis.summary.strengths) || 
        !Array.isArray(analysis.summary.weaknesses) || 
        !Array.isArray(analysis.summary.recommendations)) {
      throw new Error('Invalid summary format');
    }
  }
}

// Create singleton instance
export const contractAnalysisService = new ContractAnalysisService();
