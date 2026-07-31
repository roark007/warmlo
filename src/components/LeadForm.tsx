"use client";

import { useState } from "react";
import { AlertTriangleIcon, CheckIcon } from "./icons";
import { trackEvent } from "@/lib/analytics";

const TCPA_TEXT =
  "I agree to be contacted by Warmlo and its partner contractors by phone, text, or email about my project. Consent is not a condition of purchase.";

interface LeadFormProps {
  jobType: string;
  jobLabel: string;
  quotedPrice?: number;
  zipPrefill?: string;
  variant?: "light" | "dark";
}

export function LeadForm({
  jobType,
  jobLabel,
  quotedPrice,
  zipPrefill = "",
  variant = "light",
}: LeadFormProps) {
  const [name, setName] = useState("");
  const [zip, setZip] = useState(zipPrefill);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [price, setPrice] = useState(quotedPrice?.toString() ?? "");
  const [tcpaConsent, setTcpaConsent] = useState(false);
  const [tcpaError, setTcpaError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    setFieldErrors({});

    if (!tcpaConsent) {
      setTcpaError(true);
      return;
    }
    setTcpaError(false);

    setLoading(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          zip,
          phone,
          email,
          jobType,
          quotedPrice: price ? Number(price) : undefined,
          tcpaConsent: true,
          sourcePage: "/quote-check",
        }),
      });

      const data = (await res.json()) as { error?: string; details?: Record<string, string[]> };

      if (!res.ok) {
        if (data.details) {
          const errs: Record<string, string> = {};
          for (const [key, msgs] of Object.entries(data.details)) {
            errs[key] = msgs[0] ?? "Invalid value";
          }
          setFieldErrors(errs);
        } else {
          setServerError(data.error ?? "Something went wrong. Please try again.");
        }
        return;
      }

      trackEvent("lead_submit");
      setSuccess(true);
    } catch {
      setServerError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isDark = variant === "dark";

  if (success) {
    return (
      <div className="mt-5 rounded-md border border-[rgba(31,157,99,0.28)] bg-[var(--safe-wash)] p-4">
        <div className="flex gap-3">
          <CheckIcon size={20} className="shrink-0 text-safe-solid" />
          <p className="text-base font-semibold text-safe-ink">
            Thanks — we&apos;ll connect you with local pros shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`mt-5 rounded-[16px] border p-5 md:p-6 ${
        isDark
          ? "border-[var(--line-on-dark)] bg-[rgba(239,231,219,0.04)]"
          : "border-[var(--line-on-paper)] bg-paper-2"
      }`}
    >
      <div className="flex flex-col gap-3.5">
        <Field label="Name" error={fieldErrors.name} dark={isDark}>
          <input
            id="lead-name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass(!!fieldErrors.name, isDark)}
          />
        </Field>
        <Field label="ZIP code" error={fieldErrors.zip} dark={isDark}>
          <input
            id="lead-zip"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={5}
            required
            value={zip}
            onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
            className={inputClass(!!fieldErrors.zip, isDark)}
          />
        </Field>
        <Field label="Phone" error={fieldErrors.phone} dark={isDark}>
          <input
            id="lead-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass(!!fieldErrors.phone, isDark)}
          />
        </Field>
        <Field label="Email" error={fieldErrors.email} dark={isDark}>
          <input
            id="lead-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass(!!fieldErrors.email, isDark)}
          />
        </Field>
        <Field label="Job type" dark={isDark}>
          <input
            readOnly
            value={jobLabel}
            className={`h-[52px] w-full rounded-[12px] border px-3.5 text-base ${
              isDark
                ? "border-[var(--line-on-dark)] bg-[rgba(239,231,219,0.06)] text-text-on-dark-3"
                : "border-[var(--line-on-paper)] bg-paper-sink text-text-body"
            }`}
          />
        </Field>
        <Field label="Quoted price (optional)" error={fieldErrors.quotedPrice} dark={isDark}>
          <div className="relative">
            <span
              className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-semibold ${
                isDark ? "text-text-on-dark-4" : "text-text-muted"
              }`}
            >
              $
            </span>
            <input
              id="lead-price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
              className={`${inputClass(!!fieldErrors.quotedPrice, isDark)} pl-8 text-xl font-semibold [font-feature-settings:'tnum']`}
            />
          </div>
        </Field>
      </div>

      <div
        className={`mt-4 flex gap-2.5 rounded-md p-2.5 ${
          tcpaError ? "border-[1.5px] border-emerg-solid" : ""
        }`}
      >
        <input
          id="lead-tcpa"
          type="checkbox"
          checked={tcpaConsent}
          onChange={(e) => {
            setTcpaConsent(e.target.checked);
            if (e.target.checked) setTcpaError(false);
          }}
          className="mt-0.5 h-5 w-5 shrink-0 rounded-sm border-[1.5px] border-[var(--line-on-paper-strong)] accent-ember"
        />
        <label
          htmlFor="lead-tcpa"
          className={`text-[13px] leading-[19px] ${isDark ? "text-text-on-dark-3" : "text-text-body"}`}
        >
          {TCPA_TEXT}
        </label>
      </div>
      {tcpaError && (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-emerg-ink">
          <AlertTriangleIcon size={14} />
          Consent is required to submit.
        </p>
      )}

      {serverError && (
        <div className="mt-4 rounded-md border border-[rgba(224,73,46,0.32)] bg-[var(--emerg-wash)] p-4 text-sm font-medium text-emerg-ink">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        aria-busy={loading}
        className="btn-ember-lg mt-4 w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          "Request my quotes"
        )}
      </button>
      <p className={`mt-2.5 text-center text-micro ${isDark ? "text-text-on-dark-4" : "text-text-muted"}`}>
        We&apos;ll only use this to connect you with local pros.
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
  dark = false,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div>
      <label
        className={`mb-1.5 block text-sm font-semibold ${dark ? "text-text-on-dark" : "text-text-strong"}`}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-emerg-ink">
          <AlertTriangleIcon size={14} />
          {error}
        </p>
      )}
    </div>
  );
}

function inputClass(hasError: boolean, dark: boolean) {
  const base = dark
    ? "h-[52px] w-full rounded-[12px] border px-3.5 text-base text-text-on-dark placeholder:text-text-on-dark-4 focus:border-[rgba(255,122,45,0.7)] focus:outline-none focus:shadow-[var(--focus-ring-dark)] bg-[rgba(239,231,219,0.05)] border-[rgba(239,231,219,0.16)]"
    : "input-light h-[52px]";
  return `${base} ${hasError ? "border-emerg-solid" : ""}`;
}
