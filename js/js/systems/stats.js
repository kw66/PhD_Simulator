        // ==================== Supabase 统计系统 ====================
		const SUPABASE_URL = 'https://ypefmpeekfucmarbbdov.supabase.co';
		const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZWZtcGVla2Z1Y21hcmJiZG92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5NTA2NTYsImV4cCI6MjA4MTUyNjY1Nn0.XTOQNFuuwfu9nwDTnO9-NEqlzZnzdCVnEmYEJh0rXf8';
        //const SUPABASE_URL = 'https://orzejzmyzugxtyrzfcse.supabase.co';
        //const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yemVqem15enVneHR5cnpmY3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzMDYyMTUsImV4cCI6MjA4MDg4MjIxNX0.lx9W0v9KpRPmQR0kdxCSWVks_az5rLCr7D3JI2efeM4';

        //let supabase = null;
        let statsInitialized = false;
        let statsCache = null;
        let statsCacheTime = 0;
        let visitStatsCache = null;
        let visitStatsCacheTime = 0;
        const CACHE_DURATION = 10 * 60 * 1000;

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
			const unlocks = getCharacterPhdUnlocks();
			const mode = isReversed ? 'reversed' : 'normal';
			unlocks[mode][characterId] = true;
			localStorage.setItem(PHD_UNLOCK_KEY, JSON.stringify(unlocks));
			console.log(`✅ 记录博士通关: ${characterId} (${mode})`);
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
				
				supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
				statsInitialized = true;
				console.log('✅ Supabase 初始化成功');
				recordVisit();
				startOnlineTracking();  // ★ 启动
				
			} catch (e) {
				console.error('❌ 初始化失败:', e);
				supabase = null;
			}
		}

		async function recordVisit() {
			if (!supabase) return;
			try {
				// 记录 PV（每次访问都记录）
				await supabase.from('site_visits').insert({ type: 'pv' });
				
				// ★★★ 修复：每天每个用户只记录一次 UV ★★★
				const todayStr = getTodayDateString();
				const visitorKey = 'graduate_simulator_visitor';
				const lastUvDateKey = 'graduate_simulator_last_uv_date';
				
				const isNewVisitor = !localStorage.getItem(visitorKey);
				const lastUvDate = localStorage.getItem(lastUvDateKey);
				const isNewDay = lastUvDate !== todayStr;
				
				// 新访客 或 新的一天（老访客今天第一次访问）都记录 UV
				if (isNewVisitor || isNewDay) {
					await supabase.from('site_visits').insert({ type: 'uv' });
					localStorage.setItem(visitorKey, 'true');
					localStorage.setItem(lastUvDateKey, todayStr);
					console.log(isNewVisitor ? '✅ 新访客已记录' : '✅ 今日访客已记录');
				}
			} catch (e) {
				console.error('记录访问失败:', e);
			}
		}

		async function getVisitStats() {
			// 先检查本地缓存
			const cached = getLocalCache(CACHE_KEYS.VISIT);
			if (cached) {
				console.log('使用本地缓存的访问统计');
				visitStatsCache = cached;
				visitStatsCacheTime = Date.now();
				return cached;
			}
			
			if (!supabase) return { pv: 0, uv: 0 };
			
			try {
				const { count: pvCount, error: pvError } = await supabase
					.from('site_visits')
					.select('*', { count: 'exact', head: true })
					.eq('type', 'pv');
				
				if (pvError) throw pvError;
				
				const { count: uvCount, error: uvError } = await supabase
					.from('site_visits')
					.select('*', { count: 'exact', head: true })
					.eq('type', 'uv');
					
				if (uvError) throw uvError;
				
				const result = { pv: pvCount || 0, uv: uvCount || 0 };
				
				// ★★★ 成功后才缓存 ★★★
				visitStatsCache = result;
				visitStatsCacheTime = Date.now();
				setLocalCache(CACHE_KEYS.VISIT, result);
				
				return result;
			} catch (e) {
				console.error('获取访问统计失败:', e);
				// 失败时返回内存缓存或默认值，不存储缓存
				return visitStatsCache || { pv: 0, uv: 0 };
			}
		}



		async function recordEnding(endingType, endingTitle) {
			// ★★★ 移除数据验证，直接上传 ★★★
			
			// 计算成就数量
			const achievements = collectAchievements(endingType);
			const achievementCount = achievements.length;
			
			// 更新本地记录
			updateLocalMeta(
				gameState.character, 
				gameState.isReversed, 
				gameState.totalScore, 
				gameState.totalCitations, 
				achievementCount,
				endingType,  // ★★★ 新增参数 ★★★
			);
			
			if (!supabase) return;
			
			try {
				const { error } = await supabase.from('game_endings').insert({
					ending_type: endingType,
					ending_title: endingTitle,
					character: gameState.character,
					is_reversed: gameState.isReversed,
					total_months: gameState.totalMonths,
					total_score: gameState.totalScore,
					paper_a: gameState.paperA,
					paper_b: gameState.paperB,
					paper_c: gameState.paperC,
					total_citations: gameState.totalCitations,
					achievements_count: achievementCount
				});
				
				if (error) throw error;
				console.log('✅ 结局已记录:', endingTitle);
				
				// 清除缓存
				globalCharacterRecords = null;
			} catch (e) {
				console.error('❌ 记录结局失败:', e);
			}
		}

        async function recordAchievements(achievements) {
            if (!supabase || achievements.length === 0) return;
            try {
                const records = achievements.map(ach => ({
                    achievement_name: ach,
                    character: gameState.character,
                    is_reversed: gameState.isReversed
                }));
                
                const { error } = await supabase.from('game_achievements').insert(records);
                
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
			
			if (!supabase) return 0;
			
			try {
				const { count, error } = await supabase
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
			
			if (!supabase) {
				console.warn('Supabase未初始化');
				return null;
			}
			
			try {
				// 尝试从缓存表读取（优化后的方式）
				const [endingsRes, achievementsRes, difficultyRes] = await Promise.all([
					supabase.from('stats_endings_cache').select('*'),
					supabase.from('stats_achievements_cache').select('*'),
					supabase.from('stats_character_difficulty_cache').select('*')
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

		function renderModeStats(mode, modeStats, endingContainer, achievementContainer) {
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
				// 真实结局额外显示数量
				const isTrueEnding = e.type === 'true_phd' || e.type === 'true_devotion' || e.type === 'true_life';
				const displayText = isTrueEnding 
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
				const isTrueEnding = e.type === 'true_phd' || e.type === 'true_devotion' || e.type === 'true_life';
				const displayText = isTrueEnding 
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
			
			// ==================== 渲染成就统计（按完成率排序）====================
			const achievementEntries = ALL_ACHIEVEMENTS.map(ach => {
				const count = modeStats.achievements[ach] || 0;
				const percent = totalGames > 0 ? (count / totalGames) * 100 : 0;
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
			}).catch(e => {
				console.error('加载访问统计失败:', e);
			});
			
			// 第2步：加载详细统计
			setTimeout(async () => {
				try {
					if (!supabase) {
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
						renderModeStats('combined', mergedStats, normalEndingEl, normalAchEl);
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


