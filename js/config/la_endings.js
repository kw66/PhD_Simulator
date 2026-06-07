// ==================== 文科版结局系统 ====================

// 文科版结局名称
const LA_ENDING_NAMES = {
    // 通用结局
    'quit': '🚪 主动退学',
    'burnout': '😢 不堪重负',
    'expelled': '😭 逐出师门',
    'poor': '💸 穷困潦倒',
    'delay': '⏰ 延毕',
    'isolated': '😔 被孤立',

    // 硕士结局
    'master': '🎓 硕士毕业',
    'excellent_master': '🌟 优秀硕士',

    // 博士结局
    'phd': '🎓 博士毕业',
    'excellent_phd': '🏆 优秀博士',

    // 文科特色高级结局
    'academic_newstar': '📚 学术新星',
    'university_teacher': '👨‍🏫 高校教师',
    'field_expert': '📖 领域专家',
    'intellectual': '🏛️ 知识分子',

    // 人文学科特色结局
    'national_scholar': '🎓 国学大师',
    'writer_scholar': '🖊️ 作家学者',
    'cultural_inheritor': '📜 文化传承者',
    'independent_scholar': '📖 独立学者',
    'cultural_official': '🏛️ 文化官员',

    // 社会学科特色结局
    'famous_journalist': '📰 知名记者',
    'think_tank_expert': '📊 智库专家',
    'social_activist': '👥 社会活动家',
    'education_reformer': '🎓 教育改革者',
    'data_scientist': '📱 数据科学家',
    'enterprise_consultant': '💼 企业顾问',

    // 真实结局
    'true_phd': '🌟 真·博士毕业',
    'true_devotion': '💫 真·投身学术',
    'true_life': '🌈 真·感受生活'
};

// 文科版结局要求
const LA_ENDING_REQUIREMENTS = {
    'quit': '主动选择重开并确认退学',
    'burnout': 'SAN值降为负数',
    'expelled': '导师好感度降为负数',
    'poor': '金币降为负数',
    'delay': '毕业时间到但科研分不足（硕士<1或博士<7）',
    'isolated': '社交能力降为负数',

    'master': '硕士3年内科研分≥1',
    'excellent_master': '硕士3年内科研分≥4',

    'phd': '博士5年内科研分≥7',
    'excellent_phd': '博士毕业且A类论文≥3',

    // 文科特色高级结局
    'academic_newstar': '博士毕业且A类≥4、社交≥12',
    'university_teacher': '博士毕业且A类≥5',
    'field_expert': '博士毕业且总引用>500',
    'intellectual': '博士毕业且A类≥5、社交≥15、引用>1000',

    // 人文学科特色结局
    'national_scholar': '人文学科博士毕业且S类≥1、引用>1000',
    'writer_scholar': '人文学科博士毕业且发表≥10篇、写作≥15',
    'cultural_inheritor': '人文学科博士毕业且研究≥8篇',
    'independent_scholar': '人文学科博士毕业且引用>500、社交≥12',
    'cultural_official': '人文学科硕士毕业且社交≥15、好感≥12',

    // 社会学科特色结局
    'famous_journalist': '新传方向博士毕业且社交≥15',
    'think_tank_expert': '社科方向博士毕业且研究≥8篇、引用>500',
    'social_activist': '社会学方向博士毕业且社交≥20',
    'education_reformer': '教育学方向博士毕业且A类≥5',
    'data_scientist': '信管方向博士毕业且资料搜集≥20',
    'enterprise_consultant': '社科方向硕士毕业且社交≥15、金钱≥15',

    // 真实结局
    'true_phd': '使用真·大多数角色，博士毕业且发表≥3篇论文',
    'true_devotion': '使用真·大多数角色，博士毕业且总引用≥1000',
    'true_life': '使用真·大多数角色，顺利毕业且达成≥12个成就'
};

