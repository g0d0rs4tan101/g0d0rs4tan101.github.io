const API_KEY = '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';

// Listen for incoming POST requests (from your bookmarklet)
if (window.location.pathname === '/chat') {
  addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });

  async function handleRequest(request) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    try {
      const body = await request.json();
      // Forward to Groq with your key
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: body.model || 'llama-3.1-8b-instant',
          messages: body.messages,
          temperature: body.temperature || 0.3,
          max_tokens: body.max_tokens || 500,
          top_p: body.top_p || 0.4,
        }),
      });

      if (!groqResponse.ok) {
        throw new Error(`Groq error: ${groqResponse.status}`);
      }

      const data = await groqResponse.json();
      return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
} else {
  // Simple landing page if someone hits the root
  document.body.innerHTML = '<h1>Groq Proxy Active</h1><p>Use /chat for API calls.</p>';
}
