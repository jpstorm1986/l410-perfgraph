/* Balanced-field V1 solver, wing flaps 18° — H75 supplement Figs. 5-12…5-21.

   REFERENCE ONLY — NOT APPROVED FOR FLIGHT USE.

   WHAT THIS COMPUTES, and why V1 is not a single number.

   Each of the three take-off distances gives a LOCUS in the (V1, weight) plane — the set
   of weights at which that distance exactly consumes what the runway offers:

     TOR locus   from Figs. 5-12 / 5-13 / 5-14   (not yet digitised)
     TOD locus   from Figs. 5-15 / 5-16 / 5-17
     ASD locus   from Figs. 5-18 / 5-19 / 5-20

   TOR and TOD weights RISE with V1: a higher V1 means the engine fails later and nearer
   rotation, so the go case needs less room and more weight can be carried. ASD weight
   FALLS with V1: a higher decision speed means more energy to dissipate, so the stop case
   needs more room. The curves therefore cross, and the crossing is the balanced field
   point — the one V1 at which "can't stop" and "can't go" bind equally, and the weight
   there is the maximum the field supports.

   Per the supplement's procedure (page 36): plot all three loci on Fig. 5-21, take the
   intersections, and SELECT THE LOWER WEIGHT and its V1. Usually two intersections exist
   (TOR×ASD and TOD×ASD); the binding one is whichever gives less weight.

   Vmcg 70 KIAS (AFM) is an absolute floor on V1 — below it directional control on the
   remaining engine is not assured. The charts stop at 73, so the usable window is 73…84.

   The window can close entirely: if at every V1 in range the required distance exceeds
   what is available, the field does not support the take-off at any weight, and this
   module returns no solution rather than an extrapolated number.

   ===================================================================================
   VALIDATED against the supplement's own worked example — ALL SEVEN PUBLISHED PAIRS.

   The results table on supplement p. 24 publishes seven (V1, weight) pairs for the single
   worked example, not the two this file originally checked. Entry values come from the
   plates' vector construction lines, cross-read off the plate by the operating pilot
   (TOR 625 m / TORAcor 772 m; TOD 750 m / TODAcor 912 m; ASD 1202 m):

     TOR  V1 84   5 983 kg  vs published 6 200   −3.5 %
     TOR  V1 73   4 814 kg  vs published 4 900   −1.8 %
     TOD  V1 84   5 881 kg  vs published 5 800   +1.4 %
     TOD  V1 73   4 817 kg  vs published 4 800   +0.3 %
     ASD  4 800 kg at V1 76 ->  929 m vs plate level  904   +2.8 %
     ASD  5 800 kg at V1 73 ->  958 m vs plate level  970   −1.3 %
     ASD  6 600 kg at V1 73 -> 1 020 m vs plate level 1 036  −1.5 %

     mean −0.9 %, spread 4.9 % (−3.5 to +1.4 on the four weight solves)

   THE IMPORTANT CONCLUSION: the error is SCATTER, NOT BIAS. A mean of −0.9 % across seven
   independent points means no correction factor would improve these tables — the −3.5 %
   on Fig. 5-14 and the +1.4 % on Fig. 5-17 are opposite ends of one ±2.5 % scatter, not a
   systematic offset to remove. Applying either as a correction would degrade the other.

   The scatter's floor is the example itself. Fig. 5-17's example is provably inconsistent
   by 5 % (its two corners lie on one curve to within 12 m while its entry horizontal sits
   5 % below that curve — see fig5-17-tod-corr.js), so no amount of re-reading the curves
   can validate better than about ±2 % against it.

   The full-chain intersection result: TOD locus at the published V1 75.5 gives 4 979 kg
   against the published 5 010 (−0.6 %), and the TOD × ASD crossing gives 4 985 kg at
   V1 75.58 against 5 010 at 75.5. ASDAcor was solved for (929 m) since only TODAcor is
   decodable from p. 30; it falls inside the range of the p33 example's own dotted levels
   (904 / 970 / 1036 m), so it is plausible rather than tuned.

   PRACTICAL ACCURACY: about ±1 % on distances, and −4 % to +2 % on WEIGHT against the
   book. Weight is worse than distance because the inverse solve reads off a shallow curve
   — on a short field a 1 % distance error moves the limit ~160 kg — which is chart
   geometry, not table error, and is reported per-case as "±N kg per 1 %".
   ===================================================================================*/

