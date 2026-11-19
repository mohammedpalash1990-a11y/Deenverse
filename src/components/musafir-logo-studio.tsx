"use client";

import { useState } from "react";
import { Download, Copy, Check } from "lucide-react";

export function MusafirLogoStudio() {
  const [activeTab, setActiveTab] = useState<"showcase" | "svg-export" | "mockups" | "guidelines">("showcase");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [themePreview, setThemePreview] = useState<"dark" | "light" | "emerald">("dark");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadSvgFile = (svgContent: string, fileName: string) => {
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. Standalone Favicon / App Icon SVG
  const iconOnlySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none">
  <rect width="120" height="120" rx="26" fill="${themePreview === "dark" ? "#121316" : themePreview === "emerald" ? "#102C23" : "#FFFFFF"}" ${themePreview === "light" ? 'stroke="#E4E4E7" stroke-width="2"' : ""}/>
  <g fill="${themePreview === "dark" ? "#DFC38F" : themePreview === "emerald" ? "#E6CFA0" : "#121316"}">
    <path d="M22 36L38 64V94H22V36Z" />
    <path d="M22 26H40L59 60.5L50 76.5L22 26Z" />
    <path d="M80 26H98L61 94L52 78L80 26Z" />
    <path d="M98 36L82 64V94H98V36Z" />
  </g>
  <path d="M60 21.5Q61.5 31.8 70 33Q61.5 34.2 60 44.5Q58.5 34.2 50 33Q58.5 31.8 60 21.5Z" fill="${themePreview === "light" ? "#B8934A" : themePreview === "emerald" ? "#E6CFA0" : "#DFC38F"}" />
</svg>`;

  // 2. Horizontal Navbar Logo SVG
  const horizontalNavbarSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 380 90" fill="none">
  <!-- M Monogram Icon -->
  <g transform="translate(6, 3) scale(0.78)">
    <g fill="${themePreview === "dark" ? "#DFC38F" : themePreview === "emerald" ? "#E6CFA0" : "#121316"}">
      <path d="M22 36L38 64V94H22V36Z" />
      <path d="M22 26H40L59 60.5L50 76.5L22 26Z" />
      <path d="M80 26H98L61 94L52 78L80 26Z" />
      <path d="M98 36L82 64V94H98V36Z" />
    </g>
    <path d="M60 21.5Q61.5 31.8 70 33Q61.5 34.2 60 44.5Q58.5 34.2 50 33Q58.5 31.8 60 21.5Z" fill="${themePreview === "light" ? "#B8934A" : themePreview === "emerald" ? "#E6CFA0" : "#DFC38F"}" />
  </g>
  <!-- Wordmark -->
  <text x="100" y="52" fill="${themePreview === "dark" ? "#F5EFE6" : themePreview === "emerald" ? "#F5EFE6" : "#121316"}" font-family="'Cinzel', Georgia, serif" font-size="34" font-weight="700" letter-spacing="4">MUSAFIR</text>
  <text x="102" y="74" fill="${themePreview === "light" ? "#71717A" : "#A1A1AA"}" font-family="system-ui, sans-serif" font-size="12" font-weight="600" letter-spacing="7">POINT OF SALE</text>
</svg>`;

  // 3. Centered Stacked Logo SVG
  const stackedLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 280" fill="none">
  <g transform="translate(80, 28) scale(1)">
    <g fill="${themePreview === "dark" ? "#DFC38F" : themePreview === "emerald" ? "#E6CFA0" : "#121316"}">
      <path d="M22 36L38 64V94H22V36Z" />
      <path d="M22 26H40L59 60.5L50 76.5L22 26Z" />
      <path d="M80 26H98L61 94L52 78L80 26Z" />
      <path d="M98 36L82 64V94H98V36Z" />
    </g>
    <path d="M60 21.5Q61.5 31.8 70 33Q61.5 34.2 60 44.5Q58.5 34.2 50 33Q58.5 31.8 60 21.5Z" fill="${themePreview === "light" ? "#B8934A" : themePreview === "emerald" ? "#E6CFA0" : "#DFC38F"}" />
  </g>
  <text x="140" y="196" text-anchor="middle" fill="${themePreview === "dark" ? "#F5EFE6" : themePreview === "emerald" ? "#F5EFE6" : "#121316"}" font-family="'Cinzel', Georgia, serif" font-size="32" font-weight="700" letter-spacing="6">MUSAFIR</text>
  <text x="140" y="228" text-anchor="middle" fill="${themePreview === "light" ? "#71717A" : "#A1A1AA"}" font-family="system-ui, sans-serif" font-size="14" font-weight="600" letter-spacing="8">POS</text>
</svg>`;

  return (
    <div className="musafir-studio-container" style={{ padding: "clamp(16px, 3vw, 32px)", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "28px", borderBottom: "1px solid var(--border, #eee)", paddingBottom: "20px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "2px", color: "#B8934A", textTransform: "uppercase" }}>Brand Asset & Export Suite</span>
          <h1 style={{ margin: "4px 0 8px", fontSize: "clamp(1.8rem, 4vw, 2.4rem)", fontFamily: "'Cinzel', Georgia, serif" }}>Musafir POS · লোগো ও ব্র্যান্ড কিট</h1>
          <p style={{ margin: 0, color: "var(--muted, #666)", fontSize: "14px", maxWidth: "600px", lineHeight: "1.6" }}>
            আপনার মুসাফির পিওএস (Musafir POS) সাইটের জন্য সম্পূর্ণ ভেক্টর লোগো, অ্যাপ আইকন, বিলিং রসিদ এবং ওয়েব নেভবার রেডি এসেট।
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => setThemePreview("dark")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: themePreview === "dark" ? "2px solid #DFC38F" : "1px solid #ddd",
              background: "#121316",
              color: "#DFC38F",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Luxury Dark
          </button>
          <button
            onClick={() => setThemePreview("light")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: themePreview === "light" ? "2px solid #121316" : "1px solid #ddd",
              background: "#FFFFFF",
              color: "#121316",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Clean Light
          </button>
          <button
            onClick={() => setThemePreview("emerald")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: themePreview === "emerald" ? "2px solid #E6CFA0" : "1px solid #ddd",
              background: "#102C23",
              color: "#E6CFA0",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: 600
            }}
          >
            Royal Emerald
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", borderBottom: "1px solid var(--border, #eee)", paddingBottom: "12px" }}>
        {[
          { id: "showcase", label: "লোগো ডিজাইন গ্যালারি", icon: "✦" },
          { id: "svg-export", label: "SVG কোড ও ডাউনলোড", icon: "↓" },
          { id: "mockups", label: "পিওএস ও ইনভয়েস প্রিভিউ", icon: "🖨" },
          { id: "guidelines", label: "কালার ও ফন্ট গাইড", icon: "🎨" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              background: activeTab === tab.id ? "var(--surface-active, #f0ede6)" : "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #B8934A" : "2px solid transparent",
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: "14px",
              color: activeTab === tab.id ? "inherit" : "var(--muted, #666)"
            }}
          >
            <span style={{ marginRight: "6px" }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Showcase */}
      {activeTab === "showcase" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
            {/* Primary Dark Card */}
            <div style={{ background: "#121316", borderRadius: "16px", padding: "28px", textAlign: "center", color: "#F5EFE6", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" }}>
              <div style={{ display: "inline-block", width: "160px", height: "160px", margin: "0 auto 16px" }} dangerouslySetInnerHTML={{ __html: iconOnlySvg.replace(/fill="[^"]*"/, 'fill="#121316"').replace(/stroke="[^"]*"/, '') }} />
              <h3 style={{ margin: "0 0 4px", fontFamily: "'Cinzel', serif", fontSize: "22px", color: "#DFC38F", letterSpacing: "3px" }}>MUSAFIR</h3>
              <p style={{ margin: "0 0 16px", fontSize: "11px", letterSpacing: "5px", color: "#A1A1AA" }}>POINT OF SALE</p>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                <button
                  onClick={() => downloadSvgFile(stackedLogoSvg, "musafir-pos-dark-logo.svg")}
                  style={{ background: "#DFC38F", color: "#121316", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Download size={14} /> SVG ডাউনলোড
                </button>
              </div>
            </div>

            {/* Clean Light Card */}
            <div style={{ background: "#FFFFFF", border: "1px solid #E4E4E7", borderRadius: "16px", padding: "28px", textAlign: "center", color: "#121316", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "inline-block", width: "160px", height: "160px", margin: "0 auto 16px" }} dangerouslySetInnerHTML={{ __html: iconOnlySvg.replace('fill="#121316"', 'fill="#FFFFFF"').replace('#DFC38F', '#121316') }} />
              <h3 style={{ margin: "0 0 4px", fontFamily: "'Cinzel', serif", fontSize: "22px", color: "#121316", letterSpacing: "3px" }}>MUSAFIR</h3>
              <p style={{ margin: "0 0 16px", fontSize: "11px", letterSpacing: "5px", color: "#71717A" }}>POINT OF SALE</p>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                <button
                  onClick={() => downloadSvgFile(stackedLogoSvg.replace('#121316', '#FFFFFF'), "musafir-pos-light-logo.svg")}
                  style={{ background: "#121316", color: "#FFFFFF", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Download size={14} /> SVG ডাউনলোড
                </button>
              </div>
            </div>

            {/* Royal Emerald Card */}
            <div style={{ background: "#102C23", borderRadius: "16px", padding: "28px", textAlign: "center", color: "#F5EFE6", boxShadow: "0 10px 30px rgba(16,44,35,0.2)" }}>
              <div style={{ display: "inline-block", width: "160px", height: "160px", margin: "0 auto 16px" }} dangerouslySetInnerHTML={{ __html: iconOnlySvg.replace('fill="#121316"', 'fill="#102C23"').replace('#DFC38F', '#E6CFA0') }} />
              <h3 style={{ margin: "0 0 4px", fontFamily: "'Cinzel', serif", fontSize: "22px", color: "#E6CFA0", letterSpacing: "3px" }}>MUSAFIR</h3>
              <p style={{ margin: "0 0 16px", fontSize: "11px", letterSpacing: "5px", color: "#8EAB9D" }}>POINT OF SALE</p>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                <button
                  onClick={() => downloadSvgFile(stackedLogoSvg.replace('#121316', '#102C23'), "musafir-pos-emerald-logo.svg")}
                  style={{ background: "#E6CFA0", color: "#102C23", border: "none", borderRadius: "8px", padding: "8px 14px", fontSize: "12px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Download size={14} /> SVG ডাউনলোড
                </button>
              </div>
            </div>
          </div>

          {/* Horizontal Navbar Preview */}
          <div style={{ marginTop: "32px", background: themePreview === "dark" ? "#121316" : themePreview === "emerald" ? "#102C23" : "#FFFFFF", border: themePreview === "light" ? "1px solid #E4E4E7" : "none", borderRadius: "14px", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ width: "260px" }} dangerouslySetInnerHTML={{ __html: horizontalNavbarSvg }} />
            <div style={{ display: "flex", gap: "20px", fontSize: "13px", fontWeight: 600, color: themePreview === "light" ? "#52525B" : "#D4D4D8" }}>
              <span>Dashboard</span>
              <span>Point of Sale</span>
              <span>Inventory</span>
              <span>Reports</span>
            </div>
            <button
              onClick={() => copyToClipboard(horizontalNavbarSvg, "navbar-svg")}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: themePreview === "light" ? "#121316" : "#FFF", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}
            >
              {copiedKey === "navbar-svg" ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
              {copiedKey === "navbar-svg" ? "কপি হয়েছে!" : "Navbar SVG কোড কপি"}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: SVG Export */}
      {activeTab === "svg-export" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Card 1: Favicon */}
          <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #eee)", borderRadius: "14px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <h4 style={{ margin: "0 0 4px" }}>১. অ্যাপ আইকন ও ফ্যাভিকন (App Icon / Favicon)</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--muted, #666)" }}>
                  ব্রাউজার ট্যাব, বুকমার্ক, PWA এবং মোবাইল হোমস্ক্রিনের জন্য (120x120 ভেক্টর)।
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => copyToClipboard(iconOnlySvg, "fav-svg")}
                  style={{ background: "#f4f4f5", border: "1px solid #ddd", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  {copiedKey === "fav-svg" ? <Check size={14} color="#10B981" /> : <Copy size={14} />} কোড কপি
                </button>
                <button
                  onClick={() => downloadSvgFile(iconOnlySvg, "musafir-favicon.svg")}
                  style={{ background: "#B8934A", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Download size={14} /> .svg ফাইল ডাউনলোড
                </button>
              </div>
            </div>
            <pre style={{ background: "#18181B", color: "#A1A1AA", padding: "14px", borderRadius: "8px", overflowX: "auto", fontSize: "11px", margin: 0 }}>
              {iconOnlySvg}
            </pre>
          </div>

          {/* Card 2: Navbar Horizontal */}
          <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #eee)", borderRadius: "14px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <h4 style={{ margin: "0 0 4px" }}>২. ওয়েবসাইট হেডার ও নেভবার লোগো (Header Horizontal Logo)</h4>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--muted, #666)" }}>
                  ওয়েব অ্যাপের টপবার বা হেডারে বসানোর জন্য হরিজন্টাল ফরম্যাট (380x90 ভেক্টর)।
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => copyToClipboard(horizontalNavbarSvg, "nav-svg")}
                  style={{ background: "#f4f4f5", border: "1px solid #ddd", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  {copiedKey === "nav-svg" ? <Check size={14} color="#10B981" /> : <Copy size={14} />} কোড কপি
                </button>
                <button
                  onClick={() => downloadSvgFile(horizontalNavbarSvg, "musafir-header-logo.svg")}
                  style={{ background: "#B8934A", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <Download size={14} /> .svg ফাইল ডাউনলোড
                </button>
              </div>
            </div>
            <pre style={{ background: "#18181B", color: "#A1A1AA", padding: "14px", borderRadius: "8px", overflowX: "auto", fontSize: "11px", margin: 0 }}>
              {horizontalNavbarSvg}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Mockups */}
      {activeTab === "mockups" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {/* Mockup 1: Thermal Receipt / POS Invoice */}
          <div style={{ background: "#FCFAF6", border: "1px dashed #D4D4D8", borderRadius: "12px", padding: "24px", maxWidth: "340px", margin: "0 auto", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontFamily: "monospace", color: "#18181B" }}>
            <div style={{ textAlign: "center", borderBottom: "1px dashed #A1A1AA", paddingBottom: "16px", marginBottom: "16px" }}>
              <div style={{ width: "60px", height: "60px", margin: "0 auto 8px" }} dangerouslySetInnerHTML={{ __html: iconOnlySvg.replace('fill="#121316"', 'fill="#18181B"').replace('#DFC38F', '#18181B') }} />
              <div style={{ fontSize: "18px", fontWeight: "bold", letterSpacing: "2px" }}>MUSAFIR POS</div>
              <div style={{ fontSize: "11px", color: "#71717A" }}>Invoice: #INV-2026-8849</div>
              <div style={{ fontSize: "11px", color: "#71717A" }}>Date: 18 Nov 2026 · 14:32</div>
            </div>

            <div style={{ fontSize: "12px", lineHeight: "1.8" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>1x Premium Arabic Oudh</span><span>৳ 2,400</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>2x Turkish Prayer Mat</span><span>৳ 3,200</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span>1x Digital Tasbeeh</span><span>৳ 350</span></div>
              <div style={{ borderTop: "1px dashed #A1A1AA", margin: "10px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "14px" }}><span>TOTAL</span><span>৳ 5,950</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#10B981" }}><span>PAID VIA POS CASH</span><span>৳ 6,000</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#71717A" }}><span>CHANGE</span><span>৳ 50</span></div>
            </div>

            <div style={{ textAlign: "center", marginTop: "20px", fontSize: "10px", color: "#71717A" }}>
              *** ধন্যবাদ আবার আসবেন ***<br />
              Powered by Musafir POS Software
            </div>
          </div>

          {/* Mockup 2: POS Terminal Screen */}
          <div style={{ background: "#18181B", borderRadius: "16px", border: "2px solid #27272A", padding: "20px", color: "#F4F4F5" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #27272A", paddingBottom: "12px", marginBottom: "16px" }}>
              <div style={{ width: "160px" }} dangerouslySetInnerHTML={{ __html: horizontalNavbarSvg }} />
              <div style={{ fontSize: "12px", color: "#10B981", display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981" }} /> Terminal #01 Online
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
              <div style={{ background: "#27272A", padding: "12px", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", color: "#A1A1AA" }}>TODAY SALES</div>
                <div style={{ fontSize: "18px", fontWeight: "bold", color: "#DFC38F" }}>৳ 42,850</div>
              </div>
              <div style={{ background: "#27272A", padding: "12px", borderRadius: "8px" }}>
                <div style={{ fontSize: "11px", color: "#A1A1AA" }}>ORDERS COUNT</div>
                <div style={{ fontSize: "18px", fontWeight: "bold" }}>38 Orders</div>
              </div>
            </div>

            <div style={{ background: "#27272A", padding: "14px", borderRadius: "8px", fontSize: "12px" }}>
              <div style={{ fontWeight: "bold", marginBottom: "8px", color: "#DFC38F" }}>Quick Actions</div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button style={{ flex: 1, padding: "8px", background: "#3F3F46", border: "none", color: "#FFF", borderRadius: "6px", fontSize: "11px" }}>+ New Sale</button>
                <button style={{ flex: 1, padding: "8px", background: "#3F3F46", border: "none", color: "#FFF", borderRadius: "6px", fontSize: "11px" }}>Inventory</button>
                <button style={{ flex: 1, padding: "8px", background: "#DFC38F", color: "#121316", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "bold" }}>Print Receipt</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Guidelines */}
      {activeTab === "guidelines" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #eee)", borderRadius: "14px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 16px" }}>ব্র্যান্ড কালার কোড (Color Codes)</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { name: "Obsidian Black (ম্যাট ব্যাকগ্রাউন্ড)", hex: "#121316" },
                { name: "Champagne Gold (লাক্সারি মনোগ্রাম)", hex: "#DFC38F" },
                { name: "Antique Gold (স্টার অ্যাক্সেন্ট)", hex: "#B8934A" },
                { name: "Royal Emerald (বিকল্প থিম)", hex: "#102C23" },
                { name: "Alabaster White (লাইট মোড)", hex: "#FFFFFF" }
              ].map((color) => (
                <div key={color.hex} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8f8f8", padding: "8px 12px", borderRadius: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: color.hex, border: "1px solid rgba(0,0,0,0.1)" }} />
                    <span style={{ fontSize: "13px" }}>{color.name}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(color.hex, color.hex)}
                    style={{ background: "#fff", border: "1px solid #ddd", borderRadius: "4px", padding: "4px 8px", fontSize: "11px", cursor: "pointer", fontFamily: "monospace" }}
                  >
                    {copiedKey === color.hex ? "কপি হয়েছে" : color.hex}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--surface, #fff)", border: "1px solid var(--border, #eee)", borderRadius: "14px", padding: "20px" }}>
            <h4 style={{ margin: "0 0 16px" }}>প্রস্তাবিত টাইপোগ্রাফি (Fonts)</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "13px", lineHeight: "1.6" }}>
              <div>
                <strong>Brand Heading / Logo:</strong>
                <p style={{ margin: "4px 0", fontFamily: "Cinzel, serif", fontSize: "18px", color: "#B8934A" }}>Cinzel or Cormorant Garamond</p>
                <small style={{ color: "var(--muted, #666)" }}>গুগল ফন্টে সম্পূর্ণ ফ্রি। প্রিমিয়াম লাক্সারি আন্তর্জাতিক লুক তৈরি করে।</small>
              </div>
              <div>
                <strong>UI & POS Interface:</strong>
                <p style={{ margin: "4px 0", fontWeight: "600", fontSize: "15px" }}>Inter or Plus Jakarta Sans</p>
                <small style={{ color: "var(--muted, #666)" }}>পিওএস স্ক্রিন, বাটন, এবং প্রডাক্ট লিস্টে স্পষ্ট পঠনযোগ্যতার জন্য সেরা।</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
