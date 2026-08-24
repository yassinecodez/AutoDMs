import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id?: string;
      planType?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    planType?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    planType?: string;
  }
}
