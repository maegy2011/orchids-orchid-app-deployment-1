import { mainDb } from "@/lib/db/db";
import { admins, adminSessions } from "@/lib/db/schema-main";
import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { verifyPassword, isLegacySha256Hash, migrateLegacyHash } from "@/lib/password";
import { checkRateLimit, resetRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { logAuthEvent } from "@/lib/audit-log";

export async function POST(req: Request) {
  try {
    const { email, password, rememberMe } = await req.json();
    
    if (!email || !password) {
      return new Response("Email and password required", { status: 400 });
    }

    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for")?.split(",")[0] || null;
    const userAgent = headersList.get("user-agent") || null;
    const rateLimitKey = getRateLimitKey(ip, `admin_${email}`);
    const { allowed, retryAfter } = checkRateLimit(rateLimitKey);

    if (!allowed) {
      await logAuthEvent({
        userType: "admin",
        userEmail: email,
        action: "failed_login",
        success: false,
        ipAddress: ip,
        userAgent,
        errorMessage: "Rate limit exceeded",
      });
      return Response.json({ 
        error: `Too many attempts. Try again in ${Math.ceil((retryAfter || 1800) / 60)} minutes`,
        retryAfter 
      }, { status: 429 });
    }

    const admin = await mainDb.select().from(admins).where(eq(admins.email, email)).get();
    
    if (!admin || !admin.password) {
      await logAuthEvent({
        userType: "admin",
        userEmail: email,
        action: "failed_login",
        success: false,
        ipAddress: ip,
        userAgent,
        errorMessage: "Admin not found",
      });
      return new Response("Invalid credentials", { status: 401 });
    }
    
    let isValid = false;
    
    if (isLegacySha256Hash(admin.password)) {
      const newHash = await migrateLegacyHash(password, admin.password);
      if (newHash) {
        await mainDb.update(admins).set({ password: newHash }).where(eq(admins.id, admin.id));
        isValid = true;
      }
    } else {
      isValid = await verifyPassword(password, admin.password);
    }

    if (!isValid) {
      await logAuthEvent({
        userType: "admin",
        userEmail: email,
        action: "failed_login",
        success: false,
        ipAddress: ip,
        userAgent,
        errorMessage: "Invalid password",
      });
      return new Response("Invalid credentials", { status: 401 });
    }

    resetRateLimit(rateLimitKey);
    
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const cookieStore = await cookies();
    
    const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
    const expiresAt = new Date(Date.now() + maxAge * 1000);
    
    await mainDb.insert(adminSessions).values({
      id: uuidv4(),
      adminId: admin.id,
      token: sessionToken,
      expiresAt,
      createdAt: new Date(),
    });
    
    cookieStore.set("admin_session", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge,
      path: "/",
    });

    await logAuthEvent({
      userType: "admin",
      userEmail: email,
      action: "login",
      success: true,
      ipAddress: ip,
      userAgent,
    });
    
    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin login error:", error);
    return new Response("Server error", { status: 500 });
  }
}
