"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  Images,
  Clock,
  AlertTriangle,
  Loader2,
  X,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createEvent, updateEvent, deleteEvent, toggleEventPublished } from "@/actions/event.actions";
import { ToastContainer, ToastMessage } from "@/components/admin/Toast";
import { formatDisplayDate, formatDisplayTime, getRelativeDateChip } from "@/lib/date-utils";
import { EVENT_CATEGORY_LABELS, EventCategoryType } from "@/schemas/events";

export interface SerializedEvent {
  id: string;
  title: string;
  category: EventCategoryType;
  eventDate: string; // "YYYY-MM-DD"
  startTime: string | null;
  description: string | null;
  published: boolean;
  photoCount: number;
}

export function EventsManager({
  initialEvents,
}: {
  initialEvents: SerializedEvent[];
}) {
  const [events, setEvents] = useState<SerializedEvent[]>(initialEvents);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Form modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SerializedEvent | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Form inputs
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EventCategoryType>("FESTIVAL");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});

  // Quick toggle state
  const [togglingEventId, setTogglingEventId] = useState<string | null>(null);

  // Delete modal state
  const [deleteEventTarget, setDeleteEventTarget] = useState<SerializedEvent | null>(null);
  const [deleteOption, setDeleteOption] = useState<"keep_photos" | "delete_photos">("keep_photos");
  const [isDeleting, setIsDeleting] = useState(false);

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const upcomingEvents = events
    .filter((e) => e.eventDate >= todayStr)
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate) || (a.startTime || "").localeCompare(b.startTime || ""));

  const pastEvents = events
    .filter((e) => e.eventDate < todayStr)
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate));

  const displayedEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  const openCreateForm = () => {
    setEditingEvent(null);
    setTitle("");
    setCategory("FESTIVAL");
    setEventDate(todayStr);
    setStartTime("");
    setDescription("");
    setPublished(true);
    setFormErrors({});
    setIsFormOpen(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);
  };

  const openCreateTodayForm = () => {
    setEditingEvent(null);
    setTitle("");
    setCategory("SPECIAL_POOJA");
    setEventDate(todayStr);
    setStartTime("");
    setDescription("");
    setPublished(true);
    setFormErrors({});
    setIsFormOpen(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("quickAdd") === "today") {
        openCreateTodayForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEditForm = (evt: SerializedEvent) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setCategory(evt.category);
    setEventDate(evt.eventDate);
    setStartTime(evt.startTime || "");
    setDescription(evt.description || "");
    setPublished(evt.published);
    setFormErrors({});
    setIsFormOpen(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);
  };

  const handleTogglePublish = async (evt: SerializedEvent) => {
    setTogglingEventId(evt.id);
    try {
      const res = await toggleEventPublished(evt.id);
      if (!res.success) {
        addToast("error", res.error || "Failed to update visibility.");
        return;
      }
      const newStatus = !evt.published;
      setEvents((prev) =>
        prev.map((e) => (e.id === evt.id ? { ...e, published: newStatus } : e))
      );
      addToast(
        "success",
        newStatus
          ? `"${evt.title}" is now visible to visitors.`
          : `"${evt.title}" is now hidden from visitors.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to toggle status";
      addToast("error", msg);
    } finally {
      setTogglingEventId(null);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const payload = {
      title,
      category,
      eventDate,
      startTime: startTime ? startTime : null,
      description: description ? description : null,
      published,
    };

    try {
      if (editingEvent) {
        const res = await updateEvent(editingEvent.id, payload);
        if (!res.success) {
          if (res.fieldErrors) setFormErrors(res.fieldErrors);
          addToast("error", res.error || "Failed to update event.");
          return;
        }

        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === editingEvent.id
              ? {
                  ...ev,
                  ...payload,
                  photoCount: ev.photoCount,
                }
              : ev
          )
        );
        addToast("success", `Updated event "${title}" successfully.`);
      } else {
        const res = await createEvent(payload);
        if (!res.success) {
          if (res.fieldErrors) setFormErrors(res.fieldErrors);
          addToast("error", res.error || "Failed to create event.");
          return;
        }

        const newEv: SerializedEvent = {
          id: res.event!.id,
          title: res.event!.title,
          category: res.event!.category as EventCategoryType,
          eventDate: eventDate,
          startTime: res.event!.startTime,
          description: res.event!.description,
          published: res.event!.published,
          photoCount: 0,
        };

        setEvents((prev) => [...prev, newEv]);
        addToast("success", `Created new event "${title}" successfully.`);
      }

      setIsFormOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      addToast("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteEventTarget) return;
    setIsDeleting(true);

    try {
      const res = await deleteEvent(deleteEventTarget.id, deleteOption);
      if (!res.success) {
        addToast("error", res.error || "Failed to delete event.");
        return;
      }

      setEvents((prev) => prev.filter((e) => e.id !== deleteEventTarget.id));
      if (deleteOption === "keep_photos") {
        addToast("success", `Event deleted. Kept ${deleteEventTarget.photoCount} photos in general gallery.`);
      } else {
        addToast("success", `Event and all ${deleteEventTarget.photoCount} photos deleted.`);
      }
      setDeleteEventTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete event.";
      addToast("error", msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Action Bar & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={activeTab === "upcoming" ? "default" : "outline"}
            onClick={() => setActiveTab("upcoming")}
            className={
              activeTab === "upcoming"
                ? "min-h-[44px] px-4 bg-temple-charcoal text-white hover:bg-black font-semibold text-xs"
                : "min-h-[44px] px-4 border-stone-200 text-temple-charcoal hover:bg-stone-50 font-semibold text-xs"
            }
          >
            <span>Upcoming ({upcomingEvents.length})</span>
          </Button>
          <Button
            type="button"
            variant={activeTab === "past" ? "default" : "outline"}
            onClick={() => setActiveTab("past")}
            className={
              activeTab === "past"
                ? "min-h-[44px] px-4 bg-temple-charcoal text-white hover:bg-black font-semibold text-xs"
                : "min-h-[44px] px-4 border-stone-200 text-temple-charcoal hover:bg-stone-50 font-semibold text-xs"
            }
          >
            <span>Past Events ({pastEvents.length})</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick-Add Today's Event Button for Priest */}
          <Button
            type="button"
            onClick={openCreateTodayForm}
            className="min-h-[44px] px-4 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-sm inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-200" aria-hidden="true" />
            <span>+ Add today&apos;s event</span>
          </Button>

          <Button
            type="button"
            onClick={openCreateForm}
            variant="outline"
            className="min-h-[44px] px-4 border-stone-300 text-temple-charcoal hover:bg-stone-50 font-semibold text-xs sm:text-sm shadow-sm inline-flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add other event</span>
          </Button>
        </div>
      </div>

      {/* Events List */}
      {displayedEvents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-stone-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-temple-goldText">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-temple-charcoal">
            {activeTab === "upcoming" ? "No upcoming events scheduled" : "No past events recorded"}
          </h3>
          <p className="text-xs sm:text-sm text-temple-warmGrey max-w-md mx-auto">
            {activeTab === "upcoming"
              ? "Tap '+ Add today\'s event' or 'Add other event' to post Sankashti Chaturthi, festivals, or special pooja ceremonies."
              : "Past events will appear here automatically after their scheduled date."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedEvents.map((evt) => {
            const isToday = evt.eventDate === todayStr;
            const chip = getRelativeDateChip(evt.eventDate);
            return (
              <div
                key={evt.id}
                className={`p-5 rounded-xl border bg-white shadow-sm flex flex-col justify-between space-y-4 transition-colors ${
                  isToday
                    ? "border-amber-400/80 bg-amber-50/20"
                    : "border-stone-200 hover:border-temple-goldText/40"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-temple-kumkum">
                      {EVENT_CATEGORY_LABELS[evt.category]}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isToday ? (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-700" />
                          <span>Today</span>
                        </span>
                      ) : chip ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-temple-goldText border border-amber-200/60">
                          {chip}
                        </span>
                      ) : null}

                      {/* One-tap quick publish/unpublish toggle */}
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(evt)}
                        disabled={togglingEventId === evt.id}
                        className={`min-h-[30px] px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors border ${
                          evt.published
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                            : "bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200"
                        }`}
                        title={
                          evt.published
                            ? "Click to hide from website visitors"
                            : "Click to publish immediately to website visitors"
                        }
                      >
                        {togglingEventId === evt.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : evt.published ? (
                          <Eye className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-stone-500" />
                        )}
                        <span>
                          {isToday
                            ? evt.published
                              ? "Visible today"
                              : "Hidden today"
                            : evt.published
                            ? "Published"
                            : "Draft"}
                        </span>
                      </button>
                    </div>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-temple-charcoal leading-snug">
                    {evt.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-temple-goldText" />
                      <span>{formatDisplayDate(evt.eventDate)}</span>
                    </span>
                    {evt.startTime && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-temple-goldText" />
                        <span>{formatDisplayTime(evt.startTime)}</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Images className="w-3.5 h-3.5 text-temple-goldText" />
                      <span>{evt.photoCount} photo{evt.photoCount !== 1 ? "s" : ""}</span>
                    </span>
                  </div>

                  {evt.description && (
                    <p className="text-xs text-temple-warmGrey leading-relaxed line-clamp-2 pt-1">
                      {evt.description}
                    </p>
                  )}
                </div>

                {/* Actions & Shortcut */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                  {/* Shortcut: Add photos to this event */}
                  <Button
                    asChild
                    variant="outline"
                    className="min-h-[44px] px-3.5 text-xs font-semibold border-temple-goldText/30 text-temple-goldText hover:bg-amber-50/50"
                  >
                    <Link href={`/admin/gallery?eventId=${evt.id}`}>
                      <Images className="w-4 h-4 mr-1.5" />
                      <span>Add photos</span>
                    </Link>
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openEditForm(evt)}
                      className="min-h-[44px] px-3 text-xs font-medium border-stone-200 text-stone-700 hover:bg-stone-50"
                      title="Edit event details"
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1" />
                      <span>Edit</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDeleteEventTarget(evt);
                        setDeleteOption("keep_photos");
                      }}
                      className="min-h-[44px] px-3 text-xs font-medium border-stone-200 text-red-600 hover:bg-red-50 hover:border-red-200"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Event Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 border border-stone-200 shadow-xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-serif text-xl font-bold text-temple-charcoal">
                {editingEvent ? "Edit Temple Event" : eventDate === todayStr ? "Add Today's Event" : "Add New Temple Event"}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-temple-charcoal block">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  ref={titleInputRef}
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Special Sankashti Abhishekam or Maha Aarti"
                  className="w-full min-h-[44px] px-3.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-temple-charcoal"
                />
                {formErrors.title && (
                  <p className="text-xs text-red-600">{formErrors.title[0]}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label htmlFor="event-category" className="text-xs font-bold text-temple-charcoal block">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="event-category"
                  aria-label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategoryType)}
                  className="w-full min-h-[44px] px-3.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-temple-charcoal bg-white"
                >
                  <option value="SANKASHTI">Sankashti Chaturthi</option>
                  <option value="FESTIVAL">Festival / Utsavam</option>
                  <option value="SPECIAL_POOJA">Special Pooja</option>
                  <option value="OTHER">Other Temple Event</option>
                </select>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-temple-charcoal block">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-temple-charcoal"
                  />
                  {formErrors.eventDate && (
                    <p className="text-xs text-red-600">{formErrors.eventDate[0]}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-temple-charcoal block">
                    Start Time <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-temple-charcoal"
                  />
                  {formErrors.startTime && (
                    <p className="text-xs text-red-600">{formErrors.startTime[0]}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-temple-charcoal">
                    Description <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <span className="text-[11px] text-stone-400">
                    {description.length}/500
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of timings, maha prasadam, sankalpa, or darshan guidelines..."
                  className="w-full p-3 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-temple-charcoal resize-none"
                />
                {formErrors.description && (
                  <p className="text-xs text-red-600">{formErrors.description[0]}</p>
                )}
              </div>

              {/* Published Toggle */}
              <div className="pt-2 flex items-center justify-between p-3 rounded-lg bg-stone-50 border border-stone-200">
                <div>
                  <span className="text-xs font-bold text-temple-charcoal block">
                    Publish on Website
                  </span>
                  <span className="text-[11px] text-temple-warmGrey">
                    Visible immediately to devotees on Schedule page and Homepage
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPublished(!published)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    published ? "bg-emerald-600" : "bg-stone-300"
                  }`}
                  aria-label="Toggle publish"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      published ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  disabled={isSubmitting}
                  className="min-h-[44px] px-4 text-xs font-semibold border-stone-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[44px] px-6 bg-temple-charcoal hover:bg-black text-white font-semibold text-xs shadow-sm inline-flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingEvent ? "Save Changes" : "Create Event"}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Event Confirmation Modal with 2 Choices */}
      {deleteEventTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 border border-stone-200 shadow-xl">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-temple-charcoal">
                  Delete Event
                </h3>
                <p className="text-xs text-stone-500">
                  {deleteEventTarget.title}
                </p>
              </div>
            </div>

            {deleteEventTarget.photoCount > 0 ? (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                  This event currently has <strong>{deleteEventTarget.photoCount} photo{deleteEventTarget.photoCount !== 1 ? "s" : ""}</strong> attached. Please select how you want to handle these photographs:
                </div>

                <div className="space-y-2.5">
                  <label
                    className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                      deleteOption === "keep_photos"
                        ? "border-temple-charcoal bg-stone-50"
                        : "border-stone-200 hover:bg-stone-50/50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="deleteOption"
                        checked={deleteOption === "keep_photos"}
                        onChange={() => setDeleteOption("keep_photos")}
                        className="mt-0.5"
                      />
                      <div>
                        <span className="text-xs font-bold text-temple-charcoal block">
                          Option 1 (Recommended): Delete the event but keep its photos
                        </span>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          The event is removed, but all photos are safely preserved and moved to &quot;Other photographs&quot; in the gallery.
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                      deleteOption === "delete_photos"
                        ? "border-red-600 bg-red-50/40"
                        : "border-stone-200 hover:bg-stone-50/50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="radio"
                        name="deleteOption"
                        checked={deleteOption === "delete_photos"}
                        onChange={() => setDeleteOption("delete_photos")}
                        className="mt-0.5"
                      />
                      <div>
                        <span className="text-xs font-bold text-red-700 block">
                          Option 2: Delete the event and all its photos
                        </span>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          Permanently deletes the event, its photo rows, and all corresponding Cloudinary assets.
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            ) : (
              <p className="text-sm text-stone-600">
                Are you sure you want to delete this event? This action cannot be undone.
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeleteEventTarget(null)}
                className="min-h-[44px] px-4 text-xs font-semibold border-stone-200"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="min-h-[44px] px-5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs shadow-sm inline-flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
