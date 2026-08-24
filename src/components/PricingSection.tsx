"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

export function PricingSection() {
  const [currency, setCurrency] = useState<"MAD" | "USD">("MAD");

  const plans = [
    {
      name: "Free Starter",
      desc: "Basic triggers for growing creators.",
      price: currency === "MAD" ? "0 DH" : "$0",
      period: "forever",
      features: [
        "150 DMs / month quota",
        "Link 1 IG Business profile",
        "Basic Keyword matching",
        "Meta Graph API compliant & safe"
      ],
      cta: "Get started free",
      popular: false,
      href: "/login",
      color: "border-[#27272A]"
    },
    {
      name: "Creator Pro",
      desc: "High volume triggers & story rewards.",
      price: currency === "MAD" ? "50 DH" : "$5",
      period: "month",
      features: [
        "3,000 DMs / month quota",
        "Story Mentions rewards trigger",
        "Lead Capture (email/phone)",
        "Instant CSV lead export",
        "No AutoDMs watermark"
      ],
      cta: "Upgrade to Pro",
      popular: true,
      href: "/login",
      color: "border-[#00DF81]/60 ring-1 ring-[#00DF81]/20"
    },
    {
      name: "Business / Agency",
      desc: "Multi-account scale for agencies & brands.",
      price: currency === "MAD" ? "150 DH" : "$15",
      period: "month",
      features: [
        "15,000 DMs / month quota",
        "Link up to 3 IG accounts",
        "WhatsApp Direct Link builder",
        "Priority dispatch queue",
        "24/7 VIP Agency support"
      ],
      cta: "Upgrade to Business",
      popular: false,
      href: "/login",
      color: "border-[#27272A]"
    }
  ];

  return (
    <section id="pricing" className="py-20 border-t border-[#27272A] bg-[#0F0F0F]">
      <div className="max-w-6xl mx-auto px-6 text-center space-y-12">
        
        {/* Section Header */}
        <div className="space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#00DF81] uppercase tracking-widest">Pricing</span>
          <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Transparent pricing for creators & brands</h2>
          <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
            Start for free to test your trigger rules, then scale up as your follower interactions surge.
          </p>
        </div>

        {/* Currency Switch Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-xs font-semibold transition-colors ${currency === "USD" ? "text-zinc-100" : "text-zinc-500"}`}>
            USD ($)
          </span>
          <button
            type="button"
            onClick={() => setCurrency((curr) => (curr === "MAD" ? "USD" : "MAD"))}
            className="w-11 h-6 rounded-full bg-zinc-800 border border-zinc-700 p-0.5 transition-colors relative flex items-center"
            aria-label="Toggle currency"
          >
            <div
              className={`w-4 h-4 rounded-full bg-[#00DF81] transition-transform duration-200 ${
                currency === "MAD" ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className={`text-xs font-semibold transition-colors ${currency === "MAD" ? "text-zinc-100" : "text-zinc-500"}`}>
            MAD (Dirham 🇲🇦)
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`p-6 bg-[#18181B] border rounded-xl flex flex-col justify-between h-[390px] transition-all relative ${plan.color}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-[#00DF81] text-[#000000] font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 fill-black" />
                  Most Popular
                </span>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-zinc-100">{plan.name}</h3>
                  <p className="text-xs text-zinc-400 leading-normal">{plan.desc}</p>
                </div>

                <div className="space-y-0.5 py-1">
                  <p className="text-2xl font-black text-zinc-100">
                    {plan.price}
                    <span className="text-xs font-normal text-zinc-500 ml-1">/{plan.period}</span>
                  </p>
                </div>

                <ul className="text-xs space-y-2 text-zinc-400 border-t border-[#27272A] pt-4">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#00DF81] shrink-0" strokeWidth={2} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={plan.href}
                className={`w-full h-9 flex items-center justify-center font-semibold rounded-lg text-xs text-center transition-all ${
                  plan.popular
                    ? "bg-[#00DF81] hover:bg-[#00C770] text-[#000000] shadow-sm active:scale-95"
                    : "bg-[#0F0F0F] border border-[#27272A] hover:bg-zinc-800 text-zinc-200"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
export default PricingSection;
