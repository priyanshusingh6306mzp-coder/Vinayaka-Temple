"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, User, Phone, Mail, FileText, CheckCircle2, AlertCircle, Loader2, MessageCircle } from "lucide-react";
import { poojaRequestSchema, PoojaRequestInput } from "@/schemas/poojaRequest.schema";
import { submitPoojaRequest } from "@/actions/pooja.actions";
import { SITE_CONFIG } from "@/content/site";
import {
  templeDisplayPhone,
  templeTelHref,
  templeWhatsAppLink,
  COUNTRY_CODE_PREFIX,
} from "@/lib/phone";
import { Button } from "@/components/ui/button";
import { SectionDivider } from "./SectionDivider";

interface PoojaRequestFormProps {
  isStandalonePage?: boolean;
}

export function PoojaRequestForm({ isStandalonePage = true }: PoojaRequestFormProps) {
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Today's date in YYYY-MM-DD format for native min date attribute
  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PoojaRequestInput>({
    resolver: zodResolver(poojaRequestSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      poojaType: SITE_CONFIG.poojaTypes[0]?.name || "Sankashti Ganapathi Homam / Pooja",
      dateRequested: todayStr,
      notes: "",
      honeypot: "",
    },
  });

  const onSubmit = async (data: PoojaRequestInput) => {
    setIsSubmitting(true);
    setServerError(null);
    setServerSuccess(null);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("phone", data.phone);
    if (data.email) formData.append("email", data.email);
    formData.append("poojaType", data.poojaType);
    formData.append("dateRequested", data.dateRequested);
    if (data.notes) formData.append("notes", data.notes);
    if (data.honeypot) formData.append("honeypot", data.honeypot);

    try {
      const result = await submitPoojaRequest(null, formData);

      if (result.success) {
        setServerSuccess(
          result.message ||
            "Dhanyawad. Your pooja request has been received. The temple will contact you to confirm the pooja and date."
        );
        reset();
      } else {
        console.error("[Pooja Submission Failed]:", result.message);
        setServerError(
          result.message || "Unable to submit your request. Please check the form errors."
        );
      }
    } catch (err: unknown) {
      console.error("[Pooja Submission Network Error]:", err);
      setServerError(
        templeDisplayPhone ? `An unexpected network error occurred. Please call the temple directly at ${templeDisplayPhone}.` : "An unexpected network error occurred. Please try submitting again in a few moments."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="pooja-form" className="py-14 sm:py-20 md:py-24 px-4 bg-temple-ivory text-temple-charcoal">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-2">
          <p className="text-xs uppercase font-semibold tracking-widest text-temple-goldText block">
            Devotional Offerings
          </p>
          {isStandalonePage ? (
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-temple-charcoal">
              Request a Pooja
            </h1>
          ) : (
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-temple-charcoal">
              Request a Pooja
            </h2>
          )}
          <SectionDivider />
          <p className="text-sm sm:text-base text-temple-warmGrey max-w-xl mx-auto">
            To reach the temple, send a request here. The temple will contact you on the mobile number you enter.
          </p>
        </div>

        {/* Server Success Alert */}
        {serverSuccess && (
          <div className="p-6 rounded-xl bg-green-50 border border-green-200 text-green-900 space-y-3 animate-in fade-in">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-serif text-lg font-bold">Request Received Successfully</h3>
                <p className="text-sm mt-1 leading-relaxed text-green-800">{serverSuccess}</p>
              </div>
            </div>
            {templeTelHref && templeDisplayPhone && (
              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={templeTelHref}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-green-100 hover:bg-green-200 text-green-900 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Temple: {templeDisplayPhone}</span>
                </a>
                {templeWhatsAppLink && (
                  <a
                    href={templeWhatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-green-700 hover:bg-green-800 text-white transition-colors"
                  >
                    <span>WhatsApp Temple</span>
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{serverError}</p>
          </div>
        )}

        {/* Accessible Devotee Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="p-6 sm:p-10 rounded-2xl border border-stone-200 bg-white shadow-sm space-y-6"
        >
          {/* Honeypot anti-spam field */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="website">Website Address</label>
            <input
              id="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...register("honeypot")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Devotee Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-temple-warmGrey flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-temple-goldText" />
                <span>Devotee Full Name *</span>
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Ramesh Kumar Sharma"
                aria-required="true"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                className="w-full px-3.5 py-3 rounded-lg border border-stone-500/80 bg-white text-sm text-temple-charcoal placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-stone-700 transition-colors"
                {...register("name")}
              />
              {errors.name && (
                <p id="name-error" className="text-xs text-red-600 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Mobile Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-temple-warmGrey flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-temple-goldText" />
                <span>Mobile Number (10 digits) *</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-temple-warmGrey select-none">
                  {COUNTRY_CODE_PREFIX}
                </span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="98765 43210"
                  maxLength={10}
                  aria-required="true"
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  className="w-full pl-12 pr-3.5 py-3 rounded-lg border border-stone-500/80 bg-white text-sm text-temple-charcoal placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-stone-700 transition-colors"
                  {...register("phone")}
                />
              </div>
              {errors.phone && (
                <p id="phone-error" className="text-xs text-red-600 font-medium">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Email Address (Optional) */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-temple-warmGrey flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-temple-goldText" />
                <span>Email Address (Optional)</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                className="w-full px-3.5 py-3 rounded-lg border border-stone-500/80 bg-white text-sm text-temple-charcoal placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-stone-700 transition-colors"
                {...register("email")}
              />
              {errors.email && (
                <p id="email-error" className="text-xs text-red-600 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Preferred Date */}
            <div className="space-y-1.5">
              <label htmlFor="dateRequested" className="text-xs font-semibold uppercase tracking-wider text-temple-warmGrey flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-temple-goldText" />
                <span>Preferred Date *</span>
              </label>
              <input
                id="dateRequested"
                type="date"
                min={todayStr}
                aria-required="true"
                aria-invalid={!!errors.dateRequested}
                aria-describedby={errors.dateRequested ? "date-error" : undefined}
                className="w-full px-3.5 py-3 rounded-lg border border-stone-500/80 bg-white text-sm text-temple-charcoal focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-stone-700 transition-colors"
                {...register("dateRequested")}
              />
              {errors.dateRequested && (
                <p id="date-error" className="text-xs text-red-600 font-medium">
                  {errors.dateRequested.message}
                </p>
              )}
            </div>
          </div>

          {/* Pooja Type Selection */}
          <div className="space-y-1.5">
            <label htmlFor="poojaType" className="text-xs font-semibold uppercase tracking-wider text-temple-warmGrey flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-temple-goldText" />
              <span>Select Pooja / Homam Offering *</span>
            </label>
            <select
              id="poojaType"
              aria-required="true"
              aria-invalid={!!errors.poojaType}
              aria-describedby={errors.poojaType ? "poojaType-error" : undefined}
              className="w-full px-3.5 py-3 rounded-lg border border-stone-500/80 bg-white text-sm text-temple-charcoal focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-stone-700 transition-colors"
              {...register("poojaType")}
            >
              {SITE_CONFIG.poojaTypes.map((pt) => (
                <option key={pt.id} value={pt.name}>
                  {pt.name} ({pt.nameHindi}) — Approx. {pt.durationApprox}
                </option>
              ))}
            </select>
            {errors.poojaType && (
              <p id="poojaType-error" className="text-xs text-red-600 font-medium">
                {errors.poojaType.message}
              </p>
            )}

            {/* Clearly visible note that temple confirms pooja and date */}
            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 text-xs text-temple-charcoal flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-temple-kumkum shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                The temple will contact you to confirm the pooja and date.
              </p>
            </div>
          </div>

          {/* Optional Notes / Sankalpa */}
          <div className="space-y-1.5">
            <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-temple-warmGrey">
              Sankalpa / Gotra / Special Prayers (Optional)
            </label>
            <textarea
              id="notes"
              rows={3}
              placeholder="e.g. Specific family gotra, occasion (birthday/anniversary), or special prayer request..."
              maxLength={500}
              aria-invalid={!!errors.notes}
              aria-describedby={errors.notes ? "notes-error" : undefined}
              className="w-full px-3.5 py-2.5 rounded-lg border border-stone-500/80 bg-white text-sm text-temple-charcoal placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-stone-700 transition-colors resize-y"
              {...register("notes")}
            />
            {errors.notes && (
              <p id="notes-error" className="text-xs text-red-600 font-medium">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Submit Button & WhatsApp Action */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              variant="default"
              className={`h-12 text-base font-bold shadow-md hover:shadow-lg bg-temple-kumkum hover:bg-temple-kumkum/90 text-white focus-visible:ring-2 focus-visible:ring-stone-700 ${templeWhatsAppLink ? "w-full sm:flex-1" : "w-full"}`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting Pooja Request...</span>
                </span>
              ) : (
                <span>Submit Pooja Request</span>
              )}
            </Button>

            {templeWhatsAppLink && (
              <Button
                asChild
                type="button"
                variant="outline"
                className="w-full sm:w-auto h-12 px-5 text-sm font-semibold border border-temple-charcoal hover:bg-stone-100 text-temple-charcoal focus-visible:ring-2 focus-visible:ring-stone-700"
              >
                <a
                  href={templeWhatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-800" aria-hidden="true" />
                  <span>Message on WhatsApp</span>
                </a>
              </Button>
            )}
          </div>

          <p className="text-xs text-center text-temple-warmGrey">
            No advance online payment required. Offerings and dakshina are settled in person at the temple.
          </p>
        </form>
      </div>
    </section>
  );
}

