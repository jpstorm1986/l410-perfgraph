/* Fig. 5-18 — runway slope and wind correction for ASDA, wing flaps 18°.
   H75 supplement (Doc 04-005-FMS-01 Issue 5) page 31 of 60.

   REFERENCE ONLY — NOT APPROVED FOR FLIGHT USE.

   Two sequential panels. Panel 1 converts the physical ASDA to a slope-corrected value;
   panel 2 applies the reported wind component to that result, giving ASDAcor. Each panel
   is entered on its own "REFERENCE LINE" (slope 0 %, wind 0 kt), so a ratio of exactly
   1.0000 sits on the reference column by construction — the tables below are normalised
   to enforce that, which also removes the systematic read error.

   METHOD (tools/trace.js): machine-traced from the plate's embedded bitmap. Curve
   identity came from nearest-neighbour linking seeded at the reference line — safe here
   because carrier spacing is ~33 px, unlike Fig. 5-20 where the same technique had to be
   abandoned. Calibration is confirmed by the traced carriers landing on exact 200 m
   multiples: slope panel read errors were −1 to +9 m, wind panel −1 to −10 m.

   CARRIER COVERAGE. Carriers below 600 m are omitted — no runway in use is that short and
   the traced curves there were unreliable. The slope panel's 2 400 m curve and the wind
   panel's reads above 25 kt on the 1 800 m curve were discarded as track jumps (they
   broke monotonicity). Values outside the tabulated carrier range clamp to the nearest
   row; the caller should report that as extrapolated.

   PHYSICAL NOTE — the slope effect changes sign. Below about 1 100 m an uphill slope
   INCREASES ASDAcor; above it, uphill REDUCES ASDAcor. This is in the plate, not an
   artefact: on a short runway the aeroplane never reaches high speed, so braking
   dominates and uphill helps it stop; on a long runway the acceleration deficit dominates.
   Measured difference between +2 % and −2 %: +0.044 at 600 m, +0.006 at 1 000 m,
   −0.012 at 1 200 m, −0.133 at 2 000 m. */

