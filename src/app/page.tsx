import Hero from '../components/homepage/Hero';
import TrustBar from '../components/homepage/TrustBar';
import ProblemSolution from '../components/homepage/ProblemSolution';
import Features from '../components/homepage/Features';
import Pricing from '../components/homepage/Pricing';
import CTA from '../components/homepage/CTA';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TrustBar />
      <ProblemSolution />
      <Features />
      <Pricing />
      <CTA />
    </main>
  );
}