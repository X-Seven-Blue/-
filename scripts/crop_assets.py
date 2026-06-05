from pathlib import Path
from PIL import Image

source = Path(r"D:\xwechat_files\wxid_m0llsxk9o3io32_df04\temp\RWTemp\2026-05\38fb547bcb3e34663441e60c1583d6fb\01364ba007d806b4d818a568e247d598.png")
out = Path("assets")
out.mkdir(parents=True, exist_ok=True)

image = Image.open(source).convert("RGB")

# Coordinates are taken from the provided UI board. They intentionally preserve
# the hand-drawn texture so the live scene starts from the same visual language.
crops = {
    "cat-house-main.png": (10, 10, 835, 675),
    "space-map.png": (890, 390, 1184, 665),
    "trade-panel.png": (8, 740, 222, 1235),
}

for name, box in crops.items():
    image.crop(box).save(out / name, quality=95)

print(f"Generated {len(crops)} assets in {out.resolve()}")
