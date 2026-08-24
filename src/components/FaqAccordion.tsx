"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

export function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const faqs = [
    {
      q: "Will this get my Instagram account banned?",
      a: "No. AutoDMs uses Meta's official Graph API and adheres strictly to Instagram's terms of service. Since we don't scrape pages or use unauthorized browser automation, your account remains 100% secure."
    },
    {
      q: "Does it work while my phone is off?",
      a: "Yes. AutoDMs runs 24/7 in the cloud. Once your rules are configured, our background webhook processors handle notifications and dispatch replies even while you are offline."
    },
    {
      q: "Can I choose which specific Reel or post to automate?",
      a: "Yes. You can target all posts universally or pick specific Reels from your dashboard. Our builder offers a visual grid selector to let you map posts individually."
    },
    {
      q: "Can I cancel my subscription anytime?",
      a: "Yes. There are no lock-in contracts. You can upgrade, downgrade, or cancel your subscription plan with a single click directly inside your billing settings."
    }
  ];

  return (
    <section id="faq" className="py-20 border-t border-[#27272A] bg-[#0F0F0F]">
      <div className="max-w-3xl mx-auto px-6 space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#00DF81] uppercase tracking-widest">Support</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight">Frequently asked questions</h2>
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-[#18181B] border border-[#27272A] rounded-xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left text-zinc-100 font-semibold text-xs md:text-sm"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <Minus className="w-4 h-4 text-[#00DF81] shrink-0" strokeWidth={2} />
                  ) : (
                    <Plus className="w-4 h-4 text-zinc-500 shrink-0" strokeWidth={2} />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-4 text-xs text-zinc-400 leading-relaxed border-t border-[#27272A] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
export default FaqAccordion;
