import { NextResponse } from "next/server";
import { createRequestId } from "@/lib/api-mock-store";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    probe: "liveness",
    timestamp: new Date().toISOString(),
    requestId: createRequestId()
  });
}
