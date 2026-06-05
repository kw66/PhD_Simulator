// ==================== 文科版生涯总结系统 ====================

// 文科版角色自述语录
const LA_CHARACTER_QUOTES = {
    chinese: {
        normal: { positive: '从《诗经》到《红楼梦》，从古典到现代，文学的河流带我走过了这段旅程。', negative: '也许我的论文不够完美，但每一个字都是我认真写下的。' },
        scholar: { positive: '家学渊源，让我在学术之路上走得更稳。感谢家族的熏陶。', negative: '学术世家的期望有时也是一种压力，但我学会了与之共处。' },
        writer: { positive: '文思泉涌，笔下生花。写作是我最大的武器，也是最好的慰藉。', negative: '有时候写不出来也是一种痛苦，但我从未放弃过表达。' },
        social: { positive: '朋友遍天下，人脉即资源。感谢每一位在路上帮助过我的人。', negative: '有时候太在意别人的看法，反而迷失了自己。' },
        chosen: { positive: '命运眷顾我，让我遇到了最好的时机和机会。', negative: '运气好只是暂时的，实力才是永恒的追求。' }
    },
    history: {
        normal: { positive: '以史为鉴，可以知兴替。这段研究之旅让我更懂历史，也更懂自己。', negative: '历史的尘埃中，我找到了属于自己的那一页。' },
        scholar: { positive: '家学渊源，让我在历史的长河中找到了自己的方向。', negative: '历史研究需要耐心，有时候我也想快一点。' },
        archaeologist: { positive: '田野调查虽然辛苦，但每一次发现都让我兴奋不已。', negative: '田野的风险和不确定性，让我学会了敬畏自然。' },
        social: { positive: '历史研究也需要合作，感谢每一位同行者。', negative: '有时候独自研究也会感到孤独。' },
        chosen: { positive: '天时地利人和，我的历史研究之路一帆风顺。', negative: '命运给了我机会，但我还需要自己把握。' }
    },
    philosophy: {
        normal: { positive: '思考是人类最高贵的活动。这段哲学之旅让我更懂生命的意义。', negative: '哲学的深渊有时让人迷失，但我找到了自己的出路。' },
        scholar: { positive: '哲学世家的熏陶，让我在思辨之路上走得更远。', negative: '哲学思考有时让人痛苦，但痛苦也是成长的一部分。' },
        thinker: { positive: '独立思考，不随波逐流。这是我最大的财富。', negative: '固执己见有时也是一种缺点，但我学会了反思。' },
        social: { positive: '哲学需要对话，感谢每一位与我辩论的朋友。', negative: '有时候独自沉思也是一种享受。' },
        chosen: { positive: '命运给了我哲学的天赋，我用它来探索真理。', negative: '哲学之路漫长，我还在路上。' }
    },
    foreign_lang: {
        normal: { positive: '语言是文化的桥梁。这段外语研究之旅让我看到了更广阔的世界。', negative: '语言学习的路上有挫折，但我从未放弃。' },
        scholar: { positive: '多语言的背景让我在学术研究中如鱼得水。', negative: '跨文化研究有时也会遇到障碍，但我学会了适应。' },
        polyglot: { positive: '精通多门语言，让我能够与世界各地的学者交流。', negative: '语言太多有时也会混乱，但我找到了平衡。' },
        social: { positive: '外语研究需要社交，感谢每一位与我交流的外国朋友。', negative: '跨文化交流有时也会有误解。' },
        chosen: { positive: '命运给了我语言的天赋，我用它来连接世界。', negative: '语言学习永无止境，我还在路上。' }
    },
    journalism: {
        normal: { positive: '新闻人的本能让我始终保持好奇，学术训练让我学会了深度思考。', negative: '新闻与学术的平衡有时很难，但我找到了自己的路。' },
        reporter: { positive: '新闻嗅觉让我在学术研究中总能找到好选题。', negative: '追求真相有时也会遇到阻力。' },
        data_journalist: { positive: '用数据说话，这是我最大的优势。', negative: '数据分析有时也会出错，但我学会了谨慎。' },
        social: { positive: '新闻研究需要广泛的人脉，感谢每一位受访者。', negative: '社交有时也会让人疲惫。' },
        chosen: { positive: '命运给了我新闻的天赋，我用它来记录时代。', negative: '新闻之路充满挑战，但我从未退缩。' }
    },
    information: {
        normal: { positive: '信息时代，知识就是力量。这段研究之旅让我更懂信息的价值。', negative: '信息过载有时也会让人迷失，但我找到了方向。' },
        librarian: { positive: '知识管家的天赋让我在信息的海洋中游刃有余。', negative: '整理知识有时也会感到枯燥，但我乐在其中。' },
        publisher: { positive: '出版实践让我更懂学术传播的规律。', negative: '出版行业的变化有时也会让人焦虑。' },
        social: { positive: '信息研究需要合作，感谢每一位与我分享信息的同行。', negative: '信息孤岛有时也会让人感到孤独。' },
        chosen: { positive: '命运给了我信息的天赋，我用它来服务社会。', negative: '信息之路漫长，我还在路上。' }
    },
    sociology: {
        normal: { positive: '走进田野，走近人群，社会学让我看到了一个更真实的世界。', negative: '每一次访谈、每一份问卷，都让我对这个世界多了一份理解。' },
        fieldworker: { positive: '田野调查虽然辛苦，但每一次发现都让我兴奋不已。', negative: '田野的风险和不确定性，让我学会了敬畏自然。' },
        data_analyst: { positive: '用数据说话，这是我最大的优势。', negative: '数据分析有时也会出错，但我学会了谨慎。' },
        social: { positive: '社会学研究需要广泛的人脉，感谢每一位受访者。', negative: '社交有时也会让人疲惫。' },
        chosen: { positive: '命运给了我社会学的天赋，我用它来理解社会。', negative: '社会学之路充满挑战，但我从未退缩。' }
    },
    education: {
        normal: { positive: '教育是国家的未来。这段研究之旅让我更懂教育的意义。', negative: '教育研究有时也会遇到挫折，但我从未放弃。' },
        teacher_natural: { positive: '天生的教师，让我在教育研究中如鱼得水。', negative: '教学与研究的平衡有时很难，但我找到了自己的路。' },
        edtech: { positive: '技术赋能教育，这是我最大的优势。', negative: '技术有时也会出问题，但我学会了应对。' },
        social: { positive: '教育研究需要合作，感谢每一位与我交流的同行。', negative: '教育研究有时也会感到孤独。' },
        chosen: { positive: '命运给了我教育的天赋，我用它来培养人才。', negative: '教育之路漫长，我还在路上。' }
    }
};

