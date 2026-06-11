// ==================== 文科版UI文字覆盖 ====================
// 用于在文科版中替换理工科术语为文科术语

const LA_UI_OVERRIDES = {
    // 操作名称映射
    actions: {
        readPaper: '读文献',
        thinkIdea: '选题',
        doExperiment: '资料搜集',
        writePaper: '写论文',
        partTimeJob: '打工'
    },

    // 论文分数名称映射
    paperScores: {
        ideaScore: '选题分',
        expScore: '资料分',
        writeScore: '写作分'
    },

    // 日志事件名称映射
    logEvents: {
        '看论文': '读文献',
        '想idea': '选题',
        '做实验': '资料搜集',
        '写论文': '写论文',
        '想idea分数': '选题分数',
        '做实验分数': '资料搜集分数',
        '写论文分数': '写作分数',
        'idea分数': '选题分数',
        '实验分数': '资料搜集分数',
        '写作分数': '写作分数',
        'idea-': '选题-',
        '实验-': '资料-',
        '下次想idea': '下次选题',
        '下次做实验': '下次资料搜集',
        '下次写论文': '下次写作',
        'idea bonus': '选题加成',
        'exp bonus': '资料搜集加成',
        'write bonus': '写作加成'
    },

    // Buff名称映射
    buffNames: {
        'idea_bonus': '选题加成',
        'exp_bonus': '资料搜集加成',
        'write_bonus': '写作加成',
        'idea_times': '选题次数',
        'exp_times': '资料搜集次数',
        'write_times': '写作次数'
    },

    // 成就描述映射（替换CS特定描述）
    achievementDescriptions: {
        '🤖 机械飞升': '商店购买5本参考书',
        '🛋️ 豪华工位': '同时拥有护眼台灯+大屏显示器+舒适键盘+二手书架+绿植盆栽',
        '📰 Nature在手': '发表一篇顶级期刊论文',
        '📰📰 好事成双': '发表2篇顶级期刊论文',
        '📖 爱看论文': '至少读20次文献',
        '🤖 论文机器': '发表论文总数≥10',
        '📖 书虫': '至少读30次文献'
    },

    // 论文等级名称
    paperGrades: {
        'S': '顶级期刊',
        'A': 'CSSCI核心',
        'B': '北大核心',
        'C': '普通期刊',
        'D': '学报'
    },

    // 论文槽提示
    paperSlotHints: {
        'ideaScore': '选题分',
        'expScore': '资料搜集分',
        'writeScore': '写作分'
    }
};

// 获取文科版UI文字
function getLAUIText(originalText) {
    if (!gameState || !gameState.discipline) return originalText;

    // 检查日志事件映射
    for (const [key, value] of Object.entries(LA_UI_OVERRIDES.logEvents)) {
        if (originalText.includes(key)) {
            originalText = originalText.replace(new RegExp(key, 'g'), value);
        }
    }

    return originalText;
}

// 获取文科版论文分数标签
function getLAPaperScoreLabel(scoreType) {
    if (!gameState || !gameState.discipline) {
        return scoreType === 'ideaScore' ? 'Idea' : scoreType === 'expScore' ? '实验' : '写作';
    }
    return LA_UI_OVERRIDES.paperScores[scoreType] || scoreType;
}

// 获取文科版论文等级名称
function getLAPaperGradeName(grade) {
    if (!gameState || !gameState.discipline) {
        return grade;
    }
    return LA_UI_OVERRIDES.paperGrades[grade] || grade;
}

// 全局导出
window.LA_UI_OVERRIDES = LA_UI_OVERRIDES;
window.getLAUIText = getLAUIText;
window.getLAPaperScoreLabel = getLAPaperScoreLabel;
window.getLAPaperGradeName = getLAPaperGradeName;
