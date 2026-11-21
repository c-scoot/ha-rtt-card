import { createServer } from 'vite';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { mkdir } from 'node:fs/promises';
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(resolve(dirname(process.execPath), '../node_modules/playwright')); }
const server = await createServer({server:{host:'127.0.0.1',port:5174,strictPort:true}});
await server.listen();
let browser;
try {
  browser = await playwright.chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE ? {executablePath:process.env.BROWSER_EXECUTABLE} : {})});
  const page = await browser.newPage({viewport:{width:1240,height:900}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:5174/demo.html');
  await page.locator('rtt-card button').first().waitFor();
  await mkdir('artifacts',{recursive:true});
  await page.screenshot({path:'artifacts/preview-desktop.png',fullPage:true});
  await page.locator('rtt-card').screenshot({path:'artifacts/card-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'artifacts/preview-mobile.png',fullPage:true});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)) throw new Error('Mobile overflow');
  await page.locator('#confirm').click();
  await page.waitForFunction(()=>document.querySelector('rtt-card').shadowRoot.textContent.includes('Platform 6 · Confirmed'));
  await page.locator('#theme').click();
  await page.screenshot({path:'artifacts/preview-dark.png',fullPage:true});
  await page.locator('rtt-card button').first().click();
  if(!(await page.locator('#event').innerText()).includes('sensor.waterloo_status')) throw new Error('More info event failed');
  // The actual shipped module must load independently of the development source.
  await page.route('**/bundle-check',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><head><title>Bundle check</title></head><body></body></html>'}));
  await page.goto('http://127.0.0.1:5174/bundle-check');
  await page.evaluate(async()=>{
    await import('/dist/rtt-card.js');
    const card=document.createElement('rtt-card');card.setConfig({type:'custom:rtt-card',trains:[]});document.body.append(card);
    await card.updateComplete;
    if(!card.shadowRoot.textContent.includes('Add a train')) throw new Error('Production bundle did not render');
  });
  if(errors.length) throw new Error(errors.join('\n'));
  console.log('Browser checks passed: mobile overflow, platform update, dark theme, more-info; screenshots in artifacts/.');
} finally {await browser?.close();await server.close();}