(function () {
  var SLOPE_PCT = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2];
  var SLOPE_CARRIER = [600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200];
  var SLOPE = [
    [0.9805, 0.9853, 0.9951, 0.9951, 1.0000, 1.0049, 1.0147, 1.0196, 1.0245],
    [0.9909, 0.9909, 0.9909, 0.9945, 1.0000, 1.0019, 1.0055, 1.0101, 1.0201],
    [1.0058, 1.0029, 1.0000, 1.0000, 1.0000, 1.0029, 1.0058, 1.0088, 1.0117],
    [1.0196, 1.0122, 1.0073, 1.0049, 1.0000, 1.0000, 1.0000, 1.0049, 1.0073],
    [1.0334, 1.0209, 1.0125, 1.0042, 1.0000, 0.9958, 0.9937, 0.9937, 0.9937],
    [1.0485, 1.0375, 1.0229, 1.0120, 1.0000, 0.9936, 0.9899, 0.9863, 0.9827],
    [1.0668, 1.0505, 1.0293, 1.0147, 1.0000, 0.9902, 0.9788, 0.9755, 0.9707],
    [1.0909, 1.0667, 1.0388, 1.0213, 1.0000, 0.9868, 0.9735, 0.9645, 0.9575],
    [1.0962, 1.0720, 1.0478, 1.0236, 1.0000, 0.9804, 0.9640, 0.9518, 0.9414],
  ];

  var WIND_KT = [-10, -5, 0, 5, 10, 15, 20, 25, 30, 35, 40];
  var WIND_CARRIER = [600, 800, 1000, 1200, 1400, 1600, 1800];
  var WIND = [
    [0.6248, 0.8124, 1.0000, 1.0779, 1.1520, 1.2215, 1.2967, 1.3689, 1.4449, 1.5210, 1.5971],
    [0.6714, 0.8357, 1.0000, 1.0729, 1.1333, 1.1967, 1.2676, 1.3349, 1.4009, 1.4696, 1.5383],
    [0.6918, 0.8459, 1.0000, 1.0679, 1.1256, 1.1910, 1.2516, 1.3121, 1.3749, 1.4357, 1.4965],
    [0.7018, 0.8509, 1.0000, 1.0619, 1.1180, 1.1751, 1.2330, 1.2922, 1.3504, 1.4118, 1.4732],
    [0.7106, 0.8553, 1.0000, 1.0607, 1.1131, 1.1680, 1.2208, 1.2769, 1.3342, 1.3921, 1.4500],
    [0.7222, 0.8611, 1.0000, 1.0580, 1.1058, 1.1597, 1.2139, 1.2696, 1.3255, 1.3814, 1.4373],
    [0.7356, 0.8678, 1.0000, 1.0587, 1.1084, 1.1627, 1.2158, 1.2528, 1.2898, 1.3268, 1.3638],
  ];

  function interp(xs, ys, x) {
    var n = xs.length;
    if (n === 1) return ys[0];
    if (x <= xs[0]) return ys[0];
    if (x >= xs[n - 1]) return ys[n - 1];
    for (var i = 1; i < n; i++) {
      if (xs[i] >= x) return ys[i - 1] + (ys[i] - ys[i - 1]) * (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
    }
    return ys[n - 1];
  }

  /* One panel: ratio for an input distance at grid position g, interpolating between the
     bracketing carrier curves and clamping outside the charted carrier range. */
  function panel(carriers, grid, table, dist, g) {
    var ratios = table.map(function (row) { return interp(grid, row, g); });
    return interp(carriers, ratios, dist);
  }

  /* AFM rules from the supplement's procedure text (page 36), which the graph itself does
     not state:
       "Wind correction curves are determined for 50% for reported headwind, and 150% of
        reported tailwind."  -> the x axis is REPORTED wind component, so this factoring is
        already inside the curves; do NOT apply it again.
       "When a headwind exceeds value of 38.8 kts (20 m/s) enter the graph with value of
        38.8 kts."  -> a legitimate clamp, not an error.
       "Extrapolation of the tailwind or the runway slope curves is not authorized."
        -> beyond the charted tailwind or slope the answer must be REFUSED, not estimated. */
  var MAX_HEADWIND = 38.8;

  /* ASDA (m) + slope (%, uphill positive) + wind component (kt, headwind positive)
     -> { asdaCor, clamped, notAuthorized, reason }. */
  function asdaCorrected(asda, slopePct, windKt) {
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
      return { asdaCor: null, afterSlope: null, clamped: true, notAuthorized: true, reason: refuse.join('; ') };
    }
    if (asda < SLOPE_CARRIER[0] || asda > SLOPE_CARRIER[SLOPE_CARRIER.length - 1]) {
      notes.push('ASDA ' + Math.round(asda) + ' m outside the charted ' + SLOPE_CARRIER[0] + '–' + SLOPE_CARRIER[SLOPE_CARRIER.length - 1] + ' m carrier range of Fig. 5-18');
    }
    var afterSlope = asda * panel(SLOPE_CARRIER, SLOPE_PCT, SLOPE, asda, Math.max(-2, Math.min(2, slopePct)));
    if (afterSlope > WIND_CARRIER[WIND_CARRIER.length - 1] || afterSlope < WIND_CARRIER[0]) {
      notes.push('slope-corrected ' + Math.round(afterSlope) + ' m outside the wind panel\'s ' + WIND_CARRIER[0] + '–' + WIND_CARRIER[WIND_CARRIER.length - 1] + ' m carriers');
    }
    var cor = afterSlope * panel(WIND_CARRIER, WIND_KT, WIND, afterSlope, Math.max(-10, Math.min(40, windKt)));
    return { asdaCor: cor, afterSlope: afterSlope, clamped: notes.length > 0, notAuthorized: false, reason: notes.join('; ') };
  }

  window.PG_FIG518 = {
    SLOPE_PCT: SLOPE_PCT, SLOPE_CARRIER: SLOPE_CARRIER, SLOPE: SLOPE,
    WIND_KT: WIND_KT, WIND_CARRIER: WIND_CARRIER, WIND: WIND,
    MAX_HEADWIND: MAX_HEADWIND, asdaCorrected: asdaCorrected,
  };
})();
