import { NextResponse } from "next/server";
import { createRequestId } from "@/lib/api-mock-store";

export async function GET() {
  return NextResponse.json({
    status: "ready",
    probe: "readiness",
    database: "in-memory-mock",
    migrations: "mocked",
    timestamp: new Date().toISOString(),
    requestId: createRequestId()
  });
}
