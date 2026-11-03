// The tools' headless Chrome. CHROME overrides where the browser is; DEV_URL where the dev server
// runs (npm run dev serves http://localhost:5173 unless that port is taken).
import puppeteer from 'puppeteer-core';

export const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
export const DEV_URL = (process.env.DEV_URL ?? 'http://localhost:5173').replace(/\/$/, '');

// opens a page of the running dev server (e.g. 'drawings.html') at 1280×900, fonts loaded
export async function openDevPage(page) {
  const url = `${DEV_URL}/${page}`;
  try {
    await fetch(url);
  } catch {
    throw new Error(`no dev server at ${DEV_URL}: start it with npm run dev (or point DEV_URL at it)`);
  }
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
  const tab = await browser.newPage();
  await tab.setViewport({ width: 1280, height: 900 });
  await tab.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await tab.evaluate(() => document.fonts.ready);
  return { browser, tab };
}
