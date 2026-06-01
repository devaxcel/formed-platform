import Image from "next/image";

const profiles = [
  "Busy professionals",
  "Executives & founders",
  "Parents with limited availability",
  "Anyone who wants results without the gym",
];

export default function WhoItsFor() {
  return (
    <section className="bg-ink">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="relative h-[60vh] lg:h-auto min-h-[500px] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1600881333168-2ef49b341f30?w=1000&auto=format&fit=crop&q=80"
              alt="Professional training at home"
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-ink/20" />
          </div>

          {/* Content */}
          <div className="flex flex-col justify-center px-8 lg:px-16 py-20 lg:py-24">
            <p className="text-[10px] tracking-ultra uppercase text-warm/50 mb-4 font-body">
              Who It&apos;s For
            </p>
            <h2 className="font-display font-light text-cream leading-[1.1] text-balance mb-8"
                style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Designed for people who value their{" "}
              <em className="italic font-light text-warm">time.</em>
            </h2>
            <p className="text-cream/50 text-sm leading-relaxed mb-10 font-body">
              If gyms and fitness apps haven&apos;t worked — the commute, the
              crowds, the inconsistency — this will.
            </p>

            <div className="space-y-0 border-t border-cream/10">
              {profiles.map((p) => (
                <div key={p} className="flex items-center gap-5 py-4 border-b border-cream/10">
                  <span className="w-1 h-1 rounded-full bg-warm flex-shrink-0" />
                  <span className="text-cream/80 text-sm font-body">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}