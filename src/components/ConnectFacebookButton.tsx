"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export function ConnectFacebookButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/facebook/url");
      if (!res.ok) {
        throw new Error("Failed to fetch integration URL.");
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Invalid redirect response.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred starting connection.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        onClick={handleConnect}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white transition-colors shadow-lg hover:shadow-blue-500/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <FacebookIcon className="w-5 h-5 fill-current" />
        )}
        Connect Meta / Facebook Profile
      </button>
      {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
    </div>
  );
}
export default ConnectFacebookButton;
