import { NextRequest, NextResponse } from "next/server";
import { getTenantDb } from "@/lib/db/db";
import { wallets, transactions } from "@/lib/db/schema-tenant";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { verifyTenantSession } from "@/lib/auth-guard";
import { validateCSRFToken } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, amount, type, description } = body;

    if (!tenantId || !amount || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const auth = await verifyTenantSession(req, tenantId);
    if (!auth.success) return auth.error;
    
    const isValidCsrf = await validateCSRFToken(req, tenantId);
    if (!isValidCsrf) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

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

    const transactionId = uuidv4();
    await db.insert(transactions).values({
      id: transactionId,
      walletId: wallet.id,
      amount: parseFloat(amount),
      type,
      description: description || null,
      createdAt: new Date(),
    });

    let newBalance = wallet.balance;
    if (type === "deposit" || type === "transfer_in") {
      newBalance += parseFloat(amount);
    } else if (type === "withdrawal" || type === "transfer_out") {
      newBalance -= parseFloat(amount);
    }

    await db.update(wallets).set({ balance: newBalance }).where(eq(wallets.id, wallet.id));

    return NextResponse.json({ success: true, transactionId, newBalance });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
