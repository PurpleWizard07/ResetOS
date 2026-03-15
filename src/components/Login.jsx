"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { C } from "@/ui/theme";

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'http://localhost:3000'
        }
      });

      if (error) throw error;

      setMessage('Check your email for the magic link');
      setEmail('');
    } catch (error) {
      setMessage(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{
        fontFamily: "var(--font-plus-jakarta), -apple-system, system-ui, sans-serif",
        background: C.bg,
        color: C.text,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: C.surf,
          border: `1px solid ${C.bord}`,
          borderRadius: '16px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '32px',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: C.acc,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              color: '#fff',
              fontSize: '20px'
            }}>L</div>
            <span style={{
              fontWeight: 800,
              fontSize: '24px',
              letterSpacing: '-0.03em'
            }}>LifeOS</span>
          </div>

          <h2 style={{
            fontSize: '20px',
            fontWeight: 700,
            marginBottom: '8px',
            textAlign: 'center'
          }}>Welcome back</h2>
          <p style={{
            color: C.mut,
            fontSize: '14px',
            marginBottom: '28px',
            textAlign: 'center'
          }}>Sign in with your email to continue</p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                color: C.mut,
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '8px',
                letterSpacing: '0.02em'
              }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                style={{
                  background: C.high,
                  border: `1px solid ${C.bord}`,
                  borderRadius: '10px',
                  padding: '12px 14px',
                  color: C.text,
                  fontFamily: 'inherit',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%',
                  opacity: loading ? 0.6 : 1
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              style={{
                background: C.acc,
                color: '#fff',
                border: 'none',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 700,
                borderRadius: '10px',
                cursor: loading || !email.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !email.trim() ? 0.5 : 1,
                fontFamily: 'inherit',
                outline: 'none',
                width: '100%',
                transition: 'opacity 0.2s'
              }}
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
          </form>

          {message && (
            <div style={{
              marginTop: '20px',
              padding: '12px 16px',
              background: message.includes('Check your email') ? C.accBg : 'rgba(255,94,94,0.1)',
              border: `1px solid ${message.includes('Check your email') ? C.accBord : 'rgba(255,94,94,0.3)'}`,
              borderRadius: '10px',
              color: message.includes('Check your email') ? C.acc : '#FF5E5E',
              fontSize: '13px',
              textAlign: 'center',
              lineHeight: 1.5
            }}>
              {message}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
