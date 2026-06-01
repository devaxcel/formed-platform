import Button from "@/components/ui/Button";
import Image from "next/image";

const plans = [
  {
    freq: "1x / week",
    sessions: "4 sessions / month",
    price: "$520",
    duration: "45-60 minute sessions",
    note: "Ideal for getting started and building routine",
  },
  {
    freq: "2x / week",
    sessions: "8 sessions / month",
    price: "$980",
    duration: "45-60 minute sessions",
    note: "Most popular — measurable results, manageable commitment",
    featured: true,
  },
  {
    freq: "3x / week",
    sessions: "12 sessions / month",
    price: "$1,380",
    duration: "45-60 minute sessions",
    note: "Maximum results for committed clients",
  },
];

const included = [
  "Dedicated personal trainer",
  "In-home or private-space sessions",
  "Equipment provided by trainer",
  "Customised programme",
  "Session notes after every session",
  "Monthly progress reviews",
  "Consistent weekly schedule",
];

export default function MembershipPreview() {
  return (
    <section className="bg-ink py-24 lg:py-36">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div>
            <p className="text-[10px] tracking-ultra uppercase text-warm/40 mb-3 font-body">Membership</p>
            <h2 className="font-display font-light text-cream leading-tight"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
              Starting at{" "}
              <em className="italic text-warm">$520 / month.</em>
            </h2>
          </div>
          <p className="text-muted text-sm leading-relaxed max-w-xs font-body">
            No contracts. No long-term commitments. Month-to-month, built around you.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-cream/10 mb-16">
          {plans.map((p) => (
            <div key={p.freq} className={`p-8 lg:p-10 flex flex-col ${
              p.featured ? "bg-cream" : "bg-ink"
            }`}>
              {p.featured && (
                <span className="text-[10px] tracking-ultra uppercase text-muted mb-6 font-body">
                  Most Popular
                </span>
              )}
              <p className={`text-[10px] tracking-ultra uppercase mb-2 font-body ${
                p.featured ? "text-muted" : "text-warm/40"
              }`}>
                {p.freq}
              </p>
              <p className={`font-display font-light text-5xl mb-1 ${
                p.featured ? "text-ink" : "text-cream"
              }`}>
                {p.price}
              </p>
              <p className={`text-xs mb-2 font-body ${
                p.featured ? "text-muted" : "text-cream/30"
              }`}>
                {p.sessions}
              </p>
              {/* NEW: Session duration added */}
              <p className={`text-[10px] mb-6 font-body ${
                p.featured ? "text-muted/70" : "text-cream/40"
              }`}>
                {p.duration}
              </p>
              <p className={`text-sm leading-relaxed mt-auto font-body ${
                p.featured ? "text-muted" : "text-cream/50"
              }`}>
                {p.note}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom row — what's included + image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[10px] tracking-ultra uppercase text-warm/40 mb-6 font-body">
              Every membership includes
            </p>
            <ul className="space-y-0 border-t border-cream/10">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-4 py-3.5 border-b border-cream/10">
                  <span className="w-1 h-1 rounded-full bg-warm flex-shrink-0" />
                  <span className="text-cream/70 text-sm font-body">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            {/* Image */}
            <div className="overflow-hidden aspect-[16/10] img-zoom">
              <Image
                src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&auto=format&fit=crop&q=80"
                alt="Personal training session"
                width={900}
                height={562}
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-cream/40 text-sm leading-relaxed font-body">
              Membership is by application only. We review every request
              personally to confirm fit and trainer availability.
            </p>
            <Button href="/apply" size="lg" variant="light">
              Apply for Membership
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}