import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";

export function encrypt(text: string): string {
  if (!text) return "";
  const key = process.env.ENCRYPTION_KEY || "";
  if (key.length !== 32) {
    console.warn("ENCRYPTION_KEY must be exactly 32 characters long. Current length: " + key.length);
    return text;
  }
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (err) {
    console.warn("Encryption failed:", err);
    return text;
  }
}

export function decrypt(encryptedText: string): string {
  if (!encryptedText) return "";
  const key = process.env.ENCRYPTION_KEY || "";
  if (key.length !== 32) {
    console.warn("ENCRYPTION_KEY must be exactly 32 characters long. Current length: " + key.length);
    return encryptedText;
  }
  try {
    const parts = encryptedText.split(":");
    if (parts.length !== 2) {
      return encryptedText;
    }
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(key), iv);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    console.warn("Decryption failed:", err);
    return encryptedText;
  }
}
