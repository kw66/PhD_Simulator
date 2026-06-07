// ==================== 文科版全局文本替换系统 ====================
// 在游戏启动时一次性替换所有用户可见的CS术语为文科术语

const LA_TEXT_REPLACEMENTS = {
    // === 成就描述替换 ===
    achievements: {
        '🤖 机械飞升': '商店购买5本参考书',
        '🛋️ 豪华工位': '同时拥有护眼台灯+大屏显示器+舒适键盘+二手书架+绿植盆栽',
        '📰 Nature在手': '发表一篇顶级期刊论文',
        '📰📰 好事成双': '发表2篇顶级期刊论文',
        '📖 爱看论文': '至少读20次文献',
        '🤖 论文机器': '发表论文总数≥10',
        '📖 书虫': '至少读30次文献',
        '📖 青出于蓝': '你的论文总引用数超过导师的引用数'
    },

    // === 结局描述替换 ===
    endings: {
        '诺奖之始': '学术巅峰',
        '真·诺奖之始': '真·学术巅峰',
        '发表Nature论文，你已踏上诺奖之路！': '发表顶级期刊论文，你已踏上学术巅峰之路！',
        '没有任何外挂，你凭借自己的努力发表了Nature论文！': '没有任何外挂，你凭借自己的努力发表了顶级期刊论文！'
    },

    // === 日志事件替换 ===
    logEvents: {
        '看论文': '读文献',
        '想idea': '选题',
        '做实验': '资料搜集',
        '想idea分数': '选题分数',
        '做实验分数': '资料搜集分数',
        'idea分数': '选题分数',
        '实验分数': '资料搜集分数',
        '下次想idea': '下次选题',
        '下次做实验': '下次资料搜集',
        '想idea精通': '选题精通',
        '做实验精通': '资料搜集精通',
        '累计想idea': '累计选题',
        '累计做实验': '累计资料搜集',
        '每次想idea': '每次选题',
        '每次做实验': '每次资料搜集',
        '想idea多想': '选题多想',
        '做实验多做': '资料搜集多做',
        '连续想idea': '连续选题',
        '连续做实验': '连续资料搜集',
        '自动浏览论文': '自动浏览文献',
        '双屏显示器': '大屏显示器'
    },

    // === Buff名称替换 ===
    buffNames: {
        '下次想idea分数': '下次选题分数',
        '下次做实验分数': '下次资料搜集分数',
        '想idea分数': '选题分数',
        '做实验分数': '资料搜集分数',
        '下次想idea多想': '下次选题多想',
        '下次做实验多做': '下次资料搜集多做',
        '想idea SAN': '选题 SAN',
        '做实验 SAN': '资料搜集 SAN',
        '看论文 SAN': '读文献 SAN',
        '想idea总分': '选题总分',
        '做实验总分': '资料搜集总分'
    },

    // === UI文本替换 ===
    uiText: {
        '想idea': '选题',
        '做实验': '资料搜集',
        '看论文': '读文献',
        '挂arxiv': '挂预印本',
        '小红书宣传': '自媒体推广',
        'Nature论文': '顶级期刊论文',
        'Nature子刊': '顶级子刊论文',
        'Nature正刊': '顶级正刊论文',
        'GPU服务器': '二手书架',
        '租GPU服务器': '租参考书',
        '机械键盘': '舒适键盘',
        '2K显示器': '大屏显示器',
        '工学椅': '护眼台灯',
        '咖啡机': '绿植盆栽',
        '冰美式': '奶茶',
        'AI Lab实习': '出版社实习'
    }
};

// 应用所有文本替换
function applyAllLATextReplacements() {
    if (!gameState || !gameState.discipline) return;

    // 替换成就描述
    if (typeof ACHIEVEMENT_REQUIREMENTS !== 'undefined') {
        for (const [key, value] of Object.entries(LA_TEXT_REPLACEMENTS.achievements)) {
            if (ACHIEVEMENT_REQUIREMENTS[key]) {
                ACHIEVEMENT_REQUIREMENTS[key] = value;
            }
        }
    }

    // 替换结局名称
    if (typeof ENDING_NAMES !== 'undefined') {
        for (const [key, value] of Object.entries(LA_TEXT_REPLACEMENTS.endings)) {
            for (const endingKey of Object.keys(ENDING_NAMES)) {
                const endingValue = ENDING_NAMES[endingKey];
                if (endingValue.includes(key)) {
                    ENDING_NAMES[endingKey] = endingValue.replace(key, value);
                }
            }
        }
    }

    // ★★★ 修复：替换结局描述（在 ENDING_REQUIREMENTS 中）★★★
    if (typeof ENDING_REQUIREMENTS !== 'undefined') {
        for (const [key, value] of Object.entries(LA_TEXT_REPLACEMENTS.endings)) {
            for (const reqKey of Object.keys(ENDING_REQUIREMENTS)) {
                const reqValue = ENDING_REQUIREMENTS[reqKey];
                if (reqValue && reqValue.includes(key)) {
                    ENDING_REQUIREMENTS[reqKey] = reqValue.replace(key, value);
                }
            }
        }
    }
}

// 替换日志文本中的CS术语
function replaceLATextInLog(text) {
    if (!gameState || !gameState.discipline) return text;

    let result = text;
    for (const [key, value] of Object.entries(LA_TEXT_REPLACEMENTS.logEvents)) {
        result = result.replace(new RegExp(key, 'g'), value);
    }
    return result;
}

// 替换Buff名称中的CS术语
function replaceLATextInBuffName(name) {
    if (!gameState || !gameState.discipline) return name;

    let result = name;
    for (const [key, value] of Object.entries(LA_TEXT_REPLACEMENTS.buffNames)) {
        result = result.replace(new RegExp(key, 'g'), value);
    }
    return result;
}

// 替换UI文本中的CS术语
function replaceLATextInUI(text) {
    if (!gameState || !gameState.discipline) return text;

    let result = text;
    for (const [key, value] of Object.entries(LA_TEXT_REPLACEMENTS.uiText)) {
        result = result.replace(new RegExp(key, 'g'), value);
    }
    return result;
}

// 全局导出
window.LA_TEXT_REPLACEMENTS = LA_TEXT_REPLACEMENTS;
window.applyAllLATextReplacements = applyAllLATextReplacements;
window.replaceLATextInLog = replaceLATextInLog;
window.replaceLATextInBuffName = replaceLATextInBuffName;
window.replaceLATextInUI = replaceLATextInUI;
