// ==================== 文科版新手引导系统 ====================

// 文科版新手引导步骤
const LA_GUIDE_STEPS = [
    {
        id: 'welcome',
        title: '欢迎来到文科研究生模拟器！',
        icon: '📚',
        content: '你将体验文科研究生的学术生涯，平衡科研、生活和人际关系，努力发表论文，最终顺利毕业。',
        position: 'center'
    },
    {
        id: 'discipline',
        title: '选择学科方向',
        icon: '🎓',
        content: '首先选择你的学科方向。人文学科（中文、历史、哲学、外语）和社会学科（新传、信管、社会学、教育学）各有特色。',
        target: '#discipline-section',
        position: 'bottom'
    },
    {
        id: 'character',
        title: '选择角色',
        icon: '👤',
        content: '每个角色有不同的初始属性和特殊能力。选择适合你游戏风格的角色。',
        target: '#character-section',
        position: 'bottom'
    },
    {
        id: 'attributes',
        title: '属性系统',
        icon: '📊',
        content: 'SAN值（精神状态）、科研能力、社交能力、导师好感度、金币。保持它们为正数，否则会触发不良结局。',
        target: '#attributes-panel',
        position: 'right'
    },
    {
        id: 'actions',
        title: '基本操作',
        icon: '🎮',
        content: '读文献（积累灵感）、选题（确定研究方向）、资料搜集（获取数据）、写论文（产出成果）。每月只能执行一次持续操作。',
        target: '#action-panel',
        position: 'left'
    },
    {
        id: 'papers',
        title: '论文系统',
        icon: '📝',
        content: '论文有S/A/B/C/D五个等级。选题→资料搜集→写论文→投稿→审稿→中稿/拒稿。论文分数会随时间衰减。',
        target: '#workstation-panel',
        position: 'left'
    },
    {
        id: 'graduation',
        title: '毕业目标',
        icon: '🎓',
        content: '硕士3年，博士5年。达到导师要求的科研分即可毕业。科研分=发表论文的等级分数之和。',
        target: '#time-display-panel',
        position: 'bottom'
    }
];

// 当前引导步骤
let currentGuideStep = 0;

// 显示新手引导
function showLiberalArtsGuide() {
    currentGuideStep = 0;
    showGuideStep(currentGuideStep);
}

// 显示指定步骤
function showGuideStep(stepIndex) {
    if (stepIndex >= LA_GUIDE_STEPS.length) {
        closeGuide();
        return;
    }

    const step = LA_GUIDE_STEPS[stepIndex];
    const totalSteps = LA_GUIDE_STEPS.length;

    const html = `
        <div style="text-align:center;margin-bottom:15px;">
            <div style="font-size:2rem;margin-bottom:8px;">${step.icon}</div>
            <div style="font-size:1.1rem;font-weight:600;color:var(--primary-color);">${step.title}</div>
            <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;">步骤 ${stepIndex + 1}/${totalSteps}</div>
        </div>
        <div style="padding:12px;background:var(--light-bg);border-radius:8px;margin-bottom:15px;">
            <div style="font-size:0.9rem;line-height:1.6;">${step.content}</div>
        </div>
        <div style="display:flex;justify-content:space-between;">
            <button class="btn btn-secondary" onclick="skipGuide()" style="font-size:0.8rem;">
                跳过引导
            </button>
            <div>
                ${stepIndex > 0 ? `<button class="btn btn-info" onclick="prevGuideStep()" style="font-size:0.8rem;margin-right:8px;">上一步</button>` : ''}
                <button class="btn btn-primary" onclick="nextGuideStep()" style="font-size:0.8rem;">
                    ${stepIndex < totalSteps - 1 ? '下一步' : '开始游戏'}
                </button>
            </div>
        </div>
    `;

    showModal('📖 新手引导', html, []);
}

// 下一步
function nextGuideStep() {
    currentGuideStep++;
    if (currentGuideStep >= LA_GUIDE_STEPS.length) {
        closeGuide();
        // 标记引导已完成
        localStorage.setItem('la_guide_completed', 'true');
    } else {
        showGuideStep(currentGuideStep);
    }
}

// 上一步
function prevGuideStep() {
    if (currentGuideStep > 0) {
        currentGuideStep--;
        showGuideStep(currentGuideStep);
    }
}

// 跳过引导
function skipGuide() {
    closeGuide();
    localStorage.setItem('la_guide_completed', 'true');
}

// 关闭引导
function closeGuide() {
    closeModal();
}

// 检查是否需要显示引导
function shouldShowGuide() {
    return !localStorage.getItem('la_guide_completed');
}

// 重置引导状态
function resetGuide() {
    localStorage.removeItem('la_guide_completed');
}

// 全局导出
window.LA_GUIDE_STEPS = LA_GUIDE_STEPS;
window.showLiberalArtsGuide = showLiberalArtsGuide;
window.showGuideStep = showGuideStep;
window.nextGuideStep = nextGuideStep;
window.prevGuideStep = prevGuideStep;
window.skipGuide = skipGuide;
window.closeGuide = closeGuide;
window.shouldShowGuide = shouldShowGuide;
window.resetGuide = resetGuide;
