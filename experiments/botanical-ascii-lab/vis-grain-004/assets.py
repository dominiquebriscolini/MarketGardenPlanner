"""Build synthetic plant sources and pack the actual Grainrad PNG exports."""
import argparse
import json
import math
from pathlib import Path
import random

from PIL import Image, ImageDraw

HERE = Path(__file__).resolve().parent
QA = HERE.parent / ".qa/vis-grain-004"
SIZE = (460, 576)
FOOT = (225, 491)
POSES = {"left": -1, "center": 0, "right": 1}
NEW = {
    "lettuce": ("Kopfsalat", .9),
    "radishes": ("Radieschen", .75),
    "spinach": ("Spinat", .85),
    "kohlrabi": ("Kohlrabi", .9),
    "onions": ("Zwiebeln", .9),
    "carrots": ("Karotten", .86),
    "beetroot": ("Rote Bete", .88),
    "bush-beans": ("Buschbohnen", .94),
    "zucchini": ("Zucchini", 1.08),
}
SPECIES = {"tomatoes": ("Tomaten", 1), **NEW}
ADDITIONS = ("carrots", "beetroot", "bush-beans", "zucchini")
EARLIER_SPECIES = {species: description for species, description in SPECIES.items()
                   if species not in ADDITIONS}
GROWTH = {
    "sprout": "Auflaufen",
    "juvenile": "Jungpflanze",
    "developing": "Ausbildung",
}
CROWNS = {
    "radishes": [(133, 444), (225, 481), (308, 458)],
    "spinach": [(133, 444), (225, 481), (308, 458)],
    "onions": [(137, 456), (225, 484), (299, 463)],
    "carrots": [(133, 444), (225, 481), (308, 458)],
    "beetroot": [(133, 444), (225, 481), (308, 458)],
}
BACKGROUND = (13, 17, 14)
GREEN = [(72, 94, 62), (96, 120, 75), (118, 141, 89),
         (144, 159, 103), (157, 174, 113)]


def leaf(draw, base, tip, width, color, lobes=0, vein_width=2):
    dx, dy = tip[0] - base[0], tip[1] - base[1]
    length = math.hypot(dx, dy)

    def side(t, sign, scale=1):
        edge = math.sin(math.pi * t) ** .84 * (1 + .10 * math.sin(t * lobes * math.tau))
        return (base[0] + t * dx - sign * dy / length * width * edge * scale,
                base[1] + t * dy + sign * dx / length * width * edge * scale)

    steps = [i / 24 for i in range(25)]
    bright = tuple(min(255, c + 23) for c in color)
    draw.polygon([side(t, 1) for t in steps] + [side(t, -1) for t in reversed(steps)], fill=(*color, 255))
    draw.polygon([side(t, -1, .75) for t in steps] + [tip, base], fill=(*bright, 255))
    draw.line([base, side(.86, 1, 0)], fill=(*bright, 255), width=vein_width)
    for t in (.28, .44, .61):
        for sign in (-1, 1):
            draw.line([side(t, 1, 0), side(t + .17, sign, .65)], fill=(*bright, 255), width=2)


