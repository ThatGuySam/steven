import { CURRENCY_SYMBOLS } from "@booking/core";

export function formatCurrency(
  amountInCents: number,
  currency: string = "usd",
): string {
  const symbol = CURRENCY_SYMBOLS[currency] || "$";
  return `${symbol}${(amountInCents / 100).toFixed(2)}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 || 12;
  return `${displayH}:${minutes} ${ampm}`;
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
