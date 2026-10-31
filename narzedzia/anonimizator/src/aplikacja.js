// Anonimizator wyników badań — logika interfejsu.
// Wszystkie biblioteki są wbudowane w ten plik (bloki <script type="text/plain" id="z-…"> w base64).
// Nic nie jest pobierane ani wysyłane: blokuje to też nagłówek Content-Security-Policy.
// (Kod z wykrywanie.js jest wklejany przed tym plikiem przez build.mjs.)

const $ = (s) => document.querySelector(s);
const el = (tag, attrs = {}, ...dzieci) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'style') e.style.cssText = v;
    else e.setAttribute(k, v);
  }
  for (const d of dzieci) e.append(d);
  return e;
};

const KOLORY = {
  pacjent: '#d9534f', pesel: '#c0392b', urodzenie: '#e67e22', adres: '#d4a017', zlecenie: '#8e6bbf',
  kod: '#5b6cc4', lekarz: '#2f8fb0', personel: '#2e8b84', placowka: '#7a8a5c', daty: '#867e70',
  fraza: '#c2477a', reczne: '#0F5E58',
};
const NAZWY = { ...Object.fromEntries(Object.entries(KATEGORIE).map(([k, v]) => [k, v.nazwa])), reczne: 'Twoje zaznaczenia' };

const S = {
  strony: [],          // { nr, szer, wys, slowa, ocr, zrodlo, wezel, canvas, warstwa, renderSkala }
  ramki: [],           // { id, strona, x, y, w, h, kategoria, powod, tekst, zrodlo: 'auto'|'reczne', on }
  kody: [],            // propozycje z wykrywania kodów (zachowywane przy ponownym wykrywaniu)
  katOn: Object.fromEntries(Object.entries(KATEGORIE).map(([k, v]) => [k, v.domyslnie])),
  zoom: 1, podglad: false, historia: [], nastId: 1, pdf: null, pdfjs: null,
};

