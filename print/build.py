"""Builds the freshDRIP Lusaka Masters print pieces as separate print-ready PDFs.
Each page = trim size + 3 mm bleed on every side. Keep text 4 mm inside trim."""
import os, pathlib
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).parent
A = (HERE / "assets").as_uri()
F = (HERE / "node_modules/@fontsource").as_uri()
OUT = HERE / "out"; OUT.mkdir(exist_ok=True)
BLEED = 3
URL_TEXT = "freshdrip-masters.vercel.app"

def qr(k): return (HERE / f"assets/qr-{k}.svg").read_text()

FONTS = f"""
@font-face{{font-family:Brico;font-weight:700;src:url({F}/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff2)}}
@font-face{{font-family:Brico;font-weight:800;src:url({F}/bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff2)}}
@font-face{{font-family:Fig;font-weight:400;src:url({F}/figtree/files/figtree-latin-400-normal.woff2)}}
@font-face{{font-family:Fig;font-weight:600;src:url({F}/figtree/files/figtree-latin-600-normal.woff2)}}
@font-face{{font-family:Fig;font-weight:700;src:url({F}/figtree/files/figtree-latin-700-normal.woff2)}}
@font-face{{font-family:Mono;font-weight:600;src:url({F}/jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff2)}}
"""

