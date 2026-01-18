import { getTenantDb } from "@/lib/db/db";
import { mainDb } from "@/lib/db/db";
import { session } from "@/lib/db/schema-tenant";
import { adminSessions } from "@/lib/db/schema-main";
import { eq, and, gt, lt } from "drizzle-orm";
import crypto from "crypto";

export async function validateTenantSession(tenantId: string, token: string) {
  try {
    const tenantDb = getTenantDb(tenantId);
    const validSession = await tenantDb
      .select()
      .from(session)
      .where(
        and(
          eq(session.token, token),
          gt(session.expiresAt, new Date())
        )
      )
      .get();

    return validSession || null;
  } catch {
    return null;
  }
}

export async function validateAdminSession(token: string) {
  try {
    const validSession = await mainDb
      .select()
      .from(adminSessions)
      .where(
        and(
          eq(adminSessions.token, token),
          gt(adminSessions.expiresAt, new Date())
        )
      )
      .get();

    return validSession || null;
  } catch {
    return null;
  }
}

export async function invalidateTenantSession(tenantId: string, token: string) {
  try {
    const tenantDb = getTenantDb(tenantId);
    await tenantDb.delete(session).where(eq(session.token, token));
    return true;
  } catch {
    return false;
  }
}

export async function invalidateAllUserSessions(tenantId: string, userId: string) {
  try {
    const tenantDb = getTenantDb(tenantId);
    await tenantDb.delete(session).where(eq(session.userId, userId));
    return true;
  } catch {
    return false;
  }
}

export async function invalidateAdminSession(token: string) {
  try {
    await mainDb.delete(adminSessions).where(eq(adminSessions.token, token));
    return true;
  } catch {
    return false;
  }
}

export async function cleanupExpiredSessions(tenantId?: string) {
  const now = new Date();
  
  try {
    await mainDb.delete(adminSessions).where(lt(adminSessions.expiresAt, now));
    
    if (tenantId) {
      const tenantDb = getTenantDb(tenantId);
      await tenantDb.delete(session).where(lt(session.expiresAt, now));
    }
    
    return true;
  } catch {
    return false;
  }
}

export async function regenerateSessionToken(tenantId: string, oldToken: string): Promise<string | null> {
  try {
    const tenantDb = getTenantDb(tenantId);
    
    const existingSession = await tenantDb
      .select()
      .from(session)
      .where(and(eq(session.token, oldToken), gt(session.expiresAt, new Date())))
      .get();
    
    if (!existingSession) {
      return null;
    }
    
    const newToken = crypto.randomBytes(32).toString("hex");
    
    await tenantDb
      .update(session)
      .set({ 
        token: newToken, 
        updatedAt: new Date() 
      })
      .where(eq(session.id, existingSession.id));
    
    return newToken;
  } catch {
    return null;
  }
}

export async function extendSession(tenantId: string, token: string, additionalDays: number = 7): Promise<boolean> {
  try {
    const tenantDb = getTenantDb(tenantId);
    
    const existingSession = await tenantDb
      .select()
      .from(session)
      .where(and(eq(session.token, token), gt(session.expiresAt, new Date())))
      .get();
    
    if (!existingSession) {
      return false;
    }
    
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + additionalDays);
    
    await tenantDb
      .update(session)
      .set({ 
        expiresAt: newExpiry, 
        updatedAt: new Date() 
      })
      .where(eq(session.id, existingSession.id));
    
    return true;
  } catch {
    return false;
  }
}
