import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Playground from '../components/Playground';
import Features from '../components/Features';
import Comparison from '../components/Comparison';
import CodeIntegration from '../components/CodeIntegration';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Playground />
        <Features />
        <Comparison />
        <CodeIntegration />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
