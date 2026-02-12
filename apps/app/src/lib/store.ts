import { atom } from "jotai";
import type { Guest, Service, Booking } from "@booking/core";

/** Currently selected service for booking */
export const selectedServiceAtom = atom<Service | null>(null);

/** Selected date for booking */
export const selectedDateAtom = atom<string>("");

/** Selected time slot */
export const selectedTimeSlotAtom = atom<string>("");

/** Guest list for current booking */
export const guestsAtom = atom<Guest[]>([]);

/** Whether to save payment info for future bookings */
export const savePaymentInfoAtom = atom<boolean>(false);

/** Booking notes */
export const bookingNotesAtom = atom<string>("");

/** Current user email (used for looking up bookings) */
export const userEmailAtom = atom<string>(
  localStorage.getItem("booking_email") || "",
);

/** Persist email to localStorage */
export const setUserEmailAtom = atom(null, (_get, set, email: string) => {
  localStorage.setItem("booking_email", email);
  set(userEmailAtom, email);
});

/** User's bookings */
export const bookingsAtom = atom<Booking[]>([]);

/** Loading state */
export const loadingAtom = atom<boolean>(false);
