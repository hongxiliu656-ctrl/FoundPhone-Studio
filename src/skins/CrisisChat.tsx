import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Search, Menu, UserRound, MessageCircle, Compass, MoreHorizontal, Plus, Smile, Send, Settings } from "lucide-react";
import type { Item } from "../schema";
import "./crisis-chat.css";
import "./kakao-real.css";

type Line = { who: string; text: string };
const JK = "田柾国 🐰";
const people = [JK, "金泰亨", "妈妈", "朋友"];
const avatars = ["🐰", "🐻", "👩", "💬"];
const avatarPhoto = (name:string) => name===JK?"/FoundPhone-Studio/avatars/jungkook.svg":name==="金泰亨"?"/FoundPhone-Studio/avatars/taehyung.svg":null;
const opening: Line[] = [{ who: JK, text: "你看到世趋了吗？" }];
const sequence: Line[] = [
  {who:"我",text:"我看到了。"},
  {who:"我",text:"现在怎么办。"},
  {who:JK,text:"我先跟公司联系，你先放心，我来解决。"},
  {who:"我",text:"好。"},
  {who:JK,text:"公司在核实消息来源。别去和那些账号争论，我怕你受伤。"},
  {who:"我",text:"可是他们已经找到我的账号了。"},
  {who:JK,text:"我知道。对不起，让你承受这些。"},
  {who:"我",text:"我现在真的很累。"},
  {who:JK,text:"等我回来，我们当面谈。无论你做什么决定，我都会听你说。"},
  {who:"我",text:"我看到有人把我的照片发到评论区了。"},
  {who:JK,text:"把截图留着，不要再点进去看。"},
  {who:"我",text:"我已经把账号设成私密了。"},
  {who:JK,text:"做得好。你现在在家吗？门锁好了吗？"},
  {who:"我",text:"在家。可是电话一直响。"},
  {who:JK,text:"先开勿扰，我让工作人员联系平台处理。"},
  {who:"我",text:"我不想连累你。"},
  {who:JK,text:"你不是负担。我们在一起不是你一个人的决定。"},
  {who:"我",text:"你真的会公开说话吗？"},
  {who:JK,text:"我会先确认措辞，不让任何一句话再伤害你。"},
  {who:"我",text:"我怕你一说话，他们更讨厌我。"},
  {who:JK,text:"所以我不会冲动。我会先把你的安全放在前面。"},
  {who:"我",text:"今天金泰亨也问我怎么样了。"},
  {who:JK,text:"我拜托他有空时照顾一下你，他知道我有多担心。"},
  {who:"我",text:"你是不是还在工作？"},
  {who:JK,text:"刚结束彩排，回酒店了。现在可以好好听你说。"},
  {who:"我",text:"其实我昨天晚上几乎没睡。"},
  {who:JK,text:"我想抱抱你。等我回去，我们先好好休息。"},
  {who:"我",text:"你知道我最难受的是什么吗？"},
  {who:JK,text:"是我没能第一时间站在你身边。对吗？"},
  {who:"我",text:"是所有人都在讨论我们，只有我一个人躲着。"},
  {who:JK,text:"你说得对。我不能让你一个人承担后果。"},
  {who:"我",text:"我需要你给我一个明确的答案。"},
  {who:JK,text:"我会处理公开回应，也会和你商量接下来怎么走。"},
  {who:"我",text:"如果我不想继续了呢？"},
  {who:JK,text:"我会难过，但不会逼你留下。"},
  {who:"我",text:"如果我想继续，你能保证以后不会再这样吗？"},
  {who:JK,text:"我不能保证没有风波，但能保证不再让你独自面对。"},
  {who:"我",text:"我需要一点时间。"},
  {who:JK,text:"我等你。不是要你等我，而是这次换我等你的决定。"},
  {who:"我",text:"你先休息吧，明天再说。"},
  {who:JK,text:"好。记得喝水，别再看那些评论。"},
  {who:"我",text:"我把今天发生的事都写在备忘录里了。"},
  {who:JK,text:"写下来也好。最后怎么选择，你自己决定。"},
  {who:"我",text:"我会认真想清楚。"},
  {who:JK,text:"无论结果是什么，谢谢你愿意告诉我。"}
];
const incoming: Record<string,Line[]> = {
  "金泰亨":[{who:"金泰亨",text:"你还好吗？我看到网上的消息了。先别一个人看那些评论。"},{who:"金泰亨",text:"柾国已经在联系公司，我也会留意。"}],
  "妈妈":[{who:"妈妈",text:"刚刚有人给我发了网上的东西，你没事吧？"},{who:"妈妈",text:"不想说就先别说，记得吃饭。妈妈在。"}],
  "朋友":[{who:"朋友",text:"你上热搜了！先把陌生人私信关掉好不好？"},{who:"朋友",text:"我可以过去陪你，不用自己扛。"}]
};
function loadReplies(): Record<string,string[]> { try { return JSON.parse(localStorage.getItem("foundphone-kkt-replies") || "{}") as Record<string,string[]>; } catch { return {}; } }
export function CrisisChat({owner,history,step,onStep}:{owner:string;history:Item[];step:number;onStep?:(n:number)=>void}) {
  const [section,setSection]=useState("聊天");
  const [room,setRoom]=useState<string|null>(null);
  const [query,setQuery]=useState("");
  const [draft,setDraft]=useState("");
  const [typed,setTyped]=useState("");
  const [typing,setTyping]=useState(false);
  const [replies,setReplies]=useState<Record<string,string[]>>(loadReplies);
  const [readRooms,setReadRooms]=useState<string[]>([]);
  const scroll=useRef<HTMLDivElement>(null);
  const current=sequence[step];
  useEffect(()=>{if(!room || room!==JK || !current || current.who==="我")return;const timer=setTimeout(()=>onStep?.(step+1),900);return ()=>clearTimeout(timer);},[room,step,onStep,current]);
  const isJK=room===JK;
  useEffect(()=>{
    if(!isJK || !current || current.who!=="我"){setTyping(false);setTyped("");return;}
    setTyped("");setTyping(true);
    let n=0;
    const timer=setInterval(()=>{n++;setTyped(current.text.slice(0,n));if(n>=current.text.length){clearInterval(timer);setTyping(false);}},75);
    return ()=>clearInterval(timer);
  },[step,isJK]);
  const previous=history.filter(i=>i.title===room && !i.id.startsWith("crisis-")).slice(-18).map(i=>({who:i.sender===owner?"我":room||"",text:i.body}));
  const messages:Line[]=isJK?[...previous,...opening,...sequence.slice(0,step)]:[...previous,...(step>=4?incoming[room||""]||[]:[])];
  const extras=room?(replies[room]||[]):[];
  useEffect(()=>{if(scroll.current)scroll.current.scrollTop=scroll.current.scrollHeight;},[room,step,typed,replies,history.length]);
  const send=()=>{
    if(!room)return;
    if(isJK && current?.who==="我"){
      if(typed!==current.text)return;
      onStep?.(step+1);
      setTyped("");
      return;
    }
    if(!draft.trim())return;
    const next={...replies,[room]:[...(replies[room]||[]),draft.trim()]};
    setReplies(next);localStorage.setItem("foundphone-kkt-replies",JSON.stringify(next));setDraft("");
  };
  const openRoom=(name:string)=>{setRoom(name);setReadRooms(v=>[...new Set([...v,name])]);setDraft("");};
  const lastText=(name:string)=>{
    if(replies[name]?.length)return replies[name].at(-1)||"";
    if(name===JK)return sequence.slice(0,step).at(-1)?.text||opening[0].text;
    return step>=4?incoming[name]?.at(-1)?.text||"":"";
  };
  return <div className={"crisis-chat kakao-real "+(room?"kakao-in-room":"kakao-on-list")}>
    {!room ? <>
      <header className="kakao-top"><div><strong>{section}</strong><span className="kakao-count">{section==="聊天"?"4":""}</span></div><div className="kakao-actions"><button aria-label="搜索" onClick={()=>document.getElementById("kakao-search")?.focus()}><Search size={21}/></button><button aria-label="菜单"><Menu size={22}/></button><button aria-label="设置" onClick={()=>setSection("更多")}><Settings size={21}/></button></div></header>
      {(section==="聊天"||section==="好友") && <label className="kakao-search"><Search size={15}/><input id="kakao-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索"/></label>}
      <main className="kakao-list">
        {section==="好友" && <><div className="kakao-profile"><div className="kakao-profile-avatar">👤</div><span><strong>{owner}</strong><small>我的个人资料</small></span></div><div className="kakao-list-label">好友 {people.length}</div></>}
        {(section==="好友"||section==="聊天")?people.filter(name=>name.includes(query)).map(name=>{
          const idx=people.indexOf(name);
          const unread=!readRooms.includes(name) && (name===JK||step>=4);
          return <button className="kakao-row" key={name} onClick={()=>openRoom(name)}>
            <span className="kakao-avatar">{avatarPhoto(name)?<img src={avatarPhoto(name)!} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"inherit"}}/>:avatars[idx]}</span>
            <span className="kakao-row-info"><strong>{name}</strong><small>{section==="聊天"?lastText(name):name===JK?"🐰":""}</small></span>
            {section==="聊天"&&<span className="kakao-row-side"><small>上午 9:41</small>{unread&&<b>1</b>}</span>}
          </button>;
        }):<div className="kakao-placeholder">{section==="发现"?"发现好友与频道":"更多设置"}</div>}
      </main>
      <nav className="kakao-tabs">{[{name:"好友",Icon:UserRound},{name:"聊天",Icon:MessageCircle},{name:"发现",Icon:Compass},{name:"更多",Icon:MoreHorizontal}].map(({name,Icon})=><button key={name} className={section===name?"active":""} onClick={()=>{setSection(name);setQuery("");}}><Icon size={23}/><span>{name}</span></button>)}</nav>
    </>:<>
      <header className="kakao-room-head"><button aria-label="返回聊天列表" onClick={()=>setRoom(null)}><ArrowLeft size={23}/></button><strong>{room}</strong><div><button aria-label="搜索聊天"><Search size={21}/></button><button aria-label="聊天菜单"><Menu size={22}/></button></div></header>
      <main className="kakao-messages" ref={scroll}>
        <div className="kakao-date">2026年10月28日 星期三</div>
        {messages.map((m,i)=><div className={"kakao-message "+(m.who==="我"?"outgoing":"incoming")} key={i}>
          {m.who!=="我"&&<span className="kakao-message-avatar">{avatarPhoto(m.who)?<img src={avatarPhoto(m.who)!} alt="" style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"inherit"}}/>:avatars[people.indexOf(m.who)]||"👤"}</span>}
          <div className="kakao-message-content">{m.who!=="我"&&<small>{m.who}</small>}<div className="kakao-message-line"><p>{m.text}</p><time>9:41</time></div></div>
        </div>)}
        {extras.map((text,i)=><div className="kakao-message outgoing" key={"reply-"+i}><div className="kakao-message-content"><div className="kakao-message-line"><p>{text}</p><time>9:41</time></div></div></div>)}
      </main>
      
      <form className="kakao-compose" onSubmit={e=>{e.preventDefault();send();}}>
        <button type="button" aria-label="添加附件"><Plus size={23}/></button>
        {isJK&&current?.who==="我"?<div className="kakao-textbox" aria-label="自动输入的消息">{typed}{typing&&<span className="kakao-caret">│</span>}</div>:<input aria-label="输入消息" placeholder="输入消息" value={draft} onChange={e=>setDraft(e.target.value)}/>}
        <button type="button" aria-label="表情"><Smile size={22}/></button>
        <button className="kakao-send" aria-label="发送消息" disabled={isJK?current?.who!=="我"||typed!==current.text:!draft.trim()}><Send size={19}/></button>
      </form>
      {isJK&&current?.who==="我"&&typing&&<div className="kakao-typing-hint">正在输入… 完成后请亲自点击发送</div>}
    </>}
  </div>;
}
