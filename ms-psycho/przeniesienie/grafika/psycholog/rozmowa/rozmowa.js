// Okno Rozmowy – brat psychologiczny MS Konsylium (wątek Graficzny, 1.11.2026).
// Komunikator: jeden terapeuta AI odpowiada jednym tekstem, za nim w tle pracuje zespół agentów.
// Bez sieci, bez bibliotek. Tekst wiadomości zawsze przez textContent (żadnego innerHTML z danych).
//
// Użycie:
//   const rz = Rozmowa.zamontuj(document.getElementById('rozmowa'), {
//     imie: 'Terapeutka', sprawa: '2026-11-01-01',
//     onWyslij: (tekst) => { /* zapisz turę do sprawy/<ID>/rozmowa.jsonl */ },
//     onZwolaj: () => { /* przejdź do Pokoju psychologicznego */ },
//     onReakcja: (idWiadomosci, emoji) => {},
//   });
//   rz.dodaj({ kto: 'terapeuta', tekst: '…', czas: '13:02', zrodla: ['PHQ-9: 14'], kulisy: [{ rola: 'CBT', skrot: '…' }, { rola: 'Psychodynamiczny', skrot: '…', spor: true }] });
//   rz.dodaj({ kto: 'ja', tekst: '…' });
//   rz.pisze(true, ['CBT', 'ACT', 'Strażnik ryzyka']);   // pasek „zespół pracuje” + dymek „pisze…”
//   rz.kryzys(3);   // 0–4 wg BEZPIECZENSTWO.md; ≥3 pokazuje numery pomocy, 4 blokuje dalszą rozmowę
//   rz.wczytaj(listaTur);   // np. z rozmowa.jsonl
(function (glob) {
  'use strict';
  const AWATAR = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="24" fill="#e6dcf3"/>
<path d="M10 48 Q12 34 24 33 Q36 34 38 48Z" fill="#7b6cc4"/><path d="M19 33 L24 39 L29 33Z" fill="#efe8f8"/>
<rect x="21" y="27" width="6" height="7" rx="2" fill="#f1d2b9"/>
<path d="M13 22 Q12 9 24 9 Q36 9 35 22 Q35 30 32 31 L31 20 Q24 16 17 20 L16 31 Q13 30 13 22Z" fill="#6b4a32"/>
<ellipse cx="24" cy="21" rx="8.5" ry="9.5" fill="#f3d9c4"/>
<path d="M16 18 Q20 12 30 15 Q32 17 32.5 19 Q26 14 16 19Z" fill="#6b4a32"/>
<circle cx="21" cy="21" r="1.1" fill="#2D2A3A"/><circle cx="27" cy="21" r="1.1" fill="#2D2A3A"/>
<path d="M21 25.5 Q24 27.5 27 25.5" fill="none" stroke="#b0605a" stroke-width="1.2" stroke-linecap="round"/>
<circle cx="19" cy="24" r="1.6" fill="#f0b4a8" opacity=".5"/><circle cx="29" cy="24" r="1.6" fill="#f0b4a8" opacity=".5"/></svg>`;
  const EMO_PASEK = ['😊', '🙂', '🤔', '😔', '👍', '❤️'];
  const EMO_REAKCJE = ['👍', '❤️', '🤔', '🙏'];
  const el = (tag, cls, tekst) => { const e = document.createElement(tag); if (cls) e.className = cls; if (tekst != null) e.textContent = tekst; return e; };
  const teraz = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const skrotRoli = (r) => String(r).split(/[\s-]+/).filter(Boolean).map((s) => s[0]).join('').slice(0, 3).toUpperCase();

  function zamontuj(korzen, opcje = {}) {
    const o = { imie: 'Terapeuta', sprawa: '', ...opcje };
    korzen.classList.add('rz');
    korzen.innerHTML = '';
    // nagłówek
    const glowa = el('div', 'rz-glowa');
    const aw = el('div', 'rz-awatar'); aw.innerHTML = AWATAR;
    const opis = el('div'); const h = el('h2', null, o.imie);
    const sub = el('div', 'rz-sub', (o.sprawa ? 'Sprawa ' + o.sprawa + ' · ' : '') + 'odpowiada jednym głosem, w tle pracuje zespół');
    opis.append(h, sub); glowa.append(aw, opis);
    if (o.przyciski) { const p = el('div', 'rz-prawy'); o.przyciski.forEach(([t, f]) => { const b = el('button', 'rz-btn', t); b.type = 'button'; b.onclick = f; p.append(b); }); glowa.append(p); }
    // pasek zespołu
    const pracuje = el('div', 'rz-pracuje'); pracuje.hidden = true; pracuje.setAttribute('role', 'status'); pracuje.setAttribute('aria-live', 'polite');
    const kropki = el('span', 'rz-kropki'); kropki.innerHTML = '<i></i><i></i><i></i>';
    const pracujeTxt = el('span'); const awatary = el('div', 'rz-awatary');
    pracuje.append(kropki, pracujeTxt, awatary);
    // lista
    const lista = el('div', 'rz-lista'); lista.setAttribute('role', 'log'); lista.setAttribute('aria-live', 'polite');
    // kryzys
    const kryzysEl = el('div', 'rz-kryzys'); kryzysEl.hidden = true; kryzysEl.setAttribute('role', 'alert');
    // wpis
    const wpis = el('div', 'rz-wpis');
    const pole = el('div', 'rz-pole');
    const ta = el('textarea'); ta.rows = 1; ta.placeholder = 'Napisz, co się dzieje albo o jaką sytuację chodzi…'; ta.setAttribute('aria-label', 'Wiadomość do terapeuty');
    const emo = el('div', 'rz-emo-pasek');
    EMO_PASEK.forEach((e) => { const b = el('button', null, e); b.type = 'button'; b.title = 'Wstaw ' + e; b.onclick = () => { wstaw(e); }; emo.append(b); });
    pole.append(ta, emo);
    const wyslij = el('button', 'rz-wyslij'); wyslij.type = 'button'; wyslij.setAttribute('aria-label', 'Wyślij');
    wyslij.innerHTML = '<svg viewBox="0 0 24 24"><path d="M4 12h14M13 6l6 6-6 6"/></svg>';
    const zwolaj = el('button', 'rz-zwolaj'); zwolaj.type = 'button'; zwolaj.innerHTML = '<span class="rz-dl">Zwołaj konsylium</span> <span>→</span>'; zwolaj.title = 'Zwołaj konsylium w Pokoju psychologicznym';
    wpis.append(pole, wyslij); if (o.onZwolaj) wpis.append(zwolaj);
    const stopka = el('div', 'rz-stopka', 'Narzędzie testowe do nauki i konsultacji – to nie jest terapia. W zagrożeniu życia dzwoń 112.');
    korzen.append(glowa, pracuje, lista, kryzysEl, wpis, stopka);

    let ostatniKto = null, pisze = null, nr = 0, zablokowane = false;
    const wiadomosci = new Map();
    function wstaw(t) { const s = ta.selectionStart ?? ta.value.length; ta.value = ta.value.slice(0, s) + t + ta.value.slice(ta.selectionEnd ?? s); ta.focus(); ta.selectionStart = ta.selectionEnd = s + t.length; dopasuj(); }
    function dopasuj() { ta.style.height = 'auto'; ta.style.height = Math.min(140, ta.scrollHeight) + 'px'; }
    function przewin() { lista.scrollTop = lista.scrollHeight; }
    function wyslijTekst() {
      const t = ta.value.trim(); if (!t || zablokowane) return;
      ta.value = ''; dopasuj();
      dodaj({ kto: 'ja', tekst: t });
      if (o.onWyslij) o.onWyslij(t);
    }
    ta.addEventListener('input', dopasuj);
    ta.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); wyslijTekst(); } });
    wyslij.onclick = wyslijTekst;
    zwolaj.onclick = () => o.onZwolaj && o.onZwolaj();

    function dodaj(m) {
      if (m.kto === 'system') { lista.insertBefore(el('div', 'rz-system', m.tekst), pisze); ostatniKto = null; przewin(); return; }
      if (m.dzien) lista.insertBefore(el('div', 'rz-dzien', m.dzien), pisze);
      const id = m.id || 'w' + (++nr);
      const kto = m.kto === 'ja' ? 'ja' : 'terapeuta';
      const w = el('div', 'rz-wiersz ' + kto + (ostatniKto === kto ? ' ciag' : '')); w.dataset.id = id;
      const mini = el('div', 'rz-mini'); mini.innerHTML = AWATAR;
      const b = el('div', 'rz-msg'); b.tabIndex = 0;
      b.append(document.createTextNode(m.tekst || ''));
      if (m.zrodla && m.zrodla.length) { const z = el('div', 'rz-zrodla'); m.zrodla.forEach((s) => z.append(el('span', null, s))); b.append(z); }
      if (m.kulisy && m.kulisy.length) {
        const d = el('details', 'rz-kulisy'); d.append(el('summary', null, 'Jak zespół do tego doszedł (' + m.kulisy.length + ')'));
        const ul = el('ul'); m.kulisy.forEach((k) => { const li = el('li', k.spor ? 'spor' : ''); li.append(el('b', null, k.rola + ': '), document.createTextNode(k.skrot)); ul.append(li); });
        d.append(ul); b.append(d);
      }
      b.append(el('span', 'rz-czas', m.czas || teraz()));
      const reakcje = el('div', 'rz-reakcje'); b.append(reakcje);
      if (kto === 'terapeuta') {
        const r = el('div', 'rz-reaguj');
        EMO_REAKCJE.forEach((e) => { const x = el('button', null, e); x.type = 'button'; x.setAttribute('aria-label', 'Reakcja ' + e); x.onclick = (ev) => { ev.stopPropagation(); reaguj(id, e); if (o.onReakcja) o.onReakcja(id, e); }; r.append(x); });
        b.append(r);
      }
      w.append(mini, b);
      lista.insertBefore(w, pisze);
      wiadomosci.set(id, { reakcje: {}, el: reakcje });
      (m.emo || []).forEach((e) => reaguj(id, e));
      ostatniKto = kto;
      przewin();
      return id;
    }
    function reaguj(id, e) {
      const w = wiadomosci.get(id); if (!w) return;
      w.reakcje[e] = (w.reakcje[e] || 0) + 1;
      w.el.textContent = '';
      Object.entries(w.reakcje).forEach(([k, n]) => w.el.append(el('span', null, n > 1 ? k + ' ' + n : k)));
    }
    function ustawPisze(tak, agenci = []) {
      pracuje.hidden = !tak;
      if (tak) {
        pracujeTxt.textContent = '';
        pracujeTxt.append(el('b', null, 'Zespół pracuje' + (agenci.length ? ': ' + agenci.length : '')), document.createTextNode(agenci.length ? ' · ' + agenci.join(', ') : ' · czyta i konsultuje odpowiedź'));
        awatary.textContent = '';
        agenci.slice(0, 4).forEach((a) => { const s = el('span', 'rz-aw', skrotRoli(a)); s.title = a; awatary.append(s); });
        if (agenci.length > 4) awatary.append(el('span', 'rz-aw', '+' + (agenci.length - 4)));
        if (!pisze) {
          pisze = el('div', 'rz-wiersz terapeuta rz-pisze');
          const mini = el('div', 'rz-mini'); mini.innerHTML = AWATAR;
          const b = el('div', 'rz-msg'); const k = el('span', 'rz-kropki'); k.innerHTML = '<i></i><i></i><i></i>';
          b.append(k, document.createTextNode(o.imie + ' pisze…'));
          pisze.append(mini, b); lista.append(pisze);
        }
      } else if (pisze) { pisze.remove(); pisze = null; }
      przewin();
    }
    function kryzys(poziom) {
      kryzysEl.textContent = '';
      if (!poziom || poziom < 3) { kryzysEl.hidden = true; return; }
      kryzysEl.hidden = false;
      kryzysEl.append(el('strong', null, poziom >= 4 ? 'To wygląda na sytuację zagrożenia. Teraz najważniejsza jest pomoc na żywo.' : 'Ważne: jeśli pojawiają się myśli o zrobieniu sobie krzywdy, warto porozmawiać z kimś teraz.'));
      kryzysEl.append(document.createTextNode(poziom >= 4 ? 'Ta rozmowa nie zastąpi pomocy w kryzysie, dlatego dalsze pisanie jest wstrzymane. Zadzwoń albo poproś kogoś bliskiego, żeby zadzwonił.' : 'Pomoc jest dostępna, także anonimowo:'));
      const n = el('div', 'rz-numery');
      [['112', 'zagrożenie życia'], ['800 70 2222', 'kryzys psychiczny, całodobowo'], ['116 123', 'telefon zaufania dla dorosłych']].forEach(([nr, opis]) => { const s = el('span'); s.append(el('b', null, nr), document.createTextNode(' · ' + opis)); n.append(s); });
      kryzysEl.append(n);
      zablokowane = poziom >= 4; ta.disabled = wyslij.disabled = zablokowane;
      przewin();
    }
    function wczytaj(tury) { lista.textContent = ''; pisze = null; ostatniKto = null; wiadomosci.clear(); (tury || []).forEach(dodaj); }
    return { dodaj, pisze: ustawPisze, kryzys, wczytaj, reaguj, pole: ta };
  }
  glob.Rozmowa = { zamontuj };
})(typeof window !== 'undefined' ? window : globalThis);
