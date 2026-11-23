import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const key = process.env.OPENAI_API_KEY;
console.log('Key prefix:', key?.slice(0, 25));
console.log('Key length:', key?.length);

const res = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Say hi in 3 words' }],
    max_tokens: 10,
  }),
  signal: AbortSignal.timeout(15000),
});

const data = await res.json();
console.log('HTTP Status:', res.status);
console.log('Response:', JSON.stringify(data).slice(0, 400));
