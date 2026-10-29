"""Convert uploaded Instagram ZIP archives to browser-friendly JPEGs at build time."""
import json, io, re, zipfile
from pathlib import Path
from PIL import Image, ImageOps
try:
 import pillow_heif
 pillow_heif.register_heif_opener()
except ImportError:
 pass
root=Path("public/ig")
manifest=[]
# Fictional, varied fan reactions for the in-game Instagram feed.
handles=["bluehour.archive","moonlit_ko","sora__film","violetdial","quietlyorbiting","peachcloud97","noonwalks","winter__sea","bloomandink","echoesofrain","honeytoast.kr","mirae.letters","duskroom_","silverjelly","orbit_021","cottonseoul","paperlanterns","slowdays_","tangerinewave","starfield_07","lune.archive","cloudnine_kr","oceanroom_","miso__planet","afterglow.letter","heptagonblue","starlitqueue","daybreak_081","pocketdaisy","nightbus_33","seoulpostcard","smallplanet__","teacupwinter","filmroll.09","blueberrynights","whispering_ink","sunnyafterrain","thelastviolet","softly.rolling","silverline__"]
jk_captions=["밤에 듣기 좋은 노래.","still with you 🌙","오늘은 조금 늦게.","연습 끝.","잘 지내고 있어요.","그냥 남겨두고 싶은 순간.","see you soon.","새벽 공기.","🎧","어제와 오늘 사이.","한 장 더.","조용한 하루.","이 사진 마음에 든다.","곧 만나요.","잘 자요.","다시 시작.","내가 좋아하는 시간.","일상의 한 장면."]
thv_captions=["une journée à paris","🧸","slow afternoon.","작은 발견.","🎷","vintage mood.","no caption needed.","a little piece of today.","🌿","somewhere, sometime.","blue.","film diary.","bonjour.","빛과 그림자.","jazz on repeat.","흐린 날도 좋아.","another day, another frame.","💐"]
jk_reactions=["목소리 들으면서 사진 보고 있어요.","연습 끝나고 올린 거야? 푹 쉬어.","오늘도 운동했을까 궁금해.","정국아 무대에서 빨리 보고 싶어.","새벽에 이 노래 들으면 울 것 같아.","이 사진 속 분위기 너무 정국답다.","방금 라이브 다시 보고 왔는데 사진까지!","귀여운데 또 멋있어, 반칙이야.","노래 추천 또 해줘요.","오늘 사진은 왠지 조금 쓸쓸해 보여.","最近是不是太累了？记得休息。","听着 Still With You 看到这条，心情很复杂。","他最近的动态是不是藏着什么心事？","别把每张照片都解读成恋爱线索。","我支持他的音乐，但恋情传闻让我难受。","喜欢他这么多年，我需要一点时间接受。","就算真的恋爱，也不应该去攻击女方。","他有权拥有不被偷拍的私人生活。","粉丝不是侦探，别再扒地址了。","我还是会等下一次演出。","这张像巡演后台随手拍的。","今天的纹身又出镜了吗？","有些人能不能别在评论区造谣。","不管发生什么，希望你快乐。","我不能接受，但也不会伤害任何人。","下一首歌什么时候发？","深夜更新真的很有你的风格。","笑起来就好了，别太累。","今天也有在好好吃饭吗？","爱你的人不该成为你的压力。"]
thv_reactions=["这组色调简直像一本摄影集。","태형아 오늘도 좋은 하루 보내!","这张让我想到老电影。","怎么会有人随手拍都这么有艺术感。","是胶片相机拍的吗？颗粒好漂亮。","今天听爵士乐了吗？","好想知道背景播放的是什么歌。","巴黎的光线和你太搭了。","这次的穿搭好有复古味道。","像一张可以挂在墙上的照片。","태태 사진전 언제 열어요?","你真的很会捕捉日常瞬间。","这一张像电影的最后一个镜头。","又是完全不同的视觉风格。","感觉他最近在享受安静的生活。","我想看更多旅行照片。","好喜欢这种不刻意的构图。","镜头里的世界好温柔。","你是不是又去逛美术馆了？","这种氛围太适合爵士乐了。","终于等到新的摄影日记。","今天这套衣服在哪里买的？","像秋天傍晚的空气。","拍得好像一首没有歌词的歌。","请继续分享你的审美世界。","别把其他人的恋情话题刷到这里。","这里只想安静欣赏泰亨的照片。","为什么评论区又开始比较成员？","每个人都有自己的表达方式。","这种颜色搭配真是绝了。"]
def engagement(handle, idx):
 seed=(idx*127+(97 if handle=="mnijungkook" else 123))
 likes=1250000+(seed*7919)%4100000
 reactions=jk_reactions if handle=="mnijungkook" else thv_reactions
 offset=0 if handle=="mnijungkook" else 19
 comments=[f"{handles[(idx*7+j*3+offset)%len(handles)]}: {reactions[(idx*11+j*7)%len(reactions)]}" for j in range(24)]
 return likes,comments

for name,handle in [("田柾国ig.zip","mnijungkook"),("金泰亨ig.zip","thv")]:
 archive=root/name
 if not archive.exists():
  print("Missing archive:",archive)
  continue
 with zipfile.ZipFile(archive) as z:
  members=[m for m in z.infolist() if not m.is_dir() and not m.filename.startswith("__MACOSX/") and Path(m.filename).suffix.lower() in (".jpg",".jpeg",".png",".webp",".heic",".heif")]
  members.sort(key=lambda m:m.filename)
  for idx,member in enumerate(members,1):
   if idx>80:break
   try:
    with z.open(member) as source:
     im=Image.open(io.BytesIO(source.read()))
     im=ImageOps.exif_transpose(im)
     im.thumbnail((1400,1400))
     if im.mode!="RGB":im=im.convert("RGB")
     target=f"{handle}-{idx:03d}.jpg"
     im.save(root/target,"JPEG",quality=85,optimize=True)
     likes,comments=engagement(handle,idx)
     manifest.append({"id":f"ig-upload-{handle}-{idx:03d}","title":f"{handle} · 照片 {idx}","body":(jk_captions if handle=="mnijungkook" else thv_captions)[(idx-1)%len(jk_captions if handle=="mnijungkook" else thv_captions)],"kind":"image","sender":handle,"time":f"10月{(idx%23)+1}日","media":f"/FoundPhone-Studio/ig/{target}","likes":likes,"comments":comments})
   except Exception as exc:
    print("Skipping",member.filename,str(exc))
(root/"generated-posts.json").write_text(json.dumps(manifest,ensure_ascii=False),encoding="utf-8")
print(f"Generated {len(manifest)} Instagram photo posts")
