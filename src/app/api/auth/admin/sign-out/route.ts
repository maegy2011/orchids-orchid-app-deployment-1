import { cookies } from "next/headers";
import { mainDb } from "@/lib/db/db";
import { adminSessions } from "@/lib/db/schema-main";
import { eq } from "drizzle-orm";

export async function POST() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session");
  
  if (sessionToken) {
    await mainDb
      .delete(adminSessions)
      .where(eq(adminSessions.token, sessionToken.value));
  }
  
  cookieStore.delete("admin_session");
  
  return Response.json({ success: true });
}
