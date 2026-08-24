"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
    />
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
    />
    <path
      fill="#FBBC05"
      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.9l3.7-2.9c-.2-.7-.4-1.4-.4-2.2z"
    />
    <path
      fill="#34A853"
      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.3 7.5 23.5 12 23.5z"
    />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error || "Invalid email or password.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Failed to start Google authentication.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 flex flex-col justify-between p-6 selection:bg-white/20 selection:text-white">
      
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-white tracking-tight">
          <span className="w-2 h-2 rounded-full bg-white inline-block" />
          AutoDMs
        </Link>
        <Link href="/" className="text-xs text-zinc-400 hover:text-white transition-colors">
          Back to home
        </Link>
      </div>

      {/* Centered Vercel-Style Card */}
      <div className="w-full max-w-sm mx-auto my-auto space-y-6">
        
        <div className="space-y-1.5 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Log in to AutoDMs</h1>
          <p className="text-xs text-zinc-400">
            Instagram Comment-to-DM SaaS Automation
          </p>
        </div>

        <div className="p-6 bg-[#0A0A0A] border border-[#222222] rounded-xl shadow-2xl space-y-4">
          
          {/* Primary Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full h-10 bg-[#111111] hover:bg-[#181818] text-white border border-[#262626] rounded-lg px-4 flex items-center justify-center gap-3 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <>
                <GoogleIcon />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-[#1F1F1F]" />
            <span className="absolute bg-[#0A0A0A] px-2 text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
              or continue with email
            </span>
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-medium text-zinc-300 block">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
                placeholder="name@company.com"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-xs font-medium text-zinc-300 block">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 bg-[#0A0A0A] border border-[#262626] rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs mt-1.5">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full h-10 mt-1 bg-white text-black hover:bg-zinc-200 font-medium rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <>
                  Continue with Email
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5" strokeWidth={2} />
                </>
              )}
            </button>
          </form>

          <div className="border-t border-[#1F1F1F] pt-3 text-center">
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              New user? Entering your email and password will automatically register your account.
            </p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center text-xs text-zinc-600">
        © 2026 AutoDMs Inc. All rights reserved.
      </div>

    </div>
  );
}
