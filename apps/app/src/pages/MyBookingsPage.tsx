import { useState } from "react";
import { Button } from "@booking/ui";
import { Card } from "@booking/ui";
import { Input } from "@booking/ui";
import { Badge } from "@booking/ui";
import type { Booking, BookingStatus } from "@booking/core";
import { formatCurrency, formatTime, formatDate } from "@/lib/utils";

const STATUS_BADGE_MAP: Record<
  BookingStatus,
  { variant: "success" | "warning" | "error" | "info"; label: string }
> = {
  pending: { variant: "warning", label: "Pending" },
  confirmed: { variant: "success", label: "Confirmed" },
  cancelled: { variant: "error", label: "Cancelled" },
  completed: { variant: "info", label: "Completed" },
};

// Demo bookings for display
const DEMO_BOOKINGS: Booking[] = [
  {
    id: "bk_demo_001",
    serviceId: "consultation",
    date: "2026-02-15",
    timeSlot: "10:00",
    guests: [
      {
        id: "g1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      },
    ],
    status: "confirmed",
    payment: {
      status: "paid",
      amountInCents: 15000,
      currency: "usd",
      stripePaymentIntentId: "pi_demo_001",
    },
    notes: "",
    createdAt: "2026-02-10T10:00:00Z",
    updatedAt: "2026-02-10T10:00:00Z",
  },
  {
    id: "bk_demo_002",
    serviceId: "group-session",
    date: "2026-02-20",
    timeSlot: "14:00",
    guests: [
      {
        id: "g2",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
      },
      {
        id: "g3",
        firstName: "Bob",
        lastName: "Wilson",
        email: "bob@example.com",
      },
    ],
    status: "pending",
    payment: {
      status: "processing",
      amountInCents: 120000,
      currency: "usd",
    },
    createdAt: "2026-02-11T14:00:00Z",
    updatedAt: "2026-02-11T14:00:00Z",
  },
];

export function MyBookingsPage() {
  const [email, setEmail] = useState(
    localStorage.getItem("booking_email") || "",
  );
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    localStorage.setItem("booking_email", email);

    try {
      const res = await fetch(
        `/api/bookings?email=${encodeURIComponent(email)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      } else {
        // Demo mode
        setBookings(DEMO_BOOKINGS);
      }
    } catch {
      // Use demo bookings when API is unavailable
      setBookings(DEMO_BOOKINGS);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
      <p className="mt-2 text-gray-600">
        View and manage your upcoming and past bookings
      </p>

      <form onSubmit={handleSearch} className="mt-8 flex gap-3">
        <div className="flex-1">
          <Input
            id="email-lookup"
            type="email"
            placeholder="Enter your email to find bookings..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Find Bookings"}
        </Button>
      </form>

      {searched && (
        <div className="mt-8 space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No bookings found
                </h3>
                <p className="mt-1 text-gray-500">
                  No bookings found for {email}
                </p>
              </div>
            </Card>
          ) : (
            bookings.map((booking) => {
              const statusBadge = STATUS_BADGE_MAP[booking.status];
              return (
                <Card key={booking.id} className="hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.serviceId
                            .replace(/-/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </h3>
                        <Badge variant={statusBadge.variant}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(booking.date)} at{" "}
                        {formatTime(booking.timeSlot)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {booking.guests.length} guest
                        {booking.guests.length > 1 ? "s" : ""}:{" "}
                        {booking.guests
                          .map((g) => `${g.firstName} ${g.lastName}`)
                          .join(", ")}
                      </p>
                      <p className="font-mono text-xs text-gray-400">
                        ID: {booking.id}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatCurrency(
                          booking.payment.amountInCents,
                          booking.payment.currency,
                        )}
                      </span>
                      {booking.status !== "cancelled" &&
                        booking.status !== "completed" && (
                          <Button variant="outline" size="sm">
                            Cancel
                          </Button>
                        )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
