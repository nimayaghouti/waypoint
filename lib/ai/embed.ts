import { ai } from './gemini-client';

import { createRateLimiter } from '@/lib/ratelimit/external-api';

const applyEmbedRateLimit = createRateLimiter(1000);

export async function generateEmbedding(
  text: string,
  taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY' = 'RETRIEVAL_DOCUMENT',
): Promise<number[] | null> {
  try {
    await applyEmbedRateLimit();
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
      config: {
        taskType,
        outputDimensionality: 768,
      },
    });

    return response.embeddings?.[0]?.values || null;
  } catch (error) {
    console.error('Gemini Embedding Error:', error);
    return null;
  }
}
