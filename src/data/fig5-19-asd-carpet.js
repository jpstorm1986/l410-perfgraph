/* Fig. 5-19 — OAT and airfield pressure altitude for ASD, wing flaps 18°.
   H75 supplement (Doc 04-005-FMS-01 Issue 5) page 32 of 60. Caption: "(ASD Required)".

   REFERENCE ONLY — NOT APPROVED FOR FLIGHT USE.

   Output condition: ASD required at 5 400 kg and V1 84 KIAS. That reference is printed on
   Fig. 5-20 as a heavy vertical "REFERENCE LINE" at 54 on its TAKE-OFF WEIGHT [100 kg]
   axis. Fig. 5-20 corrects the distance to actual weight and V1.

   PROVENANCE — hand-plotted by the operating pilot, TWO INDEPENDENT PASSES:

     pass 1 — read at round actual OAT (−20 … +40 °C) plus a separately-read envelope edge
     pass 2 — read at round ISA deviations (ISA−20 … ISA+35), converted to actual OAT here

   The plate's bottom axis is actual OAT; the steep lines crossing the pressure-altitude
   curves are constant-ISA-deviation lines, so pass 2 follows geometry actually drawn on
   the page and samples the hot end far better than reading along OAT verticals.

   The two passes agree to 7.3 m rms with a +0.2 m mean bias over the 37 places where they
   overlap; worst single disagreement 15 m at 8 000 ft / ISA+0. That is tighter than the
   TOD carpet's two passes (11.5 m rms, −2.3 m bias) and is the strongest validation in
   this dataset — the same plate read twice, on deliberately different grids. Both passes
   are retained: reads within 1.5 °C of each other are averaged, everything else is kept
   as an independent sample, which is why row point counts are uneven.

   Machine tracing of this carpet was attempted and failed four ways; see
   data/carpet-notes.md so the dead ends are not retried.

   Values are monotone increasing in OAT along every row by construction, and the last
   point in each row is that altitude's envelope edge, where the mesh meets its ISA limit
   (ISA+35 to 8 000 ft, ISA+30 at 10 000 ft, ISA+20 at 12 000 ft — a stepped limit, not the
   single ISA+35 line the plate's label implies, confirmed by the pilot). Including those
   edge points as real data rather than extrapolating past the last full rib matters: on
   the TOD carpet extrapolation cost 38–99 m in the unsafe direction.

   Coverage: 13 120 ft and the −30…−60 °C lines were not read. */

(function () {
  var ROWS = [
    { pa: 0, pts: [[-20, 820], [-10, 855], [-5, 870], [0, 890], [5, 910], [10, 920], [15, 945], [20, 950], [25, 975], [30, 990], [35, 1015], [40, 1020], [45, 1055], [50, 1100]] },
    { pa: 2000, pts: [[-20, 900], [-9.5, 925], [0.5, 960], [10.5, 1000], [20.5, 1033], [30.5, 1075], [40.5, 1130], [46, 1183]] },
    { pa: 4000, pts: [[-20, 960], [-12.9, 990], [-10, 995], [-2.9, 1030], [0, 1040], [7.1, 1075], [10, 1076], [17.1, 1110], [20, 1115], [27.1, 1160], [30, 1170], [37.1, 1235], [40, 1270], [42, 1280]] },
    { pa: 6000, pts: [[-20, 1035], [-16.9, 1055], [-10, 1075], [-6.9, 1095], [0, 1110], [3.1, 1135], [10, 1160], [13.1, 1180], [20, 1230], [23.1, 1250], [30, 1320], [33.1, 1345], [37.5, 1405]] },
    { pa: 8000, pts: [[-20.4, 1148], [-10.4, 1203], [-0.4, 1255], [9.6, 1313], [19.6, 1410], [29.6, 1525], [34.1, 1578]] },
    { pa: 10000, pts: [[-24.8, 1270], [-20, 1305], [-14.8, 1340], [-10, 1360], [-4.8, 1410], [0, 1445], [5.2, 1495], [10, 1550], [15.2, 1620], [20, 1685], [25.1, 1748]] },
    { pa: 12000, pts: [[-28.8, 1420], [-19.4, 1505], [-9.4, 1605], [0.6, 1710], [10.8, 1835]] },
  ];

  /* Resolved lazily, NOT at load time. The single-file build concatenates these modules
     in an order that can put a carpet before data/afm-interp.js, and calling
     window.PG_INTERP.makeCarpet() during load then threw and left this module undefined —
     the app silently lost its ASD carpet. A lazy getter is order-independent. */
  var _lookup = null;
  function lookup(paFt, oatC) {
    if (!_lookup) {
      if (!window.PG_INTERP) throw new Error('Fig. 5-19: data/afm-interp.js not loaded');
      _lookup = window.PG_INTERP.makeCarpet({
        ROWS: ROWS, name: 'ASD required', fig: 'Fig. 5-19', unit: 'm',
      });
    }
    return _lookup(paFt, oatC);
  }
  lookup.maxOat = function (paFt) {
    if (!_lookup) lookup(0, 0);
    return _lookup.maxOat(paFt);
  };

  window.PG_FIG519 = {
    ROWS: ROWS,
    asdRequired: function (paFt, oatC) {
      var r = lookup(paFt, oatC);
      return { asd: r.value, extrapolated: r.extrapolated, reason: r.reason, maxOat: r.maxOat, isaDev: r.isaDev };
    },
    maxOat: lookup.maxOat,
    REF_WEIGHT: 5400, REF_V1: 84,
  };
})();
