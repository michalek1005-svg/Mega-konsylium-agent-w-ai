// Powłoka Windows dla narzędzi Konsylium (wywiad, anonimizator, pokój lekarski).
// Zasada: działa wyłącznie offline. Każde żądanie sieciowe okna jest blokowane. Jedyny wyjątek to
// włączane ręcznie udostępnienie dla iPada w sieci lokalnej (serwer-ipad.js), które niczego nie pobiera.
'use strict';
const { app, BrowserWindow, session, ipcMain, dialog, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const os = require('node:os');
const { utworzSerwer, adresySieci } = require('./serwer-ipad.js');

app.setName('MS Konsylium Narzędzia');
// testy automatyczne: osobny katalog danych aplikacji (localStorage, ustawienia)
if (process.env.MS_DANE_APLIKACJI) app.setPath('userData', process.env.MS_DANE_APLIKACJI);

function blokujSiec(ses) {
  ses.webRequest.onBeforeRequest((szczegoly, odp) => {
    const u = szczegoly.url;
    const lokalne = u.startsWith('file:') || u.startsWith('data:') || u.startsWith('blob:') || u.startsWith('devtools:');
    odp({ cancel: !lokalne });
  });
  // Schowek (kopiowanie wyniku) tak, wszystko inne (kamera, mikrofon, lokalizacja…) nie.
  ses.setPermissionRequestHandler((_wc, uprawnienie, zgoda) => {
    zgoda(uprawnienie === 'clipboard-sanitized-write');
  });
  ses.setPermissionCheckHandler((_wc, uprawnienie) => uprawnienie === 'clipboard-sanitized-write');
}

function utworzOkno() {
  const okno = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    title: 'MS Konsylium',
    icon: path.join(__dirname, 'ikona.png'),
    backgroundColor: '#E6EBEE',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });
  okno.webContents.session.setSpellCheckerLanguages(['pl']);
  // Linki zewnętrzne nie otwierają się w aplikacji
  okno.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  okno.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) e.preventDefault(); });
  okno.loadFile(path.join(__dirname, 'app', 'index.html'));
  return okno;
}

// ── Folder Konsylium (folder wymiany z Claude) ──
// Aplikacja czyta i pisze pliki wyłącznie w jednym folderze wybranym przez lekarza, np. kopii repo
// Konsylium na dysku. Tam Claude (Claude Code na tym komputerze albo dostęp do folderu) czyta
// zanonimizowane odpowiedzi i dopisuje pytania (docs/NA-ZYWO.md). Ścieżki spoza folderu są odrzucane.
const plikUstawien = () => path.join(app.getPath('userData'), 'ustawienia.json');
function ustawienia() { try { return JSON.parse(fs.readFileSync(plikUstawien(), 'utf8')); } catch { return {}; } }
function zapiszUstawienia(u) { fs.mkdirSync(path.dirname(plikUstawien()), { recursive: true }); fs.writeFileSync(plikUstawien(), JSON.stringify(u, null, 2)); }
// Folder główny Konsylium rozpoznajemy po CLAUDE.md albo skrypty/. Gdy lekarz wskaże podfolder (np. „sprawy”),
// aplikacja wraca w górę do folderu głównego (1.11.2026: wywiad 2HK-Z5J trafił do sprawy\wywiad-na-zywo).
function folderGlowny(k) {
  const jestGlowny = (d) => fs.existsSync(path.join(d, 'CLAUDE.md')) || fs.existsSync(path.join(d, 'skrypty'));
  let d = path.resolve(k);
  for (let n = 0; n < 4; n++) {
    if (jestGlowny(d)) return d;
    const w = path.dirname(d);
    if (w === d) break;
    d = w;
  }
  return k;
}
function korzen() {
  const k = process.env.MS_FOLDER_KONSYLIUM || ustawienia().folderKonsylium;
  return k && fs.existsSync(k) ? folderGlowny(k) : null;
}
function wFolderze(wzgl) {
  const k = korzen();
  if (!k) throw new Error('Nie wybrano folderu Konsylium.');
  if (typeof wzgl !== 'string' || wzgl.length > 400 || wzgl.includes('\0')) throw new Error('Zła ścieżka.');
  const abs = path.resolve(k, wzgl);
  const rel = path.relative(k, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) throw new Error('Ścieżka poza folderem Konsylium.');
  return abs;
}
const TEKSTOWE = /\.(md|json|jsonl|txt)$/i;
const MAX_PLIK = 4 * 1024 * 1024;
function czekajSync(ms) { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }

