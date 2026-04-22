'use client';

import { useState } from 'react';

const LABEL: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontSize: '11px',
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--static)',
};

const INPUT_STYLE: React.CSSProperties = {
  fontFamily: "'Barlow', sans-serif",
  fontSize: '14px',
  color: 'var(--parchment)',
  background: 'var(--layer-2)',
  border: '1px solid var(--border)',
  padding: '10px 14px',
  outline: 'none',
  width: '100%',
};

export default function AskPersonaPanel({ testId }: { testId: string }) {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch(`/api/tests/${testId}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      setResponse(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <span style={LABEL}>Ask a Persona</span>
        <button
          onClick={() => setOpen(!open)}
          style={{
            fontFamily: "'Barlow', sans-serif",
            fontSize: '12px',
            fontWeight: 500,
            color: open ? 'var(--parchment)' : 'var(--static)',
            border: '1px solid var(--border)',
            background: 'transparent',
            padding: '5px 14px',
            cursor: 'pointer',
            letterSpacing: '0.02em',
            transition: 'color 0.15s, border-color 0.15s',
          }}
        >
          {open ? 'Close' : 'Ask question'}
        </button>
      </div>

      {open && (
        <div style={{ border: '1px solid var(--border)', background: 'var(--layer)', padding: '20px' }}>
          <form onSubmit={handleAsk} className="flex gap-3 mb-5">
            <input
              type="text"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="e.g. Would you pay £4 for this? Why or why not?"
              required
              style={{ ...INPUT_STYLE, flex: 1 }}
              onFocus={e => (e.target.style.borderColor = 'var(--border-hi)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--void)',
                background: loading ? 'var(--static)' : 'var(--signal)',
                border: 'none',
                padding: '10px 20px',
                cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                opacity: loading ? 0.7 : 1,
                flexShrink: 0,
              }}
            >
              {loading ? '…' : 'Ask'}
            </button>
          </form>

          {response && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {response.responses?.map((r: any, i: number) => (
                <div key={i} style={{ borderLeft: '2px solid var(--green-bd)', paddingLeft: '16px', paddingTop: '4px', paddingBottom: '4px' }}>
                  <p style={{
                    fontFamily: "'Martian Mono', monospace",
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--signal)',
                    marginBottom: '6px',
                    letterSpacing: '0.02em',
                  }}>{r.persona_name ?? `Persona ${i + 1}`}</p>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'rgba(233,230,223,0.88)', lineHeight: 1.7 }}>{r.response}</p>
                </div>
              ))}
              {response.response && (
                <div style={{ borderLeft: '2px solid var(--border-hi)', paddingLeft: '16px' }}>
                  <p style={{ fontFamily: "'Barlow', sans-serif", fontSize: '14px', color: 'rgba(233,230,223,0.88)', lineHeight: 1.7 }}>{response.response}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
