import { Hono } from "hono";
import type { CreateBookingRequest, Booking, Guest } from "@booking/core";
import { DEFAULT_SERVICES } from "@booking/core";
import { getStripe } from "../lib/stripe";
import { BookingStore } from "../lib/storage";
import type { Env } from "../index";

export const bookingsRoutes = new Hono<{ Bindings: Env }>();

// Create a new booking
bookingsRoutes.post("/bookings", async (c) => {
  const body = await c.req.json<CreateBookingRequest>();
  const { serviceId, date, timeSlot, guests, notes, savePaymentInfo } = body;

  // Validate service
  const service = DEFAULT_SERVICES.find((s) => s.id === serviceId);
  if (!service) {
    return c.json({ message: "Service not found" }, 400);
  }

  // Validate guests
  if (!guests || guests.length === 0) {
    return c.json({ message: "At least one guest is required" }, 400);
  }

  const totalAmountInCents = service.priceInCents * guests.length;
  const bookingId = `bk_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;

  // Create Stripe payment intent
  const stripe = getStripe(c.env.STRIPE_SECRET_KEY);

  let paymentIntent;
  try {
    // Find or create Stripe customer
    const primaryEmail = guests[0].email;
    const customers = await stripe.customers.list({
      email: primaryEmail,
      limit: 1,
    });

    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: primaryEmail,
        name: `${guests[0].firstName} ${guests[0].lastName}`,
        metadata: { bookingId },
      });
      customerId = customer.id;
    }

    paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents,
      currency: service.currency,
      customer: customerId,
      metadata: {
        bookingId,
        serviceId,
        guestCount: guests.length.toString(),
      },
      setup_future_usage: savePaymentInfo ? "off_session" : undefined,
      automatic_payment_methods: { enabled: true },
    });
  } catch (err) {
    console.error("Stripe error:", err);
    return c.json({ message: "Failed to create payment" }, 500);
  }

  // Create booking record
  const booking: Booking = {
    id: bookingId,
    serviceId,
    date,
    timeSlot,
    guests: guests.map((g) => ({
      ...g,
      id: `g_${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`,
    })) as Guest[],
    status: "pending",
    payment: {
      status: "processing",
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: paymentIntent.customer as string,
      amountInCents: totalAmountInCents,
      currency: service.currency,
    },
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Save to KV
  const store = new BookingStore(c.env.BOOKINGS);
  await store.saveBooking(booking);

  return c.json(
    {
      booking,
      clientSecret: paymentIntent.client_secret,
    },
    201,
  );
});

// Get bookings by email
bookingsRoutes.get("/bookings", async (c) => {
  const email = c.req.query("email");
  if (!email) {
    return c.json({ message: "Email parameter required" }, 400);
  }

  const store = new BookingStore(c.env.BOOKINGS);
  const bookings = await store.getBookingsByEmail(email);
  return c.json(bookings);
});

// Get a single booking
bookingsRoutes.get("/bookings/:id", async (c) => {
  const id = c.req.param("id");
  const store = new BookingStore(c.env.BOOKINGS);
  const booking = await store.getBooking(id);

  if (!booking) {
    return c.json({ message: "Booking not found" }, 404);
  }

  return c.json(booking);
});

// Cancel a booking
bookingsRoutes.post("/bookings/:id/cancel", async (c) => {
  const id = c.req.param("id");
  const store = new BookingStore(c.env.BOOKINGS);
  const booking = await store.getBooking(id);

  if (!booking) {
    return c.json({ message: "Booking not found" }, 404);
  }

  if (booking.status === "cancelled") {
    return c.json({ message: "Booking already cancelled" }, 400);
  }

  // Refund via Stripe if paid
  if (
    booking.payment.status === "paid" &&
    booking.payment.stripePaymentIntentId
  ) {
    try {
      const stripe = getStripe(c.env.STRIPE_SECRET_KEY);
      await stripe.refunds.create({
        payment_intent: booking.payment.stripePaymentIntentId,
      });
      booking.payment.status = "refunded";
    } catch (err) {
      console.error("Refund error:", err);
      return c.json({ message: "Failed to process refund" }, 500);
    }
  }

  booking.status = "cancelled";
  booking.updatedAt = new Date().toISOString();
  await store.saveBooking(booking);

  return c.json(booking);
});
