import { NextResponse } from "next/server";
import { mainDb, getAllCompanies, getTenantDb } from "@/lib/db/db";
import { adminSessions } from "@/lib/db/schema-main";
import { session, verification } from "@/lib/db/schema-tenant";
import { lt } from "drizzle-orm";
import { headers } from "next/headers";

const CLEANUP_SECRET = process.env.CLEANUP_SECRET || "cleanup-secret-key";

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    
    if (authHeader !== `Bearer ${CLEANUP_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    let totalDeleted = 0;

    const adminResult = await mainDb
      .delete(adminSessions)
      .where(lt(adminSessions.expiresAt, now));
    totalDeleted += adminResult.changes || 0;

    const companies = getAllCompanies();
    
    for (const company of companies) {
      try {
        const tenantDb = getTenantDb(company.id);
        
        const sessionResult = await tenantDb
          .delete(session)
          .where(lt(session.expiresAt, now));
        totalDeleted += sessionResult.changes || 0;

        const verificationResult = await tenantDb
          .delete(verification)
          .where(lt(verification.expiresAt, now));
        totalDeleted += verificationResult.changes || 0;
      } catch (error) {
        console.error(`Failed to cleanup tenant ${company.id}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount: totalDeleted,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
