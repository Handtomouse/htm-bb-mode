"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import BBPageHeader from "./BBPageHeader";
import { useSettings, useClickSound, useHapticFeedback } from "@/lib/hooks";
import {
  isDisposableEmail,
  getTemplateByKeyword,
  getCharacterWarningLevel,
  formatTimeAgo,
  getFileTypeIcon,
  formatFileSize,
  KEYBOARD_SHORTCUTS,
  getCompletionSummary,
} from "@/lib/formUtils";
import {
  ACCENT,
  isEmail,
  EMAIL_DOMAIN_SUGGESTIONS,
  MAX_FILES,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE,
  BUDGETS,
  TIMELINES,
  SERVICES,
} from "@/lib/contactFormData";

type ContactMode = "quick" | "brief";

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

export default function BlackberryContactContent() {
  // Improvement #8: Settings integration
  const [settings] = useSettings();
  const playClickSound = useClickSound(settings.sound);
  const triggerHaptic = useHapticFeedback();

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
  const [submitSuccess, setSubmitSuccess] = useState(false); // Improvement #20
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; msg: string; id: number } | null>(null);
  const [countdown, setCountdown] = useState(7);
  const [online, setOnline] = useState(true);
  const [cooldown, setCooldown] = useState(0);
  const [savedMsg, setSavedMsg] = useState<string>("");
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null); // Improvement #9
  const [files, setFiles] = useState<File[]>([]);
  const [filesError, setFilesError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false); // Improvement #5
  const [copiedEmail, setCopiedEmail] = useState(false); // Improvement #3
  const [showShortcuts, setShowShortcuts] = useState(false); // Improvement #13
  const submitAbortRef = useRef<AbortController | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const lastSavedIntervalRef = useRef<number | null>(null);

  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const messageRef = useRef<HTMLTextAreaElement | null>(null);
  const companyRef = useRef<HTMLInputElement | null>(null);
  const budgetRef = useRef<HTMLSelectElement | null>(null); // Improvement #2
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

  // Draft persistence with Improvement #9: timestamp tracking
  const DRAFT_KEY = "bb-contact-draft";
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData((d) => ({ ...d, ...parsed }));
        setLastSavedTime(Date.now());
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
        const now = Date.now();
        setLastSavedTime(now);
        setSavedMsg("Saved");
        const reduce = settings.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.setTimeout(() => setSavedMsg("") , reduce ? 1200 : 600);
      } catch {}
    }, 400);
    return () => { if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current); };
  }, [data, settings.reducedMotion]);

  // Improvement #9: Update "last saved" indicator every 5 seconds
  useEffect(() => {
    if (lastSavedIntervalRef.current) window.clearInterval(lastSavedIntervalRef.current);
    if (lastSavedTime) {
      lastSavedIntervalRef.current = window.setInterval(() => {
        setLastSavedTime((prev) => prev); // Trigger re-render for formatTimeAgo
      }, 5000);
    }
    return () => { if (lastSavedIntervalRef.current) window.clearInterval(lastSavedIntervalRef.current); };
  }, [lastSavedTime]);

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

      // Improvement #18: Enhanced confetti with settings respect
      const prefersReducedMotion = settings.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReducedMotion) {
        // Success sound and haptic
        triggerHaptic([10, 50, 10]);
        if (settings.sound) playClickSound();

        // BB-themed confetti with custom shapes
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F4A259', '#FF9D23', '#FFB84D', '#FFC266'],
          shapes: ['square', 'circle'],
          gravity: 1,
          drift: 0,
          ticks: 200,
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#F4A259', '#FF9D23'],
            shapes: ['square'],
          });
        }, 250);
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#FFB84D', '#FFC266'],
            shapes: ['square'],
          });
        }, 400);
      }

      // Improvement #20: Success state
      setSubmitSuccess(true);
      showToast("success", "Thanks—got it. I'll reply within 1 business day.");
      announce("Message sent successfully");
      try { localStorage.removeItem(DRAFT_KEY); } catch {}
      setLastSavedTime(null);

      // Don't clear form immediately - show success state first
      setTimeout(() => {
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
      }, 3000);
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

  // Improvement #13: Enhanced keyboard shortcuts
  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      triggerHaptic(15);
      const form = e.currentTarget as HTMLElement;
      (form.querySelector('[data-submit]') as HTMLButtonElement | null)?.click();
      return;
    }
    if (e.key === "Escape") {
      triggerHaptic(10);
      if (toast) setToast(null);
      if (showShortcuts) setShowShortcuts(false);
      return;
    }
    if (e.altKey && (e.key === "r" || e.key === "R")) {
      e.preventDefault();
      triggerHaptic(15);
      setData((d) => ({ ...d, name: "", email: "", message: "", company: "", budget: "", timeline: "", services: [], referral: "", attachment_url: "" }));
      setFiles([]);
      showToast("info", "Form cleared");
      announce("Form cleared");
      return;
    }
    // Improvement #13: Mode switching shortcuts
    if (e.altKey && (e.key === "q" || e.key === "Q")) {
      e.preventDefault();
      triggerHaptic(10);
      setMode("quick");
      playClickSound();
      showToast("info", "Switched to Quick mode");
      announce("Switched to Quick message mode");
      return;
    }
    if (e.altKey && (e.key === "b" || e.key === "B")) {
      e.preventDefault();
      triggerHaptic(10);
      setMode("brief");
      playClickSound();
      showToast("info", "Switched to Brief mode");
      announce("Switched to Project brief mode");
      return;
    }
    // Toggle shortcuts help
    if (e.key === "?" && e.shiftKey) {
      e.preventDefault();
      triggerHaptic(10);
      setShowShortcuts((prev) => !prev);
      announce(showShortcuts ? "Keyboard shortcuts hidden" : "Keyboard shortcuts displayed");
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

  // Improvement #1 & #6: Character counters and field completion
  const nameLength = data.name.trim().length;
  const emailLength = data.email.trim().length;
  const messageLength = data.message.trim().length;
  const nameValid = nameLength >= 2 && nameLength <= 80;
  const emailValid = isEmail(data.email.trim());
  const messageValid = messageLength >= 30;

  // Improvement #10: Character warnings
  const nameWarning = getCharacterWarningLevel(nameLength, 80);
  const emailWarning = getCharacterWarningLevel(emailLength, 254);

  // Improvement #6: Completion summary
  const completionSummary = getCompletionSummary(data, mode);

  // Improvement #12: Disposable email check
  const emailDisposable = data.email.trim() && isDisposableEmail(data.email.trim());

  // Improvement #5: Drag & drop visual feedback
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dt = e.dataTransfer;
    if (dt.files && dt.files.length) {
      const next = Array.from(dt.files).slice(0, MAX_FILES);
      const all = [...files, ...next].slice(0, MAX_FILES);
      const err = validateFiles(all);
      setFilesError(err);
      if (!err) {
        setFiles(all);
        showToast("info", `Added ${next.length} file${next.length > 1 ? 's' : ''}`);
        announce(`Added ${next.length} file${next.length > 1 ? 's' : ''}`);
      }
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

      {/* Improvement #9: Enhanced saved indicator with timestamp */}
      {(savedMsg || lastSavedTime) && (
        <div className="mb-3 flex items-center gap-2 text-xs text-white/50" aria-live="polite">
          {savedMsg && <span className="text-green-400">✓ {savedMsg}</span>}
          {!savedMsg && lastSavedTime && (
            <span>Last saved: {formatTimeAgo(lastSavedTime)}</span>
          )}
        </div>
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
          onClick={() => {
            navigator.clipboard?.writeText("hello@handtomouse.com");
            // Improvement #3: Success feedback
            triggerHaptic(15);
            setCopiedEmail(true);
            playClickSound();
            showToast("info", "Email copied to clipboard");
            setTimeout(() => setCopiedEmail(false), 2000);
          }}
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
          <div className="text-xs text-white/65 uppercase tracking-wider">
            {copiedEmail ? "✓ Copied!" : "Copy Email"}
          </div>
          <div className="mt-1 text-sm font-medium group-hover:text-[#ff9d23] transition-colors duration-500 truncate">
            hello@htm.com
          </div>
        </button>
      </div>

      {/* Improvement #6: Form completion indicator */}
      {completionSummary.completed > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1 h-1 bg-white/10 overflow-hidden">
            <div
              className="h-full bg-[#ff9d23] transition-all duration-500"
              style={{ width: `${completionSummary.percentage}%` }}
            />
          </div>
          <span className="text-xs text-white/65 font-mono">
            {completionSummary.completed}/{completionSummary.total} fields
          </span>
        </div>
      )}

      {/* Improvement #13: Keyboard shortcuts panel */}
      {showShortcuts && (
        <div className="mb-4 border border-[#ff9d23]/30 bg-[#0a0a0a] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-mono text-[#ff9d23] uppercase tracking-wider">Keyboard Shortcuts</h3>
            <button
              type="button"
              onClick={() => {
                triggerHaptic(10);
                setShowShortcuts(false);
              }}
              className="text-white/50 hover:text-white/80 text-xs"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            {KEYBOARD_SHORTCUTS.map((shortcut, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <kbd className="px-2 py-1 bg-white/5 border border-white/10 font-mono">{shortcut.key}</kbd>
                <span className="text-white/65">{shortcut.action}</span>
              </div>
            ))}
            <div className="flex items-center justify-between text-xs">
              <kbd className="px-2 py-1 bg-white/5 border border-white/10 font-mono">Shift + ?</kbd>
              <span className="text-white/65">Toggle this help</span>
            </div>
          </div>
        </div>
      )}

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
              onClick={() => {
                setMode(m);
                // Improvement #8: Sound feedback
                triggerHaptic(10);
                playClickSound();
                announce(`Switched to ${m === "quick" ? "Quick message" : "Project brief"} mode`);
              }}
              className={`px-8 py-4 font-mono text-base md:text-lg font-medium uppercase tracking-wider transition-all duration-500 ${
                mode === m
                  ? "bg-[#ff9d23] text-black"
                  : "bg-[#0b0b0b] text-white hover:text-[#ff9d23]"
              }`}
              style={mode === m ? { boxShadow: '0 0 20px #ff9d2360' } : {}}
              role="tab"
              aria-selected={mode === m}
            >
              {m === "quick" ? "Quick" : "Brief"}
            </button>
          ))}
        </div>

        <form
          noValidate
          className={`space-y-6 md:space-y-8 transition-all duration-300 ${isDragging ? 'ring-2 ring-[#ff9d23] ring-offset-2 ring-offset-[#0a0a0a]' : ''}`}
          onSubmit={onSubmit}
          onKeyDown={onKeyDown}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {/* Improvement #5: Drag indicator overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-[#ff9d23]/10 border-2 border-dashed border-[#ff9d23] flex items-center justify-center pointer-events-none z-10">
              <div className="bg-[#0a0a0a] px-6 py-3 border border-[#ff9d23]">
                <p className="text-[#ff9d23] font-mono text-sm uppercase tracking-wider">📎 Drop files here</p>
              </div>
            </div>
          )}

          {/* Improvement #19: Loading overlay */}
          {submitting && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="bg-[#0a0a0a] border border-[#ff9d23] px-8 py-6 flex items-center gap-4">
                <div className="animate-spin h-5 w-5 border-2 border-[#ff9d23] border-t-transparent rounded-full"></div>
                <p className="text-white font-mono text-sm uppercase tracking-wider">Sending...</p>
              </div>
            </div>
          )}

          {/* Improvement #20: Success state overlay */}
          {submitSuccess && !submitting && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20">
              <div className="bg-[#0a0a0a] border-2 border-[#ff9d23] px-12 py-10 text-center max-w-md">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="text-xl font-bold text-[#ff9d23] mb-3 uppercase tracking-wider">Message Sent!</h3>
                <p className="text-white/80 mb-4 text-sm leading-relaxed">
                  Thanks for reaching out. I'll reply within 1 business day.
                </p>
                <div className="text-xs text-white/50 mb-4">
                  Usually reply within 4 hours • Sydney (AEST/AEDT)
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setSubmitSuccess(false);
                  }}
                  className="border border-[#ff9d23] bg-[#ff9d23] text-black px-6 py-2 text-xs font-mono uppercase tracking-wider hover:bg-[#FFB84D] transition-colors duration-300"
                >
                  Send another message
                </button>
              </div>
            </div>
          )}
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

          {/* Contact Details Section Header */}
          <div className="border-b border-white/10 pb-3 mb-4">
            <h3 className="font-mono text-base md:text-lg text-[#ff9d23] uppercase tracking-wider">Contact Details</h3>
          </div>

          {/* Name + Email */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="name" className="font-mono text-sm md:text-base text-white/90 uppercase tracking-wider flex items-center gap-2">
                  Name*
                  {/* Improvement #6: Completion indicator */}
                  {nameValid && <span className="text-green-400 text-sm">✓</span>}
                </label>
                {/* Improvement #1: Character counter */}
                <span className={`text-xs font-mono ${
                  nameWarning === 'danger' ? 'text-red-400' :
                  nameWarning === 'warning' ? 'text-orange-400' :
                  'text-white/40'
                }`}>
                  {nameLength}/80
                </span>
              </div>
              <input
                id="name"
                ref={nameRef}
                type="text"
                required
                maxLength={120}
                autoComplete="name"
                inputMode="text"
                value={data.name}
                onChange={(e) => {
                  setData({ ...data, name: e.target.value });
                  // Improvement #14: ARIA announcement for milestones
                  const len = e.target.value.trim().length;
                  if (len === 2) announce("Name minimum length reached");
                  if (len === 70) announce("10 characters remaining for name");
                }}
                onBlur={(e) => {
                  onBlurTrim("name")(e);
                  // Improvement #2: Auto-focus next field
                  if (nameValid && emailRef.current) {
                    emailRef.current.focus();
                  }
                }}
                className={`w-full border px-5 py-4 md:px-6 md:py-5 text-base md:text-lg text-white outline-none transition-all duration-500 ${
                  errors.name
                    ? "border-red-400 bg-red-400/20 animate-pulse"
                    : "border-white/10 bg-[#0b0b0b] focus:ring-2 focus:ring-[#ff9d23] focus:border-transparent"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm md:text-base text-red-400 font-medium">{errors.name}</p>
              )}
              {/* Improvement #10: Warning when approaching limit */}
              {!errors.name && nameLength > 70 && nameLength < 80 && (
                <p className="mt-1 text-xs text-orange-400">
                  {80 - nameLength} characters remaining
                </p>
              )}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="email" className="font-mono text-sm md:text-base text-white/90 uppercase tracking-wider flex items-center gap-2">
                  Email*
                  {/* Improvement #6: Completion indicator */}
                  {emailValid && <span className="text-green-400 text-sm">✓</span>}
                </label>
                {/* Improvement #1: Character counter */}
                <span className={`text-xs font-mono ${
                  emailWarning === 'danger' ? 'text-red-400' :
                  emailWarning === 'warning' ? 'text-orange-400' :
                  'text-white/40'
                }`}>
                  {emailLength}/254
                </span>
              </div>
              <input
                id="email"
                ref={emailRef}
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                inputMode="email"
                value={data.email}
                onChange={(e) => {
                  setData({ ...data, email: e.target.value });
                  // Improvement #14: ARIA announcement
                  if (isEmail(e.target.value.trim())) {
                    announce("Valid email entered");
                  }
                }}
                onBlur={(e) => {
                  onBlurTrim("email")(e);
                  // Improvement #2: Auto-focus next field
                  if (emailValid && messageRef.current) {
                    messageRef.current.focus();
                  }
                }}
                className={`w-full border px-5 py-4 md:px-6 md:py-5 text-base md:text-lg text-white outline-none transition-all duration-500 ${
                  errors.email
                    ? "border-red-400 bg-red-400/20 animate-pulse"
                    : "border-white/10 bg-[#0b0b0b] focus:ring-2 focus:ring-[#ff9d23] focus:border-transparent"
                }`}
              />
              {emailSuggestion && !errors.email && (
                <button
                  type="button"
                  className="mt-1 text-xs underline text-white/65 hover:text-[#ff9d23]"
                  onClick={() => {
                    triggerHaptic(10);
                    setData((d) => ({ ...d, email: emailSuggestion }));
                    announce("Email corrected");
                  }}
                >
                  Did you mean {emailSuggestion}?
                </button>
              )}
              {/* Improvement #12: Disposable email warning */}
              {emailDisposable && !errors.email && (
                <p className="mt-1 text-xs text-orange-400 flex items-center gap-1">
                  ⚠️ Temporary emails may not receive replies
                </p>
              )}
              {errors.email && (
                <p className="mt-1 text-sm md:text-base text-red-400 font-medium">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Company (brief) */}
          {mode === "brief" && (
            <div>
              <label htmlFor="company" className="mb-2 block font-mono text-sm md:text-base text-white/90 uppercase tracking-wider">Company</label>
              <input
                id="company"
                ref={companyRef}
                type="text"
                maxLength={120}
                value={data.company}
                onChange={(e) => setData({ ...data, company: e.target.value })}
                onBlur={onBlurTrim("company")}
                className="w-full border border-white/10 bg-[#0b0b0b] px-5 py-4 md:px-6 md:py-5 text-base md:text-lg text-white outline-none transition-all duration-500 focus:ring-2 focus:ring-[#ff9d23] focus:border-transparent"
              />
            </div>
          )}

          {/* Message */}
          <div>
            <label htmlFor="message" className="mb-2 block font-mono text-sm md:text-base text-white/90 uppercase tracking-wider">
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
              className={`w-full border px-5 py-4 md:px-6 md:py-5 text-base md:text-lg text-white leading-relaxed outline-none transition-all duration-500 ${
                errors.message
                  ? "border-red-400 bg-red-400/20 animate-pulse"
                  : "border-white/10 bg-[#0b0b0b] focus:ring-2 focus:ring-[#ff9d23] focus:border-transparent"
              }`}
            />
            {!errors.message && (
              <p className="mt-1 text-sm text-white/80">Minimum 30 characters.</p>
            )}
            <div className="mt-1 flex items-center gap-2 text-xs text-white/65">
              <meter min={0} max={goal} value={progress} className="h-1 w-24"></meter>
              <span className={remaining > 0 ? "text-white/65" : "text-green-400"}>
                {remaining > 0 ? `${remaining} more` : "Good"}
              </span>
            </div>
            {errors.message && (
              <p className="mt-1 text-sm md:text-base text-red-400 font-medium">{errors.message}</p>
            )}
          </div>

          {/* Brief-only fields */}
          {mode === "brief" && (
            <>
              {/* Project Info Section Header */}
              <div className="border-b border-white/10 pb-3 mb-4">
                <h3 className="font-mono text-base md:text-lg text-[#ff9d23] uppercase tracking-wider">Project Info</h3>
              </div>

              <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="budget" className="mb-2 block font-mono text-sm md:text-base text-white/90 uppercase tracking-wider">Budget</label>
                  <select
                    id="budget"
                    value={data.budget}
                    onChange={(e) => setData({ ...data, budget: e.target.value })}
                    className="w-full border border-white/10 bg-[#0b0b0b] px-5 py-4 md:px-6 md:py-5 text-base md:text-lg text-white outline-none transition-all duration-500 focus:ring-2 focus:ring-[#ff9d23] focus:border-transparent"
                  >
                    <option value="">Select…</option>
                    {BUDGETS.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="timeline" className="mb-2 block font-mono text-sm md:text-base text-white/90 uppercase tracking-wider">Timeline</label>
                  <select
                    id="timeline"
                    value={data.timeline}
                    onChange={(e) => setData({ ...data, timeline: e.target.value })}
                    className="w-full border border-white/10 bg-[#0b0b0b] px-5 py-4 md:px-6 md:py-5 text-base md:text-lg text-white outline-none transition-all duration-500 focus:ring-2 focus:ring-[#ff9d23] focus:border-transparent"
                  >
                    <option value="">Select…</option>
                    {TIMELINES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <fieldset className="border border-white/10 p-4">
                <legend className="px-2 font-mono text-sm md:text-base text-white/90 uppercase tracking-wider">Services</legend>
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
            </>
          )}

          {/* Attachments Section Header */}
          <div className="border-b border-white/10 pb-3 mb-4">
            <h3 className="font-mono text-base md:text-lg text-[#ff9d23] uppercase tracking-wider">Attachments</h3>
          </div>

          {/* Files */}
          <div>
            <label className="mb-2 block font-mono text-sm md:text-base text-white/90 uppercase tracking-wider">Files (up to {MAX_FILES}, ≤{MAX_FILE_SIZE_MB}MB)</label>
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
                    <li key={`${f.name}-${i}`} className="flex items-center justify-between gap-2 border border-white/5 bg-[#0b0b0b] p-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {/* Improvement #11: File type icon */}
                        <span className="text-base flex-shrink-0">{getFileTypeIcon(f.name)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="truncate">{f.name}</div>
                          {/* Improvement #11: File size display */}
                          <div className="text-[10px] text-white/40">{formatFileSize(f.size)}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="border border-white/10 bg-[#131313] px-2 py-1 text-xs hover:border-[#ff9d23] hover:text-[#ff9d23] flex-shrink-0"
                        onClick={() => {
                          triggerHaptic(10);
                          removeFile(i);
                          announce(`Removed ${f.name}`);
                        }}
                        aria-label={`Remove ${f.name}`}
                      >
                        ✕
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
              className={`inline-flex items-center gap-2 px-10 py-4 md:px-12 md:py-5 font-mono text-base md:text-lg font-bold uppercase tracking-wider transition-all duration-500 ${
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