// ── zasoby wbudowane ─────────────────────────────────────────────
const cache = {};
function bajty(id) {
  const b64 = document.getElementById(id).textContent.trim();
  const bin = atob(b64);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
function url(id, typ) {
  return cache[id] || (cache[id] = URL.createObjectURL(new Blob([bajty(id)], { type: typ })));
}
function skrypt(id) {
  return new Promise((ok, zle) => {
    const s = document.createElement('script');
    s.src = url(id, 'text/javascript');
    s.onload = ok; s.onerror = () => zle(new Error('Nie udało się wczytać ' + id));
    document.head.append(s);
  });
}
async function pdfjs() {
  if (!S.pdfjs) {
    S.pdfjs = await import(url('z-pdfjs', 'text/javascript'));
    S.pdfjs.GlobalWorkerOptions.workerSrc = url('z-pdfjs-worker', 'text/javascript');
  }
  return S.pdfjs;
}
let tessWorker = null;
async function tesseract(postep) {
  if (tessWorker) return tessWorker;
  if (!window.Tesseract) await skrypt('z-tesseract');
  // Rdzeń (WASM wbudowany w JS) sklejony z workerem w jeden skrypt: worker widzi gotowe TesseractCore
  // i niczego nie dociąga. Słownik polski podajemy przez podmianę fetch w workerze — tylko dla
  // ścieżki „wbudowane/pol.traineddata.gz” (dane wbudowane w ten plik, bez sieci).
  // (fetch z blob: w workerze uruchomionym z file:// Chromium blokuje, więc słownik idzie w treści skryptu)
  const polB64 = document.getElementById('z-pol').textContent.trim();
  const podmiana = `const __pol="${polB64}";` +
    `self.fetch=(u)=>/(^|\\/)wbudowane\\/pol\\.traineddata\\.gz$/.test(String(u))?` +
    `Promise.resolve(new Response(Uint8Array.from(atob(__pol),(c)=>c.charCodeAt(0)))):Promise.reject(new Error('Brak sieci: '+u));\n`;
  const workerPath = URL.createObjectURL(new Blob([podmiana, bajty('z-tesseract-core'), '\n;\n', bajty('z-tesseract-worker')], { type: 'text/javascript' }));
  tessWorker = await window.Tesseract.createWorker('pol', 1, {
    workerPath,
    workerBlobURL: false,
    langPath: 'wbudowane',
    gzip: true,
    cacheMethod: 'none',
    errorHandler: (e) => status('Błąd OCR: ' + (e && e.message ? e.message : e), true),
    logger: (m) => postep && m.status === 'recognizing text' && postep(m.progress),
  });
  return tessWorker;
}

// ── status i postęp ──────────────────────────────────────────────
function status(t, blad = false) {
  const s = $('#status');
  s.textContent = t;
  s.style.color = blad ? 'var(--alarm)' : '';
}
function postep(v) {
  const p = $('#postep');
  if (v == null) { p.hidden = true; return; }
  p.hidden = false;
  p.firstElementChild.style.width = Math.round(v * 100) + '%';
}

// ── wczytanie pliku ──────────────────────────────────────────────
async function otworz(plik) {
  if (!plik) return;
  try {
    wyczysc();
    status('Wczytuję plik…');
    const dane = new Uint8Array(await plik.arrayBuffer());
    const czyPdf = plik.type === 'application/pdf' || /\.pdf$/i.test(plik.name) || (dane[0] === 0x25 && dane[1] === 0x50);
    if (czyPdf) await wczytajPdf(dane);
    else await wczytajObraz(plik);
    $('#powitanie').hidden = true;
    for (const b of ['#b-pomniejsz', '#b-powieksz', '#b-podglad', '#b-frazy', '#b-pdf', '#b-txt', '#b-kopiuj']) $(b).disabled = false;
    await rysujStrony();
    await przygotujTekst();
    await szukajKodow();
    wykrywaj();
    const n = aktywne().length;
    status(`Gotowe: ${S.strony.length} ${S.strony.length === 1 ? 'strona' : 'str.'}, ${n} propozycji zakrycia. Sprawdź je i popraw.`);
  } catch (e) {
    console.error(e);
    status('Błąd: ' + (e && e.message ? e.message : e), true);
  } finally {
    postep(null);
  }
}

function wyczysc() {
  if (S.pdf) S.pdf.destroy();
  S.strony = []; S.ramki = []; S.kody = []; S.historia = []; S.pdf = null; S.nastId = 1;
  $('#strony').replaceChildren();
  $('#b-cofnij').disabled = true;
}

async function wczytajPdf(dane) {
  const lib = await pdfjs();
  S.pdf = await lib.getDocument({ data: dane, isEvalSupported: false, useSystemFonts: true, disableAutoFetch: true, stopAtErrors: false }).promise;
  for (let i = 1; i <= S.pdf.numPages; i++) {
    const strona = await S.pdf.getPage(i);
    const vp = strona.getViewport({ scale: 1 });
    S.strony.push({ nr: i, szer: vp.width, wys: vp.height, slowa: [], ocr: false, zrodlo: { typ: 'pdf', strona } });
  }
}

async function wczytajObraz(plik) {
  const bmp = await createImageBitmap(plik);
  // jednostka strony = piksel obrazu
  S.strony.push({ nr: 1, szer: bmp.width, wys: bmp.height, slowa: [], ocr: true, zrodlo: { typ: 'obraz', bmp } });
}

// wyrenderuj stronę na płótno w zadanej skali (1 = jednostka strony)
async function renderuj(st, skala, plotno = document.createElement('canvas')) {
  plotno.width = Math.max(1, Math.round(st.szer * skala));
  plotno.height = Math.max(1, Math.round(st.wys * skala));
  const ctx = plotno.getContext('2d', { willReadFrequently: false });
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, plotno.width, plotno.height);
  if (st.zrodlo.typ === 'pdf') {
    const vp = st.zrodlo.strona.getViewport({ scale: skala });
    await st.zrodlo.strona.render({ canvasContext: ctx, viewport: vp, intent: 'print' }).promise;
  } else {
    ctx.drawImage(st.zrodlo.bmp, 0, 0, plotno.width, plotno.height);
  }
  return plotno;
}

