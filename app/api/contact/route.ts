import { NextRequest, NextResponse } from "next/server";
import { sendContactNotification, sendAutoReply } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateFiles } from "@/lib/file-validation";

type ContactMode = "quick" | "brief";

type ContactPayload = {
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

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function validatePayload(body: ContactPayload): { ok: true } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim();
  const message = String(body.message || "").trim();

  // Honeypot check
  if (body.website && String(body.website).trim() !== "") {
    return { ok: false, error: "Spam detected" };
  }

  // Timer check (minimum 7 seconds)
  if (body.startedAt && Number.isFinite(body.startedAt)) {
    const delta = Date.now() - Number(body.startedAt);
    if (delta < 7000) {
      return { ok: false, error: "Too fast. Please wait a few seconds and try again." };
    }
  }

  // Field validation
  if (name.length < 2 || name.length > 80) {
    return { ok: false, error: "Name must be between 2 and 80 characters" };
  }

  if (!isEmail(email)) {
    return { ok: false, error: "Invalid email address" };
  }

  if (message.length < 30) {
    return { ok: false, error: "Message must be at least 30 characters" };
  }

  if (body.attachment_url && !/^https?:\/\//.test(String(body.attachment_url))) {
    return { ok: false, error: "Invalid attachment URL" };
  }

  if (body.consent === false) {
    return { ok: false, error: "Consent is required" };
  }

  return { ok: true };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const rateLimit = await checkRateLimit(request);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Too many requests. Please try again in ${rateLimit.retryAfter} seconds.`,
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfter),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.reset),
          },
        }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    // Handle multipart/form-data (with file uploads)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const payloadStr = formData.get("payload") as string;

      if (!payloadStr) {
        return NextResponse.json(
          { error: "Missing payload in form data" },
          { status: 400 }
        );
      }

      const payload: ContactPayload = JSON.parse(payloadStr);
      const validation = validatePayload(payload);

      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Extract uploaded files
      const files: File[] = [];
      for (let i = 1; i <= 3; i++) {
        const file = formData.get(`file${i}`) as File | null;
        if (file) files.push(file);
      }

      // Validate files (magic byte check, MIME type verification)
      if (files.length > 0) {
        const fileValidation = await validateFiles(files);
        if (!fileValidation.valid) {
          return NextResponse.json(
            { error: fileValidation.errors.join(", ") },
            { status: 400 }
          );
        }
      }

      // Send email notifications
      try {
        // Send notification to site owner
        await sendContactNotification(
          payload,
          files.map((f) => ({ name: f.name, size: f.size }))
        );

        // Send auto-reply to sender
        await sendAutoReply(payload.name, payload.email);
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        // Log error but don't fail the request
        // In production, you might want to save to database and retry later
      }

      // TODO: Save to database for backup/analytics

      // Log submission (remove in production or send to proper logging service)
      console.log("Contact form submission (with files):", {
        ...payload,
        filesCount: files.length,
        fileNames: files.map((f) => f.name),
      });

      return NextResponse.json(
        {
          success: true,
          message: "Thanks! I'll get back to you within 1 business day.",
        },
        {
          headers: {
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.reset),
          },
        }
      );
    }

    // Handle JSON payload (no files)
    if (contentType.includes("application/json")) {
      const payload: ContactPayload = await request.json();
      const validation = validatePayload(payload);

      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // Send email notifications
      try {
        // Send notification to site owner
        await sendContactNotification(payload);

        // Send auto-reply to sender
        await sendAutoReply(payload.name, payload.email);
      } catch (emailError) {
        console.error("Email sending error:", emailError);
        // Log error but don't fail the request
      }

      // TODO: Save to database for backup/analytics

      // Log submission (remove in production or send to proper logging service)
      console.log("Contact form submission:", payload);

      return NextResponse.json(
        {
          success: true,
          message: "Thanks! I'll get back to you within 1 business day.",
        },
        {
          headers: {
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.reset),
          },
        }
      );
    }

    return NextResponse.json(
      { error: "Unsupported content type" },
      { status: 415 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
