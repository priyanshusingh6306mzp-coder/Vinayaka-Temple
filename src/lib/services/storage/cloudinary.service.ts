import crypto from "crypto";
import {
  IStorageService,
  UploadSignature,
  DeleteImageResult,
} from "@/lib/interfaces/storage.interface";

export class CloudinaryService implements IStorageService {
  private getCredentials() {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret || cloudName === "placeholder") {
      throw new Error(
        "Cloudinary is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env."
      );
    }

    return { cloudName, apiKey, apiSecret };
  }

  async getUploadSignature(folder: string = "vinayaka_temple"): Promise<UploadSignature> {
    const { cloudName, apiKey, apiSecret } = this.getCredentials();
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Parameters to sign in alphabetical order
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + apiSecret)
      .digest("hex");

    return {
      signature,
      timestamp,
      apiKey,
      cloudName,
      folder,
    };
  }

  async deleteImage(publicId: string): Promise<DeleteImageResult> {
    try {
      const { cloudName, apiKey, apiSecret } = this.getCredentials();
      const timestamp = Math.round(new Date().getTime() / 1000);

      const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
      const signature = crypto
        .createHash("sha1")
        .update(paramsToSign + apiSecret)
        .digest("hex");

      const formData = new URLSearchParams();
      formData.append("public_id", publicId);
      formData.append("timestamp", timestamp.toString());
      formData.append("api_key", apiKey);
      formData.append("signature", signature);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (data.result === "ok" || data.result === "not found") {
        return { success: true };
      }

      return {
        success: false,
        error: data.error?.message || "Failed to delete image from Cloudinary",
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Cloudinary Deletion Error]", msg);
      return { success: false, error: msg };
    }
  }

  getOptimizedUrl(
    publicId: string,
    options?: { width?: number; height?: number; crop?: string }
  ): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "placeholder";
    const transformations = ["f_auto", "q_auto"];

    if (options?.width) transformations.push(`w_${options.width}`);
    if (options?.height) transformations.push(`h_${options.height}`);
    if (options?.crop) transformations.push(`c_${options.crop}`);

    const transformStr = transformations.join(",");
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}/${publicId}`;
  }
}

export const storageService = new CloudinaryService();
