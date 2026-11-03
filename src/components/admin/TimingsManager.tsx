"use client";

import { useState } from "react";
import { Clock, RefreshCw, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormattedDarshanTimings,
  format12Hour,
  formatDarshanTimings,
  DEFAULT_DARSHAN_TIMINGS,
} from "@/lib/darshan-timings";
import {
  saveDarshanTimings,
  resetDarshanTimings,
  TimingFieldErrors,
} from "@/actions/timings.actions";
import { ToastContainer, ToastMessage } from "@/components/admin/Toast";

interface TimingsManagerProps {
  initialTimings: FormattedDarshanTimings;
}

export function TimingsManager({ initialTimings }: TimingsManagerProps) {
  const [morningStart, setMorningStart] = useState(
    initialTimings.raw.morning.start
  );
  const [morningEnd, setMorningEnd] = useState(initialTimings.raw.morning.end);
  const [eveningStart, setEveningStart] = useState(
    initialTimings.raw.evening.start
  );
  const [eveningEnd, setEveningEnd] = useState(initialTimings.raw.evening.end);

  const [fieldErrors, setFieldErrors] = useState<TimingFieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Dynamic live preview formatted from current input values
  const previewMorningStart = format12Hour(morningStart);
  const previewMorningEnd = format12Hour(morningEnd);
  const previewEveningStart = format12Hour(eveningStart);
  const previewEveningEnd = format12Hour(eveningEnd);

  const livePreview = `Morning ${previewMorningStart} – ${previewMorningEnd} · Evening ${previewEveningStart} – ${previewEveningEnd}`;

  const notify = (type: "success" | "error", message: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      message,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const res = await saveDarshanTimings({
        morning: { start: morningStart, end: morningEnd },
        evening: { start: eveningStart, end: eveningEnd },
      });

      if (res.success) {
        notify("success", res.message || "Timings updated successfully.");
      } else {
        if (res.errors) {
          setFieldErrors(res.errors);
        }
        notify("error", res.message || "Unable to save timings.");
      }
    } catch (err: unknown) {
      console.error("[Timings Save Client Error]", err);
      notify("error", "An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    setIsSubmitting(true);
    setShowResetConfirm(false);
    setFieldErrors({});

    try {
      const res = await resetDarshanTimings();
      if (res.success) {
        setMorningStart(DEFAULT_DARSHAN_TIMINGS.morning.start);
        setMorningEnd(DEFAULT_DARSHAN_TIMINGS.morning.end);
        setEveningStart(DEFAULT_DARSHAN_TIMINGS.evening.start);
        setEveningEnd(DEFAULT_DARSHAN_TIMINGS.evening.end);

        notify("success", "Darshan timings reset to default successfully.");
      } else {
        notify("error", res.message || "Failed to reset timings.");
      }
    } catch (err: unknown) {
      console.error("[Timings Reset Client Error]", err);
      notify("error", "An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {toast && (
        <ToastContainer
          toasts={[toast]}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Page Title & Context */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-temple-charcoal flex items-center gap-2.5">
          <Clock className="w-7 h-7 text-temple-kumkum" aria-hidden="true" />
          <span>Darshan &amp; Temple Timings</span>
        </h1>
        <p className="text-sm text-temple-warmGrey mt-1">
          Adjust the daily darshan hours shown across the website. Changes take effect on the live website immediately.
        </p>
      </div>

      {/* Live Preview Card */}
      <div className="p-4 sm:p-5 rounded-xl border border-amber-200/80 bg-amber-50/70 text-temple-charcoal space-y-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-temple-goldText block">
          Public Site Live Preview
        </span>
        <p className="text-sm sm:text-base font-semibold text-temple-charcoal font-serif">
          {livePreview}
        </p>
        <p className="text-xs text-temple-warmGrey">
          This preview reflects what devotees will see in the hero badge, daily darshan card, and website footer.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-8 bg-white border border-stone-200 rounded-xl p-5 sm:p-8 shadow-sm">
        {/* Morning Session Group */}
        <div className="space-y-4">
          <div className="border-b border-stone-200 pb-2">
            <h2 className="text-base font-serif font-bold text-temple-charcoal">
              Morning Darshan Session (प्रातःकालीन दर्शन)
            </h2>
            <p className="text-xs text-temple-warmGrey">
              Set the opening and closing hours for morning prayers and darshan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Morning Opens */}
            <div className="space-y-1.5">
              <label
                htmlFor="morningStart"
                className="block text-xs font-semibold uppercase tracking-wider text-temple-warmGrey"
              >
                Morning Darshan Opens (12-hour: {previewMorningStart})
              </label>
              <input
                id="morningStart"
                type="time"
                value={morningStart}
                onChange={(e) => setMorningStart(e.target.value)}
                required
                className="w-full h-12 px-3.5 rounded-lg border border-stone-300 bg-white text-base text-temple-charcoal focus:outline-none focus:ring-2 focus:ring-temple-charcoal"
              />
              {fieldErrors.morning?.start && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.morning.start}</span>
                </p>
              )}
            </div>

            {/* Morning Closes */}
            <div className="space-y-1.5">
              <label
                htmlFor="morningEnd"
                className="block text-xs font-semibold uppercase tracking-wider text-temple-warmGrey"
              >
                Morning Darshan Closes (12-hour: {previewMorningEnd})
              </label>
              <input
                id="morningEnd"
                type="time"
                value={morningEnd}
                onChange={(e) => setMorningEnd(e.target.value)}
                required
                className="w-full h-12 px-3.5 rounded-lg border border-stone-300 bg-white text-base text-temple-charcoal focus:outline-none focus:ring-2 focus:ring-temple-charcoal"
              />
              {fieldErrors.morning?.end && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.morning.end}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Evening Session Group */}
        <div className="space-y-4">
          <div className="border-b border-stone-200 pb-2">
            <h2 className="text-base font-serif font-bold text-temple-charcoal">
              Evening Darshan Session (सायंकालीन दर्शन)
            </h2>
            <p className="text-xs text-temple-warmGrey">
              Set the opening and closing hours for evening prayers and aarti.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Evening Opens */}
            <div className="space-y-1.5">
              <label
                htmlFor="eveningStart"
                className="block text-xs font-semibold uppercase tracking-wider text-temple-warmGrey"
              >
                Evening Darshan Opens (12-hour: {previewEveningStart})
              </label>
              <input
                id="eveningStart"
                type="time"
                value={eveningStart}
                onChange={(e) => setEveningStart(e.target.value)}
                required
                className="w-full h-12 px-3.5 rounded-lg border border-stone-300 bg-white text-base text-temple-charcoal focus:outline-none focus:ring-2 focus:ring-temple-charcoal"
              />
              {fieldErrors.evening?.start && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.evening.start}</span>
                </p>
              )}
            </div>

            {/* Evening Closes */}
            <div className="space-y-1.5">
              <label
                htmlFor="eveningEnd"
                className="block text-xs font-semibold uppercase tracking-wider text-temple-warmGrey"
              >
                Evening Darshan Closes (12-hour: {previewEveningEnd})
              </label>
              <input
                id="eveningEnd"
                type="time"
                value={eveningEnd}
                onChange={(e) => setEveningEnd(e.target.value)}
                required
                className="w-full h-12 px-3.5 rounded-lg border border-stone-300 bg-white text-base text-temple-charcoal focus:outline-none focus:ring-2 focus:ring-temple-charcoal"
              />
              {fieldErrors.evening?.end && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.evening.end}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto h-12 px-6 bg-temple-kumkum hover:bg-temple-kumkum/90 text-white font-semibold text-sm flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? "Saving..." : "Save Timings"}</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => setShowResetConfirm(true)}
            className="w-full sm:w-auto h-12 px-5 text-sm font-semibold border-stone-300 text-stone-700 hover:bg-stone-100 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 text-stone-500" />
            <span>Reset to Default</span>
          </Button>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-temple-charcoal">
              Reset Darshan Timings?
            </h3>
            <p className="text-sm text-temple-warmGrey leading-relaxed">
              Are you sure you want to reset darshan timings to the default timings ({formatDarshanTimings(DEFAULT_DARSHAN_TIMINGS).summary})? Any custom timings will be removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowResetConfirm(false)}
                className="h-11 px-4 text-sm"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReset}
                disabled={isSubmitting}
                className="h-11 px-4 text-sm bg-red-700 hover:bg-red-800 text-white"
              >
                {isSubmitting ? "Resetting..." : "Yes, Reset Timings"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
