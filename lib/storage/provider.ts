/**
 * Interface StorageProvider.
 * Abstraction supaya gampang ganti provider (Supabase → S3 → Cloudinary).
 */
export type UploadResult = {
  url: string;
  path: string;
  size: number;
  mimetype: string;
};

export type UploadOptions = {
  file: File | Buffer;
  path: string;
  contentType?: string;
  upsert?: boolean;
};

export interface StorageProvider {
  upload(options: UploadOptions): Promise<UploadResult>;
  delete(path: string): Promise<void>;
  getPublicUrl(path: string): string;
}