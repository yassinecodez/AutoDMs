"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export function ConnectFacebookButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnect = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/instagram/url");
      if (!res.ok) {
        throw new Error("Failed to fetch integration URL.");
      }
      const data = await res.json();
      if (data.url) {
        console.log("Opening OAuth URL:", data.url);
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
        className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 font-bold text-white transition-all shadow-lg hover:shadow-purple-500/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <InstagramIcon className="w-5 h-5" />
        )}
        Connect Instagram Account
      </button>
      {error && <p className="text-sm text-red-400 font-medium">{error}</p>}
    </div>
  );
}
export default ConnectFacebookButton;
