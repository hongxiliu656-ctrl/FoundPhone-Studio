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
reactions=[
"这张照片的氛围感真的太好了。","刚刷新就看到了，完全没准备好！","今天的状态也太绝了吧。","照片里的光线好像电影镜头。","拜托多发一点这种日常。","已经反复看了十遍，还是觉得好看。","这条的构图好有个人风格。","原来今天有更新，惊喜！","能看到你开心就好了。","这个角度真的很特别。","希望最近有好好休息。","终于等到新照片了！","感觉最近的动态有点不一样。","评论区为什么又在吵架？","喜欢作品不代表有权干涉私生活。","我还是需要一点时间消化这些消息。","不管怎样，希望你平安快乐。","大家别把猜测当作事实传播。","这件事没有证据就不要乱带节奏。","作为老粉，我现在心情很复杂。","真的有人注意到背景那个细节了吗？","只是普通照片，别什么都往恋情上猜。","如果传闻是真的，我会祝福。","我不喜欢被隐瞒的感觉，但也尊重你的选择。","别去打扰无关的人，更别扒私人信息。","看照片本来很开心，结果评论区全是争论。","有人能解释一下大家在讨论什么吗？","为什么每次更新都会变成大型推理现场。","我只关心下一次舞台，其他的尊重本人。","今天这张是我最喜欢的一张。","照片里的细节值得慢慢看。","愿你一直能自由地做自己。","感觉有点难过，但不会因此去攻击别人。","如果喜欢他，就别给他制造更多压力。","这次滤镜和之前很不一样。","我已经保存当壁纸了。","求同款拍摄角度和色调！","希望评论区能对彼此温柔一点。","别用粉丝身份替所有人发言。","有人祝福有人失望都正常，但辱骂真的没必要。"]
def engagement(handle, idx):
 seed=(idx*127+ (97 if handle=="mnijungkook" else 123))
 likes=1250000+(seed*7919)%4100000
 comments=[f"{handles[(idx*7+j*3+(0 if handle=='mnijungkook' else 11))%len(handles)]}: {reactions[(idx*11+j*7+(0 if handle=='mnijungkook' else 13))%len(reactions)]}" for j in range(24)]
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
     manifest.append({"id":f"ig-upload-{handle}-{idx:03d}","title":f"{handle} · 照片 {idx}","body":["最近的日常。","오늘의 기록 📷","好久不见。","Just a moment.","🌙"][idx%5],"kind":"image","sender":handle,"time":f"10月{(idx%23)+1}日","media":f"/FoundPhone-Studio/ig/{target}","likes":likes,"comments":comments})
   except Exception as exc:
    print("Skipping",member.filename,str(exc))
(root/"generated-posts.json").write_text(json.dumps(manifest,ensure_ascii=False),encoding="utf-8")
print(f"Generated {len(manifest)} Instagram photo posts")
