// gen-pdf.js
import { readFile } from 'fs/promises';
import path from 'path';
import * as theme from 'jsonresume-theme-straightforward';
import puppeteer from 'puppeteer';
import { render } from 'resumed';

(async () => {
  // 1) Render your resume to HTML
  const resume = JSON.parse(await readFile('resume.json', 'utf-8'));
  const html = await render(resume, theme);


  // 3) Launch headless Chrome
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',   // use your distro’s path
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // 4) Load the HTML and wait for assets
  await page.setContent(html, { waitUntil: 'networkidle0' });


  await page.emulateMediaType('screen');

  // 2) Match your intended page dimensions (so responsive layouts land correctly)
  await page.setViewport({ width: 1200, height: 1600 });
  
  // 3) Generate PDF, preserving backgrounds and any CSS @page rules
  await page.pdf({
    path: 'resume.pdf',
    format: 'A4',           // or omit if you use @page { size: … } in your CSS
    printBackground: true,
    preferCSSPageSize: true // honour any @page size/margin declarations
  });

  await browser.close();
})();
