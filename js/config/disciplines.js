// ==================== 学科选择系统 ====================

const DISCIPLINE_TREE = {
    humanities: {
        name: '人文学科',
        icon: '📖',
        desc: '研究人类文化、思想与精神世界的学科群',
        color: '#8B4513',
        disciplines: {
            chinese: {
                id: 'chinese',
                name: '中国语言文学',
                icon: '🖊️',
                desc: '古代文学、现当代文学、语言学、文艺理论',
                category: 'humanities'
            },
            history: {
                id: 'history',
                name: '历史学',
                icon: '📜',
                desc: '中国古代史、近现代史、世界史、考古学',
                category: 'humanities'
            },
            philosophy: {
                id: 'philosophy',
                name: '哲学',
                icon: '🤔',
                desc: '中国哲学、西方哲学、伦理学、逻辑学',
                category: 'humanities'
            },
            foreign_lang: {
                id: 'foreign_lang',
                name: '外国语言文学',
                icon: '🌍',
                desc: '英美文学、翻译学、语言教学',
                category: 'humanities'
            }
        }
    },
    social_science: {
        name: '社会学科',
        icon: '📊',
        desc: '研究社会现象、人类行为与制度的学科群',
        color: '#2E8B57',
        disciplines: {
            journalism: {
                id: 'journalism',
                name: '新闻传播学',
                icon: '📰',
                desc: '新闻学、传播学、广告学、新媒体',
                category: 'social_science'
            },
            information: {
                id: 'information',
                name: '信息资源管理',
                icon: '📚',
                desc: '图书馆学、情报学、档案学、出版学',
                category: 'social_science'
            },
            sociology: {
                id: 'sociology',
                name: '社会学',
                icon: '👥',
                desc: '社会学、社会工作、人类学、民俗学',
                category: 'social_science'
            },
            education: {
                id: 'education',
                name: '教育学',
                icon: '🎓',
                desc: '课程与教学论、高等教育学、教育技术学',
                category: 'social_science'
            }
        }
    }
};

// 当前选择的学科
let selectedDiscipline = null;
let selectedDisciplineCategory = null;

// 获取所有学科的平铺列表
function getAllDisciplines() {
    const all = [];
    Object.values(DISCIPLINE_TREE).forEach(cat => {
        Object.values(cat.disciplines).forEach(d => {
            all.push({ ...d, categoryName: cat.name, categoryIcon: cat.icon });
        });
    });
    return all;
}

// 根据ID获取学科信息
function getDisciplineById(id) {
    for (const cat of Object.values(DISCIPLINE_TREE)) {
        if (cat.disciplines[id]) {
            return { ...cat.disciplines[id], categoryName: cat.name };
        }
    }
    return null;
}

// 初始化学科选择界面
function initDisciplineSelection() {
    const startScreen = document.getElementById('start-screen');
    if (!startScreen) return;

    // 在角色选择区块之前插入学科选择
    const characterSection = document.getElementById('character-section');
    if (!characterSection) return;

    // 检查是否已存在学科选择区块
    if (document.getElementById('discipline-section')) return;

    const disciplineSection = document.createElement('div');
    disciplineSection.id = 'discipline-section';
    disciplineSection.className = 'collapsible-section';
    disciplineSection.style.marginBottom = '20px';

    let html = `
        <div class="collapsible-header" onclick="toggleDisciplineSection()">
            <h3 style="margin:0;font-size:0.95rem;color:var(--primary-color);display:flex;align-items:center;gap:6px;">
                <i class="fas fa-graduation-cap"></i> 选择学科方向
            </h3>
            <i class="fas fa-chevron-down collapse-toggle" id="discipline-collapse-icon"></i>
        </div>
        <div class="collapsible-body" id="discipline-body">
            <div style="padding:15px;">
    `;

    // 渲染两个大类
    Object.entries(DISCIPLINE_TREE).forEach(([catKey, cat]) => {
        html += `
            <div class="discipline-category" id="cat-${catKey}" style="margin-bottom:15px;">
                <div class="category-header" onclick="toggleCategory('${catKey}')" style="
                    display:flex;align-items:center;gap:8px;padding:10px 12px;
                    background:linear-gradient(135deg,${cat.color}15,${cat.color}08);
                    border:1px solid ${cat.color}30;border-radius:10px;cursor:pointer;
                    transition:all 0.2s;
                ">
                    <span style="font-size:1.3rem;">${cat.icon}</span>
                    <span style="font-weight:600;color:${cat.color};font-size:0.95rem;">${cat.name}</span>
                    <span style="font-size:0.75rem;color:var(--text-secondary);margin-left:auto;">${cat.desc}</span>
                    <i class="fas fa-chevron-down" id="cat-icon-${catKey}" style="color:${cat.color};transition:transform 0.2s;"></i>
                </div>
                <div class="category-disciplines" id="cat-body-${catKey}" style="display:none;padding:8px 0 0 0;">
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;">
        `;

        Object.values(cat.disciplines).forEach(d => {
            html += `
                <div class="discipline-card" data-id="${d.id}" onclick="selectDiscipline('${d.id}')" style="
                    display:flex;align-items:center;gap:10px;padding:12px;
                    background:var(--card-bg);border:2px solid var(--border-color);
                    border-radius:10px;cursor:pointer;transition:all 0.2s;
                " onmouseover="this.style.borderColor='${cat.color}';this.style.transform='translateY(-2px)'"
                   onmouseout="if(!this.classList.contains('selected')){this.style.borderColor='var(--border-color)';this.style.transform='translateY(0)'}">
                    <span style="font-size:1.5rem;">${d.icon}</span>
                    <div>
                        <div style="font-weight:600;font-size:0.9rem;color:var(--text-primary);">${d.name}</div>
                        <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px;">${d.desc}</div>
                    </div>
                </div>
            `;
        });

        html += `
                    </div>
                </div>
            </div>
        `;
    });

    html += `
                <div id="discipline-hint" style="text-align:center;font-size:0.8rem;color:var(--text-secondary);margin-top:10px;">
                    请先选择学科方向，再选择角色
                </div>
            </div>
        </div>
    `;

    disciplineSection.innerHTML = html;

    // 插入到角色选择之前
    characterSection.parentNode.insertBefore(disciplineSection, characterSection);

    // 初始状态下隐藏角色选择
    characterSection.style.display = 'none';
}