def plant(species):
    image = Image.new("RGBA", SIZE)
    draw = ImageDraw.Draw(image)
    rng = random.Random(87)

    def rosette(x, y, spread, height, count, blade, lobes):
        for i in range(count):
            t = i / (count - 1)
            tip = (x + (2*t-1)*spread, y - height * (.4 + .6 * math.sin(math.pi*t))
                   - rng.randrange(30))
            leaf(draw, (x, y), tip, blade * rng.uniform(.8, 1.2), GREEN[rng.randrange(4)], lobes)
        for i in range(5):
            tip = (x + (i-2)*spread*.29, y - height*.48 - rng.randrange(35))
            leaf(draw, (x, y), tip, blade*.72, GREEN[2+i%3], lobes)

    if species == "lettuce":
        # Stagger the leaf bases so the folds radiate around a rounded head.
        shaded, mid, lit = (43, 67, 41), (102, 128, 66), (170, 186, 103)
        for base, tip, width, color in [
            ((223, 470), (104, 346), 52, mid),
            ((225, 466), (188, 295), 47, shaded),
            ((230, 464), (253, 285), 56, lit),
            ((237, 472), (353, 324), 49, shaded),
            ((220, 478), (65, 402), 39, shaded),
            ((231, 478), (396, 395), 52, mid),
            ((231, 479), (132, 373), 51, lit),
            ((238, 480), (315, 367), 54, mid),
            ((229, 481), (217, 344), 48, shaded),
            ((235, 484), (275, 392), 40, lit),
            ((227, 485), (170, 425), 36, mid),
        ]:
            leaf(draw, base, tip, width, color, lobes=5, vein_width=5)
    elif species in ("radishes", "spinach"):
        # A short cluster: schematic planting density, not a spacing prescription.
        for x, y, scale in [(133, 444, .77), (308, 458, .86), (225, 481, 1)]:
            if species == "radishes":
                rosette(x, y, 70*scale, 139*scale, 6, 17*scale, 3)
            else:
                rosette(x, y, 82*scale, 112*scale, 8, 29*scale, 0)
    elif species == "kohlrabi":
        for i, (x, y) in enumerate([(78, 312), (110, 219), (168, 177), (223, 142),
                                    (283, 186), (353, 227), (387, 320)]):
            end = (225 + (x-225)*.43, 410 - (410-y)*.4)
            draw.line([(225, 443), end], fill=(122, 150, 105, 255), width=8)
            leaf(draw, end, (x, y), 32, GREEN[i%4], 3)
        draw.ellipse((170, 403, 281, 494), fill=(105, 132, 85, 255))
        draw.ellipse((181, 407, 265, 477), fill=(147, 164, 108, 255))
        for x, y in [(181, 428), (254, 423), (263, 450), (192, 457)]:
            draw.ellipse((x, y, x+9, y+5), fill=(105, 132, 85, 255))
    elif species == "onions":
        for x, y, height in [(137, 456, 215), (299, 463, 256), (225, 484, 284)]:
            for i in range(6):
                dx = (i-2.5)*29
                tip = (x+dx, y-height+rng.randrange(79))
                leaf(draw, (x, y), tip, 6+rng.randrange(5), GREEN[i%5])
    elif species in ("carrots", "beetroot"):
        for x, y in CROWNS[species]:
            for i in range(5):
                tip = (x + (i-2)*29, y - 104 - rng.randrange(48))
                if species == "carrots":
                    draw.line([(x, y), tip], fill=(*GREEN[3], 255), width=5)
                    for level in (.43, .62, .81):
                        node = (x + (tip[0]-x)*level, y + (tip[1]-y)*level)
                        for sign in (-1, 1):
                            leaf(draw, node, (node[0]+sign*(21-9*level), node[1]-28),
                                 6, GREEN[(i+1)%5], 4)
                else:
                    neck = (x + (tip[0]-x)*.55, y + (tip[1]-y)*.55)
                    draw.line([(x, y), neck], fill=(144, 71, 86, 255), width=6)
                    leaf(draw, neck, tip, 22, GREEN[i%5], 3)
    elif species == "bush-beans":
        for x, y in [(135, 453), (310, 469), (225, 486)]:
            draw.line([(x, y), (x-5, y-163)], fill=(*GREEN[1], 255), width=7)
            for level in (104, 145):
                nodes = [(x-58, y-level+4), (x+63, y-level-7), (x-7, y-level-37)]
                for i, (a, b) in enumerate(nodes):
                    leaf(draw, (x-2, y-level+24), (a, b), 22, GREEN[i+1], vein_width=4)
            for dx, depth in [(-35, 78), (12, 89), (44, 100)]:
                start = (x+dx, y-depth)
                draw.line([(x, y-depth-14), start], fill=(*GREEN[2], 255), width=5)
                # The two-tone edge makes the hanging pod readable at garden scale.
                pod = [start, (x+dx+4, y-depth+19), (x+dx+1, y-depth+42),
                       (x+dx-10, y-depth+59)]
                draw.line(pod, fill=(174, 200, 58, 255), width=19, joint="curve")
                draw.line([(a-4, b) for a, b in pod], fill=(212, 222, 117, 255), width=6, joint="curve")
    elif species == "zucchini":
        for i, tip in enumerate([(49, 369), (113, 315), (198, 298), (288, 314), (399, 353)]):
            node = (225+(tip[0]-225)*.50, 479+(tip[1]-479)*.62)
            draw.line([(225, 485), node], fill=(*GREEN[2], 255), width=7)
            leaf(draw, node, tip, 49, GREEN[i%4], 6, vein_width=5)
        # Long fruit exposed in front of the canopy, with a pale flank and blossom.
        draw.line([(162, 446), (352, 466)], fill=(59, 111, 43, 255), width=42)
        draw.ellipse((330, 445, 374, 488), fill=(66, 119, 47, 255))
        draw.ellipse((141, 424, 183, 467), fill=(69, 112, 43, 255))
        draw.line([(155, 436), (353, 457)], fill=(151, 192, 76, 255), width=14)
        draw.line([(167, 460), (350, 480)], fill=(111, 147, 57, 255), width=7)
        draw.polygon([(153, 438), (115, 422), (123, 440), (101, 448),
                      (124, 454), (121, 475), (153, 454)], fill=(247, 176, 41, 255))
    return image


