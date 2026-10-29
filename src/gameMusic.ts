import { useSyncExternalStore } from "react";
const tracks = [
 {id:"music-still-with-you",title:"Still With You",src:"/FoundPhone-Studio/music/Still%20with%20you.m4a"},
 {id:"music-christmas-song-jungkook",title:"The Christmas Song (cover)",src:"/FoundPhone-Studio/music/The%20Christmas%20Song.m4a"},
];
let audio: HTMLAudioElement | null = null;
let current = tracks[0].id;
let playing = false;
let started = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(fn=>fn());
function getAudio() {
 if (!audio && typeof Audio !== "undefined") {
  audio = new Audio(tracks[0].src);
  audio.loop = true;
  audio.preload = "auto";
  audio.addEventListener("play",()=>{playing=true;notify()});
  audio.addEventListener("pause",()=>{playing=false;notify()});
  audio.addEventListener("error",()=>notify());
 }
 return audio;
}
export function startGameMusic() {
 if(started)return;
 started=true;
 void getAudio()?.play().catch(()=>{started=false;notify()});
}
export function selectGameMusic(id:string) {
 const track=tracks.find(t=>t.id===id);
 if(!track)return;
 const el=getAudio();
 current=id;
 started=true;
 if(el){if(!el.src.endsWith(track.src)){el.src=track.src;el.load()}void el.play().catch(()=>notify())}
 notify();
}
export function skipGameMusic(direction: number) {
 const index = tracks.findIndex(track => track.id === current);
 selectGameMusic(tracks[(index + direction + tracks.length) % tracks.length].id);
}
export function toggleGameMusic() {
 const el=getAudio();
 if(!el)return;
 if(el.paused){started=true;void el.play().catch(()=>notify())}else el.pause();
}
const subscribe=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn)}};
let snapshot={id:current,playing};
const getSnapshot=()=>{
 if(snapshot.id!==current||snapshot.playing!==playing)snapshot={id:current,playing};
 return snapshot;
};
export function getGameMusicTitle(id: string) { return tracks.find(track => track.id === id)?.title ?? tracks[0].title; }
export function useGameMusic(){return useSyncExternalStore(subscribe,getSnapshot,getSnapshot)}
