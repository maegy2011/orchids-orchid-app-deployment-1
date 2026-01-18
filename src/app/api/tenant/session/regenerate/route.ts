import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { regenerateSessionToken } from "@/lib/session";

function extractTenantIdFromCookies(cookieStore: Awaited<ReturnType<typeof cookies>>): string | null {
  const allCookies = cookieStore.getAll();
  for (const cookie of allCookies) {
    const match = cookie.name.match(/^tenant_(.+)_session$/);
    if (match && cookie.value) {
      return match[1];
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tenantId = extractTenantIdFromCookies(cookieStore);
    
    if (!tenantId) {
      return NextResponse.json({ error: "No active session" }, { status: 401 });
    }
    
    const oldToken = cookieStore.get(`tenant_${tenantId}_session`)?.value;
    
    if (!oldToken) {
      return NextResponse.json({ error: "No session token" }, { status: 401 });
    }
    
    const newToken = await regenerateSessionToken(tenantId, oldToken);
    
    if (!newToken) {
      return NextResponse.json({ error: "Session invalid or expired" }, { status: 401 });
    }
    
    cookieStore.set(`tenant_${tenantId}_session`, newToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session regenerate error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
