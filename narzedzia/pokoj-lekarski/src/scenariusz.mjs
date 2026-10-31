// Pokój lekarski — parser sprawy Konsylium na „scenariusz” do odtworzenia w pokoju.
// Wejście: obiekt { "ścieżka/względna/w/sprawie": "treść pliku" } (np. "03-opinie/bayes.json").
// Wyjście: { sprawa, tryb, sceny: [{ id, tytul, temat, czas, wypowiedzi: [{ kto, skrot, pelny, plik }] }], tablica }
// Działa w Node (testy, build) i w przeglądarce (wczytanie folderu sprawy), bez zależności i bez sieci.
//
// Dwa źródła dymków:
//  1. Zdarzenia "wypowiedz" w _log.jsonl (proponowany format na żywo, patrz README) — mają pierwszeństwo.
//  2. Gdy ich brak: skróty wyliczane z plików 01–10 (heurystyki poniżej).

export const ROLE = {
  ordynator:            { nazwa: 'Ordynator', grupa: 'ordynator', inicjaly: 'O' },
  z_zlozonosc:          { nazwa: 'Zastępca · złożoność', grupa: 'zastepca', inicjaly: 'ZZ' },
  z_bezpieczenstwo:     { nazwa: 'Zastępca · bezpieczeństwo', grupa: 'zastepca', inicjaly: 'ZB' },
  z_niepewnosc:         { nazwa: 'Zastępca · niepewność', grupa: 'zastepca', inicjaly: 'ZN' },
  hipotezujacy:         { nazwa: 'Hipotezujący', grupa: 'lekarz', inicjaly: 'H' },
  bayes:                { nazwa: 'Bayesowski', grupa: 'lekarz', inicjaly: 'B' },
  najgorszy_scenariusz: { nazwa: 'Najgorszy scenariusz', grupa: 'lekarz', inicjaly: 'NS' },
  poz_pragmatyk:        { nazwa: 'Pragmatyk POZ', grupa: 'lekarz', inicjaly: 'P' },
  farmakolog:           { nazwa: 'Farmakolog', grupa: 'lekarz', inicjaly: 'F' },
  gospodarz_kosztow:    { nazwa: 'Gospodarz kosztów', grupa: 'lekarz', inicjaly: 'GK' },
  s_fakty:              { nazwa: 'Sprawdzający faktów', grupa: 'sprawdzajacy', inicjaly: 'SF' },
  s_proces:             { nazwa: 'Sprawdzający procesu', grupa: 'sprawdzajacy', inicjaly: 'SP' },
  R1: { nazwa: 'Rezydent R1', grupa: 'rezydent', inicjaly: 'R1' },
  R2: { nazwa: 'Rezydent R2', grupa: 'rezydent', inicjaly: 'R2' },
  R3: { nazwa: 'Rezydent R3', grupa: 'rezydent', inicjaly: 'R3' },
};

const LEKARZE = ['hipotezujacy', 'bayes', 'najgorszy_scenariusz', 'poz_pragmatyk', 'farmakolog', 'gospodarz_kosztow'];

// różne zapisy tej samej roli w plikach sprawy → identyfikator
export function rola(nazwa) {
  if (!nazwa) return null;
  const n = String(nazwa).trim().toLowerCase()
    .replace(/^lekarz[-_ ]/, '').replace(/[-\s]+/g, '_')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l');
  if (/^r\d$/.test(n)) return n.toUpperCase();
  if (n.startsWith('rezydent')) { const m = n.match(/\d/); return m ? 'R' + m[0] : 'R1'; }
  const mapa = {
    zastepca_zlozonosc: 'z_zlozonosc', zlozonosc: 'z_zlozonosc',
    zastepca_bezpieczenstwo: 'z_bezpieczenstwo', bezpieczenstwo: 'z_bezpieczenstwo',
    zastepca_niepewnosc: 'z_niepewnosc', niepewnosc: 'z_niepewnosc',
    sprawdzajacy_faktow: 's_fakty', fakty: 's_fakty', sprawdzajacy_procesu: 's_proces', proces: 's_proces',
    poz: 'poz_pragmatyk', pragmatyk: 'poz_pragmatyk', najgorszy: 'najgorszy_scenariusz', koszty: 'gospodarz_kosztow',
  };
  return ROLE[n] ? n : (mapa[n] || null);
}

// --- pomocnicze -----------------------------------------------------------

const P = (x) => (typeof x === 'number' ? x.toFixed(2).replace('.', ',') : x);

