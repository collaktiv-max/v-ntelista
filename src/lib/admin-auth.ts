// Enkel inloggning för admin-sidan (/admin). Byggd utan extra beroenden med
// Web Crypto (funkar både i Node-routes och i proxy/Edge-runtime).
//
// E-post/lösenord och signeringsnyckel läses ENDAST från miljövariabler
// (ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET) – de committas
// medvetet inte som standardvärden i koden. Sätt dem i Vercel (samma sätt
// som DATABASE_URL) eller i en lokal .env.local (gitignorad). Saknas
// ADMIN_EMAIL/ADMIN_PASSWORD går det inte att logga in alls.
export const ADMIN_SESSION_COOKIE = "collaktiv_admin_session";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 timmar

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getAdminCredentials(): { email: string; password: string } | null {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return null;
  return { email, password };
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret) return secret;
  // Fallback så att signeringen fungerar innan ADMIN_SESSION_SECRET är
  // satt – sessioner blir bara ogiltiga så fort variabeln sätts/byts,
  // inget säkerhetsproblem i sig.
  return "collaktiv-vantelista-dev-secret";
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export function isAdminConfigured(): boolean {
  return getAdminCredentials() !== null;
}

export function checkAdminCredentials(email: string, password: string): boolean {
  const creds = getAdminCredentials();
  if (!creds) return false;
  return email.trim().toLowerCase() === creds.email && password === creds.password;
}

export async function createAdminSessionToken(email: string): Promise<string> {
  const payload = JSON.stringify({ email, exp: Date.now() + SESSION_TTL_MS });
  const encodedPayload = base64UrlEncode(encoder.encode(payload));
  const signature = await hmac(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  const expected = await hmac(encodedPayload);
  if (!timingSafeEqual(expected, signature)) return false;

  try {
    const payload = JSON.parse(decoder.decode(base64UrlDecode(encodedPayload)));
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function readCookie(cookieHeader: string, name: string): string | undefined {
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}
