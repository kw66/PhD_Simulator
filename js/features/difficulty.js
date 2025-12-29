		// ==================== 难度选择系统 ====================

		// 诅咒定义（按应用顺序排列）
		const CURSES = {
			anxiety: {
				id: 'anxiety',
				name: '焦虑症候',
				icon: '😰',
				desc: '初始SAN值-10',
				effect: { initialSanReduction: 10 },
				maxCount: 2,
				pointCosts: [1, 3],
				order: 1  // 先结算
			},
			fragile_mind: {
				id: 'fragile_mind',
				name: '破防体质',
				icon: '💔',
				desc: 'SAN上限-5',
				effect: { sanMaxReduction: 5 },
				maxCount: 3,
				pointCosts: [1, 3, 6],
				order: 2  // 后结算
			},
			research_noob: {
				id: 'research_noob',
				name: '科研废柴',
				icon: '📉',
				desc: '科研能力上限-6',
				effect: { researchMaxReduction: 6 },
				maxCount: 3,
				pointCosts: [1, 2, 5],
				order: 3
			},
			advisor_gap: {
				id: 'advisor_gap',
				name: '师生隔阂',
				icon: '🚫',
				desc: '导师好感上限-9',
				effect: { favorMaxReduction: 9 },
				maxCount: 2,
				pointCosts: [1, 2],
				order: 4
			},
			social_phobia: {
				id: 'social_phobia',
				name: '社恐倾向',
				icon: '🙈',
				desc: '社交能力上限-6',
				effect: { socialMaxReduction: 6 },
				maxCount: 3,
				pointCosts: [1, 2, 5],
				order: 5
			},
			poor_student: {
				id: 'poor_student',
				name: '赤贫学子',
				icon: '💸',
				desc: '金币上限为10',
				effect: { goldMax: 10 },
				maxCount: 1,
				pointCosts: [1],
				order: 6
			},
			high_phd_bar: {
				id: 'high_phd_bar',
				name: '卷王标准',
				icon: '📊',
				desc: '转博分数要求+2',
				effect: { phdRequirementIncrease: 2 },
				maxCount: 3,
				pointCosts: [1, 2, 3],
				order: 7
			},
			graduation_hell: {
				id: 'graduation_hell',
				name: '毕业地狱',
				icon: '🎓',
				desc: '毕业分数要求+4',
				effect: { graduationRequirementIncrease: 4 },
				maxCount: 3,
				pointCosts: [1, 2, 3],
				order: 8
			},
			spending_trap: {
				id: 'spending_trap',
				name: '消费陷阱',
				icon: '🛒',
				desc: '每月花费+1',
				effect: { monthlyExpenseIncrease: 1 },
				maxCount: 3,
				pointCosts: [2, 4, 7],
				order: 9
			},
			mental_drain: {
				id: 'mental_drain',
				name: '精神内耗',
				icon: '🌀',
				desc: '每月SAN-1',
				effect: { monthlySanDrain: 1 },
				maxCount: 3,
				pointCosts: [1, 3, 4],
				order: 10
			},
			talent_fade: {
				id: 'talent_fade',
				name: '江郎才尽',
				icon: '📚',
				desc: '每4月科研能力-1',
				effect: { researchDecayPeriod: 4, researchDecayAmount: 1 },
				maxCount: 3,
				pointCosts: [2, 3, 4],
				order: 11
			},
			social_decay: {
				id: 'social_decay',
				name: '人情淡漠',
				icon: '🤝',
				desc: '每4月社交能力-1',
				effect: { socialDecayPeriod: 4, socialDecayAmount: 1 },
				maxCount: 3,
				pointCosts: [1, 2, 3],
				order: 12
			},
			favor_decay: {
				id: 'favor_decay',
				name: '师恩渐远',
				icon: '👨‍🏫',
				desc: '每4月导师好感-1',
				effect: { favorDecayPeriod: 4, favorDecayAmount: 1 },
				maxCount: 3,
				pointCosts: [1, 2, 3],
				order: 13
			}
		};

		// ★★★ 新增：祝福定义（难度分为负数）★★★
		const BLESSINGS = {
			mobile_fountain: {
				id: 'mobile_fountain',
				name: '移动泉水',
				icon: '⛲',
				desc: '每月恢复已损失SAN的5%',
				effect: { monthlySanRecoveryPercent: 5 },
				maxCount: 2,
				pointCosts: [-2, -4],
				order: 1
			},
			rich_start: {
				id: 'rich_start',
				name: '带资进组',
				icon: '💰',
				desc: '初始金币+5',
				effect: { initialGoldBonus: 5 },
				maxCount: 2,
				pointCosts: [-1, -2],
				order: 2
			},
			compound_magic: {
				id: 'compound_magic',
				name: '复利魔法',
				icon: '💹',
				desc: '每月金币+3%',
				effect: { monthlyGoldPercent: 3 },
				maxCount: 2,
				pointCosts: [-3, -5],
				order: 3
			},
			iron_will: {
				id: 'iron_will',
				name: '钢铁意志',
				icon: '⚡',
				desc: 'SAN上限+4',
				effect: { sanMaxBonus: 4 },
				maxCount: 2,
				pointCosts: [-1, -3],
				order: 4
			},
			gifted: {
				id: 'gifted',
				name: '天赋异禀',
				icon: '🧠',
				desc: '科研能力上限+4',
				effect: { researchMaxBonus: 4 },
				maxCount: 2,
				pointCosts: [-1, -2],
				order: 5
			},
			teacher_bond: {
				id: 'teacher_bond',
				name: '师生缘分',
				icon: '🤝',
				desc: '导师好感上限+4',
				effect: { favorMaxBonus: 4 },
				maxCount: 2,
				pointCosts: [-1, -2],
				order: 6
			},
			social_butterfly: {
				id: 'social_butterfly',
				name: '八面玲珑',
				icon: '🌸',
				desc: '社交能力上限+4',
				effect: { socialMaxBonus: 4 },
				maxCount: 2,
				pointCosts: [-1, -2],
				order: 7
			},
			solid_foundation: {
				id: 'solid_foundation',
				name: '扎实基础',
				icon: '📖',
				desc: '初始科研能力+3',
				effect: { initialResearchBonus: 3 },
				maxCount: 2,
				pointCosts: [-1, -3],
				order: 8
			},
			easy_going: {
				id: 'easy_going',
				name: '自来熟',
				icon: '🙋',
				desc: '初始社交能力+3',
				effect: { initialSocialBonus: 3 },
				maxCount: 2,
				pointCosts: [-1, -3],
				order: 9
			},
			instant_connect: {
				id: 'instant_connect',
				name: '一见如故',
				icon: '💖',
				desc: '初始导师好感+4',
				effect: { initialFavorBonus: 4 },
				maxCount: 2,
				pointCosts: [-1, -3],
				order: 10
			},
			research_growth: {
				id: 'research_growth',
				name: '厚积薄发',
				icon: '📈',
				desc: '每6月科研能力+10%',
				effect: { researchGrowthPeriod: 6, researchGrowthPercent: 10 },
				maxCount: 3,
				pointCosts: [-1, -3, -4],
				order: 11
			},
			social_growth: {
				id: 'social_growth',
				name: '广结善缘',
				icon: '🌐',
				desc: '每6月社交能力+10%',
				effect: { socialGrowthPeriod: 6, socialGrowthPercent: 10 },
				maxCount: 3,
				pointCosts: [-1, -2, -3],
				order: 12
			},
			favor_growth: {
				id: 'favor_growth',
				name: '师恩渐深',
				icon: '💞',
				desc: '每6月导师好感+10%',
				effect: { favorGrowthPeriod: 6, favorGrowthPercent: 10 },
				maxCount: 3,
				pointCosts: [-1, -2, -3],
				order: 13
			},
			undergrad_paper: {
				id: 'undergrad_paper',
				name: '本科成果',
				icon: '🏁',
				desc: '开局自带C会论文',
				effect: { startWithCPaper: true },
				maxCount: 2,
				pointCosts: [-3, -5],
				order: 14
			}
		};

		// 当前选择的诅咒（用于UI）
		let selectedCurses = {};
		// ★★★ 新增：当前选择的祝福 ★★★
		let selectedBlessings = {};
		// ★★★ 新增：当前页面（curses/blessings）★★★
		let currentDifficultyPage = 'curses';

		// 初始化诅咒选择（从已保存的设置加载）
		function initCurseSelection() {
			selectedCurses = {};
			Object.keys(CURSES).forEach(id => {
				selectedCurses[id] = 0;
			});
			// 从已保存的设置恢复
			if (difficultySettings && difficultySettings.selectedCurses) {
				Object.assign(selectedCurses, difficultySettings.selectedCurses);
			}
		}

		// ★★★ 新增：初始化祝福选择 ★★★
		function initBlessingSelection() {
			selectedBlessings = {};
			Object.keys(BLESSINGS).forEach(id => {
				selectedBlessings[id] = 0;
			});
			// 从已保存的设置恢复
			if (difficultySettings && difficultySettings.selectedBlessings) {
				Object.assign(selectedBlessings, difficultySettings.selectedBlessings);
			}
		}

		// 计算当前总难度分（诅咒正分 + 祝福负分）
		function calculateTotalDifficultyPoints() {
			let total = 0;
			// 诅咒正分
			Object.entries(selectedCurses).forEach(([id, count]) => {
				if (count > 0 && CURSES[id]) {
					const curse = CURSES[id];
					total += curse.pointCosts[count - 1];
				}
			});
			// 祝福负分
			Object.entries(selectedBlessings).forEach(([id, count]) => {
				if (count > 0 && BLESSINGS[id]) {
					const blessing = BLESSINGS[id];
					total += blessing.pointCosts[count - 1]; // 已经是负数
				}
			});
			return total;
		}

		// 获取已保存的难度分数（用于按钮显示）
		function getSavedDifficultyPoints() {
			if (difficultySettings && difficultySettings.totalPoints !== undefined) {
				return difficultySettings.totalPoints;
			}
			return 0;
		}

		// 记录滚动位置
		let difficultyScrollTop = 0;

		// 切换诅咒选择（点击骷髅头）
		function toggleCurse(curseId, level) {
			const curse = CURSES[curseId];
			if (!curse) return;

			const currentCount = selectedCurses[curseId] || 0;

			// 如果点击的是当前激活的最后一个骷髅，取消它
			if (level === currentCount) {
				selectedCurses[curseId] = level - 1;
			} else {
				// 否则设置到该级别
				selectedCurses[curseId] = level;
			}

			// 只更新必要的元素，避免重新渲染导致抖动
			updateDifficultyDisplay();
		}

		// ★★★ 新增：切换祝福选择（点击星星）★★★
		function toggleBlessing(blessingId, level) {
			const blessing = BLESSINGS[blessingId];
			if (!blessing) return;

			const currentCount = selectedBlessings[blessingId] || 0;

			if (level === currentCount) {
				selectedBlessings[blessingId] = level - 1;
			} else {
				selectedBlessings[blessingId] = level;
			}

			updateDifficultyDisplay();
		}

		// 只更新显示，不重新渲染整个弹窗
		function updateDifficultyDisplay() {
			const totalPoints = calculateTotalDifficultyPoints();

			// 更新总分显示
			const scoreEl = document.querySelector('.difficulty-modal-dark .difficulty-score');
			if (scoreEl) {
				scoreEl.textContent = totalPoints;
				// 负数时显示绿色
				scoreEl.style.color = totalPoints < 0 ? '#10b981' : (totalPoints > 0 ? '#ef4444' : '#6b7280');
			}

			// 更新每个诅咒项的状态
			Object.keys(CURSES).forEach(curseId => {
				const curse = CURSES[curseId];
				const count = selectedCurses[curseId] || 0;
				const currentPoints = count > 0 ? curse.pointCosts[count - 1] : 0;

				const curseItem = document.querySelector(`.curse-item[data-curse-id="${curseId}"]`);
				if (curseItem) {
					curseItem.classList.toggle('active', count > 0);

					const nameEl = curseItem.querySelector('.curse-name');
					if (nameEl) {
						nameEl.textContent = curse.name + (count > 1 ? ` ×${count}` : '');
					}

					const skulls = curseItem.querySelectorAll('.skull-icon');
					skulls.forEach((skull, idx) => {
						skull.classList.toggle('active', idx < count);
					});

					const pointsEl = curseItem.querySelector('.curse-points');
					if (pointsEl) {
						pointsEl.innerHTML = count > 0 ? `<span class="points-active">+${currentPoints}</span>` : '';
					}
				}
			});

			// ★★★ 新增：更新每个祝福项的状态 ★★★
			Object.keys(BLESSINGS).forEach(blessingId => {
				const blessing = BLESSINGS[blessingId];
				const count = selectedBlessings[blessingId] || 0;
				const currentPoints = count > 0 ? blessing.pointCosts[count - 1] : 0;

				const blessingItem = document.querySelector(`.blessing-item[data-blessing-id="${blessingId}"]`);
				if (blessingItem) {
					blessingItem.classList.toggle('active', count > 0);

					const nameEl = blessingItem.querySelector('.blessing-name');
					if (nameEl) {
						nameEl.textContent = blessing.name + (count > 1 ? ` ×${count}` : '');
					}

					const stars = blessingItem.querySelectorAll('.star-icon');
					stars.forEach((star, idx) => {
						star.classList.toggle('active', idx < count);
					});

					const pointsEl = blessingItem.querySelector('.blessing-points');
					if (pointsEl) {
						pointsEl.innerHTML = count > 0 ? `<span class="points-active">${currentPoints}</span>` : '';
					}
				}
			});
		}

		// 渲染难度选择弹窗（分页：诅咒/祝福）
		function renderDifficultyModal() {
			const totalPoints = calculateTotalDifficultyPoints();
			const scoreColor = totalPoints < 0 ? '#10b981' : (totalPoints > 0 ? '#ef4444' : '#6b7280');

			// 生成诅咒列表HTML
			const sortedCurses = Object.values(CURSES).sort((a, b) => a.order - b.order);
			let cursesHtml = '';
			sortedCurses.forEach(curse => {
				const count = selectedCurses[curse.id] || 0;
				const currentPoints = count > 0 ? curse.pointCosts[count - 1] : 0;

				let skullsHtml = '';
				for (let i = 1; i <= curse.maxCount; i++) {
					const isActive = i <= count;
					const pointCost = curse.pointCosts[i - 1];
					skullsHtml += `
						<div class="skull-icon ${isActive ? 'active' : ''}"
							 onclick="toggleCurse('${curse.id}', ${i})"
							 title="+${pointCost}分">
							💀
						</div>
					`;
				}

				cursesHtml += `
					<div class="curse-item ${count > 0 ? 'active' : ''}" data-curse-id="${curse.id}">
						<div class="curse-icon">${curse.icon}</div>
						<div class="curse-info">
							<div class="curse-name">${curse.name}${count > 1 ? ` ×${count}` : ''}</div>
							<div class="curse-desc">${curse.desc}</div>
						</div>
						<div class="curse-skulls">
							${skullsHtml}
						</div>
						<div class="curse-points">
							${count > 0 ? `<span class="points-active">+${currentPoints}</span>` : ''}
						</div>
					</div>
				`;
			});

			// 生成祝福列表HTML
			const sortedBlessings = Object.values(BLESSINGS).sort((a, b) => a.order - b.order);
			let blessingsHtml = '';
			sortedBlessings.forEach(blessing => {
				const count = selectedBlessings[blessing.id] || 0;
				const currentPoints = count > 0 ? blessing.pointCosts[count - 1] : 0;

				let starsHtml = '';
				for (let i = 1; i <= blessing.maxCount; i++) {
					const isActive = i <= count;
					const pointCost = blessing.pointCosts[i - 1];
					starsHtml += `
						<div class="star-icon ${isActive ? 'active' : ''}"
							 onclick="toggleBlessing('${blessing.id}', ${i})"
							 title="${pointCost}分">
							⭐
						</div>
					`;
				}

				blessingsHtml += `
					<div class="blessing-item ${count > 0 ? 'active' : ''}" data-blessing-id="${blessing.id}">
						<div class="blessing-icon">${blessing.icon}</div>
						<div class="blessing-info">
							<div class="blessing-name">${blessing.name}${count > 1 ? ` ×${count}` : ''}</div>
							<div class="blessing-desc">${blessing.desc}</div>
						</div>
						<div class="blessing-stars">
							${starsHtml}
						</div>
						<div class="blessing-points">
							${count > 0 ? `<span class="points-active">${currentPoints}</span>` : ''}
						</div>
					</div>
				`;
			});

			const modalContent = `
				<div class="difficulty-modal-dark">
					<div class="difficulty-header">
						<span class="difficulty-score" style="color:${scoreColor}">${totalPoints}</span>
						<span class="difficulty-label">难度分</span>
					</div>

					<!-- 分页标签 -->
					<div class="difficulty-tabs">
						<button class="difficulty-tab ${currentDifficultyPage === 'curses' ? 'active' : ''}" onclick="switchDifficultyPage('curses')">
							💀 诅咒
						</button>
						<button class="difficulty-tab ${currentDifficultyPage === 'blessings' ? 'active' : ''}" onclick="switchDifficultyPage('blessings')">
							⭐ 祝福
						</button>
					</div>

					<!-- 诅咒页 -->
					<div class="curses-container" style="display:${currentDifficultyPage === 'curses' ? 'block' : 'none'}">
						${cursesHtml}
						<div class="difficulty-footer">
							<span>💀</span> 点击骷髅激活诅咒，再次点击取消
						</div>
					</div>

					<!-- 祝福页 -->
					<div class="blessings-container" style="display:${currentDifficultyPage === 'blessings' ? 'block' : 'none'}">
						${isReversedMode ? `
							<div style="padding:12px;margin-bottom:12px;background:linear-gradient(135deg,rgba(231,76,60,0.15),rgba(192,57,43,0.15));border:1px dashed #e74c3c;border-radius:8px;text-align:center;color:#e74c3c;">
								🚫 <strong>无法被祝福者</strong>：逆位角色无法接受祝福，选择的祝福不会生效。
							</div>
						` : ''}
						${blessingsHtml}
						<div class="difficulty-footer blessing-footer">
							<span>⭐</span> 点击星星激活祝福，再次点击取消
						</div>
						${!isReversedMode ? `
							<div class="negative-difficulty-warning">
								⚠️ <strong>负难度分提示</strong>：难度分<0时，本局游戏数据不计入全球统计，不影响角色最佳记录，无法解锁真·大多数，但成就正常生效。
							</div>
						` : ''}
					</div>
				</div>
			`;

			const modalBody = document.getElementById('modal-content');
			if (modalBody) {
				modalBody.innerHTML = modalContent;
			}

			const modal = document.getElementById('modal');
			if (modal) {
				modal.classList.add('difficulty-theme');
			}
		}

		// ★★★ 新增：切换难度页面 ★★★
		function switchDifficultyPage(page) {
			currentDifficultyPage = page;
			renderDifficultyModal();
		}

		// 打开难度选择弹窗
		function openDifficultyModal() {
			// 从已保存的设置加载
			if (difficultySettings && difficultySettings.selectedCurses && Object.keys(difficultySettings.selectedCurses).length > 0) {
				selectedCurses = { ...difficultySettings.selectedCurses };
			} else {
				initCurseSelection();
			}
			// ★★★ 新增：加载祝福设置 ★★★
			if (difficultySettings && difficultySettings.selectedBlessings && Object.keys(difficultySettings.selectedBlessings).length > 0) {
				selectedBlessings = { ...difficultySettings.selectedBlessings };
			} else {
				initBlessingSelection();
			}

			currentDifficultyPage = 'curses'; // 默认显示诅咒页

			showModal('💀 难度选择', '', [
				{ text: '重置', class: 'btn-warning', action: () => {
					// 清空所有诅咒和祝福选择
					selectedCurses = {};
					Object.keys(CURSES).forEach(id => {
						selectedCurses[id] = 0;
					});
					selectedBlessings = {};
					Object.keys(BLESSINGS).forEach(id => {
						selectedBlessings[id] = 0;
					});
					renderDifficultyModal();
				}},
				{ text: '确认', class: 'btn-danger', action: () => {
					saveDifficultySettings();
					updateDifficultyButton();
					closeModal();
					const modal = document.getElementById('modal');
					if (modal) modal.classList.remove('difficulty-theme');
				}},
				{ text: '取消', class: 'btn-secondary', action: () => {
					closeModal();
					const modal = document.getElementById('modal');
					if (modal) modal.classList.remove('difficulty-theme');
				}}
			]);

			setTimeout(() => {
				renderDifficultyModal();
			}, 50);
		}

		// 更新难度按钮显示
		function updateDifficultyButton() {
			const points = getSavedDifficultyPoints();
			const btn = document.querySelector('.difficulty-btn');
			if (btn) {
				// 统一格式：💀 数值 难度
				btn.innerHTML = `<i class="fas fa-skull"></i> <span class="difficulty-badge">${points}</span> 难度`;
			}
		}

		// 难度设置存储
		let difficultySettings = {
			selectedCurses: {},
			totalPoints: 0
		};

		// 从localStorage加载难度设置
		function loadDifficultySettings() {
			try {
				const saved = localStorage.getItem('graduateSimulator_difficulty');
				if (saved) {
					difficultySettings = JSON.parse(saved);
				}
			} catch (e) {
				console.warn('加载难度设置失败:', e);
			}
		}

		// 保存难度设置
		function saveDifficultySettings() {
			difficultySettings = {
				selectedCurses: { ...selectedCurses },
				selectedBlessings: { ...selectedBlessings },
				totalPoints: calculateTotalDifficultyPoints()
			};
			// 保存到localStorage
			try {
				localStorage.setItem('graduateSimulator_difficulty', JSON.stringify(difficultySettings));
			} catch (e) {
				console.warn('保存难度设置失败:', e);
			}
		}

		// 页面加载时初始化难度设置
		loadDifficultySettings();

		// 应用难度效果到游戏状态（按order顺序）
		function applyDifficultyEffects() {
			if (!difficultySettings || !difficultySettings.selectedCurses) return;

			const curses = difficultySettings.selectedCurses;
			let appliedEffects = [];

			// 按order排序处理
			const sortedCurseIds = Object.keys(curses).sort((a, b) => {
				return (CURSES[a]?.order || 99) - (CURSES[b]?.order || 99);
			});

			sortedCurseIds.forEach(curseId => {
				const count = curses[curseId];
				if (count <= 0) return;

				const curse = CURSES[curseId];
				if (!curse) return;

				const effect = curse.effect;

				// ★★★ 焦虑症候先结算（order=1）★★★
				if (effect.initialSanReduction) {
					gameState.san -= effect.initialSanReduction * count;
					appliedEffects.push(`${curse.name}×${count}: SAN-${effect.initialSanReduction * count}`);
				}

				// ★★★ 破防体质后结算（order=2）★★★
				if (effect.sanMaxReduction) {
					gameState.sanMax -= effect.sanMaxReduction * count;
					gameState.san = Math.min(gameState.san, gameState.sanMax);
					appliedEffects.push(`${curse.name}×${count}: SAN上限-${effect.sanMaxReduction * count}`);
				}

				if (effect.researchMaxReduction) {
					gameState.researchMax = (gameState.researchMax || 20) - effect.researchMaxReduction * count;
					gameState.research = Math.min(gameState.research, gameState.researchMax);
					appliedEffects.push(`${curse.name}×${count}: 科研上限-${effect.researchMaxReduction * count}`);
				}

				if (effect.favorMaxReduction) {
					gameState.favorMax = (gameState.favorMax || 20) - effect.favorMaxReduction * count;
					gameState.favor = Math.min(gameState.favor, gameState.favorMax);
					appliedEffects.push(`${curse.name}×${count}: 好感上限-${effect.favorMaxReduction * count}`);
				}

				if (effect.socialMaxReduction) {
					gameState.socialMax = (gameState.socialMax || 20) - effect.socialMaxReduction * count;
					gameState.social = Math.min(gameState.social, gameState.socialMax);
					appliedEffects.push(`${curse.name}×${count}: 社交上限-${effect.socialMaxReduction * count}`);
				}

				if (effect.goldMax) {
					gameState.goldMax = effect.goldMax;
					gameState.gold = Math.min(gameState.gold, gameState.goldMax);
					appliedEffects.push(`${curse.name}: 金币上限${effect.goldMax}`);
				}

				if (effect.phdRequirementIncrease) {
					gameState.phdRequirementBonus = (gameState.phdRequirementBonus || 0) + effect.phdRequirementIncrease * count;
					appliedEffects.push(`${curse.name}×${count}: 转博要求+${effect.phdRequirementIncrease * count}`);
				}

				if (effect.graduationRequirementIncrease) {
					gameState.graduationRequirementBonus = (gameState.graduationRequirementBonus || 0) + effect.graduationRequirementIncrease * count;
					appliedEffects.push(`${curse.name}×${count}: 毕业要求+${effect.graduationRequirementIncrease * count}`);
				}

				if (effect.monthlyExpenseIncrease) {
					gameState.monthlyExpenseBonus = (gameState.monthlyExpenseBonus || 0) + effect.monthlyExpenseIncrease * count;
					appliedEffects.push(`${curse.name}×${count}: 月花费+${effect.monthlyExpenseIncrease * count}`);
				}

				if (effect.monthlySanDrain) {
					gameState.monthlySanDrain = (gameState.monthlySanDrain || 0) + effect.monthlySanDrain * count;
					appliedEffects.push(`${curse.name}×${count}: 每月SAN-${effect.monthlySanDrain * count}`);
				}

				if (effect.researchDecayPeriod) {
					gameState.researchDecay = (gameState.researchDecay || 0) + effect.researchDecayAmount * count;
					gameState.researchDecayPeriod = effect.researchDecayPeriod;
					appliedEffects.push(`${curse.name}×${count}: 每${effect.researchDecayPeriod}月科研-${effect.researchDecayAmount * count}`);
				}

				if (effect.socialDecayPeriod) {
					gameState.socialDecay = (gameState.socialDecay || 0) + effect.socialDecayAmount * count;
					gameState.socialDecayPeriod = effect.socialDecayPeriod;
					appliedEffects.push(`${curse.name}×${count}: 每${effect.socialDecayPeriod}月社交-${effect.socialDecayAmount * count}`);
				}

				if (effect.favorDecayPeriod) {
					gameState.favorDecay = (gameState.favorDecay || 0) + effect.favorDecayAmount * count;
					gameState.favorDecayPeriod = effect.favorDecayPeriod;
					appliedEffects.push(`${curse.name}×${count}: 每${effect.favorDecayPeriod}月好感-${effect.favorDecayAmount * count}`);
				}
			});

			// 保存难度分数到gameState
			gameState.difficultyPoints = difficultySettings.totalPoints;
			gameState.activeCurses = { ...difficultySettings.selectedCurses };
			gameState.activeBlessings = { ...(difficultySettings.selectedBlessings || {}) };
			// 日志在 continueGameStart() 中显示，因为此时日志容器还未准备好
		}

		// ★★★ 新增：应用祝福效果到游戏状态（游戏开始时调用）★★★
		function applyBlessingEffects() {
			// ★★★ 逆位角色无法使用祝福 ★★★
			if (gameState.isReversed) {
				gameState.activeBlessings = {};
				return;
			}

			if (!difficultySettings || !difficultySettings.selectedBlessings) return;

			const blessings = difficultySettings.selectedBlessings;
			let appliedEffects = [];

			// 按order排序处理
			const sortedBlessingIds = Object.keys(blessings).sort((a, b) => {
				return (BLESSINGS[a]?.order || 99) - (BLESSINGS[b]?.order || 99);
			});

			sortedBlessingIds.forEach(blessingId => {
				const count = blessings[blessingId];
				if (count <= 0) return;

				const blessing = BLESSINGS[blessingId];
				if (!blessing) return;

				const effect = blessing.effect;

				// ★★★ 初始效果 ★★★
				// 带资进组：初始金币+5
				if (effect.initialGoldBonus) {
					gameState.gold += effect.initialGoldBonus * count;
					appliedEffects.push(`${blessing.name}×${count}: 金币+${effect.initialGoldBonus * count}`);
				}

				// 钢铁意志：SAN上限+4
				if (effect.sanMaxBonus) {
					gameState.sanMax += effect.sanMaxBonus * count;
					gameState.san = Math.min(gameState.san, gameState.sanMax);
					appliedEffects.push(`${blessing.name}×${count}: SAN上限+${effect.sanMaxBonus * count}`);
				}

				// 天赋异禀：科研能力上限+4
				if (effect.researchMaxBonus) {
					gameState.researchMax = (gameState.researchMax || 20) + effect.researchMaxBonus * count;
					appliedEffects.push(`${blessing.name}×${count}: 科研上限+${effect.researchMaxBonus * count}`);
				}

				// 师生缘分：导师好感上限+4
				if (effect.favorMaxBonus) {
					gameState.favorMax = (gameState.favorMax || 20) + effect.favorMaxBonus * count;
					appliedEffects.push(`${blessing.name}×${count}: 好感上限+${effect.favorMaxBonus * count}`);
				}

				// 八面玲珑：社交能力上限+4
				if (effect.socialMaxBonus) {
					gameState.socialMax = (gameState.socialMax || 20) + effect.socialMaxBonus * count;
					appliedEffects.push(`${blessing.name}×${count}: 社交上限+${effect.socialMaxBonus * count}`);
				}

				// 扎实基础：初始科研能力+3
				if (effect.initialResearchBonus) {
					gameState.research = Math.min(gameState.researchMax || 20, gameState.research + effect.initialResearchBonus * count);
					appliedEffects.push(`${blessing.name}×${count}: 科研+${effect.initialResearchBonus * count}`);
				}

				// 自来熟：初始社交能力+3
				if (effect.initialSocialBonus) {
					gameState.social = Math.min(gameState.socialMax || 20, gameState.social + effect.initialSocialBonus * count);
					appliedEffects.push(`${blessing.name}×${count}: 社交+${effect.initialSocialBonus * count}`);
				}

				// 一见如故：初始导师好感+4
				if (effect.initialFavorBonus) {
					gameState.favor = Math.min(gameState.favorMax || 20, gameState.favor + effect.initialFavorBonus * count);
					appliedEffects.push(`${blessing.name}×${count}: 好感+${effect.initialFavorBonus * count}`);
				}

				// 本科成果：开局自带C会论文
				if (effect.startWithCPaper) {
					for (let i = 0; i < count; i++) {
						gameState.publishedPapers = gameState.publishedPapers || [];
						gameState.publishedPapers.push({
							title: `本科研究成果 #${i + 1}`,
							grade: 'C',
							acceptType: 'Poster',
							score: 20,
							researchScore: 2,
							citations: 0,
							monthsSincePublish: 0,
							pendingCitationFraction: 0,
							publishedMonth: 0,
							publishedYear: gameState.year,
							ideaScore: 10,
							expScore: 5,
							writeScore: 5,
							isStartingPaper: true  // 标记为初始论文
						});
						gameState.totalScore += 2;
						gameState.paperC++;
					}
					appliedEffects.push(`${blessing.name}×${count}: 自带${count}篇C会论文`);
				}

				// ★★★ 每月效果存储到gameState ★★★
				// 移动泉水：每月恢复已损失SAN的5%
				if (effect.monthlySanRecoveryPercent) {
					gameState.monthlySanRecoveryPercent = (gameState.monthlySanRecoveryPercent || 0) + effect.monthlySanRecoveryPercent * count;
					appliedEffects.push(`${blessing.name}×${count}: 每月恢复${effect.monthlySanRecoveryPercent * count}%已损失SAN`);
				}

				// 复利魔法：每月金币+3%
				if (effect.monthlyGoldPercent) {
					gameState.monthlyGoldPercent = (gameState.monthlyGoldPercent || 0) + effect.monthlyGoldPercent * count;
					appliedEffects.push(`${blessing.name}×${count}: 每月金币+${effect.monthlyGoldPercent * count}%`);
				}

				// 厚积薄发：每6月科研能力+10%
				if (effect.researchGrowthPeriod) {
					gameState.researchGrowthPercent = (gameState.researchGrowthPercent || 0) + effect.researchGrowthPercent * count;
					gameState.researchGrowthPeriod = effect.researchGrowthPeriod;
					appliedEffects.push(`${blessing.name}×${count}: 每${effect.researchGrowthPeriod}月科研+${effect.researchGrowthPercent * count}%`);
				}

				// 广结善缘：每6月社交能力+10%
				if (effect.socialGrowthPeriod) {
					gameState.socialGrowthPercent = (gameState.socialGrowthPercent || 0) + effect.socialGrowthPercent * count;
					gameState.socialGrowthPeriod = effect.socialGrowthPeriod;
					appliedEffects.push(`${blessing.name}×${count}: 每${effect.socialGrowthPeriod}月社交+${effect.socialGrowthPercent * count}%`);
				}

				// 师恩渐深：每6月导师好感+10%
				if (effect.favorGrowthPeriod) {
					gameState.favorGrowthPercent = (gameState.favorGrowthPercent || 0) + effect.favorGrowthPercent * count;
					gameState.favorGrowthPeriod = effect.favorGrowthPeriod;
					appliedEffects.push(`${blessing.name}×${count}: 每${effect.favorGrowthPeriod}月好感+${effect.favorGrowthPercent * count}%`);
				}
			});

			// 保存祝福到gameState
			gameState.activeBlessings = { ...difficultySettings.selectedBlessings };
		}

		// 每月应用诅咒效果（在nextMonth中调用）
		function applyMonthlyCurseEffects() {
			let effects = [];

			// ==================== 诅咒效果 ====================
			if (gameState.activeCurses) {
				// 精神内耗：每月SAN-1
				if (gameState.monthlySanDrain && gameState.monthlySanDrain > 0) {
					gameState.san -= gameState.monthlySanDrain;
					effects.push(`精神内耗: SAN-${gameState.monthlySanDrain}`);
				}

				// 消费陷阱：每月花费+1
				if (gameState.monthlyExpenseBonus && gameState.monthlyExpenseBonus > 0) {
					gameState.gold -= gameState.monthlyExpenseBonus;
					effects.push(`消费陷阱: 金币-${gameState.monthlyExpenseBonus}`);
				}

				// 周期性衰减（每4月）
				if (gameState.totalMonths > 0 && gameState.totalMonths % 4 === 0) {
					// 江郎才尽
					if (gameState.researchDecay && gameState.researchDecay > 0) {
						gameState.research = Math.max(0, gameState.research - gameState.researchDecay);
						effects.push(`江郎才尽: 科研-${gameState.researchDecay}`);
					}

					// 人情淡漠
					if (gameState.socialDecay && gameState.socialDecay > 0) {
						gameState.social = Math.max(0, gameState.social - gameState.socialDecay);
						effects.push(`人情淡漠: 社交-${gameState.socialDecay}`);
					}

					// 师恩渐远
					if (gameState.favorDecay && gameState.favorDecay > 0) {
						gameState.favor = Math.max(0, gameState.favor - gameState.favorDecay);
						effects.push(`师恩渐远: 好感-${gameState.favorDecay}`);
					}
				}
			}

			// ==================== 祝福效果 ====================
			// 移动泉水：每月恢复已损失SAN的5%
			if (gameState.monthlySanRecoveryPercent && gameState.monthlySanRecoveryPercent > 0) {
				const lostSan = gameState.sanMax - gameState.san;
				if (lostSan > 0) {
					const recovery = Math.max(1, Math.floor(lostSan * gameState.monthlySanRecoveryPercent / 100));
					gameState.san = Math.min(gameState.sanMax, gameState.san + recovery);
					effects.push(`移动泉水: SAN+${recovery}`);
				}
			}

			// 复利魔法：每月金币+3%
			if (gameState.monthlyGoldPercent && gameState.monthlyGoldPercent > 0 && gameState.gold > 0) {
				const goldGain = Math.max(1, Math.floor(gameState.gold * gameState.monthlyGoldPercent / 100));
				const goldMax = gameState.goldMax || 999;
				gameState.gold = Math.min(goldMax, gameState.gold + goldGain);
				effects.push(`复利魔法: 金币+${goldGain}`);
			}

			// 周期性成长（每6月）
			if (gameState.totalMonths > 0 && gameState.totalMonths % 6 === 0) {
				// 厚积薄发：科研能力+10%
				if (gameState.researchGrowthPercent && gameState.researchGrowthPercent > 0) {
					const growth = Math.max(1, Math.floor(gameState.research * gameState.researchGrowthPercent / 100));
					gameState.research = Math.min(gameState.researchMax || 20, gameState.research + growth);
					effects.push(`厚积薄发: 科研+${growth}`);
				}

				// 广结善缘：社交能力+10%
				if (gameState.socialGrowthPercent && gameState.socialGrowthPercent > 0) {
					const growth = Math.max(1, Math.floor(gameState.social * gameState.socialGrowthPercent / 100));
					gameState.social = Math.min(gameState.socialMax || 20, gameState.social + growth);
					effects.push(`广结善缘: 社交+${growth}`);
				}

				// 师恩渐深：导师好感+10%
				if (gameState.favorGrowthPercent && gameState.favorGrowthPercent > 0) {
					const growth = Math.max(1, Math.floor(gameState.favor * gameState.favorGrowthPercent / 100));
					gameState.favor = Math.min(gameState.favorMax || 20, gameState.favor + growth);
					effects.push(`师恩渐深: 好感+${growth}`);
				}
			}

			// 记录日志
			if (effects.length > 0) {
				addLog('难度效果', effects.join('，'));
			}

			// 检查护身符
			checkAmuletEffects();
		}

		// 获取修正后的转博要求
		function getAdjustedPhdRequirement(baseReq) {
			const bonus = gameState.phdRequirementBonus || 0;
			return baseReq + bonus;
		}

		// 获取修正后的毕业要求
		function getAdjustedGraduationRequirement(baseReq) {
			const bonus = gameState.graduationRequirementBonus || 0;
			return baseReq + bonus;
		}

		// 重置难度设置（新游戏时）
		function resetDifficultySettings() {
			difficultySettings = {
				selectedCurses: {},
				selectedBlessings: {},
				totalPoints: 0
			};
			// 清除localStorage
			try {
				localStorage.removeItem('graduateSimulator_difficulty');
			} catch (e) {}
			initCurseSelection();
			initBlessingSelection();
		}

		// 全局函数暴露
		window.openDifficultyModal = openDifficultyModal;
		window.toggleCurse = toggleCurse;
		window.toggleBlessing = toggleBlessing;
		window.switchDifficultyPage = switchDifficultyPage;
		window.applyDifficultyEffects = applyDifficultyEffects;
		window.applyBlessingEffects = applyBlessingEffects;
		window.applyMonthlyCurseEffects = applyMonthlyCurseEffects;
		window.getAdjustedPhdRequirement = getAdjustedPhdRequirement;
		window.getAdjustedGraduationRequirement = getAdjustedGraduationRequirement;
		window.resetDifficultySettings = resetDifficultySettings;
		window.getSavedDifficultyPoints = getSavedDifficultyPoints;
		window.updateDifficultyButton = updateDifficultyButton;
