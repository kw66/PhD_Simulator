        // ==================== UI更新 ====================
        function updateAllUI() {
            updateTimeDisplay();
            updateAttributes();
            updateGraduation();
            updateBuffs();
            updateResearchResults();
            updateActionButtons();
            updateEventPreview();
            renderRelationshipPanel();  // ★★★ 新增：更新人际关系面板 ★★★
            updatePeakStats();          // ★★★ 新增：更新峰值/谷值记录 ★★★
        }

		// ==================== 年月时间显示 ====================
		function updateTimeDisplay() {
			const timePanelEl = document.getElementById('time-display-panel');
			const timeYearEl = document.getElementById('time-year');
			const timeMonthEl = document.getElementById('time-month');
			const timeRemainingEl = document.getElementById('time-remaining');
			const timeSeasonEl = document.getElementById('time-season');

			// ★★★ 根据逆位模式切换时间栏颜色 ★★★
			if (timePanelEl) {
				if (gameState.isReversed) {
					timePanelEl.classList.add('reversed-time');
				} else {
					timePanelEl.classList.remove('reversed-time');
				}
			}

			if (timeYearEl) {
				timeYearEl.textContent = `第${gameState.year}年`;
			}
			if (timeMonthEl) {
				timeMonthEl.textContent = `第${gameState.month}月`;
			}
			if (timeRemainingEl) {
				const maxMonths = gameState.maxYears * 12;
				const remaining = maxMonths - gameState.totalMonths;
				timeRemainingEl.textContent = `剩余${remaining}月`;
			}
			// ★★★ 新增：更新季节显示（只显示单个汉字）★★★
			if (timeSeasonEl) {
				const season = getCurrentSeason();
				if (season) {
					// 只取季节名的第一个字（春夏秋冬）
					const seasonChar = season.name.charAt(0);
					timeSeasonEl.textContent = seasonChar;
					timeSeasonEl.title = `${season.icon}${season.name} - ${season.buff}：${season.desc}`;
				}
			}
		}

		function updateAttributes() {
			// ★★★ 修复：添加null检查避免错误 ★★★
			const sanValueEl = document.getElementById('san-value');
			const sanMaxEl = document.getElementById('san-max');
			const sanBarEl = document.getElementById('san-bar');
			if (sanValueEl) sanValueEl.textContent = gameState.san;
			if (sanMaxEl) sanMaxEl.textContent = gameState.sanMax;
			if (sanBarEl) sanBarEl.style.width = `${Math.max(0, (gameState.san / gameState.sanMax) * 100)}%`;

			const researchMax = gameState.researchMax || 20;
			const researchValueEl = document.getElementById('research-value');
			const researchMaxEl = document.getElementById('research-max');
			const researchBarEl = document.getElementById('research-bar');
			if (researchValueEl) researchValueEl.textContent = gameState.research;
			if (researchMaxEl) researchMaxEl.textContent = researchMax;
			if (researchBarEl) researchBarEl.style.width = `${(gameState.research / researchMax) * 100}%`;

			// ★★★ 修改：支持动态社交上限，修复nth-child选择器(3而非4) ★★★
			const socialMax = gameState.socialMax || 20;
			const socialValueEl2 = document.getElementById('social-value');
			if (socialValueEl2) socialValueEl2.textContent = gameState.social;
			// 需要在HTML中添加social-max元素，或者修改显示方式
			const socialValueEl = document.querySelector('#attributes-panel .attribute-bar:nth-child(3) .value');
			if (socialValueEl) {
				socialValueEl.innerHTML = `<span id="social-value">${gameState.social}</span>/${socialMax}`;
			}
			const socialBarEl = document.getElementById('social-bar');
			if (socialBarEl) socialBarEl.style.width = `${(gameState.social / socialMax) * 100}%`;

			// ★★★ 修改：支持动态好感上限，修复nth-child选择器(4而非5) ★★★
			const favorMax = gameState.favorMax || 20;
			const favorValueEl2 = document.getElementById('favor-value');
			if (favorValueEl2) favorValueEl2.textContent = gameState.favor;
			const favorValueEl = document.querySelector('#attributes-panel .attribute-bar:nth-child(4) .value');
			if (favorValueEl) {
				favorValueEl.innerHTML = `<span id="favor-value">${gameState.favor}</span>/${favorMax}`;
			}
			const favorBarEl = document.getElementById('favor-bar');
			if (favorBarEl) favorBarEl.style.width = `${Math.max(0, (gameState.favor / favorMax) * 100)}%`;

			const goldValueEl = document.getElementById('gold-value');
			if (goldValueEl) goldValueEl.textContent = gameState.gold;
			updateCharacterDisplay();

			const achievementCoinsDisplay = document.getElementById('achievement-coins-display');
			if (achievementCoinsDisplay) {
				achievementCoinsDisplay.textContent = gameState.achievementCoins || 0;
			}
		}

		function updateCharacterDisplay() {
			// ★★★ 修复：先检查真·大多数 ★★★
			if (gameState.isTrueNormal) {
				document.getElementById('char-icon').innerHTML = '<span class="gold-icon">👤</span>';
				document.getElementById('char-name').textContent = '真·大多数';

				const modeEl = document.getElementById('char-mode');
				if (modeEl) {
					modeEl.textContent = '✨ 真实';
					modeEl.className = 'char-mode normal-mode';
					modeEl.style.background = 'linear-gradient(135deg,rgba(255,215,0,0.3),rgba(255,140,0,0.3))';
					modeEl.style.color = '#d68910';
				}
				return;
			}

			// 然后再查找普通角色
			const charData = characters.find(c => c.id === gameState.character);
			if (!charData) return;

			const displayData = gameState.isReversed && charData.reversed ? charData.reversed : charData;
			const isAwakened = gameState.reversedAwakened || (gameState.degree === 'phd' && !gameState.isReversed);

			const icon = isAwakened
				? (gameState.isReversed ? displayData.awakenIcon : charData.awakenIcon)
				: displayData.icon;

			document.getElementById('char-icon').textContent = icon;
			document.getElementById('char-name').textContent = displayData.name;

			const modeEl = document.getElementById('char-mode');
			if (modeEl) {
				modeEl.style.background = '';  // 重置样式
				modeEl.style.color = '';
				if (gameState.isReversed) {
					modeEl.textContent = '🌑 逆位';
					modeEl.className = 'char-mode reversed-mode';
				} else {
					modeEl.textContent = '☀️ 正位';
					modeEl.className = 'char-mode normal-mode';
				}
			}
		}

		function showCharacterDetail() {
			// 兼容旧调用，转到新的天赋树
			showTalentTree();
		}

		// ==================== 天赋和装备系统 ====================
		function showTalentTree() {
			// 获取角色数据
			const isTrueNormal = gameState.character === 'true-normal' || gameState.isTrueNormal;
			const charData = isTrueNormal ? null : characters.find(c => c.id === gameState.character);
			const isReversed = gameState.isReversed;
			const displayData = charData && isReversed && charData.reversed ? charData.reversed : charData;

			// 判断觉醒状态
			const hasHiddenAwaken = gameState.hiddenAwakened && !isReversed;
			const hasNormalAwaken = gameState.degree === 'phd' && !isReversed;
			const reversedAwakened = isReversed && gameState.reversedAwakened;
			const isTrueNormalAwakened = isTrueNormal && gameState.trueNormalAwakened;

			// 获取装备信息
			const amulets = gameState.amulets || {};
			const furniture = gameState.furnitureBought || {};
			const chairUpgrade = gameState.chairUpgrade;
			const bikeUpgrade = gameState.bikeUpgrade;

			// 构建HTML
			let html = `
			<style>
				.talent-container {
					max-height: 75vh;
					overflow-y: auto;
					padding: 5px;
				}
				.talent-section {
					margin-bottom: 12px;
					padding: 10px;
					background: rgba(102,126,234,0.08);
					border-radius: 10px;
					border: 1px solid rgba(102,126,234,0.15);
				}
				.talent-section-title {
					font-size: 0.85rem;
					color: var(--primary-color, #667eea);
					margin-bottom: 8px;
					padding: 6px 10px;
					background: rgba(102,126,234,0.15);
					border-radius: 6px;
					display: flex;
					align-items: center;
					gap: 6px;
					font-weight: 600;
				}

				/* 天赋节点 - 圆形 */
				.talent-row {
					display: flex;
					justify-content: center;
					gap: 20px;
					flex-wrap: wrap;
					padding: 6px 0 8px 0;
				}
				.talent-node {
					width: 60px;
					height: 60px;
					border-radius: 50%;
					background: linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.1) 100%);
					border: 3px solid transparent;
					display: flex;
					align-items: center;
					justify-content: center;
					position: relative;
					cursor: pointer;
					transition: all 0.25s ease;
				}
				.talent-node:hover {
					transform: scale(1.15) translateY(-3px);
					background: linear-gradient(135deg, rgba(102,126,234,0.25) 0%, rgba(118,75,162,0.2) 100%);
				}
				.talent-node.active {
					border-color: #4ecdc4;
					box-shadow: 0 0 15px rgba(78,205,196,0.4);
				}
				.talent-node.active:hover {
					transform: scale(1.15) translateY(-3px);
				}
				.talent-node.active.color-blue { border-color: #3498db; box-shadow: 0 0 15px rgba(52,152,219,0.4); }
				.talent-node.active.color-purple { border-color: #9b59b6; box-shadow: 0 0 15px rgba(155,89,182,0.4); }
				.talent-node.active.color-orange { border-color: #f39c12; box-shadow: 0 0 15px rgba(243,156,18,0.4); }
				.talent-node.active.color-green { border-color: #2ecc71; box-shadow: 0 0 15px rgba(46,204,113,0.4); }
				.talent-node .node-icon {
					font-size: 1.6rem;
				}
				.talent-node .node-label {
					display: none;  /* 隐藏图标下方的文字说明 */
				}

				/* 装备节点 - 方形 */
				.equip-row {
					display: flex;
					justify-content: center;
					gap: 12px;
					flex-wrap: wrap;
					margin-bottom: 12px;
				}
				.equip-row:last-child {
					margin-bottom: 5px;
				}
				.equip-node {
					width: 52px;
					height: 52px;
					border-radius: 8px;
					background: linear-gradient(135deg, rgba(230,126,34,0.1) 0%, rgba(211,84,0,0.08) 100%);
					border: 2px solid transparent;
					display: flex;
					align-items: center;
					justify-content: center;
					position: relative;
					cursor: pointer;
					transition: all 0.25s ease;
				}
				.equip-node:hover {
					transform: scale(1.12) translateY(-2px);
					background: linear-gradient(135deg, rgba(230,126,34,0.2) 0%, rgba(211,84,0,0.15) 100%);
				}
				.equip-node.active {
					border-color: #e67e22;
					box-shadow: 0 0 12px rgba(230,126,34,0.35);
				}
				.equip-node.active:hover {
					transform: scale(1.12) translateY(-2px);
				}
				.equip-node .node-icon {
					font-size: 1.4rem;
				}
				.equip-node .node-label {
					display: none;  /* 隐藏图标下方的文字说明 */
				}
				.equip-node .equip-count {
					position: absolute;
					top: -4px;
					right: -4px;
					background: linear-gradient(135deg, #e74c3c, #c0392b);
					color: white;
					font-size: 0.55rem;
					font-weight: 600;
					min-width: 16px;
					height: 16px;
					padding: 0 3px;
					border-radius: 8px;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				/* Tooltip - 圆角边框方框 */
				.talent-tip {
					position: fixed;
					background: rgba(15,15,20,0.98);
					border: 2px solid #4ecdc4;
					border-radius: 10px;
					padding: 10px 14px;
					max-width: 240px;
					z-index: 10000;
					pointer-events: none;
					display: none;
					box-shadow: 0 4px 20px rgba(0,0,0,0.5);
				}
				.talent-tip.color-blue { border-color: #3498db; }
				.talent-tip.color-purple { border-color: #9b59b6; }
				.talent-tip.color-orange { border-color: #f39c12; }
				.talent-tip.color-green { border-color: #2ecc71; }
				.talent-tip.color-equip { border-color: #e67e22; }
				.talent-tip-title {
					font-weight: 600;
					font-size: 0.85rem;
					color: #4ecdc4;
					margin-bottom: 5px;
				}
				.talent-tip.color-blue .talent-tip-title { color: #3498db; }
				.talent-tip.color-purple .talent-tip-title { color: #9b59b6; }
				.talent-tip.color-orange .talent-tip-title { color: #f39c12; }
				.talent-tip.color-green .talent-tip-title { color: #2ecc71; }
				.talent-tip.color-equip .talent-tip-title { color: #e67e22; }
				.talent-tip-effect {
					font-size: 0.8rem;
					color: rgba(255,255,255,0.9);
					margin-bottom: 6px;
					line-height: 1.4;
				}
				.talent-tip-how {
					font-size: 0.7rem;
					color: rgba(255,255,255,0.55);
					font-style: italic;
				}
			</style>
			<div class="talent-container">
			`;

			// ========== 角色天赋区 ==========
			html += `<div class="talent-section">
				<div class="talent-section-title"><i class="fas fa-user-circle"></i> 角色天赋</div>
				<div class="talent-row">`;

			if (isTrueNormal) {
				// 真大多数：只有2个天赋（横向）
				html += `
					<div class="talent-node active" data-tip="真·大多数|经历过所有角色的洗礼，回归本真|使用6个角色各通关一次" data-color="">
						<div class="node-icon">👤</div>
						<div class="node-label">真·大多数</div>
					</div>
					<div class="talent-node ${isTrueNormalAwakened ? 'active color-orange' : ''}" data-tip="往昔荣光|成就币翻倍，成就商店刷新间隔变为2个月|真·大多数转博时触发" data-color="orange">
						<div class="node-icon">✨</div>
						<div class="node-label">往昔荣光</div>
					</div>
				`;
			} else if (charData) {
				// 初始天赋（角色头像）
				const charIcon = isReversed ? charData.reversed.icon : charData.icon;
				const charName = isReversed ? charData.reversed.name : charData.name;
				const charBonus = isReversed ? charData.reversed.bonus : charData.bonus;
				html += `
					<div class="talent-node active" data-tip="${charName}|${charBonus}|选择角色时获得" data-color="">
						<div class="node-icon">${charIcon}</div>
						<div class="node-label">${charName.length > 4 ? charName.substring(0,4) : charName}</div>
					</div>
				`;

				if (isReversed) {
					// 逆位角色：只显示逆位觉醒
					const awakenName = charData.reversed.awakenName;
					const awakenDesc = charData.reversed.awakenDesc;
					const awakenIcon = charData.reversed.awakenIcon || '⚡';
					html += `
						<div class="talent-node ${reversedAwakened ? 'active color-purple' : ''}" data-tip="⚡ ${awakenName}|${awakenDesc}|逆位角色转博时触发" data-color="purple">
							<div class="node-icon">${awakenIcon}</div>
							<div class="node-label">${awakenName.length > 5 ? awakenName.substring(0,5) : awakenName}</div>
						</div>
					`;
				} else {
					// 正位角色：显示转博觉醒 + 隐藏觉醒
					const awakenName = charData.awakenName;
					const awakenDesc = charData.awakenDesc;
					const awakenIcon = charData.awakenIcon || '⚡';
					html += `
						<div class="talent-node ${hasNormalAwaken ? 'active color-blue' : ''}" data-tip="⚡ ${awakenName}|${awakenDesc}|正位角色转博时触发" data-color="blue">
							<div class="node-icon">${awakenIcon}</div>
							<div class="node-label">${awakenName.length > 5 ? awakenName.substring(0,5) : awakenName}</div>
						</div>
					`;

					// 隐藏觉醒
					if (charData.hiddenAwakenName) {
						const hiddenName = charData.hiddenAwakenName;
						const hiddenDesc = charData.hiddenAwakenDesc;
						const hiddenIcon = charData.hiddenAwakenIcon || '⚙️';
						html += `
							<div class="talent-node ${hasHiddenAwaken ? 'active color-orange' : ''}" data-tip="⚙️ ${hiddenName}|${hiddenDesc}|满足特定条件时触发（替代转博觉醒）" data-color="orange">
								<div class="node-icon">${hiddenIcon}</div>
								<div class="node-label">${hiddenName.length > 5 ? hiddenName.substring(0,5) : hiddenName}</div>
							</div>
						`;
					}
				}
			}
			html += `</div></div>`;

			// ========== 通用天赋区（4个一行）==========
			html += `<div class="talent-section">
				<div class="talent-section-title"><i class="fas fa-star"></i> 通用天赋</div>
				<div class="talent-row">`;

			// 大牛联培
			const hasBigBull = gameState.bigBullCooperation;
			html += `
				<div class="talent-node ${hasBigBull ? 'active color-green' : ''}" data-tip="大牛联培|科研上限+2，想idea分数+5，做实验分数+5|在开会时与大牛深入交流2次后触发" data-color="green">
					<div class="node-icon">🎓</div>
					<div class="node-label">大牛联培</div>
				</div>
			`;

			// 企业实习
			const hasInternship = gameState.ailabInternship;
			html += `
				<div class="talent-node ${hasInternship ? 'active color-green' : ''}" data-tip="企业实习|每月金币+2，每月SAN-2（逆位大多数为-4/-6），做实验分数×1.25|在随机事件中选择接受企业实习" data-color="green">
					<div class="node-icon">💼</div>
					<div class="node-label">企业实习</div>
				</div>
			`;

			// 聪慧恋人
			const hasSmartLover = gameState.hasLover && gameState.loverType === 'smart';
			html += `
				<div class="talent-node ${hasSmartLover ? 'active color-green' : ''}" data-tip="聪慧恋人|成为恋人时：SAN+1，科研+1，永久buff每次想idea/做实验/写论文多一次。每月金币-2。完成任务循环：想idea多一次→做实验多一次→写论文多一次|社交≥12后在开会时多次交流同一异性学者" data-color="green">
					<div class="node-icon">💕</div>
					<div class="node-label">聪慧恋人</div>
				</div>
			`;

			// 活泼恋人
			const hasBeautifulLover = gameState.hasLover && gameState.loverType === 'beautiful';
			html += `
				<div class="talent-node ${hasBeautifulLover ? 'active color-green' : ''}" data-tip="活泼恋人|成为恋人时：SAN回满，SAN上限+4。每月金币-2，回复10%已损SAN。完成任务循环：回复10%已损SAN→SAN上限+1→月回复+2%|社交≥12后在开会时多次交流同一异性学者" data-color="green">
					<div class="node-icon">💕</div>
					<div class="node-label">活泼恋人</div>
				</div>
			`;

			html += `</div></div>`;

			// ========== 装备栏 ==========
			html += `<div class="talent-section">
				<div class="talent-section-title"><i class="fas fa-box"></i> 装备栏</div>`;

			// 第一行：椅子及其3种升级（4个）
			const hasChair = furniture.chair;
			html += `<div class="equip-row">`;
			html += `<div class="equip-node ${hasChair && !chairUpgrade ? 'active' : ''}" data-tip="人体工学椅|每月SAN+1|金币商店购买（10金币）" data-color="equip">
				<div class="node-icon">🪑</div>
				<div class="node-label">工学椅</div>
			</div>`;
			html += `<div class="equip-node ${chairUpgrade === 'advanced' ? 'active' : ''}" data-tip="高级人体工学椅|每月SAN+2|购买工学椅后升级（18金币）" data-color="equip">
				<div class="node-icon">💺</div>
				<div class="node-label">高级椅</div>
			</div>`;
			html += `<div class="equip-node ${chairUpgrade === 'massage' ? 'active' : ''}" data-tip="电动沙发按摩椅|每月恢复10%已损失SAN|购买工学椅后升级（20金币）" data-color="equip">
				<div class="node-icon">🛋️</div>
				<div class="node-label">按摩椅</div>
			</div>`;
			html += `<div class="equip-node ${chairUpgrade === 'torture' ? 'active' : ''}" data-tip="头悬梁锥刺股椅|每月恢复当前SAN的20%|购买工学椅后升级（20金币）" data-color="equip">
				<div class="node-icon">⚔️</div>
				<div class="node-label">刺股椅</div>
			</div>`;
			html += `</div>`;

			// 第二行：自行车及其2种升级（3个）
			const hasBike = gameState.hasBike;
			html += `<div class="equip-row">`;
			html += `<div class="equip-node ${hasBike && !bikeUpgrade ? 'active' : ''}" data-tip="平把公路车|每月SAN-1，每累计6点换SAN上限+1|金币商店购买（10金币）" data-color="equip">
				<div class="node-icon">🚲</div>
				<div class="node-label">平把车</div>
			</div>`;
			html += `<div class="equip-node ${bikeUpgrade === 'road' ? 'active' : ''}" data-tip="弯把公路车|每月SAN-2，每累计5点换SAN上限+1|购买自行车后升级（20金币）" data-color="equip">
				<div class="node-icon">🚴</div>
				<div class="node-label">弯把车</div>
			</div>`;
			html += `<div class="equip-node ${bikeUpgrade === 'ebike' ? 'active' : ''}" data-tip="小电驴|春季和秋季每月SAN+1|购买自行车后升级（12金币）" data-color="equip">
				<div class="node-icon">🛵</div>
				<div class="node-label">小电驴</div>
			</div>`;
			html += `</div>`;

			// 第三行：GPU、键盘、显示器、遮阳伞、羽绒服（5个）
			const gpuCount = gameState.gpuServersBought || 0;
			html += `<div class="equip-row">`;
			html += `<div class="equip-node ${gpuCount > 0 ? 'active' : ''}" data-tip="GPU服务器|每次做实验多做${gpuCount || 1}次，分数+${gpuCount || 1}|金币商店购买（10金币/台）" data-color="equip">
				<div class="node-icon">🖳</div>
				<div class="node-label">GPU</div>
				${gpuCount > 0 ? `<div class="equip-count">${gpuCount}</div>` : ''}
			</div>`;
			html += `<div class="equip-node ${furniture.keyboard ? 'active' : ''}" data-tip="机械键盘|写论文SAN消耗-1（变为SAN-3）|金币商店购买（8金币）" data-color="equip">
				<div class="node-icon">⌨️</div>
				<div class="node-label">键盘</div>
			</div>`;
			html += `<div class="equip-node ${furniture.monitor ? 'active' : ''}" data-tip="4K显示器|读论文SAN消耗-1（变为SAN-1）|金币商店购买（8金币）" data-color="equip">
				<div class="node-icon">🖥️</div>
				<div class="node-label">显示器</div>
			</div>`;
			html += `<div class="equip-node ${gameState.hasParasol ? 'active' : ''}" data-tip="遮阳伞|夏季(6-8月)\"烈日当空\"debuff无效：原本夏季SAN减少会额外-1，遮阳伞可抵消|金币商店购买（8金币）" data-color="equip">
				<div class="node-icon">☂️</div>
				<div class="node-label">遮阳伞</div>
			</div>`;
			html += `<div class="equip-node ${gameState.hasDownJacket ? 'active' : ''}" data-tip="羽绒服|冬季(12-2月)\"寒风刺骨\"debuff无效：原本冬季每月SAN回复-1，羽绒服可抵消|金币商店购买（8金币）" data-color="equip">
				<div class="node-icon">🧥</div>
				<div class="node-label">羽绒服</div>
			</div>`;
			html += `</div>`;

			// 第四行：4种护身符
			html += `<div class="equip-row">`;
			html += `<div class="equip-node ${amulets.san > 0 ? 'active' : ''}" data-tip="理智护身符|SAN降为0时自动+${amulets.san || 1}|成就商店购买" data-color="equip">
				<div class="node-icon">🛡️</div>
				<div class="node-label">SAN护符</div>
				${amulets.san > 0 ? `<div class="equip-count">${amulets.san}</div>` : ''}
			</div>`;
			html += `<div class="equip-node ${amulets.gold > 0 ? 'active' : ''}" data-tip="零钱护身符|金币降为0时自动+${amulets.gold || 1}|成就商店购买" data-color="equip">
				<div class="node-icon">💰</div>
				<div class="node-label">金币护符</div>
				${amulets.gold > 0 ? `<div class="equip-count">${amulets.gold}</div>` : ''}
			</div>`;
			html += `<div class="equip-node ${amulets.favor > 0 ? 'active' : ''}" data-tip="好感护身符|好感降为0时自动+${amulets.favor || 1}|成就商店购买" data-color="equip">
				<div class="node-icon">🎁</div>
				<div class="node-label">好感护符</div>
				${amulets.favor > 0 ? `<div class="equip-count">${amulets.favor}</div>` : ''}
			</div>`;
			html += `<div class="equip-node ${amulets.social > 0 ? 'active' : ''}" data-tip="社交护身符|社交降为0时自动+${amulets.social || 1}|成就商店购买" data-color="equip">
				<div class="node-icon">🤝</div>
				<div class="node-label">社交护符</div>
				${amulets.social > 0 ? `<div class="equip-count">${amulets.social}</div>` : ''}
			</div>`;
			html += `</div>`;

			html += `</div>`; // 装备栏结束
			html += `</div>`; // talent-container结束

			showModal('⭐ 天赋和装备', html, [{ text: '关闭', class: 'btn-primary', action: () => {
				// 关闭时移除tooltip
				const existingTip = document.getElementById('talent-tip');
				if (existingTip) existingTip.remove();
				closeModal();
			}}]);

			// 创建tooltip到body层级（避免被modal的overflow裁剪）
			setTimeout(() => {
				// 移除可能存在的旧tooltip
				const existingTip = document.getElementById('talent-tip');
				if (existingTip) existingTip.remove();

				// 创建新的tooltip元素
				const tooltip = document.createElement('div');
				tooltip.id = 'talent-tip';
				tooltip.className = 'talent-tip';
				tooltip.innerHTML = `
					<div class="talent-tip-title"></div>
					<div class="talent-tip-effect"></div>
					<div class="talent-tip-how"></div>
				`;
				tooltip.style.cssText = `
					position: fixed;
					background: rgba(15,15,20,0.98);
					border: 2px solid #4ecdc4;
					border-radius: 10px;
					padding: 10px 14px;
					max-width: 240px;
					z-index: 100000;
					pointer-events: none;
					display: none;
					box-shadow: 0 4px 20px rgba(0,0,0,0.5);
				`;
				document.body.appendChild(tooltip);

				// 绑定tooltip事件
				document.querySelectorAll('[data-tip]').forEach(el => {
					el.addEventListener('mouseenter', (e) => {
						const tipData = e.currentTarget.dataset.tip.split('|');
						const color = e.currentTarget.dataset.color || '';
						tooltip.querySelector('.talent-tip-title').textContent = tipData[0] || '';
						tooltip.querySelector('.talent-tip-effect').textContent = tipData[1] || '';
						tooltip.querySelector('.talent-tip-how').textContent = tipData[2] ? '获取：' + tipData[2] : '';

						// 设置边框和标题颜色
						const colors = {
							'blue': '#3498db',
							'purple': '#9b59b6',
							'orange': '#f39c12',
							'green': '#2ecc71',
							'equip': '#e67e22'
						};
						const borderColor = colors[color] || '#4ecdc4';
						tooltip.style.borderColor = borderColor;
						tooltip.querySelector('.talent-tip-title').style.color = borderColor;
						tooltip.querySelector('.talent-tip-effect').style.color = 'rgba(255,255,255,0.9)';
						tooltip.querySelector('.talent-tip-how').style.color = 'rgba(255,255,255,0.55)';
						tooltip.querySelector('.talent-tip-how').style.fontStyle = 'italic';
						tooltip.querySelector('.talent-tip-how').style.fontSize = '0.7rem';
						tooltip.querySelector('.talent-tip-title').style.fontWeight = '600';
						tooltip.querySelector('.talent-tip-title').style.fontSize = '0.85rem';
						tooltip.querySelector('.talent-tip-title').style.marginBottom = '5px';
						tooltip.querySelector('.talent-tip-effect').style.fontSize = '0.8rem';
						tooltip.querySelector('.talent-tip-effect').style.marginBottom = '6px';
						tooltip.querySelector('.talent-tip-effect').style.lineHeight = '1.4';

						tooltip.style.display = 'block';
					});
					el.addEventListener('mousemove', (e) => {
						const tipWidth = tooltip.offsetWidth;
						const tipHeight = tooltip.offsetHeight;
						let x = e.clientX + 15;
						let y = e.clientY + 15;
						// 防止超出右边界
						if (x + tipWidth > window.innerWidth - 10) {
							x = e.clientX - tipWidth - 15;
						}
						// 防止超出左边界
						if (x < 10) {
							x = 10;
						}
						// 防止超出下边界
						if (y + tipHeight > window.innerHeight - 10) {
							y = e.clientY - tipHeight - 15;
						}
						// 防止超出上边界
						if (y < 10) {
							y = 10;
						}
						tooltip.style.left = x + 'px';
						tooltip.style.top = y + 'px';
					});
					el.addEventListener('mouseleave', () => {
						tooltip.style.display = 'none';
					});

					// 移动端点击支持
					el.addEventListener('click', (e) => {
						e.stopPropagation();
						const tipData = e.currentTarget.dataset.tip.split('|');
						const color = e.currentTarget.dataset.color || '';
						tooltip.querySelector('.talent-tip-title').textContent = tipData[0] || '';
						tooltip.querySelector('.talent-tip-effect').textContent = tipData[1] || '';
						tooltip.querySelector('.talent-tip-how').textContent = tipData[2] ? '获取：' + tipData[2] : '';

						const colors = {
							'blue': '#3498db',
							'purple': '#9b59b6',
							'orange': '#f39c12',
							'green': '#2ecc71',
							'equip': '#e67e22'
						};
						const borderColor = colors[color] || '#4ecdc4';
						tooltip.style.borderColor = borderColor;
						tooltip.querySelector('.talent-tip-title').style.color = borderColor;
						tooltip.querySelector('.talent-tip-effect').style.color = 'rgba(255,255,255,0.9)';
						tooltip.querySelector('.talent-tip-how').style.color = 'rgba(255,255,255,0.55)';
						tooltip.querySelector('.talent-tip-how').style.fontStyle = 'italic';
						tooltip.querySelector('.talent-tip-how').style.fontSize = '0.7rem';
						tooltip.querySelector('.talent-tip-title').style.fontWeight = '600';
						tooltip.querySelector('.talent-tip-title').style.fontSize = '0.85rem';
						tooltip.querySelector('.talent-tip-title').style.marginBottom = '5px';
						tooltip.querySelector('.talent-tip-effect').style.fontSize = '0.8rem';
						tooltip.querySelector('.talent-tip-effect').style.marginBottom = '6px';
						tooltip.querySelector('.talent-tip-effect').style.lineHeight = '1.4';

						tooltip.style.display = 'block';

						// 计算位置（移动端居中显示）
						const tipWidth = tooltip.offsetWidth;
						const tipHeight = tooltip.offsetHeight;
						let x = (window.innerWidth - tipWidth) / 2;
						let y = e.clientY + 20;

						// 防止超出下边界
						if (y + tipHeight > window.innerHeight - 10) {
							y = e.clientY - tipHeight - 20;
						}
						// 防止超出上边界
						if (y < 10) {
							y = 10;
						}

						tooltip.style.left = x + 'px';
						tooltip.style.top = y + 'px';

						// 3秒后自动隐藏
						setTimeout(() => {
							tooltip.style.display = 'none';
						}, 3000);
					});
				});

				// 点击其他区域关闭tooltip
				document.addEventListener('click', (e) => {
					if (!e.target.closest('[data-tip]')) {
						tooltip.style.display = 'none';
					}
				});
			}, 150);
		}

        function updateGraduation() {
            // 剩余月数已移至日志条目中显示，此函数仅保留接口兼容性
        }

		function updateBuffs() {
			const list = document.getElementById('buff-list');
			const allBuffs = [...gameState.buffs.permanent, ...gameState.buffs.temporary];
			
			if (!gameState.triggeredBuffTypes) {
				gameState.triggeredBuffTypes = [];
			}
			allBuffs.forEach(buff => {
				if (buff.type && !gameState.triggeredBuffTypes.includes(buff.type)) {
					gameState.triggeredBuffTypes.push(buff.type);
				}
			});
			
			if (gameState.hasLover) {
				const loverBuffName = gameState.loverType === 'beautiful'
					? '💕恋人(SAN+3,金-2)'
					: '💕聪慧恋人(金-2)';
				allBuffs.push({ type: 'lover', name: loverBuffName, permanent: true, isLove: true });
			}
			
			if (gameState.ailabInternship) {
				const sanCost = gameState.isReversed && gameState.character === 'normal'
					? (gameState.reversedAwakened ? 6 : 4)
					: 2;
				allBuffs.push({
					type: 'internship',
					name: `🏢AILab实习(金+2,SAN-${sanCost},实验×1.25)`,
					permanent: true,
					isInternship: true
				});
			}
			
			// ★★★ 修复：移除提前return，改为标记 ★★★
			const hasRegularBuffs = allBuffs.length > 0;
			
			// 定义负面debuff类型
			const negativeDebuffTypes = [
				'idea_exhaustion', 'exp_overheat', 'write_block', 'slack_debuff', 'idea_stolen'
			];
			
			// 定义订阅buff类型
			const subscriptionBuffTypes = [
				'idea_san_reduce', 'exp_san_reduce', 'write_san_reduce_temp'
			];
			
			// debuff显示名称
			const specialBuffNames = {
				'idea_exhaustion': '💫 灵感枯竭：下次想idea总分÷2',
				'exp_overheat': '🔥 主机发烫：下次做实验总分÷2',
				'write_block': '✏️ 无从下笔：下次写论文总分÷2',
				'slack_debuff': '😴 松懈：下月所有操作总分÷2',
				'idea_stolen': '😈 被偷idea：下次想idea总分÷2',
				'idea_san_reduce': '🤖 Gemini：本月想idea SAN-1,分+4',
				'exp_san_reduce': '🤖 GPT：本月做实验 SAN-1,分+4',
				'write_san_reduce_temp': '🤖 Claude：本月写论文 SAN-1,分+4'
			};
			
			const mergedMap = {};
			const specialBuffs = [];
			
			allBuffs.forEach(buff => {
				if (buff.isLove) {
					mergedMap['lover'] = buff;
					return;
				}
				if (buff.isInternship) {
					mergedMap['internship'] = buff;
					return;
				}
				if (buff.type === 'mentorship') {
					mergedMap['mentorship'] = buff;
					return;
				}
				
				if (negativeDebuffTypes.includes(buff.type)) {
					specialBuffs.push({
						name: specialBuffNames[buff.type] || buff.name,
						permanent: false,
						isLove: false,
						isDebuff: true,
						isSpecialDebuff: true
					});
					return;
				}
				
				if (subscriptionBuffTypes.includes(buff.type)) {
					const alreadyAdded = specialBuffs.some(b => b.subscriptionType === buff.type);
					if (!alreadyAdded) {
						specialBuffs.push({
							name: specialBuffNames[buff.type] || buff.name,
							permanent: false,
							isLove: false,
							isDebuff: false,
							isSubscription: true,
							subscriptionType: buff.type
						});
					}
					return;
				}
				
				const key = `${buff.type}_${buff.multiply ? 'mul' : 'add'}_${buff.permanent ? 'perm' : 'temp'}`;
				
				if (mergedMap[key]) {
					if (buff.multiply) {
						mergedMap[key].value += (buff.value - 1);
					} else {
						mergedMap[key].value += buff.value;
					}
				} else {
					mergedMap[key] = { ...buff };
				}
				
				if (buff.multiply && mergedMap[key].value < 0) {
					mergedMap[key].value = 0;
				}
			});
			
			const merged = Object.values(mergedMap).map(buff => {
				if (buff.isLove) {
					return { name: buff.name, permanent: true, isLove: true, isDebuff: false };
				}
				if (buff.isInternship) {
					return { name: buff.name, permanent: true, isInternship: true, isDebuff: false };
				}
				if (buff.type === 'mentorship') {
					return { 
						name: buff.name, 
						desc: buff.desc,
						permanent: true, 
						isLove: false, 
						isDebuff: false,
						isMentorship: true 
					};
				}
				
				let name = '';
				const prefix = buff.permanent ? '每次' : '下次';
				const typeNames = {
					'idea_bonus': '想idea分数',
					'exp_bonus': '做实验分数',
					'write_bonus': '写论文分数',
					'idea_times': '想idea',
					'exp_times': '做实验',
					'write_times': '写论文',
					'monthly_san': '每月SAN',
					'monthly_san_2': '每月SAN',
					'monthly_san_lost_10': '每月SAN',
					'monthly_san_current_20': '每月SAN',
					'monthly_san_recovery': '每月SAN',
					'lover_monthly_san': '每月SAN',
					'lover_extra_idea': '想idea',
					'lover_extra_experiment': '做实验',
					'lover_extra_write': '写论文',
					'read_san_reduce': '读论文SAN',
					'write_san_reduce': '写论文SAN',
					'citation_multiply': '中稿引用'
				};

				const typeName = typeNames[buff.type] || buff.type;
				let isDebuff = false;

				if (buff.type.includes('_times')) {
					name = `${prefix}${typeName}+${buff.value}次`;
				} else if (buff.type === 'monthly_san') {
					name = `每月SAN+${buff.value}`;
				} else if (buff.type === 'monthly_san_2') {
					name = `每月SAN+2 (高级工学椅)`;
				} else if (buff.type === 'monthly_san_lost_10') {
					name = `每月SAN+10%已损失 (电动按摩椅)`;
				} else if (buff.type === 'monthly_san_current_20') {
					name = `每月SAN+20%当前 (头悬梁椅)`;
				} else if (buff.type === 'monthly_san_recovery') {
					name = `每月SAN+1 (强身健体)`;
				} else if (buff.type === 'lover_monthly_san') {
					name = buff.desc || `每月SAN+1 (恋人)`;
				} else if (buff.type === 'lover_extra_idea') {
					name = buff.desc || `每次想idea多想1次 (恋人)`;
				} else if (buff.type === 'lover_extra_experiment') {
					name = buff.desc || `每次做实验多做1次 (恋人)`;
				} else if (buff.type === 'lover_extra_write') {
					name = buff.desc || `每次写论文多写1次 (恋人)`;
				} else if (buff.type === 'read_san_reduce') {
					name = `读论文SAN-1`;
				} else if (buff.type === 'write_san_reduce') {
					name = `写论文SAN-3`;
				} else if (buff.type === 'citation_multiply') {
					name = `下篇中稿引用+${Math.round((buff.value-1)*100)}%`;
				} else if (buff.multiply) {
					if (buff.value < 1) isDebuff = true;
					name = `${prefix}${typeName}×${buff.value}`;
				} else {
					if (buff.value < 0) isDebuff = true;
					const sign = buff.value >= 0 ? '+' : '';
					name = `${prefix}${typeName}${sign}${buff.value}`;
				}
				
				return { name, permanent: buff.permanent, isLove: false, isDebuff };
			});
			
			const allDisplayBuffs = [...merged, ...specialBuffs];
			
			// ★★★ 修复：先渲染普通buff（可能为空字符串）★★★
			list.innerHTML = allDisplayBuffs.map(buff => {
				let tagClass = 'buff-tag ';
				if (buff.isLove) tagClass += 'love';
				else if (buff.isInternship) tagClass += 'temporary';
				else if (buff.isSubscription) tagClass += 'temporary';
				else if (buff.isSpecialDebuff) tagClass += 'debuff';
				else if (buff.isMentorship) tagClass += 'permanent';
				else if (buff.isDebuff) tagClass += 'debuff';
				else if (buff.permanent) tagClass += 'permanent';
				else tagClass += 'temporary';
				
				let icon = 'fa-clock';
				if (buff.isLove) icon = 'fa-heart';
				else if (buff.isInternship) icon = 'fa-building';
				else if (buff.isSubscription) icon = 'fa-robot';
				else if (buff.isSpecialDebuff) icon = 'fa-exclamation-triangle';
				else if (buff.isMentorship) icon = 'fa-user-graduate';
				else if (buff.isDebuff) icon = 'fa-arrow-down';
				else if (buff.permanent) icon = 'fa-infinity';
				
				const descText = buff.isMentorship && buff.desc ? ` (${buff.desc})` : '';
				
				return `<span class="${tagClass}">
					<i class="fas ${icon}"></i>
					${buff.name}${descText}
				</span>`;
			}).join('');
			
			// ★★★ 修复：技能显示放在这里，不受allBuffs.length影响 ★★★
			
			// 师兄师姐救我技能
			if (gameState.hasSeniorHelpSkill) {
				const pendingText = gameState.nextActionBonusSource === 'senior' && gameState.nextActionBonusType
					? `（已选：${gameState.nextActionBonusType === 'idea' ? '想idea' : gameState.nextActionBonusType === 'exp' ? '做实验' : '写论文'}）`
					: '';
				// 显示剩余免费次数或当前社交值
				const statusText = gameState.seniorHelpUses > 0
					? `免费${gameState.seniorHelpUses}/3`
					: `消耗社交${gameState.social}`;
				const skillHtml = `<span class="buff-tag permanent" style="cursor:pointer;background:linear-gradient(135deg,rgba(243,156,18,0.3),rgba(230,126,34,0.3));border-color:#f39c12;" onclick="useSeniorHelpSkill()">
					<i class="fas fa-hands-helping"></i>
					🆘 师兄师姐救我 (${statusText}) ${pendingText}
				</span>`;
				list.innerHTML += skillHtml;
			}

			// 导师救我技能
			if (gameState.hasTeacherHelpSkill) {
				const pendingText = gameState.nextActionBonusSource === 'teacher' && gameState.nextActionBonusType
					? `（已选：${gameState.nextActionBonusType === 'idea' ? '想idea' : gameState.nextActionBonusType === 'exp' ? '做实验' : '写论文'}）`
					: '';
				// 显示剩余免费次数或当前好感度
				const statusText = gameState.teacherHelpUses > 0
					? `免费${gameState.teacherHelpUses}/3`
					: `消耗好感${gameState.favor}`;
				const skillHtml = `<span class="buff-tag permanent" style="cursor:pointer;background:linear-gradient(135deg,rgba(253,121,168,0.3),rgba(232,67,147,0.3));border-color:#fd79a8;" onclick="useTeacherHelpSkill()">
					<i class="fas fa-user-shield"></i>
					🛡️ 导师救我 (${statusText}) ${pendingText}
				</span>`;
				list.innerHTML += skillHtml;
			}

			// ★★★ 新增：季节buff单独显示（不合并，突出四季变换）★★★
			const season = getCurrentSeason();
			if (season) {
				const seasonColors = {
					spring: { bg: 'linear-gradient(135deg,rgba(255,182,193,0.3),rgba(144,238,144,0.3))', border: '#ff69b4', icon: 'fa-seedling' },
					summer: { bg: 'linear-gradient(135deg,rgba(255,215,0,0.3),rgba(255,140,0,0.3))', border: '#ff8c00', icon: 'fa-sun' },
					autumn: { bg: 'linear-gradient(135deg,rgba(210,105,30,0.3),rgba(255,165,0,0.3))', border: '#d2691e', icon: 'fa-leaf' },
					winter: { bg: 'linear-gradient(135deg,rgba(173,216,230,0.3),rgba(135,206,250,0.3))', border: '#00bfff', icon: 'fa-snowflake' }
				};
				const seasonKey = Object.keys(SEASONS).find(k => SEASONS[k].name === season.name) || 'autumn';
				const colors = seasonColors[seasonKey] || seasonColors.autumn;

				const seasonHtml = `<span class="buff-tag season-buff" style="background:${colors.bg};border-color:${colors.border};border-width:2px;" title="${season.buff}：${season.desc}">
					<i class="fas ${colors.icon}"></i>
					${season.icon} ${season.buff}
				</span>`;
				list.innerHTML += seasonHtml;
			}

			// ★★★ 修复：最后检查是否完全没有内容 ★★★
			if (list.innerHTML.trim() === '') {
				list.innerHTML = '<span style="color:var(--text-secondary);font-size:0.8rem;">暂无效果</span>';
			}
		}			

		function useSeniorHelpSkill() {
			if (!gameState.hasSeniorHelpSkill) {
				showModal('❌ 无法使用', '<p>你没有此技能。</p>',
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			// 如果免费次数用完，检查社交是否足够
			if (gameState.seniorHelpUses <= 0 && gameState.social < 1) {
				showModal('❌ 无法使用', '<p>社交值不足，无法使用技能。</p>',
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			// ★★★ 检查是否已经有待生效的加成 ★★★
			if (gameState.nextActionBonus > 0 && gameState.nextActionBonusSource === 'senior') {
				const actionName = gameState.nextActionBonusType === 'idea' ? '想idea'
					: gameState.nextActionBonusType === 'exp' ? '做实验' : '写论文';
				const statusText = gameState.seniorHelpUses > 0 ? `免费${gameState.seniorHelpUses}/3` : `当前社交${gameState.social}`;
				showModal('⚠️ 技能待生效',
					`<p>你已经选择了对【${actionName}】使用师兄师姐救我。</p>
					 <p style="color:var(--warning-color);">请先执行该操作后，才能再次使用技能。</p>
					 <p style="font-size:0.8rem;color:var(--text-secondary);">${statusText}</p>`,
					[{ text: '知道了', class: 'btn-primary', action: closeModal }]);
				return;
			}

			const bonusValue = gameState.social;
			const isFree = gameState.seniorHelpUses > 0;
			const costText = isFree ? `（免费次数剩余 ${gameState.seniorHelpUses}/3）` : `<span style="color:#e74c3c;">使用后社交-1</span>`;

			showModal('🆘 师兄师姐救我',
				`<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:2.5rem;margin-bottom:10px;">🆘</div>
					<div style="font-size:1.1rem;font-weight:600;color:#f39c12;">师兄师姐救我</div>
					<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:5px;">${costText}</div>
				</div>
				<p>选择要加成的操作类型，下次执行该操作时科研能力将视为：</p>
				<div style="text-align:center;padding:15px;background:var(--light-bg);border-radius:10px;margin:15px 0;">
					<span style="font-size:1.2rem;color:var(--primary-color);font-weight:600;">
						科研(${gameState.research}) + 社交(${bonusValue}) = ${gameState.research + bonusValue}
					</span>
				</div>`,
				[
					{ text: '取消', class: 'btn-info', action: closeModal },
					{ text: '💡 用于想idea', class: 'btn-primary', action: () => {
						applySkillBonus('senior', 'idea', bonusValue);
					}},
					{ text: '🔬 用于做实验', class: 'btn-success', action: () => {
						applySkillBonus('senior', 'exp', bonusValue);
					}},
					{ text: '✍️ 用于写论文', class: 'btn-warning', action: () => {
						applySkillBonus('senior', 'write', bonusValue);
					}}
				]
			);
		}

		function useTeacherHelpSkill() {
			if (!gameState.hasTeacherHelpSkill) {
				showModal('❌ 无法使用', '<p>你没有此技能。</p>',
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			// 如果免费次数用完，检查好感度是否足够
			if (gameState.teacherHelpUses <= 0 && gameState.favor < 1) {
				showModal('❌ 无法使用', '<p>好感度不足，无法使用技能。</p>',
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			// ★★★ 检查是否已经有待生效的加成 ★★★
			if (gameState.nextActionBonus > 0 && gameState.nextActionBonusSource === 'teacher') {
				const actionName = gameState.nextActionBonusType === 'idea' ? '想idea'
					: gameState.nextActionBonusType === 'exp' ? '做实验' : '写论文';
				const statusText = gameState.teacherHelpUses > 0 ? `免费${gameState.teacherHelpUses}/3` : `当前好感度${gameState.favor}`;
				showModal('⚠️ 技能待生效',
					`<p>你已经选择了对【${actionName}】使用导师救我。</p>
					 <p style="color:var(--warning-color);">请先执行该操作后，才能再次使用技能。</p>
					 <p style="font-size:0.8rem;color:var(--text-secondary);">${statusText}</p>`,
					[{ text: '知道了', class: 'btn-primary', action: closeModal }]);
				return;
			}

			const bonusValue = gameState.favor;
			const isFree = gameState.teacherHelpUses > 0;
			const costText = isFree ? `（免费次数剩余 ${gameState.teacherHelpUses}/3）` : `<span style="color:#e74c3c;">使用后好感度-1</span>`;

			showModal('🛡️ 导师救我',
				`<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:2.5rem;margin-bottom:10px;">🛡️</div>
					<div style="font-size:1.1rem;font-weight:600;color:#fd79a8;">导师救我</div>
					<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:5px;">${costText}</div>
				</div>
				<p>选择要加成的操作类型，下次执行该操作时科研能力将视为：</p>
				<div style="text-align:center;padding:15px;background:var(--light-bg);border-radius:10px;margin:15px 0;">
					<span style="font-size:1.2rem;color:var(--primary-color);font-weight:600;">
						科研(${gameState.research}) + 好感度(${bonusValue}) = ${gameState.research + bonusValue}
					</span>
				</div>`,
				[
					{ text: '取消', class: 'btn-info', action: closeModal },
					{ text: '💡 用于想idea', class: 'btn-primary', action: () => {
						applySkillBonus('teacher', 'idea', bonusValue);
					}},
					{ text: '🔬 用于做实验', class: 'btn-success', action: () => {
						applySkillBonus('teacher', 'exp', bonusValue);
					}},
					{ text: '✍️ 用于写论文', class: 'btn-warning', action: () => {
						applySkillBonus('teacher', 'write', bonusValue);
					}}
				]
			);
		}

		// ★★★ 新增：应用技能加成的通用函数 ★★★
		function applySkillBonus(source, actionType, bonusValue) {
			let costInfo = '';
			if (source === 'senior') {
				if (gameState.seniorHelpUses > 0) {
					// 免费次数内，扣免费次数
					gameState.seniorHelpUses--;
					costInfo = `免费${gameState.seniorHelpUses + 1}/3→${gameState.seniorHelpUses}/3`;
				} else {
					// 免费次数用完，扣社交
					gameState.social--;
					costInfo = `社交-1（当前${gameState.social}）`;
				}
			} else {
				if (gameState.teacherHelpUses > 0) {
					// 免费次数内，扣免费次数
					gameState.teacherHelpUses--;
					costInfo = `免费${gameState.teacherHelpUses + 1}/3→${gameState.teacherHelpUses}/3`;
				} else {
					// 免费次数用完，扣好感度
					gameState.favor--;
					costInfo = `好感度-1（当前${gameState.favor}）`;
				}
			}

			gameState.nextActionBonus = bonusValue;
			gameState.nextActionBonusSource = source;
			gameState.nextActionBonusType = actionType;

			const sourceName = source === 'senior' ? '师兄师姐救我' : '导师救我';
			const actionName = actionType === 'idea' ? '想idea' : actionType === 'exp' ? '做实验' : '写论文';

			addLog('主动技能', sourceName, `下次${actionName}时科研能力+${bonusValue}，${costInfo}`);
			closeModal();
			updateBuffs();
			updateAllUI();
		}

		function updateResearchResults() {
			document.getElementById('paper-a-count').textContent = gameState.paperA;
			document.getElementById('paper-b-count').textContent = gameState.paperB;
			document.getElementById('paper-c-count').textContent = gameState.paperC;
			document.getElementById('total-score').textContent = gameState.totalScore;
			document.getElementById('total-citations').textContent = gameState.totalCitations;

			// ★★★ 新增：S类期刊论文统计 ★★★
			const paperS = gameState.paperS || 0;
			const paperNature = gameState.paperNature || 0;
			const paperNatureSub = gameState.paperNatureSub || 0;

			const journalStatsEl = document.getElementById('journal-stats');
			if (journalStatsEl) {
				// 只有当有S类论文或有升级槽位时才显示
				const hasJournalPapers = paperS > 0;
				const hasUpgradedSlots = gameState.upgradedSlots && gameState.upgradedSlots.length > 0;
				journalStatsEl.style.display = (hasJournalPapers || hasUpgradedSlots) ? 'flex' : 'none';
			}

			const paperNatureEl = document.getElementById('paper-nature-count');
			const paperNatureSubEl = document.getElementById('paper-naturesub-count');
			const paperSEl = document.getElementById('paper-s-count');

			if (paperNatureEl) paperNatureEl.textContent = paperNature;
			if (paperNatureSubEl) paperNatureSubEl.textContent = paperNatureSub;
			if (paperSEl) paperSEl.textContent = paperS;

			const paperList = document.getElementById('published-papers');
			if (gameState.publishedPapers.length === 0) {
				paperList.innerHTML = '<p style="color:var(--text-secondary);font-size:0.75rem;text-align:center;">暂无已发表论文</p>';
			} else {
				paperList.innerHTML = gameState.publishedPapers.map((p, index) => {
					// ★★★ 获取会议名称 ★★★
					const confName = p.conferenceInfo 
						? `${p.conferenceInfo.name} ${p.conferenceInfo.year} (${p.grade}类)` 
						: `${p.grade}类`;
					
					// ★★★ 新增：计算并显示影响因子和录用率 ★★★
					let statsInfo = '';
					if (p.conferenceInfo && gameState.submissionStats) {
						const month = p.conferenceInfo.month || 1;
						const statsKey = `${month}_${p.grade}_${gameState.isReversed}`;
						const stats = gameState.submissionStats[statsKey];
						
						if (stats && stats.submissions >= 10) {
							const impactFactor = getConferenceImpactFactor(p.conferenceInfo, p.grade);
							const acceptRate = (stats.acceptRate * 100).toFixed(1);
							statsInfo = `
								<div style="font-size:0.6rem;color:var(--text-secondary);margin-top:2px;">
									📊 IF:${impactFactor.toFixed(2)} | 录用率:${acceptRate}%
								</div>
							`;
						}
					}
					
					// ★★★ 新增：引用增速显示 ★★★
					const citationMultiplierText = p.citationMultiplier > 1 
						? ` <span style="color:var(--success-color);">(×${p.citationMultiplier.toFixed(2)})</span>` 
						: '';
					
					return `
					<div class="paper-item grade-${p.grade}">
						<div class="title">${p.title}</div>
						<div class="meta">
							<span>${confName}|${p.acceptType}</span>
							<span>分:${p.score} 引:${p.citations}${citationMultiplierText}</span>
						</div>
						${statsInfo}
						<div class="paper-promotions" style="margin-top:6px;display:flex;flex-wrap:wrap;gap:3px;">
							<button class="btn ${p.promotions?.arxiv ? '' : 'btn-info'}" 
								style="padding:2px 5px;font-size:0.6rem;${p.promotions?.arxiv ? 'opacity:0.5;background:#ccc;color:#666;cursor:default;' : ''}" 
								onclick="promotePaper(${index}, 'arxiv')" 
								${p.promotions?.arxiv ? 'disabled' : ''}>
								${p.promotions?.arxiv ? '✓arxiv' : '挂arxiv'}
							</button>
							<button class="btn ${p.promotions?.github ? '' : 'btn-success'}" 
								style="padding:2px 5px;font-size:0.6rem;${p.promotions?.github ? 'opacity:0.5;background:#ccc;color:#666;cursor:default;' : ''}" 
								onclick="promotePaper(${index}, 'github')" 
								${p.promotions?.github ? 'disabled' : ''}>
								${p.promotions?.github ? '✓开源' : 'github开源'}
							</button>
							<button class="btn ${p.promotions?.xiaohongshu ? '' : 'btn-accent'}"
								style="padding:2px 5px;font-size:0.6rem;${p.promotions?.xiaohongshu ? 'opacity:0.5;background:#ccc;color:#666;cursor:default;' : ''}"
								onclick="promotePaper(${index}, 'xiaohongshu')"
								${p.promotions?.xiaohongshu ? 'disabled' : ''}>
								${p.promotions?.xiaohongshu ? '✓小红书' : '小红书宣传'}
							</button>
							${(p.grade === 'A' || p.grade === 'S') ? `
							<button class="btn ${p.promotions?.quantumbit ? '' : 'btn-warning'}"
								style="padding:2px 5px;font-size:0.6rem;${p.promotions?.quantumbit ? 'opacity:0.5;background:#ccc;color:#666;cursor:default;' : ''}"
								onclick="promotePaper(${index}, 'quantumbit')"
								${p.promotions?.quantumbit ? 'disabled' : ''}
								title="有效分数+25%中稿分">
								${p.promotions?.quantumbit ? (p.grade === 'S' ? '✓机器之心' : '✓量子位') : (p.grade === 'S' ? '机器之心' : '量子位宣传')}
							</button>
							` : ''}
						</div>
					</div>
				`}).join('');
			}
		}

        function getActionCosts() {
            const has4K = gameState.buffs.permanent.some(b => b.type === 'read_san_reduce');
            const hasKeyboard = gameState.buffs.permanent.some(b => b.type === 'write_san_reduce');

            // ★★★ 修改：计算动态SAN消耗和金钱奖励（1-8次基础，9次起每8次提升1档）★★★
            const nextWorkCount = (gameState.workCount || 0) + 1;
            const workTier = Math.floor((nextWorkCount - 1) / 8);
            const workSan = -(5 + workTier);  // -5, -6, -7...
            const workGold = 2 + workTier;    // 2, 3, 4...

            return {
                read: { san: has4K ? -1 : -2 },
                work: { san: workSan, gold: workGold },
                idea: { san: -2 },
                experiment: { san: -3 },
                write: { san: hasKeyboard ? -3 : -4 }
            };
        }

        function formatCost(cost) {
            const parts = [];
            if (cost.san) parts.push(`<span style="color:${cost.san > 0 ? 'var(--success-color)' : 'var(--danger-color)'}">SAN${cost.san > 0 ? '+' : ''}${cost.san}</span>`);
            if (cost.gold) parts.push(`<span style="color:${cost.gold > 0 ? 'var(--success-color)' : 'var(--danger-color)'}">💰${cost.gold > 0 ? '+' : ''}${cost.gold}</span>`);
            return parts.join(' ');
        }

		function updateActionButtons() {
			const btns = ['btn-read', 'btn-work', 'btn-idea', 'btn-experiment', 'btn-write'];

			// ★★★ 修复：添加默认值，防止 undefined 导致 NaN 计算 ★★★
			const actionLimit = gameState.actionLimit || 1;
			const actionCount = gameState.actionCount || 0;
			const actionsRemaining = actionLimit - actionCount;
			const allUsed = actionsRemaining <= 0;

			btns.forEach(id => {
				const btn = document.getElementById(id);
				if (!btn) return;
				btn.disabled = allUsed;
				btn.style.opacity = allUsed ? '0.5' : '1';
				// ★★★ 新增：确保禁用状态下不可点击 ★★★
				btn.style.pointerEvents = allUsed ? 'none' : 'auto';
			});

			const costs = getActionCosts();

			// 显示剩余行动次数
			const actionCountDisplay = actionLimit > 1
				? ` (${actionsRemaining}/${actionLimit})`
				: '';
			
			// 改为2行布局：第一行图标+文字，第二行效果
			document.getElementById('btn-read').innerHTML = `
				<div class="action-top"><i class="fas fa-book-open"></i><span>看论文${actionCountDisplay}</span></div>
				<span class="action-cost">${formatCost(costs.read)}</span>`;
			document.getElementById('btn-work').innerHTML = `
				<div class="action-top"><i class="fas fa-briefcase"></i><span>打工${actionCountDisplay}</span></div>
				<span class="action-cost">${formatCost(costs.work)}</span>`;
			document.getElementById('btn-idea').innerHTML = `
				<div class="action-top"><i class="fas fa-lightbulb"></i><span>想idea${actionCountDisplay}</span></div>
				<span class="action-cost">${formatCost(costs.idea)}</span>`;
			document.getElementById('btn-experiment').innerHTML = `
				<div class="action-top"><i class="fas fa-vial"></i><span>做实验${actionCountDisplay}</span></div>
				<span class="action-cost">${formatCost(costs.experiment)}</span>`;
			document.getElementById('btn-write').innerHTML = `
				<div class="action-top"><i class="fas fa-pen-fancy"></i><span>写论文${actionCountDisplay}</span></div>
				<span class="action-cost">${formatCost(costs.write)}</span>`;
		}

        // ==================== 事件预告系统 ====================
		function getUpcomingEvents() {
			const events = [];
			
			for (let i = 1; i <= 2; i++) {
				let checkMonth = gameState.month + i;
				let checkYear = gameState.year;
				
				if (checkMonth > 12) {
					checkMonth -= 12;
					checkYear++;
				}
				
				const checkTotalMonths = gameState.totalMonths + i;
				const maxMonths = gameState.maxYears * 12;
				if (checkTotalMonths > maxMonths) continue;
				
				let monthEvents = [];  // 一个月可能有多个事件
				
				// ★★★ 新增：检查审稿结果 ★★★
				let reviewCount = 0;
				gameState.papers.forEach((paper, idx) => {
					if (paper && paper.reviewing) {
						const remainingMonths = paper.reviewMonths - i;
						if (remainingMonths <= 0) {
							reviewCount++;
						}
					}
				});
				if (reviewCount > 0) {
					monthEvents.push({
						name: reviewCount > 1 ? `${reviewCount}篇审稿结果` : '审稿结果',
						icon: '📬'
					});
				}
				
				// 原有事件检测
				if (checkMonth === 5) {
					monthEvents.push({ name: '寒假', icon: '❄️' });
				} else if (checkMonth === 9) {
					monthEvents.push({ name: '领域年会', icon: '🏛️' });  // ★★★ 新增 ★★★
				} else if (checkMonth === 11) {
					monthEvents.push({ name: '暑假', icon: '☀️' });
				} else if (checkMonth === 1 && checkYear >= 2) {
					monthEvents.push({ name: '奖学金', icon: '🎓' });
				} else if (checkMonth === 2) {
					monthEvents.push({ name: '教师节', icon: '🎁' });
				} else if (checkMonth === 12) {
					monthEvents.push({ name: '学年总结', icon: '📅' });
				} else if (checkMonth % 2 === 0 && monthEvents.length === 0) {
					// 只有没有其他事件时才显示随机事件
					monthEvents.push({ name: '随机事件', icon: '🎲' });
				}
				
				// 添加到事件列表
				monthEvents.forEach(evt => {
					events.push({
						month: i,
						name: evt.name,
						icon: evt.icon,
						label: i === 1 ? '下月' : '2月后'
					});
				});
			}
			
			return events;
		}

		function updateEventPreview() {
			const previewEl = document.getElementById('event-preview');
			if (!previewEl) return;

			const events = getUpcomingEvents();

			// ★★★ 日历按钮放在右边 ★★★
			const calendarBtn = `<button class="btn btn-info" style="padding:3px 8px;font-size:0.7rem;margin-left:auto;vertical-align:middle;" onclick="event.stopPropagation();showFullCalendar()" title="查看完整事件日历"><i class="fas fa-calendar-alt"></i> 日历</button>`;

			if (events.length === 0) {
				previewEl.innerHTML = calendarBtn;
				return;
			}

			// ★★★ 预报文字 ★★★
			const previewHtml = events.map(e =>
				`<span style="margin-left:6px;padding:3px 8px;background:${getEventColor(e.name)};border-radius:10px;font-size:0.8rem;font-weight:500;white-space:nowrap;vertical-align:middle;">${e.icon} ${e.label}:${e.name}</span>`
			).join('');

			// 使用 flex 布局让它们垂直居中对齐
			previewEl.style.display = 'inline-flex';
			previewEl.style.alignItems = 'center';
			previewEl.style.width = '100%';

			// ★★★ 日历按钮放在最右边 ★★★
			previewEl.innerHTML = `${previewHtml}${calendarBtn}`;
		}

		function getEventColor(eventName) {
			const colors = {
				'寒假': 'rgba(116,185,255,0.25)',
				'暑假': 'rgba(253,203,110,0.25)',
				'奖学金': 'rgba(108,92,231,0.25)',
				'教师节': 'rgba(253,121,168,0.25)',
				'随机事件': 'rgba(0,184,148,0.2)',
				'学年总结': 'rgba(162,155,254,0.25)',
				'CCIG': 'rgba(231,76,60,0.25)'  // ★★★ 新增：红色系代表中国 ★★★
			};
			return colors[eventName] || 'rgba(99,110,114,0.15)';
		}
		// ==================== 显示完整事件日历 ====================
		function showFullCalendar() {
			// ★★★ 修改：始终显示6年（含可选延毕年）★★★
			const maxYears = 6;

			// 游戏月份转现实月份
			function gameMonthToRealMonth(gameMonth) {
				return ((gameMonth - 1 + 8) % 12) + 1;
			}

			// 获取月份的固定事件
			function getMonthEvent(year, month) {
				const events = [];

				// ★★★ 第一年第一月：导师选择 ★★★
				if (year === 1 && month === 1) {
					events.push({ icon: '👨‍🏫', name: '选择导师', desc: '入学第一件事：选择你的导师', color: 'rgba(108,92,231,0.25)' });
				}

				// ★★★ 修改：第6年（延毕年）没有寒暑假和奖学金 ★★★
				const isYear6 = year === 6;

				if (month === 5) {
					if (isYear6) {
						events.push({ icon: '🔬', name: '全力科研', desc: '延毕年没有寒假，专心冲击Nature', color: 'rgba(155,89,182,0.25)' });
					} else {
						events.push({ icon: '❄️', name: '寒假', desc: '回家过年，压岁钱+1，SAN+2', color: 'rgba(116,185,255,0.25)' });
					}
				}
				if (month === 9) {
					// ★★★ 新增：CCIG事件 ★★★
					const ccigLocations = ['合肥', '成都', '苏州', '西安', '重庆'];
					const ccigLocation = ccigLocations[(year - 1) % 5];
					events.push({ icon: '🏛️', name: '领域年会', desc: `中国图象图形学学会年会 @ ${ccigLocation}`, color: 'rgba(231,76,60,0.25)' });
				}
				if (month === 11) {
					if (isYear6) {
						events.push({ icon: '🔬', name: '全力科研', desc: '延毕年没有暑假，专心冲击Nature', color: 'rgba(155,89,182,0.25)' });
					} else {
						events.push({ icon: '☀️', name: '暑假', desc: '暑假休息，SAN+3', color: 'rgba(253,203,110,0.25)' });
					}
				}
				if (month === 1 && year >= 2) {
					if (isYear6) {
						events.push({ icon: '🔬', name: '全力科研', desc: '延毕年没有奖学金评定', color: 'rgba(155,89,182,0.25)' });
					} else {
						const req = { 2: 1, 3: 3, 4: 6, 5: 9 }[year] || 9;
						const reward = { 2: 5, 3: 5, 4: 8, 5: 8 }[year] || 8;
						events.push({ icon: '🎓', name: '奖学金', desc: `要求科研分≥${req}，奖励${reward}金`, color: 'rgba(108,92,231,0.25)' });
					}
				}
				if (month === 2) {
					events.push({ icon: '🎁', name: '教师节', desc: '可选择送礼物给导师', color: 'rgba(253,121,168,0.25)' });
				}
				if (month === 12) {
					events.push({ icon: '📅', name: '学年总结', desc: '回顾这一年的经历', color: 'rgba(162,155,254,0.25)' });

					// 转博判断
					if (year === 2) {
						events.push({ icon: '🎓', name: '转博机会', desc: '科研分达标可选择转博', color: 'rgba(0,184,148,0.25)' });
					} else if (year === 3) {
						events.push({ icon: '🎓', name: '硕士毕业/转博', desc: '达标毕业，高分可转博', color: 'rgba(0,184,148,0.25)' });
					} else if (year === 5) {
						// ★★★ 博士第5年12月：毕业或延毕选择 ★★★
						events.push({ icon: '🏆', name: '博士毕业/延毕', desc: '发过Nature可选择延毕冲刺', color: 'rgba(184,134,11,0.25)' });
					} else if (year === 6) {
						// ★★★ 第6年：博士毕业 ★★★
						events.push({ icon: '🎓', name: '博士毕业', desc: '延毕年结束，顺利博士毕业', color: 'rgba(0,184,148,0.25)' });
					}
				}

				// ★★★ 第7月：随机事件 ★★★
				if (month === 7) {
					events.push({ icon: '🎲', name: '随机事件', desc: '可能遇到各种随机事件', color: 'rgba(0,184,148,0.2)' });
				}

				// 偶数月随机事件（排除已有固定事件的月份）
				if (month % 2 === 0 && month !== 2 && month !== 12) {
					events.push({ icon: '🎲', name: '随机事件', desc: '可能遇到各种随机事件', color: 'rgba(0,184,148,0.2)' });
				}

				return events;
			}
			
			let html = '<div style="max-height:60vh;overflow-y:auto;">';
			
			// 当前进度指示
			const currentYear = gameState.year || 1;
			const currentMonth = gameState.month || 1;
			const degree = gameState.degree || 'master';
			const totalYears = degree === 'master' ? 3 : 5;
			
			html += `
			<div style="padding:10px;background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(162,155,254,0.1));border-radius:8px;margin-bottom:12px;text-align:center;">
				<div style="font-size:0.85rem;color:var(--primary-color);font-weight:600;">
					📍 当前进度：第${currentYear}年第${currentMonth}月（${degree === 'master' ? '硕士' : '博士'}）
				</div>
				<div style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;">
					剩余 ${(totalYears * 12) - gameState.totalMonths} 个月
				</div>
			</div>
			`;
			
			// 遍历5年
			for (let year = 1; year <= maxYears; year++) {
				const isCurrentYear = year === currentYear;
				const yearBg = isCurrentYear ? 'linear-gradient(135deg,rgba(108,92,231,0.1),rgba(253,121,168,0.1))' : 'var(--light-bg)';
				const yearBorder = isCurrentYear ? '2px solid var(--primary-color)' : '1px solid var(--border-color)';
				
				// 年份标题
				let yearLabel = `第${year}年`;
				if (year <= 3) yearLabel += '（硕士）';
				if (year >= 4 && year <= 5) yearLabel += '（博士）';
				if (year === 6) yearLabel += '（可选延毕）';  // ★★★ 修改：可选延毕年 ★★★
				if (year === 3) yearLabel += ' / 硕士毕业年';
				if (year === 5) yearLabel += ' / 博士毕业年';
				if (year === 6) yearLabel += ' / 冲刺Nature';  // ★★★ 延毕年目标 ★★★
				
				html += `
				<div style="margin-bottom:15px;padding:12px;background:${yearBg};border-radius:10px;border:${yearBorder};">
					<div style="font-weight:600;color:var(--primary-color);margin-bottom:10px;font-size:0.9rem;display:flex;align-items:center;gap:6px;">
						${isCurrentYear ? '📍' : '📆'} ${yearLabel}
					</div>
					<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">
				`;
				
				// 遍历12个月
				for (let month = 1; month <= 12; month++) {
					const realMonth = gameMonthToRealMonth(month);
					const events = getMonthEvent(year, month);
					const isCurrentMonthCell = isCurrentYear && month === currentMonth;
					const isPast = (year < currentYear) || (year === currentYear && month < currentMonth);
					
					const cellBg = isCurrentMonthCell 
						? 'linear-gradient(135deg,var(--primary-color),var(--secondary-color))' 
						: isPast 
							? 'rgba(149,165,166,0.2)' 
							: 'var(--card-bg)';
					const cellColor = isCurrentMonthCell ? 'white' : isPast ? 'var(--text-secondary)' : 'var(--text-primary)';
					const cellBorder = isCurrentMonthCell ? 'none' : '1px solid var(--border-color)';
					
					html += `
					<div style="padding:6px;background:${cellBg};border-radius:6px;border:${cellBorder};min-height:50px;">
						<div style="font-size:0.7rem;font-weight:600;color:${cellColor};margin-bottom:4px;">
							${month}月<span style="font-size:0.6rem;opacity:0.8;">（${realMonth}月）</span>
						</div>
					`;
					
					if (events.length > 0) {
						events.forEach(evt => {
							const evtColor = isCurrentMonthCell ? 'rgba(255,255,255,0.9)' : isPast ? 'var(--text-secondary)' : '';
							html += `
							<div style="font-size:0.6rem;padding:2px 4px;background:${isCurrentMonthCell ? 'rgba(255,255,255,0.2)' : evt.color};border-radius:4px;margin-bottom:2px;color:${evtColor};" title="${evt.desc}">
								${evt.icon} ${evt.name}
							</div>
							`;
						});
					} else {
						html += `<div style="font-size:0.55rem;color:${isCurrentMonthCell ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)'};text-align:center;">无固定事件</div>`;
					}
					
					html += '</div>';
				}
				
				html += '</div></div>';
			}
			
			html += '</div>';
			
			// 图例说明
			html += `
			<div style="margin-top:12px;padding:10px;background:var(--light-bg);border-radius:8px;font-size:0.7rem;">
				<div style="font-weight:600;margin-bottom:6px;color:var(--text-secondary);">📖 事件图例</div>
				<div style="display:flex;flex-wrap:wrap;gap:8px;">
					<span style="padding:2px 6px;background:rgba(116,185,255,0.25);border-radius:4px;">❄️ 寒假</span>
					<span style="padding:2px 6px;background:rgba(253,203,110,0.25);border-radius:4px;">☀️ 暑假</span>
					<span style="padding:2px 6px;background:rgba(231,76,60,0.25);border-radius:4px;">🏛️ 领域年会</span>
					<span style="padding:2px 6px;background:rgba(108,92,231,0.25);border-radius:4px;">🎓 奖学金</span>
					<span style="padding:2px 6px;background:rgba(253,121,168,0.25);border-radius:4px;">🎁 教师节</span>
					<span style="padding:2px 6px;background:rgba(162,155,254,0.25);border-radius:4px;">📅 学年总结</span>
					<span style="padding:2px 6px;background:rgba(0,184,148,0.25);border-radius:4px;">🎓 转博/毕业</span>
					<span style="padding:2px 6px;background:rgba(0,184,148,0.2);border-radius:4px;">🎲 随机事件</span>
					<span style="padding:2px 6px;background:rgba(155,89,182,0.25);border-radius:4px;">🔬 延毕年</span>
				</div>
				<div style="margin-top:8px;color:var(--text-secondary);">
					<div>• <strong>x月（y月）</strong>：学年第x月（现实y月）</div>
					<div>• 鼠标悬停事件可查看详细说明</div>
					<div>• 灰色区域为已过去的月份</div>
				</div>
			</div>
			`;

			// ★★★ 修改：固定显示6年 ★★★
			showModal('📅 完整事件日历（6年）', html, [
				{ text: '关闭', class: 'btn-primary', action: closeModal }
			]);
		}
