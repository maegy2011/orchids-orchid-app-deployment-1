import { NextRequest, NextResponse } from "next/server";
import { getTenantDb } from "@/lib/db/db";
import { session } from "@/lib/db/schema-tenant";
import { eq, and, gt } from "drizzle-orm";

export type AuthResult = 
  | { success: true; userId: string; tenantId: string }
  | { success: false; error: NextResponse };

export async function verifyTenantSession(req: NextRequest, tenantId: string): Promise<AuthResult> {
  const sessionToken = req.cookies.get(`tenant_${tenantId}_session`)?.value;

  if (!sessionToken) {
    return {
      success: false,
      error: NextResponse.json({ error: "غير مصرح - يجب تسجيل الدخول" }, { status: 401 }),
    };
  }

  try {
    const db = getTenantDb(tenantId);
    const now = Date.now();
    
    const validSession = await db
      .select()
      .from(session)
      .where(
        and(
          eq(session.token, sessionToken),
          gt(session.expiresAt, new Date(now))
        )
      )
      .get();

    if (!validSession) {
      return {
        success: false,
        error: NextResponse.json({ error: "جلسة منتهية - يرجى تسجيل الدخول مرة أخرى" }, { status: 401 }),
      };
    }

    return {
      success: true,
      userId: validSession.userId,
      tenantId,
    };
  } catch (error) {
    console.error("Error verifying session:", error);
    return {
      success: false,
      error: NextResponse.json({ error: "فشل في التحقق من الجلسة" }, { status: 500 }),
    };
  }
}

export function getTenantIdFromRequest(req: NextRequest): string | null {
  const tenantId = req.nextUrl.searchParams.get("tenantId");
  if (tenantId) return tenantId;

  try {
    const referer = req.headers.get("referer");
    if (referer) {
      const match = referer.match(/\/c\/([^\/]+)/);
      if (match) return match[1];
    }
  } catch {}

  return null;
}
