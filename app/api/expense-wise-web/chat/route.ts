import { streamText } from 'ai';
import { getModel } from '@/app/expense-wise-web/lib/chat/provider-registry';
import { getCatalogPrompt } from '@/app/expense-wise-web/lib/chat/catalog';
import { financialTools } from '@/app/expense-wise-web/lib/chat/tools';
import type { LLMProvider } from '@/app/expense-wise-web/lib/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      messages,
      provider,
      model: modelId,
      apiKey,
      ollamaBaseUrl,
      dataSummary,
    } = body as {
      messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
      provider: LLMProvider;
      model: string;
      apiKey: string;
      ollamaBaseUrl?: string;
      dataSummary: string;
    };

    const llmModel = getModel(provider, modelId, apiKey, ollamaBaseUrl);

    const catalogPrompt = getCatalogPrompt();

    const systemPrompt = `You are a helpful financial assistant that analyzes the user's personal finance data from their ExpenseWise app. You have access to tools that let you search and query the user's financial data.

## Available UI Components
You can render rich UI components in your responses by outputting JSON specs. Here are the available components:

${catalogPrompt}

## User's Data Summary
${dataSummary}

## Tools
You have tools to search transactions, get spending by category, get monthly trends, get account summaries, get budget status, and get group expenses. ALWAYS use these tools to look up specific data before answering — do not guess or make up numbers.

## Guidelines
- Always call one or more tools before answering questions about specific numbers, amounts, or data
- Be concise and helpful
- Use specific numbers from tool results when answering questions
- When showing spending breakdowns, use the CategoryPieChart component
- When comparing periods, use the IncomeExpenseChart or BarChart component
- When listing transactions, use the TransactionsTable component
- When showing account info, use the AccountsList component
- Always provide context and explanations alongside charts using the Text component
- Format currency amounts properly (e.g., €1,234.56 for EUR, ₦50,000.00 for NGN)
- If tools return no data for a query, say so clearly`;

    const result = streamText({
      model: llmModel,
      system: systemPrompt,
      messages,
      tools: financialTools,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
