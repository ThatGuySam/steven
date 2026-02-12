/** Default services for the booking system */
export const DEFAULT_SERVICES = [
  {
    id: "consultation",
    name: "Consultation",
    description:
      "One-on-one consultation session to discuss your needs and create a personalized plan.",
    durationMinutes: 60,
    priceInCents: 15000,
    currency: "usd",
  },
  {
    id: "standard-session",
    name: "Standard Session",
    description:
      "A full standard session tailored to your requirements with follow-up notes.",
    durationMinutes: 90,
    priceInCents: 25000,
    currency: "usd",
  },
  {
    id: "premium-package",
    name: "Premium Package",
    description:
      "Premium experience including extended session time, priority scheduling, and dedicated support.",
    durationMinutes: 120,
    priceInCents: 45000,
    currency: "usd",
  },
  {
    id: "group-session",
    name: "Group Session",
    description:
      "Group session for up to 5 people. Perfect for teams or friend groups.",
    durationMinutes: 120,
    priceInCents: 60000,
    currency: "usd",
  },
] as const;

/** Business hours configuration */
export const BUSINESS_HOURS = {
  start: 9, // 9 AM
  end: 17, // 5 PM
  slotDurationMinutes: 30,
  daysOff: [0, 6], // Sunday, Saturday
} as const;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: "$",
  eur: "\u20AC",
  gbp: "\u00A3",
};
