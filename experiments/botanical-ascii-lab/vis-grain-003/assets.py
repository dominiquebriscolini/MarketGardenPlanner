"""Prepare the three source poses and pack the checked Grainrad PNG exports."""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image

HERE = Path(__file__).resolve().parent
QA = HERE.parent / ".qa/vis-grain-003"
POSES = {"left": -1, "center": 0, "right": 1}
SIZE = (460, 576)
CELL = (10, 16)
FOOT = (225, 491)
PADDING = 2


def prepare(source_path):
    with Image.open(source_path) as source_image:
        source = source_image.convert("RGB")
    QA.mkdir(parents=True, exist_ok=True)
    width, height = source.size
    matte = Image.new("L", source.size)
    matte.putdata([
        min(255, max(0, max(max(rgb) - min(rgb) - 8, 239 - max(rgb)) * 8))
        if index < 500 * width else 0
        for index, rgb in enumerate(source.get_flattened_data())
    ])
    background = Image.new("RGB", source.size, (13, 17, 14))
    # Gently lift the source's dark leaf tones before glyph selection.
    curve = [round(255 * (channel / 255) ** .76) for channel in range(256)]
    isolated = Image.composite(source.point(curve * 3), background, matte)
    for name, direction in POSES.items():
        # Constant dimensions and zero displacement in the lower stem.
        # The upper rows bend smoothly by at most six source pixels.
        offsets = [direction * 6 * max(0, 1 - y / 380) ** 1.45 for y in range(height + 1)]
        mesh = [
            ((0, y, width, y + 1),
             (-offsets[y], y, -offsets[y+1], y+1,
              width-offsets[y+1], y+1, width-offsets[y], y))
            for y in range(height)
        ]
        for image, suffix, fill in [(isolated, "input", (13, 17, 14)), (matte, "mask", 0)]:
            image.transform(source.size, Image.Transform.MESH, mesh, Image.Resampling.BICUBIC,
                            fillcolor=fill).save(QA / f"{name}-{suffix}.png")


def pack():
    width, height = SIZE
    cell_w, cell_h = CELL
    step = width + PADDING * 2
    atlas = Image.new("RGBA", (step * len(POSES), height + PADDING * 2))
    frames, measurements = [], {}
    baseline_stem = None
    for index, name in enumerate(POSES):
        black = Image.open(QA / f"{name}-black.png").convert("RGB")
        white = Image.open(QA / f"{name}-white.png").convert("RGB")
        assert black.size == white.size == SIZE
        matte = Image.open(QA / f"{name}-mask.png").resize(SIZE, Image.Resampling.BOX)
        opacity = matte.resize((width // cell_w, height // cell_h), Image.Resampling.BOX)
        pixels = []
        spread_max = 0
        for y in range(height):
            for x in range(width):
                dark = black.getpixel((x, y))
                light = white.getpixel((x, y))
                delta = [hi - lo for lo, hi in zip(dark, light)]
                spread_max = max(spread_max, max(delta) - min(delta))
                # B = aF; W = aF + 255(1-a). The source mask limits eligible glyph cells.
                alpha = min(255, max(0, 255 - round(sum(delta) / 3)))
                coverage = min(1, opacity.getpixel((x // cell_w, y // cell_h)) / 18)
                clipped = round(alpha * coverage)
                rgb = tuple(min(255, round(channel * 255 / alpha)) for channel in dark) if clipped else (0, 0, 0)
                pixels.append((*rgb, clipped))
        sprite = Image.new("RGBA", SIZE)
        sprite.putdata(pixels)
        stem = sprite.crop((0, 380, width, height)).tobytes()
        if baseline_stem is None:
            baseline_stem = stem
        assert stem == baseline_stem and sprite.getpixel(FOOT)[3] > 0
        sprite.save(HERE / f"{name}.png")
        x = index * step + PADDING
        atlas.paste(sprite, (x, PADDING))
        assert atlas.crop((x, PADDING, x + width, PADDING + height)).tobytes() == sprite.tobytes()
        frames.append(dict(name=name, x=x, y=PADDING, w=width, h=height))
        measurements[name] = dict(alphaBounds=sprite.getbbox(), alphaHistogram=sprite.getchannel("A").histogram(),
                                  matteDeltaChannelSpreadMax=spread_max,
                                  blackSha256=hashlib.sha256((QA / f"{name}-black.png").read_bytes()).hexdigest())
    atlas.save(HERE / "atlas.png")
    (HERE / "atlas.json").write_text(json.dumps(dict(image="atlas.png", width=atlas.width, height=atlas.height,
                                                   foot=list(FOOT), frames=frames), indent=2) + "\n")
    (QA / "assets.json").write_text(json.dumps(measurements, indent=2) + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("step", choices=["prepare", "pack"])
    parser.add_argument("--source", type=Path, help="Path to the source image for prepare")
    args = parser.parse_args()
    if args.step == "prepare":
        if args.source is None or not args.source.is_file():
            parser.error("prepare requires --source with an existing image file")
        prepare(args.source)
    else:
        pack()
