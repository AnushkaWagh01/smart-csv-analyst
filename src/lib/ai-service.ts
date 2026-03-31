import { CSVMeta, AnalysisResult, Provider } from './analyst-types';

export function buildPrompt(question: string, meta: CSVMeta): string {
  const colInfo = meta.headers.map(h => `${h} (${meta.dtypes[h]})`).join(', ');
  const sampleData = meta.sampleRows.slice(0, 3).map(r => r.join(', ')).join('\n');

  return `You are a senior data analyst. Analyze this CSV dataset and answer the user's question.

DATASET INFO:
- Columns: ${colInfo}
- Rows: ${meta.rowCount}, Columns: ${meta.colCount}
- Quality Score: ${meta.qualityScore}/100
- Missing Values: ${meta.totalNulls}, Duplicates: ${meta.totalDups}, Outliers: ${meta.outlierCount}

SAMPLE DATA:
${meta.headers.join(', ')}
${sampleData}

USER QUESTION: ${question}

Respond in EXACTLY this JSON format (no markdown, no code fences):
{
  "insight": "Clear 2-3 sentence summary of the key finding",
  "howToFind": "Step-by-step explanation of the analytical method used, in plain language",
  "code": "Python/pandas code to reproduce this analysis",
  "charts": [
    {
      "type": "bar|line|pie|scatter",
      "title": "Chart title",
      "data": [{"label": "A", "value": 10}],
      "xKey": "label",
      "yKey": "value"
    }
  ],
  "recommendations": ["Business recommendation 1", "Recommendation 2", "Recommendation 3"]
}`;
}

async function callGroq(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error (${res.status}): ${err}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

export async function callAI(
  prompt: string, groqKey: string, geminiKey: string,
  provider: Provider, fallback: boolean
): Promise<{ text: string; provider: Provider }> {
  const primary = provider === 'groq'
    ? { fn: () => callGroq(prompt, groqKey), key: groqKey, name: 'groq' as Provider }
    : { fn: () => callGemini(prompt, geminiKey), key: geminiKey, name: 'gemini' as Provider };

  const secondary = provider === 'groq'
    ? { fn: () => callGemini(prompt, geminiKey), key: geminiKey, name: 'gemini' as Provider }
    : { fn: () => callGroq(prompt, groqKey), key: groqKey, name: 'groq' as Provider };

  if (!primary.key) {
    if (!secondary.key) throw new Error('Please provide at least one API key (Groq or Gemini)');
    const text = await secondary.fn();
    return { text, provider: secondary.name };
  }

  try {
    const text = await primary.fn();
    return { text, provider: primary.name };
  } catch (err) {
    if (fallback && secondary.key) {
      console.warn(`[AI] ${primary.name} failed, falling back to ${secondary.name}`);
      const text = await secondary.fn();
      return { text, provider: secondary.name };
    }
    throw err;
  }
}

export function parseAIResponse(text: string): AnalysisResult {
  // Strip markdown code fences if present
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Try to extract JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse AI response as JSON');

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      insight: parsed.insight || 'No insight provided',
      howToFind: parsed.howToFind || parsed.how_to_find || 'No method provided',
      code: parsed.code || '# No code provided',
      charts: Array.isArray(parsed.charts) ? parsed.charts : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    };
  } catch (e) {
    throw new Error('Failed to parse AI response JSON');
  }
}

export async function askFollowupAI(
  question: string, meta: CSVMeta | null, result: AnalysisResult | null,
  groqKey: string, geminiKey: string, provider: Provider, fallback: boolean
): Promise<string> {
  const context = result ? `Previous analysis insight: ${result.insight}\n` : '';
  const dataContext = meta ? `Dataset: ${meta.rowCount} rows, columns: ${meta.headers.join(', ')}\n` : '';
  const prompt = `${context}${dataContext}\nFollow-up question: ${question}\n\nProvide a concise, helpful answer.`;

  const { text } = await callAI(prompt, groqKey, geminiKey, provider, fallback);
  return text;
}
