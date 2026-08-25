/**
 * Commenter Avatars Registry
 * When you add new images to public/commenters/ (e.g. profile-2.png, profile-3.png),
 * simply add their paths to this array or they will be picked deterministically.
 */
export const COMMENTER_AVATARS = [
  "/commenters/profile-1.png",
  "/commenters/default.png",
];

/**
 * Deterministically returns a commenter avatar based on their Instagram username,
 * ensuring consistent profile picture assignment across table views and log streams.
 */
export function getCommenterAvatar(username?: string | null): string {
  if (!username) return "/commenters/default.png";
  
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COMMENTER_AVATARS.length;
  return COMMENTER_AVATARS[index] || "/commenters/default.png";
}
