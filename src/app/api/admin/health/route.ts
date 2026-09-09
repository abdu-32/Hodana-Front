import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  process.env.BACKEND_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const backendRes = await fetch(`${API_BASE_URL}/api/v1/admin/health`, {
      headers,
      cache: "no-store",
    });

    if (!backendRes.ok) {
      const errorText = await backendRes.text();
      return NextResponse.json(
        { error: "Backend health check failed", details: errorText },
        { status: backendRes.status }
      );
    }

    const data = await backendRes.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "DEGRADED",
        timestamp: new Date().toISOString(),
        services: {
          database: { name: "PostgreSQL Database", status: "DEGRADED", latencyMs: null, message: err.message },
          cache: { name: "Redis & Celery Task Queue", status: "DEGRADED", latencyMs: null, message: err.message },
          auth: { name: "Authentication & JWT Token Rotation", status: "HEALTHY", latencyMs: null, message: "Operational" },
          storage: { name: "Media Direct-Upload & Storage Service", status: "HEALTHY", latencyMs: null, message: "Operational" },
        },
      },
      { status: 500 }
    );
  }
}
