import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";
import type { Role } from "@prisma/client";

/**
 * Augmentasi tipe Auth.js.
 * Menambahkan field kustom ke User, Session, dan JWT.
 */

declare module "next-auth" {
  interface User extends DefaultUser {
    username: string;
    role: Role;
    avatar?: string | null;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      role: Role;
      avatar?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    username: string;
    role: Role;
    avatar?: string | null;
  }
}