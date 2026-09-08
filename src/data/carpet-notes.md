# Carpet plates — Figs. 5-13 (TOR), 5-16 (TOD), 5-19 (ASD)

Status: **not extracted.** Automated attempt made and partly successful; the missing half
needs hand-plotted values. This note exists so the dead ends are not retried.

## What these plates are

Not curve families — genuine **carpet plots**. A skewed mesh of two line families:

- **8 pressure-altitude curves**: 0, 2 000, 4 000, 6 000, 8 000, 10 000, 12 000, 13 120 ft
  (labelled in ft with metres in parentheses: 0, 610, 1 220, 1 830, 2 440, 3 050, 3 660,
  4 000 m). Lowest curve on the plate = PA 0; highest = PA 13 120.
- **10 OAT ribs**: −60 to +30 °C in 10 °C steps, labelled at the ribs' lower ends.
- An **ISA + 35 °C** limit line marks the upper-right edge of the valid region.

There is **no meaningful x axis** — x is the carpet's skew dimension. The data is the
**y value at each of the 80 mesh nodes**, read off the left scale.

## Axis calibration (verified self-consistent: 7 gridlines, 400 m apart)

All three plates share a 0 – 2 400 m left scale.

| Plate | page | image y at 0 m | image y at 2 400 m |
| --- | --- | --- | --- |
| Fig. 5-13 TOR | 26 | 568 | 253 |
| Fig. 5-16 TOD | 29 | 555 | 244 |
| Fig. 5-19 ASD | 32 | 561 | 247 |

(`figures/pNN.png`, 892 px wide, scale 1.4985 px/pt. Frame grid in
`data/carpet-frames.json`.)

## What worked

Orientation separation by structure tensor (7×7 window, coherence > 0.42) cleanly isolates
the **shallow family — the PA curves** — from everything else. `figures/trace/p32-sep.png`
shows the result: PA curves in blue, complete and continuous. This is reusable.

## What did not work, and why — do not retry these

1. **Vector path extraction.** The curves are an embedded bitmap
   (`paintImageXObject`); only the worked-example construction lines are vector. Those
   lines are still useful as a calibration cross-check.
2. **Glyph-box masking of the in-plot labels.** The labels
   ("AIRFIELD PRESSURE ALTITUDE", "13,120 (4,000)", "−60°C" …) are **not in the PDF text
   layer** — they are painted into the bitmap. `getTextContent()` returns only the page
   header, footer and caption. There is nothing to mask.
3. **Column scanning for an N-run invariant** (the trick that made Fig. 5-20 exact). Fails
   here: run counts per column range 1–15 because the two families cross, the mesh is a
   fan (curves start and stop at different temperatures), and the labels lie across the
   curves.
4. **Hough transform for the OAT ribs.** The ribs are steep and roughly straight, so this
   should have worked, but the peaks come back duplicated at neighbouring θ and polluted
   by the rotated text, which is also locally straight and steep. No clean set of 10.

## Reference condition of the carpet output — 5 400 kg, V1 84 KIAS

The carpets carry no weight label, and the reference is not stated in the text. It was
recovered from Fig. 5-20 rather than assumed: each carrier curve there is labelled with a
distance, and evaluating the traced curves at **5 400 kg** returns 2004, 1808, 1605, 1408,
1205, 1006, 806, 606 m — every curve reads its own label to within 8 m. The right-hand
panel does the same at **V1 = 84 KIAS**.

So the carpet yields the required distance at 5 400 kg / V1 84, and Fig. 5-20 then corrects
it to the actual weight and V1. Node values read off the carpet are therefore not
weight-specific and remain valid across the envelope.

## Fig. 5-17 (TOD weight/V1, page 30) — V1 panel done, weight panel NOT

Same two-panel layout as Fig. 5-20, same shared 0–2 400 m scale (the right axis is the
same scale relabelled in 1000 ft — 1.5/3.0/4.5/6.0/7.5 map onto 457/914/1372/1829/2286 m).
Axis calibration verified: y 645.5 px = 0 m, y 259.5 px = 2400 m; weight 236.5 px = 4 600 kg,
436 px = 6 600 kg; V1 514 px = 72 KIAS, 677.5 px = 84 KIAS. The weight and V1 calibrations
are independently confirmed by the worked example landing on 5 773 / 4 813 kg and V1 84 / 73
against its published 5 800 / 4 800 kg and 84 / 73.

**The example decodes to: TOD Required 742 m, TODAcor 910 m** (five vector construction
segments on page 30, decoded not eyeballed), giving two exact points on one weight curve:
ratio 0.819 at 4 813 kg and 1.226 at 5 773 kg, against 1.000 at the 5 400 kg reference.

**V1 panel: traced and validated.** 8 curves, nearest-neighbour linking seeded mid-panel.
The example's single check point gives +2.3 % (608 m at V1 73 → model 931 m vs plate 910 m;
model ratio 1.5313 vs plate 1.4967). Note the V1 ratio here is ABOVE 1 and large, the
opposite of Fig. 5-20's — correct, because a lower V1 lengthens the go case while shortening
the stop case.

**Weight panel: automated tracing gives ratios about 8 % too shallow. Not usable.** Three
compounding obstacles, all now understood:

1. *Horizontal gridlines are nearest-neighbour traps.* These curves are steep (up to
   0.58 m/kg near MTOW) and accelerate to the right; a flat gridline is always the nearest
   candidate, so the trace hopped onto one and ran level. Fixed by painting the gridlines
   out — do not mask by y-level instead: a ±2.4 px level mask also deletes real curve
   pixels wherever a curve passes near that level, which silently removed four curves.
2. *The rotated "REFERENCE LINE" caption sits immediately left of the reference line*
   (x ≈ 300–315), so the columns where carrier values must be measured are full of text —
   22 spurious runs in one sampled column.
3. *Curves leave the top of the plot as weight rises* — 8 curves at 4 856 kg, 5 at 5 638 kg,
   3 at 6 440 kg — so curve identity cannot be carried across the panel by count.

After painting the overlay out, the bottom curve traces cleanly and continuously
(342 m at 4 876 kg rising to 588 m at 6 440 kg), and the family is clearly concave up with
ratios that grow with carrier value (1.27 for the lowest curve over 4 856→5 638 kg, 1.44 for
the fifth). But the reconstruction still disagrees with the plate's own example by ~8 % at
both ends, so it is not trustworthy. Hand-plotted values are needed for this panel.

## What is still needed

The **node values**: required distance at each (OAT, PA) intersection. Once any subset is
in hand, the traced PA curves above let the rest be filled in by interpolation along each
curve rather than by reading every node.

Fig. 5-19 (ASD) alone is enough to validate the whole approach, because the supplement's
worked example publishes the TOR and TOD weights (6 200 / 4 900 kg and 5 800 / 4 800 kg at
V1 84 / 73) and the final answers (TOR × ASD → 75 KIAS, 5 170 kg; TOD × ASD → 75.5 KIAS,
5 010 kg). Getting those two intersections right tests the ASD chain end to end.
