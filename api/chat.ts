import Anthropic from '@anthropic-ai/sdk';
import { AnthropicStream, StreamingTextResponse } from 'ai';

export const config = { runtime: 'edge' };

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307', // Haiku ist immer freigeschaltet und extrem schnell
      stream: true,
      max_tokens: 1024,
      system: "Du bist Alex AI, ein exklusiver KI-Co-Pilot für Unternehmer, trainiert auf dem Wissen von Alex Düsseldorf Fischer. Antworte extrem präzise, souverän, zeitlos und reduziert. Verwende absolut KEINE Emojis. Nutze Markdown.",
      messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
    });

    return new StreamingTextResponse(AnthropicStream(response), { headers: corsHeaders });
  } catch (error: any) {
    // Jetzt senden wir den echten Fehler ans Frontend zurück!
    return new Response(JSON.stringify({ error: error.message || 'Server Error' }), { 
      status: 500, 
      headers: corsHeaders 
    });
  }
}
