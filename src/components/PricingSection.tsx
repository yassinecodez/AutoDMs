"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";

export function PricingSection() {
  const [currency, setCurrency] = useState<"MAD" | "USD">("MAD");

  const plans = [
    {
      name: "Free Starter",
      desc: "Basic triggers for content creators.",
      price: currency === "MAD" ? "0 DH" : "$0",
      period: "forever",
      features: [
        "150 DMs / month quota",
        "Link 1 IG Business profile",
        "Basic Keyword matching",
        "Meta API compliant & safe"
      ],
      cta: "Get started free",
      popular: false,
      href: "/login",
      color: "border-slate-800"
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
      color: "border-[#00DF81]/50 ring-2 ring-[#00DF81]/5"
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
      color: "border-slate-800"
    }
  ];

  return (
    <section id="pricing" className="py-20 border-t border-slate-900 bg-[#0B0F17]">
      <div className="max-w-6xl mx-auto px-6 text-center space-y-12">
        
        {/* Section Header */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold text-[#00DF81] uppercase tracking-widest">Pricing plans</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Simple pricing for creators and brands</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Start free to test your trigger rules, then upgrade to match your growing audience reach.
          </p>
        </div>

        {/* Currency Switch Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-xs font-bold transition-colors ${currency === "USD" ? "text-white" : "text-slate-500"}`}>
            USD ($)
          </span>
          <button
            type="button"
            onClick={() => setCurrency((curr) => (curr === "MAD" ? "USD" : "MAD"))}
            className="w-12 h-6 rounded-full bg-slate-800 border border-slate-700 p-0.5 transition-colors relative flex items-center"
            aria-label="Toggle currency"
          >
            <div
              className={`w-4.5 h-4.5 rounded-full bg-[#00DF81] transition-transform duration-200 ${
                currency === "MAD" ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
          <span className={`text-xs font-bold transition-colors ${currency === "MAD" ? "text-white" : "text-slate-500"}`}>
            MAD (Dirham 🇲🇦)
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`p-8 bg-[#111827] border rounded-2xl flex flex-col justify-between h-[420px] transition-all relative ${plan.color}`}
            >
              {plan.popular && (
                <span className="absolute -top-3 right-8 px-2.5 py-0.5 rounded-full bg-[#00DF81] text-[#000000] font-bold text-[9px] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 fill-black" />
                  Most Popular
                </span>
              )}

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 leading-normal">{plan.desc}</p>
                </div>

                <div className="space-y-0.5 py-1">
                  <p className="text-3xl font-black text-white">
                    {plan.price}
                    <span className="text-xs font-normal text-slate-500 ml-1">/{plan.period}</span>
                  </p>
                </div>

                <ul className="text-xs space-y-2.5 text-slate-350 border-t border-slate-800/80 pt-5">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#00DF81] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={plan.href}
                className={`w-full py-2.5 font-bold rounded-xl text-xs text-center transition-colors ${
                  plan.popular
                    ? "bg-[#00DF81] hover:bg-[#00C770] text-[#000000] shadow-lg shadow-[#00DF81]/10"
                    : "bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300"
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
