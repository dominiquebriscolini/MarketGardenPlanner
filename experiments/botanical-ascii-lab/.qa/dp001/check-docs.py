"""Local Markdown path/anchor audit for the DP-001 documentation surface."""
import json
import re
from pathlib import Path
from urllib.parse import unquote

root = Path(__file__).resolve().parents[4]
names = ['README.md', 'docs/PRODUCT.md', 'docs/DECISIONS.md',
         'docs/OPEN_QUESTIONS.md', 'docs/ARCHITECTURE.md', 'docs/ROADMAP.md',
         'docs/features/DP-001.md', 'experiments/botanical-ascii-lab/README.md',
         'experiments/botanical-ascii-lab/DECISIONS.md',
         'experiments/botanical-ascii-lab/DP-001.md']
errors = []
checked = 0
for name in names:
    source = root / name
    for match in re.finditer(r'\[[^\]]*\]\(([^)]+)\)', source.read_text(encoding='utf-8')):
        target = match.group(1).strip('<>')
        if re.match(r'[a-z]+:', target) or target.startswith('//'):
            continue
        local, _, anchor = unquote(target).partition('#')
        path = (source.parent / local).resolve() if local else source
        checked += 1
        if not path.exists():
            errors.append(f'{name}: missing {target}')
        elif anchor and path.is_file():
            text = path.read_text(encoding='utf-8')
            anchors = set(re.findall(r'<a\s+id="([^"]+)"', text))
            for heading in re.findall(r'^#+\s+(.+)$', text, re.M):
                slug = re.sub(r'[^\w\- ]', '', heading.lower()).replace(' ', '-')
                anchors.add(slug)
            if anchor not in anchors:
                errors.append(f'{name}: missing anchor {target}')
result = {'files': len(names), 'localLinksAndAnchorsChecked': checked, 'errors': errors}
print(json.dumps(result, ensure_ascii=False, indent=2))
raise SystemExit(bool(errors))
