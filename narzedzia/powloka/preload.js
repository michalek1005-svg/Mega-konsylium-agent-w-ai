// Most między powłoką (app/index.html) a procesem głównym: tylko operacje na plikach
// w jednym folderze wybranym przez lekarza („folder Konsylium”). Moduły w ramkach nie mają
// tego API; proszą o nie powłokę przez postMessage (narzedzia/wspolne/ms-most.js).
'use strict';
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('msPowloka', {
  folder: () => ipcRenderer.invoke('ms:folder'),
  wybierzFolder: () => ipcRenderer.invoke('ms:wybierz-folder'),
  czytaj: (sciezka) => ipcRenderer.invoke('ms:czytaj', String(sciezka)),
  zapisz: (sciezka, tekst) => ipcRenderer.invoke('ms:zapisz', String(sciezka), String(tekst)),
  lista: (sciezka) => ipcRenderer.invoke('ms:lista', String(sciezka || '')),
  czytajFolder: (sciezka) => ipcRenderer.invoke('ms:czytaj-folder', String(sciezka || '')),
  otworzFolder: () => ipcRenderer.invoke('ms:otworz-folder')
});
