'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Loader2, Lock, Mail, User as UserIcon } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload =
        mode === 'login'
          ? { email, password }
          : { name, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#09090b] text-zinc-100 px-4 py-12 bg-grid-pattern radial-spotlight">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 border border-white/10 group-hover:border-cyan-500/50 transition-colors shadow-lg">
          <Shield className="h-5 w-5 text-[#06B6D4]" />
        </div>
        <span className="font-semibold text-xl tracking-tight text-white">AI-Shield</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/70 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Mode Switcher */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-zinc-950 border border-white/5 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">
            {mode === 'login' ? 'Welcome back' : 'Create your AI-Shield account'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'login'
              ? 'Sign in to access your live API keys, telemetry, and billing.'
              : 'Get your live API key and protect 5,000 requests/mo for free.'}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Samim Hossen"
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#06B6D4] focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-xl border border-white/10 bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#06B6D4] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-zinc-950 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-[#06B6D4] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#06B6D4] hover:bg-cyan-400 text-zinc-950 font-semibold py-2.5 text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In' : 'Create Free Account'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-zinc-500">
        Protected by AI-Shield •{' '}
        <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
          Back to Home
        </Link>
      </p>
    </div>
  );
}
