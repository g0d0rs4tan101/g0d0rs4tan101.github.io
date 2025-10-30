/* ==== proxy.js ==== */
const GROQ_API_KEY = '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';

window.groqProxy = async function (messages, opts = {}) {
  const payload = {
    model: opts.model || 'llama-3.1-8b-instant',
    messages,
    temperature: opts.temperature ?? 0.3,
    max_tokens: opts.max_tokens ?? 500,
    top_p: opts.top_p ?? 0.4,
  };

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
};

/* ---- Tell the parent we are ready ---- */
window.addEventListener('load', () => {
  // Send ready signal to any parent (bookmarklet iframe)
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({type: 'proxy-ready'}, '*');
  }
});

/* ---- Listen for requests from the bookmarklet ---- */
window.addEventListener('message', async ev => {
  // Allow any origin from the same github.io domain
  const proxyOrigin = new URL(location.href).origin;
  if (ev.origin !== proxyOrigin) return;

  if (ev.data?.type === 'groq-request') {
    try {
      const result = await window.groqProxy(ev.data.messages, ev.data.options);
      window.parent.postMessage({type: 'groq-result', data: result}, ev.origin);
    } catch (err) {
      window.parent.postMessage({type: 'groq-error', error: err.message}, ev.origin);
    }
  }
});

/* ---- Optional UI test ---- */
document.getElementById('testBtn')?.addEventListener('click', async () => {
  const out = document.getElementById('output');
  out.textContent = 'Loading…';
  try {
    const data = await window.groqProxy([{role:'user',content:'Hello from proxy!'}]);
    out.textContent = JSON.stringify(data, null, 2);
  } catch (e) {
    out.textContent = `Error: ${e.message}`;
  }
});