// 文科版导师描述
const LA_ADVISOR_DESCRIPTIONS = {
    'level1': {
        title: '学科带头人',
        desc: '学术地位崇高，资源丰富但要求极高。邮件回复以周计算，组会以月计算。',
        quote: '"这个方向很有前景，但你需要更深入地思考..."'
    },
    'level2': {
        title: '海归学者',
        desc: '视野开阔，要求较高。经常分享国际前沿研究，但有时不太了解国内情况。',
        quote: '"你可以参考一下这个国际期刊的最新研究..."'
    },
    'level3': {
        title: '严谨学者',
        desc: '注重细节，要求严格。改论文改到你怀疑人生，但成长速度也是最快的。',
        quote: '"这个地方再改改，我觉得可以更好..."'
    },
    'level4': {
        title: '博学教授',
        desc: '知识渊博，要求中等。给你充分的指导，但也需要你自己努力。',
        quote: '"你可以看看这个方向的经典文献..."'
    },
    'level5': {
        title: '佛系导师',
        desc: '要求不高，自由发展。给你充分的自由度，但也意味着你需要自己摸索前进的方向。',
        quote: '"你自己看着办吧，有问题再来找我。"'
    },
    'level6': {
        title: '青年教师',
        desc: '刚起步的课题组，资源有限但关系亲近，一起成长的感觉。',
        quote: '"我们一起努力，把这个方向做起来！"'
    },
    'level7': {
        title: '项目导师',
        desc: '课题多、经费充足，但可能会被拉去做项目，学术产出要自己抓。',
        quote: '"这个月的项目进度怎么样了？"'
    },
    'default': {
        title: '普通导师',
        desc: '中规中矩，该有的都有，该管的都管。',
        quote: '"按计划推进就好。"'
    }
};

// 获取文科版角色自述
function getLiberalArtsCharacterQuote(character, discipline, isPositiveEnding) {
    const disciplineQuotes = LA_CHARACTER_QUOTES[discipline];
    if (!disciplineQuotes) {
        // 如果没有学科特定的引用，使用通用引用
        const charQuotes = CHARACTER_QUOTES[character] || CHARACTER_QUOTES['normal'];
        return isPositiveEnding ? charQuotes.positive : charQuotes.negative;
    }

    const charQuotes = disciplineQuotes[character] || disciplineQuotes['normal'];
    return isPositiveEnding ? charQuotes.positive : charQuotes.negative;
}

// 获取文科版导师描述
function getLiberalArtsAdvisorDescription(advisorType) {
    return LA_ADVISOR_DESCRIPTIONS[advisorType] || LA_ADVISOR_DESCRIPTIONS['default'];
}

// 全局导出
window.LA_CHARACTER_QUOTES = LA_CHARACTER_QUOTES;
window.LA_ADVISOR_DESCRIPTIONS = LA_ADVISOR_DESCRIPTIONS;
window.getLiberalArtsCharacterQuote = getLiberalArtsCharacterQuote;
window.getLiberalArtsAdvisorDescription = getLiberalArtsAdvisorDescription;
