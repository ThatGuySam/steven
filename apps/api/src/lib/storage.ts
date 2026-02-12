import type { Booking } from "@booking/core";

/**
 * KV-backed booking storage.
 * In production, you'd use a proper database (D1, Neon, etc.).
 * KV is used here for simplicity and zero-config deployment.
 */
export class BookingStore {
  constructor(private kv: KVNamespace) {}

  async getBooking(id: string): Promise<Booking | null> {
    const data = await this.kv.get(`booking:${id}`, "json");
    return data as Booking | null;
  }

  async saveBooking(booking: Booking): Promise<void> {
    await this.kv.put(`booking:${booking.id}`, JSON.stringify(booking));

    // Index by email for lookup
    for (const guest of booking.guests) {
      const key = `email:${guest.email}`;
      const existing = await this.kv.get(key, "json") as string[] | null;
      const bookingIds = existing || [];
      if (!bookingIds.includes(booking.id)) {
        bookingIds.push(booking.id);
        await this.kv.put(key, JSON.stringify(bookingIds));
      }
    }
  }

  async getBookingsByEmail(email: string): Promise<Booking[]> {
    const bookingIds = await this.kv.get(`email:${email}`, "json") as string[] | null;
    if (!bookingIds || bookingIds.length === 0) return [];

    const bookings = await Promise.all(
      bookingIds.map((id) => this.getBooking(id)),
    );
    return bookings.filter(Boolean) as Booking[];
  }

  async updateBookingStatus(
    id: string,
    status: Booking["status"],
  ): Promise<Booking | null> {
    const booking = await this.getBooking(id);
    if (!booking) return null;
    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    await this.saveBooking(booking);
    return booking;
  }
}
