// ==================== 文科版游戏数据 ====================
// 每个学科的配置，包含：角色、论文标题、期刊、商店、成就、结局

// ==================== 论文标题生成器 ====================
const LA_PAPER_TITLES = {
    chinese: {
        adjectives: ['论', '试论', '再论', '浅析', '略论', '新论', '重读', '重探', '从...看', '以...为例'],
        nouns: ['《红楼梦》', '《史记》', '鲁迅', '李白', '杜甫', '唐诗', '宋词', '元曲', '现代小说', '网络文学', '女性写作', '乡土文学', '先锋文学', '朦胧诗', '散文'],
        verbs: ['叙事', '意象', '隐喻', '结构', '主题', '风格', '传承', '演变', '比较', '接受'],
        domains: ['艺术特色', '文化意蕴', '美学价值', '当代意义', '接受史', '比较研究', '思想内涵', '文学史地位', '现代阐释', '跨文化传播']
    },
    history: {
        adjectives: ['论', '试析', '考辨', '新探', '再考察', '钩沉', '补证', '以...为中心'],
        nouns: ['唐代科举', '宋代商业', '明清社会', '五四运动', '抗战时期', '改革开放', '丝绸之路', '海上贸易', '近代教育', '革命根据地', '土地制度', '科举制度', '宗族社会', '城市化'],
        verbs: ['演变', '发展', '变迁', '转型', '互动', '冲突', '融合', '建构', '解构', '重构'],
        domains: ['的历史考察', '的社会影响', '的制度分析', '的文化意义', '的比较研究', '再探', '新证', '考论', '述评']
    },
    philosophy: {
        adjectives: ['论', '试论', '探析', '辨析', '新解', '重估', '从...看', '基于...的'],
        nouns: ['儒家仁学', '道家自然', '康德道德', '海德格尔存在', '后现代主义', '人工智能伦理', '生命政治', '技术哲学', '环境伦理', '心灵哲学', '知识论', '美学', '逻辑学', '政治哲学'],
        verbs: ['的哲学意蕴', '的当代价值', '的逻辑分析', '的伦理反思', '的存在论基础', '的认识论考察', '的方法论意义', '的批判性审视', '的重构', '的诠释'],
        domains: ['研究', '探微', '辨正', '商榷', '述评', '反思', '展望', '新论']
    },
    foreign_lang: {
        adjectives: ['On', 'A Study of', 'Revisiting', 'Rethinking', 'Exploring', 'An Analysis of', 'Toward', 'Beyond'],
        nouns: ['Shakespeare', 'Hemingway', 'Postcolonialism', 'Translation', 'Discourse', 'Pragmatics', 'Cognitive Linguistics', 'Narratology', 'Feminism', 'Ecocriticism'],
        verbs: ['in the Context of', 'from the Perspective of', 'and Its Implications for', 'as a Framework for', 'Revisited', 'Reconsidered'],
        domains: ['Literary Studies', 'Cultural Identity', 'Digital Age', 'Cross-Cultural Communication', 'Language Teaching', 'Translation Studies', 'Applied Linguistics']
    },
    journalism: {
        adjectives: ['论', '试析', '新媒体环境下', '融合传播视域下', '算法推荐时代', '全媒体背景下', '智媒时代'],
        nouns: ['短视频传播', '社交媒体舆论', '新闻专业主义', '虚假信息治理', '县级融媒体', '国际传播', '数据新闻', '计算传播', '平台治理', '数字素养', '用户参与', '算法偏见', '媒介记忆'],
        verbs: ['的机制研究', '的效果分析', '的路径探索', '的困境与出路', '的实证研究', '的影响因素', '的理论建构', '的实践创新', '的模式比较', '的策略优化'],
        domains: ['传播学', '新闻学', '广告学', '新媒体', '舆论学', '国际传播']
    },
    information: {
        adjectives: ['基于', '面向', '数字人文视域下', '大数据背景下', '智慧图书馆', '开放科学视角下'],
        nouns: ['知识图谱', '数字出版', '开放获取', '信息检索', '用户行为', '数据素养', '文献计量', '竞争情报', '档案数字化', '学术评价', '知识服务', '信息生态', '数字遗产'],
        verbs: ['的模型构建', '的影响因素研究', '的服务创新', '的评价体系', '的发展策略', '的演化分析', '的框架设计', '的实证研究', '的比较研究', '的优化路径'],
        domains: ['图书馆学', '情报学', '档案学', '出版学', '信息科学', '知识管理']
    },
    sociology: {
        adjectives: ['转型期', '城市化进程中', '乡村振兴背景下', '数字时代', '后疫情时代', '全球化语境下'],
        nouns: ['社会分层', '社区治理', '留守儿童', '老龄化', '网络社会', '消费文化', '社会信任', '数字劳动', '平台经济', '环境正义', '性别平等', '流动人口', '社会心态'],
        verbs: ['的实证研究', '的社会机制', '的影响因素', '的质性研究', '的比较分析', '的理论反思', '的实践探索', '的治理路径', '的生成逻辑', '的再生产'],
        domains: ['社会学研究', '社会工作', '人类学', '民俗学', '社会政策']
    },
    education: {
        adjectives: ['核心素养导向下', '新课改背景下', '信息化环境中', '双减政策下', '深度学习视域下', '五育融合背景下'],
        nouns: ['课堂教学', '教师专业发展', '课程设计', '在线教育', '教育公平', 'STEM教育', '项目式学习', '教育评价', '家校合作', '教育治理', '课程思政', '拔尖创新人才培养'],
        verbs: ['的行动研究', '的案例分析', '的效果评估', '的设计研究', '的比较研究', '的质性研究', '的实验研究', '的调查研究', '的混合研究', '的循证研究'],
        domains: ['教育学', '课程论', '教学论', '高等教育', '职业教育', '学前教育']
    }
};

