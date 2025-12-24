		// ==================== 黑市系统 ====================

		// 黑市商品定义
		const blackMarketItems = [
			{
				id: 'research_note_1',
				name: '📘 启研札记',
				desc: '获得时若科研能力≤3，科研能力+1',
				price: 6,
				condition: (gs) => gs.research <= 3,
				effect: (gs) => {
					// ★★★ 愚钝之院士转世：科研提升转化为其他属性 ★★★
					if (gs.isReversed && gs.character === 'genius') {
						gs.blockedResearchGains = (gs.blockedResearchGains || 0) + 1;
						if (gs.reversedAwakened === true) {
							gs.san = Math.min(gs.sanMax, gs.san + 8);
							gs.gold += 8;
							gs.favor = Math.min(gs.favorMax || 20, gs.favor + 2);
							gs.social = Math.min(gs.socialMax || 20, gs.social + 2);
							return '愚钝转化(觉醒)：SAN+8, 金+8, 好感+2, 社交+2';
						} else {
							gs.san = Math.min(gs.sanMax, gs.san + 4);
							gs.gold += 4;
							gs.favor = Math.min(gs.favorMax || 20, gs.favor + 1);
							gs.social = Math.min(gs.socialMax || 20, gs.social + 1);
							return '愚钝转化：SAN+4, 金+4, 好感+1, 社交+1';
						}
					}
					gs.research++;
					return '科研能力+1';
				}
			},
			{
				id: 'research_note_2',
				name: '📗 研思进阶录',
				desc: '获得时若科研能力≤6，科研能力+1',
				price: 8,
				condition: (gs) => gs.research <= 6,
				effect: (gs) => {
					// ★★★ 愚钝之院士转世：科研提升转化为其他属性 ★★★
					if (gs.isReversed && gs.character === 'genius') {
						gs.blockedResearchGains = (gs.blockedResearchGains || 0) + 1;
						if (gs.reversedAwakened === true) {
							gs.san = Math.min(gs.sanMax, gs.san + 8);
							gs.gold += 8;
							gs.favor = Math.min(gs.favorMax || 20, gs.favor + 2);
							gs.social = Math.min(gs.socialMax || 20, gs.social + 2);
							return '愚钝转化(觉醒)：SAN+8, 金+8, 好感+2, 社交+2';
						} else {
							gs.san = Math.min(gs.sanMax, gs.san + 4);
							gs.gold += 4;
							gs.favor = Math.min(gs.favorMax || 20, gs.favor + 1);
							gs.social = Math.min(gs.socialMax || 20, gs.social + 1);
							return '愚钝转化：SAN+4, 金+4, 好感+1, 社交+1';
						}
					}
					gs.research++;
					return '科研能力+1';
				}
			},
			{
				id: 'research_note_3',
				name: '📕 格物精要',
				desc: '获得时若科研能力≤10，科研能力+1',
				price: 10,
				condition: (gs) => gs.research <= 10,
				effect: (gs) => {
					// ★★★ 愚钝之院士转世：科研提升转化为其他属性 ★★★
					if (gs.isReversed && gs.character === 'genius') {
						gs.blockedResearchGains = (gs.blockedResearchGains || 0) + 1;
						if (gs.reversedAwakened === true) {
							gs.san = Math.min(gs.sanMax, gs.san + 8);
							gs.gold += 8;
							gs.favor = Math.min(gs.favorMax || 20, gs.favor + 2);
							gs.social = Math.min(gs.socialMax || 20, gs.social + 2);
							return '愚钝转化(觉醒)：SAN+8, 金+8, 好感+2, 社交+2';
						} else {
							gs.san = Math.min(gs.sanMax, gs.san + 4);
							gs.gold += 4;
							gs.favor = Math.min(gs.favorMax || 20, gs.favor + 1);
							gs.social = Math.min(gs.socialMax || 20, gs.social + 1);
							return '愚钝转化：SAN+4, 金+4, 好感+1, 社交+1';
						}
					}
					gs.research++;
					return '科研能力+1';
				}
			},
			{
				id: 'burn_mind',
				name: '🔥 燃智术',
				desc: '科研能力上限-3，科研能力+1',
				price: 5,
				condition: () => true,
				effect: (gs) => {
					gs.researchMax = (gs.researchMax || 20) - 3;
					// ★★★ 愚钝之院士转世：科研提升转化为其他属性 ★★★
					if (gs.isReversed && gs.character === 'genius') {
						gs.blockedResearchGains = (gs.blockedResearchGains || 0) + 1;
						if (gs.reversedAwakened === true) {
							gs.san = Math.min(gs.sanMax, gs.san + 8);
							gs.gold += 8;
							gs.favor = Math.min(gs.favorMax || 20, gs.favor + 2);
							gs.social = Math.min(gs.socialMax || 20, gs.social + 2);
							return `上限降至${gs.researchMax}，愚钝转化(觉醒)：SAN+8, 金+8, 好感+2, 社交+2`;
						} else {
							gs.san = Math.min(gs.sanMax, gs.san + 4);
							gs.gold += 4;
							gs.favor = Math.min(gs.favorMax || 20, gs.favor + 1);
							gs.social = Math.min(gs.socialMax || 20, gs.social + 1);
							return `上限降至${gs.researchMax}，愚钝转化：SAN+4, 金+4, 好感+1, 社交+1`;
						}
					}
					gs.research = Math.min(gs.researchMax, gs.research + 1);
					return `科研能力+1，上限降至${gs.researchMax}`;
				}
			},
			{
				id: 'burn_body',
				name: '💀 燃躯术',
				desc: 'SAN上限-3，SAN+6',
				price: 5,
				condition: () => true,
				effect: (gs) => {
					gs.sanMax = (gs.sanMax || 15) - 3;
					gs.san = Math.min(gs.sanMax, gs.san + 6);
					return `SAN+6，上限降至${gs.sanMax}`;
				}
			},
			{
				id: 'san_amulet',
				name: '🛡️ 理智护身符',
				desc: '（可叠加）当SAN为0时，SAN+1（每月1次）',
				price: 8,
				condition: () => true,
				stackable: true,
				effect: (gs) => {
					gs.amulets = gs.amulets || {};
					gs.amulets.san = (gs.amulets.san || 0) + 1;
					return `获得理智护身符×1（共${gs.amulets.san}个）`;
				}
			},
			{
				id: 'gold_amulet',
				name: '💰 零钱护身符',
				desc: '（可叠加）当金币为0时，金币+1（每月1次）',
				price: 12,
				condition: () => true,
				stackable: true,
				effect: (gs) => {
					gs.amulets = gs.amulets || {};
					gs.amulets.gold = (gs.amulets.gold || 0) + 1;
					return `获得零钱护身符×1（共${gs.amulets.gold}个）`;
				}
			},
			{
				id: 'favor_amulet',
				name: '🎁 好感护身符',
				desc: '（可叠加）当导师好感度为0时，好感度+1（每月1次）',
				price: 18,
				condition: () => true,
				stackable: true,
				effect: (gs) => {
					gs.amulets = gs.amulets || {};
					gs.amulets.favor = (gs.amulets.favor || 0) + 1;
					return `获得好感护身符×1（共${gs.amulets.favor}个）`;
				}
			},
			{
				id: 'social_amulet',
				name: '🤝 社交护身符',
				desc: '（可叠加）当社交能力为0时，社交能力+1（每月1次）',
				price: 18,
				condition: () => true,
				stackable: true,
				effect: (gs) => {
					gs.amulets = gs.amulets || {};
					gs.amulets.social = (gs.amulets.social || 0) + 1;
					return `获得社交护身符×1（共${gs.amulets.social}个）`;
				}
			},
			{
				id: 'clear_all',
				name: '🌀 万象清零令',
				desc: '清除所有携带的非永久buff和debuff',
				price: 7,
				condition: () => true,
				effect: (gs) => {
					const count = gs.buffs.temporary.length;
					gs.buffs.temporary = [];
					return `清除了${count}个临时效果`;
				}
			},
			{
				id: 'clear_debuff',
				name: '✨ 晦厄净除符',
				desc: '清除所有携带的非永久debuff',
				price: 10,
				condition: () => true,
				effect: (gs) => {
					const debuffTypes = ['idea_exhaustion', 'exp_overheat', 'write_block', 'slack_debuff', 'idea_stolen'];
					const beforeLength = gs.buffs.temporary.length;
					gs.buffs.temporary = gs.buffs.temporary.filter(b => {
						if (debuffTypes.includes(b.type)) return false;
						if (b.isDebuff) return false;
						if (b.value < 0 && !b.multiply) return false;
						if (b.multiply && b.value < 1) return false;
						return true;
					});
					const removed = beforeLength - gs.buffs.temporary.length;
					return `清除了${removed}个debuff`;
				}
			}
		];

		// 黑市状态
		let blackMarketState = {
			currentItems: [],     // 当前商品 [{item, locked}]
			refreshCount: 0,      // 本局手动刷新次数
			lastAutoRefreshMonth: 0, // 上次自动刷新的总月份
			amuletUsedThisMonth: {} // 本月已触发的护身符
		};

		// 初始化黑市
		function initBlackMarket() {
			blackMarketState = {
				currentItems: [],
				refreshCount: 0,
				lastAutoRefreshMonth: 0,
				amuletUsedThisMonth: {}
			};
			refreshBlackMarketItems(true);
		}

		// 刷新黑市商品（isAuto表示是否自动刷新）
		// ★★★ 修改：允许刷新出重复物品 ★★★
		function refreshBlackMarketItems(isAuto = false) {
			// 保留被锁定的商品
			const lockedItems = blackMarketState.currentItems.filter(item => item.locked);

			// 需要填充的空位数量
			const slotsToFill = 3 - lockedItems.length;

			// ★★★ 修改：随机选择商品，允许重复（除了与锁定商品重复）★★★
			const lockedIds = lockedItems.map(item => item.item.id);
			const newItems = [];

			for (let i = 0; i < slotsToFill; i++) {
				// 随机选择一个商品（可以与之前选的重复，但不能与锁定的重复）
				const availableItems = blackMarketItems.filter(item => !lockedIds.includes(item.id));
				if (availableItems.length > 0) {
					const randomIndex = Math.floor(Math.random() * availableItems.length);
					newItems.push({ item: availableItems[randomIndex], locked: false });
				}
			}

			// 合并锁定商品和新商品
			blackMarketState.currentItems = [...lockedItems, ...newItems];

			// 更新刷新记录
			if (isAuto) {
				// ★★★ 防御性检查：确保gameState.totalMonths有效 ★★★
				blackMarketState.lastAutoRefreshMonth = (gameState && gameState.totalMonths) ? gameState.totalMonths : 1;
			}
		}

		// 检查是否需要自动刷新（每4个月）
		function checkBlackMarketAutoRefresh() {
			// ★★★ 防御性检查 ★★★
			if (!gameState || !blackMarketState) return false;
			const monthsSinceRefresh = gameState.totalMonths - (blackMarketState.lastAutoRefreshMonth || 0);
			if (monthsSinceRefresh >= 4) {
				refreshBlackMarketItems(true);
				return true;
			}
			return false;
		}

		// 手动刷新黑市（需要消耗成就币）
		function manualRefreshBlackMarket() {
			const cost = blackMarketState.refreshCount + 1;

			if (gameState.achievementCoins < cost) {
				showModal('❌ 刷新失败', `<p>成就币不足！需要${cost}成就币，当前只有${gameState.achievementCoins}成就币。</p>`,
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			// 检查是否所有商品都被锁定
			const lockedCount = blackMarketState.currentItems.filter(item => item.locked).length;
			if (lockedCount >= 3) {
				showModal('❌ 刷新失败', `<p>所有商品都已锁定，无法刷新！</p>`,
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			gameState.achievementCoins -= cost;
			blackMarketState.refreshCount++;
			refreshBlackMarketItems(false);

			addLog('成就商店', '手动刷新商品', `成就币-${cost}`);
			closeModal();
			openBlackMarket();
			updateAllUI();
		}

		// 切换商品锁定状态
		function toggleItemLock(index) {
			if (index >= 0 && index < blackMarketState.currentItems.length) {
				blackMarketState.currentItems[index].locked = !blackMarketState.currentItems[index].locked;
				closeModal();
				openBlackMarket();
			}
		}

		// 购买黑市商品
		function buyBlackMarketItem(index) {
			const itemData = blackMarketState.currentItems[index];
			if (!itemData) return;

			const item = itemData.item;

			if (gameState.achievementCoins < item.price) {
				showModal('❌ 购买失败', `<p>成就币不足！需要${item.price}成就币，当前只有${gameState.achievementCoins}成就币。</p>`,
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			// 检查购买条件
			if (!item.condition(gameState)) {
				showModal('❌ 购买失败', `<p>不满足购买条件！</p><p style="color:var(--text-secondary);font-size:0.85rem;">${item.desc}</p>`,
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			// 扣除成就币
			gameState.achievementCoins -= item.price;

			// 应用效果
			const result = item.effect(gameState);

			// ★★★ 修改：购买后移除商品槽位（无论是否可叠加都下架，等待刷新）★★★
			blackMarketState.currentItems.splice(index, 1);

			addLog('成就商店', `购买了${item.name}`, `成就币-${item.price}，${result}`);

			checkResearchUnlock();
			closeModal();
			openBlackMarket();
			updateAllUI();
			updateBuffs();
		}

		// 重置护身符每月使用记录（在月初调用）
		function resetAmuletMonthlyUsage() {
			// ★★★ 防御性检查：确保blackMarketState已初始化 ★★★
			if (!blackMarketState) {
				blackMarketState = {
					currentItems: [],
					refreshCount: 0,
					lastAutoRefreshMonth: 0,
					amuletUsedThisMonth: {}
				};
			}
			blackMarketState.amuletUsedThisMonth = {};
		}

		// 护身符效果检查（在属性可能归零时调用）
		function checkAmuletEffects() {
			if (!gameState.amulets) return [];
			// ★★★ 防御性检查：确保blackMarketState已初始化 ★★★
			if (!blackMarketState || !blackMarketState.amuletUsedThisMonth) {
				return [];
			}

			let triggered = [];

			// SAN护身符 - n个护身符触发时+n
			if (gameState.san <= 0 && gameState.amulets.san > 0 && !blackMarketState.amuletUsedThisMonth.san) {
				const sanGain = gameState.amulets.san;
				gameState.san += sanGain;
				blackMarketState.amuletUsedThisMonth.san = true;
				triggered.push(`理智护身符×${sanGain}`);
			}

			// 金币护身符 - n个护身符触发时+n
			if (gameState.gold <= 0 && gameState.amulets.gold > 0 && !blackMarketState.amuletUsedThisMonth.gold) {
				const goldGain = gameState.amulets.gold;
				gameState.gold += goldGain;
				blackMarketState.amuletUsedThisMonth.gold = true;
				triggered.push(`零钱护身符×${goldGain}`);
			}

			// 好感护身符 - n个护身符触发时+n
			if (gameState.favor <= 0 && gameState.amulets.favor > 0 && !blackMarketState.amuletUsedThisMonth.favor) {
				const favorGain = gameState.amulets.favor;
				gameState.favor += favorGain;
				blackMarketState.amuletUsedThisMonth.favor = true;
				triggered.push(`好感护身符×${favorGain}`);
			}

			// 社交护身符 - n个护身符触发时+n
			if (gameState.social <= 0 && gameState.amulets.social > 0 && !blackMarketState.amuletUsedThisMonth.social) {
				const socialGain = gameState.amulets.social;
				gameState.social += socialGain;
				blackMarketState.amuletUsedThisMonth.social = true;
				triggered.push(`社交护身符×${socialGain}`);
			}

			if (triggered.length > 0) {
				addLog('护身符', `${triggered.join('、')}生效`, '危机解除！');
				// ★★★ 护身符生效后立即刷新UI显示 ★★★
				updateAllUI();
			}

			return triggered;
		}

		// 获取玩家历史成就数量（用于计算成就币）
		function getPlayerAchievementCount() {
			const playerRecords = getPlayerAchievements();
			const allAchievements = new Set();

			if (playerRecords.achievements.normal instanceof Set) {
				playerRecords.achievements.normal.forEach(a => allAchievements.add(a));
			} else if (Array.isArray(playerRecords.achievements.normal)) {
				playerRecords.achievements.normal.forEach(a => allAchievements.add(a));
			}

			if (playerRecords.achievements.reversed instanceof Set) {
				playerRecords.achievements.reversed.forEach(a => allAchievements.add(a));
			} else if (Array.isArray(playerRecords.achievements.reversed)) {
				playerRecords.achievements.reversed.forEach(a => allAchievements.add(a));
			}

			return allAchievements.size;
		}

		// 获取本局已达成成就
		function getCurrentGameAchievements() {
			return gameState.achievements || [];
		}

		// 打开成就商店
		function openBlackMarket() {
			// 检查自动刷新
			checkBlackMarketAutoRefresh();

			const achievementCoins = gameState.achievementCoins || 0;
			const refreshCost = blackMarketState.refreshCount + 1;
			const monthsUntilRefresh = 4 - ((gameState.totalMonths - blackMarketState.lastAutoRefreshMonth) % 4);

			// 护身符持有情况
			const amulets = gameState.amulets || {};
			const amuletInfo = [];
			if (amulets.san > 0) amuletInfo.push(`🛡️×${amulets.san}`);
			if (amulets.gold > 0) amuletInfo.push(`💰×${amulets.gold}`);
			if (amulets.favor > 0) amuletInfo.push(`🎁×${amulets.favor}`);
			if (amulets.social > 0) amuletInfo.push(`🤝×${amulets.social}`);

			let html = `
				<div style="margin-bottom:15px;padding:12px;background:linear-gradient(135deg,rgba(102,126,234,0.15),rgba(118,75,162,0.15));border-radius:10px;border:1px solid rgba(102,126,234,0.4);">
					<div style="display:flex;justify-content:space-between;align-items:center;">
						<div>
							<span style="font-size:1.2rem;">🏆</span>
							<span style="font-weight:600;color:var(--primary-color);">成就币</span>
						</div>
						<div style="font-size:1.3rem;font-weight:700;color:var(--primary-color);">${achievementCoins}</div>
					</div>
					${amuletInfo.length > 0 ? `<div style="font-size:0.75rem;color:var(--text-secondary);margin-top:5px;">持有护身符：${amuletInfo.join(' ')}</div>` : ''}
				</div>

				<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
					<div style="font-size:0.8rem;color:var(--text-secondary);">
						⏰ ${monthsUntilRefresh}个月后自动刷新
					</div>
					<button class="btn btn-info" onclick="manualRefreshBlackMarket()" style="padding:4px 10px;font-size:0.75rem;">
						🔄 手动刷新 (${refreshCost}成就币)
					</button>
				</div>

				<div style="max-height:300px;overflow-y:auto;margin-bottom:15px;">
			`;

			// ★★★ 显示空槽位提示 ★★★
			if (blackMarketState.currentItems.length === 0) {
				html += `<div style="text-align:center;padding:30px;color:var(--text-secondary);">
					<div style="font-size:2rem;margin-bottom:10px;">📦</div>
					<div>商品已售罄，请等待刷新</div>
				</div>`;
			}

			blackMarketState.currentItems.forEach((itemData, index) => {
				const item = itemData.item;
				const locked = itemData.locked;
				const canBuy = achievementCoins >= item.price && item.condition(gameState);
				const meetsCondition = item.condition(gameState);

				let reason = '';
				if (!meetsCondition) reason = '条件不满足';
				else if (achievementCoins < item.price) reason = '成就币不足';

				html += `
					<div class="shop-item ${!canBuy ? 'disabled' : ''}" style="margin-bottom:8px;${locked ? 'border:2px solid #e74c3c;' : ''}">
						<div class="shop-item-info">
							<div class="shop-item-name">${item.name}</div>
							<div class="shop-item-desc">${item.desc}</div>
						</div>
						<div class="shop-item-action" style="display:flex;align-items:center;gap:6px;">
							<span class="shop-item-price" style="color:var(--primary-color);">🏆${item.price}</span>
							<button class="btn ${locked ? 'btn-danger' : 'btn-secondary'}"
								onclick="toggleItemLock(${index})"
								style="padding:4px 8px;font-size:0.7rem;min-width:auto;"
								title="${locked ? '点击解锁' : '点击锁定'}">
								${locked ? '🔒' : '🔓'}
							</button>
							<button class="btn btn-primary" onclick="buyBlackMarketItem(${index})" ${!canBuy ? 'disabled' : ''} style="padding:4px 10px;font-size:0.75rem;">
								${reason || '购买'}
							</button>
						</div>
					</div>
				`;
			});

			html += '</div>';

			// 成就查看按钮
			html += `
				<div style="display:flex;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border-color);">
					<button class="btn btn-success" onclick="showCurrentAchievements()" style="flex:1;font-size:0.8rem;">
						<i class="fas fa-trophy"></i> 本局成就
					</button>
					<button class="btn btn-warning" onclick="showAllAchievements()" style="flex:1;font-size:0.8rem;">
						<i class="fas fa-list"></i> 全部成就
					</button>
				</div>
			`;

			showModal('🏆 成就商店', html, [{ text: '关闭', class: 'btn-info', action: closeModal }]);
		}

		// 显示本局已达成成就
		function showCurrentAchievements() {
			const achievements = getCurrentGameAchievements();

			let html = '';
			if (achievements.length === 0) {
				html = '<div style="text-align:center;padding:20px;color:var(--text-secondary);">本局暂未达成任何成就</div>';
			} else {
				html = '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
				achievements.forEach(ach => {
					const req = ACHIEVEMENT_REQUIREMENTS[ach] || '未知要求';
					html += `<span class="achievement-item" onclick="showAchievementDetail('${ach}')" title="${req}">${ach}</span>`;
				});
				html += '</div>';
			}

			showModal('🏆 本局已达成成就', html, [
				{ text: '返回成就商店', class: 'btn-primary', action: () => { closeModal(); openBlackMarket(); } },
				{ text: '关闭', class: 'btn-info', action: closeModal }
			]);
		}

		// 显示全部成就及达成状态
		function showAllAchievements() {
			const playerRecords = getPlayerAchievements();
			const currentAchievements = new Set(getCurrentGameAchievements());

			// 合并历史成就
			const historicalAchievements = new Set();
			if (playerRecords.achievements.normal instanceof Set) {
				playerRecords.achievements.normal.forEach(a => historicalAchievements.add(a));
			} else if (Array.isArray(playerRecords.achievements.normal)) {
				playerRecords.achievements.normal.forEach(a => historicalAchievements.add(a));
			}
			if (playerRecords.achievements.reversed instanceof Set) {
				playerRecords.achievements.reversed.forEach(a => historicalAchievements.add(a));
			} else if (Array.isArray(playerRecords.achievements.reversed)) {
				playerRecords.achievements.reversed.forEach(a => historicalAchievements.add(a));
			}

			let html = '<div style="max-height:400px;overflow-y:auto;">';

			// 本局达成
			const currentList = ALL_ACHIEVEMENTS.filter(a => currentAchievements.has(a));
			if (currentList.length > 0) {
				html += `<div style="margin-bottom:12px;"><div style="font-size:0.8rem;color:var(--success-color);margin-bottom:6px;font-weight:600;">🏆 本局已达成 (${currentList.length}/${ALL_ACHIEVEMENTS.length})</div><div style="display:flex;flex-wrap:wrap;gap:4px;">`;
				currentList.forEach(ach => {
					html += `<span class="achievement-item" onclick="showAchievementDetail('${ach}')" style="cursor:pointer;">${ach}</span>`;
				});
				html += '</div></div>';
			}

			// 历史达成但本局未达成
			const historicalOnlyList = ALL_ACHIEVEMENTS.filter(a => historicalAchievements.has(a) && !currentAchievements.has(a));
			if (historicalOnlyList.length > 0) {
				html += `<div style="margin-bottom:12px;"><div style="font-size:0.8rem;color:var(--warning-color);margin-bottom:6px;font-weight:600;">📜 历史达成 (${historicalOnlyList.length})</div><div style="display:flex;flex-wrap:wrap;gap:4px;">`;
				historicalOnlyList.forEach(ach => {
					html += `<span class="achievement-item" onclick="showAchievementDetail('${ach}')" style="cursor:pointer;opacity:0.7;">${ach}</span>`;
				});
				html += '</div></div>';
			}

			// 未达成
			const unachievedList = ALL_ACHIEVEMENTS.filter(a => !historicalAchievements.has(a) && !currentAchievements.has(a));
			if (unachievedList.length > 0) {
				html += `<div><div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:6px;font-weight:600;">🔒 未达成 (${unachievedList.length})</div><div style="display:flex;flex-wrap:wrap;gap:4px;">`;
				unachievedList.forEach(ach => {
					html += `<span class="locked-achievement-tag" onclick="showAchievementDetail('${ach}')" style="cursor:pointer;">${ach}</span>`;
				});
				html += '</div></div>';
			}

			html += '</div>';

			showModal('📋 全部成就', html, [
				{ text: '返回成就商店', class: 'btn-primary', action: () => { closeModal(); openBlackMarket(); } },
				{ text: '关闭', class: 'btn-info', action: closeModal }
			]);
		}

		// 显示单个成就详情
		function showAchievementDetail(ach) {
			const req = ACHIEVEMENT_REQUIREMENTS[ach] || '未知要求';
			const playerRecords = getPlayerAchievements();
			const currentAchievements = new Set(getCurrentGameAchievements());

			const historicalAchievements = new Set();
			if (playerRecords.achievements.normal instanceof Set) {
				playerRecords.achievements.normal.forEach(a => historicalAchievements.add(a));
			} else if (Array.isArray(playerRecords.achievements.normal)) {
				playerRecords.achievements.normal.forEach(a => historicalAchievements.add(a));
			}
			if (playerRecords.achievements.reversed instanceof Set) {
				playerRecords.achievements.reversed.forEach(a => historicalAchievements.add(a));
			} else if (Array.isArray(playerRecords.achievements.reversed)) {
				playerRecords.achievements.reversed.forEach(a => historicalAchievements.add(a));
			}

			const isCurrentlyAchieved = currentAchievements.has(ach);
			const isHistoricallyAchieved = historicalAchievements.has(ach);

			let statusText = '';
			let statusColor = '';
			if (isCurrentlyAchieved) {
				statusText = '✅ 本局已达成';
				statusColor = 'var(--success-color)';
			} else if (isHistoricallyAchieved) {
				statusText = '📜 历史已达成';
				statusColor = 'var(--warning-color)';
			} else {
				statusText = '🔒 未达成';
				statusColor = 'var(--text-secondary)';
			}

			const html = `
				<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:2rem;margin-bottom:8px;">${ach}</div>
					<div style="color:${statusColor};font-weight:600;">${statusText}</div>
				</div>
				<div style="padding:12px;background:var(--light-bg);border-radius:8px;">
					<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:4px;">达成要求：</div>
					<div style="font-size:0.9rem;">${req}</div>
				</div>
			`;

			showModal('成就详情', html, [
				{ text: '返回', class: 'btn-primary', action: () => { closeModal(); showAllAchievements(); } },
				{ text: '关闭', class: 'btn-info', action: closeModal }
			]);
		}

		// 重置黑市（每局游戏开始时调用，替代原来的resetAchievementShop）
		function resetAchievementShop() {
			initBlackMarket();
		}

		// 兼容旧函数名
		function openAchievementShop() {
			openBlackMarket();
		}
        // ==================== 商店系统 ====================
		function openShop() {
			let html = '<div>';
			// ★★★ 新增：可出售物品列表 ★★★
			const sellableItems = [
				{ id: 'chair', name: '人体工学椅', sellPrice: 5 },
				{ id: 'monitor', name: '4K显示器', sellPrice: 4 },
				{ id: 'keyboard', name: '机械键盘', sellPrice: 4 },
				{ id: 'gpu_buy', name: 'GPU服务器', sellPrice: 6 }
			];
			// 检查是否有可出售的物品
			const ownedSellable = sellableItems.filter(si => {
				if (si.id === 'gpu_buy') {
					return (gameState.gpuServersBought || 0) > 0;
				}
				return gameState.furnitureBought && gameState.furnitureBought[si.id.replace('_buy', '')];
			});			
			// 显示出售区域
			if (ownedSellable.length > 0) {
				html += `<div style="margin-bottom:15px;padding:10px;background:linear-gradient(135deg,rgba(253,203,110,0.2),rgba(243,156,18,0.2));border-radius:8px;border:1px solid rgba(243,156,18,0.4);">
					<div style="font-weight:600;color:#d68910;margin-bottom:8px;"><i class="fas fa-store"></i> 出售物品（半价回收）</div>`;
				
				ownedSellable.forEach(si => {
					let ownedCount = 1;
					if (si.id === 'gpu_buy') {
						ownedCount = gameState.gpuServersBought || 0;
					}
					
					html += `<div class="shop-item" style="background:var(--card-bg);">
						<div class="shop-item-info">
							<div class="shop-item-name">${si.name} ${ownedCount > 1 ? `(×${ownedCount})` : ''}</div>
							<div class="shop-item-desc">出售获得 ${si.sellPrice} 金币</div>
						</div>
						<div class="shop-item-action">
							<span class="shop-item-price" style="color:var(--success-color);">+💰${si.sellPrice}</span>
							<button class="btn btn-warning" onclick="sellItem('${si.id}')" style="padding:4px 10px;font-size:0.75rem;">出售</button>
						</div>
					</div>`;
				});
				
				html += '</div>';
			}
			
			// 原有购买区域
			html += '<div style="font-weight:600;margin-bottom:8px;"><i class="fas fa-shopping-cart"></i> 购买物品</div>';

			// ★★★ 可预购订阅的物品列表 ★★★
			const subscribableItems = ['coffee', 'claude', 'gpt', 'gemini', 'gpu_rent'];

			shopItems.forEach(item => {
				const canBuy = gameState.gold >= item.price && !(item.once && item.bought) && !(item.monthlyOnce && item.boughtThisMonth);
				const reason = (item.once && item.bought) ? '已购买' : (item.monthlyOnce && item.boughtThisMonth) ? '本月已购' : gameState.gold < item.price ? '金币不足' : '';

				// ★★★ 修改：冰美式动态描述（前15杯不变，第16杯开始提升）★★★
				let itemDesc = item.desc;
				if (item.id === 'coffee') {
					const count = gameState.coffeeBoughtCount || 0;
					const currentBonus = 3 + Math.floor(count / 15);
					const currentTier = Math.floor(count / 15);
					const nextMilestone = (currentTier + 1) * 15 + 1;  // 16, 31, 46...
					const nextBonus = currentBonus + 1;

					itemDesc = `SAN值+${currentBonus}`;
					itemDesc += ` (${count}/${nextMilestone}杯时+${nextBonus})`;
				}

				// ★★★ 新增：订阅按钮 ★★★
				let subscribeBtn = '';
				if (subscribableItems.includes(item.id)) {
					const isSubscribed = gameState.subscriptions && gameState.subscriptions[item.id];
					const btnClass = isSubscribed ? 'btn-success' : 'btn-secondary';
					const btnText = isSubscribed ? '🔔' : '🔕';
					const btnTitle = isSubscribed ? '点击取消预购' : '点击开启预购';
					subscribeBtn = `<button class="btn ${btnClass}" onclick="toggleSubscription('${item.id}')" title="${btnTitle}" style="padding:4px 8px;font-size:0.75rem;margin-right:4px;">${btnText}</button>`;
				}

				html += `<div class="shop-item ${!canBuy ? 'disabled' : ''}">
					<div class="shop-item-info">
						<div class="shop-item-name">${item.name}</div>
						<div class="shop-item-desc">${itemDesc}</div>
					</div>
					<div class="shop-item-action">
						<span class="shop-item-price">💰${item.price}</span>
						${subscribeBtn}
						<button class="btn btn-primary" onclick="buyItem('${item.id}')" ${!canBuy ? 'disabled' : ''}>${reason || '购买'}</button>
					</div>
				</div>`;
			});
			html += '</div>';

			// ★★★ 新增：预购说明 ★★★
			html += `<div style="margin-top:10px;padding:8px;background:rgba(52,152,219,0.1);border-radius:6px;font-size:0.75rem;color:var(--text-secondary);">
				<strong>🔔 预购功能：</strong>开启后，在进入下月/点击相关操作按钮时，若金钱足够会自动购买对应物品。
			</div>`;

			showModal('🛒 商店', html, [{ text: '关闭', class: 'btn-info', action: closeModal }]);
		}
		// ★★★ 新增：出售物品函数 ★★★
		function sellItem(id) {
			const sellPrices = {
				'chair': 5,
				'monitor': 4,
				'keyboard': 4,
				'gpu_buy': 6
			};
			
			const sellPrice = sellPrices[id];
			if (!sellPrice) return;
			
			let canSell = false;
			let itemName = '';
			
			switch (id) {
				case 'chair':
					canSell = gameState.furnitureBought && gameState.furnitureBought.chair;
					itemName = '人体工学椅';
					break;
				case 'monitor':
					canSell = gameState.furnitureBought && gameState.furnitureBought.monitor;
					itemName = '4K显示器';
					break;
				case 'keyboard':
					canSell = gameState.furnitureBought && gameState.furnitureBought.keyboard;
					itemName = '机械键盘';
					break;
				case 'gpu_buy':
					canSell = (gameState.gpuServersBought || 0) > 0;
					itemName = 'GPU服务器';
					break;
			}
			
			if (!canSell) {
				showModal('❌ 出售失败', '<p>你没有这个物品！</p>', 
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			showModal('⚠️ 确认出售', 
				`<p>确定要出售 <strong>${itemName}</strong> 吗？</p>
				 <p>将获得 <strong style="color:var(--success-color);">+${sellPrice} 金币</strong></p>
				 <p style="color:var(--danger-color);font-size:0.85rem;">⚠️ 对应的永久buff将被移除！</p>`,
				[
					{ text: '取消', class: 'btn-info', action: closeModal },
					{ text: '确认出售', class: 'btn-warning', action: () => {
						// 移除对应buff并更新状态
						switch (id) {
							case 'chair':
								gameState.furnitureBought.chair = false;
								gameState.buffs.permanent = gameState.buffs.permanent.filter(b => b.type !== 'monthly_san');
								// 恢复商店状态
								const chairItem = shopItems.find(i => i.id === 'chair');
								if (chairItem) chairItem.bought = false;
								break;
							case 'monitor':
								gameState.furnitureBought.monitor = false;
								gameState.buffs.permanent = gameState.buffs.permanent.filter(b => b.type !== 'read_san_reduce');
								const monitorItem = shopItems.find(i => i.id === 'monitor');
								if (monitorItem) monitorItem.bought = false;
								break;
							case 'keyboard':
								gameState.furnitureBought.keyboard = false;
								gameState.buffs.permanent = gameState.buffs.permanent.filter(b => b.type !== 'write_san_reduce');
								const keyboardItem = shopItems.find(i => i.id === 'keyboard');
								if (keyboardItem) keyboardItem.bought = false;
								break;
							case 'gpu_buy':
								gameState.gpuServersBought--;
								// 移除一个GPU exp_times buff
								const gpuBuffIndex = gameState.buffs.permanent.findIndex(b =>
									b.type === 'exp_times' && b.name === '每次做实验多做1次'
								);
								if (gpuBuffIndex !== -1) {
									gameState.buffs.permanent.splice(gpuBuffIndex, 1);
								}
								// ★★★ 新增：同时移除一个GPU exp_bonus buff ★★★
								const gpuBonusIndex = gameState.buffs.permanent.findIndex(b =>
									b.type === 'exp_bonus' && b.name === '每次做实验分数+1'
								);
								if (gpuBonusIndex !== -1) {
									gameState.buffs.permanent.splice(gpuBonusIndex, 1);
								}
								break;
						}
						
						// 检查全套家具成就条件
						if (gameState.furnitureBought) {
							const hasAll = gameState.furnitureBought.chair && 
										   gameState.furnitureBought.monitor && 
										   gameState.furnitureBought.keyboard;
							if (!hasAll && gameState.achievementConditions) {
								gameState.achievementConditions.fullFurnitureSet = false;
							}
						}
						
						gameState.gold += sellPrice;
						addLog('出售', `出售了${itemName}`, `金币+${sellPrice}`);
						
						closeModal();
						openShop();  // 刷新商店界面
						updateAllUI();
						updateBuffs();
					}}
				]
			);
		}
        function buyItem(id) {
            const item = shopItems.find(i => i.id === id);
            if (!item) return;

            if (gameState.gold < item.price) {
                showModal('❌ 购买失败', `<p>金钱不足！购买${item.name}需要${item.price}金币，当前只有${gameState.gold}金币。</p>`,
                    [{ text: '确定', class: 'btn-primary', action: closeModal }]);
                return;
            }

            return executeBuyItem(id, false);
        }

        // ★★★ 新增：执行购买物品（可由订阅自动触发）★★★
        function executeBuyItem(id, isAutoSubscription = false) {
            const item = shopItems.find(i => i.id === id);
            if (!item) return false;

            if (gameState.gold < item.price) {
                return false;
            }

            // 检查购买限制
            if (item.once && item.bought) return false;
            if (item.monthlyOnce && item.boughtThisMonth) return false;

            let result = `金钱-${item.price}`;
            if (isAutoSubscription) {
                result = `【预购】${result}`;
            }
            
            // 富可敌国觉醒：通过消费增加属性
            if (gameState.isReversed && gameState.character === 'rich' && gameState.reversedAwakened) {
                const spent = item.price;
                gameState.goldSpentTotal = (gameState.goldSpentTotal || 0) + spent;
                
                const attributeGains = Math.floor(gameState.goldSpentTotal / 6);
                const previousGains = Math.floor((gameState.goldSpentTotal - spent) / 6);
                const newGains = attributeGains - previousGains;
                
                if (newGains > 0) {
                    gameState.san = Math.min(gameState.sanMax, gameState.san + newGains);
                    gameState.research = Math.min(20, gameState.research + newGains);
                    gameState.social = Math.min(20, gameState.social + newGains);
                    gameState.favor = Math.min(20, gameState.favor + newGains);
                    result += `，金钱觉醒(累计${gameState.goldSpentTotal}金)：SAN+${newGains}, 科研+${newGains}, 社交+${newGains}, 好感+${newGains}`;
                }
            }
            
            gameState.gold -= item.price;
            
            switch(id) {
                case 'gpu_buy':
                    gameState.gpuServersBought = (gameState.gpuServersBought || 0) + 1;
                    if (gameState.gpuServersBought >= 5) {
                        gameState.achievementConditions = gameState.achievementConditions || {};
                        gameState.achievementConditions.bought5GPUs = true;
                    }
                    break;
                    
                case 'chair':
                    gameState.furnitureBought = gameState.furnitureBought || {};
                    gameState.furnitureBought.chair = true;
                    break;
                case 'monitor':
                    gameState.furnitureBought = gameState.furnitureBought || {};
                    gameState.furnitureBought.monitor = true;
                    break;
                case 'keyboard':
                    gameState.furnitureBought = gameState.furnitureBought || {};
                    gameState.furnitureBought.keyboard = true;
                    break;
            }
            
            // 检查全套家具成就
            if (gameState.furnitureBought && 
                gameState.furnitureBought.chair && 
                gameState.furnitureBought.monitor && 
                gameState.furnitureBought.keyboard) {
                gameState.achievementConditions = gameState.achievementConditions || {};
                gameState.achievementConditions.fullFurnitureSet = true;
            }
            
            switch (id) {
                case 'chair':
                    item.bought = true;
                    gameState.buffs.permanent.push({ type: 'monthly_san', name: '每月SAN值+1', value: 1, permanent: true });
                    result += '，获得永久buff-每月SAN值+1';
                    break;
                case 'gpu_buy':
                    gameState.buffs.permanent.push({ type: 'exp_times', name: '每次做实验多做1次', value: 1, permanent: true });
                    // ★★★ 新增：购买GPU服务器增加实验分数+1 ★★★
                    gameState.buffs.permanent.push({ type: 'exp_bonus', name: '每次做实验分数+1', value: 1, permanent: true });
                    result += '，获得永久buff-每次做实验多做1次且分数+1';
                    break;
                case 'keyboard':
                    item.bought = true;
                    gameState.buffs.permanent.push({ type: 'write_san_reduce', name: '写论文SAN-3', value: 1, permanent: true });
                    result += '，获得永久buff-每次写论文变为SAN值-3';
                    break;
                case 'monitor':
                    item.bought = true;
                    gameState.buffs.permanent.push({ type: 'read_san_reduce', name: '读论文SAN-1', value: 1, permanent: true });
                    result += '，获得永久buff-读论文变为SAN值-1';
                    break;
				case 'coffee':
					item.boughtThisMonth = true;
					gameState.coffeeBoughtCount = (gameState.coffeeBoughtCount || 0) + 1;
					// ★★★ 修改：前15杯不变，第16杯开始提升 ★★★
					const coffeeBonus = 3 + Math.floor((gameState.coffeeBoughtCount - 1) / 15);
					gameState.san = Math.min(gameState.sanMax, gameState.san + coffeeBonus);
					result += `，SAN值+${coffeeBonus}`;
					break;
					
				case 'gemini':
					item.boughtThisMonth = true;
					// ★★★ 只添加一个综合buff，不再单独添加分数buff ★★★
					gameState.buffs.temporary.push({ 
						type: 'idea_san_reduce', 
						name: 'Gemini订阅', 
						value: 1, 
						permanent: false,
						thisMonthOnly: true,
						bonusScore: 4  // ★★★ 在buff中记录分数加成 ★★★
					});
					result += '，获得本月buff-想idea时SAN消耗-1，分数+4';
					break;
					
				case 'gpt':
					item.boughtThisMonth = true;
					gameState.buffs.temporary.push({ 
						type: 'exp_san_reduce', 
						name: 'GPT订阅', 
						value: 1, 
						permanent: false,
						thisMonthOnly: true,
						bonusScore: 4
					});
					result += '，获得本月buff-做实验时SAN消耗-1，分数+4';
					break;
					
				case 'claude':
					item.boughtThisMonth = true;
					gameState.buffs.temporary.push({ 
						type: 'write_san_reduce_temp', 
						name: 'Claude订阅', 
						value: 1, 
						permanent: false,
						thisMonthOnly: true,
						bonusScore: 4
					});
					result += '，获得本月buff-写论文时SAN消耗-1，分数+4';
					break;
					
				case 'gpu_rent':
					// 改为本月buff而不是下次
					gameState.buffs.temporary.push({
						type: 'exp_times',
						name: '本月做实验多做1次',
						value: 1,
						permanent: false,
						thisMonthOnly: true
					});
					// ★★★ 新增：租GPU服务器增加本月做实验分数+1 ★★★
					gameState.buffs.temporary.push({
						type: 'exp_bonus',
						name: '本月做实验分数+1',
						value: 1,
						permanent: false,
						thisMonthOnly: true
					});
					result += '，获得本月buff-做实验多做1次且分数+1';
					break;
            }

            addLog('购买', `购买了${item.name}`, result);
            if (!isAutoSubscription) {
                closeModal();
                openShop();
            }
            updateAllUI();
            updateBuffs();
            return true;
        }

        // ★★★ 新增：切换订阅状态 ★★★
        function toggleSubscription(itemId) {
            if (!gameState.subscriptions) {
                gameState.subscriptions = {
                    coffee: false,
                    claude: false,
                    gpt: false,
                    gemini: false,
                    gpu_rent: false
                };
            }
            gameState.subscriptions[itemId] = !gameState.subscriptions[itemId];
            const item = shopItems.find(i => i.id === itemId);
            const status = gameState.subscriptions[itemId] ? '已开启' : '已关闭';
            addLog('预购', `${item.name}预购${status}`, `每月初/相关操作时将自动购买`);
            openShop();
        }

        // ★★★ 新增：处理订阅自动购买 ★★★
        function processSubscriptions(triggerType) {
            if (!gameState.subscriptions) return;

            const subscriptionItems = ['coffee', 'claude', 'gpt', 'gemini', 'gpu_rent'];

            subscriptionItems.forEach(itemId => {
                if (!gameState.subscriptions[itemId]) return;

                const item = shopItems.find(i => i.id === itemId);
                if (!item) return;

                // 检查是否已购买（月度物品）
                if (item.monthlyOnce && item.boughtThisMonth) return;

                // 根据触发类型决定是否购买
                let shouldBuy = false;

                switch (triggerType) {
                    case 'nextMonth':
                        // 月初自动购买冰美式
                        if (itemId === 'coffee') shouldBuy = true;
                        break;
                    case 'idea':
                        // 想idea时购买gemini
                        if (itemId === 'gemini') shouldBuy = true;
                        break;
                    case 'experiment':
                        // 做实验时购买gpt和租gpu
                        if (itemId === 'gpt' || itemId === 'gpu_rent') shouldBuy = true;
                        break;
                    case 'write':
                        // 写论文时购买claude
                        if (itemId === 'claude') shouldBuy = true;
                        break;
                }

                if (shouldBuy && gameState.gold >= item.price) {
                    executeBuyItem(itemId, true);
                }
            });
        }
