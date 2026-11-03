/* Fragmenty HTML/JS do usprawnień wyglądu – propozycja Graficzny 3.11.2026 (ES5, bez zależności).
   Kodujący przenosi je do właściwych plików (patrz README.md). Makieta (makieta.cjs) używa ich 1:1. */
var MS_UI = {};

/* [2] Ikona koła ratunkowego do paska (powłoka) */
MS_UI.ikonaPomocy = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5"/><circle cx="12" cy="12" r="4"/><path d="m5.3 5.3 3.9 3.9M14.8 14.8l3.9 3.9M14.8 9.2l3.9-3.9M5.3 18.7l3.9-3.9"/></svg>';
/* Panel z numerami – lista z config/pomoc-pl.json (jedyne źródło numerów), np. wstrzykiwana przez zbuduj.mjs jako window.MS_POMOC */
MS_UI.panelPomocy = function (pomoc) {
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* kolejność DOKŁADNIE jak w pliku (112 pierwsze), bez sortowania */
  return '<b>Pomoc w kryzysie</b><ul>' + pomoc.numery.map(function (n) {
    return '<li><span class="nr">' + esc(n.numer) + '</span><span class="nazwa">' + esc(n.kiedy) + '</span><span>' + esc(n.godziny) + '</span></li>';
  }).join('') + '</ul><span class="uwaga">Te numery są tu zawsze, w każdej zakładce.</span>';
};

/* [3] Gdy nie działa AI, a osoba czeka na odpowiedź – jedno spokojne zdanie w czacie (uwaga Merytorycznego 3.11) */
MS_UI.zdanieBrakAI = 'Odpowiedź może się teraz nie pojawić. Jeśli potrzebujesz pomocy od razu – przycisk Pomoc w kryzysie.';

/* [6] Twarze zespołu – ROLE i rola() już są w rozmowa.html; najwyżej 4 kółka */
MS_UI.twarze = function (glosy, rola) {
  return '<span class="twarze" aria-hidden="true">' + glosy.slice(0, 4).map(function (g) { var r = rola(g.rola); return '<i style="--k:' + r[2] + '">' + r[1] + '</i>'; }).join('') + '</span>';
};

/* [7] Ikony ćwiczeń wg id z config/cwiczenia.json */
MS_UI.ikonyCwiczen = {
  zapis_mysli: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
  plan_aktywnosci: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="m9 15.5 2 2 4-4"/></svg>',
  eksperyment: '<svg viewBox="0 0 24 24"><path d="M9 3h6M10 3v6l-5.6 9.4A2 2 0 0 0 6.1 21.5h11.8a2 2 0 0 0 1.7-3.1L14 9V3"/><path d="M7.2 15h9.6"/></svg>',
  uziemienie: '<svg viewBox="0 0 24 24"><path d="M12 22V12"/><path d="M12 12C12 7 8.5 4 3.5 4c0 5 3.5 8 8.5 8z"/><path d="M12 15c0-4 3-7 8.5-7 0 4.5-3.5 7-8.5 7z"/></svg>',
  wartosci: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5"/><path d="m15.8 8.2-2 5.6-5.6 2 2-5.6z"/></svg>',
  analiza_lancuchowa: '<svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/></svg>'
};
MS_UI.ikonaCwiczenia = function (id) { return '<span class="ikona-cw" aria-hidden="true">' + (MS_UI.ikonyCwiczen[id] || MS_UI.ikonyCwiczen.zapis_mysli) + '</span>'; };

/* [4] Pusty Pokój – szkic kręgu 7 foteli wokół niskiego stolika */
MS_UI.pustyPokoj = function () {
  var f = '', cx = 170, cy = 112, rx = 128, ry = 74;
  for (var i = 0; i < 7; i++) {
    var a = -Math.PI / 2 + i * 2 * Math.PI / 7, x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a), deg = a * 180 / Math.PI + 90;
    f += '<g transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + deg.toFixed(1) + ')"><rect class="f" x="-17" y="-8" width="34" height="26" rx="9"/><rect class="s" x="-14" y="-15" width="28" height="11" rx="5.5"/></g>';
  }
  return '<div class="pusty-pokoj" id="pusty-pokoj"><svg viewBox="0 0 340 224" aria-hidden="true"><ellipse class="d" cx="170" cy="112" rx="128" ry="74"/>'
    + '<ellipse class="s" cx="170" cy="112" rx="40" ry="20"/>' + f + '</svg>'
    + '<b>Pokój czeka na sprawę</b><span>Wybierz folder Konsylium ikoną folderu po lewej. Gdy pojawi się sprawa, zespół zajmie miejsca w kręgu.</span></div>';
};
if (typeof module !== 'undefined') module.exports = MS_UI;
