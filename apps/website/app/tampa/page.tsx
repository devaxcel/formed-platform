import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Tampa Bay | FORMED",
  description: "Premium in-home personal training for Tampa Bay professionals. No commute, no crowds, no excuses. Apply today.",
};

export default function TampaPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero - Using the same fix that worked for homepage */}
        <section 
          className="relative min-h-[70vh] flex flex-col justify-end overflow-hidden"
          style={{ paddingTop: "80px", marginTop: "0px" }}
        >
          <div className="absolute inset-0">
            <Image
              src="/images/dev-coordination.png"  // Added leading slash
              alt="Tampa Bay skyline"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-ink/55" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
          </div>
          <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 pb-16 lg:pb-24 w-full">
            <p className="text-[10px] tracking-ultra uppercase text-cream/50 mb-3 font-body">
              Tampa Bay
            </p>
            <h1 className="font-display font-light text-cream leading-tight max-w-2xl"
                style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
              Premium in-home training,<br />
              <em className="font-light italic text-warm">delivered to Tampa Bay.</em>
            </h1>
          </div>
        </section>

        {/* Why FORMED in Tampa Section */}
        <section className="bg-cream py-24 lg:py-32">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <p className="text-[10px] tracking-ultra uppercase text-muted mb-4 font-body">
                Tampa Bay
              </p>
              <h2 className="font-display font-light text-ink text-4xl lg:text-5xl mb-6 leading-tight">
                Why FORMED in Tampa Bay
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6 text-muted text-sm leading-relaxed font-body">
                <p>
                  Tampa is built for movement, but busy professionals don't always have time to 
                  commute, wait for equipment, or deal with crowded gyms.
                </p>
                <p>
                  FORMED brings a <strong className="text-ink">premium, private fitness experience directly to you</strong>.
                </p>
                <p>
                  Whether you live in a high-rise downtown, a South Tampa home, or a waterfront condo, 
                  our trainers deliver structured, results-driven sessions without disrupting your schedule.
                </p>
                <div className="pt-4">
                  <Button href="/apply" size="lg" variant="dark">
                    Apply for Membership
                  </Button>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg">
                <Image
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop&q=80"
                  alt="Tampa training session"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (Localized) */}
        <section className="bg-stone py-24 lg:py-32">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-[10px] tracking-ultra uppercase text-muted mb-4 font-body">
                Simple Process
              </p>
              <h2 className="font-display font-light text-ink text-4xl lg:text-5xl mb-4 leading-tight">
                How it works in Tampa Bay
              </h2>
              <p className="text-muted text-sm font-body">
                From application to your first session — usually within 48 hours.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Apply",
                  description: "Tell us about your goals, schedule, and preferred training location.",
                },
                {
                  step: "02",
                  title: "Match",
                  description: "We match you with a vetted trainer based on your needs and neighborhood.",
                },
                {
                  step: "03",
                  title: "Train",
                  description: "Your trainer arrives fully equipped. No gym. No commute. Just results.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <p className="text-[40px] lg:text-[60px] font-display font-light text-warm/30 leading-none mb-4">
                    {item.step}
                  </p>
                  <h3 className="font-display text-xl text-ink mb-2">{item.title}</h3>
                  <p className="text-muted text-sm font-body">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coverage Area */}
        <section className="bg-cream py-24 lg:py-32">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <p className="text-[10px] tracking-ultra uppercase text-muted mb-4 font-body">
                  Coverage Area
                </p>
                <h2 className="font-display font-light text-ink text-4xl lg:text-5xl mb-6 leading-tight">
                  Where we train
                </h2>
                <div className="space-y-4 text-muted text-sm leading-relaxed font-body mb-8">
                  <p>
                    FORMED currently serves the greater Tampa Bay area, including:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      "South Tampa",
                      "Downtown Tampa",
                      "Channelside",
                      "Hyde Park",
                      "Davis Islands",
                      "Harbour Island",
                      "Westshore",
                      "Carrollwood",
                      "St. Petersburg",
                      "Clearwater",
                    ].map((area) => (
                      <div key={area} className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-warm" />
                        <span className="text-muted text-sm font-body">{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button href="/apply" size="lg" variant="dark">
                  Apply to get started
                </Button>
              </div>
              <div className="order-1 lg:order-2 overflow-hidden rounded-lg">
                <Image
                  src="/images/tampa-bay.png"  // Added leading slash
                  alt="Tampa Bay area"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-ink py-20 lg:py-28">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10 text-center">
            <p className="text-[10px] tracking-ultra uppercase text-warm mb-4 font-body">
              Limited Availability
            </p>
            <h2 className="font-display font-light text-cream text-4xl lg:text-5xl mb-6 leading-tight max-w-3xl mx-auto">
              Ready to train differently?
            </h2>
            <p className="text-cream/50 text-sm font-body mb-8 max-w-md mx-auto">
              Apply today. We follow up within 24 hours.
            </p>
            <Button href="/apply" size="lg" variant="light">
              Apply for Membership
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}