// ── tekst: warstwa tekstowa PDF albo OCR ─────────────────────────
const miarka = document.createElement('canvas').getContext('2d');
function slowaZPozycji(str, x, y, szer, h) {
  // rozbij fragment tekstu na słowa; pozycje wg szerokości znaków zmierzonych krojem bezszeryfowym
  miarka.font = '100px sans-serif';
  const cala = miarka.measureText(str).width || 1;
  const out = [];
  const re = /\S+/g;
  let m;
  while ((m = re.exec(str))) {
    const x0 = miarka.measureText(str.slice(0, m.index)).width / cala * szer;
    const x1 = miarka.measureText(str.slice(0, m.index + m[0].length)).width / cala * szer;
    // zapas po bokach: szerokości liter w PDF różnią się od kroju, którym mierzymy
    const zapas = h * 0.12;
    out.push({ t: m[0], x: x + x0 - zapas, y, w: Math.max(1, x1 - x0) + 2 * zapas, h });
  }
  return out;
}

async function przygotujTekst() {
  const lib = S.pdf ? await pdfjs() : null;
  const doOcr = [];
  for (const st of S.strony) {
    if (st.zrodlo.typ === 'pdf') {
      const vp = st.zrodlo.strona.getViewport({ scale: 1 });
      const tc = await st.zrodlo.strona.getTextContent();
      for (const it of tc.items) {
        if (!it.str || !it.str.trim()) continue;
        const tx = lib.Util.transform(vp.transform, it.transform);
        const fh = Math.hypot(tx[2], tx[3]) || it.height || 8;
        const szer = it.width * (vp.scale || 1);
        st.slowa.push(...slowaZPozycji(it.str, tx[4], tx[5] - fh * 0.88, szer, fh * 1.12));
      }
      const znaki = st.slowa.reduce((a, w) => a + w.t.length, 0);
      if (znaki < 40) { st.ocr = true; st.slowa = []; doOcr.push(st); }
    } else doOcr.push(st);
  }
  for (let i = 0; i < doOcr.length; i++) {
    const st = doOcr[i];
    status(`Rozpoznaję tekst (OCR) — strona ${st.nr}${doOcr.length > 1 ? ` z ${doOcr.length}` : ''}. Pierwszy raz trwa to kilkanaście sekund…`);
    const w = await tesseract((p) => postep((i + p) / doOcr.length));
    // ok. 2500 px szerokości wystarcza na drobny druk wyników
    const skala = Math.min(4, Math.max(1, 2500 / st.szer));
    const plotno = await renderuj(st, skala);
    const { data } = await w.recognize(plotno, {}, { blocks: true, text: false });
    for (const b of data.blocks || []) for (const p of b.paragraphs) for (const l of p.lines) for (const wd of l.words) {
      if (!wd.text.trim() || wd.confidence < 15) continue;
      const bb = wd.bbox;
      st.slowa.push({ t: wd.text, x: bb.x0 / skala, y: bb.y0 / skala, w: (bb.x1 - bb.x0) / skala, h: (bb.y1 - bb.y0) / skala });
    }
  }
}

async function szukajKodow() {
  S.kody = [];
  for (const st of S.strony) {
    const skala = Math.min(3, 1800 / st.szer) || 1;
    const p = await renderuj(st, skala);
    const ctx = p.getContext('2d');
    const { data } = ctx.getImageData(0, 0, p.width, p.height);
    const g = new Uint8Array(p.width * p.height);
    for (let i = 0; i < g.length; i++) g[i] = (data[i * 4] * 0.3 + data[i * 4 + 1] * 0.59 + data[i * 4 + 2] * 0.11) | 0;
    for (const r of wykryjKodyKreskowe(g, p.width, p.height)) {
      // pomiń duże obszary (np. ozdobne tło) — kod rzadko zajmuje > 30% szerokości strony
      if (r.w / p.width > 0.45) continue;
      const k = { strona: st.nr, x: r.x / skala, y: r.y / skala, w: r.w / skala, h: r.h / skala, kategoria: 'kod', powod: r.rodzaj, tekst: r.rodzaj };
      // obszar pokryty głównie słowami (warstwa PDF albo OCR) to tekst (np. „µIU”), nie kod
      {
        const pole = st.slowa.reduce((a, w) => a + Math.max(0, Math.min(w.x + w.w, k.x + k.w) - Math.max(w.x, k.x)) *
          Math.max(0, Math.min(w.y + w.h, k.y + k.h) - Math.max(w.y, k.y)), 0);
        if (pole > 0.35 * k.w * k.h) continue;
      }
      S.kody.push(k);
    }
  }
}

