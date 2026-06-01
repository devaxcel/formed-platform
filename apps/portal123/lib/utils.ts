import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  }).format(new Date(date));
}

export function formatTime(date: string | Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  }).format(new Date(date));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
  }).format(amount);
}

export function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export function statusColor(status: string) {
  const map: Record<string, string> = {
    active:            "bg-green-100 text-green-800",
    paid:              "bg-green-100 text-green-800",
    completed:         "bg-green-100 text-green-800",
    requested:         "bg-blue-100 text-blue-800",
    trainer_accepted:  "bg-blue-100 text-blue-800",
    admin_confirmed:   "bg-blue-100 text-blue-800",
    payment_pending:   "bg-yellow-100 text-yellow-800",
    unpaid:            "bg-yellow-100 text-yellow-800",
    pending:           "bg-yellow-100 text-yellow-800",
    cancelled:         "bg-red-100 text-red-800",
    failed:            "bg-red-100 text-red-800",
    no_show:           "bg-red-100 text-red-800",
    refunded:          "bg-gray-100 text-gray-800",
    on_hold:           "bg-orange-100 text-orange-800",
    rescheduled:       "bg-purple-100 text-purple-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

export function formatStatus(status: string) {
  return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}