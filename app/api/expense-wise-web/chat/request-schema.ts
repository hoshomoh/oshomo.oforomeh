import { z } from 'zod';

// Simplified validation that accepts the message format from AI SDK
const uiMessageSchema = z.looseObject({
  id: z.string(),
  role: z.string(), // Accept any role string
  parts: z.array(z.any()), // Accept any parts array structure
  // Allow any other properties via looseObject
});

export const chatRequestSchema = z.object({
  messages: z.array(uiMessageSchema).min(1).max(100), // Limit conversation length
  provider: z.string(), // Accept any provider string
  model: z.string().min(1).max(100),
  apiKey: z.string().min(1).max(500),
  ollamaBaseUrl: z.url().optional(),
  dataSummary: z.string().max(100000), // Prevent massive summaries
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
