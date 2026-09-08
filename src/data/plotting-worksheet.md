# Plotting worksheet — H75 supplement, flaps 18° take-off chain

All page numbers are `uploads/H75 supplement.pdf` (Doc 04-005-FMS-01 Issue 5, 60 pp).
Rendered plates are in `figures/pNN.png`.

## Status

| Fig | Page | What it does | Status |
| --- | --- | --- | --- |
| 5-12 | 25 | TORA slope + wind correction | not started |
| 5-13 | 26 | OAT × PA → TOR required (carpet) | **needs plotting** |
| 5-14 | 27 | Weight + V1 correction for TOR | not started |
| 5-15 | 28 | TODA slope + wind correction | to be machine-traced |
| 5-16 | 29 | OAT × PA → TOD required (carpet) | **done** — two passes merged, agree 11.5 m rms |
| 5-17 | 30 | Weight + V1 correction for TOD | V1 panel done ±2.3 %; **weight panel needs plotting — THE BLOCKER** |
| 5-18 | 31 | ASDA slope + wind correction | machine-traced, done |
| 5-19 | 32 | OAT × PA → ASD required (carpet) | usable (one pass); a 2nd ISA-grid pass would match 5-16 |
| 5-20 | 33 | Weight + V1 correction for ASD | machine-traced, validated ±1.7 % |
| 5-21 | 34 | Balanced field intersection | procedure only, no data to read |

Flaps 0° (Figs. 5-22…5-30) is out of scope — Ops Manual permits flap 0 take-off for
ferry flights only.

## Axis reading — SETTLED, and a test that misled me

The pass-to-pass comparison is what actually settled this, and it overturned an earlier
conclusion of mine. A density-altitude collapse test had appeared to show the crossing-line
labels were ISA deviations rather than actual OAT (29.1 m vs 53.8 m local scatter), which
would have meant the first pass was mislabelled by up to 15 °C. **That was wrong.** The
metric is sensitive to how points distribute in DA space, not only to physical coherence.
Had pass 1 really been mislabelled, comparing the two passes at equal actual OAT would have
shown a systematic offset of tens to hundreds of metres; the measured mean bias is −2.3 m.
Pass 1 was correctly labelled all along and nothing was wasted — the second pass simply
sampled the hot corner better, and both are now merged.

## Axis reading — confirmed

The bottom axis of the carpets is **actual OAT**. The steep lines crossing the
pressure-altitude curves are **constant-ISA-deviation** lines. Confirmed two ways:

1. Take-off distance collapses onto a single function of density altitude with 29.1 m
   scatter under the ISA-deviation reading, against 53.8 m if the crossing lines are read
   as isotherms — nearly 2:1, and physically expected, since constant ISA deviation at a
   given pressure altitude means a constant density-altitude offset.
2. Every one of the seven envelope-edge reads from the first pass lands on a computed ISA
   cell to within 1 °C (see the table below). Those reads were already ISA-line crossings.

Reads are therefore indexed by **(pressure altitude, ISA deviation)**, and actual OAT is
derived, not recorded: `OAT = 15 − 1.98 × (PA_ft / 1000) + deviation`.

## Reading plan — actual OAT to enter at, per (PA, ISA deviation)

Arithmetic pre-done so it can be checked rather than repeated. Go to this temperature on
the bottom axis, up to the named pressure-altitude curve, then left to the distance scale.

| PA | ISA-20 | ISA-10 | ISA+0 | ISA+10 | ISA+20 | ISA+25 | ISA+30 | ISA+35 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **0 ft** | -5.0 | +5.0 | +15.0 | +25.0 | +35.0 | +40.0 | +45.0 | +50.0 |
| **2000 ft** | -9.0 | +1.0 | +11.0 | +21.0 | +31.0 | +36.0 | +41.0 | +46.0 |
| **4000 ft** | -12.9 | -2.9 | +7.1 | +17.1 | +27.1 | +32.1 | +37.1 | +42.1 |
| **6000 ft** | -16.9 | -6.9 | +3.1 | +13.1 | +23.1 | +28.1 | +33.1 | +38.1 |
| **8000 ft** | -20.8 | -10.8 | -0.8 | +9.2 | +19.2 | +24.2 | +29.2 | +34.2 |
| **10000 ft** | -24.8 | -14.8 | -4.8 | +5.2 | +15.2 | +20.2 | +25.2 | — |
| **12000 ft** | -28.8 | -18.8 | -8.8 | +1.2 | +11.2 | — | — | — |

**The dashes are outside the charted envelope, not omissions.** The mesh does not reach
ISA+35 above 8 000 ft: the limit steps to ISA+30 at 10 000 ft and ISA+20 at 12 000 ft. The
first-pass edge reads confirm this independently — +50, +46, +42, +38, +34, +25, +12 against
computed 50.0, 46.0, 42.1, 38.1, 34.2, 25.2, 11.2. So the last populated cell in each row
IS that altitude's envelope edge, and no separate edge column is needed this time.

Record as: `0ft: ISA-20: 420, ISA-10: 440, ISA+0: 475, ...` — one line per pressure
altitude, distances in metres off the left scale to the nearest 10 m.

Grid: **ISA−20, −10, 0, +10, +20, +25, +30, +35** at **0, 2 000, 4 000, 6 000, 8 000,
10 000, 12 000 ft**. That is 50 live cells per plate. ISA+25 is included because the curves
bend hardest between ISA+10 and ISA+25 — second differences reach 160 m per 10 °C step at
10 000 ft, which is the engine leaving its flat rating. Skip 13 120 ft.

Same grid for **Fig 5-16 (TOD, p 29)** and **Fig 5-19 (ASD, p 32)**.

## Fig 5-17 left panel (p 30) — the blocker

Ordinary x–y graph, not a carpet: take-off distance vertical, take-off weight horizontal,
curve family inside. Machine tracing failed here (~8 % too shallow); reasons recorded in
`data/carpet-notes.md`.

Pick three curves — the bottom one, one mid-family, one near the top — and read each at:

```
4800, 5200, 5400, 5600, 6000, 6400, 6600 kg      (= 48, 52, 54, 56, 60, 64, 66 on the [100 kg] axis)
```

5 400 kg is the printed REFERENCE LINE and matters most; everything is normalised to it.
Write `off` where a curve leaves the top of the plot. Say roughly where each curve sits
("lowest", "5th from bottom", "highest full curve").

Known-good check values already decoded from the plate's own worked example (its
construction lines are vector objects in the PDF): **TOD Required 742 m, TODAcor 910 m**,
giving one curve passing through ratio 0.819 at 4 813 kg and 1.226 at 5 773 kg relative to
1.000 at 5 400 kg.

## Fig 5-13 (TOR carpet, p 26) — completes the chain

Same grid as 5-16 and 5-19. This is the third of the three loci; without it the balanced
field solution can only be found from TOD × ASD, not TOR × ASD.
