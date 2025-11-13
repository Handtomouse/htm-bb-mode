"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import BBPageHeader from "./BBPageHeader";

const ACCENT = "#FF9D23";

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

export default function BlackberryContactContent() {
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

  // Timer + startedAt
  useEffect(() => {
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
    <div className="w-full h-full overflow-y-auto px-6 md:px-8 py-6">
      <BBPageHeader title="CONTACT" subtitle="Let's make something sharp" />

      <div ref={srLiveRef} className="sr-only" role="status" aria-live="assertive" />

      <div className="sr-only" role="status" aria-live="assertive">
        {errors.summary}
      </div>

      {!online && (
        <div className="mb-4 border border-red-400 bg-red-400/20 p-3 text-sm text-red-400">
          You're offline. You can keep typing—submit when back online.
        </div>
      )}

      {savedMsg && (
        <div className="mb-3 text-xs text-white/50" aria-live="polite">{savedMsg}</div>
      )}

      {toast && (
        <div className="pointer-events-none fixed right-4 top-4 z-50">
          <div
            className={`pointer-events-auto border p-3 text-sm shadow-lg ${
              toast.type === "success"
                ? "border-green-400 bg-green-400/20 text-green-400"
                : toast.type === "error"
                ? "border-red-400 bg-red-400/20 text-red-400"
                : "border-white/20 bg-white/10 text-white"
            }`}
            role="status"
            aria-live="polite"
          >
            {toast.msg}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <a
          href="tel:+61XXXXXXXXX"
          className="group relative border border-white/5 bg-[#131313] p-4 hover:border-[#ff9d23] transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-[#ff9d23] overflow-hidden hover:scale-[1.02]"
          style={{ transition: 'all 0.5s ease' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 20px #ff9d2330';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div className="absolute top-0 left-0 w-1 h-1 bg-white/20 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500" aria-hidden="true" />
          <div className="absolute top-0 right-0 w-1 h-1 bg-white/20 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-1 h-1 bg-white/20 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 w-1 h-1 bg-white/20 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500" aria-hidden="true" />
          <div className="text-xs text-white/65 uppercase tracking-wider">Call</div>
          <div className="mt-1 text-sm font-medium group-hover:text-[#ff9d23] transition-colors duration-500">
            +61 ••• •••
          </div>
        </a>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText("hello@handtomouse.com")}
          className="group relative border border-white/5 bg-[#131313] p-4 text-left hover:border-[#ff9d23] transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-[#ff9d23] overflow-hidden hover:scale-[1.02]"
          style={{ transition: 'all 0.5s ease' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 20px #ff9d2330';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div className="absolute top-0 left-0 w-1 h-1 bg-white/20 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500" aria-hidden="true" />
          <div className="absolute top-0 right-0 w-1 h-1 bg-white/20 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500" aria-hidden="true" />
          <div className="absolute bottom-0 left-0 w-1 h-1 bg-white/20 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 w-1 h-1 bg-white/20 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500" aria-hidden="true" />
          <div className="text-xs text-white/65 uppercase tracking-wider">Copy Email</div>
          <div className="mt-1 text-sm font-medium group-hover:text-[#ff9d23] transition-colors duration-500 truncate">
            hello@htm.com
          </div>
        </button>
      </div>

      {/* Form Container */}
      <div
        className="relative border border-white/5 bg-[#0a0a0a] p-8 sm:p-12 mb-6"
        style={{
          boxShadow: '0 0 20px #ff9d2310'
        }}
      >
        {/* Mode toggle */}
        <div className="mb-6 inline-flex overflow-hidden border border-white/10" role="tablist">
          {(["quick", "brief"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-6 py-3 font-mono text-sm font-medium uppercase tracking-wider transition-all duration-500 ${
                mode === m
                  ? "bg-[#ff9d23] text-black"
                  : "bg-[#0b0b0b] text-white hover:text-[#ff9d23]"
              }`}
              style={mode === m ? { boxShadow: '0 0 20px #ff9d2360' } : {}}
              role="tab"
            >
              {m === "quick" ? "Quick" : "Brief"}
            </button>
          ))}
        </div>

        <form
          noValidate
          className="space-y-5"
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          {/* Honeypot */}
          <div className="sr-only" aria-hidden>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block font-mono text-xs text-white/65 uppercase tracking-wider">Name*</label>
              <input
                id="name"
                ref={nameRef}
                type="text"
                required
                maxLength={120}
                autoComplete="name"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                onBlur={onBlurTrim("name")}
                className={`w-full border px-4 py-3 text-sm text-white outline-none transition-all duration-500 ${
                  errors.name
                    ? "border-red-400 bg-red-400/20 animate-pulse"
                    : "border-white/10 bg-[#0b0b0b] focus:ring-2 focus:ring-[#ff9d23] focus:border-transparent"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-400">{errors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block font-mono text-xs text-white/65 uppercase tracking-wider">Email*</label>
              <input
                id="email"
                ref={emailRef}
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                onBlur={onBlurTrim("email")}
                className={`w-full border px-4 py-3 text-sm text-white outline-none transition-all duration-500 ${
                  errors.email
                    ? "border-red-400 bg-red-400/20 animate-pulse"
                    : "border-white/10 bg-[#0b0b0b] focus:ring-2 focus:ring-[#ff9d23] focus:border-transparent"
                }`}
              />
              {emailSuggestion && !errors.email && (
                <button
                  type="button"
                  className="mt-1 text-xs underline text-white/65 hover:text-[#ff9d23]"
                  onClick={() => setData((d) => ({ ...d, email: emailSuggestion }))}
                >
                  Did you mean {emailSuggestion}?
                </button>
              )}
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Company (brief) */}
          {mode === "brief" && (
            <div>
              <label htmlFor="company" className="mb-2 block font-mono text-xs text-white/65 uppercase tracking-wider">Company</label>
              <input
                id="company"
                ref={companyRef}
                type="text"
                maxLength={120}
                value={data.company}
                onChange={(e) => setData({ ...data, company: e.target.value })}
                onBlur={onBlurTrim("company")}
                className="w-full border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none transition-all duration-500 focus:ring-2 focus:ring-[#ff9d23] focus:border-transparent"
              />
            </div>
          )}

          {/* Message */}
          <div>
            <label htmlFor="message" className="mb-2 block font-mono text-xs text-white/65 uppercase tracking-wider">
              {mode === "quick" ? "Message* (≥ 30 chars)" : "Brief* (≥ 30 chars)"}
            </label>
            <textarea
              id="message"
              ref={messageRef}
              required
              rows={6}
              maxLength={5000}
              onInput={resizeTextArea}
              value={data.message}
              onChange={(e) => setData({ ...data, message: e.target.value })}
              onBlur={onBlurTrim("message")}
              className={`w-full border px-4 py-3 text-sm text-white leading-relaxed outline-none transition-all duration-500 ${
                errors.message
                  ? "border-red-400 bg-red-400/20 animate-pulse"
                  : "border-white/10 bg-[#0b0b0b] focus:ring-2 focus:ring-[#ff9d23] focus:border-transparent"
              }`}
            />
            {!errors.message && (
              <p className="mt-1 text-xs text-white/65">Minimum 30 characters.</p>
            )}
            <div className="mt-1 flex items-center gap-2 text-xs text-white/65">
              <meter min={0} max={goal} value={progress} className="h-1 w-24"></meter>
              <span className={remaining > 0 ? "text-white/65" : "text-green-400"}>
                {remaining > 0 ? `${remaining} more` : "Good"}
              </span>
            </div>
            {errors.message && (
              <p className="mt-1 text-xs text-red-400">{errors.message}</p>
            )}
          </div>

          {/* Brief-only fields */}
          {mode === "brief" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="budget" className="mb-2 block font-mono text-xs text-white/65 uppercase tracking-wider">Budget</label>
                  <select
                    id="budget"
                    value={data.budget}
                    onChange={(e) => setData({ ...data, budget: e.target.value })}
                    className="w-full border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none transition-all duration-500 focus:ring-2 focus:ring-[#ff9d23] focus:border-transparent"
                  >
                    <option value="">Select…</option>
                    {BUDGETS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="timeline" className="mb-2 block font-mono text-xs text-white/65 uppercase tracking-wider">Timeline</label>
                  <select
                    id="timeline"
                    value={data.timeline}
                    onChange={(e) => setData({ ...data, timeline: e.target.value })}
                    className="w-full border border-white/10 bg-[#0b0b0b] px-4 py-3 text-sm text-white outline-none transition-all duration-500 focus:ring-2 focus:ring-[#ff9d23] focus:border-transparent"
                  >
                    <option value="">Select…</option>
                    {TIMELINES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <fieldset className="border border-white/10 p-4">
                <legend className="px-2 font-mono text-xs text-white/65 uppercase tracking-wider">Services</legend>
                <div className="grid grid-cols-2 gap-3">
                  {SERVICES.map((s) => {
                    const checked = data.services?.includes(s) ?? false;
                    return (
                      <label key={s} className="inline-flex cursor-pointer items-center gap-2 font-mono text-xs text-white hover:text-white/90 transition-colors duration-500">
                        <input
                          type="checkbox"
                          className="h-4 w-4 appearance-none border border-white/10 bg-[#0b0b0b] checked:bg-[#ff9d23] transition-all duration-500"
                          checked={checked}
                          onChange={(e) => {
                            const next = new Set(data.services);
                            if (e.target.checked) next.add(s); else next.delete(s);
                            setData({ ...data, services: Array.from(next) });
                          }}
                        />
                        <span className="text-xs">{s}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          )}

          {/* Files */}
          <div>
            <label className="mb-2 block font-mono text-xs text-white/65 uppercase tracking-wider">Files (up to {MAX_FILES}, ≤{MAX_FILE_SIZE_MB}MB)</label>
            <div className="border border-dashed border-white/10 bg-[#0b0b0b] p-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={onPickFiles}
                accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.svg,.zip"
                className="block w-full font-mono text-xs text-white/65 file:mr-3 file:border file:border-white/10 file:bg-[#131313] file:px-3 file:py-2 file:text-xs file:text-white hover:file:border-[#ff9d23]"
              />
              <p className="mt-2 text-xs text-white/65">Drag & drop files here</p>
              {filesError && <p className="mt-1 text-xs text-red-400">{filesError}</p>}
              {files.length > 0 && (
                <ul className="mt-3 space-y-2 font-mono text-xs text-white/65">
                  {files.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2">
                      <span className="truncate">{f.name}</span>
                      <button
                        type="button"
                        className="border border-white/10 bg-[#131313] px-2 py-1 text-xs hover:border-[#ff9d23] hover:text-[#ff9d23]"
                        onClick={() => removeFile(i)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Consent */}
          <label className="inline-flex items-center gap-2 font-mono text-xs text-white/65 cursor-pointer">
            <input
              type="checkbox"
              checked={data.consent}
              onChange={(e) => setData({ ...data, consent: e.target.checked })}
              className="h-4 w-4 appearance-none border border-white/10 bg-[#0b0b0b] checked:bg-[#ff9d23] transition-all duration-500"
            />
            I agree to be contacted
          </label>

          {/* Submit */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              data-submit
              type="submit"
              disabled={!formValid}
              className={`inline-flex items-center gap-2 px-8 py-3 font-mono text-sm font-semibold uppercase tracking-wider transition-all duration-500 ${
                formValid
                  ? "border border-[#ff9d23] bg-[#ff9d23] text-black hover:scale-[1.02]"
                  : "border border-white/10 bg-[#131313] text-white/40 cursor-not-allowed"
              }`}
              style={formValid ? { boxShadow: '0 0 30px #ff9d2360' } : {}}
              onMouseEnter={(e) => {
                if (formValid) {
                  e.currentTarget.style.boxShadow = '0 0 40px #ff9d2380';
                }
              }}
              onMouseLeave={(e) => {
                if (formValid) {
                  e.currentTarget.style.boxShadow = '0 0 30px #ff9d2360';
                }
              }}
            >
              {mode === "quick" ? "Send" : "Send Brief"}
              {submitting && <span className="animate-pulse">…</span>}
            </button>

            {(disabledByTimer || cooldown>0) && (
              <span className="text-xs text-white/65">
                {disabledByTimer ? `Ready in ${countdown}s` : `Wait ${cooldown}s`}
              </span>
            )}
          </div>
        </form>
      </div>

      <p className="text-xs text-white/65 text-center">
        Usually reply within 1 business day. Sydney (AEST/AEDT).
      </p>
    </div>
  );
}