// ==================== 期刊/会议配置 ====================
const LA_CONFERENCES = {
    chinese: {
        1: { S: { name: '文学评论', field: '文学理论' }, A: { name: '中国语文', field: '语言学' }, B: { name: '当代文坛', field: '当代文学' } },
        2: { S: { name: '文学遗产', field: '古代文学' }, A: { name: '文艺研究', field: '文艺理论' }, B: { name: '语言研究', field: '语言学' } },
        3: { S: { name: '中国社会科学', field: '综合' }, A: { name: '外国文学评论', field: '外国文学' }, B: { name: '红楼梦学刊', field: '古典文学' } },
        4: { S: { name: '文学评论', field: '文学理论' }, A: { name: '中国现代文学研究丛刊', field: '现代文学' }, B: { name: '民族文学研究', field: '民族文学' } },
        5: { S: { name: '文学遗产', field: '古代文学' }, A: { name: '古汉语研究', field: '古代汉语' }, B: { name: '世界文学', field: '外国文学' } },
        6: { S: { name: '中国社会科学', field: '综合' }, A: { name: '文艺理论与批评', field: '文艺理论' }, B: { name: '当代作家评论', field: '当代文学' } },
        7: { S: { name: '文学评论', field: '文学理论' }, A: { name: '鲁迅研究月刊', field: '鲁迅研究' }, B: { name: '明清小说研究', field: '古典小说' } },
        8: { S: { name: '文学遗产', field: '古代文学' }, A: { name: '诗探索', field: '诗歌研究' }, B: { name: '新文学史料', field: '现代文学' } },
        9: { S: { name: '中国社会科学', field: '综合' }, A: { name: '中国比较文学', field: '比较文学' }, B: { name: '华文文学', field: '海外华文' } },
        10: { S: { name: '文学评论', field: '文学理论' }, A: { name: '小说评论', field: '小说研究' }, B: { name: '南方文坛', field: '当代文学' } },
        11: { S: { name: '文学遗产', field: '古代文学' }, A: { name: '民族艺术', field: '民族艺术' }, B: { name: '扬子江文学评论', field: '当代文学' } },
        12: { S: { name: '中国社会科学', field: '综合' }, A: { name: '文艺争鸣', field: '文艺理论' }, B: { name: '中国文学批评', field: '文学批评' } }
    },
    history: {
        1: { S: { name: '历史研究', field: '历史学' }, A: { name: '中国史研究', field: '中国古代史' }, B: { name: '史学月刊', field: '史学理论' } },
        2: { S: { name: '中国社会科学', field: '综合' }, A: { name: '近代史研究', field: '近现代史' }, B: { name: '历史教学', field: '历史教育' } },
        3: { S: { name: '历史研究', field: '历史学' }, A: { name: '世界历史', field: '世界史' }, B: { name: '中国历史地理论丛', field: '历史地理' } },
        4: { S: { name: '中国社会科学', field: '综合' }, A: { name: '考古学报', field: '考古学' }, B: { name: '史学集刊', field: '史学理论' } },
        5: { S: { name: '历史研究', field: '历史学' }, A: { name: '中国经济史研究', field: '经济史' }, B: { name: '文献', field: '文献学' } },
        6: { S: { name: '中国社会科学', field: '综合' }, A: { name: '抗日战争研究', field: '抗战史' }, B: { name: '清史研究', field: '清史' } },
        7: { S: { name: '历史研究', field: '历史学' }, A: { name: '中国社会经济史研究', field: '社会经济史' }, B: { name: '安徽史学', field: '地方史' } },
        8: { S: { name: '中国社会科学', field: '综合' }, A: { name: '史学理论研究', field: '史学理论' }, B: { name: '中国史研究动态', field: '学术动态' } },
        9: { S: { name: '历史研究', field: '历史学' }, A: { name: '当代中国史研究', field: '当代史' }, B: { name: '西域研究', field: '边疆史' } },
        10: { S: { name: '中国社会科学', field: '综合' }, A: { name: '中华文史论丛', field: '文史' }, B: { name: '民国档案', field: '民国史' } },
        11: { S: { name: '历史研究', field: '历史学' }, A: { name: '中国农史', field: '农业史' }, B: { name: '农业考古', field: '考古' } },
        12: { S: { name: '中国社会科学', field: '综合' }, A: { name: '文物', field: '文物考古' }, B: { name: '中国地方志', field: '方志学' } }
    },
    philosophy: {
        1: { S: { name: '哲学研究', field: '哲学' }, A: { name: '道德与文明', field: '伦理学' }, B: { name: '哲学动态', field: '哲学动态' } },
        2: { S: { name: '中国社会科学', field: '综合' }, A: { name: '自然辩证法研究', field: '科技哲学' }, B: { name: '伦理学研究', field: '伦理学' } },
        3: { S: { name: '哲学研究', field: '哲学' }, A: { name: '中国哲学史', field: '中国哲学' }, B: { name: '世界哲学', field: '外国哲学' } },
        4: { S: { name: '中国社会科学', field: '综合' }, A: { name: '现代哲学', field: '现代哲学' }, B: { name: '科学技术哲学研究', field: '科技哲学' } },
        5: { S: { name: '哲学研究', field: '哲学' }, A: { name: '逻辑学研究', field: '逻辑学' }, B: { name: '中国儒学', field: '儒学' } },
        6: { S: { name: '中国社会科学', field: '综合' }, A: { name: '马克思主义与现实', field: '马哲' }, B: { name: '孔子研究', field: '儒学' } },
        7: { S: { name: '哲学研究', field: '哲学' }, A: { name: '伦理学术', field: '伦理学' }, B: { name: '哲学分析', field: '分析哲学' } },
        8: { S: { name: '中国社会科学', field: '综合' }, A: { name: '周易研究', field: '易学' }, B: { name: '道家文化研究', field: '道家' } },
        9: { S: { name: '哲学研究', field: '哲学' }, A: { name: '宗教学研究', field: '宗教学' }, B: { name: '基督宗教研究', field: '宗教' } },
        10: { S: { name: '中国社会科学', field: '综合' }, A: { name: '美学', field: '美学' }, B: { name: '文艺理论研究', field: '文艺理论' } },
        11: { S: { name: '哲学研究', field: '哲学' }, A: { name: '科学学研究', field: '科学学' }, B: { name: '自然辩证法通讯', field: '科技哲学' } },
        12: { S: { name: '中国社会科学', field: '综合' }, A: { name: '马克思主义研究', field: '马哲' }, B: { name: '当代中国价值观研究', field: '价值论' } }
    },
    foreign_lang: {
        1: { S: { name: '外语教学与研究', field: '外语教学' }, A: { name: '外国语', field: '语言学' }, B: { name: '外语学刊', field: '外语研究' } },
        2: { S: { name: '中国翻译', field: '翻译学' }, A: { name: '现代外语', field: '语言学' }, B: { name: '外语教学', field: '教学法' } },
        3: { S: { name: '外语教学与研究', field: '外语教学' }, A: { name: '外国文学', field: '文学' }, B: { name: '外国语文', field: '综合' } },
        4: { S: { name: '中国翻译', field: '翻译学' }, A: { name: '外语界', field: '教学' }, B: { name: '中国外语', field: '综合' } },
        5: { S: { name: '外语教学与研究', field: '外语教学' }, A: { name: '当代语言学', field: '语言学' }, B: { name: '外语研究', field: '综合' } },
        6: { S: { name: '中国翻译', field: '翻译学' }, A: { name: '外国文学评论', field: '文学评论' }, B: { name: '天津外国语大学学报', field: '综合' } },
        7: { S: { name: '外语教学与研究', field: '外语教学' }, A: { name: '语言教学与研究', field: '教学' }, B: { name: '北京第二外国语学院学报', field: '综合' } },
        8: { S: { name: '中国翻译', field: '翻译学' }, A: { name: '中国比较文学', field: '比较文学' }, B: { name: '上海翻译', field: '翻译' } },
        9: { S: { name: '外语教学与研究', field: '外语教学' }, A: { name: '外语电化教学', field: '教育技术' }, B: { name: '西安外国语大学学报', field: '综合' } },
        10: { S: { name: '中国翻译', field: '翻译学' }, A: { name: '外语与外语教学', field: '教学' }, B: { name: '广东外语外贸大学学报', field: '综合' } },
        11: { S: { name: '外语教学与研究', field: '外语教学' }, A: { name: '日语学习与研究', field: '日语' }, B: { name: '解放军外国语学院学报', field: '综合' } },
        12: { S: { name: '中国翻译', field: '翻译学' }, A: { name: '外语教育研究前沿', field: '教育' }, B: { name: '山东外语教学', field: '教学' } }
    },
    journalism: {
        1: { S: { name: '新闻与传播研究', field: '新闻传播' }, A: { name: '现代传播', field: '传播学' }, B: { name: '新闻记者', field: '新闻实务' } },
        2: { S: { name: '中国社会科学', field: '综合' }, A: { name: '国际新闻界', field: '国际传播' }, B: { name: '传媒观察', field: '传媒' } },
        3: { S: { name: '新闻与传播研究', field: '新闻传播' }, A: { name: '新闻大学', field: '新闻学' }, B: { name: '中国报业', field: '报业' } },
        4: { S: { name: '中国社会科学', field: '综合' }, A: { name: '编辑之友', field: '编辑学' }, B: { name: '新闻界', field: '新闻学' } },
        5: { S: { name: '新闻与传播研究', field: '新闻传播' }, A: { name: '当代传播', field: '传播学' }, B: { name: '青年记者', field: '新闻实务' } },
        6: { S: { name: '中国社会科学', field: '综合' }, A: { name: '新闻与写作', field: '写作' }, B: { name: '中国记者', field: '记者' } },
        7: { S: { name: '新闻与传播研究', field: '新闻传播' }, A: { name: '中国广播电视学刊', field: '广播电视' }, B: { name: '电视研究', field: '电视' } },
        8: { S: { name: '中国社会科学', field: '综合' }, A: { name: '广告大观', field: '广告' }, B: { name: '中国广告', field: '广告' } },
        9: { S: { name: '新闻与传播研究', field: '新闻传播' }, A: { name: '全球传媒学刊', field: '全球传播' }, B: { name: '对外传播', field: '对外传播' } },
        10: { S: { name: '中国社会科学', field: '综合' }, A: { name: '新媒体研究', field: '新媒体' }, B: { name: '网络传播', field: '网络传播' } },
        11: { S: { name: '新闻与传播研究', field: '新闻传播' }, A: { name: '中国出版', field: '出版' }, B: { name: '出版广角', field: '出版' } },
        12: { S: { name: '中国社会科学', field: '综合' }, A: { name: '科技与出版', field: '科技出版' }, B: { name: '出版发行研究', field: '发行' } }
    },
    information: {
        1: { S: { name: '中国图书馆学报', field: '图书馆学' }, A: { name: '图书情报工作', field: '情报' }, B: { name: '图书馆杂志', field: '图书馆' } },
        2: { S: { name: '情报学报', field: '情报学' }, A: { name: '出版发行研究', field: '出版' }, B: { name: '现代出版', field: '出版' } },
        3: { S: { name: '中国图书馆学报', field: '图书馆学' }, A: { name: '档案学通讯', field: '档案学' }, B: { name: '图书馆建设', field: '图书馆' } },
        4: { S: { name: '情报学报', field: '情报学' }, A: { name: '大学图书馆学报', field: '高校图书馆' }, B: { name: '图书馆论坛', field: '图书馆' } },
        5: { S: { name: '中国图书馆学报', field: '图书馆学' }, A: { name: '图书馆学研究', field: '图书馆学' }, B: { name: '图书馆工作与研究', field: '图书馆' } },
        6: { S: { name: '情报学报', field: '情报学' }, A: { name: '档案学研究', field: '档案学' }, B: { name: '中国编辑', field: '编辑' } },
        7: { S: { name: '中国图书馆学报', field: '图书馆学' }, A: { name: '情报理论与实践', field: '情报' }, B: { name: '情报科学', field: '情报' } },
        8: { S: { name: '情报学报', field: '情报学' }, A: { name: '图书情报知识', field: '图书情报' }, B: { name: '情报杂志', field: '情报' } },
        9: { S: { name: '中国图书馆学报', field: '图书馆学' }, A: { name: '国家图书馆学刊', field: '国家图书馆' }, B: { name: '图书馆学刊', field: '图书馆' } },
        10: { S: { name: '情报学报', field: '情报学' }, A: { name: '数字图书馆论坛', field: '数字图书馆' }, B: { name: '新世纪图书馆', field: '图书馆' } },
        11: { S: { name: '中国图书馆学报', field: '图书馆学' }, A: { name: '信息资源管理学报', field: '信息管理' }, B: { name: '农业图书情报学报', field: '农业信息' } },
        12: { S: { name: '情报学报', field: '情报学' }, A: { name: '图书馆', field: '图书馆' }, B: { name: '四川图书馆学报', field: '图书馆' } }
    },
    sociology: {
        1: { S: { name: '社会学研究', field: '社会学' }, A: { name: '社会', field: '社会' }, B: { name: '社会科学研究', field: '社会科学' } },
        2: { S: { name: '中国社会科学', field: '综合' }, A: { name: '青年研究', field: '青年' }, B: { name: '社会科学', field: '社会科学' } },
        3: { S: { name: '社会学研究', field: '社会学' }, A: { name: '中国青年研究', field: '青年' }, B: { name: '社会学评论', field: '社会学' } },
        4: { S: { name: '中国社会科学', field: '综合' }, A: { name: '民俗研究', field: '民俗学' }, B: { name: '民俗曲艺', field: '民俗' } },
        5: { S: { name: '社会学研究', field: '社会学' }, A: { name: '民族研究', field: '民族学' }, B: { name: '广西民族研究', field: '民族' } },
        6: { S: { name: '中国社会科学', field: '综合' }, A: { name: '妇女研究论丛', field: '性别研究' }, B: { name: '中华女子学院学报', gender: '性别' } },
        7: { S: { name: '社会学研究', field: '社会学' }, A: { name: '人口研究', field: '人口学' }, B: { name: '人口学刊', field: '人口' } },
        8: { S: { name: '中国社会科学', field: '综合' }, A: { name: '中国人口科学', field: '人口' }, B: { name: '南方人口', field: '人口' } },
        9: { S: { name: '社会学研究', field: '社会学' }, A: { name: '社会保障评论', field: '社会保障' }, B: { name: '社会福利', field: '福利' } },
        10: { S: { name: '中国社会科学', field: '综合' }, A: { name: '社会工作', field: '社工' }, B: { name: '社会建设', field: '社会建设' } },
        11: { S: { name: '社会学研究', field: '社会学' }, A: { name: '思想战线', field: '综合' }, B: { name: '云南民族大学学报', field: '民族' } },
        12: { S: { name: '中国社会科学', field: '综合' }, A: { name: '西北民族研究', field: '民族' }, B: { name: '中南民族大学学报', field: '民族' } }
    },
    education: {
        1: { S: { name: '教育研究', field: '教育学' }, A: { name: '华东师范大学学报(教科版)', field: '教育理论' }, B: { name: '教育学报', field: '教育学' } },
        2: { S: { name: '中国社会科学', field: '综合' }, A: { name: '课程·教材·教法', field: '课程教学' }, B: { name: '教育科学研究', field: '教育科研' } },
        3: { S: { name: '教育研究', field: '教育学' }, A: { name: '高等教育研究', field: '高等教育' }, B: { name: '中国高教研究', field: '高教' } },
        4: { S: { name: '中国社会科学', field: '综合' }, A: { name: '比较教育研究', field: '比较教育' }, B: { name: '外国教育研究', field: '外国教育' } },
        5: { S: { name: '教育研究', field: '教育学' }, A: { name: '教师教育研究', field: '教师教育' }, B: { name: '教师教育学报', field: '教师' } },
        6: { S: { name: '中国社会科学', field: '综合' }, A: { name: '学前教育研究', field: '学前教育' }, B: { name: '幼儿教育', field: '幼教' } },
        7: { S: { name: '教育研究', field: '教育学' }, A: { name: '中国特殊教育', field: '特殊教育' }, B: { name: '现代特殊教育', field: '特教' } },
        8: { S: { name: '中国社会科学', field: '综合' }, A: { name: '职业技术教育', field: '职业教育' }, B: { name: '中国职业技术教育', field: '职教' } },
        9: { S: { name: '教育研究', field: '教育学' }, A: { name: '中国远程教育', field: '远程教育' }, B: { name: '现代远程教育研究', field: '远程' } },
        10: { S: { name: '中国社会科学', field: '综合' }, A: { name: '电化教育研究', field: '教育技术' }, B: { name: '现代教育技术', field: '教育技术' } },
        11: { S: { name: '教育研究', field: '教育学' }, A: { name: '教育发展研究', field: '教育发展' }, B: { name: '教育学术月刊', field: '学术' } },
        12: { S: { name: '中国社会科学', field: '综合' }, A: { name: '教育与经济', field: '教育经济' }, B: { name: '湖南师范大学教育科学学报', field: '综合' } }
    }
};

