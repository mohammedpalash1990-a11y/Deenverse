import { NextResponse } from "next/server";
import { createRequestId } from "@/lib/api-mock-store";

export async function GET() {
  return NextResponse.json(
    {
      status: "not_ready",
      probe: "readiness",
      database: "unavailable",
      migrations: "not_applied",
      timestamp: new Date().toISOString(),
      requestId: createRequestId()
    },
    { status: 503 }
  );
}
