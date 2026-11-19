import { afterEach, describe, expect, it, vi } from "vitest";

const { mockAuth } = vi.hoisted(() => ({
  mockAuth: {
    currentUser: null as null | {
      uid: string;
      email: string;
      emailVerified: boolean;
      isAnonymous: boolean;
      tenantId: string | null;
      providerData: Array<{ providerId: string; email: string | null }>;
    }
  }
}));

vi.mock("./firebase", () => ({ auth: mockAuth, db: {} }));
vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  collection: vi.fn(),
  onSnapshot: vi.fn()
}));

import { handleFirestoreError, OperationType } from "./user-store";

describe("Firestore error diagnostics", () => {
  afterEach(() => {
    mockAuth.currentUser = null;
    vi.restoreAllMocks();
  });

  it("redacts user, provider, and document identifiers from browser logs", () => {
    mockAuth.currentUser = {
      uid: "private-user-id",
      email: "person@example.com",
      emailVerified: true,
      isAnonymous: false,
      tenantId: "private-tenant-id",
      providerData: [{ providerId: "google.com", email: "person@example.com" }]
    };
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});

    handleFirestoreError(
      new Error("permission denied for person@example.com at private-user-id"),
      OperationType.WRITE,
      "users/private-user-id/bookmarks/private-bookmark-id"
    );

    expect(warning).toHaveBeenCalledOnce();
    const payload = JSON.parse(String(warning.mock.calls[0]?.[1]));
    expect(payload).toEqual({
      error: "Error",
      authInfo: { signedIn: true, isAnonymous: false },
      operationType: "write",
      path: "users/{documentId}/bookmarks/{documentId}"
    });
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain("private-user-id");
    expect(serialized).not.toContain("person@example.com");
    expect(serialized).not.toContain("private-tenant-id");
    expect(serialized).not.toContain("private-bookmark-id");
  });

  it("does not log arbitrary thrown values or a missing path", () => {
    mockAuth.currentUser = null;
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});

    handleFirestoreError("sensitive thrown value", OperationType.GET, null);

    const payload = JSON.parse(String(warning.mock.calls[0]?.[1]));
    expect(payload).toEqual({
      error: "UnknownError",
      authInfo: { signedIn: false, isAnonymous: null },
      operationType: "get",
      path: null
    });
    expect(JSON.stringify(payload)).not.toContain("sensitive thrown value");
  });
});
