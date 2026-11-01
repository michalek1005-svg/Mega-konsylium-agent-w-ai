// Renderuje szkic plakatu (PLAKAT_SZKIC z src/plakat.js) do PNG 800×1000, wejście dla maluj-plakat.py.
// Użycie: node zasoby/renderuj-szkic.cjs POKOJ-LEKARSKI-<wersja>.html szkic.png   (wymaga Playwright)
const { chromium } = require('playwright');
(async () => {
  const [html, wyj] = process.argv.slice(2);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 900, height: 1100 } });
  await p.goto('file://' + require('path').resolve(html)); await p.waitForTimeout(500);
  await p.evaluate(() => {
    const d = document.createElement('div'); d.id = 'r'; d.style.cssText = 'position:fixed;left:0;top:0;z-index:99;background:#fff';
    // eslint-disable-next-line no-undef
    d.innerHTML = `<svg width="800" height="1000" viewBox="0 0 200 250">${PLAKAT_SZKIC}<use href="#pl-szkic"/></svg>`;
    document.body.appendChild(d);
  });
  await p.waitForTimeout(300);
  await (await p.$('#r svg')).screenshot({ path: wyj });
  await b.close();
})();
