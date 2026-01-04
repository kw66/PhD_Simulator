        // ==================== 模式切换 ====================
		function switchMode(reversed) {
			isReversedMode = reversed;
			isTrueNormalMode = false;  // ★★★ 切换模式时重置真·大多数状态 ★★★

            const normalBtn = document.getElementById('normal-mode-btn');
            const reversedBtn = document.getElementById('reversed-mode-btn');
            const modeDesc = document.getElementById('mode-description');
            const gameIntro = document.getElementById('game-intro');
            const selectionTitle = document.getElementById('selection-title');

            // ★★★ 修复：添加null检查 ★★★
            if (normalBtn) normalBtn.classList.toggle('active', !reversed);
            if (reversedBtn) {
                reversedBtn.classList.toggle('active', reversed);
            }

            // ★★★ 移除：不再切换主题，统一使用正位主题 ★★★
            // document.body.classList.toggle('reversed-theme', reversed);
            document.querySelectorAll('.character-card').forEach(card => card.classList.remove('selected'));

            if (reversed) {
                if (modeDesc) modeDesc.innerHTML = '💀 逆位模式，循规蹈矩？不免太过无趣！';
                if (selectionTitle) selectionTitle.innerHTML = '<i class="fas fa-moon"></i> 选择你的逆位角色';
                if (gameIntro) gameIntro.innerHTML = `
                    <p>🌑 <strong>逆位模式已开启！</strong>每个角色都有独特的逆位效果，规则将被颠覆。</p>
                    <p>🎯 <strong>游戏目标</strong>：毕业所需科研分由导师决定（入学时选择），硕士3年，博士5年</p>
                    <p>📝 <strong>论文科研分</strong>：C=1分，B=2分，A=4分，子刊=10分，Nature=25分</p>
                    <p>📈 <strong>论文槽升级</strong>：发表A类论文后，槽位可升级为期刊槽（可投Nature系列）</p>
                    <p>💡 <strong>游戏提示</strong>：先专注自己的论文，再完成关系网的任务。属性≥6可解锁更多选项</p>
                    <p>💀 <strong>挑战自我</strong>：逆位角色的转博觉醒效果完全不同，属性变化规则可能被颠覆！</p>
                `;
            } else {
                if (modeDesc) modeDesc.innerHTML = '📚 经典模式，体验标准的研究生生涯';
                if (selectionTitle) selectionTitle.innerHTML = '<i class="fas fa-users"></i> 选择你的角色';
                if (gameIntro) gameIntro.innerHTML = `
                    <p>📚 <strong>欢迎来到研究生模拟器！</strong>体验研究生生涯，平衡科研、生活和人际关系，努力发表论文，最终顺利毕业。</p>
                    <p>🎯 <strong>游戏目标</strong>：毕业所需科研分由导师决定（入学时选择），硕士3年，博士5年</p>
                    <p>📝 <strong>论文科研分</strong>：C=1分，B=2分，A=4分，子刊=10分，Nature=25分</p>
                    <p>📈 <strong>论文槽升级</strong>：发表A类论文后，槽位可升级为期刊槽（可投Nature系列）</p>
                    <p>💡 <strong>游戏提示</strong>：先专注自己的论文，再完成关系网的任务。属性≥6可解锁更多选项</p>
                    <p>⚠️ <strong>注意</strong>：保持SAN值、导师好感度和金钱为正数，否则将触发不良结局！</p>
                `;
            }
            
            selectedCharacter = null;
            document.getElementById('start-btn').disabled = true;
			// ★★★ 修改：统计已合并，不再需要切换显示 ★★★
			// const normalSection = document.getElementById('normal-stats-section');
			// const reversedSection = document.getElementById('reversed-stats-section');
			// if (normalSection && reversedSection) {
			// 	normalSection.style.display = reversed ? 'none' : 'block';
			// 	reversedSection.style.display = reversed ? 'block' : 'none';
			// }

            renderCharacterGrid();
        }

        // ==================== 初始化 ====================
		function init() {
			// 初始化折叠状态
			initCollapseStates();
			initStartSectionStates();

			renderCharacterGrid();
			document.getElementById('start-btn').addEventListener('click', startGame);

			initStats();

			// ★★★ 新增：独立加载角色数据（与全球统计区解耦）★★★
			// 并行加载：角色全球记录 + 全球统计（用于难度计算）
			const loadCharacterRecords = typeof getGlobalCharacterRecords === 'function'
				? getGlobalCharacterRecords()
				: Promise.resolve(null);

			const loadGlobalStatsForDifficulty = typeof getGlobalStats === 'function'
				? getGlobalStats()
				: Promise.resolve(null);

			Promise.all([loadCharacterRecords, loadGlobalStatsForDifficulty])
				.then(([records, stats]) => {
					let needRerender = false;

					if (records) {
						console.log('✅ 角色全球记录已加载');
						needRerender = true;
					}

					if (stats && typeof calculateCharacterDifficulty === 'function') {
						characterDifficultyData = calculateCharacterDifficulty(stats);
						console.log('✅ 角色难度数据已计算');
						needRerender = true;
					}

					if (needRerender) {
						renderCharacterGrid();
					}
				})
				.catch(e => {
					console.warn('加载角色数据失败:', e);
				});

			// 启动在线追踪（在 online.js 加载后调用）
			if (typeof startOnlineTracking === 'function') {
				startOnlineTracking();
			}

			// 加载今日统计和在线人数
			if (typeof updateAllStatsDisplay === 'function') {
				updateAllStatsDisplay();
			}

			// ★★★ 新增：加载首页顶部总数统计（不等待懒加载）★★★
			if (typeof updateHeaderTotalStats === 'function') {
				updateHeaderTotalStats();
			}

			setTimeout(() => {
				const messageSection = document.getElementById('message-section');
				if (messageSection) {
					messageSection.style.display = 'block';
					if (typeof initMessageBoard === 'function') {
						initMessageBoard();
					}
				}
			}, 500);

			// 应用保存的开始页面折叠状态
			applyStartSectionStates();
		}
				




		// ==================== 3. 修改renderCharacterGrid添加折叠功能 ====================
		// 点击解锁栏符文，选中角色并更新预览
		function selectCharacterFromRune(charId, isReversedSide) {
			// ★★★ 修复：点击大多数角色正位符文时，关闭真大多数模式（只更新状态，不重渲染）★★★
			if (charId === 'normal' && !isReversedSide && isTrueNormalMode) {
				isTrueNormalMode = false;
				// 只更新中心核心按钮状态，不调用renderCharacterGrid()
				const centerCore = document.querySelector('.center-core');
				if (centerCore) {
					centerCore.classList.remove('active');
				}
			}

			// 如果需要切换模式
			if (isReversedSide !== isReversedMode) {
				switchMode(isReversedSide);
				setTimeout(() => {
					selectCharacter(charId);
					updateCharacterPreview(charId, isReversedSide);
					updateRuneSelection(charId, isReversedSide);
				}, 100);
			} else {
				selectCharacter(charId);
				updateCharacterPreview(charId, isReversedSide);
				updateRuneSelection(charId, isReversedSide);
			}
		}

		// 更新符文选中状态
		function updateRuneSelection(charId, isReversedSide) {
			document.querySelectorAll('.constellation-rune').forEach(rune => {
				rune.classList.remove('selected');
			});
			const targetRune = document.querySelector(`.constellation-rune[data-char="${charId}"][data-reversed="${isReversedSide}"]`);
			if (targetRune) {
				targetRune.classList.add('selected');
			}
		}

		// 更新右侧角色预览面板
		function updateCharacterPreview(charId, isReversedSide, isLocked = false) {
			const previewContainer = document.getElementById('selected-char-preview');
			if (!previewContainer) return;

			// 显示锁定状态
			if (isLocked) {
				previewContainer.innerHTML = `
					<div class="preview-card-placeholder">
						<div class="placeholder-icon">🔒</div>
						<div class="placeholder-text">角色未解锁</div>
						<div style="font-size:0.7rem;color:var(--text-secondary);margin-top:8px;">完成博士毕业以解锁此角色</div>
					</div>
				`;
				return;
			}

			const char = characters.find(c => c.id === charId);
			if (!char) return;

			const trueNormalUnlocked = isTrueNormalUnlocked();
			const isTrueNormalAvailable = charId === 'normal' && !isReversedSide && trueNormalUnlocked && isTrueNormalMode;

			let displayIcon, displayName, displayDesc, displayBonus, displayAwaken;
			let statsCharId = charId;
			let statsIsReversed = isReversedSide;

			if (isTrueNormalAvailable) {
				displayIcon = '<span class="gold-icon">👤</span>';
				displayName = '真·大多数';
				displayDesc = '经历过所有角色的洗礼，回归本真';
				displayBonus = '无特殊能力，一切靠自己';
				displayAwaken = { icon: '✨', name: '往昔荣光', desc: '成就币翻倍' };
				statsCharId = 'true-normal';
				statsIsReversed = false;
			} else if (isReversedSide && char.reversed) {
				displayIcon = char.reversed.icon;
				displayName = char.reversed.name;
				displayDesc = char.reversed.desc;
				displayBonus = char.reversed.bonus;
				displayAwaken = {
					icon: char.reversed.awakenIcon,
					name: char.reversed.awakenName,
					desc: char.reversed.awakenDesc
				};
			} else {
				displayIcon = char.icon;
				displayName = char.name;
				displayDesc = char.desc;
				displayBonus = char.bonus;
				displayAwaken = {
					icon: char.awakenIcon,
					name: char.awakenName,
					desc: char.awakenDesc
				};
			}

			// 获取难度数据
			const diffKey = `${statsCharId}_${statsIsReversed ? 'reversed' : 'normal'}`;
			const diffData = characterDifficultyData[diffKey] || { stars: null, rate: null, total: 0 };

			// 获取本地最高记录
			const localRecord = getCharacterLocalRecord(statsCharId, statsIsReversed);
			const hasLocalRecord = localRecord.maxScore > 0;

			// 获取全球记录
			const mode = statsIsReversed ? 'reversed' : 'normal';
			const globalRecord = globalCharacterRecords?.[mode]?.[statsCharId] || {
				today: { maxScore: 0, maxCitations: 0, maxAchievements: 0, maxDifficulty: 0 },
				history: { maxScore: 0, maxCitations: 0, maxAchievements: 0, maxDifficulty: 0 }
			};
			const hasGlobalRecord = globalRecord.history.maxScore > 0;

			// 难度显示
			let starsHtml, badgeHtml, rateText, totalGames;
			if (statsCharId === 'true-normal') {
				starsHtml = renderDifficultyStars(12);
				badgeHtml = '<span class="difficulty-badge legendary">传说</span>';
				rateText = diffData.rate !== null ? `${(diffData.rate * 100).toFixed(1)}%` : '?';
				totalGames = diffData.total || 0;
			} else {
				starsHtml = renderDifficultyStars(diffData.stars);
				badgeHtml = getDifficultyBadge(diffData.stars);
				rateText = diffData.rate !== null ? `${(diffData.rate * 100).toFixed(1)}%` : '?';
				totalGames = diffData.total || 0;
			}

			const modeTag = isReversedSide
				? '<span class="mode-tag reversed">🌑 逆位</span>'
				: '<span class="mode-tag normal">☀️ 正位</span>';

			const bonusClass = isReversedSide ? 'reversed-bonus' : 'normal-bonus';
			const awakenClass = isReversedSide ? 'reversed-awaken' : 'normal-awaken';

			const difficultyNote = (statsCharId === 'true-normal')
				? '<div style="font-size:0.55rem;color:#9b59b6;margin-top:2px;">⚠️ 固定最高难度</div>'
				: '';

			// 判断卡牌类型，添加对应的class
			let cardClass = 'preview-card';

			// 如果是真大多数，添加金色卡牌class
			if (isTrueNormalAvailable) {
				cardClass += ' gold-card';
			}
			// 如果是逆位角色（非真大多数），添加逆位卡牌class
			else if (isReversedSide) {
				cardClass += ' reversed-card';
			}

			// ★★★ 生成隐藏觉醒HTML（仅正位角色且非真大多数时显示）★★★
			let hiddenAwakenHtml = '';
			if (!isReversedSide && !isTrueNormalAvailable && char.hiddenAwakenName) {
				hiddenAwakenHtml = `
					<div style="margin-top:8px;padding:6px 8px;background:linear-gradient(135deg,rgba(253,203,110,0.15),rgba(243,156,18,0.15));border-radius:6px;border:1px dashed rgba(243,156,18,0.4);text-align:left;">
						<div style="font-size:0.65rem;color:#d68910;font-weight:600;margin-bottom:2px;">
							<span style="margin-right:3px;">⚙️</span>隐藏觉醒: ${char.hiddenAwakenIcon} ${char.hiddenAwakenName}
						</div>
						<div style="font-size:0.6rem;color:var(--text-secondary);text-align:left;">${char.hiddenAwakenDesc}</div>
					</div>
				`;
			}

			// ★★★ 根据卡牌类型选择背面符号和样式 ★★★
			let backSymbol = '🎴';
			let backText = 'DESTINY';
			let backClass = 'card-back normal-back';
			let particleClass = 'normal-particle';
			if (isTrueNormalAvailable) {
				backSymbol = '👑';
				backText = 'LEGEND';
				backClass = 'card-back gold-back';
				particleClass = 'gold-particle';
			} else if (isReversedSide) {
				backSymbol = '🌑';
				backText = 'REVERSED';
				backClass = 'card-back reversed-back';
				particleClass = 'reversed-particle';
			} else {
				backSymbol = '☀️';
				backText = 'UPRIGHT';
				backClass = 'card-back normal-back';
				particleClass = 'normal-particle';
			}

			// ★★★ 生成带翻转动画的卡牌HTML ★★★
			previewContainer.innerHTML = `
				<div class="card-flip-container">
					<!-- 粒子容器 -->
					<div class="card-particles-container" id="card-particles"></div>
					<div class="card-flip-inner flipping">
						<!-- 卡牌背面 -->
						<div class="${backClass}" style="position:absolute;top:0;left:0;width:100%;">
							<div class="card-back-pattern"></div>
							<div class="card-back-stars">
								<div class="card-back-star"></div>
								<div class="card-back-star"></div>
								<div class="card-back-star"></div>
								<div class="card-back-star"></div>
								<div class="card-back-star"></div>
								<div class="card-back-star"></div>
							</div>
							<div class="card-back-corner top-left"></div>
							<div class="card-back-corner top-right"></div>
							<div class="card-back-corner bottom-left"></div>
							<div class="card-back-corner bottom-right"></div>
							<div class="card-back-center">
								<div class="card-back-symbol">${backSymbol}</div>
								<div class="card-back-text">${backText}</div>
							</div>
							<div class="card-back-shine"></div>
						</div>
						<!-- 卡牌正面 -->
						<div class="${cardClass}" style="max-width:280px;">
							<!-- 1. 角落装饰 -->
							<div class="corner-decoration top-left"></div>
							<div class="corner-decoration top-right"></div>
							<div class="corner-decoration bottom-left"></div>
							<div class="corner-decoration bottom-right"></div>

							<!-- 头部 -->
							<div class="preview-header">
								<span class="preview-icon">${displayIcon}</span>
								<div class="preview-title-row">
									<span class="preview-name">${displayName}</span>
									${modeTag}
								</div>
							</div>

							<!-- 描述 -->
							<div class="preview-desc">${displayDesc}</div>

							<!-- 加成 -->
							<div class="preview-bonus ${bonusClass}">${displayBonus}</div>

							<!-- 觉醒 -->
							<div class="preview-awaken ${awakenClass}">
								<div class="awaken-title">
									<span>⚡ 转博觉醒:</span>
									<span>${displayAwaken.icon} ${displayAwaken.name}</span>
								</div>
								<div class="awaken-desc">${displayAwaken.desc}</div>
							</div>

							<!-- ★★★ 隐藏觉醒 ★★★ -->
							${hiddenAwakenHtml}

							<!-- 记录统计 -->
							<div class="meta-records" style="margin-top:10px;padding:8px;border-radius:8px;">
								<table style="width:100%;border-collapse:collapse;font-size:0.65rem;">
									<thead>
										<tr>
											<th style="text-align:left;padding:2px 4px;font-weight:700;"></th>
											<th style="text-align:center;padding:2px 4px;font-weight:700;">科研分</th>
											<th style="text-align:center;padding:2px 4px;font-weight:700;">引用</th>
											<th style="text-align:center;padding:2px 4px;font-weight:700;">成就</th>
											<th style="text-align:center;padding:2px 4px;font-weight:700;">难度</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td style="padding:3px 4px;font-weight:600;">我的最佳</td>
											<td style="text-align:center;padding:3px 4px;">${hasLocalRecord ? localRecord.maxScore : '-'}</td>
											<td style="text-align:center;padding:3px 4px;">${hasLocalRecord ? localRecord.maxCitations : '-'}</td>
											<td style="text-align:center;padding:3px 4px;">${hasLocalRecord ? localRecord.maxAchievements : '-'}</td>
											<td style="text-align:center;padding:3px 4px;">${hasLocalRecord && localRecord.maxDifficulty ? localRecord.maxDifficulty : '-'}</td>
										</tr>
										<tr>
											<td style="padding:3px 4px;font-weight:600;">今日全球</td>
											<td style="text-align:center;padding:3px 4px;">${globalRecord.today.maxScore > 0 ? globalRecord.today.maxScore : '-'}</td>
											<td style="text-align:center;padding:3px 4px;">${globalRecord.today.maxCitations > 0 ? globalRecord.today.maxCitations : '-'}</td>
											<td style="text-align:center;padding:3px 4px;">${globalRecord.today.maxAchievements > 0 ? globalRecord.today.maxAchievements : '-'}</td>
											<td style="text-align:center;padding:3px 4px;">${globalRecord.today.maxDifficulty > 0 ? globalRecord.today.maxDifficulty : '-'}</td>
										</tr>
										<tr>
											<td style="padding:3px 4px;font-weight:600;">历史全球</td>
											<td style="text-align:center;padding:3px 4px;">${hasGlobalRecord ? globalRecord.history.maxScore : '-'}</td>
											<td style="text-align:center;padding:3px 4px;">${hasGlobalRecord ? globalRecord.history.maxCitations : '-'}</td>
											<td style="text-align:center;padding:3px 4px;">${hasGlobalRecord ? globalRecord.history.maxAchievements : '-'}</td>
											<td style="text-align:center;padding:3px 4px;">${hasGlobalRecord && globalRecord.history.maxDifficulty ? globalRecord.history.maxDifficulty : '-'}</td>
										</tr>
									</tbody>
								</table>
							</div>

							<!-- 难度 -->
							<div class="difficulty-container" style="margin-top:10px;">
								<div>
									<span class="difficulty-label">难度</span>
									<div class="difficulty-stars">${starsHtml}</div>
									${difficultyNote}
								</div>
								<div style="text-align:right;">
									${badgeHtml}
									<div class="difficulty-rate">
										博士率:${rateText} (${totalGames}局)
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			`;

			// ★★★ 延迟触发粒子效果（在背面展示阶段结束时） ★★★
			setTimeout(() => {
				createCardParticles(particleClass);
			}, 300); // 0.3秒后（背面展示阶段结束时）触发粒子
		}

		// ★★★ 生成卡牌粒子效果 ★★★
		function createCardParticles(particleClass) {
			const container = document.getElementById('card-particles');
			if (!container) return;

			const particleCount = 20; // 粒子数量
			const sizes = ['size-small', 'size-medium', 'size-large'];
			const symbols = ['✦', '✧', '◆', '★', '✴'];

			for (let i = 0; i < particleCount; i++) {
				const particle = document.createElement('div');

				// 随机决定是圆形粒子还是星形粒子
				const isStar = Math.random() > 0.6;

				if (isStar) {
					particle.className = `card-particle star-particle ${particleClass} sparkle`;
					particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
				} else {
					const size = sizes[Math.floor(Math.random() * sizes.length)];
					particle.className = `card-particle ${size} ${particleClass}`;
				}

				// 随机方向和距离
				const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
				const distance = 80 + Math.random() * 100; // 80-180px
				const tx = Math.cos(angle) * distance;
				const ty = Math.sin(angle) * distance;

				particle.style.setProperty('--tx', `${tx}px`);
				particle.style.setProperty('--ty', `${ty}px`);

				// 随机延迟
				particle.style.animationDelay = `${Math.random() * 0.2}s`;

				container.appendChild(particle);
			}

			// 1.5秒后清理粒子
			setTimeout(() => {
				if (container) {
					container.innerHTML = '';
				}
			}, 1500);
		}

		// 选中角色并滚动到卡片位置（保留用于兼容）
		function selectAndScrollToCharacter(charId) {
			selectCharacter(charId);
			updateCharacterPreview(charId, isReversedMode);
			updateRuneSelection(charId, isReversedMode);
		}

		function renderCharacterGrid() {
			const grid = document.getElementById('character-grid');
			if (!grid) return;  // ★★★ 修复：添加null检查 ★★★

			// ★★★ 迁移老玩家数据（首次加载时估算总局数）★★★
			migrateGamesPlayedCount();

			// ★★★ 渲染玩家统计（选择角色栏之上）★★★
			const playerStatsContainer = document.getElementById('player-stats-start');
			if (playerStatsContainer) {
				playerStatsContainer.innerHTML = renderPlayerStatsHTML('default');
			}

			const globalRecords = globalCharacterRecords;

			// 检查真·大多数解锁状态
			const trueNormalUnlocked = isTrueNormalUnlocked();
			const unlockProgress = getTrueNormalUnlockProgress();
			
			// 获取全球博士通关统计
			const globalPhdStats = {};
			let trueNormalUnlockedCount = 0;
			
			if (statsCache) {
				const allCharIds = ['genius', 'social', 'rich', 'teacher-child', 'chosen', 'normal'];
				allCharIds.forEach(charId => {
					const normalData = statsCache.normal?.characterEndings?.[charId];
					globalPhdStats[`${charId}_normal`] = normalData?.hard || 0;
					
					const reversedData = statsCache.reversed?.characterEndings?.[charId];
					globalPhdStats[`${charId}_reversed`] = reversedData?.hard || 0;
				});
				
				const trueNormalData = statsCache.normal?.characterEndings?.['true-normal'];
				trueNormalUnlockedCount = trueNormalData?.hard || 0;
			}

			// ★★★ 获取角色卡片折叠状态 ★★★
			const cardCollapseStates = getCharacterCardCollapseStates();

		// 解锁进度栏 - 星盘风格
		const progressContainer = document.getElementById('true-normal-progress');
		if (progressContainer) {
			const trueNormalUnlocked = isTrueNormalUnlocked();
			const unlockProgress = getTrueNormalUnlockProgress();

			// 计算进度
			const normalUnlocked = unlockProgress.details.filter(d => d.normalUnlocked).length;
			const reversedUnlocked = unlockProgress.details.filter(d => d.reversedUnlocked).length;
			const totalUnlocked = normalUnlocked + reversedUnlocked;
			const progressPercent = (totalUnlocked / 12 * 100).toFixed(0);

			// 正位角色图标
			const normalIcons = {
				'normal': '👤',
				'genius': '🔬',
				'social': '🤝',
				'rich': '💰',
				'teacher-child': '👨‍👧',
				'chosen': '⭐'
			};

			// 逆位角色图标
			const reversedIcons = {
				'normal': '😴',
				'genius': '🤡',
				'social': '🐍',
				'rich': '🏴‍☠️',
				'teacher-child': '🎪',
				'chosen': '🌀'
			};

			// 角色名称缩写
			const normalNameMap = {
				'normal': '大多数',
				'genius': '院士',
				'social': '社交',
				'rich': '富豪',
				'teacher-child': '子女',
				'chosen': '天选'
			};

			const reversedNameMap = {
				'normal': '怠惰',
				'genius': '愚钝',
				'social': '嫉妒',
				'rich': '贪求',
				'teacher-child': '玩世',
				'chosen': '空想'
			};

			// 角色顺序 - 用于4x4网格边缘位置
			const charOrder = ['normal', 'genius', 'social', 'rich', 'teacher-child', 'chosen'];

			// 生成单个符文按钮 - 宝石质感
			const generateRune = (charId, isReversedSide, position, rowIndex) => {
				const detail = unlockProgress.details.find(d => d.id === charId);
				const isUnlocked = isReversedSide ? detail?.reversedUnlocked : detail?.normalUnlocked;
				const icons = isReversedSide ? reversedIcons : normalIcons;
				const nameMap = isReversedSide ? reversedNameMap : normalNameMap;
				const icon = icons[charId] || '❓';
				const shortName = nameMap[charId] || charId;
				const isSelected = selectedCharacter?.id === charId && isReversedMode === isReversedSide;
				const rowClass = rowIndex < 2 ? 'top-row' : 'bottom-row';

				// ★★★ 移除🔒图标，通关状态通过边框颜色区分（正位蓝/逆位红，由CSS处理）★★★
				return `
					<div class="constellation-rune gem-rune ${isUnlocked ? 'unlocked' : 'locked'} ${isReversedSide ? 'reversed-rune' : 'normal-rune'} ${rowClass} ${isSelected ? 'selected' : ''}"
						 data-position="${position}"
						 data-char="${charId}"
						 data-reversed="${isReversedSide}"
						 onclick="event.stopPropagation(); selectCharacterFromRune('${charId}', ${isReversedSide})">
						<div class="gem-glow"></div>
						<div class="rune-circle">
							<span class="rune-icon">${icon}</span>
						</div>
						<span class="rune-label">${shortName}</span>
					</div>
				`;
			};

			// 4×4网格布局 - 正位在左半边，逆位在右半边，同角色中轴对称，围成一圈
			const gridHtml = `
				<div class="constellation-grid-4x4">
					<!-- 第一行: 正位2个 + 逆位2个 (对称) -->
					<div class="grid-row row-mixed">
						${generateRune('normal', false, 0, 0)}
						${generateRune('genius', false, 1, 0)}
						${generateRune('genius', true, 2, 0)}
						${generateRune('normal', true, 3, 0)}
					</div>
					<!-- 第二行: 正位1个 + 中心区 + 逆位1个 -->
					<div class="grid-row row-mixed">
						${generateRune('social', false, 4, 1)}
						<div class="center-zone center-top-left" onclick="toggleTrueNormalMode()"></div>
						<div class="center-zone center-top-right" onclick="toggleTrueNormalMode()"></div>
						${generateRune('social', true, 7, 1)}
					</div>
					<!-- 第三行: 正位1个 + 中心区 + 逆位1个 -->
					<div class="grid-row row-mixed">
						${generateRune('rich', false, 8, 2)}
						<div class="center-zone center-bottom-left" onclick="toggleTrueNormalMode()"></div>
						<div class="center-zone center-bottom-right" onclick="toggleTrueNormalMode()"></div>
						${generateRune('rich', true, 11, 2)}
					</div>
					<!-- 第四行: 正位2个 + 逆位2个 (对称) -->
					<div class="grid-row row-mixed">
						${generateRune('teacher-child', false, 12, 3)}
						${generateRune('chosen', false, 13, 3)}
						${generateRune('chosen', true, 14, 3)}
						${generateRune('teacher-child', true, 15, 3)}
					</div>
					<!-- 中心核心按钮 -->
					<div class="center-core-overlay" onclick="toggleTrueNormalMode()">
						<div class="center-core ${trueNormalUnlocked ? 'unlocked' : 'locked'} ${isTrueNormalMode ? 'active' : ''}">
							<div class="center-glow"></div>
							<div class="center-icon">${trueNormalUnlocked ? '<span class="gold-icon">👤</span>' : '🔒'}</div>
							<div class="center-text">${trueNormalUnlocked ? '真·大多数' : totalUnlocked + '/12'}</div>
						</div>
					</div>
				</div>
			`;

			// 底部进度条（移除正位/逆位按钮）
			let footerHtml = `
				<div class="constellation-footer">
					<div class="progress-row">
						<div class="progress-bar-mini">
							<div class="progress-fill-mini" style="width:${progressPercent}%;"></div>
						</div>
						<span class="progress-text-mini">${totalUnlocked}/12 解锁</span>
					</div>
				</div>
			`;

			// 整合为双面板布局：选择面板 + 预览面板并排
			progressContainer.innerHTML = `
				<div class="constellation-wrapper ${isReversedMode ? 'reversed-mode' : 'normal-mode'}">
					<div class="constellation-panel constellation-select-panel">
						<div class="constellation-panel-header">
							<span>🎴 选择角色</span>
						</div>
						<div class="constellation-grid-area">
							${gridHtml}
							${footerHtml}
						</div>
						<div class="constellation-buttons">
							<div class="button-row">
								<button class="btn btn-primary start-btn-small" id="start-btn" disabled>
									<i class="fas fa-play"></i> 我要入学
								</button>
								<button class="btn btn-warning start-btn-small" onclick="openLoadModalFromStart()">
									<i class="fas fa-folder-open"></i> 读档
								</button>
							</div>
							<div class="button-row">
								<button class="btn btn-secondary start-btn-small difficulty-btn" onclick="openDifficultyModal()">
									难度调整 <span>0</span>
								</button>
								<button class="btn btn-info start-btn-small" onclick="openAutoSaveModal()">
									<i class="fas fa-history"></i> 回溯
								</button>
							</div>
							<div class="button-row">
								<button class="btn start-btn-small special-mode-btn" onclick="showTimeTravelerInfo()">
									<i class="fas fa-hourglass-half"></i> 时空旅人
								</button>
								<button class="btn start-btn-small special-mode-btn" onclick="showAdvisorModeInfo()">
									<i class="fas fa-chalkboard-teacher"></i> 导师模式
								</button>
							</div>
						</div>
					</div>
					<div class="constellation-panel constellation-preview-panel">
						<div class="constellation-panel-header">
							<span>📋 角色详情</span>
						</div>
						<div class="preview-content" id="selected-char-preview">
							<div class="preview-card-placeholder">
								<div class="placeholder-icon">❓</div>
								<div class="placeholder-text">请选择一个角色（点击"选择角色"栏的圆形角色按钮）</div>
							</div>
						</div>
					</div>
				</div>
			`;

			progressContainer.style.display = 'block';

			// 更新难度按钮显示
			if (typeof updateDifficultyButton === 'function') {
				updateDifficultyButton();
			}
		}
			
			// 渲染角色卡片
			grid.innerHTML = characters.map(char => {
				const isTrueNormalAvailable = char.id === 'normal' && !isReversedMode && trueNormalUnlocked;
				
				let data, displayIcon, displayName, displayDesc, displayBonus, displayAwaken;
				let statsCharId = char.id;
				let statsIsReversed = isReversedMode;
				
				if (isTrueNormalAvailable && isTrueNormalMode) {
					displayIcon = '<span class="gold-icon">👤</span>';
					displayName = '真·大多数';
					displayDesc = '经历过所有角色的洗礼，回归本真';
					displayBonus = '无特殊能力，一切靠自己';
					displayAwaken = {
						icon: '✨',
						name: '往昔荣光',
						desc: '成就币翻倍'
					};
					data = char;
					statsCharId = 'true-normal';
					statsIsReversed = false;
				} else if (isReversedMode && char.reversed) {
					data = char.reversed;
					displayIcon = data.icon;
					displayName = data.name;
					displayDesc = data.desc;
					displayBonus = data.bonus;
					displayAwaken = {
						icon: data.awakenIcon,
						name: data.awakenName,
						desc: data.awakenDesc
					};
				} else {
					data = char;
					displayIcon = char.icon;
					displayName = char.name;
					displayDesc = char.desc;
					displayBonus = char.bonus;
					displayAwaken = {
						icon: char.awakenIcon,
						name: char.awakenName,
						desc: char.awakenDesc
					};
				}
				
				const diffKey = `${statsCharId}_${statsIsReversed ? 'reversed' : 'normal'}`;
				const diffData = characterDifficultyData[diffKey] || { stars: null, rate: null, total: 0 };
				
				// 获取本地最高记录
				const localRecord = getCharacterLocalRecord(statsCharId, statsIsReversed);
				const hasLocalRecord = localRecord.maxScore > 0;
				
				// 获取全球记录
				const mode = statsIsReversed ? 'reversed' : 'normal';
				const globalRecord = globalRecords?.[mode]?.[statsCharId] || {
					today: { maxScore: 0, maxCitations: 0, maxAchievements: 0, maxDifficulty: 0 },
					history: { maxScore: 0, maxCitations: 0, maxAchievements: 0, maxDifficulty: 0 }
				};
				const hasGlobalRecord = globalRecord.history.maxScore > 0;
				
				// 难度显示
				let starsHtml, badgeHtml, rateText, totalGames;
				if (statsCharId === 'true-normal') {
					starsHtml = renderDifficultyStars(12);
					badgeHtml = '<span class="difficulty-badge legendary">传说</span>';
					rateText = diffData.rate !== null ? `${(diffData.rate * 100).toFixed(1)}%` : '?';
					totalGames = diffData.total || 0;
				} else {
					starsHtml = renderDifficultyStars(diffData.stars);
					badgeHtml = getDifficultyBadge(diffData.stars);
					rateText = diffData.rate !== null ? `${(diffData.rate * 100).toFixed(1)}%` : '?';
					totalGames = diffData.total || 0;
				}
				
				const cardClass = isReversedMode ? 'character-card reversed-card' : 'character-card';
				const bonusClass = isReversedMode ? 'background:rgba(231,76,60,0.15);color:#e74c3c;' : '';
				
				const trueNormalStyle = (isTrueNormalAvailable && isTrueNormalMode) 
					? 'background:linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,140,0,0.15));border-color:rgba(255,140,0,0.5);' 
					: '';
				const trueNormalBonusStyle = (isTrueNormalAvailable && isTrueNormalMode)
					? 'background:linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,140,0,0.2));color:#d68910;'
					: bonusClass;
				
				const awakenBg = isReversedMode 
					? 'background:linear-gradient(135deg,rgba(155,89,182,0.15),rgba(231,76,60,0.15));border-color:rgba(231,76,60,0.4);' 
					: (isTrueNormalAvailable && isTrueNormalMode)
						? 'background:linear-gradient(135deg,rgba(149,165,166,0.15),rgba(127,140,141,0.15));border-color:rgba(127,140,141,0.4);'
						: 'background:linear-gradient(135deg,rgba(102,126,234,0.1),rgba(118,75,162,0.1));border-color:rgba(102,126,234,0.3);';
				const awakenColor = isReversedMode ? '#e74c3c' : (isTrueNormalAvailable && isTrueNormalMode) ? '#7f8c8d' : 'var(--primary-color)';

				let hiddenAwakenHint = '';
				if (!isReversedMode && char.hiddenAwakenName && !(isTrueNormalAvailable && isTrueNormalMode)) {
					hiddenAwakenHint = `
						<div style="margin-top:6px;padding:4px 8px;background:linear-gradient(135deg,rgba(253,203,110,0.15),rgba(243,156,18,0.15));border-radius:6px;border:1px dashed rgba(243,156,18,0.4);">
							<div style="font-size:0.6rem;color:#d68910;display:flex;align-items:center;gap:4px;">
								<span>⚙️</span>
								<span>隐藏觉醒：游戏中特定条件触发</span>
							</div>
						</div>
					`;
				}

				const metaRecordHtml = `
					<div class="meta-records" style="margin-top:8px;padding:6px;background:var(--light-bg);border-radius:6px;font-size:0.65rem;">
						<table style="width:100%;border-collapse:collapse;">
							<thead>
								<tr style="font-size:0.65rem;">
									<th style="text-align:left;padding:2px 4px;font-weight:700;"></th>
									<th style="text-align:center;padding:2px 4px;font-weight:700;">科研分</th>
									<th style="text-align:center;padding:2px 4px;font-weight:700;">引用</th>
									<th style="text-align:center;padding:2px 4px;font-weight:700;">成就</th>
									<th style="text-align:center;padding:2px 4px;font-weight:700;">难度</th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td style="padding:3px 4px;font-weight:600;">我的最佳</td>
									<td style="text-align:center;padding:3px 4px;">${hasLocalRecord ? localRecord.maxScore : '-'}</td>
									<td style="text-align:center;padding:3px 4px;">${hasLocalRecord ? localRecord.maxCitations : '-'}</td>
									<td style="text-align:center;padding:3px 4px;">${hasLocalRecord ? localRecord.maxAchievements : '-'}</td>
									<td style="text-align:center;padding:3px 4px;">${hasLocalRecord && localRecord.maxDifficulty ? localRecord.maxDifficulty : '-'}</td>
								</tr>
								<tr>
									<td style="padding:3px 4px;font-weight:600;">今日全球</td>
									<td style="text-align:center;padding:3px 4px;">${globalRecord.today.maxScore > 0 ? globalRecord.today.maxScore : '-'}</td>
									<td style="text-align:center;padding:3px 4px;">${globalRecord.today.maxCitations > 0 ? globalRecord.today.maxCitations : '-'}</td>
									<td style="text-align:center;padding:3px 4px;">${globalRecord.today.maxAchievements > 0 ? globalRecord.today.maxAchievements : '-'}</td>
									<td style="text-align:center;padding:3px 4px;">${globalRecord.today.maxDifficulty > 0 ? globalRecord.today.maxDifficulty : '-'}</td>
								</tr>
								<tr>
									<td style="padding:3px 4px;font-weight:600;">历史全球</td>
									<td style="text-align:center;padding:3px 4px;">${hasGlobalRecord ? globalRecord.history.maxScore : '-'}</td>
									<td style="text-align:center;padding:3px 4px;">${hasGlobalRecord ? globalRecord.history.maxCitations : '-'}</td>
									<td style="text-align:center;padding:3px 4px;">${hasGlobalRecord ? globalRecord.history.maxAchievements : '-'}</td>
									<td style="text-align:center;padding:3px 4px;">${hasGlobalRecord && globalRecord.history.maxDifficulty ? globalRecord.history.maxDifficulty : '-'}</td>
								</tr>
							</tbody>
						</table>
					</div>
				`;

				const difficultyNote = (statsCharId === 'true-normal') 
					? '<div style="font-size:0.5rem;color:#9b59b6;margin-top:2px;">⚠️ 固定最高难度</div>' 
					: '';

				// ★★★ 检查该卡片是否折叠 ★★★
				const cardKey = `${char.id}_${isReversedMode ? 'reversed' : 'normal'}`;
				const isCollapsed = cardCollapseStates[cardKey] || false;
				const collapsedClass = isCollapsed ? 'card-collapsed' : '';
				const bodyCollapsedClass = isCollapsed ? 'collapsed' : '';
				const iconRotatedClass = isCollapsed ? 'rotated' : '';

				return `
				<div class="${cardClass}" data-id="${char.id}" style="${trueNormalStyle}">
					<!-- 卡片头部 -->
					<div class="card-header">
						<div class="header-left">
							<span style="font-size:1.5rem;">${displayIcon}</span>
							<span style="font-weight:600;font-size:1rem;">${displayName}</span>
						</div>
						<div class="mini-difficulty">
							<span style="font-size:0.6rem;color:var(--text-secondary);">${diffData.stars !== null ? diffData.stars + '★' : '?'}</span>
							${badgeHtml}
						</div>
					</div>

					<!-- 卡片内容 -->
					<div class="card-body">
						<div class="desc">${displayDesc}</div>
						<div class="bonus" style="${trueNormalBonusStyle}">${displayBonus}</div>
						<div class="awaken-info" style="margin-top:8px;padding:6px 8px;${awakenBg}border-radius:6px;border:1px dashed;">
							<div style="font-size:0.65rem;color:${awakenColor};font-weight:600;margin-bottom:2px;">
								<span style="margin-right:3px;">⚡</span>转博觉醒: ${displayAwaken.icon} ${displayAwaken.name}
							</div>
							<div style="font-size:0.6rem;color:var(--text-secondary);">${displayAwaken.desc}</div>
							${hiddenAwakenHint}
						</div>
						${metaRecordHtml}
						<div class="difficulty-container">
							<div>
								<span class="difficulty-label">难度</span>
								<div class="difficulty-stars">${starsHtml}</div>
								${difficultyNote}
							</div>
							<div style="text-align:right;">
								${badgeHtml}
								<div style="font-size:0.55rem;color:var(--text-secondary);margin-top:2px;">
									博士率:${rateText} (${totalGames}局)
								</div>
							</div>
						</div>
					</div>
				</div>
			`}).join('');

			// ★★★ 为卡片添加点击选择功能 ★★★
			document.querySelectorAll('.character-card').forEach(card => {
				card.addEventListener('click', function(e) {
					selectCharacter(this.dataset.id);
				});
			});

			// ★★★ 重新绑定开始按钮事件 ★★★
			const startBtn = document.getElementById('start-btn');
			if (startBtn) {
				startBtn.addEventListener('click', startGame);
			}
		}

		// ==================== 角色卡片折叠状态 ====================

		function getCharacterCardCollapseStates() {
			try {
				const saved = localStorage.getItem('graduateSimulator_cardCollapseStates');
				return saved ? JSON.parse(saved) : {};
			} catch (e) {
				return {};
			}
		}

		function saveCharacterCardCollapseStates(states) {
			try {
				localStorage.setItem('graduateSimulator_cardCollapseStates', JSON.stringify(states));
			} catch (e) {
				console.warn('保存卡片折叠状态失败:', e);
			}
		}

		function toggleCharacterCard(charId, event) {
			event.stopPropagation(); // 阻止冒泡，避免触发选择
			
			const cardKey = `${charId}_${isReversedMode ? 'reversed' : 'normal'}`;
			const states = getCharacterCardCollapseStates();
			
			states[cardKey] = !states[cardKey];
			saveCharacterCardCollapseStates(states);
			
			// 找到对应卡片并切换状态
			const card = document.querySelector(`.character-card[data-id="${charId}"]`);
			if (card) {
				const body = card.querySelector('.card-body');
				const icon = card.querySelector('.card-header .collapse-icon');
				
				if (states[cardKey]) {
					card.classList.add('card-collapsed');
					body.classList.add('collapsed');
					icon.classList.add('rotated');
				} else {
					card.classList.remove('card-collapsed');
					body.classList.remove('collapsed');
					icon.classList.remove('rotated');
				}
			}
		}

		// 全部展开/收起角色卡片
		function toggleAllCharacterCards(collapse) {
			const states = getCharacterCardCollapseStates();
			const mode = isReversedMode ? 'reversed' : 'normal';
			
			characters.forEach(char => {
				const cardKey = `${char.id}_${mode}`;
				states[cardKey] = collapse;
			});
			
			saveCharacterCardCollapseStates(states);
			renderCharacterGrid();
		}

		// 切换真·大多数模式 - 行为与其他角色一致，不刷新整个界面
		function toggleTrueNormalMode() {
			// ★★★ 检查是否已解锁 ★★★
			if (!isTrueNormalUnlocked()) {
				return; // 未解锁时不允许选择
			}

			// ★★★ 如果在逆位模式，先切换到正位模式 ★★★
			if (isReversedMode) {
				switchMode(false);
				isTrueNormalMode = true;
				setTimeout(() => {
					// 更新中心核心按钮状态
					const centerCore = document.querySelector('.center-core');
					if (centerCore) {
						centerCore.classList.add('active');
					}
					selectCharacter('normal');
					updateCharacterPreview('normal', false);
					// 取消所有外围符文的选中状态
					document.querySelectorAll('.constellation-rune').forEach(rune => {
						rune.classList.remove('selected');
					});
				}, 100);
				return;
			}

			// ★★★ 修改：直接选中真大多数，不刷新界面 ★★★
			isTrueNormalMode = true;

			// 更新中心核心按钮状态
			const centerCore = document.querySelector('.center-core');
			if (centerCore) {
				centerCore.classList.add('active');
			}

			// 选中并更新预览，取消外围符文的选中效果
			selectCharacter('normal');
			updateCharacterPreview('normal', false);
			// 取消所有外围符文的选中状态（真大多数不选中外围符文）
			document.querySelectorAll('.constellation-rune').forEach(rune => {
				rune.classList.remove('selected');
			});
		}

		function selectCharacter(id) {
			selectedCharacter = characters.find(c => c.id === id);

			// ★★★ 修复：如果在真·大多数模式下选择了其他角色，关闭真·大多数模式 ★★★
			// ★★★ 只更新状态和中心按钮，不调用renderCharacterGrid()以避免预览面板闪烁 ★★★
			if (isTrueNormalMode && id !== 'normal') {
				isTrueNormalMode = false;
				const centerCore = document.querySelector('.center-core');
				if (centerCore) {
					centerCore.classList.remove('active');
				}
			}

			document.querySelectorAll('.character-card').forEach(card => {
				card.classList.toggle('selected', card.dataset.id === id);
			});
			document.getElementById('start-btn').disabled = false;
		}

		async function startGame() {
			if (!selectedCharacter) return;

			// ★★★ 增加游戏局数计数 ★★★
			incrementGamesPlayed();

			// ★★★ 清空自动存档（开始新游戏时）★★★
			clearAutoSaves();

			gameState = getInitialState();

			resetAchievementShop();
			const achievementCount = getPlayerAchievementCount();
			gameState.achievementCoins = achievementCount;

			if (achievementCount > 0) {
				addLog('成就系统', '获得成就币', `基于历史${achievementCount}个成就，获得${achievementCount}成就币`);
			}
			// ★★★ 修复：真·大多数使用独立的角色ID ★★★
			gameState.isTrueNormal = (selectedCharacter.id === 'normal' && !isReversedMode && isTrueNormalMode);
			gameState.character = gameState.isTrueNormal ? 'true-normal' : selectedCharacter.id;
			gameState.isReversed = isReversedMode;

			// 真·大多数没有初始加成
			if (!gameState.isTrueNormal) {
				const charData = isReversedMode && selectedCharacter.reversed
					? selectedCharacter.reversed
					: selectedCharacter;

				gameState.characterName = charData.name;

				if (charData.stats.research) gameState.research += charData.stats.research;
				if (charData.stats.social) gameState.social += charData.stats.social;
				if (charData.stats.favor) gameState.favor += charData.stats.favor;
				if (charData.stats.gold) {
					gameState.gold += charData.stats.gold;
					clampGold();  // ★★★ 赤贫学子诅咒 ★★★
				}

				if (isReversedMode) {
					initReversedCharacter();
				}
			} else {
				gameState.characterName = '真·大多数';
			}

			shopItems.forEach(item => {
				if (item.once) item.bought = false;
				if (item.monthlyOnce) item.boughtThisMonth = false;
			});

			resetRandomEventPool();

			// ★★★ 应用难度诅咒效果 ★★★
			if (typeof applyDifficultyEffects === 'function') {
				applyDifficultyEffects();
			}
			// ★★★ 应用祝福效果 ★★★
			if (typeof applyBlessingEffects === 'function') {
				applyBlessingEffects();
			}

			if(gameState.publishedPapers.length === 0) {
				gameState.availableRandomEvents = gameState.availableRandomEvents.filter(e => e !== 14);
			}

			// ★★★ 修改：先使用默认值，立即显示游戏界面 ★★★
			gameState.submissionStats = getDefaultSubmissionStats();

			// ★★★ 修复：根据模式设置/清除 reversed-theme class ★★★
			if (isReversedMode) {
				document.body.classList.add('reversed-theme');
			} else {
				document.body.classList.remove('reversed-theme');
			}

			// ★★★ 修改：直接进入游戏，导师选择作为第一个月的固定事件 ★★★
			continueGameStart();
		}

		// ★★★ 修改：进入游戏后触发导师选择事件 ★★★
		function continueGameStart() {
			// ★★★ 先切换界面，不要等待数据加载 ★★★
			document.getElementById('start-screen').classList.add('hidden');
			document.getElementById('game-screen').style.display = 'block';
			document.getElementById('mobile-quick-bar').classList.add('game-active');

			// ★★★ 停止开始页面粒子效果，启动游戏季节效果 ★★★
			if (typeof SeasonEffects !== 'undefined') {
				SeasonEffects.stopStartPageParticles();
				SeasonEffects.updateTheme(gameState.month);
			}

			document.getElementById('log-content').innerHTML = '';
			// ★★★ 重置属性追踪状态（避免进度条从0开始动画） ★★★
			if (typeof resetAttributeTracking === 'function') {
				resetAttributeTracking();
			}
			// ★★★ 修改：游戏开始时检查初始解锁状态（科研和社交）★★★
			checkResearchUnlock(true);
			checkSocialUnlock(true);
			// ★★★ 修复：游戏开始时为第一个月生成会议地点，避免地点随机变化 ★★★
			generateMonthlyConferenceLocations();
			updateAllUI();
			renderPaperSlots();
			renderRelationshipPanel();  // ★★★ 新增：渲染人际关系面板 ★★★

			// ★★★ 修改：合并游戏开始日志和难度诅咒/祝福日志 ★★★
			let startLogDetail = `欢迎来到研究生模拟器！你选择了【${gameState.characterName}】`;
			if (gameState.isReversed) {
				startLogDetail += ' 🌑逆位模式';
			}

			// 收集诅咒和祝福名称
			const curseNames = [];
			const blessingNames = [];
			if (typeof CURSES !== 'undefined' && gameState.activeCurses) {
				Object.keys(gameState.activeCurses).forEach(curseId => {
					const count = gameState.activeCurses[curseId];
					if (count > 0 && CURSES[curseId]) {
						const curse = CURSES[curseId];
						curseNames.push(count > 1 ? `${curse.icon}${curse.name}×${count}` : `${curse.icon}${curse.name}`);
					}
				});
			}
			if (typeof BLESSINGS !== 'undefined' && gameState.activeBlessings) {
				Object.keys(gameState.activeBlessings).forEach(blessingId => {
					const count = gameState.activeBlessings[blessingId];
					if (count > 0 && BLESSINGS[blessingId]) {
						const blessing = BLESSINGS[blessingId];
						blessingNames.push(count > 1 ? `${blessing.icon}${blessing.name}×${count}` : `${blessing.icon}${blessing.name}`);
					}
				});
			}

			// 根据难度分显示
			const diffPoints = gameState.difficultyPoints || 0;
			if (diffPoints !== 0 || curseNames.length > 0 || blessingNames.length > 0) {
				if (diffPoints > 0) {
					startLogDetail += ` 💀难度+${diffPoints}`;
				} else if (diffPoints < 0) {
					startLogDetail += ` ⭐难度${diffPoints}`;
				}

				let detailParts = [];
				if (curseNames.length > 0) {
					detailParts.push(`诅咒: ${curseNames.join(' ')}`);
				}
				if (blessingNames.length > 0) {
					detailParts.push(`祝福: ${blessingNames.join(' ')}`);
				}

				addLog('游戏开始', startLogDetail, detailParts.join(' | '));
			} else {
				addLog('游戏开始', startLogDetail);
			}

			setTimeout(() => {
				applyCollapseStates();
			}, 100);

			// ★★★ 修改：后台异步加载投稿统计，带超时机制 ★★★
			loadSubmissionStatsAsync();

			// ★★★ 第一年第一月固定事件：选择导师 ★★★
			setTimeout(() => {
				showAdvisorSelectionModal((selectedAdvisor) => {
					// 选择导师后显示毕业目标
					const requirements = getAdvisorRequirements();
					// ★★★ 修改：添加转博分数要求信息 ★★★
					addLog('游戏目标', `硕士≥${requirements.masterGrad}分，博士≥${requirements.phdGrad}分`, `转博：Y2≥${requirements.phdYear2}分，Y3≥${requirements.phdYear3}分`);
					addLog('游戏提示', '先专注自己论文，再完成关系任务。属性≥6解锁更多选项。发表A类后论文槽可升级投Nature系列');
					renderRelationshipPanel();
					updateAllUI();
				});
			}, 500);
		}

		// ==================== 简化后的异步加载 ====================
		async function loadSubmissionStatsAsync(retryCount = 0) {
			const maxRetries = 2;
			const timeout = 5000;
			
			try {
				const timeoutPromise = new Promise((_, reject) => {
					setTimeout(() => reject(new Error('加载超时')), timeout);
				});
				
				const loadPromise = loadSubmissionStats();
				const stats = await Promise.race([loadPromise, timeoutPromise]);
				
				if (stats && Object.keys(stats).length > 0) {
					gameState.submissionStats = stats;
					console.log('✅ 投稿统计已加载');
					renderPaperSlots();
					updateResearchResults();
				} else {
					throw new Error('返回数据为空');
				}
			} catch (e) {
				console.warn(`加载投稿统计失败(第${retryCount + 1}次):`, e.message);
				
				if (retryCount < maxRetries) {
					setTimeout(() => loadSubmissionStatsAsync(retryCount + 1), 2000);
				} else {
					console.warn('使用默认投稿统计');
					if (!gameState.submissionStats) {
						gameState.submissionStats = getDefaultSubmissionStats();
					}
					renderPaperSlots();
				}
			}
		}

        // ★★★ 关键修改：逆位角色初始化 ★★★
        function initReversedCharacter() {
            switch (gameState.character) {
                case 'genius':
                    gameState.research = 0;
                    gameState.paperSlots = 4;
                    addLog('逆位效果', '愚钝之《院士转世》', '科研能力固定为0，全部论文槽已解锁');
                    break;
                    
				case 'rich':
					// ★★★ 修改：重置为1 ★★★
					gameState.san = 1;
					gameState.research = 1;
					gameState.social = 1;
					gameState.favor = 1;
					gameState.goldSpentTotal = 0;
					gameState.lastResetMonth = 0;
					addLog('逆位效果', '贪求之《富可敌国》',
						 '除了钱一无所有，每月属性重置为1，金钱+3');
					break;
                    
				case 'teacher-child':
					// ★★★ 新能力：好感不会低于0，归零时重置 ★★★
					// 初始好感度已在角色stats中设置为9（+基础1=10）
					addLog('逆位效果', '玩世之《导师子女》',
						 '好感度不会低于0，归零时重置为6并获得奖励');
					break;
                    
                case 'social':
                    // 保持原有效果
                    break;
                    
                case 'chosen':
                    // 保持原有效果
                    break;
                    
                case 'normal':
                    // 保持原有效果
                    break;
            }
        }

        function resetRandomEventPool() {
            gameState.availableRandomEvents = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 15, 16];  // 新增16号事件：数据丢失
            if(gameState.publishedPapers.length > 0) {
                gameState.availableRandomEvents.push(14);
            }
            gameState.usedRandomEvents = [];
        }

		// ★★★ 新增：每年重置随机事件池（在年初调用）★★★
		function yearlyResetRandomEventPool() {
			resetRandomEventPool();
			addLog('事件轮换', '新的一年开始', '随机事件池已重置');
		}

		// ==================== 特殊模式按钮（未实装） ====================
		function showTimeTravelerInfo() {
			showModal('⏳ 时空旅人模式', `
				<div style="text-align:center;margin-bottom:20px;">
					<div style="font-size:3rem;margin-bottom:15px;">⏳</div>
					<div style="font-size:1.1rem;font-weight:600;color:var(--primary-color);margin-bottom:10px;">敬请期待</div>
				</div>
				<div style="background:var(--light-bg);border-radius:12px;padding:15px;margin-bottom:15px;">
					<div style="font-weight:600;margin-bottom:10px;color:var(--primary-color);">📖 模式介绍</div>
					<div style="font-size:0.85rem;line-height:1.6;color:var(--text-secondary);">
						<p style="margin-bottom:8px;">在时空旅人模式中，你将扮演一位来自未来的研究生，拥有<strong>回溯时空</strong>的能力（奇异博士？）。</p>
						<p style="margin-bottom:8px;">🔮 <strong>游戏目标</strong>：你将遍历所有可能，达到博士毕业获得诺贝尔奖的壮举（idea分或者实验分达到1000），现实中德布罗意凭借博士论文提出了物质波理论，获得了1929年诺贝尔物理学奖。</p>
						<p style="margin-bottom:8px;">⚡ <strong>预知未来</strong>：你将不断的进行每一学年，并操纵所有遇到过的随机事件，审稿结果等，最终你将达到每个阶段的最优解。</p>
						<p style="margin-bottom:0;">💫 <strong>命运交织</strong>：你的每个周目可以通过完成不同的任务来取得永久的跨局加成效果。</p>
					</div>
				</div>
				<div style="text-align:center;font-size:0.8rem;color:var(--text-secondary);">
					该模式正在开发中，敬请期待后续更新！
				</div>
			`, [{ text: '知道了', class: 'btn-primary', action: closeModal }]);
		}

		function showAdvisorModeInfo() {
			showModal('👨‍🏫 导师模式', `
				<div style="text-align:center;margin-bottom:20px;">
					<div style="font-size:3rem;margin-bottom:15px;">👨‍🏫</div>
					<div style="font-size:1.1rem;font-weight:600;color:var(--primary-color);margin-bottom:10px;">敬请期待</div>
				</div>
				<div style="background:var(--light-bg);border-radius:12px;padding:15px;margin-bottom:15px;">
					<div style="font-weight:600;margin-bottom:10px;color:var(--primary-color);">📖 模式介绍</div>
					<div style="font-size:0.85rem;line-height:1.6;color:var(--text-secondary);">
						<p style="margin-bottom:8px;">在导师模式中，你将以<strong>导师的视角</strong>体验研究生培养的全过程。</p>
						<p style="margin-bottom:8px;">📚 <strong>团队组建</strong>：你会招收各种不同效果的学生，如院士转世、天选之人等，请组建你的团队。</p>
						<p style="margin-bottom:8px;">💼 <strong>申请项目</strong>：申请横向和纵向项目，赚钱养实验室，积累科研资源，学生成果是申请的关键。</p>
						<p style="margin-bottom:0;">⚖️ <strong>学生培养</strong>：学生毕业后还会进行科研和项目上的合作，请善待每一个学生。</p>
					</div>
				</div>
				<div style="text-align:center;font-size:0.8rem;color:var(--text-secondary);">
					该模式正在开发中，敬请期待后续更新！
				</div>
			`, [{ text: '知道了', class: 'btn-primary', action: closeModal }]);
		}

		// ==================== 全局函数暴露（供onclick调用）====================
		window.selectCharacterFromRune = selectCharacterFromRune;
		window.toggleTrueNormalMode = toggleTrueNormalMode;
		window.startGame = startGame;
		window.resetRandomEventPool = resetRandomEventPool;
		window.yearlyResetRandomEventPool = yearlyResetRandomEventPool;
		window.showTimeTravelerInfo = showTimeTravelerInfo;
		window.showAdvisorModeInfo = showAdvisorModeInfo;

