// ==================== 文科版实习系统 ====================

// 文科版实习选项
const LA_INTERNSHIP_OPTIONS = {
    common: [
        {
            id: 'research_institute',
            name: '研究机构实习',
            icon: '🏛️',
            desc: '金钱+2/月，科研+1/月，SAN-1/月',
            requirements: { research: 8 },
            effects: { gold: 2, research: 1, san: -1 },
            category: 'all'
        },
        {
            id: 'cultural_company',
            name: '文化公司实习',
            icon: '🏢',
            desc: '金钱+3/月，SAN-2/月',
            requirements: { social: 6 },
            effects: { gold: 3, san: -2 },
            category: 'humanities'
        },
        {
            id: 'think_tank',
            name: '智库实习',
            icon: '🧠',
            desc: '金钱+2/月，科研+1/月',
            requirements: { research: 8, social: 8 },
            effects: { gold: 2, research: 1 },
            category: 'social_science'
        }
    ],
    discipline_specific: {
        chinese: [
            {
                id: 'publishing_house',
                name: '出版社实习',
                icon: '📚',
                desc: '金钱+2/月，SAN-1/月',
                requirements: { social: 8 },
                effects: { gold: 2, san: -1 },
                category: 'chinese'
            },
            {
                id: 'literary_magazine',
                name: '文学杂志社实习',
                icon: '📰',
                desc: '金钱+1/月，科研+1/月',
                requirements: { research: 6 },
                effects: { gold: 1, research: 1 },
                category: 'chinese'
            }
        ],
        history: [
            {
                id: 'museum',
                name: '博物馆实习',
                icon: '🏛️',
                desc: '金钱+1/月，科研+1/月',
                requirements: { research: 6 },
                effects: { gold: 1, research: 1 },
                category: 'history'
            },
            {
                id: 'archive',
                name: '档案馆实习',
                icon: '📜',
                desc: '金钱+1/月，科研+1/月',
                requirements: { research: 8 },
                effects: { gold: 1, research: 1 },
                category: 'history'
            }
        ],
        philosophy: [
            {
                id: 'ethics_committee',
                name: '伦理委员会实习',
                icon: '⚖️',
                desc: '金钱+1/月，科研+1/月',
                requirements: { research: 8 },
                effects: { gold: 1, research: 1 },
                category: 'philosophy'
            }
        ],
        foreign_lang: [
            {
                id: 'translation_company',
                name: '翻译公司实习',
                icon: '🌍',
                desc: '金钱+3/月，SAN-1/月',
                requirements: { social: 6 },
                effects: { gold: 3, san: -1 },
                category: 'foreign_lang'
            },
            {
                id: 'international_school',
                name: '国际学校实习',
                icon: '🏫',
                desc: '金钱+2/月，社交+1/月',
                requirements: { social: 8 },
                effects: { gold: 2, social: 1 },
                category: 'foreign_lang'
            }
        ],
        journalism: [
            {
                id: 'media_company',
                name: '媒体公司实习',
                icon: '📺',
                desc: '金钱+2/月，社交+1/月，SAN-1/月',
                requirements: { social: 8 },
                effects: { gold: 2, social: 1, san: -1 },
                category: 'journalism'
            },
            {
                id: 'news_agency',
                name: '新闻社实习',
                icon: '📰',
                desc: '金钱+2/月，社交+1/月',
                requirements: { social: 6 },
                effects: { gold: 2, social: 1 },
                category: 'journalism'
            }
        ],
        information: [
            {
                id: 'library',
                name: '图书馆实习',
                icon: '📚',
                desc: '金钱+1/月，科研+1/月',
                requirements: { research: 6 },
                effects: { gold: 1, research: 1 },
                category: 'information'
            },
            {
                id: 'data_company',
                name: '数据公司实习',
                icon: '📊',
                desc: '金钱+3/月，SAN-1/月',
                requirements: { research: 8 },
                effects: { gold: 3, san: -1 },
                category: 'information'
            }
        ],
        sociology: [
            {
                id: 'ngo',
                name: 'NGO实习',
                icon: '🌍',
                desc: '金钱+1/月，社交+1/月',
                requirements: { social: 8 },
                effects: { gold: 1, social: 1 },
                category: 'sociology'
            },
            {
                id: 'community_center',
                name: '社区中心实习',
                icon: '🏠',
                desc: '金钱+1/月，社交+1/月',
                requirements: { social: 6 },
                effects: { gold: 1, social: 1 },
                category: 'sociology'
            }
        ],
        education: [
            {
                id: 'school',
                name: '学校实习',
                icon: '🏫',
                desc: '金钱+1/月，科研+1/月',
                requirements: { favor: 8 },
                effects: { gold: 1, research: 1 },
                category: 'education'
            },
            {
                id: 'edu_company',
                name: '教育公司实习',
                icon: '📚',
                desc: '金钱+3/月，SAN-1/月',
                requirements: { social: 6 },
                effects: { gold: 3, san: -1 },
                category: 'education'
            }
        ]
    }
};

