import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import WhoItsFor from "@/components/sections/WhoItsFor";
import WhyFormed from "@/components/sections/WhyFormed";
import MembershipPreview from "@/components/sections/MembershipPreview";
import FinalCTA from "@/components/sections/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <WhoItsFor />
        <WhyFormed />
        <MembershipPreview />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}