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
     manifest.append({"id":f"ig-upload-{handle}-{idx:03d}","title":f"{handle} · 照片 {idx}","body":"📸","kind":"image","sender":handle,"time":"相册","media":f"/FoundPhone-Studio/ig/{target}","likes":0,"comments":[]})
   except Exception as exc:
    print("Skipping",member.filename,str(exc))
(root/"generated-posts.json").write_text(json.dumps(manifest,ensure_ascii=False),encoding="utf-8")
print(f"Generated {len(manifest)} Instagram photo posts")
