"use client";

import { useState, useMemo } from "react";
import {
  X,
  Search,
  Check,
  Video,
  Heart,
  MessageCircle,
  Loader2,
  Image as ImageIcon,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";

export interface InstagramMediaItem {
  id: string;
  caption?: string;
  thumbnail: string;
  mediaUrl: string;
  permalink: string;
  type: string;
  likeCount?: number;
  commentCount?: number;
  timestamp: string;
}

interface PostPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaItems: InstagramMediaItem[];
  selectedMediaIds: string[];
  onSelectMediaIds: (ids: string[]) => void;
  isLoading?: boolean;
}

export function PostPickerModal({
  isOpen,
  onClose,
  mediaItems,
  selectedMediaIds,
  onSelectMediaIds,
  isLoading = false,
}: PostPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedMediaIds);

  // Sync state when modal opens
  const handleToggleSelect = (id: string) => {
    setLocalSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    onSelectMediaIds(localSelectedIds);
    onClose();
  };

  const filteredMedia = useMemo(() => {
    if (!searchQuery.trim()) return mediaItems;
    return mediaItems.filter((item) =>
      (item.caption || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mediaItems, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* ========================================================================= */}
        {/* 1. Modal Header */}
        {/* ========================================================================= */}
        <div className="p-5 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Select Instagram Post or Reel</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Choose the publications where comments will trigger automated responses.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Filter Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search posts by caption keyword..."
              className="w-full h-9 pl-9 pr-3 bg-secondary border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. Visual Media Grid Layout */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-5 min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-foreground" />
              <p className="text-xs text-muted-foreground">Loading your Instagram feed...</p>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground">
                <ImageIcon className="w-5 h-5" />
              </div>
              <p className="text-xs font-medium text-foreground">No publications found</p>
              <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                {searchQuery
                  ? "No posts matched your search caption query."
                  : "Ensure your Instagram Business profile has published posts or reels."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredMedia.map((item) => {
                const isSelected = localSelectedIds.includes(item.id);
                const isVideo = item.type === "VIDEO";
                const isCarousel = item.type === "CAROUSEL_ALBUM";

                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleSelect(item.id)}
                    className={`group relative aspect-square bg-secondary rounded-xl overflow-hidden cursor-pointer border-2 transition-all select-none ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 shadow-md"
                        : "border-border hover:border-zinc-400 dark:hover:border-zinc-500"
                    }`}
                  >
                    {/* Media Thumbnail */}
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.caption || "Instagram Media"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}

                    {/* Media Type Badge (Reel / Video / Carousel) */}
                    <div className="absolute top-2 left-2 z-10">
                      {isVideo && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md border border-white/10 text-[9px] font-medium text-white shadow-sm">
                          <Video className="w-3 h-3 text-white" />
                          Reel
                        </span>
                      )}
                      {isCarousel && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md border border-white/10 text-[9px] font-medium text-white shadow-sm">
                          <Layers className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </div>

                    {/* Selection Checkmark Badge */}
                    <div
                      className={`absolute top-2 right-2 z-10 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-md scale-100"
                          : "bg-black/60 border border-white/40 text-transparent scale-90 group-hover:scale-100"
                      }`}
                    >
                      <Check className={`w-3.5 h-3.5 ${isSelected ? "text-primary-foreground stroke-[3]" : "opacity-0 group-hover:opacity-60 text-white"}`} />
                    </div>

                    {/* Hover Info Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5 space-y-1">
                      {/* Caption snippet */}
                      <p className="text-[10px] text-zinc-200 line-clamp-2 leading-snug">
                        {item.caption || "No caption provided"}
                      </p>

                      {/* Engagement Counters */}
                      <div className="flex items-center gap-2.5 text-[10px] text-zinc-400 pt-0.5">
                        {item.likeCount !== undefined && (
                          <span className="flex items-center gap-1 text-zinc-300">
                            <Heart className="w-3 h-3 text-red-400 fill-red-400/30" />
                            {item.likeCount.toLocaleString()}
                          </span>
                        )}
                        {item.commentCount !== undefined && (
                          <span className="flex items-center gap-1 text-zinc-300">
                            <MessageCircle className="w-3 h-3 text-white" />
                            {item.commentCount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. Modal Footer */}
        {/* ========================================================================= */}
        <div className="p-4 border-t border-border bg-card flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground font-medium">
              {localSelectedIds.length === 0
                ? "No posts selected"
                : `${localSelectedIds.length} post${localSelectedIds.length > 1 ? "s" : ""} selected`}
            </span>
            {localSelectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setLocalSelectedIds([])}
                className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline ml-1"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="h-9 px-4 rounded-lg bg-primary text-primary-foreground hover:opacity-90 text-xs font-medium transition-colors shadow-sm"
            >
              Done ({localSelectedIds.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostPickerModal;
