"use client";

import { useState, type FormEvent } from "react";
import { resolveApiBaseUrl } from "@/lib/api-config";

type SettingsPanelProps = {
  currentSection: string;
};

type ReportState = "idle" | "sending" | "sent" | "error";

const API_BASE_URL = resolveApiBaseUrl();

const categories = [
  { value: "bug", label: "Bug / app error" },
  { value: "audio", label: "Audio / playback issue" },
  { value: "quran", label: "Quran / Ayah / translation issue" },
  { value: "hadith_dua", label: "Hadith or dua issue" },
  { value: "feature", label: "Feature not working" },
  { value: "suggestion", label: "Suggestion / other" }
] as const;

export function SettingsPanel({ currentSection }: SettingsPanelProps) {
  const [category, setCategory] = useState<(typeof categories)[number]["value"]>("bug");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [surahNumber, setSurahNumber] = useState("");
  const [ayahNumber, setAyahNumber] = useState("");
  const [includeDiagnostics, setIncludeDiagnostics] = useState(false);
  const [state, setState] = useState<ReportState>("idle");
  const [message, setMessage] = useState("");

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;

    const details = description.trim();
    if (details.length < 10) {
      setState("error");
      setMessage("Please describe the problem in at least 10 characters.");
      return;
    }

    const hasSurah = surahNumber.trim().length > 0;
    const hasAyah = ayahNumber.trim().length > 0;
    if (category === "quran" && hasSurah !== hasAyah) {
      setState("error");
      setMessage("Enter both the Surah number and Ayah number, or leave both blank.");
      return;
    }
    if (category === "quran" && hasSurah &&
        (!/^\d+$/.test(surahNumber) || Number(surahNumber) < 1 || Number(surahNumber) > 114)) {
      setState("error");
      setMessage("Surah number must be between 1 and 114.");
      return;
    }
    if (category === "quran" && hasAyah &&
        (!/^\d+$/.test(ayahNumber) || Number(ayahNumber) < 1 || Number(ayahNumber) > 286)) {
      setState("error");
      setMessage("Ayah number must be between 1 and 286.");
      return;
    }

    setState("sending");
    setMessage("");
    const diagnostics = includeDiagnostics
      ? JSON.stringify({ userAgent: navigator.userAgent, language: navigator.language })
      : undefined;
    const includeAyahReference = category === "quran" && hasSurah && hasAyah;

    try {
      const response = await fetch(`${API_BASE_URL}/problem-reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          category,
          description: details,
          stepsToReproduce: steps.trim(),
          currentSection,
          appVersion: "0.1.0",
          ...(includeAyahReference ? {
            surahNumber: Number(surahNumber),
            ayahNumber: Number(ayahNumber)
          } : {}),
          ...(diagnostics ? { diagnostics } : {})
        })
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error("The report could not be submitted. Please try again later.");
      }
      if (typeof result !== "object" || result === null ||
          !("data" in result) || typeof result.data !== "object" || result.data === null ||
          !("status" in result.data) || result.data.status !== "received") {
        throw new Error("The server response could not be verified. Please try again.");
      }

      setState("sent");
      setMessage("Your report has been received. Thank you for helping improve DEENVERSE.");
      setDescription("");
      setSteps("");
      setSurahNumber("");
      setAyahNumber("");
      setIncludeDiagnostics(false);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Connection failed. Please try again.");
    }
  }

  return (
    <section className="settings-panel" aria-labelledby="settings-title">
      <div className="settings-heading">
        <p className="eyebrow">YOUR EXPERIENCE</p>
        <h2 id="settings-title">Settings & support</h2>
        <p>Report an issue anywhere in DEENVERSE. Reports are sent directly to the DEENVERSE support system.</p>
      </div>

      <section className="report-card" aria-labelledby="report-title">
        <div className="report-card-heading">
          <span className="report-icon" aria-hidden="true">!</span>
          <div>
            <h3 id="report-title">Report a problem</h3>
            <p>Found a bug, an incorrect display, or something that is not working?</p>
          </div>
        </div>

        <form className="report-form" onSubmit={submitReport}>
          <label>
            Problem type
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as (typeof categories)[number]["value"])}
            >
              {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          {category === "quran" && (
            <div className="report-ayah-fields">
              <label>
                Surah number (optional)
                <input inputMode="numeric" value={surahNumber} onChange={(event) => setSurahNumber(event.target.value)} placeholder="1–114" />
              </label>
              <label>
                Ayah number (optional)
                <input inputMode="numeric" value={ayahNumber} onChange={(event) => setAyahNumber(event.target.value)} placeholder="Ayah number" />
              </label>
              <p>Provide both numbers if the report relates to a specific Ayah.</p>
            </div>
          )}

          <label>
            Describe the problem
            <textarea
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                if (state !== "sending") setState("idle");
              }}
              placeholder="Tell us what happened, where it happened, and what you expected..."
              rows={5}
              required
              minLength={10}
              maxLength={4000}
            />
          </label>

          <label>
            Steps to reproduce (optional)
            <textarea
              value={steps}
              onChange={(event) => setSteps(event.target.value)}
              placeholder="1. Open the section... 2. Tap..."
              rows={3}
              maxLength={2000}
            />
          </label>

          <label className="diagnostics-choice">
            <input
              type="checkbox"
              checked={includeDiagnostics}
              onChange={(event) => setIncludeDiagnostics(event.target.checked)}
            />
            <span>Include browser and device diagnostics to help investigate (optional).</span>
          </label>

          {message && (
            <p className={state === "sent" ? "report-success" : "report-error"} role={state === "error" ? "alert" : "status"} aria-live={state === "error" ? "assertive" : "polite"}>
              {message}
            </p>
          )}
          <button className="primary-button report-submit" type="submit" disabled={state === "sending"}>
            {state === "sending" ? "Submitting…" : state === "sent" ? "Submit another report" : "Submit report"}
            <span>↗</span>
          </button>
          <p className="report-privacy">
            Reports are stored for issue investigation. Device diagnostics are included only if you choose them.
            Reports do not automatically change Quran text or other published religious content.
          </p>
        </form>
      </section>
      <p className="settings-current-section">Current section: <strong>{currentSection}</strong></p>
    </section>
  );
}
