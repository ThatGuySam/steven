import { Hono } from "hono";
import { DEFAULT_SERVICES, BUSINESS_HOURS } from "@booking/core";
import type { TimeSlot } from "@booking/core";
import type { Env } from "../index";

export const servicesRoutes = new Hono<{ Bindings: Env }>();

// List all services
servicesRoutes.get("/services", (c) => {
  return c.json(DEFAULT_SERVICES);
});

// Get a single service
servicesRoutes.get("/services/:id", (c) => {
  const id = c.req.param("id");
  const service = DEFAULT_SERVICES.find((s) => s.id === id);
  if (!service) {
    return c.json({ message: "Service not found" }, 404);
  }
  return c.json(service);
});

// Get available time slots for a service on a date
servicesRoutes.get("/services/:id/slots", (c) => {
  const id = c.req.param("id");
  const date = c.req.query("date");

  const service = DEFAULT_SERVICES.find((s) => s.id === id);
  if (!service) {
    return c.json({ message: "Service not found" }, 404);
  }

  if (!date) {
    return c.json({ message: "Date parameter required" }, 400);
  }

  // Check if date is a day off
  const dayOfWeek = new Date(date).getDay();
  if (BUSINESS_HOURS.daysOff.includes(dayOfWeek)) {
    return c.json([]);
  }

  // Generate slots
  const slots: TimeSlot[] = [];
  for (let h = BUSINESS_HOURS.start; h < BUSINESS_HOURS.end; h++) {
    for (let m = 0; m < 60; m += BUSINESS_HOURS.slotDurationMinutes) {
      const time = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      // In production, check KV for existing bookings at this slot
      slots.push({ time, available: true });
    }
  }

  return c.json(slots);
});
