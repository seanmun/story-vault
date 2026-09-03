"""Placeholder art for the render spike: gradient scene stills, title card,
watermark PNG. Pillow does the text since this ffmpeg build lacks drawtext."""
from PIL import Image, ImageDraw, ImageFont
import os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

def font(size):
    for p in ("/System/Library/Fonts/Supplemental/Georgia.ttf",
              "/System/Library/Fonts/Supplemental/Times New Roman.ttf"):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def gradient(w, h, c0, c1):
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        t = y / h
        row = tuple(int(a + (b - a) * t) for a, b in zip(c0, c1))
        for x in range(w):
            px[x, y] = row
    return img

def center_text(img, text, f, fill, dy=0):
    d = ImageDraw.Draw(img)
    box = d.textbbox((0, 0), text, font=f)
    d.text(((img.width - box[2]) / 2, (img.height - box[3]) / 2 + dy), text, font=f, fill=fill)

SCENES = [
    ((43, 29, 14), (138, 90, 43), "Scene 1 — arrival"),
    ((26, 34, 51), (90, 116, 138), "Scene 2 — buildup"),
    ((48, 18, 26), (138, 58, 74), "Scene 3 — turn"),
    ((17, 38, 26), (58, 122, 82), "Scene 4 — climax"),
    ((36, 26, 46), (106, 74, 138), "Scene 5 — reflection"),
]
for i, (c0, c1, label) in enumerate(SCENES):
    img = gradient(2400, 1350, c0, c1)
    center_text(img, label, font(96), (255, 255, 255, 217))
    img.save(f"still{i}.png")

title = Image.new("RGB", (1920, 1080), (26, 18, 10))
center_text(title, "The Snowball Rule We Broke", font(88), (217, 180, 91), dy=-40)
center_text(title, "1999", font(44), (200, 200, 200), dy=70)
title.save("title.png")

wm = Image.new("RGBA", (340, 70), (0, 0, 0, 0))
d = ImageDraw.Draw(wm)
d.text((10, 10), "StoryVault", font=font(38), fill=(255, 255, 255, 90))
wm.save("wm.png")
print("images done")
