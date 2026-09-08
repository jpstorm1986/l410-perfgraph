/* Fig. 5-20 — take-off weight and V1 corrections for accelerate-stop distance (ASD),
   wing flaps 18°. H75 supplement (Doc 04-005-FMS-01 Issue 5) page 33 of 60.

   REFERENCE ONLY — NOT APPROVED FOR FLIGHT USE.

   The plate is two panels sharing one 0–2 400 m distance scale (confirmed: both panels'
   horizontal gridlines coincide to within 1.5 px).

     weight panel — enter ASD Required (from the Fig. 5-19 carpet, valid at 5 400 kg and
       V1 84) on the left scale, follow its carrier to the actual weight, read ASD there.
       Its "REFERENCE LINE" is printed at 54 on the TAKE-OFF WEIGHT [100 kg] axis.
     V1 panel — enter that value at the V1 84 reference line, follow the carrier to the
       actual V1. The result is compared with ASDAcor; the weight at which they are equal
       is the ASD-limited weight for that V1.

   So ASD(w, V1) = ASDreq x Rw(w) x Rv(V1), and the ASD locus in the (V1, weight) plane is
   the set where that equals ASDAcor. Ratios are normalised to exactly 1.0000 on each
   panel's reference column, which is what the chart means and which also removes the
   systematic read error.

   VALIDATED against the supplement's own worked example, whose construction lines are
   vector objects in the PDF and were decoded rather than eyeballed. The example carries
   ASD Required 1202 m and marks three weight/V1 pairs, matching its published results
   table (V1 76 / 4 800 kg, V1 73 / 5 800 kg, V1 73 / 6 600 kg):

     weight panel   4 788 kg -> 1142 m (plate 1129, +1.2 %)
                    5 812 kg -> 1271 m (plate 1256, +1.2 %)
                    6 600 kg -> 1352 m (plate 1376, −1.7 %)
     V1 panel       1129 m at V1 75.8 ->  914 m (plate  904, +1.1 %)
                    1256 m at V1 73.3 ->  961 m (plate  970, −0.9 %)
                    1376 m at V1 73.3 -> 1052 m (plate 1036, +1.5 %)

   METHOD, and a trap worth recording. The two panels needed DIFFERENT tracing methods.
   The weight panel has 8 carrier curves and yields to the strict "keep only columns with
   exactly 8 dark runs" filter. The V1 panel does NOT — it carries about 15 curves, and
   applying the 8-run filter there silently selected a biased subset of columns and
   produced ratios 3–6 % too shallow, which only surfaced when checked against the example.
   The V1 panel is instead traced by nearest-neighbour linking seeded at its reference
   line, with the example's own dotted construction levels masked out of the run detection.
   Carrier coverage is therefore incomplete (weight 600–2000 m less 1200; V1 600–1800 m
   less 1200 and 1400); ratios interpolate across the carrier dimension, which is smooth.

   INVERSE SOLVE — accuracy and a conditioning warning. Solving for the ASD-limited weight
   reproduces the example's two heavy points to −0.4 % and +0.4 % (5 812 kg and 6 600 kg),
   but its light point (4 788 kg at V1 75.8) comes out 9.6 % low. This is mostly not table
   error: forward accuracy at that same point is +1.2 %. It is that dASD/dweight is very
   shallow at the light end of the weight panel, so a 1 % distance error maps to a large
   weight error. The inverse solve is therefore well conditioned near MTOW — which is where
   a regulated take-off weight actually matters — and ill conditioned below about 5 000 kg.
   Callers should treat solutions under ~5 000 kg as indicative and say so.

   LESSON: never assume a panel's curve count from its neighbour. Verify against the
   worked example before trusting either. */

