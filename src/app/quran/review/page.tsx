"use client";

import { FormEvent, useState, type CSSProperties } from "react";

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1").replace(/\/$/, "");

export default function QuranReviewCoordinatorPage() {
  const [adminToken, setAdminToken] = useState("");
  const [sourceId, setSourceId] = useState("");
  const [surah, setSurah] = useState("1");
  const [ayah, setAyah] = useState("1");
  const [createdBy, setCreatedBy] = useState("");
  const [reviewers, setReviewers] = useState(["", "", ""]);
  const [links, setLinks] = useState<{ reviewer: string; url: string | null; token?: string }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function createBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError(""); setLinks([]);
    try {
      const response = await fetch(`${apiBase}/quran/review-batches`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Review-Admin-Token": adminToken },
        body: JSON.stringify({
          sourceId, surahNumber: Number(surah), ayahNumber: Number(ayah),
          reviewers: reviewers.map((name) => name.trim()), createdBy
        })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message || "Review links could not be created.");
      setLinks(body.data.invites);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Review links could not be created.");
    } finally { setLoading(false); }
  }

  return <main style={{maxWidth:760,margin:"40px auto",padding:"24px",color:"#20342d"}}>
    <a href="/" style={{color:"#7c876f"}}>← DEENVERSE</a>
    <p style={{letterSpacing:2,fontSize:11,color:"#a18a5f",marginTop:32}}>QURAN · TEAM REVIEW</p>
    <h1 style={{fontFamily:"Georgia,serif",fontSize:36,fontWeight:500}}>Create a review team</h1>
    <p style={{lineHeight:1.7,color:"#68756d"}}>Create 3–5 individual, single-use review links for one exact source Ayah. Each reviewer receives a private link; the system records their name, decision, text check and reference check separately.</p>
    <form onSubmit={createBatch} style={{display:"grid",gap:14,marginTop:28}}>
      <label>Review administrator token<input required type="password" autoComplete="off" value={adminToken} onChange={e=>setAdminToken(e.target.value)} style={field}/></label>
      <label>Source ID<input required value={sourceId} onChange={e=>setSourceId(e.target.value)} placeholder="Exact content_sources ID" style={field}/></label>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <label>Surah number<input required type="number" min="1" max="114" value={surah} onChange={e=>setSurah(e.target.value)} style={field}/></label>
        <label>Ayah number<input required type="number" min="1" max="286" value={ayah} onChange={e=>setAyah(e.target.value)} style={field}/></label>
      </div>
      <label>Review batch created by<input required value={createdBy} onChange={e=>setCreatedBy(e.target.value)} style={field}/></label>
      <div style={{display:"grid",gap:10}}>
        <strong>Reviewer names (3–5)</strong>
        {reviewers.map((name,index)=><label key={index}>Reviewer {index+1}<input required value={name} onChange={e=>setReviewers(old=>old.map((v,i)=>i===index?e.target.value:v))} style={field}/></label>)}
        {reviewers.length<5&&<button type="button" onClick={()=>setReviewers(old=>[...old,""])} style={secondary}>+ Add reviewer</button>}
        {reviewers.length>3&&<button type="button" onClick={()=>setReviewers(old=>old.slice(0,-1))} style={secondary}>Remove last reviewer</button>}
      </div>
      <button disabled={loading} style={primary}>{loading?"Creating secure links…":"Create individual review links"}</button>
    </form>
    {error&&<p role="alert" style={{color:"#a33",marginTop:18}}>{error}</p>}
    {links.length>0&&<section style={{marginTop:28,padding:20,background:"#edf0e9",borderRadius:8}}>
      <h2 style={{fontFamily:"Georgia,serif",fontWeight:500}}>Private reviewer links</h2>
      <p>Send each reviewer only their own link. Links expire after 14 days and can be submitted once.</p>
      {links.map(item=><div key={item.reviewer} style={{padding:"12px 0",borderTop:"1px solid #d6ddd3"}}>
        <strong>{item.reviewer}</strong><p style={{overflowWrap:"anywhere",fontSize:13}}>{item.url || item.token}</p>
        <button type="button" style={secondary} onClick={()=>navigator.clipboard.writeText(item.url || item.token || "")}>Copy link</button>
      </div>)}
    </section>}
    <p style={{fontSize:12,lineHeight:1.7,color:"#7a867e",marginTop:32}}>Review is not an approval or publication decision. Every reviewer must compare the exact Arabic text, diacritics and verse boundaries with the cited source. A team result does not replace qualified scholarly sign-off.</p>
  </main>;
}

const field: CSSProperties = {display:"block",width:"100%",padding:12,marginTop:6,border:"1px solid #d9dfd8",borderRadius:5,background:"#fff",color:"#20342d"};
const primary: CSSProperties = {padding:14,background:"#1c382f",color:"#fff",border:0,borderRadius:5,fontWeight:600};
const secondary: CSSProperties = {padding:"8px 12px",background:"#e7e9e1",color:"#20342d",border:0,borderRadius:5};
