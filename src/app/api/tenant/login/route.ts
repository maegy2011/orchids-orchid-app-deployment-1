import { NextRequest, NextResponse } from "next/server";
import { getTenantDb, getCompanyBySlugOrId } from "@/lib/db/db";
import { user, session } from "@/lib/db/schema-tenant";
import { eq, desc } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { verifyPassword, isLegacySha256Hash, migrateLegacyHash } from "@/lib/password";
import { checkRateLimit, resetRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { logSecurityEvent } from "@/lib/security-log";
import { csrfProtection } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  try {
    const csrf = await csrfProtection(req);
    if (!csrf.valid) {
      return NextResponse.json({ error: "طلب غير صالح، أعد تحميل الصفحة" }, { status: 403 });
    }

    const body = await req.json();
    const { companySlug, email, password } = body;

    if (!companySlug || !email || !password) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || "unknown";
    const userAgent = headersList.get("user-agent") || null;
    const rateLimitKey = getRateLimitKey(ip, email);
    const { allowed, remainingAttempts, retryAfter } = checkRateLimit(rateLimitKey);

    if (!allowed) {
      return NextResponse.json({ 
        error: `تم تجاوز الحد الأقصى للمحاولات. حاول مرة أخرى بعد ${Math.ceil((retryAfter || 1800) / 60)} دقيقة`,
        retryAfter 
      }, { status: 429 });
    }

    const company = getCompanyBySlugOrId(companySlug);
    if (!company) {
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة", remainingAttempts }, { status: 401 });
    }

    const tenantDb = getTenantDb(company.id);

    const foundUser = await tenantDb
      .select()
      .from(user)
      .where(eq(user.email, email))
      .get();

    if (!foundUser || !foundUser.password) {
      await logSecurityEvent({
        tenantId: company.id,
        action: "LOGIN_FAILED",
        ipAddress: ip,
        userAgent,
        details: { email, reason: "User not found" },
      });
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة", remainingAttempts }, { status: 401 });
    }

    let isValid = false;
    
    if (isLegacySha256Hash(foundUser.password)) {
      const newHash = await migrateLegacyHash(password, foundUser.password);
      if (newHash) {
        await tenantDb.update(user).set({ password: newHash, updatedAt: new Date() }).where(eq(user.id, foundUser.id));
        isValid = true;
      }
    } else {
      isValid = await verifyPassword(password, foundUser.password);
    }

    if (!isValid) {
      await logSecurityEvent({
        tenantId: company.id,
        userId: foundUser.id,
        action: "LOGIN_FAILED",
        ipAddress: ip,
        userAgent,
        details: { email, reason: "Invalid password" },
      });
      return NextResponse.json({ error: "بيانات الدخول غير صحيحة", remainingAttempts }, { status: 401 });
    }

    resetRateLimit(rateLimitKey);

    const MAX_SESSIONS = 5;
    const now = new Date();
    
    const activeSessions = await tenantDb
      .select({ id: session.id })
      .from(session)
      .where(eq(session.userId, foundUser.id))
      .orderBy(desc(session.createdAt))
      .all();
    
    const validSessions = [];
    for (const s of activeSessions) {
      const sessionData = await tenantDb
        .select()
        .from(session)
        .where(eq(session.id, s.id))
        .get();
      if (sessionData && sessionData.expiresAt > now) {
        validSessions.push(sessionData);
      }
    }
    
    if (validSessions.length >= MAX_SESSIONS) {
      const sessionsToDelete = validSessions.slice(MAX_SESSIONS - 1);
      for (const oldSession of sessionsToDelete) {
        await tenantDb.delete(session).where(eq(session.id, oldSession.id));
      }
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await tenantDb.insert(session).values({
      id: sessionId,
      token: sessionToken,
      userId: foundUser.id,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      userAgent: userAgent || undefined,
      ipAddress: ip || undefined,
    });

    const cookieStore = await cookies();
    
    const csrfToken = crypto.randomBytes(32).toString("hex");
    
    cookieStore.set(`tenant_${company.id}_session`, sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    
    cookieStore.set(`tenant_${company.id}_csrf`, csrfToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    await logSecurityEvent({
      tenantId: company.id,
      userId: foundUser.id,
      action: "LOGIN_SUCCESS",
      ipAddress: ip,
      userAgent,
      details: { email },
    });

    return NextResponse.json({
      success: true,
      companyId: company.id,
      companySlug: company.slug,
      csrfToken,
      user: {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "حدث خطأ في تسجيل الدخول" }, { status: 500 });
  }
}
