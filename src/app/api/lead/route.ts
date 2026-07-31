import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/lead";
import { sendLeadAlert } from "@/lib/leadNotify";

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000;

type LeadPayload = {
  name: string;
  zip: string;
  phone: string;
  email: string;
  jobType: string;
  quotedPrice?: number;
  sourcePage?: string;
};

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  rateLimitMap.set(ip, timestamps);
  return timestamps.length >= RATE_LIMIT;
}

function recordSubmission(ip: string): void {
  const timestamps = rateLimitMap.get(ip) ?? [];
  timestamps.push(Date.now());
  rateLimitMap.set(ip, timestamps);
}

function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function storeLeadSupabase(supabase: SupabaseClient, payload: LeadPayload) {
  const { error } = await supabase.from("leads").insert({
    name: payload.name,
    zip: payload.zip,
    phone: payload.phone,
    email: payload.email,
    job_type: payload.jobType,
    quoted_price: payload.quotedPrice ?? null,
    source_page: payload.sourcePage ?? "/quote-check",
    created_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/** Optional fetch-only fallback (e.g. Slack/Discord/Zapier webhook). No extra npm deps. */
async function storeLeadWebhook(payload: LeadPayload) {
  const webhookUrl = process.env.LEAD_WEBHOOK_URL;
  if (!webhookUrl) throw new Error("No lead storage configured");

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source: "warmlo",
      ...payload,
      submittedAt: new Date().toISOString(),
    }),
  });
  if (!res.ok) throw new Error(`Webhook returned ${res.status}`);
}

async function storeLead(payload: LeadPayload) {
  const supabase = getSupabase();
  if (supabase) {
    await storeLeadSupabase(supabase, payload);
    return;
  }
  await storeLeadWebhook(payload);
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many submissions. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const details: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString() ?? "form";
      details[key] = details[key] ?? [];
      details[key].push(issue.message);
    }
    return NextResponse.json({ error: "Validation failed", details }, { status: 400 });
  }

  try {
    await storeLead(parsed.data);
    recordSubmission(ip);
    try {
      await sendLeadAlert(parsed.data);
    } catch (alertErr) {
      console.error("Lead alert failed (lead was saved):", alertErr);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Lead storage failed:", err);
    return NextResponse.json(
      { error: "Unable to submit right now. Please try again later." },
      { status: 503 }
    );
  }
}
