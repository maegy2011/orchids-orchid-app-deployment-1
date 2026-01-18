import { NextRequest, NextResponse } from "next/server";
import { getTenantDb } from "@/lib/db/db";
import { branches } from "@/lib/db/schema-tenant";
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
    const allBranches = await db.select().from(branches).all();

    return NextResponse.json({
      branches: allBranches.map((b) => ({
        id: b.id,
        name: b.name,
        location: b.location,
        managerId: b.managerId,
        createdAt: b.createdAt?.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tenantId, name, location } = body;

    if (!tenantId || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const auth = await verifyTenantSession(req, tenantId);
    if (!auth.success) return auth.error;

    const db = getTenantDb(tenantId);
    const id = uuidv4();

    await db.insert(branches).values({
      id,
      name,
      location: location || null,
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Error creating branch:", error);
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}
