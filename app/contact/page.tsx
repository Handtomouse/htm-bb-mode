"use client";
// ============================================
// BB Portfolio Contact Page — Adapted from HTM
// Next.js + TypeScript + BB Theme
// --------------------------------------------
// Features: Quick/Brief modes, file uploads (3x ≤10MB),
// auto-save, validation, timer, accessibility
// ============================================

import React, { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";

type ContactMode = "quick" | "brief";

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// Typo suggestions
const EMAIL_DOMAIN_SUGGESTIONS: Record<string, string> = {
  "gamil.com": "gmail.com",
  "gnail.com": "gmail.com",
  "hotnail.com": "hotmail.com",
  "hotmil.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outllok.com": "outlook.com",
  "yahho.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "icloud.co": "icloud.com",
  "protn.me": "proton.me",
};

// Upload limits
const MAX_FILES = 3;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

type FormErrors = Partial<Record<keyof Payload, string>> & { summary?: string };

type Payload = {
  mode: ContactMode;
  name: string;
  email: string;
  message: string;
  company?: string;
  budget?: string;
  timeline?: string;
  services?: string[];
  referral?: string;
  attachment_url?: string;
  consent: boolean;
  website?: string; // honeypot
  startedAt?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

const BUDGETS = ["<$5k", "$5–15k", "$15–50k", "$50k+", "Not sure"] as const;
const TIMELINES = ["ASAP (this month)", "1–3 months", "3+ months", "Exploring"] as const;
const SERVICES = ["Branding", "Packaging", "Web/Next.js", "Campaign", "Strategy", "Other"] as const;

export default function ContactPage() {
  const formAnchorRef = useRef<HTMLDivElement | null>(null);

  return (
    <main className="min-h-[100svh] bg-[var(--bg)] text-[var(--ink)]">
      {/* Header */}
      <section className="mx-auto max-w-3xl px-4 pt-10 pb-6">
        <h1 className="font-heading text-4xl font-bold tracking-tight uppercase">
          <span className="slash-accent">/</span> CONTACT
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Smart, efficient creative. Sydney-based, global reach.
        </p>
      </section>

      {/* Quick Actions */}
      <section className="mx-auto max-w-3xl px-4">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <a
            href="tel:+61XXXXXXXXX"
            aria-label="Call HandToMouse"
            className="group border border-[var(--grid)] bg-[var(--panel)] p-4 hover:border-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <div className="text-xs text-[var(--muted)]">Call</div>
            <div className="mt-1 text-sm font-medium group-hover:text-[var(--accent)]">
              +61 ••• ••• •••
            </div>
          </a>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText("hello@handtomouse.com")}
            aria-label="Copy email to clipboard"
            className="group border border-[var(--grid)] bg-[var(--panel)] p-4 text-left hover:border-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <div className="text-xs text-[var(--muted)]">Copy Email</div>
            <div className="mt-1 text-sm font-medium group-hover:text-[var(--accent)]">
              hello@handtomouse.com
            </div>
          </button>
          <a
            href="https://instagram.com/handtomouse"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Instagram"
            className="group border border-[var(--grid)] bg-[var(--panel)] p-4 hover:border-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <div className="text-xs text-[var(--muted)]">Instagram</div>
            <div className="mt-1 text-sm font-medium group-hover:text-[var(--accent)]">
              @handtomouse
            </div>
          </a>
          <a
            href="/HTM_CV_or_Capabilities.pdf"
            aria-label="Download CV or Capabilities"
            className="group border border-[var(--grid)] bg-[var(--panel)] p-4 hover:border-[var(--accent)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <div className="text-xs text-[var(--muted)]">Download</div>
            <div className="mt-1 text-sm font-medium group-hover:text-[var(--accent)]">
              CV / Capabilities
            </div>
          </a>
        </div>
      </section>

      {/* Form */}
      <section ref={formAnchorRef} className="mx-auto max-w-3xl px-4 pt-6 pb-16">
        <div className="border border-[var(--grid)] bg-[var(--panel)] p-4 sm:p-6">
          <div className="mb-4">
            <h2 className="font-heading text-lg font-semibold">Let's make something sharp.</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Tell me what you're trying to achieve—budget and timing help me move fast.
            </p>
          </div>
          <ContactFormInternal focusAnchorRef={formAnchorRef} />
        </div>
        <p className="mt-4 text-xs text-[var(--muted)]">
          I usually reply within 1 business day. Sydney (AEST/AEDT).
        </p>
      </section>

      {/* Mobile sticky actions */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--grid)] bg-[var(--bg)]/90 p-2 backdrop-blur supports-[backdrop-filter]:bg-[var(--bg)]/60 md:hidden">
        <div className="mx-auto grid max-w-3xl grid-cols-3 gap-2 px-2">
          <a
            href="tel:+61XXXXXXXXX"
            className="border border-[var(--grid)] bg-[var(--panel)] py-2 text-center text-sm font-medium hover:border-[var(--accent)]"
          >
            Call
          </a>
          <a
            href="mailto:hello@handtomouse.com"
            className="border border-[var(--grid)] bg-[var(--panel)] py-2 text-center text-sm font-medium hover:border-[var(--accent)]"
          >
            Email
          </a>
          <button
            className="border border-[var(--grid)] bg-[var(--panel)] py-2 text-center text-sm font-medium hover:border-[var(--accent)]"
            onClick={() => {
              const anchor = document.querySelector('#contact-form') as HTMLElement | null;
              anchor?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
              (anchor as HTMLElement | null)?.focus?.();
            }}
          >
            Message
          </button>
        </div>
      </div>
    </main>
  );
}

