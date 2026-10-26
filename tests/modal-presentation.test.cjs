const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
let browser;
const errors=[];
async function openPage(width){
 browser??=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width,height:844}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*supabase*',r=>r.request().resourceType()==='script'?r.continue():r.abort());
 await page.goto(process.env.V1_TEST_URL||'http://127.0.0.1:4320/',{waitUntil:'networkidle'});
 await page.locator('[onclick*="selectCharacterFromRune(\'normal\', false)"]').click();
 await page.locator('#start-btn').click();await page.locator('.advisor-option').first().waitFor();
 await page.locator('.advisor-option').first().click();
 await page.evaluate(()=>{
  gameState.paperSlots=2;
  gameState.papers=[{title:'Efficient Scalable Framework',ideaScore:6,expScore:6,writeScore:9,reviewing:false},{title:'Progressive Framework for Text Generation',ideaScore:0,expScore:0,writeScore:0,reviewing:false},null,null];
  renderPaperSlots();updateAllUI();autoSave();
 });
 return page;
}
after(async()=>{await browser?.close();assert.deepEqual(errors,[]);});
async function checkModal(page,label){
 await page.waitForTimeout(320);
 const before=await page.evaluate(()=>{
  const modal=document.getElementById('modal'),body=document.getElementById('modal-content'),footer=document.getElementById('modal-buttons');
  const rect=el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};};
  return {modal:rect(modal),footer:rect(footer),overflow:getComputedStyle(modal).overflowY,radius:getComputedStyle(modal).borderRadius,scrollMax:body.scrollHeight-body.clientHeight,
   nested:[...body.querySelectorAll('*')].filter(el=>!el.matches('textarea,input,select')&&['auto','scroll'].includes(getComputedStyle(el).overflowY)&&el.scrollHeight>el.clientHeight+1).map(el=>el.className),
   buttons:footer.children.length,client:innerHeight};
 });
 assert.equal(before.overflow,'hidden',label);
 assert.equal(before.radius,'16px',label);
 assert.deepEqual(before.nested,[],label);
 assert.ok(before.modal.top>=-1&&before.modal.bottom<=before.client+1,label);
 if(before.buttons){assert.ok(before.footer.bottom<=before.modal.bottom&&before.footer.top>=before.modal.top,label);}
 await page.locator('#modal-content').evaluate(el=>{el.scrollTop=el.scrollHeight;});
 const after=await page.evaluate(()=>({top:document.getElementById('modal-buttons').getBoundingClientRect().top,scroll:document.getElementById('modal-content').scrollTop}));
 assert.ok(Math.abs(after.top-before.footer.top)<1,label+' footer must stay still');
 if(before.scrollMax>1)assert.ok(after.scroll>=before.scrollMax-2,label+' bottom reachable');
 await page.locator('#modal-content').evaluate(el=>{el.scrollTop=0;});
 if(process.env.V1_SCREENSHOT_DIR&&['conferences','calendar'].includes(label))await page.screenshot({path:`${process.env.V1_SCREENSHOT_DIR}/v1-${label}-${page.viewportSize().width}.png`});
 return before;
}

test('long dialogs use one scroll area and visible footer on desktop and mobile',async()=>{
 for(const width of [1440,390,320]){
  const page=await openPage(width);
  const dialogs=[['conferences','showAllConferencesInfo'],['calendar','showFullCalendar'],['shop','openShop'],['save','openSaveModal'],['load','openLoadModal'],['rewind','openAutoSaveModal'],['talents','showTalentTree'],['effects','showCurseBlessingModal'],['difficulty','openDifficultyModal'],['achievements','showAchievementRequirements'],['endings','showEndingRequirements']];
  for(const [label,fn] of dialogs){await page.evaluate(fn=>window[fn](),fn);await checkModal(page,label);
   if(label==='difficulty'){await page.evaluate(()=>switchDifficultyPage('blessings'));await checkModal(page,'blessings');}
   await page.evaluate(()=>closeModal());}
  for(const guide of ['basics','advisor','paperScore','journal','review','citation','events','shop','buffs','characters','strategy']){
   await page.evaluate(g=>showGuide(g),guide);await checkModal(page,'guide-'+guide);await page.evaluate(()=>closeModal());
  }
  await page.evaluate(()=>showModal('short','<p>Short content</p>',[{text:'关闭',class:'btn-primary',action:closeModal}]));
  const short=await checkModal(page,'short');assert.ok(short.modal.bottom-short.modal.top<300);
  await page.getByRole('button',{name:'关闭',exact:true}).click();assert.equal(await page.locator('#modal-overlay.active').count(),0);
  await page.close();
 }
});

test('paper components have flat conference rows and readable available/disabled controls',async()=>{
 for(const width of [1440,390]){
  const page=await openPage(width);
  await page.locator('#workstation-panel').scrollIntoViewIfNeeded();
  const data=await page.evaluate(()=>({
   badges:[...document.querySelectorAll('.conf-average,.conf-location')].map(el=>({background:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color})),
   enabled:getComputedStyle(document.querySelector('.submit-btn.grade-a:not(:disabled)')).color,
   disabled:getComputedStyle(document.querySelector('.submit-btn.grade-a:disabled')).color,
   score:getComputedStyle(document.querySelector('.step-label.completed .step-score')).color
  }));
  assert.ok(data.badges.length===6&&data.badges.every(x=>x.background==='rgba(0, 0, 0, 0)'));
  assert.equal(data.enabled,'rgb(154, 52, 18)');assert.equal(data.disabled,'rgb(100, 116, 139)');assert.equal(data.score,'rgb(22, 101, 52)');
  if(process.env.V1_SCREENSHOT_DIR)await page.locator('#workstation-panel').screenshot({path:`${process.env.V1_SCREENSHOT_DIR}/v1-paper-colors-${width}.png`});
  await page.close();
 }
});

test('ending actions stay outside scrolling content without changing callbacks',async()=>{
 const page=await openPage(390);
 await page.evaluate(()=>triggerEnding('delay'));
 await checkModal(page,'ending');
 assert.equal(await page.locator('#modal-buttons [data-modal-footer]').count(),1);
 assert.equal(await page.locator('#modal-content [data-modal-footer]').count(),0);
 assert.ok(await page.locator('#modal-buttons button').filter({hasText:'我要回溯'}).isVisible());
 await page.close();
});