// Operacje na plikach folderu Konsylium: te same dla okna Windows (IPC) i dla iPada (serwer-ipad.js)
const PLIKI = {
  folder: () => korzen(),
  czytaj(wzgl) {
    const abs = wFolderze(wzgl);
    if (!TEKSTOWE.test(abs)) throw new Error('Tylko pliki tekstowe.');
    let st; try { st = fs.statSync(abs); } catch { return null; }
    if (!st.isFile() || st.size > MAX_PLIK) return null;
    return { tekst: fs.readFileSync(abs, 'utf8'), zmiana: st.mtimeMs };
  },
  zapisz(wzgl, tekst) {
    const abs = wFolderze(wzgl);
    if (!TEKSTOWE.test(abs)) throw new Error('Tylko pliki tekstowe.');
    if (tekst.length > MAX_PLIK) throw new Error('Za duży plik.');
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    // zapis przez plik tymczasowy, żeby Claude nigdy nie przeczytał połowy pliku
    const tmp = abs + '.' + process.pid + '.' + crypto.randomBytes(3).toString('hex') + '.tmp';
    fs.writeFileSync(tmp, tekst, 'utf8');
    for (let i = 0; ; i++) {
      try { fs.renameSync(tmp, abs); break; } catch (err) {
        if (i >= 8) { try { fs.unlinkSync(tmp); } catch {} throw err; }
        czekajSync(60); // Windows: plik chwilowo otwarty przez czytającego
      }
    }
    return true;
  },
  lista(wzgl) {
    const abs = wFolderze(wzgl);
    let wpisy; try { wpisy = fs.readdirSync(abs, { withFileTypes: true }); } catch { return []; }
    return wpisy.filter((d) => !d.name.startsWith('.') && !d.name.endsWith('.tmp')).map((d) => {
      let zmiana = 0; try { zmiana = fs.statSync(path.join(abs, d.name)).mtimeMs; } catch {}
      return { nazwa: d.name, katalog: d.isDirectory(), zmiana };
    });
  },
  czytajFolder(wzgl) {
    const abs = wFolderze(wzgl), out = [];
    (function idz(kat, pref, glab) {
      if (glab > 4 || out.length > 400) return;
      let wpisy; try { wpisy = fs.readdirSync(kat, { withFileTypes: true }); } catch { return; }
      for (const d of wpisy) {
        if (d.name.startsWith('.')) continue;
        const p = path.join(kat, d.name);
        if (d.isDirectory()) idz(p, pref + d.name + '/', glab + 1);
        else if (TEKSTOWE.test(d.name)) {
          try { const st = fs.statSync(p); if (st.size <= MAX_PLIK) out.push({ sciezka: pref + d.name, tekst: fs.readFileSync(p, 'utf8') }); } catch {}
        }
      }
    })(abs, '', 0);
    return out;
  }
};

// ── iPad: udostępnienie w sieci lokalnej (domyślnie wyłączone) ──
const IPAD_PORT = Number(process.env.MS_IPAD_PORT) || 8765;
let ipad = { serwer: null, blad: null, polaczone: [] };
function kluczIpad(nowy) {
  const u = ustawienia();
  if (nowy || !u.ipadKlucz) { u.ipadKlucz = crypto.randomBytes(18).toString('base64url'); zapiszUstawienia(u); }
  return u.ipadKlucz;
}
function qrSvg(tekst) {
  let qrcode; try { qrcode = require('./qrcode.js'); } catch { qrcode = require('qrcode-generator'); }
  const q = qrcode(0, 'M'); q.addData(tekst); q.make();
  return q.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
}
function stanIpad() {
  // MS_IPAD_ADRES: testy w kontenerze bez sieci domowej
  const adresy = process.env.MS_IPAD_ADRES ? [{ adres: process.env.MS_IPAD_ADRES, nazwa: 'test', wirtualna: false }] : adresySieci();
  const klucz = ustawienia().ipadKlucz || '';
  const url = (a) => 'http://' + a + ':' + IPAD_PORT + '/?k=' + klucz;
  // Stały adres (Michał 1.11, PWA na ekranie iPada): nazwa komputera w sieci lokalnej (mDNS, „nazwa.local”) nie zmienia się,
  // gdy router przydzieli inny adres IP; Windows 10/11 i iPadOS rozumieją .local bez instalowania czegokolwiek.
  const host = process.env.MS_IPAD_ADRES ? null : String(os.hostname() || '').toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/^-+|-+$/g, '');
  const staly = host && adresy.length ? host + '.local' : null;
  const s = { wlaczony: !!ipad.serwer, blad: ipad.blad, port: IPAD_PORT, polaczone: ipad.polaczone.slice(-5), aktywne: ipad.serwer && ipad.serwer.polaczeni ? ipad.serwer.polaczeni() : [], adresy: adresy.map((x) => ({ ...x, url: url(x.adres) })) };
  if (s.wlaczony && adresy[0]) {
    s.url = url(adresy[0].adres);
    if (staly) s.urlStaly = url(staly);
    s.qr = 'data:image/svg+xml;base64,' + Buffer.from(qrSvg(s.urlStaly || s.url)).toString('base64');
  }
  return s;
}
function wlaczIpad(okno) {
  if (ipad.serwer) return Promise.resolve(stanIpad());
  kluczIpad(false);
  ipad.blad = null;
  const serwer = utworzSerwer({
    katalogApp: path.join(__dirname, 'app'), ikona: path.join(__dirname, 'ikona.png'), pliki: PLIKI,
    klucz: () => ustawienia().ipadKlucz,
    naZdarzenie: (z) => {
      if (z.typ === 'polaczenie' && !ipad.polaczone.some((x) => x.adres === z.adres)) ipad.polaczone.push({ adres: z.adres, czas: Date.now() });
      if (okno && !okno.isDestroyed()) okno.webContents.send('ms:ipad-zmiana');
    }
  });
  return new Promise((ok) => {
    serwer.once('error', (err) => {
      ipad.serwer = null;
      ipad.blad = err.code === 'EADDRINUSE' ? 'Port ' + IPAD_PORT + ' jest zajęty przez inny program.' : 'Nie udało się włączyć: ' + err.message;
      ok(stanIpad());
    });
    serwer.listen(IPAD_PORT, '0.0.0.0', () => { ipad.serwer = serwer; ok(stanIpad()); });
  });
}
function wylaczIpad() {
  if (ipad.serwer) { ipad.serwer.close(); ipad.serwer.closeAllConnections && ipad.serwer.closeAllConnections(); }
  ipad.serwer = null; ipad.polaczone = [];
  return stanIpad();
}