// ── wykrywanie i ramki ───────────────────────────────────────────
const klucz = (r) => [r.strona, Math.round(r.x), Math.round(r.y), Math.round(r.w), Math.round(r.h)].join(':');

function wykrywaj() {
  const frazy = $('#frazy').value.split(/\n|;/).map((s) => s.trim()).filter(Boolean);
  const stare = new Map(S.ramki.filter((r) => r.zrodlo === 'auto').map((r) => [klucz(r), r.on]));
  const reczne = S.ramki.filter((r) => r.zrodlo === 'reczne');
  const auto = [...wykryj(S.strony, { frazy }), ...S.kody].map((p) => ({
    ...p, id: S.nastId++, zrodlo: 'auto', on: stare.has(klucz(p)) ? stare.get(klucz(p)) : true,
  }));
  S.ramki = [...auto, ...reczne];
  rysujRamki();
}

function aktywne() {
  return S.ramki.filter((r) => r.on && (r.zrodlo === 'reczne' || S.katOn[r.kategoria]));
}

function zapamietaj() {
  S.historia.push(JSON.stringify({ ramki: S.ramki, katOn: S.katOn }));
  if (S.historia.length > 100) S.historia.shift();
  $('#b-cofnij').disabled = false;
}
function cofnij() {
  const h = S.historia.pop();
  if (!h) return;
  const s = JSON.parse(h);
  S.ramki = s.ramki; S.katOn = s.katOn;
  $('#b-cofnij').disabled = !S.historia.length;
  rysujRamki();
}

// ── rysowanie stron ──────────────────────────────────────────────
async function rysujStrony() {
  const kont = $('#strony');
  kont.replaceChildren();
  const dostepna = Math.max(320, $('#obszar').clientWidth - 44);
  const dpr = window.devicePixelRatio || 1;
  for (const st of S.strony) {
    const szerPx = Math.min(dostepna, 900) * S.zoom;
    const skala = szerPx / st.szer;
    const canvas = await renderuj(st, skala * dpr, st.canvas);
    const warstwa = el('div', { class: 'warstwa' });
    const wezel = el('div', { class: 'strona', style: `width:${szerPx}px` }, canvas, warstwa,
      el('div', { class: 'strona-nr' }, `str. ${st.nr}`));
    Object.assign(st, { canvas, warstwa, wezel, renderSkala: skala });
    podepnijRysowanie(st);
    kont.append(wezel);
  }
  rysujRamki();
}

function rysujRamki() {
  const on = new Set(aktywne().map((r) => r.id));
  for (const st of S.strony) {
    if (!st.warstwa) continue;
    st.warstwa.querySelectorAll('.r:not(.rysowana)').forEach((n) => n.remove());
    for (const r of S.ramki.filter((x) => x.strona === st.nr)) {
      if (r.zrodlo === 'auto' && !S.katOn[r.kategoria]) continue;
      const kat = r.zrodlo === 'reczne' ? 'reczne' : r.kategoria;
      const d = el('div', {
        class: 'r ' + (on.has(r.id) ? 'on' : 'off'),
        'data-id': r.id,
        title: `${NAZWY[kat]} — ${r.powod}${r.tekst ? `: ${r.tekst}` : ''}\nKliknij, by ${on.has(r.id) ? 'wyłączyć' : 'włączyć'}.`,
        style: `--k:${KOLORY[kat]};left:${(r.x - 1) / st.szer * 100}%;top:${(r.y - 1) / st.wys * 100}%;width:${(r.w + 2) / st.szer * 100}%;height:${(r.h + 2) / st.wys * 100}%`,
      });
      d.addEventListener('pointerdown', (e) => e.stopPropagation());
      d.addEventListener('click', (e) => {
        if (S.podglad) return;
        e.stopPropagation();
        zapamietaj();
        r.on = !r.on;
        rysujRamki();
      });
      if (r.zrodlo === 'reczne') {
        const x = el('button', { class: 'x', title: 'Usuń tę ramkę' }, '×');
        x.addEventListener('click', (e) => {
          e.stopPropagation();
          zapamietaj();
          S.ramki = S.ramki.filter((q) => q.id !== r.id);
          rysujRamki();
        });
        d.append(x);
      }
      st.warstwa.append(d);
    }
  }
  rysujPanel();
}

