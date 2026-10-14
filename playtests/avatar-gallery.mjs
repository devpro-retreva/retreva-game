import { launch, BASE_URL, outDir } from './lib.mjs';
import fs from 'node:fs';
const OUT = outDir('avatar-gallery');
fs.mkdirSync(OUT, { recursive: true });
const b = await launch();
const p = await (await b.newContext({ viewport: { width: 1180, height: 760 } })).newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e)));
await p.goto(BASE_URL);
await p.waitForSelector('.wordmark');
await p.evaluate(() => indexedDB.deleteDatabase('retriever'));
await p.reload();
await p.waitForSelector('.wordmark');
await p.click('text=Start a new life');
await p.waitForSelector('#name');
await p.fill('#name', 'Ada');
const pill = (group, name) => p.click(`[aria-label="${group}"] button:has-text("${name}")`);
const shot = async (n) => {
  await p.waitForTimeout(1500);
  await p.locator('.preview').screenshot({ path: `${OUT}/${n}.png` });
};
const looks = [
  ['Male', [['Hairstyle', 'Low cut'], ['Facial hair', 'Full beard'], ['Outfit', 'Shirt & trousers']]],
  ['Male', [['Hairstyle', 'Locs'], ['Facial hair', 'Clean'], ['Outfit', 'Kaftan'], ['Headwear', 'Fila']]],
  ['Male', [['Headwear', 'None'], ['Hairstyle', 'High top'], ['Facial hair', 'Goatee'], ['Outfit', 'Tee & shorts'], ['Accessories', 'Glasses']]],
  ['Male', [['Hairstyle', 'Afro'], ['Accessories', 'None'], ['Facial hair', 'Moustache'], ['Outfit', 'Shirt & trousers']]],
  ['Female', [['Hairstyle', 'Afro puff'], ['Outfit', 'Dress'], ['Accessories', 'Earrings']]],
  ['Female', [['Hairstyle', 'Braids'], ['Outfit', 'Top & skirt']]],
  ['Female', [['Hairstyle', 'Long'], ['Outfit', 'Top & trousers'], ['Accessories', 'Glasses']]],
  ['Female', [['Hairstyle', 'Bun'], ['Headwear', 'Gele'], ['Outfit', 'Dress'], ['Accessories', 'Earrings']]],
  ['Female', [['Headwear', 'Headwrap'], ['Hairstyle', 'Short'], ['Outfit', 'Top & skirt']]],
];
let i = 0;
for (const [g, steps] of looks) {
  await p.click(`[aria-label="Gender"] button:has-text("${g}")`);
  for (const [grp, name] of steps) await pill(grp, name);
  await shot(`${String(++i).padStart(2, '0')}-${g.toLowerCase()}`);
}
await p.screenshot({ path: `${OUT}/full-create-female.png` });
console.log('facial hair shown for female:', await p.isVisible('[aria-label="Facial hair"]'));
await p.click('[aria-label="Gender"] button:has-text("Male")');
console.log('facial hair shown for male:', await p.isVisible('[aria-label="Facial hair"]'));
console.log('errors:', errs.length, errs.slice(0, 2).join(' | '));
await b.close();
