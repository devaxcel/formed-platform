import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";
import TrainerApplyForm from "@/components/forms/TrainerApplyForm";

export const metadata: Metadata = {
  title: "Train With FORMED",
  description:
    "FORMED partners with experienced personal trainers who want consistent clients and professional standards.",
};

const looking = [
  "National certification (NASM, ACE, ISSA, or CSCS)",
  "1+ years of coaching experience",
  "Professional, punctual, and reliable",
  "Comfortable training clients in-home",
  "Willing to bring basic equipment",
  "Strong communication skills",
];

const offering = [
  "Consistent weekly clients",
  "Competitive session pay",
  "No sales or marketing required",
  "Flexible scheduling around your availability",
  "Premium brand association",
  "Professional operations support",
];

const equipment = [
  "Resistance bands",
  "Adjustable dumbbells or kettlebells",
  "Suspension straps (TRX or similar)",
  "Exercise mat",
];

const steps = [
  {
    number: "01",
    title: "Apply",
    description: "Complete our trainer application. Tell us about your experience, certifications, and availability.",
  },
  {
    number: "02",
    title: "Review",
    description: "Our team reviews your application, credentials, and background check. We follow up within 48 hours.",
  },
  {
    number: "03",
    title: "Onboard",
    description: "Complete our onboarding programme covering FORMED standards, client experience, and platform usage.",
  },
  {
    number: "04",
    title: "Train",
    description: "Get matched with clients in your area. Consistent bookings, professional support, no marketing required.",
  },
];

export default function TrainersPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative h-[80vh] min-h-[560px] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1920&auto=format&fit=crop&q=80"
              alt="Train with FORMED"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-ink/55" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
          </div>
          <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 pb-16 lg:pb-24 w-full">
            <p className="text-[10px] tracking-ultra uppercase text-cream/50 mb-3 font-body">
              Train With FORMED
            </p>
            <h1
              className="font-display font-light text-cream leading-tight max-w-3xl"
              style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
            >
              You focus on coaching.{" "}
              <em className="italic font-light text-warm">
                We handle the rest.
              </em>
            </h1>
            <p className="mt-6 text-cream/60 text-base max-w-lg font-body font-light leading-relaxed">
              FORMED partners with experienced trainers who want consistent
              clients, premium positioning, and professional standards. This
              is not a marketplace — we curate a small roster in each city.
            </p>
          </div>
        </section>

        {/* Who we want + what we offer */}
        <section className="bg-cream py-24 lg:py-36">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-stone mb-px">
              {/* Who we want */}
              <div className="bg-cream p-8 lg:p-14">
                <p className="text-[10px] tracking-ultra uppercase text-muted mb-8 font-body">
                  Who We&apos;re Looking For
                </p>
                <div className="space-y-0 border-t border-stone">
                  {looking.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-4 py-4 border-b border-stone"
                    >
                      <span className="w-1 h-1 rounded-full bg-ink flex-shrink-0 mt-2" />
                      <span className="text-ink text-sm font-body leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* What we offer */}
              <div className="bg-ink p-8 lg:p-14">
                <p className="text-[10px] tracking-ultra uppercase text-warm/40 mb-8 font-body">
                  What We Offer
                </p>
                <div className="space-y-0 border-t border-cream/10">
                  {offering.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-4 py-4 border-b border-cream/10"
                    >
                      <span className="w-1 h-1 rounded-full bg-warm flex-shrink-0 mt-2" />
                      <span className="text-cream/70 text-sm font-body leading-relaxed">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="bg-stone py-24 lg:py-36">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="mb-16">
              <p className="text-[10px] tracking-ultra uppercase text-muted mb-3 font-body">
                The Process
              </p>
              <h2
                className="font-display font-light text-ink leading-tight"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
              >
                How it works for trainers.
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-warm/30">
              {steps.map((s) => (
                <div key={s.number} className="bg-stone p-8 lg:p-10">
                  <span className="font-display text-5xl font-light text-warm leading-none">
                    {s.number}
                  </span>
                  <h3 className="font-display text-xl font-medium text-ink mt-5 mb-3">
                    {s.title}
                  </h3>
                  <p className="text-muted text-sm leading-relaxed font-body">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Equipment + CTA */}
        <section className="bg-ink py-24 lg:py-36">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-start">
              <div>
                <p className="text-[10px] tracking-ultra uppercase text-warm/40 mb-6 font-body">
                  Equipment Expectations
                </p>
                <h2 className="font-display text-3xl font-light text-cream mb-6">
                  What you&apos;ll need to bring.
                </h2>
                <p className="text-cream/50 text-sm leading-relaxed mb-8 font-body">
                  Trainers are expected to bring basic equipment to every
                  session. Clients provide the space — you provide the tools.
                </p>
                <div className="space-y-0 border-t border-cream/10">
                  {equipment.map((e) => (
                    <div
                      key={e}
                      className="flex items-center gap-4 py-4 border-b border-cream/10"
                    >
                      <span className="w-1 h-1 rounded-full bg-warm flex-shrink-0" />
                      <span className="text-cream/70 text-sm font-body">{e}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="overflow-hidden aspect-[4/3] img-zoom mb-8">
                  <Image
                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80"
                    alt="Professional trainer"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-[10px] tracking-ultra uppercase text-warm/40 mb-3 font-body">
                  Apply to Join
                </p>
                <p className="text-cream/50 text-sm leading-relaxed mb-8 font-body">
                  Qualified applicants will be contacted for next steps. We
                  review all applications personally and follow up within 48
                  hours.
                </p>
                <div className="lg:pl-16 pt-16 lg:pt-0">
  <p className="text-[10px] tracking-ultra uppercase text-warm/40 mb-4 font-body">
    Apply to Join
  </p>
  <p className="text-cream/50 text-sm leading-relaxed mb-8 font-body">
    Qualified applicants will be contacted for next steps. We review all
    applications personally and follow up within 48 hours.
  </p>
  <TrainerApplyForm />
</div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}