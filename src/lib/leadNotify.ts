type LeadPayload = {
  name: string;
  zip: string;
  phone: string;
  email: string;
  jobType: string;
  quotedPrice?: number;
  sourcePage?: string;
};

function formatLeadMessage(payload: LeadPayload): string {
  const lines = [
    "New Warmlo lead",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `ZIP: ${payload.zip}`,
    `Job: ${payload.jobType}`,
  ];
  if (payload.quotedPrice != null) {
    lines.push(`Quoted price: $${payload.quotedPrice.toLocaleString("en-US")}`);
  }
  lines.push(`Source: ${payload.sourcePage ?? "/quote-check"}`);
  return lines.join("\n");
}

/** Best-effort alert; never throws — lead is already saved. */
export async function sendLeadAlert(payload: LeadPayload): Promise<void> {
  const errors: Error[] = [];

  if (process.env.BREVO_API_KEY && process.env.LEAD_ALERT_EMAIL) {
    try {
      await sendBrevoEmail(payload);
    } catch (e) {
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }

  const webhookUrl = process.env.LEAD_ALERT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await sendWebhookAlert(webhookUrl, payload);
    } catch (e) {
      errors.push(e instanceof Error ? e : new Error(String(e)));
    }
  }

  if (errors.length > 0 && !process.env.BREVO_API_KEY && !webhookUrl) {
    return;
  }
  if (errors.length > 0) {
    throw errors[0];
  }
}

async function sendBrevoEmail(payload: LeadPayload): Promise<void> {
  const to = process.env.LEAD_ALERT_EMAIL!;
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Warmlo", email: process.env.BREVO_SENDER_EMAIL ?? "noreply@warmlo.com" },
      to: [{ email: to }],
      subject: `New Warmlo lead: ${payload.name}`,
      textContent: formatLeadMessage(payload),
    }),
  });
  if (!res.ok) throw new Error(`Brevo returned ${res.status}`);
}

async function sendWebhookAlert(webhookUrl: string, payload: LeadPayload): Promise<void> {
  const text = formatLeadMessage(payload);
  const isDiscord = webhookUrl.includes("discord.com/api/webhooks");

  const body = isDiscord ? JSON.stringify({ content: text }) : JSON.stringify({ text, ...payload });

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!res.ok) {
    throw new Error(`Alert webhook returned ${res.status}`);
  }
}
