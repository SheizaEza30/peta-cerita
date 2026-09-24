import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";
import type { Role } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";

// ============================================
// VALIDATION SCHEMA
// ============================================
const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

// ============================================
// AUTH.JS CONFIG
// ============================================
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 hari
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user) {
          return null;
        }

        const isValid = await verifyPassword(password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
          image: user.avatar,
          avatar: user.avatar,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Saat login pertama kali
      if (user) {
        token.id = user.id as string;
        token.username = user.username;
        token.role = user.role;
        token.avatar = user.avatar ?? null;
      }

      // Saat user update profile
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      if (trigger === "update" && session?.avatar !== undefined) {
        token.avatar = session.avatar;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role as Role;
        session.user.avatar = token.avatar ?? null;
      }
      return session;
    },
  },

    events: {
    async signIn({ user: _user }) {
    // Bisa dipakai untuk logging atau update lastLoginAt nanti
  },
},

  debug: process.env.NODE_ENV === "development",
});