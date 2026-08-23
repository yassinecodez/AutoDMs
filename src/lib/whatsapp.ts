/**
 * WhatsApp Direct Link Helper
 * Formats a valid WhatsApp chat link: https://wa.me/{phone}?text={encodedText}
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  // Strip any non-numeric characters from the phone number
  const cleanPhone = phone.replace(/\D/g, "");
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
