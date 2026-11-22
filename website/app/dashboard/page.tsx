import React from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import OnboardingWizard from '@/components/dashboard/OnboardingWizard';
import AnalyticsOverview from '@/components/dashboard/AnalyticsOverview';
import BotActivityFeed from '@/components/dashboard/BotActivityFeed';

export const metadata = {
  title: 'Dashboard | AI-Shield Autonomous Defense',
  description: 'Monitor live bot interceptions, honeypot traps, and data poisoning activity in real time.',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100">
      <DashboardHeader
        plan="Free"
        requestsUsed={4200}
        requestsMax={5000}
      />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Step 1: Onboarding Wizard (displayed prominently for onboarding) */}
        <OnboardingWizard apiKey="as_live_8f3a992bc401e74a89d9e2" />

        {/* Step 2: Main Analytics Overview */}
        <AnalyticsOverview
          requestsUsed={4200}
          requestsMax={5000}
          planName="Free"
        />

        {/* Step 3: Real-Time Bot Activity Feed */}
        <BotActivityFeed />
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-zinc-600 font-mono">
        AI-Shield Control Plane • Sub-2ms Lookup Engine Active
      </footer>
    </div>
  );
}
