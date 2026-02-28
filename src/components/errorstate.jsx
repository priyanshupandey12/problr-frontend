// ErrorStates.jsx
// Usage:
//   <UnauthorizedPage />          — for auth-gated routes
//   <ErrorPage message="..." />   — for caught runtime errors
//   <AppErrorBoundary>...</AppErrorBoundary> — wraps any subtree

import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, Component } from 'react';

/* ─── Shared styles injected once ─────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&display=swap');

  .es-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0a0a0f;
    font-family: 'DM Mono', monospace;
    overflow: hidden;
    z-index: 9999;
  }

  /* Animated grid background */
  .es-grid {
    position: absolute;
    inset: -10%;
    background-image:
      linear-gradient(rgba(220,38,38,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(220,38,38,0.06) 1px, transparent 1px);
    background-size: 48px 48px;
    animation: es-drift 18s linear infinite;
  }

  @keyframes es-drift {
    from { transform: translate(0, 0); }
    to   { transform: translate(48px, 48px); }
  }

  /* Radial vignette that pulses on the error colour */
  .es-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 50% at 50% 50%,
      rgba(220,38,38,0.12) 0%,
      transparent 70%);
    animation: es-pulse 3s ease-in-out infinite;
  }

  @keyframes es-pulse {
    0%, 100% { opacity: 0.6; }
    50%       { opacity: 1;   }
  }

  .es-card {
    position: relative;
    z-index: 1;
    width: min(480px, 90vw);
    padding: 48px 40px;
    background: rgba(15, 10, 10, 0.85);
    border: 1px solid rgba(220,38,38,0.3);
    box-shadow:
      0 0 0 1px rgba(220,38,38,0.08),
      0 0 60px rgba(220,38,38,0.15),
      inset 0 1px 0 rgba(255,255,255,0.04);
    backdrop-filter: blur(20px);
    text-align: center;
    animation: es-appear 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
  }

  @keyframes es-appear {
    from { opacity: 0; transform: translateY(20px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }

  .es-code-line {
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: rgba(220,38,38,0.5);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .es-code-line::before,
  .es-code-line::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(220,38,38,0.25));
  }

  .es-code-line::after {
    background: linear-gradient(90deg, rgba(220,38,38,0.25), transparent);
  }

  .es-status {
    font-family: 'Syne', sans-serif;
    font-size: clamp(56px, 12vw, 96px);
    font-weight: 800;
    line-height: 1;
    color: #dc2626;
    letter-spacing: -0.04em;
    text-shadow: 0 0 40px rgba(220,38,38,0.4);
    margin: 0 0 8px;
    position: relative;
  }

  /* Scanline flicker on the big number */
  .es-status::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    color: #ef4444;
    clip-path: inset(40% 0 50% 0);
    animation: es-glitch 5s infinite;
    opacity: 0;
  }

  @keyframes es-glitch {
    0%, 94%, 100% { opacity: 0; transform: none; }
    95%            { opacity: 0.6; transform: translate(-3px, 1px); clip-path: inset(20% 0 60% 0); }
    97%            { opacity: 0.6; transform: translate(2px, -1px); clip-path: inset(55% 0 30% 0); }
  }

  .es-title {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #fca5a5;
    margin: 0 0 12px;
    letter-spacing: -0.01em;
  }

  .es-message {
    font-size: 13px;
    color: rgba(255,255,255,0.38);
    line-height: 1.7;
    margin: 0 0 36px;
    max-width: 320px;
    margin-left: auto;
    margin-right: auto;
  }

  .es-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 12px 28px;
    background: transparent;
    border: 1px solid rgba(220,38,38,0.45);
    color: #fca5a5;
    font-family: 'DM Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .es-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(220,38,38,0.08);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.25s ease;
  }

  .es-btn:hover::before { transform: scaleX(1); }
  .es-btn:hover {
    border-color: rgba(220,38,38,0.8);
    color: #fff;
    box-shadow: 0 0 20px rgba(220,38,38,0.2);
  }

  .es-btn:active { transform: scale(0.98); }

  .es-btn svg {
    width: 14px;
    height: 14px;
    transition: transform 0.2s ease;
  }

  .es-btn:hover svg { transform: translateX(-2px); }

  .es-detail-toggle {
    margin-top: 20px;
    background: none;
    border: none;
    color: rgba(255,255,255,0.2);
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    cursor: pointer;
    letter-spacing: 0.08em;
    transition: color 0.2s;
  }

  .es-detail-toggle:hover { color: rgba(255,255,255,0.45); }

  .es-detail-box {
    margin-top: 16px;
    padding: 14px 16px;
    background: rgba(0,0,0,0.4);
    border: 1px solid rgba(255,255,255,0.06);
    text-align: left;
    font-size: 11px;
    color: rgba(255,255,255,0.3);
    line-height: 1.6;
    word-break: break-word;
    animation: es-appear 0.25s ease both;
  }
`;

function StyleInjector() {
  const injected = useRef(false);
  useEffect(() => {
    if (injected.current) return;
    const tag = document.createElement('style');
    tag.textContent = STYLES;
    document.head.appendChild(tag);
    injected.current = true;
  }, []);
  return null;
}

/* ─── Arrow icon ───────────────────────────────────────────────────────────── */
const ArrowLeft = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3L5 8l5 5" />
  </svg>
);

/* ─── Base layout ──────────────────────────────────────────────────────────── */
function ErrorLayout({ statusCode, codeLine, title, message, detail, children }) {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <div className="es-overlay">
      <StyleInjector />
      <div className="es-grid" />
      <div className="es-vignette" />
      <div className="es-card">
        <p className="es-code-line">{codeLine}</p>
        <p className="es-status" data-text={statusCode}>{statusCode}</p>
        <h1 className="es-title">{title}</h1>
        <p className="es-message">{message}</p>
        {children}
        {detail && (
          <>
            <button className="es-detail-toggle" onClick={() => setShowDetail(v => !v)}>
              {showDetail ? '— hide details' : '+ show details'}
            </button>
            {showDetail && <div className="es-detail-box"><code>{detail}</code></div>}
          </>
        )}
      </div>
    </div>
  );
}


import { useState } from 'react';


export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <ErrorLayout
      statusCode="401"
      codeLine="unauthorised"
      title="Access Denied"
      message="You need to be signed in to view this page. Please authenticate and try again."
    >
      <button className="es-btn" onClick={() => navigate('/')}>
        <ArrowLeft /> Return Home
      </button>
    </ErrorLayout>
  );
}


export function ErrorPage({ message, detail }) {
  const navigate = useNavigate();

  return (
    <ErrorLayout
      statusCode="500"
      codeLine="runtime error"
      title="Something Went Wrong"
      message={message || "An unexpected error occurred. The issue has been noted — head back home and try again."}
      detail={detail}
    >
      <button className="es-btn" onClick={() => navigate('/')}>
        <ArrowLeft /> Return Home
      </button>
    </ErrorLayout>
  );
}


export class AppErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[AppErrorBoundary]', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <ErrorPage
          detail={
            import.meta.env.DEV
              ? this.state.error?.message
              : undefined
          }
        />
      );
    }
    return this.props.children;
  }
}