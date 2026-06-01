import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps {
  href?: string;
  onClick?: () => void;
  variant?: "dark" | "light" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  href, onClick, variant = "dark", size = "md",
  children, className, type = "button", disabled, fullWidth,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center tracking-ultra uppercase font-body font-medium text-[10px] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed";

  const variants = {
    dark:    "bg-ink text-cream hover:bg-accent border border-ink",
    light:   "bg-cream text-ink hover:bg-stone border border-cream",
    outline: "bg-transparent text-ink border border-ink hover:bg-ink hover:text-cream",
    ghost:   "bg-transparent text-cream/70 border border-cream/30 hover:border-cream hover:text-cream",
  };

  const sizes = {
    sm: "px-5 py-2.5",
    md: "px-8 py-3.5",
    lg: "px-12 py-5",
  };

  const cls = cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);

  if (href) return <Link href={href} className={cls}>{children}</Link>;

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}