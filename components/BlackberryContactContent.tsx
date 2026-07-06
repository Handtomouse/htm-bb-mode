"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import BBPageHeader from "./BBPageHeader";
import { useSettings, useClickSound, useHapticFeedback } from "@/lib/hooks";
import { isEmail } from "@/lib/contactFormData";

// ─── Types ────────────────────────────────────────────────────────────────────

type Answers = {
  name: string;
  project: string;
  serviceType: string;
  serviceOther: string;
  timeline: string;
  email: string;
};

type Step = 0 | 1 | 2 | 3 | 4;

const TOTAL_STEPS = 5;

const SERVICE_OPTIONS = [
  "Brand Strategy",
  "Campaign Creative",
  "Content Systems",
  "Something else",
] as const;

const TIMELINE_OPTIONS = [
  "ASAP (< 4 weeks)",
  "Standard (4–8 weeks)",
  "No rush — let's talk first",
] as const;

// ─── Slide variants ───────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 380, damping: 30 },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.18, ease: "easeIn" as const },
  }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validateStep(step: Step, answers: Answers): string | null {
  switch (step) {
    case 0:
      if (!answers.name.trim() || answers.name.trim().length < 2)
        return "Need at least 2 characters.";
      return null;
    case 1:
      if (!answers.project.trim() || answers.project.trim().length < 30)
        return "Tell me a bit more — at least a sentence.";
      return null;
    case 2:
      if (!answers.serviceType) return "Pick one to continue.";
      if (answers.serviceType === "Something else" && !answers.serviceOther.trim())
        return "Tell me what you're after.";
      return null;
    case 3:
      if (!answers.timeline) return "Pick one to continue.";
      return null;
    case 4:
      if (!answers.email.trim() || !isEmail(answers.email.trim()))
        return "That doesn't look like a valid email.";
      return null;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ProgressDotsProps {
  step: Step;
}

function ProgressDots({ step }: ProgressDotsProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 20,
      }}
    >
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === step ? 18 : 6,
            height: 6,
            borderRadius: 3,
            background: i === step ? "var(--accent)" : i < step ? "var(--accent)" : "var(--grid)",
            opacity: i < step ? 0.5 : 1,
            transition: "all 0.25s ease",
          }}
        />
      ))}
      <span
        style={{
          marginLeft: 8,
          fontSize: 10,
          fontFamily: "var(--font-mono, monospace)",
          color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.08em",
        }}
      >
        {step + 1} of {TOTAL_STEPS}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BlackberryContactContent() {
  const [settings] = useSettings();
  const playClickSound = useClickSound(settings.sound);
  const triggerHaptic = useHapticFeedback();

  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back
  const [answers, setAnswers] = useState<Answers>({
    name: "",
    project: "",
    serviceType: "",
    serviceOther: "",
    timeline: "",
    email: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [startedAt] = useState(() => Date.now());

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Auto-focus on mount and step change
  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 320);
    return () => clearTimeout(t);
  }, [step]);

  const advance = useCallback(() => {
    const err = validateStep(step, answers);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (step < TOTAL_STEPS - 1) {
      playClickSound();
      triggerHaptic([5]);
      setDirection(1);
      setStep((s) => (s + 1) as Step);
    }
  }, [step, answers, playClickSound, triggerHaptic]);

  const goBack = useCallback(() => {
    if (step > 0) {
      setError(null);
      setDirection(-1);
      setStep((s) => (s - 1) as Step);
    }
  }, [step]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && step !== 1) {
      e.preventDefault();
      if (step === TOTAL_STEPS - 1) {
        handleSubmit();
      } else {
        advance();
      }
    }
  }

  async function handleSubmit() {
    const err = validateStep(step, answers);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSubmitting(true);

    // Build services array from serviceType answer
    const services: string[] = [];
    if (answers.serviceType && answers.serviceType !== "Something else") {
      services.push(answers.serviceType);
    } else if (answers.serviceType === "Something else" && answers.serviceOther) {
      services.push(answers.serviceOther.trim());
    }

    // Build message from project description (+ service other if applicable)
    const messageParts = [answers.project.trim()];
    if (answers.serviceType === "Something else" && answers.serviceOther.trim()) {
      messageParts.push(`Service type: ${answers.serviceOther.trim()}`);
    }

    const payload = {
      mode: "quick" as const,
      name: answers.name.trim(),
      email: answers.email.trim(),
      message: messageParts.join("\n\n"),
      timeline: answers.timeline,
      services,
      consent: true,
      startedAt,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({} as Record<string, unknown>));
        // Friendly, actionable messages per failure class; always offer the
        // direct email as a fallback so a failed send is never a dead end
        const fallback = " You can also email hello@handtomouse.org directly.";
        if (res.status === 429) {
          throw new Error("Too many attempts in a short window. Wait a minute and try again." + fallback);
        }
        if (res.status >= 500) {
          throw new Error("Something broke on our end. Please try again in a moment." + fallback);
        }
        throw new Error(((j?.error as string) || "Couldn't send that.") + fallback);
      }

      // Fire confetti
      const prefersReducedMotion =
        settings.reducedMotion ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!prefersReducedMotion) {
        triggerHaptic([10, 50, 10]);
        if (settings.sound) playClickSound();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#F7A835", "#FFC266"],
          shapes: ["square", "circle"],
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
            colors: ["#F7A835"],
            shapes: ["square"],
          });
        }, 250);
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#FFC266"],
            shapes: ["square"],
          });
        }, 400);
      }

      setSubmitted(true);
    } catch (err: unknown) {
      // A thrown TypeError here is almost always a dropped network request
      const msg =
        err instanceof TypeError
          ? "Network dropped mid-send. Check your connection and try again. You can also email hello@handtomouse.org directly."
          : err instanceof Error
            ? err.message
            : "Couldn't send just now. Please try again. You can also email hello@handtomouse.org directly.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <BBPageHeader title="Contact" subtitle="Get in touch" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px 32px",
            textAlign: "center",
          }}
        >
          {/* BB-style status badge */}
          <div
            style={{
              display: "inline-block",
              padding: "4px 12px",
              border: "1px solid var(--accent)",
              borderRadius: 2,
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 11,
              letterSpacing: "0.15em",
              color: "var(--accent)",
              marginBottom: 24,
            }}
          >
            MESSAGE SENT
          </div>

          <p
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: "var(--ink)",
              lineHeight: 1.4,
              maxWidth: 280,
              margin: 0,
            }}
          >
            Got it, {answers.name.split(" ")[0]}.
          </p>
          <p
            style={{
              fontSize: 14,
              color: "var(--muted)",
              marginTop: 12,
              lineHeight: 1.5,
              maxWidth: 260,
            }}
          >
            I&apos;ll be back within 24 hours&nbsp;— usually&nbsp;4.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Form steps ──────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <BBPageHeader title="Contact" subtitle="Get in touch" />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "16px 20px 24px",
          overflow: "hidden",
        }}
      >
        <ProgressDots step={step} />

        {/* Animated step container */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {step === 0 && (
                <StepName
                  value={answers.name}
                  onChange={(v) => {
                    setAnswers((a) => ({ ...a, name: v }));
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  inputRef={inputRef as React.RefObject<HTMLInputElement>}
                  error={error}
                />
              )}
              {step === 1 && (
                <StepProject
                  value={answers.project}
                  onChange={(v) => {
                    setAnswers((a) => ({ ...a, project: v }));
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  inputRef={inputRef as React.RefObject<HTMLTextAreaElement>}
                  error={error}
                />
              )}
              {step === 2 && (
                <StepService
                  serviceType={answers.serviceType}
                  serviceOther={answers.serviceOther}
                  onSelect={(v) => {
                    setAnswers((a) => ({
                      ...a,
                      serviceType: v,
                      serviceOther: v !== "Something else" ? "" : a.serviceOther,
                    }));
                    setError(null);
                    // Auto-advance unless "Something else" (needs text input)
                    // Bypass advance() to avoid stale closure — we know v is valid
                    if (v !== "Something else") {
                      setTimeout(() => {
                        playClickSound();
                        triggerHaptic([5]);
                        setDirection(1);
                        setStep((s) => (s + 1) as Step);
                      }, 400);
                    }
                  }}
                  onOtherChange={(v) => {
                    setAnswers((a) => ({ ...a, serviceOther: v }));
                    setError(null);
                  }}
                  error={error}
                />
              )}
              {step === 3 && (
                <StepTimeline
                  value={answers.timeline}
                  onSelect={(v) => {
                    setAnswers((a) => ({ ...a, timeline: v }));
                    setError(null);
                    setTimeout(() => {
                      playClickSound();
                      triggerHaptic([5]);
                      setDirection(1);
                      setStep((s) => (s + 1) as Step);
                    }, 400);
                  }}
                  error={error}
                />
              )}
              {step === 4 && (
                <StepEmail
                  value={answers.email}
                  onChange={(v) => {
                    setAnswers((a) => ({ ...a, email: v }));
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  inputRef={inputRef as React.RefObject<HTMLInputElement>}
                  error={error}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 16,
            flexShrink: 0,
          }}
        >
          {step > 0 && (
            <button
              onClick={goBack}
              style={{
                flex: "0 0 auto",
                padding: "10px 16px",
                background: "transparent",
                border: "1px solid var(--grid)",
                borderRadius: 3,
                color: "var(--muted)",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 11,
                letterSpacing: "0.1em",
                cursor: "pointer",
              }}
            >
              ← BACK
            </button>
          )}

          <button
            onClick={step === TOTAL_STEPS - 1 ? handleSubmit : advance}
            disabled={submitting}
            style={{
              flex: 1,
              padding: "10px 20px",
              background: submitting ? "rgba(247, 168, 53,0.4)" : "var(--accent, #F7A835)",
              border: "none",
              borderRadius: 3,
              color: "#000",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "background 0.15s ease",
            }}
          >
            {submitting
              ? "SENDING…"
              : step === TOTAL_STEPS - 1
              ? "SEND MESSAGE"
              : "NEXT →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step components ──────────────────────────────────────────────────────────

const questionStyle: React.CSSProperties = {
  fontSize: 17,
  fontWeight: 600,
  color: "var(--ink)",
  lineHeight: 1.35,
  marginBottom: 20,
  marginTop: 4,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid var(--grid)",
  borderRadius: 3,
  padding: "11px 14px",
  color: "var(--ink)",
  fontSize: 14,
  fontFamily: "var(--font-body)",
  outline: "none",
  boxSizing: "border-box",
  caretColor: "var(--accent, #F7A835)",
};

const errorStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--error)",
  marginTop: 8,
  fontFamily: "var(--font-mono, monospace)",
};

const hintStyle: React.CSSProperties = {
  fontSize: 12,
  color: "var(--muted)",
  marginTop: 8,
  fontFamily: "var(--font-mono, monospace)",
};

// Step 0 — Name
function StepName({
  value,
  onChange,
  onKeyDown,
  inputRef,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  error: string | null;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <p style={questionStyle}>What&apos;s your name?</p>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="First name is fine."
        autoComplete="given-name"
        style={{
          ...inputStyle,
          borderColor: error ? "var(--error)" : "var(--grid)",
        }}
      />
      {error ? (
        <p style={errorStyle}>{error}</p>
      ) : (
        <p style={hintStyle}>Press Enter to continue</p>
      )}
    </div>
  );
}

// Step 1 — Project
function StepProject({
  value,
  onChange,
  onKeyDown,
  inputRef,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  error: string | null;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <p style={questionStyle}>What are you working on?</p>
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Tell me about the project — or just the problem."
        rows={4}
        style={{
          ...inputStyle,
          resize: "none",
          lineHeight: 1.55,
          borderColor: error ? "var(--error)" : "var(--grid)",
        }}
      />
      {error ? (
        <p style={errorStyle}>{error}</p>
      ) : (
        <p style={hintStyle}>Shift+Enter for new line</p>
      )}
    </div>
  );
}

// Step 2 — Service
function StepService({
  serviceType,
  serviceOther,
  onSelect,
  onOtherChange,
  error,
}: {
  serviceType: string;
  serviceOther: string;
  onSelect: (v: string) => void;
  onOtherChange: (v: string) => void;
  error: string | null;
}) {
  const otherRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (serviceType === "Something else") {
      setTimeout(() => otherRef.current?.focus(), 50);
    }
  }, [serviceType]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <p style={questionStyle}>What kind of help are you looking for?</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {SERVICE_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            style={{
              padding: "10px 12px",
              background:
                serviceType === opt
                  ? "var(--accent, #F7A835)"
                  : "rgba(255,255,255,0.05)",
              border:
                serviceType === opt
                  ? "1px solid var(--accent, #F7A835)"
                  : "1px solid rgba(255,255,255,0.15)",
              borderRadius: 3,
              color: serviceType === opt ? "#000" : "rgba(255,255,255,0.75)",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 11,
              fontWeight: serviceType === opt ? 700 : 400,
              letterSpacing: "0.06em",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
            }}
          >
            {opt}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {serviceType === "Something else" && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 10 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            style={{ overflow: "hidden" }}
          >
            <input
              ref={otherRef}
              type="text"
              value={serviceOther}
              onChange={(e) => onOtherChange(e.target.value)}
              placeholder="What are you after?"
              style={inputStyle}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
}

// Step 3 — Timeline
function StepTimeline({
  value,
  onSelect,
  error,
}: {
  value: string;
  onSelect: (v: string) => void;
  error: string | null;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <p style={questionStyle}>What&apos;s your timeline?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {TIMELINE_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            style={{
              padding: "11px 14px",
              background:
                value === opt
                  ? "var(--accent, #F7A835)"
                  : "rgba(255,255,255,0.05)",
              border:
                value === opt
                  ? "1px solid var(--accent, #F7A835)"
                  : "1px solid rgba(255,255,255,0.15)",
              borderRadius: 3,
              color: value === opt ? "#000" : "rgba(255,255,255,0.75)",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 11,
              fontWeight: value === opt ? 700 : 400,
              letterSpacing: "0.06em",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s ease",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && <p style={errorStyle}>{error}</p>}
    </div>
  );
}

// Step 4 — Email
function StepEmail({
  value,
  onChange,
  onKeyDown,
  inputRef,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  error: string | null;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <p style={questionStyle}>How do I reach you?</p>
      <input
        ref={inputRef}
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="hello@yourbrand.com"
        autoComplete="email"
        style={{
          ...inputStyle,
          borderColor: error ? "var(--error)" : "var(--grid)",
        }}
      />
      {error ? (
        <p style={errorStyle}>{error}</p>
      ) : (
        <p style={hintStyle}>Press Enter to send</p>
      )}
    </div>
  );
}
