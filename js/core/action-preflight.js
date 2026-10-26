// Presentation and action preflight only. Gameplay values remain in their original modules.
function escapeQuickText(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
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

