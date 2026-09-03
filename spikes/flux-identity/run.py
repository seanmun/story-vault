"""Phase 4 go/no-go: can Flux Kontext keep Dad's identity across scenes,
eras, and styles? Uses curl for API calls (Cloudflare blocks urllib's UA).
Usage: python3 spikes/flux-identity/run.py
"""
import json, os, subprocess, sys, time

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.join(ROOT, "spikes", "flux-identity")
OUT = os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)

env = {}
for line in open(os.path.join(ROOT, ".env.local")):
    if "=" in line and not line.startswith("#"):
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"')
TOK = env["REPLICATE_API_TOKEN"]
AUTH = f"Authorization: Bearer {TOK}"

def curl_json(args):
    r = subprocess.run(["curl", "-s", *args], capture_output=True, text=True)
    return json.loads(r.stdout)

def upload(path):
    r = curl_json(["-X", "POST", "-H", AUTH, "-F", f"content=@{path}",
                   "https://api.replicate.com/v1/files"])
    return r["urls"]["get"]

def generate(prompt, image_url, seed=42):
    body = json.dumps({"input": {
        "prompt": prompt, "input_image": image_url, "aspect_ratio": "16:9",
        "output_format": "jpg", "seed": seed}})
    r = curl_json(["-X", "POST", "-H", AUTH, "-H", "Content-Type: application/json",
                   "-H", "Prefer: wait", "-d", body,
                   "https://api.replicate.com/v1/models/black-forest-labs/flux-kontext-pro/predictions"])
    # Poll if not finished within the sync window
    while r.get("status") in ("starting", "processing"):
        time.sleep(3)
        r = curl_json(["-H", AUTH, r["urls"]["get"]])
    if r.get("status") != "succeeded":
        print("  FAILED:", r.get("error") or r.get("status"), file=sys.stderr)
        return None
    return r["output"] if isinstance(r["output"], str) else r["output"][0]

photos = sorted(
    (os.path.join(HERE, "photos", f) for f in os.listdir(os.path.join(HERE, "photos"))
     if f.lower().endswith((".jpg", ".jpeg", ".png"))),
    key=os.path.getsize, reverse=True)
ref_a, ref_b = photos[0], photos[1]
print(f"reference A: {os.path.basename(ref_a)}\nreference B: {os.path.basename(ref_b)}")
url_a, url_b = upload(ref_a), upload(ref_b)

TESTS = [
    ("t1-poolhall-1978", url_a,
     "Place this man in a smoky 1970s pool hall at night, leaning over a pool "
     "table lining up a shot, warm dim overhead lamp, haze in the air, 1978 "
     "period clothing and hairstyle, photorealistic, cinematic film look"),
    ("t2-deaged-1978", url_a,
     "Show this man as a young man in his early twenties in 1978, standing "
     "outside a small-town pool hall at night under a buzzing neon sign, "
     "period-accurate clothes and hair, photorealistic"),
    ("t3-illustration", url_a,
     "Transform this into a warm storybook illustration of this man sitting "
     "on a porch at golden hour telling a story, visible painted brushwork, "
     "gentle warm palette, children's-book quality"),
    ("t4-poolhall-refB", url_b,
     "Place this man in a smoky 1970s pool hall at night, leaning over a pool "
     "table lining up a shot, warm dim overhead lamp, haze in the air, 1978 "
     "period clothing and hairstyle, photorealistic, cinematic film look"),
]

results = []
for name, url, prompt in TESTS:
    print(f"generating {name}...")
    out_url = generate(prompt, url)
    if out_url:
        dest = os.path.join(OUT, f"{name}.jpg")
        subprocess.run(["curl", "-s", "-o", dest, out_url], check=True)
        results.append((name, dest))
        print(f"  saved {dest}")

# Contact sheet: reference on top, results in a grid below
from PIL import Image, ImageDraw, ImageFont

def font(sz):
    p = "/System/Library/Fonts/Supplemental/Georgia.ttf"
    return ImageFont.truetype(p, sz) if os.path.exists(p) else ImageFont.load_default()

CELL_W, CELL_H, LABEL_H = 880, 495, 44
cols = 2
rows = (len(results) + cols - 1) // cols
sheet = Image.new("RGB", (CELL_W * cols + 30, 360 + (CELL_H + LABEL_H) * rows + 60), (20, 16, 12))
d = ImageDraw.Draw(sheet)
ref_img = Image.open(ref_a)
ref_img.thumbnail((440, 330))
sheet.paste(ref_img, (15, 15))
d.text((470, 30), "REFERENCE (real photo)", font=font(30), fill=(217, 180, 91))
for i, (name, path) in enumerate(results):
    x = 15 + (i % cols) * CELL_W
    y = 360 + (i // cols) * (CELL_H + LABEL_H)
    img = Image.open(path)
    img.thumbnail((CELL_W - 20, CELL_H))
    sheet.paste(img, (x, y))
    d.text((x, y + CELL_H + 6), name, font=font(26), fill=(230, 230, 230))
sheet_path = os.path.join(OUT, "contact-sheet.jpg")
sheet.save(sheet_path, quality=88)
print(f"\ncontact sheet: {sheet_path}")
