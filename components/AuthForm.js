'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// mode: 'signup' | 'login'. Also used as the data-testid prefix.
export default function AuthForm({ mode }) {
  const isSignup = mode === 'signup';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);

    const supabase = createClient();
    const { data, error } = isSignup
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    if (!data.session) {
      setError('Account created, but no session was returned. Email confirmation must be turned off in Supabase.');
      setBusy(false);
      return;
    }
    // Full navigation so the server sees the new session cookie.
    window.location.assign('/app');
  }

  return (
    <div className="auth-card">
      <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
      <p className="muted">
        {isSignup ? 'Start turning your notes into flashcards.' : 'Log in to review your flashcards.'}
      </p>

      <form onSubmit={handleSubmit} className="stack">
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid={`${mode}-email`}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            name="password"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            data-testid={`${mode}-password`}
          />
          {isSignup && <small className="muted">At least 6 characters.</small>}
        </label>

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-block" disabled={busy} data-testid={`${mode}-submit`}>
          {busy ? 'Please wait…' : isSignup ? 'Sign up' : 'Log in'}
        </button>
      </form>

      <p className="muted center">
        {isSignup ? (
          <>Already have an account? <Link href="/login">Log in</Link></>
        ) : (
          <>New here? <Link href="/signup">Create an account</Link></>
        )}
      </p>
    </div>
  );
}
