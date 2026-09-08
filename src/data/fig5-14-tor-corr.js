/* Fig. 5-14 — take-off weight and V1 corrections for take-off run (TOR),
   wing flaps 18°. H75 supplement (Doc 04-005-FMS-01 Issue 5) page 27 of 60.

   REFERENCE ONLY — NOT APPROVED FOR FLIGHT USE.

   Two panels sharing one 0–2 400 m distance scale, same layout as Figs. 5-17 and 5-20.
     weight panel — enter TOR Required (from the Fig. 5-13 carpet, valid at 5 400 kg and
       V1 84), follow its carrier to the actual weight.
     V1 panel — enter that value at the V1 84 reference line, follow to the actual V1.
       Compare with TORAcor; the weight where they are equal is the TOR-limited weight.

   WEIGHT PANEL — hand-plotted by the operating pilot: all 7 printed curves at 10 weights
   (4 800…6 600 kg in 200 kg steps), 64 reads plus 6 "off the top". Machine tracing was
   attempted and rejected; see data/carpet-notes.md.

   Self-validation: the seven curves cross the reference line at 195, 390, 595, 790, 990,
   1190 and 1385 m against a nominal 200…1400 in 200 m steps — every one 5–15 m low, a
   consistent small offset rather than scatter, which confirms both the reference-line
   position and the curve identities. Monotone increasing in weight along every curve and
   across curves at every weight.

   VALIDATED against the plate's own worked example, and this is the strongest check in
   the dataset because it is a THREE-WAY agreement. The example marks two points,
   (6 210 kg, 772 m) and (4 917 kg, 517 m). Fitted to these curves both land on carrier
   594 m and 602 m — 8 m apart, so they are demonstrably one curve — and that curve
   reproduces the plate's marked points to +0.5 % and −1.3 %.

   A NOTE ON THE 625 m ENTRY LINE, which resolves a caveat carried on Fig. 5-17 too.
   My decode of the example's vector construction lines put its entry value at 625 m,
   which disagrees with the above by 4.5 %. But the independent machine trace of this
   panel gave 839 m at 6 210 kg and the hand plot gives 827 m — they agree with each other
   to 1.5 % and BOTH exceed the decode. Fig. 5-17 showed the identical pattern: its two
   corners landed consistently on carriers 770/788 m against a decoded 742 m entry.
   Two independent reads agreeing on two separate plates, against a decode that differs in
   opposite directions on each (high here, low there), means the suspect element is which
   dotted horizontal was identified as the entry line — several are drawn at similar
   heights — and NOT the plotted curve families. The hand plots are therefore treated as
   authoritative on both plates, and Fig. 5-17's "~5 % optimistic residual" is reattributed
   to the decode rather than to the data.

   V1 PANEL — machine-traced and validated at −1.0 % against the example's diagonal
   (TORAcor 772 m at V1 73.3 to 517 m at the V1 84 reference: implied ratio 1.4932, this
   table returns 1.4784). Bi-isotonic smoothed, decreasing in V1 and increasing in
   carrier. Carriers 200/800/1000/1200 m. */

