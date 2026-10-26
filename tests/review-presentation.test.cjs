const {test,after}=require('node:test');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
let browser;
const errors=[];
async function openPage(width=390,legacy=false){
 browser??=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width,height:844}});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*supabase*',r=>r.request().resourceType()==='script'?r.continue():r.abort());
 if(legacy)await page.route('**/js/systems/review.js*',r=>r.fulfill({contentType:'application/javascript',body:execFileSync(process.env.V1_GIT||'git',['show','e19df7a:js/systems/review.js'],{encoding:'utf8'})}));
 await page.goto(process.env.V1_TEST_URL||'http://127.0.0.1:4320/',{waitUntil:'networkidle'});
 await page.locator('[onclick*="selectCharacterFromRune(\'normal\', false)"]').click();
 await page.locator('#start-btn').click();
 await page.locator('.advisor-option').first().waitFor();
 await page.locator('.advisor-option').first().click();
 await page.evaluate(()=>{window.originalProcessNextReviewInQueue=processNextReviewInQueue;});
 return page;
}
async function fixture(page,accepted=false,stats=true){
 await page.evaluate(({accepted,stats})=>{
  gameState={...getInitialState(),character:'normal',characterName:'测试',san:20,gold:30,month:5,year:1,paperSlots:2};
  const paper={title:'Efficient Scalable Framework',ideaScore:6,expScore:6,writeScore:9,reviewing:true,submittedScore:30,submittedMonth:1,submittedGrade:'C',reviewMonths:4,conferenceInfo:{name:'ICIP',year:2031,fullName:'IEEE International Conference on Image Processing'},conferenceLocation:{city:'西雅图',country:'美国',region:'west'}};
  gameState.papers=[paper,null,null,null];
  gameState._reviewProcessing={pendingSlots:[],acceptedByConference:{},pendingConferences:[]};
  window.queueCalls=0;processNextReviewInQueue=()=>{window.queueCalls++};
  const type=Object.keys(BASE_THRESHOLDS.C)[0];
  const results=[0,1,2].map(i=>({reviewer:{type,name:'审稿人 '+(i+1)},decision:accepted?'Accept':'Reject',score:accepted?1:-1,weightInfo:'Idea 40% / 实验 40% / 写作 20%',effectiveScore:21,thresholds:{reject:18,borderline:30},comment:'请补充实验，对主要结论给出更充分的论证。',improvement:i===0?1:0,improvementType:'idea'}));
  const extraInfo={borderlineChance:null,adjustment:{adjustmentEnabled:true,personality:{strictness:1.34,borderlineWidth:.74,borderlineLeniency:.78,volatility:.35},borderlineBaseRate:.5,adjustmentDetails:{rejectChange:1,borderlineChange:1,reason:'重复会议性格说明'}},adjustedTarget:{target:.554,popularity:{category:'normal',avgSubmissions:3129}},monthStats:stats?{submissions:2895,accepted:1601,acceptRate:.553,poster:1400,oral:180,bestPaper:21,avgScorePoster:30,avgScoreOral:40,avgScoreBestPaper:50,avgScoreRejected:18,p90AcceptedScore:45,p99AcceptedScore:65}:null,ideaDecay:4,expDecay:6,badReviewerCount:2,hostileCount:1,questionsCount:1,hasExpert:true,expertCount:1,submittedMonth:1};
  document.getElementById('start-screen').style.display='none';document.getElementById('game-screen').style.display='block';
  renderPaperSlots();updateAllUI();
  window.reviewFixture={paper,results,extraInfo};
  showReviewResultModalV2(paper,'C',results,accepted?3:-3,accepted?'Poster':null,accepted,0,{total:30},{total:21},extraInfo);
 },{accepted,stats});
}
async function snapshot(page){return page.evaluate(()=>({san:gameState.san,score:gameState.totalScore,history:gameState.submissionHistory,pending:gameState.pendingSubmissions,rejected:gameState.totalRejects,accepted:gameState.totalAccepts,malicious:gameState.maliciousReviewerCount,questions:gameState.thirtyNineQuestionsCount,papers:gameState.papers,published:gameState.publishedPapers,buffs:gameState.buffs,conditions:gameState.achievementConditions,conferences:gameState._reviewProcessing.acceptedByConference,queueCalls:window.queueCalls}));}
after(async()=>{await browser?.close();assert.deepEqual(errors,[]);});

