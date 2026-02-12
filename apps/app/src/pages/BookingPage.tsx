import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAtom } from "jotai";
import type { Service, Guest, TimeSlot } from "@booking/core";
import { DEFAULT_SERVICES, BUSINESS_HOURS } from "@booking/core";
import { Button } from "@booking/ui";
import { Input } from "@booking/ui";
import { Card } from "@booking/ui";
import {
  selectedServiceAtom,
  selectedDateAtom,
  selectedTimeSlotAtom,
  guestsAtom,
  bookingNotesAtom,
} from "@/lib/store";
import { formatCurrency, formatTime, getTodayDate, generateId } from "@/lib/utils";

export function BookingPage() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [service, setService] = useAtom(selectedServiceAtom);
  const [date, setDate] = useAtom(selectedDateAtom);
  const [timeSlot, setTimeSlot] = useAtom(selectedTimeSlotAtom);
  const [guests, setGuests] = useAtom(guestsAtom);
  const [notes, setNotes] = useAtom(bookingNotesAtom);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [step, setStep] = useState(1);

  // Load service
  useEffect(() => {
    const found = DEFAULT_SERVICES.find((s) => s.id === serviceId);
    if (found) {
      setService(found as Service);
    }
  }, [serviceId, setService]);

  // Generate time slots when date changes
  useEffect(() => {
    if (!date) return;
    const generatedSlots: TimeSlot[] = [];
    for (let h = BUSINESS_HOURS.start; h < BUSINESS_HOURS.end; h++) {
      for (
        let m = 0;
        m < 60;
        m += BUSINESS_HOURS.slotDurationMinutes
      ) {
        const time = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        generatedSlots.push({
          time,
          available: Math.random() > 0.3, // Simulated availability
        });
      }
    }
    setSlots(generatedSlots);
  }, [date]);

  // Initialize with one empty guest
  useEffect(() => {
    if (guests.length === 0) {
      setGuests([
        { id: generateId(), firstName: "", lastName: "", email: "", phone: "" },
      ]);
    }
  }, [guests.length, setGuests]);

  function addGuest() {
    setGuests([
      ...guests,
      { id: generateId(), firstName: "", lastName: "", email: "", phone: "" },
    ]);
  }

  function removeGuest(id: string) {
    if (guests.length > 1) {
      setGuests(guests.filter((g) => g.id !== id));
    }
  }

  function updateGuest(id: string, field: keyof Guest, value: string) {
    setGuests(
      guests.map((g) => (g.id === id ? { ...g, [field]: value } : g)),
    );
  }

  function canProceedToStep2() {
    return date && timeSlot;
  }

  function canProceedToStep3() {
    return guests.every((g) => g.firstName && g.lastName && g.email);
  }

  function handleContinue() {
    if (step === 1 && canProceedToStep2()) setStep(2);
    else if (step === 2 && canProceedToStep3()) setStep(3);
    else if (step === 3) navigate("/checkout");
  }

  if (!service) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Book {service.name}</h1>
      <p className="mt-2 text-gray-600">
        {service.durationMinutes} minutes &middot;{" "}
        {formatCurrency(service.priceInCents, service.currency)}
      </p>

      {/* Step indicator */}
      <div className="mt-8 flex items-center gap-4">
        {["Date & Time", "Guest Details", "Review"].map((label, i) => (
          <button
            key={label}
            onClick={() => {
              if (i + 1 < step) setStep(i + 1);
            }}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              step === i + 1
                ? "bg-indigo-600 text-white"
                : step > i + 1
                  ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                  : "bg-gray-100 text-gray-400"
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
              {i + 1}
            </span>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {/* Step 1: Date & Time */}
        {step === 1 && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900">
              Select Date & Time
            </h2>
            <div className="mt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  min={getTodayDate()}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTimeSlot("");
                  }}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Available Times
                  </label>
                  <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {slots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setTimeSlot(slot.time)}
                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          timeSlot === slot.time
                            ? "bg-indigo-600 text-white"
                            : slot.available
                              ? "bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                              : "cursor-not-allowed bg-gray-50 text-gray-300 line-through"
                        }`}
                      >
                        {formatTime(slot.time)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Step 2: Guest Details */}
        {step === 2 && (
          <div className="space-y-6">
            {guests.map((guest, index) => (
              <Card key={guest.id}>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {index === 0 ? "Primary Contact" : `Guest ${index + 1}`}
                  </h2>
                  {index > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGuest(guest.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input
                    id={`first-${guest.id}`}
                    label="First Name"
                    placeholder="John"
                    value={guest.firstName}
                    onChange={(e) =>
                      updateGuest(guest.id, "firstName", e.target.value)
                    }
                    required
                  />
                  <Input
                    id={`last-${guest.id}`}
                    label="Last Name"
                    placeholder="Doe"
                    value={guest.lastName}
                    onChange={(e) =>
                      updateGuest(guest.id, "lastName", e.target.value)
                    }
                    required
                  />
                  <Input
                    id={`email-${guest.id}`}
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    value={guest.email}
                    onChange={(e) =>
                      updateGuest(guest.id, "email", e.target.value)
                    }
                    required
                  />
                  <Input
                    id={`phone-${guest.id}`}
                    label="Phone (optional)"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={guest.phone || ""}
                    onChange={(e) =>
                      updateGuest(guest.id, "phone", e.target.value)
                    }
                  />
                </div>
              </Card>
            ))}

            <button
              onClick={addGuest}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 p-4 text-sm font-medium text-gray-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Add Another Guest
            </button>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <Card>
            <h2 className="text-xl font-semibold text-gray-900">
              Review Your Booking
            </h2>
            <div className="mt-6 space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="font-medium text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  at {formatTime(timeSlot)}
                </p>
                <p className="text-sm text-gray-600">
                  Duration: {service.durationMinutes} minutes
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">
                  Guests ({guests.length})
                </h3>
                {guests.map((guest, i) => (
                  <div
                    key={guest.id}
                    className="rounded-lg bg-gray-50 p-3 text-sm"
                  >
                    <span className="font-medium">
                      {guest.firstName} {guest.lastName}
                    </span>
                    <span className="text-gray-500"> &middot; {guest.email}</span>
                    {i === 0 && (
                      <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Any special requests or notes..."
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>
                    {formatCurrency(
                      service.priceInCents * guests.length,
                      service.currency,
                    )}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {formatCurrency(service.priceInCents, service.currency)} x{" "}
                  {guests.length} guest{guests.length > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => {
              if (step > 1) setStep(step - 1);
              else navigate("/services");
            }}
          >
            {step === 1 ? "Back to Services" : "Back"}
          </Button>
          <Button
            onClick={handleContinue}
            disabled={
              (step === 1 && !canProceedToStep2()) ||
              (step === 2 && !canProceedToStep3())
            }
          >
            {step === 3 ? "Continue to Payment" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
