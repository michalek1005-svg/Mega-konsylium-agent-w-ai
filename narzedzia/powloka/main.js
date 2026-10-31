// Powłoka Windows dla narzędzi Konsylium (wywiad, anonimizator).
// Zasada: działa wyłącznie offline. Każde żądanie sieciowe jest blokowane.
'use strict';
const { app, BrowserWindow, session, ipcMain, dialog, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

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
    title: 'MS Konsylium Narzędzia',
    backgroundColor: '#0F1918',
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
function korzen() {
  const k = process.env.MS_FOLDER_KONSYLIUM || ustawienia().folderKonsylium;
  return k && fs.existsSync(k) ? k : null;
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

function podepnijPliki(okno) {
  const tylkoNasze = (e) => {
    if (e.sender !== okno.webContents || e.senderFrame !== okno.webContents.mainFrame) throw new Error('Odmowa.');
  };
  ipcMain.handle('ms:folder', (e) => { tylkoNasze(e); return korzen(); });
  ipcMain.handle('ms:wybierz-folder', async (e) => {
    tylkoNasze(e);
    const w = await dialog.showOpenDialog(okno, {
      title: 'Wybierz folder Konsylium (kopia repo Konsylium na tym komputerze)',
      defaultPath: korzen() || app.getPath('documents'), properties: ['openDirectory', 'createDirectory']
    });
    if (w.canceled || !w.filePaths[0]) return korzen();
    zapiszUstawienia({ ...ustawienia(), folderKonsylium: w.filePaths[0] });
    return w.filePaths[0];
  });
  ipcMain.handle('ms:czytaj', (e, wzgl) => {
    tylkoNasze(e);
    const abs = wFolderze(wzgl);
    if (!TEKSTOWE.test(abs)) throw new Error('Tylko pliki tekstowe.');
    let st; try { st = fs.statSync(abs); } catch { return null; }
    if (!st.isFile() || st.size > MAX_PLIK) return null;
    return { tekst: fs.readFileSync(abs, 'utf8'), zmiana: st.mtimeMs };
  });
  ipcMain.handle('ms:zapisz', (e, wzgl, tekst) => {
    tylkoNasze(e);
    const abs = wFolderze(wzgl);
    if (!TEKSTOWE.test(abs)) throw new Error('Tylko pliki tekstowe.');
    if (tekst.length > MAX_PLIK) throw new Error('Za duży plik.');
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    // zapis przez plik tymczasowy, żeby Claude nigdy nie przeczytał połowy pliku
    const tmp = abs + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, tekst, 'utf8');
    for (let i = 0; ; i++) {
      try { fs.renameSync(tmp, abs); break; } catch (err) {
        if (i >= 8) { try { fs.unlinkSync(tmp); } catch {} throw err; }
        czekajSync(60); // Windows: plik chwilowo otwarty przez czytającego
      }
    }
    return true;
  });
  ipcMain.handle('ms:lista', (e, wzgl) => {
    tylkoNasze(e);
    const abs = wFolderze(wzgl);
    let wpisy; try { wpisy = fs.readdirSync(abs, { withFileTypes: true }); } catch { return []; }
    return wpisy.filter((d) => !d.name.startsWith('.') && !d.name.endsWith('.tmp')).map((d) => {
      let zmiana = 0; try { zmiana = fs.statSync(path.join(abs, d.name)).mtimeMs; } catch {}
      return { nazwa: d.name, katalog: d.isDirectory(), zmiana };
    });
  });
  ipcMain.handle('ms:czytaj-folder', (e, wzgl) => {
    tylkoNasze(e);
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
  });
  ipcMain.handle('ms:otworz-folder', (e) => { tylkoNasze(e); const k = korzen(); if (k) shell.openPath(k); return !!k; });
}

app.whenReady().then(() => {
  blokujSiec(session.defaultSession);
  // Zapis pliku (np. zanonimizowany PDF): domyślne okno „Zapisz jako”.
  session.defaultSession.on('will-download', (_e, item) => {
    item.setSaveDialogOptions({ title: 'Zapisz plik', defaultPath: path.join(app.getPath('documents'), item.getFilename()) });
  });
  podepnijPliki(utworzOkno());
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) utworzOkno(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
