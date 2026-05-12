import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-ink flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-14 border-r border-cream/10">
        <a
  href="https://www.formed.fit"
  target="_blank"
  rel="noopener noreferrer"
>
  <img
    src="/images/Logo-dark.png"
    alt="FORMED Logo"
    className="h-8 w-auto object-contain"
  />
</a>
        <div>
          <p className="font-display text-5xl font-light text-cream leading-tight mb-4">
            Welcome back.
          </p>
          <p className="text-cream/40 text-sm font-body leading-relaxed max-w-xs">
            Sign in to manage your sessions, track your progress, and stay connected with your trainer.
          </p>
        </div>
        <p className="text-muted text-xs font-body tracking-widest uppercase">
          Tampa Bay · Private Training
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-10">
            <p className="font-display text-cream text-2xl font-light">FORMED</p>
          </div>
          <p className="text-[10px] tracking-widest uppercase text-muted mb-2 font-body">
            Client Portal
          </p>
          <h1 className="font-display text-4xl font-light text-cream mb-8">
            Sign in
          </h1>
          <LoginForm />
          <p className="mt-8 text-center text-xs text-muted font-body">
            Not a member?{" "}
            
             <a href="https://formed.fit/apply"
              className="text-warm hover:text-cream transition-colors"
            >
              Apply for membership
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}