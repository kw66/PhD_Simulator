// ==================== 文科版事件系统 ====================
// 学科专属随机事件 + 通用文科事件

// 文科版随机事件映射（替代原版CS事件）
const LA_RANDOM_EVENTS = {
    // 通用文科事件（所有学科共享）
    common: [
        {
            id: 'la_topic_rejected',
            title: '开题报告被否决',
            options: [
                { text: '认真修改重来（SAN-4，科研+1）', result: { san: -4, research: 1 } },
                { text: '换选题方向（SAN-2）', result: { san: -2 } },
                { text: '与导师沟通（好感≥6：选题+3；好感<6：好感-1）', result: { favorCheck: true } }
            ]
        },
        {
            id: 'la_plagiarism_check',
            title: '论文查重率过高',
            options: [
                { text: '认真降重（SAN-3，写作-2后重新修改）', result: { san: -3 } },
                { text: '使用降重工具（金钱-2，写作-1）', result: { gold: -2 } },
                { text: '大段重写（SAN-5）', result: { san: -5 } }
            ]
        },
        {
            id: 'la_blind_review',
            title: '盲审意见不理想',
            options: [
                { text: '逐条认真修改（SAN-4，论文分数+3）', result: { san: -4 } },
                { text: '申诉（30%成功）', result: { san: -2, chance: 0.3 } },
                { text: '换方向重写（SAN-5）', result: { san: -5 } }
            ]
        },
        {
            id: 'la_academic_misconduct',
            title: '学术不端举报风波',
            options: [
                { text: '保持沉默', result: {} },
                { text: '配合调查（SAN-2，社交+1）', result: { san: -2, social: 1 } },
                { text: '主动表态（SAN-1，好感-1，社交+2）', result: { san: -1, favor: -1, social: 2 } }
            ]
        },
        {
            id: 'la_cross_discipline',
            title: '需要跨学科合作',
            options: [
                { text: '主动联系其他学科（社交+2，科研+1）', result: { social: 2, research: 1 } },
                { text: '自己硬啃（SAN-3，科研+2）', result: { san: -3, research: 2 } },
                { text: '请导师介绍（好感≥6：社交+1，科研+1；好感<6：好感-1）', result: { favorCheck: true } }
            ]
        },
        {
            id: 'la_writing_workshop',
            title: '学术写作工作坊',
            options: [
                { text: '参加并认真练习（SAN-1，写作buff+3）', result: { san: -1, buff: 'write_bonus' } },
                { text: '旁听（SAN+1）', result: { san: 1 } },
                { text: '组织工作坊（社交+2，SAN-2）', result: { social: 2, san: -2 } }
            ]
        }
    ],

    // 人文学科专属事件
    humanities: [
        {
            id: 'la_ancient_text',
            title: '古籍文献查阅',
            options: [
                { text: '去图书馆古籍室（SAN-2，资料搜集+3）', result: { san: -2 } },
                { text: '申请影印本（金钱-1，资料搜集+2）', result: { gold: -1 } },
                { text: '找导师帮忙联系（好感≥6：免费+4；好感<6：好感-1）', result: { favorCheck: true } }
            ]
        },
        {
            id: 'la_lecture',
            title: '参加学术讲座',
            options: [
                { text: '认真听讲并提问（SAN-1，科研+1，社交+1）', result: { san: -1, research: 1, social: 1 } },
                { text: '听个大概（SAN+1）', result: { san: 1 } },
                { text: '借机认识大佬（社交≥6：社交+2；社交<6：社交-1）', result: { socialCheck: true } }
            ]
        },
        {
            id: 'la_textual_criticism',
            title: '版本校勘难题',
            options: [
                { text: '反复比对原文（SAN-3，资料搜集+5）', result: { san: -3 } },
                { text: '请教导师（好感≥6：好感+1，资料搜集+3；好感<6：好感-1）', result: { favorCheck: true } },
                { text: '参考已有研究（50%被指出错误）', result: { chance: 0.5 } }
            ]
        },
        {
            id: 'la_field_survey_humanities',
            title: '田野考古/调查',
            options: [
                { text: '自费前往（金钱-3，资料搜集+5，SAN+1）', result: { gold: -3, san: 1 } },
                { text: '申请科研经费（好感≥8：免费；好感<8：好感-1）', result: { favorCheck: true } },
                { text: '线上替代（资料搜集+2）', result: {} }
            ]
        },
        {
            id: 'la_citation_issue',
            title: '论文引用版本问题',
            options: [
                { text: '重新核对原文（SAN-2，写作+1）', result: { san: -2 } },
                { text: '使用二手引用（50%被审稿人发现：写作-2）', result: { chance: 0.5 } },
                { text: '删除该引用（无影响）', result: {} }
            ]
        },
        {
            id: 'la_conference_presentation',
            title: '学术会议报告紧张',
            options: [
                { text: '充分准备（SAN-3，社交+2，科研+1）', result: { san: -3, social: 2, research: 1 } },
                { text: '念稿（SAN-1，社交-1）', result: { san: -1, social: -1 } },
                { text: '让师弟师妹代讲（社交≥6：无事；社交<6：社交-1）', result: { socialCheck: true } }
            ]
        }
    ],

    // 社会学科专属事件
    social_science: [
        {
            id: 'la_low_response_rate',
            title: '问卷回收率太低',
            options: [
                { text: '扩大样本量（SAN-3，资料搜集+4）', result: { san: -3 } },
                { text: '提高问卷奖励（金钱-2，资料搜集+3）', result: { gold: -2 } },
                { text: '改用访谈法（SAN-2，资料搜集+2）', result: { san: -2 } }
            ]
        },
        {
            id: 'la_field_research_difficulty',
            title: '田野调查遇到困难',
            options: [
                { text: '坚持深入（SAN-4，资料搜集+6，科研+1）', result: { san: -4, research: 1 } },
                { text: '调整研究方案（SAN-2，资料搜集+3）', result: { san: -2 } },
                { text: '求助导师（好感≥6：资料搜集+4；好感<6：好感-1）', result: { favorCheck: true } }
            ]
        },
        {
            id: 'la_data_fraud_temptation',
            title: '数据造假诱惑',
            options: [
                { text: '坚守底线（SAN-1，科研+1）', result: { san: -1, research: 1 } },
                { text: '适当"优化"（50%被发现：科研-3，好感-3）', result: { chance: 0.5 } },
                { text: '换研究方向（SAN-3）', result: { san: -3 } }
            ]
        },
        {
            id: 'la_news_interview',
            title: '新闻采访实践',
            options: [
                { text: '深入采访（SAN-2，社交+2，资料搜集+3）', result: { san: -2, social: 2 } },
                { text: '电话采访（SAN-1，资料搜集+1）', result: { san: -1 } },
                { text: '网络搜集资料（资料搜集+2）', result: {} }
            ]
        },
        {
            id: 'la_qualitative_software',
            title: '质性分析软件学习',
            options: [
                { text: '自学NVivo（SAN-2，永久buff：资料搜集+2）', result: { san: -2, buff: 'research_bonus' } },
                { text: '参加培训（金钱-2，永久buff）', result: { gold: -2, buff: 'research_bonus' } },
                { text: '请教师弟师妹（社交≥6：免费学习；社交<6：社交-1）', result: { socialCheck: true } }
            ]
        },
        {
            id: 'la_policy_report_accepted',
            title: '政策研究报告被采纳',
            options: [
                { text: '继续深入研究（科研+2，社交+1）', result: { research: 2, social: 1 } },
                { text: '申请后续经费（金钱+3）', result: { gold: 3 } },
                { text: '发表为论文（科研+1）', result: { research: 1 } }
            ]
        },
        {
            id: 'la_education_experiment',
            title: '教育实验班管理困难',
            options: [
                { text: '耐心沟通（SAN-3，资料搜集+4）', result: { san: -3 } },
                { text: '调整实验方案（SAN-1，资料搜集+2）', result: { san: -1 } },
                { text: '求助合作教师（社交≥6：资料搜集+3；社交<6：社交-1）', result: { socialCheck: true } }
            ]
        }
    ],

    // 学科细分专属事件
    discipline_specific: {
        chinese: [
            { id: 'la_poetry_contest', title: '诗词朗诵比赛', options: [
                { text: '认真准备（SAN-2，社交+2）', result: { san: -2, social: 2 } },
                { text: '随便应付（SAN+1）', result: { san: 1 } }
            ]},
            { id: 'la_dialect_research', title: '方言调查', options: [
                { text: '深入乡村（SAN-3，资料搜集+5）', result: { san: -3 } },
                { text: '线上调查（资料搜集+2）', result: {} }
            ]}
        ],
        history: [
            { id: 'la_archive_visit', title: '档案馆查阅', options: [
                { text: '申请特殊许可（金钱-2，资料搜集+5）', result: { gold: -2 } },
                { text: '普通阅览（资料搜集+2）', result: {} }
            ]},
            { id: 'la_artifact_excavation', title: '考古发掘邀请', options: [
                { text: '参加发掘（SAN-4，资料搜集+6，科研+2）', result: { san: -4, research: 2 } },
                { text: '婉拒（无影响）', result: {} }
            ]}
        ],
        philosophy: [
            { id: 'la_philosophy_debate', title: '哲学辩论会', options: [
                { text: '积极参与（SAN-1，科研+1，社交+1）', result: { san: -1, research: 1, social: 1 } },
                { text: '旁听学习（SAN+1）', result: { san: 1 } }
            ]},
            { id: 'la_ethics_case', title: '伦理案例分析', options: [
                { text: '深入研究（SAN-2，科研+2）', result: { san: -2, research: 2 } },
                { text: '参考已有分析（科研+1）', result: { research: 1 } }
            ]}
        ],
        foreign_lang: [
            { id: 'la_translation_project', title: '翻译项目邀请', options: [
                { text: '接受翻译（SAN-3，金钱+3，科研+1）', result: { san: -3, gold: 3, research: 1 } },
                { text: '婉拒（无影响）', result: {} }
            ]},
            { id: 'la_cross_culture', title: '跨文化交流活动', options: [
                { text: '积极参与（SAN+1，社交+2）', result: { san: 1, social: 2 } },
                { text: '准备发言（SAN-1，科研+1）', result: { san: -1, research: 1 } }
            ]}
        ],
        journalism: [
            { id: 'la_viral_content', title: '爆款内容创作', options: [
                { text: '认真策划（SAN-2，社交+3）', result: { san: -2, social: 3 } },
                { text: '随便发发（社交+1）', result: { social: 1 } }
            ]},
            { id: 'la_media_campaign', title: '媒体宣传活动', options: [
                { text: '主导策划（SAN-3，社交+2，金钱+2）', result: { san: -3, social: 2, gold: 2 } },
                { text: '协助参与（社交+1）', result: { social: 1 } }
            ]}
        ],
        information: [
            { id: 'la_data_mining', title: '数据挖掘项目', options: [
                { text: '深入分析（SAN-3，科研+2）', result: { san: -3, research: 2 } },
                { text: '使用现成工具（SAN-1，科研+1）', result: { san: -1, research: 1 } }
            ]},
            { id: 'la_archive_digitization', title: '档案数字化项目', options: [
                { text: '参与项目（SAN-2，金钱+2，科研+1）', result: { san: -2, gold: 2, research: 1 } },
                { text: '旁观学习（无影响）', result: {} }
            ]}
        ],
        sociology: [
            { id: 'la_ethnography', title: '民族志研究邀请', options: [
                { text: '深入田野（SAN-4，资料搜集+6，科研+2）', result: { san: -4, research: 2 } },
                { text: '短期参与（SAN-2，资料搜集+3）', result: { san: -2 } }
            ]},
            { id: 'la_community_service', title: '社区服务实践', options: [
                { text: '积极参与（SAN-1，社交+2，资料搜集+2）', result: { san: -1, social: 2 } },
                { text: '观察记录（资料搜集+1）', result: {} }
            ]}
        ],
        education: [
            { id: 'la_teaching_practice', title: '教学实践机会', options: [
                { text: '认真准备（SAN-3，科研+2，好感+1）', result: { san: -3, research: 2, favor: 1 } },
                { text: '简单试讲（SAN-1，科研+1）', result: { san: -1, research: 1 } }
            ]},
            { id: 'la_curriculum_design', title: '课程设计项目', options: [
                { text: '主导设计（SAN-3，科研+2，金钱+2）', result: { san: -3, research: 2, gold: 2 } },
                { text: '协助参与（科研+1）', result: { research: 1 } }
            ]}
        ]
    }
};

