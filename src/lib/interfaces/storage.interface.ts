export interface UploadSignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface DeleteImageResult {
  success: boolean;
  error?: string;
}

export interface IStorageService {
  /**
   * Generates a signed payload for client-side direct upload to Cloudinary.
   */
  getUploadSignature(folder?: string): Promise<UploadSignature>;

  /**
   * Deletes an image from storage using its publicId.
   */
  deleteImage(publicId: string): Promise<DeleteImageResult>;

  /**
   * Returns an optimized URL with f_auto, q_auto transformations.
   */
  getOptimizedUrl(
    publicId: string,
    options?: { width?: number; height?: number; crop?: string }
  ): string;
}
