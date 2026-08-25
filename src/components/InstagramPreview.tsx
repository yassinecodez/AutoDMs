"use client";

import { useState } from "react";
import {
  ChevronLeft,
  Phone,
  Video,
  Info,
  Heart,
  Check,
  MessageCircle,
  Bookmark,
  Share2,
  MoreVertical,
  Volume2,
  Sparkles,
  ExternalLink,
  Music2,
} from "lucide-react";

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
  username = "creamedia.ma",
  triggerKeyword = "PRICE",
  replyDmMessage = "Hey Sarah! Here is the direct link to the dress you saw on our Reel. Use code SUMMER20 for 20% off at checkout!",
  publicReplyComment = "Just sent you a DM with the direct link! 📩",
  buttonTitle = "Shop Dress with 20% Off",
  buttonUrl = "https://example.com/shop",
  secondaryButtonTitle = "",
  secondaryButtonUrl = "",
}: InstagramPreviewProps) {
  const [activeView, setActiveView] = useState<"REEL" | "DM">("REEL");

  const cleanDmText = replyDmMessage.replace(/\{\{username\}\}/g, "sarah_k");

  return (
    <div className="w-full max-w-[360px] mx-auto flex flex-col items-center select-none font-sans">
      {/* Segmented Dual-View Switcher */}
      <div className="flex items-center p-1 bg-[#111111] border border-[#222222] rounded-xl mb-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
        <button
          type="button"
          onClick={() => setActiveView("REEL")}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeView === "REEL"
              ? "bg-[#222222] text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Reel Comments
        </button>
        <button
          type="button"
          onClick={() => setActiveView("DM")}
          className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
            activeView === "DM"
              ? "bg-[#222222] text-white shadow-sm"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Direct Messages
        </button>
      </div>

      {/* Realistic Apple iPhone Frame */}
      <div className="relative w-full rounded-[48px] p-[3px] bg-gradient-to-b from-[#3A3A3C] via-[#2C2C2E] to-[#1C1C1E] shadow-2xl shadow-black/80">
        
        {/* Inner Phone Bezel */}
        <div className="w-full bg-[#000000] rounded-[45px] overflow-hidden border border-[#1C1C1E] flex flex-col relative min-h-[620px]">
          
          {/* iOS Dynamic Island & Status Bar */}
          <div className="relative pt-3 px-6 pb-2 flex items-center justify-between text-white text-[11px] font-semibold tracking-tight z-30">
            {/* iOS Time */}
            <span className="w-12 text-left">9:41</span>

            {/* Dynamic Island Pill */}
            <div className="w-24 h-5 bg-black rounded-full border border-[#222222] flex items-center justify-between px-2 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-[#0a0a0a] border border-[#333333]" />
              <div className="w-2 h-2 rounded-full bg-[#111111] flex items-center justify-center">
                <span className="w-1 h-1 rounded-full bg-[#00DF81]/80 animate-pulse" />
              </div>
            </div>

            {/* iOS System Icons (Cellular, Wi-Fi, Battery) */}
            <div className="w-12 flex items-center justify-end gap-1.5 text-zinc-200">
              {/* Cellular Bars */}
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <rect x="2" y="16" width="3" height="6" rx="1" />
                <rect x="7" y="12" width="3" height="10" rx="1" />
                <rect x="12" y="8" width="3" height="14" rx="1" />
                <rect x="17" y="4" width="3" height="18" rx="1" />
              </svg>
              {/* Wi-Fi */}
              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                <path d="M12 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-4.9-3.2l1.4 1.4C9.6 15.1 10.8 14.5 12 14.5s2.4.6 3.5 1.7l1.4-1.4C15.4 13.3 13.8 12.5 12 12.5s-3.4.8-4.9 2.3zM2.8 10.5l1.4 1.4C6.5 9.6 9.1 8.5 12 8.5s5.5 1.1 7.8 3.4l1.4-1.4C18.5 7.8 15.4 6.5 12 6.5s-6.5 1.3-9.2 4z" />
              </svg>
              {/* Battery */}
              <div className="w-5 h-2.5 rounded-[4px] border border-zinc-300 p-[1px] flex items-center">
                <div className="w-3 h-full bg-white rounded-[2px]" />
              </div>
            </div>
          </div>

          {/* VIEW 1: REEL COMMENTS SCREEN */}
          {activeView === "REEL" ? (
            <div className="flex-1 flex flex-col justify-between relative bg-gradient-to-b from-[#141416] via-[#0D0D0E] to-[#050505]">
              
              {/* Reel Top Bar */}
              <div className="px-4 py-2 flex items-center justify-between text-white text-xs z-10">
                <span className="font-bold tracking-tight text-sm">Reels</span>
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 7l-7 5 7 5V7z" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>

              {/* Reel Video Simulation Canvas */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-purple-600/20 blur-2xl" />
              </div>

              {/* Right-Side Floating Reel Action Bar */}
              <div className="absolute right-3 bottom-52 flex flex-col items-center gap-4 z-20">
                <div className="flex flex-col items-center gap-0.5 text-white">
                  <Heart className="w-6 h-6 text-white fill-white/10 hover:text-red-500 hover:fill-red-500 transition-colors cursor-pointer" />
                  <span className="text-[10px] font-medium">18.4K</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-white">
                  <MessageCircle className="w-6 h-6 text-white fill-white/10" />
                  <span className="text-[10px] font-medium">324</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-white">
                  <Share2 className="w-6 h-6 text-white" />
                  <span className="text-[10px] font-medium">1.2K</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 text-white">
                  <Bookmark className="w-5 h-5 text-white" />
                </div>
                {/* Audio Disc */}
                <div className="w-7 h-7 rounded-full bg-zinc-900 border-2 border-white/40 flex items-center justify-center mt-1 animate-spin" style={{ animationDuration: "6s" }}>
                  <Music2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Reel Caption Preview (Behind Drawer) */}
              <div className="px-4 pb-2 z-10 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1.5px]">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white">
                      {username.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-white">@{username}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/10 text-white font-medium">Follow</span>
                </div>
                <p className="text-[11px] text-zinc-300 line-clamp-1">
                  Comment "{triggerKeyword}" to receive direct product links 🚀
                </p>
              </div>

              {/* Slide-Up Comments Drawer Overlay */}
              <div className="bg-[#121212]/95 backdrop-blur-xl border-t border-white/10 rounded-t-[28px] p-4 space-y-3.5 z-30 shadow-2xl">
                
                {/* Drawer Pull Bar */}
                <div className="w-9 h-1 bg-zinc-600 rounded-full mx-auto -mt-1 mb-1" />

                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Comments</span>
                    <span className="text-[11px] text-zinc-400 font-mono">324</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-medium">Top comments ▾</span>
                </div>

                {/* Follower Comment Row */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 shadow-inner">
                      <img
                        src="/commenters/profile-1.png"
                        alt="sarah_k"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white text-[11px]">sarah_k</span>
                        <span className="text-[10px] text-zinc-500 font-mono">1m</span>
                      </div>
                      <p className="text-zinc-200 text-[11px] leading-snug">
                        Where can I get this? <span className="text-white font-bold bg-white/10 px-1 py-0.5 rounded font-mono">"{triggerKeyword}"</span>
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-zinc-400 pt-0.5">
                        <span className="hover:text-zinc-200 cursor-pointer">Reply</span>
                        <span className="hover:text-zinc-200 cursor-pointer">Send message</span>
                      </div>
                    </div>
                  </div>
                  <Heart className="w-3.5 h-3.5 text-zinc-500 hover:text-red-500 cursor-pointer mt-1 shrink-0" />
                </div>

                {/* Automated Creator Reply (Indented) */}
                <div className="flex items-start justify-between gap-2.5 pl-7 border-l border-zinc-800 ml-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1px] shrink-0">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[9px] font-bold text-white">
                        {username.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-white text-[11px]">{username}</span>
                        <span className="text-[8px] px-1 py-0.2 bg-zinc-800 text-zinc-300 rounded font-medium border border-zinc-700">Author</span>
                        <span className="text-[10px] text-zinc-500 font-mono ml-0.5">Just now</span>
                      </div>
                      <p className="text-zinc-300 text-[11px] leading-snug">
                        {publicReplyComment}
                      </p>
                    </div>
                  </div>
                  <Heart className="w-3 h-3 text-red-500 fill-red-500 mt-1 shrink-0" />
                </div>

                {/* Drawer Input Bar */}
                <div className="pt-1">
                  <div className="h-9 px-3 bg-[#1A1A1C] border border-zinc-800 rounded-full flex items-center justify-between text-[11px] text-zinc-500">
                    <span>Add a comment for @{username}...</span>
                    <span className="text-zinc-400">🤍</span>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* VIEW 2: DIRECT MESSAGE CHAT VIEW */
            <div className="flex-1 flex flex-col justify-between bg-[#000000]">
              
              {/* Instagram DM Header */}
              <div className="h-12 px-4 bg-[#000000] border-b border-[#1A1A1A] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ChevronLeft className="w-5 h-5 text-white -ml-1 cursor-pointer" strokeWidth={2.5} />
                  <div className="relative">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[1px]">
                      <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white">
                        {username.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[#00DF81] border border-black absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-xs text-white leading-tight">{username}</span>
                      <svg className="w-3 h-3 text-[#0095F6] fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7l-4.2-4.2 1.4-1.4 2.8 2.8 6.8-6.8 1.4 1.4-8.2 8.2z" />
                      </svg>
                    </div>
                    <p className="text-[9px] text-zinc-500">Active now</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 text-zinc-300">
                  <Phone className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                  <Video className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                  <Info className="w-4 h-4 cursor-pointer hover:text-white transition-colors" />
                </div>
              </div>

              {/* DM Chat Thread */}
              <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-end">
                
                {/* Time Indicator */}
                <div className="text-center">
                  <span className="text-[10px] text-zinc-500 font-medium">Today 12:42 PM</span>
                </div>

                {/* Follower Inbound Trigger Bubble */}
                <div className="self-end max-w-[75%]">
                  <div className="bg-[#0095F6] text-white text-xs px-3.5 py-2.5 rounded-[20px] rounded-br-[4px] leading-relaxed shadow-sm">
                    Where can I get the link? <span className="font-bold">"{triggerKeyword}"</span>
                  </div>
                </div>

                {/* Automated Outbound Message */}
                <div className="self-start max-w-[85%] space-y-2">
                  
                  {/* Main DM Bubble */}
                  <div className="bg-[#262626] text-white text-xs px-3.5 py-2.5 rounded-[20px] rounded-bl-[4px] leading-relaxed whitespace-pre-wrap">
                    {cleanDmText}
                  </div>

                  {/* Meta Generic Template Card */}
                  {buttonTitle && (
                    <div className="bg-[#1C1C1E] border border-[#2C2C2E] rounded-2xl overflow-hidden shadow-xl w-full">
                      <div className="p-3 space-y-1 bg-gradient-to-b from-[#242426] to-[#1C1C1E]">
                        <p className="text-xs font-semibold text-white truncate">Special Offer Link</p>
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

                  {/* Delivered Status */}
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 pl-1">
                    <Check className="w-3 h-3 text-zinc-500" strokeWidth={2.5} />
                    <span>Delivered • Just now</span>
                  </div>

                </div>

              </div>

              {/* Bottom Message Input Bar */}
              <div className="p-3 bg-[#000000] border-t border-[#1A1A1A]">
                <div className="h-10 px-3 bg-[#121212] border border-[#262626] rounded-full flex items-center justify-between text-xs text-zinc-500">
                  <span>Message...</span>
                  <div className="w-6 h-6 rounded-full bg-[#0095F6] flex items-center justify-center text-white text-xs font-bold">
                    ↑
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* iOS Bottom Swipe Bar */}
          <div className="pt-2 pb-2 bg-[#000000]">
            <div className="w-32 h-1 bg-zinc-600 rounded-full mx-auto" />
          </div>

        </div>

      </div>
    </div>
  );
}

export default InstagramPreview;