// 获取学科对应的随机事件池
function getLiberalArtsEventPool(discipline, category) {
    const pool = [...LA_RANDOM_EVENTS.common];

    // 添加大类事件
    if (category === 'humanities') {
        pool.push(...LA_RANDOM_EVENTS.humanities);
    } else if (category === 'social_science') {
        pool.push(...LA_RANDOM_EVENTS.social_science);
    }

    // 添加细分学科事件
    if (LA_RANDOM_EVENTS.discipline_specific[discipline]) {
        pool.push(...LA_RANDOM_EVENTS.discipline_specific[discipline]);
    }

    return pool;
}

// 文科版随机事件触发函数
function triggerLiberalArtsRandomEvent() {
    const discipline = gameState.discipline;
    const category = gameState.disciplineCategory;

    if (!discipline || !category) {
        // 如果没有学科信息，使用原版事件
        triggerOtherRandomEvent();
        return;
    }

    const eventPool = getLiberalArtsEventPool(discipline, category);

    // 从可用事件中随机选择
    if (!gameState.availableLAEvents || gameState.availableLAEvents.length === 0) {
        // 重置事件池
        gameState.availableLAEvents = eventPool.map((_, i) => i);
        gameState.usedLAEvents = [];
    }

    if (gameState.availableLAEvents.length === 0) {
        addLog('随机事件', '本年度事件已触发完毕', '等待新的一年');
        return;
    }

    const eventIndex = Math.floor(Math.random() * gameState.availableLAEvents.length);
    const poolIndex = gameState.availableLAEvents[eventIndex];

    // 从可用池中移除
    gameState.availableLAEvents.splice(eventIndex, 1);
    if (!gameState.usedLAEvents.includes(poolIndex)) {
        gameState.usedLAEvents.push(poolIndex);
    }

    const event = eventPool[poolIndex];
    if (!event) return;

    // 显示事件弹窗
    showLARandomEventModal(event);
}

