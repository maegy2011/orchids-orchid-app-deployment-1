import { NextRequest, NextResponse } from "next/server";
import { mainDb, getTenantDb } from "@/lib/db/db";
import { companies } from "@/lib/db/schema-main";
import { user } from "@/lib/db/schema-tenant";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, companySlug, managerName, managerEmail, managerPassword } = body;

    if (!companyName || !companySlug || !managerName || !managerEmail || !managerPassword) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    if (managerPassword.length < 8) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" }, { status: 400 });
    }

    const existing = await mainDb
      .select()
      .from(companies)
      .where(eq(companies.slug, companySlug))
      .get();

    if (existing) {
      return NextResponse.json({ error: "معرف الشركة مستخدم بالفعل" }, { status: 400 });
    }

    const companyId = uuidv4();
    const dbPath = `tenant_${companyId}.db`;

    await mainDb.insert(companies).values({
      id: companyId,
      name: companyName,
      slug: companySlug,
      dbPath,
      managerEmail,
      isActive: true,
      createdAt: new Date(),
    });

    const tenantDb = getTenantDb(companyId);

    const userId = uuidv4();
    const passwordHash = await hashPassword(managerPassword);

    await tenantDb.insert(user).values({
      id: userId,
      name: managerName,
      email: managerEmail,
      emailVerified: false,
      password: passwordHash,
      role: "manager",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      companyId,
      companySlug,
      userId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "حدث خطأ في التسجيل" }, { status: 500 });
  }
}