// ==================== 学科配置注册表 ====================
const LA_DISCIPLINE_CONFIGS = {};

// 通用文科角色（所有学科共享）
const LA_COMMON_CHARACTERS = [
    {
        id: 'normal', name: '大多数', icon: '👤', awakenIcon: '🔥',
        desc: '芸芸众生中的普通一员', bonus: '无特殊能力',
        awakenName: '我命由我不由天', awakenDesc: '转博时所有属性×2，之后属性溢出时上限+1',
        hiddenAwakenName: '勤能补拙', hiddenAwakenIcon: '💪',
        hiddenAwakenDesc: '每月行动次数+1',
        hiddenAwakenCondition: (gs) => gs.research <= 5 && gs.favor <= 5 && gs.social <= 5,
        stats: { research: 0, social: 0, favor: 0, gold: 0 },
        reversed: {
            name: '怠惰之《大多数》', icon: '😴', awakenIcon: '💀',
            desc: '懒惰是原罪，也是护盾',
            bonus: 'SAN减少翻倍，初始属性全5，每月SAN+3',
            awakenName: '极致怠惰', awakenDesc: '转博时属性翻倍，SAN上限+50%',
            stats: { research: 4, social: 4, favor: 4, gold: 0 }
        }
    },
    {
        id: 'social', name: '社交达人', icon: '🤝', awakenIcon: '🌐',
        desc: '八面玲珑的社交高手', bonus: '初始社交能力+5',
        awakenName: '人脉网络激活', awakenDesc: '转博时人脉影响审稿人分布',
        hiddenAwakenName: '师兄师姐救我', hiddenAwakenIcon: '🆘',
        hiddenAwakenDesc: '社交变为6且获得主动技能',
        hiddenAwakenCondition: (gs) => gs.social <= 9,
        stats: { social: 5 },
        reversed: {
            name: '嫉妒之《社交达人》', icon: '🐍', awakenIcon: '👁️',
            desc: '见不得别人好',
            bonus: '社交-1→科研/好感+1',
            awakenName: '嫉妒升级', awakenDesc: '关系栏换人时上限+3',
            stats: { social: 4 }
        }
    },
    {
        id: 'teacher-child', name: '导师得意门生', icon: '👨‍👧', awakenIcon: '👑',
        desc: '近水楼台先得月', bonus: '初始导师好感度+5',
        awakenName: '血脉共鸣', awakenDesc: '每6好感度赠1篇C类论文，每月自动和导师交流',
        hiddenAwakenName: '导师救我', hiddenAwakenIcon: '🛡️',
        hiddenAwakenDesc: '好感变为6且获得主动技能',
        hiddenAwakenCondition: (gs) => gs.favor <= 9,
        stats: { favor: 5 },
        reversed: {
            name: '玩世之《导师得意门生》', icon: '🎪', awakenIcon: '🃏',
            desc: '叛逆是我的代名词',
            bonus: '好感归0→重置为6，社交/科研+1',
            awakenName: '变本加厉', awakenDesc: '好感归0触发更多效果',
            stats: { favor: 0 }
        }
    },
    {
        id: 'chosen', name: '天选之人', icon: '⭐', awakenIcon: '✨',
        desc: '命运的宠儿全面发展', bonus: '全属性+2',
        awakenName: '查缺补漏', awakenDesc: '转博时补齐短板',
        hiddenAwakenName: '孤注一掷', hiddenAwakenIcon: '🎯',
        hiddenAwakenDesc: '选一项属性，其他变1',
        hiddenAwakenCondition: (gs) => gs.research === gs.social && gs.social === gs.favor,
        stats: { research: 2, social: 2, favor: 2, gold: 2 },
        reversed: {
            name: '空想之《天选之人》', icon: '🌀', awakenIcon: '🎲',
            desc: '命运是轮盘赌',
            bonus: '每月属性随机交换',
            awakenName: '命运轮盘', awakenDesc: '全属性参与交换',
            stats: {}
        }
    }
];

