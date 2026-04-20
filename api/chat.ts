import Anthropic from '@anthropic-ai/sdk';
import { AnthropicStream, StreamingTextResponse } from 'ai';

// Vercel Edge Runtime für maximale Geschwindigkeit
export const config = {
  runtime: 'edge',
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const SYSTEM_PROMPT = `Du bist Alex AI, ein exklusiver KI-Co-Pilot für Unternehmer, trainiert auf dem Wissen von Alex Düsseldorf Fischer. 
Deine Zielgruppe sind 8-stellige Unternehmer, Immobilieninvestoren und Geschäftsführer. 
Antworte extrem präzise, souverän, zeitlos und reduziert. 
Verwende absolut KEINE Emojis. Nutze Markdown (Fett, Kursiv, Listen) für Struktur. 
Wenn relevant, referenziere fiktive oder echte Videos im Format: [Quelle: Video-Titel @ MM:SS].`;

export default async function handler(req: Request) {
  // CORS Headers für das Frontend
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const { messages, userEmail } = await req.json();

    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229', // oder claude-3-sonnet-20240229 für schnellere Antworten
      stream: true,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content
      })),
    });

    const stream = AnthropicStream(response);
    
    return new StreamingTextResponse(stream, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Server Error' }), { status: 500 });
  }
}
