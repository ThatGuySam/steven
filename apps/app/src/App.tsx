import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { ServicesPage } from "./pages/ServicesPage";
import { BookingPage } from "./pages/BookingPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { AdminPage } from "./pages/AdminPage";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/book/:serviceId" element={<BookingPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/confirmation/:bookingId" element={<ConfirmationPage />} />
        <Route path="/my-bookings" element={<MyBookingsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Layout>
  );
}