export function bezMarkdown(t) {
  return String(t || '')
    .replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1').replace(/^\s*[-*]\s+/gm, '').replace(/^#+\s*/gm, '')
    .replace(/\s+/g, ' ').trim();
}

// skraca do pełnych słów, z wielokropkiem
export function utnij(t, max = 150) {
  t = bezMarkdown(t);
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  return cut.slice(0, sp > max * 0.6 ? sp : cut.length).replace(/[,;:.\s—-]+$/, '') + '…';
}

const SKROTY = /(?:^|[\s(])(?:np|m\.in|tj|ok|wsp|dr|prof|godz|min|ul|tzw|itd|itp|por|ryc|tab|wg|r|ok|mg|ml|[A-ZŁŚŻŹĆŃÓa-ząęłńóśźż])\.$/;
export function pierwszeZdanie(t) {
  t = bezMarkdown(t);
  const re = /[.!?](?=\s|$)/g;
  let m;
  while ((m = re.exec(t))) {
    const przed = t.slice(0, m.index + 1);
    if (SKROTY.test(przed)) continue;
    return przed;
  }
  return t;
}
const wielka = (t) => (t ? t[0].toUpperCase() + t.slice(1) : t);

function json(pliki, sciezka) {
  const t = pliki[sciezka];
  if (!t) return null;
  try { return JSON.parse(t); } catch { return null; }
}

function log(pliki) {
  const t = pliki['_log.jsonl'];
  if (!t) return [];
  return t.split(/\r?\n/).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

// pole „ETYKIETA: treść” z plików 05/09 (format FINAL)
export function pole(md, etykieta) {
  if (!md) return '';
  const re = new RegExp('^' + etykieta + '\\s*:\\s*(.*)$', 'mi');
  const m = md.match(re);
  return m ? m[1].trim() : '';
}

// sekcje markdown na danym poziomie: [{ tytul, tresc }]
export function sekcje(md, poziom) {
  const znacznik = '#'.repeat(poziom) + ' ';
  const out = [];
  let biez = null;
  for (const linia of String(md || '').split(/\r?\n/)) {
    if (linia.startsWith(znacznik)) { biez = { tytul: linia.slice(znacznik.length).trim(), tresc: '' }; out.push(biez); continue; }
    if (biez && poziom > 1 && /^#{1,}\s/.test(linia) && !linia.startsWith('#'.repeat(poziom + 1))) { biez = null; continue; }
    if (biez) biez.tresc += linia + '\n';
  }
  return out;
}

// dymek lekarza z rundy: „Decyzja / Zmiany / Top-2” → pierwsze zdanie, inaczej „Co mnie przekonuje”
// linia „SKRÓT: …” napisana przez samego agenta (docs/DYMKI.md) ma pierwszeństwo przed heurystyką
export function skrotAgenta(tresc) {
  const m = String(tresc || '').match(/^\s*\**SKRÓT\**\s*:\s*\**\s*(.+)$/im);
  return m ? utnij(m[1]) : null;
}

export function skrotRundy(tresc) {
  const wlasny = skrotAgenta(tresc);
  if (wlasny) return wlasny;
  const czysty = String(tresc || '');
  const etykiety = [/\*\*(Decyzja|Zmiany?|Zmiana top-2[^*]*|Top-2[^*]*)[:：]?\*\*:?\s*([^\n]+)/i,
                    /\*\*(Co mnie przekonuje|Przekonuje mnie)[^*]*\*\*:?\s*([^\n]+)/i];
  for (const re of etykiety) {
    const m = czysty.match(re);
    if (m && m[2].trim()) {
      let z = wielka(pierwszeZdanie(m[2]));
      if (z.length < 40 && re === etykiety[0]) {
        const pk = czysty.match(etykiety[1]);
        if (pk) z += ' ' + wielka(pierwszeZdanie(pk[2]));
      }
      return utnij(z);
    }
  }
  return utnij(wielka(pierwszeZdanie(czysty)));
}

const wyp = (kto, skrot, pelny, plik) => ({ kto, skrot: utnij(wielka(bezMarkdown(skrot))), pelny: bezMarkdown(pelny || skrot), plik: plik || null });

// --- format na żywo: zdarzenia "wypowiedz" w _log.jsonl (docs/DYMKI.md) ------

// kanoniczne fazy: nazwa z dymka → identyfikator sceny i kolejność
export const FAZY = [
  ['wywiad', /^wywiad/i, 'Wywiad'], ['triage', /^triage/i, 'Triage'], ['slepa', /^[śs]lepa/i, 'Ślepa tura'],
  ['agregat', /^agregac/i, 'Agregacja'], ['runda', /runda\s*(\d+)/i, 'Konsylium · runda'], ['projekt', /^projekt/i, 'Projekt'],
  ['rezydenci', /^rezydenc/i, 'Rezydenci'], ['sprawdzenie', /^sprawdz/i, 'Sprawdzenie'], ['odpowiedz', /^odpowied/i, 'Odpowiedź rezydentom'],
  ['final', /^(werdykt|final)/i, 'Werdykt'], ['followup', /^follow/i, 'Follow-up'],
];
export function fazaNaId(faza) {
  const f = String(faza || '').trim();
  for (const [id, re, tytul] of FAZY) {
    const m = f.match(re);
    if (m) return id === 'runda' ? { id: 'runda' + m[1], tytul: `${tytul} ${m[1]}`, rz: FAZY.findIndex((x) => x[0] === 'runda') + m[1] / 100 }
                                 : { id, tytul, rz: FAZY.findIndex((x) => x[0] === id) };
  }
  if (/konsylium|dyskusj/i.test(f)) return { id: 'runda1', tytul: 'Konsylium · runda 1', rz: 4.01 };
  return { id: 'inne-' + f.toLowerCase().replace(/[^a-z0-9ąćęłńóśźż]+/g, '-'), tytul: f || 'Konsylium', rz: 99 };
}

function zLogu(zdarzenia) {
  const mapa = new Map();
  for (const z of zdarzenia) {
    if (z.zdarzenie !== 'wypowiedz' || !z.skrot) continue;
    const f = fazaNaId(z.faza);
    let s = mapa.get(f.id);
    if (!s) { s = { id: f.id, tytul: f.tytul, temat: null, czas: z.ts || null, rz: f.rz, wypowiedzi: [] }; mapa.set(f.id, s); }
    if (z.temat) s.temat = utnij(z.temat, 160);
    const w = wyp(rola(z.rola || z.agent) || 'ordynator', z.skrot, z.pelny || z.tresc || z.skrot, z.plik);
    if (z.persona) w.persona = z.persona;
    // pełniejsza wypowiedź do dymku (2–4 zdania językiem medycznym) i linia z liczbami/skalami
    if (z.tresc) w.tresc = bezMarkdown(String(z.tresc)).replace(/\s+/g, ' ').trim().slice(0, 700);
    if (z.info) w.info = bezMarkdown(String(z.info)).replace(/\s+/g, ' ').trim().slice(0, 240);
    s.wypowiedzi.push(w);
  }
  return [...mapa.values()];
}

// łączy sceny z dymków (pierwszeństwo) ze scenami wyliczonymi z plików
function polacz(zywe, zPlikow) {
  const wynik = zPlikow.map((s) => ({ ...s, rz: fazaNaId(s.tytul).rz }));
  for (const z of zywe) {
    const k = wynik.findIndex((s) => s.id === z.id);
    if (k >= 0) wynik[k] = { ...wynik[k], ...z, temat: z.temat || wynik[k].temat, czas: z.czas || wynik[k].czas };
    else wynik.push({ ...z, temat: z.temat || z.tytul });
  }
  return wynik.sort((a, b) => a.rz - b.rz).map(({ rz, ...s }) => s);
}

// --- format z plików sprawy -----------------------------------------------

function czasZdarzenia(zdarzenia, ...nazwy) {
  const z = zdarzenia.find((e) => nazwy.some((n) => String(e.zdarzenie || '').startsWith(n)));
  return z ? z.ts : null;
}

export function zbudujScenariusz(pliki, nazwaSprawy = '') {
  const zdarzenia = log(pliki);
  const zywe = zLogu(zdarzenia);
  const triage = json(pliki, '02-triage.json');
  const agregat = json(pliki, '03-opinie/_agregat-synonimy.json') || json(pliki, '03-opinie/_agregat.json');
  const tablica = {
    tryb: triage?.tryb || null,
    ranking: (agregat?.ranking || []).slice(0, 5).map((r) => ({ nazwa: r.rozpoznanie, p: r.p })),
    zgoda: agregat?.zgoda ?? null,
    pilnosc: agregat?.pilnosc?.wynik ?? null,
    pewnosc: null,
    werdykt: null,
    followup: null,
  };
  const final = pliki['09-FINAL.md'];
  if (final) {
    tablica.werdykt = pole(final, 'REKOMENDACJA');
    const pp = pole(final, 'PILNOŚĆ');
    const mp = pp.match(/^(\d)/); if (mp) tablica.pilnosc = +mp[1];
    const mw = pp.match(/PEWNOŚĆ:\s*(\S+)/i); if (mw) tablica.pewnosc = mw[1];
  }
  const fu = pliki['10-followup.md'];
  if (fu) {
    const m = fu.match(/rozpoznanie_potwierdzone:\s*(.+)/); const d = fu.match(/czy_decyzja_byla_wlasciwa:\s*(.+)/);
    tablica.followup = { rozpoznanie: m ? m[1].trim() : null, decyzja: d ? d[1].trim() : null };
  }

  const sceny = [];
  const lider = tablica.ranking[0];
  const liderTxt = lider ? `„${lider.nazwa}” (p ${P(lider.p)})` : 'wiodąca hipoteza';

  // 1. wywiad
  const wywiad = pliki['01-wywiad.md'];
  if (wywiad) {
    const tury = (wywiad.match(/^###\s*Tura/gim) || []).length || 1;
    const niezn = (wywiad.split(/##\s*NIEZNANE/i)[1] || '').split('\n').filter((l) => /^\s*-\s/.test(l));
    sceny.push({
      id: 'wywiad', tytul: 'Wywiad', czas: czasZdarzenia(zdarzenia, 'wywiad', 'start'),
      temat: 'Ordynator zbiera wywiad: co wiemy o pacjencie, a czego wciąż nie wiemy.',
      wypowiedzi: [wyp('ordynator',
        `Wywiad zamknięty po ${tury} ${tury === 1 ? 'turze' : 'turach'}. Zostaje ${niezn.length} rzeczy NIEZNANYCH, m.in. ${bezMarkdown(niezn[0] || '').replace(/^-\s*/, '') || 'brak'}.`,
        niezn.join('\n') || wywiad, '01-wywiad.md')],
    });
  }

  // 2. triage
  if (triage?.zastepcy) {
    const w = triage.zastepcy.map((z) => {
      const kto = rola('zastepca_' + z.zastepca) || 'z_zlozonosc';
      const dec = z.eskaluj ? 'eskaluję do pełnego konsylium' : 'bez eskalacji';
      let s = `Wynik ${z.wynik}, ${dec}.`;
      if (z.zastepca === 'bezpieczenstwo') {
        const obecne = (z.flagi || []).filter((f) => f.status === 'OBECNA').length;
        s = `Red flags obecne: ${obecne}. Pilność wstępna ${z.pilnosc_wstepna ?? '?'}, ${dec}.`;
      }
      if (z.zastepca === 'niepewnosc' && 'zgodne' in z) s = `Moja hipoteza ${z.zgodne ? 'zgodna' : 'NIEZGODNA'} z ordynatorem. Wynik ${z.wynik}, ${dec}.`;
      return wyp(kto, s, z.uzasadnienie || s, '02-triage.json');
    });
    w.push(wyp('ordynator', `Tryb ${triage.tryb === 'PELNY' ? 'pełny' : 'szybki'}${triage.liczba_rezydentow ? `, z ${triage.liczba_rezydentow} rezydentami` : ''}.`,
      `Tryb: ${triage.tryb}. Wystarczy jeden zastępca, żeby włączyć pełne konsylium.`, '02-triage.json'));
    sceny.push({ id: 'triage', tytul: 'Triage', czas: czasZdarzenia(zdarzenia, 'triage'),
      temat: 'Trzech zastępców ocenia, czy sprawa wymaga pełnego konsylium.', wypowiedzi: w });
  }

  // 3. ślepa tura
  const slepa = [];
  for (const r of LEKARZE) {
    const o = json(pliki, `03-opinie/${r}.json`);
    if (!o) continue;
    const roz = (o.rozpoznania || []).filter((x) => x.p > 0).sort((a, b) => b.p - a.p);
    let s;
    if (roz.length) s = `Stawiam na „${roz[0].nazwa}” (p ${P(roz[0].p)})${roz[1] ? `, dalej „${roz[1].nazwa}”` : ''}. Pilność ${o.pilnosc}.`;
    else if (o.nastepny_krok) s = `Nie ważę rozpoznań. Pierwszy krok: ${pierwszeZdanie(o.nastepny_krok)}`;
    else s = `Pilność ${o.pilnosc}, pewność ${o.pewnosc}.`;
    const pelny = roz.map((x) => `${x.nazwa}: p ${P(x.p)}`).join('\n') + (o.nastepny_krok ? `\nNastępny krok: ${o.nastepny_krok}` : '');
    slepa.push(wyp(r, s, pelny, `03-opinie/${r}.json`));
  }
  const zLekarza = zdarzenia.find((e) => LEKARZE.includes(rola(e.rola || e.agent)));
  if (slepa.length) sceny.push({ id: 'slepa', tytul: 'Ślepa tura', czas: zLekarza ? zLekarza.ts : null,
    temat: 'Każdy lekarz pisze opinię sam, bez wglądu w opinie innych.', wypowiedzi: slepa });

  // 4. agregacja
  if (agregat) {
    const top = tablica.ranking.slice(0, 3).map((r) => `${r.nazwa} ${P(r.p)}`).join('; ');
    sceny.push({ id: 'agregat', tytul: 'Agregacja', czas: czasZdarzenia(zdarzenia, 'agregacja'),
      temat: 'Ordynator łączy opinie ważoną pulą log-odds.',
      wypowiedzi: [wyp('ordynator', `Ranking: ${top}. Zgoda ${P(tablica.zgoda)}${(agregat.flagi || []).length ? `, flagi: ${agregat.flagi.join(', ')}` : ''}.`,
        tablica.ranking.map((r) => `${r.nazwa}: ${P(r.p)}`).join('\n'), '03-opinie/_agregat.json')] });
  }

  // 5. konsylium (04): uwagi procesowe, sprzeczności, rundy, zamknięcie
  const kons = pliki['04-konsylium.md'];
  if (kons) {
    const glowne = sekcje(kons, 2);
    const sprz = glowne.find((s) => /^Sprzeczno/i.test(s.tytul));
    const uwagi = glowne.find((s) => /^Uwagi procesowe/i.test(s.tytul));
    const pierwszaSprz = sprz ? bezMarkdown(sprz.tresc.split('\n').find((l) => /^\s*-\s/.test(l)) || '') : '';
    for (const sek of glowne) {
      const mr = sek.tytul.match(/^Runda\s+(\d+)/i);
      if (!mr) continue;
      const w = [];
      if (mr[1] === '1' && uwagi) {
        const pkt = uwagi.tresc.split('\n').filter((l) => /^\s*\d+\.\s/.test(l)).map((l) => l.replace(/^\s*\d+\.\s*/, ''));
        const korekta = pkt.find((l) => /korekta/i.test(l)) || pkt[0];
        if (korekta) w.push(wyp('ordynator', pierwszeZdanie(korekta), pkt.join('\n'), '04-konsylium.md'));
      }
      for (const pod of sekcje(sek.tresc, 3)) {
        const kto = rola(pod.tytul);
        if (kto) w.push(wyp(kto, skrotRundy(pod.tresc), pod.tresc, '04-konsylium.md'));
      }
      sceny.push({ id: 'runda' + mr[1], tytul: `Konsylium · runda ${mr[1]}`, czas: czasZdarzenia(zdarzenia, 'konsylium_runda' + mr[1], 'konsylium'),
        temat: pierwszaSprz && mr[1] === '1' ? `Spór: ${utnij(pierwszaSprz, 130)}` : `Czy ${liderTxt} się utrzyma? Co zmieniłoby zdanie lekarzy.`,
        wypowiedzi: w });
    }
    const zamk = glowne.find((s) => /^Zamkni/i.test(s.tytul));
    if (zamk && sceny.length) {
      const pkt = zamk.tresc.split('\n').filter((l) => /^\s*-\s/.test(l));
      sceny[sceny.length - 1].wypowiedzi.push(wyp('ordynator', pierwszeZdanie(pkt[0] || zamk.tresc), zamk.tresc, '04-konsylium.md'));
    }
  }

  // 6. projekt
  const projekt = pliki['05-projekt.md'];
  if (projekt) sceny.push({ id: 'projekt', tytul: 'Projekt', czas: czasZdarzenia(zdarzenia, 'projekt'),
    temat: 'Ordynator pisze projekt jednej rekomendacji.',
    wypowiedzi: [wyp('ordynator', 'Projekt: ' + (pole(projekt, 'REKOMENDACJA') || pierwszeZdanie(projekt)), projekt, '05-projekt.md')] });

  // 7. rezydenci (za szybą: widzą tylko surowe dane i decyzję)
  const rez = Object.keys(pliki).filter((k) => /^06-rezydenci\/R\d\.md$/.test(k)).sort();
  if (rez.length) {
    const w = rez.map((k) => {
      const t = pliki[k];
      const kto = k.match(/R\d/)[0];
      const persona = (t.match(/Persona:\s*([^(\n]+)/i) || [])[1]?.trim();
      const hip = (t.match(/HIPOTEZA NIEWYPOWIEDZIANA:\s*([^\n]+)/i) || [])[1];
      const brak = (t.match(/CZEGO BRAKUJE[^:]*:\s*([^\n]+)/i) || [])[1];
      const s = skrotAgenta(t) || (hip ? `Nikt nie powiedział: ${pierwszeZdanie(hip).replace(/^./, (c) => c.toLowerCase())}` : pierwszeZdanie(brak || t));
      return { ...wyp(kto, s, t, k), persona: persona || null };
    });
    sceny.push({ id: 'rezydenci', tytul: 'Rezydenci', czas: czasZdarzenia(zdarzenia, 'rezydenci', 'pakiet'),
      temat: 'Rezydenci z zewnątrz robią pre-mortem: znają tylko surowe dane i decyzję.', wypowiedzi: w });
  }

  // 8. sprawdzający
  const spr = json(pliki, '07-sprawdzenie.json');
  if (spr) {
    const w = [];
    for (const [klucz, kto] of [['fakty', 's_fakty'], ['proces', 's_proces']]) {
      const x = spr[klucz]; if (!x) continue;
      const kartka = { ZIELONA: 'zielona', ZOLTA: 'żółta', CZERWONA: 'czerwona' }[x.kartka] || x.kartka;
      w.push({ ...wyp(kto, `Kartka ${kartka}. ${pierwszeZdanie((x.uwagi || [])[0] || '')}`, (x.uwagi || []).join('\n'), '07-sprawdzenie.json'), kartka: x.kartka });
    }
    if (w.length) sceny.push({ id: 'sprawdzenie', tytul: 'Sprawdzenie', czas: czasZdarzenia(zdarzenia, 'sprawdzenie'),
      temat: 'Sprawdzający weryfikują fakty i proces. Nie głosują nad rozpoznaniem.', wypowiedzi: w });
  }

  // 9. odpowiedź rezydentom
  const odp = pliki['08-odpowiedz-rezydentom.md'];
  if (odp) {
    const tak = (odp.match(/PRZYJMUJĘ/g) || []).length; const nie = (odp.match(/ODRZUCAM/g) || []).length;
    const zm = sekcje(odp, 2).find((s) => /Zmiana decyzji/i.test(s.tytul));
    sceny.push({ id: 'odpowiedz', tytul: 'Odpowiedź rezydentom', czas: czasZdarzenia(zdarzenia, 'odpowiedz'),
      temat: 'Ordynator odpowiada jawnie na każdą uwagę rezydentów: przyjmuję albo odrzucam.',
      wypowiedzi: [wyp('ordynator', `Przyjmuję ${tak}, odrzucam ${nie}. ${zm ? pierwszeZdanie(zm.tresc) : ''}`, odp, '08-odpowiedz-rezydentom.md')] });
  }

  // 10. werdykt
  if (final) sceny.push({ id: 'final', tytul: 'Werdykt', czas: czasZdarzenia(zdarzenia, 'final'),
    temat: `Jedna rekomendacja. Pilność ${tablica.pilnosc ?? '?'}, pewność ${tablica.pewnosc ?? '?'}.`,
    wypowiedzi: [wyp('ordynator', tablica.werdykt || pierwszeZdanie(final), final, '09-FINAL.md')] });

  // 11. follow-up
  if (tablica.followup) sceny.push({ id: 'followup', tytul: 'Follow-up', czas: czasZdarzenia(zdarzenia, 'followup'),
    temat: 'Lekarz prowadzący wrócił z wynikiem. Kalibracja agentów.',
    wypowiedzi: [wyp('ordynator', `Potwierdzone: ${tablica.followup.rozpoznanie}. Decyzja była właściwa: ${tablica.followup.decyzja}.`, fu, '10-followup.md')] });

  if (!zywe.length) return { sprawa: nazwaSprawy, tryb: tablica.tryb, sceny, tablica, zrodlo: 'pliki' };
  return { sprawa: nazwaSprawy, tryb: tablica.tryb, sceny: polacz(zywe, sceny), tablica, zrodlo: sceny.length ? 'log+pliki' : 'log' };
}
