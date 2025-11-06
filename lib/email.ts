import { Resend } from "resend";

// Initialize Resend lazily to avoid build-time errors when API key is not available
const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY || "";
  return new Resend(apiKey);
};

type ContactSubmission = {
  mode: "quick" | "brief";
  name: string;
  email: string;
  message: string;
  company?: string;
  budget?: string;
  timeline?: string;
  services?: string[];
  referral?: string;
  attachment_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

/**
 * Send contact form notification to site owner
 */
export async function sendContactNotification(
  submission: ContactSubmission,
  files?: { name: string; size: number }[]
) {
  const { name, email, message, company, budget, timeline, services, referral, attachment_url, mode, utm_source, utm_medium, utm_campaign } = submission;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0b0b0b; color: #F4A259; padding: 20px; border-left: 4px solid #F4A259; }
    .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
    .field { margin: 15px 0; }
    .label { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
    .value { margin-top: 5px; color: #333; }
    .badge { display: inline-block; padding: 4px 8px; background: #F4A259; color: #000; border-radius: 3px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .tag { background: #e0e0e0; padding: 4px 10px; border-radius: 12px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">🔔 New Contact Form Submission</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">${mode === "brief" ? "Project Brief" : "Quick Message"}</p>
    </div>

    <div class="content">
      <div class="field">
        <div class="label">From</div>
        <div class="value"><strong>${name}</strong> &lt;${email}&gt;</div>
        ${company ? `<div style="color: #666; margin-top: 4px;">${company}</div>` : ""}
      </div>

      <div class="field">
        <div class="label">Message</div>
        <div class="value" style="white-space: pre-wrap; background: white; padding: 15px; border-left: 3px solid #F4A259;">${message}</div>
      </div>

      ${
        mode === "brief"
          ? `
      ${
        budget
          ? `<div class="field">
        <div class="label">Budget</div>
        <div class="value"><span class="badge">${budget}</span></div>
      </div>`
          : ""
      }

      ${
        timeline
          ? `<div class="field">
        <div class="label">Timeline</div>
        <div class="value"><span class="badge">${timeline}</span></div>
      </div>`
          : ""
      }

      ${
        services && services.length > 0
          ? `<div class="field">
        <div class="label">Services Interested In</div>
        <div class="tags">
          ${services.map((s) => `<span class="tag">${s}</span>`).join("")}
        </div>
      </div>`
          : ""
      }

      ${
        referral
          ? `<div class="field">
        <div class="label">How they heard about us</div>
        <div class="value">${referral}</div>
      </div>`
          : ""
      }
      `
          : ""
      }

      ${
        attachment_url
          ? `<div class="field">
        <div class="label">Attachment Link</div>
        <div class="value"><a href="${attachment_url}" style="color: #F4A259;">${attachment_url}</a></div>
      </div>`
          : ""
      }

      ${
        files && files.length > 0
          ? `<div class="field">
        <div class="label">Uploaded Files (${files.length})</div>
        <div class="value">
          ${files.map((f) => `<div>📎 ${f.name} (${Math.ceil(f.size / 1024)} KB)</div>`).join("")}
        </div>
      </div>`
          : ""
      }

      ${
        utm_source || utm_medium || utm_campaign
          ? `<div class="field">
        <div class="label">Campaign Tracking</div>
        <div class="value">
          ${utm_source ? `Source: ${utm_source}<br>` : ""}
          ${utm_medium ? `Medium: ${utm_medium}<br>` : ""}
          ${utm_campaign ? `Campaign: ${utm_campaign}` : ""}
        </div>
      </div>`
          : ""
      }
    </div>

    <div class="footer">
      <p>Sent from HandToMouse BB Portfolio Contact Form</p>
      <p style="color: #ccc; font-size: 11px;">Received at ${new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney" })}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
New Contact Form Submission - ${mode === "brief" ? "Project Brief" : "Quick Message"}

From: ${name} <${email}>
${company ? `Company: ${company}` : ""}

Message:
${message}

${budget ? `Budget: ${budget}` : ""}
${timeline ? `Timeline: ${timeline}` : ""}
${services && services.length > 0 ? `Services: ${services.join(", ")}` : ""}
${referral ? `Referral: ${referral}` : ""}
${attachment_url ? `Attachment: ${attachment_url}` : ""}
${files && files.length > 0 ? `\nFiles (${files.length}): ${files.map((f) => f.name).join(", ")}` : ""}
${utm_source || utm_medium || utm_campaign ? `\nCampaign: ${utm_source || ""} / ${utm_medium || ""} / ${utm_campaign || ""}` : ""}

---
Received: ${new Date().toLocaleString("en-AU", { timeZone: "Australia/Sydney" })}
  `.trim();

  const resend = getResendClient();
  const result = await resend.emails.send({
    from: process.env.CONTACT_EMAIL_FROM || "HandToMouse <noreply@handtomouse.com>",
    to: process.env.CONTACT_EMAIL_TO || "hello@handtomouse.com",
    subject: `${mode === "brief" ? "📋 Project Brief" : "💬 Quick Message"} from ${name}`,
    html,
    text,
    replyTo: email,
  });

  return result;
}

/**
 * Send auto-reply confirmation to sender
 */
export async function sendAutoReply(name: string, email: string) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0b0b0b; color: #F4A259; padding: 30px 20px; text-align: center; }
    .logo { font-size: 32px; font-weight: 700; margin: 0; }
    .content { padding: 30px 20px; }
    .cta { display: inline-block; background: #F4A259; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">HANDTOMOUSE</div>
      <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Sydney-based Creative Studio</p>
    </div>

    <div class="content">
      <p>Hi ${name},</p>

      <p>Thanks for reaching out! I've received your message and will get back to you <strong>within 1 business day</strong>.</p>

      <p>I'm based in Sydney (AEST/AEDT), so if you've sent this outside business hours, I'll reply first thing in the morning.</p>

      <p>In the meantime, feel free to:</p>
      <ul>
        <li><a href="https://www.handtomouse.org/portfolio" style="color: #F4A259;">Browse my recent work</a></li>
        <li><a href="https://www.instagram.com/handtomouse" style="color: #F4A259;">Check out @handtomouse on Instagram</a></li>
        <li><a href="https://www.handtomouse.org/services" style="color: #F4A259;">Learn more about my services</a></li>
      </ul>

      <p>Looking forward to connecting!</p>

      <p>
        <strong>Nate</strong><br>
        HandToMouse<br>
        <a href="https://www.handtomouse.org" style="color: #F4A259;">www.handtomouse.org</a>
      </p>
    </div>

    <div class="footer">
      <p>HandToMouse · Sydney, Australia</p>
      <p style="color: #ccc; font-size: 11px;">This is an automated confirmation email. Please don't reply directly to this message.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Hi ${name},

Thanks for reaching out! I've received your message and will get back to you within 1 business day.

I'm based in Sydney (AEST/AEDT), so if you've sent this outside business hours, I'll reply first thing in the morning.

In the meantime, feel free to:
- Browse my recent work: https://www.handtomouse.org/portfolio
- Check out @handtomouse on Instagram
- Learn more about my services: https://www.handtomouse.org/services

Looking forward to connecting!

Nate
HandToMouse
www.handtomouse.org

---
This is an automated confirmation email.
  `.trim();

  const resend = getResendClient();
  const result = await resend.emails.send({
    from: process.env.CONTACT_EMAIL_FROM || "HandToMouse <noreply@handtomouse.com>",
    to: email,
    subject: "Thanks for reaching out! I'll reply soon.",
    html,
    text,
  });

  return result;
}
