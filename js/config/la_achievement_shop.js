// ==================== 文科版成就币商店 ====================

// 文科版成就币商店商品
const LA_ACHIEVEMENT_SHOP_ITEMS = [
    {
        id: 'academic_lucky',
        name: '学术锦鲤',
        icon: '🐟',
        desc: '下次投稿必定中稿（C类）',
        price: 3,
        effect: { type: 'guaranteed_accept', grade: 'C' },
        category: 'consumable'
    },
    {
        id: 'favor_card',
        name: '导师好感卡',
        icon: '💖',
        desc: '好感+3',
        price: 2,
        effect: { type: 'favor', value: 3 },
        category: 'consumable'
    },
    {
        id: 'san_kit',
        name: 'SAN急救包',
        icon: '💊',
        desc: 'SAN+5',
        price: 1,
        effect: { type: 'san', value: 5 },
        category: 'consumable'
    },
    {
        id: 'research_booster',
        name: '科研加速器',
        icon: '🚀',
        desc: '科研+2',
        price: 3,
        effect: { type: 'research', value: 2 },
        category: 'consumable'
    },
    {
        id: 'social_card',
        name: '社交达人卡',
        icon: '🤝',
        desc: '社交+3',
        price: 2,
        effect: { type: 'social', value: 3 },
        category: 'consumable'
    },
    {
        id: 'gold_pack',
        name: '金币红包',
        icon: '🧧',
        desc: '金币+5',
        price: 1,
        effect: { type: 'gold', value: 5 },
        category: 'consumable'
    },
    {
        id: 'idea_inspiration',
        name: '论文灵感',
        icon: '💡',
        desc: '下次选题分数+10',
        price: 2,
        effect: { type: 'idea_bonus', value: 10 },
        category: 'consumable'
    },
    {
        id: 'reviewer_favor',
        name: '审稿人情',
        icon: '🤝',
        desc: '下次投稿审稿人全为心软',
        price: 4,
        effect: { type: 'all_kind_reviewers' },
        category: 'consumable'
    },
    {
        id: 'free_conference',
        name: '免费会议',
        icon: '🎫',
        desc: '下次会议免费参加',
        price: 2,
        effect: { type: 'free_conference' },
        category: 'consumable'
    },
    {
        id: 'write_buff',
        name: '写作灵感',
        icon: '✍️',
        desc: '下次写作分数+8',
        price: 2,
        effect: { type: 'write_bonus', value: 8 },
        category: 'consumable'
    }
];

// 显示文科版成就币商店
function showLiberalArtsAchievementShop() {
    const coins = gameState.achievementCoins || 0;

    let html = `
        <div style="text-align:center;margin-bottom:15px;">
            <div style="font-size:1.5rem;margin-bottom:8px;">🏆 成就币商店</div>
            <div style="font-size:0.9rem;color:var(--text-secondary);">当前成就币: <strong style="color:var(--warning-color);">${coins}</strong></div>
        </div>
        <div style="max-height:400px;overflow-y:auto;">
    `;

    LA_ACHIEVEMENT_SHOP_ITEMS.forEach(item => {
        const canAfford = coins >= item.price;
        const buttonClass = canAfford ? 'btn-primary' : 'btn-secondary';
        const disabled = canAfford ? '' : 'disabled';

        html += `
            <div style="display:flex;align-items:center;gap:10px;padding:10px;margin-bottom:8px;background:var(--light-bg);border-radius:8px;border:1px solid var(--border-color);">
                <span style="font-size:1.5rem;">${item.icon}</span>
                <div style="flex:1;">
                    <div style="font-weight:600;font-size:0.9rem;">${item.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-secondary);">${item.desc}</div>
                </div>
                <button class="btn ${buttonClass}" ${disabled} onclick="buyAchievementItem('${item.id}')" style="padding:4px 8px;font-size:0.75rem;">
                    ${item.price}币
                </button>
            </div>
        `;
    });

    html += '</div>';

    showModal('🏆 成就币商店', html, [
        { text: '关闭', class: 'btn-info', action: closeModal }
    ]);
}

// 购买成就币商品
function buyAchievementItem(itemId) {
    const item = LA_ACHIEVEMENT_SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;

    const coins = gameState.achievementCoins || 0;
    if (coins < item.price) {
        showModal('❌ 购买失败', '<p>成就币不足！</p>',
            [{ text: '确定', class: 'btn-primary', action: closeModal }]);
        return;
    }

    // 扣除成就币
    gameState.achievementCoins -= item.price;

    // 应用效果
    applyAchievementItemEffect(item);

    // 记录日志
    addLog('成就商店', `购买${item.name}`, `成就币-${item.price}，${item.desc}`);

    // 更新UI
    updateAllUI();

    // 显示购买成功
    showModal('✅ 购买成功', `<p>成功购买 <strong>${item.icon} ${item.name}</strong>！</p><p>${item.desc}</p>`,
        [{ text: '确定', class: 'btn-primary', action: () => { closeModal(); showLiberalArtsAchievementShop(); } }]);
}

// 应用成就币商品效果
function applyAchievementItemEffect(item) {
    const effect = item.effect;

    switch (effect.type) {
        case 'san':
            gameState.san = Math.min(gameState.sanMax, gameState.san + effect.value);
            break;
        case 'research':
            gameState.research = Math.min(gameState.researchMax || 20, gameState.research + effect.value);
            break;
        case 'social':
            gameState.social = Math.min(gameState.socialMax || 20, gameState.social + effect.value);
            break;
        case 'favor':
            gameState.favor = Math.min(gameState.favorMax || 20, gameState.favor + effect.value);
            break;
        case 'gold':
            gameState.gold += effect.value;
            break;
        case 'idea_bonus':
            gameState.buffs.temporary.push({
                type: 'idea_bonus',
                name: '论文灵感',
                value: effect.value,
                permanent: false
            });
            break;
        case 'write_bonus':
            gameState.buffs.temporary.push({
                type: 'write_bonus',
                name: '写作buff',
                value: effect.value,
                permanent: false
            });
            break;
        case 'guaranteed_accept':
            gameState.guaranteedAccept = effect.grade;
            break;
        case 'all_kind_reviewers':
            gameState.allKindReviewers = true;
            break;
        case 'free_conference':
            gameState.freeConference = true;
            break;
    }
}

// 全局导出
window.LA_ACHIEVEMENT_SHOP_ITEMS = LA_ACHIEVEMENT_SHOP_ITEMS;
window.showLiberalArtsAchievementShop = showLiberalArtsAchievementShop;
window.buyAchievementItem = buyAchievementItem;
window.applyAchievementItemEffect = applyAchievementItemEffect;