(function () {
  var WEIGHT_KG = [4800, 5000, 5200, 5400, 5600, 5800, 6000, 6200, 6400, 6600];
  var WEIGHT_CARRIER = [600, 800, 1000, 1200, 1400, 1600, 1800, 2000];
  var WEIGHT = [
    [0.9900, 0.9900, 0.9970, 1.0000, 1.0010, 1.0160, 1.0160, 1.0260, 1.0260, 1.0260],
    [0.9640, 0.9710, 0.9870, 1.0000, 1.0100, 1.0290, 1.0370, 1.0520, 1.0630, 1.0720],
    [0.9510, 0.9670, 0.9830, 1.0000, 1.0180, 1.0430, 1.0550, 1.0740, 1.0890, 1.1020],
    [0.9510, 0.9600, 0.9790, 1.0000, 1.0240, 1.0570, 1.0650, 1.0850, 1.1080, 1.1250],
    [0.9360, 0.9550, 0.9760, 1.0000, 1.0240, 1.0560, 1.0700, 1.0920, 1.1180, 1.1410],
    [0.9310, 0.9530, 0.9770, 1.0000, 1.0270, 1.0630, 1.0770, 1.1030, 1.1300, 1.1510],
    [0.9270, 0.9480, 0.9750, 1.0000, 1.0230, 1.0600, 1.0760, 1.1020, 1.1300, 1.1590],
    [0.9220, 0.9450, 0.9720, 1.0000, 1.0260, 1.0660, 1.0820, 1.1090, 1.1400, 1.1660],
  ];

  var V1_KIAS = [73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84];
  var V1_CARRIER = [800, 1000, 1600, 1800];
  /* The 600 m carrier was traced but DISCARDED. Across the carrier dimension the others
     rise smoothly at V1 73 (0.735, 0.752, 0.756, 0.759) while 600 m read 0.798 — out of
     line, and interpolating between it and 800 m made asdAt() dip and recover by ~6 %,
     far outside this plate's ±1.7 % validated accuracy. Rows below 800 m now extrapolate
     off the 800/1000 gradient, which is monotone and conservative. */
  /* Bi-isotonic smoothed: alternating isotonic passes along V1 (per row) and along the
     carrier dimension (per column) until both are monotone. Both are physically required
     — a lower V1 cannot shorten the stop case, and a longer entry distance cannot need a
     smaller correction — and the raw trace violated the carrier direction at V1 74, 78,
     81 and 83, which made asdAt() dip and recover as the entry value crossed a carrier.
     Largest change from the raw trace is 0.0164, inside this plate's ±1.7 % validated
     accuracy, and the worked-example validation is unchanged at ±1.5 %. */
  var V1 = [
    [0.7352, 0.7723, 0.7909, 0.8067, 0.8314, 0.8509, 0.8810, 0.9057, 0.9309, 0.9552, 0.9726, 1.0000],
    [0.7518, 0.7856, 0.7980, 0.8109, 0.8347, 0.8509, 0.8841, 0.9099, 0.9353, 0.9582, 0.9808, 1.0000],
    [0.7561, 0.7856, 0.7992, 0.8205, 0.8443, 0.8686, 0.8927, 0.9167, 0.9403, 0.9609, 0.9855, 1.0000],
    [0.7591, 0.7856, 0.8020, 0.8247, 0.8466, 0.8686, 0.8933, 0.9181, 0.9403, 0.9609, 0.9855, 1.0000],
  ];

  function interp(xs, ys, x) {
    var n = xs.length;
    if (x <= xs[0]) return ys[0] + (ys[1] - ys[0]) * (x - xs[0]) / (xs[1] - xs[0]);
    if (x >= xs[n - 1]) return ys[n - 1] + (ys[n - 1] - ys[n - 2]) * (x - xs[n - 1]) / (xs[n - 1] - xs[n - 2]);
    for (var i = 1; i < n; i++) {
      if (xs[i] >= x) return ys[i - 1] + (ys[i] - ys[i - 1]) * (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
    }
    return ys[n - 1];
  }
  function ratio(carriers, grid, table, carrier, g) {
    return interp(carriers, table.map(function (r) { return interp(grid, r, g); }), carrier);
  }

  /* ASD required (m) at a given weight and V1, from the carpet's ASD Required value.
     The panels are SEQUENTIAL: the V1 panel is entered with the value carried out of the
     weight panel, so its carrier is the post-weight distance — not the original carpet
     value. Using asdReq for both carriers reproduced the example's heavy points but threw
     the light end out by 10 %. */
  function asdAt(asdReq, weightKg, v1) {
    var afterWeight = asdReq * ratio(WEIGHT_CARRIER, WEIGHT_KG, WEIGHT, asdReq, weightKg);
    return afterWeight * ratio(V1_CARRIER, V1_KIAS, V1, afterWeight, v1);
  }

  /* The ASD locus: heaviest weight whose ASD equals ASDAcor at this V1.
     Bisection — the relation is monotone in weight. Returns null if no solution in range. */
  function asdLimitedWeight(asdReq, asdaCor, v1, loKg, hiKg) {
    var lo = loKg == null ? 4000 : loKg;
    var hi = hiKg == null ? 7000 : hiKg;
    if (asdAt(asdReq, lo, v1) > asdaCor) return null;   /* too short even empty */
    if (asdAt(asdReq, hi, v1) < asdaCor) return hi;     /* not ASD-limited in range */
    for (var i = 0; i < 60; i++) {
      var mid = (lo + hi) / 2;
      if (asdAt(asdReq, mid, v1) < asdaCor) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  window.PG_FIG520 = {
    WEIGHT_KG: WEIGHT_KG, WEIGHT_CARRIER: WEIGHT_CARRIER, WEIGHT: WEIGHT,
    V1_KIAS: V1_KIAS, V1_CARRIER: V1_CARRIER, V1: V1,
    asdAt: asdAt, asdLimitedWeight: asdLimitedWeight, REF_WEIGHT: 5400, REF_V1: 84,
  };
})();