// 文科版硕士结局判定
function getLiberalArtsMasterEndingType() {
    const { social, favor, gold, publishedPapers, isTrueNormal, discipline, disciplineCategory } = gameState;
    const totalPapers = publishedPapers.length;

    // 真实结局判定（优先级最高）
    if (isTrueNormal) {
        const tempAchievements = collectLiberalArtsAchievements('master');
        const achievementCount = tempAchievements.length;
        if (totalCitations >= 1000) {
            return { type: 'true_devotion', title: '真·投身学术', desc: '你用最朴素的方式，达到了学术的巅峰。', emoji: '💫' };
        }
        if (achievementCount >= 12) {
            return { type: 'true_life', title: '真·感受生活', desc: '科研不是全部，你体验了丰富多彩的研究生生活。', emoji: '🌈' };
        }
    }

    // 文科特色硕士结局
    if (disciplineCategory === 'humanities') {
        if ((social || 0) >= 15 && (favor || 0) >= 12) {
            return { type: 'cultural_official', title: '文化官员', desc: '你以深厚的人文素养，进入文化部门工作。', emoji: '🏛️' };
        }
    } else if (disciplineCategory === 'social_science') {
        if ((social || 0) >= 15 && (gold || 0) >= 15) {
            return { type: 'enterprise_consultant', title: '企业顾问', desc: '你的社科背景让你在企业咨询领域如鱼得水。', emoji: '💼' };
        }
    }

    return null; // 返回 null 表示走通用硕士逻辑
}

// 文科版博士结局判定
function getLiberalArtsPhdEndingType() {
    const { paperA, totalCitations, bigBullCooperation, publishedPapers, isTrueNormal, discipline, disciplineCategory } = gameState;
    const totalPapers = publishedPapers.length;
    // ★★★ 修复：paperS 已包含 paperNature + paperNatureSub（papers.js 中同时递增），不应重复计算 ★★★
    const paperS = (gameState.paperNature || 0) + (gameState.paperNatureSub || 0);
    const effectivePaperA = paperA + paperS;

    // 真实结局判定（优先级最高）
    if (isTrueNormal) {
        const tempAchievements = collectLiberalArtsAchievements('phd');
        const achievementCount = tempAchievements.length;

        if (totalPapers >= 3) {
            return { type: 'true_phd', title: '真·博士毕业', desc: '没有任何外挂，你凭借自己的努力完成了博士学业。', emoji: '🌟' };
        }
        if (totalCitations >= 1000) {
            return { type: 'true_devotion', title: '真·投身学术', desc: '你用最朴素的方式，达到了学术的巅峰。', emoji: '💫' };
        }
        if (achievementCount >= 12) {
            return { type: 'true_life', title: '真·感受生活', desc: '科研不是全部，你体验了丰富多彩的研究生生活。', emoji: '🌈' };
        }
        return { type: 'phd', title: '博士毕业', desc: '恭喜！你顺利完成了博士学业！', emoji: '🎓' };
    }

    // 学科特色结局判定
    if (disciplineCategory === 'humanities') {
        // 人文学科特色结局
        if (effectivePaperA >= 5 && totalCitations > 1000 && bigBullCooperation)
            return { type: 'national_scholar', title: '国学大师', desc: '你的学术成就令人瞩目，成为领域权威！', emoji: '🎓' };
        if (totalPapers >= 10 && (gameState.research || 0) >= 15)
            return { type: 'writer_scholar', title: '作家学者', desc: '学术与创作兼修，你是文坛新星！', emoji: '🖊️' };
        if (totalPapers >= 8)
            return { type: 'cultural_inheritor', title: '文化传承者', desc: '你为文化传承做出了重要贡献！', emoji: '📜' };
        if (totalCitations > 500 && (gameState.social || 0) >= 12)
            return { type: 'independent_scholar', title: '独立学者', desc: '你以独立之精神，成就学术之自由！', emoji: '📖' };
    } else if (disciplineCategory === 'social_science') {
        // 社会学科特色结局
        if (discipline === 'journalism' && (gameState.social || 0) >= 15)
            return { type: 'famous_journalist', title: '知名记者', desc: '你用笔记录时代，成为媒体人！', emoji: '📰' };
        if (totalPapers >= 8 && totalCitations > 500)
            return { type: 'think_tank_expert', title: '智库专家', desc: '你的研究为政策制定提供了重要参考！', emoji: '📊' };
        if (discipline === 'sociology' && (gameState.social || 0) >= 20)
            return { type: 'social_activist', title: '社会活动家', desc: '你推动了社会进步！', emoji: '👥' };
        if (discipline === 'education' && effectivePaperA >= 5)
            return { type: 'education_reformer', title: '教育改革者', desc: '你引领了教育变革！', emoji: '🎓' };
        if (discipline === 'information' && (gameState.research || 0) >= 20)
            return { type: 'data_scientist', title: '数据科学家', desc: '你成功转型为数据行业专家！', emoji: '📱' };
    }

    // 通用高级结局
    if (effectivePaperA >= 5 && totalCitations > 1000)
        return { type: 'intellectual', title: '知识分子', desc: '你是真正的知识分子，学术与社会责任兼备！', emoji: '🏛️' };
    if (effectivePaperA >= 5)
        return { type: 'university_teacher', title: '高校教师', desc: '你成功留校成为高校教师！', emoji: '👨‍🏫' };
    if (totalCitations > 500)
        return { type: 'field_expert', title: '领域专家', desc: '你在学术领域取得了重要成就！', emoji: '📖' };
    if (effectivePaperA >= 4 && (gameState.social || 0) >= 12)
        return { type: 'academic_newstar', title: '学术新星', desc: '你是学术界冉冉升起的新星！', emoji: '📚' };
    if (effectivePaperA >= 3)
        return { type: 'excellent_phd', title: '优秀博士毕业', desc: '恭喜！你以优异的成绩完成了博士学业！', emoji: '🏆' };

    return { type: 'phd', title: '博士毕业', desc: '恭喜！你顺利完成了博士学业！', emoji: '🎓' };
}

