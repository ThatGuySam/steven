import { useParams, Link } from "react-router-dom";
import { useAtomValue } from "jotai";
import { Card } from "@booking/ui";
import { Button } from "@booking/ui";
import {
  selectedServiceAtom,
  selectedDateAtom,
  selectedTimeSlotAtom,
  guestsAtom,
} from "@/lib/store";
import { formatCurrency, formatTime } from "@/lib/utils";

export function ConfirmationPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const service = useAtomValue(selectedServiceAtom);
  const date = useAtomValue(selectedDateAtom);
  const timeSlot = useAtomValue(selectedTimeSlotAtom);
  const guests = useAtomValue(guestsAtom);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          Booking Confirmed!
        </h1>
        <p className="mt-2 text-gray-600">
          Your booking has been successfully placed. A confirmation email has
          been sent to all guests.
        </p>
      </div>

      <Card className="mt-8">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Booking ID</span>
            <span className="font-mono font-medium text-gray-900">
              {bookingId}
            </span>
          </div>

          {service && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Service</span>
                <span className="font-medium text-gray-900">
                  {service.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date & Time</span>
                <span className="font-medium text-gray-900">
                  {date &&
                    new Date(date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                  at {timeSlot && formatTime(timeSlot)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium text-gray-900">
                  {service.durationMinutes} minutes
                </span>
              </div>
            </>
          )}

          {guests.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-medium text-gray-900">Guests</h3>
              <div className="mt-2 space-y-2">
                {guests.map((guest, i) => (
                  <div key={guest.id} className="text-sm text-gray-600">
                    {guest.firstName} {guest.lastName} ({guest.email})
                    {i === 0 && (
                      <span className="ml-1 text-indigo-600">&mdash; Primary</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {service && (
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between font-semibold">
                <span>Total Paid</span>
                <span>
                  {formatCurrency(
                    service.priceInCents * Math.max(guests.length, 1),
                    service.currency,
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="mt-8 flex justify-center gap-4">
        <Link to="/my-bookings">
          <Button variant="outline">View My Bookings</Button>
        </Link>
        <Link to="/services">
          <Button>Book Another</Button>
        </Link>
      </div>
    </div>
  );
}
