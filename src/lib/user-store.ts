"use client";

import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot
} from "firebase/firestore";
import { db, auth, type User } from "./firebase";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write"
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email
      })) || []
    },
    operationType,
    path
  };
  console.warn("Firestore Operation Notice:", JSON.stringify(errInfo));
}

export interface UserBookmark {
  id: string;
  userId: string;
  itemType: "ayah" | "hadith" | "dua";
  surahNumber?: number;
  ayahNumber?: number;
  bookSlug?: string;
  hadithNumber?: string;
  title: string;
  note?: string;
  arabicSnippet?: string;
  createdAt: string;
}

export interface ReadingPosition {
  userId: string;
  surahNumber: number;
  ayahNumber: number;
  surahNameArabic?: string;
  surahNameEnglish?: string;
  surahNameBengali?: string;
  updatedAt: string;
}

export interface AudioPlaybackState {
  userId: string;
  qariId: string;
  qariName: string;
  surahNumber: number;
  positionSeconds: number;
  updatedAt: string;
}

export interface HifzRecord {
  id: string;
  userId: string;
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  status: "learning" | "memorized" | "revising";
  revisionCount: number;
  lastRevisionDate?: string;
  masteryLevel: number;
  notes?: string;
  updatedAt: string;
}

export interface UserPreferences {
  arabicFontSize: number;
  showTranslation: boolean;
  showFootnotes: boolean;
  preferredQari: string;
  theme: "light" | "dark" | "system";
}

const STORAGE_KEYS = {
  BOOKMARKS: "deenverse_local_bookmarks_v1",
  READING: "deenverse_local_reading_v1",
  AUDIO: "deenverse_local_audio_v1",
  HIFZ: "deenverse_local_hifz_v1",
  PREFS: "deenverse_local_prefs_v1"
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  arabicFontSize: 26,
  showTranslation: true,
  showFootnotes: false,
  preferredQari: "alafasy",
  theme: "dark"
};

export function loadLocalPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFS);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveLocalPreferences(prefs: UserPreferences): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(prefs));
  } catch {
    // Ignore storage failure
  }
}

export function loadLocalReadingPosition(): ReadingPosition | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.READING);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalReadingPosition(pos: ReadingPosition): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.READING, JSON.stringify(pos));
  } catch {
    // Ignore storage failure
  }
}

export function loadLocalAudioState(): AudioPlaybackState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIO);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalAudioState(state: AudioPlaybackState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.AUDIO, JSON.stringify(state));
  } catch {
    // Ignore storage failure
  }
}

export function loadLocalBookmarks(): UserBookmark[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalBookmarks(bookmarks: UserBookmark[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  } catch {
    // Ignore storage failure
  }
}

export function loadLocalHifzRecords(): HifzRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HIFZ);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalHifzRecords(records: HifzRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.HIFZ, JSON.stringify(records));
  } catch {
    // Ignore storage failure
  }
}

export function isBookmarked(type: "ayah" | "hadith" | "dua", id: string): boolean {
  const bookmarks = loadLocalBookmarks();
  return bookmarks.some(
    (b) => b.id === id || (b.itemType === type && (b.id === id || `${b.surahNumber}:${b.ayahNumber}` === id))
  );
}

export function toggleBookmark(data: {
  type: "ayah" | "hadith" | "dua";
  title: string;
  arabicText?: string;
  translation?: string;
  reference?: string;
  itemId: string;
  surahNumber?: number;
  ayahNumber?: number;
  bookSlug?: string;
  hadithNumber?: string;
}): boolean {
  const bookmarks = loadLocalBookmarks();
  const existsIndex = bookmarks.findIndex(
    (b) => b.id === data.itemId || (b.itemType === data.type && `${b.surahNumber}:${b.ayahNumber}` === data.itemId)
  );

  if (existsIndex >= 0) {
    bookmarks.splice(existsIndex, 1);
    saveLocalBookmarks(bookmarks);
    if (auth.currentUser) {
      deleteBookmarkFromCloud(auth.currentUser, data.itemId).catch(() => {});
    }
    return false;
  } else {
    const newBookmark: UserBookmark = {
      id: data.itemId,
      userId: auth.currentUser?.uid || "guest",
      itemType: data.type,
      title: data.title,
      arabicSnippet: data.arabicText,
      note: data.translation,
      surahNumber: data.surahNumber,
      ayahNumber: data.ayahNumber,
      bookSlug: data.bookSlug,
      hadithNumber: data.hadithNumber,
      createdAt: new Date().toISOString()
    };
    bookmarks.unshift(newBookmark);
    saveLocalBookmarks(bookmarks);
    if (auth.currentUser) {
      syncBookmarkToCloud(auth.currentUser, newBookmark).catch(() => {});
    }
    return true;
  }
}

// Cloud Synchronization
export async function syncBookmarkToCloud(user: User, bookmark: UserBookmark): Promise<void> {
  const path = `users/${user.uid}/bookmarks/${bookmark.id}`;
  try {
    await setDoc(doc(db, "users", user.uid, "bookmarks", bookmark.id), {
      ...bookmark,
      userId: user.uid,
      createdAt: bookmark.createdAt || new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBookmarkFromCloud(user: User, bookmarkId: string): Promise<void> {
  const path = `users/${user.uid}/bookmarks/${bookmarkId}`;
  try {
    await deleteDoc(doc(db, "users", user.uid, "bookmarks", bookmarkId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncReadingPositionToCloud(user: User, pos: ReadingPosition): Promise<void> {
  const path = `users/${user.uid}/reading_state/current`;
  try {
    await setDoc(doc(db, "users", user.uid, "reading_state", "current"), {
      ...pos,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncAudioStateToCloud(user: User, state: AudioPlaybackState): Promise<void> {
  const path = `users/${user.uid}/audio_state/current`;
  try {
    await setDoc(doc(db, "users", user.uid, "audio_state", "current"), {
      ...state,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncHifzRecordToCloud(user: User, record: HifzRecord): Promise<void> {
  const path = `users/${user.uid}/hifz_progress/${record.id}`;
  try {
    await setDoc(doc(db, "users", user.uid, "hifz_progress", record.id), {
      ...record,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteHifzRecordFromCloud(user: User, recordId: string): Promise<void> {
  const path = `users/${user.uid}/hifz_progress/${recordId}`;
  try {
    await deleteDoc(doc(db, "users", user.uid, "hifz_progress", recordId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeToCloudBookmarks(
  user: User,
  onUpdate: (bookmarks: UserBookmark[]) => void
): () => void {
  const path = `users/${user.uid}/bookmarks`;
  return onSnapshot(
    collection(db, "users", user.uid, "bookmarks"),
    (snapshot) => {
      const list: UserBookmark[] = [];
      snapshot.forEach((d) => list.push(d.data() as UserBookmark));
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export function subscribeToCloudHifz(
  user: User,
  onUpdate: (records: HifzRecord[]) => void
): () => void {
  const path = `users/${user.uid}/hifz_progress`;
  return onSnapshot(
    collection(db, "users", user.uid, "hifz_progress"),
    (snapshot) => {
      const list: HifzRecord[] = [];
      snapshot.forEach((d) => list.push(d.data() as HifzRecord));
      onUpdate(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}
