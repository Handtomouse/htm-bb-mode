"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";

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
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.setTimeout(() => setSavedMsg(""), reduce ? 1200 : 600);
      } catch {}
    }, 400);
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [data]);

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
    if (payload.attachment_url && !isValidHttpUrl(payload.attachment_url))
      e.attachment_url = "Enter a valid URL (http/https).";
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
      Object.keys(e).length === 0 &&
      !fe &&
      data.consent &&
      !disabledByTimer &&
      online &&
      !submitting &&
      cooldown === 0
    );
  }, [data, files, disabledByTimer, online, submitting, cooldown]);

  const focusFirstError = (e: FormErrors) => {
    if (e.name) return nameRef.current?.focus();
    if (e.email) return emailRef.current?.focus();
    if (e.message) return messageRef.current?.focus();
    if (e.attachment_url) return (document.getElementById("attachment_url") as HTMLInputElement | null)?.focus();
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
      showToast(
        "error",
        e.summary || (online ? "Please fix the highlighted fields." : "You're offline. Submit when back online.")
      );
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
        files.forEach((f, i) => form.append(`file${i + 1}`, f, f.name));
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
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!prefersReducedMotion) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#F4A259", "#FF9D23", "#FFB84D", "#FFC266"],
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#F4A259", "#FF9D23"],
          });
        }, 250);
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#F4A259", "#FF9D23"],
          });
        }, 400);
      }

      showToast("success", "Thanks—got it. I'll reply within 1 business day.");
      announce("Message sent successfully");
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
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

  // Prevent backspace from navigating back when not in input field
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        const activeElement = document.activeElement as HTMLElement;
        const isInputField =
          activeElement?.tagName === "INPUT" ||
          activeElement?.tagName === "TEXTAREA" ||
          activeElement?.tagName === "SELECT" ||
          activeElement?.isContentEditable;

        if (!isInputField) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, []);

  const onBlurTrim = (k: keyof Payload) => (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = (e.target.value || "").trim();
    setData((d) => ({ ...d, [k]: v } as Payload));
  };

  const remaining = Math.max(0, 30 - (data.message?.trim().length || 0));
  const goal = 30;
  const progress = Math.min(goal, data.message?.trim().length || 0);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
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

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  return (
    <div>
      <h1 className="mb-5 font-mono text-5xl uppercase text-white md:mb-10 md:text-7xl">
        <span style={{ color: ACCENT }}>/</span> CONTACT
      </h1>

      <div ref={srLiveRef} className="sr-only" role="status" aria-live="assertive" />

      <div className="sr-only" role="status" aria-live="assertive">
        {errors.summary}
      </div>

      {!online && (
        <div className="mb-3 border border-red-400 bg-red-400/20 p-2 text-xs text-red-400 md:p-3 md:text-sm">
          You're offline. You can keep typing—submit when back online.
        </div>
      )}

      {savedMsg && (
        <div className="mb-2 text-sm text-white/50" aria-live="polite">
          {savedMsg}
        </div>
      )}

      {toast && (
        <div className="pointer-events-none fixed right-2 top-2 z-50 md:right-4 md:top-4">
          <div
            className={`pointer-events-auto border p-4 text-base shadow-lg md:p-7 md:text-2xl ${
              toast.type === "success"
                ? "border-green-400 bg-green-400/30 text-white"
                : toast.type === "error"
                  ? "border-red-400 bg-red-400/30 text-white"
                  : "border-white/10 bg-black/70 text-white"
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
      <div className="mb-5 grid grid-cols-2 gap-2 md:mb-10 md:gap-3">
        {(["quick", "brief"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-none border-2 px-4 py-4 text-xl font-bold uppercase transition-all md:rounded-sm md:border-3 md:px-6 md:py-7 md:text-3xl ${
              mode === m ? "border-[#FF9D23] bg-[#FF9D23] text-black shadow-xl" : "border-white/40 bg-white/5 text-white hover:border-white/60 hover:bg-white/10 hover:shadow-lg"
            }`}
          >
            {m === "quick" ? "Quick Message" : "Project Brief"}
          </button>
        ))}
      </div>

      <form
        id="contact-form"
        noValidate
        aria-busy={submitting}
        className="space-y-4 md:space-y-7"
        onSubmit={onSubmit}
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-7">
          <div>
            <label htmlFor="name" className="mb-2 block text-base font-semibold tracking-wide text-white/90 md:mb-5 md:text-2xl">
              Name*
            </label>
            <input
              id="name"
              ref={nameRef}
              type="text"
              required
              maxLength={120}
              autoComplete="name"
              aria-invalid={Boolean(errors.name) || undefined}
              aria-describedby={errors.name ? "err-name" : undefined}
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              onBlur={onBlurTrim("name")}
              className={`w-full border bg-black/30 px-4 py-3 text-lg text-white outline-none focus:border-[#FF9D23] focus:ring-1 focus:ring-[#FF9D23]/20 md:border-2 md:px-7 md:py-6 md:text-3xl md:focus:ring-2 ${
                errors.name ? "border-red-400 bg-red-400/20" : "border-white/10"
              }`}
            />
            {errors.name && (
              <p id="err-name" className="mt-1 text-sm text-red-400 md:mt-2 md:text-2xl">
                {errors.name}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-base font-semibold tracking-wide text-white/90 md:mb-5 md:text-2xl">
              Email*
            </label>
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
              className={`w-full border bg-black/30 px-4 py-3 text-lg text-white outline-none focus:border-[#FF9D23] focus:ring-1 focus:ring-[#FF9D23]/20 md:border-2 md:px-7 md:py-6 md:text-3xl md:focus:ring-2 ${
                errors.email ? "border-red-400 bg-red-400/20" : "border-white/10"
              }`}
            />
            {emailSuggestion && !errors.email && (
              <button
                type="button"
                id="email-suggestion"
                className="mt-2 text-sm text-white/50 underline decoration-dotted underline-offset-4 hover:text-[#FF9D23]"
                onClick={() => setData((d) => ({ ...d, email: emailSuggestion }))}
              >
                Did you mean {emailSuggestion}?
              </button>
            )}
            {errors.email && (
              <p id="err-email" className="mt-1 text-sm text-red-400 md:mt-2 md:text-2xl">
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Company (brief) */}
        {mode === "brief" && (
          <div>
            <label htmlFor="company" className="mb-2 block text-base font-semibold tracking-wide text-white/90 md:mb-5 md:text-2xl">
              Company
            </label>
            <input
              id="company"
              ref={companyRef}
              type="text"
              maxLength={120}
              autoComplete="organization"
              value={data.company}
              onChange={(e) => setData({ ...data, company: e.target.value })}
              onBlur={onBlurTrim("company")}
              className="w-full border border-white/10 bg-black/30 px-4 py-3 text-lg text-white outline-none focus:border-[#FF9D23] focus:ring-1 focus:ring-[#FF9D23]/20 md:border-2 md:px-7 md:py-6 md:text-3xl md:focus:ring-2"
            />
          </div>
        )}

        {/* Message */}
        <div>
          <label htmlFor="message" className="mb-2 block text-base font-semibold tracking-wide text-white/90 md:mb-5 md:text-2xl">
            {mode === "quick" ? "What's on your mind?*" : "Tell me about your project*"}
          </label>
          <textarea
            id="message"
            ref={messageRef}
            required
            rows={4}
            maxLength={5000}
            onInput={resizeTextArea}
            aria-invalid={Boolean(errors.message) || undefined}
            aria-describedby={errors.message ? "err-message" : "hint-message"}
            value={data.message}
            onChange={(e) => setData({ ...data, message: e.target.value })}
            onBlur={onBlurTrim("message")}
            className={`w-full border bg-black/30 px-4 py-3 text-lg text-white outline-none focus:border-[#FF9D23] focus:ring-1 focus:ring-[#FF9D23]/20 md:border-2 md:px-7 md:py-6 md:text-3xl md:focus:ring-2 ${
              errors.message ? "border-red-400 bg-red-400/20" : "border-white/10"
            }`}
          />
          {!errors.message && (
            <p id="hint-message" className="mt-2 text-sm text-white/50 md:text-2xl">
              Give me something to work with — 30 characters minimum.
            </p>
          )}
          <div className="mt-2 flex items-center gap-2 text-sm text-white/50 md:gap-4 md:text-2xl">
            <meter min={0} max={goal} value={progress} className="h-3 w-full max-w-56 md:h-5"></meter>
            <span className={remaining > 0 ? "text-white/50" : "text-green-400"}>
              {remaining > 0 ? `${remaining} to go` : "That'll do"}
            </span>
          </div>
          {errors.message && (
            <p id="err-message" className="mt-1 text-sm text-red-400 md:mt-2 md:text-2xl">
              {errors.message}
            </p>
          )}
        </div>

        {/* Brief-only fields */}
        {mode === "brief" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-7">
              <div>
                <label htmlFor="budget" className="mb-2 block text-base font-semibold tracking-wide text-white/90 md:mb-5 md:text-2xl">
                  What's the budget?
                </label>
                <select
                  id="budget"
                  value={data.budget}
                  onChange={(e) => setData({ ...data, budget: e.target.value })}
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-lg text-white outline-none focus:border-[#FF9D23] focus:ring-1 focus:ring-[#FF9D23]/20 md:border-2 md:px-7 md:py-6 md:text-3xl md:focus:ring-2"
                >
                  <option value="" className="text-lg md:text-3xl">Select…</option>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b} className="text-lg md:text-3xl">
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="timeline" className="mb-2 block text-base font-semibold tracking-wide text-white/90 md:mb-5 md:text-2xl">
                  When do you need this?
                </label>
                <select
                  id="timeline"
                  value={data.timeline}
                  onChange={(e) => setData({ ...data, timeline: e.target.value })}
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-lg text-white outline-none focus:border-[#FF9D23] focus:ring-1 focus:ring-[#FF9D23]/20 md:border-2 md:px-7 md:py-6 md:text-3xl md:focus:ring-2"
                >
                  <option value="" className="text-lg md:text-3xl">Select…</option>
                  {TIMELINES.map((t) => (
                    <option key={t} value={t} className="text-lg md:text-3xl">
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <fieldset className="border border-white/10 p-3 md:border-2 md:p-5">
                <legend className="px-2 text-base font-semibold text-white/90 md:px-3 md:text-2xl">Services</legend>
                <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 md:gap-5">
                  {SERVICES.map((s) => {
                    const checked = data.services?.includes(s) ?? false;
                    return (
                      <label key={s} className="inline-flex cursor-pointer items-center gap-2 text-base text-white md:text-2xl">
                        <input
                          type="checkbox"
                          className="h-6 w-6 accent-[#FF9D23] md:h-8 md:w-8"
                          checked={checked}
                          onChange={(e) => {
                            const next = new Set(data.services);
                            if (e.target.checked) next.add(s);
                            else next.delete(s);
                            setData({ ...data, services: Array.from(next) });
                          }}
                        />
                        <span>{s}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </div>

            <div>
              <label htmlFor="referral" className="mb-2 block text-base font-semibold tracking-wide text-white/90 md:mb-5 md:text-2xl">
                How'd you find me?
              </label>
              <input
                id="referral"
                type="text"
                maxLength={200}
                autoComplete="off"
                value={data.referral}
                onChange={(e) => setData({ ...data, referral: e.target.value })}
                onBlur={onBlurTrim("referral")}
                className="w-full border border-white/10 bg-black/30 px-4 py-3 text-lg text-white outline-none focus:border-[#FF9D23] focus:ring-1 focus:ring-[#FF9D23]/20 md:border-2 md:px-7 md:py-6 md:text-3xl md:focus:ring-2"
              />
            </div>
            <div>
              <label htmlFor="attachment_url" className="mb-2 block text-base font-semibold tracking-wide text-white/90 md:mb-5 md:text-2xl">
                Attachment link (URL)
              </label>
              <input
                id="attachment_url"
                type="url"
                placeholder="https://..."
                maxLength={1000}
                autoComplete="off"
                value={data.attachment_url}
                onChange={(e) => setData({ ...data, attachment_url: e.target.value })}
                onBlur={onBlurTrim("attachment_url")}
                className={`w-full border bg-black/30 px-4 py-3 text-lg text-white outline-none focus:border-[#FF9D23] focus:ring-1 focus:ring-[#FF9D23]/20 md:border-2 md:px-7 md:py-6 md:text-3xl md:focus:ring-2 ${
                  errors.attachment_url ? "border-red-400 bg-red-400/20" : "border-white/10"
                }`}
              />
              {errors.attachment_url && <p className="mt-1 text-sm text-red-400 md:mt-2 md:text-2xl">{errors.attachment_url}</p>}
            </div>
          </div>
        )}

        {/* Grid: Attachments + Submit */}
        <div className="mt-8 mb-16 grid grid-cols-1 gap-6 md:mb-24 md:mt-16 md:gap-10 lg:grid-cols-2">
          {/* Attachments */}
          <div>
            <label className="mb-1.5 block text-base font-semibold tracking-wide text-white/90 md:mb-4 md:text-2xl">
              Attachments (up to {MAX_FILES}, ≤{MAX_FILE_SIZE_MB}MB each)
            </label>
            <div className="border border-white/15 bg-black/20 p-3 pb-8 transition-colors hover:border-white/25 md:border-2 md:p-5 md:pb-12">
              <p className="mb-2 pl-3 text-sm text-white/70 md:mb-3 md:pl-4 md:text-xl">
                Drop files here or click to browse — {files.length === 0 ? "No File Chosen" : `${files.length} file${files.length === 1 ? "" : "s"} selected`}
              </p>
              <div className="flex justify-center px-3 py-2 pb-10 md:px-4 md:py-3 md:pb-14">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={onPickFiles}
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.svg,.zip,.rar,.7z,.txt,.csv,.doc,.docx"
                  className="block text-sm text-white/50 file:mr-3 file:cursor-pointer file:rounded-none file:border file:border-[#FF9D23]/50 file:bg-black/70 file:px-12 file:py-3 file:text-sm file:font-bold file:text-white file:transition-all hover:file:border-[#FF9D23] hover:file:bg-[#FF9D23]/20 md:text-xl md:file:rounded-sm md:file:border-2 md:file:px-20 md:file:py-5 md:file:text-xl"
                />
              </div>
              {filesError && <p className="mt-2 text-sm text-red-400 md:mt-3 md:text-2xl">{filesError}</p>}
              {files.length > 0 && (
                <div className="px-3 md:px-4">
                  <ul className="mt-2 space-y-1 text-sm text-white/50 md:mt-3 md:space-y-1.5 md:text-xl">
                    {files.map((f, i) => (
                      <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2">
                        <span className="truncate">
                          {f.name} ({Math.ceil(f.size / 1024)} KB)
                        </span>
                        <button
                          type="button"
                          className="rounded border border-white/10 bg-black/50 px-3 py-1 text-base hover:border-[#FF9D23] md:border-2 md:px-4 md:py-2 md:text-lg"
                          onClick={() => removeFile(i)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div>
            <label className="mb-1.5 block text-base font-semibold tracking-wide text-white/90 md:mb-4 md:text-2xl">
              Fire it off
            </label>
            <div className="border border-white/15 bg-black/20 p-3 pb-8 transition-colors hover:border-white/25 md:border-2 md:p-5 md:pb-12">
              <p className="mb-2 pl-3 text-sm text-white/70 md:mb-3 md:pl-4 md:text-xl">
                {disabledByTimer ? `Ready in ${countdown}s` : cooldown > 0 ? `Wait ${cooldown}s` : "Good to go?"}
              </p>
              <div className="flex justify-center px-3 py-2 pb-10 md:px-4 md:py-3 md:pb-14">
                <button
                  data-submit
                  type="submit"
                  disabled={!formValid}
                  style={{
                    width: "auto",
                    borderRadius: isDesktop ? "0.125rem" : "0",
                    border: isDesktop ? "2px solid rgba(255, 157, 35, 0.5)" : "1px solid rgba(255, 157, 35, 0.5)",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    padding: isDesktop ? "1.25rem 5rem" : "0.75rem 4rem",
                    fontSize: isDesktop ? "1.25rem" : "0.875rem",
                    lineHeight: isDesktop ? "1.75rem" : "1.25rem",
                    fontWeight: "bold",
                    color: "white",
                    cursor: formValid ? "pointer" : "not-allowed",
                    opacity: formValid ? 1 : 0.5,
                  }}
                  onMouseEnter={(e) => {
                    if (formValid) {
                      e.currentTarget.style.border = isDesktop ? "2px solid rgb(255, 157, 35)" : "1px solid rgb(255, 157, 35)";
                      e.currentTarget.style.backgroundColor = "rgba(255, 157, 35, 0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = isDesktop ? "2px solid rgba(255, 157, 35, 0.5)" : "1px solid rgba(255, 157, 35, 0.5)";
                    e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
                  }}
                  className="transition-all"
                >
                  {mode === "quick" ? "SEND →" : "SEND BRIEF →"}
                  {submitting && <span className="animate-pulse">…</span>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Consent */}
        <label className="inline-flex items-center gap-2 text-base text-white/80 md:text-2xl">
          <input
            type="checkbox"
            checked={data.consent}
            onChange={(e) => setData({ ...data, consent: e.target.checked })}
            className="h-6 w-6 accent-[#FF9D23] md:h-8 md:w-8"
          />
          Yeah, you can reply to this.
        </label>
      </form>

      <div className="mt-4 text-center text-sm text-white/50 md:mt-6 md:text-2xl">I'll get back to you within 24 hours (Sydney time)</div>
    </div>
  );
}
