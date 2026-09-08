# PerfGraph — L 410 UVP-E20 / H75-200 takeoff performance

Takeoff performance calculator for the Let L 410 UVP-E20 with GE H75-200 engines and
5-blade propellers. Enter airfield elevation, OAT, QNH, runway declared distances,
slope and wind; it returns V speeds and RTOW limited by field length, OEI 2nd-segment
climb, and MTOW.

## ⚠ Not for operational use

This tool is **not an approved performance application** and is not airworthiness
approved. Figures are computed from a digitisation of the AFM graphs and are intended
for study, cross-checking and dispatch planning support only. **The AFM is the sole
authority.** Verify every figure against the aeroplane's own AFM before acting on it.

Known modelling gaps: wet and contaminated runway corrections, landing performance,
and weight & balance are referenced in the interface but not modelled.

## Running it

Open `index.html` in any modern browser. It is a single self-contained file — fonts,
icons, styles and all computation are inlined. No server, no build step, no network
access required. It works from a USB stick, an email attachment, or offline on a tablet.

Live version (GitHub Pages): enable Pages in **Settings → Pages**, source
`main` / root.

## What it computes

- **Atmosphere** — pressure altitude from QNH, density altitude, ISA deviation.
- **RTOW** — the lowest of field-length limit, OEI 2nd-segment climb limit, and MTOW,
  with the binding limit named.
- **Distances** — TORR, TODR, ASDR against corrected TORA/TODA/ASDA, with margins.
- **V speeds** — V1, VR, V2, Vmcg, Vmca, Vyse, VFTO.
- **V1 basis** — three selectable modes under Configuration:
  - *Schedule 81* — the operator's standard briefed V1 (default).
  - *AFM best* — the V1 that maximises RTOW on this runway; falls back to the
    schedule where V1 makes no difference, so a briefed number only changes when it
    buys payload.
  - *Manual* — crew-entered, clamped Vmcg…VR.
  The payload cost of the selected V1 against the best available is shown explicitly.
- **CSV export** — records the V1 actually used *and* the operator schedule, so the
  export is self-consistent with the distances in it.

## Repository layout

```
index.html          the app — single self-contained file, this is the deliverable
src/                sources it was built from
  Takeoff Performance.dc.html   the component the app is authored as
  build-standalone.html         pre-inline build entry
  support.js                    component runtime
  airports-africa.js            airfield database
  data/                         digitised AFM graph data
  tools/                        digitisation helpers
```

`index.html` is generated from `src/` by inlining every dependency; edit the sources
and re-bundle rather than editing `index.html` by hand.