// 学科特色角色
const LA_DISCIPLINE_CHARACTERS = {
    chinese: [
        {
            id: 'scholar', name: '学术世家', icon: '📚', awakenIcon: '🏛️',
            desc: '家中藏书万卷，耳濡目染', bonus: '初始科研能力+5',
            awakenName: '家学渊源', awakenDesc: '转博时每篇A类论文科研+2，上限+4',
            hiddenAwakenName: '博古通今', hiddenAwakenIcon: '📖',
            hiddenAwakenDesc: '论文idea和实验分数不再衰减',
            hiddenAwakenCondition: (gs) => gs.paperA === 0 && gs.paperB === 0,
            stats: { research: 5 },
            reversed: { name: '书呆子之《学术世家》', icon: '📖', awakenIcon: '🤡', desc: '只会读书不会社交', bonus: '科研固定高，社交固定低', awakenName: '大智若愚', awakenDesc: '科研提升转为其他属性', stats: {} }
        },
        {
            id: 'writer', name: '文艺青年', icon: '✍️', awakenIcon: '🖊️',
            desc: '文笔出众，下笔如有神', bonus: '写作分数永久+2',
            awakenName: '妙笔生花', awakenDesc: '转博时写作分数永久+3',
            hiddenAwakenName: '灵感缪斯', hiddenAwakenIcon: '💡',
            hiddenAwakenDesc: '每月有概率获得写作buff',
            hiddenAwakenCondition: (gs) => gs.research >= 8,
            stats: { research: 0 },
            reversed: { name: '拖稿之《文艺青年》', icon: '🐌', awakenIcon: '💀', desc: '永远在修改', bonus: '写作分数衰减减半', awakenName: '慢工出细活', awakenDesc: '写作质量永久提升', stats: {} }
        }
    ],
    history: [
        {
            id: 'scholar', name: '学术世家', icon: '📚', awakenIcon: '🏛️',
            desc: '家中藏书万卷，耳濡目染', bonus: '初始科研能力+5',
            awakenName: '家学渊源', awakenDesc: '转博时每篇A类论文科研+2，上限+4',
            hiddenAwakenName: '博古通今', hiddenAwakenIcon: '📖',
            hiddenAwakenDesc: '论文idea和实验分数不再衰减',
            hiddenAwakenCondition: (gs) => gs.paperA === 0 && gs.paperB === 0,
            stats: { research: 5 },
            reversed: { name: '书呆子之《学术世家》', icon: '📖', awakenIcon: '🤡', desc: '只会读书不会社交', bonus: '科研固定高，社交固定低', awakenName: '大智若愚', awakenDesc: '科研提升转为其他属性', stats: {} }
        },
        {
            id: 'archaeologist', name: '田野老手', icon: '🏕️', awakenIcon: '🏺',
            desc: '从小在乡野长大，善于观察', bonus: '资料搜集效率+3，SAN上限+5',
            awakenName: '考古直觉', awakenDesc: '转博时田野调查效率翻倍',
            hiddenAwakenName: '田野之王', hiddenAwakenIcon: '👑',
            hiddenAwakenDesc: '资料搜集分数永久+3',
            hiddenAwakenCondition: (gs) => gs.social >= 8,
            stats: { social: 3 },
            reversed: { name: '冒险之《田野老手》', icon: '🎲', awakenIcon: '🔥', desc: '赌性太强', bonus: '资料搜集50%大成功50%大失败', awakenName: '赌徒之心', awakenDesc: '高风险高回报', stats: {} }
        }
    ],
    philosophy: [
        {
            id: 'scholar', name: '学术世家', icon: '📚', awakenIcon: '🏛️',
            desc: '家中藏书万卷，耳濡目染', bonus: '初始科研能力+5',
            awakenName: '家学渊源', awakenDesc: '转博时每篇A类论文科研+2，上限+4',
            hiddenAwakenName: '博古通今', hiddenAwakenIcon: '📖',
            hiddenAwakenDesc: '论文idea和实验分数不再衰减',
            hiddenAwakenCondition: (gs) => gs.paperA === 0 && gs.paperB === 0,
            stats: { research: 5 },
            reversed: { name: '书呆子之《学术世家》', icon: '📖', awakenIcon: '🤡', desc: '只会读书不会社交', bonus: '科研固定高，社交固定低', awakenName: '大智若愚', awakenDesc: '科研提升转为其他属性', stats: {} }
        },
        {
            id: 'thinker', name: '独立思考者', icon: '🤔', awakenIcon: '💭',
            desc: '善于独立思考，不随波逐流', bonus: '选题分数永久+2',
            awakenName: '思想穿透', awakenDesc: '转博时选题分数永久+3',
            hiddenAwakenName: '哲学之光', hiddenAwakenIcon: '✨',
            hiddenAwakenDesc: '每月SAN+1（思考带来内心平静）',
            hiddenAwakenCondition: (gs) => gs.san >= 15,
            stats: { research: 0 },
            reversed: { name: '偏执之《独立思考者》', icon: '🌀', awakenIcon: '🔥', desc: '固执己见', bonus: '选题分数高但社交-2', awakenName: '偏执之力', awakenDesc: '极端专注带来极端成果', stats: {} }
        }
    ],
    foreign_lang: [
        {
            id: 'scholar', name: '学术世家', icon: '📚', awakenIcon: '🏛️',
            desc: '家中藏书万卷，耳濡目染', bonus: '初始科研能力+5',
            awakenName: '家学渊源', awakenDesc: '转博时每篇A类论文科研+2，上限+4',
            hiddenAwakenName: '博古通今', hiddenAwakenIcon: '📖',
            hiddenAwakenDesc: '论文idea和实验分数不再衰减',
            hiddenAwakenCondition: (gs) => gs.paperA === 0 && gs.paperB === 0,
            stats: { research: 5 },
            reversed: { name: '书呆子之《学术世家》', icon: '📖', awakenIcon: '🤡', desc: '只会读书不会社交', bonus: '科研固定高，社交固定低', awakenName: '大智若愚', awakenDesc: '科研提升转为其他属性', stats: {} }
        },
        {
            id: 'polyglot', name: '多语达人', icon: '🌍', awakenIcon: '🗣️',
            desc: '精通多门语言，视野开阔', bonus: '初始社交+3，读外文文献SAN-1',
            awakenName: '跨文化视野', awakenDesc: '转博时社交+3，上限+3',
            hiddenAwakenName: '翻译天才', hiddenAwakenIcon: '📝',
            hiddenAwakenDesc: '写作分数永久+2',
            hiddenAwakenCondition: (gs) => gs.research >= 6,
            stats: { social: 3 },
            reversed: { name: '文化冲突之《多语达人》', icon: '🔀', awakenIcon: '💥', desc: '文化认同混乱', bonus: '社交随机波动', awakenName: '文化融合', awakenDesc: '从混乱中找到平衡', stats: {} }
        }
    ],
    journalism: [
        {
            id: 'reporter', name: '新闻嗅觉', icon: '📰', awakenIcon: '🔍',
            desc: '对新闻事件天生敏感', bonus: '初始社交+3，选题分数+1',
            awakenName: '新闻直觉', awakenDesc: '转博时选题分数永久+3',
            hiddenAwakenName: '深度报道', hiddenAwakenIcon: '📝',
            hiddenAwakenDesc: '资料搜集分数永久+2',
            hiddenAwakenCondition: (gs) => gs.research >= 8,
            stats: { social: 3 },
            reversed: { name: '标题党之《新闻嗅觉》', icon: '📢', awakenIcon: '🎭', desc: '追求流量而非真相', bonus: '社交高但科研低', awakenName: '流量密码', awakenDesc: '社交转化为科研', stats: {} }
        },
        {
            id: 'data_journalist', name: '数据达人', icon: '📊', awakenIcon: '📈',
            desc: '用数据说话的分析师', bonus: '资料搜集分数永久+2',
            awakenName: '数据洞察', awakenDesc: '转博时资料搜集分数永久+3',
            hiddenAwakenName: '可视化天才', hiddenAwakenIcon: '📉',
            hiddenAwakenDesc: '论文分数+5（数据呈现加分）',
            hiddenAwakenCondition: (gs) => gs.social >= 8,
            stats: { research: 0 },
            reversed: { name: '理论之《数据达人》', icon: '🔢', awakenIcon: '🤖', desc: '只看数据不看人', bonus: '资料搜集高但社交低', awakenName: '数据驱动', awakenDesc: '数据转化为社交', stats: {} }
        }
    ],
    information: [
        {
            id: 'librarian', name: '知识管家', icon: '📚', awakenIcon: '🏛️',
            desc: '善于整理和管理知识', bonus: '读文献SAN-1，选题分数+1',
            awakenName: '知识图谱', awakenDesc: '转博时选题分数永久+3',
            hiddenAwakenName: '信息素养', hiddenAwakenIcon: '🔍',
            hiddenAwakenDesc: '资料搜集分数永久+2',
            hiddenAwakenCondition: (gs) => gs.research >= 8,
            stats: { research: 0 },
            reversed: { name: '囤积之《知识管家》', icon: '📦', awakenIcon: '🗑️', desc: '只囤不用', bonus: '读文献效率高但写作低', awakenName: '知识爆发', awakenDesc: '囤积的知识转化为成果', stats: {} }
        },
        {
            id: 'publisher', name: '出版实践', icon: '📖', awakenIcon: '📚',
            desc: '熟悉出版流程，有行业资源', bonus: '初始金钱+3，社交+2',
            awakenName: '出版人脉', awakenDesc: '转博时社交+3，上限+3',
            hiddenAwakenName: '编辑之眼', hiddenAwakenIcon: '👁️',
            hiddenAwakenDesc: '写作分数永久+2',
            hiddenAwakenCondition: (gs) => gs.favor >= 8,
            stats: { gold: 3, social: 2 },
            reversed: { name: '商化之《出版实践》', icon: '💰', awakenIcon: '🤑', desc: '一切向钱看', bonus: '金钱高但科研低', awakenName: '商业化思维', awakenDesc: '金钱转化为科研', stats: {} }
        }
    ],
    sociology: [
        {
            id: 'fieldworker', name: '田野老手', icon: '🏕️', awakenIcon: '🏺',
            desc: '从小在乡野长大，善于观察', bonus: '资料搜集效率+3，SAN上限+5',
            awakenName: '田野直觉', awakenDesc: '转博时田野调查效率翻倍',
            hiddenAwakenName: '田野之王', hiddenAwakenIcon: '👑',
            hiddenAwakenDesc: '资料搜集分数永久+3',
            hiddenAwakenCondition: (gs) => gs.social >= 8,
            stats: { social: 3 },
            reversed: { name: '冒险之《田野老手》', icon: '🎲', awakenIcon: '🔥', desc: '赌性太强', bonus: '资料搜集50%大成功50%大失败', awakenName: '赌徒之心', awakenDesc: '高风险高回报', stats: {} }
        },
        {
            id: 'data_analyst', name: '数据达人', icon: '📊', awakenIcon: '📈',
            desc: '对数据天生敏感', bonus: '资料搜集分数永久+2',
            awakenName: '数据洞察', awakenDesc: '转博时资料搜集分数永久+3',
            hiddenAwakenName: '量化天才', hiddenAwakenIcon: '🧮',
            hiddenAwakenDesc: '论文分数+5（数据呈现加分）',
            hiddenAwakenCondition: (gs) => gs.research >= 8,
            stats: { research: 0 },
            reversed: { name: '理论之《数据达人》', icon: '🔢', awakenIcon: '🤖', desc: '只看数据不看人', bonus: '资料搜集高但社交低', awakenName: '数据驱动', awakenDesc: '数据转化为社交', stats: {} }
        }
    ],
    education: [
        {
            id: 'teacher_natural', name: '天生教师', icon: '🎓', awakenIcon: '👨‍🏫',
            desc: '天生善于教学', bonus: '初始好感+3，社交+2',
            awakenName: '教育直觉', awakenDesc: '转博时好感+3，上限+3',
            hiddenAwakenName: '教育情怀', hiddenAwakenIcon: '❤️',
            hiddenAwakenDesc: '每月SAN+1（教学带来成就感）',
            hiddenAwakenCondition: (gs) => gs.favor >= 10,
            stats: { favor: 3, social: 2 },
            reversed: { name: '教条之《天生教师》', icon: '📋', awakenIcon: '📏', desc: '只会照本宣科', bonus: '好感高但科研低', awakenName: '教学相长', awakenDesc: '教学转化为科研', stats: {} }
        },
        {
            id: 'edtech', name: '教育技术', icon: '💻', awakenIcon: '🤖',
            desc: '善于运用技术辅助教学', bonus: '资料搜集分数+2，选题分数+1',
            awakenName: '技术赋能', awakenDesc: '转博时资料搜集+3，上限+3',
            hiddenAwakenName: '数字原住民', hiddenAwakenIcon: '📱',
            hiddenAwakenDesc: '写作分数永久+2',
            hiddenAwakenCondition: (gs) => gs.research >= 6,
            stats: { research: 0 },
            reversed: { name: '技术依赖之《教育技术》', icon: '🔌', awakenIcon: '⚡', desc: '离开技术就不会教', bonus: '资料搜集高但社交低', awakenName: '人机协作', awakenDesc: '技术与人文结合', stats: {} }
        }
    ]
};

