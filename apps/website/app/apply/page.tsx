import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ApplyForm from "@/components/forms/ApplyForm";

export const metadata: Metadata = {
  title: "Apply for Membership",
  description: "Apply for a FORMED membership. Limited availability in Tampa Bay.",
};

export default function ApplyPage() {
  return (
    <>
      <Navbar />
      <main>
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
          {/* Left — sticky image */}
          <div className="relative hidden lg:block">
            <div className="sticky top-0 h-screen overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1000&auto=format&fit=crop&q=80"
                alt="Apply for FORMED membership"
                fill priority
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-ink/40" />
              <div className="absolute inset-0 flex flex-col justify-end p-12">
                <p className="font-display text-cream text-4xl font-light leading-tight mb-4">
                  Limited availability<br />
                  <em className="italic text-warm">in Tampa Bay.</em>
                </p>
                <p className="text-cream/50 text-sm font-body">
                  We follow up within 24–48 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="bg-cream px-6 lg:px-14 py-24 lg:py-20">
            <div className="max-w-lg mx-auto lg:mx-0 pt-10">
              <p className="text-[10px] tracking-ultra uppercase text-muted mb-3 font-body">Apply</p>
              <h1 className="font-display text-4xl font-light text-ink mb-2">Apply for Membership</h1>
              <p className="text-muted text-sm leading-relaxed mb-6 font-body">
                A membership-based service with limited availability. We review every application personally.
              </p>

              {/* NEW: What happens next section */}
              <div className="bg-stone/30 p-5 mb-8 rounded-sm">
                <p className="text-[10px] tracking-ultra uppercase text-muted mb-3 font-body">
                  What happens next
                </p>
                <p className="text-sm text-ink leading-relaxed font-body">
                  We review your application within 24–48 hours, match you with a vetted trainer, 
                  and schedule your first session, delivered directly to you.
                </p>
              </div>

              {/* NEW: Progress indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  {[
                    { step: 1, label: "Apply" },
                    { step: 2, label: "Review" },
                    { step: 3, label: "Match" },
                    { step: 4, label: "Train" },
                  ].map((item, idx) => (
                    <div key={item.step} className="flex-1">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-stone flex items-center justify-center">
                          <span className="text-[10px] font-body text-muted">{item.step}</span>
                        </div>
                        <p className="text-[9px] text-muted font-body mt-2">{item.label}</p>
                      </div>
                      {idx < 3 && (
                        <div className="flex-1 h-px bg-stone mt-4 -ml-1" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <ApplyForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}