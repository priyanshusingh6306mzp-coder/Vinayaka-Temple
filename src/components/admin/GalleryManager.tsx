"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { compressImageClient } from "@/lib/image-compressor";
import {
  saveGalleryImage,
  deleteGalleryImage,
  reorderGalleryImages,
  updateGalleryImageDetails,
} from "@/actions/gallery.actions";
import { ToastContainer, ToastMessage } from "@/components/admin/Toast";

export interface SerializedGalleryImage {
  id: string;
  imageUrl: string;
  publicId: string;
  title: string;
  caption: string | null;
  sortOrder: number;
}

export function GalleryManager({
  initialImages,
}: {
  initialImages: SerializedGalleryImage[];
}) {
  const [images, setImages] = useState<SerializedGalleryImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<SerializedGalleryImage | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Handle Multi-file Upload directly with Client Compression & Cloudinary
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      // 1. Get signed signature from backend
      const sigRes = await fetch("/api/admin/upload-signature", { method: "POST" });
      if (!sigRes.ok) {
        throw new Error("Cloudinary credentials not configured or session invalid");
      }
      const { timestamp, signature, cloudName, apiKey, folder } = await sigRes.json();

      let successCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Compress image client side (<1600px, ~300KB)
        const compressedBlob = await compressImageClient(file);

        // Upload to Cloudinary directly via FormData
        const formData = new FormData();
        formData.append("file", compressedBlob, file.name);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("api_key", apiKey);
        formData.append("folder", folder);

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!cloudRes.ok) {
          throw new Error("Failed to upload to Cloudinary storage");
        }

        const cloudData = await cloudRes.json();

        // Save record into database via server action
        const defaultTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        const saveRes = await saveGalleryImage({
          imageUrl: cloudData.secure_url,
          publicId: cloudData.public_id,
          title: defaultTitle,
          caption: "",
          sortOrder: images.length + successCount,
        });

        if (saveRes.success) {
          successCount++;
          setImages((prev) => [
            ...prev,
            {
              id: saveRes.image.id,
              imageUrl: saveRes.image.imageUrl,
              publicId: saveRes.image.publicId,
              title: saveRes.image.title,
              caption: saveRes.image.caption,
              sortOrder: saveRes.image.sortOrder,
            },
          ]);
        }
      }

      addToast("success", `Successfully added ${successCount} new photo(s) to the temple gallery!`);
    } catch (err: unknown) {
      console.error("[Upload Error]", err);
      const msg = err instanceof Error ? err.message : "Failed to upload image. Please verify Cloudinary environment variables.";
      addToast("error", msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Reorder Images
  const moveImage = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const [moved] = newImages.splice(index, 1);
    newImages.splice(targetIndex, 0, moved);

    // Reassign sortOrder
    const updated = newImages.map((img, idx) => ({ ...img, sortOrder: idx }));
    setImages(updated);

    try {
      await reorderGalleryImages(updated.map((u) => ({ id: u.id, sortOrder: u.sortOrder })));
      addToast("success", "Gallery photo order updated.");
    } catch {
      setImages(images);
      addToast("error", "Failed to update order.");
    }
  };

  // Delete Image (Database + Cloudinary)
  const handleDelete = async (id: string) => {
    const original = [...images];
    setImages((prev) => prev.filter((img) => img.id !== id));
    setDeleteConfirmId(null);

    try {
      const res = await deleteGalleryImage(id);
      if (res.success) {
        addToast("success", "Photo deleted from gallery and storage.");
      }
    } catch {
      setImages(original);
      addToast("error", "Failed to delete photo. Please try again.");
    }
  };

  // Update Image Title / Caption
  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    try {
      await updateGalleryImageDetails({
        id: editingImage.id,
        title: editTitle,
        caption: editCaption,
      });

      setImages((prev) =>
        prev.map((img) =>
          img.id === editingImage.id
            ? { ...img, title: editTitle, caption: editCaption }
            : img
        )
      );
      setEditingImage(null);
      addToast("success", "Photo details updated.");
    } catch {
      addToast("error", "Failed to update details.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Controls Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-temple-stoneBorder shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg sm:text-xl font-bold text-temple-charcoal">
            Temple Photos &amp; Darshan Gallery
          </h2>
          <p className="text-xs text-temple-warmGrey mt-0.5">
            Photos are automatically resized and compressed on your phone before uploading to save storage.
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
            id="gallery-file-input"
          />
          <Button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="h-11 px-5 text-xs font-semibold bg-temple-charcoal text-white hover:bg-temple-charcoalCard shadow-sm w-full sm:w-auto"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Compressing &amp; Uploading...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Upload Photos from Phone</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-temple-stoneBorder space-y-3">
          <Upload className="w-10 h-10 mx-auto text-temple-warmGrey" />
          <h3 className="font-serif text-lg font-bold text-temple-charcoal">
            No Photos Uploaded Yet
          </h3>
          <p className="text-xs text-temple-warmGrey max-w-sm mx-auto">
            Tap the button above to upload temple sanctum, deity, or festive darshan photos directly from your phone camera or gallery.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className="bg-white rounded-xl border border-temple-stoneBorder overflow-hidden shadow-sm flex flex-col"
            >
              {/* Photo Display */}
              <div className="relative aspect-[4/3] bg-temple-charcoal">
                <Image
                  src={img.imageUrl}
                  alt={img.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/70 text-white text-[11px] px-2 py-0.5 rounded font-mono">
                  #{idx + 1}
                </div>
              </div>

              {/* Photo Information & Actions */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-serif font-bold text-base text-temple-charcoal truncate">
                    {img.title}
                  </h4>
                  {img.caption ? (
                    <p className="text-xs text-temple-warmGrey line-clamp-2 mt-0.5">
                      {img.caption}
                    </p>
                  ) : (
                    <p className="text-xs text-temple-warmGrey/60 italic mt-0.5">
                      No caption added
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-temple-stoneBorder/60 flex items-center justify-between gap-1">
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveImage(idx, "up")}
                      className="p-1.5 rounded hover:bg-temple-sandstone/50 disabled:opacity-30 text-temple-charcoal"
                      title="Move photo earlier"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => moveImage(idx, "down")}
                      className="p-1.5 rounded hover:bg-temple-sandstone/50 disabled:opacity-30 text-temple-charcoal"
                      title="Move photo later"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Edit & Delete Buttons */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingImage(img);
                        setEditTitle(img.title);
                        setEditCaption(img.caption || "");
                      }}
                      className="h-8 px-2 text-xs text-temple-charcoal hover:bg-temple-sandstone/40"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1 text-temple-goldText" />
                      <span>Edit</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmId(img.id)}
                      className="h-8 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog Before Deleting Photo */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-temple-stoneBorder space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-temple-charcoal">
                  Confirm Photo Deletion
                </h3>
                <p className="text-xs text-temple-warmGrey leading-relaxed">
                  Are you sure you want to remove this photo? It will be permanently removed from both the website gallery and cloud storage.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
                className="h-10 px-4 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleDelete(deleteConfirmId)}
                className="h-10 px-4 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Image Details Modal */}
      {editingImage && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-temple-stoneBorder space-y-4">
            <h3 className="font-serif text-lg font-bold text-temple-charcoal">
              Edit Photo Information
            </h3>

            <form onSubmit={handleUpdateDetails} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-temple-warmGrey uppercase">
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-lg border border-temple-stoneBorder focus:ring-2 focus:ring-temple-gold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-temple-warmGrey uppercase">
                  Caption / Description (Optional)
                </label>
                <textarea
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 text-sm rounded-lg border border-temple-stoneBorder focus:ring-2 focus:ring-temple-gold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingImage(null)}
                  className="h-10 px-4 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-10 px-5 text-xs font-semibold bg-temple-charcoal text-white hover:bg-temple-charcoalCard"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
