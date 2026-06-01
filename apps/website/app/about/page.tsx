import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About | FORMED",
  description: "FORMED was created for people who want to train consistently without building their lives around the gym.",
};

const standards = [
  "Nationally certified (NASM, ACE, ISSA, or CSCS)",
  "Background checked",
  "Professionally vetted and interviewed",
  "Experienced in private, in-home training",
  "Reliable, punctual, and professional",
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=1920&auto=format&fit=crop&q=80"
              alt="About FORMED"
              fill priority
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-ink/55" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
          </div>
          <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 pb-16 lg:pb-24 w-full">
            <p className="text-[10px] tracking-ultra uppercase text-cream/50 mb-3 font-body">About</p>
            <h1 className="font-display font-light text-cream leading-tight max-w-2xl"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
              Fitness should fit your schedule, not compete with it.
            </h1>
          </div>
        </section>

        {/* Philosophy */}
        <section className="bg-cream py-24 lg:py-36">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32">
              <div>
                <p className="text-[10px] tracking-ultra uppercase text-muted mb-4 font-body">Our Philosophy</p>
                <h2 className="font-display font-light text-ink text-4xl lg:text-5xl mb-8 leading-tight">
                  Why FORMED exists
                </h2>
                <div className="space-y-5 text-muted text-sm leading-relaxed font-body">
                  <p>FORMED was created for people who want to train consistently without building their lives around the gym.</p>
                  <p>Results come from consistency, structure, and quality coaching — not motivation or extreme programmes. FORMED removes friction so training becomes routine.</p>
                  <p>We believe the best workout is the one that actually happens. By bringing the trainer to you, we remove every excuse.</p>
                </div>
              </div>
              <div className="overflow-hidden aspect-[3/4] lg:aspect-auto img-zoom">
                <Image
                  src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&auto=format&fit=crop&q=80"
                  alt="Training at home"
                  width={800} height={1000}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Founder Story Section - Image adjusted */}
        <section className="bg-stone py-24 lg:py-36">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <p className="text-[10px] tracking-ultra uppercase text-muted mb-4 font-body">Founder Story</p>
                <h2 className="font-display font-light text-ink text-4xl lg:text-5xl mb-6 leading-tight">
                  Fitness should adapt to your life.
                </h2>
                <div className="space-y-5 text-muted text-sm leading-relaxed font-body">
                  <p>
                    FORMED was founded by <strong className="text-ink">Rodney Cilien, MBA, NASM-CPT</strong> with a simple vision:
                    Make high-level personal training more accessible, more convenient, and more consistent for people with demanding schedules.
                  </p>
                  <p>
                    After seeing how many individuals struggled to stay consistent with traditional gyms — commuting, waiting for equipment, 
                    fitting workouts into overcrowded schedules — Rodney built FORMED around one core idea:
                  </p>
                  <p className="text-ink font-medium italic">
                    "Fitness should adapt to your life — not the other way around."
                  </p>
                  <p>
                    Today, FORMED brings premium, private fitness directly to your home. No commute. No crowds. No excuses. Just results.
                  </p>
                </div>
                <div className="mt-8">
                  <Button href="/apply" size="lg" variant="dark">
                    Apply to get started with FORMED today
                  </Button>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative aspect-square w-full max-w-md mx-auto lg:max-w-full overflow-hidden rounded-lg">
                  <Image
                    src="/images/rodney-headshot.png"
                    alt="Rodney Cilien, Founder of FORMED"
                    fill
                    className="object-cover object-[50%_30%]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Not a marketplace */}
        <section className="bg-ink py-24 lg:py-36">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-[10px] tracking-ultra uppercase text-warm/40 mb-4 font-body">Our Standard</p>
                <h2 className="font-display font-light text-cream text-4xl lg:text-5xl mb-6 leading-tight">
                  Not a marketplace.
                </h2>
                <p className="text-cream/50 text-sm leading-relaxed mb-10 font-body">
                  FORMED is not a platform where you browse random trainers.
                  We curate a small, vetted roster of professionals and match
                  clients intentionally based on goals, location, and schedule.
                </p>
                <ul className="border-t border-cream/10">
                  {standards.map((s) => (
                    <li key={s} className="flex items-center gap-4 py-4 border-b border-cream/10">
                      <span className="w-1 h-1 rounded-full bg-warm flex-shrink-0" />
                      <span className="text-cream/70 text-sm font-body">{s}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <Button href="/apply" size="lg" variant="light">Apply for Membership</Button>
                </div>
              </div>
              <div className="overflow-hidden aspect-[4/3] img-zoom">
                <Image
                  src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&auto=format&fit=crop&q=80"
                  alt="Professional trainer"
                  width={900} height={675}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}