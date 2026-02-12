import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(secretKey: string): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(secretKey, {
      apiVersion: "2024-12-18.acacia",
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return stripeInstance;
}
