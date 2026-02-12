import { Hono } from "hono";
import { cors } from "hono/cors";
import { servicesRoutes } from "./routes/services";
import { bookingsRoutes } from "./routes/bookings";
import { paymentsRoutes } from "./routes/payments";
import { adminRoutes } from "./routes/admin";

export interface Env {
  BOOKINGS: KVNamespace;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  APP_URL: string;
  STRIPE_CONNECT_ACCOUNT_ID?: string;
}

const app = new Hono<{ Bindings: Env }>();

// CORS
app.use(
  "/api/*",
  cors({
    origin: ["http://localhost:5173", "https://*.workers.dev"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Health check
app.get("/api/health", (c) => c.json({ status: "ok", timestamp: new Date().toISOString() }));

// Routes
app.route("/api", servicesRoutes);
app.route("/api", bookingsRoutes);
app.route("/api", paymentsRoutes);
app.route("/api", adminRoutes);

// 404
app.notFound((c) => c.json({ message: "Not Found" }, 404));

// Error handler
app.onError((err, c) => {
  console.error("API Error:", err);
  return c.json({ message: err.message || "Internal Server Error" }, 500);
});

export default app;
