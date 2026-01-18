import { cookies } from "next/headers";
import { randomBytes, timingSafeEqual } from "crypto";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}

export function generateCsrfToken(): string {
  return randomBytes(32).toString("hex");
}

export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();
  
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  
  return token;
}

export async function getCsrfTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value || null;
}

export async function validateCsrfToken(request: Request): Promise<boolean> {
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieToken = await getCsrfTokenFromCookie();
  
  if (!headerToken || !cookieToken) {
    return false;
  }
  
  return safeCompare(headerToken, cookieToken);
}

export async function csrfProtection(request: Request): Promise<{ valid: boolean; error?: string }> {
  const isValid = await validateCsrfToken(request);
  
  if (!isValid) {
    return { valid: false, error: "CSRF token invalid or missing" };
  }
  
  return { valid: true };
}

export async function validateCSRFToken(request: Request, tenantId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const csrfCookie = cookieStore.get(`tenant_${tenantId}_csrf`)?.value;
  const headerToken = request.headers.get("x-csrf-token");
  
  if (!csrfCookie || !headerToken) {
    return false;
  }
  
  return csrfCookie === headerToken;
}
