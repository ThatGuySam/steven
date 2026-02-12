/** A bookable service offered by the business */
export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceInCents: number;
  currency: string;
  image?: string;
}

/** A single guest in a booking */
export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

/** Booking status lifecycle */
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed";

/** Payment status */
export type PaymentStatus =
  | "unpaid"
  | "processing"
  | "paid"
  | "refunded"
  | "failed";

/** A booking record */
export interface Booking {
  id: string;
  serviceId: string;
  date: string; // ISO date
  timeSlot: string; // HH:mm
  guests: Guest[];
  status: BookingStatus;
  payment: PaymentInfo;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Payment information tied to a booking */
export interface PaymentInfo {
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeCustomerId?: string;
  amountInCents: number;
  currency: string;
  receiptUrl?: string;
}

/** Available time slots for a given date */
export interface TimeSlot {
  time: string; // HH:mm
  available: boolean;
}

/** Request to create a new booking */
export interface CreateBookingRequest {
  serviceId: string;
  date: string;
  timeSlot: string;
  guests: Omit<Guest, "id">[];
  notes?: string;
  savePaymentInfo?: boolean;
}

/** Stripe Connect onboarding status */
export interface ConnectAccountStatus {
  accountId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  onboardingUrl?: string;
}

/** Saved payment method for returning customers */
export interface SavedPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}
