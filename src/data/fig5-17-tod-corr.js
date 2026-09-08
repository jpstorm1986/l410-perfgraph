/* Fig. 5-17 — take-off weight and V1 corrections for take-off distance (TOD),
   wing flaps 18°. H75 supplement (Doc 04-005-FMS-01 Issue 5) page 30 of 60.

   REFERENCE ONLY — NOT APPROVED FOR FLIGHT USE.

   Two panels sharing one 0–2 400 m distance scale:
     weight panel — enter TOD Required (from the Fig. 5-16 carpet, valid at 5 400 kg and
       V1 84), follow its carrier to the actual weight. Reference line printed at 54 on
       the TAKE-OFF WEIGHT [100 kg] axis.
     V1 panel — enter that value at the V1 84 reference line, follow the carrier to the
       actual V1. Compare with TODAcor; the weight where they are equal is the TOD-limited
       weight at that V1.

   WEIGHT PANEL — hand-plotted by the operating pilot, all 8 printed curves at 10 weights
   (4 800…6 600 kg in 200 kg steps), 62 reads plus 18 "off the top". Machine tracing of
   this panel was attempted and rejected at ~8 % error; see data/carpet-notes.md.

   Self-validation of those reads: the eight curves cross the reference line at 405, 605,
   800, 1005, 1200, 1415, 1605 and 1820 m against a nominal 400…1800 in 200 m steps — max
   error 20 m, which independently confirms both the reference-line position and the curve
   identities. Every curve is monotone increasing in weight, and every weight column is
   monotone increasing across curves.

   AGAINST THE EXAMPLE — measured, and the cause located in the PLATE.

   The plate carries its worked example in dotted construction lines. Those were decoded
   from the PDF's vector objects and then INDEPENDENTLY RE-READ off the plate by the
   operating pilot. The two agree closely — entry 742 vs 750 m, corners 910 m/5 773 kg vs
   915 m/5 770 kg, and 608 m/4 813 kg vs 615 m/4 810 kg — so both readings are sound and
   the entry line is where both put it.

   Fitting those three points to the curve family above shows the example is internally
   inconsistent. Its two CORNERS lie on the same curve to within 12 m (carriers 793 and
   781 m, across a 960 kg span — strong mutual corroboration), but its ENTRY HORIZONTAL is
   drawn at 750 m, about 5 % below the curve its own corners sit on. The example's three
   lines therefore do not lie on one member of the printed family.

   An earlier note in this file blamed "identifying which dotted horizontal is the entry
   value". That hypothesis was tested by re-reading the plate and is WRONG; it is withdrawn.
   The entry line is at 745–750 m and the inconsistency is the plate's own.

   The printed curve family is the authority: it is what a pilot reads, and it
   self-validates — the eight curves cross the reference line at 405, 605, 800, 1005, 1200,
   1415, 1605 and 1820 m against a nominal 400…1800, max error 20 m.

   ACCURACY, stated plainly and without flattering the data. Solving for the weight the
   example's own TODAcor allows gives 5 881 kg from a 750 m entry against the supplement's
   published 5 800 kg — this panel is about 1.4 % (≈80 kg) LESS conservative than the
   AFM's published TOD answer. Running the same test on Fig. 5-14 gives 5 983 kg against a
   published 6 200 kg, i.e. 3.5 % MORE conservative. So the two hand-plotted panels bracket
   their own published tables with no consistent bias, which is what you would expect when
   each plate's example is drawn to a few percent.

   Treat WEIGHT accuracy as a few percent against the book — roughly −4 % to +2 % — not the
   ±1 % that applies to the distance reads. That is the honest figure for dispatch
   decisions and it is why RTOW from this app is indicative.

   V1 PANEL — machine-traced, validated at +2.3 % against the example (608 m at V1 73 gives
   931 m against the plate's 910 m). Carriers 1600 m and 1800 m were traced but DISCARDED:
   their ratios dipped below 1.0 at V1 82–83, which is physically impossible — a lower V1
   cannot shorten the go case — so those curves had jumped tracks.

   The V1 ratios here are ABOVE 1 and large, the opposite of Fig. 5-20's, and that is the
   whole reason V1 is solvable: reducing V1 lengthens the go case (an engine failure leaves
   the aeroplane slower and further from rotation) while shortening the stop case. TOD and
   ASD move in opposite directions with V1; the balanced field point is where they cross. */

