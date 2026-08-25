"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export function PricingSection() {
  const [currency, setCurrency] = useState<"USD" | "MAD">("USD");

  const plans = [
    {
      name: "Free Starter",
      desc: "Essential trigger automation for creators.",
      price: currency === "MAD" ? "0 DH" : "$0",
      period: "forever",
      features: [
        "150 DMs / month quota",
        "Link 1 Instagram Business account",
        "Keyword matching triggers",
        "100% Meta Graph API compliant"
      ],
      cta: "Get started free",
      popular: false,
      href: "/login",
      cardStyle: "bg-[#0A0A0A] border-[#222222]",
      buttonStyle: "bg-[#111111] hover:bg-[#181818] text-white border border-[#262626]"
    },
    {
      name: "Creator Pro",
      desc: "High-volume triggers & story mention rewards.",
      price: currency === "MAD" ? "50 DH" : "$5",
      period: "month",
      features: [
        "3,000 DMs / month quota",
        "Story Mentions rewards trigger",
        "Lead Capture (email & phone)",
        "Instant CSV lead database export",
        "No AutoDMs watermark"
      ],
      cta: "Upgrade to Pro",
      popular: true,
      href: "/login",
      cardStyle: "bg-[#0A0A0A] border-white/40 ring-1 ring-white/20 shadow-xl",
      buttonStyle: "bg-white text-black hover:bg-zinc-200 font-semibold"
    },
    {
      name: "Business / Agency",
      desc: "Multi-account scaling for agencies & teams.",
      price: currency === "MAD" ? "150 DH" : "$15",
      period: "month",
      features: [
        "15,000 DMs / month quota",
        "Link up to 3 Instagram accounts",
        "Interactive URL & WhatsApp buttons",
        "Priority queue processing",
        "Dedicated VIP Agency support"
      ],
      cta: "Upgrade to Business",
      popular: false,
      href: "/login",
      cardStyle: "bg-[#0A0A0A] border-[#222222]",
      buttonStyle: "bg-[#111111] hover:bg-[#181818] text-white border border-[#262626]"
    }
  ];

  return (
    <section id="pricing" className="py-24 border-t border-[#1F1F1F] bg-[#000000]">
      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 text-center space-y-12">
        
        {/* Section Header */}
        <div className="space-y-3 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">Simple, predictable pricing</h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Start for free, test your automation flows, and scale as your followers grow.
          </p>
        </div>

        {/* Currency Switch Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-xs font-medium transition-colors ${currency === "USD" ? "text-white font-semibold" : "text-zinc-500"}`}>
            USD ($)
          </span>
          <button
            type="button"
            onClick={() => setCurrency((curr) => (curr === "MAD" ? "USD" : "MAD"))}
            className="w-10 h-5.5 rounded-full bg-[#111111] border border-[#262626] p-0.5 transition-colors relative flex items-center"
            aria-label="Toggle currency"
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                currency === "MAD" ? "translate-x-4.5" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className={`text-xs font-medium transition-colors ${currency === "MAD" ? "text-white font-semibold" : "text-zinc-500"}`}>
            MAD (Dirham)
          </span>
        </div>

        {/* Pricing Cards Grid (Spread across 1400px) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`p-7 sm:p-8 border rounded-2xl flex flex-col justify-between min-h-[420px] transition-all relative ${plan.cardStyle}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-white text-black font-semibold text-xs tracking-tight shadow-md">
                  Popular
                </span>
              )}

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-zinc-400 leading-normal">{plan.desc}</p>
                </div>

                <div className="space-y-0.5 py-1">
                  <p className="text-3xl font-bold text-white tracking-tight">
                    {plan.price}
                    <span className="text-xs font-normal text-zinc-500 ml-1.5">/{plan.period}</span>
                  </p>
                </div>

                <ul className="text-xs space-y-2.5 text-zinc-300 border-t border-[#1F1F1F] pt-5">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-zinc-400 shrink-0" strokeWidth={2} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6">
                <Link
                  href={plan.href}
                  className={`w-full h-11 flex items-center justify-center font-medium rounded-xl text-sm transition-colors ${plan.buttonStyle}`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default PricingSection;
