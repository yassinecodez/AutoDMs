"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
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
        className="h-10 inline-flex items-center justify-center gap-2 px-4 rounded-lg bg-[#00DF81] hover:bg-[#00C770] font-semibold text-xs text-black transition-all active:scale-95 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-black" />
        ) : (
          <InstagramIcon className="w-4 h-4 text-black" />
        )}
        Connect Instagram Account
      </button>
      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
}
export default ConnectFacebookButton;
