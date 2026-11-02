"use client";

import { useMemo, useState } from "react";
import { getSection, sections, type SectionId } from "@/lib/navigation";

const symbols: Record<SectionId, string> = {
  quran: "۞",
  hadith: "◈",
  duas: "✧",
  learn: "⌘",
  bookmarks: "◇",
  settings: "⚙"
};

export function AppShell() {
  const [active, setActive] = useState<SectionId>("quran");
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const section = getSection(active);
  const filtered = useMemo(
    () => sections.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <main className="app-frame">
      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`} aria-label="Main navigation">
        <a className="brand" href="/" aria-label="DEENVERSE home">
          <span className="brand-mark">D<span>·</span></span>
          <span className="brand-copy"><strong>DEENVERSE</strong><small>One universe. Infinite knowledge.</small></span>
        </a>
        <div className="nav-caption">YOUR SPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          {sections.map((item) => (
            <button
              className={`nav-item ${active === item.id ? "active" : ""}`}
              key={item.id}
              onClick={() => { setActive(item.id); setMenuOpen(false); }}
              aria-current={active === item.id ? "page" : undefined}
            >
              <span className="nav-symbol" aria-hidden="true">{symbols[item.id]}</span>
              <span>{item.label}</span>
              {active === item.id && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-note"><span className="privacy-icon">✦</span><div><strong>A quieter kind of space</strong><p>Designed for focus, reflection and learning.</p></div></div>
          <span className="version">FOUNDATION PREVIEW · 0.1</span>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">☰</button>
          <div className="breadcrumb">DEENVERSE <span>/</span> {section.label.toUpperCase()}</div>
          <div className="topbar-right"><span className="status-dot" /> CONTENT SOURCES PENDING REVIEW</div>
        </header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">A MOMENT FOR WHAT MATTERS</p>
              <h1>{active === "quran" ? "Return to the words." : section.label + ", thoughtfully."}</h1>
              <p className="intro">{active === "quran" ? "A calm place to read, reflect and build a lasting connection." : section.description + " — your space to explore at your own pace."}</p>
            </div>
            <div className="date-chip"><span>✧</span> YOUR PERSONAL SPACE</div>
          </section>

          {active === "quran" ? (
            <>
              <section className="continue-card">
                <div className="card-glow" />
                <div className="continue-content">
                  <div className="card-kicker"><span className="tiny-star">✦</span> THE QURAN READER</div>
                  <h2>Begin with intention.</h2>
                  <p>Verified Quran text and approved editions will appear here once their sources and redistribution rights have been reviewed.</p>
                  <div className="card-actions"><button className="primary-button" onClick={() => document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" })}>Explore the reader <span>↗</span></button><span className="edition-label">SOURCE-VERIFIED CONTENT ONLY</span></div>
                </div>
                <div className="ornament" aria-hidden="true"><span>۞</span><i /><b /></div>
              </section>

              <section className="catalogue-section" id="catalogue">
                <div className="section-heading"><div><p className="eyebrow">EXPLORE</p><h2>Quran library</h2></div><span className="count-label">CATALOGUE NOT YET CONNECTED</span></div>
                <div className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a section..." aria-label="Find a section" /></div>
                <div className="catalogue-empty">
                  <div className="empty-symbol">۞</div>
                  <h3>Verified content is on its way</h3>
                  <p>The reader interface is ready for integration. No Quranic text has been fabricated or imported into this preview.</p>
                  <span className="source-tag">CONTENT INTEGRITY GATE · PENDING</span>
                </div>
                <div className="quick-links" role="group" aria-label="Explore sections">
                  {filtered.map((item) => <button key={item.id} onClick={() => setActive(item.id)}><span>{symbols[item.id]}</span>{item.label}<b>↗</b></button>)}
                  {filtered.length === 0 && <p className="no-results">No matching sections.</p>}
                </div>
              </section>
            </>
          ) : (
            <section className="section-placeholder">
              <div className="placeholder-icon">{symbols[active]}</div>
              <p className="eyebrow">COMING IN A VERIFIED RELEASE</p>
              <h2>{section.label}</h2>
              <p>This area is reserved for reviewed, source-attributed content and working features. It will not display invented religious material.</p>
              <button className="secondary-button" onClick={() => setActive("quran")}>Back to Quran <span>↗</span></button>
            </section>
          )}
          <footer className="footer"><span>DEENVERSE © 2026</span><span>Built with care · Content integrity first</span></footer>
        </div>
      </section>
    </main>
  );
}
