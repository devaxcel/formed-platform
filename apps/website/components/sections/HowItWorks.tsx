import Image from "next/image";

const steps = [
  {
    number: "01",
    title: "Apply",
    description: "Tell us your goals, schedule, and location. We personally review every application and respond within 24 hours.",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=80",
  },
  {
    number: "02",
    title: "Get Matched",
    description: "We pair you with a certified trainer who fits your needs, schedule, and neighbourhood. No marketplace browsing — we do the work.",
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80",
  },
  {
    number: "03",
    title: "Train",
    description: "Your trainer arrives with professional equipment and a programme tailored to you. Same trainer, same time, every week.",
    image: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&auto=format&fit=crop&q=80",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 lg:py-36 bg-cream">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-20">
          <div>
            <p className="text-[10px] tracking-ultra uppercase text-muted mb-3 font-body">The Process</p>
            <h2 className="font-display font-light text-ink leading-tight"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
              Simple. Consistent.{" "}
              <em className="italic font-light text-muted">Effective.</em>
            </h2>
          </div>
          <p className="text-muted text-sm leading-relaxed max-w-xs font-body">
            Three steps. Zero friction. We handle everything so you just show up and train.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-stone">
          {steps.map((step) => (
            <div key={step.number} className="bg-cream group">
              {/* Image */}
              <div className="overflow-hidden aspect-[4/3] img-zoom">
                <Image
                  src={step.image}
                  alt={step.title}
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Text */}
              <div className="p-8 lg:p-10">
                <span className="font-display text-6xl font-light text-stone leading-none">
                  {step.number}
                </span>
                <h3 className="font-display text-2xl font-medium text-ink mt-4 mb-3">
                  {step.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed font-body">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}