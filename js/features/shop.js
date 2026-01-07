		// ==================== 成就系统辅助函数 ====================

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
				{ text: '查看全部', class: 'btn-primary', action: () => { closeModal(); showAllAchievements(); } },
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

		// 重置成就商店（每局游戏开始时调用）
		function resetAchievementShop() {
			// 成就商店不需要重置
		}

		// ★★★ 商店分页状态 ★★★
		let shopCurrentPage = 1;
        // ==================== 商店系统 ====================
		function openShop(page = shopCurrentPage) {
			shopCurrentPage = page;

			// ★★★ 分页：第一页是消耗品，第二页是永久物品，第三页是出售和升级 ★★★
			const page1Items = shopItems.filter(item => !item.once && item.id !== 'gpu_buy');  // 消耗品
			const page2Items = shopItems.filter(item => item.once || item.id === 'gpu_buy');   // 永久物品（含GPU）
			const currentPageItems = page === 1 ? page1Items : page === 2 ? page2Items : [];

			let html = '<div>';

			// ★★★ 第三页：出售和升级，第四页：成就商店 ★★★
			if (page === 3) {
				html += renderSellAndUpgradePage();
			} else if (page === 4) {
				html += renderAchievementPointShopPage();
			} else {
				// 原有购买区域
				html += `<div style="font-weight:600;margin-bottom:8px;">
					<i class="fas fa-shopping-cart"></i> 购买物品
					<span style="font-size:0.8rem;color:var(--text-secondary);margin-left:10px;">(第${shopCurrentPage}页/共4页)</span>
				</div>`;

				// ★★★ 分页按钮 ★★★
				html += `<div style="display:flex;gap:8px;margin-bottom:10px;">
					<button class="btn ${shopCurrentPage === 1 ? 'btn-primary' : 'btn-secondary'}" onclick="openShop(1)" style="flex:1;padding:6px;">
						消耗品
					</button>
					<button class="btn ${shopCurrentPage === 2 ? 'btn-primary' : 'btn-secondary'}" onclick="openShop(2)" style="flex:1;padding:6px;">
						永久物品
					</button>
					<button class="btn ${shopCurrentPage === 3 ? 'btn-primary' : 'btn-secondary'}" onclick="openShop(3)" style="flex:1;padding:6px;">
						出售/升级
					</button>
					<button class="btn ${shopCurrentPage === 4 ? 'btn-warning' : 'btn-secondary'}" onclick="openShop(4)" style="flex:1;padding:6px;">
						🏆成就
					</button>
				</div>`;

				// ★★★ 可预购订阅的物品列表 ★★★
				const subscribableItems = ['coffee', 'claude', 'gpt', 'gemini', 'gpu_rent'];

				currentPageItems.forEach(item => {
					// ★★★ 新增：GPU数量限制检查 ★★★
					let gpuBuyAvailable = 0;
					let gpuRentAvailable = 0;
					if (item.id === 'gpu_buy') {
						// 购买GPU：数量 = 当前月份 - 已购买数量（确保第一个月至少有1个库存）
						const effectiveMonths = Math.max(1, gameState.totalMonths || 1);
						gpuBuyAvailable = Math.max(0, effectiveMonths - (gameState.gpuServersBought || 0));
					} else if (item.id === 'gpu_rent') {
						// 租用GPU：每月刷新，上限20
						gpuRentAvailable = Math.max(0, 20 - (gameState.gpuRentedThisMonth || 0));
					}

					// ★★★ 冰美式价格（无限咖啡机价格递增2,3,4...）★★★
					let itemPrice = item.price;
					if (item.id === 'coffee' && gameState.coffeeMachineUpgrade === 'unlimited') {
						const coffeeBoughtThisMonth = gameState.coffeeBoughtThisMonth || 0;
						itemPrice = coffeeBoughtThisMonth + 2;  // 第1杯2金币，第2杯3金币...
					}

					let canBuy = gameState.gold >= itemPrice && !(item.once && item.bought) && !(item.monthlyOnce && item.boughtThisMonth);
					let reason = (item.once && item.bought) ? '已购买' : (item.monthlyOnce && item.boughtThisMonth) ? '本月已购' : gameState.gold < itemPrice ? '金币不足' : '';

					// ★★★ GPU数量限制 ★★★
					if (item.id === 'gpu_buy' && gpuBuyAvailable <= 0) {
						canBuy = false;
						reason = '已售罄';
					}
					if (item.id === 'gpu_rent' && gpuRentAvailable <= 0) {
						canBuy = false;
						reason = '已售罄';
					}

					// ★★★ 冰美式每月购买上限1杯（无限咖啡机除外）★★★
					if (item.id === 'coffee') {
						const coffeeBoughtThisMonth = gameState.coffeeBoughtThisMonth || 0;
						// 无限咖啡机可以无限购买
						if (gameState.coffeeMachineUpgrade !== 'unlimited' && coffeeBoughtThisMonth >= 1) {
							canBuy = false;
							reason = '本月已购';
						}
					}

					// ★★★ 修改：冰美式动态描述（根据咖啡机升级类型显示不同内容）★★★
					let itemDesc = item.desc;
					if (item.id === 'coffee') {
						const count = gameState.coffeeMachineCount || 0;
						const coffeeBoughtThisMonth = gameState.coffeeBoughtThisMonth || 0;

						if (gameState.hasCoffeeMachine && gameState.coffeeMachineUpgrade) {
							// 有升级过的咖啡机：根据升级类型显示
							if (gameState.coffeeMachineUpgrade === 'automatic') {
								// 自动咖啡机：固定+3SAN
								itemDesc = `SAN值+3 (自动咖啡机固定效果)`;
							} else if (gameState.coffeeMachineUpgrade === 'advanced') {
								// 高级咖啡机：累计加成
								const coffeeBonus = getCoffeeMachineBonus();
								const totalBonus = 3 + coffeeBonus;
								const threshold = 12;  // 每12杯+1
								const maxBonus = 5;    // 最多+5
								const nextLevel = coffeeBonus + 1;
								const nextCount = nextLevel * threshold;

								if (coffeeBonus >= maxBonus) {
									itemDesc = `SAN值+${totalBonus} (高级咖啡机已满级+${maxBonus})`;
								} else {
									itemDesc = `SAN值+${totalBonus} (${count}/${nextCount}杯→+${nextLevel})`;
								}
							} else if (gameState.coffeeMachineUpgrade === 'unlimited') {
								// 无限咖啡机：显示本月已购和下杯价格
								const nextPrice = coffeeBoughtThisMonth + 2;
								itemDesc = `SAN值+3 (本月已购${coffeeBoughtThisMonth}杯，本杯${nextPrice}金币)`;
							}
						} else if (gameState.hasCoffeeMachine) {
							// 有咖啡机但未升级：显示基础累计加成
							const coffeeBonus = getCoffeeMachineBonus();
							const totalBonus = 3 + coffeeBonus;
							const threshold = COFFEE_MACHINE_BASE.threshold;  // 15
							const maxBonus = COFFEE_MACHINE_BASE.maxBonus;    // 2
							const nextLevel = coffeeBonus + 1;
							const nextCount = nextLevel * threshold;

							if (coffeeBonus >= maxBonus) {
								itemDesc = `SAN值+${totalBonus} (咖啡机已满级+${maxBonus})`;
							} else {
								itemDesc = `SAN值+${totalBonus} (${count}/${nextCount}杯→+${nextLevel})`;
							}
						} else {
							// 无咖啡机：基础效果
							itemDesc = `SAN值+3 (购买咖啡机可提升效果)`;
						}
					}

					// ★★★ 新增：GPU数量显示 ★★★
					if (item.id === 'gpu_buy') {
						itemDesc = `永久buff-每次做实验多做1次且分数+1 (库存:${gpuBuyAvailable}，已购:${gameState.gpuServersBought || 0})`;
					}
					if (item.id === 'gpu_rent') {
						itemDesc = `本月做实验多做1次且分数+1 (剩余:${gpuRentAvailable}/20)`;
					}

					// ★★★ 商品图标 ★★★
					const itemIcons = {
						'coffee': '☕',
						'gemini': '🤖',
						'gpt': '🧠',
						'claude': '💭',
						'gpu_rent': '💻',
						'gpu_buy': '🖳',
						'chair': '🪑',
						'keyboard': '⌨️',
						'monitor': '🖥️',
						'coffee_machine': '☕',
						'bike': '🚲',
						'down_jacket': '🧥',
						'parasol': '☂️'
					};
					const itemIcon = itemIcons[item.id] || '📦';

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
							<div class="shop-item-name"><span style="font-size:1.2rem;margin-right:6px;">${itemIcon}</span>${item.name}</div>
							<div class="shop-item-desc">${itemDesc}</div>
						</div>
						<div class="shop-item-action">
							<span class="shop-item-price">💰${itemPrice}</span>
							${subscribeBtn}
							<button class="btn btn-primary" onclick="buyItem('${item.id}')" ${!canBuy ? 'disabled' : ''}>${reason || '购买'}</button>
						</div>
					</div>`;
				});

				// ★★★ 新增：预购说明 ★★★
				if (page === 1) {
					html += `<div style="margin-top:10px;padding:8px;background:rgba(52,152,219,0.1);border-radius:6px;font-size:0.75rem;color:var(--text-secondary);">
						<strong>🔔 预购功能：</strong>开启后，在进入下月/点击相关操作按钮时，若金钱足够会自动购买对应物品。
					</div>`;
				}
			}

			html += '</div>';

			showModal('🛒 商店', html, [{ text: '关闭', class: 'btn-info', action: closeModal }]);
		}

		// ★★★ 新增：渲染出售和升级页面 ★★★
		function renderSellAndUpgradePage() {
			let html = '';

			html += `<div style="font-weight:600;margin-bottom:8px;">
				<i class="fas fa-store"></i> 出售和升级
				<span style="font-size:0.8rem;color:var(--text-secondary);margin-left:10px;">(第3页/共4页)</span>
			</div>`;

			// ★★★ 分页按钮 ★★★
			html += `<div style="display:flex;gap:8px;margin-bottom:10px;">
				<button class="btn btn-secondary" onclick="openShop(1)" style="flex:1;padding:6px;">
					消耗品
				</button>
				<button class="btn btn-secondary" onclick="openShop(2)" style="flex:1;padding:6px;">
					永久物品
				</button>
				<button class="btn btn-primary" onclick="openShop(3)" style="flex:1;padding:6px;">
					出售/升级
				</button>
				<button class="btn btn-secondary" onclick="openShop(4)" style="flex:1;padding:6px;">
					🏆成就
				</button>
			</div>`;

			// ★★★ 可出售物品列表 ★★★
			const sellableItems = [
				{ id: 'chair', name: '人体工学椅', icon: '🪑', sellPrice: 5 },
				{ id: 'monitor', name: '2K显示器', icon: '🖥️', sellPrice: 4 },
				{ id: 'keyboard', name: '机械键盘', icon: '⌨️', sellPrice: 4 },
				{ id: 'gpu_buy', name: 'GPU服务器', icon: '🖳', sellPrice: 6 },
				{ id: 'bike', name: '平把公路车', icon: '🚲', sellPrice: 5 },
				{ id: 'coffee_machine', name: '咖啡机', icon: '☕', sellPrice: 3 },
				{ id: 'down_jacket', name: '羽绒服', icon: '🧥', sellPrice: 4 },
				{ id: 'parasol', name: '遮阳伞', icon: '☂️', sellPrice: 4 }
			];

			// 检查是否有可出售的物品
			const ownedSellable = sellableItems.filter(si => {
				if (si.id === 'gpu_buy') {
					return (gameState.gpuServersBought || 0) > 0;
				}
				if (si.id === 'bike') {
					return gameState.hasBike;
				}
				if (si.id === 'down_jacket') {
					return gameState.hasDownJacket;
				}
				if (si.id === 'parasol') {
					return gameState.hasParasol;
				}
				if (si.id === 'coffee_machine') {
					return gameState.hasCoffeeMachine;
				}
				return gameState.furnitureBought && gameState.furnitureBought[si.id.replace('_buy', '')];
			});

			if (ownedSellable.length === 0) {
				html += `<div style="padding:20px;text-align:center;color:var(--text-secondary);background:var(--light-bg);border-radius:8px;margin-bottom:15px;">
					<div style="font-size:2rem;margin-bottom:8px;">📦</div>
					<div>暂无可出售或可升级的物品</div>
					<div style="font-size:0.8rem;margin-top:5px;">请先在永久物品页购买装备</div>
				</div>`;
			} else {
				// 出售区域
				html += `<div style="margin-bottom:15px;padding:10px;background:linear-gradient(135deg,rgba(253,203,110,0.2),rgba(243,156,18,0.2));border-radius:8px;border:1px solid rgba(243,156,18,0.4);">
					<div style="font-weight:600;color:#d68910;margin-bottom:8px;"><i class="fas fa-coins"></i> 出售物品（半价回收）</div>`;

				ownedSellable.forEach(si => {
					let ownedCount = 1;
					if (si.id === 'gpu_buy') {
						ownedCount = gameState.gpuServersBought || 0;
					}

					// ★★★ 椅子升级信息 ★★★
					let displayName = si.name;
					let displayIcon = si.icon;
					let effectDesc = '';
					let upgradeBtn = '';
					if (si.id === 'chair') {
						const chairUpgrade = gameState.chairUpgrade;
						if (chairUpgrade && typeof CHAIR_UPGRADES !== 'undefined' && CHAIR_UPGRADES[chairUpgrade]) {
							displayIcon = CHAIR_UPGRADES[chairUpgrade].icon;
							displayName = CHAIR_UPGRADES[chairUpgrade].name;
							effectDesc = CHAIR_UPGRADES[chairUpgrade].desc;
						} else {
							effectDesc = '每月SAN+1';
						}
						// ★★★ 只有未升级时才显示升级按钮 ★★★
						if (!chairUpgrade) {
							upgradeBtn = `<span class="shop-item-price" style="color:var(--warning-color);margin-right:4px;">💰18-20</span><button class="btn btn-success" onclick="showChairUpgradeModal()" style="padding:4px 10px;font-size:0.75rem;margin-right:4px;">升级</button>`;
						}
					}

					// ★★★ 自行车升级信息 ★★★
					if (si.id === 'bike') {
						const bikeUpgrade = gameState.bikeUpgrade;
						if (bikeUpgrade && typeof BIKE_UPGRADES !== 'undefined' && BIKE_UPGRADES[bikeUpgrade]) {
							displayIcon = BIKE_UPGRADES[bikeUpgrade].icon;
							displayName = BIKE_UPGRADES[bikeUpgrade].name;
							effectDesc = BIKE_UPGRADES[bikeUpgrade].desc;
						} else {
							effectDesc = '每月SAN-1，每累计6点换SAN上限+1';
						}
						// ★★★ 只有未升级时才显示升级按钮 ★★★
						if (!bikeUpgrade) {
							upgradeBtn = `<span class="shop-item-price" style="color:var(--warning-color);margin-right:4px;">💰12-20</span><button class="btn btn-success" onclick="showBikeUpgradeModal()" style="padding:4px 10px;font-size:0.75rem;margin-right:4px;">升级</button>`;
						}
					}

					// ★★★ 咖啡机升级信息 ★★★
					if (si.id === 'coffee_machine') {
						const coffeeMachineUpgrade = gameState.coffeeMachineUpgrade;
						if (coffeeMachineUpgrade && typeof COFFEE_MACHINE_UPGRADES !== 'undefined' && COFFEE_MACHINE_UPGRADES[coffeeMachineUpgrade]) {
							displayIcon = COFFEE_MACHINE_UPGRADES[coffeeMachineUpgrade].icon;
							displayName = COFFEE_MACHINE_UPGRADES[coffeeMachineUpgrade].name;
							effectDesc = COFFEE_MACHINE_UPGRADES[coffeeMachineUpgrade].desc;
						} else {
							effectDesc = '每累计喝15杯冰美式，SAN回复+1（最多+2）';
						}
						// ★★★ 只有未升级时才显示升级按钮 ★★★
						if (!coffeeMachineUpgrade) {
							upgradeBtn = `<span class="shop-item-price" style="color:var(--warning-color);margin-right:4px;">💰16-20</span><button class="btn btn-success" onclick="showCoffeeMachineUpgradeModal()" style="padding:4px 10px;font-size:0.75rem;margin-right:4px;">升级</button>`;
						}
					}

					// ★★★ 显示器升级信息 ★★★
					if (si.id === 'monitor') {
						const monitorUpgrade = gameState.monitorUpgrade;
						if (monitorUpgrade && typeof MONITOR_UPGRADES !== 'undefined' && MONITOR_UPGRADES[monitorUpgrade]) {
							displayIcon = MONITOR_UPGRADES[monitorUpgrade].icon;
							displayName = MONITOR_UPGRADES[monitorUpgrade].name;
							effectDesc = MONITOR_UPGRADES[monitorUpgrade].desc;
						} else {
							effectDesc = '看论文SAN-1';
						}
						// ★★★ 只有未升级时才显示升级按钮 ★★★
						if (!monitorUpgrade) {
							upgradeBtn = `<span class="shop-item-price" style="color:var(--warning-color);margin-right:4px;">💰15</span><button class="btn btn-success" onclick="showMonitorUpgradeModal()" style="padding:4px 10px;font-size:0.75rem;margin-right:4px;">升级</button>`;
						}
					}

					// ★★★ 其他物品的效果描述 ★★★
					if (si.id === 'keyboard') {
						effectDesc = '写论文SAN-3，分数+1';
					} else if (si.id === 'gpu_buy') {
						effectDesc = '每次做实验多做1次且分数+1';
					} else if (si.id === 'down_jacket') {
						effectDesc = '冬季"寒风刺骨"debuff无效';
					} else if (si.id === 'parasol') {
						effectDesc = '夏季"烈日当空"debuff无效';
					}

					html += `<div class="shop-item" style="background:var(--card-bg);">
						<div class="shop-item-info">
							<div class="shop-item-name"><span style="font-size:1.2rem;margin-right:6px;">${displayIcon}</span>${displayName} ${ownedCount > 1 ? `(×${ownedCount})` : ''}</div>
							<div class="shop-item-desc">${effectDesc ? `效果：${effectDesc}` : ''}</div>
						</div>
						<div class="shop-item-action">
							${upgradeBtn}<span class="shop-item-price" style="color:var(--success-color);margin-right:4px;">+💰${si.sellPrice}</span>
							<button class="btn btn-warning" onclick="sellItem('${si.id}')" style="padding:4px 10px;font-size:0.75rem;">出售</button>
						</div>
					</div>`;
				});

				html += '</div>';
			}

			// ★★★ 升级说明 ★★★
			html += `<div style="padding:10px;background:var(--light-bg);border-radius:8px;font-size:0.75rem;color:var(--text-secondary);">
				<div style="font-weight:600;margin-bottom:5px;">💡 升级说明</div>
				<div>• 人体工学椅、自行车、咖啡机和显示器购买后可以进行升级（消耗金币）</div>
				<div>• 卖出后重新购买可以选择新的升级方向</div>
			</div>`;

			return html;
		}

		// ==================== 显示器升级系统 ====================
		const MONITOR_UPGRADES = {
			'4k': {
				name: '4K显示器',
				icon: '🖥️',
				desc: '看论文SAN-0（不消耗SAN）',
				price: 15,
				effect: 'read_no_san'  // 看论文不消耗SAN
			},
			'smart': {
				name: '智能显示器',
				icon: '📺',
				desc: '看论文SAN-2，每10次看论文buff效果+1',
				price: 15,
				effect: 'read_buff_bonus'  // 每10次看论文buff效果+1
			},
			'dual': {
				name: '双屏显示器',
				icon: '🖥️🖥️',
				desc: '看论文SAN-2，每月自动看一次（-2SAN）',
				price: 15,
				effect: 'auto_read'  // 每月自动看论文
			}
		};

		// 显示显示器升级选项
		function showMonitorUpgradeModal() {
			const currentUpgrade = gameState.monitorUpgrade;

			// 如果已经升级过，不能再升级
			if (currentUpgrade) {
				const upgrade = MONITOR_UPGRADES[currentUpgrade];
				// ★★★ 修改：智能显示器使用专用计数器 ★★★
				const isSmartMonitor = currentUpgrade === 'smart';
				const displayCount = isSmartMonitor ? (gameState.smartMonitorReadCount || 0) : (gameState.readCount || 0);
				const bonusLevel = isSmartMonitor ? Math.floor(displayCount / 10) : 0;
				const bonusText = isSmartMonitor ? `已累计：${displayCount}次 | 当前加成：+${bonusLevel}` : '';
				showModal('🖥️ 显示器升级',
					`<div style="text-align:center;">
						<div style="font-size:3rem;margin-bottom:10px;">${upgrade.icon}</div>
						<div style="font-weight:600;font-size:1.1rem;">${upgrade.name}</div>
						<div style="font-size:0.9rem;color:var(--text-secondary);margin-top:8px;">效果：${upgrade.desc}</div>
						${bonusText ? `<div style="font-size:0.85rem;color:var(--success-color);margin-top:4px;">${bonusText}</div>` : ''}
						<div style="margin-top:15px;padding:12px;background:var(--light-bg);border-radius:8px;">
							<p style="color:var(--text-secondary);font-size:0.85rem;margin:0;">
								<i class="fas fa-info-circle"></i> 显示器已升级完成<br>
								如需更换，请先卖出后重新购买
							</p>
						</div>
					</div>`,
					[{ text: '返回商店', class: 'btn-info', action: () => { closeModal(); openShop(); } }]
				);
				return;
			}

			const readCount = gameState.readCount || 0;

			let html = `
				<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:2rem;margin-bottom:8px;">🖥️</div>
					<div style="font-weight:600;">当前：2K显示器</div>
					<div style="font-size:0.85rem;color:var(--text-secondary);">效果：看论文变为SAN-1</div>
					<div style="font-size:0.85rem;color:var(--success-color);margin-top:4px;">已看论文：${readCount}次</div>
				</div>
				<div style="font-weight:600;margin-bottom:10px;">选择升级方向（只能选择一次）：</div>
			`;

			Object.entries(MONITOR_UPGRADES).forEach(([key, upgrade]) => {
				const canAfford = gameState.gold >= upgrade.price;

				html += `
					<div class="shop-item ${!canAfford ? 'disabled' : ''}" style="margin-bottom:8px;">
						<div class="shop-item-info">
							<div class="shop-item-name">${upgrade.icon} ${upgrade.name}</div>
							<div class="shop-item-desc">${upgrade.desc}</div>
						</div>
						<div class="shop-item-action">
							<span class="shop-item-price">💰${upgrade.price}</span>
							<button class="btn btn-primary" onclick="upgradeMonitor('${key}')" ${!canAfford ? 'disabled' : ''}>
								${canAfford ? '升级' : '金币不足'}
							</button>
						</div>
					</div>
				`;
			});

			showModal('🖥️ 显示器升级', html, [
				{ text: '返回商店', class: 'btn-info', action: () => { closeModal(); openShop(); } }
			]);
		}

		// 执行显示器升级
		function upgradeMonitor(upgradeKey) {
			const upgrade = MONITOR_UPGRADES[upgradeKey];
			if (!upgrade) return;

			if (gameState.gold < upgrade.price) {
				showModal('❌ 升级失败', `<p>金币不足！升级到${upgrade.name}需要${upgrade.price}金币，当前只有${gameState.gold}金币。</p>`,
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			// 扣除金币
			gameState.gold -= upgrade.price;

			// 记录升级状态
			gameState.monitorUpgrade = upgradeKey;

			// ★★★ 触发高级装备成就条件 ★★★
			gameState.achievementConditions = gameState.achievementConditions || {};
			gameState.achievementConditions.upgradedEquipment = true;
			// ★★★ 修复：立即检查成就 ★★★
			if (typeof checkInGameAchievements === 'function') checkInGameAchievements();

			addLog('升级', `显示器升级为${upgrade.name}`, `金币-${upgrade.price}，${upgrade.desc}`);

			closeModal();
			openShop();
			updateAllUI();
			updateBuffs();
		}

		// 获取4K显示器提供的想idea加成
		function getMonitorIdeaBonus() {
			if (!gameState.monitorUpgrade) return 0;
			const readCount = gameState.readCount || 0;
			return Math.floor(readCount / 10);
		}

		// ==================== 人体工学椅升级系统 ====================
		const CHAIR_UPGRADES = {
			advanced: {
				name: '高级人体工学椅',
				icon: '💺',
				desc: '每月SAN+2',
				price: 18,
				effect: 'monthly_san_2'  // 每月固定+2
			},
			massage: {
				name: '电动沙发按摩椅',
				icon: '🛋️',
				desc: '每月恢复10%已损失SAN（上取整）',
				price: 20,
				effect: 'monthly_san_lost_10'  // 每月+10%已损失SAN
			},
			torture: {
				name: '头悬梁锥刺股椅',
				icon: '⚔️',
				desc: '每月恢复当前SAN的20%（上取整）',
				price: 20,
				effect: 'monthly_san_current_20'  // 每月+20%当前SAN
			}
		};

		// 显示椅子升级选项
		function showChairUpgradeModal() {
			const currentUpgrade = gameState.chairUpgrade;

			// ★★★ 修复：如果已经升级过，不能再选择其他方向 ★★★
			if (currentUpgrade) {
				const upgrade = CHAIR_UPGRADES[currentUpgrade];
				showModal('🪑 椅子升级',
					`<div style="text-align:center;">
						<div style="font-size:3rem;margin-bottom:10px;">${upgrade.icon}</div>
						<div style="font-weight:600;font-size:1.1rem;">${upgrade.name}</div>
						<div style="font-size:0.9rem;color:var(--text-secondary);margin-top:8px;">效果：${upgrade.desc}</div>
						<div style="margin-top:15px;padding:12px;background:var(--light-bg);border-radius:8px;">
							<p style="color:var(--text-secondary);font-size:0.85rem;margin:0;">
								<i class="fas fa-info-circle"></i> 椅子已升级完成<br>
								如需更换升级方向，请先卖出椅子后重新购买
							</p>
						</div>
					</div>`,
					[{ text: '返回商店', class: 'btn-info', action: () => { closeModal(); openShop(); } }]
				);
				return;
			}

			let html = `
				<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:2rem;margin-bottom:8px;">🪑</div>
					<div style="font-weight:600;">当前：人体工学椅</div>
					<div style="font-size:0.85rem;color:var(--text-secondary);">效果：每月SAN+1</div>
				</div>
				<div style="font-weight:600;margin-bottom:10px;">选择升级方向（只能选择一次）：</div>
			`;

			Object.entries(CHAIR_UPGRADES).forEach(([key, upgrade]) => {
				const canAfford = gameState.gold >= upgrade.price;

				html += `
					<div class="shop-item ${!canAfford ? 'disabled' : ''}" style="margin-bottom:8px;">
						<div class="shop-item-info">
							<div class="shop-item-name">${upgrade.icon} ${upgrade.name}</div>
							<div class="shop-item-desc">${upgrade.desc}</div>
						</div>
						<div class="shop-item-action">
							<span class="shop-item-price">💰${upgrade.price}</span>
							<button class="btn btn-primary" onclick="upgradeChair('${key}')" ${!canAfford ? 'disabled' : ''}>
								${canAfford ? '升级' : '金币不足'}
							</button>
						</div>
					</div>
				`;
			});

			showModal('🪑 椅子升级', html, [
				{ text: '返回商店', class: 'btn-info', action: () => { closeModal(); openShop(); } }
			]);
		}

		// 执行椅子升级
		function upgradeChair(upgradeKey) {
			const upgrade = CHAIR_UPGRADES[upgradeKey];
			if (!upgrade) return;

			if (gameState.gold < upgrade.price) {
				showModal('❌ 升级失败', `<p>金币不足！升级到${upgrade.name}需要${upgrade.price}金币，当前只有${gameState.gold}金币。</p>`,
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			// 扣除金币
			gameState.gold -= upgrade.price;

			// 移除旧的椅子buff
			gameState.buffs.permanent = gameState.buffs.permanent.filter(b =>
				b.type !== 'monthly_san' &&
				b.type !== 'monthly_san_2' &&
				b.type !== 'monthly_san_lost_10' &&
				b.type !== 'monthly_san_current_20'
			);

			// 添加新的升级buff
			gameState.buffs.permanent.push({
				type: upgrade.effect,
				name: upgrade.name,
				desc: upgrade.desc,
				permanent: true
			});

			// 记录升级状态
			gameState.chairUpgrade = upgradeKey;

			// ★★★ 新增：触发高级装备成就条件 ★★★
			gameState.achievementConditions = gameState.achievementConditions || {};
			gameState.achievementConditions.upgradedEquipment = true;
			// ★★★ 修复：立即检查成就 ★★★
			if (typeof checkInGameAchievements === 'function') checkInGameAchievements();

			addLog('升级', `椅子升级为${upgrade.name}`, `金币-${upgrade.price}，${upgrade.desc}`);

			closeModal();
			openShop();
			updateAllUI();
			updateBuffs();
		}

		// ==================== 自行车升级系统 ====================
		// 显示自行车升级选项
		function showBikeUpgradeModal() {
			const currentUpgrade = gameState.bikeUpgrade;

			// 如果已经升级过，不能再选择其他方向
			if (currentUpgrade) {
				const upgrade = BIKE_UPGRADES[currentUpgrade];
				showModal('🚲 自行车升级',
					`<div style="text-align:center;">
						<div style="font-size:3rem;margin-bottom:10px;">${upgrade.icon}</div>
						<div style="font-weight:600;font-size:1.1rem;">${upgrade.name}</div>
						<div style="font-size:0.9rem;color:var(--text-secondary);margin-top:8px;">效果：${upgrade.desc}</div>
						<div style="margin-top:15px;padding:12px;background:var(--light-bg);border-radius:8px;">
							<p style="color:var(--text-secondary);font-size:0.85rem;margin:0;">
								<i class="fas fa-info-circle"></i> 自行车已升级完成<br>
								如需更换升级方向，请先卖出后重新购买
							</p>
						</div>
					</div>`,
					[{ text: '返回商店', class: 'btn-info', action: () => { closeModal(); openShop(); } }]
				);
				return;
			}

			let html = `
				<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:2rem;margin-bottom:8px;">🚲</div>
					<div style="font-weight:600;">当前：平把公路车</div>
					<div style="font-size:0.85rem;color:var(--text-secondary);">效果：每月SAN-1，每累计减少6后SAN上限+1</div>
					<div style="font-size:0.85rem;color:var(--success-color);margin-top:4px;">累计骑行消耗：${gameState.bikeSanSpent || 0} SAN</div>
				</div>
				<div style="font-weight:600;margin-bottom:10px;">选择升级方向（只能选择一次）：</div>
			`;

			Object.entries(BIKE_UPGRADES).forEach(([key, upgrade]) => {
				const canAfford = gameState.gold >= upgrade.price;

				html += `
					<div class="shop-item ${!canAfford ? 'disabled' : ''}" style="margin-bottom:8px;">
						<div class="shop-item-info">
							<div class="shop-item-name">${upgrade.icon} ${upgrade.name}</div>
							<div class="shop-item-desc">${upgrade.desc}</div>
						</div>
						<div class="shop-item-action">
							<span class="shop-item-price">💰${upgrade.price}</span>
							<button class="btn btn-primary" onclick="upgradeBike('${key}')" ${!canAfford ? 'disabled' : ''}>
								${canAfford ? '升级' : '金币不足'}
							</button>
						</div>
					</div>
				`;
			});

			showModal('🚲 自行车升级', html, [
				{ text: '返回商店', class: 'btn-info', action: () => { closeModal(); openShop(); } }
			]);
		}

		// 执行自行车升级
		function upgradeBike(upgradeKey) {
			const upgrade = BIKE_UPGRADES[upgradeKey];
			if (!upgrade) return;

			if (gameState.gold < upgrade.price) {
				showModal('❌ 升级失败', `<p>金币不足！升级到${upgrade.name}需要${upgrade.price}金币，当前只有${gameState.gold}金币。</p>`,
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			// 扣除金币
			gameState.gold -= upgrade.price;

			// 记录升级状态（保留累计骑行消耗）
			gameState.bikeUpgrade = upgradeKey;

			// ★★★ 新增：升级弯把公路车时触发高级装备成就条件 ★★★
			if (upgradeKey === 'road') {
				gameState.achievementConditions = gameState.achievementConditions || {};
				gameState.achievementConditions.upgradedEquipment = true;
				// ★★★ 修复：立即检查成就 ★★★
				if (typeof checkInGameAchievements === 'function') checkInGameAchievements();
			}

			// ★★★ 新增：升级小电驴时检查整装待发成就 ★★★
			if (upgradeKey === 'ebike') {
				if (gameState.hasParasol && gameState.hasDownJacket) {
					// ★★★ 修复：立即检查成就 ★★★
					if (typeof checkInGameAchievements === 'function') checkInGameAchievements();
				}
			}

			addLog('升级', `自行车升级为${upgrade.name}`, `金币-${upgrade.price}，${upgrade.desc}`);

			closeModal();
			openShop();
			updateAllUI();
			updateBuffs();
		}

		// ==================== 咖啡机升级系统 ====================
		// 基础咖啡机参数
		const COFFEE_MACHINE_BASE = {
			threshold: 15,  // 每15杯+1
			maxBonus: 2     // 最多+2
		};
		const COFFEE_MACHINE_UPGRADES = {
			automatic: {
				name: '自动咖啡机',
				icon: '🤖☕',
				desc: '冰美式固定+3SAN，每月自动喝一次（-2金币）',
				price: 16,
				effect: 'auto_coffee'  // 每月自动喝咖啡
			},
			advanced: {
				name: '高级咖啡机',
				icon: '☕✨',
				desc: '每累计喝12杯冰美式，SAN回复+1（最多+5）',
				price: 20,
				threshold: 12,  // 每12杯+1
				maxBonus: 5,    // 最多+5
				effect: 'coffee_bonus'
			},
			unlimited: {
				name: '无限咖啡机',
				icon: '☕∞',
				desc: '冰美式固定+3SAN，每月可无限购买（价格递增2,3,4...）',
				price: 18,
				effect: 'unlimited_coffee'  // 无限购买
			}
		};

		// 获取咖啡机提供的SAN加成
		function getCoffeeMachineBonus() {
			if (!gameState.hasCoffeeMachine) return 0;
			// ★★★ 高级咖啡机：使用高级参数 ★★★
			if (gameState.coffeeMachineUpgrade === 'advanced') {
				return gameState.coffeeMachineBonusLevel || 0;
			}
			// ★★★ 基础咖啡机（未升级）：使用基础参数 ★★★
			if (!gameState.coffeeMachineUpgrade) {
				return gameState.coffeeMachineBonusLevel || 0;
			}
			// 自动咖啡机/无限咖啡机：无累计加成
			return 0;
		}

		// 更新咖啡机加成等级
		function updateCoffeeMachineBonus() {
			if (!gameState.hasCoffeeMachine) return;

			const count = gameState.coffeeMachineCount || 0;
			let threshold, maxBonus, logTitle;

			if (gameState.coffeeMachineUpgrade === 'advanced') {
				// ★★★ 高级咖啡机：每12杯+1，最多+5 ★★★
				threshold = COFFEE_MACHINE_UPGRADES.advanced.threshold;  // 12
				maxBonus = COFFEE_MACHINE_UPGRADES.advanced.maxBonus;    // 5
				logTitle = '高级咖啡机';
			} else if (!gameState.coffeeMachineUpgrade) {
				// ★★★ 基础咖啡机：每15杯+1，最多+2 ★★★
				threshold = COFFEE_MACHINE_BASE.threshold;  // 15
				maxBonus = COFFEE_MACHINE_BASE.maxBonus;    // 2
				logTitle = '咖啡机';
			} else {
				// 自动咖啡机/无限咖啡机：无累计加成
				return;
			}

			const newLevel = Math.min(maxBonus, Math.floor(count / threshold));
			if (newLevel > (gameState.coffeeMachineBonusLevel || 0)) {
				gameState.coffeeMachineBonusLevel = newLevel;
				addLog(logTitle, '咖啡机效果提升', `冰美式SAN回复+${newLevel}（累计${count}杯）`);
			}
		}

		// 显示咖啡机升级选项
		function showCoffeeMachineUpgradeModal() {
			const currentUpgrade = gameState.coffeeMachineUpgrade;

			// 如果已经升级过，不能再升级
			if (currentUpgrade) {
				const upgrade = COFFEE_MACHINE_UPGRADES[currentUpgrade];
				const count = gameState.coffeeMachineCount || 0;
				const bonus = gameState.coffeeMachineBonusLevel || 0;
				// ★★★ 根据升级类型显示不同统计信息 ★★★
				let statsInfo = `累计喝咖啡：${count}杯`;
				if (currentUpgrade === 'advanced') {
					statsInfo += ` | 当前加成：+${bonus}`;
				}
				showModal('☕ 咖啡机升级',
					`<div style="text-align:center;">
						<div style="font-size:3rem;margin-bottom:10px;">${upgrade.icon}</div>
						<div style="font-weight:600;font-size:1.1rem;">${upgrade.name}</div>
						<div style="font-size:0.9rem;color:var(--text-secondary);margin-top:8px;">效果：${upgrade.desc}</div>
						<div style="font-size:0.85rem;color:var(--success-color);margin-top:4px;">${statsInfo}</div>
						<div style="margin-top:15px;padding:12px;background:var(--light-bg);border-radius:8px;">
							<p style="color:var(--text-secondary);font-size:0.85rem;margin:0;">
								<i class="fas fa-info-circle"></i> 咖啡机已升级完成<br>
								如需更换升级方向，请先卖出后重新购买
							</p>
						</div>
					</div>`,
					[{ text: '返回商店', class: 'btn-info', action: () => { closeModal(); openShop(); } }]
				);
				return;
			}

			const count = gameState.coffeeMachineCount || 0;
			const currentBonus = getCoffeeMachineBonus();
			const bonusInfo = currentBonus > 0 ? ` | 当前加成：+${currentBonus}` : '';

			let html = `
				<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:2rem;margin-bottom:8px;">☕</div>
					<div style="font-weight:600;">当前：咖啡机</div>
					<div style="font-size:0.85rem;color:var(--text-secondary);">效果：每累计喝${COFFEE_MACHINE_BASE.threshold}杯冰美式，SAN回复+1（最多+${COFFEE_MACHINE_BASE.maxBonus}）</div>
					<div style="font-size:0.85rem;color:var(--success-color);margin-top:4px;">累计喝咖啡：${count}杯${bonusInfo}</div>
				</div>
				<div style="font-weight:600;margin-bottom:10px;">选择升级方向（只能选择一次）：</div>
			`;

			Object.entries(COFFEE_MACHINE_UPGRADES).forEach(([key, upgrade]) => {
				const canAfford = gameState.gold >= upgrade.price;

				html += `
					<div class="shop-item ${!canAfford ? 'disabled' : ''}" style="margin-bottom:8px;">
						<div class="shop-item-info">
							<div class="shop-item-name">${upgrade.icon} ${upgrade.name}</div>
							<div class="shop-item-desc">${upgrade.desc}</div>
						</div>
						<div class="shop-item-action">
							<span class="shop-item-price">💰${upgrade.price}</span>
							<button class="btn btn-primary" onclick="upgradeCoffeeMachine('${key}')" ${!canAfford ? 'disabled' : ''}>
								${canAfford ? '升级' : '金币不足'}
							</button>
						</div>
					</div>
				`;
			});

			showModal('☕ 咖啡机升级', html, [
				{ text: '返回商店', class: 'btn-info', action: () => { closeModal(); openShop(); } }
			]);
		}

		// 执行咖啡机升级
		function upgradeCoffeeMachine(upgradeKey) {
			const upgrade = COFFEE_MACHINE_UPGRADES[upgradeKey];
			if (!upgrade) return;

			if (gameState.gold < upgrade.price) {
				showModal('❌ 升级失败', `<p>金币不足！升级到${upgrade.name}需要${upgrade.price}金币，当前只有${gameState.gold}金币。</p>`,
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			// 扣除金币
			gameState.gold -= upgrade.price;

			// 记录升级状态（保留累计喝咖啡数量）
			gameState.coffeeMachineUpgrade = upgradeKey;

			// ★★★ 咖啡机升级触发高级装备成就 ★★★
			gameState.achievementConditions = gameState.achievementConditions || {};
			gameState.achievementConditions.upgradedEquipment = true;
			// ★★★ 修复：立即检查成就 ★★★
			if (typeof checkInGameAchievements === 'function') checkInGameAchievements();

			// ★★★ 只有高级咖啡机才需要计算加成等级 ★★★
			if (upgradeKey === 'advanced') {
				const count = gameState.coffeeMachineCount || 0;
				gameState.coffeeMachineBonusLevel = Math.min(upgrade.maxBonus, Math.floor(count / upgrade.threshold));
			}

			addLog('升级', `咖啡机升级为${upgrade.name}`, `金币-${upgrade.price}，${upgrade.desc}`);

			closeModal();
			openShop();
			updateAllUI();
			updateBuffs();
		}

		// ★★★ 新增：出售物品函数 ★★★
		function sellItem(id) {
			// ★★★ 修复：椅子卖出价格根据升级状态计算 ★★★
			const getChairSellPrice = () => {
				let basePrice = 5;
				if (gameState.chairUpgrade) {
					const upgrade = CHAIR_UPGRADES[gameState.chairUpgrade];
					// 升级后卖出价格 = 基础价格 + 升级价格的一半（下取整）
					basePrice += Math.floor(upgrade.price / 2);
				}
				return basePrice;
			};

			// ★★★ 新增：自行车卖出价格根据升级状态计算 ★★★
			const getBikeSellPrice = () => {
				let basePrice = 5;
				if (gameState.bikeUpgrade) {
					const upgrade = BIKE_UPGRADES[gameState.bikeUpgrade];
					// 升级后卖出价格 = 基础价格 + 升级价格的一半（下取整）
					basePrice += Math.floor(upgrade.price / 2);
				}
				return basePrice;
			};

			// ★★★ 新增：咖啡机卖出价格根据升级状态计算 ★★★
			const getCoffeeMachineSellPrice = () => {
				let basePrice = 3;
				if (gameState.coffeeMachineUpgrade) {
					const upgrade = COFFEE_MACHINE_UPGRADES[gameState.coffeeMachineUpgrade];
					// 升级后卖出价格 = 基础价格 + 升级价格的一半（下取整）
					basePrice += Math.floor(upgrade.price / 2);
				}
				return basePrice;
			};

			// ★★★ 新增：显示器卖出价格根据升级状态计算 ★★★
			const getMonitorSellPrice = () => {
				let basePrice = 4;
				if (gameState.monitorUpgrade) {
					const upgrade = MONITOR_UPGRADES[gameState.monitorUpgrade];
					// 升级后卖出价格 = 基础价格 + 升级价格的一半（下取整）
					basePrice += Math.floor(upgrade.price / 2);
				}
				return basePrice;
			};

			const sellPrices = {
				'chair': getChairSellPrice(),
				'monitor': getMonitorSellPrice(),
				'keyboard': 4,
				'gpu_buy': 6,
				'bike': getBikeSellPrice(),
				'down_jacket': 4,
				'parasol': 4,
				'coffee_machine': getCoffeeMachineSellPrice()
			};

			const sellPrice = sellPrices[id];
			if (sellPrice === undefined) return;

			let canSell = false;
			let itemName = '';

			switch (id) {
				case 'chair':
					canSell = gameState.furnitureBought && gameState.furnitureBought.chair;
					// ★★★ 修复：显示升级后的椅子名称 ★★★
					if (gameState.chairUpgrade) {
						itemName = CHAIR_UPGRADES[gameState.chairUpgrade].name;
					} else {
						itemName = '人体工学椅';
					}
					break;
				case 'monitor':
					canSell = gameState.furnitureBought && gameState.furnitureBought.monitor;
					// ★★★ 修复：显示升级后的显示器名称 ★★★
					if (gameState.monitorUpgrade) {
						itemName = MONITOR_UPGRADES[gameState.monitorUpgrade].name;
					} else {
						itemName = '2K显示器';
					}
					break;
				case 'keyboard':
					canSell = gameState.furnitureBought && gameState.furnitureBought.keyboard;
					itemName = '机械键盘';
					break;
				case 'gpu_buy':
					canSell = (gameState.gpuServersBought || 0) > 0;
					itemName = 'GPU服务器';
					break;
				case 'bike':
					canSell = gameState.hasBike;
					// 显示升级后的名称
					if (gameState.bikeUpgrade) {
						itemName = BIKE_UPGRADES[gameState.bikeUpgrade].name;
					} else {
						itemName = '平把公路车';
					}
					break;
				case 'down_jacket':
					canSell = gameState.hasDownJacket;
					itemName = '羽绒服';
					break;
				case 'parasol':
					canSell = gameState.hasParasol;
					itemName = '遮阳伞';
					break;
				case 'coffee_machine':
					canSell = gameState.hasCoffeeMachine;
					// 显示升级后的名称
					if (gameState.coffeeMachineUpgrade) {
						itemName = COFFEE_MACHINE_UPGRADES[gameState.coffeeMachineUpgrade].name;
					} else {
						itemName = '咖啡机';
					}
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
								// ★★★ 修复：移除所有椅子相关buff（包括基础和升级版本）★★★
								gameState.buffs.permanent = gameState.buffs.permanent.filter(b =>
									b.type !== 'monthly_san' &&
									b.type !== 'monthly_san_2' &&
									b.type !== 'monthly_san_lost_10' &&
									b.type !== 'monthly_san_current_20'
								);
								// ★★★ 修复：重置升级状态，再次购买可重新选择升级方向 ★★★
								gameState.chairUpgrade = null;
								// 恢复商店状态
								const chairItem = shopItems.find(i => i.id === 'chair');
								if (chairItem) chairItem.bought = false;
								break;
							case 'monitor':
								gameState.furnitureBought.monitor = false;
								gameState.buffs.permanent = gameState.buffs.permanent.filter(b => b.type !== 'read_san_reduce');
								// ★★★ 重置升级状态，再次购买可重新选择升级方向 ★★★
								gameState.monitorUpgrade = null;
								// 注意：累计看论文次数（readCount）保留，不重置
								// 注意：智能显示器专用计数（smartMonitorReadCount）保留，再次购买智能显示器时恢复累积效果
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
							case 'bike':
								gameState.hasBike = false;
								// 重置升级状态，再次购买可重新选择升级方向
								gameState.bikeUpgrade = null;
								// 注意：累计骑行消耗（bikeSanSpent）保留，不重置
								// 恢复商店状态
								const bikeItem = shopItems.find(i => i.id === 'bike');
								if (bikeItem) bikeItem.bought = false;
								break;
							case 'down_jacket':
								gameState.hasDownJacket = false;
								const downJacketItem = shopItems.find(i => i.id === 'down_jacket');
								if (downJacketItem) downJacketItem.bought = false;
								break;
							case 'parasol':
								gameState.hasParasol = false;
								const parasolItem = shopItems.find(i => i.id === 'parasol');
								if (parasolItem) parasolItem.bought = false;
								break;
							case 'coffee_machine':
								gameState.hasCoffeeMachine = false;
								// 重置升级状态，再次购买可重新选择升级方向
								gameState.coffeeMachineUpgrade = null;
								// 注意：累计喝咖啡数量（coffeeMachineCount）保留，不重置，但加成失效
								gameState.coffeeMachineBonusLevel = 0;
								// 恢复商店状态
								const coffeeMachineItem = shopItems.find(i => i.id === 'coffee_machine');
								if (coffeeMachineItem) coffeeMachineItem.bought = false;
								break;
						}
						
						// 检查豪华工位成就条件
						if (gameState.furnitureBought) {
							const hasAll = gameState.furnitureBought.chair &&
										   gameState.furnitureBought.monitor &&
										   gameState.furnitureBought.keyboard &&
										   (gameState.gpuServersBought || 0) >= 1 &&
										   gameState.hasCoffeeMachine;
							if (!hasAll && gameState.achievementConditions) {
								gameState.achievementConditions.fullFurnitureSet = false;
							}
						}
						
						gameState.gold += sellPrice;
						clampGold();  // ★★★ 赤贫学子诅咒 ★★★
						// ★★★ 新增：追踪累计卖出金币（倒买倒卖成就）★★★
						gameState.totalSoldCoins = (gameState.totalSoldCoins || 0) + sellPrice;
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

            // 冰美式价格（无限咖啡机价格递增2,3,4...）
            let actualPrice = item.price;
            if (id === 'coffee' && gameState.coffeeMachineUpgrade === 'unlimited') {
                const coffeeBoughtThisMonth = gameState.coffeeBoughtThisMonth || 0;
                actualPrice = coffeeBoughtThisMonth + 2;  // 第1杯2金币，第2杯3金币...
            }

            if (gameState.gold < actualPrice) {
                showModal('❌ 购买失败', `<p>金钱不足！购买${item.name}需要${actualPrice}金币，当前只有${gameState.gold}金币。</p>`,
                    [{ text: '确定', class: 'btn-primary', action: closeModal }]);
                return;
            }

            return executeBuyItem(id, false);
        }

        // ★★★ 新增：执行购买物品（可由订阅自动触发）★★★
        function executeBuyItem(id, isAutoSubscription = false) {
            const item = shopItems.find(i => i.id === id);
            if (!item) return false;

            // 冰美式价格（无限咖啡机价格递增2,3,4...）
            let actualPrice = item.price;
            if (id === 'coffee' && gameState.coffeeMachineUpgrade === 'unlimited') {
                const coffeeBoughtThisMonth = gameState.coffeeBoughtThisMonth || 0;
                actualPrice = coffeeBoughtThisMonth + 2;  // 第1杯2金币，第2杯3金币...
            }

            if (gameState.gold < actualPrice) {
                return false;
            }

            // 检查购买限制
            if (item.once && item.bought) return false;
            // ★★★ 冰美式使用单独的计数器检查 ★★★
            if (item.monthlyOnce && item.boughtThisMonth && id !== 'coffee') return false;

            // 冰美式每月购买上限1杯（无限咖啡机除外）
            if (id === 'coffee') {
                const coffeeBoughtThisMonth = gameState.coffeeBoughtThisMonth || 0;
                // ★★★ 无限咖啡机可以无限购买 ★★★
                if (gameState.coffeeMachineUpgrade !== 'unlimited' && coffeeBoughtThisMonth >= 1) return false;
            }

            // ★★★ GPU数量限制检查（确保第一个月至少有1个库存）★★★
            const effectiveMonths = Math.max(1, gameState.totalMonths || 1);
            if (id === 'gpu_buy' && (gameState.gpuServersBought || 0) >= effectiveMonths) return false;
            if (id === 'gpu_rent' && (gameState.gpuRentedThisMonth || 0) >= 20) return false;

            let result = `金钱-${actualPrice}`;
            if (isAutoSubscription) {
                result = `【预购】${result}`;
            }

            // 富可敌国觉醒：通过消费增加属性
            if (gameState.isReversed && gameState.character === 'rich' && gameState.reversedAwakened) {
                const spent = actualPrice;
                gameState.goldSpentTotal = (gameState.goldSpentTotal || 0) + spent;

                const attributeGains = Math.floor(gameState.goldSpentTotal / 6);
                const previousGains = Math.floor((gameState.goldSpentTotal - spent) / 6);
                const newGains = attributeGains - previousGains;
                
                if (newGains > 0) {
                    gameState.san = Math.min(gameState.sanMax, gameState.san + newGains);
                    gameState.research = Math.min(20, gameState.research + newGains);
                    gameState.social = Math.min(20, gameState.social + newGains);
                    gameState.favor = Math.min(gameState.favorMax || 20, gameState.favor + newGains);
                    result += `，金钱觉醒(累计${gameState.goldSpentTotal}金)：SAN+${newGains}, 科研+${newGains}, 社交+${newGains}, 好感+${newGains}`;
                    // ★★★ 修复：科研和社交增加时检查解锁 ★★★
                    checkResearchUnlock();
                    checkSocialUnlock();
                }
            }

            gameState.gold -= actualPrice;

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
            
            // 检查豪华工位成就（需要工学椅或其升级+显示器+键盘+GPU服务器+咖啡机）
            if (gameState.furnitureBought &&
                gameState.furnitureBought.chair &&
                gameState.furnitureBought.monitor &&
                gameState.furnitureBought.keyboard &&
                (gameState.gpuServersBought || 0) >= 1 &&
                gameState.hasCoffeeMachine) {
                gameState.achievementConditions = gameState.achievementConditions || {};
                gameState.achievementConditions.fullFurnitureSet = true;
                // ★★★ 修复：立即检查成就 ★★★
                if (typeof checkInGameAchievements === 'function') checkInGameAchievements();
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
                    // ★★★ 购买GPU后也检查豪华工位成就 ★★★
                    if (gameState.furnitureBought &&
                        gameState.furnitureBought.chair &&
                        gameState.furnitureBought.monitor &&
                        gameState.furnitureBought.keyboard &&
                        (gameState.gpuServersBought || 0) >= 1 &&
                        gameState.hasCoffeeMachine) {
                        gameState.achievementConditions = gameState.achievementConditions || {};
                        gameState.achievementConditions.fullFurnitureSet = true;
                        // ★★★ 修复：立即检查成就 ★★★
                        if (typeof checkInGameAchievements === 'function') checkInGameAchievements();
                    }
                    break;
                case 'keyboard':
                    item.bought = true;
                    gameState.buffs.permanent.push({ type: 'write_san_reduce', name: '写论文SAN-3', value: 1, permanent: true });
                    gameState.buffs.permanent.push({ type: 'write_bonus', name: '写论文分数+1', value: 1, permanent: true });
                    result += '，获得永久buff-每次写论文变为SAN值-3且分数+1';
                    break;
                case 'monitor':
                    item.bought = true;
                    gameState.buffs.permanent.push({ type: 'read_san_reduce', name: '看论文SAN-1', value: 1, permanent: true });
                    result += '，获得永久buff-看论文变为SAN值-1';
                    break;
				case 'coffee':
					// 使用本月购买计数器
					gameState.coffeeBoughtThisMonth = (gameState.coffeeBoughtThisMonth || 0) + 1;
					gameState.coffeeBoughtCount = (gameState.coffeeBoughtCount || 0) + 1;
					// ★★★ 咖啡机升级决定SAN恢复效果 ★★★
					// 自动咖啡机/无限咖啡机：固定+3SAN
					// 高级咖啡机：+3+累计加成（每12杯+1，最多+5）
					// 基础咖啡机：+3+累计加成（每15杯+1，最多+2）
					// 无咖啡机：+3
					let coffeeBonus = 3;
					if (gameState.coffeeMachineUpgrade === 'advanced' || !gameState.coffeeMachineUpgrade && gameState.hasCoffeeMachine) {
						coffeeBonus = 3 + getCoffeeMachineBonus();
					}
					gameState.san = Math.min(gameState.sanMax, gameState.san + coffeeBonus);
					result += `，SAN值+${coffeeBonus}`;
					// 如果有咖啡机，增加累计计数用于加成
					if (gameState.hasCoffeeMachine) {
						gameState.coffeeMachineCount = (gameState.coffeeMachineCount || 0) + 1;
						// 基础咖啡机和高级咖啡机都有累计加成效果
						if (gameState.coffeeMachineUpgrade === 'advanced' || !gameState.coffeeMachineUpgrade) {
							updateCoffeeMachineBonus();
						}
					}
					break;

				case 'coffee_machine':
					item.bought = true;
					gameState.hasCoffeeMachine = true;
					gameState.coffeeMachineUpgrade = null;  // 未升级
					// ★★★ 修改：根据之前累计计算加成等级 ★★★
					const prevCount = gameState.coffeeMachineCount || 0;
					const prevBonus = Math.min(COFFEE_MACHINE_BASE.maxBonus, Math.floor(prevCount / COFFEE_MACHINE_BASE.threshold));
					gameState.coffeeMachineBonusLevel = prevBonus;
					result += '，获得咖啡机-可在商店第3页升级';
					// 如果之前有累计，显示恢复信息
					if (prevCount > 0) {
						result += `（累计${prevCount}杯`;
						if (prevBonus > 0) {
							result += `，加成+${prevBonus}`;
						}
						result += '）';
					}
					// ★★★ 购买咖啡机后检查豪华工位成就 ★★★
					if (gameState.furnitureBought &&
						gameState.furnitureBought.chair &&
						gameState.furnitureBought.monitor &&
						gameState.furnitureBought.keyboard &&
						(gameState.gpuServersBought || 0) >= 1) {
						gameState.achievementConditions = gameState.achievementConditions || {};
						gameState.achievementConditions.fullFurnitureSet = true;
						// ★★★ 修复：立即检查成就 ★★★
						if (typeof checkInGameAchievements === 'function') checkInGameAchievements();
					}
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
						bonusScore: 5  // ★★★ 修改：+4改为+5 ★★★
					});
					result += '，获得本月buff-想idea时SAN消耗-1，分数+5';
					break;
					
				case 'gpt':
					item.boughtThisMonth = true;
					gameState.buffs.temporary.push({
						type: 'exp_san_reduce',
						name: 'GPT订阅',
						value: 1,
						permanent: false,
						thisMonthOnly: true,
						bonusScore: 5  // ★★★ 修改：+4改为+5 ★★★
					});
					result += '，获得本月buff-做实验时SAN消耗-1，分数+5';
					break;
					
				case 'claude':
					item.boughtThisMonth = true;
					gameState.buffs.temporary.push({
						type: 'write_san_reduce_temp',
						name: 'Claude订阅',
						value: 1,
						permanent: false,
						thisMonthOnly: true,
						bonusScore: 5  // ★★★ 修改：+4改为+5 ★★★
					});
					result += '，获得本月buff-写论文时SAN消耗-1，分数+5';
					break;
					
				case 'gpu_rent':
					// ★★★ 新增：增加本月已租用数量 ★★★
					gameState.gpuRentedThisMonth = (gameState.gpuRentedThisMonth || 0) + 1;
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

				case 'bike':
					item.bought = true;
					gameState.hasBike = true;
					gameState.bikeUpgrade = null;  // 未升级
					result += '，获得永久效果-每月SAN-1，每累计减少6后SAN上限+1';
					break;

				case 'down_jacket':
					item.bought = true;
					gameState.hasDownJacket = true;
					result += '，获得永久效果-使冬季"寒风刺骨"debuff无效';
					// ★★★ 修复：检查整装待发成就 ★★★
					if (gameState.bikeUpgrade === 'ebike' && gameState.hasParasol) {
						if (typeof checkInGameAchievements === 'function') checkInGameAchievements();
					}
					break;

				case 'parasol':
					item.bought = true;
					gameState.hasParasol = true;
					result += '，获得永久效果-使夏季"烈日当空"debuff无效';
					// ★★★ 修复：检查整装待发成就 ★★★
					if (gameState.bikeUpgrade === 'ebike' && gameState.hasDownJacket) {
						if (typeof checkInGameAchievements === 'function') checkInGameAchievements();
					}
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
                // 冰美式使用单独的计数器检查
                if (itemId === 'coffee') {
                    // SAN满时不自动购买冰美式
                    if (gameState.san >= gameState.sanMax) return;
                    const coffeeBoughtThisMonth = gameState.coffeeBoughtThisMonth || 0;
                    if (coffeeBoughtThisMonth >= 1) return;
                } else if (item.monthlyOnce && item.boughtThisMonth) {
                    return;
                }

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

		// ==================== 成就点数商店 ====================
		// ★★★ 成就商店购买选项：SAN值(+1)、科研能力(+0.2)、社交能力(+0.2)、导师好感(+0.25)、金币(+0.5) ★★★
		// ★★★ 成就点数商店页面渲染 ★★★
		function renderAchievementPointShopPage() {
			let html = '';

			html += `<div style="font-weight:600;margin-bottom:8px;">
				<i class="fas fa-trophy"></i> 成就点数商店
				<span style="font-size:0.8rem;color:var(--text-secondary);margin-left:10px;">(第4页/共4页)</span>
			</div>`;

			// ★★★ 分页按钮 ★★★
			html += `<div style="display:flex;gap:8px;margin-bottom:10px;">
				<button class="btn btn-secondary" onclick="openShop(1)" style="flex:1;padding:6px;">
					消耗品
				</button>
				<button class="btn btn-secondary" onclick="openShop(2)" style="flex:1;padding:6px;">
					永久物品
				</button>
				<button class="btn btn-secondary" onclick="openShop(3)" style="flex:1;padding:6px;">
					出售/升级
				</button>
				<button class="btn btn-warning" onclick="openShop(4)" style="flex:1;padding:6px;">
					🏆成就
				</button>
			</div>`;

			// 初始化商店状态
			if (!gameState.achievementPointShop) {
				gameState.achievementPointShop = {
					purchaseCount: 0,
					accumulated: { san: 0, research: 0, social: 0, favor: 0, gold: 0 }
				};
			}
			const shop = gameState.achievementPointShop;
			const achievementCoins = gameState.achievementCoins || 0;

			// 计算下次购买成本：(n² + n + 2) / 2，n为已购买次数（从0开始）
			// 序列：1, 2, 4, 7, 11, 16, 22...（原价格减半，上取整）
			const n = shop.purchaseCount;
			const nextCost = Math.ceil((n * n + n + 2) / 2);

			// 年份倍率：第1-5年为1-5倍，第6年（延毕）也是5倍
			const yearMultiplier = Math.min(gameState.year || 1, 5);

			// 成就币和购买信息
			html += `
				<div style="margin-bottom:15px;padding:12px;background:linear-gradient(135deg,rgba(243,156,18,0.15),rgba(230,126,34,0.15));border-radius:10px;border:1px solid rgba(243,156,18,0.4);">
					<div style="display:flex;justify-content:space-between;align-items:center;">
						<div>
							<span style="font-size:1.2rem;">🏆</span>
							<span style="font-weight:600;color:var(--warning-color);">成就币</span>
						</div>
						<div style="font-size:1.3rem;font-weight:700;color:var(--warning-color);">${achievementCoins}</div>
					</div>
					<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:8px;display:flex;justify-content:space-between;">
						<span>📊 已购买 ${shop.purchaseCount} 次</span>
						<span>💰 下次消耗 ${nextCost} 成就币</span>
					</div>
					<div style="font-size:0.8rem;color:var(--success-color);margin-top:4px;">
						⚡ 当前倍率：×${yearMultiplier}（第${gameState.year}年）
					</div>
				</div>
			`;

			// 属性选项定义
			const options = [
				{ type: 'san', name: 'SAN值', icon: '🧠', base: 1, color: 'var(--primary-color)' },
				{ type: 'research', name: '科研能力', icon: '🔬', base: 0.2, color: 'var(--info-color)' },
				{ type: 'social', name: '社交能力', icon: '👥', base: 0.2, color: 'var(--accent-color)' },
				{ type: 'favor', name: '导师好感', icon: '❤️', base: 0.25, color: 'var(--danger-color)' },
				{ type: 'gold', name: '金币', icon: '💰', base: 0.5, color: 'var(--warning-color)' }
			];

			const canAfford = achievementCoins >= nextCost;

			html += `<div style="margin-bottom:10px;">`;

			options.forEach(opt => {
				const actualGain = opt.base * yearMultiplier;
				const accumulated = shop.accumulated[opt.type] || 0;
				const totalAfterPurchase = accumulated + actualGain;
				const integerPart = Math.floor(totalAfterPurchase);
				const decimalPart = totalAfterPurchase - integerPart;

				// 显示获得量说明
				let gainText = '';
				if (opt.type === 'san') {
					gainText = `+${actualGain}`;
				} else {
					gainText = `+${actualGain.toFixed(2)}`;
					if (accumulated > 0) {
						gainText += ` (累计${accumulated.toFixed(2)}→${totalAfterPurchase.toFixed(2)})`;
					}
					if (integerPart > 0) {
						gainText += ` 🎉实得+${integerPart}`;
					}
				}

				html += `
					<div class="shop-item ${!canAfford ? 'disabled' : ''}" style="margin-bottom:8px;">
						<div class="shop-item-info">
							<div class="shop-item-name">
								<span style="font-size:1.2rem;margin-right:6px;">${opt.icon}</span>
								${opt.name}
							</div>
							<div class="shop-item-desc" style="color:${opt.color};">
								基础 +${opt.base} (×${yearMultiplier}倍率) = ${gainText}
							</div>
						</div>
						<div class="shop-item-action">
							<span class="shop-item-price" style="color:var(--warning-color);">🏆${nextCost}</span>
							<button class="btn btn-warning" onclick="purchaseAchievementPointShopItem('${opt.type}')" ${!canAfford ? 'disabled' : ''}>
								${canAfford ? '购买' : '成就币不足'}
							</button>
						</div>
					</div>
				`;
			});

			html += `</div>`;

			// 累积进度显示
			html += `
				<div style="padding:10px;background:var(--light-bg);border-radius:8px;font-size:0.75rem;color:var(--text-secondary);">
					<div style="font-weight:600;margin-bottom:5px;">📈 累积进度（满1实得）</div>
					<div style="display:flex;flex-wrap:wrap;gap:8px;">
						<span>🔬 科研: ${(shop.accumulated.research || 0).toFixed(2)}</span>
						<span>👥 社交: ${(shop.accumulated.social || 0).toFixed(2)}</span>
						<span>❤️ 好感: ${(shop.accumulated.favor || 0).toFixed(2)}</span>
						<span>💰 金币: ${(shop.accumulated.gold || 0).toFixed(2)}</span>
					</div>
				</div>
			`;

			// 机制说明
			html += `
				<div style="margin-top:10px;padding:10px;background:rgba(52,152,219,0.1);border-radius:8px;font-size:0.75rem;color:var(--text-secondary);">
					<div style="font-weight:600;margin-bottom:5px;">💡 机制说明</div>
					<div>• 每次购买成本递增：1→2→4→7→11→16→22→...</div>
					<div>• 年份倍率：第N年=×N倍（最高×5）</div>
					<div>• 小数部分累积，满1时自动获得整数部分</div>
				</div>
			`;

			return html;
		}

		// ★★★ 成就点数商店购买函数 ★★★
		function purchaseAchievementPointShopItem(type) {
			// 初始化商店状态
			if (!gameState.achievementPointShop) {
				gameState.achievementPointShop = {
					purchaseCount: 0,
					accumulated: { san: 0, research: 0, social: 0, favor: 0, gold: 0 }
				};
			}
			const shop = gameState.achievementPointShop;
			const achievementCoins = gameState.achievementCoins || 0;

			// 计算购买成本：(n² + n + 2) / 2，n为已购买次数
			const n = shop.purchaseCount;
			const cost = Math.ceil((n * n + n + 2) / 2);

			if (achievementCoins < cost) {
				showModal('❌ 购买失败', `<p>成就币不足！需要${cost}成就币，当前只有${achievementCoins}成就币。</p>`,
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			// 扣除成就币
			gameState.achievementCoins -= cost;

			// 年份倍率
			const yearMultiplier = Math.min(gameState.year || 1, 5);

			// 属性基础值
			const baseValues = {
				san: 1,
				research: 0.2,
				social: 0.2,
				favor: 0.25,
				gold: 0.5
			};

			const baseValue = baseValues[type];
			const actualGain = baseValue * yearMultiplier;

			let resultText = '';
			let integerGain = 0;

			if (type === 'san') {
				// SAN值直接加整数
				integerGain = actualGain;
				gameState.san = Math.min(gameState.sanMax, gameState.san + integerGain);
				resultText = `SAN+${integerGain}`;
			} else {
				// 其他属性需要累积
				shop.accumulated[type] = (shop.accumulated[type] || 0) + actualGain;
				const total = shop.accumulated[type];
				integerGain = Math.floor(total);

				if (integerGain > 0) {
					// 有整数部分，实际获得
					shop.accumulated[type] = total - integerGain;

					switch (type) {
						case 'research':
							// ★★★ 修复：调用changeResearch以触发愚钝被动 ★★★
							if (typeof changeResearch === 'function') {
								changeResearch(integerGain);
							} else {
								gameState.research = Math.min(gameState.researchMax || 20, gameState.research + integerGain);
								checkResearchUnlock();
							}
							resultText = `科研+${integerGain}（累积剩余${shop.accumulated[type].toFixed(2)}）`;
							break;
						case 'social':
							gameState.social = Math.min(gameState.socialMax || 20, gameState.social + integerGain);
							checkSocialUnlock();
							resultText = `社交+${integerGain}（累积剩余${shop.accumulated[type].toFixed(2)}）`;
							break;
						case 'favor':
							gameState.favor = Math.min(gameState.favorMax || 20, gameState.favor + integerGain);
							resultText = `好感+${integerGain}（累积剩余${shop.accumulated[type].toFixed(2)}）`;
							break;
						case 'gold':
							gameState.gold += integerGain;
							clampGold();
							resultText = `金币+${integerGain}（累积剩余${shop.accumulated[type].toFixed(2)}）`;
							break;
					}
				} else {
					// 只累积，还没有整数部分
					const typeNames = { research: '科研', social: '社交', favor: '好感', gold: '金币' };
					resultText = `${typeNames[type]}累积+${actualGain.toFixed(2)}（当前${shop.accumulated[type].toFixed(2)}）`;
				}
			}

			// 增加购买次数
			shop.purchaseCount++;

			addLog('成就商店', `购买了属性提升`, `成就币-${cost}，${resultText}`);

			closeModal();
			openShop(4);
			updateAllUI();
		}

		// ==================== 全局函数暴露（供onclick调用）====================
		window.openShop = openShop;
		window.buyItem = buyItem;
		window.sellItem = sellItem;
		window.toggleSubscription = toggleSubscription;
		window.showChairUpgradeModal = showChairUpgradeModal;
		window.upgradeChair = upgradeChair;
		window.showBikeUpgradeModal = showBikeUpgradeModal;
		window.upgradeBike = upgradeBike;
		window.showCoffeeMachineUpgradeModal = showCoffeeMachineUpgradeModal;
		window.upgradeCoffeeMachine = upgradeCoffeeMachine;
		window.getCoffeeMachineBonus = getCoffeeMachineBonus;
		window.updateCoffeeMachineBonus = updateCoffeeMachineBonus;
		window.showMonitorUpgradeModal = showMonitorUpgradeModal;
		window.upgradeMonitor = upgradeMonitor;
		window.getMonitorIdeaBonus = getMonitorIdeaBonus;
		window.manualRefreshBlackMarket = manualRefreshBlackMarket;
		window.toggleItemLock = toggleItemLock;
		window.buyBlackMarketItem = buyBlackMarketItem;
		window.showCurrentAchievements = showCurrentAchievements;
		window.showAllAchievements = showAllAchievements;
		window.showAchievementDetail = showAchievementDetail;
		window.renderAchievementPointShopPage = renderAchievementPointShopPage;
		window.purchaseAchievementPointShopItem = purchaseAchievementPointShopItem;
