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

		// 当前选择的诅咒（用于UI）
		let selectedCurses = {};

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

		// 计算当前总难度分
		function calculateTotalDifficultyPoints() {
			let total = 0;
			Object.entries(selectedCurses).forEach(([id, count]) => {
				if (count > 0 && CURSES[id]) {
					const curse = CURSES[id];
					total += curse.pointCosts[count - 1];
				}
			});
			return total;
		}

		// 获取已保存的难度分数（用于按钮显示）
		function getSavedDifficultyPoints() {
			if (difficultySettings && difficultySettings.totalPoints) {
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

		// 只更新显示，不重新渲染整个弹窗
		function updateDifficultyDisplay() {
			const totalPoints = calculateTotalDifficultyPoints();

			// 更新总分显示
			const scoreEl = document.querySelector('.difficulty-modal-dark .difficulty-score');
			if (scoreEl) {
				scoreEl.textContent = totalPoints;
			}

			// 更新每个诅咒项的状态
			Object.keys(CURSES).forEach(curseId => {
				const curse = CURSES[curseId];
				const count = selectedCurses[curseId] || 0;
				const currentPoints = count > 0 ? curse.pointCosts[count - 1] : 0;

				// 找到对应的诅咒项
				const curseItem = document.querySelector(`.curse-item[data-curse-id="${curseId}"]`);
				if (curseItem) {
					// 更新激活状态
					curseItem.classList.toggle('active', count > 0);

					// 更新名称显示
					const nameEl = curseItem.querySelector('.curse-name');
					if (nameEl) {
						nameEl.textContent = curse.name + (count > 1 ? ` ×${count}` : '');
					}

					// 更新骷髅头状态
					const skulls = curseItem.querySelectorAll('.skull-icon');
					skulls.forEach((skull, idx) => {
						skull.classList.toggle('active', idx < count);
					});

					// 更新分数显示
					const pointsEl = curseItem.querySelector('.curse-points');
					if (pointsEl) {
						pointsEl.innerHTML = count > 0 ? `<span class="points-active">+${currentPoints}</span>` : '';
					}
				}
			});
		}

		// 渲染难度选择弹窗（暗黑风格）
		function renderDifficultyModal() {
			const totalPoints = calculateTotalDifficultyPoints();

			// 按order排序诅咒
			const sortedCurses = Object.values(CURSES).sort((a, b) => a.order - b.order);

			let cursesHtml = '';
			sortedCurses.forEach(curse => {
				const count = selectedCurses[curse.id] || 0;
				const currentPoints = count > 0 ? curse.pointCosts[count - 1] : 0;

				// 生成骷髅头选择器
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

			const modalContent = `
				<div class="difficulty-modal-dark">
					<div class="difficulty-header">
						<span class="difficulty-score">${totalPoints}</span>
						<span class="difficulty-label">难度分</span>
					</div>

					<div class="curses-container">
						${cursesHtml}
					</div>

					<div class="difficulty-footer">
						<span>💀</span> 点击骷髅激活诅咒，再次点击取消
					</div>
				</div>
			`;

			const modalBody = document.getElementById('modal-content');
			if (modalBody) {
				modalBody.innerHTML = modalContent;
			}

			// 添加暗黑主题样式到modal
			const modal = document.getElementById('modal');
			if (modal) {
				modal.classList.add('difficulty-theme');
			}
		}

		// 打开难度选择弹窗
		function openDifficultyModal() {
			// 从已保存的设置加载
			if (difficultySettings && difficultySettings.selectedCurses && Object.keys(difficultySettings.selectedCurses).length > 0) {
				selectedCurses = { ...difficultySettings.selectedCurses };
			} else {
				initCurseSelection();
			}

			showModal('💀 难度选择', '', [
				{ text: '重置', class: 'btn-warning', action: () => {
					// 清空所有诅咒选择（不从保存的设置恢复）
					selectedCurses = {};
					Object.keys(CURSES).forEach(id => {
						selectedCurses[id] = 0;
					});
					renderDifficultyModal();
				}},
				{ text: '确认', class: 'btn-danger', action: () => {
					saveDifficultySettings();
					updateDifficultyButton();
					closeModal();
					// 移除暗黑主题
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
			// 日志在 continueGameStart() 中显示，因为此时日志容器还未准备好
		}

		// 每月应用诅咒效果（在nextMonth中调用）
		function applyMonthlyCurseEffects() {
			if (!gameState.activeCurses) return;

			let effects = [];

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

			// 记录日志
			if (effects.length > 0) {
				addLog('诅咒效果', effects.join('，'));
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
				totalPoints: 0
			};
			// 清除localStorage
			try {
				localStorage.removeItem('graduateSimulator_difficulty');
			} catch (e) {}
			initCurseSelection();
		}

		// 全局函数暴露
		window.openDifficultyModal = openDifficultyModal;
		window.toggleCurse = toggleCurse;
		window.applyDifficultyEffects = applyDifficultyEffects;
		window.applyMonthlyCurseEffects = applyMonthlyCurseEffects;
		window.getAdjustedPhdRequirement = getAdjustedPhdRequirement;
		window.getAdjustedGraduationRequirement = getAdjustedGraduationRequirement;
		window.resetDifficultySettings = resetDifficultySettings;
		window.getSavedDifficultyPoints = getSavedDifficultyPoints;
		window.updateDifficultyButton = updateDifficultyButton;
