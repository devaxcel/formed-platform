import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "FORMED Terms of Service.",
};

const sections = [
  {
    title: "Platform Role ",
    items: [
      "FORMED is a platform that connects clients with independent personal trainers. FORMED does not provide training services directly",
    ],
  },
  {
    title: "User Responsibilities ",
    items: [
      "Users agree to provide accurate information and use the platform responsibly.",
    ],
  },
  {
    title: "Bookings ",
    items: [
      "All sessions must be booked through the platform. FORMED is not responsible for outcomes of sessions.",
    ],
  },
  {
    title: "Trainer Conduct",
    items: [
      "All FORMED trainers are independent contractors, not employees.",
      "FORMED trainers operate under FORMED standards and code of conduct.",
      "Any concerns about trainer conduct should be reported through the client portal support section.",
    ],
  },
  {
    title: "Payments",
    items: [
      "Payments are processed securely via third-party providers. FORMED is not liable for payment disputes.",
    ],
  },
  {
    title: "Liability Disclaimer",
    items: [
      "FORMED is not responsible for injuries, damages, or losses resulting from training sessions.",
    ],
  },
  {
    title: "Termination",
    items: [
      "FORMED may suspend or terminate accounts at its discretion.",
    ],
  },
   {
    title: "Changes",
    items: [
      "FORMED reserves the right to update these terms at any time.",
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative h-[50vh] min-h-[380px] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&auto=format&fit=crop&q=80"
              alt="Terms of Service"
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
              Terms of Service
            </h1>
          </div>
        </section>

        {/* Content */}
        <section className="bg-cream py-24 lg:py-36">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-muted text-sm leading-relaxed font-body mb-16">
                By using FORMED services, you agree to the following terms.
                Full terms are provided upon onboarding. For questions,
                contact{" "}
                
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
                  By using the platform, you agree to these terms. Complete terms
                  are provided during membership onboarding. For any questions
                  contact{" "}
                  
                   <a href="mailto:admin@formed.fit"
                    className="text-ink hover:text-muted transition-colors"
                  >
                    admin@formed.fit
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