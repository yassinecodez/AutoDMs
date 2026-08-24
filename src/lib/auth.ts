import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Dynamically handle Railway's public domain URL mapping and Vercel's VERCEL_URL environment variable for NextAuth
if (!process.env.NEXTAUTH_URL) {
  if (process.env.RAILWAY_PUBLIC_DOMAIN) {
    const domain = process.env.RAILWAY_PUBLIC_DOMAIN;
    process.env.NEXTAUTH_URL = domain.startsWith("http") ? domain : `https://${domain}`;
  } else if (process.env.VERCEL_URL) {
    process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "creator@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const email = credentials.email.toLowerCase().trim();
        let user = await db.user.findUnique({
          where: { email },
        });

        // Automatically register the user if they don't exist yet
        if (!user) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await db.user.create({
            data: {
              email,
              password: hashedPassword,
              name: email.split("@")[0],
              planType: "FREE",
              dmsLimit: 150,
              usageResetAt: new Date(),
            },
          });
        } else {
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          planType: user.planType,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        const email = user.email.toLowerCase().trim();
        
        let existingUser = await db.user.findUnique({
          where: { email },
        });

        if (!existingUser) {
          const randomPassword = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10);
          existingUser = await db.user.create({
            data: {
              email,
              name: user.name || email.split("@")[0],
              password: randomPassword,
              planType: "FREE",
              dmsLimit: 150,
              usageResetAt: new Date(),
            },
          });
        }
        
        user.id = existingUser.id;
        user.planType = existingUser.planType;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.sub = user.id;
        token.planType = user.planType || "FREE";
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.sub || token.id) as string;
        session.user.planType = (token.planType as string) || "FREE";
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
