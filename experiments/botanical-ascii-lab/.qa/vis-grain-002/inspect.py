from pathlib import Path
from PIL import Image, ImageSequence
import hashlib, json

def digest(data):
    return hashlib.sha256(data).hexdigest()

root = Path(__file__).parent
source = root.parents[3] / "design/references/02_vegetation/{C9BFABF6-B80E-4268-ADBD-E2BF970A8116}.png"
results = {}
for path in [source, *sorted(root.glob("*.gif")), *sorted(root.glob("*.png"))]:
    if path.name == "atlas-proof.png":
        continue
    with Image.open(path) as image:
        frames = [frame.convert("RGBA") for frame in ImageSequence.Iterator(image)]
        delays = [frame.info.get("duration", 0) for frame in frames]
        hashes = [digest(frame.tobytes()) for frame in frames]
        groups = list(dict.fromkeys(hashes))
        results[path.name] = dict(size=image.size, alpha=sorted(set(frame.getchannel("A").getextrema() for frame in frames)),
                                  file_hash=digest(path.read_bytes()), rgba_hashes=groups, frame_count=len(frames),
                                  frame_order=[groups.index(h) for h in hashes], durations_ms=delays, loop=image.info.get("loop"))
        if path.name == "clean-1.gif":
            width, height = image.size
            atlas = Image.new("RGBA", (width * len(groups), height))
            for index, group in enumerate(groups):
                atlas.paste(frames[hashes.index(group)], (index * width, 0))
            atlas.save(root / "atlas-proof.png")

print(json.dumps(results, indent=2))
