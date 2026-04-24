import { NextRequest, NextResponse } from 'next/server';
import { requireSession } from '@/lib/api-auth';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const FIELDS = [
  'name', 'product_name', 'brand_name', 'tagline', 'description',
  'format', 'price_point', 'target_consumer', 'key_benefits', 'category', 'market',
];

const SYSTEM = `You are a CPG research assistant. Extract concept test fields from a brand brief or product document.
Return ONLY a valid JSON object with these keys (omit keys you cannot confidently extract):
- name: short test name (e.g. "Oat Milk Launch — Q3 2025")
- product_name: the product's name
- brand_name: the brand or company name
- tagline: a short tagline or slogan
- description: 1–3 sentence product description
- format: pack size or format (e.g. "500ml bottle")
- price_point: price (e.g. "£1.89")
- target_consumer: target audience description
- key_benefits: comma-separated list of key benefits
- category: product category (e.g. "Dairy Alternatives / Oat Milk")
- market: one of UK, US, or IN — infer from currency/context, default UK

IMPORTANT: Return raw JSON only. No markdown code fences. No backticks. No \`\`\`json. Just the plain JSON object starting with { and ending with }.`;

function parseJson(raw: string): Record<string, string> {
  // 1. Strip ALL markdown code fences (handles multi-line preamble too)
  let s = raw.replace(/```(?:json)?/gi, '').trim();
  // 2. Extract the first {...} block in case Claude adds prose around the JSON
  const match = s.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON object found in response. Raw: ${raw.slice(0, 200)}`);
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  const session = await requireSession(req);
  if (session instanceof NextResponse) return session;

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const mime = file.type;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  let extracted: Record<string, string> = {};

  try {
    if (mime === 'application/pdf') {
      // Use Claude's native PDF support
      const b64 = buffer.toString('base64');
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: SYSTEM,
        messages: [{
          role: 'user',
          content: [
            { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64 } },
            { type: 'text', text: 'Extract the concept test fields from this document.' },
          ],
        }],
      });
      const text = (msg.content[0] as any).text ?? '';
      extracted = parseJson(text);

    } else if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.endsWith('.docx')
    ) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      const docText = result.value;
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: SYSTEM,
        messages: [{ role: 'user', content: `Extract concept test fields from this document:\n\n${docText}` }],
      });
      extracted = parseJson((msg.content[0] as any).text ?? '{}');

    } else {
      // Plain text / markdown
      const docText = buffer.toString('utf-8');
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: SYSTEM,
        messages: [{ role: 'user', content: `Extract concept test fields from this document:\n\n${docText}` }],
      });
      extracted = parseJson((msg.content[0] as any).text ?? '{}');
    }
  } catch (e) {
    return NextResponse.json({ error: 'Failed to parse document', detail: String(e) }, { status: 422 });
  }

  const filled = FIELDS.filter(f => extracted[f] && String(extracted[f]).trim());
  const missing = FIELDS.filter(f => !extracted[f] || !String(extracted[f]).trim());

  return NextResponse.json({ extracted, filled, missing });
}
