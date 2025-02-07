import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { contractAnalysisService, type AIAnalysis } from '@/services/contractAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ContractReviewProps {
  contractData: {
    template: string;
    sections: Record<string, string>;
    clientAddress: string;
    timestamp: number;
  };
  onApprove: () => void;
  onRequestChanges: (feedback: string) => void;
}

interface AIAnalysis {
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

const ContractReview: React.FC<ContractReviewProps> = ({
  contractData,
  onApprove,
  onRequestChanges,
}) => {
  const { address } = useAccount();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);
  const [customFeedback, setCustomFeedback] = useState('');
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  useEffect(() => {
    analyzeContract();
  }, [contractData]);

  const analyzeContract = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await contractAnalysisService.analyzeContract(contractData.sections);

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      setAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Contract analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSuggestionSelect = (suggestionId: string) => {
    setSelectedFeedback(prev => 
      prev.includes(suggestionId)
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  const handleSubmitFeedback = () => {
    const selectedSuggestions = analysis?.suggestions
      .filter(s => selectedFeedback.includes(s.id))
      .map(s => s.suggestion);

    const feedback = [
      ...selectedSuggestions,
      customFeedback
    ].filter(Boolean).join('\n\n');

    onRequestChanges(feedback);
  };

  const renderSuggestionBadge = (type: string) => {
    switch (type) {
      case 'critical':
        return (
          <Badge variant="destructive" className="mr-2">
            Critical
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="warning" className="mr-2">
            Warning
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="mr-2">
            Improvement
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Contract Review
            {analysis && (
              <Badge
                variant={
                  analysis.riskLevel === 'high'
                    ? 'destructive'
                    : analysis.riskLevel === 'medium'
                    ? 'warning'
                    : 'success'
                }
                className="ml-2"
              >
                {analysis.riskLevel.toUpperCase()} RISK
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Analyzing contract...</span>
            </div>
          ) : analysis ? (
            <Tabs defaultValue="suggestions">
              <TabsList className="w-full">
                <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>

              <TabsContent value="suggestions" className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {analysis.suggestions.map(suggestion => (
                      <div
                        key={suggestion.id}
                        className="p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            {renderSuggestionBadge(suggestion.type)}
                            <h4 className="font-medium mt-2">{suggestion.description}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {suggestion.suggestion}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuggestionSelect(suggestion.id)}
                            className={selectedFeedback.includes(suggestion.id) ? 'bg-blue-50' : ''}
                          >
                            {selectedFeedback.includes(suggestion.id) ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="summary" className="mt-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      Strengths
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.summary.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />
                      Areas for Improvement
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.summary.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2 flex items-center">
                      <Info className="h-4 w-4 text-blue-500 mr-2" />
                      Recommendations
                    </h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {analysis.summary.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="review" className="mt-4">
                <div className="space-y-4">
                  <textarea
                    value={customFeedback}
                    onChange={(e) => setCustomFeedback(e.target.value)}
                    placeholder="Add your custom feedback here..."
                    className="w-full h-32 p-2 border rounded-md"
                  />

                  <div className="flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={handleSubmitFeedback}
                      disabled={!selectedFeedback.length && !customFeedback}
                    >
                      Request Changes
                    </Button>
                    <Button onClick={onApprove}>
                      Approve Contract
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>
                Failed to analyze contract. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractReview;