(function () {
  var WEIGHT_KG = [4800, 5000, 5200, 5400, 5600, 5800, 6000, 6200, 6400, 6600];
  var WEIGHT_CARRIER = [195, 390, 595, 790, 990, 1190, 1385];
  /* ratio to the 5 400 kg reference; null = curve is off the top of the plot */
  var WEIGHT = [
    [0.9231, 0.9231, 0.9744, 1.0000, 1.0256, 1.0769, 1.1026, 1.2308, 1.3333, 1.4615],
    [0.8590, 0.9103, 0.9615, 1.0000, 1.0769, 1.1538, 1.2179, 1.3333, 1.4231, 1.5256],
    [0.8235, 0.8824, 0.9328, 1.0000, 1.0840, 1.1597, 1.2353, 1.2941, 1.3950, 1.5462],
    [0.8354, 0.8924, 0.9494, 1.0000, 1.0823, 1.1772, 1.2785, 1.4177, 1.5886, 1.8987],
    [0.8182, 0.8737, 0.9343, 1.0000, 1.0909, 1.1919, 1.3283, 1.5202, null, null],
    [0.7899, 0.8487, 0.9202, 1.0000, 1.1261, 1.3361, null, null, null, null],
    [0.7545, 0.8195, 0.8989, 1.0000, 1.1625, null, null, null, null, null],
  ];

  var V1_KIAS = [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84];
  var V1_CARRIER = [200, 800, 1000, 1200];
  var V1 = [
    [1.3045, 1.2800, 1.2374, 1.1988, 1.1756, 1.1562, 1.1137, 1.0673, 1.0518, 1.0247, 1.0228, 1.0000],
    [1.6529, 1.6105, 1.5611, 1.5107, 1.4483, 1.3916, 1.3272, 1.2551, 1.1844, 1.1224, 1.0585, 1.0000],
    [1.6935, 1.6441, 1.5889, 1.5366, 1.4760, 1.4157, 1.3506, 1.2771, 1.2110, 1.1382, 1.0694, 1.0000],
    [1.6972, 1.6441, 1.5909, 1.5366, 1.4815, 1.4205, 1.3534, 1.2779, 1.2110, 1.1382, 1.0694, 1.0000],
  ];

  function interp(xs, ys, x) {
    var n = xs.length;
    if (n < 2) return ys[0];
    if (x <= xs[0]) return ys[0] + (ys[1] - ys[0]) * (x - xs[0]) / (xs[1] - xs[0]);
    if (x >= xs[n - 1]) return ys[n - 1] + (ys[n - 1] - ys[n - 2]) * (x - xs[n - 1]) / (xs[n - 1] - xs[n - 2]);
    for (var i = 1; i < n; i++) {
      if (xs[i] >= x) return ys[i - 1] + (ys[i] - ys[i - 1]) * (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
    }
    return ys[n - 1];
  }

  /* Ratio for one carrier row at a weight, over only the weights that row reaches. */
  function rowRatio(ri, weightKg) {
    var r = WEIGHT[ri], xs = [], ys = [];
    for (var i = 0; i < r.length; i++) if (r[i] != null) { xs.push(WEIGHT_KG[i]); ys.push(r[i]); }
    return interp(xs, ys, weightKg);
  }

  /* TOR required (m) at a weight and V1. The panels are SEQUENTIAL: the V1 panel is
     entered with the value carried out of the weight panel, not the original carpet
     value — the same trap that cost 10 % on Fig. 5-20 before it was caught. */
  function torAt(torReq, weightKg, v1) {
    var ratios = [];
    for (var i = 0; i < WEIGHT.length; i++) ratios.push(rowRatio(i, weightKg));
    var afterWeight = torReq * interp(WEIGHT_CARRIER, ratios, torReq);
    return afterWeight * interp(V1_CARRIER, V1.map(function (r) { return interp(V1_KIAS, r, v1); }), afterWeight);
  }

  /* Heaviest weight whose TOR equals TORAcor at this V1. Monotone in weight. */
  function torLimitedWeight(torReq, toraCor, v1, loKg, hiKg) {
    var lo = loKg == null ? 4000 : loKg, hi = hiKg == null ? 7000 : hiKg;
    if (torAt(torReq, lo, v1) > toraCor) return null;
    if (torAt(torReq, hi, v1) < toraCor) return hi;
    for (var i = 0; i < 60; i++) {
      var mid = (lo + hi) / 2;
      if (torAt(torReq, mid, v1) < toraCor) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  window.PG_FIG514 = {
    WEIGHT_KG: WEIGHT_KG, WEIGHT_CARRIER: WEIGHT_CARRIER, WEIGHT: WEIGHT,
    V1_KIAS: V1_KIAS, V1_CARRIER: V1_CARRIER, V1: V1,
    torAt: torAt, torLimitedWeight: torLimitedWeight,
    v1Factor: function (dist, v1) {
      return interp(V1_CARRIER, V1.map(function (r) { return interp(V1_KIAS, r, v1); }), dist);
    },
    weightPanelAvailable: true,
    REF_WEIGHT: 5400, REF_V1: 84,
  };
})();
