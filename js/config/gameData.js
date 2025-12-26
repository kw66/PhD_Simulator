        // ==================== 游戏数据 ====================
		 const characters = [
		{
			id: 'normal',
			name: '大多数',
			icon: '👤',
			awakenIcon: '🔥',
			desc: '芸芸众生中的普通一员',
			bonus: '无特殊能力',
			awakenName: '我命由我不由天',
			awakenDesc: '转博时所有属性×2',
			// 隐藏觉醒
			hiddenAwakenName: '勤能补拙',
			hiddenAwakenIcon: '💪',
			hiddenAwakenDesc: '每个月行动次数+1（看论文、写论文、想idea、打工、做实验可以做2次）',
			hiddenAwakenCondition: (gs) => gs.research <= 5 && gs.favor <= 5 && gs.social <= 5,
			stats: { research: 0, social: 0, favor: 0, gold: 0 },
			reversed: {
				name: '怠惰之《大多数》',
				icon: '😴',
				awakenIcon: '💀',
				desc: '懒惰是原罪，也是护盾',
				bonus: 'SAN减少翻倍，初始属性全5（金币为1），每月SAN+3',
				awakenName: '极致怠惰',
				awakenDesc: '转博时属性翻倍，SAN上限+50%（上取整）。SAN减少3倍，每月SAN+已损SAN的10%（上取整）',
				stats: { research: 4, social: 4, favor: 4, gold: 0 }
			}
		},
		{ 
			id: 'genius', 
			name: '院士转世', 
			icon: '🔬', 
			awakenIcon: '🧬',
			desc: '天生就是做科研的料', 
			bonus: '科研能力初始+5', 
			awakenName: '学术天赋觉醒',
			awakenDesc: '转博时每有1篇A类论文，科研+2，上限+4',
			// 隐藏觉醒
			hiddenAwakenName: '预见未来热点',
			hiddenAwakenIcon: '🔮',
			hiddenAwakenDesc: '论文的idea和实验分数每月不再衰减',
			hiddenAwakenCondition: (gs) => gs.paperA === 0 && gs.paperB === 0,
			stats: { research: 5 },
			reversed: {
				name: '愚钝之《院士转世》',
				icon: '🤡',
				awakenIcon: '🎭',
				desc: '科研是什么？能吃吗？',
				bonus: '科研固定0，全论文槽，科研提升→金+4,SAN+4,社交+1,好感+1',
				awakenName: '大智若愚',
				awakenDesc: '科研提升→金+8,SAN+8,社交+2,好感+2',
				stats: {}
			}
		},
		{ 
			id: 'social', 
			name: '社交达人', 
			icon: '🤝', 
			awakenIcon: '🌐',
			desc: '八面玲珑的社交高手', 
			bonus: '社交能力初始+5', 
			awakenName: '人脉网络激活',
			awakenDesc: '转博时根据社交能力改变审稿人分布（社交+5计算）',
			// 隐藏觉醒
			hiddenAwakenName: '师兄师姐救我',
			hiddenAwakenIcon: '🆘',
			hiddenAwakenDesc: '社交变为6且获得主动技能（限用3次）：下次生产论文时，科研能力视为科研+社交',
			hiddenAwakenCondition: (gs) => gs.social <= 6,
			stats: { social: 5 },
			reversed: {
				name: '嫉妒之《社交达人》',
				icon: '🐍',
				awakenIcon: '👁️',
				desc: '见不得别人好，也见不得自己差',
				bonus: '社交初始5，社交-1→科研+1,好感+1 | 社交+1→SAN+1,金+1',
				awakenName: '嫉妒重置',
				awakenDesc: '转博时社交能力变为5',
				stats: { social: 4 }
			}
		},
		{ 
			id: 'rich', 
			name: '富可敌国', 
			icon: '💰', 
			awakenIcon: '💎',
			desc: '家境殷实无忧无虑', 
			bonus: '金币值初始+8', 
			awakenName: '财富倍增术',
			awakenDesc: '转博时金币×3',
			// 隐藏觉醒
			hiddenAwakenName: '白手起家术',
			hiddenAwakenIcon: '🏦',
			hiddenAwakenDesc: '后续打工、实习的金钱收入翻倍',
			hiddenAwakenCondition: (gs) => gs.gold <= 3,
			stats: { gold: 8 },
			reversed: {
				name: '贪求之《富可敌国》',
				icon: '🏴‍☠️',
				awakenIcon: '💸',
				desc: '除了钱一无所有',
				bonus: '每月SAN/科研/社交/好感重置为1，每月金钱+3',
				awakenName: '金钱的力量',
				awakenDesc: '半年重置一次，每花费4金币属性各+1，每月金钱+4',
				stats: {}
			}
		},
		{ 
			id: 'teacher-child', 
			name: '导师子女', 
			icon: '👨‍👧', 
			awakenIcon: '👑',
			desc: '近水楼台先得月', 
			bonus: '导师好感度初始+5', 
			awakenName: '血脉共鸣',
			awakenDesc: '转博时根据好感度提升科研和月工资，每5好感度提升1科研和0.5月工资',
			// 隐藏觉醒
			hiddenAwakenName: '导师救我',
			hiddenAwakenIcon: '🛡️',
			hiddenAwakenDesc: '好感度变为6且获得主动技能（限用3次）：下次生产论文时，科研能力视为科研+好感度',
			hiddenAwakenCondition: (gs) => gs.favor <= 6,
			stats: { favor: 5 },
			reversed: {
				name: '玩世之《导师子女》',
				icon: '🎪',
				awakenIcon: '🃏',
				desc: '叛逆是我的代名词',
				bonus: '好感不会低于0，好感归0→重置为5，社交+1，科研+1，金+2',
				awakenName: '变本加厉',
				awakenDesc: '好感归0→重置为3，社交+1，科研+1，金+2',
				stats: { favor: 0 }
			}
		},
		{ 
			id: 'chosen', 
			name: '天选之人', 
			icon: '⭐', 
			awakenIcon: '✨',
			desc: '命运的宠儿全面发展', 
			bonus: '科研+2 社交+2 好感+2 金币+2', 
			awakenName: '查缺补漏',
			awakenDesc: '转博时补齐所有短板',
			// 隐藏觉醒
			hiddenAwakenName: '孤注一掷',
			hiddenAwakenIcon: '🎯',
			hiddenAwakenDesc: '选择一项属性，其他两项变为1并将值转化到该属性',
			hiddenAwakenCondition: (gs) => gs.research === gs.social && gs.social === gs.favor,
			stats: { research: 2, social: 2, favor: 2, gold: 2 },
			reversed: {
				name: '空想之《天选之人》',
				icon: '🌀',
				awakenIcon: '🎲',
				desc: '命运是一场轮盘赌',
				bonus: '每月:科研/社交/好感随机交换，SAN/金随机交换，可突破属性上限',
				awakenName: '命运轮盘',
				awakenDesc: '每月:科研/社交/好感/SAN/金全部随机交换，可突破属性上限',
				stats: {}
			}
		}
	];

        const paperTitleWords = {
            adjectives: ['Deep', 'Neural', 'Efficient', 'Scalable', 'Robust', 'Adaptive', 'Dynamic', 'Multi-modal', 'Self-supervised', 'Federated', 'Attention-based', 'Graph-based', 'Hierarchical', 'Contrastive', 'Progressive', 'Unified'],
            nouns: ['Learning', 'Networks', 'Transformers', 'Models', 'Representations', 'Framework', 'Architecture', 'Approach', 'Method', 'System', 'Embeddings', 'Reasoning', 'Generation', 'Recognition'],
            verbs: ['Understanding', 'Generating', 'Predicting', 'Detecting', 'Recognizing', 'Synthesizing', 'Optimizing', 'Training', 'Enhancing', 'Improving'],
            domains: ['Vision', 'Language', 'Speech', 'Text', 'Images', 'Videos', 'Knowledge', 'Data', 'Graphs', 'Medical', '3D', 'Autonomous']
        };

        const ALL_BUFF_TYPES = [
            'monthly_san', 'exp_times', 'write_san_reduce', 'read_san_reduce',
            'idea_bonus', 'exp_bonus', 'write_bonus', 'idea_times', 'write_times', 'citation_multiply'
        ];

		const ALL_ACHIEVEMENTS = [
			'❤️ 喜结良缘', '💰 家财万贯', '⬡ 六边形战士',
			'🏆 诺奖选手', '🌸 交际花', '🤝 铁杆师生',
			'⚡ 精力满满', '🎯 百发百中', '☕ 我爱茶歇',
			'🏖️ 公费旅游', '🤖 论文机器', '📚 千引大佬',
			'☕ 绝世咖啡', '✨ Buff之神', '📜 高分论文',
			'🍀 幸运儿', '😭 倒霉蛋', '🎻 曲高和寡',
			'🏋️ 全力以赴', '🏆 全收集', '👊 越战越勇',
			'🧠 人间清醒', '🔥 火力全开', '🍚 食之无味',
			'🤖 机械飞升', '🛋️ 全套家具', '🧒 天才少年',
			'💎 无法埋没', '🔔 不鸣则已',  '📊 严重偏科',
			'💼 打工狂人', '📖 爱看论文',  '🏹 一箭双雕',
			'🎣 力挽狂澜', '💔 不入爱河', '💕 我在等你',
			'🏠 偏安一隅', '💪 强身健体',
			// ★★★ 新增成就 ★★★
			'🏸 羽球冠军', '🗼 穞堵臸猭畍', '🌲 300颗够吗',
			'🎓 感谢游玩', '🤧 体弱多病', '🏅 三好学生',
			'❤️‍🩹 爱惜生命', '💀 命悬一线', '🎤 K歌之王',
			'💌 吾爱吾师', '👔 项目之王', '🙅 学会拒绝', '🃏 赌神转世',
			'🎲 躲过一劫',
			// ★★★ 新增5个成就 ★★★
			'📰 Nature在手', '🪑 高级家具', '🤝 人脉广阔', '🔬 顶尖大组', '🏁 旅途的终点',
			// ★★★ 新增2个成就 ★★★
			'⬆️ 全部升级', '📖 青出于蓝',
		];

        // 结局名称映射
		const ENDING_NAMES = {
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
			'green_pepper': '🌶️ 青椒',
			'become_advisor': '👨‍🏫 我就是导师',
			'academic_star': '⭐ 学术之星',
			'future_academician': '👑 未来院士',
			'nobel_start': '🏅 诺奖之始',  // ★★★ 新增：Nature论文结局 ★★★
			// 真实结局
			'true_nobel_start': '🏅 真·诺奖之始',  // ★★★ 新增：真·大多数发表Nature ★★★
			'true_phd': '🌟 真·博士毕业',
			'true_devotion': '💫 真·投身学术',
			'true_life': '🌈 真·感受生活',
		};

        // 困难结局（博士毕业及以上）
		const HARD_ENDINGS = ['phd', 'excellent_phd', 'green_pepper', 'become_advisor', 'academic_star', 'future_academician', 'nobel_start', 'true_nobel_start', 'true_phd', 'true_devotion', 'true_life'];

        // 结局达成要求数据
		const ENDING_REQUIREMENTS = {
			// ... 保留原有内容 ...
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
			'green_pepper': '博士毕业且A类≥4、引用>500',
			'become_advisor': '博士毕业且A类≥5、引用>1000',
			'academic_star': '博士毕业且A类≥5、引用>1000、大牛联合培养',
			'future_academician': '博士毕业且A类≥5、引用>2000、大牛联合培养',
			'nobel_start': '博士毕业且发表过Nature论文',  // ★★★ 新增 ★★★
			// 真实结局
			'true_nobel_start': '使用真·大多数角色，博士毕业且发表过Nature论文',  // ★★★ 新增 ★★★
			'true_phd': '使用真·大多数角色，博士毕业且发表≥3篇论文',
			'true_devotion': '使用真·大多数角色，博士毕业且总引用≥1000',
			'true_life': '使用真·大多数角色，顺利毕业（硕士或博士）且达成≥12个成就'
		};

        // 成就达成要求数据
		const ACHIEVEMENT_REQUIREMENTS = {
			'❤️ 喜结良缘': '与异性学者发展为恋人关系（社交≥12后在开会时多次交流同一人）',
			'💰 家财万贯': '金币≥30',
			'⬡ 六边形战士': '科研、社交、好感、金币均>15',
			'🏆 诺奖选手': '科研能力达到20',
			'🌸 交际花': '社交能力达到20',
			'🤝 铁杆师生': '导师好感度达到20',
			'⚡ 精力满满': '结局时SAN值>20',
			'🎯 百发百中': '前5次投稿全部命中',
			'☕ 我爱茶歇': '在开会事件中选择茶歇+晚宴≥3次',
			'🏖️ 公费旅游': '在开会事件中选择顺便旅游≥3次',
			'🤖 论文机器': '发表论文总数≥10',
			'📚 千引大佬': '总引用数≥1000',
			'☕ 绝世咖啡': '冰美式效果达到SAN+6（需购买45杯以上）',
			'✨ Buff之神': '触发过所有类型的Buff效果',
			'📜 高分论文': '论文分数达到125，且未从人脉关系角色获得分数加成',
			'🍀 幸运儿': '论文收到三位大牛审稿人的一致改进',
			'😭 倒霉蛋': '三个审稿人都是坏审稿人(恶意小同行或者39个问题审稿人)',
			'🎻 曲高和寡': '结局时只中过A类或S类论文，没有B和C',
			'🏋️ 全力以赴': '顺利毕业且毕业前一个月结束时SAN和金钱都为0',
			'🏆 全收集': '中稿A,B,C的poster和oral共6类论文',
			'👊 越战越勇': '至少被拒稿5次',
			'🧠 人间清醒': '拥有两次转博机会都拒绝了',
			'🔥 火力全开': '论文槽位同时有4篇论文在审',
			'🍚 食之无味': '一篇论文被连续拒稿3次',
			'🤖 机械飞升': '商店购买5台GPU服务器',
			'🛋️ 全套家具': '购买工学椅+显示器+键盘',
			'🧒 天才少年': '转博时就达到博士毕业要求',
			'💎 无法埋没': '单篇C类论文引用超过100',
			'🔔 不鸣则已': '第一篇论文引用超过200',
			'📊 严重偏科': '科研能力、导师好感度、社交能力最高和最低的差距超过12',
			'💼 打工狂人': '至少打工10次',
			'📖 爱看论文': '至少看20次论文',
			'🏹 一箭双雕': '曾在一个会议同时中稿≥2篇论文',
			'🎣 力挽狂澜': '曾在审稿总分为-1时被PC捞起录用',
			'💔 不入爱河': '结局时两次拒绝聪慧恋人或活泼恋人，且最后没有恋爱',
			'💕 我在等你': '两次拒绝聪慧恋人或活泼恋人，且最后恋爱了',
			'🏠 偏安一隅': '两次拒绝大牛联培和企业实习',
			'💪 强身健体': '随机事件里选择打羽毛球后成功规避了感冒事件',
			// ★★★ 新增成就要求 ★★★
			'🏸 羽球冠军': '在团建中打羽毛球时SAN>=20获得冠军1次',
			'🗼 穞堵臸猭畍': '玩魔塔50层3次',
			'🌲 300颗够吗': '玩泰拉瑞亚3次',
			'🎓 感谢游玩': '玩研究生模拟器3次',
			'🤧 体弱多病': '感冒3次',
			'🏅 三好学生': '连续拿到3年奖学金',
			'❤️‍🩹 爱惜生命': '感冒时选择去医院3次',
			'💀 命悬一线': 'SAN上限降到10以下',
			'🎤 K歌之王': '在团建中KTV唱歌3次',
			'💌 吾爱吾师': '教师节连续赠送3次邮票',
			'👔 项目之王': '完成3次导师项目（横向或纵向）',
			'🙅 学会拒绝': '拒绝过导师项目、审稿、指导本科生各1次',
			'🃏 赌神转世': '在团建德州扑克中赢3次',
			'🎲 躲过一劫': '数据丢失时没有正在进行的论文',
			// ★★★ 新增5个成就要求 ★★★
			'📰 Nature在手': '发表一篇Nature论文',
			'🪑 高级家具': '升级人体工学椅（购买人体工学椅后再次购买）',
			'🤝 人脉广阔': '同时拥有5个社交关系，且每个关系的亲和度或亲密度都>=12',
			'🔬 顶尖大组': '同时拥有5个社交关系，且每个关系的科研能力或科研资源都>=12',
			'🏁 旅途的终点': '使用6个角色的正位和逆位各通关博士一次（共12个）',
			// ★★★ 新增2个成就要求 ★★★
			'⬆️ 全部升级': '将4个论文槽位全部升级为期刊槽位',
			'📖 青出于蓝': '你的论文总引用数超过导师的引用数',
		};

        // 商店物品
		const shopItems = [
			{ id: 'coffee', name: '冰美式', desc: 'SAN值+3', price: 2, monthlyOnce: true, boughtThisMonth: false },
			{ id: 'gemini', name: 'Gemini订阅', desc: '本月想idea时SAN-1，分数+4', price: 2, monthlyOnce: true, boughtThisMonth: false },
			{ id: 'gpt', name: 'GPT订阅', desc: '本月做实验时SAN-1，分数+4', price: 3, monthlyOnce: true, boughtThisMonth: false },
			{ id: 'claude', name: 'Claude订阅', desc: '本月写论文时SAN-1，分数+4', price: 3, monthlyOnce: true, boughtThisMonth: false },
			{ id: 'gpu_rent', name: '租GPU服务器', desc: '本月做实验多做1次且分数+1', price: 2, once: false },  // ★★★ 修改：增加分数+1 ★★★
			{ id: 'gpu_buy', name: '购买GPU服务器', desc: '永久buff-每次做实验多做1次且分数+1', price: 10, once: false },  // ★★★ 修改：价格12→10，增加分数+1 ★★★
			{ id: 'chair', name: '人体工学椅', desc: '永久buff-每月SAN值+1', price: 10, once: true, bought: false },
			{ id: 'keyboard', name: '机械键盘', desc: '永久buff-写论文变为SAN-3', price: 8, once: true, bought: false },
			{ id: 'monitor', name: '4K显示器', desc: '永久buff-读论文变为SAN-1', price: 8, once: true, bought: false }
		];
		
		// ==================== 会议配置 ====================
		const CONFERENCES = {
			1: {  // 现实9月
				A: { name: 'ICLR', fullName: 'International Conference on Learning Representations', field: '深度学习' },
				B: { name: 'ICRA', fullName: 'International Conference on Robotics and Automation', field: '机器人' },
				C: { name: 'WACV', fullName: 'Winter Conference on Applications of Computer Vision', field: '计算机视觉' }
			},
			2: {  // 现实10月
				A: { name: 'WWW', fullName: 'The Web Conference', field: '万维网' },
				B: { name: 'NAACL', fullName: 'North American Chapter of ACL', field: '自然语言处理' },
				C: { name: 'MMAsia', fullName: 'ACM Multimedia Asia', field: '多媒体' }
			},
			3: {  // 现实11月
				A: { name: 'CVPR', fullName: 'Conference on Computer Vision and Pattern Recognition', field: '计算机视觉' },
				B: { name: 'CIKM', fullName: 'Conference on Information and Knowledge Management', field: '信息管理' },
				C: { name: 'ICDAR', fullName: 'International Conference on Document Analysis and Recognition', field: '文档分析' }
			},
			4: {  // 现实12月
				A: { name: 'ACL', fullName: 'Annual Meeting of the Association for Computational Linguistics', field: '自然语言处理' },
				B: { name: 'ICONIP', fullName: 'International Conference on Neural Information Processing', field: '神经网络' },
				C: { name: 'ICPR', fullName: 'International Conference on Pattern Recognition', field: '模式识别' }
			},
			5: {  // 现实1月
				A: { name: 'IJCAI', fullName: 'International Joint Conference on Artificial Intelligence', field: '人工智能' },
				B: { name: 'ICME', fullName: 'IEEE International Conference on Multimedia and Expo', field: '多媒体' },
				C: { name: 'ICIP', fullName: 'IEEE International Conference on Image Processing', field: '图像处理' }
			},
			6: {  // 现实2月
				A: { name: 'ICML', fullName: 'International Conference on Machine Learning', field: '机器学习' },
				B: { name: 'COLT', fullName: 'Conference on Learning Theory', field: '学习理论' },
				C: { name: 'IJCNN', fullName: 'International Joint Conference on Neural Networks', field: '神经网络' }
			},
			7: {  // 现实3月
				A: { 
					name: 'ICCV/ECCV',
					alternates: {
						odd: { name: 'ICCV', fullName: 'International Conference on Computer Vision' },
						even: { name: 'ECCV', fullName: 'European Conference on Computer Vision' }
					},
					field: '计算机视觉'
				},
				B: { name: 'ISCA', fullName: 'Annual Conference of ISCA', field: '语音' },
				C: { name: 'IROS', fullName: 'IEEE/RSJ International Conference on Intelligent Robots and Systems', field: '机器人' }
			},
			8: {  // 现实4月
				A: { name: 'ACM MM', fullName: 'ACM International Conference on Multimedia', field: '多媒体' },
				B: { name: 'EACL', fullName: 'European Chapter of ACL', field: '自然语言处理' },
				C: { name: 'IJCB', fullName: 'International Joint Conference on Biometrics', field: '生物识别' }
			},
			9: {  // 现实5月
				A: { name: 'NeurIPS', fullName: 'Conference on Neural Information Processing Systems', field: '机器学习' },
				B: { name: 'ECAI', fullName: 'European Conference on Artificial Intelligence', field: '人工智能' },
				C: { name: 'BMVC', fullName: 'British Machine Vision Conference', field: '计算机视觉' }
			},
			10: {  // 现实6月
				A: { name: 'EMNLP', fullName: 'Conference on Empirical Methods in Natural Language Processing', field: '自然语言处理' },
				B: { name: 'CoNLL', fullName: 'Conference on Computational Natural Language Learning', field: '自然语言' },
				C: { name: 'PRCV', fullName: 'Chinese Conference on Pattern Recognition and Computer Vision', field: '模式识别' }
			},
			11: {  // 现实7月
				A: { name: 'COLING', fullName: 'International Conference on Computational Linguistics', field: '计算语言学' },
				B: { name: 'RSS', fullName: 'Robotics: Science and Systems', field: '机器人' },
				C: { name: 'ACCV', fullName: 'Asian Conference on Computer Vision', field: '计算机视觉' }
			},
			12: {  // 现实8月
				A: { name: 'AAAI', fullName: 'AAAI Conference on Artificial Intelligence', field: '人工智能' },
				B: { name: 'ICMR', fullName: 'ACM International Conference on Multimedia Retrieval', field: '多媒体检索' },
				C: { name: '3DV', fullName: 'International Conference on 3D Vision', field: '三维视觉' }
			}
		};

		const CONFERENCE_LOCATIONS = [
			// 北美
			{ city: '旧金山', country: '美国' },
			{ city: '西雅图', country: '美国' },
			{ city: '新奥尔良', country: '美国' },
			{ city: '温哥华', country: '加拿大' },
			{ city: '蒙特利尔', country: '加拿大' },
			{ city: '纽约', country: '美国' },
			{ city: '迈阿密', country: '美国' },
			{ city: '檀香山', country: '美国' },
			{ city: '圣地亚哥', country: '美国' },
			{ city: '波士顿', country: '美国' },
			{ city: '洛杉矶', country: '美国' },
			{ city: '多伦多', country: '加拿大' },
			// 欧洲
			{ city: '巴塞罗那', country: '西班牙' },
			{ city: '维也纳', country: '奥地利' },
			{ city: '阿姆斯特丹', country: '荷兰' },
			{ city: '巴黎', country: '法国' },
			{ city: '慕尼黑', country: '德国' },
			{ city: '伦敦', country: '英国' },
			{ city: '佛罗伦萨', country: '意大利' },
			{ city: '都柏林', country: '爱尔兰' },
			{ city: '斯德哥尔摩', country: '瑞典' },
			{ city: '苏黎世', country: '瑞士' },
			{ city: '爱丁堡', country: '英国' },
			{ city: '米兰', country: '意大利' },
			// 亚太
			{ city: '新加坡', country: '新加坡' },
			{ city: '东京', country: '日本' },
			{ city: '首尔', country: '韩国' },
			{ city: '香港', country: '中国' },
			{ city: '北京', country: '中国' },
			{ city: '上海', country: '中国' },
			{ city: '悉尼', country: '澳大利亚' },
			{ city: '墨尔本', country: '澳大利亚' },
			{ city: '台北', country: '中国' },
			{ city: '曼谷', country: '泰国' },
			{ city: '京都', country: '日本' },
			{ city: '深圳', country: '中国' }
		];
	
		const CCIG_LOCATIONS = ['合肥', '成都', '苏州', '西安', '重庆'];