// ==================== 通用文科商店道具 ====================
const LA_COMMON_SHOP_ITEMS = [
    { id: 'tea', name: '奶茶', desc: 'SAN+2', price: 1, monthlyOnce: true, boughtThisMonth: false },
    { id: 'proofreading', name: '论文润色', desc: '临时buff-下次写作分数+5', price: 3, monthlyOnce: true, boughtThisMonth: false },
    { id: 'keyboard', name: '舒适键盘', desc: '永久buff-写作SAN-1', price: 6, once: true, bought: false },
    { id: 'monitor', name: '大屏显示器', desc: '永久buff-读文献SAN-1', price: 6, once: true, bought: false },
    { id: 'lamp', name: '护眼台灯', desc: '永久buff-每月SAN+1', price: 8, once: true, bought: false },
    { id: 'plant', name: '绿植盆栽', desc: '永久buff-每月SAN+1', price: 4, once: true, bought: false },
    { id: 'headphone', name: '降噪耳机', desc: '永久buff-读文献SAN-1', price: 7, once: true, bought: false },
    { id: 'bookshelf', name: '二手书架', desc: '永久buff-每月读文献多读1次', price: 8, once: true, bought: false },
    { id: 'gpt', name: 'ChatGPT订阅', desc: '临时buff-下次选题+4', price: 2, monthlyOnce: true, boughtThisMonth: false },
    { id: 'claude', name: 'Claude订阅', desc: '临时buff-下次写作+4', price: 3, monthlyOnce: true, boughtThisMonth: false },
    { id: 'gemini', name: 'Gemini订阅', desc: '临时buff-下次选题+3', price: 2, monthlyOnce: true, boughtThisMonth: false },
    { id: 'kimi', name: 'Kimi订阅', desc: '临时buff-下次读文献SAN-1', price: 1, monthlyOnce: true, boughtThisMonth: false }
];

