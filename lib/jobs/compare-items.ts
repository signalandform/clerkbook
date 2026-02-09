import OpenAI from 'openai';

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('Missing OPENAI_API_KEY');
  return new OpenAI({ apiKey: key });
}

export type CompareResult = {
  common_themes: string[];
  differences: string[];
  best_quotes_by_theme: {
    theme: string;
    quotes: { quote: string; item_id: string; item_title: string }[];
  }[];
};

export type ItemForCompare = {
  id: string;
  title: string | null;
  abstract: string | null;
  bullets: string[] | null;
  quotes: { quote: string; why_it_matters?: string }[];
};

const COMPARE_SYSTEM = `You are a research analyst. Given 2-5 sources (each with abstract, bullets, and quotes), produce a comparison:

1. common_themes: array of 3-8 themes that appear across multiple sources
2. differences: array of 3-8 key differences, contradictions, or contrasting points
3. best_quotes_by_theme: array of objects, each with:
   - theme: string (one of the common_themes or a related theme)
   - quotes: array of { quote: string, item_id: string, item_title: string } — pick the best 1-3 quotes per theme from the provided sources, with exact citations. Use the exact item_id and item_title from the input.

Respond with valid JSON only. Use exact quotes from the sources; do not fabricate.`;

function parseCompareResponse(text: string): CompareResult | null {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]) as CompareResult;
  } catch {
    return null;
  }
}

export async function runCompareItems(
  items: ItemForCompare[]
): Promise<{ result?: CompareResult; error?: string }> {
  if (items.length < 2 || items.length > 5) {
    return { error: 'Need 2-5 items to compare' };
  }

  const input = items
    .map(
      (i) =>
        `[Item ${i.id}]
Title: ${i.title ?? 'Untitled'}
Abstract: ${i.abstract ?? '—'}
Bullets: ${(i.bullets ?? []).join('; ')}
Quotes: ${(i.quotes ?? []).map((q) => `"${q.quote}"`).join(' | ')}`
    )
    .join('\n\n');

  const userPrompt = `Compare these sources:\n\n${input}`;

  try {
    const openai = getOpenAI();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: COMPARE_SYSTEM },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });
    const content = completion.choices[0]?.message?.content;
    if (!content) return { error: 'Empty OpenAI response' };

    const result = parseCompareResponse(content);
    if (!result || !Array.isArray(result.common_themes) || !Array.isArray(result.differences)) {
      return { error: 'Could not parse comparison' };
    }
    if (!Array.isArray(result.best_quotes_by_theme)) {
      result.best_quotes_by_theme = [];
    }

    return { result };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Comparison failed';
    return { error: msg };
  }
}
