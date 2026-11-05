"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSection, sections, type SectionId } from "@/lib/navigation";
import { QuranCatalogue } from "@/components/quran-catalogue";
import { ReaderControls } from "@/components/reader-controls";
import { QuranAyahReader } from "@/components/quran-ayah-reader";
import { HadithReader } from "@/components/hadith-reader";

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
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMobileMenu = () => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMobileMenu();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [menuOpen]);

  const section = getSection(active);
  const filtered = useMemo(
    () => sections.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <aside id="primary-sidebar" className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
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
              onClick={() => { setActive(item.id); if (menuOpen) closeMobileMenu(); }}
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
      {menuOpen && <button type="button" className="sidebar-backdrop" aria-label="Close navigation" onClick={closeMobileMenu} />}

      <main id="main-content" className="main-panel" tabIndex={-1}>
        <header className="topbar">
          <button ref={menuButtonRef} type="button" className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-controls="primary-sidebar" aria-expanded={menuOpen}>☰</button>
          <div className="breadcrumb" aria-live="polite" aria-atomic="true">DEENVERSE <span>/</span> {section.label.toUpperCase()}</div>
          <div className="topbar-right"><span className="status-dot" /> CONTENT SOURCES PENDING REVIEW</div>
        </header>

        <aside className="beta-notice" aria-label="Public beta notice">
          <span className="beta-notice-label">PUBLIC BETA · পাঠক পরীক্ষণ</span>
          <div>
            <strong lang="bn">DEENVERSE এখনো উন্নয়ন ও যাচাইয়ের পর্যায়ে আছে।</strong>
            <p lang="bn">কিছু বিভাগ বা কনটেন্ট অসম্পূর্ণ কিংবা সাময়িকভাবে অনুপলব্ধ থাকতে পারে। কুরআন ও হাদিসের তথ্য ব্যবহারের আগে নির্ভরযোগ্য মূল উৎসের সঙ্গে মিলিয়ে নিন। ভুল বা সমস্যা পেলে আমাদের জানান—পরবর্তী আপডেটে সংশোধন করা হবে।</p>
          </div>
        </aside>

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
                  <p>আরবি পাঠ এখন Tanzil-এর মূল Uthmani ফাইল থেকে checksum মিলিয়ে Public Beta হিসেবে পড়া যাবে। বাংলা অনুবাদ QuranEnc থেকে সংস্করণ-পরিচয়সহ আসবে।</p>
                  <div className="card-actions"><button className="primary-button" onClick={() => document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" })}>Explore the reader <span>↗</span></button><span className="edition-label">PUBLIC BETA · TANZIL + QURANENC</span></div>
                </div>
                <div className="ornament" aria-hidden="true"><span>۞</span><i /><b /></div>
              </section>

              <section className="catalogue-section" id="catalogue">
                <div className="section-heading"><div><p className="eyebrow">EXPLORE</p><h2>Quran library</h2></div><span className="count-label">CATALOGUE NOT YET CONNECTED</span></div>
                <div className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a section..." aria-label="Find a section" /></div>
                <section className="reader-preview" aria-label="Reserved Arabic Quran text area" dir="rtl" lang="ar">
                  <div className="reader-preview-heading">
                    <span className="source-tag">TANZIL PUBLIC BETA</span>
                    <span className="count-label">ARABIC · DIR=RTL</span>
                  </div>
                  <div className="reader-preview-page">
                    <p id="reader-preview-title" dir="ltr">Tanzil Uthmani Arabic — Public Beta</p>
                    <div className="reader-preview-lines" aria-hidden="true"><span /><span /><span /></div>
                  </div>
                </section>
                <ReaderControls />
                <QuranAyahReader />
                <QuranCatalogue />
                <div className="quick-links" role="group" aria-label="Explore sections">
                  {filtered.map((item) => <button key={item.id} onClick={() => setActive(item.id)}><span>{symbols[item.id]}</span>{item.label}<b>↗</b></button>)}
                  {filtered.length === 0 && <p className="no-results">No matching sections.</p>}
                </div>
              </section>
            </>
          ) : active === "hadith" ? (
            <HadithReader />
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
      </main>
    </div>
  );
}
