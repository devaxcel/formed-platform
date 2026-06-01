import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Liability Waiver",
  description: "FORMED Liability Waiver — required before your first session.",
};

const sections = [
  {
    title: "Acknowledgement of Risk",
    items: [
      "Physical activity carries inherent risk of injury, including but not limited to muscle strains, joint injuries, and cardiovascular events.",
      "You voluntarily assume all risk associated with participating in FORMED training sessions.",
      "You acknowledge that no training programme is entirely free of risk.",
    ],
  },
  {
    title: "Health Disclosure",
    items: [
      "You confirm that you have disclosed all relevant health conditions, injuries, and limitations in your health intake form.",
      "You agree to inform your trainer of any changes to your health status before each session.",
      "You confirm that you have consulted a medical professional if recommended before engaging in exercise.",
    ],
  },
  {
    title: "Release of Liability",
    items: [
      "You release FORMED, its trainers, staff, and contractors from liability for injuries sustained during training.",
      "This release applies to injuries resulting from the inherent risk of physical training, not from gross negligence.",
      "You agree not to hold FORMED responsible for outcomes related to non-disclosure of health conditions.",
    ],
  },
  {
    title: "Equipment & Property",
    items: [
      "FORMED trainers bring their own professional equipment to every session.",
      "You are responsible for ensuring the training space is safe and free from hazards.",
      "FORMED is not responsible for damage to property during sessions.",
    ],
  },
  {
    title: "Agreement",
    items: [
      "A signed digital waiver is required before your first FORMED session.",
      "The waiver is completed during the onboarding process in the client portal.",
      "By completing onboarding, you confirm you have read, understood, and agreed to these terms.",
    ],
  },
];

export default function WaiverPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative h-[50vh] min-h-[380px] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&auto=format&fit=crop&q=80"
              alt="Liability Waiver"
              fill
              priority
              className="object-cover object-top"
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
              Liability Waiver
            </h1>
          </div>
        </section>

        {/* Content */}
        <section className="bg-cream py-24 lg:py-36">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="max-w-3xl">
              {/* Important notice */}
              <div className="bg-ink p-8 lg:p-10 mb-16">
                <p className="text-[10px] tracking-ultra uppercase text-warm/40 mb-3 font-body">
                  Important
                </p>
                <p className="text-cream/70 text-sm leading-relaxed font-body">
                  A signed liability waiver is required before your first
                  FORMED session. The waiver is completed digitally during
                  the onboarding process in your client portal. By proceeding,
                  you confirm you have read and understood this document.
                </p>
              </div>

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
                  Last updated: 2025. This is a summary waiver. The complete
                  digitally-signed waiver is provided during onboarding. For
                  questions contact{" "}
                  
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