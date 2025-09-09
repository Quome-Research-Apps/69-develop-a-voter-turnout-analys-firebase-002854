'use server';
/**
 * @fileOverview Generates insights from voter turnout data using a Genkit flow.
 *
 * - generateVoterTurnoutInsights - A function that generates insights from voter turnout data.
 * - GenerateVoterTurnoutInsightsInput - The input type for the generateVoterTurnoutInsights function.
 * - GenerateVoterTurnoutInsightsOutput - The return type for the generateVoterTurnoutInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVoterTurnoutInsightsInputSchema = z.object({
  csvData: z
    .string()
    .describe('A CSV file containing precinct-level election results.'),
});
export type GenerateVoterTurnoutInsightsInput = z.infer<
  typeof GenerateVoterTurnoutInsightsInputSchema
>;

const GenerateVoterTurnoutInsightsOutputSchema = z.object({
  insights: z.string().describe('Insights generated from the voter turnout data.'),
});
export type GenerateVoterTurnoutInsightsOutput = z.infer<
  typeof GenerateVoterTurnoutInsightsOutputSchema
>;

export async function generateVoterTurnoutInsights(
  input: GenerateVoterTurnoutInsightsInput
): Promise<GenerateVoterTurnoutInsightsOutput> {
  return generateVoterTurnoutInsightsFlow(input);
}

const voterTurnoutInsightsPrompt = ai.definePrompt({
  name: 'voterTurnoutInsightsPrompt',
  input: {schema: GenerateVoterTurnoutInsightsInputSchema},
  output: {schema: GenerateVoterTurnoutInsightsOutputSchema},
  prompt: `You are an expert political analyst.
  You will analyze voter turnout data to identify precincts with unexpectedly high or low turnout.
  Provide insights and potential reasons for these anomalies.
  Data: {{{csvData}}}`,
});

const generateVoterTurnoutInsightsFlow = ai.defineFlow(
  {
    name: 'generateVoterTurnoutInsightsFlow',
    inputSchema: GenerateVoterTurnoutInsightsInputSchema,
    outputSchema: GenerateVoterTurnoutInsightsOutputSchema,
  },
  async input => {
    const {output} = await voterTurnoutInsightsPrompt(input);
    return output!;
  }
);
