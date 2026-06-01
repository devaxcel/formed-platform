import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "FAQ | FORMED",
  description:
    "Frequently asked questions about FORMED private personal training in Tampa Bay.",
};

const faqs = [
  {
    category: "Sessions",
    items: [
      {
        q: "Do I need equipment?",
        a: "No. Your trainer brings everything needed — resistance bands, dumbbells, kettlebells, suspension straps, and a mat. You need nothing except a space to train.",
      },
      {
        q: "Where do sessions take place?",
        a: "Sessions take place in your home, condo gym, garage, or any private space. We come to you.",
      },
      {
        q: "How long are sessions?",
        a: "Sessions are typically 45–60 minutes depending on your membership plan and goals.",
      },
      {
        q: "Is this suitable for beginners?",
        a: "Yes. All programmes are tailored to your experience level. We work with complete beginners through advanced athletes.",
      },
    ],
  },
  {
    category: "Trainers",
    items: [
      {
        q: "Can I keep the same trainer?",
        a: "Yes. Consistency with your trainer is a core priority at FORMED. You will be matched once and work with that trainer on an ongoing basis.",
      },
      {
        q: "Are trainers insured?",
        a: "Yes. All FORMED trainers carry professional liability insurance and are nationally certified and background checked before joining the platform.",
      },
      {
        q: "Can I change my trainer?",
        a: "Yes. Reassignment requests are handled by our operations team through the support section of your client portal.",
      },
      {
        q: "How are trainers selected?",
        a: "Every trainer goes through a rigorous application, credential review, interview, and onboarding programme before working with any FORMED client.",
      },
    ],
  },
  {
    category: "Membership & Billing",
    items: [
      {
        q: "Is there a contract?",
        a: "No long-term contracts. Memberships are month-to-month. You can pause or cancel with notice through your client portal.",
      },
      {
        q: "How does billing work?",
        a: "Memberships are billed monthly. Your payment method is charged automatically at the beginning of each month for your selected membership tier. No per-booking fees, no surprise charges — just simple, predictable monthly billing.",
      },
      {
        q: "What is the cancellation policy?",
        a: "Cancellations with more than 24 hours notice receive a full refund. Cancellations within 24 hours are non-refundable as the trainer slot has been reserved.",
      },
      {
        q: "Can I pause my membership?",
        a: "Yes. Pause requests are submitted through your client portal and handled by our operations team.",
      },
    ],
  },
  {
    category: "Getting Started",
    items: [
      {
        q: "How does the application process work?",
        a: "You apply, we review your application within 24-48 hours, match you with a vetted trainer, and schedule your first session delivered directly to you.",
      },
      {
        q: "What areas do you serve?",
        a: "Currently serving Tampa Bay — including Downtown Tampa, Hyde Park, South Tampa, Channelside, Westshore, and surrounding neighbourhoods.",
      },
      {
        q: "What if I need to reschedule?",
        a: "Reschedule requests are submitted through your client portal with 24-hour notice. Our operations team handles all scheduling changes.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative h-[65vh] min-h-[480px] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&auto=format&fit=crop&q=80"
              alt="FAQ — FORMED"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-ink/65" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
          </div>
          <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 pb-16 lg:pb-24 w-full">
            <p className="text-[10px] tracking-ultra uppercase text-cream/50 mb-3 font-body">
              FAQ
            </p>
            <h1
              className="font-display font-light text-cream leading-tight max-w-2xl"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}
            >
              Everything you need to know.
            </h1>
          </div>
        </section>

        {/* FAQ content */}
        <section className="bg-cream py-24 lg:py-36">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="max-w-4xl">
              {faqs.map((section, si) => (
                <div key={section.category} className={si > 0 ? "mt-20" : ""}>
                  {/* Category label */}
                  <div className="flex items-center gap-4 mb-8">
                    <p className="text-[10px] tracking-ultra uppercase text-muted font-body">
                      {section.category}
                    </p>
                    <div className="flex-1 h-px bg-stone" />
                  </div>

                  {/* Questions */}
                  <div className="space-y-0">
                    {section.items.map((faq, i) => (
                      <div
                        key={faq.q}
                        className={`py-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-16 ${
                          i < section.items.length - 1
                            ? "border-b border-stone"
                            : ""
                        }`}
                      >
                        <h3 className="font-display text-lg font-medium text-ink leading-snug">
                          {faq.q}
                        </h3>
                        <p className="text-muted text-sm leading-relaxed font-body">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Still have questions */}
              <div className="mt-24 bg-ink p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div>
                  <p className="text-[10px] tracking-ultra uppercase text-warm/40 mb-3 font-body">
                    Still Have Questions?
                  </p>
                  <h2 className="font-display text-3xl font-light text-cream">
                    We&apos;re here to help.
                  </h2>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button href="/contact" size="md" variant="light">
                    Contact Us
                  </Button>
                  <Button href="/apply" size="md" variant="ghost">
                    Apply Now
                  </Button>
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