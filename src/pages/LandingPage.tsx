import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import ProblemSection from '@/components/landing/ProblemSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import PricingSection from '@/components/landing/PricingSection';
import TrustBadges from '@/components/landing/TrustBadges';
import PartnersSection from '@/components/landing/PartnersSection';
import FaqSection from '@/components/landing/FaqSection';
import WaitlistSection from '@/components/landing/WaitlistSection';
import Footer from '@/components/layout/Footer';
import StickyCtaBanner from '@/components/layout/StickyCtaBanner';
import SurveyModal from '@/components/landing/survey/SurveyModal';
import { useFoundingSpots } from '@/hooks/useFoundingSpots';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function LandingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { spotsLeft, percentage } = useFoundingSpots();
  useScrollReveal();

  return (
    <div className="min-h-screen selection:bg-emerald-200">
      <Navbar />
      <HeroSection onOpenModal={() => setIsModalOpen(true)} spotsLeft={spotsLeft} percentage={percentage} />
      <ProblemSection />
      <HowItWorksSection />
      <PricingSection onOpenModal={() => setIsModalOpen(true)} />
      <TrustBadges />
      <PartnersSection />
      <FaqSection />
      <WaitlistSection onOpenModal={() => setIsModalOpen(true)} />
      <Footer />
      <StickyCtaBanner onOpenModal={() => setIsModalOpen(true)} />
      <SurveyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
