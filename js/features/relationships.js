        // ==================== 人际关系网络系统 ====================

        // ==================== 随机姓名生成器 ====================
        const NAME_DATABASE = {
            // 姓氏库
            surnames: [
                '李', '阳', '袁', '缪', '庄', '盛', '陈', '徐', '梁', '明',
                '马', '王', '汪', '张', '刘', '郑', '钱', '赵', '魏', '贾',
                '姜', '邹', '侯', '杨', '向', '廖', '牛', '谢', '吴', '文',
                '辛', '崔', '韩', '姚', '詹', '余', '罗', '陆', '黄', '姬',
                '朱', '殷', '储', '宋', '白', '方', '谭', '龚', '俞', '章'
            ],
            // 名字用字库（可单字或双字组合）
            givenNameChars: [
                '旭', '霖', '沁', '宏', '皓', '洁', '长', '涛', '婉', '仪',
                '典', '墨', '天', '翔', '子', '凯', '俊', '驰', '怡', '哲',
                '铭', '聪', '临', '风', '兴', '彦', '泱', '家', '振', '力',
                '嫣', '可', '心', '梦', '欣', '啟', '嘉', '靖', '东', '宣',
                '普', '叶', '林', '淞', '垚', '希', '轩', '睿', '航', '智',
                '骞', '雨', '霄', '宇', '在', '吉', '祥', '禹', '博', '晨',
                '百', '川', '云', '松', '丰', '麟', '英', '卓', '骏', '亮',
                '倚', '钦', '奎', '佳', '择', '涵', '蕾', '寅', '虎', '泽',
                '坤', '岩', '锦', '雷', '楠', '辉', '志', '伟', '国', '君',
                '斌', '琪', '晓', '屿', '俣', '路', '强', '璇', '婷', '杰',
                '生', '宁', '雅', '江', '颖', '海', '能', '乾', '思', '名'
            ]
        };

        // 生成随机姓名
        function generateRandomName() {
            const surname = NAME_DATABASE.surnames[Math.floor(Math.random() * NAME_DATABASE.surnames.length)];

            // 90%概率双字名（三字姓名），10%概率单字名（两字姓名）
            const isDoubleChar = Math.random() < 0.9;
            let givenName;

            if (isDoubleChar) {
                const char1 = NAME_DATABASE.givenNameChars[Math.floor(Math.random() * NAME_DATABASE.givenNameChars.length)];
                let char2 = NAME_DATABASE.givenNameChars[Math.floor(Math.random() * NAME_DATABASE.givenNameChars.length)];
                // 避免两个字相同（除非是叠字名的情况，10%概率）
                if (char1 === char2 && Math.random() > 0.1) {
                    char2 = NAME_DATABASE.givenNameChars[Math.floor(Math.random() * NAME_DATABASE.givenNameChars.length)];
                }
                givenName = char1 + char2;
            } else {
                givenName = NAME_DATABASE.givenNameChars[Math.floor(Math.random() * NAME_DATABASE.givenNameChars.length)];
            }

            return surname + givenName;
        }

        // ==================== 导师系统 ====================
        const ADVISOR_TYPES = {
            level1: {
                id: 'level1',
                name: '一级教授',
                title: '院士',
                icon: '🏅',
                color: '#b8860b',  // 暗金色
                probability: 0.05,
                requirements: {
                    phdYear2: 4,      // 第二年转博要求
                    phdYear3: 6,      // 第三年转博要求
                    masterGrad: 3,    // 硕士毕业要求
                    phdGrad: 15       // 博士毕业要求
                },
                salary: { master: 1.75, phd: 3.5 },
                researchResourceRange: [11, 14],
                initialAffinityRange: [1, 3],
                papersRange: [700, 900],      // 论文数范围
                citationsRange: [70000, 90000] // 引用数范围
            },
            level2: {
                id: 'level2',
                name: '二级教授',
                titles: ['长江学者', '千人计划', '杰青'],
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
                papersRange: [500, 700],
                citationsRange: [50000, 70000]
            },
            level3: {
                id: 'level3',
                name: '三级教授',
                title: '四青',
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
                papersRange: [250, 350],
                citationsRange: [25000, 35000]
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
                papersRange: [80, 120],
                citationsRange: [8000, 12000]
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
                papersRange: [40, 60],
                citationsRange: [4000, 6000]
            }
        };

        // ★★★ 导师类型顺序（确保概率计算正确）★★★
        const ADVISOR_TYPE_ORDER = ['level5', 'level4', 'level3', 'level2', 'level1'];

        // 生成随机导师
        function generateRandomAdvisor() {
            const r = Math.random();
            const advisorTypes = window.ADVISOR_TYPES || ADVISOR_TYPES;
            let selectedType = null;

            // ★★★ 修复：使用明确的顺序，从最常见到最稀有 ★★★
            // level5: 40%, level4: 25%, level3: 20%, level2: 10%, level1: 5%
            if (r < 0.40) {
                selectedType = advisorTypes.level5;  // 副教授 40%
            } else if (r < 0.65) {
                selectedType = advisorTypes.level4;  // 四级教授 25%
            } else if (r < 0.85) {
                selectedType = advisorTypes.level3;  // 三级教授 20%
            } else if (r < 0.95) {
                selectedType = advisorTypes.level2;  // 二级教授 10%
            } else {
                selectedType = advisorTypes.level1;  // 一级教授 5%
            }

            if (!selectedType) selectedType = advisorTypes.level5;

            const [minRes, maxRes] = selectedType.researchResourceRange;
            const researchResource = Math.floor(Math.random() * (maxRes - minRes + 1)) + minRes;

            // 随机亲和度
            const [minAff, maxAff] = selectedType.initialAffinityRange;
            const affinity = Math.floor(Math.random() * (maxAff - minAff + 1)) + minAff;

            // 处理level2的随机头衔
            let title;
            if (selectedType.titles) {
                title = selectedType.titles[Math.floor(Math.random() * selectedType.titles.length)];
            } else {
                title = selectedType.title;
            }

            // 随机论文数和引用数
            const [minPapers, maxPapers] = selectedType.papersRange;
            const papers = Math.floor(Math.random() * (maxPapers - minPapers + 1)) + minPapers;

            const [minCitations, maxCitations] = selectedType.citationsRange;
            const citations = Math.floor(Math.random() * (maxCitations - minCitations + 1)) + minCitations;

            // 任务条和关系条
            const taskMultiplier = Math.floor(Math.random() * 5) + 6;  // 随机6-10
            const taskMax = researchResource * taskMultiplier + 20;  // 任务条上限 = 科研资源*随机6-10+20
            const relationMax = 40;  // 关系条上限固定40

            // ★★★ 修复：随机学校 ★★★
            const university = getRandomUniversity();

            return {
                id: `advisor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'advisor',
                advisorType: selectedType.id,
                name: generateRandomName(),
                title: title,
                university: university,  // ★★★ 修复：添加学校信息 ★★★
                researchResource: researchResource,
                affinity: affinity,
                papers: papers,
                citations: citations,
                description: `发表论文${papers}篇，总引用${citations}`,
                addedAt: gameState ? gameState.totalMonths : 0,  // 相识时间
                // 进度条属性
                taskProgress: 0,
                relationProgress: 0,
                taskMax: taskMax,
                taskMultiplier: taskMultiplier,  // 保存乘数用于后续更新
                relationMax: relationMax,
                taskUsedThisMonth: false,  // 本月是否已推进任务
                // ★★★ 新增：互动统计 ★★★
                stats: {
                    taskCount: 0,        // 推进任务次数
                    interactCount: 0,    // 交流次数
                    completedCount: 0,   // 任务完成次数（获得奖励）
                    helpReceivedCount: 0 // 对方帮助你的次数
                }
            };
        }

        // 生成指定类型的导师
        function generateAdvisorOfType(typeId) {
            const selectedType = (window.ADVISOR_TYPES || ADVISOR_TYPES)[typeId];
            if (!selectedType) return generateRandomAdvisor();

            const [minRes, maxRes] = selectedType.researchResourceRange;
            const researchResource = Math.floor(Math.random() * (maxRes - minRes + 1)) + minRes;

            const [minAff, maxAff] = selectedType.initialAffinityRange;
            const affinity = Math.floor(Math.random() * (maxAff - minAff + 1)) + minAff;

            let title;
            if (selectedType.titles) {
                title = selectedType.titles[Math.floor(Math.random() * selectedType.titles.length)];
            } else {
                title = selectedType.title;
            }

            const [minPapers, maxPapers] = selectedType.papersRange;
            const papers = Math.floor(Math.random() * (maxPapers - minPapers + 1)) + minPapers;

            const [minCitations, maxCitations] = selectedType.citationsRange;
            const citations = Math.floor(Math.random() * (maxCitations - minCitations + 1)) + minCitations;

            const taskMultiplier = Math.floor(Math.random() * 5) + 6;  // 随机6-10
            const taskMax = researchResource * taskMultiplier + 20;
            const relationMax = 40;

            // ★★★ 新增：随机学校 ★★★
            const university = getRandomUniversity();

            return {
                id: `advisor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'advisor',
                advisorType: selectedType.id,
                name: generateRandomName(),
                title: title,
                university: university,  // ★★★ 新增：学校信息 ★★★
                researchResource: researchResource,
                affinity: affinity,
                papers: papers,
                citations: citations,
                description: `发表论文${papers}篇，总引用${citations}`,
                addedAt: gameState ? gameState.totalMonths : 0,
                taskProgress: 0,
                relationProgress: 0,
                taskMax: taskMax,
                taskMultiplier: taskMultiplier,  // 保存乘数用于后续更新
                relationMax: relationMax,
                taskUsedThisMonth: false,
                // ★★★ 新增：互动统计 ★★★
                stats: {
                    taskCount: 0,        // 推进任务次数
                    interactCount: 0,    // 交流次数
                    completedCount: 0,   // 任务完成次数（获得奖励）
                    helpReceivedCount: 0 // 对方帮助你的次数
                }
            };
        }

        // 生成4个随机导师选项
        function generateAdvisorOptions() {
            const options = [];
            // ★★★ 第一个选项固定为副教授，保证基础玩法 ★★★
            options.push(generateAdvisorOfType('level5'));
            // 后三个随机生成
            for (let i = 1; i < 4; i++) {
                options.push(generateRandomAdvisor());
            }
            return options;
        }

        // 获取当前导师的要求（已应用难度诅咒修正）
        function getAdvisorRequirements() {
            const advisor = gameState.relationships.find(r => r.type === 'advisor');
            const advisorTypes = window.ADVISOR_TYPES || ADVISOR_TYPES;
            let baseRequirements;
            if (!advisor || !advisor.advisorType) {
                // 默认使用副教授的要求（向后兼容）
                baseRequirements = advisorTypes.level5.requirements;
            } else {
                baseRequirements = advisorTypes[advisor.advisorType].requirements;
            }

            // ★★★ 应用难度诅咒修正 ★★★
            const phdBonus = gameState.phdRequirementBonus || 0;
            const gradBonus = gameState.graduationRequirementBonus || 0;

            return {
                phdYear2: baseRequirements.phdYear2 + phdBonus,
                phdYear3: baseRequirements.phdYear3 + phdBonus,
                masterGrad: baseRequirements.masterGrad + gradBonus,
                phdGrad: baseRequirements.phdGrad + gradBonus
            };
        }

        // 获取当前导师的工资
        // 1.5 = 偶数月发2元，奇数月发1元
        // 1.25 = 4,8,12月发2元，其他月发1元
        function getAdvisorSalary(degree) {
            const advisor = gameState.relationships.find(r => r.type === 'advisor');
            if (!advisor || !advisor.advisorType) {
                return degree === 'phd' ? 3 : 1;
            }
            const advisorType = ADVISOR_TYPES[advisor.advisorType];
            const baseSalary = advisorType.salary[degree] || (degree === 'phd' ? 3 : 1);

            // 整数工资直接返回
            if (Number.isInteger(baseSalary)) {
                return baseSalary;
            }

            const currentMonth = gameState.month;

            // 1.5 = 偶数月发2元，奇数月发1元
            if (baseSalary === 1.5) {
                return currentMonth % 2 === 0 ? 2 : 1;
            }

            // 1.25 = 4,8,12月发2元，其他月发1元
            if (baseSalary === 1.25) {
                return [4, 8, 12].includes(currentMonth) ? 2 : 1;
            }

            // 其他小数向下取整
            return Math.floor(baseSalary);
        }

        // ==================== 人物类型定义 ====================
        const RELATIONSHIP_TYPES = {
            advisor: { name: '导师', icon: '👨‍🏫', color: '#e74c3c', fixed: true, hasGender: false },
            senior: { name: '师兄师姐', icon: '👨‍🎓', color: '#3498db', fixed: false, hasGender: true, maleName: '师兄', femaleName: '师姐' },
            junior: { name: '师弟师妹', icon: '🧑‍🎓', color: '#2ecc71', fixed: false, hasGender: true, maleName: '师弟', femaleName: '师妹' },
            peer: { name: '同级', icon: '🤝', color: '#9b59b6', fixed: false, hasGender: false },
            lover: { name: '恋人', icon: '💕', color: '#e91e63', fixed: false, hasGender: false },
            self: { name: '自己', icon: '👤', color: '#34495e', fixed: true, hasGender: false }
        };

        // 关系属性初始值范围
        const RELATIONSHIP_INITIAL_STATS = {
            senior: { researchRange: [4, 12], affinityRange: [2, 3] },
            junior: { researchRange: [0, 6], affinityRange: [2, 4] },
            peer: { researchRange: [3, 9], affinityRange: [3, 5] },
            // ★★★ 恋人的科研能力和亲密度根据类型动态计算 ★★★
            lover: { dynamicStats: true }
        };

        // ==================== 人际关系网络管理 ====================

        // ★★★ 修改：检查并更新社交解锁（永久解锁机制）★★★
        function checkSocialUnlock(silent = false) {
            // ★★★ 兼容旧存档：初始化永久解锁记录 ★★★
            if (gameState.relationshipSlotsUnlocked === undefined) {
                // 根据当前社交能力计算应该有多少槽位
                let slots = 2;
                if (gameState.social >= 6) slots++;
                if (gameState.social >= 12) slots++;
                if (gameState.social >= 18) slots++;
                gameState.relationshipSlotsUnlocked = slots;
            }

            // ★★★ 修复：thresholds[i]表示解锁槽位i所需的社交能力 ★★★
            const thresholds = [0, 0, 0, 6, 12, 18];  // thresholds[3]=6解锁槽3, thresholds[4]=12解锁槽4, thresholds[5]=18解锁槽5
            let newUnlock = false;
            let newSlots = gameState.relationshipSlotsUnlocked;

            // 检查是否有新的解锁（槽位2是默认的，从槽位3开始检查）
            for (let i = 3; i <= 5; i++) {
                if (gameState.social >= thresholds[i] && gameState.relationshipSlotsUnlocked < i) {
                    newSlots = i;
                    newUnlock = true;
                }
            }

            // 更新永久解锁记录
            if (newSlots > gameState.relationshipSlotsUnlocked) {
                gameState.relationshipSlotsUnlocked = newSlots;
                if (!silent && newUnlock) {
                    showModal('🎉 新关系槽解锁！',
                        `<p>恭喜！社交能力达到${gameState.social}，解锁关系槽${gameState.relationshipSlotsUnlocked}！</p>`,
                        [{ text: '太棒了！', class: 'btn-primary', action: closeModal }]);
                    renderRelationshipPanel();
                }
            }

            return newUnlock;
        }

        // ★★★ 修改：获取当前解锁的槽位数量（使用永久解锁记录）★★★
        function getUnlockedSlots() {
            // ★★★ 兼容旧存档：如果没有永久解锁记录，先检查一次 ★★★
            if (gameState.relationshipSlotsUnlocked === undefined) {
                checkSocialUnlock(true);
            }
            // 返回永久解锁的槽位数量，确保不会因社交能力下降而减少
            return gameState.relationshipSlotsUnlocked;
        }

        // 初始化人际关系网络（游戏开始时调用）
        function initRelationshipNetwork() {
            if (!gameState.relationships) {
                gameState.relationships = [];
            }
            // ★★★ 修改：不再自动创建默认导师，导师由玩家在游戏内选择 ★★★
        }

        // 创建新的关系人物
        function createRelationshipPerson(type, customData = {}) {
            const typeInfo = RELATIONSHIP_TYPES[type];
            if (!typeInfo) return null;

            // 随机性别（只对需要性别的类型）
            const gender = typeInfo.hasGender ? (Math.random() < 0.5 ? 'male' : 'female') : null;

            // 获取初始属性
            const initialStats = RELATIONSHIP_INITIAL_STATS[type];
            let research = 0;
            let affinity = 0;
            let intimacy = 0;

            if (initialStats) {
                // ★★★ 恋人的科研能力和亲密度根据类型动态计算 ★★★
                if (type === 'lover' && initialStats.dynamicStats) {
                    const loverType = gameState.loverType;
                    if (loverType === 'smart') {
                        // 聪慧恋人：科研 = 玩家科研+1（最高16），亲密度 9-12
                        research = Math.min(16, gameState.research + 1);
                        intimacy = Math.floor(Math.random() * 4) + 9;  // 9-12
                    } else {
                        // 活泼恋人：科研 = 玩家科研-3（最低3），亲密度 12-15
                        research = Math.max(3, gameState.research - 3);
                        intimacy = Math.floor(Math.random() * 4) + 12;  // 12-15
                    }
                } else {
                    if (initialStats.researchRange) {
                        const [min, max] = initialStats.researchRange;
                        research = Math.floor(Math.random() * (max - min + 1)) + min;
                    }
                    if (initialStats.affinityRange) {
                        const [min, max] = initialStats.affinityRange;
                        affinity = Math.floor(Math.random() * (max - min + 1)) + min;
                    } else if (initialStats.affinity !== undefined) {
                        affinity = initialStats.affinity;
                    }
                    if (initialStats.intimacy !== undefined) {
                        intimacy = initialStats.intimacy;
                    }
                }
            }

            // 进度条属性
            let taskMax = 60;  // 默认任务条上限
            let relationMax = 40;  // 关系条上限固定40
            let taskType = '';  // 任务类型

            switch (type) {
                case 'senior':
                    taskType = 'write';  // 帮忙写论文
                    taskMax = 60;
                    break;
                case 'peer':
                    taskType = 'experiment';  // 帮忙做实验
                    taskMax = 60;
                    break;
                case 'junior':
                    taskType = 'idea';  // 帮忙想idea
                    taskMax = 60;
                    break;
                case 'lover':
                    taskType = 'date';  // 恋爱
                    taskMax = 100;
                    break;
            }

            const person = {
                id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: type,
                gender: gender,
                name: customData.name || generateRandomName(),
                addedAt: gameState.totalMonths,
                description: customData.description || getDefaultDescription(type, gender),
                research: research,
                affinity: type === 'lover' ? 0 : affinity,
                intimacy: type === 'lover' ? intimacy : 0,
                // 进度条属性
                taskProgress: 0,
                relationProgress: 0,
                taskMax: taskMax,
                relationMax: relationMax,
                taskType: taskType,
                taskUsedThisMonth: false,
                loverTasksCompleted: 0,  // 恋人完成任务次数（用于循环buff）
                // ★★★ 新增：互动统计 ★★★
                stats: {
                    taskCount: 0,        // 推进任务次数
                    interactCount: 0,    // 交流次数
                    completedCount: 0,   // 任务完成次数（获得奖励）
                    helpReceivedCount: 0 // 对方帮助你的次数
                },
                ...customData
            };

            return person;
        }

        // 获取显示名称（包含性别）
        function getRelationshipDisplayName(person) {
            const typeInfo = RELATIONSHIP_TYPES[person.type];
            if (typeInfo.hasGender && person.gender) {
                return person.gender === 'male' ? typeInfo.maleName : typeInfo.femaleName;
            }
            return typeInfo.name;
        }

        // 获取默认描述
        function getDefaultDescription(type, gender) {
            switch (type) {
                case 'senior':
                    return gender === 'male' ? '在科研上给予你帮助的师兄' : '在科研上给予你帮助的师姐';
                case 'junior':
                    return gender === 'male' ? '你指导过的师弟' : '你指导过的师妹';
                case 'peer': return '和你一起做科研的同级';
                case 'lover': return '与你心心相印的恋人';
                default: return '';
            }
        }

        // 显示添加人物到关系网的弹窗
        function showAddToNetworkModal(person, onComplete) {
            // ★★★ 防止在游戏结束后显示弹窗覆盖结局弹窗 ★★★
            if (gameState.gameEnded) {
                if (onComplete) onComplete(false);
                return;
            }

            const unlockedSlots = getUnlockedSlots();
            const currentCount = gameState.relationships.length;
            const typeInfo = RELATIONSHIP_TYPES[person.type];
            const displayTypeName = getRelationshipDisplayName(person);

            // 检查是否有空槽位
            if (currentCount < unlockedSlots) {
                // 有空槽位，直接询问是否添加
                showModal('👥 人际关系',
                    `<div style="text-align:center;margin-bottom:15px;">
                        <div style="font-size:2.5rem;margin-bottom:10px;">${typeInfo.icon}</div>
                        <div style="font-size:1.1rem;font-weight:600;color:${typeInfo.color};">${person.name}</div>
                        <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:5px;">${displayTypeName}</div>
                    </div>
                    ${renderPersonStats(person)}
                    <p style="text-align:center;">是否将 <strong>${person.name}</strong> 加入你的人际关系网？</p>
                    <div style="background:var(--light-bg);border-radius:8px;padding:10px;margin-top:10px;font-size:0.85rem;color:var(--text-secondary);text-align:center;">
                        当前槽位：${currentCount}/${unlockedSlots}
                    </div>`,
                    [
                        { text: '暂不添加', class: 'btn-info', action: () => {
                            closeModal();
                            if (onComplete) onComplete(false);
                        }},
                        { text: '✨ 加入关系网', class: 'btn-primary', action: () => {
                            gameState.relationships.push(person);
                            // ★★★ 新增：统计认识过的人数 ★★★
                            gameState.totalRelationshipsMet = (gameState.totalRelationshipsMet || 0) + 1;
                            addLog('人际关系', `${person.name}加入关系网`, `${displayTypeName}`);
                            closeModal();
                            renderRelationshipPanel();
                            if (onComplete) onComplete(true);
                        }}
                    ]
                );
            } else {
                // 槽位已满，需要替换
                showReplaceRelationshipModal(person, onComplete);
            }
        }

        // 渲染人物属性
        function renderPersonStats(person) {
            if (person.type === 'advisor') {
                const advisorType = ADVISOR_TYPES[person.advisorType];
                return `
                    <div style="background:var(--light-bg);border-radius:8px;padding:10px;margin:10px 0;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <span style="font-size:0.8rem;">🔬 科研资源</span>
                            <span style="font-size:0.85rem;font-weight:600;">${person.researchResource}/20</span>
                        </div>
                        <div style="height:6px;background:var(--border-color);border-radius:3px;overflow:hidden;">
                            <div style="width:${(person.researchResource/20)*100}%;height:100%;background:var(--primary-color);"></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;margin-bottom:6px;">
                            <span style="font-size:0.8rem;">💖 亲和度</span>
                            <span style="font-size:0.85rem;font-weight:600;">${person.affinity}/20</span>
                        </div>
                        <div style="height:6px;background:var(--border-color);border-radius:3px;overflow:hidden;">
                            <div style="width:${(person.affinity/20)*100}%;height:100%;background:var(--love-color);"></div>
                        </div>
                    </div>
                `;
            }

            if (person.type === 'lover') {
                return `
                    <div style="background:var(--light-bg);border-radius:8px;padding:10px;margin:10px 0;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <span style="font-size:0.8rem;">🔬 科研能力</span>
                            <span style="font-size:0.85rem;font-weight:600;">${person.research}/20</span>
                        </div>
                        <div style="height:6px;background:var(--border-color);border-radius:3px;overflow:hidden;">
                            <div style="width:${(person.research/20)*100}%;height:100%;background:var(--primary-color);"></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;margin-bottom:6px;">
                            <span style="font-size:0.8rem;">💕 亲密度</span>
                            <span style="font-size:0.85rem;font-weight:600;">${person.intimacy}/40</span>
                        </div>
                        <div style="height:6px;background:var(--border-color);border-radius:3px;overflow:hidden;">
                            <div style="width:${(person.intimacy/40)*100}%;height:100%;background:var(--love-color);"></div>
                        </div>
                    </div>
                `;
            }

            if (['senior', 'junior', 'peer'].includes(person.type)) {
                return `
                    <div style="background:var(--light-bg);border-radius:8px;padding:10px;margin:10px 0;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                            <span style="font-size:0.8rem;">🔬 科研能力</span>
                            <span style="font-size:0.85rem;font-weight:600;">${person.research}/20</span>
                        </div>
                        <div style="height:6px;background:var(--border-color);border-radius:3px;overflow:hidden;">
                            <div style="width:${(person.research/20)*100}%;height:100%;background:var(--primary-color);"></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;margin-bottom:6px;">
                            <span style="font-size:0.8rem;">💖 亲和度</span>
                            <span style="font-size:0.85rem;font-weight:600;">${person.affinity}/20</span>
                        </div>
                        <div style="height:6px;background:var(--border-color);border-radius:3px;overflow:hidden;">
                            <div style="width:${(person.affinity/20)*100}%;height:100%;background:var(--success-color);"></div>
                        </div>
                    </div>
                `;
            }

            return '';
        }

        // 显示替换人物的弹窗
        function showReplaceRelationshipModal(newPerson, onComplete) {
            const typeInfo = RELATIONSHIP_TYPES[newPerson.type];
            const displayTypeName = getRelationshipDisplayName(newPerson);
            const replaceableRelationships = gameState.relationships.filter(r => r.type !== 'advisor');

            let optionsHtml = replaceableRelationships.map((r, idx) => {
                const rTypeInfo = RELATIONSHIP_TYPES[r.type];
                const rDisplayName = getRelationshipDisplayName(r);
                return `
                    <div class="replace-option" onclick="selectReplacementSlot(${idx})"
                         style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--light-bg);border-radius:8px;margin-bottom:8px;cursor:pointer;border:2px solid transparent;transition:all 0.2s;"
                         onmouseover="this.style.borderColor='var(--primary-color)'"
                         onmouseout="this.style.borderColor='transparent'"
                         data-index="${idx}">
                        <span style="font-size:1.5rem;">${rTypeInfo.icon}</span>
                        <div style="flex:1;">
                            <div style="font-weight:600;color:${rTypeInfo.color};">${r.name}</div>
                            <div style="font-size:0.75rem;color:var(--text-secondary);">${rDisplayName}</div>
                        </div>
                    </div>
                `;
            }).join('');

            // 保存临时数据供选择使用
            window._pendingNewPerson = newPerson;
            window._pendingOnComplete = onComplete;

            showModal('👥 替换人际关系',
                `<div style="text-align:center;margin-bottom:15px;">
                    <div style="font-size:2rem;margin-bottom:8px;">${typeInfo.icon}</div>
                    <div style="font-size:1rem;font-weight:600;color:${typeInfo.color};">${newPerson.name}</div>
                    <div style="font-size:0.8rem;color:var(--text-secondary);">${displayTypeName} 想要加入你的关系网</div>
                </div>
                ${renderPersonStats(newPerson)}
                <p style="text-align:center;color:var(--danger-color);font-size:0.85rem;margin-bottom:15px;">
                    ⚠️ 槽位已满！请选择要替换的人物：
                </p>
                <div style="max-height:200px;overflow-y:auto;">
                    ${optionsHtml}
                </div>`,
                [
                    { text: '放弃添加', class: 'btn-info', action: () => {
                        window._pendingNewPerson = null;
                        window._pendingOnComplete = null;
                        closeModal();
                        if (onComplete) onComplete(false);
                    }}
                ]
            );
        }

        // 选择要替换的槽位
        function selectReplacementSlot(replaceIndex) {
            const newPerson = window._pendingNewPerson;
            const onComplete = window._pendingOnComplete;

            if (!newPerson) return;

            // 找到要替换的人（跳过导师）
            const replaceableRelationships = gameState.relationships.filter(r => r.type !== 'advisor');
            const oldPerson = replaceableRelationships[replaceIndex];

            if (!oldPerson) return;

            // 找到在原数组中的真实索引
            const realIndex = gameState.relationships.findIndex(r => r.id === oldPerson.id);

            if (realIndex !== -1) {
                const oldDisplayName = getRelationshipDisplayName(oldPerson);
                const newDisplayName = getRelationshipDisplayName(newPerson);

                gameState.relationships[realIndex] = newPerson;
                // ★★★ 新增：替换也算认识新人 ★★★
                gameState.totalRelationshipsMet = (gameState.totalRelationshipsMet || 0) + 1;

                // ★★★ 嫉妒升级效果：换人时科研/好感/SAN上限+3 ★★★
                if (gameState.isReversed && gameState.character === 'social' && gameState.reversedAwakened) {
                    gameState.researchMax = (gameState.researchMax || 20) + 3;
                    gameState.favorMax = (gameState.favorMax || 20) + 3;
                    gameState.sanMax = (gameState.sanMax || 20) + 3;
                    addLog('嫉妒升级', '换人奖励', `科研上限+3（现${gameState.researchMax}），好感上限+3（现${gameState.favorMax}），SAN上限+3（现${gameState.sanMax}）`);
                }

                addLog('人际关系', `${newPerson.name}替换了${oldPerson.name}`, `${oldDisplayName} → ${newDisplayName}`);
            }

            window._pendingNewPerson = null;
            window._pendingOnComplete = null;

            closeModal();
            renderRelationshipPanel();
            if (onComplete) onComplete(true);
        }

        // ==================== 人际关系UI渲染 ====================

        // 生成小型属性条
        function renderMiniBar(value, max, color) {
            const percent = Math.min(100, (value / max) * 100);
            return `<div style="height:4px;background:var(--border-color);border-radius:2px;overflow:hidden;flex:1;">
                <div style="width:${percent}%;height:100%;background:${color};"></div>
            </div>`;
        }

        // 显示人际关系系统说明
        function showRelationshipHelp() {
            const helpContent = `
                <div style="text-align:left;font-size:0.85rem;line-height:1.6;">
                    <div style="background:var(--light-bg);border-radius:8px;padding:12px;margin-bottom:12px;">
                        <div style="margin-bottom:8px;">
                            <span style="color:var(--primary-color);font-weight:600;">📋 任务进度</span> 🎁
                            <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px;">点击按钮消耗资源推进，<strong>满后获得奖励+论文加成选择</strong></div>
                        </div>
                        <div style="margin-bottom:8px;">
                            <span style="color:var(--love-color);font-weight:600;">💞 关系积累</span> ⚡
                            <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px;">每月自动增长，<strong>满后解锁交流机会（不累积）</strong></div>
                        </div>
                        <div>
                            <span style="color:var(--success-color);font-weight:600;">💬 交流按钮</span>
                            <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px;">关系条满后可用，点击免费推进一次任务</div>
                        </div>
                    </div>

                    <h4 style="margin:0 0 8px;font-size:0.9rem;">📌 角色类型</h4>
                    <div style="font-size:0.8rem;">
                        <div style="padding:6px 0;border-bottom:1px solid var(--border-color);">
                            <strong>👨‍🏫 导师</strong>：做项目(SAN-5) → 亲和度+1，科研资源+1，项目奖励<br>
                            <span style="color:var(--text-secondary);font-size:0.75rem;">关系增长 = 好感度 + 亲和度</span>
                        </div>
                        <div style="padding:6px 0;border-bottom:1px solid var(--border-color);">
                            <strong>👨‍🎓 师兄师姐</strong>：帮写论文(SAN-4) → 亲和度+1，写作加成<br>
                            <strong>🤝 同级</strong>：帮做实验(SAN-3) → 亲和度+1，实验加成<br>
                            <strong>🧑‍🎓 师弟师妹</strong>：帮想idea(SAN-2) → 亲和度+1，idea加成<br>
                            <span style="color:var(--text-secondary);font-size:0.75rem;">关系增长 = 社交 + 亲和度</span>
                        </div>
                        <div style="padding:6px 0;">
                            <strong>💕 恋人</strong>：约会(💰-2) → 亲密度+1，科研+1，特殊buff<br>
                            <span style="color:var(--text-secondary);font-size:0.75rem;">关系增长 = 亲密度</span>
                        </div>
                    </div>

                    <div style="margin-top:10px;padding:8px;background:rgba(108,92,231,0.1);border-radius:6px;font-size:0.75rem;color:var(--text-secondary);">
                        💡 槽位解锁：初始2个，社交6/12/18各解锁+1
                    </div>
                </div>
            `;
            showModal('👥 人际关系说明', helpContent, [
                { text: '知道了', class: 'btn-primary', action: closeModal }
            ]);
        }

        function renderRelationshipPanel() {
            const container = document.getElementById('relationship-panel');
            if (!container) return;

            initRelationshipNetwork();

            const unlockedSlots = getUnlockedSlots();
            const relationships = gameState.relationships;
            const totalSlots = 5;  // 总共5个槽位
            const unlockThresholds = [0, 0, 6, 12, 18];  // 每个槽位的解锁条件

            let html = `
                <div class="panel-title collapsible" onclick="toggleCollapse('relationship-panel')">
                    <i class="fas fa-users"></i> 人际关系
                    <div style="margin-left:auto;display:flex;gap:8px;align-items:center;">
                        <button class="btn btn-info" onclick="event.stopPropagation();showRelationshipHelp()" style="padding:3px 8px;font-size:0.75rem;">
                            <i class="fas fa-question-circle"></i> 说明
                        </button>
                        <i class="fas fa-chevron-down collapse-icon" id="relationship-panel-collapse-icon"></i>
                    </div>
                </div>
                <div class="collapsible-content" id="relationship-panel-content">
            `;

            // 渲染所有槽位（包括未解锁的）
            for (let i = 0; i < totalSlots; i++) {
                const isUnlocked = i < unlockedSlots;
                const person = relationships[i];
                const unlockRequirement = unlockThresholds[i];

                if (!isUnlocked) {
                    // 未解锁的槽位
                    html += `
                        <div class="relationship-slot locked"
                             style="display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(0,0,0,0.05);border-radius:10px;margin-bottom:8px;border:2px dashed var(--border-color);min-height:50px;opacity:0.6;">
                            <span style="font-size:0.85rem;color:var(--text-secondary);">🔒 社交≥${unlockRequirement}解锁</span>
                        </div>
                    `;
                } else if (person) {
                    const typeInfo = RELATIONSHIP_TYPES[person.type];
                    const displayTypeName = getRelationshipDisplayName(person);

                    // 兼容旧存档：初始化进度条属性
                    if (person.taskProgress === undefined) person.taskProgress = 0;
                    if (person.relationProgress === undefined) person.relationProgress = 0;
                    if (person.type === 'advisor' && person.taskMultiplier === undefined) {
                        // 旧存档导师补充随机乘数
                        person.taskMultiplier = Math.floor(Math.random() * 5) + 6;
                    }
                    if (person.taskMax === undefined) {
                        if (person.type === 'advisor') {
                            const multiplier = person.taskMultiplier || 8;
                            person.taskMax = (person.researchResource || 5) * multiplier + 20;
                        } else if (person.type === 'lover') {
                            person.taskMax = 100;
                        } else {
                            person.taskMax = 60;
                        }
                    }
                    if (person.relationMax === undefined) person.relationMax = 40;

                    // 计算进度百分比
                    const taskPercent = Math.min(100, (person.taskProgress / person.taskMax) * 100);
                    const relationPercent = Math.min(100, (person.relationProgress / person.relationMax) * 100);

                    // ★★★ 计算关系条每月增长量 ★★★
                    let relationGrowthPerMonth = 0;
                    if (person.type === 'advisor') {
                        relationGrowthPerMonth = gameState.favor + (person.affinity || 0);
                    } else if (['senior', 'peer', 'junior'].includes(person.type)) {
                        relationGrowthPerMonth = gameState.social + (person.affinity || 0);
                    } else if (person.type === 'lover') {
                        relationGrowthPerMonth = person.intimacy || 0;
                    }

                    // 获取任务名称、消耗和奖励说明
                    let taskName = '做项目';
                    let taskCost = 'SAN-5';
                    let taskIcon = '📋';
                    let taskReward = '亲和度+1，科研资源+1，项目奖励';
                    if (person.type === 'advisor') {
                        taskName = '做项目';
                        taskCost = 'SAN-5';
                        taskIcon = '📋';
                        taskReward = '亲和度+1，科研资源+1，项目奖励，可选论文加成';
                    } else if (person.type === 'senior') {
                        taskName = '帮写论文';
                        taskCost = 'SAN-4';
                        taskIcon = '✍️';
                        taskReward = `亲和度+1，写作+${person.research || 0}`;
                    } else if (person.type === 'peer') {
                        taskName = '帮做实验';
                        taskCost = 'SAN-3';
                        taskIcon = '🔬';
                        taskReward = `亲和度+1，实验+${person.research || 0}`;
                    } else if (person.type === 'junior') {
                        taskName = '帮想idea';
                        taskCost = 'SAN-2';
                        taskIcon = '💡';
                        taskReward = `亲和度+1，idea+${person.research || 0}`;
                    } else if (person.type === 'lover') {
                        taskName = '约会';
                        taskCost = '💰-2';
                        taskIcon = '💕';
                        taskReward = '亲密度+1，科研+1，特殊效果';
                    }

                    // 检查本月是否可用
                    const canUseTask = !person.taskUsedThisMonth;
                    const taskBtnClass = canUseTask ? 'btn-primary' : 'btn-info';
                    const taskBtnDisabled = canUseTask ? '' : 'disabled';

                    // 生成属性值HTML
                    let attrHtml = '';
                    if (person.type === 'advisor') {
                        attrHtml = `<span style="font-size:0.75rem;color:var(--text-secondary);margin-left:auto;">🔬${person.researchResource} 💖${person.affinity}</span>`;
                    } else if (person.type === 'lover') {
                        attrHtml = `<span style="font-size:0.75rem;color:var(--text-secondary);margin-left:auto;">🔬${person.research} 💕${person.intimacy}</span>`;
                    } else if (['senior', 'junior', 'peer'].includes(person.type)) {
                        attrHtml = `<span style="font-size:0.75rem;color:var(--text-secondary);margin-left:auto;">🔬${person.research} 💖${person.affinity}</span>`;
                    }

                    // ★★★ 交流按钮状态：根据 canInteract 标志判断 ★★★
                    const canInteract = person.canInteract || false;
                    const interactBtnClass = canInteract ? 'btn-success' : 'btn-info';
                    const interactBtnText = canInteract ? '💬 交流 (可用!)' : '💬 交流';

                    html += `
                        <div class="relationship-slot filled"
                             style="padding:12px;background:var(--light-bg);border-radius:10px;margin-bottom:8px;border-left:4px solid ${typeInfo.color};">
                            <!-- 第一行：姓名、类型、属性 -->
                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;cursor:pointer;" onclick="showRelationshipDetail('${person.id}')">
                                <span style="font-weight:600;font-size:0.95rem;color:var(--text-primary);">${person.name}</span>
                                <span style="font-size:0.7rem;padding:2px 6px;background:${typeInfo.color}22;color:${typeInfo.color};border-radius:4px;font-weight:500;">${displayTypeName}</span>
                                ${attrHtml}
                            </div>

                            <!-- 任务进度：标签+简短奖励提示+数值在第一行，进度条在第二行 -->
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                                <span style="font-size:0.7rem;color:var(--primary-color);font-weight:500;">📋 任务 <span style="font-size:0.6rem;color:var(--text-secondary);font-weight:400;">(满后: ${taskReward})</span></span>
                                <span class="relationship-bar-value" id="task-value-${person.id}" style="font-size:0.7rem;">${person.taskProgress}/${person.taskMax}</span>
                            </div>
                            <div class="relationship-bar-track" style="height:8px;margin-bottom:8px;">
                                <div class="relationship-bar-fill task" id="task-bar-${person.id}" style="width:${taskPercent}%;"></div>
                            </div>

                            <!-- 关系积累：标签+数值在第一行，进度条在第二行 -->
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
                                <span style="font-size:0.7rem;color:var(--love-color);font-weight:500;">💞 关系 <span style="font-size:0.6rem;color:var(--text-secondary);font-weight:400;">(+${relationGrowthPerMonth}/月)</span></span>
                                <span class="relationship-bar-value" id="relation-value-${person.id}" style="font-size:0.7rem;">${person.relationProgress}/${person.relationMax}</span>
                            </div>
                            <div class="relationship-bar-track" style="height:8px;margin-bottom:10px;">
                                <div class="relationship-bar-fill relation" id="relation-bar-${person.id}" style="width:${relationPercent}%;"></div>
                            </div>

                            <!-- 操作按钮 -->
                            <div style="display:flex;justify-content:flex-end;gap:8px;">
                                <button class="btn ${interactBtnClass}"
                                        onclick="event.stopPropagation();interactWithPerson('${person.id}')"
                                        style="padding:5px 12px;font-size:0.75rem;">
                                    ${interactBtnText}
                                </button>
                                <button class="btn ${taskBtnClass}" ${taskBtnDisabled}
                                        onclick="event.stopPropagation();advanceTask('${person.id}')"
                                        style="padding:5px 12px;font-size:0.75rem;">
                                    ${canUseTask ? `${taskIcon} ${taskName} (${taskCost})` : '✓ 本月已用'}
                                </button>
                            </div>
                        </div>
                    `;
                } else {
                    // 已解锁但为空的槽位
                    const hasAdvisor = relationships.some(r => r.type === 'advisor');
                    if (i === 0 && !hasAdvisor) {
                        html += `
                            <div class="relationship-slot empty"
                                 style="display:flex;align-items:center;justify-content:center;padding:15px;background:linear-gradient(135deg,rgba(231,76,60,0.1),rgba(230,126,34,0.1));border-radius:10px;margin-bottom:8px;border:2px dashed var(--danger-color);min-height:50px;">
                                <span style="font-size:0.9rem;color:var(--danger-color);font-weight:500;">👨‍🏫 待选择导师...</span>
                            </div>
                        `;
                    } else {
                        html += `
                            <div class="relationship-slot empty"
                                 style="display:flex;align-items:center;justify-content:center;padding:12px;background:var(--light-bg);border-radius:10px;margin-bottom:8px;border:2px dashed var(--border-color);min-height:50px;">
                                <span style="font-size:0.85rem;color:var(--text-secondary);">空槽位</span>
                            </div>
                        `;
                    }
                }
            }

            html += '</div>';  // 关闭 collapsible-content

            container.innerHTML = html;

            // 播放待处理的关系动画
            setTimeout(() => {
                if (typeof playPendingRelationAnimations === 'function') {
                    playPendingRelationAnimations();
                }
            }, 50);
        }

        // 统一的任务推进入口
        function advanceTask(personId) {
            const person = gameState.relationships.find(r => r.id === personId);
            if (!person) return;

            if (person.type === 'advisor') {
                advanceAdvisorTask(personId);
            } else if (['senior', 'peer', 'junior'].includes(person.type)) {
                advanceFellowTask(personId);
            } else if (person.type === 'lover') {
                advanceLoverTask(personId);
            }
        }

        // 显示人物详情
        function showRelationshipDetail(personId) {
            const person = gameState.relationships.find(r => r.id === personId);
            if (!person) return;

            const typeInfo = RELATIONSHIP_TYPES[person.type];
            const displayTypeName = getRelationshipDisplayName(person);
            // 兼容旧存档：如果没有addedAt，默认为0
            const addedAt = person.addedAt || 0;
            const addedMonthsAgo = gameState.totalMonths - addedAt;

            // 导师特殊显示
            let advisorInfo = '';
            if (person.type === 'advisor' && person.advisorType) {
                const advisorType = ADVISOR_TYPES[person.advisorType];
                const req = advisorType.requirements;
                // 使用person.title而非advisorType.title，因为level2使用titles数组
                const personTitle = person.title || advisorType.title || '';
                // 如果头衔和名称相同（如教授、副教授），显示"无"
                const displayTitle = (personTitle === advisorType.name || personTitle === '教授' || personTitle === '副教授') ? '无' : personTitle;
                // ★★★ 新增：学校信息 ★★★
                const uni = person.university || gameState.university || { name: '理工大学', icon: '🔧', desc: '科研上限+1' };
                advisorInfo = `
                    <div style="background:linear-gradient(135deg,${advisorType.color}22,${advisorType.color}11);border-radius:8px;padding:10px;margin-bottom:10px;border:1px solid ${advisorType.color}44;">
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                            <span style="font-size:1.5rem;">${advisorType.icon}</span>
                            <div>
                                <div style="font-weight:600;color:${advisorType.color};">${advisorType.name}</div>
                                <div style="font-size:0.75rem;color:var(--text-secondary);">头衔: ${displayTitle}</div>
                            </div>
                        </div>
                        <div style="font-size:0.75rem;color:var(--text-secondary);">
                            <div>${uni.icon} 学校: ${uni.name}（${uni.desc}）</div>
                            <div>📋 硕士毕业要求: ${req.masterGrad}分 | 博士毕业要求: ${req.phdGrad}分</div>
                            <div>📋 转博要求: 第2年≥${req.phdYear2}分 | 第3年≥${req.phdYear3}分</div>
                            <div>💰 硕士工资: ${advisorType.salary.master}/月 | 博士工资: ${advisorType.salary.phd}/月</div>
                        </div>
                    </div>
                `;
            }

            let detailHtml = `
                <div style="text-align:center;margin-bottom:15px;">
                    <div style="font-size:3rem;margin-bottom:10px;">${typeInfo.icon}</div>
                    <div style="font-size:1.2rem;font-weight:700;color:${typeInfo.color};">${person.name}</div>
                    <div style="font-size:0.85rem;color:var(--text-secondary);margin-top:5px;">${displayTypeName}</div>
                </div>
                ${advisorInfo}
                ${renderPersonStats(person)}
                <div style="background:var(--light-bg);border-radius:10px;padding:15px;margin-bottom:15px;">
                    <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:8px;">📝 简介</div>
                    <div style="font-size:0.9rem;">${person.description}</div>
                </div>
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--text-secondary);">
                    <span>🕐 相识于第${Math.floor(addedAt / 12) + 1}年</span>
                    <span>已认识${addedMonthsAgo}个月</span>
                </div>
            `;

            const buttons = [{ text: '关闭', class: 'btn-primary', action: closeModal }];

            // 非导师可以移除
            if (person.type !== 'advisor') {
                buttons.unshift({
                    text: '移除',
                    class: 'btn-danger',
                    action: () => {
                        const idx = gameState.relationships.findIndex(r => r.id === personId);
                        if (idx !== -1) {
                            gameState.relationships.splice(idx, 1);
                            addLog('人际关系', `${person.name}离开了关系网`, '');
                            closeModal();
                            renderRelationshipPanel();
                        }
                    }
                });
            }

            showModal('👤 人物详情', detailHtml, buttons);
        }

        // ==================== 导师选择界面 ====================

        function showAdvisorSelectionModal(onSelected) {
            const options = generateAdvisorOptions();
            window._advisorOptions = options;
            window._advisorOnSelected = onSelected;

            let optionsHtml = options.map((advisor, idx) => {
                const advisorType = (window.ADVISOR_TYPES || ADVISOR_TYPES)[advisor.advisorType];
                const req = advisorType.requirements;
                // 工资显示格式化
                const masterSalary = advisorType.salary.master;
                const phdSalary = advisorType.salary.phd;
                const masterSalaryText = masterSalary === 1.5 ? '1.5' : (masterSalary === 1.25 ? '1.25' : masterSalary);
                // ★★★ 新增：学校信息 ★★★
                const uni = advisor.university || { name: '理工大学', icon: '🔧', desc: '科研上限+1' };
                return `
                    <div class="advisor-option" onclick="selectAdvisor(${idx})"
                         style="padding:8px 10px;background:var(--light-bg);border-radius:8px;margin-bottom:6px;cursor:pointer;border:2px solid transparent;transition:all 0.15s;"
                         onmouseover="this.style.borderColor='${advisorType.color}';this.style.background='${advisorType.color}11'"
                         onmouseout="this.style.borderColor='transparent';this.style.background='var(--light-bg)'">
                        <div style="display:flex;align-items:center;gap:8px;">
                            <span style="font-size:1.4rem;">${advisorType.icon}</span>
                            <div style="flex:1;min-width:0;">
                                <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">
                                    <span style="font-weight:700;font-size:0.9rem;color:${advisorType.color};">${advisor.name}</span>
                                    <span style="font-size:0.6rem;padding:1px 6px;background:${advisorType.color}22;color:${advisorType.color};border-radius:3px;font-weight:600;">${advisor.title}</span>
                                    <span style="font-size:0.55rem;padding:1px 5px;background:rgba(100,100,100,0.15);color:var(--text-secondary);border-radius:3px;">${uni.icon} ${uni.name}</span>
                                </div>
                                <div style="font-size:0.65rem;color:var(--text-secondary);margin-top:2px;">
                                    🔬<strong>${advisor.researchResource}</strong> 💖<strong>${advisor.affinity}</strong> 📄<strong>${advisor.papers}</strong>篇 📊<strong>${advisor.citations}</strong>引用
                                    <span style="margin-left:4px;color:var(--success-color);">[${uni.desc}]</span>
                                </div>
                            </div>
                        </div>
                        <div style="display:flex;flex-wrap:wrap;gap:4px 12px;font-size:0.6rem;margin-top:5px;padding:5px 8px;background:rgba(0,0,0,0.03);border-radius:4px;color:var(--text-secondary);">
                            <span>💰 硕<span style="color:var(--success-color);font-weight:600;">${masterSalaryText}</span>/博<span style="color:var(--success-color);font-weight:600;">${phdSalary}</span></span>
                            <span>🎓 毕业 硕<span style="color:var(--primary-color);font-weight:600;">${req.masterGrad}</span>/博<span style="color:var(--danger-color);font-weight:600;">${req.phdGrad}</span></span>
                            <span>📋 转博 Y2≥<span style="color:var(--warning-color);font-weight:600;">${req.phdYear2}</span>/Y3≥<span style="color:var(--warning-color);font-weight:600;">${req.phdYear3}</span></span>
                        </div>
                    </div>
                `;
            }).join('');

            showModal('🎓 选择导师',
                `<p style="text-align:center;margin-bottom:8px;color:var(--text-primary);font-size:0.85rem;">
                    🎉 <strong>这些老师都抢着要你，你选择追随谁？</strong>
                </p>
                <div>
                    ${optionsHtml}
                </div>`,
                [] // 没有按钮，必须选择一个导师
            );
        }

        function selectAdvisor(index) {
            const options = window._advisorOptions;
            const onSelected = window._advisorOnSelected;

            if (!options || index < 0 || index >= options.length) return;

            const selectedAdvisor = options[index];

            // 设置导师到游戏状态
            gameState.relationships = [selectedAdvisor];
            gameState.selectedAdvisor = selectedAdvisor;

            const advisorType = ADVISOR_TYPES[selectedAdvisor.advisorType];
            // ★★★ 新增：学校信息 ★★★
            const uni = selectedAdvisor.university || { name: '理工大学', type: 'tech', desc: '科研上限+1' };
            gameState.university = uni;  // 保存学校信息到游戏状态

            // ★★★ 应用学校加成 ★★★
            const bonusChanges = applyUniversityBonus(uni.type);

            // ★★★ 修改：日志显示学校信息（合并学校加成） ★★★
            const masterSalary = advisorType.salary.master;
            const phdSalary = advisorType.salary.phd;
            // 判断是否有有意义的头衔（教授、副教授不是真正的头衔）
            const personTitle = selectedAdvisor.title || '';
            const hasRealTitle = personTitle && personTitle !== '教授' && personTitle !== '副教授' && personTitle !== advisorType.name;
            const titleDisplay = hasRealTitle ? `，${personTitle}` : '';
            // 合并学校加成到日志
            const bonusText = bonusChanges && bonusChanges.length > 0 ? `，${bonusChanges.join('，')}（学校加成）` : '';
            addLog('选择导师', `拜入${uni.icon}${uni.name}${selectedAdvisor.name}（${advisorType.name}${titleDisplay}）门下`, `工资：硕${masterSalary}/月，博${phdSalary}/月${bonusText}`);

            window._advisorOptions = null;
            window._advisorOnSelected = null;

            closeModal();

            if (onSelected) {
                onSelected(selectedAdvisor);
            }
        }

        // ==================== 任务进度系统 ====================

        // 导师任务：做项目
        function advanceAdvisorTask(personId, isFree = false, onComplete = null) {
            const person = gameState.relationships.find(r => r.id === personId);
            if (!person || person.type !== 'advisor') {
                if (onComplete) onComplete();
                return;
            }

            // 检查本月是否已使用（除非是免费的）
            if (!isFree && person.taskUsedThisMonth) {
                addLog('任务', '本月已推进过导师项目', '');
                if (onComplete) onComplete();
                return;
            }

            // 消耗SAN（免费时不消耗）
            if (!isFree) {
                const baseSanCost = 5;
                // ★★★ 修复：使用getSanCostExplanation显示详细计算过程 ★★★
                const { actualCost, explanation } = getSanCostExplanation(baseSanCost);
                if (gameState.san < actualCost) {
                    showModal('❌ SAN不足', `<p>推进导师项目需要<strong>${actualCost}点SAN</strong>（${explanation}），当前只有<strong>${gameState.san}点</strong>。</p><p style="color:var(--text-secondary);font-size:0.85rem;">💡 可以通过休息、购买物品等方式恢复SAN值</p>`,
                        [{ text: '确定', class: 'btn-primary', action: closeModal }]);
                    if (onComplete) onComplete();
                    return;
                }
                changeSan(-baseSanCost);
                person.taskUsedThisMonth = true;
            }

            // ★★★ 统计：推进任务次数 ★★★
            if (!person.stats) person.stats = { taskCount: 0, interactCount: 0, completedCount: 0, helpReceivedCount: 0 };
            person.stats.taskCount++;

            // 计算进度增长
            const baseGrowth = gameState.research * (0.5 + Math.random());  // 0.5-1.5倍
            const randomBonus = Math.floor(Math.random() * 6);  // 0-5
            // ★★★ 交流推进额外+5 ★★★
            const interactBonus = isFree ? 5 : 0;
            const growth = Math.floor(baseGrowth) + randomBonus + interactBonus;

            person.taskProgress += growth;
            addLog('导师项目', `推进了${person.name}的项目`, `进度+${growth}${isFree ? '（关系加成+5）' : ''}`);

            // 检查任务完成
            checkTaskCompletion(person, onComplete);

            updateAllUI();
            renderRelationshipPanel();

            // 触发动画效果（在渲染后），传入变化量
            setTimeout(() => animateTaskProgress(personId, growth), 50);
        }

        // 师兄师姐/同级/师弟师妹任务
        function advanceFellowTask(personId, isFree = false, onComplete = null) {
            const person = gameState.relationships.find(r => r.id === personId);
            if (!person || !['senior', 'peer', 'junior'].includes(person.type)) {
                if (onComplete) onComplete();
                return;
            }

            // 检查本月是否已使用（除非是免费的）
            if (!isFree && person.taskUsedThisMonth) {
                addLog('任务', '本月已推进过此任务', '');
                if (onComplete) onComplete();
                return;
            }

            // 计算SAN消耗（使用对应操作的公式）
            let baseSanCost = 0;
            let taskName = '';
            switch (person.taskType) {
                case 'write':
                    baseSanCost = 4;
                    taskName = '帮忙写论文';
                    break;
                case 'experiment':
                    baseSanCost = 3;
                    taskName = '帮忙做实验';
                    break;
                case 'idea':
                    baseSanCost = 2;
                    taskName = '帮忙想idea';
                    break;
            }

            if (!isFree) {
                // ★★★ 修复：使用getSanCostExplanation显示详细计算过程 ★★★
                const { actualCost, explanation } = getSanCostExplanation(baseSanCost);
                if (gameState.san < actualCost) {
                    showModal('❌ SAN不足', `<p>${taskName}需要<strong>${actualCost}点SAN</strong>（${explanation}），当前只有<strong>${gameState.san}点</strong>。</p><p style="color:var(--text-secondary);font-size:0.85rem;">💡 可以通过休息、购买物品等方式恢复SAN值</p>`,
                        [{ text: '确定', class: 'btn-primary', action: closeModal }]);
                    if (onComplete) onComplete();
                    return;
                }
                changeSan(-baseSanCost);
                person.taskUsedThisMonth = true;
            }

            // ★★★ 统计：推进任务次数 ★★★
            if (!person.stats) person.stats = { taskCount: 0, interactCount: 0, completedCount: 0, helpReceivedCount: 0 };
            person.stats.taskCount++;

            // 计算进度增长（使用对应操作的公式）
            // ★★★ 交流推进额外+5 ★★★
            const interactBonus = isFree ? 5 : 0;
            const growth = calculatePaperScore() + interactBonus;
            person.taskProgress += growth;
            addLog('同门任务', `帮${person.name}${taskName}`, `进度+${growth}${isFree ? '（关系加成+5）' : ''}`);

            // 检查任务完成
            checkTaskCompletion(person, onComplete);

            updateAllUI();
            renderRelationshipPanel();

            // 触发动画效果（在渲染后），传入变化量
            setTimeout(() => animateTaskProgress(personId, growth), 50);
        }

        // 恋人任务：恋爱
        function advanceLoverTask(personId, isFree = false, onComplete = null) {
            const person = gameState.relationships.find(r => r.id === personId);
            if (!person || person.type !== 'lover') {
                if (onComplete) onComplete();
                return;
            }

            // 检查本月是否已使用（除非是免费的）
            if (!isFree && person.taskUsedThisMonth) {
                addLog('任务', '本月已约会过', '');
                if (onComplete) onComplete();
                return;
            }

            // 消耗金币（免费时不消耗）
            if (!isFree) {
                const goldCost = 2;
                if (gameState.gold < goldCost) {
                    showModal('❌ 金币不足', `<p>约会需要<strong>${goldCost}金币</strong>，当前只有<strong>${gameState.gold}金币</strong>。</p><p style="color:var(--text-secondary);font-size:0.85rem;">💡 可以通过打工或其他方式获取金币</p>`,
                        [{ text: '确定', class: 'btn-primary', action: closeModal }]);
                    if (onComplete) onComplete();
                    return;
                }
                gameState.gold -= goldCost;
                person.taskUsedThisMonth = true;
            }

            // ★★★ 统计：推进任务次数 ★★★
            if (!person.stats) person.stats = { taskCount: 0, interactCount: 0, completedCount: 0, helpReceivedCount: 0 };
            person.stats.taskCount++;

            // 计算进度增长
            const baseGrowth = person.intimacy * (0.5 + Math.random());  // 0.5-1.5倍
            const randomBonus = Math.floor(Math.random() * 6);  // 0-5
            // ★★★ 交流推进额外+5 ★★★
            const interactBonus = isFree ? 5 : 0;
            const growth = Math.floor(baseGrowth) + randomBonus + interactBonus;

            person.taskProgress += growth;
            addLog('恋爱', `与${person.name}约会`, `进度+${growth}${isFree ? '（关系加成+5）' : ''}`);

            // 检查任务完成
            checkTaskCompletion(person, onComplete);

            updateAllUI();
            renderRelationshipPanel();

            // 触发动画效果（在渲染后），传入变化量
            setTimeout(() => animateTaskProgress(personId, growth), 50);
        }

        // 检查任务完成
        function checkTaskCompletion(person, onComplete = null) {
            if (person.taskProgress >= person.taskMax) {
                const overflow = person.taskProgress - person.taskMax;
                person.taskProgress = overflow;  // 保留溢出

                // 触发完成效果
                handleTaskCompletion(person, onComplete);
            } else {
                if (onComplete) onComplete();
            }
        }

        // 处理任务完成
        function handleTaskCompletion(person, onComplete = null) {
            if (person.type === 'advisor') {
                handleAdvisorTaskCompletion(person, onComplete);
            } else if (['senior', 'peer', 'junior'].includes(person.type)) {
                handleFellowTaskCompletion(person, onComplete);
            } else if (person.type === 'lover') {
                handleLoverTaskCompletion(person, onComplete);
            } else {
                if (onComplete) onComplete();
            }
        }

        // 导师任务完成
        function handleAdvisorTaskCompletion(person, onComplete = null) {
            // ★★★ 统计：任务完成次数和获得帮助次数 ★★★
            if (!person.stats) person.stats = { taskCount: 0, interactCount: 0, completedCount: 0, helpReceivedCount: 0 };
            person.stats.completedCount++;
            person.stats.helpReceivedCount++;

            // 亲和度+1，科研资源+1
            person.affinity = Math.min(20, person.affinity + 1);
            person.researchResource = Math.min(20, person.researchResource + 1);
            // 更新任务条上限（使用保存的乘数，兼容旧存档默认8）
            const multiplier = person.taskMultiplier || 8;
            person.taskMax = person.researchResource * multiplier + 20;

            // ★★★ 修改：项目奖励改为循环（横向→纵向→横向...）★★★
            person.advisorTasksCompleted = (person.advisorTasksCompleted || 0) + 1;
            const cycle = (person.advisorTasksCompleted - 1) % 2;
            let rewardText = '';
            switch (cycle) {
                case 0:  // 横向项目：金币+5
                    gameState.gold += 5;
                    clampGold();  // ★★★ 赤贫学子诅咒 ★★★
                    rewardText = '横向项目，金币+5';
                    break;
                case 1:  // 纵向项目：科研能力+1
                    gameState.research = Math.min(gameState.researchMax || 20, gameState.research + 1);
                    checkResearchUnlock();
                    rewardText = '纵向项目，科研能力+1';
                    break;
            }

            addLog('项目完成', `帮${person.name}完成项目`, `亲和度+1，科研资源+1，${rewardText}`);

            // 选择论文加成
            showPaperSelectionModal(person, 'advisor', onComplete);
        }

        // 同门任务完成
        function handleFellowTaskCompletion(person, onComplete = null) {
            // ★★★ 统计：任务完成次数和获得帮助次数 ★★★
            if (!person.stats) person.stats = { taskCount: 0, interactCount: 0, completedCount: 0, helpReceivedCount: 0 };
            person.stats.completedCount++;
            person.stats.helpReceivedCount++;

            // 亲和度+1
            person.affinity = Math.min(20, person.affinity + 1);

            let taskName = '';
            switch (person.taskType) {
                case 'write': taskName = '写论文'; break;
                case 'experiment': taskName = '做实验'; break;
                case 'idea': taskName = '想idea'; break;
            }

            addLog('任务完成', `帮${person.name}完成${taskName}`, `亲和度+1`);

            // 选择论文加成
            showPaperSelectionModal(person, 'fellow', onComplete);
        }

        // 恋人任务完成
        function handleLoverTaskCompletion(person, onComplete = null) {
            // ★★★ 统计：任务完成次数和获得帮助次数 ★★★
            if (!person.stats) person.stats = { taskCount: 0, interactCount: 0, completedCount: 0, helpReceivedCount: 0 };
            person.stats.completedCount++;
            person.stats.helpReceivedCount++;

            // 亲密度+1（上限40）
            // ★★★ 移除：科研能力+1（移动到实验室天赋）★★★
            person.intimacy = Math.min(40, person.intimacy + 1);
            person.loverTasksCompleted = (person.loverTasksCompleted || 0) + 1;

            // 恋人类型特殊效果
            const loverType = gameState.loverType;
            let specialEffect = '';

            if (loverType === 'smart') {
                // 聪慧恋人：循环buff
                const cycle = (person.loverTasksCompleted - 1) % 3;
                switch (cycle) {
                    case 0:
                        if (!gameState.buffs.permanent.some(b => b.type === 'lover_extra_idea')) {
                            gameState.buffs.permanent.push({ type: 'lover_extra_idea', desc: '想idea多想一次' });
                            specialEffect = '，获得永久buff：想idea多想一次';
                        }
                        break;
                    case 1:
                        if (!gameState.buffs.permanent.some(b => b.type === 'lover_extra_experiment')) {
                            gameState.buffs.permanent.push({ type: 'lover_extra_experiment', desc: '做实验多做一次' });
                            specialEffect = '，获得永久buff：做实验多做一次';
                        }
                        break;
                    case 2:
                        if (!gameState.buffs.permanent.some(b => b.type === 'lover_extra_write')) {
                            gameState.buffs.permanent.push({ type: 'lover_extra_write', desc: '写论文多写一次' });
                            specialEffect = '，获得永久buff：写论文多写一次';
                        }
                        break;
                }
            } else if (loverType === 'beautiful') {
                // ★★★ 活泼恋人：循环效果（第1次: 回复10%已损SAN，第2次: SAN上限+1，第3次: 月回复百分比+2%）★★★
                const cycle = (person.loverTasksCompleted - 1) % 3;
                switch (cycle) {
                    case 0:
                        // 回复已损失SAN的10%（上取整）
                        const lostSan0 = gameState.sanMax - gameState.san;
                        const recovery0 = Math.ceil(lostSan0 * 0.10);
                        gameState.san = Math.min(gameState.sanMax, gameState.san + recovery0);
                        specialEffect = `，SAN+${recovery0}（10%已损失）`;
                        break;
                    case 1:
                        // SAN上限+1
                        gameState.sanMax += 1;
                        specialEffect = '，SAN上限+1';
                        break;
                    case 2:
                        // 每月SAN回复百分比+2%
                        gameState.beautifulLoverExtraRecoveryRate = (gameState.beautifulLoverExtraRecoveryRate || 0) + 2;
                        specialEffect = `，每月SAN回复百分比+2%（当前总计${10 + gameState.beautifulLoverExtraRecoveryRate}%）`;
                        break;
                }
            }

            addLog('恋爱进展', `与${person.name}感情升温`, `亲密度+1${specialEffect}`);

            // 选择论文加成
            showPaperSelectionModal(person, 'lover', onComplete);
        }

        // 显示论文选择弹窗
        function showPaperSelectionModal(person, completionType, onComplete = null) {
            // 筛选符合条件的论文
            let eligiblePapers = [];

            if (completionType === 'advisor' || completionType === 'lover') {
                // 导师和恋人：所有未投稿论文
                eligiblePapers = gameState.papers.filter((p, idx) =>
                    p && !p.reviewing
                ).map((p, idx) => ({ paper: p, slotIndex: gameState.papers.findIndex(pp => pp && pp === p) }));
            } else if (completionType === 'fellow') {
                // ★★★ 同门：根据任务类型筛选论文 ★★★
                eligiblePapers = gameState.papers.filter((p, idx) => {
                    if (!p || p.reviewing) return false;
                    // 帮忙做实验：需要idea分>0
                    if (person.taskType === 'experiment' && p.ideaScore <= 0) return false;
                    // 帮忙写作：需要实验分>0
                    if (person.taskType === 'write' && p.expScore <= 0) return false;
                    return true;
                }).map((p, idx) => ({ paper: p, slotIndex: gameState.papers.findIndex(pp => pp && pp === p) }));
            }

            if (eligiblePapers.length === 0) {
                let reason = '没有符合条件的论文';
                if (completionType === 'fellow') {
                    if (person.taskType === 'experiment') reason = '没有idea分>0的论文';
                    else if (person.taskType === 'write') reason = '没有实验分>0的论文';
                }
                addLog('任务奖励', reason, '奖励跳过');
                updateAllUI();
                renderRelationshipPanel();
                if (onComplete) onComplete();
                return;
            }

            // 保存回调函数供选择时使用
            window._paperSelectionCallback = onComplete;

            // 构建选择界面
            let papersHtml = eligiblePapers.map(({ paper, slotIndex }) => {
                let bonusText = '';
                if (completionType === 'advisor') {
                    bonusText = `idea/实验/写作各+${person.researchResource}`;
                } else if (completionType === 'fellow') {
                    const fieldName = person.taskType === 'idea' ? 'idea' :
                                     person.taskType === 'experiment' ? '实验' : '写作';
                    bonusText = `${fieldName}+${person.research}`;
                } else if (completionType === 'lover') {
                    // ★★★ 恋人：1.5倍优先补短板 ★★★
                    const totalBonus = Math.floor(person.research * 1.5);
                    bonusText = `总+${totalBonus}（优先补短板）`;
                }
                return `
                    <div style="padding:8px;background:var(--light-bg);border-radius:6px;margin-bottom:6px;cursor:pointer;border:2px solid transparent;"
                         onmouseover="this.style.borderColor='var(--primary-color)'"
                         onmouseout="this.style.borderColor='transparent'"
                         onclick="selectPaperForBonus(${slotIndex}, '${person.id}', '${completionType}')">
                        <div style="font-weight:600;font-size:0.85rem;">槽位${slotIndex + 1}</div>
                        <div style="font-size:0.75rem;color:var(--text-secondary);">
                            idea:${paper.ideaScore} 实验:${paper.expScore} 写作:${paper.writeScore}
                        </div>
                        <div style="font-size:0.7rem;color:var(--success-color);margin-top:4px;">${bonusText}</div>
                    </div>
                `;
            }).join('');

            showModal('📄 选择论文获得加成',
                `<div style="max-height:300px;overflow-y:auto;">${papersHtml}</div>`,
                [{ text: '跳过', class: 'btn-info', action: () => {
                    const callback = window._paperSelectionCallback;
                    window._paperSelectionCallback = null;
                    closeModal();
                    updateAllUI();
                    renderRelationshipPanel();
                    if (callback) callback();
                }}]
            );
        }

        // 选择论文获得加成
        function selectPaperForBonus(slotIndex, personId, completionType) {
            const person = gameState.relationships.find(r => r.id === personId);
            const paper = gameState.papers[slotIndex];
            const callback = window._paperSelectionCallback;
            window._paperSelectionCallback = null;

            if (!person || !paper) {
                closeModal();
                if (callback) callback();
                return;
            }

            // ★★★ 新增：标记论文从关系角色获得了加成（用于高分论文成就判定）★★★
            paper.receivedRelationshipBonus = true;

            if (completionType === 'advisor') {
                const bonus = person.researchResource;
                paper.ideaScore += bonus;
                paper.expScore += bonus;
                paper.writeScore += bonus;
                addLog('论文加成', `导师项目奖励`, `槽位${slotIndex + 1} idea/实验/写作各+${bonus}`);
            } else if (completionType === 'fellow') {
                const bonus = person.research;
                if (person.taskType === 'idea') {
                    paper.ideaScore += bonus;
                    addLog('论文加成', `${person.name}帮忙想idea`, `槽位${slotIndex + 1} idea+${bonus}`);
                } else if (person.taskType === 'experiment') {
                    paper.expScore += bonus;
                    addLog('论文加成', `${person.name}帮忙做实验`, `槽位${slotIndex + 1} 实验+${bonus}`);
                } else if (person.taskType === 'write') {
                    paper.writeScore += bonus;
                    addLog('论文加成', `${person.name}帮忙写论文`, `槽位${slotIndex + 1} 写作+${bonus}`);
                }
            } else if (completionType === 'lover') {
                // ★★★ 恋人帮忙：总加成1.5倍科研能力，优先补短板 ★★★
                const totalBonus = Math.floor(person.research * 1.5);
                let bonusApplied = { idea: 0, exp: 0, write: 0 };
                let remaining = totalBonus;

                // 循环分配，每次给当前最低分+1
                while (remaining > 0) {
                    const currentScores = [
                        { type: 'idea', value: paper.ideaScore + bonusApplied.idea },
                        { type: 'exp', value: paper.expScore + bonusApplied.exp },
                        { type: 'write', value: paper.writeScore + bonusApplied.write }
                    ];
                    currentScores.sort((a, b) => a.value - b.value);
                    bonusApplied[currentScores[0].type]++;
                    remaining--;
                }

                paper.ideaScore += bonusApplied.idea;
                paper.expScore += bonusApplied.exp;
                paper.writeScore += bonusApplied.write;

                const bonusDetails = [];
                if (bonusApplied.idea > 0) bonusDetails.push(`idea+${bonusApplied.idea}`);
                if (bonusApplied.exp > 0) bonusDetails.push(`实验+${bonusApplied.exp}`);
                if (bonusApplied.write > 0) bonusDetails.push(`写作+${bonusApplied.write}`);
                addLog('论文加成', `恋人帮助（补短板）`, `槽位${slotIndex + 1} ${bonusDetails.join('，')}`);
            }

            closeModal();
            updateAllUI();
            renderPaperSlots();
            renderRelationshipPanel();

            if (callback) callback();
        }

        // 每月更新关系进度
        function updateRelationshipProgress() {
            // 保存待播放动画的数据
            gameState._pendingRelationAnimations = [];

            gameState.relationships.forEach(person => {
                // 重置本月任务使用状态
                person.taskUsedThisMonth = false;

                // ★★★ 移除原有的12个月自动+1逻辑（移动到实验室天赋）★★★
                // 实验室互帮互助天赋效果在 applyLabTalentGrowth() 中处理

                // 关系条增长
                let relationGrowth = 0;
                if (person.type === 'advisor') {
                    relationGrowth = gameState.favor + (person.affinity || 0);
                } else if (['senior', 'peer', 'junior'].includes(person.type)) {
                    relationGrowth = gameState.social + (person.affinity || 0);
                } else if (person.type === 'lover') {
                    relationGrowth = person.intimacy || 0;
                }

                if (relationGrowth > 0 && person.relationMax) {
                    person.relationProgress = (person.relationProgress || 0) + relationGrowth;

                    // 保存动画数据
                    gameState._pendingRelationAnimations.push({
                        personId: person.id,
                        growth: relationGrowth
                    });

                    // ★★★ 关系条满时：立即重置为溢出值，设置可交流标志 ★★★
                    if (person.relationProgress >= person.relationMax) {
                        const overflow = person.relationProgress - person.relationMax;
                        person.relationProgress = overflow;
                        person.canInteract = true;  // 设置可交流标志（不累积）
                    }
                }
            });
        }

        // 播放待处理的关系动画
        function playPendingRelationAnimations() {
            if (!gameState._pendingRelationAnimations || gameState._pendingRelationAnimations.length === 0) return;

            gameState._pendingRelationAnimations.forEach((anim, index) => {
                setTimeout(() => {
                    animateRelationProgress(anim.personId, anim.growth);
                }, index * 100); // 错开动画时间
            });

            gameState._pendingRelationAnimations = [];
        }

        // ★★★ 交流按钮：检查可交流标志，推进任务 ★★★
        function interactWithPerson(personId) {
            const person = gameState.relationships.find(r => r.id === personId);
            if (!person) return;

            // 检查是否可以交流
            if (!person.canInteract) {
                showModal('💬 交流',
                    `<p style="text-align:center;">与<strong>${person.name}</strong>的关系还不够深厚</p>
                     <p style="text-align:center;color:var(--text-secondary);font-size:0.85rem;">关系进度：${person.relationProgress}/${person.relationMax}</p>`,
                    [{ text: '确定', class: 'btn-primary', action: closeModal }]);
                return;
            }

            // 清除可交流标志，执行免费任务
            person.canInteract = false;

            // ★★★ 统计：交流次数 ★★★
            if (!person.stats) person.stats = { taskCount: 0, interactCount: 0, completedCount: 0, helpReceivedCount: 0 };
            person.stats.interactCount++;

            addLog('关系加成', `与${person.name}关系融洽`, '自动推进任务');

            // ★★★ 直接调用合并后的函数，传入 isFree=true 和回调 ★★★
            if (person.type === 'advisor') {
                advanceAdvisorTask(personId, true, () => {
                    renderRelationshipPanel();
                });
            } else if (['senior', 'peer', 'junior'].includes(person.type)) {
                advanceFellowTask(personId, true, () => {
                    renderRelationshipPanel();
                });
            } else if (person.type === 'lover') {
                advanceLoverTask(personId, true, () => {
                    renderRelationshipPanel();
                });
            }
        }

        // 计算论文分数（与papers.js中相同的公式）
        function calculatePaperScore() {
            let base = Math.floor(Math.random() * 6);  // 0-5
            let researchBonus = Math.floor(gameState.research * 0.5);
            return base + researchBonus;
        }

        // ==================== 实验室互帮互助天赋系统 ====================

        // 检查实验室天赋是否激活（关系栏至少有2个角色）
        // ★★★ 实验室互帮互助天赋：需要同时拥有导师 + 师兄/师姐 + 师弟/师妹 ★★★
        function isLabTalentActive() {
            const relationships = gameState.relationships || [];
            const hasAdvisor = relationships.some(r => r.type === 'advisor');
            const hasSenior = relationships.some(r => r.type === 'senior');
            const hasJunior = relationships.some(r => r.type === 'junior');
            return hasAdvisor && hasSenior && hasJunior;
        }

        // 获取团队人数（不包括自己，即关系栏角色数量）
        function getTeamSize() {
            return (gameState.relationships || []).length;
        }

        // 获取实验室天赋的想idea/做实验/写论文加成
        function getLabTalentBonus() {
            if (!isLabTalentActive()) return 0;
            return getTeamSize();  // 团队人数（不包括自己）
        }

        // 每12个月应用实验室天赋的科研成长效果
        // 公式：每个非导师角色 +（科研能力/资源 > 该角色的人数）/ 2
        function applyLabTalentGrowth() {
            if (!isLabTalentActive()) return;

            const relationships = gameState.relationships || [];

            // 收集所有人的科研能力（包括玩家）
            // 导师用researchResource，其他用research
            const allResearchValues = [];

            // 玩家的科研能力
            allResearchValues.push({ id: 'player', research: gameState.research });

            // 关系栏所有角色
            relationships.forEach(person => {
                if (person.type === 'advisor') {
                    allResearchValues.push({ id: person.id, research: person.researchResource || 0 });
                } else {
                    allResearchValues.push({ id: person.id, research: person.research || 0 });
                }
            });

            // 对每个非导师角色计算成长
            relationships.forEach(person => {
                if (person.type === 'advisor') return;  // 导师不参与此成长

                // 检查是否到达12个月周期
                const addedAt = person.addedAt || 0;
                const monthsSinceAdded = gameState.totalMonths - addedAt;
                if (monthsSinceAdded <= 0 || monthsSinceAdded % 12 !== 0) return;

                const myResearch = person.research || 0;

                // 计算科研能力比该角色高的人数（包括玩家和其他角色）
                let higherCount = 0;
                allResearchValues.forEach(other => {
                    if (other.id !== person.id && other.research > myResearch) {
                        higherCount++;
                    }
                });

                // 成长值 = higherCount / 2（向下取整，最少0）
                const growth = Math.floor(higherCount / 2);

                if (growth > 0) {
                    person.research = Math.min(20, person.research + growth);
                    addLog('实验室成长', `${person.name}科研能力提升`, `+${growth}（${higherCount}人科研更高）`);
                }
            });
        }

        // ==================== 关系条动画效果 ====================

        // 触发任务进度条动画
        function animateTaskProgress(personId, changeAmount = 0) {
            const barEl = document.getElementById(`task-bar-${personId}`);
            const valueEl = document.getElementById(`task-value-${personId}`);
            const isIncrease = changeAmount >= 0;

            if (barEl) {
                barEl.classList.remove('pulse-increase', 'pulse-decrease');
                void barEl.offsetWidth; // 触发重绘
                barEl.classList.add(isIncrease ? 'pulse-increase' : 'pulse-decrease');
                setTimeout(() => {
                    barEl.classList.remove('pulse-increase', 'pulse-decrease');
                }, 600);
            }

            if (valueEl) {
                valueEl.classList.remove('value-change', 'value-decrease');
                void valueEl.offsetWidth;
                valueEl.classList.add(isIncrease ? 'value-change' : 'value-decrease');
                setTimeout(() => {
                    valueEl.classList.remove('value-change', 'value-decrease');
                }, 500);

                // 添加飞出数字效果
                if (changeAmount !== 0) {
                    const floatingEl = document.createElement('span');
                    floatingEl.className = `relation-floating-change ${isIncrease ? 'positive' : 'negative'}`;
                    floatingEl.textContent = isIncrease ? `+${changeAmount}` : `${changeAmount}`;
                    valueEl.appendChild(floatingEl);
                    setTimeout(() => floatingEl.remove(), 1000);
                }
            }
        }

        // 触发关系进度条动画
        function animateRelationProgress(personId, changeAmount = 0) {
            const barEl = document.getElementById(`relation-bar-${personId}`);
            const valueEl = document.getElementById(`relation-value-${personId}`);
            const isIncrease = changeAmount >= 0;

            if (barEl) {
                barEl.classList.remove('pulse-increase', 'pulse-decrease');
                void barEl.offsetWidth;
                barEl.classList.add(isIncrease ? 'pulse-increase' : 'pulse-decrease');
                setTimeout(() => {
                    barEl.classList.remove('pulse-increase', 'pulse-decrease');
                }, 600);
            }

            if (valueEl) {
                valueEl.classList.remove('value-change', 'value-decrease');
                void valueEl.offsetWidth;
                valueEl.classList.add(isIncrease ? 'value-change' : 'value-decrease');
                setTimeout(() => {
                    valueEl.classList.remove('value-change', 'value-decrease');
                }, 500);

                // 添加飞出数字效果
                if (changeAmount !== 0) {
                    const floatingEl = document.createElement('span');
                    floatingEl.className = `relation-floating-change ${isIncrease ? 'positive' : 'negative'}`;
                    floatingEl.textContent = isIncrease ? `+${changeAmount}` : `${changeAmount}`;
                    valueEl.appendChild(floatingEl);
                    setTimeout(() => floatingEl.remove(), 1000);
                }
            }
        }

        // 暴露全局函数
        window.isLabTalentActive = isLabTalentActive;
        window.getTeamSize = getTeamSize;
        window.getLabTalentBonus = getLabTalentBonus;
        window.applyLabTalentGrowth = applyLabTalentGrowth;
        window.animateTaskProgress = animateTaskProgress;
        window.animateRelationProgress = animateRelationProgress;
        window.playPendingRelationAnimations = playPendingRelationAnimations;

        // ★★★ 文科版：导出导师和学校类型（供学科配置覆盖）★★★
        window.ADVISOR_TYPES = ADVISOR_TYPES;
        window.UNIVERSITY_TYPES = UNIVERSITY_TYPES;
