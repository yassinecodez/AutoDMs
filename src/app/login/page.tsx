"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="min-h-screen bg-[#000000] text-zinc-100 flex flex-col justify-between p-6">
      
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
          <form onSubmit={handleSubmit} className="space-y-3.5">
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
              disabled={loading}
              className="w-full h-10 mt-2 bg-white text-black hover:bg-zinc-200 font-medium rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
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
