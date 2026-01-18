import { cookies } from "next/headers";
import { mainDb } from "@/lib/db/db";
import { adminSessions } from "@/lib/db/schema-main";
import { eq, and, gt } from "drizzle-orm";

export async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session");
  
  if (!sessionToken) {
    return null;
  }
  
  const session = await mainDb
    .select()
    .from(adminSessions)
    .where(
      and(
        eq(adminSessions.token, sessionToken.value),
        gt(adminSessions.expiresAt, new Date())
      )
    )
    .get();
  
  if (!session) {
    return null;
  }
  
  return { adminId: session.adminId, sessionId: session.id };
}

export async function requireAdmin() {
  const session = await getAdminSession();
  
  if (!session) {
    return null;
  }
  
  return session;
}
