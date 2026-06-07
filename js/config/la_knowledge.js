// ==================== 文科版学科知识卡片系统 ====================

// 学科知识卡片
const LA_KNOWLEDGE_CARDS = {
    common: [
        { title: '学术小知识', content: 'CSSCI期刊的退稿率高达90%以上，坚持就是胜利！', icon: '📚' },
        { title: '学术规范', content: '盲审是学术公平的重要保障，审稿人不知道作者身份。', icon: '⚖️' },
        { title: '发表周期', content: '一本学术期刊从投稿到见刊通常需要6-12个月。', icon: '⏰' },
        { title: '引用规范', content: '正确的引用格式是学术写作的基本功。', icon: '📖' },
        { title: '学术诚信', content: '学术不端行为包括抄袭、伪造数据、一稿多投等。', icon: '🚫' }
    ],
    chinese: [
        { title: '文学研究', content: '《文学评论》是中国文学研究的顶级期刊。', icon: '📝' },
        { title: '古代文学', content: '古代文学研究需要扎实的文献功底。', icon: '📜' },
        { title: '现当代文学', content: '现当代文学研究关注文学与社会的关系。', icon: '📖' },
        { title: '语言学', content: '语言学研究语言的结构、演变和使用。', icon: '🔤' }
    ],
    history: [
        { title: '史料考证', content: '历史研究需要严谨的史料考证。', icon: '📜' },
        { title: '考古发现', content: '考古发现可以改写历史认知。', icon: '🏺' },
        { title: '历史分期', content: '中国历史分为古代、近代、现代、当代。', icon: '📅' },
        { title: '史学方法', content: '历史研究方法包括文献分析、田野调查等。', icon: '🔍' }
    ],
    philosophy: [
        { title: '哲学思辨', content: '哲学研究需要严密的逻辑思辨能力。', icon: '🤔' },
        { title: '中国哲学', content: '儒家、道家、佛家是中国哲学的三大传统。', icon: '☯️' },
        { title: '西方哲学', content: '西方哲学分为古希腊、中世纪、近代、现代。', icon: '🏛️' },
        { title: '伦理学', content: '伦理学研究道德的本质和规范。', icon: '⚖️' }
    ],
    foreign_lang: [
        { title: '翻译理论', content: '信达雅是翻译的最高境界。', icon: '🌍' },
        { title: '比较文学', content: '比较文学研究不同国家文学的关系。', icon: '📚' },
        { title: '语言教学', content: '语言教学需要科学的方法和理论。', icon: '🏫' },
        { title: '跨文化交际', content: '跨文化交际研究不同文化间的沟通。', icon: '🤝' }
    ],
    journalism: [
        { title: '新闻专业主义', content: '新闻专业主义强调客观、公正、平衡。', icon: '📰' },
        { title: '传播学理论', content: '传播学研究信息的传递和接收。', icon: '📡' },
        { title: '新媒体', content: '新媒体改变了信息传播的方式。', icon: '📱' },
        { title: '舆论研究', content: '舆论研究关注公众意见的形成和变化。', icon: '💬' }
    ],
    information: [
        { title: '信息组织', content: '信息组织是图书馆学的核心内容。', icon: '📚' },
        { title: '情报分析', content: '情报分析需要科学的方法和工具。', icon: '🔍' },
        { title: '数字出版', content: '数字出版改变了出版业的格局。', icon: '📱' },
        { title: '知识管理', content: '知识管理帮助组织有效利用知识资源。', icon: '🧠' }
    ],
    sociology: [
        { title: '社会调查', content: '社会调查是社会学研究的基础方法。', icon: '📊' },
        { title: '社会分层', content: '社会分层研究社会不平等现象。', icon: '👥' },
        { title: '城市化', content: '城市化是中国社会转型的重要特征。', icon: '🏙️' },
        { title: '社会问题', content: '社会学关注各种社会问题的成因和解决。', icon: '❓' }
    ],
    education: [
        { title: '教育理论', content: '教育学理论指导教育实践。', icon: '📖' },
        { title: '课程设计', content: '课程设计需要考虑学生需求和社会发展。', icon: '📝' },
        { title: '教学方法', content: '好的教学方法能提高学习效果。', icon: '🏫' },
        { title: '教育评价', content: '教育评价是教育质量保障的重要手段。', icon: '📊' }
    ]
};

// 当前知识卡片索引
let currentKnowledgeIndex = {};

// 获取下一张知识卡片（无放回顺序遍历，遍历完一轮后重置）
function getRandomKnowledgeCard(discipline) {
    const pool = [...LA_KNOWLEDGE_CARDS.common, ...(LA_KNOWLEDGE_CARDS[discipline] || [])];

    if (!currentKnowledgeIndex[discipline]) {
        currentKnowledgeIndex[discipline] = 0;
    }

    // 无放回抽样
    if (currentKnowledgeIndex[discipline] >= pool.length) {
        currentKnowledgeIndex[discipline] = 0;
    }

    const card = pool[currentKnowledgeIndex[discipline]];
    currentKnowledgeIndex[discipline]++;

    return card;
}

// 显示知识卡片
function showKnowledgeCard(discipline) {
    const card = getRandomKnowledgeCard(discipline);

    const html = `
        <div style="text-align:center;margin-bottom:15px;">
            <div style="font-size:2rem;margin-bottom:8px;">${card.icon}</div>
            <div style="font-size:1rem;font-weight:600;color:var(--primary-color);">${card.title}</div>
        </div>
        <div style="padding:12px;background:var(--light-bg);border-radius:8px;">
            <div style="font-size:0.9rem;line-height:1.6;">${card.content}</div>
        </div>
    `;

    showModal('📚 学科知识', html, [
        { text: '知道了', class: 'btn-primary', action: closeModal }
    ]);
}

// 随机触发知识卡片（每月有一定概率）
function maybeShowKnowledgeCard() {
    if (!gameState.discipline) return;

    // 10%概率显示知识卡片，但不阻塞操作
    if (Math.random() < 0.1) {
        // 延迟显示，确保UI更新完成
        setTimeout(() => {
            const overlay = document.getElementById('modal-overlay');
            if (!overlay || !overlay.classList.contains('active')) {
                showKnowledgeCard(gameState.discipline);
            }
        }, 1000);
    }
}

// 全局导出
window.LA_KNOWLEDGE_CARDS = LA_KNOWLEDGE_CARDS;
window.getRandomKnowledgeCard = getRandomKnowledgeCard;
window.showKnowledgeCard = showKnowledgeCard;
window.maybeShowKnowledgeCard = maybeShowKnowledgeCard;
