export type ReligiousContentType =
  | "quran"
  | "translation"
  | "tafsir"
  | "hadith"
  | "dua"
  | "audio";

export interface ContentProvenance {
  contentType: ReligiousContentType;
  sourceId: string;
  edition: string;
  sourceUrl: string;
  attribution: string;
  licenseId: string;
  redistributionAllowed: boolean;
  reviewer: string;
  reviewedAt: string;
  checksum: string;
}

export interface PublicationDecision {
  allowed: boolean;
  reasons: string[];
}

/**
 * Fail-closed publication gate. A record is not publishable until provenance,
 * human review, and redistribution permission are explicitly present.
 * This validates metadata only; it does not prove religious authenticity.
 */
export function evaluatePublication(provenance: Partial<ContentProvenance>): PublicationDecision {
  const required: Array<keyof ContentProvenance> = [
    "contentType",
    "sourceId",
    "edition",
    "sourceUrl",
    "attribution",
    "licenseId",
    "reviewer",
    "reviewedAt",
    "checksum"
  ];

  const reasons = required
    .filter((field) => {
      const value = provenance[field];
      return typeof value !== "string" || value.trim().length === 0;
    })
    .map((field) => `Missing required provenance: ${field}`);

  const allowedTypes: ReligiousContentType[] = [
    "quran",
    "translation",
    "tafsir",
    "hadith",
    "dua",
    "audio"
  ];
  if (
    typeof provenance.contentType === "string" &&
    !allowedTypes.includes(provenance.contentType as ReligiousContentType)
  ) {
    reasons.push("Content type is not supported");
  }

  if (provenance.redistributionAllowed !== true) {
    reasons.push("Redistribution permission has not been explicitly approved");
  }

  if (typeof provenance.sourceUrl === "string" && provenance.sourceUrl.trim()) {
    try {
      const url = new URL(provenance.sourceUrl);
      if (url.protocol !== "https:") reasons.push("Source URL must use HTTPS");
    } catch {
      reasons.push("Source URL is invalid");
    }
  }

  if (typeof provenance.reviewedAt === "string" && provenance.reviewedAt.trim()) {
    if (Number.isNaN(Date.parse(provenance.reviewedAt))) {
      reasons.push("Review date is invalid");
    }
  }

  return { allowed: reasons.length === 0, reasons };
}
