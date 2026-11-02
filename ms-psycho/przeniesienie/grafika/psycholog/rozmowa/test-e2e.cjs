// Test okna Rozmowy (Playwright): node test-e2e.cjs [ścieżka do ROZMOWA-podglad.html] [katalog na zrzuty]
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const plik = path.resolve(process.argv[2] || path.join(__dirname, 'ROZMOWA-podglad.html'));
const zrzuty = process.argv[3];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 820 } });
  const siec = [], bledy = [];
  p.on('request', (r) => { if (!/^(file|data|about):/.test(r.url())) siec.push(r.url()); });
  p.on('pageerror', (e) => bledy.push(e.message));
  await p.goto('file://' + plik); await p.waitForTimeout(500);
  assert.equal(await p.locator('.rz-wiersz.terapeuta:not(.rz-pisze)').count(), 2, 'dwie odpowiedzi terapeutki');
  assert.equal(await p.locator('.rz-wiersz.ja').count(), 2);
  assert.ok(await p.locator('.rz-pracuje').isVisible(), 'pasek „zespół pracuje”');
  assert.match(await p.locator('.rz-pracuje').innerText(), /Zespół pracuje: 5/);
  assert.equal(await p.locator('.rz-pisze').count(), 1, 'dymek „pisze…”');
  assert.equal(await p.locator('.rz-kulisy').count(), 1);
  assert.equal(await p.locator('.rz-kulisy li').first().isVisible(), false, 'kulisy domyślnie zwinięte');
  if (zrzuty) await p.screenshot({ path: path.join(zrzuty, 'rozmowa-jasny.png') });
  // XSS: tekst użytkownika nie jest HTML-em
  await p.locator('.rz-pole textarea').fill('<img src=x onerror="window.zle=1"> test');
  await p.keyboard.press('Enter');
  assert.equal(await p.evaluate(() => window.zle), undefined);
  assert.match(await p.locator('.rz-wiersz.ja').last().innerText(), /<img src=x/);
  // emotikon z paska i reakcja
  await p.locator('.rz-emo-pasek button').first().click();
  assert.equal(await p.locator('.rz-pole textarea').inputValue(), '😊');
  await p.locator('.rz-wiersz.terapeuta .rz-msg').first().hover();
  await p.locator('.rz-wiersz.terapeuta .rz-reaguj button').first().click();
  assert.match(await p.locator('.rz-wiersz.terapeuta .rz-reakcje').first().innerText(), /👍/);
  await p.waitForTimeout(2900);
  assert.equal(await p.locator('.rz-pisze').count(), 0, 'po odpowiedzi „pisze…” znika');
  // kulisy rozwijane
  await p.locator('.rz-kulisy summary').click();
  assert.ok(await p.locator('.rz-kulisy li').first().isVisible());
  // kryzys: 3 = numery, 4 = blokada pisania
  await p.evaluate(() => rz.kryzys(3));
  assert.match(await p.locator('.rz-kryzys').innerText(), /800 70 2222[\s\S]*116 123/);
  assert.equal(await p.locator('.rz-pole textarea').isDisabled(), false);
  await p.evaluate(() => rz.kryzys(4));
  assert.equal(await p.locator('.rz-pole textarea').isDisabled(), true, 'poziom 4 wstrzymuje rozmowę');
  await p.evaluate(() => { rz.kryzys(0); document.documentElement.dataset.motyw = 'ciemny'; rz.pisze(true, ['Terapeutka CBT', 'Strażnik ryzyka']); });
  await p.waitForTimeout(300);
  if (zrzuty) await p.screenshot({ path: path.join(zrzuty, 'rozmowa-ciemny.png') });
  await p.setViewportSize({ width: 820, height: 1180 }); await p.evaluate(() => rz.kryzys(3)); await p.waitForTimeout(200);
  if (zrzuty) await p.screenshot({ path: path.join(zrzuty, 'rozmowa-ipad-kryzys.png') });
  assert.deepEqual(siec, [], 'zero żądań sieciowych'); assert.deepEqual(bledy, []);
  await b.close(); console.log('rozmowa e2e OK');
})().catch((e) => { console.error(e); process.exit(1); });
