# Steven - Online Booking Website

A modern booking website built with React 19, Hono, Stripe, and Cloudflare Workers. Based on the [Kriasoft React Starter Kit](https://github.com/kriasoft/react-starter-kit) architecture.

## Features

- **Online Booking** - Browse services, pick dates/times, and book instantly
- **Multi-User Bookings** - Add multiple guests to a single booking
- **Stripe Payments** - Secure payment processing with Stripe
- **Save Payment Info** - Customers can save cards for future bookings
- **Bank Association** - Stripe Connect for business owners to link bank accounts and receive payouts
- **Cloudflare Workers** - Single Workers deployment serving both API and frontend assets

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router, Tailwind CSS, Jotai |
| API | Hono on Cloudflare Workers |
| Payments | Stripe (Payments, Connect, Webhooks) |
| Storage | Cloudflare KV |
| Build | Vite, TypeScript |
| Deployment | Cloudflare Workers (single deploy) |

## Project Structure

```
apps/
├── app/           React frontend (Vite + React 19)
│   └── src/
│       ├── pages/     Route pages (Home, Services, Booking, Checkout, etc.)
│       ├── components/ Shared layout components
│       ├── lib/       API client, Stripe config, state (Jotai), utils
│       └── hooks/     Custom React hooks
├── api/           Cloudflare Workers API (Hono)
│   └── src/
│       ├── routes/    API endpoints (services, bookings, payments, admin)
│       └── lib/       Stripe client, KV storage helpers
packages/
├── core/          Shared TypeScript types and constants
└── ui/            Reusable UI components (Button, Input, Card, Badge, Dialog)
```

## Getting Started

### Prerequisites

- Node.js 20+ or Bun 1.3+
- A [Stripe account](https://stripe.com) (test mode is fine)
- A [Cloudflare account](https://cloudflare.com) (free tier works)

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Stripe keys:
   ```
   VITE_STRIPE_PUBLIC_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

3. **Create Cloudflare KV namespace:**
   ```bash
   npx wrangler kv namespace create BOOKINGS
   ```
   Update the root `wrangler.jsonc` with the returned namespace ID.

4. **Set Stripe secrets for the Worker:**
   ```bash
   npx wrangler secret put STRIPE_SECRET_KEY
   npx wrangler secret put STRIPE_WEBHOOK_SECRET
   ```

5. **Run the development servers:**
   ```bash
   npm run dev
   ```
   - Frontend: http://localhost:5173
   - API: http://localhost:8787

## Deployment

Everything deploys as a single Cloudflare Worker with static assets:

```bash
npm run deploy
```

This builds the frontend with Vite, then deploys the Worker (API + static assets) to Cloudflare.

**Build command** (for Cloudflare Dashboard): `npm run build`
**Deploy command**: `npx wrangler deploy`

Your app will be available at `https://steven.<your-subdomain>.workers.dev`

## Stripe Setup

### Payments (Customer-facing)

1. Create a Stripe account at https://stripe.com
2. Get your test API keys from the Stripe Dashboard
3. Set `VITE_STRIPE_PUBLIC_KEY` (frontend) and `STRIPE_SECRET_KEY` (API)
4. Set up a webhook endpoint pointing to `https://your-api.workers.dev/api/payments/webhook`
5. Listen for events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Stripe Connect (Bank Association)

1. Enable Stripe Connect in your Stripe Dashboard
2. Navigate to `/admin` in the app
3. Click "Complete Stripe Onboarding" to link your bank account
4. Once onboarded, payouts from bookings will automatically transfer to your bank

## Pages

| Route | Description |
|---|---|
| `/` | Landing page with hero and features |
| `/services` | Browse available services |
| `/book/:serviceId` | 3-step booking flow (date/time, guests, review) |
| `/checkout` | Stripe payment with save-card option |
| `/confirmation/:id` | Booking confirmation |
| `/my-bookings` | Look up bookings by email |
| `/admin` | Stripe Connect dashboard and bank association |

## License

MIT
