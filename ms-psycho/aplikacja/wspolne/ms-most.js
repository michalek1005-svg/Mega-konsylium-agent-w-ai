/*
 * MS · most do powłoki Windows (MS Konsylium Narzędzia).
 * Moduł działa w ramce powłoki i nie ma dostępu do dysku. O operacje na plikach w „folderze
 * Konsylium” prosi powłokę przez postMessage; powłoka przekazuje je do procesu głównego, który
 * pilnuje, żeby nic nie wyszło poza ten folder. Poza powłoką (zwykła przeglądarka, podgląd w Claude)
 * MsMost.dostepny() zwraca false i moduł działa jak dotąd.
 */
(function (root) {
  'use strict';
  var czeka = {}, licznik = 0;
  var wRamce = false;
  try { wRamce = root.parent && root.parent !== root; } catch (e) { wRamce = false; }
  var sluchacze = [];
  root.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || e.source !== root.parent) return;
    if (d.typ === 'ms-most-odp') {
      var p = czeka[d.id]; if (!p) return; delete czeka[d.id];
      if (d.blad) p.zle(new Error(d.blad)); else p.ok(d.wynik);
    } else if (d.typ === 'ms-dane') {
      sluchacze.forEach(function (f) { try { f(d.od, d.dane); } catch (err) { /* słuchacz modułu */ } });
    }
  });
  function wywolaj(op, args, limit) {
    return new Promise(function (ok, zle) {
      if (!wRamce) { zle(new Error('Poza aplikacją MS Konsylium Narzędzia.')); return; }
      var id = ++licznik; czeka[id] = { ok: ok, zle: zle };
      root.parent.postMessage({ typ: 'ms-most', id: id, op: op, args: args || [] }, '*');
      setTimeout(function () { if (czeka[id]) { delete czeka[id]; zle(new Error('Powłoka nie odpowiada.')); } }, limit || 15000);
    });
  }
  var dostep = null;
  root.MsMost = {
    // true, gdy moduł działa w powłoce z obsługą plików (sprawdzane raz)
    dostepny: function () {
      if (!dostep) dostep = wywolaj('ping', [], 1200).then(function (w) { return w === 'ms-powloka-1'; }, function () { return false; });
      return dostep;
    },
    folder: function () { return wywolaj('folder'); },
    wybierzFolder: function () { return wywolaj('wybierzFolder', [], 600000); },
    czytaj: function (p) { return wywolaj('czytaj', [p]); },
    zapisz: function (p, t) { return wywolaj('zapisz', [p, t]); },
    lista: function (p) { return wywolaj('lista', [p || '']); },
    czytajFolder: function (p) { return wywolaj('czytajFolder', [p || '']); },
    // przełącza powłokę na inny moduł (np. anonimizator z ekranu wywiadu)
    otworzModul: function (m) { return wywolaj('otworzModul', [m]); },
    // przekazuje dane innemu modułowi (np. zanonimizowane wyniki do wywiadu)
    wyslij: function (doModulu, dane) { return wywolaj('wyslij', [doModulu, dane]); },
    naDane: function (f) { sluchacze.push(f); }
  };
})(typeof window !== 'undefined' ? window : this);
