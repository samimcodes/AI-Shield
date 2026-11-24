import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Comparison from '../components/Comparison';
import Playground from '../components/Playground';
import SetupFlow from '../components/SetupFlow';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-zinc-100 selection:bg-cyan-500/20 selection:text-cyan-300">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Comparison />
        <Playground />
        <SetupFlow />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
