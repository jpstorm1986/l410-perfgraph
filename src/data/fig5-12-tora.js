/* Fig. 5-12 — runway slope and wind correction for TORA, wing flaps 18°.
   H75 supplement (Doc 04-005-FMS-01 Issue 5) page 25 of 60.

   REFERENCE ONLY — NOT APPROVED FOR FLIGHT USE.

   Converts declared TORA into TORAcor: enter the declared distance, apply runway slope,
   then the reported wind component. Structurally the twin of Fig. 5-18 (which does the
   same for ASDA), but NUMERICALLY DIFFERENT — see the sign note below.

   PROVENANCE — hand-plotted by the operating pilot. Machine tracing was not attempted on
   this plate: its grid is finer than Fig. 5-18's (13 curves against 12) and its scale
   could not be pinned from the frame alone, and Fig. 5-14's neighbouring weight panel had
   already defeated tracing three ways.

   SCALE, established from the plate rather than assumed: all 13 curves were read at the
   0 % reference line and returned 400, 600, 800 … 2 800 m — exact 200 m spacing with no
   rounding needed, so the left scale is 0–2 800 m and every carrier is identified. A
   later read of +35 kt on the 2 200 m curve returned exactly 2 800 m, confirming the top.

   Three curves were then read in full: 600 m, 1 400 m and 2 200 m (curves 2, 6 and 10).
   Each self-checks against its own carrier — interpolating 0 % from the ∓1 % reads gives
   605, 1 402 and 2 220 m against nominal 600, 1 400 and 2 200.

   THE SIGN IS OPPOSITE TO FIG. 5-18, and this matters. Uphill REDUCES TORAcor at every
   carrier here (0.950 at +2 % for the 600 m curve, 0.865 at 2 200 m). On Fig. 5-18 uphill
   INCREASES ASDAcor below about 1 100 m and reduces it above. Both are physically right:
   uphill costs acceleration, which is all the take-off run is, but it also helps braking,
   which is half of accelerate-stop. Fig. 5-18's correction is therefore NOT a valid
   substitute for this one — the app used it as a stand-in until this plate was read, and
   on a short uphill runway that substitution had the wrong sign.

   Two structural properties of the plate, used to fill the family from three curves:

     slope effect scales linearly with the carrier — the −2 %/+2 % span measures 0.099,
     0.207 and 0.317 at 600, 1 400 and 2 200 m, i.e. +0.108 and +0.111 per 800 m. Slope
     acts over the whole run, so a longer distance accumulates more of it.

     slope is ASYMMETRIC, and increasingly so: at 600 m it is ±0.050, but at 2 200 m
     downhill gains 0.182 while uphill loses only 0.135. A symmetric model over-predicted
     the uphill cells by 50–90 m, which is why the read values are kept rather than fitted.

     wind is very nearly carrier-independent — the three curves agree to within 0.031 at
     every wind point and 0.015–0.021 across most of the range.

   AFM rules from the procedure text (page 36), same as Fig. 5-18:
     the wind curves already embed 50 % of reported headwind and 150 % of reported
     tailwind, so that factoring must NOT be applied again;
     a headwind above 38.8 kt (20 m/s) is entered at 38.8 kt;
     extrapolating the tailwind or slope curves is NOT AUTHORIZED — beyond them this
     module refuses rather than estimating. */

(function () {
  var SLOPE_PCT = [-2, -1, 0, 1, 2];
  var SLOPE_CARRIER = [600, 1400, 2200];
  var SLOPE = [
    [1.0496, 1.0248, 1.0000, 0.9752, 0.9504],
    [1.1123, 1.0517, 1.0000, 0.9483, 0.9055],
    [1.1824, 1.0766, 1.0000, 0.9234, 0.8649],
  ];

  var WIND_KT = [-10, 0, 10, 20, 30, 40];
  var WIND_CARRIER = [600, 1400, 2200];
  /* The 1 400 m curve's +40 kt cell was not read (it runs off the plate's 2 800 m top at
     that carrier); it is interpolated across the carrier dimension, where wind is nearly
     flat. The 2 200 m +40 cell is likewise off-scale and carries the +30→+35 gradient. */
  var WIND = [
    [0.7603, 1.0000, 1.0661, 1.1612, 1.2438, 1.3306],
    [0.7843, 1.0000, 1.0838, 1.1551, 1.2371, 1.3151],
    [0.7860, 1.0000, 1.0676, 1.1464, 1.2230, 1.2995],
  ];

  var MAX_HEADWIND = 38.8;

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

  /* Ratio for an entry distance at grid position g, interpolating between the bracketing
     carrier curves. Extrapolates across the carrier dimension to reach 400 and 2 800 m,
     which the linear span law above supports. */
  function panel(carriers, grid, table, dist, g) {
    var ratios = table.map(function (row) { return interp(grid, row, g); });
    return interp(carriers, ratios, dist);
  }

  /* TORA (m) + slope (%, uphill positive) + wind component (kt, headwind positive)
     -> { toraCor, afterSlope, clamped, notAuthorized, reason }. */
  function toraCorrected(tora, slopePct, windKt) {
    var notes = [], refuse = [];

    if (slopePct < -2 || slopePct > 2) {
      refuse.push('RWY slope ' + slopePct + ' % is outside the charted ±2 % and the AFM does not authorize extrapolating the slope curves');
    }
    if (windKt < -10) {
      refuse.push('tailwind ' + Math.abs(windKt) + ' kt exceeds the charted 10 kt and the AFM does not authorize extrapolating the tailwind curves');
    }
    if (windKt > MAX_HEADWIND) {
      notes.push('headwind ' + windKt.toFixed(0) + ' kt entered at the AFM limit of 38.8 kt');
      windKt = MAX_HEADWIND;
    }
    if (refuse.length) {
      return { toraCor: null, afterSlope: null, clamped: true, notAuthorized: true, reason: refuse.join('; ') };
    }
    if (tora < SLOPE_CARRIER[0] || tora > SLOPE_CARRIER[SLOPE_CARRIER.length - 1]) {
      notes.push('TORA ' + Math.round(tora) + ' m outside the read ' + SLOPE_CARRIER[0] + '–' + SLOPE_CARRIER[SLOPE_CARRIER.length - 1] + ' m curves of Fig. 5-12');
    }

    var afterSlope = tora * panel(SLOPE_CARRIER, SLOPE_PCT, SLOPE, tora, slopePct);
    var cor = afterSlope * panel(WIND_CARRIER, WIND_KT, WIND, afterSlope, windKt);
    return { toraCor: cor, afterSlope: afterSlope, clamped: notes.length > 0, notAuthorized: false, reason: notes.join('; ') };
  }

  window.PG_FIG512 = {
    SLOPE_PCT: SLOPE_PCT, SLOPE_CARRIER: SLOPE_CARRIER, SLOPE: SLOPE,
    WIND_KT: WIND_KT, WIND_CARRIER: WIND_CARRIER, WIND: WIND,
    MAX_HEADWIND: MAX_HEADWIND, toraCorrected: toraCorrected,
    ALL_CARRIERS: [400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800],
  };
})();