// 学科专属商店道具
const LA_DISCIPLINE_SHOP = {
    chinese: [
        { id: 'cnki', name: '知网年度会员', desc: '永久buff-读文献SAN-1，选题+1', price: 15, once: true, bought: false },
        { id: 'classic_collection', name: '经典著作合集', desc: '永久buff-科研+1', price: 10, once: true, bought: false },
        { id: 'fountain_pen', name: '钢笔+墨水', desc: '永久buff-写作+1', price: 3, once: true, bought: false },
        { id: 'writing_guide', name: '学术写作指南', desc: '永久buff-写作+1', price: 4, once: true, bought: false }
    ],
    history: [
        { id: 'cnki', name: '知网年度会员', desc: '永久buff-读文献SAN-1，选题+1', price: 15, once: true, bought: false },
        { id: 'archive_copy', name: '古籍影印资料', desc: '永久buff-资料搜集+1', price: 5, once: true, bought: false },
        { id: 'search_tool', name: '文献检索工具', desc: '永久buff-选题+1', price: 4, once: true, bought: false },
        { id: 'field_fund', name: '田野调查基金', desc: '临时buff-下次资料搜集+5', price: 3, monthlyOnce: true, boughtThisMonth: false }
    ],
    philosophy: [
        { id: 'cnki', name: '知网年度会员', desc: '永久buff-读文献SAN-1，选题+1', price: 15, once: true, bought: false },
        { id: 'classic_collection', name: '经典著作合集', desc: '永久buff-科研+1', price: 10, once: true, bought: false },
        { id: 'logic_book', name: '逻辑学教程', desc: '永久buff-选题+1', price: 4, once: true, bought: false },
        { id: 'writing_guide', name: '学术写作指南', desc: '永久buff-写作+1', price: 4, once: true, bought: false }
    ],
    foreign_lang: [
        { id: 'cnki', name: '知网年度会员', desc: '永久buff-读文献SAN-1，选题+1', price: 15, once: true, bought: false },
        { id: 'foreign_journal', name: '外文期刊订阅', desc: '永久buff-读外文文献SAN-1', price: 8, once: true, bought: false },
        { id: 'translation_tool', name: '翻译辅助工具', desc: '永久buff-写作+1', price: 5, once: true, bought: false },
        { id: 'writing_guide', name: '学术写作指南', desc: '永久buff-写作+1', price: 4, once: true, bought: false }
    ],
    journalism: [
        { id: 'cnki', name: '知网年度会员', desc: '永久buff-读文献SAN-1，选题+1', price: 15, once: true, bought: false },
        { id: 'recorder', name: '录音笔', desc: '永久buff-资料搜集+1', price: 5, once: true, bought: false },
        { id: 'camera', name: '便携摄像机', desc: '永久buff-资料搜集+1', price: 7, once: true, bought: false },
        { id: 'media_tool', name: '数据分析工具', desc: '永久buff-资料搜集+2', price: 8, once: true, bought: false }
    ],
    information: [
        { id: 'cnki', name: '知网年度会员', desc: '永久buff-读文献SAN-1，选题+1', price: 15, once: true, bought: false },
        { id: 'biblio_tool', name: '文献计量工具', desc: '永久buff-资料搜集+1', price: 5, once: true, bought: false },
        { id: 'archive_copy', name: '古籍影印资料', desc: '永久buff-资料搜集+1', price: 5, once: true, bought: false },
        { id: 'writing_guide', name: '学术写作指南', desc: '永久buff-写作+1', price: 4, once: true, bought: false }
    ],
    sociology: [
        { id: 'cnki', name: '知网年度会员', desc: '永久buff-读文献SAN-1，选题+1', price: 15, once: true, bought: false },
        { id: 'recorder', name: '录音笔', desc: '永久buff-资料搜集+1', price: 5, once: true, bought: false },
        { id: 'spss', name: 'SPSS/Stata会员', desc: '永久buff-资料搜集+2', price: 10, once: true, bought: false },
        { id: 'field_fund', name: '田野调查基金', desc: '临时buff-下次资料搜集+5', price: 3, monthlyOnce: true, boughtThisMonth: false }
    ],
    education: [
        { id: 'cnki', name: '知网年度会员', desc: '永久buff-读文献SAN-1，选题+1', price: 15, once: true, bought: false },
        { id: 'recorder', name: '录音笔', desc: '永久buff-资料搜集+1', price: 5, once: true, bought: false },
        { id: 'spss', name: 'SPSS/Stata会员', desc: '永久buff-资料搜集+2', price: 10, once: true, bought: false },
        { id: 'writing_guide', name: '学术写作指南', desc: '永久buff-写作+1', price: 4, once: true, bought: false }
    ]
};

