import Navbar from "@/components/navbars";
import HeroSection from "@/components/hero-sections";
import { FeatureSection } from "@/components/feature-section";
import TestimonialsSection from "@/components/testimonials/testimonials";
import { FaqsSection } from "@/components/faqs-section";
import CTASection from "@/components/cta-sections";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <TestimonialsSection />
      <FaqsSection />
      <CTASection />
      <Footer />
    </>
  );
}
