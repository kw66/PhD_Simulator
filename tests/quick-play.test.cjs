// Run with a local HTTP server and Playwright installed: node --test tests/quick-play.test.cjs
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
    try{window[action]();}finally{Math.random=original;}
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
 assert.deepEqual(await page.evaluate(()=>[gameState.actionCount,gameState.gold,gameState.san]),[1,28,0]);
 await fixture(page,{character:'rich',isReversed:true,reversedAwakened:true,san:0,goldSpentTotal:4,subscriptions:{gemini:true}});
 await page.locator('#btn-idea').click();
 assert.equal(await page.evaluate(()=>gameState.actionCount),1);
 assert.equal(await page.evaluate(()=>gameState.gold),28);
 await page.close();
});

test('selected paper stays the action target and cannot silently redirect an unavailable action',async()=>{
 const page=await pageFor();
 await fixture(page,{papers:[{title:'One',ideaScore:2,expScore:2,writeScore:2},{title:'Two',ideaScore:0,expScore:0,writeScore:0},null,null]});
 await page.locator('[data-paper-index="1"] .research-target-button').click();
 assert.equal(await page.locator('#btn-experiment').isDisabled(),true);
 await page.locator('#btn-idea').click();
 assert.equal(await page.evaluate(()=>gameState.papers[0].ideaScore),2);
 assert.ok(await page.evaluate(()=>gameState.papers[1].ideaScore)>0);
 assert.equal(await page.locator('#modal-overlay.active').count(),0);
 await page.close();
});

test('displayed costs reflect equipment, subscriptions, season and doubled work income',async()=>{
 const page=await pageFor();
 await fixture(page,{monitorUpgrade:'4k',incomeDoubled:true,workCount:8});
 assert.deepEqual(await page.evaluate(()=>getActionCosts().work),{san:-6,gold:6});
 assert.equal(await page.evaluate(()=>Math.abs(getActionCosts().read.san)),0);
 const wages=await page.evaluate(()=>{
  const key=Object.keys(ADVISOR_TYPES).find(k=>ADVISOR_TYPES[k].salary.master===1.5);
  gameState.relationships=[{type:'advisor',advisorType:key}];gameState.month=1;
  return [getAdvisorSalary('master'),getAdvisorSalary('master',2),gameState.month];
 });
 assert.deepEqual(wages,[1,2,1]);
 await page.close();
});

test('review summary and full detail share one-time settlement for accept/reject and queues',async()=>{
 const page=await pageFor();
 for(const accepted of [false,true])for(const detailed of [false,true]){
  await fixture(page);
  await page.evaluate(accepted=>{
   const paper=gameState.papers[0];Object.assign(paper,{reviewing:true,reviewMonths:0,submittedGrade:'C',submittedScore:27,submittedMonth:1,submittedIdeaScore:8,submittedExpScore:9,submittedWriteScore:10,conferenceInfo:getConferenceInfo(1,'C',1)});
   window.__testQueue=0;window.__oldQueue=processNextReviewInQueue;processNextReviewInQueue=()=>{window.__testQueue++;};gameState._reviewProcessing={pendingSlots:[],acceptedByConference:{},pendingConferences:[],onComplete:null};
   const results=[{reviewer:{name:'普通审稿人',type:'normal'},decision:accepted?'Accept':'Reject',score:accepted?1:-1,comment:'审稿意见',improvement:0,effectiveScore:27,thresholds:{reject:15,borderline:30},weightInfo:'均衡'}];
   const monthStats=getMonthStats(1,'C',false);monthStats._gameMonth=1;
   const adjustedTarget=getAdjustedTargetRate('C',monthStats,gameState.submissionStats,false);
   const adjustment=calculateAsymmetricAdjustment('C',monthStats,adjustedTarget);
   showReviewResultModalV2(paper,'C',results,accepted?1:-2,'Poster',accepted,0,{idea:8,exp:9,write:10,total:27},{idea:8,exp:9,write:10,total:27},{badReviewerCount:0,hostileCount:0,questionsCount:0,hasExpert:false,submittedMonth:1,ideaDecay:0,expDecay:0,monthStats,adjustedTarget,adjustment,borderlineChance:null});
  },accepted);
  assert.match(await page.locator('#modal').innerText(),accepted?/录用/:/拒稿/);
  if(process.env.V1_SCREENSHOT_DIR && !accepted && !detailed){
   await page.screenshot({path:process.env.V1_SCREENSHOT_DIR+'/v1-review-desktop.png'});
   await page.setViewportSize({width:390,height:844});
   await page.screenshot({path:process.env.V1_SCREENSHOT_DIR+'/v1-review-mobile.png'});
   await page.setViewportSize({width:1440,height:900});
  }
  if(detailed){await page.getByRole('button',{name:'详细评审',exact:true}).click();await page.getByRole('button',{name:'查看PC决定 →',exact:true}).click();await page.getByRole('button',{name:'✓ 确定',exact:true}).click();}
  else await page.getByRole('button',{name:'确定',exact:true}).click();
  await page.waitForTimeout(200);
  const once=await page.evaluate(()=>({score:gameState.totalScore,rejects:gameState.totalRejects||0,accepted:gameState.totalAccepts||0,history:gameState.submissionHistory.length,queue:window.__testQueue}));
  await page.evaluate(()=>finalizeReviewResult());
  assert.deepEqual(await page.evaluate(()=>({score:gameState.totalScore,rejects:gameState.totalRejects||0,accepted:gameState.totalAccepts||0,history:gameState.submissionHistory.length,queue:window.__testQueue})),once);
  assert.equal(once.history,1);assert.equal(accepted?once.accepted:once.rejects,1);assert.equal(once.queue,1);
  await page.evaluate(()=>{processNextReviewInQueue=window.__oldQueue;});
 }
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
 assert.match(await fresh.locator('#quick-action-status').innerText(),/本月行动/);
 await fresh.close();await page.close();
});

test('masters, doctorate and failed ending panels still open with unchanged graduation checks',async()=>{
 const page=await pageFor();
 for(const degree of ['master','phd']){
  const years=degree==='master'?3:5;
  await fixture(page,{degree,maxYears:years,year:years,month:12,totalMonths:years*12,totalScore:30,phdChoiceMadeThisYear:true,natureExtensionChoiceMade:true});
  await page.evaluate(()=>checkGraduation());
  assert.match(await page.locator('#modal').innerText(),degree==='master'?/硕士/:/博士|青椒|教/);
  assert.equal(await page.locator('#modal button').filter({hasText:'我要重开'}).count(),1);
 }
 await fixture(page);await page.evaluate(()=>changeSan(-100));
 assert.match(await page.locator('#modal').innerText(),/不堪重负/);
 await page.close();
});

test('start/play layouts fit phone, tablet and desktop and retain role selection on rerender',async()=>{
 for(const width of [320,390,768,820,1024,1440]){
  const page=await pageFor(false,width);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`start overflow ${width}`);
  assert.ok((await page.locator('#start-btn').boundingBox()).y<700,`start accessible ${width}`);
  await page.locator('[data-char="rich"][data-reversed="true"]').click();
  await page.waitForTimeout(150);
  await page.evaluate(()=>renderCharacterGrid());
  assert.match(await page.locator('#selected-char-preview').innerText(),/贪求/);
  assert.equal(await page.locator('#start-btn').isDisabled(),false);
  await fixture(page);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`play overflow ${width}`);
  assert.match(await page.locator('#btn-idea').innerText(),/SAN/);
  await page.close();
 }
});
