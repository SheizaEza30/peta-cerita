import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/validation/auth.schema";
import {
  created,
  conflict,
  validationError,
  serverError,
} from "@/lib/api/response";

/**
 * POST /api/auth/register
 * Daftar user baru.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Parse body
    const body = await req.json().catch(() => null);

    if (!body) {
      return validationError({ _form: ["Body request tidak valid"] });
    }

    // 2. Validasi dengan Zod
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const { name, username, email, password } = parsed.data;

    // 3. Cek duplikat email
    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingEmail) {
      return conflict("Email sudah terdaftar");
    }

    // 4. Cek duplikat username
    const existingUsername = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (existingUsername) {
      return conflict("Username sudah digunakan");
    }

    // 5. Hash password
    const passwordHash = await hashPassword(password);

    // 6. Simpan user baru
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        passwordHash,
        role: "USER",
        points: 0,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        avatar: true,
        points: true,
        createdAt: true,
      },
    });

    // 7. Response (JANGAN kirim passwordHash!)
    return created({ user });
  } catch (err) {
    console.error("[REGISTER_ERROR]", err);
    return serverError("Gagal mendaftar. Coba lagi nanti.");
  }
}