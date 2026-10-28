import { useEffect, useRef, useState } from "react";
import type { Item } from "../schema";
import "./crisis-chat.css";

type Line = { who: string; text: string };
const opening: Line[] = [{ who: "田柾国 🐰", text: "你看到世趋了吗？" }];
const incoming: Record<string, Line[]> = {
  "金泰亨": [{who:"金泰亨",text:"你还好吗？我看到网上的消息了。先别一个人看那些评论。"}, {who:"金泰亨",text:"柾国已经在联系公司，我也会留意。"}],
  "妈妈": [{who:"妈妈",text:"刚刚有人给我发了网上的东西，你没事吧？"}, {who:"妈妈",text:"不想说就先别说，记得吃饭。妈妈在。"}],
  "朋友": [{who:"朋友",text:"你上热搜了！先把陌生人私信关掉好不好？"}, {who:"朋友",text:"我可以过去陪你，不用自己扛。"}]
};
const sequence = [
  {who:"我",text:"我看到了。"},
  {who:"我",text:"现在怎么办。"},
  {who:"田柾国 🐰",text:"我先跟公司联系，你先放心，我来解决。"},
  {who:"我",text:"好。"},
  {who:"田柾国 🐰",text:"公司在核实消息来源。别去和那些账号争论，我怕你受伤。"},
  {who:"我",text:"可是他们已经找到我的账号了。"},
  {who:"田柾国 🐰",text:"我知道。对不起，让你承受这些。"},
  {who:"我",text:"我现在真的很累。"},
  {who:"田柾国 🐰",text:"等我回来，我们当面谈。无论你做什么决定，我都会听你说。"}
];
export function CrisisChat({owner,history,step,onStep}:{owner:string;history:Item[];step:number;onStep?:(n:number)=>void}) {

  const [room,setRoom]=useState<string | null>(null);
  const bottom=useRef<HTMLDivElement>(null);
  const [keyboard,setKeyboard]=useState(false);
  const [typed,setTyped]=useState("");
  useEffect(()=>{if(room!=="田柾国 🐰" || !current || current.who!=="我")return;setKeyboard(true);setTyped("");let i=0;const timer=setInterval(()=>{i++;setTyped(current.text.slice(0,i));if(i>=current.text.length)clearInterval(timer)},90);return ()=>clearInterval(timer);},[step,room]);

  const [sent,setSent]=useState<Record<string,boolean>>({});
  const [otherDraft,setOtherDraft]=useState<Record<string,string>>({});
  const [section,setSection]=useState("聊天");
  const active = room === "田柾国 🐰";
  useEffect(()=>{const node=bottom.current?.parentElement;if(node)node.scrollTop=node.scrollHeight;},[room,step,typed,sent,history.length]);
  const current = sequence[step];
  const contacts = ["田柾国 🐰","金泰亨","妈妈","朋友"];
  const previous = history.filter(i=>i.title===room && !i.id.startsWith("crisis-")).slice(-18).map(i=>({who:i.sender===owner?"我":room,text:i.body}));
  const messages = active ? [...previous,...opening,...sequence.slice(0,step)] : [...previous,...(step>=4?incoming[room || ""]||[]:[])];
  const advance=()=>{
    if(!current)return;
    if(current.who==="我" && typed!==current.text)return;
    onStep?.(step+1);
    setKeyboard(false);
    setTyped("");
  };
  return <div className="crisis-chat">
    {!room ? <><div className="crisis-heading"><strong>{section}</strong><small>⌕ ☰</small></div><div className="crisis-inbox">{section==="聊天" ? contacts.map((name,i)=><button key={name} onClick={()=>setRoom(name)}><span className="crisis-avatar">{["🐰","🐻","👩","💬"][i]}</span><span><strong>{name}</strong><small>{i===0?(sequence[Math.max(0,step-1)]?.text||opening[0].text):step>=4?incoming[name]?.[0]?.text:""}</small></span><span className="crisis-inbox-time">09:41</span></button>) : contacts.map((name,i)=><button key={name} onClick={()=>{setSection("聊天");setRoom(name)}}><span className="crisis-avatar">{["🐰","🐻","👩","💬"][i]}</span><strong>{name}</strong></button>)}</div><nav className="crisis-bottom-nav">{["好友","聊天","发现","更多"].map(t=><button key={t} onClick={()=>setSection(t)} className={section===t?"selected":""}>{t}</button>)}</nav></> : <><div className="crisis-heading"><button onClick={()=>setRoom(null)} aria-label="返回聊天列表">‹</button><strong>{room}</strong><small>⌕ ☰</small></div>
    <div className="crisis-room-title">2026年10月28日 星期三</div>
    <div className="crisis-lines" key={room}>
      {messages.map((m,i)=><div key={i} className={"crisis-bubble "+(m.who==="我"?"mine":"theirs")}><small>{m.who==="我"?owner:m.who}</small><p>{m.text}</p></div>)}
      {!active && step>=4 && sent[room] && <div className="crisis-bubble mine"><small>{owner}</small><p>{otherDraft[room]}</p></div>}
      <div ref={bottom} />
    </div>
    {active && current ? <div className="crisis-compose">
      {current.who==="我" ? <><div className="crisis-input">{typed}<span className="crisis-cursor">│</span></div><button className="crisis-send-button" disabled={typed!==current.text} onClick={advance}>发送 ↑</button>{keyboard&&<><div className="crisis-fake-keyboard" aria-label="剧情自动输入键盘">{["Q W E R T Y U I O P","A S D F G H J K L","⇧ Z X C V B N M ⌫","123  🌐  空格  换行"].map(row=><div key={row}>{row.split(" ").filter(Boolean).map(k=><span key={k}>{k}</span>)}</div>)}</div></>}</> :
      <button className="crisis-next" onClick={advance}>查看田柾国的新消息</button>}
    </div> : active ? <div className="crisis-compose"><p>你们的聊天暂时停在这里。</p></div> :
    <div className="crisis-compose">{step<4?<span>先查看田柾国的消息</span>:<><input aria-label="输入聊天消息" placeholder="输入消息" value={otherDraft[room]||""} onChange={e=>setOtherDraft(v=>({...v,[room]:e.target.value}))}/><button onClick={()=>setSent(v=>({...v,[room]:true}))} disabled={!!sent[room]||!(otherDraft[room]||"").trim()}>{sent[room]?"已发送":"发送 ↑"}</button></>}</div>}
    </>}
  </div>;
}
