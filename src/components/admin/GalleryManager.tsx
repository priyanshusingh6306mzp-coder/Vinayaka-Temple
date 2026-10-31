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
  Plus,
  Star,
  Filter,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { compressImageClient } from "@/lib/image-compressor";
import {
  saveGalleryImage,
  deleteGalleryImage,
  reorderGalleryImages,
  updateGalleryImageDetails,
  toggleFeaturedImage,
} from "@/actions/gallery.actions";
import { createEvent } from "@/actions/event.actions";
import { ToastContainer, ToastMessage } from "@/components/admin/Toast";
import { formatDisplayDate } from "@/lib/date-utils";

export interface SerializedGalleryImage {
  id: string;
  imageUrl: string;
  publicId: string;
  title: string;
  caption: string | null;
  sortOrder: number;
  eventId: string | null;
  featured: boolean;
  featuredOrder: number | null;
  event?: { id: string; title: string } | null;
}

export interface SimpleEvent {
  id: string;
  title: string;
  eventDate: string; // YYYY-MM-DD
}

export function GalleryManager({
  initialImages,
  events: initialEvents,
  initialEventId,
}: {
  initialImages: SerializedGalleryImage[];
  events: SimpleEvent[];
  initialEventId?: string;
}) {
  const [images, setImages] = useState<SerializedGalleryImage[]>(initialImages);
  const [events, setEvents] = useState<SimpleEvent[]>(initialEvents);

  // Target event for upload: eventId string, or "" for no event, or "__create_new__"
  const [uploadTargetEventId, setUploadTargetEventId] = useState<string>(initialEventId || "");
  const [showInlineNewEvent, setShowInlineNewEvent] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date())
  );
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  // Filter state: "ALL" | "FEATURED" | "NO_EVENT" | eventId
  const [filterEventId, setFilterEventId] = useState<string>(initialEventId || "ALL");

  // Upload progress state
  const [uploading, setUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");

  // Edit modal state
  const [editingImage, setEditingImage] = useState<SerializedGalleryImage | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editEventId, setEditEventId] = useState<string>("");

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Reorder / action state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const featuredCount = images.filter((img) => img.featured).length;

  // Filtered list of images to display
  const displayedImages = images.filter((img) => {
    if (filterEventId === "ALL") return true;
    if (filterEventId === "FEATURED") return img.featured;
    if (filterEventId === "NO_EVENT") return !img.eventId;
    return img.eventId === filterEventId;
  });

  // Handle Inline Event Creation from Picker
  const handleCreateInlineEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      addToast("error", "Event title is required.");
      return;
    }

    setIsCreatingEvent(true);
    try {
      const res = await createEvent({
        title: newEventTitle.trim(),
        category: "OTHER",
        eventDate: newEventDate,
        published: true,
      });

      if (!res.success || !res.event) {
        addToast("error", res.error || "Failed to create event.");
        return;
      }

      const createdEvent: SimpleEvent = {
        id: res.event.id,
        title: res.event.title,
        eventDate: newEventDate,
      };

      setEvents((prev) => [createdEvent, ...prev]);
      setUploadTargetEventId(res.event.id);
      setShowInlineNewEvent(false);
      setNewEventTitle("");
      addToast("success", `Created and selected event: "${createdEvent.title}"`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating event.";
      addToast("error", msg);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  // Handle Multi-file Upload (Max 20 files per batch)
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 20) {
      addToast("error", "Maximum 20 photos allowed per upload batch. Please select up to 20 files.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    let successCount = 0;

    try {
      // 1. Get signed signature from backend
      const sigRes = await fetch("/api/admin/upload-signature", { method: "POST" });
      if (!sigRes.ok) {
        throw new Error("Cloudinary credentials not configured or session invalid.");
      }
      const { timestamp, signature, cloudName, apiKey, folder } = await sigRes.json();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgressText(`Uploading ${i + 1} of ${files.length}: ${file.name}`);

        // Client-side compression (<1600px, WebP/JPEG)
        const compressedBlob = await compressImageClient(file);

        // Upload to Cloudinary directly
        const formData = new FormData();
        formData.append("file", compressedBlob, file.name);
        formData.append("timestamp", String(timestamp));
        formData.append("signature", signature);
        formData.append("api_key", apiKey);
        formData.append("folder", folder);

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );

        if (!cloudRes.ok) {
          throw new Error(`Failed to upload ${file.name} to Cloudinary.`);
        }

        const cloudData = await cloudRes.json();

        // Save record into database via server action
        const defaultTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        const targetEvent = events.find((ev) => ev.id === uploadTargetEventId);

        const saveRes = await saveGalleryImage({
          imageUrl: cloudData.secure_url,
          publicId: cloudData.public_id,
          title: defaultTitle,
          caption: "",
          sortOrder: images.length + successCount,
          eventId: uploadTargetEventId ? uploadTargetEventId : null,
          featured: false,
        });

        if (saveRes.success && saveRes.image) {
          successCount++;
          const newImg: SerializedGalleryImage = {
            id: saveRes.image.id,
            imageUrl: saveRes.image.imageUrl,
            publicId: saveRes.image.publicId,
            title: saveRes.image.title,
            caption: saveRes.image.caption,
            sortOrder: saveRes.image.sortOrder,
            eventId: saveRes.image.eventId,
            featured: saveRes.image.featured,
            featuredOrder: saveRes.image.featuredOrder,
            event: targetEvent ? { id: targetEvent.id, title: targetEvent.title } : null,
          };
          setImages((prev) => [newImg, ...prev]);
        }
      }

      addToast("success", `Successfully added ${successCount} photo${successCount !== 1 ? "s" : ""} to the gallery!`);
    } catch (err: unknown) {
      console.error("[Upload Error]", err);
      const msg = err instanceof Error ? err.message : "Failed to upload photos.";
      addToast("error", msg);
    } finally {
      setUploading(false);
      setUploadProgressText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Reorder Images within current view
  const moveImage = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= displayedImages.length) return;

    const newDisplayed = [...displayedImages];
    const [moved] = newDisplayed.splice(index, 1);
    newDisplayed.splice(targetIndex, 0, moved);

    // Reassign sortOrder for this group
    const updatedWithOrder = newDisplayed.map((img, idx) => ({ ...img, sortOrder: idx }));

    // Update state optimistically
    const updatedIds = new Set(updatedWithOrder.map((u) => u.id));
    setImages((prev) => [
      ...updatedWithOrder,
      ...prev.filter((img) => !updatedIds.has(img.id)),
    ]);

    try {
      await reorderGalleryImages(updatedWithOrder.map((u) => ({ id: u.id, sortOrder: u.sortOrder })));
      addToast("success", "Photo order updated.");
    } catch {
      setImages(images);
      addToast("error", "Failed to update photo order.");
    }
  };

  // Toggle Featured status on homepage
  const handleToggleFeatured = async (img: SerializedGalleryImage) => {
    const newFeaturedState = !img.featured;

    // Check client limit
    if (newFeaturedState && featuredCount >= 4) {
      addToast("error", "Maximum of 4 featured images allowed on the homepage. Unfeature an image first.");
      return;
    }

    try {
      const res = await toggleFeaturedImage(img.id, newFeaturedState);
      if (res.success && res.updated) {
        setImages((prev) =>
          prev.map((item) =>
            item.id === img.id
              ? {
                  ...item,
                  featured: res.updated.featured,
                  featuredOrder: res.updated.featuredOrder,
                }
              : item
          )
        );
        addToast(
          "success",
          newFeaturedState
            ? `Photo featured on homepage (${featuredCount + 1} of 4).`
            : `Photo removed from homepage (${featuredCount - 1} of 4).`
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle featured status.";
      addToast("error", msg);
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
        addToast("success", "Photo deleted from gallery and Cloudinary storage.");
      }
    } catch {
      setImages(original);
      addToast("error", "Failed to delete photo. Please try again.");
    }
  };

  // Open Edit Modal
  const openEditModal = (img: SerializedGalleryImage) => {
    setEditingImage(img);
    setEditCaption(img.caption || "");
    setEditEventId(img.eventId || "");
  };

  // Save Edit Caption / Move Event
  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage) return;

    try {
      const res = await updateGalleryImageDetails({
        id: editingImage.id,
        caption: editCaption,
        eventId: editEventId || null,
      });

      if (res.success && res.updated) {
        const targetEvent = events.find((ev) => ev.id === editEventId);
        setImages((prev) =>
          prev.map((img) =>
            img.id === editingImage.id
              ? {
                  ...img,
                  caption: editCaption || null,
                  eventId: editEventId || null,
                  event: targetEvent ? { id: targetEvent.id, title: targetEvent.title } : null,
                }
              : img
          )
        );
        setEditingImage(null);
        addToast("success", "Photo details and album updated.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update details.";
      addToast("error", msg);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Upload Section with "Add photos to:" Picker (Requirement 2.2) */}
      <div className="p-5 sm:p-6 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <h2 className="font-serif text-lg font-bold text-temple-charcoal flex items-center gap-2">
              <Upload className="w-5 h-5 text-temple-kumkum" />
              <span>Upload Temple Photographs</span>
            </h2>
            <p className="text-xs text-temple-warmGrey mt-0.5">
              Select multiple photos from your phone or computer (up to 20 per batch, compressed automatically).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-temple-goldText border border-amber-200/60 self-start sm:self-auto">
            <Star className="w-3.5 h-3.5 fill-temple-goldText" />
            <span>{featuredCount} of 4 on the homepage</span>
          </div>
        </div>

        {/* "Add photos to:" Event Picker */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-xs font-bold text-temple-charcoal shrink-0">
              Add photos to:
            </label>
            <div className="flex-1 max-w-md">
              <select
                value={showInlineNewEvent ? "__create_new__" : uploadTargetEventId}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__create_new__") {
                    setShowInlineNewEvent(true);
                  } else {
                    setShowInlineNewEvent(false);
                    setUploadTargetEventId(val);
                  }
                }}
                disabled={uploading}
                className="w-full min-h-[44px] px-3.5 rounded-lg border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-temple-charcoal bg-white"
              >
                <option value="">No event (other photographs)</option>
                <option value="__create_new__">+ Create a new event...</option>
                {events.length > 0 && (
                  <optgroup label="Existing Events (Newest First)">
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.title} ({formatDisplayDate(ev.eventDate)})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* Hidden File Input & Upload Trigger Button */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFilesSelected}
              className="hidden"
            />

            <Button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[44px] px-5 bg-temple-charcoal hover:bg-black text-white font-semibold text-xs shadow-sm inline-flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Choose Photos</span>
                </>
              )}
            </Button>
          </div>

          {/* Inline "Create a new event..." form if selected */}
          {showInlineNewEvent && (
            <form
              onSubmit={handleCreateInlineEvent}
              className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-temple-charcoal">
                  Create New Event for Upload
                </span>
                <button
                  type="button"
                  onClick={() => setShowInlineNewEvent(false)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Event title (e.g. Ganesh Chaturthi Celebrations)"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-temple-charcoal"
                />
                <input
                  type="date"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-temple-charcoal"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInlineNewEvent(false)}
                  className="min-h-[44px] px-3 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreatingEvent}
                  className="min-h-[44px] px-4 bg-temple-kumkum hover:bg-temple-kumkumHover text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  {isCreatingEvent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Create &amp; Select</span>
                </Button>
              </div>
            </form>
          )}

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2.5 text-xs text-temple-charcoal font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-temple-kumkum shrink-0" />
              <span>{uploadProgressText || "Compressing and uploading images..."}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-temple-goldText shrink-0" />
          <span className="text-xs font-bold text-temple-charcoal">Filter photos:</span>
          <select
            value={filterEventId}
            onChange={(e) => setFilterEventId(e.target.value)}
            className="min-h-[40px] px-3 rounded-lg border border-stone-200 text-xs font-medium text-temple-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-temple-charcoal"
          >
            <option value="ALL">All Photos ({images.length})</option>
            <option value="FEATURED">Homepage Featured ({featuredCount} of 4)</option>
            <option value="NO_EVENT">Other photographs (no event)</option>
            {events.length > 0 && (
              <optgroup label="By Event">
                {events.map((ev) => {
                  const count = images.filter((img) => img.eventId === ev.id).length;
                  return (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({count} photo{count !== 1 ? "s" : ""})
                    </option>
                  );
                })}
              </optgroup>
            )}
          </select>
        </div>

        <span className="text-xs text-stone-500 font-medium">
          Showing {displayedImages.length} of {images.length} photo{images.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Photos Grid */}
      {displayedImages.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-stone-200 shadow-sm space-y-2">
          <p className="text-sm font-semibold text-temple-charcoal">No photographs found in this view.</p>
          <p className="text-xs text-temple-warmGrey">
            Upload new photos or switch the filter above to view other albums.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedImages.map((img, index) => (
            <div
              key={img.id}
              className={`rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col justify-between transition-all ${
                img.featured ? "border-amber-300 ring-2 ring-amber-200/50" : "border-stone-200"
              }`}
            >
              {/* Image Preview & Badges */}
              <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
                <Image
                  src={img.imageUrl}
                  alt={img.caption || img.title || "Temple photo"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />

                {/* Homepage Featured Badge */}
                {img.featured && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-temple-charcoal text-white shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>Homepage #{img.featuredOrder ?? 1}</span>
                  </span>
                )}

                {/* Event Name Tag */}
                {img.event ? (
                  <span className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/95 text-temple-charcoal shadow-sm truncate max-w-[80%]">
                    {img.event.title}
                  </span>
                ) : (
                  <span className="absolute bottom-2 left-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-stone-800/80 text-white shadow-sm">
                    Other photos
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-temple-charcoal line-clamp-1">
                    {img.title}
                  </p>
                  {img.caption ? (
                    <p className="text-[11px] text-temple-warmGrey line-clamp-2 mt-0.5 leading-relaxed">
                      {img.caption}
                    </p>
                  ) : (
                    <p className="text-[11px] text-stone-400 italic mt-0.5">
                      No caption
                    </p>
                  )}
                </div>

                {/* Toggle Show on Homepage (Requirement 2.2) */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <label className="text-[11px] font-bold text-temple-charcoal flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={img.featured}
                      onChange={() => handleToggleFeatured(img)}
                      className="rounded border-stone-300 text-temple-kumkum focus:ring-temple-charcoal w-4 h-4 cursor-pointer"
                    />
                    <span>Show on homepage</span>
                  </label>
                </div>

                {/* Reorder and Action Buttons (Minimum 44px tap targets) */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1">
                  {/* Reorder buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveImage(index, "up")}
                      disabled={index === 0}
                      className="min-h-[44px] min-w-[40px] px-2 text-stone-600 hover:bg-stone-50 border-stone-200"
                      title="Move photo earlier"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveImage(index, "down")}
                      disabled={index === displayedImages.length - 1}
                      className="min-h-[44px] min-w-[40px] px-2 text-stone-600 hover:bg-stone-50 border-stone-200"
                      title="Move photo later"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Edit & Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(img)}
                      className="min-h-[44px] px-2.5 text-xs text-stone-700 hover:bg-stone-50 border-stone-200"
                      title="Edit caption and event"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirmId(img.id)}
                      className="min-h-[44px] px-2.5 text-xs text-red-600 hover:bg-red-50 hover:border-red-200 border-stone-200"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Photo Caption & Event Modal */}
      {editingImage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-stone-200 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-temple-charcoal">
                Edit Photo Details
              </h3>
              <button
                type="button"
                onClick={() => setEditingImage(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDetails} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-temple-charcoal block">
                  Caption <span className="text-stone-400 font-normal">(Visible on website)</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={200}
                  value={editCaption}
                  onChange={(e) => setEditCaption(e.target.value)}
                  placeholder="e.g. Sanctum sanctorum decorated for Ganesha Jayanti..."
                  className="w-full p-3 rounded-lg border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-temple-charcoal resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-temple-charcoal block">
                  Attach to Event / Album
                </label>
                <select
                  value={editEventId}
                  onChange={(e) => setEditEventId(e.target.value)}
                  className="w-full min-h-[44px] px-3 rounded-lg border border-stone-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-temple-charcoal bg-white"
                >
                  <option value="">No event (other photographs)</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title} ({formatDisplayDate(ev.eventDate)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingImage(null)}
                  className="min-h-[44px] px-4 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-h-[44px] px-5 bg-temple-charcoal hover:bg-black text-white text-xs font-semibold"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Photo Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-stone-200 shadow-xl">
            <h3 className="font-serif text-lg font-bold text-temple-charcoal">
              Delete Photograph
            </h3>
            <p className="text-xs sm:text-sm text-temple-warmGrey leading-relaxed">
              Are you sure you want to delete this photo? This will permanently remove the photograph from both the website and Cloudinary storage.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                className="min-h-[44px] px-4 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="min-h-[44px] px-5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
