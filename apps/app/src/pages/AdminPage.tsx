import { useState, useEffect } from "react";
import { Button } from "@booking/ui";
import { Card } from "@booking/ui";
import { Badge } from "@booking/ui";
import type { ConnectAccountStatus } from "@booking/core";

export function AdminPage() {
  const [connectStatus, setConnectStatus] =
    useState<ConnectAccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    fetch("/api/admin/connect/status")
      .then((res) => res.json())
      .then((data) => setConnectStatus(data))
      .catch(() => {
        // Demo mode
        setConnectStatus({
          accountId: "acct_demo_123",
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleOnboard() {
    setOnboarding(true);
    try {
      const res = await fetch("/api/admin/connect/onboard", {
        method: "POST",
      });
      if (res.ok) {
        const { url } = await res.json();
        window.location.href = url;
      } else {
        alert(
          "Demo Mode: In production, this redirects to Stripe Connect onboarding.",
        );
      }
    } catch {
      alert(
        "Demo Mode: In production, this redirects to Stripe Connect onboarding to link your bank account.",
      );
    } finally {
      setOnboarding(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Manage your Stripe Connect account and bank association
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {/* Stripe Connect Status */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900">
            Stripe Connect
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Connect your bank account to receive payouts from bookings
          </p>

          {connectStatus && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account ID</span>
                <span className="font-mono text-sm text-gray-900">
                  {connectStatus.accountId}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Charges</span>
                <Badge
                  variant={
                    connectStatus.chargesEnabled ? "success" : "warning"
                  }
                >
                  {connectStatus.chargesEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payouts</span>
                <Badge
                  variant={
                    connectStatus.payoutsEnabled ? "success" : "warning"
                  }
                >
                  {connectStatus.payoutsEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Details</span>
                <Badge
                  variant={
                    connectStatus.detailsSubmitted ? "success" : "error"
                  }
                >
                  {connectStatus.detailsSubmitted
                    ? "Submitted"
                    : "Incomplete"}
                </Badge>
              </div>

              {!connectStatus.detailsSubmitted && (
                <Button
                  className="mt-4 w-full"
                  onClick={handleOnboard}
                  disabled={onboarding}
                >
                  {onboarding
                    ? "Redirecting..."
                    : "Complete Stripe Onboarding"}
                </Button>
              )}

              {!connectStatus.chargesEnabled &&
                connectStatus.detailsSubmitted && (
                  <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                    Your account is under review. Charges will be enabled
                    shortly.
                  </div>
                )}
            </div>
          )}
        </Card>

        {/* Bank Account Info */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900">
            Bank Association
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Your linked bank account for receiving payments
          </p>

          <div className="mt-6">
            {connectStatus?.payoutsEnabled ? (
              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="font-medium text-green-800">
                    Bank Account Connected
                  </span>
                </div>
                <p className="mt-2 text-sm text-green-700">
                  Payouts are enabled. Funds from bookings will be
                  automatically transferred to your bank account.
                </p>
              </div>
            ) : (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z"
                    />
                  </svg>
                  <span className="font-medium text-gray-700">
                    No Bank Account Linked
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Complete Stripe onboarding to link your bank account and
                  start receiving payouts.
                </p>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={handleOnboard}
                  disabled={onboarding}
                >
                  Link Bank Account
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Payment Settings */}
        <Card className="md:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Payment Settings
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Configure how you accept and process payments
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900">Currency</h3>
              <p className="mt-1 text-2xl font-bold text-indigo-600">USD</p>
              <p className="text-sm text-gray-500">US Dollar</p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900">Payment Methods</h3>
              <p className="mt-1 text-2xl font-bold text-indigo-600">Cards</p>
              <p className="text-sm text-gray-500">
                Visa, Mastercard, Amex
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900">Auto-Payout</h3>
              <p className="mt-1 text-2xl font-bold text-indigo-600">Daily</p>
              <p className="text-sm text-gray-500">
                Automatic daily transfers
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
