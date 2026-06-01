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

// Social icons using SVG paths matching the FORMED brand
const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/getformed.fit",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <circle cx="12" cy="12" r="4"/>
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/getformed/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/18GmmXdMCH/",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="max-w-screen-xl mx-auto px-6 lg:px-10 pt-20 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-16 border-b border-cream/10">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/logo-dark.png"
                alt="FORMED"
                width={100}
                height={50}
                className="object-contain"
              />
            </Link>
            <p className="text-warm text-sm leading-relaxed max-w-xs">
              Private, in-home personal training for busy professionals.
            </p>
            <p className="text-muted text-[10px] tracking-ultra uppercase mt-6 mb-6">
              Tampa Bay, Florida
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-4">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-cream/40 hover:text-cream transition-colors duration-200"
                >
                  {s.icon}
                </a>
              ))}
            </div>
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
          <div className="flex items-center gap-6">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-muted hover:text-cream transition-colors duration-200 sm:hidden"
              >
                {s.icon}
              </a>
            ))}
            <p className="text-muted text-[10px] tracking-ultra uppercase">New cities launching soon</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
