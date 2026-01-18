import { NextRequest, NextResponse } from "next/server";
import { getTenantDb, getCompanyBySlugOrId } from "@/lib/db/db";
import { user, verification } from "@/lib/db/schema-tenant";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { csrfProtection } from "@/lib/csrf";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const csrf = await csrfProtection(req);
    if (!csrf.valid) {
      return NextResponse.json({ error: "طلب غير صالح، أعد تحميل الصفحة" }, { status: 403 });
    }

    const body = await req.json();
    const { companySlug, email } = body;

    if (!companySlug || !email) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || null;
    const rateLimitKey = getRateLimitKey(ip, `reset_${email}`);
    const { allowed, retryAfter } = checkRateLimit(rateLimitKey);

    if (!allowed) {
      return NextResponse.json({ 
        error: `تم إرسال الكثير من الطلبات. حاول مرة أخرى بعد ${Math.ceil((retryAfter || 1800) / 60)} دقيقة`,
      }, { status: 429 });
    }

    const company = getCompanyBySlugOrId(companySlug);
    if (!company) {
      return NextResponse.json({ success: true, message: "إذا كان البريد موجوداً، سيتم إرسال رمز التحقق" });
    }

    const tenantDb = getTenantDb(company.id);

    const foundUser = await tenantDb
      .select()
      .from(user)
      .where(eq(user.email, email))
      .get();

    if (!foundUser) {
      return NextResponse.json({ success: true, message: "إذا كان البريد موجوداً، سيتم إرسال رمز التحقق" });
    }

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await tenantDb.insert(verification).values({
      id: uuidv4(),
      identifier: email,
      value: code,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // TODO: Send email with OTP code
    if (process.env.NODE_ENV === "development") {
      console.log(`[DEV ONLY] Reset OTP for ${email}: ${code}`);
    }

    return NextResponse.json({ success: true, message: "إذا كان البريد موجوداً، سيتم إرسال رمز التحقق" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
