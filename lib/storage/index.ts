import { SupabaseStorageProvider } from "./supabase";
import type { StorageProvider } from "./provider";

/**
 * Storage service singleton.
 * Ganti provider di sini kalau mau pindah ke S3/Cloudinary.
 */
let storageInstance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (!storageInstance) {
    storageInstance = new SupabaseStorageProvider();
  }
  return storageInstance;
}

export * from "./provider";