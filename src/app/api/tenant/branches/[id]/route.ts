import { NextRequest, NextResponse } from "next/server";
import { getTenantDb } from "@/lib/db/db";
import { branches } from "@/lib/db/schema-tenant";
import { eq } from "drizzle-orm";
import { verifyTenantSession } from "@/lib/auth-guard";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tenantId, name, location } = body;

    if (!tenantId || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const auth = await verifyTenantSession(req, tenantId);
    if (!auth.success) return auth.error;

    const db = getTenantDb(tenantId);

    await db
      .update(branches)
      .set({ name, location: location || null })
      .where(eq(branches.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating branch:", error);
    return NextResponse.json({ error: "Failed to update branch" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = req.nextUrl.searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Tenant ID required" }, { status: 400 });
    }

    const auth = await verifyTenantSession(req, tenantId);
    if (!auth.success) return auth.error;

    const db = getTenantDb(tenantId);
    await db.delete(branches).where(eq(branches.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting branch:", error);
    return NextResponse.json({ error: "Failed to delete branch" }, { status: 500 });
  }
}