BASE = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%}
body{font-family:Fig,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
:root{--navy:#123A73;--cyan:#14B3E6;--ink:#0B2230;--paper:#F7F4EC;--champ:#C9A75F;--muted:#3E5F82}
.page{position:relative;width:100%;height:100%;overflow:hidden}
.safe{position:absolute;inset:calc(var(--b) + 4mm)}
.wm{font-family:Brico;font-weight:800;letter-spacing:-.01em}
.wm b{color:var(--cyan);font-weight:800}
.kick{font-family:Mono;font-weight:600;letter-spacing:.16em;text-transform:uppercase}
.qrtile{background:#fff;border-radius:2mm}
.qrtile svg{display:block;width:100%;height:auto}
"""

def page(name, w, h, css, body):
    W, H = w + 2 * BLEED, h + 2 * BLEED
    html = f"""<!doctype html><html><head><meta charset="utf-8"><style>
@page{{size:{W}mm {H}mm;margin:0}}{FONTS}{BASE}
:root{{--b:{BLEED}mm}}
{css}</style></head><body><div class="page">{body}</div></body></html>"""
    p = HERE / f"{name}.html"; p.write_text(html)
    return name, p, W, H

PAGES = []

# 1. Table card front, 85 x 55 mm
PAGES.append(page("01-table-card-front", 85, 55, """
.page{background:radial-gradient(70mm 50mm at 85% 20%, #1B5670 0%, transparent 70%), var(--ink);color:#EAF6F8}
.grid{display:grid;grid-template-columns:1fr 24mm;gap:4mm;height:100%}
.kick{font-size:5.2pt;color:var(--champ)}
h1{font-family:Brico;font-weight:800;font-size:12.2pt;line-height:1.02;margin-top:1.6mm;letter-spacing:-.015em}
h1 em{font-style:normal;color:var(--cyan)}
.items{font-size:5.4pt;color:#A9C6CE;margin-top:1.8mm;line-height:1.35}
.foot{position:absolute;left:0;bottom:0;display:flex;align-items:flex-end;gap:2.5mm}
.foot img{height:7.5mm}
.draw{font-size:5pt;color:#8FB4BE;line-height:1.3}
.draw b{color:#EAF6F8;font-weight:700}
.right{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.4mm}
.qrtile{width:24mm;padding:2mm}
.scan{font-family:Mono;font-weight:600;font-size:4.6pt;letter-spacing:.12em;color:var(--cyan);text-transform:uppercase}
.url{font-size:4.4pt;color:#A9C6CE;text-align:center;line-height:1.2}
.left{position:relative}
""", f"""<div class="safe"><div class="grid">
  <div class="left">
    <div class="kick">Lusaka Masters · 2026</div>
    <h1>Scan to win a <em>freshDRIP</em> water station for your office</h1>
    <p class="items">Water dispenser · 5-gallon freshDRIP<br>Case of freshDRIP LUX</p>
    <div class="foot"><img src="{A}/vilagio-light.png" alt=""><p class="draw"><b>Drawn 22 November</b><br>at the prize-giving</p></div>
  </div>
  <div class="right"><div class="qrtile">{qr('table')}</div><div class="scan">Scan me</div><div class="url">{URL_TEXT}</div></div>
</div></div>"""))

# 2. Table card back, 85 x 55 mm
PAGES.append(page("02-table-card-back", 85, 55, """
.page{background:var(--paper);color:var(--ink)}
.grid{display:grid;grid-template-columns:1fr 26mm;gap:4mm;height:100%;align-items:stretch}
.wm{font-size:13pt;color:var(--navy)}
.kick{font-size:4.8pt;color:var(--cyan);margin-top:.8mm}
.what{font-size:6pt;line-height:1.4;color:var(--muted);margin-top:2.4mm}
.what b{color:var(--ink)}
.contact{position:absolute;left:0;bottom:0;font-size:5.4pt;line-height:1.4;color:#3E5660}
.contact b{color:var(--ink);font-weight:700}
.left{position:relative}
.right{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1mm;border-left:.2mm solid #D9D2C2;padding-left:3mm}
.right span{font-family:Mono;font-weight:600;font-size:4pt;letter-spacing:.16em;color:#7A8C94;text-transform:uppercase}
.right img{width:22mm}
""", f"""<div class="safe"><div class="grid">
  <div class="left">
    <div class="wm">fresh<b>DRIP</b></div>
    <div class="kick">Pure natural spring water</div>
    <p class="what">Enter the draw in 30 seconds and <b>instantly download</b> our Company Profile and Sales Catalogue.<br>Office, site, events and co-branded supply.</p>
    <p class="contact"><b>Emmanuel Zulu</b> · 0970 850 065<br>Plot 28441, 50/50, Kitwe Road, Chingola</p>
  </div>
  <div class="right"><span>A product of</span><img src="{A}/vilagio.png" alt="Vilagio"></div>
</div></div>"""))

# 3. LUX neck tag front, 50 x 110 mm (die-cut: rounded top, 12 mm hole)
TAG = """
.hole{position:absolute;left:50%;top:calc(var(--b) + 12mm);width:12mm;height:12mm;transform:translate(-50%,-50%);border-radius:50%;border:.35mm dashed rgba(201,167,95,.0)}
"""
PAGES.append(page("03-neck-tag-front", 50, 110, TAG + """
.page{background:linear-gradient(180deg,#0B2230 0%,#0E3343 100%);color:#EAF6F8}
.safe{display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:20mm}
.wm{font-size:15pt}
.lux{font-family:Mono;font-weight:600;font-size:6pt;letter-spacing:.5em;color:var(--champ);margin-top:.6mm;padding-left:.5em}
h2{font-family:Brico;font-weight:800;font-size:11.5pt;line-height:1.05;margin-top:5mm;letter-spacing:-.01em}
h2 em{font-style:normal;color:var(--cyan)}
.qrtile{width:30mm;padding:2.5mm;margin-top:4.5mm}
.scan{font-family:Mono;font-weight:600;font-size:5pt;letter-spacing:.14em;color:var(--cyan);margin-top:2mm;text-transform:uppercase}
.url{font-size:5pt;color:#A9C6CE;margin-top:.8mm}
.foot{margin-top:auto;font-size:5.2pt;color:#8FB4BE;line-height:1.35}
.foot b{color:#EAF6F8}
""", f"""<div class="safe">
  <div class="wm">fresh<b>DRIP</b></div><div class="lux">LUX</div>
  <h2>Scan to win a <em>freshDRIP</em> water station</h2>
  <div class="qrtile">{qr('tag')}</div>
  <div class="scan">Scan me</div><div class="url">{URL_TEXT}</div>
  <p class="foot"><b>Drawn 22 November</b><br>Lusaka Masters 2026</p>
</div>"""))

# 4. LUX neck tag back
PAGES.append(page("04-neck-tag-back", 50, 110, TAG + """
.page{background:var(--paper);color:var(--ink)}
.safe{display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:20mm}
.wm{font-size:13pt;color:var(--navy)}
.kick{font-size:5pt;color:var(--cyan);margin-top:1mm}
.prize{margin-top:5mm;font-size:6.4pt;line-height:1.5;color:var(--muted)}
.prize b{display:block;font-family:Brico;font-weight:800;font-size:8.5pt;color:var(--navy);margin-bottom:1mm}
.tech{display:flex;gap:3mm;margin-top:5mm}
.tech div{font-family:Brico;font-weight:700;font-size:9pt;color:var(--cyan)}
.tech small{display:block;font-family:Mono;font-weight:600;font-size:3.6pt;letter-spacing:.1em;color:#7A8C94;text-transform:uppercase}
.maker{margin-top:auto;display:flex;flex-direction:column;align-items:center;gap:1mm}
.maker span{font-family:Mono;font-weight:600;font-size:4pt;letter-spacing:.16em;color:#7A8C94;text-transform:uppercase}
.maker img{width:24mm}
.addr{font-size:4.6pt;color:#3E5660;margin-top:1.2mm}
""", f"""<div class="safe">
  <div class="wm">fresh<b>DRIP</b></div>
  <div class="kick">Pure natural spring water</div>
  <p class="prize"><b>The prize</b>Water dispenser<br>5-gallon freshDRIP<br>Case of freshDRIP LUX</p>
  <div class="tech"><div>RO<small>Osmosis</small></div><div>UV<small>Sterilised</small></div><div>O₃<small>Ozone</small></div></div>
  <div class="maker"><span>A product of</span><img src="{A}/vilagio.png" alt="Vilagio"><p class="addr">Chingola, Zambia</p></div>
</div>"""))

# 5. Neck tag dieline (cut guide, not printed)
PAGES.append(page("05-neck-tag-dieline", 50, 110, """
.page{background:#fff}
svg.die{position:absolute;inset:0;width:100%;height:100%}
.note{position:absolute;left:0;right:0;bottom:calc(var(--b) + 8mm);text-align:center;font-size:5pt;color:#E6007E;line-height:1.4}
""", f"""<svg class="die" viewBox="0 0 56 116" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 113 L3 18 A15 15 0 0 1 18 3 L38 3 A15 15 0 0 1 53 18 L53 113 Z" fill="none" stroke="#E6007E" stroke-width=".25"/>
  <circle cx="28" cy="15" r="6" fill="none" stroke="#E6007E" stroke-width=".25"/>
</svg>
<p class="note">DIELINE · do not print<br>Trim 50 × 110 mm · top corners R15 mm<br>Hole Ø12 mm, centre 12 mm from top</p>"""))

# 6. Stand poster, A2 420 x 594 mm
PAGES.append(page("06-stand-poster-A2", 420, 594, """
.page{background:radial-gradient(330mm 330mm at 30% 42%, #FFFFFF 0%, #E4F4FA 55%, #CDEAF4 100%);color:var(--navy)}
.safe{inset:calc(var(--b) + 22mm);display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;align-items:baseline}
.wm{font-size:44pt}
.top .kick{font-size:14pt;color:var(--cyan)}
.mid{flex:1;display:grid;grid-template-columns:120mm 1fr;gap:16mm;align-items:center;margin-top:14mm}
.bottle{height:330mm;display:flex;justify-content:center}
.bottle img{height:100%;width:auto}
.kick2{font-family:Mono;font-weight:600;font-size:13pt;letter-spacing:.16em;color:var(--cyan);text-transform:uppercase}
h1{font-family:Brico;font-weight:800;font-size:72pt;line-height:.98;letter-spacing:-.02em;margin-top:6mm}
h1 em{font-style:normal;color:var(--cyan)}
.chips{display:flex;flex-wrap:wrap;gap:4mm;margin-top:10mm}
.chips span{font-weight:700;font-size:16pt;padding:4mm 7mm;border-radius:20mm;background:rgba(18,58,115,.08)}
.scanrow{display:flex;gap:10mm;align-items:center;margin-top:14mm}
.qrtile{width:105mm;padding:7mm;border-radius:6mm;box-shadow:0 4mm 12mm rgba(18,58,115,.12)}
.how{font-size:17pt;line-height:1.45;color:var(--muted)}
.how b{display:block;font-family:Brico;font-weight:800;font-size:30pt;color:var(--navy);line-height:1.05;margin-bottom:4mm}
.how .url{font-family:Mono;font-weight:600;font-size:13pt;color:var(--navy);margin-top:5mm;display:block}
.foot{display:flex;justify-content:space-between;align-items:flex-end;border-top:.5mm solid rgba(18,58,115,.15);padding-top:9mm;margin-top:12mm}
.draw{font-size:17pt;color:var(--muted)}
.draw b{color:var(--navy)}
.maker{display:flex;align-items:center;gap:6mm}
.maker span{font-family:Mono;font-weight:600;font-size:10pt;letter-spacing:.16em;color:#5C7A99;text-transform:uppercase;text-align:right;line-height:1.5}
.maker img{height:34mm}
""", f"""<div class="safe">
  <div class="top"><div class="wm">fresh<b>DRIP</b></div><div class="kick">Lusaka Masters · 2026</div></div>
  <div class="mid">
    <div class="bottle"><img src="{A}/bottle.png" alt=""></div>
    <div>
      <div class="kick2">Prize draw</div>
      <h1>Win a <em>freshDRIP</em> water station for your office</h1>
      <div class="chips"><span>Water dispenser</span><span>5-gallon freshDRIP</span><span>Case of freshDRIP LUX</span></div>
      <div class="scanrow">
        <div class="qrtile">{qr('stand')}</div>
        <p class="how"><b>Scan to enter</b>Takes 30 seconds. Download our Company Profile and Sales Catalogue instantly.<span class="url">{URL_TEXT}</span></p>
      </div>
    </div>
  </div>
  <div class="foot">
    <p class="draw"><b>Winner drawn 22 November</b> at the prize-giving</p>
    <div class="maker"><span>A product of<br>Vilagio Trading Limited</span><img src="{A}/vilagio.png" alt="Vilagio"></div>
  </div>
</div>"""))

with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox", "--allow-file-access-from-files"])
    pg = b.new_page()
    for name, path, W, H in PAGES:
        pg.goto(path.as_uri(), wait_until="networkidle")
        pg.evaluate("document.fonts.ready")
        pg.pdf(path=str(OUT / f"{name}.pdf"), width=f"{W}mm", height=f"{H}mm", print_background=True, margin={"top": "0", "right": "0", "bottom": "0", "left": "0"}, prefer_css_page_size=True)
        print("built", name)
    b.close()
