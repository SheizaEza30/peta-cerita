import bcrypt from "bcryptjs";

/**
 * Hash password dengan bcrypt.
 * Cost factor 12 = aman + masih cepat (~250ms per hash di server modern).
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify password dengan hash.
 * Return true kalau cocok, false kalau tidak.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}