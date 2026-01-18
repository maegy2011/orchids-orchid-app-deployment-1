import { mainDb } from "@/lib/db/db";
import { authLogs } from "@/lib/db/schema-main";
import { v4 as uuidv4 } from "uuid";

type AuthAction = "login" | "logout" | "failed_login" | "password_reset_request" | "password_reset";
type UserType = "admin" | "tenant";

interface LogAuthEventParams {
  userType: UserType;
  userEmail: string;
  action: AuthAction;
  success: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
  errorMessage?: string;
  companyId?: string;
}

export async function logAuthEvent(params: LogAuthEventParams): Promise<void> {
  try {
    await mainDb.insert(authLogs).values({
      id: uuidv4(),
      userType: params.userType,
      userEmail: params.userEmail,
      action: params.action,
      success: params.success,
      ipAddress: params.ipAddress || null,
      userAgent: params.userAgent || null,
      errorMessage: params.errorMessage || null,
      companyId: params.companyId || null,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to log auth event:", error);
  }
}
