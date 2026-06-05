// ==================== 文科版审稿系统适配 ====================

// 文科版审稿人类型
const LA_REVIEWER_TYPES = {
    normal: {
        name: '普通审稿人',
        icon: '👤',
        probability: 0.30,
        desc: '正常评审',
        category: 'standard'
    },
    kind: {
        name: '心软审稿人',
        icon: '😊',
        probability: 0.08,
        desc: '宽容',
        category: 'lenient'
    },
    expert: {
        name: '资深大牛',
        icon: '🏅',
        probability: 0.08,
        desc: '严格但公正',
        category: 'standard'
    },
    hostile: {
        name: '恶意小同行',
        icon: '😠',
        probability: 0.12,
        desc: '故意刁难',
        category: 'strict'
    },
    format_checker: {
        name: '格式审查员',
        icon: '📐',
        probability: 0.15,
        desc: '只看格式',
        category: 'strict'
    },
    procrastinator: {
        name: '拖延症审稿人',
        icon: '🐌',
        probability: 0.10,
        desc: '审稿周期翻倍',
        category: 'standard'
    },
    citation_extortionist: {
        name: '引用绑架者',
        icon: '🔗',
        probability: 0.10,
        desc: '要求引用自己的论文',
        category: 'strict'
    },
    cross_discipline: {
        name: '跨学科专家',
        icon: '🌍',
        probability: 0.07,
        desc: '跨学科视角',
        category: 'standard'
    }
};

// 文科版期刊审稿周期配置
const LA_REVIEW_CYCLES = {
    S: { min: 6, max: 12, desc: '顶级期刊' },
    A: { min: 3, max: 6, desc: 'CSSCI核心' },
    B: { min: 2, max: 4, desc: '北大核心' },
    C: { min: 1, max: 3, desc: '普通期刊' },
    D: { min: 1, max: 2, desc: '学报' }
};

// 文科版录取率配置
const LA_ACCEPTANCE_RATES = {
    S: { min: 0.05, max: 0.15, target: 0.10 },
    A: { min: 0.15, max: 0.25, target: 0.20 },
    B: { min: 0.25, max: 0.35, target: 0.30 },
    C: { min: 0.40, max: 0.55, target: 0.45 },
    D: { min: 0.55, max: 0.70, target: 0.60 }
};

// 文科版审稿阈值配置
const LA_REVIEW_THRESHOLDS = {
    S: {
        kind: { reject: 60, borderline: 80 },
        normal: { reject: 70, borderline: 90 },
        expert: { reject: 70, borderline: 90 },
        hostile: { reject: 90, borderline: 110 },
        format_checker: { reject: 80, borderline: 100 },
        procrastinator: { reject: 70, borderline: 90 },
        citation_extortionist: { reject: 85, borderline: 105 },
        cross_discipline: { reject: 65, borderline: 85 }
    },
    A: {
        kind: { reject: 40, borderline: 60 },
        normal: { reject: 50, borderline: 80 },
        expert: { reject: 50, borderline: 80 },
        hostile: { reject: 70, borderline: 100 },
        format_checker: { reject: 60, borderline: 90 },
        procrastinator: { reject: 50, borderline: 80 },
        citation_extortionist: { reject: 65, borderline: 95 },
        cross_discipline: { reject: 45, borderline: 70 }
    },
    B: {
        kind: { reject: 25, borderline: 40 },
        normal: { reject: 30, borderline: 50 },
        expert: { reject: 30, borderline: 50 },
        hostile: { reject: 40, borderline: 60 },
        format_checker: { reject: 35, borderline: 55 },
        procrastinator: { reject: 30, borderline: 50 },
        citation_extortionist: { reject: 38, borderline: 58 },
        cross_discipline: { reject: 28, borderline: 45 }
    },
    C: {
        kind: { reject: 10, borderline: 20 },
        normal: { reject: 15, borderline: 30 },
        expert: { reject: 15, borderline: 30 },
        hostile: { reject: 20, borderline: 40 },
        format_checker: { reject: 18, borderline: 35 },
        procrastinator: { reject: 15, borderline: 30 },
        citation_extortionist: { reject: 18, borderline: 38 },
        cross_discipline: { reject: 12, borderline: 25 }
    },
    D: {
        kind: { reject: 5, borderline: 15 },
        normal: { reject: 10, borderline: 20 },
        expert: { reject: 10, borderline: 20 },
        hostile: { reject: 15, borderline: 30 },
        format_checker: { reject: 12, borderline: 25 },
        procrastinator: { reject: 10, borderline: 20 },
        citation_extortionist: { reject: 12, borderline: 28 },
        cross_discipline: { reject: 8, borderline: 18 }
    }
};

