import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "FORMED Privacy Policy — how we collect, use, and protect your data.",
};

const sections = [
  {
    title: "What We Collect",
    items: [
      "Personal information: name, email, phone number, and location provided during application.",
      "Health information: injuries, limitations, and fitness history provided in the intake form.",
      "Payment information: processed and stored securely via Stripe. We do not store card numbers.",
      "Session data: session notes, progress records, and scheduling information.",
      "Usage data: how you interact with the client portal (anonymised).",
    ],
  },
  {
    title: "How We Use Your Data",
    items: [
      "To match you with the most suitable trainer for your goals and location.",
      "To schedule and manage your training sessions.",
      "To communicate with you regarding your membership and services.",
      "To process payments securely through Stripe.",
      "To improve our platform and service quality.",
    ],
  },
  {
    title: "Who We Share Data With",
    items: [
      "Your assigned trainer receives only the information necessary to train you effectively.",
      "We do not sell your data to third parties under any circumstances.",
      "Payment data is handled exclusively by Stripe under their privacy policy.",
      "We may share data as required by law.",
    ],
  },
  {
    title: "Data Security",
    items: [
      "All data is stored on encrypted servers (Supabase / PostgreSQL).",
      "Access to client data is role-based — only authorised staff and your trainer can view your records.",
      "We conduct regular security reviews of our platform and data practices.",
    ],
  },
  {
    title: "Your Rights",
    items: [
      "You may request access to all personal data we hold about you.",
      "You may request correction or deletion of your data at any time.",
      "You may withdraw consent for data use by cancelling your membership.",
      "Contact hello@formed.fit for any data-related requests.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative h-[50vh] min-h-[380px] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=1920&auto=format&fit=crop&q=80"
              alt="Privacy Policy"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-ink/70" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
          </div>
          <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 pb-14 lg:pb-20 w-full">
            <p className="text-[10px] tracking-ultra uppercase text-cream/50 mb-3 font-body">
              Legal
            </p>
            <h1
              className="font-display font-light text-cream leading-tight"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}
            >
              Privacy Policy
            </h1>
          </div>
        </section>

        {/* Content */}
        <section className="bg-cream py-24 lg:py-36">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-muted text-sm leading-relaxed font-body mb-16">
                FORMED respects your privacy. We collect only what we need to
                deliver the service and never sell your data. For any
                questions contact{" "}
                
                 <a href="mailto:hello@formed.fit"
                  className="text-ink hover:text-muted transition-colors"
                >
                  hello@formed.fit
                </a>
                .
              </p>

              <div className="space-y-16">
                {sections.map((s) => (
                  <div key={s.title}>
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="font-display text-2xl font-medium text-ink">
                        {s.title}
                      </h2>
                      <div className="flex-1 h-px bg-stone" />
                    </div>
                    <ul className="space-y-0">
                      {s.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-4 py-4 border-b border-stone last:border-0"
                        >
                          <span className="w-1 h-1 rounded-full bg-muted flex-shrink-0 mt-2" />
                          <span className="text-muted text-sm leading-relaxed font-body">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-20 pt-10 border-t border-stone">
                <p className="text-muted text-xs font-body leading-relaxed">
                  Last updated: 2025. For any privacy-related requests
                  contact{" "}
                  
                   <a href="mailto:hello@formed.fit"
                    className="text-ink hover:text-muted transition-colors"
                  >
                    hello@formed.fit
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}