import { NextRequest, NextResponse } from "next/server";
import { getTenantDb } from "@/lib/db/db";
import { wallets, transactions } from "@/lib/db/schema-tenant";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { verifyTenantSession } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    const tenantId = req.nextUrl.searchParams.get("tenantId");
    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    const auth = await verifyTenantSession(req, tenantId);
    if (!auth.success) return auth.error;

    const db = getTenantDb(tenantId);

    let wallet = await db.select().from(wallets).limit(1).get();

    if (!wallet) {
      const walletId = uuidv4();
      await db.insert(wallets).values({
        id: walletId,
        balance: 0,
        createdAt: new Date(),
      });
      wallet = { id: walletId, userId: null, branchId: null, balance: 0, createdAt: new Date() };
    }

    const allTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.walletId, wallet.id))
      .orderBy(desc(transactions.createdAt))
      .all();

    return NextResponse.json({
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
      },
      transactions: allTransactions.map((t) => ({
        id: t.id,
        walletId: t.walletId,
        amount: t.amount,
        type: t.type,
        description: t.description,
        createdAt: t.createdAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}
