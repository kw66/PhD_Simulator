const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
let browser;
const errors=[];
async function openPage(width=390){
 browser??=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width,height:844}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*supabase*',r=>r.request().resourceType()==='script'?r.continue():r.abort());
 await page.goto(process.env.V1_TEST_URL||'http://127.0.0.1:4320/',{waitUntil:'networkidle'});
 return page;
}
after(async()=>{await browser?.close();assert.deepEqual(errors,[]);});
async function press(page,name){await page.waitForTimeout(350);await page.getByRole('button',{name,exact:true}).click();}

test('one load entry opens both categories, including empty lists at 320px',async()=>{
 const page=await openPage(320);
 assert.equal(await page.locator('#start-screen [onclick="openAutoSaveModal()"], .utility-buttons [onclick="openAutoSaveModal()"]').count(),0);
 await page.locator('[onclick="openLoadModalFromStart()"]').click();
 assert.match(await page.locator('#modal-content').textContent(),/暂无自动存档/);
 await press(page,'手动存档');
 assert.match(await page.locator('#modal-content').textContent(),/暂无手动存档/);
 assert.equal(await page.getByRole('button',{name:'手动存档',exact:true}).getAttribute('aria-pressed'),'true');
 await press(page,'自动存档');
 assert.equal(await page.locator('#modal-content').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
 await page.close();
});

test('manual, latest and history slots still load correctly through the unified browser',async()=>{
 const page=await openPage();
 await page.locator('[onclick*="selectCharacterFromRune(\'normal\', false)"]').click();
 await page.locator('#start-btn').click();await page.locator('.advisor-option').first().waitFor();await page.locator('.advisor-option').first().click();
 await page.evaluate(()=>{
  const base=createSaveData();
  saveSaves([{...base,gold:17}]);
  saveLatestSave({...base,gold:27,autoSaveLabel:'第1年第5月',month:5,totalMonths:5});
  saveAutoSaves([{...base,gold:37,autoSaveLabel:'第1年第3月',month:3,totalMonths:3}]);
  openLoadModal();
 });
 await press(page,'手动存档');
 await page.locator('[onclick="loadGame(0)"]').click();await press(page,'确定读取');
 assert.equal(await page.evaluate(()=>gameState.gold),17);
 await page.evaluate(()=>openLoadModal());
 await page.locator('[onclick="loadLatestAutoSave()"]').click();
 await press(page,'取消');
 assert.equal(await page.getByRole('button',{name:'自动存档',exact:true}).getAttribute('aria-pressed'),'true');
 await page.locator('[onclick="loadLatestAutoSave()"]').click();await press(page,'确定回溯');
 assert.deepEqual(await page.evaluate(()=>({gold:gameState.gold,month:gameState.month})),{gold:27,month:5});
 await page.evaluate(()=>openLoadModal());
 await page.locator('[onclick="loadAutoSave(0)"]').click();await press(page,'确定回溯');
 assert.deepEqual(await page.evaluate(()=>({gold:gameState.gold,month:gameState.month})),{gold:37,month:3});
 await page.evaluate(()=>openLoadModal());
 await press(page,'清空全部');await press(page,'取消');
 assert.equal(await page.getByRole('button',{name:'自动存档',exact:true}).getAttribute('aria-pressed'),'true');
 if(process.env.V1_SCREENSHOT_DIR)await page.locator('#modal').screenshot({path:`${process.env.V1_SCREENSHOT_DIR}/v1-load-browser-390.png`});
 assert.equal(await page.evaluate(()=>getAutoSaves().length),1);
 await page.close();
});
