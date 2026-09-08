/* Shared interpolation for the H75 supplement carpet charts (Figs. 5-13, 5-16, 5-19).

   REFERENCE ONLY — NOT APPROVED FOR FLIGHT USE.

   DATA MODEL. Each plate is stored as a list of pressure-altitude ROWS, each holding its
   own list of [actual OAT °C, value] reads. Rows are deliberately NOT a rectangular grid:
   the plate's mesh is a fan, rows stop at different temperatures, and successive reading
   passes sampled different temperatures. A row is simply the samples that exist for that
   altitude, sorted by OAT, and its LAST point is that altitude's envelope edge.

   WHY MONOTONE CUBIC AND NOT LINEAR. The TOD carpet is strongly convex at the hot end —
   second differences reach 160 m across a 10 °C step at 10 000 ft, so plain linear
   interpolation between reads would run up to ~20 m low mid-interval, and always in the
   unsafe direction (under-reading required distance).

   WHY NOT AN ORDINARY SPLINE. A natural cubic spline through these points overshoots and
   can turn non-monotone near the envelope edge, which would let required distance appear
   to FALL as OAT rises. Fritsch–Carlson monotone cubic (PCHIP) preserves monotonicity by
   construction, so a hotter or higher entry can never return a shorter distance.

   Extrapolation is linear off the end slope, never cubic — a cubic tail diverges fast, and
   every extrapolated value is flagged to the caller anyway. */

(function () {
  /* Fritsch–Carlson monotone cubic through (xs, ys), linear beyond the ends. */
  function pchip(xs, ys, x) {
    var n = xs.length;
    if (n === 0) return NaN;
    if (n === 1) return ys[0];
    if (n === 2) return ys[0] + (ys[1] - ys[0]) * (x - xs[0]) / (xs[1] - xs[0]);

    var h = [], d = [], i;
    for (i = 0; i < n - 1; i++) { h.push(xs[i + 1] - xs[i]); d.push((ys[i + 1] - ys[i]) / h[i]); }

    var m = new Array(n);
    m[0] = d[0];
    m[n - 1] = d[n - 2];
    for (i = 1; i < n - 1; i++) {
      if (d[i - 1] * d[i] <= 0) m[i] = 0;
      else {
        var w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1];
        m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i]);
      }
    }

    if (x <= xs[0]) return ys[0] + m[0] * (x - xs[0]);
    if (x >= xs[n - 1]) return ys[n - 1] + m[n - 1] * (x - xs[n - 1]);

    for (i = 1; i < n; i++) {
      if (xs[i] >= x) {
        var hh = h[i - 1], t = (x - xs[i - 1]) / hh, t2 = t * t, t3 = t2 * t;
        return ys[i - 1] * (2 * t3 - 3 * t2 + 1)
             + ys[i] * (-2 * t3 + 3 * t2)
             + m[i - 1] * hh * (t3 - 2 * t2 + t)
             + m[i] * hh * (t3 - t2);
      }
    }
    return ys[n - 1];
  }

  /* ISA temperature at a pressure altitude, °C. */
  function isaTemp(paFt) { return 15 - 1.98 * (paFt / 1000); }

  /* Build a lookup for one carpet plate.

     spec = { ROWS, name, fig, unit }
       ROWS = [{ pa: ft, pts: [[oatC, value], ...] }, ...]   ascending pa, ascending oat

     Returns lookup(paFt, oatC) -> { value, extrapolated, reason, maxOat, isaDev }. */
  function makeCarpet(spec) {
    var ROWS = spec.ROWS;
    var pas = ROWS.map(function (r) { return r.pa; });
    var lastOat = ROWS.map(function (r) { return r.pts[r.pts.length - 1][0]; });
    var firstOat = ROWS.map(function (r) { return r.pts[0][0]; });

    /* Envelope edge, interpolated across altitude. Each row's hottest read IS its edge. */
    function maxOat(paFt) { return pchip(pas, lastOat, paFt); }
    function minOat(paFt) { return pchip(pas, firstOat, paFt); }

    function rowAt(ri, oatC) {
      var p = ROWS[ri].pts;
      return pchip(p.map(function (q) { return q[0]; }), p.map(function (q) { return q[1]; }), oatC);
    }

    function lookup(paFt, oatC) {
      var notes = [];
      if (paFt < pas[0]) notes.push('pressure altitude ' + Math.round(paFt) + ' ft below the charted ' + pas[0] + ' ft');
      if (paFt > pas[pas.length - 1]) notes.push('pressure altitude ' + Math.round(paFt) + ' ft above the charted ' + pas[pas.length - 1] + ' ft');

      var hi = maxOat(paFt), lo = minOat(paFt);
      if (oatC > hi) notes.push('OAT ' + oatC.toFixed(0) + ' °C beyond the charted envelope edge of ' + hi.toFixed(0) + ' °C at this altitude');
      if (oatC < lo) notes.push('OAT ' + oatC.toFixed(0) + ' °C below the charted ' + lo.toFixed(0) + ' °C at this altitude');

      var pc = Math.max(pas[0], Math.min(pas[pas.length - 1], paFt));
      var vals = [];
      for (var i = 0; i < ROWS.length; i++) vals.push(rowAt(i, oatC));

      return {
        value: pchip(pas, vals, pc),
        extrapolated: notes.length > 0,
        reason: notes.join('; '),
        maxOat: hi,
        isaDev: oatC - isaTemp(paFt),
      };
    }

    lookup.maxOat = maxOat;
    lookup.minOat = minOat;
    lookup.spec = spec;
    return lookup;
  }

  window.PG_INTERP = { pchip: pchip, makeCarpet: makeCarpet, isaTemp: isaTemp };
})();