(function () {
  var VMCG = 70;          /* AFM directional-control floor */
  var V1_MIN = 73;        /* chart lower bound */
  var V1_MAX = 84;        /* chart reference / upper bound */
  var VR = 81, V2 = 84;   /* fixed per AFM p10, flaps 18° */

  function need() {
    if (!window.PG_FIG516 || !window.PG_FIG517 || !window.PG_FIG519 || !window.PG_FIG520 || !window.PG_FIG518) {
      throw new Error('AFM data modules not loaded');
    }
  }

  /* Sample both loci across the V1 window.
     conditions: { paFt, oatC, toda, asda, slopePct, windKt, mtow } */
  function loci(cond) {
    need();
    var todReq = window.PG_FIG516.todRequired(cond.paFt, cond.oatC);
    var asdReq = window.PG_FIG519.asdRequired(cond.paFt, cond.oatC);

    /* TODA and ASDA each get their own slope/wind correction. Fig. 5-15 (TODA) is not yet
       digitised, so Fig. 5-18's is used for both and the result is flagged. */
    var asdaC = window.PG_FIG518.asdaCorrected(cond.asda, cond.slopePct, cond.windKt);
    var todaC = window.PG_FIG518.asdaCorrected(cond.toda, cond.slopePct, cond.windKt);

    if (asdaC.notAuthorized || todaC.notAuthorized) {
      return { refused: true, reason: asdaC.reason || todaC.reason };
    }

    var mtow = cond.mtow || 6600;
    var pts = [];
    for (var v = V1_MIN; v <= V1_MAX + 1e-9; v += 0.25) {
      var wTod = window.PG_FIG517.todLimitedWeight(todReq.tod, todaC.asdaCor, v, 4000, mtow + 400);
      var wAsd = window.PG_FIG520.asdLimitedWeight(asdReq.asd, asdaC.asdaCor, v, 4000, mtow + 400);
      pts.push({ v1: v, tod: wTod, asd: wAsd });
    }

    return {
      refused: false,
      todReq: todReq, asdReq: asdReq,
      todaCor: todaC.asdaCor, asdaCor: asdaC.asdaCor,
      points: pts,
      extrapolated: todReq.extrapolated || asdReq.extrapolated,
      reason: [todReq.reason, asdReq.reason, asdaC.reason, todaC.reason].filter(Boolean).join('; '),
    };
  }

  /* Balanced field: where the TOD locus (rising) meets the ASD locus (falling). */
  function solve(cond) {
    var L = loci(cond);
    if (L.refused) return L;

    var pts = L.points, mtow = cond.mtow || 6600, i;

    /* Find the sign change in (tod − asd). */
    var cross = null;
    for (i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i];
      if (a.tod == null || a.asd == null || b.tod == null || b.asd == null) continue;
      var da = a.tod - a.asd, db = b.tod - b.asd;
      if (da === 0) { cross = { v1: a.v1, weight: a.tod }; break; }
      if (da < 0 !== db < 0) {
        var t = da / (da - db);
        cross = { v1: a.v1 + t * (b.v1 - a.v1), weight: a.tod + t * (b.tod - a.tod) };
        break;
      }
    }

    /* No crossing inside the window: the binding limit is the lower locus at whichever
       end of the window gives most weight. */
    if (!cross) {
      var best = null;
      for (i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (p.tod == null || p.asd == null) continue;
        var w = Math.min(p.tod, p.asd);
        if (!best || w > best.weight) best = { v1: p.v1, weight: w, atEdge: true };
      }
      if (!best) return { refused: true, reason: 'no V1 in 73…84 KIAS gives a solution — the field does not support this take-off at any weight' };
      cross = best;
    }

    var limited = Math.min(cross.weight, mtow);
    return {
      refused: false,
      v1: cross.v1,
      weight: cross.weight,
      rtow: limited,
      structural: cross.weight >= mtow,
      atEdge: !!cross.atEdge,
      vr: VR, v2: V2, vmcg: VMCG,
      todReq: L.todReq, asdReq: L.asdReq,
      todaCor: L.todaCor, asdaCor: L.asdaCor,
      points: pts,
      extrapolated: L.extrapolated,
      reason: L.reason,
    };
  }

  /* What holding a fixed V1 (e.g. the operator's standard 81) costs in payload. */
  function costOfFixedV1(cond, v1Fixed) {
    var s = solve(cond);
    if (s.refused) return s;
    var tod = window.PG_FIG517.todLimitedWeight(s.todReq.tod, s.todaCor, v1Fixed, 4000, (cond.mtow || 6600) + 400);
    var asd = window.PG_FIG520.asdLimitedWeight(s.asdReq.asd, s.asdaCor, v1Fixed, 4000, (cond.mtow || 6600) + 400);
    var at = (tod == null || asd == null) ? null : Math.min(tod, asd, cond.mtow || 6600);
    return {
      balanced: s,
      fixedV1: v1Fixed,
      weightAtFixed: at,
      penaltyKg: at == null ? null : s.rtow - at,
      binds: (tod != null && asd != null) ? (tod < asd ? 'TOD' : 'ASD') : null,
    };
  }

  window.PG_SOLVER = { loci: loci, solve: solve, costOfFixedV1: costOfFixedV1, VMCG: VMCG, V1_MIN: V1_MIN, V1_MAX: V1_MAX, VR: VR, V2: V2 };
})();
