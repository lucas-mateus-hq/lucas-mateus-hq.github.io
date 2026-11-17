#!/usr/bin/env python3
"""Regenera scripts/og/glyphs.json: contornos (paths SVG) das letras da Inter, usados por scripts/generate-og.mjs.
Rodar só ao trocar fonte ou conjunto de caracteres: pip install fonttools brotli && python3 scripts/og/make-glyphs.py
Fonte: public/fonts/inter-latin-opsz-normal.woff2 (a mesma da página). Contornos evitam depender de fontes do sistema no CI."""
import json, pathlib
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

root = pathlib.Path(__file__).resolve().parents[2]
src = root / 'public/fonts/inter-latin-opsz-normal.woff2'
chars = [chr(c) for c in range(32, 127)] + list('ÁÀÂÃÉÊÍÓÔÕÚÜÇáàâãéêíóôõúüç·–—’“”')
out = {}
for name, wght in (('bold', 800), ('medium', 500)):
    font = instantiateVariableFont(TTFont(src), {'wght': wght, 'opsz': 32})
    cmap, gs, upm = font.getBestCmap(), font.getGlyphSet(), font['head'].unitsPerEm
    k = 1000 / upm
    table = {}
    for ch in chars:
        g = cmap.get(ord(ch))
        if g is None: continue
        pen = SVGPathPen(gs, ntos=lambda v: str(round(v)))
        gs[g].draw(TransformPen(pen, (k, 0, 0, -k, 0, 0)))  # y para baixo
        table[ch] = {'w': round(gs[g].width * k), 'd': pen.getCommands()}
    out[name] = table
(root / 'scripts/og/glyphs.json').write_text(json.dumps(out, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print({n: len(t) for n, t in out.items()})