(function () {
  var WEIGHT_KG = [4800, 5000, 5200, 5400, 5600, 5800, 6000, 6200, 6400, 6600];
  var WEIGHT_CARRIER = [405, 605, 800, 1005, 1200, 1415, 1605, 1820];
  /* ratio to the 5 400 kg reference; null = curve is off the top of the plot */
  var WEIGHT = [
    [0.8272, 0.8889, 0.9259, 1.0000, 1.0494, 1.1358, 1.1975, 1.2840, 1.4198, 1.5556],
    [0.8099, 0.8595, 0.9008, 1.0000, 1.0744, 1.1653, 1.2645, 1.3884, 1.5537, 1.7686],
    [0.7813, 0.8562, 0.9063, 1.0000, 1.0688, 1.1687, 1.2937, 1.4500, 1.6250, 1.8938],
    [0.7761, 0.8458, 0.9055, 1.0000, 1.0896, 1.2090, 1.3433, 1.5672, 1.8458, null],
    [0.7667, 0.8417, 0.9000, 1.0000, 1.1042, 1.2458, 1.4083, null, null, null],
    [0.7420, 0.8163, 0.8763, 1.0000, 1.1166, 1.3145, null, null, null, null],
    [0.7103, 0.7944, 0.8660, 1.0000, 1.1682, null, null, null, null, null],
    [0.6813, 0.7692, 0.8434, 1.0000, null, null, null, null, null, null],
  ];

  var V1_KIAS = [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84];
  var V1_CARRIER = [200, 400, 800, 1000, 1200];
  /* Bi-isotonic smoothed, same treatment as Fig. 5-20: alternating isotonic passes
     along V1 (decreasing — a lower V1 lengthens the go case) and along the carrier
     dimension (increasing). The raw trace crossed itself at V1 82, where the 1000 m
     carrier read below the 800 m one. Largest change 0.0002. */
  var V1 = [
    [1.4641, 1.4384, 1.3938, 1.3614, 1.3108, 1.2642, 1.2156, 1.1669, 1.1021, 1.0697, 1.0373, 1.0000],
    [1.5242, 1.4933, 1.4567, 1.4122, 1.3608, 1.3133, 1.2579, 1.2104, 1.1580, 1.1056, 1.0522, 1.0000],
    [1.5378, 1.5107, 1.4691, 1.4275, 1.3819, 1.3364, 1.2830, 1.2258, 1.1763, 1.1185, 1.0574, 1.0000],
    [1.5579, 1.5153, 1.4759, 1.4348, 1.3872, 1.3418, 1.2879, 1.2348, 1.1828, 1.1185, 1.0601, 1.0000],
    [1.5637, 1.5275, 1.4874, 1.4427, 1.3954, 1.3469, 1.2973, 1.2418, 1.1890, 1.1258, 1.0625, 1.0000],
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

  /* TOD required (m) at a weight and V1, from the carpet's TOD Required value.
     The panels are SEQUENTIAL: the V1 panel is entered with the value carried out of the
     weight panel, not with the original carpet value. */
  function todAt(todReq, weightKg, v1) {
    var ratios = [];
    for (var i = 0; i < WEIGHT.length; i++) ratios.push(rowRatio(i, weightKg));
    var afterWeight = todReq * interp(WEIGHT_CARRIER, ratios, todReq);
    return afterWeight * interp(V1_CARRIER, V1.map(function (r) { return interp(V1_KIAS, r, v1); }), afterWeight);
  }

  /* Heaviest weight whose TOD equals TODAcor at this V1. Monotone in weight. */
  function todLimitedWeight(todReq, todaCor, v1, loKg, hiKg) {
    var lo = loKg == null ? 4000 : loKg, hi = hiKg == null ? 7000 : hiKg;
    if (todAt(todReq, lo, v1) > todaCor) return null;
    if (todAt(todReq, hi, v1) < todaCor) return hi;
    for (var i = 0; i < 60; i++) {
      var mid = (lo + hi) / 2;
      if (todAt(todReq, mid, v1) < todaCor) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  window.PG_FIG517 = {
    WEIGHT_KG: WEIGHT_KG, WEIGHT_CARRIER: WEIGHT_CARRIER, WEIGHT: WEIGHT,
    V1_KIAS: V1_KIAS, V1_CARRIER: V1_CARRIER, V1: V1,
    todAt: todAt, todLimitedWeight: todLimitedWeight,
    v1Factor: function (d, v) { return interp(V1_CARRIER, V1.map(function (r) { return interp(V1_KIAS, r, v); }), d); },
    weightPanelAvailable: true,
    REF_WEIGHT: 5400, REF_V1: 84,
  };
})();
