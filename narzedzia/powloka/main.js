// Powłoka Windows dla narzędzi Konsylium (wywiad, anonimizator).
// Zasada: działa wyłącznie offline. Każde żądanie sieciowe jest blokowane.
'use strict';
const { app, BrowserWindow, session } = require('electron');
const path = require('node:path');

app.setName('MS Konsylium Narzędzia');

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
      spellcheck: true
    }
  });
  okno.webContents.session.setSpellCheckerLanguages(['pl']);
  // Linki zewnętrzne nie otwierają się w aplikacji
  okno.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  okno.webContents.on('will-navigate', (e, url) => { if (!url.startsWith('file:')) e.preventDefault(); });
  okno.loadFile(path.join(__dirname, 'app', 'index.html'));
}

app.whenReady().then(() => {
  blokujSiec(session.defaultSession);
  // Zapis pliku (np. zanonimizowany PDF): domyślne okno „Zapisz jako”.
  session.defaultSession.on('will-download', (_e, item) => {
    item.setSaveDialogOptions({ title: 'Zapisz plik', defaultPath: path.join(app.getPath('documents'), item.getFilename()) });
  });
  utworzOkno();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) utworzOkno(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
