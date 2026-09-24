import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { StorageProvider, UploadOptions, UploadResult } from "./provider";

/**
 * Supabase Storage Provider.
 */

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "peta-cerita";

function getClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase credentials tidak ditemukan. Set NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env"
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export class SupabaseStorageProvider implements StorageProvider {
  private client: SupabaseClient;

  constructor() {
    this.client = getClient();
  }

  async upload(options: UploadOptions): Promise<UploadResult> {
    const { file, path, contentType, upsert = false } = options;

    let buffer: Buffer;
    let mimetype: string;

    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      mimetype = file.type;
    } else {
      buffer = file;
      mimetype = contentType || "application/octet-stream";
    }

    const { data, error } = await this.client.storage
      .from(BUCKET)
      .upload(path, buffer, {
        contentType: mimetype,
        upsert,
        cacheControl: "31536000", // 1 tahun
      });

    if (error) {
      throw new Error(`Upload gagal: ${error.message}`);
    }

    const { data: urlData } = this.client.storage
      .from(BUCKET)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      size: buffer.length,
      mimetype,
    };
  }

  async delete(path: string): Promise<void> {
    const { error } = await this.client.storage.from(BUCKET).remove([path]);
    if (error) {
      throw new Error(`Delete gagal: ${error.message}`);
    }
  }

  getPublicUrl(path: string): string {
    const { data } = this.client.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }
}