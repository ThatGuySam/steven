import type {
  Booking,
  CreateBookingRequest,
  Service,
  TimeSlot,
  SavedPaymentMethod,
  ConnectAccountStatus,
} from "@booking/core";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Services
export async function getServices(): Promise<Service[]> {
  return request("/services");
}

export async function getService(id: string): Promise<Service> {
  return request(`/services/${id}`);
}

// Time Slots
export async function getTimeSlots(
  serviceId: string,
  date: string,
): Promise<TimeSlot[]> {
  return request(`/services/${serviceId}/slots?date=${date}`);
}

// Bookings
export async function createBooking(
  data: CreateBookingRequest,
): Promise<{ booking: Booking; clientSecret: string }> {
  return request("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getBooking(id: string): Promise<Booking> {
  return request(`/bookings/${id}`);
}

export async function getBookings(email: string): Promise<Booking[]> {
  return request(`/bookings?email=${encodeURIComponent(email)}`);
}

export async function cancelBooking(id: string): Promise<Booking> {
  return request(`/bookings/${id}/cancel`, { method: "POST" });
}

// Payments
export async function getSavedPaymentMethods(
  email: string,
): Promise<SavedPaymentMethod[]> {
  return request(
    `/payments/methods?email=${encodeURIComponent(email)}`,
  );
}

export async function deletePaymentMethod(methodId: string): Promise<void> {
  return request(`/payments/methods/${methodId}`, { method: "DELETE" });
}

// Stripe Connect (admin)
export async function getConnectAccountStatus(): Promise<ConnectAccountStatus> {
  return request("/admin/connect/status");
}

export async function createConnectOnboardingLink(): Promise<{
  url: string;
}> {
  return request("/admin/connect/onboard", { method: "POST" });
}