// 切换学科选择区域折叠
function toggleDisciplineSection() {
    const body = document.getElementById('discipline-body');
    const icon = document.getElementById('discipline-collapse-icon');
    if (body.style.display === 'none') {
        body.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
    } else {
        body.style.display = 'block'; // 学科选择不折叠
    }
}

// 切换大类展开/收起
function toggleCategory(catKey) {
    const body = document.getElementById(`cat-body-${catKey}`);
    const icon = document.getElementById(`cat-icon-${catKey}`);
    if (!body || !icon) return;

    if (body.style.display === 'none') {
        body.style.display = 'block';
        icon.style.transform = 'rotate(180deg)';
    } else {
        body.style.display = 'none';
        icon.style.transform = 'rotate(0deg)';
    }
}

// 选择学科
function selectDiscipline(disciplineId) {
    const discipline = getDisciplineById(disciplineId);
    if (!discipline) return;

    selectedDiscipline = disciplineId;
    selectedDisciplineCategory = discipline.category;

    // 更新选中状态
    document.querySelectorAll('.discipline-card').forEach(card => {
        card.classList.remove('selected');
        card.style.borderColor = 'var(--border-color)';
        card.style.transform = 'translateY(0)';
    });
    const selected = document.querySelector(`.discipline-card[data-id="${disciplineId}"]`);
    if (selected) {
        selected.classList.add('selected');
        const cat = DISCIPLINE_TREE[discipline.category];
        selected.style.borderColor = cat.color;
        selected.style.background = `${cat.color}10`;
    }

    // 更新提示
    const hint = document.getElementById('discipline-hint');
    if (hint) {
        hint.innerHTML = `✅ 已选择：<strong>${discipline.icon} ${discipline.name}</strong>（${discipline.categoryName}）`;
        hint.style.color = 'var(--success-color)';
    }

    // 显示角色选择
    const characterSection = document.getElementById('character-section');
    if (characterSection) {
        characterSection.style.display = 'block';
    }

    // 渲染学科对应的角色
    renderCharacterGrid();
}

// 应用学科配置到游戏数据
function applyDisciplineConfig() {
    if (!selectedDiscipline) return;
    const config = LA_DISCIPLINE_CONFIGS[selectedDiscipline];
    if (!config) return;

    // 覆盖论文标题生成器
    if (config.paperTitleWords && window.paperTitleWords) {
        Object.assign(window.paperTitleWords, config.paperTitleWords);
    }

    // 覆盖会议/期刊
    if (config.conferences && window.CONFERENCES) {
        Object.assign(window.CONFERENCES, config.conferences);
    }

    // 覆盖商店
    if (config.shopItems && window.shopItems) {
        // 清空原数组并填充新数据
        window.shopItems.length = 0;
        config.shopItems.forEach(item => window.shopItems.push(item));
    }

    // 覆盖角色（合并通用角色和学科角色）
    if (config.characters && window.characters) {
        window.characters.length = 0;
        config.characters.forEach(c => window.characters.push(c));
    }

    // 覆盖成就
    if (config.achievements && window.ALL_ACHIEVEMENTS) {
        window.ALL_ACHIEVEMENTS.length = 0;
        config.achievements.forEach(a => window.ALL_ACHIEVEMENTS.push(a));
    }

    // 覆盖结局名称
    if (config.endingNames && window.ENDING_NAMES) {
        Object.assign(window.ENDING_NAMES, config.endingNames);
    }

    // 覆盖结局要求
    if (config.endingRequirements && window.ENDING_REQUIREMENTS) {
        Object.assign(window.ENDING_REQUIREMENTS, config.endingRequirements);
    }

    // 存储学科信息到游戏状态
    gameState.discipline = selectedDiscipline;
    gameState.disciplineCategory = selectedDisciplineCategory;
    gameState.disciplineName = config.name;
    gameState.disciplineIcon = config.icon;
}

// 获取学科配置
function getDisciplineConfig() {
    if (!selectedDiscipline) return null;
    return LA_DISCIPLINE_CONFIGS[selectedDiscipline] || null;
}

// 全局导出
window.DISCIPLINE_TREE = DISCIPLINE_TREE;
window.initDisciplineSelection = initDisciplineSelection;
window.selectDiscipline = selectDiscipline;
window.applyDisciplineConfig = applyDisciplineConfig;
window.getDisciplineConfig = getDisciplineConfig;
window.getAllDisciplines = getAllDisciplines;
window.getDisciplineById = getDisciplineById;
window.toggleDisciplineSection = toggleDisciplineSection;
window.toggleCategory = toggleCategory;
