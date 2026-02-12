import { Hono } from "hono";
import { getStripe } from "../lib/stripe";
import { BookingStore } from "../lib/storage";
import type { Env } from "../index";
import type { SavedPaymentMethod } from "@booking/core";

export const paymentsRoutes = new Hono<{ Bindings: Env }>();

// Get saved payment methods for a customer
paymentsRoutes.get("/payments/methods", async (c) => {
  const email = c.req.query("email");
  if (!email) {
    return c.json({ message: "Email parameter required" }, 400);
  }

  const stripe = getStripe(c.env.STRIPE_SECRET_KEY);

  // Find customer by email
  const customers = await stripe.customers.list({ email, limit: 1 });
  if (customers.data.length === 0) {
    return c.json([]);
  }

  const customerId = customers.data[0].id;

  // List payment methods
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
  });

  const methods: SavedPaymentMethod[] = paymentMethods.data.map((pm) => ({
    id: pm.id,
    brand: pm.card?.brand || "unknown",
    last4: pm.card?.last4 || "0000",
    expMonth: pm.card?.exp_month || 0,
    expYear: pm.card?.exp_year || 0,
    isDefault: false, // Would check default payment method in production
  }));

  return c.json(methods);
});

// Delete a saved payment method
paymentsRoutes.delete("/payments/methods/:id", async (c) => {
  const methodId = c.req.param("id");
  const stripe = getStripe(c.env.STRIPE_SECRET_KEY);

  try {
    await stripe.paymentMethods.detach(methodId);
    return c.json({ success: true });
  } catch (err) {
    console.error("Detach payment method error:", err);
    return c.json({ message: "Failed to remove payment method" }, 500);
  }
});

// Stripe webhook handler
paymentsRoutes.post("/payments/webhook", async (c) => {
  const signature = c.req.header("stripe-signature");
  if (!signature) {
    return c.json({ message: "Missing stripe-signature header" }, 400);
  }

  const stripe = getStripe(c.env.STRIPE_SECRET_KEY);
  const body = await c.req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      c.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return c.json({ message: "Webhook verification failed" }, 400);
  }

  const store = new BookingStore(c.env.BOOKINGS);

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object;
      const bookingId = pi.metadata.bookingId;
      if (bookingId) {
        const booking = await store.getBooking(bookingId);
        if (booking) {
          booking.payment.status = "paid";
          booking.payment.receiptUrl =
            pi.charges?.data?.[0]?.receipt_url || undefined;
          booking.status = "confirmed";
          booking.updatedAt = new Date().toISOString();
          await store.saveBooking(booking);
        }
      }
      break;
    }

    case "payment_intent.payment_failed": {
      const pi = event.data.object;
      const bookingId = pi.metadata.bookingId;
      if (bookingId) {
        const booking = await store.getBooking(bookingId);
        if (booking) {
          booking.payment.status = "failed";
          booking.updatedAt = new Date().toISOString();
          await store.saveBooking(booking);
        }
      }
      break;
    }
  }

  return c.json({ received: true });
});
