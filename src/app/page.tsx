import { Header } from "./_components/Header";
import { HeroSection } from "./_components/HeroSection";
import { StatsSection } from "./_components/StatsSection";
import { FeaturesSection } from "./_components/FeaturesSection";
import { HowItWorksSection } from "./_components/HowItWorksSection";
import { CTASection } from "./_components/CTASection";
import { Footer } from "./_components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