def growing_plant(species, phase):
    image = Image.new("RGBA", SIZE)
    draw = ImageDraw.Draw(image)
    age = list(GROWTH).index(phase)
    crowns = CROWNS.get(species, [(225, 487)])
    for x, y in crowns:
        if species == "onions":
            blades = [(-9, 64), (12, 51), (-31, 94), (24, 119), (4, 165)]
            for dx, height in blades[:[2, 4, 5][age]]:
                leaf(draw, (x, y), (x + dx, y - height * [.77, .95, 1.15][age]),
                     [5, 7, 8][age], GREEN[3])
            continue
        if species == "tomatoes":
            height = [63, 148, 275][age]
            draw.line([(x, y), (x - 5, y-height)], fill=(*GREEN[2], 255), width=[6, 8, 10][age])
            for index in range([1, 3, 5][age]):
                branch_y = y - height*(.55 + index*.10)
                for sign in (-1, 1):
                    dx = sign*[47, 72, 111][age]*(1-index*.10)
                    leaf(draw, (x-3, branch_y), (x+dx, branch_y-17-index*2),
                         [16, 20, 21][age], GREEN[(index + 2) % 5], lobes=3)
                    if age == 2 and index in (1, 3):
                        bud_x = x + dx*.68
                        draw.ellipse((bud_x-7, branch_y-3, bud_x+7, branch_y+12),
                                     fill=(180, 162, 83, 255))
            continue
        count = [2, 4, 7][age]
        breadth = {"lettuce": 1.8, "kohlrabi": 1.15, "radishes": .9, "spinach": 1.05}[species]
        height = [49, 93, 154][age] * (1.35 if species == "kohlrabi" else 1)
        for index in range(count):
            across = (index * 2 / (count-1)) - 1
            tip = (x + across*[33, 53, 69][age]*breadth,
                   y - height*(.7+.3*math.cos(across*math.pi/2)) - index % 3 * 7)
            leaf(draw, (x, y), tip, [12, 17, 21][age]*breadth,
                 GREEN[1+index%4], lobes=4 if species == "lettuce" else 2,
                 vein_width=4)
        if species == "kohlrabi" and age == 2:
            draw.ellipse((x-28, y-50, x+29, y+2), fill=(118, 145, 86, 255))
            draw.ellipse((x-21, y-47, x+15, y-8), fill=(154, 177, 109, 255))
    return image