// ==================== 文科通用成就 ====================
const LA_COMMON_ACHIEVEMENTS = [
    '❤️ 喜结良缘', '💰 家财万贯', '⬡ 六边形战士',
    '🏆 诺奖选手', '🌸 交际花', '🤝 铁杆师生',
    '⚡ 精力满满', '🎯 百发百中', '🤖 论文机器',
    '📚 千引大佬', '👊 越战越勇', '🧠 人间清醒',
    '🔥 火力全开', '🏅 三好学生', '💪 强身健体',
    '🎓 感谢游玩', '📖 书虫', '📊 数据达人',
    '🖊️ 文采飞扬', '📝 修改达人', '🎯 精准投稿',
    '💪 坚韧不拔', '🎉 保底机制'
];

// ==================== 文科通用结局 ====================
const LA_COMMON_ENDING_NAMES = {
    'quit': '🚪 主动退学',
    'burnout': '😢 不堪重负',
    'expelled': '😭 逐出师门',
    'poor': '💸 穷困潦倒',
    'delay': '⏰ 延毕',
    'isolated': '😔 被孤立',
    'master': '🎓 硕士毕业',
    'excellent_master': '🌟 优秀硕士',
    'phd': '🎓 博士毕业',
    'excellent_phd': '🏆 优秀博士',
    'scholar': '📚 学术新星',
    'professor': '👨‍🏫 高校教师',
    'expert': '📖 领域专家',
    'intellectual': '🏛️ 知识分子'
};

