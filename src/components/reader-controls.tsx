"use client";

const unavailableReason = "This control will activate when an approved Quran edition and reader service are connected.";

export function ReaderControls() {
  return (
    <section className="reader-controls" aria-labelledby="reader-controls-title">
      <div className="reader-controls-heading">
        <div>
          <p className="eyebrow">READER TOOLS</p>
          <h3 id="reader-controls-title">Reading controls</h3>
        </div>
        <span className="source-tag">AWAITING APPROVED SOURCE</span>
      </div>
      <div className="reader-controls-grid">
        <label>
          <span>Edition</span>
          <select aria-label="Quran edition" disabled aria-describedby="reader-controls-note">
            <option>No approved edition available</option>
          </select>
        </label>
        <label>
          <span>Surah</span>
          <input aria-label="Surah number" value="—" disabled readOnly aria-describedby="reader-controls-note" />
        </label>
        <label>
          <span>Ayah</span>
          <input aria-label="Ayah number" value="—" disabled readOnly aria-describedby="reader-controls-note" />
        </label>
        <div className="reader-tool-actions">
          <button type="button" disabled aria-label="Play Quran recitation">Play audio</button>
          <button type="button" disabled aria-label="Bookmark current ayah">Bookmark</button>
        </div>
      </div>
      <p id="reader-controls-note" className="reader-controls-note">{unavailableReason} No placeholder scripture or playback is presented.</p>
    </section>
  );
}
