"use client";

import { useEffect, useState } from "react";
import { TAJWEED_RULES, type TajweedRuleItem } from "@/data/tajweed-data";
import { QURAN_SURAHS, type QuranSurah } from "@/data/quran-surahs";
import {
  loadLocalHifzRecords,
  saveLocalHifzRecords,
  type HifzRecord
} from "@/lib/user-store";
import { AyahRecallPractice } from "./ayah-recall-practice";
import { Plus, Check, Trash2, Star, BookOpen, Sparkles, RefreshCw, AlertCircle } from "lucide-react";

export function HifzLearningView() {
  const [activeTab, setActiveTab] = useState<"daily" | "hifz" | "recall" | "tajweed">("daily");

  // Hifz state
  const [hifzRecords, setHifzRecords] = useState<HifzRecord[]>([]);
  const [newSurah, setNewSurah] = useState("1");
  const [startAyah, setStartAyah] = useState("1");
  const [endAyah, setEndAyah] = useState("7");
  const [newStatus, setNewStatus] = useState<"learning" | "memorized" | "revising">("learning");

  // Ayah recall test state
  const [recallText, setRecallText] = useState("بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ");
  const [recallRef, setRecallRef] = useState("সূরা আল-ফাতিহা: ১");

  // Tajweed category filter
  const [tajweedCategory, setTajweedCategory] = useState<string>("all");

  useEffect(() => {
    setHifzRecords(loadLocalHifzRecords());
  }, []);

  const addHifzRecord = () => {
    const surahNum = Number(newSurah);
    const start = Number(startAyah);
    const end = Number(endAyah);

    if (isNaN(surahNum) || isNaN(start) || isNaN(end) || start < 1 || end < start) {
      return;
    }

    const newRecord: HifzRecord = {
      id: `hifz-${Date.now()}`,
      userId: "guest",
      surahNumber: surahNum,
      startAyah: start,
      endAyah: end,
      status: newStatus,
      revisionCount: newStatus === "revising" ? 1 : 0,
      lastRevisionDate: new Date().toISOString(),
      masteryLevel: newStatus === "memorized" ? 5 : 3,
      updatedAt: new Date().toISOString()
    };

    const updated = [newRecord, ...hifzRecords];
    setHifzRecords(updated);
    saveLocalHifzRecords(updated);
  };

  const removeHifzRecord = (id: string) => {
    const updated = hifzRecords.filter((r) => r.id !== id);
    setHifzRecords(updated);
    saveLocalHifzRecords(updated);
  };

  const incrementRevision = (id: string) => {
    const updated = hifzRecords.map((r) =>
      r.id === id
        ? {
            ...r,
            revisionCount: r.revisionCount + 1,
            lastRevisionDate: new Date().toISOString(),
            status: "revising" as const
          }
        : r
    );
    setHifzRecords(updated);
    saveLocalHifzRecords(updated);
  };

  const setMastery = (id: string, stars: number) => {
    const updated = hifzRecords.map((r) =>
      r.id === id ? { ...r, masteryLevel: stars } : r
    );
    setHifzRecords(updated);
    saveLocalHifzRecords(updated);
  };

  const sampleRecallAyahs = [
    { title: "সূরা আল-ফাতিহা: ১-২", text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" },
    { title: "সূরা আল-ইখলাস: ১-৪", text: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ" },
    { title: "সূরা আল-ফালাক্ব: ১-৩", text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ" },
    { title: "সূরা আন-নাস: ১-৩", text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ" }
  ];

  return (
    <div className="hifz-learning-view" style={{ marginTop: "24px" }}>
      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border, #eee)", paddingBottom: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[
          { id: "daily", label: "দৈনিক আয়াত ও স্মরণিকা", icon: "✧" },
          { id: "hifz", label: "হিফজ ও পুনরাবৃত্তি ট্র্যাকার", icon: "📖" },
          { id: "recall", label: "স্মৃতি পরীক্ষা (Recall Practice)", icon: "🧠" },
          { id: "tajweed", label: "তাজবীদ নির্দেশিকা", icon: "۞" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              background: activeTab === tab.id ? "var(--surface-active, #f0ede6)" : "transparent",
              border: "none",
              borderBottom: activeTab === tab.id ? "2px solid #047857" : "2px solid transparent",
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: "14px",
              color: activeTab === tab.id ? "#047857" : "inherit"
            }}
          >
            <span style={{ marginRight: "6px" }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Daily Reminder */}
      {activeTab === "daily" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Featured Daily Ayah */}
          <article
            style={{
              padding: "clamp(20px, 3.5vw, 32px)",
              borderRadius: "16px",
              border: "1px solid rgba(4, 120, 87, 0.2)",
              background: "var(--surface, #fff)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.03)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", color: "#047857", textTransform: "uppercase" }}>
                আজকের আয়াত ও তাদাব্বুর
              </span>
              <span style={{ fontSize: "12px", color: "var(--muted, #666)" }}>সূরা আল-বাক্বারা: ১৫২</span>
            </div>

            <p
              lang="ar"
              dir="rtl"
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: "clamp(24px, 4vw, 32px)",
                lineHeight: "2.2",
                textAlign: "right",
                color: "var(--arabic-color, #111)",
                margin: "16px 0"
              }}
            >
              فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ
            </p>

            <div style={{ marginTop: "16px", fontSize: "15px", lineHeight: "1.8" }}>
              <strong>অনুবাদ (ড. আবু বকর মুহাম্মাদ যাকারিয়া):</strong>
              <p style={{ margin: "6px 0" }}>
                “কাজেই তোমরা আমাকে স্মরণ কর, আমিও তোমাদেরকে স্মরণ করব। আর তোমরা আমার প্রতি কৃতজ্ঞ হও এবং অকৃতজ্ঞ হয়ো না।”
              </p>
            </div>

            <div style={{ marginTop: "16px", background: "rgba(4, 120, 87, 0.05)", borderRadius: "10px", padding: "14px 18px", fontSize: "13px", lineHeight: "1.7" }}>
              <strong style={{ color: "#047857" }}>জীবনোপলব্ধি (Reflection):</strong>
              <p style={{ margin: "4px 0 0" }}>
                মহান রবের স্মরণ বান্দার অন্তরে পরম প্রশান্তি বয়ে আনে। সুখ ও দুঃখ—উভয় অবস্থায় শোকরগোযারি বান্দা হিসেবে নিজেকে গড়ে তোলার অনুপ্রেরণা দেয় এই আয়াত।
              </p>
            </div>
          </article>

          {/* Daily Reminder 2 */}
          <article
            style={{
              padding: "24px",
              borderRadius: "14px",
              border: "1px solid var(--border, #ddd)",
              background: "var(--surface, #fff)"
            }}
          >
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "1.5px", color: "#B45309", textTransform: "uppercase" }}>
              দৈনিক হাদিসের শিক্ষা
            </span>
            <p
              lang="ar"
              dir="rtl"
              style={{
                fontFamily: "'Amiri', serif",
                fontSize: "22px",
                lineHeight: "2",
                textAlign: "right",
                margin: "12px 0",
                color: "var(--arabic-color, #111)"
              }}
            >
              خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
            </p>
            <p style={{ margin: "6px 0", fontSize: "14px", lineHeight: "1.7" }}>
              “তোমাদের মধ্যে সর্বোত্তম সেই ব্যক্তি, যে নিজে কুরআন শিক্ষা করে এবং অন্যকে শিক্ষা দেয়।”
            </p>
            <small style={{ color: "var(--muted, #666)" }}>সহীহ আল-বুখারী: ৫০২৭</small>
          </article>
        </div>
      )}

      {/* Tab 2: Hifz Tracker */}
      {activeTab === "hifz" && (
        <div>
          {/* Add Goal Form */}
          <div
            style={{
              padding: "20px",
              borderRadius: "14px",
              border: "1px solid var(--border, #ddd)",
              background: "var(--surface, #fff)",
              marginBottom: "24px"
            }}
          >
            <h4 style={{ margin: "0 0 14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Plus size={16} color="#047857" /> নতুন হিফজ লক্ষ্য বা রিভিশন যোগ করুন
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "14px" }}>
              <label style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span>সূরা নির্বাচন:</span>
                <select
                  value={newSurah}
                  onChange={(e) => {
                    const sNum = Number(e.target.value);
                    setNewSurah(e.target.value);
                    const s = QURAN_SURAHS.find((item: QuranSurah) => item.number === sNum);
                    if (s) {
                      setStartAyah("1");
                      setEndAyah(String(s.ayahCount));
                    }
                  }}
                  style={{ padding: "8px", borderRadius: "8px", border: "1px solid var(--border, #ddd)", background: "var(--surface, #fff)" }}
                >
                  {QURAN_SURAHS.map((s: QuranSurah) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.nameBengali} ({s.nameArabic}) - {s.ayahCount} আয়াত
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span>শুরুর আয়াত:</span>
                <input
                  type="number"
                  min="1"
                  value={startAyah}
                  onChange={(e) => setStartAyah(e.target.value)}
                  style={{ padding: "8px", borderRadius: "8px", border: "1px solid var(--border, #ddd)", background: "var(--surface, #fff)" }}
                />
              </label>

              <label style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span>শেষের আয়াত:</span>
                <input
                  type="number"
                  min="1"
                  value={endAyah}
                  onChange={(e) => setEndAyah(e.target.value)}
                  style={{ padding: "8px", borderRadius: "8px", border: "1px solid var(--border, #ddd)", background: "var(--surface, #fff)" }}
                />
              </label>

              <label style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span>বর্তমান অবস্থা:</span>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as typeof newStatus)}
                  style={{ padding: "8px", borderRadius: "8px", border: "1px solid var(--border, #ddd)", background: "var(--surface, #fff)" }}
                >
                  <option value="learning">মুখস্থ করছি (Learning)</option>
                  <option value="memorized">মুখস্থ সম্পন্ন (Memorized)</option>
                  <option value="revising">পুনরাবৃত্তি চলছে (Revising)</option>
                </select>
              </label>
            </div>

            <button
              onClick={addHifzRecord}
              style={{
                background: "#047857",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "8px 18px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              তালিকায় যোগ করুন
            </button>
          </div>

          {/* List of tracked Surahs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {hifzRecords.map((item) => {
              const surah = QURAN_SURAHS.find((s: QuranSurah) => s.number === item.surahNumber);
              return (
                <article
                  key={item.id}
                  style={{
                    padding: "18px 20px",
                    borderRadius: "14px",
                    border: "1px solid var(--border, #ddd)",
                    background: "var(--surface, #fff)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "14px"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: item.status === "memorized" ? "rgba(16, 185, 129, 0.1)" : item.status === "revising" ? "rgba(59, 130, 246, 0.1)" : "rgba(245, 158, 11, 0.1)",
                          color: item.status === "memorized" ? "#047857" : item.status === "revising" ? "#2563EB" : "#D97706"
                        }}
                      >
                        {item.status === "memorized" ? "মুখস্থ সম্পন্ন" : item.status === "revising" ? "রিভিশন চলছে" : "শিখছি"}
                      </span>
                      <small style={{ color: "var(--muted, #666)" }}>
                        রিভিশন: {item.revisionCount} বার
                      </small>
                    </div>

                    <h4 style={{ margin: "2px 0" }}>
                      সূরা {surah?.nameBengali || item.surahNumber} ({surah?.nameArabic}) · আয়াত {item.startAyah} - {item.endAyah}
                    </h4>

                    {/* Star rating */}
                    <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setMastery(item.id, star)}
                          style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: star <= item.masteryLevel ? "#F59E0B" : "var(--border, #ccc)" }}
                        >
                          <Star size={14} fill={star <= item.masteryLevel ? "#F59E0B" : "none"} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      onClick={() => incrementRevision(item.id)}
                      style={{
                        padding: "8px 14px",
                        background: "rgba(4, 120, 87, 0.1)",
                        border: "1px solid rgba(4, 120, 87, 0.3)",
                        color: "#047857",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <RefreshCw size={12} /> রিভিশন কাউন্ট +১
                    </button>

                    <button
                      onClick={() => removeHifzRecord(item.id)}
                      style={{
                        background: "transparent",
                        border: "1px solid var(--border, #ddd)",
                        color: "#DC2626",
                        padding: "8px 10px",
                        borderRadius: "8px",
                        cursor: "pointer"
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </article>
              );
            })}

            {hifzRecords.length === 0 && (
              <p style={{ textAlign: "center", padding: "40px", color: "var(--muted, #666)" }}>
                এখনো কোনো সূরা হিফজ তালিকায় যোগ করা হয়নি। উপরের ফর্ম থেকে সূরা নির্বাচন করে শুরু করুন।
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Ayah Recall Practice */}
      {activeTab === "recall" && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ margin: "0 0 10px" }}>স্মৃতি থেকে আয়াত পাঠের অনুশীলন (Recall Training)</h4>
            <p style={{ margin: "0 0 16px", fontSize: "14px", color: "var(--muted, #666)" }}>
              নিচের আয়াতগুলো থেকে নির্বাচন করুন অথবা নিজের পছন্দের আয়াত দিয়ে মুখস্থ পরীক্ষা করুন। শব্দের ওপর ক্লিক করে দেখা বা লুকানো যায়।
            </p>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
              {sampleRecallAyahs.map((sample) => (
                <button
                  key={sample.title}
                  onClick={() => {
                    setRecallText(sample.text);
                    setRecallRef(sample.title);
                  }}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: recallRef === sample.title ? "1px solid #047857" : "1px solid var(--border, #ddd)",
                    background: recallRef === sample.title ? "rgba(4, 120, 87, 0.1)" : "var(--surface, #fff)",
                    fontSize: "12px",
                    cursor: "pointer"
                  }}
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: "24px", borderRadius: "14px", border: "1px solid var(--border, #ddd)", background: "var(--surface, #fff)" }}>
            <h4 style={{ margin: "0 0 14px", color: "#047857" }}>{recallRef}</h4>
            <AyahRecallPractice textArabic={recallText} />
          </div>
        </div>
      )}

      {/* Tab 4: Tajweed Guide */}
      {activeTab === "tajweed" && (
        <div>
          {/* Scholarly Disclaimer */}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", background: "rgba(217, 119, 6, 0.08)", border: "1px solid rgba(217, 119, 6, 0.2)", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", fontSize: "12px", lineHeight: "1.6" }}>
            <AlertCircle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong>শিক্ষণীয় নির্দেশিকা সংক্রান্ত সতর্কতা:</strong>
              <p style={{ margin: "2px 0 0" }}>
                এই নির্দেশিকাটি শিক্ষানবিসদের তাজবীদের মূল নিয়মাবলি বুঝতে সহায়তার জন্য সংকলিত। কুরআনুল কারীম বিশুদ্ধভাবে তিলাওয়াত শেখার জন্য একজন নির্ভরযোগ্য ক্বারীর সরাসরি তত্ত্বাবধানে মশক করা অপরিহার্য।
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {TAJWEED_RULES.map((rule) => (
              <article
                key={rule.id}
                style={{
                  padding: "24px",
                  borderRadius: "14px",
                  border: "1px solid var(--border, #ddd)",
                  background: "var(--surface, #fff)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 2px", fontSize: "18px" }}>{rule.titleBengali}</h3>
                    <small style={{ color: "var(--muted, #666)" }}>{rule.titleEnglish}</small>
                  </div>
                  <span
                    lang="ar"
                    dir="rtl"
                    style={{
                      fontFamily: "'Amiri', serif",
                      fontSize: "20px",
                      color: "#047857",
                      fontWeight: "bold"
                    }}
                  >
                    {rule.arabicName}
                  </span>
                </div>

                <p style={{ fontSize: "14px", lineHeight: "1.8", margin: "0 0 12px" }}>
                  {rule.descriptionBengali}
                </p>

                {/* Letters Badges */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", margin: "14px 0" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>নির্দিষ্ট হরফসমূহ:</span>
                  {rule.letters.map((char) => (
                    <span
                      key={char}
                      lang="ar"
                      style={{
                        padding: "4px 10px",
                        borderRadius: "8px",
                        background: "rgba(4, 120, 87, 0.1)",
                        color: "#047857",
                        fontSize: "18px",
                        fontFamily: "'Amiri', serif",
                        fontWeight: "bold"
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </div>

                <div style={{ background: "var(--surface-active, #f8f8f8)", padding: "12px 16px", borderRadius: "10px", fontSize: "12px", margin: "12px 0" }}>
                  <strong>সারসংক্ষেপ:</strong> {rule.ruleSummary}
                </div>

                {/* Real Examples */}
                <div style={{ marginTop: "16px" }}>
                  <strong style={{ fontSize: "13px" }}>কুরআন থেকে বাস্তব উদাহরণ:</strong>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "10px", marginTop: "8px" }}>
                    {rule.examples.map((ex, i) => (
                      <div key={i} style={{ border: "1px solid var(--border, #eee)", borderRadius: "8px", padding: "10px 14px" }}>
                        <div
                          lang="ar"
                          dir="rtl"
                          style={{
                            fontFamily: "'Amiri', serif",
                            fontSize: "20px",
                            textAlign: "right",
                            color: "#047857",
                            marginBottom: "4px"
                          }}
                        >
                          {ex.arabic}
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted, #666)" }}>{ex.surahRef}</div>
                        <div style={{ fontSize: "12px", marginTop: "4px" }}>{ex.explanation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