function podepnijRysowanie(st) {
  const w = st.warstwa;
  let start = null, ramka = null;
  const pkt = (e) => {
    const b = w.getBoundingClientRect();
    return { x: (e.clientX - b.left) / b.width * st.szer, y: (e.clientY - b.top) / b.height * st.wys };
  };
  w.addEventListener('pointerdown', (e) => {
    if (S.podglad || e.button !== 0) return;
    start = pkt(e);
    ramka = el('div', { class: 'r rysowana' });
    w.append(ramka);
    w.setPointerCapture(e.pointerId);
  });
  w.addEventListener('pointermove', (e) => {
    if (!start) return;
    const p = pkt(e);
    const x = Math.min(p.x, start.x), y = Math.min(p.y, start.y);
    Object.assign(ramka.style, {
      left: x / st.szer * 100 + '%', top: y / st.wys * 100 + '%',
      width: Math.abs(p.x - start.x) / st.szer * 100 + '%', height: Math.abs(p.y - start.y) / st.wys * 100 + '%',
    });
  });
  const koniec = (e) => {
    if (!start) return;
    const p = pkt(e);
    const r = { x: Math.min(p.x, start.x), y: Math.min(p.y, start.y), w: Math.abs(p.x - start.x), h: Math.abs(p.y - start.y) };
    ramka.remove();
    start = null;
    const min = st.szer / 300;
    if (r.w > min && r.h > min) dodajReczna(st, r, 'prostokąt narysowany ręcznie', '');
  };
  w.addEventListener('pointerup', koniec);
  w.addEventListener('pointercancel', () => { if (ramka) ramka.remove(); start = null; });
  w.addEventListener('dblclick', (e) => {
    if (S.podglad) return;
    const p = pkt(e);
    const wd = st.slowa.find((s) => p.x >= s.x - 1 && p.x <= s.x + s.w + 1 && p.y >= s.y - 1 && p.y <= s.y + s.h + 1);
    if (wd) dodajReczna(st, { x: wd.x, y: wd.y, w: wd.w, h: wd.h }, 'słowo zaznaczone dwuklikiem', wd.t);
  });
}

function dodajReczna(st, r, powod, tekst) {
  zapamietaj();
  S.ramki.push({ id: S.nastId++, strona: st.nr, ...r, kategoria: 'reczne', powod, tekst, zrodlo: 'reczne', on: true });
  rysujRamki();
}

