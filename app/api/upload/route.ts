import { NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { getStorage } from "@/lib/storage";
import {
  created,
  unauthorized,
  badRequest,
  validationError,
  serverError,
} from "@/lib/api/response";
import { uploadMetaSchema, type UploadType } from "@/lib/validation/upload.schema";
import { VALIDATION } from "@/lib/constants";

/**
 * POST /api/upload
 * Upload file gambar.
 *
 * FormData:
 *   - file: File
 *   - type: "story" | "avatar" | "contribution"
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // 1. Parse FormData
    const formData = await req.formData().catch(() => null);
    if (!formData) return badRequest("Body harus berupa multipart/form-data");

    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) return badRequest("File tidak ditemukan");
    if (!type) return badRequest("Field 'type' wajib diisi");

    // 2. Validasi type
    const metaParsed = uploadMetaSchema.safeParse({ type });
    if (!metaParsed.success) {
      return validationError(metaParsed.error.flatten().fieldErrors);
    }

    const uploadType = metaParsed.data.type as UploadType;

    // 3. Validasi file
    if (file.size === 0) {
      return badRequest("File kosong");
    }

    if (file.size > VALIDATION.MAX_FILE_SIZE) {
      const maxMB = VALIDATION.MAX_FILE_SIZE / 1024 / 1024;
      return badRequest(`Ukuran file maksimal ${maxMB} MB`);
    }

    if (!VALIDATION.ALLOWED_IMAGE_TYPES.includes(file.type as never)) {
      return badRequest(
        `Tipe file tidak diizinkan. Gunakan: ${VALIDATION.ALLOWED_IMAGE_TYPES.join(", ")}`
      );
    }

    // 4. Generate path unik
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 10);
    const filename = `${timestamp}-${random}.${ext}`;

    // Path: {type}/{userId}/{filename}
    const path = `${uploadType}/${user.id}/${filename}`;

    // 5. Upload
    const storage = getStorage();
    const result = await storage.upload({
      file,
      path,
      contentType: file.type,
      upsert: false,
    });

    return created({
      url: result.url,
      path: result.path,
      size: result.size,
      mimetype: result.mimetype,
    });
  } catch (err) {
    console.error("[UPLOAD_ERROR]", err);
    const message =
      err instanceof Error ? err.message : "Gagal mengunggah file";
    return serverError(message);
  }
}