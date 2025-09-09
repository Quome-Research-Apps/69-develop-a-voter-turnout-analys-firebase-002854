"use client";

import { useState } from 'react';
import { generateVoterTurnoutInsights } from '@/ai/flows/generate-voter-turnout-insights';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2 } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';

interface AiInsightsProps {
  csvData: string;
}

export function AiInsights({ csvData }: AiInsightsProps) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState('');
  const { toast } = useToast();

  const handleGenerateInsights = async () => {
    if (!csvData) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: 'Please upload a CSV file first.',
      });
      return;
    }

    setLoading(true);
    setInsights('');

    try {
      const result = await generateVoterTurnoutInsights({ csvData });
      setInsights(result.insights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast({
        variant: 'destructive',
        title: 'Error Generating Insights',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>
          Let AI analyze the data for anomalies and patterns.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {insights ? (
          <ScrollArea className="h-48">
            <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap p-1 text-sm">{insights}</div>
          </ScrollArea>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Generating analysis...</p>
              </div>
            ) : (
                <p className="text-sm text-muted-foreground">Click the button to generate insights.</p>
            )}
          </div>
        )}
        <Button
          onClick={handleGenerateInsights}
          disabled={loading || !csvData}
          className="mt-4 w-full"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Insights
        </Button>
      </CardContent>
    </Card>
  );
}