// 显示文科随机事件弹窗
function showLARandomEventModal(event) {
    const buttons = event.options.map((opt, i) => {
        return {
            text: opt.text,
            class: i === 0 ? 'btn-primary' : (i === 1 ? 'btn-info' : 'btn-warning'),
            action: () => {
                closeModal();
                applyLARandomEventResult(event, opt.result);
            }
        };
    });

    showModal('📚 随机事件', `<p>${event.title}</p>`, buttons);
}

// 应用文科随机事件结果
function applyLARandomEventResult(event, result) {
    let logDetail = '';

    if (result.san) {
        changeSan(result.san);
        logDetail += `SAN${result.san > 0 ? '+' : ''}${result.san}`;
    }
    if (result.research) {
        changeResearch(result.research);
        logDetail += `${logDetail ? '，' : ''}科研+${result.research}`;
    }
    if (result.social) {
        changeSocial(result.social);
        logDetail += `${logDetail ? '，' : ''}社交${result.social > 0 ? '+' : ''}${result.social}`;
    }
    if (result.favor) {
        changeFavor(result.favor);
        logDetail += `${logDetail ? '，' : ''}好感${result.favor > 0 ? '+' : ''}${result.favor}`;
    }
    if (result.gold) {
        changeGold(result.gold);
        logDetail += `${logDetail ? '，' : ''}金币${result.gold > 0 ? '+' : ''}${result.gold}`;
    }

    // 好感检查选项
    if (result.favorCheck) {
        if (gameState.favor >= 6) {
            changeResearch(1);
            logDetail += '好感≥6：科研+1';
        } else {
            changeFavor(-1);
            logDetail += '好感<6：好感-1';
        }
    }

    // 社交检查选项
    if (result.socialCheck) {
        if (gameState.social >= 6) {
            changeSocial(2);
            logDetail += '社交≥6：社交+2';
        } else {
            changeSocial(-1);
            logDetail += '社交<6：社交-1';
        }
    }

    // 概率事件
    if (result.chance && Math.random() < result.chance) {
        // 成功
        if (result.buff === 'write_bonus') {
            gameState.buffs.temporary.push({
                type: 'write_bonus',
                name: '写作工作坊buff',
                value: 3,
                permanent: false
            });
            logDetail += '，获得写作buff+3';
        }
    }

    addLog('随机事件', event.title, logDetail || '无事发生');
    updateAllUI();
}

// 重置文科事件池（每年调用）
function resetLiberalArtsEventPool() {
    gameState.availableLAEvents = [];
    gameState.usedLAEvents = [];
}

// 全局导出
window.LA_RANDOM_EVENTS = LA_RANDOM_EVENTS;
window.getLiberalArtsEventPool = getLiberalArtsEventPool;
window.triggerLiberalArtsRandomEvent = triggerLiberalArtsRandomEvent;
window.resetLiberalArtsEventPool = resetLiberalArtsEventPool;
