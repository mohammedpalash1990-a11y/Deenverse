import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

export interface StoredProblemReport {
  id: string;
  category: "bug" | "audio" | "quran" | "hadith_dua" | "feature" | "suggestion";
  description: string;
  stepsToReproduce: string | null;
  currentSection: string;
  appVersion: string;
  surahNumber: number | null;
  ayahNumber: number | null;
  diagnostics: string | null;
  status: "new";
  createdAt: string;
}

// MOCKED — in-memory store for AI Studio runtime; data is lost on container sleep.
const problemReportsStore: StoredProblemReport[] = [];

export function saveProblemReport(report: Omit<StoredProblemReport, "id" | "status" | "createdAt">): StoredProblemReport {
  const record: StoredProblemReport = {
    ...report,
    id: randomUUID(),
    status: "new",
    createdAt: new Date().toISOString()
  };
  problemReportsStore.push(record);
  return record;
}

export function createRequestId(): string {
  return `req_${randomUUID().replace(/-/g, "")}`;
}

export function apiError(
  status: number,
  code: string,
  message: string,
  options: { retryable?: boolean; details?: Array<{ field: string; message: string }>; requestId?: string } = {}
) {
  const requestId = options.requestId ?? createRequestId();
  return NextResponse.json(
    {
      error: {
        code,
        message,
        requestId,
        details: options.details ?? [],
        retryable: options.retryable ?? false
      }
    },
    { status }
  );
}

export function isValidPaginationParams(searchParams: URLSearchParams): { ok: true } | { ok: false; message: string } {
  const rawLimit = searchParams.get("limit");
  if (rawLimit !== null) {
    if (!/^\d+$/.test(rawLimit)) {
      return { ok: false, message: "Invalid pagination limit." };
    }
    const limit = Number(rawLimit);
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 50) {
      return { ok: false, message: "Pagination limit must be between 1 and 50." };
    }
  }

  const cursor = searchParams.get("cursor");
  if (cursor !== null) {
    const parts = cursor.split(".");
    if (cursor.length > 512 || parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) {
      return { ok: false, message: "Cursor must be a signed pagination token." };
    }
  }

  return { ok: true };
}