// ── panel propozycji ─────────────────────────────────────────────
function rysujPanel() {
  const k = $('#kategorie');
  const otwarte = new Set([...k.querySelectorAll('details[open]')].map((d) => d.dataset.k));
  k.replaceChildren();
  if (!S.strony.length) return;
  const grupy = {};
  for (const r of S.ramki) (grupy[r.zrodlo === 'reczne' ? 'reczne' : r.kategoria] ||= []).push(r);
  const kolejnosc = [...Object.keys(KATEGORIE), 'reczne'];
  for (const kat of kolejnosc) {
    const lista = grupy[kat] || [];
    if (!lista.length && kat !== 'reczne' && !['pacjent', 'pesel', 'urodzenie', 'adres', 'zlecenie', 'kod'].includes(kat)) continue;
    const reczna = kat === 'reczne';
    const katWl = reczna ? true : S.katOn[kat];
    const ileOn = lista.filter((r) => r.on && katWl).length;
    const ch = el('input', { type: 'checkbox', title: 'Zakrywaj tę kategorię' });
    ch.checked = katWl && (lista.length ? ileOn > 0 : true);
    ch.indeterminate = katWl && ileOn > 0 && ileOn < lista.length;
    ch.disabled = reczna && !lista.length;
    ch.addEventListener('click', (e) => e.stopPropagation());
    ch.addEventListener('change', () => {
      zapamietaj();
      if (reczna) lista.forEach((r) => { r.on = ch.checked; });
      else {
        S.katOn[kat] = ch.checked;
        if (ch.checked && !lista.some((r) => r.on)) lista.forEach((r) => { r.on = true; });
      }
      rysujRamki();
    });
    const ul = el('ul');
    for (const r of lista) {
      const c = el('input', { type: 'checkbox' });
      c.checked = r.on && katWl;
      c.disabled = !katWl;
      c.addEventListener('change', () => { zapamietaj(); r.on = c.checked; rysujRamki(); });
      const t = el('span', { class: 't', title: 'Pokaż na stronie' },
        `str. ${r.strona} · ${r.tekst || '(obszar)'}`, el('span', { class: 'p' }, r.powod));
      t.addEventListener('click', () => pokaz(r));
      ul.append(el('li', {}, c, t));
    }
    if (!lista.length) ul.append(el('li', {}, el('span', { class: 'p' }, reczna ? 'Brak — przeciągnij myszą po stronie.' : 'Nic nie znaleziono.')));
    const d = el('details', { class: 'kat', 'data-k': kat, style: `--k:${KOLORY[kat]}` },
      el('summary', {}, ch, el('span', { class: 'kolor' }), el('span', {}, NAZWY[kat]),
        el('span', { class: 'ile' }, lista.length ? `${ileOn} z ${lista.length}` : '—')),
      ul);
    if (otwarte.has(kat)) d.open = true;
    k.append(d);
  }
}

function pokaz(r) {
  const n = document.querySelector(`.r[data-id="${r.id}"]`);
  if (!n) return;
  n.scrollIntoView({ behavior: 'smooth', block: 'center' });
  n.classList.remove('blysk');
  void n.offsetWidth;
  n.classList.add('blysk');
}

// ── zapis ────────────────────────────────────────────────────────
const dzis = () => new Date().toISOString().slice(0, 10);
function pobierz(blob, nazwa) {
  const a = el('a', { href: URL.createObjectURL(blob), download: nazwa });
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
}

async function zapiszPdf() {
  try {
    status('Tworzę zanonimizowany PDF…');
    if (!window.PDFLib) await skrypt('z-pdflib');
    const { PDFDocument } = window.PDFLib;
    const doc = await PDFDocument.create();
    // metadane neutralne — nic z oryginału nie przechodzi
    doc.setTitle('Wynik badań — zanonimizowany');
    doc.setAuthor(''); doc.setSubject(''); doc.setKeywords([]);
    doc.setCreator('Konsylium AI — anonimizator offline'); doc.setProducer('Konsylium AI');
    const akt = aktywne();
    for (let i = 0; i < S.strony.length; i++) {
      const st = S.strony[i];
      postep(i / S.strony.length);
      // PDF: ok. 200 dpi; obraz: rozdzielczość oryginału (maks. 3000 px)
      const skala = st.zrodlo.typ === 'pdf' ? 200 / 72 : Math.min(1, 3000 / st.szer);
      const p = await renderuj(st, skala);
      const ctx = p.getContext('2d');
      ctx.fillStyle = '#000';
      for (const r of akt.filter((x) => x.strona === st.nr)) {
        ctx.fillRect(Math.floor((r.x - 1) * skala), Math.floor((r.y - 1) * skala), Math.ceil((r.w + 2) * skala), Math.ceil((r.h + 2) * skala));
      }
      const jpg = await new Promise((ok) => p.toBlob(ok, 'image/jpeg', 0.9));
      const obraz = await doc.embedJpg(new Uint8Array(await jpg.arrayBuffer()));
      // wymiary strony w punktach: PDF — jak oryginał; obraz — przy założeniu 150 dpi
      const [w, h] = st.zrodlo.typ === 'pdf' ? [st.szer, st.wys] : [st.szer * 72 / 150, st.wys * 72 / 150];
      const strona = doc.addPage([w, h]);
      strona.drawImage(obraz, { x: 0, y: 0, width: w, height: h });
    }
    const bajtyPdf = await doc.save();
    pobierz(new Blob([bajtyPdf], { type: 'application/pdf' }), `wynik-zanonimizowany-${dzis()}.pdf`);
    status(`Zapisano PDF (${akt.length} zakrytych pól). Plik jest w folderze Pobrane.`);
  } catch (e) {
    console.error(e);
    status('Błąd zapisu: ' + e.message, true);
  } finally {
    postep(null);
  }
}

