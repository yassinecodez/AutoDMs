"use client";

import { useState } from "react";
import { ChevronLeft, Phone, Video, Info, Heart, Check } from "lucide-react";

interface InstagramPreviewProps {
  username?: string;
  triggerKeyword?: string;
  replyDmMessage?: string;
  publicReplyComment?: string;
  buttonTitle?: string;
  buttonUrl?: string;
  secondaryButtonTitle?: string;
  secondaryButtonUrl?: string;
}

export function InstagramPreview({
  username = "your_brand",
  triggerKeyword = "PRICE",
  replyDmMessage = "Hey Sarah! Here is the direct link to the dress you saw on our Reel. Use code SUMMER20 for 20% off at checkout!",
  publicReplyComment = "Just sent you a DM with the direct link! 📩",
  buttonTitle = "Shop Dress with 20% Off",
  buttonUrl = "https://example.com/shop",
  secondaryButtonTitle = "",
  secondaryButtonUrl = "",
}: InstagramPreviewProps) {
  const [activeView, setActiveView] = useState<"DM" | "COMMENT">("DM");

  const cleanDmText = replyDmMessage.replace(/\{\{username\}\}/g, "sarah_k");

  return (
    <div className="w-full max-w-md mx-auto">
      {/* View Switcher Controls */}
      <div className="flex items-center justify-center gap-1.5 p-1 bg-[#111111] border border-[#222222] rounded-lg mb-3 w-fit mx-auto">
        <button
          type="button"
          onClick={() => setActiveView("DM")}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            activeView === "DM"
              ? "bg-[#222222] text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Direct Message Thread
        </button>
        <button
          type="button"
          onClick={() => setActiveView("COMMENT")}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            activeView === "COMMENT"
              ? "bg-[#222222] text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Reel Comments
        </button>
      </div>

      {/* Outer Phone Frame */}
      <div className="bg-[#000000] border border-[#262626] rounded-2xl overflow-hidden shadow-2xl flex flex-col font-sans select-none">
        
        {/* Instagram Top Navigation Header */}
        <div className="h-14 px-4 bg-[#000000] border-b border-[#1A1A1A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChevronLeft className="w-6 h-6 text-white cursor-pointer -ml-1" strokeWidth={2} />
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#111111] flex items-center justify-center text-[11px] font-bold text-white uppercase">
                  {username.slice(0, 2)}
                </div>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#00DF81] border-2 border-black absolute -bottom-0.5 -right-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-xs text-white leading-tight">{username}</span>
                {/* Meta Verified Blue Badge */}
                <svg className="w-3.5 h-3.5 text-[#0095F6] fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-4.2-4.2 1.4-1.4 2.8 2.8 6.8-6.8 1.4 1.4-8.2 8.2z" />
                </svg>
              </div>
              <p className="text-[10px] text-zinc-500 leading-tight">Active now</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-white">
            <Phone className="w-4 h-4 text-zinc-300 cursor-pointer" strokeWidth={1.75} />
            <Video className="w-4 h-4 text-zinc-300 cursor-pointer" strokeWidth={1.75} />
            <Info className="w-4 h-4 text-zinc-300 cursor-pointer" strokeWidth={1.75} />
          </div>
        </div>

        {/* Dynamic Content View */}
        {activeView === "DM" ? (
          /* Direct Message Chat View */
          <div className="p-4 space-y-4 min-h-[380px] flex flex-col justify-end bg-[#000000]">
            
            {/* Timestamp Divider */}
            <div className="text-center">
              <span className="text-[10px] text-zinc-600 font-medium">Today 12:42 PM</span>
            </div>

            {/* Inbound Trigger Message from follower */}
            <div className="self-end max-w-[78%]">
              <div className="bg-[#3797F0] text-white text-xs px-3.5 py-2.5 rounded-[18px] rounded-br-[4px] leading-relaxed shadow-sm">
                Where can I get the link? <span className="font-semibold">{triggerKeyword}</span>
              </div>
            </div>

            {/* Outbound Automated DM Bubble */}
            <div className="self-start max-w-[85%] space-y-2">
              <div className="bg-[#262626] text-white text-xs px-3.5 py-2.5 rounded-[18px] rounded-bl-[4px] leading-relaxed break-words whitespace-pre-wrap">
                {cleanDmText}
              </div>

              {/* Meta Generic Template Card */}
              {buttonTitle && (
                <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-xl overflow-hidden shadow-lg w-full">
                  <div className="p-3 space-y-1">
                    <p className="text-[11px] font-semibold text-white truncate">Special Summer Offer</p>
                    <p className="text-[10px] text-zinc-400 leading-tight">Instant access direct checkout</p>
                  </div>

                  <a
                    href={buttonUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full py-2.5 text-center text-xs font-semibold text-[#0095F6] hover:bg-[#2C2C2E]/40 transition-colors border-t border-[#2C2C2E]"
                  >
                    {buttonTitle}
                  </a>

                  {secondaryButtonTitle && (
                    <a
                      href={secondaryButtonUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full py-2.5 text-center text-xs font-semibold text-[#0095F6] hover:bg-[#2C2C2E]/40 transition-colors border-t border-[#2C2C2E]"
                    >
                      {secondaryButtonTitle}
                    </a>
                  )}
                </div>
              )}

              {/* Delivery Receipt */}
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 pl-1 pt-0.5">
                <Check className="w-3 h-3 text-zinc-500" strokeWidth={2} />
                <span>Delivered • Just now</span>
              </div>
            </div>

            {/* Instagram Bottom Message Bar */}
            <div className="pt-2">
              <div className="h-10 px-3 bg-[#121212] border border-[#262626] rounded-full flex items-center justify-between text-xs text-zinc-500">
                <span>Message...</span>
                <div className="w-5 h-5 rounded-full bg-[#0095F6] flex items-center justify-center text-white text-[10px]">
                  ↑
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Reel Comments View */
          <div className="p-4 space-y-4 min-h-[380px] bg-[#000000]">
            
            <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-2">
              <span className="text-xs font-bold text-white">Comments (142)</span>
              <span className="text-[10px] text-zinc-500">Top comments</span>
            </div>

            {/* User Comment Item */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-zinc-300 shrink-0">
                  SK
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-white">sarah_k</span>
                    <span className="text-[10px] text-zinc-500">2m</span>
                  </div>
                  <p className="text-zinc-200">
                    Where can I buy this dress? <span className="text-white font-semibold">"{triggerKeyword}"</span>
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 pt-0.5">
                    <span className="font-medium hover:text-zinc-300 cursor-pointer">Reply</span>
                    <span className="hover:text-zinc-300 cursor-pointer">See translation</span>
                  </div>
                </div>
              </div>

              <Heart className="w-3.5 h-3.5 text-zinc-500 shrink-0 cursor-pointer hover:text-red-500 mt-1" strokeWidth={1.75} />
            </div>

            {/* Indented Official Brand Reply */}
            <div className="flex items-start justify-between gap-3 pl-8">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1px] shrink-0">
                  <div className="w-full h-full rounded-full bg-[#111111] flex items-center justify-center text-[9px] font-bold text-white uppercase">
                    {username.slice(0, 2)}
                  </div>
                </div>
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-white">{username}</span>
                    <span className="text-[9px] px-1 bg-zinc-800 rounded text-zinc-400 font-medium">Author</span>
                    <span className="text-[10px] text-zinc-500 ml-1">1m</span>
                  </div>
                  <p className="text-zinc-300">
                    {publicReplyComment}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 pt-0.5">
                    <span className="font-medium hover:text-zinc-300 cursor-pointer">Reply</span>
                  </div>
                </div>
              </div>

              <Heart className="w-3 h-3 text-red-500 fill-red-500 shrink-0 cursor-pointer mt-1" />
            </div>

            {/* Reel Context Subtext */}
            <div className="pt-8 text-center">
              <p className="text-[11px] text-zinc-500">
                AutoDMs responds to public comments and delivers private DMs in under 2 seconds.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
export default InstagramPreview;
