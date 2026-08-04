import { ai } from './gemini-client';

import { createRateLimiter } from '@/lib/ratelimit/external-api';

const applyGeminiRateLimit = createRateLimiter(2000);

export async function generatePlaceDescription(
  name: string,
  address: string | null,
  locale: string,
): Promise<string | null> {
  const language = locale === 'fa' ? 'Persian' : 'English';

  const prompt = `You are a travel assistant. Provide a description for the following place:
  Name: "${name}"
  Address: "${address || 'Unknown'}"

  Rule 1: If you have factual, specific knowledge about this exact place, write a short, engaging 2-sentence description in ${language} highlighting why it's good for a group trip.
  Rule 2: If you DO NOT have factual knowledge about this specific place, DO NOT hallucinate or invent details. Instead, write a short, generic 4 to 6 word welcoming phrase in ${language} based solely on its name (e.g., "A local spot to visit").
  Return ONLY the final description text, without quotes or introductory words.`;

  try {
    await applyGeminiRateLimit();
    const interaction = await ai.interactions.create({
      model: 'gemini-3.6-flash',
      input: prompt,
    });
    return interaction.output_text?.trim() || null;
  } catch (error) {
    console.error('Gemini Generation Error:', error);
    return null;
  }
}
