// Presentation and action preflight only. Gameplay values remain in their original modules.
function escapeQuickText(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

let selectedResearchPaper = null;
function selectResearchPaper(index) {
    const paper = gameState.papers[index];
    if (!paper || paper.reviewing) return;
    selectedResearchPaper = paper;
    renderPaperSlots();
}

function renderResearchTargetButtons() {
    if (gameState.papers.filter(p => p && !p.reviewing).length < 2) return;
    document.querySelectorAll('[data-paper-index]').forEach(card => {
        const index = Number(card.dataset.paperIndex), paper = gameState.papers[index];
        if (!paper || paper.reviewing) return;
        const selected = selectedResearchPaper === paper;
        card.classList.toggle('is-research-target', selected);
        const button = document.createElement('button');
        button.className = 'research-target-button'; button.type = 'button';
        button.textContent = selected ? '当前操作论文' : '选为操作论文';
        button.setAttribute('aria-pressed', String(selected));
        button.addEventListener('click',()=>selectResearchPaper(index));
        card.querySelector('.paper-title').after(button);
    });
}

function getResearchActionCost(action) {
    const config = {
        idea: {base:2, item:'gemini', buff:'idea_san_reduce'},
        experiment: {base:3, item:'gpt', buff:'exp_san_reduce'},
        write: {base:gameState.buffs.permanent.some(b => b.type === 'write_san_reduce') ? 3 : 4, item:'claude', buff:'write_san_reduce_temp'}
    }[action];
    const item = shopItems.find(i => i.id === config.item);
    const active = gameState.buffs.temporary.some(b => b.type === config.buff);
    const willBuy = gameState.subscriptions?.[config.item] && item && !item.boughtThisMonth && gameState.gold >= item.price;
    return getSanCostExplanation(Math.max(1, config.base - (active || willBuy ? 1 : 0))).actualCost;
}

function getResearchActionReason(action, index) {
    if ((gameState.actionCount || 0) >= (gameState.actionLimit || 1)) return '本月行动已用完';
    const drafts = gameState.papers.filter(p => p && !p.reviewing);
    const available = drafts.filter(p => action === 'idea' || (action === 'experiment' ? p.ideaScore > 0 : p.expScore > 0));
    if (!available.length) {
        if (!drafts.length) return gameState.papers.some(p => p?.reviewing) ? '论文审稿中，可阅读或打工' : '先开启一篇新论文';
        return action === 'experiment' ? '先为论文想 idea' : '先为论文做实验';
    }
    if (index === undefined && drafts.includes(selectedResearchPaper) && !available.includes(selectedResearchPaper)) return action === 'experiment' ? '当前论文需先想 idea' : '当前论文需先做实验';
    if (index !== undefined && !available.includes(gameState.papers[index])) return '该论文当前不可操作';
    const cost = getResearchActionCost(action);
    let availableSan = gameState.san;
    // Greed's existing spending recovery may make the selected action affordable.
    if (gameState.isReversed && gameState.character === 'rich' && gameState.reversedAwakened) {
        let gold = gameState.gold, spending = gameState.goldSpentTotal || 0;
        const purchases = {idea:['gemini'],experiment:['gpt','gpu_rent'],write:['claude']}[action];
        for (const id of purchases) {
            const item = shopItems.find(i => i.id === id);
            if (!gameState.subscriptions?.[id] || !item || (item.monthlyOnce && item.boughtThisMonth) || gold < item.price || (id === 'gpu_rent' && (gameState.gpuRentedThisMonth || 0) >= 20)) continue;
            const gain = Math.floor((spending + item.price) / 6) - Math.floor(spending / 6);
            availableSan = Math.min(gameState.sanMax, availableSan + gain);
            spending += item.price; gold -= item.price;
        }
    }
    if (availableSan < cost) return `SAN不足，需要${cost}`;
    return '';
}

function validateResearchAction(action, index) {
    const reason = getResearchActionReason(action, index);
    if (!reason) return true;
    showModal('无法操作', `<p>${escapeQuickText(reason)}</p>`, [{text:'确定',class:'btn-primary',action:closeModal}]);
    return false;
}

function updateQuickStatus() {
    if (!gameState.character || !gameState.buffs) return;
    const actionPanel = document.getElementById('action-panel-content');
    if (!actionPanel) return;
    let status = document.getElementById('quick-action-status');
    if (!status) {
        status = document.createElement('div'); status.id = 'quick-action-status';
        actionPanel.prepend(status);
    }
    const limit = gameState.actionLimit || 1;
    const remaining = Math.max(0, limit - (gameState.actionCount || 0));
    const req = getAdvisorRequirements();
    const target = gameState.degree === 'phd' ? req.phdGrad : req.masterGrad;
    status.innerHTML = `<strong>本月行动 ${remaining}/${limit}</strong><span>${gameState.degree === 'phd' ? '博士' : '硕士'}毕业 ${gameState.totalScore}/${target} 分</span>`;
    status.title = '常规行动与人际操作次数分别计算；毕业按原有学年与科研分要求判定';
    const costs = getActionCosts();
    for (const action of ['read','work','idea','experiment','write']) {
        const btn = document.getElementById('btn-' + action);
        let reason = '';
        if (['idea','experiment','write'].includes(action)) reason = getResearchActionReason(action);
        else if (!remaining) reason = '本月行动已用完';
        else if (gameState.san < Math.abs(costs[action].san)) reason = `SAN不足，需要${Math.abs(costs[action].san)}`;
        btn.disabled = !!reason;
        btn.style.opacity = reason ? '0.55' : '1';
        btn.style.pointerEvents = 'auto';
        btn.title = reason || '消耗一次常规行动；人际操作独立计算';
        let note = btn.querySelector('.action-reason');
        if (!note) {note = document.createElement('small');note.className = 'action-reason';btn.append(note);}
        note.textContent = reason && reason !== '本月行动已用完' ? reason : '';
    }
    let next = document.getElementById('quick-next-status');
    if (!next) {next = document.createElement('div');next.id = 'quick-next-status';actionPanel.querySelector('.action-grid').after(next);}
    const monthly = [`工资 +${getAdvisorSalary(gameState.degree, gameState.month % 12 + 1)}金`, '生活 −1金'];
    if (gameState.hasLover) monthly.push('约会 −2金');
    if (gameState.ailabInternship) monthly.push('实习 SAN−2');
    next.innerHTML = `<span>下月固定项：${monthly.join(' · ')}</span><span class="quick-event-preview">${getUpcomingEvents().slice(0,2).map(e => `${escapeQuickText(e.label)}：${escapeQuickText(e.name)}`).join(' · ')}</span>`;
    next.title = '列出工资、生活、约会及实习的固定项目；不是完整净变化，其他角色、装备与随机事件效果按原规则结算。';
    const months = gameState.maxYears * 12 - gameState.totalMonths;
    const pending = gameState.papers.filter(p => p?.reviewing);
    let paperNote = document.getElementById('quick-paper-note');
    const slots = document.getElementById('paper-slots');
    if (!paperNote && slots) {paperNote=document.createElement('p');paperNote.id='quick-paper-note';slots.before(paperNote);}
    if (paperNote) {
        paperNote.classList.toggle('is-warning', months < 4);
        paperNote.textContent = months < 4 ? '新投会议审稿需4个月，可能晚于毕业截止。' : pending.length ? `${pending.length}篇审稿中；本次评审按投稿时分数，当前稿件变化用于后续重投。` : '先想 idea → 做实验 → 写论文；三项均有分即可投稿。';
    }
}

function showCompactReviewResult() {
    if (!currentReviewData) return;
    const {paper,grade,results,totalReviewScore,acceptType,accepted,beforeScores,afterScores,extraInfo} = currentReviewData;
    const delta = afterScores.total - beforeScores.total;
    const rows = results.map(r => `<div class="quick-review-row"><strong>${escapeQuickText(r.reviewer.name)}</strong><span class="${r.score > 0 ? 'positive' : r.score < 0 ? 'negative' : ''}">${escapeQuickText(r.decision)} (${r.score > 0 ? '+' : ''}${r.score})</span><p>${escapeQuickText(r.comment)}</p></div>`).join('');
    const improvement = results.reduce((sum,r) => sum + (r.improvement || 0),0);
    const conf = paper.conferenceInfo || {};
    showModal(accepted ? '🎉 论文录用' : '📝 论文审稿结果', `<div class="quick-review-heading ${accepted ? 'positive' : 'negative'}"><strong>${accepted ? '录用 · ' + escapeQuickText(acceptType || 'Poster') : '拒稿'}</strong><span>${escapeQuickText(conf.name || grade + '类会议')} ${escapeQuickText(conf.year || '')}</span></div>
        <p class="quick-paper-title">${escapeQuickText(paper.title)}</p>
        <div class="quick-review-score">审稿总分 ${totalReviewScore > 0 ? '+' : ''}${totalReviewScore}${accepted ? ` · 科研分 +${{A:4,B:2,C:1}[grade] || 0}` : ' · 稿件可修改后重投'}</div>
        ${rows}<div class="quick-review-change">稿件 ${beforeScores.total} → ${afterScores.total}（${delta >= 0 ? '+' : ''}${delta}）<br><small>实际衰减 −${(extraInfo.ideaDecay || 0) + (extraInfo.expDecay || 0)} · 审稿改进 +${improvement}${extraInfo.badReviewerCount ? ` · 确认后审稿压力 SAN−${getSanCostExplanation(extraInfo.badReviewerCount).actualCost}` : ''}</small></div>`,
        [{text:'详细评审',class:'btn-info',action:()=>showReviewResultPage(2)}, {text:'确定',class:'btn-primary',action:finalizeReviewResult}]);
}

function setQuickMotion(reduced) {
    document.body.classList.toggle('quiet-motion', reduced);
    try {localStorage.setItem('graduateSimulator_quietMotion', String(reduced));} catch {}
    document.querySelectorAll('[data-quiet-motion]').forEach(el => {el.checked = reduced;});
}

document.addEventListener('DOMContentLoaded', () => {
    const visitor = document.getElementById('visitor-stats');
    const stats = document.getElementById('stats-body');
    if (visitor && stats) stats.prepend(visitor);
    const intro = document.querySelector('.quick-intro');
    if (intro) document.getElementById('guide-body').prepend(intro);
    const record = document.getElementById('player-stats-start');
    document.getElementById('character-section').after(record);
    const preferences = document.createElement('label'); preferences.className = 'quick-motion-option';
    preferences.innerHTML = '<input type="checkbox" data-quiet-motion> 简洁动画';
    document.querySelector('.game-author').after(preferences);
    preferences.querySelector('input').addEventListener('change',e=>setQuickMotion(e.target.checked));
    let quiet = true;
    try {const saved=localStorage.getItem('graduateSimulator_quietMotion');if(saved!==null)quiet=saved==='true';} catch {}
    setQuickMotion(quiet);
    const inGamePreference = preferences.cloneNode(true);
    document.querySelector('#action-panel .utility-buttons').after(inGamePreference);
    inGamePreference.querySelector('input').addEventListener('change',e=>setQuickMotion(e.target.checked));
    setQuickMotion(quiet);
    document.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('.constellation-rune')){e.preventDefault();e.target.click();}});
});
