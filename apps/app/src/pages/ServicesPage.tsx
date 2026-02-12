import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Service } from "@booking/core";
import { DEFAULT_SERVICES } from "@booking/core";
import { formatCurrency } from "@/lib/utils";

export function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try API first, fall back to defaults
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch(() => setServices([...DEFAULT_SERVICES] as Service[]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Our Services</h1>
        <p className="mt-4 text-lg text-gray-600">
          Choose a service to get started with your booking
        </p>
      </div>

      {loading ? (
        <div className="mt-12 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      ) : (
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="group flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-indigo-200 hover:shadow-lg"
            >
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {service.name}
                </h3>
                <p className="mt-2 flex-1 text-gray-600">
                  {service.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(service.priceInCents, service.currency)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {" "}/ {service.durationMinutes} min
                    </span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 p-4">
                <Link
                  to={`/book/${service.id}`}
                  className="block w-full rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
