"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    try {
      // TODO: Integrate with SendGrid API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    } catch (error) {
      setStatus("error");
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 font-mono text-4xl uppercase">
        <span className="slash-accent">/</span> CONTACT
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block font-mono text-sm uppercase"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-[var(--grid)] bg-[var(--panel)] px-4 py-3 text-[var(--ink)] transition-all focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block font-mono text-sm uppercase"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border border-[var(--grid)] bg-[var(--panel)] px-4 py-3 text-[var(--ink)] transition-all focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="mb-2 block font-mono text-sm uppercase"
          >
            Message
          </label>
          <textarea
            id="message"
            required
            rows={6}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full border border-[var(--grid)] bg-[var(--panel)] px-4 py-3 text-[var(--ink)] transition-all focus:border-[var(--accent)] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="border-3 border-[var(--accent)] bg-[var(--accent)] px-6 py-3 font-mono uppercase text-black transition-all hover:bg-transparent hover:text-[var(--accent)] disabled:opacity-50"
        >
          {status === "sending" ? "SENDING..." : "SEND MESSAGE"}
        </button>

        {status === "sent" && (
          <div className="font-mono text-sm text-[var(--accent-3)]">
            ✓ Message sent successfully
          </div>
        )}

        {status === "error" && (
          <div className="font-mono text-sm text-[var(--accent-2)]">
            ✗ Error sending message. Please try again.
          </div>
        )}
      </form>

      <div className="mt-12 border-t border-[var(--grid)] pt-6 text-sm text-[var(--muted)]">
        <p>
          Prefer email directly?{" "}
          <a
            href="mailto:hello@handtomouse.com"
            className="text-[var(--accent)] underline hover:no-underline"
          >
            hello@handtomouse.com
          </a>
        </p>
      </div>
    </div>
  );
}
