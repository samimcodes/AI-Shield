'use client';

import { ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#060911] text-slate-400 py-12 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5">
                <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#090d16]">
                  <ShieldAlert className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-bold text-base text-white tracking-tight">AI-Shield</span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Enterprise-grade Express & Next.js middleware defending proprietary data against unauthorized
              AI crawlers via contextual synthetic poisoning.
            </p>
            <div className="mt-4 flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational • Edge Engine Online</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2">
              <li><a href="#simulator" className="hover:text-cyan-400 transition-colors">Interactive Simulator</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Poisoning Engine</a></li>
              <li><a href="#integration" className="hover:text-cyan-400 transition-colors">Next.js Edge Setup</a></li>
              <li><a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing Plans</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">GitHub Repository</a></li>
              <li><a href="https://www.npmjs.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">npm Package (ai-shield)</a></li>
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Threat Model Taxonomy</a></li>
              <li><a href="#integration" className="hover:text-cyan-400 transition-colors">Documentation</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 AI-Shield Security. Distributed under MIT License.</p>
          <p className="flex items-center gap-1">
            Built for the modern web with Next.js, Tailwind CSS & TypeScript.
          </p>
        </div>
      </div>
    </footer>
  );
}
