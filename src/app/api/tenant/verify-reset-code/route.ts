import { NextRequest, NextResponse } from "next/server";
import { getTenantDb, getCompanyBySlugOrId } from "@/lib/db/db";
import { verification } from "@/lib/db/schema-tenant";
import { eq, and, gt } from "drizzle-orm";
import { csrfProtection } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  try {
    const csrf = await csrfProtection(req);
    if (!csrf.valid) {
      return NextResponse.json({ error: "طلب غير صالح، أعد تحميل الصفحة" }, { status: 403 });
    }

    const body = await req.json();
    const { companySlug, email, code } = body;

    if (!companySlug || !email || !code) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