// =============================
// Contact Form Component
// =============================

function ContactFormInternal({
  focusAnchorRef,
}: {
  focusAnchorRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const [mode, setMode] = useState<ContactMode>("quick");
  const [data, setData] = useState<Payload>({
    mode: "quick",
    name: "",
    email: "",
    message: "",
    company: "",
    budget: "",
    timeline: "",
    services: [],
    referral: "",
    attachment_url: "",
    consent: true,
    website: "",
    startedAt: undefined,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; msg: string; id: number } | null>(null);
  const [countdown, setCountdown] = useState(7);
  const [online, setOnline] = useState(true);
  const [cooldown, setCooldown] = useState(0);
  const [savedMsg, setSavedMsg] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [filesError, setFilesError] = useState<string>("");
  const submitAbortRef = useRef<AbortController | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const companyRef = useRef<HTMLInputElement | null>(null);
  const srLiveRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resizeTextArea = () => {
    const el = messageRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const announce = (msg: string) => {
    const el = srLiveRef.current;
    if (!el) return;
    el.textContent = msg;
  };

  const isValidHttpUrl = (value: string) => {
    if (!value) return true;
    try {
      const u = new URL(value);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  // Timer + startedAt + mode from query
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const qMode = (sp.get("mode") as ContactMode | null);
    if (qMode === "brief" || qMode === "quick") setMode(qMode);

    const started = Date.now();
    setData((d) => ({ ...d, startedAt: started }));
    const i = window.setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => window.clearInterval(i);
  }, []);

  // Online status
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // Draft persistence
  const DRAFT_KEY = "bb-contact-draft";
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData((d) => ({ ...d, ...parsed }));
      }
    } catch {}
  }, []);
  useEffect(() => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
        setSavedMsg("Saved");
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.setTimeout(() => setSavedMsg("") , reduce ? 1200 : 600);
      } catch {}
    }, 400);
    return () => { if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current); };
  }, [data]);

  // Leave-page protection
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if ((data.message?.trim()?.length || 0) > 0 && !submitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [data.message, submitting]);

  // UTM capture
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const utm_source = sp.get("utm_source") || undefined;
      const utm_medium = sp.get("utm_medium") || undefined;
      const utm_campaign = sp.get("utm_campaign") || undefined;
      if (utm_source || utm_medium || utm_campaign) {
        setData((d) => ({ ...d, utm_source, utm_medium, utm_campaign }));
        if (!data.referral && utm_source) setData((d) => ({ ...d, referral: utm_source }));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function showToast(type: "success" | "error" | "info", msg: string) {
    const id = Date.now();
    setToast({ type, msg, id });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 4000);
  }

  const computeErrors = (payload: Payload): FormErrors => {
    const e: FormErrors = {};
    const name = payload.name.trim();
    const email = payload.email.trim();
    const message = payload.message.trim();
    if (name.length < 2 || name.length > 80) e.name = "Please enter 2–80 characters.";
    if (!isEmail(email)) e.email = "Enter a valid email.";
    if (message.length < 30) e.message = `Add ${30 - message.length} more characters.`;
    if (payload.attachment_url && !isValidHttpUrl(payload.attachment_url)) e.attachment_url = "Enter a valid URL (http/https).";
    if (payload.website && payload.website.trim() !== "") e.summary = "Spam detected.";
    return e;
  };

  const validateFiles = (list: File[]): string => {
    if (list.length > MAX_FILES) return `Attach up to ${MAX_FILES} files.`;
    for (const f of list) {
      if (f.size > MAX_FILE_SIZE) return `"${f.name}" is over ${MAX_FILE_SIZE_MB}MB.`;
    }
    return "";
  };

  const disabledByTimer = countdown > 0;
  const formValid = useMemo(() => {
    const e = computeErrors(data);
    const fe = validateFiles(files);
    return (
      Object.keys(e).length === 0 && !fe && data.consent && !disabledByTimer && online && !submitting && cooldown === 0
    );
  }, [data, files, disabledByTimer, online, submitting, cooldown]);

  const focusFirstError = (e: FormErrors) => {
    if (e.name) return nameRef.current?.focus();
    if (e.email) return emailRef.current?.focus();
    if (e.message) return messageRef.current?.focus();
    if (e.attachment_url) return (document.getElementById('attachment_url') as HTMLInputElement|null)?.focus();
    if (e.summary && companyRef.current) return companyRef.current.focus();
  };

  const emailSuggestion = useMemo(() => {
    const m = data.email.split("@");
    if (m.length !== 2) return "";
    const domain = m[1].toLowerCase();
    const sug = EMAIL_DOMAIN_SUGGESTIONS[domain];
    return sug ? `${m[0]}@${sug}` : "";
  }, [data.email]);

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();

    const filesErr = validateFiles(files);
    setFilesError(filesErr);
    if (filesErr) {
      showToast("error", filesErr);
      fileInputRef.current?.focus();
      return;
    }

    const trimmed: Payload = {
      ...data,
      name: data.name.trim(),
      email: data.email.trim(),
      message: data.message.trim(),
      referral: data.referral?.trim() || "",
      company: data.company?.trim() || "",
      attachment_url: data.attachment_url?.trim() || "",
      mode,
    };

    const e = computeErrors(trimmed);
    if (Object.keys(e).length > 0 || !trimmed.consent || disabledByTimer || !online) {
      setErrors(e);
      focusFirstError(e);
      showToast("error", e.summary || (online ? "Please fix the highlighted fields." : "You're offline. Submit when back online."));
      announce("Validation errors in form");
      return;
    }

    if (submitAbortRef.current) submitAbortRef.current.abort();
    submitAbortRef.current = new AbortController();

    setSubmitting(true);
    setErrors({});
    announce("Submitting message");

    try {
      let res: Response;
      if (files.length > 0) {
        const form = new FormData();
        form.append("payload", JSON.stringify(trimmed));
        files.forEach((f, i) => form.append(`file${i+1}`, f, f.name));
        res = await fetch("/api/contact", { method: "POST", body: form, signal: submitAbortRef.current.signal });
      } else {
        res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trimmed),
          signal: submitAbortRef.current.signal,
        });
      }

      if (!res.ok) {
        const j = await res.json().catch(() => ({} as any));
        throw new Error(j?.error || `Failed with ${res.status}`);
      }

      (window as any).dataLayer?.push({
        event: "contact_submit",
        mode,
        budget: data.budget || null,
        timeline: data.timeline || null,
        services: data.services || [],
        attachments: files.length,
      });

      // Success confetti animation
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F4A259', '#FF9D23', '#FFB84D', '#FFC266'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#F4A259', '#FF9D23'],
          });
        }, 250);
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#F4A259', '#FF9D23'],
          });
        }, 400);
      }

      showToast("success", "Thanks—got it. I'll reply within 1 business day.");
      announce("Message sent successfully");
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      setData((d) => ({
        ...d,
        name: "",
        email: "",
        message: "",
        company: "",
        budget: "",
        timeline: "",
        services: [],
        referral: "",
        attachment_url: "",
        website: "",
      }));
      setFiles([]);
      nameRef.current?.focus();
      setCooldown(2);
    } catch (err: any) {
      console.error(err);
      showToast("error", err?.message || "Couldn't send just now. Please try again when online.");
      announce("Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      const form = e.currentTarget as HTMLElement;
      (form.querySelector('[data-submit]') as HTMLButtonElement | null)?.click();
      return;
    }
    if (e.key === "Escape" && toast) { setToast(null); return; }
    if (e.altKey && (e.key === "r" || e.key === "R")) {
      e.preventDefault();
      setData((d) => ({ ...d, name: "", email: "", message: "", company: "", budget: "", timeline: "", services: [], referral: "", attachment_url: "" }));
      setFiles([]);
      showToast("info", "Form cleared");
      return;
    }
    if (mode === "brief" && /[1-6]/.test(e.key)) {
      const idx = Number(e.key) - 1;
      const svc = SERVICES[idx];
      if (!svc) return;
      const next = new Set(data.services);
      if (next.has(svc)) next.delete(svc); else next.add(svc);
      setData({ ...data, services: Array.from(next) });
    }
  };

  const onBlurTrim = (k: keyof Payload) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = (e.target.value || "").trim();
    setData((d) => ({ ...d, [k]: v } as Payload));
  };

  const remaining = Math.max(0, 30 - (data.message?.trim().length || 0));
  const goal = 30;
  const progress = Math.min(goal, (data.message?.trim().length || 0));

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dt = e.dataTransfer;
    if (dt.files && dt.files.length) {
      const next = Array.from(dt.files).slice(0, MAX_FILES);
      const all = [...files, ...next].slice(0, MAX_FILES);
      const err = validateFiles(all);
      setFilesError(err);
      if (!err) setFiles(all);
      return;
    }
    const uri = dt.getData("text/uri-list") || dt.getData("text/plain");
    if (uri) setData((d) => ({ ...d, attachment_url: uri }));
  };

  const onPickFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const selected = Array.from(e.target.files || []).slice(0, MAX_FILES);
    const all = [...files, ...selected].slice(0, MAX_FILES);
    const err = validateFiles(all);
    setFilesError(err);
    if (!err) setFiles(all);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) => {
    setFiles((arr) => arr.filter((_, i) => i !== idx));
  };

  return (
    <>
      <div ref={srLiveRef} className="sr-only" role="status" aria-live="assertive" />

      <div className="sr-only" role="status" aria-live="assertive">
        {errors.summary}
      </div>

      {!online && (
        <div className="mb-3 border border-[var(--accent-2)] bg-[var(--accent-2)]/20 p-2 text-xs text-[var(--accent-2)]">
          You're offline. You can keep typing and attach files—submit when back online.
        </div>
      )}

      {savedMsg && (
        <div className="mb-2 text-[11px] text-[var(--muted)]" aria-live="polite">{savedMsg}</div>
      )}

      {toast && (
        <div className="pointer-events-none fixed right-4 top-4 z-50">
          <div
            className={`pointer-events-auto border p-3 text-sm shadow-lg motion-reduce:transition-none ${
              toast.type === "success"
                ? "border-[var(--accent-3)] bg-[var(--accent-3)]/30"
                : toast.type === "error"
                ? "border-[var(--accent-2)] bg-[var(--accent-2)]/30"
                : "border-[var(--grid)] bg-[var(--panel)]/70"
            }`}
            role="status"
            aria-live="polite"
            tabIndex={-1}
          >
            {toast.msg}
          </div>
        </div>
      )}

      {/* Mode toggle */}
      <div className="mb-4 inline-flex overflow-hidden border border-[var(--grid)]" role="tablist" aria-label="Message mode">
        {(["quick", "brief"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-3 py-2 font-mono text-sm font-medium uppercase tracking-wide ${
              mode === m
                ? "bg-[var(--accent)] text-black"
                : "bg-[var(--bg)] text-[var(--ink)] hover:text-[var(--accent)]"
            }`}
            aria-selected={mode === m}
            role="tab"
          >
            {m === "quick" ? "Quick message" : "Project brief"}
          </button>
        ))}
      </div>

      <form
        id="contact-form"
        noValidate
        aria-busy={submitting}
        className="space-y-3"
        onSubmit={onSubmit}
        onKeyDown={onKeyDown}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {/* Honeypot */}
        <div className="sr-only" aria-hidden>
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            autoComplete="off"
            tabIndex={-1}
            value={data.website}
            onChange={(e) => setData({ ...data, website: e.target.value })}
            className="h-0 w-0 opacity-0"
          />
        </div>

        {/* Name + Email */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block font-mono text-xs text-[var(--muted)]">Name*</label>
            <input
              id="name"
              ref={nameRef}
              type="text"
              required
              maxLength={120}
              autoComplete="name"
              inputMode="text"
              aria-invalid={Boolean(errors.name) || undefined}
              aria-describedby={errors.name ? "err-name" : undefined}
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              onBlur={onBlurTrim("name")}
              className={`w-full border px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] ${
                errors.name ? "border-[var(--accent-2)] bg-[var(--accent-2)]/30" : "border-[var(--grid)] bg-[var(--bg)]"
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && formValid) {
                  e.preventDefault();
                  (document.querySelector('[data-submit]') as HTMLButtonElement|null)?.click();
                }
              }}
            />
            {errors.name && (
              <p id="err-name" className="mt-1 text-xs text-[var(--accent-2)]">{errors.name}</p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block font-mono text-xs text-[var(--muted)]">Email*</label>
            <input
              id="email"
              ref={emailRef}
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              maxLength={254}
              aria-invalid={Boolean(errors.email) || undefined}
              aria-describedby={errors.email ? "err-email" : emailSuggestion ? "email-suggestion" : undefined}
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              onBlur={onBlurTrim("email")}
              className={`w-full border px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] ${
                errors.email ? "border-[var(--accent-2)] bg-[var(--accent-2)]/30" : "border-[var(--grid)] bg-[var(--bg)]"
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && formValid) {
                  e.preventDefault();
                  (document.querySelector('[data-submit]') as HTMLButtonElement|null)?.click();
                }
              }}
            />
            {emailSuggestion && !errors.email && (
              <button
                type="button"
                id="email-suggestion"
                className="mt-1 text-[11px] underline decoration-dotted underline-offset-4 text-[var(--muted)] hover:text-[var(--accent)]"
                onClick={() => setData((d) => ({ ...d, email: emailSuggestion }))}
              >
                Did you mean <span className="font-mono">{emailSuggestion}</span>?
              </button>
            )}
            {errors.email && (
              <p id="err-email" className="mt-1 text-xs text-[var(--accent-2)]">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Company (brief) */}
        {mode === "brief" && (
          <div>
            <label htmlFor="company" className="mb-1 block font-mono text-xs text-[var(--muted)]">Company</label>
            <input
              id="company"
              ref={companyRef}
              type="text"
              maxLength={120}
              autoComplete="organization"
              value={data.company}
              onChange={(e) => setData({ ...data, company: e.target.value })}
              onBlur={onBlurTrim("company")}
              className="w-full border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            />
          </div>
        )}

        {/* Message */}
        <div>
          <label htmlFor="message" className="mb-1 block font-mono text-xs text-[var(--muted)]">
            {mode === "quick" ? "Message* (≥ 30 chars)" : "Project summary* (≥ 30 chars)"}
          </label>
          <textarea
            id="message"
            ref={messageRef}
            required
            rows={6}
            maxLength={5000}
            onInput={resizeTextArea}
            aria-invalid={Boolean(errors.message) || undefined}
            aria-describedby={errors.message ? "err-message" : "hint-message"}
            value={data.message}
            onChange={(e) => setData({ ...data, message: e.target.value })}
            onBlur={onBlurTrim("message")}
            className={`w-full border px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] ${
              errors.message ? "border-[var(--accent-2)] bg-[var(--accent-2)]/30" : "border-[var(--grid)] bg-[var(--bg)]"
            }`}
          />
          {!errors.message && (
            <p id="hint-message" className="mt-1 text-xs text-[var(--muted)]">Minimum 30 characters.</p>
          )}
          <div className="mt-1 flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <meter min={0} max={goal} value={progress} className="h-1 w-28"></meter>
            <span className={remaining > 0 ? "text-[var(--muted)]" : "text-[var(--accent-3)]"}>
              {remaining > 0 ? `${remaining} more chars…` : "Good to go"}
            </span>
          </div>
          {errors.message && (
            <p id="err-message" className="mt-1 text-xs text-[var(--accent-2)]">{errors.message}</p>
          )}
        </div>

        {/* Brief-only fields */}
        {mode === "brief" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="budget" className="mb-1 block font-mono text-xs text-[var(--muted)]">Budget (rough)</label>
              <select
                id="budget"
                value={data.budget}
                onChange={(e) => setData({ ...data, budget: e.target.value })}
                className="w-full border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              >
                <option value="">Select…</option>
                {BUDGETS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-[var(--muted)]">A ballpark helps me scope efficiently.</p>
            </div>
            <div>
              <label htmlFor="timeline" className="mb-1 block font-mono text-xs text-[var(--muted)]">Timeline</label>
              <select
                id="timeline"
                value={data.timeline}
                onChange={(e) => setData({ ...data, timeline: e.target.value })}
                className="w-full border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              >
                <option value="">Select…</option>
                {TIMELINES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-[var(--muted)]">Even rough timing keeps us aligned.</p>
            </div>

            <div className="sm:col-span-2">
              <fieldset className="border border-[var(--grid)] p-3">
                <legend className="px-1 font-mono text-xs text-[var(--muted)]">Services</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SERVICES.map((s) => {
                    const checked = data.services?.includes(s) ?? false;
                    return (
                      <label key={s} className="inline-flex cursor-pointer items-center gap-2 font-mono text-sm text-[var(--ink)]">
                        <input
                          type="checkbox"
                          className="h-4 w-4 appearance-none border border-[var(--grid)] bg-[var(--bg)] checked:bg-[var(--accent)]"
                          checked={checked}
                          onChange={(e) => {
                            const next = new Set(data.services);
                            if (e.target.checked) next.add(s); else next.delete(s);
                            setData({ ...data, services: Array.from(next) });
                          }}
                        />
                        <span>{s}</span>
                      </label>
                    );
                  })}
                </div>
                {data.services && data.services.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {data.services.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="border border-[var(--grid)] bg-[var(--bg)] px-2 py-1 font-mono text-[11px] hover:border-[var(--accent)]"
                        aria-label={`Remove ${s}`}
                        onClick={() => setData({ ...data, services: (data.services||[]).filter((x) => x !== s) })}
                      >
                        {s} ×
                      </button>
                    ))}
                  </div>
                )}
              </fieldset>
            </div>

            <div>
              <label htmlFor="referral" className="mb-1 block font-mono text-xs text-[var(--muted)]">How did you hear about HTM?</label>
              <input
                id="referral"
                type="text"
                maxLength={200}
                autoComplete="off"
                value={data.referral}
                onChange={(e) => setData({ ...data, referral: e.target.value })}
                onBlur={onBlurTrim("referral")}
                className="w-full border border-[var(--grid)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)]"
              />
            </div>
            <div>
              <label htmlFor="attachment_url" className="mb-1 block font-mono text-xs text-[var(--muted)]">Attachment link (URL)</label>
              <input
                id="attachment_url"
                type="url"
                placeholder="https://drive.google.com/..."
                maxLength={1000}
                autoComplete="off"
                value={data.attachment_url}
                onChange={(e) => setData({ ...data, attachment_url: e.target.value })}
                onBlur={onBlurTrim("attachment_url")}
                className={`w-full border px-3 py-2 text-sm text-[var(--ink)] outline-none focus:border-[var(--accent)] ${
                  errors.attachment_url ? "border-[var(--accent-2)] bg-[var(--accent-2)]/30" : "border-[var(--grid)] bg-[var(--bg)]"
                }`}
              />
              {errors.attachment_url && (
                <p className="mt-1 text-xs text-[var(--accent-2)]">{errors.attachment_url}</p>
              )}
            </div>
          </div>
        )}

        {/* Attachments (files) */}
        <div>
          <label className="mb-1 block font-mono text-xs text-[var(--muted)]">Attachments (up to {MAX_FILES} files, ≤{MAX_FILE_SIZE_MB}MB each)</label>
          <div className="border border-dashed border-[var(--grid)] bg-[var(--bg)] p-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={onPickFiles}
              accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.svg,.zip,.rar,.7z,.txt,.csv,.doc,.docx,.ppt,.pptx,.key,.pages,.numbers,.ai,.psd,.xd"
              className="block w-full font-mono text-xs text-[var(--muted)] file:mr-3 file:border file:border-[var(--grid)] file:bg-[var(--panel)] file:px-2 file:py-1 file:text-xs file:text-[var(--ink)] hover:file:border-[var(--accent)]"
              aria-describedby="hint-attachments"
            />
            <p id="hint-attachments" className="mt-1 text-[11px] text-[var(--muted)]">Drag & drop files here, or use the picker. You can also paste a link above.</p>
            {filesError && <p className="mt-1 text-xs text-[var(--accent-2)]">{filesError}</p>}
            {files.length > 0 && (
              <ul className="mt-2 space-y-1 font-mono text-xs text-[var(--muted)]">
                {files.map((f, i) => (
                  <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2">
                    <span className="truncate">{f.name} <span className="text-[var(--muted)]">({Math.ceil(f.size/1024)} KB)</span></span>
                    <button type="button" className="border border-[var(--grid)] bg-[var(--panel)] px-2 py-0.5 text-[11px] hover:border-[var(--accent)]" onClick={() => removeFile(i)} aria-label={`Remove ${f.name}`}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Consent */}
        <label className="mt-2 inline-flex items-center gap-2 font-mono text-xs text-[var(--muted)]">
          <input
            type="checkbox"
            checked={data.consent}
            onChange={(e) => setData({ ...data, consent: e.target.checked })}
            className="h-4 w-4 appearance-none border border-[var(--grid)] bg-[var(--bg)] checked:bg-[var(--accent)]"
          />
          I agree to be contacted about this enquiry.
        </label>

        {/* Submit Row */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            data-submit
            type="submit"
            disabled={!formValid}
            className={`inline-flex items-center gap-2 border-3 px-4 py-2 font-mono text-sm font-semibold ${
              formValid
                ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                : "border-[var(--grid)] bg-[var(--panel)] text-[var(--muted)]"
            }`}
          >
            {mode === "quick" ? "Send message" : "Send project brief"}
            {submitting && <span className="animate-pulse">…</span>}
          </button>

          {(disabledByTimer || cooldown>0) && (
            <span className="align-middle font-mono text-xs text-[var(--muted)]">
              {disabledByTimer ? `Submitting enabled in ${countdown}s` : `Ready in ${cooldown}s`}
            </span>
          )}
        </div>
      </form>
    </>
  );
}
