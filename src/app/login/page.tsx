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
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#0F0F0F] text-zinc-100 selection:bg-[#00DF81]/25 selection:text-white">
      <div className="w-full max-w-sm space-y-6 bg-[#18181B] border border-[#27272A] p-7 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-2 font-bold text-xl tracking-tight text-zinc-100 select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00DF81] inline-block shadow-[0_0_8px_rgba(0,223,129,0.5)]" />
            AutoDMs
          </Link>
          <p className="text-xs text-zinc-400">
            Instagram Comment & Story Automation Platform
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs font-medium text-red-400 bg-red-950/30 border border-red-500/20 rounded-lg">
            {error}
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label htmlFor="email-address" className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3 bg-[#0F0F0F] border border-[#27272A] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00DF81] text-zinc-100 text-xs placeholder-zinc-500 transition-colors"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 px-3 bg-[#0F0F0F] border border-[#27272A] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00DF81] text-zinc-100 text-xs placeholder-zinc-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full h-10 justify-center items-center rounded-lg bg-[#00DF81] hover:bg-[#00C770] px-4 text-xs font-semibold text-[#000000] focus:outline-none transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <>
                  Log in or register
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center border-t border-[#27272A] pt-4">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            <span className="font-semibold text-zinc-400">Note:</span> If your account does not exist, entering an email and password will automatically register your profile.
          </p>
        </div>
      </div>
    </div>
  );
}
