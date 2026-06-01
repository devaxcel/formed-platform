import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Services",
  description: "In-home personal training services in Tampa Bay.",
};

const services = [
  {
    title: "In-Home Personal Training",
    description: "One-on-one training delivered to your home, condo, or private gym. Your trainer arrives with professional-grade equipment and a programme tailored to your goals.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Strength & Conditioning",
    description: "Build strength, improve mobility, and increase energy through structured, progressive training. Designed for real life — not gym culture.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Weight Loss & Body Composition",
    description: "Sustainable programmes focused on consistency, strength, and long-term results. No extreme diets. No burnout.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Mobility & Longevity",
    description: "Training focused on joint health, posture, and movement quality. Ideal for professionals who sit often or want to train pain-free.",
    image: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800&auto=format&fit=crop&q=80",
  },
  {
    title: "Corporate & Private Group Training",
    description: "On-site training for executives, teams, or private groups. Available by request.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80",
  },
];

const included = [
  "Certified personal trainer",
  "Equipment provided at every session",
  "Customised programming",
  "Consistent weekly schedule",
  "Session notes & progress tracking",
  "Monthly progress reviews",
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1920&auto=format&fit=crop&q=80"
              alt="Personal training services"
              fill priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-ink/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink to-transparent" />
          </div>
          <div className="relative z-10 max-w-screen-xl mx-auto px-6 lg:px-10 pb-16 lg:pb-24 w-full">
            <p className="text-[10px] tracking-ultra uppercase text-cream/50 mb-3 font-body">Services</p>
            <h1 className="font-display font-light text-cream leading-tight"
                style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}>
              Everything delivered to you.
            </h1>
          </div>
        </section>

        {/* Services */}
        <section className="bg-cream py-24 lg:py-36">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="space-y-0">
              {services.map((s, i) => (
                <div key={s.title}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-0 ${
                    i < services.length - 1 ? "border-b border-stone" : ""
                  } ${i % 2 === 0 ? "" : "lg:[&>*:first-child]:order-last"}`}>
                  {/* Image */}
                  <div className="overflow-hidden aspect-[16/9] lg:aspect-auto lg:min-h-[320px] img-zoom">
                    <Image
                      src={s.image} alt={s.title}
                      width={800} height={500}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Text */}
                  <div className="flex flex-col justify-center p-8 lg:p-14">
                    <h2 className="font-display text-3xl lg:text-4xl font-light text-ink mb-4">{s.title}</h2>
                    <p className="text-muted text-sm leading-relaxed font-body">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Included */}
        <section className="bg-ink py-24 lg:py-36">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-[10px] tracking-ultra uppercase text-warm/40 mb-4 font-body">Every Membership Includes</p>
                <ul className="space-y-0 border-t border-cream/10">
                  {included.map((item) => (
                    <li key={item} className="flex items-center gap-4 py-4 border-b border-cream/10">
                      <span className="w-1 h-1 rounded-full bg-warm flex-shrink-0" />
                      <span className="text-cream/70 text-sm font-body">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-cream/40 text-sm leading-relaxed mb-8 font-body">
                  Memberships are by application only. We confirm fit,
                  trainer availability, and service area before onboarding.
                </p>
                <Button href="/apply" size="lg" variant="light">Apply for Membership</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}