"use client";

import { FormEvent, useState } from "react";

type SettingsPanelProps = {
  currentSection: string;
};

const REPORT_URL = "https://github.com/mohammedpalash1990-a11y/Deenverse/issues/new";

export function SettingsPanel({ currentSection }: SettingsPanelProps) {
  const [category, setCategory] = useState("Bug / app error");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [includeDiagnostics, setIncludeDiagnostics] = useState(false);
  const [error, setError] = useState("");

  function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const details = description.trim();
    if (details.length < 10) {
      setError("Please describe the problem in at least 10 characters.");
      return;
    }

    const diagnostics = includeDiagnostics
      ? `\n\n### Technical details (shared with your consent)\n- App version: 0.1.0\n- Browser/device: ${navigator.userAgent}\n- Language: ${navigator.language}\n- Current page: ${currentSection}`
      : `\n\n### App details\n- App version: 0.1.0\n- Current page: ${currentSection}\n- Device diagnostics: Not shared`;
    const body = [
      "### Problem description",
      details,
      "",
      "### Steps to reproduce (optional)",
      steps.trim() || "Not provided",
      diagnostics,
      "",
      "---",
      "Submitted through the DEENVERSE in-app problem report."
    ].join("\n");
    const params = new URLSearchParams({
      title: `[${category}] ${details.slice(0, 70)}`,
      body,
      labels: "bug"
    });
    window.location.assign(`${REPORT_URL}?${params.toString()}`);
  }

  return (
    <section className="settings-panel" aria-labelledby="settings-title">
      <div className="settings-heading">
        <p className="eyebrow">YOUR EXPERIENCE</p>
        <h2 id="settings-title">Settings & support</h2>
        <p>One place to report a problem anywhere in DEENVERSE.</p>
      </div>

      <section className="report-card" aria-labelledby="report-title">
        <div className="report-card-heading">
          <span className="report-icon" aria-hidden="true">!</span>
          <div>
            <h3 id="report-title">Report a problem</h3>
            <p>Found a bug, an error, or something that is not working?</p>
          </div>
        </div>

        <form className="report-form" onSubmit={submitReport}>
          <label>
            Problem type
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option>Bug / app error</option>
              <option>Audio / playback issue</option>
              <option>Quran or content issue</option>
              <option>Hadith or dua issue</option>
              <option>Feature not working</option>
              <option>Suggestion / other</option>
            </select>
          </label>

          <label>
            Describe the problem
            <textarea
              value={description}
              onChange={(event) => { setDescription(event.target.value); setError(""); }}
              placeholder="Tell us what happened and what you expected..."
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

          {error && <p className="report-error" role="alert">{error}</p>}
          <button className="primary-button report-submit" type="submit">Continue to submit report <span>↗</span></button>
          <p className="report-privacy">Your report opens the DEENVERSE GitHub issue form so you can review it before submitting. No report or device diagnostics are sent until you submit there. A GitHub account is required.</p>
        </form>
      </section>
      <p className="settings-current-section">Current section: <strong>{currentSection}</strong></p>
    </section>
  );
}
