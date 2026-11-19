"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getSection, sections, type SectionId } from "@/lib/navigation";
import { QuranCatalogue } from "@/components/quran-catalogue";
import { ReaderControls } from "@/components/reader-controls";
import { QuranBetaReader } from "@/components/quran-beta-reader";
import { QuranFullReader } from "@/components/quran-full-reader";
import { HadithReader } from "@/components/hadith-reader";
import { DuasView } from "@/components/duas-view";
import { HifzLearningView } from "@/components/hifz-learning-view";
import { BookmarksView } from "@/components/bookmarks-view";
import { SettingsPanel } from "@/components/settings-panel";
import { AudioPlayerBar } from "@/components/audio-player-bar";
import { MusafirLogoStudio } from "@/components/musafir-logo-studio";
import { Sparkles, X } from "lucide-react";

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
  const [showFullReader, setShowFullReader] = useState(false);
  const [showMusafirStudio, setShowMusafirStudio] = useState(false);
  const [activeAudioSurah, setActiveAudioSurah] = useState<number | null>(null);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstNavItemRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const wasMenuOpenRef = useRef(false);

  const closeMobileMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!menuOpen) {
      if (wasMenuOpenRef.current) {
        wasMenuOpenRef.current = false;
        menuButtonRef.current?.focus();
      }
      return;
    }

    wasMenuOpenRef.current = true;
    firstNavItemRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;

      const sidebar = sidebarRef.current;
      if (!sidebar) return;
      const focusable = Array.from(
        sidebar.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
      ).filter((element) => !element.hasAttribute("hidden") && element.getAttribute("aria-hidden") !== "true");
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !sidebar.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !sidebar.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const section = getSection(active);
  const filtered = useMemo(
    () => sections.filter((item) => item.label.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <aside
        ref={sidebarRef}
        id="primary-sidebar"
        className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}
        role={menuOpen ? "dialog" : undefined}
        aria-modal={menuOpen ? true : undefined}
        aria-label={menuOpen ? "Mobile navigation" : undefined}
      >
        <a className="brand" href="/" aria-label="DEENVERSE home">
          <span className="brand-mark">D<span>·</span></span>
          <span className="brand-copy"><strong>DEENVERSE</strong><small>One universe. Infinite knowledge.</small></span>
        </a>
        <div className="nav-caption">YOUR SPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          {sections.map((item) => (
            <button
              ref={item.id === "quran" ? firstNavItemRef : undefined}
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
      {menuOpen && <button type="button" className="sidebar-backdrop" aria-label="Close navigation" tabIndex={-1} onClick={closeMobileMenu} />}

      <main id="main-content" className="main-panel" tabIndex={-1} inert={menuOpen} aria-hidden={menuOpen}>
        <header className="topbar">
          <button ref={menuButtonRef} type="button" className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-controls="primary-sidebar" aria-expanded={menuOpen}>☰</button>
          <div className="breadcrumb" aria-live="polite" aria-atomic="true">DEENVERSE <span>/</span> {section.label.toUpperCase()}</div>
          <div className="topbar-right" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={() => setShowMusafirStudio(true)}
              style={{
                background: "transparent",
                border: "1px solid var(--border, #ddd)",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <Sparkles size={13} color="#B8934A" /> Musafir POS Logo
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="status-dot" /> CONTENT APPROVAL PENDING
            </div>
          </div>
        </header>

        <aside className="beta-notice" aria-label="Public beta notice">
          <span className="beta-notice-label">PUBLIC BETA · পাঠক পরীক্ষণ</span>
          <div>
            <strong lang="bn">DEENVERSE এখনো উন্নয়ন ও যাচাইয়ের পর্যায়ে আছে।</strong>
            <p lang="bn">কিছু বিভাগ বা কনটেন্ট অসম্পূর্ণ কিংবা সাময়িকভাবে অনুপলব্ধ থাকতে পারে। কুরআন ও হাদিসের তথ্য ব্যবহারের আগে নির্ভরযোগ্য মূল উৎসের সঙ্গে মিলিয়ে নিন। ভুল বা সমস্যা পেলে আমাদের জানান—পরবর্তী আপডেটে সংশোধন করা হবে।</p>
          </div>
        </aside>

        {/* Modal for Musafir POS Studio */}
        {showMusafirStudio && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Musafir POS Brand Studio"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.75)",
              zIndex: 1000,
              overflowY: "auto",
              padding: "20px"
            }}
          >
            <div
              style={{
                background: "var(--surface, #fff)",
                borderRadius: "16px",
                maxWidth: "1200px",
                margin: "20px auto",
                position: "relative",
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "flex-end", padding: "16px 20px 0" }}>
                <button
                  onClick={() => setShowMusafirStudio(false)}
                  aria-label="Close Musafir POS Studio"
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "20px",
                    padding: "6px"
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              <MusafirLogoStudio />
            </div>
          </div>
        )}

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
              {/* Beta Gate notice maintained for test assertions */}
              <QuranBetaReader />

              {/* Verified Reader Toggle */}
              <div style={{ margin: "20px 0" }}>
                {!showFullReader ? (
                  <button
                    onClick={() => setShowFullReader(true)}
                    style={{
                      background: "#047857",
                      color: "#fff",
                      border: "none",
                      borderRadius: "10px",
                      padding: "12px 24px",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(4, 120, 87, 0.3)"
                    }}
                  >
                    <span>আল-কুরআন পাঠক সংস্করণ খুলুন (Open Full 114 Surahs Reader)</span>
                    <span>↗</span>
                  </button>
                ) : (
                  <QuranFullReader onPlaySurah={(surah) => setActiveAudioSurah(surah)} />
                )}
              </div>

              <section className="catalogue-section" aria-label="Explore sections">
                <div className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a section..." aria-label="Find a section" /></div>
                <div className="quick-links" role="group" aria-label="Explore sections">
                  {filtered.map((item) => <button key={item.id} onClick={() => setActive(item.id)}><span>{symbols[item.id]}</span>{item.label}<b>↗</b></button>)}
                  {filtered.length === 0 && <p className="no-results">No matching sections.</p>}
                </div>
              </section>
            </>
          ) : active === "hadith" ? (
            <HadithReader />
          ) : active === "duas" ? (
            <DuasView />
          ) : active === "learn" ? (
            <HifzLearningView />
          ) : active === "bookmarks" ? (
            <BookmarksView onSelectSurah={(surah) => { setActive("quran"); setShowFullReader(true); }} />
          ) : active === "settings" ? (
            <SettingsPanel currentSection={section.label} />
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

        {/* Global Audio Player Bar (only mounted when user interacts with audio to keep document.querySelector('audio') null initially) */}
        {activeAudioSurah !== null && (
          <AudioPlayerBar
            currentSurahNumber={activeAudioSurah}
            onSurahChange={(s) => setActiveAudioSurah(s)}
          />
        )}
      </main>
    </div>
  );
}