def prepare(growth=False, additions=False):
    QA.mkdir(parents=True, exist_ok=True)
    sources = ((f"{species}-{phase}", growing_plant(species, phase))
               for phase in GROWTH for species in EARLIER_SPECIES) if growth else (
                   (species, plant(species)) for species in (ADDITIONS if additions else NEW))
    fixed_row = 472 if growth else 448
    for name, source in sources:
        for pose, direction in POSES.items():
            mesh = []
            span = fixed_row - source.getbbox()[1]
            offsets = [direction * 6 * max(0, min(1, (fixed_row-y)/span)) ** 1.4
                       for y in range(SIZE[1]+1)]
            for y in range(SIZE[1]):
                a, b = offsets[y:y+2]
                w = SIZE[0]
                mesh.append(((0, y, w, y+1), (-a, y, -b, y+1, w-b, y+1, w-a, y)))
            bent = source.transform(SIZE, Image.Transform.MESH, mesh, Image.Resampling.BICUBIC)
            prefix = QA / f"{name}-{pose}"
            bent.getchannel("A").save(prefix.with_name(prefix.name + "-mask.png"))
            background = Image.new("RGBA", SIZE, (*BACKGROUND, 255))
            Image.alpha_composite(background, bent).convert("RGB").resize(
                (469, 588), Image.Resampling.BICUBIC).save(
                prefix.with_name(prefix.name + "-input.png"))


