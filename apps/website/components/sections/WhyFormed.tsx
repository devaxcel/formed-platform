const reasons = [
  {
    title: "Vetted, certified trainers",
    description: "Every trainer is nationally certified, background checked, and professionally vetted before working with any FORMED client.",
  },
  {
    title: "Equipment included",
    description: "Your trainer arrives with professional-grade equipment. Resistance bands, kettlebells, suspension straps — all of it.",
  },
  {
    title: "Private, in-home sessions",
    description: "Train in your home, condo gym, or private space. Never in a public gym. Never sharing equipment.",
  },
  {
    title: "Consistent scheduling",
    description: "Same trainer, same time, every week. Consistency is the foundation of every result.",
  },
  {
    title: "Progress tracked",
    description: "Session notes, monthly progress reviews, and milestone tracking built in to every membership.",
  },
  {
    title: "No contracts",
    description: "Month-to-month memberships. Pause or cancel with notice through your client portal.",
  },
];

export default function WhyFormed() {
  return (
    <section className="py-24 lg:py-36 bg-cream">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="mb-20 max-w-2xl">
          <p className="text-[10px] tracking-ultra uppercase text-muted mb-3 font-body">Why FORMED</p>
          <h2 className="font-display font-light text-ink leading-tight"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
            Everything handled.{" "}
            <em className="italic font-light text-muted">You just train.</em>
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-stone">
          {reasons.map((r, i) => (
            <div key={r.title}
              className="bg-cream p-8 lg:p-10 hover:bg-stone transition-colors duration-300 group">
              <span className="font-display text-5xl font-light text-stone group-hover:text-warm transition-colors duration-300 leading-none">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-body font-medium text-ink text-sm mt-5 mb-3 tracking-wide">
                {r.title}
              </h3>
              <p className="text-muted text-sm leading-relaxed font-body">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}