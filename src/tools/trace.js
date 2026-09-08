/* Curve-family tracer for the H75 supplement plates.

   The plates are embedded bitmaps inside a vector PDF: the curves are raster, but the
   worked-example construction lines ARE vector, so they are painted out before tracing
   and their coordinates double as a calibration cross-check.

   Usage (inside run_script, where readImage/createCanvas exist):
     const src = await readFile('tools/trace.js');
     const T = new Function('return (' + src + ')')()(  ... )   // see makeTracer below
*/
function makeTracer({ readImage, createCanvas }) {
  const PW = 595.2756, PH = 841.8898;

  async function load(path, dots) {
    const img = await readImage(path);
    const W = img.width, H = img.height, S = W / PW;
    const cv = createCanvas(W, H), c = cv.getContext('2d');
    c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.drawImage(img, 0, 0);
    c.strokeStyle = '#fff'; c.lineWidth = 5;
    (dots || []).forEach(([x0, y0, x1, y1]) => {
      c.beginPath(); c.moveTo(x0 * S, (PH - y0) * S); c.lineTo(x1 * S, (PH - y1) * S); c.stroke();
    });
    const D = c.getImageData(0, 0, W, H).data;
    const lum = new Uint8Array(W * H);
    for (let i = 0, p = 0; i < W * H; i++, p += 4) lum[i] = (D[p] * 0.299 + D[p + 1] * 0.587 + D[p + 2] * 0.114) | 0;
    return { W, H, S, lum, canvas: cv };
  }

  /* Dark-run centres in one column, ignoring runs long enough to be a gridline. */
  function runs(im, x, yTop, yBot, th = 150, maxRun = 9) {
    const out = []; let s = -1;
    for (let y = yTop; y <= yBot; y++) {
      const dark = im.lum[y * im.W + x] < th;
      if (dark && s < 0) s = y;
      else if (!dark && s >= 0) { if (y - s <= maxRun) out.push((s + y - 1) / 2); s = -1; }
    }
    if (s >= 0 && yBot - s <= maxRun) out.push((s + yBot) / 2);
    return out;
  }

  /* Curve families, strictly: keep only columns where EXACTLY n runs are found, so the
     y-ordering is unambiguous (the curves never cross on these plates). Nearest-neighbour
     continuation was tried and rejected — it hops between curves where they crowd,
     which showed up as carrier values landing on 1922/1535/1177 m instead of 1800/1600/1200.
     Columns lost to gridlines and axis labels are recovered by the polynomial fit. */
  function family(im, { xLeft, xRight, yTop, yBot, n, th = 150 }) {
    const cur = Array.from({ length: n }, () => []);
    let kept = 0;
    for (let x = xLeft; x <= xRight; x++) {
      const ys = runs(im, x, yTop, yBot, th);
      if (ys.length !== n) continue;
      kept++;
      ys.forEach((y, k) => cur[k].push([x, y]));
    }
    if (kept < 12) throw new Error('only ' + kept + ' clean columns for n=' + n);
    return cur;
  }

  /* Least-squares polynomial fit, used to smooth pixel noise and to reach the axis
     where gridlines robbed the trace of its outermost columns. */
  function polyfit(pts, deg) {
    const m = deg + 1, A = [], b = [];
    for (let r = 0; r < m; r++) {
      A.push(new Array(m).fill(0)); b.push(0);
      for (const [x, y] of pts) {
        for (let cc = 0; cc < m; cc++) A[r][cc] += Math.pow(x, r + cc);
        b[r] += y * Math.pow(x, r);
      }
    }
    for (let i = 0; i < m; i++) {
      let p = i;
      for (let r = i + 1; r < m; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r;
      [A[i], A[p]] = [A[p], A[i]]; [b[i], b[p]] = [b[p], b[i]];
      for (let r = 0; r < m; r++) {
        if (r === i || !A[i][i]) continue;
        const f = A[r][i] / A[i][i];
        for (let cc = i; cc < m; cc++) A[r][cc] -= f * A[i][cc];
        b[r] -= f * b[i];
      }
    }
    return b.map((v, i) => (A[i][i] ? v / A[i][i] : 0));
  }
  const polyval = (co, x) => co.reduce((s, c, i) => s + c * Math.pow(x, i), 0);

  /* A fitted curve: smooth, and safe to evaluate a little past the traced span. */
  function smooth(cu, deg = 3) {
    const co = polyfit(cu, deg);
    const x0 = cu[0][0], x1 = cu[cu.length - 1][0];
    return { at: (x) => polyval(co, x), x0, x1, rms: Math.sqrt(cu.reduce((s, [x, y]) => s + Math.pow(y - polyval(co, x), 2), 0) / cu.length) };
  }

  /* Linear interpolation along a polyline, extrapolating from the end pair. */
  function at(cu, x) {
    if (cu.length < 2) return cu[0][1];
    if (x <= cu[0][0]) { const [xa, ya] = cu[0], [xb, yb] = cu[1]; return ya + (yb - ya) * (x - xa) / (xb - xa); }
    for (let i = 1; i < cu.length; i++) if (cu[i][0] >= x) {
      const [xa, ya] = cu[i - 1], [xb, yb] = cu[i];
      return ya + (yb - ya) * (x - xa) / ((xb - xa) || 1);
    }
    const n = cu.length, [xa, ya] = cu[n - 2], [xb, yb] = cu[n - 1];
    return ya + (yb - ya) * (x - xa) / (xb - xa);
  }

  /* Axis mapping helpers: two reference pixel positions and their chart values. */
  const axis = (p0, v0, p1, v1) => ({
    toV: (p) => v0 + (p - p0) * (v1 - v0) / (p1 - p0),
    toP: (v) => p0 + (v - v0) * (p1 - p0) / (v1 - v0),
  });

  return { load, runs, family, at, axis, polyfit, polyval, smooth };
}
makeTracer;
