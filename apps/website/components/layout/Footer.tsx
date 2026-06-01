import Link from "next/link";
import Image from "next/image";

const cols = [
  {
    title: "Platform",
    links: [
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Services",     href: "/services" },
      { label: "Membership",   href: "/apply" },
      { label: "Tampa Bay",    href: "/tampa" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About",         href: "/about" },
      { label: "Train With Us", href: "/trainers" },
      { label: "FAQ",           href: "/faq" },
      { label: "Contact",       href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy",   href: "/privacy" },
      { label: "Liability Waiver", href: "/waiver" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 pt-20 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-16 border-b border-cream/10">
          <div className="col-span-2 lg:col-span-1">
            {/* Logo instead of text */}
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/logo-dark.png"
                alt="FORMED"
                width={100}
                height={50}
                className=" object-contain"
              />
            </Link>
            <p className="text-warm text-sm leading-relaxed max-w-xs">
              Private, in-home personal training for busy professionals.
            </p>
            <p className="text-muted text-[10px] tracking-ultra uppercase mt-6">Tampa Bay, Florida</p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <p className="text-[10px] tracking-ultra uppercase text-muted mb-6 font-body">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}
                      className="text-sm text-cream/60 hover:text-cream transition-colors duration-200 font-body">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-muted text-xs font-body">© {new Date().getFullYear()} FORMED. All rights reserved.</p>
          <p className="text-muted text-[10px] tracking-ultra uppercase">New cities launching soon</p>
        </div>
      </div>
    </footer>
  );
}