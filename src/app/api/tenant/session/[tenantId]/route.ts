import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { validateTenantSession } from "@/lib/session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tenantId: string }> }
) {
  try {
    const { tenantId } = await params;
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(`tenant_${tenantId}_session`)?.value;

    if (!sessionToken) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    const session = await validateTenantSession(tenantId, sessionToken);

    if (!session) {
      cookieStore.delete(`tenant_${tenantId}_session`);
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({ valid: true, userId: session.userId });
  } catch (error) {
    console.error("Session validation error:", error);
    return NextResponse.json({ valid: false }, { status: 500 });
  }
}
