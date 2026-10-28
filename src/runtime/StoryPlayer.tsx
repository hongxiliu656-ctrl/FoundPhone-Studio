import { useEffect, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import { Phone } from "../Phone";
import { validateWork, type Work } from "../schema";
import "../styles.css";
import "./player.css";

function replacePlayerTokens(value: unknown, name: string): unknown {
  if (typeof value === "string") {
    return value.replaceAll("{{player}}", name).replaceAll("玩家名称", name);
  }
  if (Array.isArray(value)) return value.map((entry) => replacePlayerTokens(entry, name));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, replacePlayerTokens(entry, name)]),
    );
  }
  return value;
}

function StoryPlayer() {
  const [work, setWork] = useState<Work | null>(null);
  const [error, setError] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    const abort = new AbortController();
    fetch(
      new URLSearchParams(location.search).get("preview") === "test"
        ? "./test-work.json"
        : new URLSearchParams(location.search).get("template") === "blank"
          ? "./blank-work.json"
          : "./work.json",
      { signal: abort.signal },
    )
      .then((r) => {
        if (!r.ok) throw Error("缺少作品文件，请运行 npm run story:build");
        return r.json();
      })
      .then((x) => {
        const w = validateWork(x);
        document.title = w.title === "捡手机" ? "捡手机" : w.title + " · 捡手机";
        setWork(w);
        const saved = localStorage.getItem("found-phone-player:" + w.id) || "";
        setPlayerName(saved);
        setNameInput(saved);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(String(e));
      });
    return () => abort.abort();
  }, []);

  const confirmName = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = nameInput.trim().slice(0, 24);
    if (!name || !work) return;
    localStorage.setItem("found-phone-player:" + work.id, name);
    setPlayerName(name);
  };

  const personalizedWork = work && playerName
    ? (replacePlayerTokens({ ...work, phone: { ...work.phone, owner: playerName } }, playerName) as Work)
    : null;

  return (
    <main className="story-runtime">
      {personalizedWork ? (
        <Phone work={personalizedWork} />
      ) : work ? (
        <section className="player-name-gate" aria-labelledby="player-name-title">
          <div className="player-name-card">
            <div className="player-name-symbol" aria-hidden="true"></div>
            <p className="player-name-eyebrow">PRIVATE DEVICE</p>
            <h1 id="player-name-title">这部手机的主人认识你</h1>
            <p className="player-name-copy">先输入你想在手机里使用的名字。确认后，直接进入锁屏界面。</p>
            <form onSubmit={confirmName}>
              <label htmlFor="player-name">你的名字</label>
              <input
                id="player-name"
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                placeholder="输入昵称"
                maxLength={24}
                autoComplete="nickname"
                autoFocus
                required
              />
              <button type="submit">确认并继续</button>
            </form>
            <small>名字只保存在当前浏览器中，可随时清除浏览器站点数据重设。</small>
          </div>
        </section>
      ) : (
        <p role="status">{error || "正在打开手机…"}</p>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<StoryPlayer />);
