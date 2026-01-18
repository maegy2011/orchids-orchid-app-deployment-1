import { getTenantDb } from "@/lib/db/db";
import { securityLog } from "@/lib/db/schema-tenant";
import { v4 as uuidv4 } from "uuid";

export type SecurityAction = 
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "PASSWORD_RESET_REQUEST"
  | "PASSWORD_RESET_SUCCESS"
  | "SESSION_REGENERATED"
  | "SESSION_EXPIRED"
  | "CSRF_VALIDATION_FAILED"
  | "UNAUTHORIZED_ACCESS";

interface LogSecurityEventParams {
  tenantId: string;
  userId?: string;
  action: SecurityAction;
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: Record<string, unknown>;
}

export async function logSecurityEvent({
  tenantId,
  userId,
  action,
  ipAddress,
  userAgent,
  details,
}: LogSecurityEventParams): Promise<boolean> {
  try {
    const tenantDb = getTenantDb(tenantId);
    
    await tenantDb.insert(securityLog).values({
      id: uuidv4(),
      userId: userId || null,
      action,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      details: details ? JSON.stringify(details) : null,
      createdAt: new Date(),
    });
    
    return true;
  } catch (error) {
    console.error("Failed to log security event:", error);
    return false;
  }
}

export function getClientInfo(req: Request): { ipAddress: string; userAgent: string } {
  const headers = new Headers(req.headers);
  const ipAddress = headers.get("x-forwarded-for")?.split(",")[0] || 
                    headers.get("x-real-ip") || 
                    "unknown";
  const userAgent = headers.get("user-agent") || "unknown";
  
  return { ipAddress, userAgent };
}
