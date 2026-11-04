"use client";

import { useId, useRef, useState, type ReactNode } from "react";

/** In-memory self-guided recall for text already accepted by the Ayah reader.
 * Does not authenticate a source, grade recitation, or persist scripture/progress.
 */
export function AyahRecallPractice({ textArabic, children }: {
  textArabic: string;
  children?: ReactNode;
}) {
  const [mode, setMode] = useState<"reading" | "recall" | "revealed">("reading");
  const contentId = useId();
  const noteId = useId();
  const primaryButton = useRef<HTMLButtonElement>(null);
  const concealed = mode === "recall";

  function exitPractice() {
    setMode("reading");
    primaryButton.current?.focus();
  }

  return (
    <section className="ayah-recall-practice" aria-label="Hifz recall practice">
      <div className="ayah-recall-actions">
        <button
          ref={primaryButton}
          type="button"
          aria-controls={contentId}
          aria-expanded={!concealed}
          aria-describedby={noteId}
          onClick={() => setMode(concealed ? "revealed" : "recall")}
        >
          {mode === "reading" ? "Start Hifz practice" : concealed ? "Reveal Ayah" : "Hide Ayah again"}
        </button>
        {mode !== "reading" && (
          <button type="button" onClick={exitPractice}>Exit practice</button>
        )}
      </div>
      <p className="ayah-recall-status" role="status" aria-live="polite">
        {mode === "reading"
          ? "Read the Ayah, then hide it to practice recall."
          : concealed
            ? "Ayah and translation hidden. Recall at your own pace, then reveal to compare."
            : "Ayah revealed. Compare with the unchanged source text, or hide it to try again."}
      </p>
      <p id={noteId} className="ayah-recall-note">
        Self-guided practice only: no recording, automated grading, or saved progress. For recitation feedback, consult a qualified teacher.
      </p>
      <div id={contentId}>
        {!concealed && (
          <>
            <p className="ayah-reader-text" dir="rtl" lang="ar">{textArabic}</p>
            {children}
          </>
        )}
      </div>
    </section>
  );
}
