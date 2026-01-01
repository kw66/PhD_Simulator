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

		// ★★★ 天赋弹窗分页状态 ★★★
		let talentTreePage = 'character'; // 'character', 'relationship', 'equipment'



		// ==================== 天赋和装备系统 ====================
		function showTalentTree(page = talentTreePage) {
			talentTreePage = page;
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
					max-height: 70vh;
					overflow-y: auto;
					padding: 5px;
				}
				.talent-tabs {
					display: flex;
					gap: 8px;
					margin-bottom: 12px;
				}
				.talent-tab {
					flex: 1;
					padding: 10px;
					border-radius: 8px;
					border: none;
					cursor: pointer;
					font-size: 0.85rem;
					font-weight: 600;
					transition: all 0.2s;
				}
				.talent-tab.char-tab {
					background: ${page === 'character' ? 'linear-gradient(135deg,#667eea,#764ba2)' : 'rgba(102,126,234,0.15)'};
					color: ${page === 'character' ? 'white' : '#667eea'};
				}
				.talent-tab.relation-tab {
					background: ${page === 'relationship' ? 'linear-gradient(135deg,#e91e63,#c2185b)' : 'rgba(233,30,99,0.15)'};
					color: ${page === 'relationship' ? 'white' : '#e91e63'};
				}
				.talent-tab.equip-tab {
					background: ${page === 'equipment' ? 'linear-gradient(135deg,#f39c12,#e67e22)' : 'rgba(243,156,18,0.15)'};
					color: ${page === 'equipment' ? 'white' : '#f39c12'};
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

				/* 条状天赋样式 */
				.talent-item {
					display: flex;
					justify-content: space-between;
					align-items: flex-start;
					padding: 10px 12px;
					background: var(--light-bg);
					border-radius: 8px;
					margin-bottom: 8px;
					border-left: 4px solid transparent;
					transition: all 0.2s ease;
				}
				.talent-item:hover {
					background: rgba(102,126,234,0.12);
				}
				.talent-item.active {
					border-left-color: #2ecc71;
					background: rgba(46,204,113,0.08);
				}
				.talent-item.active.color-blue { border-left-color: #3498db; background: rgba(52,152,219,0.08); }
				.talent-item.active.color-purple { border-left-color: #9b59b6; background: rgba(155,89,182,0.08); }
				.talent-item.active.color-orange { border-left-color: #f39c12; background: rgba(243,156,18,0.08); }
				.talent-item.active.color-green { border-left-color: #2ecc71; background: rgba(46,204,113,0.08); }
				.talent-item.inactive {
					opacity: 0.6;
					border-left-color: #7f8c8d;
				}
				.talent-item-info {
					flex: 1;
					min-width: 0;
				}
				.talent-item-header {
					display: flex;
					align-items: center;
					gap: 8px;
					margin-bottom: 4px;
				}
				.talent-item-icon {
					font-size: 1.3rem;
					flex-shrink: 0;
				}
				.talent-item-name {
					font-weight: 600;
					font-size: 0.9rem;
					color: var(--text-primary);
				}
				.talent-item-status {
					font-size: 0.7rem;
					padding: 2px 6px;
					border-radius: 4px;
					margin-left: auto;
					flex-shrink: 0;
				}
				.talent-item-status.active {
					background: rgba(46,204,113,0.2);
					color: #2ecc71;
				}
				.talent-item-status.inactive {
					background: rgba(127,140,141,0.2);
					color: #7f8c8d;
				}
				.talent-item-desc {
					font-size: 0.78rem;
					color: var(--text-secondary);
					line-height: 1.4;
					margin-bottom: 4px;
				}
				.talent-item-current {
					font-size: 0.75rem;
					color: #2ecc71;
					background: rgba(46,204,113,0.1);
					padding: 4px 8px;
					border-radius: 4px;
					margin-top: 4px;
				}
				.talent-item-next {
					font-size: 0.75rem;
					color: #3498db;
					background: rgba(52,152,219,0.1);
					padding: 4px 8px;
					border-radius: 4px;
					margin-top: 4px;
					display: inline-block;
				}
				.talent-item-how {
					font-size: 0.7rem;
					color: #95a5a6;
					font-style: italic;
					margin-top: 4px;
				}
				.talent-item-equip {
					font-size: 0.75rem;
					color: #f39c12;
					background: rgba(243,156,18,0.1);
					padding: 4px 8px;
					border-radius: 4px;
					margin-top: 4px;
				}
			</style>
			<div class="talent-container">
				<!-- 分页标签 -->
				<div class="talent-tabs">
					<button class="talent-tab char-tab" onclick="showTalentTree('character')">
						👤 角色
					</button>
					<button class="talent-tab relation-tab" onclick="showTalentTree('relationship')">
						💕 关系
					</button>
					<button class="talent-tab equip-tab" onclick="showTalentTree('equipment')">
						🛠️ 装备
					</button>
				</div>
			`;

			// ========== 角色天赋区（条状显示）==========
			if (page === 'character') {
			html += `<div class="talent-section">
				<div class="talent-section-title"><i class="fas fa-user-circle"></i> 角色天赋</div>`;

			if (isTrueNormal) {
				// 真大多数
				html += `
					<div class="talent-item active">
						<div class="talent-item-info">
							<div class="talent-item-header">
								<span class="talent-item-icon">👤</span>
								<span class="talent-item-name">真·大多数</span>
								<span class="talent-item-status active">已激活</span>
							</div>
							<div class="talent-item-desc">经历过所有角色的洗礼，回归本真</div>
						</div>
					</div>
					<div class="talent-item ${isTrueNormalAwakened ? 'active color-orange' : 'inactive'}">
						<div class="talent-item-info">
							<div class="talent-item-header">
								<span class="talent-item-icon">✨</span>
								<span class="talent-item-name">往昔荣光</span>
								<span class="talent-item-status ${isTrueNormalAwakened ? 'active' : 'inactive'}">${isTrueNormalAwakened ? '已激活' : '未激活'}</span>
							</div>
							<div class="talent-item-desc">成就币翻倍</div>
						</div>
					</div>
				`;
			} else if (charData) {
				// 初始天赋（角色）
				const charIcon = isReversed ? charData.reversed.icon : charData.icon;
				const charName = isReversed ? charData.reversed.name : charData.name;
				const charBonus = isReversed ? charData.reversed.bonus : charData.bonus;
				html += `
					<div class="talent-item active">
						<div class="talent-item-info">
							<div class="talent-item-header">
								<span class="talent-item-icon">${charIcon}</span>
								<span class="talent-item-name">${charName}</span>
								<span class="talent-item-status active">已激活</span>
							</div>
							<div class="talent-item-desc">${charBonus}</div>
						</div>
					</div>
				`;

				if (isReversed) {
					// 逆位角色：只显示逆位觉醒
					const awakenName = charData.reversed.awakenName;
					const awakenDesc = charData.reversed.awakenDesc;
					const awakenIcon = charData.reversed.awakenIcon || '⚡';
					html += `
						<div class="talent-item ${reversedAwakened ? 'active color-purple' : 'inactive'}">
							<div class="talent-item-info">
								<div class="talent-item-header">
									<span class="talent-item-icon">${awakenIcon}</span>
									<span class="talent-item-name">${awakenName}</span>
									<span class="talent-item-status ${reversedAwakened ? 'active' : 'inactive'}">${reversedAwakened ? '已觉醒' : '未觉醒'}</span>
								</div>
								<div class="talent-item-desc">${awakenDesc}</div>
							</div>
						</div>
					`;
				} else {
					// 正位角色：显示转博觉醒 + 隐藏觉醒
					const awakenName = charData.awakenName;
					const awakenDesc = charData.awakenDesc;
					const awakenIcon = charData.awakenIcon || '⚡';
					html += `
						<div class="talent-item ${hasNormalAwaken && !hasHiddenAwaken ? 'active color-blue' : 'inactive'}">
							<div class="talent-item-info">
								<div class="talent-item-header">
									<span class="talent-item-icon">${awakenIcon}</span>
									<span class="talent-item-name">${awakenName}</span>
									<span class="talent-item-status ${hasNormalAwaken && !hasHiddenAwaken ? 'active' : 'inactive'}">${hasNormalAwaken && !hasHiddenAwaken ? '已觉醒' : '未觉醒'}</span>
								</div>
								<div class="talent-item-desc">${awakenDesc}</div>
							</div>
						</div>
					`;

					// 隐藏觉醒
					if (charData.hiddenAwakenName) {
						const hiddenName = charData.hiddenAwakenName;
						const hiddenDesc = charData.hiddenAwakenDesc;
						const hiddenIcon = charData.hiddenAwakenIcon || '⚙️';
						html += `
							<div class="talent-item ${hasHiddenAwaken ? 'active color-orange' : 'inactive'}">
								<div class="talent-item-info">
									<div class="talent-item-header">
										<span class="talent-item-icon">${hiddenIcon}</span>
										<span class="talent-item-name">${hiddenName}</span>
										<span class="talent-item-status ${hasHiddenAwaken ? 'active' : 'inactive'}">${hasHiddenAwaken ? '已觉醒' : '未觉醒'}</span>
									</div>
									<div class="talent-item-desc">${hiddenDesc}</div>
								</div>
							</div>
						`;
					}
				}
			}
			html += `</div>`;
			} // end if (page === 'character')

			// ========== 关系天赋区 ==========
			if (page === 'relationship') {
			html += `<div class="talent-section">
				<div class="talent-section-title"><i class="fas fa-heart"></i> 关系天赋</div>`;

			// ★★★ 导师关系天赋 ★★★
			const advisorPerson = gameState.relationships?.find(r => r.type === 'advisor');
			const hasAdvisor = !!advisorPerson;
			const advisorTasksCompleted = advisorPerson?.advisorTasksCompleted || 0;
			const advisorGoldEarned = Math.floor(advisorTasksCompleted / 2) * 5 + (advisorTasksCompleted % 2 === 1 ? 5 : 0);
			const advisorResearchEarned = Math.floor(advisorTasksCompleted / 2);
			html += `
				<div class="talent-item ${hasAdvisor ? 'active color-blue' : 'inactive'}">
					<div class="talent-item-info">
						<div class="talent-item-header">
							<span class="talent-item-icon">👨‍🏫</span>
							<span class="talent-item-name">导师关系</span>
							<span class="talent-item-status ${hasAdvisor ? 'active' : 'inactive'}">${hasAdvisor ? '已激活' : '未激活'}</span>
						</div>
						<div class="talent-item-desc">效果：完成项目，获得项目奖励</div>
						<div class="talent-item-current">循环：横向项目(金+5)→纵向项目(科研+1)</div>
						<div class="talent-item-next">累计：已完成${advisorTasksCompleted}次，金币+${advisorGoldEarned}，科研+${advisorResearchEarned}</div>
					</div>
				</div>
			`;

			// 大牛联培 - 成长性：每500引用科研上限+2，最多+10
			const hasBigBull = gameState.bigBullCooperation;
			const bigBullCitations = gameState.totalCitations || 0;
			const bigBullCitationBonus = hasBigBull ? Math.min(Math.floor(bigBullCitations / 500) * 2, 10) : 0;
			html += `
				<div class="talent-item ${hasBigBull ? 'active color-green' : 'inactive'}">
					<div class="talent-item-info">
						<div class="talent-item-header">
							<span class="talent-item-icon">🎓</span>
							<span class="talent-item-name">大牛联培</span>
							<span class="talent-item-status ${hasBigBull ? 'active' : 'inactive'}">${hasBigBull ? '已激活' : '未激活'}</span>
						</div>
						<div class="talent-item-desc">效果：导师科研资源+2，想idea+5，做实验+5</div>
						<div class="talent-item-current">成长：每500引用科研上限+2（最多+10）</div>
						<div class="talent-item-next">累计：${bigBullCitations}引用，科研上限+${bigBullCitationBonus}</div>
						${!hasBigBull ? `<div class="talent-item-how">获取：科研≥12且总引用≥500后，在开会时与大牛深入交流2次</div>` : ''}
					</div>
				</div>
			`;

			// 企业实习
			const hasInternship = gameState.ailabInternship;
			const currentAPaperCount = (gameState.publishedPapers || []).filter(p => p.grade === 'A').length;
			const currentTotalCitations = gameState.totalCitations || 0;
			const internshipBaseIncome = 2;
			const internshipAPaperBonus = currentAPaperCount * 0.5;
			const internshipCitationBonus = Math.floor(currentTotalCitations / 500) * 0.5;
			const internshipIncome = Math.min(internshipBaseIncome + internshipAPaperBonus + internshipCitationBonus, 6);
			html += `
				<div class="talent-item ${hasInternship ? 'active color-green' : 'inactive'}">
					<div class="talent-item-info">
						<div class="talent-item-header">
							<span class="talent-item-icon">💼</span>
							<span class="talent-item-name">企业实习</span>
							<span class="talent-item-status ${hasInternship ? 'active' : 'inactive'}">${hasInternship ? '已激活' : '未激活'}</span>
						</div>
						<div class="talent-item-desc">效果：每月SAN-2，做实验×1.25，每月工资+2</div>
						<div class="talent-item-current">成长：工资=2+A会×0.5+引用/500×0.5（上限6）</div>
						<div class="talent-item-next">累计：当前工资${internshipIncome.toFixed(1)}/月，A会${currentAPaperCount}篇，引用${currentTotalCitations}</div>
						${!hasInternship ? `<div class="talent-item-how">获取：在开会时与企业交流3次后触发邀请</div>` : ''}
					</div>
				</div>
			`;

			// 聪慧恋人
			const hasSmartLover = gameState.hasLover && gameState.loverType === 'smart';
			const smartLoverPerson = gameState.relationships?.find(r => r.type === 'lover');
			const smartTasksCompleted = smartLoverPerson?.loverTasksCompleted || 0;
			const smartIdeaTimes = 1 + Math.floor((smartTasksCompleted + 2) / 3);
			const smartExpTimes = 1 + Math.floor((smartTasksCompleted + 1) / 3);
			const smartWriteTimes = 1 + Math.floor(smartTasksCompleted / 3);
			html += `
				<div class="talent-item ${hasSmartLover ? 'active color-purple' : 'inactive'}">
					<div class="talent-item-info">
						<div class="talent-item-header">
							<span class="talent-item-icon">💕</span>
							<span class="talent-item-name">聪慧恋人</span>
							<span class="talent-item-status ${hasSmartLover ? 'active' : 'inactive'}">${hasSmartLover ? '已激活' : '未激活'}</span>
						</div>
						<div class="talent-item-desc">效果：科研+2，每月金币-2，想idea/做实验/写论文增加</div>
						<div class="talent-item-current">循环：想idea+1次→做实验+1次→写论文+1次，初始+1次</div>
						<div class="talent-item-next">累计：已约会${smartTasksCompleted}次，想idea+${smartIdeaTimes}次，做实验+${smartExpTimes}次，写论文+${smartWriteTimes}次</div>
						${!hasSmartLover ? `<div class="talent-item-how">获取：社交≥12后在开会时多次交流同一异性学者</div>` : ''}
					</div>
				</div>
			`;

			// 活泼恋人
			const hasBeautifulLover = gameState.hasLover && gameState.loverType === 'beautiful';
			const beautifulLoverPerson = gameState.relationships?.find(r => r.type === 'lover');
			const beautifulTasksCompleted = beautifulLoverPerson?.loverTasksCompleted || 0;
			const beautifulSanMaxBonus = 4 + Math.floor((beautifulTasksCompleted + 1) / 3);
			const beautifulRecoveryRate = 10 + Math.floor(beautifulTasksCompleted / 3) * 2;
			html += `
				<div class="talent-item ${hasBeautifulLover ? 'active color-purple' : 'inactive'}">
					<div class="talent-item-info">
						<div class="talent-item-header">
							<span class="talent-item-icon">💕</span>
							<span class="talent-item-name">活泼恋人</span>
							<span class="talent-item-status ${hasBeautifulLover ? 'active' : 'inactive'}">${hasBeautifulLover ? '已激活' : '未激活'}</span>
						</div>
						<div class="talent-item-desc">效果：获得时SAN回满、SAN上限+4，每月金币-2，每月回复SAN</div>
						<div class="talent-item-current">循环：回复10%已损SAN→SAN上限+1→月回复+2%</div>
						<div class="talent-item-next">累计：已约会${beautifulTasksCompleted}次，SAN上限+${beautifulSanMaxBonus}，每月回复${beautifulRecoveryRate}%已损SAN</div>
						${!hasBeautifulLover ? `<div class="talent-item-how">获取：社交≥12后在开会时多次交流同一异性学者</div>` : ''}
					</div>
				</div>
			`;

			html += `</div>`;
			} // end if (page === 'relationship')

			// ========== 装备天赋区 ==========
			if (page === 'equipment') {
			html += `<div class="talent-section">
				<div class="talent-section-title"><i class="fas fa-toolbox"></i> 装备天赋</div>`;

			// ★★★ 豪华工位天赋 ★★★
			const hasLuxuryWorkstation = gameState.furnitureBought?.chair &&
				gameState.furnitureBought?.monitor &&
				gameState.furnitureBought?.keyboard &&
				(gameState.gpuServersBought || 0) >= 1 &&
				gameState.hasCoffeeMachine;
			const buffDivisor = 5;
			const ideaPermanentBuff = gameState.buffs?.permanent?.filter(b => b.type === 'idea_bonus').reduce((sum, b) => sum + (b.value || 0), 0) || 0;
			const expPermanentBuff = gameState.buffs?.permanent?.filter(b => b.type === 'exp_bonus').reduce((sum, b) => sum + (b.value || 0), 0) || 0;
			const writePermanentBuff = gameState.buffs?.permanent?.filter(b => b.type === 'write_bonus').reduce((sum, b) => sum + (b.value || 0), 0) || 0;
			const ideaFloorBonus = hasLuxuryWorkstation ? Math.floor(ideaPermanentBuff / buffDivisor) : 0;
			const expFloorBonus = hasLuxuryWorkstation ? Math.floor(expPermanentBuff / buffDivisor) : 0;
			const writeFloorBonus = hasLuxuryWorkstation ? Math.floor(writePermanentBuff / buffDivisor) : 0;
			const luxuryEquipStatus = [
				gameState.furnitureBought?.chair ? '✓椅' : '○椅',
				gameState.furnitureBought?.monitor ? '✓显' : '○显',
				gameState.furnitureBought?.keyboard ? '✓键' : '○键',
				(gameState.gpuServersBought || 0) >= 1 ? '✓GPU' : '○GPU',
				gameState.hasCoffeeMachine ? '✓咖' : '○咖'
			].join(' ');
			html += `
				<div class="talent-item ${hasLuxuryWorkstation ? 'active color-orange' : 'inactive'}">
					<div class="talent-item-info">
						<div class="talent-item-header">
							<span class="talent-item-icon">🛋️</span>
							<span class="talent-item-name">豪华工位</span>
							<span class="talent-item-status ${hasLuxuryWorkstation ? 'active' : 'inactive'}">${hasLuxuryWorkstation ? '已激活' : '未激活'}</span>
						</div>
						<div class="talent-item-desc">效果：每5点永久buff分数，增加1点对应操作的保底分数</div>
						<div class="talent-item-current">进度：想idea+${ideaFloorBonus}，做实验+${expFloorBonus}，写论文+${writeFloorBonus}</div>
						<div class="talent-item-equip">装备：${luxuryEquipStatus}</div>
						${!hasLuxuryWorkstation ? `<div class="talent-item-how">获取：同时拥有工学椅+显示器+键盘+GPU服务器+咖啡机</div>` : ''}
					</div>
				</div>
			`;

			// ★★★ 整装待发天赋（成长性：开会次数越多减免越多）★★★
			const hasFullGear = gameState.bikeUpgrade === 'ebike' &&
				gameState.hasParasol &&
				gameState.hasDownJacket;
			const meetingCount = gameState.meetingCount || 0;
			const fullGearDiscount = hasFullGear ? Math.min(2 + Math.floor(meetingCount / 4), 6) : 0;
			const fullGearEquipStatus = [
				gameState.bikeUpgrade === 'ebike' ? '✓电驴' : '○电驴',
				gameState.hasParasol ? '✓伞' : '○伞',
				gameState.hasDownJacket ? '✓羽绒服' : '○羽绒服'
			].join(' ');
			html += `
				<div class="talent-item ${hasFullGear ? 'active color-orange' : 'inactive'}">
					<div class="talent-item-info">
						<div class="talent-item-header">
							<span class="talent-item-icon">🎒</span>
							<span class="talent-item-name">整装待发</span>
							<span class="talent-item-status ${hasFullGear ? 'active' : 'inactive'}">${hasFullGear ? '已激活' : '未激活'}</span>
						</div>
						<div class="talent-item-desc">效果：开会自费时金钱消耗减少</div>
						<div class="talent-item-current">成长：基础-2，每4次开会+1（最多-6）</div>
						<div class="talent-item-next">进度：已开会${meetingCount}次，当前减免${fullGearDiscount}金</div>
						<div class="talent-item-equip">装备：${fullGearEquipStatus}</div>
						${!hasFullGear ? `<div class="talent-item-how">获取：同时拥有小电驴+遮阳伞+羽绒服</div>` : ''}
					</div>
				</div>
			`;

			html += `</div>`;
			} // end if (page === 'equipment')

			html += `</div>`; // talent-container结束

			const titleText = page === 'character' ? '👤 角色天赋' : (page === 'relationship' ? '💕 关系天赋' : '🛠️ 装备天赋');
			showModal(titleText, html, [{ text: '关闭', class: 'btn-primary', action: closeModal }]);
		}
		window.showTalentTree = showTalentTree;

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
				// ★★★ 新增：根据A类论文数计算实习收入 ★★★
				const aPaperBonus = Math.min(gameState.internshipAPaperCount || 0, 3);
				const internshipGold = 2 + aPaperBonus;
				allBuffs.push({
					type: 'internship',
					name: `🏢AILab实习(金+${internshipGold},SAN-${sanCost},实验×1.25)`,
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
					'read_san_reduce': '看论文SAN',
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
					name = `看论文SAN-1`;
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

			// ★★★ 新增：显示持续生效的诅咒（排除开局一次性结算的）★★★
			// 持续性诅咒：金币上限、转博/毕业要求、每月/周期性效果
			const ongoingCurses = ['poor_student', 'high_phd_bar', 'graduation_hell', 'spending_trap', 'mental_drain', 'talent_fade', 'social_decay', 'favor_decay'];
			if (gameState.activeCurses && typeof CURSES !== 'undefined') {
				Object.entries(gameState.activeCurses).forEach(([curseId, count]) => {
					if (count > 0 && CURSES[curseId] && ongoingCurses.includes(curseId)) {
						const curse = CURSES[curseId];
						const countText = count > 1 ? `×${count}` : '';
						const curseHtml = `<span class="buff-tag debuff" style="background:linear-gradient(135deg,rgba(231,76,60,0.25),rgba(192,57,43,0.25));border-color:#c0392b;" title="${curse.desc}">
							<span style="margin-right:3px;">${curse.icon}</span>
							${curse.name}${countText}
						</span>`;
						list.innerHTML += curseHtml;
					}
				});
			}

			// ★★★ 新增：显示持续生效的祝福（排除开局一次性结算的）★★★
			// 持续性祝福：每月/周期性效果
			const ongoingBlessings = ['mobile_fountain', 'compound_magic', 'research_growth', 'social_growth', 'favor_growth'];
			if (gameState.activeBlessings && typeof BLESSINGS !== 'undefined') {
				Object.entries(gameState.activeBlessings).forEach(([blessingId, count]) => {
					if (count > 0 && BLESSINGS[blessingId] && ongoingBlessings.includes(blessingId)) {
						const blessing = BLESSINGS[blessingId];
						const countText = count > 1 ? `×${count}` : '';
						const blessingHtml = `<span class="buff-tag permanent" style="background:linear-gradient(135deg,rgba(39,174,96,0.25),rgba(46,204,113,0.25));border-color:#27ae60;" title="${blessing.desc}">
							<span style="margin-right:3px;">${blessing.icon}</span>
							${blessing.name}${countText}
						</span>`;
						list.innerHTML += blessingHtml;
					}
				});
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

		// ==================== 诅咒和祝福弹窗 ====================
		let curseBlessingPage = 'curses'; // 默认显示诅咒页

		function showCurseBlessingModal(page = curseBlessingPage) {
			curseBlessingPage = page;

			const diffPoints = gameState.difficultyPoints || 0;
			const activeCurses = gameState.activeCurses || {};
			const activeBlessings = gameState.activeBlessings || {};

			// 统计数量
			let curseCount = 0;
			let blessingCount = 0;
			if (typeof CURSES !== 'undefined') {
				Object.keys(activeCurses).forEach(id => {
					if (activeCurses[id] > 0 && CURSES[id]) curseCount++;
				});
			}
			if (typeof BLESSINGS !== 'undefined') {
				Object.keys(activeBlessings).forEach(id => {
					if (activeBlessings[id] > 0 && BLESSINGS[id]) blessingCount++;
				});
			}

			let html = `
			<style>
				.cb-container { max-height: 60vh; overflow-y: auto; }
				.cb-tabs { display: flex; gap: 8px; margin-bottom: 12px; }
				.cb-tab { flex: 1; padding: 8px; border-radius: 8px; border: none; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s; }
				.cb-tab.curse-tab { background: ${page === 'curses' ? 'linear-gradient(135deg,#e74c3c,#c0392b)' : 'rgba(231,76,60,0.15)'}; color: ${page === 'curses' ? 'white' : '#e74c3c'}; }
				.cb-tab.blessing-tab { background: ${page === 'blessings' ? 'linear-gradient(135deg,#27ae60,#1e8449)' : 'rgba(39,174,96,0.15)'}; color: ${page === 'blessings' ? 'white' : '#27ae60'}; }
				.cb-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin: 8px 0; border-radius: 10px; }
				.cb-item.curse { background: rgba(231,76,60,0.1); border-left: 4px solid #e74c3c; }
				.cb-item.blessing { background: rgba(39,174,96,0.1); border-left: 4px solid #27ae60; }
				.cb-icon { font-size: 1.8rem; }
				.cb-info { flex: 1; }
				.cb-name { font-weight: 600; font-size: 0.95rem; }
				.cb-desc { font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px; }
				.cb-points { padding: 3px 8px; border-radius: 8px; font-size: 0.75rem; font-weight: 600; color: white; }
				.cb-points.curse { background: #e74c3c; }
				.cb-points.blessing { background: #27ae60; }
				.cb-empty { text-align: center; padding: 30px; color: var(--text-secondary); }
				.cb-empty-icon { font-size: 2.5rem; margin-bottom: 10px; }
				.cb-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 10px; margin-bottom: 8px; }
				.cb-header.curse { background: linear-gradient(135deg,rgba(231,76,60,0.2),rgba(192,57,43,0.15)); }
				.cb-header.blessing { background: linear-gradient(135deg,rgba(39,174,96,0.2),rgba(30,132,73,0.15)); }
				.cb-header-title { font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 6px; }
				.cb-header.curse .cb-header-title { color: #e74c3c; }
				.cb-header.blessing .cb-header-title { color: #27ae60; }
				.cb-diff-badge { padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; color: white; }
			</style>
			<div class="cb-container">
				<!-- 分页标签 -->
				<div class="cb-tabs">
					<button class="cb-tab curse-tab" onclick="showCurseBlessingModal('curses')">
						💀 诅咒 ${curseCount > 0 ? `(${curseCount})` : ''}
					</button>
					<button class="cb-tab blessing-tab" onclick="showCurseBlessingModal('blessings')">
						⭐ 祝福 ${blessingCount > 0 ? `(${blessingCount})` : ''}
					</button>
				</div>
			`;

			// 诅咒页
			if (page === 'curses') {
				html += `<div class="cb-header curse">
					<div class="cb-header-title"><i class="fas fa-skull"></i> 本局诅咒效果</div>
					${diffPoints > 0 ? `<span class="cb-diff-badge" style="background:#e74c3c;">难度 +${diffPoints}</span>` : ''}
				</div>`;

				let hasCurse = false;
				if (typeof CURSES !== 'undefined') {
					Object.keys(activeCurses).forEach(curseId => {
						const count = activeCurses[curseId];
						if (count > 0 && CURSES[curseId]) {
							hasCurse = true;
							const curse = CURSES[curseId];
							html += `
								<div class="cb-item curse">
									<div class="cb-icon">${curse.icon}</div>
									<div class="cb-info">
										<div class="cb-name">${curse.name}${count > 1 ? ` ×${count}` : ''}</div>
										<div class="cb-desc">${curse.desc}</div>
									</div>
									<div class="cb-points curse">+${curse.pointCosts[count-1]}</div>
								</div>
							`;
						}
					});
				}

				if (!hasCurse) {
					html += `<div class="cb-empty">
						<div class="cb-empty-icon">😇</div>
						<div>本局无诅咒加成</div>
						<div style="font-size:0.8rem;margin-top:5px;">轻松模式通关中~</div>
					</div>`;
				}
			}

			// 祝福页
			if (page === 'blessings') {
				html += `<div class="cb-header blessing">
					<div class="cb-header-title"><i class="fas fa-star"></i> 本局祝福效果</div>
					${diffPoints < 0 ? `<span class="cb-diff-badge" style="background:#27ae60;">难度 ${diffPoints}</span>` : ''}
				</div>`;

				let hasBlessing = false;
				if (typeof BLESSINGS !== 'undefined') {
					Object.keys(activeBlessings).forEach(blessingId => {
						const count = activeBlessings[blessingId];
						if (count > 0 && BLESSINGS[blessingId]) {
							hasBlessing = true;
							const blessing = BLESSINGS[blessingId];
							html += `
								<div class="cb-item blessing">
									<div class="cb-icon">${blessing.icon}</div>
									<div class="cb-info">
										<div class="cb-name">${blessing.name}${count > 1 ? ` ×${count}` : ''}</div>
										<div class="cb-desc">${blessing.desc}</div>
									</div>
									<div class="cb-points blessing">${blessing.pointCosts[count-1]}</div>
								</div>
							`;
						}
					});
				}

				if (!hasBlessing) {
					html += `<div class="cb-empty">
						<div class="cb-empty-icon">🌟</div>
						<div>本局无祝福加成</div>
						<div style="font-size:0.8rem;margin-top:5px;">挑战自我模式~</div>
					</div>`;
				}
			}

			html += `</div>`;

			const titleIcon = diffPoints > 0 ? '💀' : (diffPoints < 0 ? '⭐' : '🎴');
			const titleText = diffPoints !== 0 ? `难度 ${diffPoints > 0 ? '+' : ''}${diffPoints}` : '诅咒与祝福';

			showModal(`${titleIcon} ${titleText}`, html, [
				{ text: '关闭', class: 'btn-primary', action: closeModal }
			]);
		}

		// 全局函数暴露
		window.showCurseBlessingModal = showCurseBlessingModal;
