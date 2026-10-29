import { Pause, Play, SkipBack, SkipForward, Music2 } from "lucide-react";
import { getGameMusicTitle, skipGameMusic, toggleGameMusic, useGameMusic } from "./gameMusic";
import "./music-widget.css";

export function MusicWidget({ locked = false }: { locked?: boolean }) {
  const { id, playing } = useGameMusic();
  return <div className={"ios-music-widget " + (locked ? "ios-music-locked" : "ios-music-home")} aria-label="音乐播放器">
    <div className="ios-music-art"><Music2 size={26} /></div>
    <div className="ios-music-info"><strong>{getGameMusicTitle(id)}</strong><span>Jung Kook · 正在播放</span></div>
    <div className="ios-music-controls">
      <button aria-label="上一首" onClick={() => skipGameMusic(-1)}><SkipBack size={19} fill="currentColor"/></button>
      <button aria-label={playing ? "暂停" : "播放"} onClick={toggleGameMusic}>{playing ? <Pause size={23} fill="currentColor"/> : <Play size={23} fill="currentColor"/>}</button>
      <button aria-label="下一首" onClick={() => skipGameMusic(1)}><SkipForward size={19} fill="currentColor"/></button>
    </div>
  </div>;
}
