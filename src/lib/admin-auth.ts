// Inloggning för admin-sidan (/admin). Kontot (e-post + lösenord) skapas
// av dig själv på /admin/login första gången – ingenting hårdkodat i
// koden eller satt via miljövariabler. Se src/lib/admin-db.ts för hur
// och var det sparas.
//
// Byggd utan extra beroenden med Web Crypto (funkar både i Node-routes
// och i proxy/Edge-runtime).
import { getAdminConfig, setAdminConfig } from "./admin-db";

export const ADMIN_SESSION_COOKIE = "collaktiv_admin_session";

const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 timmar
const PBKDF2_ITERATIONS = 100_000;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

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

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a[i] ^ b[i];
  return result === 0;
}

function randomSecret(byteLength: number): string {
  return base64UrlEncode(crypto.getRandomValues(new Uint8Array(byteLength)));
}

async function pbkdf2(password: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return new Uint8Array(bits);
}

async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return `${PBKDF2_ITERATIONS}:${base64UrlEncode(salt)}:${base64UrlEncode(hash)}`;
}

export async function verifyPasswordHash(password: string, stored: string): Promise<boolean> {
  const [iterationsStr, saltB64, hashB64] = stored.split(":");
  const iterations = Number(iterationsStr);
  if (!iterations || !saltB64 || !hashB64) return false;
  const salt = base64UrlDecode(saltB64);
  const expected = base64UrlDecode(hashB64);
  const actual = await pbkdf2(password, salt, iterations);
  return timingSafeEqual(actual, expected);
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return base64UrlEncode(new Uint8Array(signature));
}

export async function isAdminConfigured(): Promise<boolean> {
  return (await getAdminConfig()) !== null;
}

export async function checkAdminCredentials(email: string, password: string): Promise<boolean> {
  const config = await getAdminConfig();
  if (!config) return false;
  if (email.trim().toLowerCase() !== config.email) return false;
  return verifyPasswordHash(password, config.passwordHash);
}

// Skapar kontot – tillåts bara när inget finns sedan tidigare, se
// /api/admin/setup. Loggar in direkt genom att returnera en sessionscookie.
export async function createAdminAccount(email: string, password: string): Promise<string> {
  const passwordHash = await hashPassword(password);
  const sessionSecret = randomSecret(32);
  const normalizedEmail = email.trim().toLowerCase();
  await setAdminConfig({ email: normalizedEmail, passwordHash, sessionSecret });
  return createAdminSessionToken(normalizedEmail, sessionSecret);
}

// Byter e-post/lösenord för ett redan inloggat konto (kräver att
// anroparen redan verifierat sessionen/nuvarande lösenord).
export async function updateAdminAccount(email: string, password: string): Promise<void> {
  const existing = await getAdminConfig();
  const passwordHash = await hashPassword(password);
  const sessionSecret = existing?.sessionSecret ?? randomSecret(32);
  await setAdminConfig({ email: email.trim().toLowerCase(), passwordHash, sessionSecret });
}

export async function createAdminSessionToken(email: string, sessionSecret: string): Promise<string> {
  const payload = JSON.stringify({ email, exp: Date.now() + SESSION_TTL_MS });
  const encodedPayload = base64UrlEncode(encoder.encode(payload));
  const signature = await hmac(sessionSecret, encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined | null,
  sessionSecret: string
): Promise<boolean> {
  if (!token) return false;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  const expected = await hmac(sessionSecret, encodedPayload);
  if (!timingSafeEqual(encoder.encode(expected), encoder.encode(signature))) return false;

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
