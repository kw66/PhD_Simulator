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
			// ★★★ 修复：真·大多数特殊处理 ★★★
			if (gameState.character === 'true-normal' || gameState.isTrueNormal) {
				const isAwakened = gameState.trueNormalAwakened;
				const awakenStatus = isAwakened
					? `<div style="margin-top:6px;"><span style="padding:3px 10px;background:linear-gradient(135deg,#ffd700,#ff8c00);color:white;border-radius:12px;font-size:0.75rem;">✨ 已觉醒</span></div>`
					: '';
				const awakenActivatedText = isAwakened
					? `<div style="margin-top:6px;font-size:0.7rem;color:var(--success-color);">✅ 已激活 - 成就币已翻倍，商店2月刷新</div>`
					: `<div style="margin-top:6px;font-size:0.7rem;color:var(--text-secondary);">未激活 - 转博时触发</div>`;

				const html = `
					<div style="text-align:center;margin-bottom:15px;">
						<div style="font-size:3rem;margin-bottom:8px;"><span class="gold-icon">👤</span></div>
						<div style="font-size:1.2rem;font-weight:700;color:#d68910;">真·大多数</div>
						<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:4px;">✨ 真实模式</div>
						${awakenStatus}
					</div>

					<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:10px;">
						<div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:5px;">📜 角色描述</div>
						<div style="font-size:0.85rem;">经历过所有角色的洗礼，回归本真</div>
					</div>

					<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:10px;">
						<div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:5px;">✨ 初始效果</div>
						<div style="font-size:0.85rem;color:var(--text-secondary);font-weight:500;">无特殊能力，一切靠自己</div>
					</div>

					<div style="background:linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,140,0,0.15));border-radius:10px;padding:12px;border:1px dashed #d68910;">
						<div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:5px;">⚡ 转博觉醒</div>
						<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
							<span style="font-size:1.2rem;">✨</span>
							<span style="font-size:0.9rem;font-weight:600;color:#d68910;">往昔荣光</span>
						</div>
						<div style="font-size:0.85rem;">成就币翻倍，成就商店刷新间隔变为2个月</div>
						${awakenActivatedText}
					</div>
				`;

				showModal('👤 角色详情', html, [{ text: '关闭', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			const charData = characters.find(c => c.id === gameState.character);
			if (!charData) {
				console.error('无法找到角色数据:', gameState.character);
				showModal('❌ 错误', '<p>角色数据加载失败</p>', 
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			const isReversed = gameState.isReversed;
			const displayData = isReversed && charData.reversed ? charData.reversed : charData;
			
			// ★★★ 新增：判断是否触发了隐藏觉醒 ★★★
			const hasHiddenAwaken = gameState.hiddenAwakened && !isReversed;
			const isAwakened = gameState.reversedAwakened || (gameState.degree === 'phd' && !isReversed) || hasHiddenAwaken;
			
			// ★★★ 修改：根据觉醒类型显示不同图标 ★★★
			let currentIcon;
			if (hasHiddenAwaken) {
				currentIcon = charData.hiddenAwakenIcon;
			} else if (isAwakened) {
				currentIcon = isReversed ? displayData.awakenIcon : charData.awakenIcon;
			} else {
				currentIcon = displayData.icon;
			}
			
			const modeColor = isReversed ? '#9b59b6' : '#6c5ce7';
			const modeText = isReversed ? '🌑 逆位模式' : '☀️ 正位模式';
			
			// ★★★ 新增：根据觉醒类型显示不同的觉醒信息 ★★★
			let awakenIcon, awakenName, awakenDesc, awakenActivated;
			if (hasHiddenAwaken) {
				awakenIcon = charData.hiddenAwakenIcon;
				awakenName = charData.hiddenAwakenName;
				awakenDesc = charData.hiddenAwakenDesc;
				awakenActivated = true;
			} else {
				awakenIcon = isReversed ? displayData.awakenIcon : charData.awakenIcon;
				awakenName = isReversed ? displayData.awakenName : charData.awakenName;
				awakenDesc = isReversed ? displayData.awakenDesc : charData.awakenDesc;
				awakenActivated = gameState.reversedAwakened || (gameState.degree === 'phd' && !isReversed);
			}
			
			let html = `
				<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:3rem;margin-bottom:8px;">${currentIcon}</div>
					<div style="font-size:1.2rem;font-weight:700;color:${modeColor};">${displayData.name}</div>
					<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:4px;">${modeText}</div>
					${isAwakened ? `<div style="margin-top:6px;"><span style="padding:3px 10px;background:linear-gradient(135deg,${hasHiddenAwaken ? '#f39c12,#e67e22' : '#f39c12,#e74c3c'});color:white;border-radius:12px;font-size:0.75rem;">⚡ ${hasHiddenAwaken ? '隐藏觉醒' : '已觉醒'}</span></div>` : ''}
				</div>
				
				<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:10px;">
					<div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:5px;">📜 角色描述</div>
					<div style="font-size:0.85rem;">${displayData.desc}</div>
				</div>
				
				<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:10px;">
					<div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:5px;">✨ 初始效果</div>
					<div style="font-size:0.85rem;color:var(--success-color);font-weight:500;">${displayData.bonus}</div>
				</div>
				
				<div style="background:${hasHiddenAwaken ? 'linear-gradient(135deg,rgba(243,156,18,0.15),rgba(230,126,34,0.15))' : (isReversed ? 'rgba(155,89,182,0.1)' : 'rgba(102,126,234,0.1)')};border-radius:10px;padding:12px;border:1px dashed ${hasHiddenAwaken ? '#f39c12' : modeColor};">
					<div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:5px;">⚡ ${hasHiddenAwaken ? '隐藏觉醒' : '转博觉醒'}: ${awakenName}</div>
					<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
						<span style="font-size:1.2rem;">${awakenIcon}</span>
						<span style="font-size:0.9rem;font-weight:600;color:${hasHiddenAwaken ? '#f39c12' : modeColor};">${awakenName}</span>
					</div>
					<div style="font-size:0.85rem;">${awakenDesc}</div>
					${awakenActivated ? '<div style="margin-top:6px;font-size:0.7rem;color:var(--success-color);">✓ 已激活</div>' : '<div style="margin-top:6px;font-size:0.7rem;color:var(--text-secondary);">未激活 - 转博时触发</div>'}
				</div>
			`;
			
			showModal('👤 角色详情', html, [{ text: '关闭', class: 'btn-primary', action: closeModal }]);
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
					? '💕恋人(SAN+3,金-1)' 
					: '💕聪慧恋人(金-1)';
				allBuffs.push({ type: 'lover', name: loverBuffName, permanent: true, isLove: true });
			}
			
			if (gameState.ailabInternship) {
				const sanCost = gameState.isReversed && gameState.character === 'normal' 
					? (gameState.reversedAwakened ? 9 : 6) 
					: 3;
				allBuffs.push({ 
					type: 'internship', 
					name: `🏢AILab实习(金+2,SAN-${sanCost})`, 
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
			if (gameState.hasSeniorHelpSkill && gameState.seniorHelpUses > 0) {
				const pendingText = gameState.nextActionBonusSource === 'senior' && gameState.nextActionBonusType
					? `（已选：${gameState.nextActionBonusType === 'idea' ? '想idea' : gameState.nextActionBonusType === 'exp' ? '做实验' : '写论文'}）`
					: '';
				const skillHtml = `<span class="buff-tag permanent" style="cursor:pointer;background:linear-gradient(135deg,rgba(243,156,18,0.3),rgba(230,126,34,0.3));border-color:#f39c12;" onclick="useSeniorHelpSkill()">
					<i class="fas fa-hands-helping"></i>
					🆘 师兄师姐救我 (${gameState.seniorHelpUses}/3) ${pendingText}
				</span>`;
				list.innerHTML += skillHtml;
			}

			// 导师救我技能
			if (gameState.hasTeacherHelpSkill && gameState.teacherHelpUses > 0) {
				const pendingText = gameState.nextActionBonusSource === 'teacher' && gameState.nextActionBonusType
					? `（已选：${gameState.nextActionBonusType === 'idea' ? '想idea' : gameState.nextActionBonusType === 'exp' ? '做实验' : '写论文'}）`
					: '';
				const skillHtml = `<span class="buff-tag permanent" style="cursor:pointer;background:linear-gradient(135deg,rgba(253,121,168,0.3),rgba(232,67,147,0.3));border-color:#fd79a8;" onclick="useTeacherHelpSkill()">
					<i class="fas fa-user-shield"></i>
					🛡️ 导师救我 (${gameState.teacherHelpUses}/3) ${pendingText}
				</span>`;
				list.innerHTML += skillHtml;
			}
			
			// ★★★ 修复：最后检查是否完全没有内容 ★★★
			if (list.innerHTML.trim() === '') {
				list.innerHTML = '<span style="color:var(--text-secondary);font-size:0.8rem;">暂无效果</span>';
			}
		}			

		function useSeniorHelpSkill() {
			if (!gameState.hasSeniorHelpSkill || gameState.seniorHelpUses <= 0) {
				showModal('❌ 无法使用', '<p>技能不可用或已用完所有次数。</p>', 
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			// ★★★ 检查是否已经有待生效的加成 ★★★
			if (gameState.nextActionBonus > 0 && gameState.nextActionBonusSource === 'senior') {
				const actionName = gameState.nextActionBonusType === 'idea' ? '想idea' 
					: gameState.nextActionBonusType === 'exp' ? '做实验' : '写论文';
				showModal('⚠️ 技能待生效', 
					`<p>你已经选择了对【${actionName}】使用师兄师姐救我。</p>
					 <p style="color:var(--warning-color);">请先执行该操作后，才能再次使用技能。</p>
					 <p style="font-size:0.8rem;color:var(--text-secondary);">剩余次数：${gameState.seniorHelpUses}/3</p>`, 
					[{ text: '知道了', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			const bonusValue = gameState.social;
			
			showModal('🆘 师兄师姐救我', 
				`<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:2.5rem;margin-bottom:10px;">🆘</div>
					<div style="font-size:1.1rem;font-weight:600;color:#f39c12;">师兄师姐救我</div>
					<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:5px;">剩余使用次数：${gameState.seniorHelpUses}/3</div>
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
			if (!gameState.hasTeacherHelpSkill || gameState.teacherHelpUses <= 0) {
				showModal('❌ 无法使用', '<p>技能不可用或已用完所有次数。</p>', 
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			// ★★★ 检查是否已经有待生效的加成 ★★★
			if (gameState.nextActionBonus > 0 && gameState.nextActionBonusSource === 'teacher') {
				const actionName = gameState.nextActionBonusType === 'idea' ? '想idea' 
					: gameState.nextActionBonusType === 'exp' ? '做实验' : '写论文';
				showModal('⚠️ 技能待生效', 
					`<p>你已经选择了对【${actionName}】使用导师救我。</p>
					 <p style="color:var(--warning-color);">请先执行该操作后，才能再次使用技能。</p>
					 <p style="font-size:0.8rem;color:var(--text-secondary);">剩余次数：${gameState.teacherHelpUses}/3</p>`, 
					[{ text: '知道了', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			const bonusValue = gameState.favor;
			
			showModal('🛡️ 导师救我', 
				`<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:2.5rem;margin-bottom:10px;">🛡️</div>
					<div style="font-size:1.1rem;font-weight:600;color:#fd79a8;">导师救我</div>
					<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:5px;">剩余使用次数：${gameState.teacherHelpUses}/3</div>
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
			if (source === 'senior') {
				gameState.seniorHelpUses--;
			} else {
				gameState.teacherHelpUses--;
			}
			
			gameState.nextActionBonus = bonusValue;
			gameState.nextActionBonusSource = source;
			gameState.nextActionBonusType = actionType;
			
			const sourceName = source === 'senior' ? '师兄师姐救我' : '导师救我';
			const actionName = actionType === 'idea' ? '想idea' : actionType === 'exp' ? '做实验' : '写论文';
			const remainingUses = source === 'senior' ? gameState.seniorHelpUses : gameState.teacherHelpUses;
			
			addLog('主动技能', sourceName, `下次${actionName}时科研能力+${bonusValue}（剩余${remainingUses}次）`);
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
