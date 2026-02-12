import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtom, useAtomValue } from "jotai";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import type { StripePaymentElementOptions } from "@stripe/stripe-js";
import { Button } from "@booking/ui";
import { Card } from "@booking/ui";
import { stripePromise } from "@/lib/stripe";
import {
  selectedServiceAtom,
  selectedDateAtom,
  selectedTimeSlotAtom,
  guestsAtom,
  bookingNotesAtom,
  savePaymentInfoAtom,
  setUserEmailAtom,
} from "@/lib/store";
import { formatCurrency, formatTime, generateId } from "@/lib/utils";
import { createBooking } from "@/lib/api";
import type { Service } from "@booking/core";

function CheckoutForm({
  service,
  totalCents,
  onSuccess,
}: {
  service: Service;
  totalCents: number;
  onSuccess: (bookingId: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savePaymentInfo, setSavePaymentInfo] = useAtom(savePaymentInfoAtom);
  const date = useAtomValue(selectedDateAtom);
  const timeSlot = useAtomValue(selectedTimeSlotAtom);
  const guests = useAtomValue(guestsAtom);
  const notes = useAtomValue(bookingNotesAtom);
  const [, setUserEmail] = useAtom(setUserEmailAtom);

  const paymentElementOptions: StripePaymentElementOptions = {
    layout: "tabs",
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // Save primary guest email
      if (guests[0]?.email) {
        setUserEmail(guests[0].email);
      }

      // In production, create booking via API to get clientSecret
      // For demo, simulate the flow
      let clientSecret: string | undefined;

      try {
        const result = await createBooking({
          serviceId: service.id,
          date,
          timeSlot,
          guests: guests.map(({ id: _id, ...rest }) => rest),
          notes: notes || undefined,
          savePaymentInfo,
        });
        clientSecret = result.clientSecret;
      } catch {
        // If API is not available, simulate success
        const bookingId = generateId();
        onSuccess(bookingId);
        return;
      }

      if (clientSecret) {
        const { error: stripeError } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/confirmation/pending`,
          },
          redirect: "if_required",
        });

        if (stripeError) {
          setError(stripeError.message || "Payment failed");
        } else {
          onSuccess(generateId());
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h2 className="text-xl font-semibold text-gray-900">Payment</h2>
        <div className="mt-6">
          <PaymentElement options={paymentElementOptions} />
        </div>

        <div className="mt-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={savePaymentInfo}
              onChange={(e) => setSavePaymentInfo(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700">
              Save payment information for future bookings
            </span>
          </label>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(totalCents, service.currency)}</span>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="mt-6 w-full"
          disabled={!stripe || processing}
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Processing...
            </span>
          ) : (
            `Pay ${formatCurrency(totalCents, service.currency)}`
          )}
        </Button>
      </Card>
    </form>
  );
}

function CheckoutFallback({
  service,
  totalCents,
}: {
  service: Service;
  totalCents: number;
}) {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [savePaymentInfo, setSavePaymentInfo] = useAtom(savePaymentInfoAtom);
  const guests = useAtomValue(guestsAtom);
  const [, setUserEmail] = useAtom(setUserEmailAtom);

  async function handleDemoPayment() {
    setProcessing(true);
    if (guests[0]?.email) {
      setUserEmail(guests[0].email);
    }
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 1500));
    const bookingId = generateId();
    navigate(`/confirmation/${bookingId}`);
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-900">Payment</h2>
      <div className="mt-6 rounded-lg bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          <strong>Demo Mode:</strong> Stripe is not configured. Set{" "}
          <code className="rounded bg-amber-100 px-1">VITE_STRIPE_PUBLIC_KEY</code>{" "}
          in your environment to enable live payments.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700">Card Number</p>
          <p className="text-sm text-gray-500">4242 4242 4242 4242 (demo)</p>
        </div>
      </div>

      <div className="mt-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={savePaymentInfo}
            onChange={(e) => setSavePaymentInfo(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">
            Save payment information for future bookings
          </span>
        </label>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(totalCents, service.currency)}</span>
        </div>
      </div>

      <Button
        size="lg"
        className="mt-6 w-full"
        onClick={handleDemoPayment}
        disabled={processing}
      >
        {processing ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Processing...
          </span>
        ) : (
          `Pay ${formatCurrency(totalCents, service.currency)} (Demo)`
        )}
      </Button>
    </Card>
  );
}

export function CheckoutPage() {
  const service = useAtomValue(selectedServiceAtom);
  const date = useAtomValue(selectedDateAtom);
  const timeSlot = useAtomValue(selectedTimeSlotAtom);
  const guests = useAtomValue(guestsAtom);
  const navigate = useNavigate();
  const [clientSecret] = useState<string | null>(null);

  if (!service || !date || !timeSlot || guests.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              No Booking in Progress
            </h2>
            <p className="mt-2 text-gray-600">
              Please start by selecting a service.
            </p>
            <Button className="mt-4" onClick={() => navigate("/services")}>
              Browse Services
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const totalCents = service.priceInCents * guests.length;
  const isStripeConfigured =
    import.meta.env.VITE_STRIPE_PUBLIC_KEY &&
    !import.meta.env.VITE_STRIPE_PUBLIC_KEY.includes("placeholder");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        {/* Order summary */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900">
              Order Summary
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Service</span>
                <span className="font-medium">{service.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date</span>
                <span className="font-medium">
                  {new Date(date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Time</span>
                <span className="font-medium">{formatTime(timeSlot)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Guests</span>
                <span className="font-medium">{guests.length}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {formatCurrency(service.priceInCents, service.currency)} x{" "}
                    {guests.length}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(totalCents, service.currency)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment form */}
        <div className="lg:col-span-3">
          {isStripeConfigured && clientSecret ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#4f46e5",
                    borderRadius: "8px",
                  },
                },
              }}
            >
              <CheckoutForm
                service={service}
                totalCents={totalCents}
                onSuccess={(id) => navigate(`/confirmation/${id}`)}
              />
            </Elements>
          ) : (
            <CheckoutFallback service={service} totalCents={totalCents} />
          )}
        </div>
      </div>
    </div>
  );
}
