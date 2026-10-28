import { useState } from "react";
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
export function CrisisChat({owner,history}:{owner:string;history:Item[]}) {
  const [step,setStep]=useState(0);
  const [room,setRoom]=useState("田柾国 🐰");
  const [keyboard,setKeyboard]=useState(false);
  const [choice,setChoice]=useState("");
  const [sent,setSent]=useState<Record<string,boolean>>({});
  const active = room === "田柾国 🐰";
  const current = sequence[step];
  const contacts = ["田柾国 🐰","金泰亨","妈妈","朋友"];
  const previous = history.filter(i=>i.title===room && !i.id.startsWith("crisis-")).slice(-18).map(i=>({who:i.sender===owner?"我":room,text:i.body}));
  const messages = active ? [...previous,...opening,...sequence.slice(0,step)] : [...previous,...(step>=4?incoming[room]||[]:[])];
  const advance=()=>{
    if(!current)return;
    setStep(v=>v+1);
    setKeyboard(false);
  };
  return <div className="crisis-chat">
    <div className="crisis-heading"><strong>KakaoTalk</strong><small>虚构互动剧情 · 仅在模拟器内</small></div>
    <div className="crisis-rooms">{contacts.map(c=><button key={c} className={room===c?"selected":""} onClick={()=>{setRoom(c);setKeyboard(false)}}>{c}{c!=="田柾国 🐰"&&step>=4?" ●":""}</button>)}</div>
    <div className="crisis-room-title">{room}</div>
    <div className="crisis-lines" key={room}>
      {messages.map((m,i)=><div key={i} className={"crisis-bubble "+(m.who==="我"?"mine":"theirs")}><small>{m.who==="我"?owner:m.who}</small><p>{m.text}</p></div>)}
      {!active && step>=4 && sent[room] && <div className="crisis-bubble mine"><small>{owner}</small><p>{room==="妈妈"?"妈，我没事，晚点给你打电话。":room==="朋友"?"谢谢你，我需要的时候会找你。":"谢谢你，我现在还好。"}</p></div>}
    </div>
    {choice ? <div className="crisis-result"><h3>{choice==="分手"?"你决定分手":"你决定继续"}</h3><p>{choice==="分手"?"你告诉他，你需要离开这段让你疲惫的关系。":"你告诉他，继续在一起的前提是以后不能再让你独自面对。"} 他答应尊重你的决定。</p><button onClick={()=>setChoice("")}>返回聊天</button></div> :
    active && current ? <div className="crisis-compose">
      {current.who==="我" ? <><button onClick={()=>setKeyboard(true)} className="crisis-input">{keyboard?current.text:"点击输入消息…"}</button>{keyboard&&<><div className="crisis-fake-keyboard" aria-label="剧情自动输入键盘">{["Q W E R T Y U I O P","A S D F G H J K L","⇧ Z X C V B N M ⌫","123　 空格　　 完成"].map(row=><div key={row}>{row.split(" ").filter(Boolean).map(k=><span key={k}>{k}</span>)}</div>)}</div><button className="crisis-send" onClick={advance}>发送</button></>}</> :
      <button className="crisis-next" onClick={advance}>查看田柾国的新消息</button>}
    </div> : active ? <div className="crisis-compose"><p>你们的聊天暂时停在这里。</p><button onClick={()=>setChoice("分手")}>分手</button><button onClick={()=>setChoice("继续")}>继续</button></div> :
    <div className="crisis-compose">{step<4?<span>先查看田柾国的消息</span>:<button onClick={()=>setSent(v=>({...v,[room]:true}))} disabled={!!sent[room]}>{sent[room]?"已回复":"发送预设回复"}</button>}</div>}
  </div>;
}
