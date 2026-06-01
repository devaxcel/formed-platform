"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const links = [
  { label: "Services",  href: "/services" },
  { label: "About",     href: "/about" },
  { label: "FAQ",       href: "/faq" },
  { label: "Tampa Bay", href: "/tampa" },
];

export default function Navbar() {
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-cream/95 backdrop-blur-md border-b border-stone"
            : "bg-transparent"
        )}
      >
        <div className="max-w-screen-xl mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20 lg:h-24">

            {/* Logo — switches based on scroll state */}
            <Link href="/" className="flex items-center">
              <Image
                src={scrolled ? "/images/logo-light.png" : "/images/logo-dark.png"}
                alt="FORMED"
                width={200}
                height={80}
                className=" object-contain"
                priority
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-10">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "text-[10px] tracking-[0.25em] uppercase font-body font-medium transition-colors duration-200",
                    scrolled
                      ? "text-muted hover:text-ink"
                      : "text-cream/70 hover:text-cream"
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Apply CTA */}
            {/* Desktop Buttons */}
<div className="hidden lg:flex items-center gap-4">
  {/* Login Button */}
  <Link
    href="https://my.formed.fit/"
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      "text-[10px] tracking-[0.25em] uppercase font-body font-medium px-8 py-3.5 border transition-all duration-300",
      scrolled
        ? "bg-ink text-cream border-ink hover:bg-accent"
        : "bg-cream text-ink border-cream hover:bg-stone"
    )}
  >
    Log In
  </Link>
  
  {/* Apply CTA */}
  <Link
    href="/apply"
    className={cn(
      "text-[10px] tracking-[0.25em] uppercase font-body font-medium px-8 py-3.5 border transition-all duration-300",
      scrolled
        ? "bg-ink text-cream border-ink hover:bg-accent"
        : "bg-cream text-ink border-cream hover:bg-stone"
    )}
  >
    Apply Now
  </Link>
</div>

            {/* Mobile burger */}
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden flex flex-col gap-[5px] p-2"
              aria-label="Menu"
            >
              <span
                className={cn(
                  "block h-px w-6 transition-all duration-300",
                  scrolled ? "bg-ink" : "bg-cream",
                  open && "rotate-45 translate-y-[7px]"
                )}
              />
              <span
                className={cn(
                  "block h-px w-6 transition-all duration-300",
                  scrolled ? "bg-ink" : "bg-cream",
                  open && "opacity-0"
                )}
              />
              <span
                className={cn(
                  "block h-px w-6 transition-all duration-300",
                  scrolled ? "bg-ink" : "bg-cream",
                  open && "-rotate-45 -translate-y-[7px]"
                )}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full screen menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink flex flex-col justify-center px-10 transition-all duration-500",
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-8 right-6 text-cream/60 hover:text-cream"
          aria-label="Close menu"
        >
          <span className="text-[10px] tracking-[0.25em] uppercase font-body">Close</span>
        </button>

        <nav className="flex flex-col gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-display text-5xl font-light text-cream/80 hover:text-cream transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="mt-6">
  <Link
    href="https://my.formed.fit/"
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => setOpen(false)}
    className="inline-block bg-cream text-ink text-[10px] tracking-[0.25em] uppercase font-body px-10 py-4 hover:bg-stone transition-colors text-center w-full"
  >
    Log In
  </Link>
  <div className="mt-3">
    <Link
      href="/apply"
      onClick={() => setOpen(false)}
      className="inline-block bg-cream text-ink text-[10px] tracking-[0.25em] uppercase font-body px-10 py-4 hover:bg-stone transition-colors w-full text-center"
    >
      Apply for Membership
    </Link>
  </div>
</div>
        </nav>

        <div className="absolute bottom-8 left-10 right-10 flex items-center justify-between">
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted font-body">
            Tampa Bay · Private Training
          </p>
          <div className="flex items-center gap-5">
            <a href="https://www.instagram.com/getformed.fit" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-cream/40 hover:text-cream transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/getformed/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-cream/40 hover:text-cream transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a href="https://www.facebook.com/share/18GmmXdMCH/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-cream/40 hover:text-cream transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
