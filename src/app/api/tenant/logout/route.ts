import { NextRequest, NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getTenantDb } from "@/lib/db/db";
import { session } from "@/lib/db/schema-tenant";
import { eq } from "drizzle-orm";
import { logSecurityEvent } from "@/lib/security-log";
import { validateTenantSession } from "@/lib/session";

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
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || null;
    
    const tenantId = extractTenantIdFromCookies(cookieStore);
    
    if (!tenantId) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const sessionToken = cookieStore.get(`tenant_${tenantId}_session`)?.value;
    let userId: string | undefined;

    if (sessionToken) {
      try {
        const sessionData = await validateTenantSession(tenantId, sessionToken);
        userId = sessionData?.userId;
        
        const tenantDb = getTenantDb(tenantId);
        await tenantDb.delete(session).where(eq(session.token, sessionToken));
      } catch {
      }
    }

    await logSecurityEvent({
      tenantId,
      userId,
      action: "LOGOUT",
      ipAddress: ip,
      userAgent,
    });

    cookieStore.delete(`tenant_${tenantId}_session`);
    cookieStore.delete(`tenant_${tenantId}_csrf`);

    return NextResponse.redirect(new URL("/login", req.url));
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
