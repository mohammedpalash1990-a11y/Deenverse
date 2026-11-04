"use client";

import { FormEvent, useEffect, useState } from "react";

const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1").replace(/\/$/, "");
type ReviewData = { reviewerLabel:string; surahNumber:number; ayahNumber:number; arabic:string; source:{edition:string;url:string;attribution:string;licenseId:string;checksum:string}; instructions:string };
export default function QuranAyahReviewPage({ params }: { params: Promise<{ token:string }> }) {
  const [token,setToken]=useState("");
  const [data,setData]=useState<ReviewData|null>(null);
  const [name,setName]=useState("");
  const [decision,setDecision]=useState("passed");
  const [textMatch,setTextMatch]=useState(false);
  const [referenceMatch,setReferenceMatch]=useState(false);
  const [note,setNote]=useState("");
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(true);
  const [submitted,setSubmitted]=useState(false);

  useEffect(()=>{let active=true;params.then(async ({token:value})=>{setToken(value);try{const response=await fetch(`${apiBase}/quran/review/${encodeURIComponent(value)}`);const body=await response.json();if(!response.ok)throw new Error(body?.error?.message||"Review link unavailable.");if(active){setData(body.data);setName(body.data.reviewerLabel);}}catch(error){if(active)setMessage(error instanceof Error?error.message:"Review link unavailable.");}finally{if(active)setLoading(false);}});return()=>{active=false;}},[params]);

  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setMessage("");try{const response=await fetch(`${apiBase}/quran/review/${encodeURIComponent(token)}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reviewerName:name,decision,textMatch,referenceMatch,issueNote:note})});const body=await response.json();if(!response.ok)throw new Error(body?.error?.message||"Review could not be submitted.");setSubmitted(true);setMessage("Your review has been recorded.");}catch(error){setMessage(error instanceof Error?error.message:"Review could not be submitted.");}}

  if(loading)return <main style={wrap}>Review link যাচাই হচ্ছে…</main>;
  if(!data)return <main style={wrap}><h1>Review link unavailable</h1><p role="alert">{message}</p></main>;
  return <main style={wrap}>
    <a href="/" style={{color:"#7c876f"}}>DEENVERSE</a>
    <p style={eyebrow}>QURAN · INVITED REVIEW</p>
    <h1 style={heading}>Ayah review</h1>
    <p>Assigned reviewer: <strong>{data.reviewerLabel}</strong></p>
    <p>Surah {data.surahNumber} · Ayah {data.ayahNumber}</p>
    <article style={arabic} lang="ar" dir="rtl">{data.arabic}</article>
    <section style={sourceBox}><strong>Source and edition</strong><p>{data.source.edition}</p><p>{data.source.attribution}</p><p>License: {data.source.licenseId}</p><p>SHA-256: <code>{data.source.checksum}</code></p><a href={data.source.url} target="_blank" rel="noreferrer">Open original source ↗</a></section>
    <p style={{lineHeight:1.8}}>{data.instructions}</p>
    {submitted?<p role="status">{message}</p>:<form onSubmit={submit} style={{display:"grid",gap:15}}>
      <label>Your full name<input required value={name} onChange={e=>setName(e.target.value)} style={field}/></label>
      <label>Review decision<select value={decision} onChange={e=>setDecision(e.target.value)} style={field}><option value="passed">Exact match confirmed</option><option value="failed">Mismatch found</option><option value="needs_correction">Needs further checking</option></select></label>
      <label style={check}><input type="checkbox" checked={textMatch} onChange={e=>setTextMatch(e.target.checked)}/> I compared the Arabic letters and all diacritics with the original source.</label>
      <label style={check}><input type="checkbox" checked={referenceMatch} onChange={e=>setReferenceMatch(e.target.checked)}/> I confirmed the Surah/Ayah reference and verse boundaries.</label>
      <label>Issue notes<textarea value={note} onChange={e=>setNote(e.target.value)} rows={4} style={field} placeholder="Describe any mismatch; do not edit the Quran text."/></label>
      <button disabled={decision==="passed"&&(!textMatch||!referenceMatch)} style={primary}>Submit my review</button>
      {message&&<p role="alert">{message}</p>}
    </form>}
  </main>;
}
const wrap:React.CSSProperties={maxWidth:760,margin:"36px auto",padding:"24px",color:"#20342d"};
const eyebrow:React.CSSProperties={marginTop:34,color:"#a18a5f",letterSpacing:2,fontSize:11};
const heading:React.CSSProperties={fontFamily:"Georgia,serif",fontWeight:500,fontSize:38};
const arabic:React.CSSProperties={padding:30,margin:"24px 0",background:"#edf0e9",borderRadius:8,fontSize:32,lineHeight:2.2,textAlign:"right"};
const sourceBox:React.CSSProperties={padding:20,background:"#f3f4ef",borderRadius:8,overflowWrap:"anywhere",fontSize:13};
const field:React.CSSProperties={display:"block",width:"100%",padding:12,marginTop:6,border:"1px solid #d9dfd8",borderRadius:5,background:"#fff",color:"#20342d"};
const check:React.CSSProperties={display:"flex",gap:10,alignItems:"flex-start",lineHeight:1.6};
const primary:React.CSSProperties={padding:14,background:"#1c382f",color:"#fff",border:0,borderRadius:5,fontWeight:600};
