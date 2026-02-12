import { Hono } from "hono";
import { getStripe } from "../lib/stripe";
import type { Env } from "../index";
import type { ConnectAccountStatus } from "@booking/core";

export const adminRoutes = new Hono<{ Bindings: Env }>();

// Get Stripe Connect account status
adminRoutes.get("/admin/connect/status", async (c) => {
  const stripe = getStripe(c.env.STRIPE_SECRET_KEY);
  const connectAccountId = c.env.STRIPE_CONNECT_ACCOUNT_ID;

  if (!connectAccountId) {
    // No connect account configured yet
    const status: ConnectAccountStatus = {
      accountId: "not_configured",
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    };
    return c.json(status);
  }

  try {
    const account = await stripe.accounts.retrieve(connectAccountId);
    const status: ConnectAccountStatus = {
      accountId: account.id,
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      detailsSubmitted: account.details_submitted ?? false,
    };
    return c.json(status);
  } catch (err) {
    console.error("Connect status error:", err);
    return c.json({ message: "Failed to fetch account status" }, 500);
  }
});

// Create Stripe Connect onboarding link
adminRoutes.post("/admin/connect/onboard", async (c) => {
  const stripe = getStripe(c.env.STRIPE_SECRET_KEY);
  const appUrl = c.env.APP_URL || "http://localhost:5173";

  let connectAccountId = c.env.STRIPE_CONNECT_ACCOUNT_ID;

  try {
    // Create account if it doesn't exist
    if (!connectAccountId) {
      const account = await stripe.accounts.create({
        type: "standard",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      connectAccountId = account.id;
      // In production, you'd save this to a database or environment variable
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: connectAccountId,
      refresh_url: `${appUrl}/admin`,
      return_url: `${appUrl}/admin`,
      type: "account_onboarding",
    });

    return c.json({ url: accountLink.url, accountId: connectAccountId });
  } catch (err) {
    console.error("Connect onboarding error:", err);
    return c.json({ message: "Failed to create onboarding link" }, 500);
  }
});

// Create Stripe Connect login link (for returning users)
adminRoutes.post("/admin/connect/dashboard", async (c) => {
  const stripe = getStripe(c.env.STRIPE_SECRET_KEY);
  const connectAccountId = c.env.STRIPE_CONNECT_ACCOUNT_ID;

  if (!connectAccountId) {
    return c.json({ message: "No connect account configured" }, 400);
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(connectAccountId);
    return c.json({ url: loginLink.url });
  } catch (err) {
    console.error("Connect dashboard error:", err);
    return c.json({ message: "Failed to create dashboard link" }, 500);
  }
});
