/*
 * MS Konsylium na iPadzie: zastępuje preload.js. Powłoka (index.html) i moduły działają bez zmian,
 * a operacje na plikach folderu Konsylium idą przez sieć lokalną do aplikacji na komputerze
 * (serwer-ipad.js). Klucz parowania przychodzi w adresie z kodu QR (?k=…) i zostaje w pamięci iPada.
 * Wybór folderu i „Otwórz w Eksploratorze” zostają na komputerze.
 */
(function () {
  'use strict';
  var klucz = null;
  try { klucz = new URLSearchParams(location.search).get('k'); } catch (e) {}
  try { if (klucz) localStorage.setItem('ms-ipad-klucz', klucz); else klucz = localStorage.getItem('ms-ipad-klucz'); } catch (e) {}
  window.MS_IPAD = true;
  document.documentElement.classList.add('ipad');

  var stan = null;
  function ustawStan(s) {
    if (s === stan) return;
    stan = s;
    try { window.dispatchEvent(new CustomEvent('ms-ipad-stan', { detail: s })); } catch (e) {}
  }
  function api(op, args) {
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var t = ctrl ? setTimeout(function () { ctrl.abort(); }, 20000) : null;
    return fetch('api/' + op, {
      method: 'POST', cache: 'no-store', credentials: 'omit', signal: ctrl ? ctrl.signal : undefined,
      headers: { 'Content-Type': 'application/json', 'X-MS-Klucz': klucz || '' },
      body: JSON.stringify({ args: args || [] })
    }).then(function (r) {
      if (t) clearTimeout(t);
      if (r.status === 403) { ustawStan('klucz'); throw new Error('Ten iPad nie jest połączony z komputerem. Zeskanuj kod QR w aplikacji MS Konsylium na komputerze.'); }
      return r.json().then(function (j) {
        ustawStan('ok');
        if (j.blad) throw new Error(j.blad);
        return j.wynik;
      });
    }, function () {
      if (t) clearTimeout(t);
      ustawStan('brak');
      throw new Error('Brak połączenia z komputerem. Sprawdź, czy aplikacja na komputerze jest włączona i iPad jest w tej samej sieci Wi‑Fi.');
    });
  }
  window.msPowloka = {
    folder: function () { return api('folder'); },
    czytaj: function (p) { return api('czytaj', [String(p)]); },
    zapisz: function (p, t) { return api('zapisz', [String(p), String(t)]); },
    lista: function (p) { return api('lista', [String(p || '')]); },
    czytajFolder: function (p) { return api('czytajFolder', [String(p || '')]); }
  };
  // Stałe połączenie: strumień zdarzeń z komputera (Server-Sent Events). Safari wznawia go sam po zerwaniu
  // Wi‑Fi albo uśpieniu iPada; „Brak PC” pokazujemy dopiero, gdy przerwa trwa dłużej niż 4 s.
  var zrodlo = null, brakTimer = null, ponowTimer = null, ostatniPing = 0;
  function polacz() {
    if (!klucz || typeof EventSource !== 'function') return;
    try { zrodlo = new EventSource('zdarzenia?k=' + encodeURIComponent(klucz)); } catch (e) { return; }
    zrodlo.onopen = function () { clearTimeout(brakTimer); brakTimer = null; ostatniPing = Date.now(); ustawStan('ok'); };
    zrodlo.onerror = function () {
      if (!brakTimer) brakTimer = setTimeout(function () { brakTimer = null; ustawStan('brak'); }, 4000);
      if (zrodlo && zrodlo.readyState === 2) { clearTimeout(ponowTimer); ponowTimer = setTimeout(polacz, 3000); } // zamknięty (np. nowy kod na komputerze): spróbuj jeszcze raz
    };
    zrodlo.addEventListener('stan', function () { ostatniPing = Date.now(); });
    zrodlo.onmessage = function () { ostatniPing = Date.now(); };
  }
  polacz();
  document.addEventListener('visibilitychange', function () { if (!document.hidden && zrodlo && zrodlo.readyState === 2) polacz(); });
  window.msIpad = { maKlucz: function () { return !!klucz; }, stan: function () { return stan; }, polaczony: function () { return !!zrodlo && zrodlo.readyState === 1; } };

  // Schowek: Safari daje navigator.clipboard tylko na https, a iPad łączy się po http w sieci domowej.
  // Moduły (ta sama domena) dostają zastępstwo przez execCommand('copy') w swoim dokumencie.
  window.msIpadSchowek = function (okno) {
    try {
      if (!okno || (okno.navigator.clipboard && okno.isSecureContext)) return;
      var zastepstwo = {
        writeText: function (tekst) {
          return new Promise(function (ok, zle) {
            var d = okno.document, pole = d.createElement('textarea');
            pole.value = String(tekst); pole.setAttribute('readonly', '');
            pole.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px';
            d.body.appendChild(pole);
            pole.focus(); pole.setSelectionRange(0, pole.value.length);
            var udane = false; try { udane = d.execCommand('copy'); } catch (e) {}
            pole.remove();
            if (udane) ok(); else zle(new Error('Nie udało się skopiować.'));
          });
        }
      };
      Object.defineProperty(okno.navigator, 'clipboard', { value: zastepstwo, configurable: true });
    } catch (e) { /* zostaje komunikat modułu „użyj Zapisz tekst” */ }
  };
})();
