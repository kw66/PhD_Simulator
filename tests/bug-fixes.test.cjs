// Run with a local HTTP server and Playwright installed: node --test tests/bug-fixes.test.cjs
const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {execFileSync}=require('node:child_process');
const base=process.env.V1_TEST_URL||'http://127.0.0.1:4320/';
const git=process.env.V1_GIT||'git';
let browser;
const errors=[];
async function pageFor(legacy=false,width=1440){
 browser??=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width,height:900}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*supabase*',r=>r.request().resourceType()==='script'?r.continue():r.abort());
 if(legacy)await page.route('**/js/features/papers.js*',r=>r.fulfill({contentType:'application/javascript',body:execFileSync(git,['show','2149a80436dd10471e2c9dedddc9eaa58454ca13:js/features/papers.js'],{encoding:'utf8'})}));
 await page.goto(base,{waitUntil:'networkidle'});
 return page;
}
async function fixture(page,extra={}){
 await page.evaluate(extra=>{
  gameState={...getInitialState(),character:'normal',characterName:'测试',san:20,gold:30,month:1,paperSlots:4,...extra};
  gameState.papers=extra.papers||[{title:'Test paper',ideaScore:8,expScore:9,writeScore:10,reviewing:false},null,null,null];
  shopItems.forEach(i=>{i.bought=false;i.boughtThisMonth=false;});
  gameState.subscriptions=extra.subscriptions||{};
  document.getElementById('start-screen').style.display='none';
  document.getElementById('game-screen').style.display='block';
  closeModal();renderPaperSlots();updateAllUI();
 },extra);
}
after(async()=>{await browser?.close();assert.deepEqual(errors,[],'No uncaught browser errors');});

test('successful research has identical state changes for all twelve role variants',async()=>{
 const old=await pageFor(true),current=await pageFor();
 for(const character of ['normal','genius','social','rich','teacher-child','chosen'])for(const reversed of [false,true])for(const action of ['thinkIdea','doExperiment','writePaper']){
  const result=[];
  for(const page of [old,current]){
   await fixture(page,{character,isReversed:reversed,reversedAwakened:reversed,subscriptions:{gemini:true,gpt:true,claude:true,gpu_rent:true}});
   result.push(await page.evaluate(action=>{
    const original=Math.random;let n=42;Math.random=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);
    try{window[action]();if(document.querySelector('#modal [onclick*="paperSelectCallback"]'))paperSelectCallback(0);}finally{Math.random=original;}
    return {paper:gameState.papers[0],san:gameState.san,gold:gameState.gold,actionCount:gameState.actionCount,spent:gameState.goldSpentTotal,buffs:gameState.buffs};
   },action));
  }
  assert.deepEqual(result[1],result[0],`${character} ${reversed} ${action}`);
 }
 await old.close();await current.close();
});

test('failed or cancelled research never spends preorder money',async()=>{
 const page=await pageFor();
 for(const action of ['thinkIdea','doExperiment','writePaper']){
  for(const extra of [{papers:[null,null,null,null]},{san:0},{actionCount:1}]){
   await fixture(page,{subscriptions:{gemini:true,gpt:true,claude:true,gpu_rent:true},...extra});
   const before=await page.evaluate(()=>JSON.stringify({gold:gameState.gold,buffs:gameState.buffs,actions:gameState.actionCount}));
   await page.evaluate(a=>window[a](),action);
   if(await page.locator('#modal [onclick*="paperSelectCallback"]').count()) await page.evaluate(()=>paperSelectCallback(0));
   assert.equal(await page.evaluate(()=>JSON.stringify({gold:gameState.gold,buffs:gameState.buffs,actions:gameState.actionCount})),before,action);
  }
  await fixture(page,{subscriptions:{gemini:true,gpt:true,claude:true,gpu_rent:true},papers:[{title:'One',ideaScore:2,expScore:2,writeScore:2},{title:'Two',ideaScore:3,expScore:3,writeScore:3},null,null]});
  await page.evaluate(a=>window[a](),action);
  assert.equal(await page.evaluate(()=>gameState.gold),30);
  await page.getByRole('button',{name:'取消',exact:true}).click();
  assert.equal(await page.evaluate(()=>gameState.gold),30);
 }
 await page.close();
});

test('discounted SAN and Greed spending recovery remain usable',async()=>{
 const page=await pageFor();
 await fixture(page,{san:1,subscriptions:{gemini:true}});
 await page.locator('#btn-idea').click();
 await page.locator('#modal [onclick*="paperSelectCallback"]').click();
 assert.deepEqual(await page.evaluate(()=>[gameState.actionCount,gameState.gold,gameState.san]),[1,28,0]);
 await fixture(page,{character:'rich',isReversed:true,reversedAwakened:true,san:0,goldSpentTotal:4,subscriptions:{gemini:true}});
 await page.locator('#btn-idea').click();
 await page.locator('#modal [onclick*="paperSelectCallback"]').click();
 assert.equal(await page.evaluate(()=>gameState.actionCount),1);
 assert.equal(await page.evaluate(()=>gameState.gold),28);
 await page.close();
});

test('displayed costs reflect equipment, subscriptions, season and doubled work income',async()=>{
 const page=await pageFor();
 await fixture(page,{monitorUpgrade:'4k',incomeDoubled:true,workCount:8});
 assert.deepEqual(await page.evaluate(()=>getActionCosts().work),{san:-6,gold:6});
 assert.equal(await page.evaluate(()=>Math.abs(getActionCosts().read.san)),0);
 await page.close();
});

test('decay floor and old-save continuation preserve gameplay',async()=>{
 const page=await pageFor();
 await fixture(page,{month:2,totalMonths:1,relationships:[],papers:[{title:'Floor',ideaScore:1,expScore:2,writeScore:10,reviewing:true,reviewMonths:4,submittedGrade:'C',submittedScore:13},null,null,null]});
 await page.evaluate(()=>nextMonth());
 assert.deepEqual(await page.evaluate(()=>{const p=gameState.papers[0];return [p.ideaScore,p.expScore,p.totalIdeaDecay,p.totalExpDecay,p.reviewMonths];}),[1,1,0,1,3]);
 const save=await page.evaluate(()=>createSaveData());
 const fresh=await pageFor();await fresh.evaluate(save=>loadGameFromSave(save),save);
 assert.deepEqual(await fresh.evaluate(()=>[gameState.totalMonths,gameState.papers[0].reviewMonths,gameState.papers[0].ideaScore]),[2,3,1]);

 await fresh.close();await page.close();
});

