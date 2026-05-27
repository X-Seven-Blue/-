"""
Temporary slicer for the Cocos home-page preview assets.

Requires Pillow:
    pip install pillow

The source image is a labelled reference sheet, not production art. Crops are
rectangular and intentionally avoid complex background removal.
"""

from pathlib import Path
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "reference-assets.png"
BASE_WIDTH = 1024
BASE_HEIGHT = 1536


ASSETS = {
    "assets/textures/bg/home_room.png": (40, 110, 540, 310),
    "assets/textures/cats/cat_orange_idle.png": (625, 90, 330, 360),
    "assets/textures/cats/cat_orange_happy.png": (95, 535, 360, 330),
    "assets/textures/cats/cat_orange_eat.png": (625, 530, 350, 340),
    "assets/textures/icons/can.png": (70, 1015, 220, 210),
    "assets/textures/icons/paw.png": (335, 1025, 190, 190),
    "assets/textures/icons/book.png": (545, 1010, 210, 210),
    "assets/textures/icons/seed.png": (795, 1010, 190, 220),
}


def scaled_box(box, image_width, image_height):
    x, y, w, h = box
    sx = image_width / BASE_WIDTH
    sy = image_height / BASE_HEIGHT
    left = round(x * sx)
    top = round(y * sy)
    right = round((x + w) * sx)
    bottom = round((y + h) * sy)
    return (
        max(0, left),
        max(0, top),
        min(image_width, right),
        min(image_height, bottom),
    )


def main():
    if not SOURCE.exists():
        raise FileNotFoundError(
            f"Missing {SOURCE}. Rename/copy the uploaded reference sheet to docs/reference-assets.png."
        )

    image = Image.open(SOURCE).convert("RGBA")
    image_width, image_height = image.size
    pad = max(4, round(8 * min(image_width / BASE_WIDTH, image_height / BASE_HEIGHT)))

    print(f"Source: {SOURCE}")
    print(f"Source size: {image_width}x{image_height}")

    for relative_path, base_box in ASSETS.items():
        output_path = ROOT / relative_path
        output_path.parent.mkdir(parents=True, exist_ok=True)

        crop = image.crop(scaled_box(base_box, image_width, image_height))
        crop = ImageOps.expand(crop, border=pad, fill=(0, 0, 0, 0))
        crop.save(output_path, "PNG")

        print(f"{output_path}  {crop.size[0]}x{crop.size[1]}")


if __name__ == "__main__":
    main()
