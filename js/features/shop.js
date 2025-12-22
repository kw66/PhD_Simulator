		// ==================== 成就商店系统 ====================
		const achievementShopItems = [
			{ 
				id: 'soap', 
				name: '🧼 香皂', 
				desc: '清除所有携带的非永久buff和debuff', 
				basePrice: 7, 
				pricePerYear: 0,  // 价格不随年份变化
				once: false, 
				bought: false 
			},
			{ 
				id: 'premium_soap', 
				name: '🧴 高级香皂', 
				desc: '清除所有携带的非永久debuff', 
				basePrice: 10, 
				pricePerYear: 0, 
				once: false, 
				bought: false 
			},
			{ 
				id: 'chicken_burger', 
				name: '🍔 板烧鸡腿堡', 
				desc: '回复2点SAN值', 
				basePrice: 5, 
				pricePerYear: -1,  // 每年售价-1
				once: true, 
				bought: false 
			},
			{ 
				id: 'beef_burger', 
				name: '🥩 安格斯厚牛堡', 
				desc: 'SAN上限+2', 
				basePrice: 3, 
				pricePerYear: 1,  // 每年售价+1
				once: true, 
				bought: false 
			},
			{ 
				id: 'fake_flower', 
				name: '🌸 假花', 
				desc: '导师好感度+1', 
				basePrice: 8, 
				pricePerYear: -1, 
				once: true, 
				bought: false 
			},
			{ 
				id: 'real_flower', 
				name: '💐 鲜花', 
				desc: '导师好感度上限+1', 
				basePrice: 3, 
				pricePerYear: 1, 
				once: true, 
				bought: false 
			},
			{ 
				id: 'mooncake', 
				name: '🥮 月饼', 
				desc: '社交能力+1', 
				basePrice: 8, 
				pricePerYear: -1, 
				once: true, 
				bought: false 
			},
			{ 
				id: 'snow_mooncake', 
				name: '🍡 冰皮月饼', 
				desc: '社交能力上限+1', 
				basePrice: 3, 
				pricePerYear: 1, 
				once: true, 
				bought: false 
			},
			{ 
				id: 'watermelon_book', 
				name: '📗 西瓜书', 
				desc: '科研能力+1', 
				basePrice: 12, 
				pricePerYear: -2, 
				once: true, 
				bought: false 
			},
			{ 
				id: 'andrew_ng_course', 
				name: '💻 吴恩达课程', 
				desc: '科研能力上限+1', 
				basePrice: 4, 
				pricePerYear: 1, 
				once: true, 
				bought: false 
			},
			{ 
				id: 'bitcoin', 
				name: '₿ 比特币', 
				desc: '金币+1（每年额外+1）', 
				basePrice: 8, 
				pricePerYear: 0, 
				once: true, 
				bought: false,
				special: 'bitcoin'  // 特殊标记：比特币效果随年份增加
			}
		];

		// 获取玩家历史成就数量（用于计算成就币）
		function getPlayerAchievementCount() {
			const playerRecords = getPlayerAchievements();
			const normalCount = playerRecords.achievements.normal instanceof Set 
				? playerRecords.achievements.normal.size 
				: (Array.isArray(playerRecords.achievements.normal) ? playerRecords.achievements.normal.length : 0);
			const reversedCount = playerRecords.achievements.reversed instanceof Set 
				? playerRecords.achievements.reversed.size 
				: (Array.isArray(playerRecords.achievements.reversed) ? playerRecords.achievements.reversed.length : 0);
			
			// 返回两种模式成就的并集数量（去重）
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

		// 计算成就商店物品当前价格
		function getAchievementItemPrice(item) {
			const yearsPassed = gameState.year - 1;  // 第1年为0年过去
			let price = item.basePrice + (item.pricePerYear * yearsPassed);
			return Math.max(1, price);  // 最低价格为1
		}

		// 获取比特币当前效果
		function getBitcoinEffect() {
			const yearsPassed = gameState.year - 1;
			return 1 + yearsPassed;  // 第1年+1金，第2年+2金，以此类推
		}

		// 打开成就商店
		function openAchievementShop() {
			const achievementCoins = gameState.achievementCoins || 0;
			
			let html = `
				<div style="margin-bottom:15px;padding:12px;background:linear-gradient(135deg,rgba(253,203,110,0.2),rgba(243,156,18,0.2));border-radius:10px;border:1px solid rgba(243,156,18,0.4);">
					<div style="display:flex;justify-content:space-between;align-items:center;">
						<div>
							<span style="font-size:1.2rem;">🏆</span>
							<span style="font-weight:600;color:#d68910;">成就币</span>
						</div>
						<div style="font-size:1.3rem;font-weight:700;color:#d68910;">${achievementCoins}</div>
					</div>
					<div style="font-size:0.7rem;color:var(--text-secondary);margin-top:5px;">
						基于历史成就数量获得，每局游戏重置
					</div>
				</div>
				<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:10px;">
					💡 提示：部分物品价格会随游戏年份变化
				</div>
				<div style="max-height:350px;overflow-y:auto;">
			`;
			
			achievementShopItems.forEach(item => {
				const currentPrice = getAchievementItemPrice(item);
				const canBuy = achievementCoins >= currentPrice && !item.bought;
				const reason = item.bought ? '已购买' : (achievementCoins < currentPrice ? '成就币不足' : '');
				
				// 动态描述
				let displayDesc = item.desc;
				if (item.special === 'bitcoin') {
					const effect = getBitcoinEffect();
					displayDesc = `金币+${effect}（当前年份效果）`;
				}
				
				// 价格变化提示
				let priceHint = '';
				if (item.pricePerYear !== 0) {
					const change = item.pricePerYear > 0 ? `+${item.pricePerYear}` : `${item.pricePerYear}`;
					priceHint = `<span style="font-size:0.65rem;color:${item.pricePerYear > 0 ? 'var(--danger-color)' : 'var(--success-color)'};">(每年${change})</span>`;
				}
				
				html += `
					<div class="shop-item ${!canBuy ? 'disabled' : ''}" style="margin-bottom:8px;">
						<div class="shop-item-info">
							<div class="shop-item-name">${item.name}</div>
							<div class="shop-item-desc">${displayDesc}</div>
						</div>
						<div class="shop-item-action">
							<span class="shop-item-price" style="color:#d68910;">🏆${currentPrice} ${priceHint}</span>
							<button class="btn btn-warning" onclick="buyAchievementItem('${item.id}')" ${!canBuy ? 'disabled' : ''} style="padding:4px 10px;font-size:0.75rem;">
								${reason || '购买'}
							</button>
						</div>
					</div>
				`;
			});
			
			html += '</div>';
			
			showModal('🏆 成就商店', html, [{ text: '关闭', class: 'btn-info', action: closeModal }]);
		}

		// 购买成就商店物品
		function buyAchievementItem(id) {
			const item = achievementShopItems.find(i => i.id === id);
			if (!item) return;
			
			const currentPrice = getAchievementItemPrice(item);
			
			if (gameState.achievementCoins < currentPrice) {
				showModal('❌ 购买失败', `<p>成就币不足！需要${currentPrice}成就币，当前只有${gameState.achievementCoins}成就币。</p>`, 
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			// ★★★ 修改：香皂类物品不检查bought状态 ★★★
			if (item.once && item.bought) {
				showModal('❌ 购买失败', `<p>该物品已购买过！</p>`, 
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			// 扣除成就币
			gameState.achievementCoins -= currentPrice;
			
			// ★★★ 修改：只有once为true的物品才设置bought ★★★
			if (item.once) {
				item.bought = true;
			}
			
			let result = `成就币-${currentPrice}`;
			
			// 应用物品效果
			switch (id) {
				case 'soap':
					// 清除所有非永久buff和debuff
					const removedCount = gameState.buffs.temporary.length;
					gameState.buffs.temporary = [];
					result += `，清除了${removedCount}个临时效果`;
					break;
					
				case 'premium_soap':
					// 只清除非永久debuff（保留正面buff）
					const debuffTypes = ['idea_exhaustion', 'exp_overheat', 'write_block', 'slack_debuff', 'idea_stolen'];
					const beforeLength = gameState.buffs.temporary.length;
					gameState.buffs.temporary = gameState.buffs.temporary.filter(b => {
						// 保留正面buff，清除debuff
						if (debuffTypes.includes(b.type)) return false;
						if (b.isDebuff) return false;
						if (b.value < 0 && !b.multiply) return false;
						if (b.multiply && b.value < 1) return false;
						return true;
					});
					const removedDebuffs = beforeLength - gameState.buffs.temporary.length;
					result += `，清除了${removedDebuffs}个debuff`;
					break;
					
				case 'chicken_burger':
					gameState.san = Math.min(gameState.sanMax, gameState.san + 2);
					result += '，SAN值+2';
					break;
					
				case 'beef_burger':
					gameState.sanMax += 2;
					result += '，SAN上限+2';
					break;
					
				case 'fake_flower':
					gameState.favor = Math.min(gameState.favorMax || 20, gameState.favor + 1);
					result += '，导师好感度+1';
					break;
					
				case 'real_flower':
					gameState.favorMax = (gameState.favorMax || 20) + 1;
					result += `，导师好感度上限+1（现为${gameState.favorMax}）`;
					break;
					
				case 'mooncake':
					gameState.social = Math.min(gameState.socialMax || 20, gameState.social + 1);
					result += '，社交能力+1';
					break;
					
				case 'snow_mooncake':
					gameState.socialMax = (gameState.socialMax || 20) + 1;
					result += `，社交能力上限+1（现为${gameState.socialMax}）`;
					break;
					
				case 'watermelon_book':
					gameState.research = Math.min(gameState.researchMax || 20, gameState.research + 1);
					checkResearchUnlock();
					result += '，科研能力+1';
					break;
					
				case 'andrew_ng_course':
					gameState.researchMax = (gameState.researchMax || 20) + 1;
					result += `，科研能力上限+1（现为${gameState.researchMax}）`;
					break;
					
				case 'bitcoin':
					const goldGain = getBitcoinEffect();
					gameState.gold += goldGain;
					result += `，金币+${goldGain}`;
					break;
			}
			
			addLog('成就商店', `购买了${item.name}`, result);
			closeModal();
			openAchievementShop();  // 刷新商店界面
			updateAllUI();
			updateBuffs();
		}

		// 重置成就商店（每局游戏开始时调用）
		function resetAchievementShop() {
			achievementShopItems.forEach(item => {
				item.bought = false;
			});
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
			
			shopItems.forEach(item => {
				const canBuy = gameState.gold >= item.price && !(item.once && item.bought) && !(item.monthlyOnce && item.boughtThisMonth);
				const reason = (item.once && item.bought) ? '已购买' : (item.monthlyOnce && item.boughtThisMonth) ? '本月已购' : gameState.gold < item.price ? '金币不足' : '';
				
				// ★★★ 新增：冰美式动态描述 ★★★
				let itemDesc = item.desc;
				if (item.id === 'coffee') {
					const count = gameState.coffeeBoughtCount || 0;
					const currentBonus = 3 + Math.floor(count / 15);
					const nextMilestone = (Math.floor(count / 15) + 1) * 15;
					const nextBonus = currentBonus + 1;
					
					itemDesc = `SAN值+${currentBonus}`;
					itemDesc += ` (${count}/${nextMilestone}杯时+${nextBonus})`;
				}
				
				html += `<div class="shop-item ${!canBuy ? 'disabled' : ''}">
					<div class="shop-item-info">
						<div class="shop-item-name">${item.name}</div>
						<div class="shop-item-desc">${itemDesc}</div>
					</div>
					<div class="shop-item-action">
						<span class="shop-item-price">💰${item.price}</span>
						<button class="btn btn-primary" onclick="buyItem('${item.id}')" ${!canBuy ? 'disabled' : ''}>${reason || '购买'}</button>
					</div>
				</div>`;
			});
			html += '</div>';
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
								// 移除一个GPU buff
								const gpuBuffIndex = gameState.buffs.permanent.findIndex(b => 
									b.type === 'exp_times' && b.name === '每次做实验多做1次'
								);
								if (gpuBuffIndex !== -1) {
									gameState.buffs.permanent.splice(gpuBuffIndex, 1);
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
            
            let result = `金钱-${item.price}`;
            
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
                    result += '，获得永久buff-每次做实验多做1次';
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
					const coffeeBonus = 3 + Math.floor(gameState.coffeeBoughtCount / 15);
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
					result += '，获得本月buff-做实验多做1次';
					break;
            }
            
            addLog('购买', `购买了${item.name}`, result);
            closeModal();
            openShop();
            updateAllUI();
            updateBuffs();
        }
