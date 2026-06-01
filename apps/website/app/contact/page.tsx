import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with FORMED for general enquiries, partnerships, or corporate training in Tampa Bay.",
};

const channels = [
  {
    label: "General Enquiries",
    value: "hello@formed.fit",
    href: "mailto:hello@formed.fit",
    note: "For partnerships, corporate training, and general questions.",
  },
  {
    label: "Location",
    value: "Tampa Bay, Florida",
    href: null,
    note: "Currently serving Tampa Bay. New cities launching soon.",
  },
  {
    label: "Response Time",
    value: "Within 24–48 hours",
    href: null,
    note: "We review and respond to every enquiry personally.",
  },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920&auto=format&fit=crop&q=80"
              alt="Contact FORMED"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-ink/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
          </div>
          <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 pb-16 lg:pb-24 w-full">
            <p className="text-[10px] tracking-ultra uppercase text-cream/50 mb-3 font-body">
              Contact
            </p>
            <h1
              className="font-display font-light text-cream leading-tight max-w-xl"
              style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}
            >
              Get in touch.
            </h1>
          </div>
        </section>

        {/* Contact content */}
        <section className="bg-cream py-24 lg:py-36">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32">
              {/* Left — channels */}
              <div>
                <p className="text-[10px] tracking-ultra uppercase text-muted mb-10 font-body">
                  Reach Us
                </p>
                <div className="space-y-0 border-t border-stone">
                  {channels.map((c) => (
                    <div
                      key={c.label}
                      className="py-8 border-b border-stone grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      <div>
                        <p className="text-[10px] tracking-ultra uppercase text-muted mb-2 font-body">
                          {c.label}
                        </p>
                        {c.href ? (
                          
                           <a href={c.href}
                            className="font-display text-xl font-light text-ink hover:text-muted transition-colors"
                          >
                            {c.value}
                          </a>
                        ) : (
                          <p className="font-display text-xl font-light text-ink">
                            {c.value}
                          </p>
                        )}
                      </div>
                      <p className="text-sm text-muted leading-relaxed font-body self-center">
                        {c.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — membership CTA */}
              <div className="flex flex-col">
                <div className="overflow-hidden aspect-[4/3] img-zoom mb-8">
                  <Image
                    src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop&q=80"
                    alt="Personal training Tampa Bay"
                    width={800}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="bg-ink p-8 lg:p-10">
                  <p className="text-[10px] tracking-ultra uppercase text-warm/40 mb-3 font-body">
                    Membership
                  </p>
                  <h2 className="font-display text-2xl font-light text-cream mb-4">
                    Ready to apply?
                  </h2>
                  <p className="text-cream/50 text-sm leading-relaxed mb-8 font-body">
                    Membership requests should be submitted through the
                    application. We review every request personally and
                    follow up within 24–48 hours.
                  </p>
                  <Button href="/apply" size="md" variant="light">
                    Apply for Membership
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partnerships strip */}
        <section className="bg-ink py-20">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-[10px] tracking-ultra uppercase text-warm/40 mb-3 font-body">
                  Partnerships
                </p>
                <h2 className="font-display text-3xl font-light text-cream">
                  Corporate & Property Partnerships
                </h2>
              </div>
              <div>
                <p className="text-cream/50 text-sm leading-relaxed mb-6 font-body">
                  We partner with luxury apartments, corporate offices,
                  private clubs, and hotels to bring professional training
                  to their residents and teams.
                </p>
                
                 <a href="mailto:hello@formed.fit"
                  className="text-[10px] tracking-ultra uppercase text-warm hover:text-cream transition-colors font-body"
                >
                  hello@formed.fit &rarr;
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}