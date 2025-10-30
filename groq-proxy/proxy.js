/* ==== proxy.js ==== */
const GROQ_API_KEY = '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';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Use AllOrigins to bypass firewall
const ALLORIGINS = 'https://api.allorigins.win/raw?url=';

window.groqProxy = async function (messages, opts = {}) {
  const payload = {
    model: opts.model || 'llama-3.1-8b-instant',
    messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.max_tokens ?? 500,
    top_p: opts.top_p ?? 0.4,
  };

  const encodedUrl = encodeURIComponent(GROQ_URL);
  const proxyUrl = `${ALLORIGINS}${encodedUrl}`;

  try {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Groq ${res.status}: ${txt.substring(0, 200)}`);
    }

    return await res.json();
  } catch (err) {
    console.error('groqProxy error:', err);
    throw err;
  }
};

// Ready signal
window.addEventListener('load', () => {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({type: 'proxy-ready'}, '*');
  }
});

// Listen for request
window.addEventListener('message', async ev => {
  const origin = new URL(location.href).origin;
  if (ev.origin !== origin) return;

  if (ev.data?.type === 'groq-request') {
    try {
      const result = await window.groqProxy(ev.data.messages, ev.data.options);
      window.parent.postMessage({type: 'groq-result', data: result}, ev.origin);
    } catch (err) {
      window.parent.postMessage({type: 'groq-error', error: err.message}, ev.origin);
    }
  }
});

// Test button
document.getElementById('testBtn')?.addEventListener('click', async () => {
  const out = document.getElementById('output');
  out.textContent = 'Sending via AllOrigins...';
  try {
    const data = await window.groqProxy([{role:'user',content:'Hi from proxy!'}]);
    out.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    out.textContent = `Failed: ${e.message}`;
  }
});
