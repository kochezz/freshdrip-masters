# Print pieces

Print-ready PDFs for the Lusaka Masters, one page per file, in `out/`.

| File | Trim size | Notes |
| --- | --- | --- |
| `01-table-card-front.pdf` | 85 × 55 mm | QR → `?src=table` |
| `02-table-card-back.pdf` | 85 × 55 mm | |
| `03-neck-tag-front.pdf` | 50 × 110 mm | QR → `?src=tag`. Die-cut, see dieline |
| `04-neck-tag-back.pdf` | 50 × 110 mm | |
| `05-neck-tag-dieline.pdf` | 50 × 110 mm | Cut guide only, do not print |
| `06-stand-poster-A2.pdf` | 420 × 594 mm | QR → `?src=stand` |

Every PDF includes **3 mm bleed** on all sides (page size = trim + 6 mm). Text sits at least 4 mm inside the trim. Colours are RGB; ask the printer for a colour proof, as navy and cyan shift slightly in CMYK.

## Regenerate (e.g. after setting up short.io links)

Change the QR target in the `node -e` QR step (or replace `assets/qr-*.svg`) and `URL_TEXT` in `build.py`, then:

```bash
cd print
npm install
pip install playwright && playwright install chromium   # or point build.py at an installed Chrome
python3 build.py
```