// 获取文科版审稿周期
function getLAReviewCycle(grade) {
    const cycle = LA_REVIEW_CYCLES[grade] || LA_REVIEW_CYCLES.C;
    return cycle.min + Math.floor(Math.random() * (cycle.max - cycle.min + 1));
}

// 生成文科版审稿人
function generateLAReviewer() {
    const rand = Math.random();
    let cumulative = 0;

    for (const [type, config] of Object.entries(LA_REVIEWER_TYPES)) {
        cumulative += config.probability;
        if (rand < cumulative) {
            return type;
        }
    }

    return 'normal'; // 默认
}

// 获取文科版审稿阈值
function getLAReviewThreshold(grade, reviewerType) {
    const gradeThresholds = LA_REVIEW_THRESHOLDS[grade] || LA_REVIEW_THRESHOLDS.C;
    return gradeThresholds[reviewerType] || gradeThresholds.normal;
}

// 文科版审稿意见生成
function generateLAReviewComment(reviewerType, result) {
    const comments = {
        accept: {
            normal: ['选题新颖，论证充分', '文献综述详实，分析有深度', '研究方法得当，结论可靠'],
            kind: ['非常好的研究，值得发表', '创新性强，学术价值高', '写作规范，逻辑清晰'],
            expert: ['研究有重要贡献', '填补了领域空白', '方法论有创新'],
            hostile: ['虽然有不足，但整体可以接受', '勉强达到发表水平', '需要小修后发表'],
            format_checker: ['格式规范，符合要求', '参考文献格式正确', '排版整洁'],
            procrastinator: ['审稿延迟致歉，论文质量不错', '终于审完了，可以发表', '抱歉耽搁了，论文没问题'],
            citation_extortionist: ['建议引用XX文献（审稿人自己的论文）', '参考文献需要补充', '引用不够全面'],
            cross_discipline: ['跨学科视角很有价值', '为领域带来新思路', '交叉研究有前景']
        },
        borderline: {
            normal: ['创新性不足，但研究扎实', '需要补充实验数据', '论证可以更充分'],
            kind: ['有潜力，建议修改后重投', '基本达到要求，需要完善', '可以考虑发表'],
            expert: ['研究有局限性', '需要更严谨的方法', '结论需要更多证据'],
            hostile: ['创新性存疑', '方法论有缺陷', '需要大幅修改'],
            format_checker: ['格式需要调整', '参考文献格式不统一', '排版需要改进'],
            procrastinator: ['审稿周期较长，需要重新审视', '时间跨度大，需要更新文献', '建议补充最新研究'],
            citation_extortionist: ['引用不够全面，需要补充', '缺少关键文献', '参考文献需要扩展'],
            cross_discipline: ['跨学科研究需要更深入', '理论框架需要完善', '方法论需要更严谨']
        },
        reject: {
            normal: ['创新性不足', '研究方法有缺陷', '结论缺乏证据支持'],
            kind: ['很遗憾，论文需要重大修改', '研究有潜力，但目前不适合发表', '建议修改后重新投稿'],
            expert: ['研究设计有严重问题', '文献综述不全面', '理论贡献不足'],
            hostile: ['论文质量不达标', '研究没有价值', '建议放弃投稿'],
            format_checker: ['格式严重不符合要求', '需要完全重写', '不符合期刊要求'],
            procrastinator: ['审稿周期过长，论文已过时', '研究问题已失去时效性', '建议重新选题'],
            citation_extortionist: ['引用严重不足', '缺少核心文献', '参考文献质量低'],
            cross_discipline: ['跨学科研究不成熟', '理论框架混乱', '方法论不适用']
        }
    };

    const typeComments = comments[result][reviewerType] || comments[result].normal;
    return typeComments[Math.floor(Math.random() * typeComments.length)];
}

// 全局导出
window.LA_REVIEWER_TYPES = LA_REVIEWER_TYPES;
window.LA_REVIEW_CYCLES = LA_REVIEW_CYCLES;
window.LA_ACCEPTANCE_RATES = LA_ACCEPTANCE_RATES;
window.LA_REVIEW_THRESHOLDS = LA_REVIEW_THRESHOLDS;
window.getLAReviewCycle = getLAReviewCycle;
window.generateLAReviewer = generateLAReviewer;
window.getLAReviewThreshold = getLAReviewThreshold;
window.generateLAReviewComment = generateLAReviewComment;
