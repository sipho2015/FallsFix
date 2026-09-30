import sharp from "sharp";
import { OperationError } from "./service";
export async function normalizePhoto(input: Buffer) {
  if (!input.length || input.length > 5 * 1024 * 1024) throw new OperationError("Use a JPEG, PNG, or WebP photo up to 5 MB.", 413);
  try {
    const image = sharp(input, { limitInputPixels: 20_000_000, failOn: "warning" });
    const metadata = await image.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format ?? "") || (metadata.pages ?? 1) > 1) throw new Error("Unsupported image");
    return await image.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
  } catch { throw new OperationError("Use a valid, non-animated JPEG, PNG, or WebP photo under 20 megapixels."); }
}
