/* Fig. 5-16 — OAT and airfield pressure altitude for TOD, wing flaps 18°.
   H75 supplement (Doc 04-005-FMS-01 Issue 5) page 29 of 60. Caption: "(TOD Required)".

   REFERENCE ONLY — NOT APPROVED FOR FLIGHT USE.

   Output condition: TOD required at 5 400 kg and V1 84 KIAS — the reference printed as a
   heavy vertical "REFERENCE LINE" at 54 on Fig. 5-17's TAKE-OFF WEIGHT [100 kg] axis.
   Fig. 5-17 then corrects this distance to the actual weight and V1.

   PROVENANCE — hand-plotted by the operating pilot across TWO INDEPENDENT PASSES, not
   machine-traced. Fig. 5-16 is a carpet plot drawn as an embedded bitmap with its labels
   painted in rather than held in the PDF text layer; four automated approaches were tried
   and all failed (see data/carpet-notes.md).

     pass 1 — read at round actual OAT (−20 … +40 °C) plus a separately-read envelope edge
     pass 2 — read at round ISA deviations (ISA−20 … ISA+35), converted to actual OAT here

   The two passes sampled the same surface at different points and agree to 11.5 m rms with
   a −2.3 m mean bias over the 38 places where they overlap; worst single disagreement 34 m
   at 10 000 ft / ISA+20, in the steepest part of the chart. That agreement is the strongest
   validation in this dataset — two hand readings of the same plate, weeks apart, on
   deliberately different grids. Both are retained: reads within 1.5 °C of each other are
   averaged, and the union gives up to 14 samples per altitude instead of 8.

   WHAT THE CROSSING LINES ARE. The plate's bottom axis is actual OAT; the steep lines
   crossing the pressure-altitude curves are constant-ISA-deviation lines. Pass 2 was read
   along those lines, which is why its hot-end coverage is better — the last point in every
   row below is that altitude's envelope edge, where the mesh meets its ISA limit
   (ISA+35 to 8 000 ft, ISA+30 at 10 000 ft, ISA+20 at 12 000 ft). Those edge points used to
   be extrapolated, which cost 38–99 m in the unsafe direction.

   A NOTE ON A TEST THAT MISLED. A density-altitude collapse test appeared to show the
   crossing-line labels were ISA deviations rather than actual OAT (29.1 m vs 53.8 m
   scatter), which would have meant pass 1 was mislabelled by up to 15 °C. It was wrong:
   the local-scatter metric is sensitive to how points distribute in DA space, not only to
   physical coherence. The pass-to-pass comparison settled it properly — had pass 1 been
   mislabelled, comparing at equal actual OAT would have shown a systematic offset of tens
   to hundreds of metres, not −2.3 m. Values are stored against ACTUAL OAT.

   Coverage: 13 120 ft and the −30…−60 °C lines were deliberately not read — the operator
   flies neither. Anything outside a row's span reports as extrapolated. */

(function () {
  var ROWS = [
    { pa: 0, pts: [[-20, 420], [-10, 440], [-5, 460], [0, 475], [5, 485], [10, 500], [15, 520], [20, 520], [25, 530], [30, 550], [35, 565], [40, 590], [45, 630], [50, 693]] },
    { pa: 2000, pts: [[-20, 480], [-9.5, 508], [0.5, 533], [10.5, 563], [20.5, 585], [30.5, 625], [40.5, 713], [46, 828]] },
    { pa: 4000, pts: [[-20, 525], [-12.9, 545], [-10, 560], [-2.9, 590], [0, 595], [7.1, 620], [10, 620], [17.1, 640], [20, 650], [27.1, 680], [30, 720], [37.1, 845], [40, 920], [42, 963]] },
    { pa: 6000, pts: [[-20, 585], [-16.9, 595], [-10, 620], [-6.9, 640], [0, 660], [3.1, 665], [10, 695], [13.1, 715], [20, 770], [23.1, 810], [30, 940], [33.1, 1025], [38, 1175]] },
    { pa: 8000, pts: [[-20.4, 673], [-10.4, 713], [-0.4, 758], [9.6, 830], [19.6, 1010], [29.6, 1300], [34.1, 1495]] },
    { pa: 10000, pts: [[-24.8, 775], [-20, 800], [-14.8, 835], [-10, 850], [-4.8, 900], [0, 960], [5.2, 1040], [10, 1145], [15.2, 1290], [20, 1490], [25.1, 1698]] },
    { pa: 12000, pts: [[-28.8, 885], [-19.4, 943], [-9.4, 1120], [0.6, 1335], [11.3, 1680]] },
  ];

  /* Resolved lazily, NOT at load time. The single-file build concatenates these
     modules in an order that can put a carpet before data/afm-interp.js, and calling
     window.PG_INTERP.makeCarpet() during load then threw and left this module undefined
     — the app silently lost its Fig. 5-16 carpet. A lazy getter is order-independent. */
  var _lookup = null;
  function lookup(paFt, oatC) {
    if (!_lookup) {
      if (!window.PG_INTERP) throw new Error('Fig. 5-16: data/afm-interp.js not loaded');
      _lookup = window.PG_INTERP.makeCarpet({
        ROWS: ROWS, name: 'TOD required', fig: 'Fig. 5-16', unit: 'm',
      });
    }
    return _lookup(paFt, oatC);
  }
  lookup.maxOat = function (paFt) {
    if (!_lookup) lookup(0, 0);
    return _lookup.maxOat(paFt);
  };

  window.PG_FIG516 = {
    ROWS: ROWS,
    todRequired: function (paFt, oatC) {
      var r = lookup(paFt, oatC);
      return { tod: r.value, extrapolated: r.extrapolated, reason: r.reason, maxOat: r.maxOat, isaDev: r.isaDev };
    },
    maxOat: lookup.maxOat,
    REF_WEIGHT: 5400, REF_V1: 84,
  };
})();
