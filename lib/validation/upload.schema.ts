import { z } from "zod";


export const UPLOAD_TYPES = ["story", "avatar", "contribution"] as const;
export type UploadType = (typeof UPLOAD_TYPES)[number];

export const uploadMetaSchema = z.object({
  type: z.enum(UPLOAD_TYPES, {
    errorMap: () => ({
      message: `Tipe upload harus salah satu dari: ${UPLOAD_TYPES.join(", ")}`,
    }),
  }),
});

export type UploadMetaInput = z.infer<typeof uploadMetaSchema>;