// 获取学科对应的实习选项
function getLiberalArtsInternshipOptions(discipline, category) {
    const options = [...LA_INTERNSHIP_OPTIONS.common];

    // 添加细分学科实习
    if (LA_INTERNSHIP_OPTIONS.discipline_specific[discipline]) {
        options.push(...LA_INTERNSHIP_OPTIONS.discipline_specific[discipline]);
    }

    // 按类别过滤
    return options.filter(opt => {
        if (opt.category === 'all') return true;
        if (opt.category === category) return true;
        if (opt.category === discipline) return true;
        return false;
    });
}

// 检查是否满足实习要求
function checkInternshipRequirements(internship) {
    const req = internship.requirements;
    if (req.research && (gameState.research || 0) < req.research) return false;
    if (req.social && (gameState.social || 0) < req.social) return false;
    if (req.favor && (gameState.favor || 0) < req.favor) return false;
    return true;
}

// 应用实习效果（每月）
function applyInternshipEffects() {
    if (!gameState.internship) return;

    const internship = gameState.internship;
    const effects = internship.effects;

    let logDetail = '';

    if (effects.gold) {
        gameState.gold += effects.gold;
        logDetail += `金币+${effects.gold}`;
    }
    if (effects.research) {
        gameState.research = Math.min(gameState.researchMax || 20, gameState.research + effects.research);
        logDetail += `${logDetail ? '，' : ''}科研+${effects.research}`;
    }
    if (effects.social) {
        gameState.social = Math.min(gameState.socialMax || 20, gameState.social + effects.social);
        logDetail += `${logDetail ? '，' : ''}社交+${effects.social}`;
    }
    if (effects.san) {
        gameState.san = Math.max(0, gameState.san + effects.san);
        logDetail += `${logDetail ? '，' : ''}SAN${effects.san > 0 ? '+' : ''}${effects.san}`;
    }

    if (logDetail) {
        addLog('实习', internship.name, logDetail);
    }
}

// 显示实习选择弹窗
function showInternshipSelectionModal() {
    const discipline = gameState.discipline;
    const category = gameState.disciplineCategory;

    if (!discipline || !category) return;

    const options = getLiberalArtsInternshipOptions(discipline, category);
    const availableOptions = options.filter(opt => checkInternshipRequirements(opt));

    if (availableOptions.length === 0) {
        showModal('💼 实习机会', '<p>暂时没有合适的实习机会，继续提升自己的能力吧！</p>',
            [{ text: '确定', class: 'btn-primary', action: closeModal }]);
        return;
    }

    const buttons = availableOptions.map(opt => {
        return {
            text: `${opt.icon} ${opt.name}（${opt.desc}）`,
            class: 'btn-primary',
            action: () => {
                gameState.internship = opt;
                addLog('实习', `开始${opt.name}实习`, opt.desc);
                closeModal();
                updateAllUI();
            }
        };
    });

    buttons.push({ text: '暂不实习', class: 'btn-info', action: closeModal });

    showModal('💼 实习机会', '<p>选择一份实习工作：</p>', buttons);
}

// 结束实习
function endInternship() {
    if (!gameState.internship) return;

    const internshipName = gameState.internship.name;
    gameState.internship = null;
    addLog('实习', `结束${internshipName}实习`, '回归校园生活');
    updateAllUI();
}

// 全局导出
window.LA_INTERNSHIP_OPTIONS = LA_INTERNSHIP_OPTIONS;
window.getLiberalArtsInternshipOptions = getLiberalArtsInternshipOptions;
window.checkInternshipRequirements = checkInternshipRequirements;
window.applyInternshipEffects = applyInternshipEffects;
window.showInternshipSelectionModal = showInternshipSelectionModal;
window.endInternship = endInternship;