def recover(species, pose):
    prefix = QA / f"{species}-{pose}"
    dark, light = [Image.open(prefix.with_name(prefix.name + f"-{bg}.png")).convert("RGB")
                   for bg in ("black", "white")]
    assert dark.size == light.size == SIZE
    mask = Image.open(prefix.with_name(prefix.name + "-mask.png"))
    cells = mask.resize((46, 36), Image.Resampling.BOX).load()
    pixels = []
    for index, (black, white) in enumerate(zip(dark.get_flattened_data(), light.get_flattened_data())):
        x, y = index % SIZE[0], index // SIZE[0]
        delta = [hi-lo for lo, hi in zip(black, white)]
        assert max(delta) - min(delta) <= 2, (species, pose, x, y)
        alpha = min(255, max(0, 255-round(sum(delta)/3)))
        clipped = round(alpha * min(1, cells[x//10, y//16] / 24))
        rgb = tuple(min(255, round(c*255/alpha)) for c in black) if clipped else (0, 0, 0)
        pixels.append((*rgb, clipped))
    sprite = Image.new("RGBA", SIZE)
    sprite.putdata(pixels)
    return sprite


def pack(phase=None):
    w, h = SIZE
    padding = 2
    step_x, step_y = w + 2*padding, h + 2*padding
    species_set = EARLIER_SPECIES if phase else SPECIES
    atlas = Image.new("RGBA", (3*step_x, len(species_set)*step_y))
    entries = {}
    for row, (species, (label, scale)) in enumerate(species_set.items()):
        frames = []
        sprites = []
        for col, pose in enumerate(POSES):
            sprite = (recover(f"{species}-{phase}", pose) if phase else
                      Image.open(HERE.parent / f"vis-grain-003/{pose}.png")
                      if species == "tomatoes" else recover(species, pose))
            assert sprite.mode == "RGBA" and sprite.size == SIZE
            x, y = col*step_x + padding, row*step_y + padding
            atlas.paste(sprite, (x, y))
            stage_folder = f"{phase}/" if phase else ""
            filename = f"frames/{stage_folder}{species}/{pose}.png"
            target = HERE / filename
            target.parent.mkdir(parents=True, exist_ok=True)
            sprite.save(target)
            assert atlas.crop((x, y, x+w, y+h)).tobytes() == sprite.tobytes()
            sprites.append(sprite)
            frames.append(dict(name=pose, x=x, y=y, w=w, h=h, file=filename))
        assert len({sprite.tobytes() for sprite in sprites}) == 3, species
        fixed_row = 480 if phase else 448
        assert len({sprite.crop((0, fixed_row, w, h)).tobytes() for sprite in sprites}) == 1, species
        for sprite in sprites:
            lo, top, hi, bottom = sprite.getbbox()
            assert 0 < lo < FOOT[0] < hi < w and 0 < top < bottom < h
            assert abs(bottom - FOOT[1]) <= 26, (species, bottom)
            assert sprite.getchannel("A").histogram()[0] > w*h/2
        entries[species] = dict(label=label, foot=FOOT, previewScale=scale, frames=frames)

    catalogue = json.loads((HERE.parents[2] / "data/cultures.json").read_text(encoding="utf-8"))
    if not phase:
        assert set(entries) == {species["id"] for species in catalogue["species"]}
    by_profile = {p["id"]: p["species_id"] if p["species_id"] in entries else None
                  for p in catalogue["profiles"]}
    stem = f"atlas-{phase}" if phase else "atlas"
    atlas.save(HERE / f"{stem}.png")
    manifest = dict(image=f"{stem}.png", width=atlas.width, height=atlas.height,
                    sequence=["center", "left", "center", "right"], poseMs=1200,
                    bySpecies={s["id"]: s["id"] if s["id"] in entries else None for s in catalogue["species"]},
                    byProfile=by_profile, assets=entries)
    if not phase:
        manifest["growthScale"] = dict(sprout=.34, juvenile=.55, developing=.78, mature=1)
    (HERE / f"{stem}.json").write_text(json.dumps(manifest, indent=2)+"\n", encoding="utf-8")
    print(f"Verified {3*len(entries)} poses, {len(by_profile)} profile mappings, {atlas.size} atlas")


def stage():
    """Verify and copy the current lab snapshot into the Planner source tree."""
    root = HERE.parents[2]
    manifest = json.loads((HERE / "atlas.json").read_text(encoding="utf-8"))
    presentation = json.loads((HERE / "presentation.json").read_text(encoding="utf-8"))
    catalogue = json.loads((root / "data/cultures.json").read_text(encoding="utf-8"))
    species = {entry["id"]: entry["id"] for entry in catalogue["species"]}
    profiles = {entry["id"]: entry["species_id"] for entry in catalogue["profiles"]}
    assert manifest["bySpecies"] == species and manifest["byProfile"] == profiles
    assert set(manifest["assets"]) == set(presentation["cultures"]) == set(species)
    assert manifest["sequence"] == ["center", "left", "center", "right"]
    scales = list(manifest["growthScale"].values())
    assert len(scales) == 4 and scales == sorted(set(scales)) and 0 < scales[0] < scales[-1] == 1
    assert {name for name, style in presentation["cultures"].items() if "underground" in style} == {
        "radishes", "onions", "carrots", "beetroot",
    }
    png = (HERE / manifest["image"]).read_bytes()
    with Image.open(HERE / manifest["image"]) as atlas:
        assert atlas.mode == "RGBA" and atlas.size == (manifest["width"], manifest["height"])
        for asset in manifest["assets"].values():
            assert tuple(asset["foot"]) == FOOT
            assert [frame["name"] for frame in asset["frames"]] == list(POSES)
            for frame in asset["frames"]:
                x, y, w, h = (frame[key] for key in ("x", "y", "w", "h"))
                assert (w, h) == SIZE and 0 <= x <= atlas.width-w and 0 <= y <= atlas.height-h
                with Image.open(HERE / frame.pop("file")) as sprite:
                    assert atlas.crop((x, y, x+w, y+h)).tobytes() == sprite.tobytes()

    target = root / "frontend/src/assets/grainrad-plants"
    target.mkdir(parents=True, exist_ok=True)
    (target / manifest["image"]).write_bytes(png)
    package = {"schemaVersion": 1, **manifest, "presentation": presentation}
    (target / "manifest.json").write_text(json.dumps(package, indent=2, ensure_ascii=False)+"\n", encoding="utf-8")
    print(f"Staged {len(species)} species, {len(profiles)} profiles and {len(species)*len(POSES)} wind frames")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("step", choices=["prepare", "pack", "prepare-growth", "pack-growth", "prepare-additions", "stage"])
    step = parser.parse_args().step
    if step == "pack-growth":
        for phase in GROWTH:
            pack(phase)
    elif step == "pack":
        pack()
    elif step == "stage":
        stage()
    else:
        prepare(growth=step == "prepare-growth", additions=step == "prepare-additions")