// 文科版成就收集
function collectLiberalArtsAchievements(endingType) {
    const a = [];
    const graduationEndings = ['master', 'excellent_master', 'phd', 'excellent_phd', 'academic_newstar', 'university_teacher', 'field_expert', 'intellectual', 'national_scholar', 'writer_scholar', 'cultural_inheritor', 'independent_scholar', 'cultural_official', 'famous_journalist', 'think_tank_expert', 'social_activist', 'education_reformer', 'data_scientist', 'enterprise_consultant', 'true_phd', 'true_devotion', 'true_life'];
    const isGraduated = graduationEndings.includes(endingType);

    // 不需要毕业也可获得的成就
    if (gameState.hasLover) a.push('❤️ 喜结良缘');
    if (gameState.gold >= 30) a.push('💰 家财万贯');
    if (gameState.research > 15 && gameState.social > 15 && gameState.favor > 15 && gameState.gold > 15) a.push('⬡ 六边形战士');
    if (gameState.research >= 20) a.push('🏆 诺奖选手');
    if (gameState.social >= 20) a.push('🌸 交际花');
    if (gameState.favor >= 20) a.push('🤝 铁杆师生');
    if (gameState.publishedPapers.length >= 10) a.push('🤖 论文机器');
    if (gameState.totalCitations >= 1000) a.push('📚 千引大佬');
    if (gameState.rejectedCount >= 5) a.push('👊 越战越勇');
    if (gameState.achievementConditions && gameState.achievementConditions.rejectedPhdTwice) a.push('🧠 人间清醒');
    if (gameState.maxConcurrentReviews >= 4) a.push('🔥 火力全开');

    // 文科特色成就
    if ((gameState.readCount || 0) >= 30) a.push('📖 书虫');
    if (gameState.publishedPapers.length >= 10 || (gameState.research || 0) >= 15) a.push('✍️ 文采飞扬');
    if (gameState.achievementConditions && gameState.achievementConditions.tripleRejected) a.push('📝 修改达人');

    // 毕业相关成就
    if (isGraduated) {
        if (gameState.san > 20) a.push('⚡ 精力满满');
        const first5Submissions = (gameState.submissionHistory || []).slice(0, 5);
        if (first5Submissions.length >= 5 && first5Submissions.every(s => s.accepted)) a.push('🎯 百发百中');
        if ((gameState.workCount || 0) >= 10) a.push('💼 打工狂人');
        if ((gameState.readCount || 0) >= 20) a.push('📖 爱看论文');
        if (gameState.achievementConditions && gameState.achievementConditions.topStudent) a.push('🏅 三好学生');
    }

    return a;
}

// 全局导出
window.LA_ENDING_NAMES = LA_ENDING_NAMES;
window.LA_ENDING_REQUIREMENTS = LA_ENDING_REQUIREMENTS;
window.getLiberalArtsMasterEndingType = getLiberalArtsMasterEndingType;
window.getLiberalArtsPhdEndingType = getLiberalArtsPhdEndingType;
window.collectLiberalArtsAchievements = collectLiberalArtsAchievements;
