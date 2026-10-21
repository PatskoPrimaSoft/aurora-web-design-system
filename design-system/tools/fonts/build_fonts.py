"""Собирает шесть woff2 для design-system/tokens/webfonts-selfhost.css из вариативных TTF Google Fonts.

Разово, результат коммитится. Запуск из корня репозитория:
    python -m venv .tmp/fonts-venv
    # Windows:
    .tmp/fonts-venv/Scripts/pip install -r design-system/tools/fonts/requirements.txt
    .tmp/fonts-venv/Scripts/python design-system/tools/fonts/build_fonts.py          # сборка + проверка
    .tmp/fonts-venv/Scripts/python design-system/tools/fonts/build_fonts.py --verify # только проверка
    # Linux/macOS:
    .tmp/fonts-venv/bin/pip install -r design-system/tools/fonts/requirements.txt
    .tmp/fonts-venv/bin/python design-system/tools/fonts/build_fonts.py          # сборка + проверка
    .tmp/fonts-venv/bin/python design-system/tools/fonts/build_fonts.py --verify # только проверка
Сабсет: латиница + кириллица в одном файле на начертание (design-system/assets/fonts/README.md).
"""
import hashlib
import io
import pathlib
import sys
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = pathlib.Path(__file__).resolve().parents[3]
OUT = ROOT / "design-system" / "assets" / "fonts"
GF = "https://raw.githubusercontent.com/google/fonts/main/ofl"

FAMILIES = [
    ("inter-tight", "InterTight", f"{GF}/intertight/InterTight%5Bwght%5D.ttf", f"{GF}/intertight/OFL.txt",
     {400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold"}),
    ("jetbrains-mono", "JetBrainsMono", f"{GF}/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf",
     f"{GF}/jetbrainsmono/OFL.txt", {400: "Regular", 500: "Medium"}),
]

# Диапазоны сабсетов latin и cyrillic Google Fonts.
LATIN = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F," \
        "U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD"
CYRILLIC = "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116,U+20BD"
MUST_HAVE = "AaЖжЎўІі№€₽0123456789"


def unicodes(ranges):
    result = set()
    for part in ranges.split(","):
        lo, _, hi = part.removeprefix("U+").partition("-")
        result.update(range(int(lo, 16), int(hi or lo, 16) + 1))
    return result


def fetch(url):
    with urllib.request.urlopen(url) as response:
        return response.read()


def build():
    sources = ["# Происхождение шрифтов", "", "Собраны `design-system/tools/fonts/build_fonts.py`; лицензия SIL OFL 1.1 (OFL.txt рядом).",
               "", "| Файл | Источник | SHA-256 источника |", "|---|---|---|"]
    wanted = unicodes(LATIN) | unicodes(CYRILLIC)
    for folder, stem, ttf_url, ofl_url, weights in FAMILIES:
        target = OUT / folder
        target.mkdir(parents=True, exist_ok=True)
        ttf = fetch(ttf_url)
        digest = hashlib.sha256(ttf).hexdigest()
        (target / "OFL.txt").write_bytes(fetch(ofl_url))
        for weight, style in weights.items():
            font = instancer.instantiateVariableFont(TTFont(io.BytesIO(ttf)), {"wght": weight})
            options = subset.Options()
            options.flavor = "woff2"
            options.layout_features = ["*"]
            options.name_IDs = ["*"]
            options.notdef_outline = True
            subsetter = subset.Subsetter(options)
            subsetter.populate(unicodes=wanted)
            subsetter.subset(font)
            font.flavor = "woff2"
            name = f"{stem}-{style}.woff2"
            font.save(target / name)
            sources.append(f"| `{folder}/{name}` | {ttf_url}, wght={weight} | `{digest}` |")
    (OUT / "SOURCES.md").write_text("\n".join(sources) + "\n", encoding="utf-8")


def verify():
    failed = 0
    for folder, stem, _, _, weights in FAMILIES:
        for weight, style in weights.items():
            path = OUT / folder / f"{stem}-{style}.woff2"
            font = TTFont(path)
            cmap = font.getBestCmap()
            missing = [ch for ch in MUST_HAVE if ord(ch) not in cmap]
            actual_weight = font["OS/2"].usWeightClass
            ok = not missing and actual_weight == weight
            failed += not ok
            print(f"{'ok  ' if ok else 'FAIL'} {path.relative_to(ROOT)}: вес {actual_weight}, нет {''.join(missing) or '—'}")
    return failed


if __name__ == "__main__":
    if "--verify" not in sys.argv:
        build()
    sys.exit(1 if verify() else 0)
