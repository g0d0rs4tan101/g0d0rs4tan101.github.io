/* ==== proxy.js ==== */
const GROQ_API_KEY = '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';

// Expose a global async function that the bookmarklet calls
window.groqProxy = async function (messages, opts = {}) {
  const payload = {
    model: opts.model || 'llama-3.1-8b-instant',
    messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.max_tokens ?? 500,
    top_p: opts.top_p ?? 0.4,
  };

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Groq ${res.status}: ${txt}`);
    }

    return await res.json();
  } catch (err) {
    console.error('groqProxy error:', err);
    throw err;   // let caller handle it
  }
};

/* ---- Optional test UI (remove in production if you want) ---- */
document.getElementById('testBtn')?.addEventListener('click', async () => {
  const out = document.getElementById('output');
  out.textContent = 'Loading…';
  try {
    const data = await window.groqProxy([
      { role: 'user', content: 'Hello from the proxy!' }
    ]);
    out.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    out.textContent = `Error: ${e.message}`;
  }
});
