import { chromium } from 'playwright';

const BASE = 'http://localhost:4173';
const shots = '/tmp/claude-0/-home-user-atropos/5537e531-ae0b-5971-91a8-97d42b119a0a/scratchpad/shots';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
page.on('console', msg => {
  if (msg.type() === 'error') console.log('  [console error]', msg.text());
});
page.on('pageerror', err => console.log('  [page error]', err.message));

console.log('--- Home ---');
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.screenshot({ path: shots + '/home.png' });
console.log('title:', await page.title());

console.log('--- Chat ---');
await page.goto(BASE + '/#/chat', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.screenshot({ path: shots + '/chat-signon.png' });
const hasModal = await page.locator('#nameModal').isVisible();
console.log('sign-on modal visible:', hasModal);

// Pick a generated name and sign on
await page.locator('.name-opt').first().click();
await page.locator('#nameBtn').click();
await page.waitForTimeout(800);
await page.screenshot({ path: shots + '/chat-signed-on.png' });
const appVisible = await page.locator('#appRoot').isVisible();
console.log('app root visible after sign-on:', appVisible);
const snName = await page.locator('#snDisplay').textContent();
console.log('screen name set to:', snName);

// send a message
await page.locator('#chatInput').fill('hello from playwright');
await page.locator('#sendBtn').click();
await page.waitForTimeout(500);
const lastMsg = await page.locator('.msg-area .aim-msg').last().textContent();
console.log('last message rendered:', lastMsg);

// typing indicator: type without sending
await page.locator('#chatInput').fill('typing test');
await page.waitForTimeout(200);

// switch room via tab
await page.locator('.ctab', { hasText: '#investigation' }).click();
await page.waitForTimeout(300);
const roomTitle = await page.locator('#sbRoom').textContent();
console.log('room after switching tab:', roomTitle);

// mobile collapse behavior
await page.setViewportSize({ width: 400, height: 800 });
await page.waitForTimeout(300);
const toggleVisible = await page.locator('#blToggle').isVisible();
console.log('mobile buddy toggle visible at 400px:', toggleVisible);
await page.screenshot({ path: shots + '/chat-mobile.png' });

console.log('--- Circuit ---');
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(BASE + '/#/circuit', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: shots + '/circuit-empty.png' });
console.log('circuit title:', await page.title());

await page.locator('button.tb-btn', { hasText: 'Guardian Node' }).click();
await page.waitForTimeout(800);
await page.screenshot({ path: shots + '/circuit-loaded.png' });
const nodeCount = await page.locator('#circuitSvg .node-group').count();
console.log('rendered node count after loading example:', nodeCount);

// Switch to BOM tab and check it populates
await page.locator('#stab-bom').click();
await page.waitForTimeout(300);
await page.screenshot({ path: shots + '/circuit-bom.png' });
const bomText = await page.locator('#spane-bom').isVisible().catch(() => false);
console.log('bom pane switched:', bomText);

// drag a component from canvas: click a node to select and check props pane
await page.locator('#circuitSvg .node-group').first().click();
await page.waitForTimeout(300);
await page.locator('#stab-props').click();
await page.waitForTimeout(200);
await page.screenshot({ path: shots + '/circuit-props.png' });

// mobile sidebar collapse
await page.setViewportSize({ width: 400, height: 800 });
await page.waitForTimeout(300);
const sidebarToggleVisible = await page.locator('.sidebar-toggle-btn').isVisible();
console.log('mobile sidebar toggle visible at 400px:', sidebarToggleVisible);
await page.screenshot({ path: shots + '/circuit-mobile.png' });

await browser.close();
console.log('DONE');
