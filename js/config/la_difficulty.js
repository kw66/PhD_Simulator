// ==================== 文科版难度系统 ====================

// 文科版诅咒
const LA_CURSES = {
    topic_anxiety: {
        id: 'topic_anxiety',
        name: '选题焦虑',
        icon: '😰',
        desc: '初始SAN值-10',
        effect: { initialSanReduction: 10 },
        maxCount: 2,
        pointCosts: [1, 3],
        order: 1
    },
    plagiarism_nightmare: {
        id: 'plagiarism_nightmare',
        name: '查重噩梦',
        icon: '📋',
        desc: '写作分数永久-2',
        effect: { writeBonusPermanent: -2 },
        maxCount: 2,
        pointCosts: [1, 3],
        order: 2
    },
    literature_flood: {
        id: 'literature_flood',
        name: '文献洪海',
        icon: '🌊',
        desc: '读文献SAN消耗+1',
        effect: { readSanCost: 1 },
        maxCount: 2,
        pointCosts: [1, 2],
        order: 3
    },
    advisor_lost: {
        id: 'advisor_lost',
        name: '导师失联',
        icon: '🚫',
        desc: '导师好感上限-8',
        effect: { favorMaxReduction: 8 },
        maxCount: 2,
        pointCosts: [1, 3],
        order: 4
    },
    funding_shortage: {
        id: 'funding_shortage',
        name: '经费不足',
        icon: '💸',
        desc: '金币上限为10',
        effect: { goldMax: 10 },
        maxCount: 1,
        pointCosts: [2],
        order: 5
    },
    writing_block: {
        id: 'writing_block',
        name: '写作瓶颈',
        icon: '📝',
        desc: '写作分数每月衰减',
        effect: { writeDecayPeriod: 1, writeDecayAmount: 1 },
        maxCount: 3,
        pointCosts: [1, 2, 4],
        order: 6
    },
    review_delay: {
        id: 'review_delay',
        name: '审稿拖延',
        icon: '⏰',
        desc: '审稿周期+2个月',
        effect: { reviewDelayMonths: 2 },
        maxCount: 2,
        pointCosts: [1, 3],
        order: 7
    },
    format_hell: {
        id: 'format_hell',
        name: '格式地狱',
        icon: '📐',
        desc: '每次写作额外SAN-1',
        effect: { writeSanCost: 1 },
        maxCount: 2,
        pointCosts: [1, 2],
        order: 8
    },
    blind_review_fear: {
        id: 'blind_review_fear',
        name: '盲审恐惧',
        icon: '😨',
        desc: '每月SAN-1（博士）',
        effect: { monthlySanDrainPhd: 1 },
        maxCount: 3,
        pointCosts: [1, 2, 3],
        order: 9
    },
    competition_fierce: {
        id: 'competition_fierce',
        name: '同行内卷',
        icon: '🔥',
        desc: '转博/毕业要求+50%',
        effect: { graduationRequirementPercent: 50 },
        maxCount: 3,
        pointCosts: [1, 2, 3],
        order: 10
    },
    field_risk: {
        id: 'field_risk',
        name: '田野风险',
        icon: '🏕️',
        desc: '资料搜集50%失败',
        effect: { researchFailRate: 0.5 },
        maxCount: 2,
        pointCosts: [1, 3],
        order: 11
    },
    cross_discipline_barrier: {
        id: 'cross_discipline_barrier',
        name: '跨学科壁垒',
        icon: '🧱',
        desc: '跨学科研究分数-50%',
        effect: { crossDisciplinePenalty: 0.5 },
        maxCount: 1,
        pointCosts: [2],
        order: 12
    }
};

