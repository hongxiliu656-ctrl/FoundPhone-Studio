import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Search, MoreHorizontal } from "lucide-react";
import { useSkinState } from "../skinState";
import { Avatar } from "./shared";
import type { SkinProps } from "../AppSkins";
import type { Item } from "../schema";
import "./direct-messages.css";

export function DirectMessages({p,platform,onExit}:{p:SkinProps;platform:"instagram"|"threads";onExit:()=>void}) {
  const [room,setRoom]=useState<string|null>(null);
  const [search,setSearch]=useState("");
  const [draft,setDraft]=useState("");
  const [sent,setSent]=useSkinState<string[]>(p,platform+"-dm-sent",[]);
  const [readRooms,setReadRooms]=useSkinState<string[]>(p,platform+"-dm-read",[]);
  const end=useRef<HTMLDivElement>(null);
  const all=p.items.filter(i=>i.folder==="私信" || i.meta.type==="dm" || i.meta.dm==="true");
  const people=[...new Set(all.map(i=>i.sender || i.title))];
  const lines=all.filter(i=>(i.sender || i.title)===room || i.title===room);
  const mine=sent.flatMap(raw=>{try{const v:unknown=JSON.parse(raw);return Array.isArray(v)&&v.length===2&&v.every(x=>typeof x==="string")&&v[0]===room?[v[1] as string]:[]}catch{return []}});
  useEffect(()=>{end.current?.scrollIntoView({block:"end"});},[room,lines.length,mine.length]);
  const open=(name:string)=>{setRoom(name);setDraft("");setReadRooms([...new Set([...readRooms,name])]);all.filter(i=>i.sender===name||i.title===name).forEach(i=>p.onRead(i.id));};
  const send=()=>{if(!draft.trim()||!room)return;setSent([...sent,JSON.stringify([room,draft.trim()])]);setDraft("");};
  return <section className={"direct-messages dm-"+platform}>
    <header className="dm-head"><button aria-label="返回" onClick={()=>room?setRoom(null):onExit()}><ArrowLeft size={22}/></button><strong>{room|| (platform==="instagram"?"消息":"收件箱")}</strong><MoreHorizontal size={21}/></header>
    {room ? <><div className="dm-thread" key={room}><div className="dm-person"><Avatar name={room}/><strong>{room}</strong><small>{platform==="instagram"?"Instagram":"Threads"} · 私信</small></div>
      {lines.map((m:Item)=><div key={m.id} className={"dm-bubble "+(m.outgoing?"dm-me":"dm-them")}>{m.body}</div>)}
      {mine.map((body,i)=><div key={"mine-"+i} className="dm-bubble dm-me">{body}</div>)}<div ref={end}/></div>
      <form className="dm-compose" onSubmit={e=>{e.preventDefault();send()}}><input aria-label="输入私信" placeholder="发送消息…" value={draft} onChange={e=>setDraft(e.target.value)}/><button aria-label="发送私信" disabled={!draft.trim()}><Send size={20}/></button></form></>
      : <><label className="dm-search"><Search size={17}/><input placeholder="搜索" aria-label="搜索私信" value={search} onChange={e=>setSearch(e.target.value)}/></label><div className="dm-list">{people.filter(name=>name.toLowerCase().includes(search.toLowerCase())).map(name=>{const latest=all.filter(i=>i.sender===name||i.title===name).at(-1);return <button key={name} onClick={()=>open(name)}><Avatar name={name} src={latest?.avatar}/><span><strong>{name}</strong><small>{latest?.body||"开始聊天"}</small></span>{!readRooms.includes(name)&&<i aria-label="未读消息"/>}</button>})}{!people.length&&<p className="dm-empty">暂无私信</p>}</div></>}
  </section>;
}
