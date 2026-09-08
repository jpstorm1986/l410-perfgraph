/* Fig. 5-13 — OAT and airfield pressure altitude for TOR, wing flaps 18°.
   H75 supplement (Doc 04-005-FMS-01 Issue 5) page 26 of 60. Caption: "(TOR Required)".

   REFERENCE ONLY — NOT APPROVED FOR FLIGHT USE.

   Output condition: TOR required at 5 400 kg and V1 84 KIAS — the same reference as the
   TOD and ASD chains. Fig. 5-14 corrects the distance to actual weight and V1.

   TOR is the take-off RUN — to the lift-off point. TOD carries on to 35 ft, and ASD is
   the accelerate-stop case, so TOR < TOD < ASD must hold everywhere. Checked against the
   two carpets already digitised at all 46 plotted points: zero violations, TOR running
   55–340 m below TOD. That ordering test is the reason to trust this plate was read and
   not confused with a neighbouring one.

   PROVENANCE — hand-plotted by the operating pilot on the ISA-deviation grid
   (ISA−20 … ISA+35 against each pressure-altitude curve), converted to actual OAT here.
   The plate's bottom axis is actual OAT; the steep lines crossing the pressure-altitude
   curves are constant-ISA-deviation lines, so reading along them follows geometry actually
   drawn on the page and samples the hot end where the chart curves hardest.

   One pass only. The TOD and ASD carpets each have two independent passes (agreeing to
   11.5 m and 7.3 m rms respectively); this one has not been re-read on a second grid, so
   it has no internal cross-check — only the TOR < TOD < ASD ordering above and the
   monotonicity below. Verified strictly increasing in OAT along every altitude row and in
   altitude along every ISA line.

   The envelope is the same stepped limit the other two plates showed, confirmed
   independently here by which lines run off the mesh: ISA+35 to 8 000 ft, ISA+30 at
   10 000 ft, ISA+20 at 12 000 ft. The last point in each row is that altitude's edge.

   Coverage: 13 120 ft and the −30…−60 °C lines were not read. */

(function () {
  var ROWS = [
    { pa: 0, pts: [[-5, 405], [5, 430], [15, 455], [25, 470], [35, 495], [45, 540], [50, 605]] },
    { pa: 2000, pts: [[-9, 430], [1, 455], [11, 485], [21, 510], [31, 540], [41, 620], [46, 695]] },
    { pa: 4000, pts: [[-12.9, 470], [-2.9, 500], [7.1, 530], [17.1, 550], [27.1, 595], [37.1, 725], [42.1, 795]] },
    { pa: 6000, pts: [[-16.9, 510], [-6.9, 540], [3.1, 575], [13.1, 615], [23.1, 695], [33.1, 825], [38.1, 940]] },
    { pa: 8000, pts: [[-20.8, 575], [-10.8, 615], [-0.8, 655], [9.2, 715], [19.2, 830], [29.2, 1030], [34.2, 1160]] },
    { pa: 10000, pts: [[-24.8, 670], [-14.8, 710], [-4.8, 765], [5.2, 875], [15.2, 1050], [25.2, 1315]] },
    { pa: 12000, pts: [[-28.8, 755], [-18.8, 820], [-8.8, 945], [1.2, 1105], [11.2, 1335]] },
  ];

  /* Lazy, so load order cannot matter in the single-file build — see Fig. 5-16. */
  var _lookup = null;
  function lookup(paFt, oatC) {
    if (!_lookup) {
      if (!window.PG_INTERP) throw new Error('Fig. 5-13: data/afm-interp.js not loaded');
      _lookup = window.PG_INTERP.makeCarpet({
        ROWS: ROWS, name: 'TOR required', fig: 'Fig. 5-13', unit: 'm',
      });
    }
    return _lookup(paFt, oatC);
  }
  lookup.maxOat = function (paFt) {
    if (!_lookup) lookup(0, 0);
    return _lookup.maxOat(paFt);
  };

  window.PG_FIG513 = {
    ROWS: ROWS,
    torRequired: function (paFt, oatC) {
      var r = lookup(paFt, oatC);
      return { tor: r.value, extrapolated: r.extrapolated, reason: r.reason, maxOat: r.maxOat, isaDev: r.isaDev };
    },
    maxOat: lookup.maxOat,
    REF_WEIGHT: 5400, REF_V1: 84,
  };
})();
