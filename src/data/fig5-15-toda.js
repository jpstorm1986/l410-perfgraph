/* Fig. 5-15 — runway slope and wind correction for TODA, wing flaps 18°.
   H75 supplement (Doc 04-005-FMS-01 Issue 5) page 28 of 60.

   REFERENCE ONLY — NOT APPROVED FOR FLIGHT USE.

   Converts declared TODA into TODAcor: slope first, then the reported wind component.
   The twin of Fig. 5-12 (TORA) and Fig. 5-18 (ASDA) in structure, and numerically its own
   plate — see the sign note.

   SLOPE PANEL — COMPLETE. Hand-plotted by the operating pilot: all THIRTEEN curves at
   −2, −1, 0, +1 and +2 %, 63 reads with two off-scale corners. Nothing is interpolated
   across the carrier dimension, unlike Fig. 5-12 where three curves were read and the
   family filled from them.

   Self-check, and it is exact: every curve's 0 % value equals its nominal carrier —
   400, 600, 800 … 2 800 m, thirteen for thirteen, no rounding. That simultaneously
   confirms the 0–2 800 m scale, the reference-line position and the curve identities.

   THE SIGN MATCHES FIG. 5-12, NOT FIG. 5-18. Uphill REDUCES TODAcor at every carrier
   (0.975 at +2 % on the 400 m curve, 0.900 at 2 800 m). Fig. 5-18 instead INCREASES
   ASDAcor below about 1 100 m, because uphill helps braking. Take-off distance is an
   acceleration case like take-off run, so it follows TORA. The app used Fig. 5-18 as a
   stand-in for this plate until it was read, and on a short uphill runway that
   substitution carried the WRONG SIGN — the error this plate removes.

   Magnitude is its own, too: the −2 %/+2 % span is 0.067, 0.136 and 0.216 at 600, 1 400
   and 2 200 m against Fig. 5-12's 0.099, 0.207 and 0.317 — a steady 66–68 % of the TORA
   effect at every carrier. That ratio is what you would expect, since TOD carries the
   airborne segment to 35 ft which slope barely touches, so the ground-run effect is
   diluted. Three independently read plates agreeing on a constant ratio is the strongest
   cross-check available here.

   WIND PANEL — READ. Three curves (600, 1 400 and 2 200 m), the same carriers read on
   Fig. 5-12 so the two plates compare directly. Each returns its own carrier exactly at
   0 kt, which is the self-check.

   That comparison retires the last substitution in the chain and confirms the reasoning
   used while it stood: Fig. 5-15's wind ratios differ from Fig. 5-12's by at most 0.031,
   and by under 0.01 at most points. Wind really does behave almost identically on all
   three plates — unlike slope, which reverses sign between them. So borrowing Fig. 5-18's
   wind stage was a defensible stopgap where borrowing its slope stage was not.

   The 2 200 m curve runs off the plate's 2 800 m top beyond +34 kt, where it reads exactly
   2 800; its +40 kt ratio carries the measured +30 → +34 gradient outward.

   AFM rules from the procedure text (page 36), as for the other two plates:
     the wind curves already embed 50 % of reported headwind and 150 % of reported
     tailwind, so that factoring must NOT be applied twice;
     a headwind above 38.8 kt (20 m/s) is entered at 38.8 kt;
     extrapolating the tailwind or slope curves is NOT AUTHORIZED. */

(function () {
  var SLOPE_PCT = [-2, -1, 0, 1, 2];
  var SLOPE_CARRIER = [400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800];
  /* ratio to the 0 % reference; null = off the plate's 2 800 m top at that carrier */
  var SLOPE = [
    [1.0250, 1.0125, 1.0000, 0.9875, 0.9750],
    [1.0333, 1.0167, 1.0000, 0.9833, 0.9667],
    [1.0313, 1.0125, 1.0000, 0.9750, 0.9563],
    [1.0500, 1.0250, 1.0000, 0.9750, 0.9550],
    [1.0625, 1.0333, 1.0000, 0.9750, 0.9458],
    [1.0786, 1.0393, 1.0000, 0.9714, 0.9429],
    [1.0844, 1.0375, 1.0000, 0.9656, 0.9250],
    [1.1000, 1.0417, 1.0000, 0.9611, 0.9222],
    [1.1125, 1.0550, 1.0000, 0.9600, 0.9200],
    [1.1295, 1.0591, 1.0000, 0.9545, 0.9136],
    [1.1438, 1.0625, 1.0000, 0.9458, 0.9063],
    [null, 1.0769, 1.0000, 0.9423, 0.8981],
    [null, null, 1.0000, 0.9411, 0.9000],
  ];

  var WIND_KT = [-10, 0, 10, 20, 30, 40];
  var WIND_CARRIER = [600, 1400, 2200];
  var WIND = [
    [0.7583, 1.0000, 1.0667, 1.1417, 1.2417, 1.3000],
    [0.7857, 1.0000, 1.0750, 1.1571, 1.2393, 1.3250],
    [0.7795, 1.0000, 1.0773, 1.1614, 1.2432, 1.3170],
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

  /* Wind ratio for an entry distance — the panel is entered with the SLOPE-CORRECTED
     value, not the declared TODA, which is why todaCorrected passes afterSlope here. */
  function windRatio(dist, windKt) {
    return interp(WIND_CARRIER, WIND.map(function (r) { return interp(WIND_KT, r, windKt); }), dist);
  }

  /* Slope ratio for an entry distance, over only the grid points that carrier reaches. */
  function slopeRatio(dist, slopePct) {
    var ratios = SLOPE.map(function (row) {
      var xs = [], ys = [];
      for (var i = 0; i < row.length; i++) if (row[i] != null) { xs.push(SLOPE_PCT[i]); ys.push(row[i]); }
      return interp(xs, ys, slopePct);
    });
    return interp(SLOPE_CARRIER, ratios, dist);
  }

  /* TODA (m) + slope (%, uphill positive) + wind component (kt, headwind positive)
     -> { todaCor, afterSlope, clamped, notAuthorized, reason }. Both stages are this
     plate's own now; nothing is borrowed from Fig. 5-18. */
  function todaCorrected(toda, slopePct, windKt) {
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
      return { todaCor: null, afterSlope: null, clamped: true, notAuthorized: true, reason: refuse.join('; ') };
    }
    if (toda < SLOPE_CARRIER[0] || toda > SLOPE_CARRIER[SLOPE_CARRIER.length - 1]) {
      notes.push('TODA ' + Math.round(toda) + ' m outside the charted ' + SLOPE_CARRIER[0] + '–' + SLOPE_CARRIER[SLOPE_CARRIER.length - 1] + ' m curves of Fig. 5-15');
    }

    var afterSlope = toda * slopeRatio(toda, slopePct);
    var cor = afterSlope * windRatio(afterSlope, windKt);
    return {
      todaCor: cor, afterSlope: afterSlope, windSubbed: false,
      clamped: notes.length > 0, notAuthorized: false, reason: notes.join('; '),
    };
  }

  window.PG_FIG515 = {
    SLOPE_PCT: SLOPE_PCT, SLOPE_CARRIER: SLOPE_CARRIER, SLOPE: SLOPE,
    WIND_KT: WIND_KT, WIND_CARRIER: WIND_CARRIER, WIND: WIND,
    MAX_HEADWIND: MAX_HEADWIND,
    slopeRatio: slopeRatio, windRatio: windRatio, todaCorrected: todaCorrected,
    slopePanelAvailable: true,
    windPanelAvailable: true,
  };
})();
