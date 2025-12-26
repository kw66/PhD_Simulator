        // ==================== 游戏状态 ====================
        let gameState = {};
        let selectedCharacter = null;
        let isReversedMode = false;
        let characterDifficultyData = {};
        let currentEndingData = null;
		
		let isTrueNormalMode = false;  // 是否选择了真·大多数模式

		function getInitialState() {
			return {
				character: null,
				characterName: '',
				degree: 'master',
				year: 1,
				month: 1,
				totalMonths: 0,
				maxYears: 3,
				san: 20,
				sanMax: 20,
				research: 1,
				social: 1,
				favor: 1,
				gold: 1,
				paperS: 0,          // S类论文数量（Nature + Nature子刊）
				paperNature: 0,     // Nature论文数量
				paperNatureSub: 0,  // Nature子刊数量
				paperA: 0,
				paperB: 0,
				paperC: 0,
				totalScore: 0,
				upgradedSlots: [],  // 已升级的槽位索引数组（升级后可投期刊）
				totalCitations: 0,
				publishedPapers: [],
				paperSlots: 1,
				papers: [null, null, null, null],
				buffs: { permanent: [], temporary: [] },
				actionUsed: false,
				readCount: 0,
				workCount: 0,
				firstPaperAccepted: false,
				firstAPaperAccepted: false,
				hasLover: false,
				loverType: null,
				bigBullCooperation: false,
				rejectedCount: 0,
				teaBreakCount: 0,
				tourCount: 0,
				metBigBull: false,
				metBeautiful: false,
				metSmart: false,
				bigBullDeepCount: 0,
				beautifulCount: 0,
				smartCount: 0,
				availableRandomEvents: [],
				usedRandomEvents: [],
				triggeredBuffTypes: [],
				coffeeBoughtCount: 0,
				isReversed: false,
				reversedAwakened: false,
				blockedResearchGains: 0,
				
				phdChoiceMadeThisYear: false,
				pendingPhDChoice: false,
				pendingConference: null,
				goldSpentTotal: 0,
				enterpriseCount: 0,
				ailabInternship: false,
				firstBestPaperAccepted: false,
				firstABestPaperAccepted: false,
				badmintonYear: -1,
				
				lastResetMonth: 0,
				socialAwakened: false,
				reviewerDistribution: null,
				
				ideaClickCount: 0,
				expClickCount: 0,
				writeClickCount: 0,
				consecutiveAccepts: 0,
				
				rejectedPapers: {},
				maxConcurrentReviews: 0,
				phdOpportunitiesRejected: 0,
				gpuServersBought: 0,
				furnitureBought: {
					chair: false,
					monitor: false,
					keyboard: false
				},
				achievementConditions: {
					highScorePaper: false,
					unanimousImprovement: false,
					allBadReviewers: false,
					tripleRejected: false,
					bought5GPUs: false,
					fullFurnitureSet: false,
					phdRequirementMetEarly: false,
					rejectedPhdTwice: false,
					savedByPC: false,
				},
				paperTypeCollection: new Set(),
				
				// ★★★ 新增：隐藏觉醒相关状态 ★★★
				hiddenAwakened: false,           // 是否触发了隐藏觉醒
				hiddenAwakenType: null,          // 隐藏觉醒类型
				actionLimit: 1,                  // 每月行动次数限制（勤能补拙为2）
				actionCount: 0,                  // 本月已使用行动次数
				noDecay: false,                  // 是否禁止论文分数衰减（预见未来热点）
				// 替换原有的技能状态字段
				hasSeniorHelpSkill: false,       // 是否有师兄师姐救我技能
				seniorHelpUses: 0,               // ★★★ 新增：师兄师姐救我剩余使用次数 ★★★
				hasTeacherHelpSkill: false,      // 是否有导师救我技能
				teacherHelpUses: 0,              // ★★★ 新增：导师救我剩余使用次数 ★★★
				nextActionBonus: 0,              // ★★★ 新增：下次操作的临时加成值 ★★★
				nextActionBonusSource: null,     // ★★★ 新增：加成来源 'senior' 或 'teacher' ★★★
				nextActionBonusType: null,       // ★★★ 新增：加成类型 'idea', 'exp', 'write' ★★★
				monthlyWageBonus: 0,             // 每月工资加成（不求暴富但求稳定）
				nextIdeaResearchBonus: 0,        // 下次想idea的临时科研加成（主动技能用，不算buff）
				nextIdeaBonusSource: null,        // 加成来源（'senior' 或 'teacher'）
				isTrueNormal: false,  // 是否使用真·大多数角色
				researchMax: 20,
				socialMax: 20,  
				favorMax: 20, 
				// ★★★ 新增：高级选项触发记录 ★★★
				metBigBullCoop: false,           // 是否触发过"找大牛合作"

				// ★★★ 新增：拒绝次数统计（分开计算）★★★
				rejectedBeautifulLoverCount: 0,  // 拒绝活泼恋人次数
				rejectedSmartLoverCount: 0,      // 拒绝聪慧恋人次数
				rejectedInternshipCount: 0,      // 拒绝实习次数
				rejectedBigBullCoopCount: 0,     // 拒绝大牛联培次数

				// ★★★ 新增：永久阻止标志 ★★★
				permanentlyBlockedBeautifulLover: false,  // 永久阻止活泼恋人相关
				permanentlyBlockedSmartLover: false,      // 永久阻止聪慧恋人相关
				permanentlyBlockedInternship: false,      // 永久阻止实习事件
				permanentlyBlockedBigBullCoop: false,     // 永久阻止大牛联培事件                
                // ★★★ 新增：投稿统计和会议信息 ★★★
                submissionStats: null,           // 投稿统计快照
                pendingConferenceInfo: null,      // 待开会议信息
				achievementCoins: 0,  // 成就币
				earnedAchievementsThisGame: [],  // 本局游戏中获得的成就
				// ★★★ 新增：预购订阅状态 ★★★
				subscriptions: {
					coffee: false,      // 冰美式订阅
					claude: false,      // Claude订阅
					gpt: false,         // GPT订阅
					gemini: false,      // Gemini订阅
					gpu_rent: false     // 租GPU服务器订阅
				},
				// ★★★ 新增：人际关系网络 ★★★
				relationships: [],      // 人际关系网络数组
				// ★★★ 新增：永久解锁记录（一旦解锁不会因能力下降而重新锁定）★★★
				paperSlotsUnlocked: 1,        // 论文槽已解锁数量（初始1个）
				relationshipSlotsUnlocked: 2, // 人际关系槽已解锁数量（初始2个）
			};
		}


