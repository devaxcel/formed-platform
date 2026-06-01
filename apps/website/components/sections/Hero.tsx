
import Button from "@/components/ui/Button";
import Image from "next/image";

export default function Hero() {
  return (
    <section 
      className="relative min-h-screen flex flex-col justify-end overflow-hidden"
      style={{ paddingTop: "80px", marginTop: "0px" }}
    >
      {/* Full-bleed background image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1920&auto=format&fit=crop&q=80"
          alt="Private personal training session"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-ink/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      </div>

      {/* Content pinned to bottom */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 pb-16 lg:pb-24 w-full">
        <div className="max-w-3xl">
          <p className="text-[10px] tracking-ultra uppercase text-cream/50 mb-6 fade-up font-body">
            Tampa Bay · Private Training · 2026
          </p>
          <h1 className="font-display font-light text-cream leading-[1.05] text-balance"
              style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}>
            Private personal training,{" "}
            <em className="font-light italic text-warm">delivered to your home.</em>
          </h1>
          <p className="mt-6 text-cream/60 text-base lg:text-lg leading-relaxed max-w-xl font-body font-light">
            Certified trainers come to your home, fully equipped. No gym.
            No commute. No wasted time. Just consistent, professional
            training built around your life.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Button href="/apply" size="lg" variant="light">
              Apply for Membership
            </Button>
            <Button href="#how-it-works" size="lg" variant="ghost" className="opacity-80 hover:opacity-100">
              See How It Works
            </Button>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-cream/10 grid grid-cols-3 gap-6 max-w-lg">
          {[
            ["Vetted Trainers",     "Every trainer certified & background checked"],
            ["Equipment Included",  "Professional gear at every session"],
            ["Not a Marketplace",   "Direct, curated training experience"],
          ].map(([title, sub]) => (
            <div key={title}>
              <p className="text-cream text-xs font-body font-medium leading-tight">{title}</p>
              <p className="text-cream/40 text-[10px] leading-snug mt-1 font-body">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 right-8 lg:right-10 z-10 flex flex-col items-center gap-2 opacity-40">
        <div className="w-px h-16 bg-cream/60 animate-pulse" />
      </div>
    </section>
  );
}