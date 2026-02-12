import { Link, useLocation } from "react-router-dom";
import { useState, type ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/services", label: "Services" },
    { href: "/my-bookings", label: "My Bookings" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg">
              B
            </div>
            <span className="text-xl font-bold text-gray-900">BookNow</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? "text-indigo-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/services"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white px-4 py-4 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="block rounded-lg px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/services"
              className="mt-2 block rounded-lg bg-indigo-600 px-3 py-2 text-center text-base font-medium text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Now
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} BookNow. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
