'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Plus, Copy, Check, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';

export interface ApiKeyItem {
  id: string;
  key: string;
  name: string;
  isActive: boolean;
  requestsThisMonth: number;
  createdAt: string;
}

export default function ApiKeysManager({
  initialKeys,
}: {
  initialKeys: ApiKeyItem[];
}) {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKeyItem[]>(initialKeys);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [error, setError] = useState('');

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const res = await fetch('/api/v1/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim() || `Project Key #${keys.length + 1}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not create API key.');
        return;
      }
      setKeys((prev) => [
        {
          id: data.apiKey.id,
          key: data.apiKey.key,
          name: data.apiKey.name,
          isActive: data.apiKey.isActive,
          requestsThisMonth: data.apiKey.requestsThisMonth ?? 0,
          createdAt: new Date(data.apiKey.createdAt).toLocaleDateString(),
        },
        ...prev,
      ]);
      setNewKeyName('');
      router.refresh();
    } catch {
      setError('Network error while creating API key.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    setError('');
    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/keys?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not revoke API key.');
        return;
      }
      setKeys((prev) => prev.filter((k) => k.id !== id));
      router.refresh();
    } catch {
      setError('Network error while revoking API key.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (id: string, keyValue: string) => {
    navigator.clipboard.writeText(keyValue);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const maskKey = (k: string) =>
    k.length > 14 ? `${k.slice(0, 12)}••••••••••••${k.slice(-4)}` : k;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Key className="h-4 w-4 text-[#06B6D4]" />
            <span>API Keys Management</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Create separate keys for production, staging, or multiple websites.
          </p>
        </div>

        <form onSubmit={handleCreateKey} className="flex items-center gap-2">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="e.g. WordPress Blog"
            className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:border-[#06B6D4] focus:outline-none w-40 sm:w-48"
          />
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#06B6D4] hover:bg-cyan-400 text-zinc-950 font-semibold px-3 py-1.5 text-xs transition-all cursor-pointer disabled:opacity-60 shrink-0"
          >
            {creating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="h-3.5 w-3.5" />
            )}
            <span>New Key</span>
          </button>
        </form>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs text-red-300">
          {error}
        </div>
      )}

      <div className="mt-4 divide-y divide-white/5">
        {keys.map((item) => {
          const isRevealed = !!revealedIds[item.id];
          return (
            <div
              key={item.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{item.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-[#10B981] border border-emerald-500/20">
                    Active
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {item.requestsThisMonth.toLocaleString()} hits
                  </span>
                </div>
                <div className="font-mono text-xs text-zinc-400">
                  {isRevealed ? item.key : maskKey(item.key)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleReveal(item.id)}
                  className="p-1.5 rounded-lg border border-white/10 bg-zinc-950 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title={isRevealed ? 'Hide key' : 'Reveal key'}
                >
                  {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.key)}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-zinc-950 px-2.5 py-1.5 text-[11px] font-mono text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#10B981]" />
                      <span className="text-[#10B981]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                {keys.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteKey(item.id)}
                    disabled={deletingId === item.id}
                    className="p-1.5 rounded-lg border border-white/10 bg-zinc-950 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer disabled:opacity-50"
                    title="Revoke key"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
