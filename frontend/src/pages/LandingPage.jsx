import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { AIFeatures } from "@/components/landing/AIFeatures";
import { Benefits } from "@/components/landing/Benefits";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQs } from "@/components/landing/FAQs";
import { Contact } from "@/components/landing/Contact";
import { CtaBanner } from "@/components/landing/CtaBanner";
export default function LandingPage() {
  return <>
      <Hero />
      <Features />
      <HowItWorks />
      <AIFeatures />
      <Benefits />
      <Testimonials />
      <FAQs />
      <Contact />
      <CtaBanner />
    </>;
}