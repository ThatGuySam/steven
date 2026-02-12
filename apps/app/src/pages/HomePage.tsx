import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Book Your Appointment{" "}
              <span className="text-indigo-200">Online</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-indigo-100">
              Simple, fast, and secure online booking. Choose your service,
              pick a time, and pay securely with Stripe. Manage bookings for
              yourself or your whole group.
            </p>
            <div className="mt-10 flex gap-4">
              <Link
                to="/services"
                className="rounded-lg bg-white px-6 py-3 text-base font-semibold text-indigo-600 shadow-lg transition-all hover:bg-indigo-50 hover:shadow-xl"
              >
                Browse Services
              </Link>
              <Link
                to="/my-bookings"
                className="rounded-lg border border-white/30 px-6 py-3 text-base font-semibold text-white transition-all hover:bg-white/10"
              >
                My Bookings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Book your appointment in just a few steps
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Choose a Service",
              description:
                "Browse our available services and pick the one that fits your needs.",
              icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              ),
            },
            {
              step: "2",
              title: "Add Your Details",
              description:
                "Pick a date and time, then add booking details for yourself and any guests.",
              icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              ),
            },
            {
              step: "3",
              title: "Pay Securely",
              description:
                "Complete your booking with secure Stripe payment. Save your card for next time.",
              icon: (
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              ),
            },
          ].map((feature) => (
            <div
              key={feature.step}
              className="relative rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-indigo-600 px-8 py-12 text-center shadow-xl sm:px-16">
            <h2 className="text-3xl font-bold text-white">
              Ready to Book?
            </h2>
            <p className="mt-4 text-lg text-indigo-100">
              Secure your spot today. Fast, easy, and secure.
            </p>
            <Link
              to="/services"
              className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-base font-semibold text-indigo-600 shadow transition-all hover:bg-indigo-50"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
