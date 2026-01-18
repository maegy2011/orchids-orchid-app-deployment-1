import { NextRequest, NextResponse } from "next/server";
import { getTenantDb, getCompanyBySlugOrId } from "@/lib/db/db";
import { user, verification } from "@/lib/db/schema-tenant";
import { eq, and, gt } from "drizzle-orm";
import { hashPassword, validatePasswordStrength } from "@/lib/password";
import { invalidateAllUserSessions } from "@/lib/session";
import { logSecurityEvent } from "@/lib/security-log";
import { headers } from "next/headers";
import { csrfProtection } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  try {
    const csrf = await csrfProtection(req);
    if (!csrf.valid) {
      return NextResponse.json({ error: "طلب غير صالح، أعد تحميل الصفحة" }, { status: 403 });
    }

    const body = await req.json();
    const { companySlug, email, code, newPassword } = body;

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || null;

    if (!companySlug || !email || !code || !newPassword) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
    }

    const company = getCompanyBySlugOrId(companySlug);
    if (!company) {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    const tenantDb = getTenantDb(company.id);

    const foundVerification = await tenantDb
      .select()
      .from(verification)
      .where(
        and(
          eq(verification.identifier, email),
          eq(verification.value, code),
          gt(verification.expiresAt, new Date())
        )
      )
      .get();

    if (!foundVerification) {
      return NextResponse.json({ error: "رمز التحقق غير صحيح أو منتهي" }, { status: 400 });
    }

    const existingUser = await tenantDb
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, email))
      .get();

    if (!existingUser) {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);

    await tenantDb
      .update(user)
      .set({ password: passwordHash, updatedAt: new Date() })
      .where(eq(user.email, email));

    await invalidateAllUserSessions(company.id, existingUser.id);

    await tenantDb
      .delete(verification)
      .where(eq(verification.identifier, email));

    await logSecurityEvent({
      tenantId: company.id,
      userId: existingUser.id,
      action: "PASSWORD_RESET_SUCCESS",
      ipAddress: ip,
      userAgent,
      details: { email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
