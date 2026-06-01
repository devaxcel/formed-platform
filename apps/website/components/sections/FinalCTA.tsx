import Button from "@/components/ui/Button";
import Image from "next/image";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-32 lg:py-44">
      {/* BG Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&auto=format&fit=crop&q=80"
          alt="Train at home"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-ink/75" />
      </div>

      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 text-center">
        <p className="text-[10px] tracking-ultra uppercase text-warm/50 mb-6 font-body">
          Get Started
        </p>
        <h2 className="font-display font-light text-cream text-balance mb-6"
            style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}>
          Train smarter.
          <br />
          <em className="italic font-light text-warm">We handle the rest.</em>
        </h2>
        <p className="text-cream/50 text-base mb-12 max-w-md mx-auto leading-relaxed font-body">
          Limited trainer availability in Tampa Bay. Apply today to check
          your area and get matched within 48 hours.
        </p>
        <Button href="/apply" size="lg" variant="light">
          Apply for Membership
        </Button>
      </div>
    </section>
  );
}