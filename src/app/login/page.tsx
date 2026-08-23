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
        setError(res.error || "Authentication failed.");
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
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#0B0F17] text-slate-100">
      <div className="w-full max-w-md space-y-8 bg-[#111827] border border-[#1F2937] p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-4 font-black text-2xl tracking-tight text-white select-none">
            <span className="w-3 h-3 rounded-full bg-[#00DF81] inline-block animate-pulse" />
            AutoDMs
          </Link>
          <p className="text-sm text-slate-400">
            Instagram Comment-to-DM SaaS Automation
          </p>
        </div>

        {error && (
          <div className="p-4 text-xs font-medium text-red-400 bg-red-950/30 border border-red-500/20 rounded-xl">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="text-xs font-semibold text-slate-300 block mb-2">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0F17] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00DF81] focus:border-[#00DF81] text-white text-sm placeholder-slate-500 transition-colors"
                placeholder="creator@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-semibold text-slate-300 block mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0F17] border border-[#1F2937] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#00DF81] focus:border-[#00DF81] text-white text-sm placeholder-slate-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center items-center rounded-xl bg-[#00DF81] hover:bg-[#00C770] px-4 py-3 text-sm font-bold text-[#000000] focus:outline-none transition-all shadow-md shadow-[#00DF81]/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <>
                  Get Started / Login
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center border-t border-[#1F2937] pt-6">
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-400">💡 Tip:</span> If your account does not exist, entering an email and password will automatically register and log you in.
          </p>
        </div>
      </div>
    </div>
  );
}