function tekst() {
  const naglowek = 'Wynik badań laboratoryjnych (zanonimizowany w Konsylium AI, ' + dzis() + ')\n' +
    (S.strony.some((s) => s.ocr) ? 'Uwaga: część tekstu odczytana automatycznie z obrazu (OCR) — możliwe przekłamania liczb.\n' : '') + '\n';
  return naglowek + tekstPoAnonimizacji(S.strony, aktywne());
}

// ── zdarzenia ────────────────────────────────────────────────────
$('#plik').addEventListener('change', (e) => { otworz(e.target.files[0]); e.target.value = ''; });
const upusc = $('#upusc');
upusc.addEventListener('click', () => $('#plik').click());
for (const cel of [document.body]) {
  cel.addEventListener('dragover', (e) => { e.preventDefault(); upusc.classList.add('nad'); });
  cel.addEventListener('dragleave', () => upusc.classList.remove('nad'));
  cel.addEventListener('drop', (e) => { e.preventDefault(); upusc.classList.remove('nad'); otworz(e.dataTransfer.files[0]); });
}
$('#b-pomniejsz').addEventListener('click', () => { S.zoom = Math.max(0.5, S.zoom / 1.2); rysujStrony(); });
$('#b-powieksz').addEventListener('click', () => { S.zoom = Math.min(3, S.zoom * 1.2); rysujStrony(); });
$('#b-cofnij').addEventListener('click', cofnij);
$('#b-podglad').addEventListener('click', () => {
  S.podglad = !S.podglad;
  $('#strony').classList.toggle('podglad', S.podglad);
  $('#b-podglad').classList.toggle('nk-on', S.podglad);
  $('#b-podglad').textContent = S.podglad ? 'Wróć do edycji' : 'Podgląd efektu';
});
$('#b-motyw').addEventListener('click', () => {
  const h = document.documentElement;
  h.dataset.motyw = h.dataset.motyw === 'ciemny' ? 'jasny' : 'ciemny';
});
$('#b-frazy').addEventListener('click', () => {
  zapamietaj();
  wykrywaj();
  const n = S.ramki.filter((r) => r.kategoria === 'fraza').length;
  status(n ? `Twoje frazy: zakryto ${n} miejsc.` : 'Twoich fraz nie znaleziono w tekście (na zdjęciach OCR mógł je odczytać inaczej — zakryj ręcznie).');
});
$('#b-pdf').addEventListener('click', zapiszPdf);
$('#b-txt').addEventListener('click', () => pobierz(new Blob([tekst()], { type: 'text/plain;charset=utf-8' }), `wynik-zanonimizowany-${dzis()}.txt`));
$('#b-kopiuj').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(tekst()); status('Skopiowano tekst do schowka — wklej go do sprawy konsylium.'); }
  catch { status('Przeglądarka nie pozwoliła skopiować — użyj „Zapisz tekst”.', true); }
});
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && document.activeElement?.tagName !== 'TEXTAREA') { e.preventDefault(); cofnij(); }
});
let tRozmiar;
window.addEventListener('resize', () => { clearTimeout(tRozmiar); tRozmiar = setTimeout(() => S.strony.length && rysujStrony(), 250); });

// motyw z powłoki Windows (MS Konsylium · Narzędzia): postMessage({ typ: 'ms-motyw', motyw })
window.addEventListener('message', (e) => {
  const d = e.data;
  if (d && d.typ === 'ms-motyw' && (d.motyw === 'ciemny' || d.motyw === 'jasny')) document.documentElement.dataset.motyw = d.motyw;
});

// dla testów automatycznych
window.__anonimizator = { S, aktywne, tekst, wykrywaj };
