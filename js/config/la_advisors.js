// ==================== 文科版导师系统 ====================

// 文科版导师类型
const LA_ADVISOR_TYPES = {
    level1: {
        id: 'level1',
        name: '一级教授',
        title: '长江学者',
        icon: '🏅',
        color: '#b8860b',
        probability: 0.05,
        requirements: {
            phdYear2: 4,
            phdYear3: 6,
            masterGrad: 3,
            phdGrad: 15
        },
        salary: { master: 1.75, phd: 3.5 },
        researchResourceRange: [11, 14],
        initialAffinityRange: [1, 3],
        papersRange: [50, 80],       // 文科论文数量较少
        citationsRange: [3000, 5000] // 文科引用较少
    },
    level2: {
        id: 'level2',
        name: '二级教授',
        title: '万人计划/新世纪人才/青年长江',
        icon: '🌟',
        color: '#e67e22',
        probability: 0.10,
        requirements: {
            phdYear2: 3,
            phdYear3: 5,
            masterGrad: 3,
            phdGrad: 13
        },
        salary: { master: 1.5, phd: 3.25 },
        researchResourceRange: [9, 12],
        initialAffinityRange: [2, 3],
        papersRange: [30, 50],
        citationsRange: [1500, 3000]
    },
    level3: {
        id: 'level3',
        name: '三级教授',
        title: '教授',
        icon: '⭐',
        color: '#9b59b6',
        probability: 0.20,
        requirements: {
            phdYear2: 3,
            phdYear3: 4,
            masterGrad: 2,
            phdGrad: 11
        },
        salary: { master: 1.25, phd: 3.0 },
        researchResourceRange: [7, 10],
        initialAffinityRange: [2, 4],
        papersRange: [15, 30],
        citationsRange: [500, 1500]
    },
    level4: {
        id: 'level4',
        name: '四级教授',
        title: '教授',
        icon: '🎓',
        color: '#3498db',
        probability: 0.25,
        requirements: {
            phdYear2: 2,
            phdYear3: 3,
            masterGrad: 2,
            phdGrad: 9
        },
        salary: { master: 1, phd: 2.75 },
        researchResourceRange: [5, 8],
        initialAffinityRange: [3, 4],
        papersRange: [8, 15],
        citationsRange: [200, 500]
    },
    level5: {
        id: 'level5',
        name: '副教授',
        title: '副教授',
        icon: '📚',
        color: '#2ecc71',
        probability: 0.40,
        requirements: {
            phdYear2: 2,
            phdYear3: 3,
            masterGrad: 1,
            phdGrad: 7
        },
        salary: { master: 1, phd: 2.5 },
        researchResourceRange: [3, 6],
        initialAffinityRange: [3, 5],
        papersRange: [3, 8],
        citationsRange: [50, 200]
    }
};

// 文科版学校类型
const LA_UNIVERSITY_TYPES = {
    comprehensive: {
        name: '综合性大学',
        icon: '🏛️',
        bonus: { researchMax: 1 },
        desc: '科研上限+1'
    },
    normal: {
        name: '师范大学',
        icon: '📚',
        bonus: { favor: 1 },
        desc: '导师好感度+1'
    },
    liberal_arts: {
        name: '文科大学',
        icon: '🖊️',
        bonus: { research: 1, researchMax: 1 },
        desc: '科研能力+1，科研上限+1'
    },
    social_science: {
        name: '社科大学',
        icon: '📊',
        bonus: { social: 1 },
        desc: '社交能力+1'
    },
    finance: {
        name: '财经大学',
        icon: '💹',
        bonus: { gold: 2 },
        desc: '金钱+2'
    },
    politics: {
        name: '政法大学',
        icon: '⚖️',
        bonus: { favor: 1, social: 1 },
        desc: '导师好感度+1，社交能力+1'
    },
    agriculture: {
        name: '农业大学',
        icon: '🌾',
        bonus: { sanMax: 2 },
        desc: 'SAN上限+2'
    }
};

// 替换导师系统
function applyLiberalArtsAdvisorSystem() {
    if (typeof window.ADVISOR_TYPES !== 'undefined') {
        Object.assign(window.ADVISOR_TYPES, LA_ADVISOR_TYPES);
    }
    if (typeof window.UNIVERSITY_TYPES !== 'undefined') {
        Object.assign(window.UNIVERSITY_TYPES, LA_UNIVERSITY_TYPES);
    }
}

// 全局导出
window.LA_ADVISOR_TYPES = LA_ADVISOR_TYPES;
window.LA_UNIVERSITY_TYPES = LA_UNIVERSITY_TYPES;
window.applyLiberalArtsAdvisorSystem = applyLiberalArtsAdvisorSystem;