function podepnijPliki(okno) {
  const tylkoNasze = (e) => {
    if (e.sender !== okno.webContents || e.senderFrame !== okno.webContents.mainFrame) throw new Error('Odmowa.');
  };
  ipcMain.handle('ms:folder', (e) => { tylkoNasze(e); return PLIKI.folder(); });
  ipcMain.handle('ms:wybierz-folder', async (e) => {
    tylkoNasze(e);
    const w = await dialog.showOpenDialog(okno, {
      title: 'Wybierz folder Konsylium (kopia repo Konsylium na tym komputerze)',
      defaultPath: korzen() || app.getPath('documents'), properties: ['openDirectory', 'createDirectory']
    });
    if (w.canceled || !w.filePaths[0]) return korzen();
    const g = folderGlowny(w.filePaths[0]);
    zapiszUstawienia({ ...ustawienia(), folderKonsylium: g });
    return g;
  });
  ipcMain.handle('ms:czytaj', (e, wzgl) => { tylkoNasze(e); return PLIKI.czytaj(wzgl); });
  ipcMain.handle('ms:zapisz', (e, wzgl, tekst) => { tylkoNasze(e); return PLIKI.zapisz(wzgl, tekst); });
  ipcMain.handle('ms:lista', (e, wzgl) => { tylkoNasze(e); return PLIKI.lista(wzgl); });
  ipcMain.handle('ms:czytaj-folder', (e, wzgl) => { tylkoNasze(e); return PLIKI.czytajFolder(wzgl); });
  ipcMain.handle('ms:otworz-folder', (e) => { tylkoNasze(e); const k = korzen(); if (k) shell.openPath(k); return !!k; });
  // iPad (sieć lokalna): stan, włącz/wyłącz, nowy kod parowania (stare iPady tracą dostęp)
  ipcMain.handle('ms:ipad-stan', (e) => { tylkoNasze(e); return stanIpad(); });
  ipcMain.handle('ms:ipad-ustaw', async (e, wl) => {
    tylkoNasze(e);
    zapiszUstawienia({ ...ustawienia(), ipad: !!wl });
    return wl ? wlaczIpad(okno) : wylaczIpad();
  });
  ipcMain.handle('ms:ipad-nowy-kod', (e) => { tylkoNasze(e); kluczIpad(true); ipad.polaczone = []; return stanIpad(); });
}

app.whenReady().then(() => {
  blokujSiec(session.defaultSession);
  // Zapis pliku (np. zanonimizowany PDF): domyślne okno „Zapisz jako”.
  session.defaultSession.on('will-download', (_e, item) => {
    item.setSaveDialogOptions({ title: 'Zapisz plik', defaultPath: path.join(app.getPath('documents'), item.getFilename()) });
  });
  const okno = utworzOkno();
  podepnijPliki(okno);
  if (ustawienia().ipad || process.env.MS_IPAD === '1') wlaczIpad(okno);
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) utworzOkno(); });
});

app.on('window-all-closed', () => { wylaczIpad(); if (process.platform !== 'darwin') app.quit(); });
