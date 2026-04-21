export const config = { runtime: 'edge' };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key fehlt in Vercel!' }), { status: 500, headers: corsHeaders });
    }

    // Direkter, nativer Fetch ohne anfällige SDK-Pakete
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        system: "Du bist Alex AI, ein exklusiver KI-Co-Pilot für Unternehmer, trainiert auf dem Wissen von Alex Düsseldorf Fischer. Antworte extrem präzise, souverän, zeitlos und reduziert. Verwende absolut KEINE Emojis. Nutze Markdown.",
        messages: messages,
        stream: true
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: errText }), { status: response.status, headers: corsHeaders });
    }

    // Den rohen Stream direkt an die App weiterleiten
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
      }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
}
