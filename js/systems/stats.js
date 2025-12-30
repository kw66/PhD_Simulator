        // ==================== Supabase 统计系统 ====================
		const SUPABASE_URL = 'https://ypefmpeekfucmarbbdov.supabase.co';
		const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZWZtcGVla2Z1Y21hcmJiZG92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTA2NTYsImV4cCI6MjA4MTUyNjY1Nn0.XTOQNFuuwfu9nwDTnO9-NEqlzZnzdCVnEmYEJh0rXf8';
        //const SUPABASE_URL = 'https://orzejzmyzugxtyrzfcse.supabase.co';
        //const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yemVqem15enVneHR5cnpmY3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDYyMTUsImV4cCI6MjA4MDg4MjIxNX0.lx9W0v9KpRPmQR0kdxCSWVks_az5rLCr7D3JI2efeM4';

        // supabase 客户端变量（使用 window 确保全局可访问）
        window.supabaseClient = null;
        let statsInitialized = false;
        let statsCache = null;
        let statsCacheTime = 0;
        let visitStatsCache = null;
        let visitStatsCacheTime = 0;
        const CACHE_DURATION = 24 * 60 * 60 * 1000;  // 24小时缓存（优化：大幅减少Egress流量）

		// ==================== 持久化缓存系统 ====================
		const CACHE_KEYS = {
			STATS: 'graduateSimulator_statsCache',
			VISIT: 'graduateSimulator_visitCache',
			GAMES: 'graduateSimulator_gamesCache',
			CHARACTER_RECORDS: 'graduateSimulator_charRecordsCache'
		};

		// 从localStorage获取缓存（带过期检查和有效性验证）
		function getLocalCache(key) {
			try {
				const cached = localStorage.getItem(key);
				if (!cached) return null;
				
				const { data, timestamp } = JSON.parse(cached);
				
				// 检查是否过期
				if (Date.now() - timestamp > CACHE_DURATION) {
					localStorage.removeItem(key);
					console.log(`缓存已过期: ${key}`);
					return null;
				}
				
				// ★★★ 检查数据有效性 ★★★
				if (data === null || data === undefined) {
					localStorage.removeItem(key);
					console.log(`缓存数据无效: ${key}`);
					return null;
				}
				
				// 对于统计数据，额外检查结构
				if (key === CACHE_KEYS.STATS) {
					if (!data.normal || !data.reversed) {
						localStorage.removeItem(key);
						console.log(`统计缓存结构无效: ${key}`);
						return null;
					}
				}
				
				return data;
			} catch (e) {
				console.warn('读取缓存失败:', e);
				// 缓存损坏时删除
				try { localStorage.removeItem(key); } catch(err) {}
				return null;
			}
		}

		// 存储缓存到localStorage（只存储有效数据）
		function setLocalCache(key, data) {
			// ★★★ 不缓存无效数据 ★★★
			if (data === null || data === undefined) {
				console.log(`跳过缓存无效数据: ${key}`);
				return;
			}
			
			try {
				localStorage.setItem(key, JSON.stringify({
					data,
					timestamp: Date.now()
				}));
				console.log(`已缓存: ${key}`);
			} catch (e) {
				console.error('存储缓存失败:', e);
			}
		}

		// ★★★ 新增：清除指定缓存 ★★★
		function clearLocalCache(key) {
			try {
				localStorage.removeItem(key);
				console.log(`已清除缓存: ${key}`);
			} catch (e) {
				console.error('清除缓存失败:', e);
			}
		}

		// ★★★ 新增：清除所有统计缓存（用于强制刷新）★★★
		function clearAllStatsCache() {
			Object.values(CACHE_KEYS).forEach(key => {
				try { localStorage.removeItem(key); } catch(e) {}
			});
			console.log('已清除所有统计缓存');
		}

		// ==================== 真实结局解锁系统 ====================
		const PHD_UNLOCK_KEY = 'graduateSimulator_phdUnlocks';

		// 获取各角色博士通关记录
		function getCharacterPhdUnlocks() {
			try {
				const data = localStorage.getItem(PHD_UNLOCK_KEY);
				if (data) {
					return JSON.parse(data);
				}
			} catch (e) {
				console.warn('读取博士通关记录失败:', e);
			}
			return {
				normal: {normal: false,  genius: false, social: false, rich: false, 'teacher-child': false, chosen: false, },
				reversed: {normal: false,  genius: false, social: false, rich: false, 'teacher-child': false, chosen: false, }
			};
		}

		// 记录角色博士通关
		function recordCharacterPhdUnlock(characterId, isReversed) {
			// ★★★ 修改：使用诅咒或祝福时不记录博士通关（无法解锁真·大多数）★★★
			const usedCurseOrBlessing = typeof hasAnyCurseOrBlessing === 'function' && hasAnyCurseOrBlessing();
			if (usedCurseOrBlessing) {
				console.log('⚠️ 使用了诅咒/祝福，不记录博士通关，无法解锁真·大多数');
				return;
			}

			const unlocks = getCharacterPhdUnlocks();
			const mode = isReversed ? 'reversed' : 'normal';
			unlocks[mode][characterId] = true;
			localStorage.setItem(PHD_UNLOCK_KEY, JSON.stringify(unlocks));
			console.log(`✅ 记录博士通关: ${characterId} (${mode})`);

			// ★★★ 检查旅途的终点成就：6个角色的正位和逆位都通关博士（共12个）★★★
			const progress = getTrueNormalUnlockProgress();
			if (progress.isComplete) {
				gameState.achievementConditions = gameState.achievementConditions || {};
				gameState.achievementConditions.journeyEnd = true;
				console.log('🏁 旅途的终点成就条件达成！（12/12）');
			}
		}

		// ★★★ 新增：获取已通关博士的不同角色数量（正位或逆位均可）★★★
		function getUniqueCharacterPhdCount() {
			const unlocks = getCharacterPhdUnlocks();
			const allCharacterIds = ['normal', 'genius', 'social', 'rich', 'teacher-child', 'chosen'];
			let uniqueCount = 0;

			for (const charId of allCharacterIds) {
				// 正位或逆位任一通关即算
				if (unlocks.normal[charId] || unlocks.reversed[charId]) {
					uniqueCount++;
				}
			}

			return uniqueCount;
		}

		// ★★★ 新增：获取总通关角色位置数（正位6+逆位6+真大多数1=13个位置）★★★
		function getTotalClearedCharacterSlots() {
			const unlocks = getCharacterPhdUnlocks();
			const allCharacterIds = ['normal', 'genius', 'social', 'rich', 'teacher-child', 'chosen'];
			let totalSlots = 0;

			// 统计正位通关数
			for (const charId of allCharacterIds) {
				if (unlocks.normal[charId]) {
					totalSlots++;
				}
			}

			// 统计逆位通关数
			for (const charId of allCharacterIds) {
				if (unlocks.reversed[charId]) {
					totalSlots++;
				}
			}

			// 检查真大多数是否通关（需要查看玩家记录）
			const playerRecords = getPlayerAchievements();
			const normalEndings = playerRecords.endings.normal || new Set();
			const trueNormalEndings = ['true_phd', 'true_devotion', 'true_life', 'true_nobel_start'];

			let trueNormalCleared = false;
			for (const ending of trueNormalEndings) {
				if (normalEndings instanceof Set) {
					if (normalEndings.has(ending)) {
						trueNormalCleared = true;
						break;
					}
				} else if (Array.isArray(normalEndings)) {
					if (normalEndings.includes(ending)) {
						trueNormalCleared = true;
						break;
					}
				}
			}

			if (trueNormalCleared) {
				totalSlots++;
			}

			return totalSlots;
		}

		// 检查是否解锁真·大多数（需要6个角色的正位和逆位都博士毕业）
		function isTrueNormalUnlocked() {
			const unlocks = getCharacterPhdUnlocks();
			const allCharacterIds = ['normal', 'genius', 'social', 'rich', 'teacher-child', 'chosen'];
			
			// 检查每个角色的正位和逆位是否都达到博士毕业
			for (const charId of allCharacterIds) {
				if (!unlocks.normal[charId] || !unlocks.reversed[charId]) {
					return false;
				}
			}
			return true;
		}

		// 获取解锁进度（总共12个：6角色×2模式）
		function getTrueNormalUnlockProgress() {
			const unlocks = getCharacterPhdUnlocks();
			const allCharacterIds = ['normal', 'genius', 'social', 'rich', 'teacher-child', 'chosen'];
			
			let unlockedCount = 0;
			const details = [];
			
			for (const charId of allCharacterIds) {
				const normalUnlocked = unlocks.normal[charId] || false;
				const reversedUnlocked = unlocks.reversed[charId] || false;
				
				if (normalUnlocked) unlockedCount++;
				if (reversedUnlocked) unlockedCount++;
				
				const char = characters.find(c => c.id === charId);
				details.push({
					id: charId,
					name: char ? char.name : charId,
					normalUnlocked,
					reversedUnlocked
				});
			}
			
			return {
				unlocked: unlockedCount,
				total: 12,
				isComplete: unlockedCount === 12,
				details
			};
		}

		// 获取玩家本地达成的结局和成就记录
		function getPlayerAchievements() {
			const recordKey = 'graduateSimulator_playerRecords';
			try {
				const records = localStorage.getItem(recordKey);
				if (records) {
					const parsed = JSON.parse(records);
					return {
						achievements: {
							normal: new Set(parsed.achievements?.normal || []),
							reversed: new Set(parsed.achievements?.reversed || [])
						},
						endings: {
							normal: new Set(parsed.endings?.normal || []),
							reversed: new Set(parsed.endings?.reversed || [])
						}
					};
				}
			} catch (e) {
				console.warn('读取玩家记录失败:', e);
			}
			
			return {
				achievements: { normal: new Set(), reversed: new Set() },
				endings: { normal: new Set(), reversed: new Set() }
			};
		}

		// 保存玩家达成的结局和成就
		function savePlayerRecord(endingType, achievements, isReversed) {
			// ★★★ 修改：使用诅咒或祝福时不永久保存成就和结局 ★★★
			const usedCurseOrBlessing = typeof hasAnyCurseOrBlessing === 'function' && hasAnyCurseOrBlessing();
			if (usedCurseOrBlessing) {
				console.log('⚠️ 使用了诅咒/祝福，成就和结局仅局内生效，不永久保存');
				return;
			}

			const recordKey = 'graduateSimulator_playerRecords';
			try {
				let records = { 
					achievements: { normal: [], reversed: [] }, 
					endings: { normal: [], reversed: [] } 
				};
				
				const existing = localStorage.getItem(recordKey);
				if (existing) {
					records = JSON.parse(existing);
					// 确保结构完整
					if (!records.achievements) records.achievements = { normal: [], reversed: [] };
					if (!records.endings) records.endings = { normal: [], reversed: [] };
					if (!records.achievements.normal) records.achievements.normal = [];
					if (!records.achievements.reversed) records.achievements.reversed = [];
					if (!records.endings.normal) records.endings.normal = [];
					if (!records.endings.reversed) records.endings.reversed = [];
				}
				
				const mode = isReversed ? 'reversed' : 'normal';
				
				// 添加结局
				if (!records.endings[mode].includes(endingType)) {
					records.endings[mode].push(endingType);
				}
				
				// 添加成就
				achievements.forEach(ach => {
					if (!records.achievements[mode].includes(ach)) {
						records.achievements[mode].push(ach);
					}
				});
				
				localStorage.setItem(recordKey, JSON.stringify(records));
			} catch (e) {
				console.error('保存玩家记录失败:', e);
			}
		}

		function initStats() {
			if (statsInitialized) return;

			try {
				if (typeof window.supabase === 'undefined' || !window.supabase.createClient) {
					console.warn('⚠️ Supabase SDK 未加载');
					return;
				}

				window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
				statsInitialized = true;
				console.log('✅ Supabase 初始化成功');
				recordVisit();
				// startOnlineTracking 移到 init() 中调用，因为它在 online.js 中定义

			} catch (e) {
				console.error('❌ 初始化失败:', e);
				window.supabaseClient = null;
			}
		}

		// ★★★ 修复：同时插入site_visits（用于今日统计）和更新counters（用于总计）★★★
		async function recordVisit() {
			console.log('📊 recordVisit() 开始执行, window.supabaseClient:', !!window.supabaseClient);
			if (!window.supabaseClient) {
				console.warn('⚠️ recordVisit: window.supabaseClient 未初始化，跳过记录');
				return;
			}
			try {
				// ★★★ 1. 插入PV记录到site_visits ★★★
				const { error: pvError } = await window.supabaseClient.from('site_visits').insert({ type: 'pv' });

				if (pvError) {
					console.error('❌ PV插入失败:', pvError);
				} else {
					console.log('✅ PV已记录');
				}

				// ★★★ 2. 尝试更新计数器（非致命，忽略错误） ★★★
				try { await window.supabaseClient.rpc('increment_counter', { counter_id: 'pv_total' }); } catch(e) {}

				// UV：每天每个用户只记录一次
				const todayStr = getTodayDateString();
				const visitorKey = 'graduate_simulator_visitor';
				const lastUvDateKey = 'graduate_simulator_last_uv_date';

				const isNewVisitor = !localStorage.getItem(visitorKey);
				const lastUvDate = localStorage.getItem(lastUvDateKey);
				const isNewDay = lastUvDate !== todayStr;

				if (isNewVisitor || isNewDay) {
					// ★★★ 插入UV记录到site_visits ★★★
					const { error: uvError } = await window.supabaseClient.from('site_visits').insert({ type: 'uv' });

					if (uvError) {
						console.error('❌ UV插入失败:', uvError);
					} else {
						localStorage.setItem(visitorKey, 'true');
						localStorage.setItem(lastUvDateKey, todayStr);
						console.log(isNewVisitor ? '✅ 新访客已记录' : '✅ 今日访客已记录');
					}

					// 尝试更新计数器（非致命，忽略错误）
					try { await window.supabaseClient.rpc('increment_counter', { counter_id: 'uv_total' }); } catch(e) {}
				}
			} catch (e) {
				console.error('❌ 记录访问异常:', e);
			}
		}

		// 优化：从计数器表读取（避免全表 count 查询）
		async function getVisitStats() {
			// 先检查本地缓存
			const cached = getLocalCache(CACHE_KEYS.VISIT);
			if (cached) {
				console.log('使用本地缓存的访问统计');
				visitStatsCache = cached;
				visitStatsCacheTime = Date.now();
				return cached;
			}

			if (!window.supabaseClient) return { pv: 0, uv: 0 };

			try {
				// 优先使用 RPC 函数一次获取多个计数器
				const { data, error } = await window.supabaseClient.rpc('get_counters', {
					counter_ids: ['pv_total', 'uv_total']
				});

				if (!error && data && data.length > 0) {
					const counters = {};
					data.forEach(row => { counters[row.id] = row.count; });

					const result = {
						pv: counters['pv_total'] || 0,
						uv: counters['uv_total'] || 0
					};

					visitStatsCache = result;
					visitStatsCacheTime = Date.now();
					setLocalCache(CACHE_KEYS.VISIT, result);
					return result;
				}

				// RPC 不可用时回退到原有方式
				console.warn('计数器RPC失败，回退到原有方式');
				const { count: pvCount, error: pvError } = await window.supabaseClient
					.from('site_visits')
					.select('*', { count: 'exact', head: true })
					.eq('type', 'pv');

				if (pvError) throw pvError;

				const { count: uvCount, error: uvError } = await window.supabaseClient
					.from('site_visits')
					.select('*', { count: 'exact', head: true })
					.eq('type', 'uv');

				if (uvError) throw uvError;

				const result = { pv: pvCount || 0, uv: uvCount || 0 };
				visitStatsCache = result;
				visitStatsCacheTime = Date.now();
				setLocalCache(CACHE_KEYS.VISIT, result);
				return result;
			} catch (e) {
				console.error('获取访问统计失败:', e);
				return visitStatsCache || { pv: 0, uv: 0 };
			}
		}



		async function recordEnding(endingType, endingTitle) {
			// ★★★ 检查是否使用了诅咒或祝福 ★★★
			const usedCurseOrBlessing = typeof hasAnyCurseOrBlessing === 'function' && hasAnyCurseOrBlessing();

			// 计算成就数量
			const achievements = collectAchievements(endingType);
			const achievementCount = achievements.length;

			// 更新本地记录（内部会根据是否使用诅咒/祝福决定更新哪些字段）
			updateLocalMeta(
				gameState.character,
				gameState.isReversed,
				gameState.totalScore,
				gameState.totalCitations,
				achievementCount,
				endingType,
			);

			if (!window.supabaseClient) return;

			try {
				// 获取难度信息
				const difficultyPoints = typeof getSavedDifficultyPoints === 'function' ? getSavedDifficultyPoints() : 0;
				// ★★★ 优化：只存储激活的诅咒（过滤掉值为0的）★★★
				let cursesData = null;
				if (gameState.activeCurses) {
					const activeCurses = {};
					for (const [key, value] of Object.entries(gameState.activeCurses)) {
						if (value > 0) activeCurses[key] = value;
					}
					if (Object.keys(activeCurses).length > 0) {
						cursesData = JSON.stringify(activeCurses);
					}
				}
				// ★★★ 新增：存储祝福数据 ★★★
				let blessingsData = null;
				if (gameState.activeBlessings) {
					const activeBlessings = {};
					for (const [key, value] of Object.entries(gameState.activeBlessings)) {
						if (value > 0) activeBlessings[key] = value;
					}
					if (Object.keys(activeBlessings).length > 0) {
						blessingsData = JSON.stringify(activeBlessings);
					}
				}

				const { error } = await window.supabaseClient.from('game_endings').insert({
					ending_type: endingType,
					ending_title: endingTitle,
					character: gameState.character,
					is_reversed: gameState.isReversed,
					total_months: gameState.totalMonths,
					total_score: gameState.totalScore,
					paper_a: gameState.paperA,
					paper_b: gameState.paperB,
					paper_c: gameState.paperC,
					paper_nature: gameState.paperNature || 0,
					paper_nature_sub: gameState.paperNatureSub || 0,
					total_citations: gameState.totalCitations,
					achievements_count: achievementCount,
					difficulty_points: difficultyPoints,
					curses: cursesData,
					blessings: blessingsData,
					used_modifiers: usedCurseOrBlessing,
					created_at: new Date().toISOString()
				});

				if (error) throw error;
				console.log('✅ 结局已记录:', endingTitle, usedCurseOrBlessing ? '(使用了诅咒/祝福)' : '');

				// 清除缓存
				globalCharacterRecords = null;
			} catch (e) {
				console.error('❌ 记录结局失败:', e);
			}
		}

        async function recordAchievements(achievements) {
            if (!window.supabaseClient || achievements.length === 0) return;

            // ★★★ 修改：使用诅咒或祝福时不永久记录成就 ★★★
            const usedCurseOrBlessing = typeof hasAnyCurseOrBlessing === 'function' && hasAnyCurseOrBlessing();
            if (usedCurseOrBlessing) {
                console.log('⚠️ 使用了诅咒/祝福，成就仅局内生效，不永久记录');
                return;
            }

            try {
                const records = achievements.map(ach => ({
                    achievement_name: ach,
                    character: gameState.character,
                    is_reversed: gameState.isReversed
                }));
                
                const { error } = await window.supabaseClient.from('game_achievements').insert(records);
                
                if (error) throw error;
                console.log('✅ 成就已记录:', achievements);
            } catch (e) {
                console.error('❌ 记录成就失败:', e);
            }
        }


		// ★★★ 新增：快速获取游戏总数（用 count 查询）★★★
		async function getTotalGamesCount() {
			// 先检查本地缓存
			const cached = getLocalCache(CACHE_KEYS.GAMES);
			if (cached !== null && cached !== undefined) {
				console.log('使用本地缓存的游戏总数');
				return cached;
			}
			
			if (!window.supabaseClient) return 0;

			try {
				const { count, error } = await window.supabaseClient
					.from('game_endings')
					.select('*', { count: 'exact', head: true });
				
				if (error) throw error;
				
				const result = count || 0;
				
				// ★★★ 成功后才缓存 ★★★
				setLocalCache(CACHE_KEYS.GAMES, result);
				
				return result;
			} catch (e) {
				console.error('获取游戏总数失败:', e);
				// 失败时不缓存
				return 0;
			}
		}
		// ==================== 统计 Fallback 函数 (修复报错) ====================
		async function getGlobalStatsFallback() {
			console.log('⚠️ 统计加载进入 Fallback 模式 (使用默认空数据)');
			
			// 1. 定义一个基础的空统计结构
			const createEmptyStats = () => {
				const stats = {
					endings: {},
					achievements: {},
					totalGames: 0,
					characterEndings: {}
				};
				
				// 初始化所有结局计数为 0
				if (typeof ENDING_NAMES !== 'undefined') {
					Object.keys(ENDING_NAMES).forEach(key => stats.endings[key] = 0);
				}
				
				// 初始化所有成就计数为 0
				if (typeof ALL_ACHIEVEMENTS !== 'undefined') {
					ALL_ACHIEVEMENTS.forEach(key => stats.achievements[key] = 0);
				}
				
				// 初始化角色难度数据
				const allCharIds = ['normal', 'genius', 'social', 'rich', 'teacher-child', 'chosen', 'true-normal'];
				allCharIds.forEach(id => {
					stats.characterEndings[id] = { total: 0, hard: 0 };
				});
				
				return stats;
			};

			// 2. 返回完整的正位和逆位结构
			// 即使无法连接数据库，返回这个结构也能保证游戏UI正常渲染“暂无数据”而不是白屏
			return {
				normal: createEmptyStats(),
				reversed: createEmptyStats()
			};
		}
		// ==================== 优化后：从缓存表获取全球统计 ====================
		async function getGlobalStats() {
			// 先检查本地缓存
			const cached = getLocalCache(CACHE_KEYS.STATS);
			if (cached) {
				console.log('使用本地缓存的全球统计');
				statsCache = cached;
				statsCacheTime = Date.now();
				return cached;
			}
			
			if (!window.supabaseClient) {
				console.warn('Supabase未初始化');
				return null;
			}

			try {
				// 尝试从缓存表读取（优化后的方式）
				const [endingsRes, achievementsRes, difficultyRes] = await Promise.all([
					window.supabaseClient.from('stats_endings_cache').select('mode, ending_type, count'),
					window.supabaseClient.from('stats_achievements_cache').select('mode, achievement_name, count'),
					window.supabaseClient.from('stats_character_difficulty_cache').select('is_reversed, character_id, total_games, hard_games')
				]);
				
				// 检查缓存表是否存在且有数据
				const hasCache = !endingsRes.error && endingsRes.data && endingsRes.data.length > 0;
				
				if (hasCache) {
					// 使用缓存表数据
					const stats = {
						normal: { endings: {}, achievements: {}, totalGames: 0, characterEndings: {} },
						reversed: { endings: {}, achievements: {}, totalGames: 0, characterEndings: {} }
					};
					
					// 处理结局数据
					endingsRes.data.forEach(function(row) {
						stats[row.mode].endings[row.ending_type] = row.count;
						stats[row.mode].totalGames += row.count;
					});
					
					// 处理成就数据
					if (achievementsRes.data) {
						achievementsRes.data.forEach(function(row) {
							stats[row.mode].achievements[row.achievement_name] = row.count;
						});
					}
					
					// 处理角色难度数据
					if (difficultyRes.data) {
						difficultyRes.data.forEach(function(row) {
							var mode = row.is_reversed ? 'reversed' : 'normal';
							stats[mode].characterEndings[row.character_id] = {
								total: row.total_games,
								hard: row.hard_games
							};
						});
					}
					
					// 缓存结果
					statsCache = stats;
					statsCacheTime = Date.now();
					setLocalCache(CACHE_KEYS.STATS, stats);
					
					console.log('✅ 从缓存表加载统计完成');
					return stats;
				}
				
				// 缓存表不存在或为空，fallback 到原有逻辑
				console.log('缓存表为空，使用原有逻辑加载数据');
				return await getGlobalStatsFallback();
				
			} catch (e) {
				console.error('获取统计失败:', e);
				// 出错时尝试 fallback
				return await getGlobalStatsFallback();
			}
		}

		// 合并正位和逆位统计数据
		function mergeModeStats(stats) {
			const merged = {
				endings: {},
				achievements: {},
				totalGames: 0,
				characterEndings: {}
			};

			// 合并结局数据
			['normal', 'reversed'].forEach(mode => {
				if (stats[mode]) {
					merged.totalGames += stats[mode].totalGames || 0;

					// 合并结局计数
					Object.entries(stats[mode].endings || {}).forEach(([type, count]) => {
						merged.endings[type] = (merged.endings[type] || 0) + count;
					});

					// 合并成就计数
					Object.entries(stats[mode].achievements || {}).forEach(([name, count]) => {
						merged.achievements[name] = (merged.achievements[name] || 0) + count;
					});
				}
			});

			return merged;
		}

		// ★★★ 修改：添加uvCount参数用于成就达成率计算 ★★★
		function renderModeStats(mode, modeStats, endingContainer, achievementContainer, uvCount = 0) {
			if (!endingContainer || !achievementContainer) {
				console.warn('统计容器不存在');
				return;
			}

			const playerRecords = getPlayerAchievements();
			// 合并正位和逆位的玩家记录
			const playerEndingsNormal = playerRecords.endings.normal || new Set();
			const playerEndingsReversed = playerRecords.endings.reversed || new Set();
			const playerAchievementsNormal = playerRecords.achievements.normal || new Set();
			const playerAchievementsReversed = playerRecords.achievements.reversed || new Set();

			// 合并为一个Set
			const playerEndingsSet = new Set();
			const addToSet = (set, items) => {
				if (items instanceof Set) {
					items.forEach(item => set.add(item));
				} else if (Array.isArray(items)) {
					items.forEach(item => set.add(item));
				}
			};
			addToSet(playerEndingsSet, playerEndingsNormal);
			addToSet(playerEndingsSet, playerEndingsReversed);

			const playerAchievementsSet = new Set();
			addToSet(playerAchievementsSet, playerAchievementsNormal);
			addToSet(playerAchievementsSet, playerAchievementsReversed);

			const totalGames = modeStats.totalGames || 0;
			
			// ==================== 渲染结局统计（按完成率排序）====================
			// 统计合并后显示所有结局
			const endingsToShow = Object.entries(ENDING_NAMES);
			
			// 构建结局数据数组
			const endingEntries = endingsToShow.map(([type, name]) => {
				const count = modeStats.endings[type] || 0;
				const percent = totalGames > 0 ? (count / totalGames) * 100 : 0;
				const isAchieved = playerEndingsSet instanceof Set 
					? playerEndingsSet.has(type) 
					: (Array.isArray(playerEndingsSet) && playerEndingsSet.includes(type));
				return { type, name, count, percent, isAchieved };
			});
			
			// 按百分比从高到低排序
			endingEntries.sort((a, b) => b.percent - a.percent);
			
			// 分离已达成和未达成
			const achievedEndingsSorted = endingEntries.filter(e => e.isAchieved);
			const unachievedEndingsSorted = endingEntries.filter(e => !e.isAchieved);
			
			let achievedEndingsHtml = achievedEndingsSorted.map(e => {
				// ★★★ 修复：真实结局或<1%的结局都显示人数 ★★★
				const isTrueEnding = e.type === 'true_phd' || e.type === 'true_devotion' || e.type === 'true_life';
				const isLowPercent = e.percent < 1 && e.count > 0;
				const displayText = (isTrueEnding || isLowPercent)
					? `${e.name} <strong>${e.percent.toFixed(1)}% (${e.count}人)</strong>`
					: `${e.name} <strong>${e.percent.toFixed(1)}%</strong>`;
				return `
					<span class="stats-tag ending-tag"
						  onclick="showSingleEndingRequirement('${e.type}')"
						  style="cursor:pointer;">
						${displayText}
					</span>
				`;
			}).join('');

			let unachievedEndingsHtml = unachievedEndingsSorted.map(e => {
				// ★★★ 修复：真实结局或<1%的结局都显示人数 ★★★
				const isTrueEnding = e.type === 'true_phd' || e.type === 'true_devotion' || e.type === 'true_life';
				const isLowPercent = e.percent < 1 && e.count > 0;
				const displayText = (isTrueEnding || isLowPercent)
					? `${e.name} <strong>${e.percent.toFixed(1)}% (${e.count}人)</strong>`
					: `${e.name} <strong>${e.percent.toFixed(1)}%</strong>`;
				return `
					<span class="stats-tag ending-tag"
						  onclick="showSingleEndingRequirement('${e.type}')"
						  style="cursor:pointer;opacity:0.5;">
						${displayText}
					</span>
				`;
			}).join('');
			
			let endingHtml = '';
			if (achievedEndingsHtml) {
				endingHtml += `
					<div style="margin-bottom:8px;">
						<div style="font-size:0.7rem;color:var(--success-color);margin-bottom:4px;">✓ 玩家已达成结局（全球结局比率）</div>
						<div style="display:flex;flex-wrap:wrap;gap:4px;">${achievedEndingsHtml}</div>
					</div>`;
			}
			if (unachievedEndingsHtml) {
				endingHtml += `
					<div>
						<div style="font-size:0.7rem;color:var(--text-secondary);margin-bottom:4px;">○ 玩家未达成结局（全球结局比率）</div>
						<div style="display:flex;flex-wrap:wrap;gap:4px;">${unachievedEndingsHtml}</div>
					</div>`;
			}
			if (!endingHtml) {
				endingHtml = '<span style="color:var(--text-secondary);font-size:0.75rem;">暂无数据</span>';
			}
			endingContainer.innerHTML = endingHtml;
			
			// ==================== 渲染成就统计（按玩家达成率排序）====================
			// ★★★ 修改：使用UV（玩家人数）作为分母，而非总局数 ★★★
			const achievementDenominator = uvCount > 0 ? uvCount : totalGames;
			const achievementEntries = ALL_ACHIEVEMENTS.map(ach => {
				const count = modeStats.achievements[ach] || 0;
				const percent = achievementDenominator > 0 ? (count / achievementDenominator) * 100 : 0;
				const isAchieved = playerAchievementsSet instanceof Set 
					? playerAchievementsSet.has(ach) 
					: (Array.isArray(playerAchievementsSet) && playerAchievementsSet.includes(ach));
				return { ach, count, percent, isAchieved };
			});
			
			// 按百分比从高到低排序
			achievementEntries.sort((a, b) => b.percent - a.percent);
			
			const achievedAchSorted = achievementEntries.filter(a => a.isAchieved);
			const unachievedAchSorted = achievementEntries.filter(a => !a.isAchieved);
			
			let achievedAchHtml = achievedAchSorted.map(a => `
				<span class="stats-tag" 
					  onclick="showSingleAchievementRequirement('${a.ach}')" 
					  style="cursor:pointer;">
					${a.ach} <strong>${a.percent.toFixed(1)}%</strong>
				</span>
			`).join('');
			
			let unachievedAchHtml = unachievedAchSorted.map(a => `
				<span class="stats-tag" 
					  onclick="showSingleAchievementRequirement('${a.ach}')" 
					  style="cursor:pointer;opacity:0.5;">
					${a.ach} <strong>${a.percent.toFixed(1)}%</strong>
				</span>
			`).join('');
			
			let achievementHtml = '';
			if (achievedAchHtml) {
				achievementHtml += `
					<div style="margin-bottom:8px;">
						<div style="font-size:0.7rem;color:var(--success-color);margin-bottom:4px;">✓ 玩家已达成成就（全球玩家达成率）</div>
						<div style="display:flex;flex-wrap:wrap;gap:4px;">${achievedAchHtml}</div>
					</div>`;
			}
			if (unachievedAchHtml) {
				achievementHtml += `
					<div>
						<div style="font-size:0.7rem;color:var(--text-secondary);margin-bottom:4px;">○ 玩家未达成成就（全球玩家达成率）</div>
						<div style="display:flex;flex-wrap:wrap;gap:4px;">${unachievedAchHtml}</div>
					</div>`;
			}
			if (!achievementHtml) {
				achievementHtml = '<span style="color:var(--text-secondary);font-size:0.75rem;">暂无数据</span>';
			}
			achievementContainer.innerHTML = achievementHtml;
		}

		// ==================== 简化后：直接使用预计算的难度数据 ====================
		function calculateCharacterDifficulty(stats) {
			const difficultyData = {};
			const allCharacterRates = [];
			
			// 所有角色ID（包括真·大多数）
			const allCharIds = ['normal', 'genius', 'social', 'rich', 'teacher-child', 'chosen'];
			
			// 收集所有角色的博士通关率
			allCharIds.forEach(charId => {
				// 正位数据
				const normalData = stats.normal.characterEndings[charId] || { total: 0, hard: 0 };
				const normalRate = normalData.total >= 5 ? normalData.hard / normalData.total : null;
				allCharacterRates.push({
					id: charId,
					isReversed: false,
					rate: normalRate,
					total: normalData.total,
					hard: normalData.hard
				});
				
				// 逆位数据
				const reversedData = stats.reversed.characterEndings[charId] || { total: 0, hard: 0 };
				const reversedRate = reversedData.total >= 5 ? reversedData.hard / reversedData.total : null;
				allCharacterRates.push({
					id: charId,
					isReversed: true,
					rate: reversedRate,
					total: reversedData.total,
					hard: reversedData.hard
				});
			});
			
			// 过滤有效数据并排序
			const validRates = allCharacterRates.filter(c => c.rate !== null);
			validRates.sort((a, b) => b.rate - a.rate); // 博士率高的排前面（更简单）
			
			// 计算难度星级
			validRates.forEach((char, index) => {
				const rank = index + 1;
				const difficulty = Math.ceil(rank * 12 / validRates.length);
				const key = `${char.id}_${char.isReversed ? 'reversed' : 'normal'}`;
				difficultyData[key] = {
					stars: Math.min(12, Math.max(1, difficulty)),
					rate: char.rate,
					total: char.total,
					hard: char.hard,
					rank: rank,
					totalRanked: validRates.length
				};
			});
			
			// 处理数据不足的角色
			allCharacterRates.forEach(char => {
				const key = `${char.id}_${char.isReversed ? 'reversed' : 'normal'}`;
				if (!difficultyData[key]) {
					difficultyData[key] = {
						stars: null,
						rate: null,
						total: char.total,
						hard: char.hard,
						rank: null,
						totalRanked: validRates.length
					};
				}
			});
			
			// 真·大多数固定12星
			const trueNormalData = stats.normal.characterEndings['true-normal'] || { total: 0, hard: 0 };
			difficultyData['true-normal_normal'] = {
				stars: 12,
				rate: trueNormalData.total >= 5 ? trueNormalData.hard / trueNormalData.total : null,
				total: trueNormalData.total,
				hard: trueNormalData.hard,
				rank: 0,
				totalRanked: validRates.length,
				isFixed: true
			};
			
			return difficultyData;
		}

        function renderDifficultyStars(stars) {
            if (stars === null) {
                return '<span class="no-data">数据不足</span>';
            }

            // 内部值1-12对应显示0.5-6颗星
            // stars=1 → 0.5星, stars=2 → 1星, ..., stars=12 → 6星
            let html = '';
            const fullStars = Math.floor(stars / 2);
            const halfStar = stars % 2 === 1;
            const emptyStars = 6 - fullStars - (halfStar ? 1 : 0);

            for (let i = 0; i < fullStars; i++) {
                html += '<i class="fas fa-star"></i>';
            }
            if (halfStar) {
                // 使用半星图标
                html += '<i class="fas fa-star-half-alt"></i>';
            }
            for (let i = 0; i < emptyStars; i++) {
                html += '<i class="far fa-star"></i>';
            }

            return html;
        }

        function getDifficultyBadge(stars) {
            if (stars === null) return '<span class="difficulty-badge unknown">?</span>';
            if (stars >= 11) return '<span class="difficulty-badge legendary">传说</span>';
            if (stars >= 9) return '<span class="difficulty-badge nightmare">噩梦</span>';
            if (stars >= 7) return '<span class="difficulty-badge expert">专家</span>';
            if (stars >= 5) return '<span class="difficulty-badge hard">困难</span>';
            if (stars >= 3) return '<span class="difficulty-badge normal">普通</span>';
            return '<span class="difficulty-badge easy">简单</span>';
        }

		// ★★★ 新增：存储全局UV计数，用于成就达成率计算 ★★★
		let globalUVCount = 0;

		async function loadGlobalStatsDisplay() {
			const section = document.getElementById('stats-section');
			const loading = document.getElementById('stats-loading');
			const content = document.getElementById('stats-content');

			section.style.display = 'block';
			loading.style.display = 'block';
			content.style.display = 'none';

			// 第1步：快速加载总数
			Promise.all([
				getVisitStats(),
				getTotalGamesCount()
			]).then(([visitStats, totalGames]) => {
				const pvEl = document.getElementById('busuanzi_value_site_pv');
				const uvEl = document.getElementById('busuanzi_value_site_uv');
				const gamesEl = document.getElementById('total-games-value');

				if (pvEl) pvEl.textContent = visitStats.pv || 0;
				if (uvEl) uvEl.textContent = visitStats.uv || 0;
				if (gamesEl) gamesEl.textContent = totalGames;

				// ★★★ 存储UV用于成就统计 ★★★
				globalUVCount = visitStats.uv || 0;
			}).catch(e => {
				console.error('加载访问统计失败:', e);
			});

			// 第2步：加载详细统计
			setTimeout(async () => {
				try {
					if (!window.supabaseClient) {
						loading.innerHTML = `
							<span style="color:var(--text-secondary);font-size:0.8rem;">📊 统计服务暂不可用</span>
							<button class="btn btn-info" style="margin-left:10px;padding:3px 8px;font-size:0.7rem;" onclick="retryLoadStats()">
								<i class="fas fa-redo"></i> 重试
							</button>
						`;
						return;
					}

					loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在加载详细统计...';

					const stats = await getGlobalStats();

					if (!stats) {
						// ★★★ 加载失败时显示重试按钮 ★★★
						loading.innerHTML = `
							<span style="color:var(--warning-color);font-size:0.8rem;">⚠️ 统计加载失败</span>
							<button class="btn btn-info" style="margin-left:10px;padding:3px 8px;font-size:0.7rem;" onclick="retryLoadStats()">
								<i class="fas fa-redo"></i> 重试
							</button>
						`;
						return;
					}

					characterDifficultyData = calculateCharacterDifficulty(stats);

					loading.style.display = 'none';
					content.style.display = 'block';

					// ★★★ 修改：合并正位和逆位统计 ★★★
					const mergedStats = mergeModeStats(stats);

					// 使用normal容器显示合并后的数据
					const normalEndingEl = document.getElementById('normal-ending-stats');
					const normalAchEl = document.getElementById('normal-achievement-stats');

					if (normalEndingEl && normalAchEl) {
						renderModeStats('combined', mergedStats, normalEndingEl, normalAchEl, globalUVCount);
					}

					// 显示normal区域，隐藏reversed区域
					const normalSection = document.getElementById('normal-stats-section');
					const reversedSection = document.getElementById('reversed-stats-section');
					if (normalSection) normalSection.style.display = 'block';
					if (reversedSection) reversedSection.style.display = 'none';

					renderCharacterGrid();
					
					// 角色记录异步加载
					getGlobalCharacterRecords().then(() => {
						renderCharacterGrid();
						console.log('✅ 全部加载完成');
					}).catch(e => {
						console.error('加载角色记录失败:', e);
					});
					
				} catch (e) {
					console.error('加载统计失败:', e);
					loading.innerHTML = `
						<span style="color:var(--warning-color);font-size:0.8rem;">⚠️ 加载失败: ${e.message || '未知错误'}</span>
						<button class="btn btn-info" style="margin-left:10px;padding:3px 8px;font-size:0.7rem;" onclick="retryLoadStats()">
							<i class="fas fa-redo"></i> 重试
						</button>
					`;
				}
			}, 100);
		}

		// ★★★ 新增：重试加载统计（清除缓存后重新加载）★★★
		function retryLoadStats() {
			console.log('手动重试加载统计...');
			// 清除所有统计缓存
			clearAllStatsCache();
			// 重置内存缓存
			statsCache = null;
			statsCacheTime = 0;
			visitStatsCache = null;
			visitStatsCacheTime = 0;
			globalCharacterRecords = null;
			globalCharacterRecordsTime = 0;
			// 重新加载
			loadGlobalStatsDisplay();
		}

		// ==================== 玩家个人统计数据 ====================
		// 获取玩家个人统计数据（总局数、通关数、总成就数、总通关角色数）
		function getPlayerStats() {
			const playerRecords = getPlayerAchievements();
			const phdUnlocks = getCharacterPhdUnlocks();

			// 计算总局数（从本地存储获取）
			const gamesPlayedKey = 'graduateSimulator_gamesPlayed';
			let totalGames = 0;
			try {
				totalGames = parseInt(localStorage.getItem(gamesPlayedKey) || '0', 10);
			} catch (e) {
				totalGames = 0;
			}

			// ★★★ 修复：计算通关数（分开统计正位和逆位的好结局数量）★★★
			const goodEndings = ['master', 'excellent_master', 'phd', 'excellent_phd', 'green_pepper', 'become_advisor', 'academic_star', 'future_academician', 'nobel_start', 'true_phd', 'true_devotion', 'true_life', 'true_nobel_start'];
			let clearCount = 0;
			const normalEndings = playerRecords.endings.normal || new Set();
			const reversedEndings = playerRecords.endings.reversed || new Set();

			// 分别统计正位和逆位的好结局数量
			goodEndings.forEach(ending => {
				if (normalEndings instanceof Set) {
					if (normalEndings.has(ending)) clearCount++;
				} else if (Array.isArray(normalEndings)) {
					if (normalEndings.includes(ending)) clearCount++;
				}
				if (reversedEndings instanceof Set) {
					if (reversedEndings.has(ending)) clearCount++;
				} else if (Array.isArray(reversedEndings)) {
					if (reversedEndings.includes(ending)) clearCount++;
				}
			});

			// 计算总成就数
			const normalAchievements = playerRecords.achievements.normal || new Set();
			const reversedAchievements = playerRecords.achievements.reversed || new Set();
			const allAchievements = new Set();
			if (normalAchievements instanceof Set) {
				normalAchievements.forEach(a => allAchievements.add(a));
			} else if (Array.isArray(normalAchievements)) {
				normalAchievements.forEach(a => allAchievements.add(a));
			}
			if (reversedAchievements instanceof Set) {
				reversedAchievements.forEach(a => allAchievements.add(a));
			} else if (Array.isArray(reversedAchievements)) {
				reversedAchievements.forEach(a => allAchievements.add(a));
			}
			const totalAchievements = allAchievements.size;

			// ★★★ 修复：计算总通关角色数（正位6个+逆位6个+真大多数1个=13个）★★★
			const totalClearedCharacters = getTotalClearedCharacterSlots();

			// 获取游戏总成就数
			const maxAchievements = (typeof ALL_ACHIEVEMENTS !== 'undefined') ? ALL_ACHIEVEMENTS.length : 67;

			return {
				totalGames,
				clearCount,
				totalAchievements,
				totalClearedCharacters,
				maxAchievements
			};
		}

		// 增加游戏局数计数
		function incrementGamesPlayed() {
			const gamesPlayedKey = 'graduateSimulator_gamesPlayed';
			try {
				let count = parseInt(localStorage.getItem(gamesPlayedKey) || '0', 10);
				count++;
				localStorage.setItem(gamesPlayedKey, count.toString());
			} catch (e) {
				console.error('增加游戏局数失败:', e);
			}
		}

		// ★★★ 新增：迁移老玩家数据，根据已有结局数统计总局数 ★★★
		function migrateGamesPlayedCount() {
			const gamesPlayedKey = 'graduateSimulator_gamesPlayed';
			const migrationKey = 'graduateSimulator_gamesPlayed_migrated';

			try {
				// 检查是否已经迁移过
				if (localStorage.getItem(migrationKey)) {
					return;
				}

				// 检查当前总局数
				const currentCount = parseInt(localStorage.getItem(gamesPlayedKey) || '0', 10);
				if (currentCount > 0) {
					// 已有数据，标记已迁移
					localStorage.setItem(migrationKey, 'true');
					return;
				}

				// 获取已有的游戏记录
				const playerRecords = getPlayerAchievements();

				// 统计所有结局数量（正位+逆位）= 总局数
				let totalGames = 0;
				const normalEndings = playerRecords.endings.normal;
				const reversedEndings = playerRecords.endings.reversed;

				if (normalEndings instanceof Set) {
					totalGames += normalEndings.size;
				} else if (Array.isArray(normalEndings)) {
					totalGames += normalEndings.length;
				}
				if (reversedEndings instanceof Set) {
					totalGames += reversedEndings.size;
				} else if (Array.isArray(reversedEndings)) {
					totalGames += reversedEndings.length;
				}

				if (totalGames > 0) {
					localStorage.setItem(gamesPlayedKey, totalGames.toString());
					console.log(`📊 迁移老玩家数据：总局数为 ${totalGames}（正位+逆位结局数）`);
				}

				// 标记已迁移
				localStorage.setItem(migrationKey, 'true');

			} catch (e) {
				console.error('迁移游戏局数失败:', e);
			}
		}

		// 生成玩家统计HTML（用于多处显示）
		function renderPlayerStatsHTML(style = 'default') {
			const stats = getPlayerStats();

			if (style === 'compact') {
				// 紧凑样式（已弃用）
				return `
					<div class="player-stats-compact">
						<span class="ps-item">✅ ${stats.clearCount}/${stats.totalGames}通关</span>
						<span class="ps-item">🏆 ${stats.totalAchievements}/${stats.maxAchievements}成就</span>
						<span class="ps-item">👤 ${stats.totalClearedCharacters}/13角色</span>
					</div>
				`;
			} else if (style === 'poster') {
				// 海报样式（用于分享页毕业纪念卡内）
				return `
					<div class="player-stats-poster">
						<div class="psp-row">
							<span class="psp-item">✅ ${stats.clearCount}/${stats.totalGames}通关</span>
							<span class="psp-item">🏆 ${stats.totalAchievements}/${stats.maxAchievements}成就</span>
							<span class="psp-item">👤 ${stats.totalClearedCharacters}/13角色</span>
						</div>
					</div>
				`;
			} else if (style === 'banner') {
				// 横幅样式（已弃用）
				return `
					<div class="player-stats-banner">
						<div class="psb-title">📊 我的游戏记录</div>
						<div class="psb-items">
							<div class="psb-item">
								<div class="psb-value">${stats.clearCount}/${stats.totalGames}</div>
								<div class="psb-label">通关数</div>
							</div>
							<div class="psb-item">
								<div class="psb-value">${stats.totalAchievements}/${stats.maxAchievements}</div>
								<div class="psb-label">总成就</div>
							</div>
							<div class="psb-item">
								<div class="psb-value">${stats.totalClearedCharacters}/13</div>
								<div class="psb-label">通关角色</div>
							</div>
						</div>
					</div>
				`;
			} else {
				// 默认样式（用于开始页面和结局弹窗）- 淡金色真大多数配色
				// ★★★ 新增：获取当前局的SAN上限和难度分 ★★★
				const currentSanMax = (typeof gameState !== 'undefined' && gameState.sanMax) ? gameState.sanMax : 0;
				const currentDifficultyPoints = (typeof gameState !== 'undefined' && gameState.difficultyPoints) ? gameState.difficultyPoints : 0;

				return `
					<div class="player-stats-box">
						<div class="ps-row">
							<span class="ps-item"><i class="fas fa-check-circle"></i> 通关数 <strong>${stats.clearCount}/${stats.totalGames}</strong></span>
							<span class="ps-item"><i class="fas fa-trophy"></i> 总成就 <strong>${stats.totalAchievements}/${stats.maxAchievements}</strong></span>
							<span class="ps-item"><i class="fas fa-user-check"></i> 通关角色 <strong>${stats.totalClearedCharacters}/13</strong></span>
						</div>
						<div class="ps-row ps-row-game">
							<span class="ps-item"><i class="fas fa-heart"></i> SAN上限 <strong>${currentSanMax}</strong></span>
							<span class="ps-item ${currentDifficultyPoints > 0 ? 'ps-difficulty' : ''}"><i class="fas fa-skull"></i> 难度分 <strong>${currentDifficultyPoints > 0 ? '+' + currentDifficultyPoints : '0'}</strong></span>
						</div>
					</div>
				`;
			}
		}

		// ★★★ 新增：仅更新首页顶部的总数统计（不触发懒加载部分）★★★
		async function updateHeaderTotalStats() {
			try {
				// 获取总访问统计
				const visitStats = await getVisitStats();
				const totalGames = await getTotalGamesCount();

				const pvEl = document.getElementById('busuanzi_value_site_pv');
				const uvEl = document.getElementById('busuanzi_value_site_uv');
				const gamesEl = document.getElementById('total-games-value');

				if (pvEl) pvEl.textContent = visitStats.pv || 0;
				if (uvEl) uvEl.textContent = visitStats.uv || 0;
				if (gamesEl) gamesEl.textContent = totalGames || 0;

				console.log('✅ 首页顶部总数统计已更新');
			} catch (e) {
				console.error('更新首页统计失败:', e);
				// 失败时显示0而不是-
				const pvEl = document.getElementById('busuanzi_value_site_pv');
				const uvEl = document.getElementById('busuanzi_value_site_uv');
				const gamesEl = document.getElementById('total-games-value');
				if (pvEl) pvEl.textContent = '0';
				if (uvEl) uvEl.textContent = '0';
				if (gamesEl) gamesEl.textContent = '0';
			}
		}

		// ==================== 全局函数暴露（供onclick和其他模块调用）====================
		window.initStats = initStats;
		window.recordVisit = recordVisit;
		window.recordEnding = recordEnding;
		window.recordAchievements = recordAchievements;
		window.getGlobalStats = getGlobalStats;
		window.loadGlobalStatsDisplay = loadGlobalStatsDisplay;
		window.updateHeaderTotalStats = updateHeaderTotalStats;
		window.retryLoadStats = retryLoadStats;
		window.getPlayerStats = getPlayerStats;
		window.renderPlayerStatsHTML = renderPlayerStatsHTML;
		window.getPlayerAchievements = getPlayerAchievements;
		window.savePlayerRecord = savePlayerRecord;
		window.incrementGamesPlayed = incrementGamesPlayed;
		window.migrateGamesPlayedCount = migrateGamesPlayedCount;
		window.isTrueNormalUnlocked = isTrueNormalUnlocked;
		window.getTrueNormalUnlockProgress = getTrueNormalUnlockProgress;
		window.recordCharacterPhdUnlock = recordCharacterPhdUnlock;
		window.getCharacterPhdUnlocks = getCharacterPhdUnlocks;
		window.getUniqueCharacterPhdCount = getUniqueCharacterPhdCount;
		window.renderDifficultyStars = renderDifficultyStars;
		window.getDifficultyBadge = getDifficultyBadge;
		window.calculateCharacterDifficulty = calculateCharacterDifficulty;  // ★★★ 新增：暴露难度计算函数 ★★★