test('result first, optional reviews and compact statistics on desktop and mobile',async()=>{
 for(const width of [1440,390,320]){
  const page=await openPage(width);await fixture(page);
  assert.match(await page.locator('#modal-title').innerText(),/论文结果 \(1\/3\)/);
  assert.match(await page.locator('#modal-content > div').first().innerText(),/拒稿/);
  const initial=await snapshot(page);
  await page.getByRole('button',{name:'审稿意见 →',exact:true}).click();
  const detail=await page.locator('#modal-content').innerText();
  assert.equal((detail.match(/会议性格/g)||[]).length,1);
  assert.doesNotMatch(detail,/目标录取率|实际：|重复会议性格说明|会议特性/);
  await page.getByRole('button',{name:'会议情况 →',exact:true}).click();
  const stats=await page.locator('#modal-content').innerText();
  assert.doesNotMatch(stats,/投稿时总分|投稿概况|录用分布/);
  assert.equal((stats.match(/录用率/g)||[]).length,1);
  assert.deepEqual(await snapshot(page),initial,'reading must not settle results');
  const layout=await page.evaluate(()=>{
   const body=document.getElementById('modal-content'),footer=document.getElementById('modal-buttons');
   return {overflow:body.scrollWidth>body.clientWidth+1,inline:[...document.querySelectorAll('.review-summary-row')].every(row=>Math.abs(row.children[0].getBoundingClientRect().top-row.children[1].getBoundingClientRect().top)<6),border:getComputedStyle(footer).borderTopWidth,shadow:getComputedStyle(footer).boxShadow};
  });
  assert.deepEqual(layout,{overflow:false,inline:true,border:'0px',shadow:'none'});
  if(process.env.V1_SCREENSHOT_DIR)await page.locator('#modal').screenshot({path:`${process.env.V1_SCREENSHOT_DIR}/v1-review-conference-${width}.png`});
  await page.getByRole('button',{name:'← 审稿意见',exact:true}).click();
  if(process.env.V1_SCREENSHOT_DIR)await page.locator('#modal').screenshot({path:`${process.env.V1_SCREENSHOT_DIR}/v1-review-details-${width}.png`});
  await page.getByRole('button',{name:'← 结果',exact:true}).click();
  if(process.env.V1_SCREENSHOT_DIR)await page.locator('#modal').screenshot({path:`${process.env.V1_SCREENSHOT_DIR}/v1-review-result-${width}.png`});
  await page.getByRole('button',{name:'关闭',exact:true}).click();
  assert.equal(await page.locator('#modal-overlay.active').count(),0);
  await page.close();
 }
});

test('closing any page preserves previous acceptance/rejection settlement exactly once',async()=>{
 const old=await openPage(390,true),current=await openPage();
 for(const accepted of [false,true]){
  await fixture(old,accepted);
  await old.evaluate(()=>{showReviewResultPage(3);modalCallbacks[1]();});
  await old.waitForFunction(()=>window.queueCalls===1);
  const baseline=await snapshot(old);
  for(const pageNum of [1,2,3]){
   await fixture(current,accepted);
   await current.evaluate(n=>{showReviewResultPage(n);window.savedClose=modalCallbacks.at(-1);},pageNum);
   await current.getByRole('button',{name:'关闭',exact:true}).evaluate(button=>button.click());
   await current.waitForFunction(()=>window.queueCalls===1);
   assert.deepEqual(await snapshot(current),baseline,`${accepted?'accepted':'rejected'} page ${pageNum}`);
   await current.evaluate(()=>window.savedClose());
   assert.deepEqual(await snapshot(current),baseline,'stale/double click must not settle twice');
  }
 }
 await current.close();await old.close();
});

test('missing statistics and long titles remain readable',async()=>{
 const page=await openPage(320);await fixture(page,false,false);
 await page.evaluate(()=>{currentReviewData.paper.title='VeryLongPaperTitle'.repeat(12);showReviewResultPage(2);});
 assert.equal(await page.locator('.review-personality').count(),0);
 await page.getByRole('button',{name:'会议情况 →',exact:true}).click();
 assert.match(await page.locator('#modal-content').innerText(),/数据不足/);
 assert.equal(await page.locator('#modal-content').evaluate(e=>e.scrollWidth>e.clientWidth+1),false);
 await page.getByRole('button',{name:'关闭',exact:true}).click();
 await page.close();
});


test('closing first-page results advances the real multi-paper queue',async()=>{
 const page=await openPage();await fixture(page);
 await page.evaluate(()=>{
  closeModal();processNextReviewInQueue=window.originalProcessNextReviewInQueue;
  const paper={...reviewFixture.paper,ideaScore:0,expScore:0,writeScore:0,submittedScore:0};
  gameState.papers=[{...paper,title:'Queue paper 1'},{...paper,title:'Queue paper 2'},null,null];
  window.reviewQueueFinished=false;
  startReviewProcessing([0,1],()=>{window.reviewQueueFinished=true;});
 });
 for(let n=1;n<=2;n++){
  await page.waitForFunction(n=>currentReviewData?.paper.title==='Queue paper '+n,n);
  assert.equal(await page.evaluate(()=>currentReviewData.accepted),false);
  assert.match(await page.locator('#modal-title').innerText(),/论文结果/);
  await page.getByRole('button',{name:'关闭',exact:true}).click();
 }
 await page.waitForFunction(()=>window.reviewQueueFinished);
 const result=await page.evaluate(()=>({history:gameState.submissionHistory.length,rejects:gameState.totalRejects,pending:gameState.pendingSubmissions.length,reviewing:gameState.papers.filter(p=>p?.reviewing).length}));
 assert.deepEqual(result,{history:2,rejects:2,pending:2,reviewing:0});
 await page.close();
});