// ==================== 注册所有学科配置 ====================
function registerAllDisciplineConfigs() {
    const allDisciplines = getAllDisciplines();

    allDisciplines.forEach(d => {
        const disciplineId = d.id;
        const charList = [...LA_COMMON_CHARACTERS, ...(LA_DISCIPLINE_CHARACTERS[disciplineId] || [])];
        const shopList = [...LA_COMMON_SHOP_ITEMS, ...(LA_DISCIPLINE_SHOP[disciplineId] || [])];
        const titleWords = LA_PAPER_TITLES[disciplineId] || LA_PAPER_TITLES.chinese;
        const conferences = LA_CONFERENCES[disciplineId] || LA_CONFERENCES.chinese;

        LA_DISCIPLINE_CONFIGS[disciplineId] = {
            id: disciplineId,
            name: d.name,
            icon: d.icon,
            category: d.category,
            paperTitleWords: titleWords,
            conferences: conferences,
            shopItems: shopList,
            characters: charList,
            achievements: LA_COMMON_ACHIEVEMENTS,
            endingNames: LA_COMMON_ENDING_NAMES
        };
    });
}

// 页面加载时注册
registerAllDisciplineConfigs();

// 全局导出
window.LA_DISCIPLINE_CONFIGS = LA_DISCIPLINE_CONFIGS;
window.LA_PAPER_TITLES = LA_PAPER_TITLES;
window.LA_CONFERENCES = LA_CONFERENCES;
window.LA_COMMON_CHARACTERS = LA_COMMON_CHARACTERS;
window.LA_DISCIPLINE_CHARACTERS = LA_DISCIPLINE_CHARACTERS;
