import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import bcrypt from "bcryptjs";

// Dynamically handle Railway's public domain URL mapping for NextAuth
if (!process.env.NEXTAUTH_URL && process.env.RAILWAY_PUBLIC_DOMAIN) {
  const domain = process.env.RAILWAY_PUBLIC_DOMAIN;
  process.env.NEXTAUTH_URL = domain.startsWith("http") ? domain : `https://${domain}`;
  console.log(`[NextAuth] Dynamic URL mapped to: ${process.env.NEXTAUTH_URL}`);
}

export const authOptions: AuthOptions = {
  providers: [
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

        let user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        // Automatically register the user if they don't exist yet (convenient for setup)
        if (!user) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await db.user.create({
            data: {
              email: credentials.email,
              password: hashedPassword,
              name: credentials.email.split("@")[0],
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
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
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