// 文科版祝福
const LA_BLESSINGS = {
    academic_talent: {
        id: 'academic_talent',
        name: '学术天赋',
        icon: '🧠',
        desc: '科研上限+4',
        effect: { researchMaxBonus: 4 },
        maxCount: 2,
        pointCosts: [-1, -3],
        order: 1
    },
    writing_fluency: {
        id: 'writing_fluency',
        name: '文思泉涌',
        icon: '✍️',
        desc: '写作永久+2',
        effect: { writeBonusPermanent: 2 },
        maxCount: 2,
        pointCosts: [-2, -4],
        order: 2
    },
    literature_intuition: {
        id: 'literature_intuition',
        name: '文献直觉',
        icon: '📚',
        desc: '选题分数永久+1',
        effect: { ideaBonusPermanent: 1 },
        maxCount: 2,
        pointCosts: [-1, -3],
        order: 3
    },
    advisor_favor: {
        id: 'advisor_favor',
        name: '导师赏识',
        icon: '💖',
        desc: '好感上限+4',
        effect: { favorMaxBonus: 4 },
        maxCount: 2,
        pointCosts: [-1, -3],
        order: 4
    },
    social_butterfly: {
        id: 'social_butterfly',
        name: '人脉广泛',
        icon: '🌐',
        desc: '社交上限+4',
        effect: { socialMaxBonus: 4 },
        maxCount: 2,
        pointCosts: [-1, -3],
        order: 5
    },
    wealthy_family: {
        id: 'wealthy_family',
        name: '家境优渥',
        icon: '💰',
        desc: '初始金币+5',
        effect: { initialGoldBonus: 5 },
        maxCount: 4,
        pointCosts: [-1, -2, -3, -4],
        order: 6
    },
    academic_family: {
        id: 'academic_family',
        name: '学术世家',
        icon: '🏛️',
        desc: '科研+3（初始）',
        effect: { initialResearchBonus: 3 },
        maxCount: 2,
        pointCosts: [-1, -3],
        order: 7
    },
    student_council: {
        id: 'student_council',
        name: '研究生会',
        icon: '🎓',
        desc: '社交+3（初始）',
        effect: { initialSocialBonus: 3 },
        maxCount: 2,
        pointCosts: [-1, -3],
        order: 8
    },
    cross_discipline_vision: {
        id: 'cross_discipline_vision',
        name: '跨学科视野',
        icon: '🔭',
        desc: '跨学科研究分数+50%',
        effect: { crossDisciplineBonus: 0.5 },
        maxCount: 1,
        pointCosts: [-3],
        order: 9
    },
    qualitative_talent: {
        id: 'qualitative_talent',
        name: '质性天赋',
        icon: '🎯',
        desc: '资料搜集永久+2',
        effect: { researchBonusPermanent: 2 },
        maxCount: 2,
        pointCosts: [-2, -4],
        order: 10
    },
    quantitative_talent: {
        id: 'quantitative_talent',
        name: '量化天赋',
        icon: '📊',
        desc: '资料搜集永久+2',
        effect: { researchBonusPermanent: 2 },
        maxCount: 2,
        pointCosts: [-2, -4],
        order: 11
    },
    undergrad_paper: {
        id: 'undergrad_paper',
        name: '本科成果',
        icon: '🏁',
        desc: '开局自带C类论文',
        effect: { startWithCPaper: true },
        maxCount: 2,
        pointCosts: [-3, -5],
        order: 12
    }
};

// ==================== 文科版难度调整 ====================
function applyLiberalArtsDifficulty() {
    if (!gameState) return;

    // 调整初始属性
    gameState.san = 25;        // 从20提高到25
    gameState.sanMax = 30;     // 从20提高到30
    gameState.gold = 3;        // 从1提高到3
    gameState.research = 2;    // 从1提高到2

    // 调整每月恢复
    gameState.laMonthlySanRecovery = 2;  // 从1提高到2

    // 调整操作消耗
    gameState.laReadSanCost = 1;         // 从2降低到1
    gameState.laIdeaSanCost = 1;         // 从2降低到1
    gameState.laExpSanCost = 2;          // 从3降低到2
    gameState.laWriteSanCost = 3;        // 从4降低到3
    gameState.laWorkSanCost = 3;         // 从5降低到3

    // 调整毕业要求（通过导师系统调整）
    gameState.laGraduationBonus = -2;    // 毕业要求-2

    // 调整录取率
    gameState.laAcceptanceRateBonus = 0.10;  // 录取率+10%

    addLog('难度调整', '文科版难度', 'SAN上限+10，初始金币+2，初始科研+1，毕业要求-2，录取率+10%');
}

// 全局导出
window.LA_CURSES = LA_CURSES;
window.LA_BLESSINGS = LA_BLESSINGS;
window.applyLiberalArtsDifficulty = applyLiberalArtsDifficulty;
