import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || "default-secret-key-change-in-production");

interface SessionPayload {
  sessionId: string;
  userId: string;
  tenantId: string;
  exp: number;
}

async function verifySessionToken(token: string, tenantId: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET) as { payload: SessionPayload };
    
    if (payload.tenantId !== tenantId) {
      return false;
    }
    
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

async function verifySessionWithAPI(request: NextRequest, tenantId: string, sessionToken: string): Promise<boolean> {
  try {
    const baseUrl = request.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/tenant/session/${tenantId}`, {
      headers: {
        Cookie: `tenant_${tenantId}_session=${sessionToken}`,
      },
    });
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    const adminSession = request.cookies.get("admin_session");

    if (adminSession) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const adminSession = request.cookies.get("admin_session");

    if (!adminSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname.startsWith("/c/")) {
    const pathParts = pathname.split("/");
    const tenantId = pathParts[2];
    
    if (tenantId) {
      const sessionCookie = request.cookies.get(`tenant_${tenantId}_session`);
      
      if (!sessionCookie) {
        const url = new URL("/login", request.url);
        url.searchParams.set("redirect", pathname);
        return NextResponse.redirect(url);
      }
      
      let isValid = await verifySessionToken(sessionCookie.value, tenantId);
      
      if (!isValid) {
        isValid = await verifySessionWithAPI(request, tenantId, sessionCookie.value);
      }
      
      if (!isValid) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete(`tenant_${tenantId}_session`);
        response.cookies.delete(`tenant_${tenantId}_csrf`);
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/c/:path*"],
};
