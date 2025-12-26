        // ==================== 论文推广功能 ====================
		function promotePaper(index, type) {
			const paper = gameState.publishedPapers[index];
			if (!paper) return;

			if (!paper.promotions) {
				paper.promotions = { arxiv: false, github: false, xiaohongshu: false, quantumbit: false };
			}
			if (!paper.citationMultiplier) paper.citationMultiplier = 1;

			if (paper.promotions[type]) return;

			const typeNames = {
				arxiv: '挂arxiv',
				github: 'github开源',
				xiaohongshu: '小红书宣传',
				quantumbit: '量子位封面'
			};

			let result = '';
			let canProceed = true;
			
			switch(type) {
				case 'arxiv': {
					const baseSanCost = 3;
					const actualSanCost = Math.abs(getActualSanChange(-baseSanCost));
					
					if (gameState.san < actualSanCost) {
						const tipText = actualSanCost !== baseSanCost 
							? `<p>SAN值不足！基础消耗${baseSanCost}点，怠惰×${gameState.reversedAwakened ? 3 : 2}后需要${actualSanCost}点SAN值。</p>` 
							: `<p>SAN值不足！需要至少${baseSanCost}点SAN值。</p>`;
						showModal('❌ 操作失败', tipText, 
							[{ text: '确定', class: 'btn-primary', action: closeModal }]);
						return;
					}
					paper.promotions.arxiv = true;
					// ★★★ 改为加法：+0.25 ★★★
					paper.citationMultiplier += 0.25;
					const sanText = actualSanCost !== baseSanCost 
						? `SAN值-${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` 
						: `SAN值-${baseSanCost}`;
					result = `${sanText}，论文引用速度+25%`;
					canProceed = changeSan(-baseSanCost);
					break;
				}
				case 'github': {
					const baseSanCost = 6;
					const actualSanCost = Math.abs(getActualSanChange(-baseSanCost));
					
					if (gameState.san < actualSanCost) {
						const tipText = actualSanCost !== baseSanCost 
							? `<p>SAN值不足！基础消耗${baseSanCost}点，怠惰×${gameState.reversedAwakened ? 3 : 2}后需要${actualSanCost}点SAN值。</p>` 
							: `<p>SAN值不足！需要至少${baseSanCost}点SAN值。</p>`;
						showModal('❌ 操作失败', tipText, 
							[{ text: '确定', class: 'btn-primary', action: closeModal }]);
						return;
					}
					paper.promotions.github = true;
					// ★★★ 改为加法：+0.5 ★★★
					paper.citationMultiplier += 0.5;
					const sanText = actualSanCost !== baseSanCost 
						? `SAN值-${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` 
						: `SAN值-${baseSanCost}`;
					result = `${sanText}，论文引用速度+50%`;
					canProceed = changeSan(-baseSanCost);
					break;
				}
				case 'xiaohongshu': {
					const baseSanCost = 3;
					const actualSanCost = Math.abs(getActualSanChange(-baseSanCost));
					
					if (gameState.san < actualSanCost) {
						const tipText = actualSanCost !== baseSanCost 
							? `<p>SAN值不足！基础消耗${baseSanCost}点，怠惰×${gameState.reversedAwakened ? 3 : 2}后需要${actualSanCost}点SAN值。</p>` 
							: `<p>SAN值不足！需要至少${baseSanCost}点SAN值。</p>`;
						showModal('❌ 操作失败', tipText, 
							[{ text: '确定', class: 'btn-primary', action: closeModal }]);
						return;
					}
					paper.promotions.xiaohongshu = true;
					// ★★★ 改为加法：+0.25 ★★★
					paper.citationMultiplier += 0.25;
					const sanText = actualSanCost !== baseSanCost 
						? `SAN值-${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` 
						: `SAN值-${baseSanCost}`;
					result = `${sanText}，论文引用速度+25%`;
					canProceed = changeSan(-baseSanCost);
					break;
				}
				case 'quantumbit':
					// ★★★ 量子位宣传：A类和S类可用，有效分数+25%中稿分数 ★★★
					if (paper.grade !== 'A' && paper.grade !== 'S') {
						showModal('❌ 操作失败', '<p>只有A类或S类论文才能上量子位封面！</p>',
							[{ text: '确定', class: 'btn-primary', action: closeModal }]);
						return;
					}
					if (gameState.gold < 10) {
						showModal('❌ 操作失败', '<p>金钱不足！需要至少10金币。</p>',
							[{ text: '确定', class: 'btn-primary', action: closeModal }]);
						return;
					}
					paper.promotions.quantumbit = true;
					// 有效分数增加中稿时分数的25%
					const scoreBonus = Math.floor(paper.score * 0.25);
					if (paper.effectiveScore === undefined) {
						paper.effectiveScore = paper.score;
					}
					paper.effectiveScore += scoreBonus;
					result = `金钱-10，有效分数+${scoreBonus}（中稿分数的25%）`;
					canProceed = changeGold(-10);
					break;
			}

			if (canProceed) {
				addLog('论文推广', `"${paper.title.substring(0, 15)}..." ${typeNames[type]}`, result);
				updateAllUI();
			}
		}

		// ==================== 获取会议统计信息（用于显示）====================

		/*** 获取会议的统计摘要信息*/
		function getConferenceStatsForDisplay(month, grade, isReversed) {
			const stats = getMonthStats(month, grade, isReversed);
			const confInfo = getConferenceInfo(month, grade, gameState.year);
			
			// 计算影响因子
			const impactFactor = getConferenceImpactFactor({ month: month }, grade);
			
			// 计算中稿均分
			let avgAcceptedScore = '-';
			if (stats && stats.submissions >= 10) {
				const totalAccepted = (stats.poster || 0) + (stats.oral || 0) + (stats.bestPaper || 0);
				if (totalAccepted > 0 && stats.avgScorePoster) {
					const weightedSum = (stats.avgScorePoster * (stats.poster || 0)) + 
									  (stats.avgScoreOral * (stats.oral || 0)) + 
									  (stats.avgScoreBestPaper * (stats.bestPaper || 0));
					avgAcceptedScore = Math.round(weightedSum / totalAccepted);
				}
			}
			
			return {
				name: confInfo.name,
				fullName: confInfo.fullName,
				year: confInfo.year,
				submissions: stats?.submissions || 0,
				acceptRate: stats?.acceptRate || 0,
				avgAcceptedScore: avgAcceptedScore,
				impactFactor: impactFactor,
				hasEnoughData: stats && stats.submissions >= 10
			};
		}

		/**
		 * 生成会议tooltip文本
		 */
		function generateConferenceTooltip(month, grade, isReversed) {
			const info = getConferenceStatsForDisplay(month, grade, isReversed);

			let tooltip = `${info.fullName} ${info.year}`;

			// ★★★ 新增：添加会议性格信息 ★★★
			if (typeof getBaseConferencePersonality === 'function') {
				const personality = getBaseConferencePersonality(month, grade);
				const personalityDesc = getConferencePersonalityDescription(personality);
				tooltip += `\n🎭 性格: ${personalityDesc}`;
			}

			if (info.hasEnoughData) {
				tooltip += `\n━━━━━━━━━━━━`;
				tooltip += `\n📊 投稿数: ${info.submissions}`;
				tooltip += `\n✅ 录用率: ${(info.acceptRate * 100).toFixed(1)}%`;
				tooltip += `\n📈 影响因子: ${info.impactFactor.toFixed(2)}`;
				tooltip += `\n🎯 中稿均分: ${info.avgAcceptedScore}`;
			} else {
				tooltip += `\n(数据不足，暂无统计)`;
			}

			return tooltip;
		}

		/**
		 * 显示会议信息弹窗
		 */
		function showConferenceInfoModal(month, grade, isReversed) {
			const info = getConferenceStatsForDisplay(month, grade, isReversed);
			const gradeColors = { 'A': '#e74c3c', 'B': '#3498db', 'C': '#2ecc71' };
			const gradeColor = gradeColors[grade] || 'var(--primary-color)';

			let personalityHtml = '';
			if (typeof getBaseConferencePersonality === 'function') {
				const personality = getBaseConferencePersonality(month, grade);
				const personalityDesc = getConferencePersonalityDescription(personality);
				personalityHtml = `
					<div style="margin-bottom:12px;padding:8px 12px;background:rgba(155,89,182,0.1);border-radius:6px;border-left:3px solid #9b59b6;">
						<span style="font-size:0.9rem;">🎭 <strong>性格:</strong> ${personalityDesc}</span>
					</div>
				`;
			}

			let statsHtml = '';
			if (info.hasEnoughData) {
				statsHtml = `
					<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px;">
						<div style="padding:10px;background:var(--light-bg);border-radius:8px;text-align:center;">
							<div style="font-size:0.75rem;color:var(--text-secondary);">📊 投稿数</div>
							<div style="font-size:1.2rem;font-weight:700;color:var(--text-primary);">${info.submissions}</div>
						</div>
						<div style="padding:10px;background:var(--light-bg);border-radius:8px;text-align:center;">
							<div style="font-size:0.75rem;color:var(--text-secondary);">✅ 录用率</div>
							<div style="font-size:1.2rem;font-weight:700;color:var(--success-color);">${(info.acceptRate * 100).toFixed(1)}%</div>
						</div>
						<div style="padding:10px;background:var(--light-bg);border-radius:8px;text-align:center;">
							<div style="font-size:0.75rem;color:var(--text-secondary);">📈 影响因子</div>
							<div style="font-size:1.2rem;font-weight:700;color:var(--primary-color);">${info.impactFactor.toFixed(2)}</div>
						</div>
						<div style="padding:10px;background:var(--light-bg);border-radius:8px;text-align:center;">
							<div style="font-size:0.75rem;color:var(--text-secondary);">🎯 中稿均分</div>
							<div style="font-size:1.2rem;font-weight:700;color:var(--warning-color);">${info.avgAcceptedScore}</div>
						</div>
					</div>
				`;
			} else {
				statsHtml = `
					<div style="margin-top:12px;padding:15px;background:var(--light-bg);border-radius:8px;text-align:center;color:var(--text-secondary);">
						<i class="fas fa-chart-bar" style="font-size:1.5rem;margin-bottom:8px;display:block;opacity:0.5;"></i>
						数据不足，暂无统计
					</div>
				`;
			}

			const content = `
				<div style="text-align:center;margin-bottom:15px;">
					<div style="display:inline-block;padding:4px 12px;background:${gradeColor}22;color:${gradeColor};border-radius:20px;font-weight:700;font-size:0.85rem;margin-bottom:8px;">
						${grade}类会议
					</div>
					<div style="font-size:1.1rem;font-weight:600;color:var(--text-primary);">${info.fullName}</div>
					<div style="font-size:0.85rem;color:var(--text-secondary);">${info.year}</div>
				</div>
				${personalityHtml}
				${statsHtml}
			`;

			showModal(`📅 会议详情`, content, [
				{ text: '关闭', class: 'btn-primary', action: closeModal }
			]);
		}

        // ==================== 论文工作站 ====================
		
		
		
		function renderPaperSlots() {
			const container = document.getElementById('paper-slots');
			let html = '';

			// 预先获取当前月份的会议信息
			const confA = getConferenceInfo(gameState.month, 'A', gameState.year);
			const confB = getConferenceInfo(gameState.month, 'B', gameState.year);
			const confC = getConferenceInfo(gameState.month, 'C', gameState.year);

			// 在所有槽之前添加统一的会议信息栏（点击显示弹窗）
			html += `<div class="conference-info-bar">
				<div class="conference-info-title"><i class="fas fa-calendar-alt"></i> 本月可投会议</div>
				<div class="conference-info-list">
					<span class="conf-item conf-a" onclick="showConferenceInfoModal(${gameState.month}, 'A', ${gameState.isReversed})" style="cursor:pointer;">A: ${confA.name}</span>
					<span class="conf-item conf-b" onclick="showConferenceInfoModal(${gameState.month}, 'B', ${gameState.isReversed})" style="cursor:pointer;">B: ${confB.name}</span>
					<span class="conf-item conf-c" onclick="showConferenceInfoModal(${gameState.month}, 'C', ${gameState.isReversed})" style="cursor:pointer;">C: ${confC.name}</span>
				</div>
			</div>`;

			// ★★★ 初始化升级槽位数组 ★★★
			if (!gameState.upgradedSlots) gameState.upgradedSlots = [];
			if (!gameState.slotPublishedA) gameState.slotPublishedA = [false, false, false, false];

			for (let i = 0; i < 4; i++) {
				const unlocked = i < gameState.paperSlots;
				const paper = gameState.papers[i];
				const isUpgraded = gameState.upgradedSlots.includes(i);
				const canUpgrade = gameState.slotPublishedA[i] && !isUpgraded;

				if (!unlocked) {
					const req = [0, 6, 12, 18][i];
					html += `<div class="paper-slot locked">
						<div class="slot-header">
							<span class="slot-title">论文槽${i + 1}</span>
							<span class="reviewing-badge"><i class="fas fa-lock"></i> 科研${req}</span>
						</div>
					</div>`;
				} else if (!paper) {
					// ★★★ 升级槽位的空槽显示特殊样式 ★★★
					if (isUpgraded) {
						html += `<div class="paper-slot upgraded-slot" style="background:linear-gradient(135deg,#f3e8ff,#ede9fe);border:2px solid #c4b5fd;">
							<div class="slot-header">
								<span class="slot-title" style="color:#6d28d9;"><i class="fas fa-crown"></i> 期刊槽${i + 1}</span>
								<span style="font-size:0.7rem;color:#7c3aed;">📖 分数不衰减</span>
							</div>
							<button class="new-paper-btn" onclick="createNewPaper(${i})" style="background:linear-gradient(135deg,#a78bfa,#8b5cf6);color:white;border:none;">
								<i class="fas fa-plus"></i> 开启期刊论文
							</button>
						</div>`;
					} else {
						// 解锁后的空槽只显示开启按钮
						let upgradeBtn = '';
						if (canUpgrade) {
							upgradeBtn = `<button class="btn btn-warning" onclick="upgradeSlot(${i})" style="margin-top:8px;width:100%;font-size:0.75rem;">
								<i class="fas fa-arrow-up"></i> 升级为期刊槽
							</button>`;
						}
						html += `<div class="paper-slot">
							<button class="new-paper-btn" onclick="createNewPaper(${i})">
								<i class="fas fa-plus"></i> 开启新论文
							</button>
							${upgradeBtn}
						</div>`;
					}
				} else {
					const total = paper.ideaScore + paper.expScore + paper.writeScore;
					const canSubmit = paper.ideaScore > 0 && paper.expScore > 0 && paper.writeScore > 0 && !paper.reviewing;
					const reviewingBadgeClass = paper.reviewing ? `reviewing-badge grade-${paper.submittedGrade}` : '';

					let reviewingInfo = '';
					if (paper.reviewing) {
						const confName = paper.conferenceInfo ? paper.conferenceInfo.name : paper.submittedGrade + '类';
						reviewingInfo = `<span class="${reviewingBadgeClass}">${paper.submittedGrade}-${confName} ${paper.reviewMonths}月</span>`;
					}

					// ★★★ 升级槽位显示期刊投稿按钮 ★★★
					if (isUpgraded) {
						// 期刊投稿需要的分数
						const canNature = total >= 500;
						const canNatureSub = total >= 250;

						html += `<div class="paper-slot active upgraded-slot" style="background:linear-gradient(135deg,#f3e8ff,#ede9fe);border:2px solid #c4b5fd;border-left:4px solid #a78bfa;">
							<div class="slot-header">
								<span class="slot-title" style="color:#6d28d9;"><i class="fas fa-crown"></i> 期刊槽</span>
								<span style="font-size:0.65rem;color:#7c3aed;">📖 分数不衰减</span>
							</div>
							<div class="paper-title">${paper.title}</div>
							<div class="paper-scores-compact">
								<span class="score-box-inline"><span class="score-label">idea</span><span class="score-value">${paper.ideaScore}</span></span>
								<span class="score-box-inline"><span class="score-label">实验</span><span class="score-value">${paper.expScore}</span></span>
								<span class="score-box-inline"><span class="score-label">写作</span><span class="score-value">${paper.writeScore}</span></span>
								<span class="score-box-inline total" style="background:linear-gradient(135deg,#a78bfa,#8b5cf6);"><span class="score-label">总分</span><span class="score-value">${total}</span></span>
							</div>
							<div class="paper-actions-compact">
								<button class="submit-btn grade-s" onclick="submitToJournal(${i},'nature')" ${!canSubmit || !canNature?'disabled':''} title="需要500分" style="background:linear-gradient(135deg,#a78bfa,#7c3aed);color:white;${canNature?'':'opacity:0.5;'}">
									Nature(${canNature?'✓':'需500'})
								</button>
								<button class="submit-btn grade-s-sub" onclick="submitToJournal(${i},'nature-sub')" ${!canSubmit || !canNatureSub?'disabled':''} title="需要250分" style="background:linear-gradient(135deg,#93c5fd,#3b82f6);color:white;${canNatureSub?'':'opacity:0.5;'}">
									子刊(${canNatureSub?'✓':'需250'})
								</button>
								<button class="submit-btn abandon" onclick="abandonPaper(${i})" ${paper.reviewing?'disabled':''}>
									<i class="fas fa-trash"></i>
								</button>
							</div>
						</div>`;
					} else {
						// ★★★ 普通槽位：添加升级按钮 ★★★
						let upgradeBtn = '';
						if (canUpgrade && !paper.reviewing) {
							upgradeBtn = `<button class="submit-btn" onclick="upgradeSlot(${i})" style="background:linear-gradient(135deg,#f39c12,#e67e22);font-size:0.7rem;" title="升级后可投期刊">
								<i class="fas fa-arrow-up"></i>
							</button>`;
						}

						html += `<div class="paper-slot active">
							<div class="slot-header">
								${reviewingInfo}
							</div>
							<div class="paper-title">${paper.title}</div>
							<div class="paper-scores-compact">
								<span class="score-box-inline"><span class="score-label">idea</span><span class="score-value">${paper.ideaScore}</span></span>
								<span class="score-box-inline"><span class="score-label">实验</span><span class="score-value">${paper.expScore}</span></span>
								<span class="score-box-inline"><span class="score-label">写作</span><span class="score-value">${paper.writeScore}</span></span>
								<span class="score-box-inline total"><span class="score-label">总分</span><span class="score-value">${total}</span></span>
							</div>
							<div class="paper-actions-compact">
								<button class="submit-btn grade-a" onclick="submitPaper(${i},'A')" ${!canSubmit?'disabled':''}>
									投A会
								</button>
								<button class="submit-btn grade-b" onclick="submitPaper(${i},'B')" ${!canSubmit?'disabled':''}>
									投B会
								</button>
								<button class="submit-btn grade-c" onclick="submitPaper(${i},'C')" ${!canSubmit?'disabled':''}>
									投C会
								</button>
								${upgradeBtn}
								<button class="submit-btn abandon" onclick="abandonPaper(${i})" ${paper.reviewing?'disabled':''}>
									<i class="fas fa-trash"></i>
								</button>
							</div>
						</div>`;
					}
				}
			}
			container.innerHTML = html;
		}

		// ★★★ 新增：槽位升级功能 ★★★
		function upgradeSlot(slot) {
			if (!gameState.slotPublishedA[slot]) {
				showModal('❌ 无法升级', '<p>该槽位需要先发表过一篇A类论文才能升级！</p>',
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			if (gameState.upgradedSlots.includes(slot)) {
				showModal('❌ 已升级', '<p>该槽位已经升级为期刊槽！</p>',
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			showModal('⬆️ 升级论文槽',
				`<div style="text-align:center;">
					<div style="font-size:2.5rem;margin-bottom:15px;">📖</div>
					<p>确定要将<strong>论文槽${slot + 1}</strong>升级为<strong style="color:#9b59b6;">期刊槽</strong>吗？</p>
					<div style="background:linear-gradient(135deg,rgba(155,89,182,0.1),rgba(142,68,173,0.1));border-radius:10px;padding:12px;margin:15px 0;text-align:left;">
						<div style="font-size:0.85rem;font-weight:600;color:#9b59b6;margin-bottom:8px;">升级后特性：</div>
						<ul style="font-size:0.8rem;color:var(--text-secondary);margin:0;padding-left:20px;">
							<li>📖 只能投稿期刊（Nature/Nature子刊）</li>
							<li>⏳ 论文分数<strong style="color:#9b59b6;">不再衰减</strong></li>
							<li>✅ 投稿后<strong style="color:#9b59b6;">直接中稿</strong>，无审稿环节</li>
							<li>🏆 Nature需500分（25科研分，IF=12）</li>
							<li>📚 子刊需250分（10科研分，IF=6）</li>
						</ul>
					</div>
					<p style="font-size:0.8rem;color:var(--danger-color);">⚠️ 升级后无法恢复为普通槽位</p>
				</div>`,
				[
					{ text: '取消', class: 'btn-info', action: closeModal },
					{ text: '确认升级', class: 'btn-primary', action: () => {
						gameState.upgradedSlots.push(slot);
						addLog('槽位升级', `论文槽${slot + 1}升级为期刊槽`, '可投Nature/Nature子刊，分数不衰减');
						closeModal();
						renderPaperSlots();
						updateAllUI();
					}}
				]
			);
		}

		// ★★★ 新增：期刊投稿功能 ★★★
		function submitToJournal(slot, journalType) {
			const paper = gameState.papers[slot];
			if (!paper || paper.reviewing) return;

			const total = paper.ideaScore + paper.expScore + paper.writeScore;

			let requiredScore, journalName, researchScore, impactFactor;
			if (journalType === 'nature') {
				requiredScore = 500;
				journalName = 'Nature';
				researchScore = 25;
				impactFactor = 12;
			} else {
				requiredScore = 250;
				journalName = 'Nature子刊';
				researchScore = 10;
				impactFactor = 6;
			}

			if (total < requiredScore) {
				showModal('❌ 分数不足', `<p>投稿${journalName}需要论文总分≥${requiredScore}，当前总分${total}。</p>`,
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			showModal(`📖 投稿${journalName}`,
				`<div style="text-align:center;">
					<div style="font-size:2.5rem;margin-bottom:15px;">${journalType === 'nature' ? '🏆' : '📚'}</div>
					<p>确定要将论文投稿到<strong style="color:#9b59b6;">${journalName}</strong>吗？</p>
					<div style="background:linear-gradient(135deg,rgba(155,89,182,0.15),rgba(142,68,173,0.15));border-radius:10px;padding:12px;margin:15px 0;">
						<div style="font-size:0.9rem;font-weight:600;">"${paper.title}"</div>
						<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:5px;">总分：${total}</div>
					</div>
					<div style="background:var(--light-bg);border-radius:8px;padding:10px;text-align:left;font-size:0.8rem;">
						<div>📖 期刊：${journalName}</div>
						<div>🎯 科研分：+${researchScore}</div>
						<div>📈 影响因子：${impactFactor}</div>
						<div style="color:#9b59b6;font-weight:600;margin-top:5px;">✅ 直接中稿，无需审稿</div>
					</div>
				</div>`,
				[
					{ text: '取消', class: 'btn-info', action: closeModal },
					{ text: `投稿${journalName}`, class: 'btn-primary', action: () => {
						closeModal();
						handleJournalAcceptance(slot, journalType);
					}}
				]
			);
		}

		// ★★★ 新增：处理期刊中稿 ★★★
		function handleJournalAcceptance(slot, journalType) {
			const paper = gameState.papers[slot];
			if (!paper) return;

			const total = paper.ideaScore + paper.expScore + paper.writeScore;

			// ★★★ S类论文奖励参数 ★★★
			let journalName, researchScore, impactFactor, baseFavor, favorMaxBonus, baseResearchBonus, researchMaxBonus, firstResearchBonus, paperRank;
			if (journalType === 'nature') {
				journalName = 'Nature';
				researchScore = 25;
				impactFactor = 12;
				baseFavor = 6;           // 好感度+6
				favorMaxBonus = 3;       // 好感度上限+3
				baseResearchBonus = 2;   // 科研能力+2（计入衰减）
				researchMaxBonus = 4;    // 科研能力上限+4
				firstResearchBonus = 2;  // 首次发科研能力+2
				paperRank = 11;
				gameState.paperNature++;
			} else {
				journalName = 'Nature子刊';
				researchScore = 10;
				impactFactor = 6;
				baseFavor = 4;           // 好感度+4
				favorMaxBonus = 2;       // 好感度上限+2
				baseResearchBonus = 1;   // 科研能力+1（计入衰减）
				researchMaxBonus = 2;    // 科研能力上限+2
				firstResearchBonus = 1;  // 首次发科研能力+1
				paperRank = 10;
				gameState.paperNatureSub++;
			}

			// ★★★ 计算衰减：根据已发表的同级别或更高级别论文数量 ★★★
			const paperRankMap = {
				'S-Nature': 11,
				'S-Nature子刊': 10,
				'A-Best Paper': 9,
				'A-Oral': 8,
				'A-Poster': 7,
				'B-Best Paper': 6,
				'B-Oral': 5,
				'B-Poster': 4,
				'C-Best Paper': 3,
				'C-Oral': 2,
				'C-Poster': 1
			};

			const currentRank = paperRank;
			const higherOrEqualCount = gameState.publishedPapers.filter(p => {
				let pRank;
				if (p.grade === 'S') {
					pRank = p.journalType === 'nature' ? 11 : 10;
				} else {
					pRank = paperRankMap[`${p.grade}-${p.acceptType}`] || 0;
				}
				return pRank >= currentRank;
			}).length;

			// 实际奖励（含衰减）- 好感度和科研能力都计入衰减
			const favorReduction = Math.floor(higherOrEqualCount / 2);
			const actualFavorGain = Math.max(0, baseFavor - favorReduction);
			const researchReduction = Math.floor(higherOrEqualCount / 2);
			const actualResearchBonus = Math.max(0, baseResearchBonus - researchReduction);
			const hasDecay = actualFavorGain < baseFavor || actualResearchBonus < baseResearchBonus;

			// ★★★ 应用奖励 ★★★
			gameState.paperS++;
			gameState.totalScore += researchScore;

			// SAN奖励：Nature回满，子刊+15
			let sanGain = 0;
			if (journalType === 'nature') {
				sanGain = gameState.sanMax - gameState.san;
				gameState.san = gameState.sanMax;
			} else {
				sanGain = 15;
				gameState.san = Math.min(gameState.sanMax, gameState.san + 15);
			}

			// 好感度奖励和上限提升
			gameState.favorMax = (gameState.favorMax || 20) + favorMaxBonus;
			gameState.favor = Math.min(gameState.favorMax, gameState.favor + actualFavorGain);

			// 科研能力上限提升
			gameState.researchMax = (gameState.researchMax || 20) + researchMaxBonus;

			// ★★★ 科研能力奖励（含衰减） ★★★
			let totalResearchBonus = actualResearchBonus;
			let bonusResearchDetails = [];

			// 基础科研能力奖励（计入衰减）
			if (actualResearchBonus > 0) {
				bonusResearchDetails.push({ label: '发表奖励', value: actualResearchBonus, base: baseResearchBonus });
			}

			// 首次发表任何论文
			if (!gameState.firstPaperAccepted) {
				gameState.firstPaperAccepted = true;
				totalResearchBonus++;
				bonusResearchDetails.push({ label: '首次发表论文', value: 1 });
			}

			// 首次发表Nature（科研+2）
			if (journalType === 'nature' && !gameState.firstNatureAccepted) {
				gameState.firstNatureAccepted = true;
				totalResearchBonus += firstResearchBonus;
				bonusResearchDetails.push({ label: '首次发表Nature', value: firstResearchBonus });
			}

			// 首次发表Nature子刊（科研+1）
			if (journalType === 'nature-sub' && !gameState.firstNatureSubAccepted) {
				gameState.firstNatureSubAccepted = true;
				totalResearchBonus += firstResearchBonus;
				bonusResearchDetails.push({ label: '首次发表Nature子刊', value: firstResearchBonus });
			}

			if (totalResearchBonus > 0) {
				changeResearch(totalResearchBonus);
			}

			// 创建已发表论文记录
			const publishedPaper = {
				title: paper.title,
				grade: 'S',
				journalType: journalType,
				journalName: journalName,
				score: total,
				researchScore: researchScore,
				impactFactor: impactFactor,
				acceptType: journalType === 'nature' ? 'Nature' : 'Nature子刊',
				citations: 0,
				monthsSincePublish: 0,
				pendingCitationFraction: 0,
				publishedMonth: gameState.totalMonths,
				publishedYear: gameState.year,
				ideaScore: paper.ideaScore,
				expScore: paper.expScore,
				writeScore: paper.writeScore
			};

			gameState.publishedPapers.push(publishedPaper);

			// 清空槽位
			gameState.papers[slot] = null;

			// ★★★ 构建奖励显示文本 ★★★
			let rewardDetails = [];
			rewardDetails.push(`科研分 +${researchScore}`);

			// SAN奖励显示
			if (journalType === 'nature') {
				rewardDetails.push(`SAN 回满`);
			} else {
				rewardDetails.push(`SAN +15`);
			}

			// 好感度奖励显示
			if (actualFavorGain > 0) {
				let favorText = `好感度 +${actualFavorGain}`;
				if (hasDecay && actualFavorGain < baseFavor) {
					favorText += ` <span style="color:var(--text-secondary);font-size:0.7rem;">(基础${baseFavor})</span>`;
				}
				rewardDetails.push(favorText);
			}
			rewardDetails.push(`好感上限 +${favorMaxBonus}`);

			// 科研能力奖励显示
			if (totalResearchBonus > 0) {
				let researchText = `科研能力 +${totalResearchBonus}`;
				if (hasDecay && actualResearchBonus < baseResearchBonus) {
					researchText += ` <span style="color:var(--text-secondary);font-size:0.7rem;">(含衰减)</span>`;
				}
				rewardDetails.push(researchText);
			}
			rewardDetails.push(`科研上限 +${researchMaxBonus}`);

			// 显示中稿弹窗
			showModal(`🎉 ${journalName}接收！`,
				`<div style="text-align:center;">
					<div style="font-size:3rem;margin-bottom:15px;">${journalType === 'nature' ? '🏆' : '📚'}</div>
					<div style="font-size:1.2rem;font-weight:700;color:#9b59b6;margin-bottom:10px;">恭喜发表${journalName}！</div>
					<div style="background:linear-gradient(135deg,rgba(155,89,182,0.15),rgba(142,68,173,0.15));border-radius:10px;padding:15px;margin:15px 0;">
						<div style="font-size:0.9rem;font-weight:600;">"${paper.title}"</div>
						<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:8px;">
							总分：${total} | IF：${impactFactor}
						</div>
					</div>
					<div style="background:linear-gradient(135deg,rgba(46,204,113,0.1),rgba(39,174,96,0.1));border-radius:8px;padding:12px;margin-bottom:10px;">
						<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:8px;">📊 获得奖励</div>
						<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:6px;">
							${rewardDetails.map(r => `<span style="background:white;padding:4px 8px;border-radius:12px;font-size:0.75rem;color:var(--success-color);">${r}</span>`).join('')}
						</div>
						${hasDecay ? `<div style="font-size:0.7rem;color:var(--text-secondary);margin-top:8px;">※ 因已发表高级别论文，部分奖励有所衰减</div>` : ''}
					</div>
					<div style="font-size:0.85rem;color:var(--primary-color);">
						当前科研分：${gameState.totalScore}
					</div>
				</div>`,
				[{ text: '太棒了！', class: 'btn-primary', action: closeModal }]
			);

			// 日志记录
			let logDetails = `科研分+${researchScore}`;
			logDetails += journalType === 'nature' ? `，SAN回满` : `，SAN+15`;
			logDetails += `，好感+${actualFavorGain}，好感上限+${favorMaxBonus}`;
			if (totalResearchBonus > 0) logDetails += `，科研+${totalResearchBonus}`;
			logDetails += `，科研上限+${researchMaxBonus}`;

			addLog('期刊发表', `"${paper.title.substring(0, 20)}..." 发表于${journalName}`, logDetails);

			// ★★★ 记录 Nature 论文投稿数据 ★★★
			recordSubmission(
				gameState.month,
				journalType === 'nature' ? 'S' : 'S-sub',  // S = Nature正刊, S-sub = Nature子刊
				total,
				'accepted',  // Nature 直接中稿
				gameState.isReversed
			);

			renderPaperSlots();
			updateAllUI();
			updateResearchResults();
		}

        function generatePaperTitle() {
            const w = paperTitleWords;
            const templates = [
                () => `${rand(w.adjectives)} ${rand(w.nouns)} for ${rand(w.domains)} ${rand(w.verbs)}`,
                () => `${rand(w.verbs)} ${rand(w.domains)} with ${rand(w.adjectives)} ${rand(w.nouns)}`,
                () => `${rand(w.adjectives)} ${rand(w.adjectives)} ${rand(w.nouns)}`,
                () => `Towards ${rand(w.adjectives)} ${rand(w.domains)} ${rand(w.nouns)}`,
                () => `${rand(w.domains)} ${rand(w.verbs)} via ${rand(w.adjectives)} ${rand(w.nouns)}`
            ];
            return rand(templates)();
        }

        function createNewPaper(slot) {
            const title = generatePaperTitle();
            gameState.papers[slot] = {
                title: title,
                ideaScore: 0,
                expScore: 0,
                writeScore: 0,
                reviewing: false,
                reviewMonths: 0,
                submittedGrade: null,
                submittedScore: 0
            };
            addLog('新论文', `在论文槽${slot + 1}开启：${title}`);
            renderPaperSlots();
        }

        function checkResearchUnlock(silent = false) {
            // ★★★ 兼容旧存档：初始化永久解锁记录 ★★★
            if (gameState.paperSlotsUnlocked === undefined) {
                gameState.paperSlotsUnlocked = gameState.paperSlots || 1;
            }

            // 愚钝之院士转世：已全部解锁
            if (gameState.isReversed && gameState.character === 'genius') {
                gameState.paperSlots = 4;
                gameState.paperSlotsUnlocked = 4;
                return;
            }

            const thresholds = [0, 6, 12, 18];
            let newUnlock = false;

            // ★★★ 修改：检查当前科研能力应该解锁几个槽位 ★★★
            for (let i = 1; i < 4; i++) {
                if (gameState.research >= thresholds[i] && gameState.paperSlotsUnlocked <= i) {
                    // 更新永久解锁记录
                    gameState.paperSlotsUnlocked = i + 1;
                    newUnlock = true;
                }
            }

            // ★★★ 关键：paperSlots 始终使用永久解锁记录，确保不会因科研下降而重新锁定 ★★★
            gameState.paperSlots = gameState.paperSlotsUnlocked;

            if (newUnlock && !silent) {
                showModal('🎉 新论文槽解锁！',
                    `<p>恭喜！科研能力达到${gameState.research}，解锁论文槽${gameState.paperSlots}！</p>`,
                    [{ text: '太棒了！', class: 'btn-primary', action: closeModal }]);
                renderPaperSlots();
            }
        }
		
        // ==================== 操作功能 ====================
		function readPaper() {
			// ★★★ 修改：检查行动次数而非单次标志 ★★★
			if (gameState.actionCount >= gameState.actionLimit) {
				showModal('❌ 操作失败', `<p>本月行动次数已用完！（${gameState.actionCount}/${gameState.actionLimit}）</p>`, 
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			const has4K = gameState.buffs.permanent.some(b => b.type === 'read_san_reduce');
			const baseSanCost = has4K ? 1 : 2;
			const actualSanCost = Math.abs(getActualSanChange(-baseSanCost));
			
			if (gameState.san < actualSanCost) {
				const tipText = actualSanCost !== baseSanCost 
					? `<p>SAN值不足！基础消耗${baseSanCost}点，怠惰×${gameState.reversedAwakened ? 3 : 2}后需要${actualSanCost}点SAN值。</p>` 
					: `<p>SAN值不足！需要至少${baseSanCost}点SAN值。</p>`;
				showModal('❌ 操作失败', tipText, 
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			// ★★★ 修改：增加行动计数 ★★★
			gameState.actionCount++;
			gameState.actionUsed = gameState.actionCount >= gameState.actionLimit;
			gameState.readCount++;

			// ★★★ 修改：每看论文5次，idea bonus效果+1（1-5次基础，6-10次+1）★★★
			const ideaBonus = 1 + Math.floor((gameState.readCount - 1) / 5);
			gameState.buffs.temporary.push({ type: 'idea_bonus', name: `下次想idea分数+${ideaBonus}`, value: ideaBonus, permanent: false });

			// ★★★ 新增：计算下次提升的阈值 ★★★
			const currentTier = Math.floor((gameState.readCount - 1) / 5);
			const nextMilestone = (currentTier + 1) * 5 + 1;
			const nextBonus = ideaBonus + 1;

			let result = `SAN值-${actualSanCost}`;
			if (has4K) result += '（4K显示器生效）';
			if (actualSanCost !== baseSanCost) {
				result += `（怠惰×${gameState.reversedAwakened ? 3 : 2}）`;
			}
			result += `，获得临时buff：下次想idea分数+${ideaBonus}（${gameState.readCount}/${nextMilestone}次时+${nextBonus}）`;

			// ★★★ 新增：显示行动次数 ★★★
			if (gameState.actionLimit > 1) {
				result += `（行动${gameState.actionCount}/${gameState.actionLimit}）`;
			}

			if (gameState.readCount % 5 === 0) {
				changeResearch(1);
				result += `，阅读论文达到${gameState.readCount}次，科研能力+1`;
			}

			addLog('看论文', '认真阅读了学术论文', result);
			updateBuffs();
			changeSan(-baseSanCost);
		}

		function partTimeJob() {
			// ★★★ 修改：检查行动次数 ★★★
			if (gameState.actionCount >= gameState.actionLimit) {
				showModal('❌ 操作失败', `<p>本月行动次数已用完！（${gameState.actionCount}/${gameState.actionLimit}）</p>`,
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			// ★★★ 修改：先计算下次打工的档位，SAN消耗和金钱奖励都随档位提升 ★★★
			const nextWorkCount = (gameState.workCount || 0) + 1;
			const currentTier = Math.floor((nextWorkCount - 1) / 8);  // 1-8次=0档, 9-16次=1档...
			const baseSanCost = 5 + currentTier;  // 5, 6, 7, 8...
			const goldReward = 2 + currentTier;   // 2, 3, 4, 5...
			const actualSanCost = Math.abs(getActualSanChange(-baseSanCost));

			if (gameState.san < actualSanCost) {
				const tipText = actualSanCost !== baseSanCost
					? `<p>SAN值不足！基础消耗${baseSanCost}点，怠惰×${gameState.reversedAwakened ? 3 : 2}后需要${actualSanCost}点SAN值。</p>`
					: `<p>SAN值不足！需要至少${baseSanCost}点SAN值。</p>`;
				showModal('❌ 操作失败', tipText,
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			// ★★★ 修改：增加行动计数 ★★★
			gameState.actionCount++;
			gameState.actionUsed = gameState.actionCount >= gameState.actionLimit;
			gameState.workCount = nextWorkCount;

			// ★★★ 计算下次提升的阈值（9, 17, 25...）★★★
			const nextMilestone = (currentTier + 1) * 8 + 1;
			const nextGold = goldReward + 1;
			const nextSan = baseSanCost + 1;

			let result = `SAN值-${actualSanCost}`;
			if (actualSanCost !== baseSanCost) {
				result += `（怠惰×${gameState.reversedAwakened ? 3 : 2}）`;
			}
			result += `，金钱+${goldReward}（${gameState.workCount}/${nextMilestone}次时：SAN-${nextSan},金+${nextGold}）`;

			// ★★★ 新增：显示行动次数 ★★★
			if (gameState.actionLimit > 1) {
				result += `（行动${gameState.actionCount}/${gameState.actionLimit}）`;
			}

			addLog('打工', '辛苦工作赚取生活费', result);
			changeStats({ san: -baseSanCost, gold: goldReward });
		}


		function thinkIdea() {
			// ★★★ 新增：处理预购订阅（想idea时购买gemini）★★★
			processSubscriptions('idea');

			// ★★★ 修改：检查行动次数 ★★★
			if (gameState.actionCount >= gameState.actionLimit) {
				showModal('❌ 操作失败', `<p>本月行动次数已用完！（${gameState.actionCount}/${gameState.actionLimit}）</p>`,
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			// 检查debuff存在性（只在第一次生效）
			const hasExhaustion = gameState.buffs.temporary.some(b => b.type === 'idea_exhaustion');
			const hasStolen = gameState.buffs.temporary.some(b => b.type === 'idea_stolen');
			const hasSlack = gameState.buffs.temporary.some(b => b.type === 'slack_debuff');
			
			// 订阅buff（每次都生效）
			const geminiSub = gameState.buffs.temporary.find(b => b.type === 'idea_san_reduce');
			const hasGeminiSub = !!geminiSub;
			
			// SAN消耗计算
			let baseSanCost = 2;
			if (hasGeminiSub) {
				baseSanCost = Math.max(1, baseSanCost - 1);
			}
			
			const actualSanCost = Math.abs(getActualSanChange(-baseSanCost));
			
			if (gameState.san < actualSanCost) {
				const tipText = actualSanCost !== baseSanCost 
					? `<p>SAN值不足！基础消耗${baseSanCost}点，怠惰×${gameState.reversedAwakened ? 3 : 2}后需要${actualSanCost}点SAN值。</p>` 
					: `<p>SAN值不足！需要至少${baseSanCost}点SAN值。</p>`;
				showModal('❌ 操作失败', tipText, 
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			const available = gameState.papers.map((p, i) => ({ paper: p, index: i }))
				.filter(({ paper }) => paper && !paper.reviewing);
			if (available.length === 0) {
				showModal('无法操作', '<p>没有可用的论文！请先开启一篇新论文。</p>', 
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			showPaperSelectModal('想idea', available, (index) => {
				gameState.actionCount++;
				gameState.actionUsed = gameState.actionCount >= gameState.actionLimit;
				gameState.ideaClickCount = (gameState.ideaClickCount || 0) + 1;
				
				const paper = gameState.papers[index];
				const oldScore = paper.ideaScore;
				
				let times = 1 + countBuff('idea_times');
				
				// 主动技能加成
				let effectiveResearch = gameState.research;
				let skillUsed = false;
				let skillSource = '';

				// ★★★ 修改：检查是否有针对idea的技能加成 ★★★
				if (gameState.nextActionBonus > 0 && gameState.nextActionBonusType === 'idea') {
					effectiveResearch += gameState.nextActionBonus;
					skillUsed = true;
					skillSource = gameState.nextActionBonusSource === 'senior' ? '师兄师姐救我' : '导师救我';
					// ★★★ 标记论文使用了帮助技能（用于高分论文成就检测）★★★
					paper.usedHelpSkill = true;
					// 清除已使用的加成
					gameState.nextActionBonus = 0;
					gameState.nextActionBonusSource = null;
					gameState.nextActionBonusType = null;
				}
				
				// ★★★ 核心修改：新的循环逻辑 ★★★
				let currentScore = oldScore;
				let scoreChanges = [];  // 记录每次的分数变化
				
				for (let i = 0; i < times; i++) {
					// ★★★ 第一次使用所有buff，后续只使用永久buff ★★★
					const permanentOnly = (i > 0);
					let gen = calculateScoreWithResearch('idea', effectiveResearch, permanentOnly);
					
					// ★★★ 订阅加成：每次都生效 ★★★
					if (hasGeminiSub && geminiSub.bonusScore) {
						gen += geminiSub.bonusScore;
					}
					
					// ★★★ debuff：只有第一次生效 ★★★
					if (i === 0) {
						if (hasExhaustion) {
							gen = Math.floor(gen / 2);
						}
						if (hasStolen) {
							gen = Math.floor(gen / 2);
						}
						if (hasSlack) {
							gen = Math.floor(gen / 2);
						}
					}
					
					// ★★★ 每次循环都触发保底机制 ★★★
					const newScore = Math.max(gen, currentScore + 1);
					scoreChanges.push({ generated: gen, result: newScore, wasGuaranteed: gen < currentScore + 1 });
					currentScore = newScore;
				}
				
				paper.ideaScore = currentScore;
				
				// 清除已生效的debuff
				if (hasExhaustion) {
					gameState.buffs.temporary = gameState.buffs.temporary.filter(b => b.type !== 'idea_exhaustion');
				}
				if (hasStolen) {
					gameState.buffs.temporary = gameState.buffs.temporary.filter(b => b.type !== 'idea_stolen');
				}
				
				// 疲劳累积检测
				if (gameState.ideaClickCount % 5 === 0) {
					gameState.buffs.temporary.push({ 
						type: 'idea_exhaustion', 
						name: '灵感枯竭：下次想idea总分÷2', 
						value: 0.5, 
						multiply: true, 
						permanent: false 
					});
					addLog('⚠️ 疲劳累积', '灵感枯竭', '连续想idea5次，下次想idea总分除以2');
				}
				
				// 消耗临时buff
				consumeTempBuff('idea_times');
				consumeTempBuff('idea_bonus');
				
				// 构建日志
				let result = `SAN值-${actualSanCost}`;
				if (actualSanCost !== baseSanCost) {
					result += `（怠惰×${gameState.reversedAwakened ? 3 : 2}）`;
				}
				if (skillUsed) {
					result += `（${skillSource}生效！）`;
				}
				if (hasGeminiSub) result += '（Gemini: 每次+4）';
				if (hasExhaustion) result += '（首次灵感枯竭÷2）';
				if (hasStolen) result += '（首次被偷idea÷2）';
				if (hasSlack) result += '（首次松懈÷2）';
				if (times > 1) result += `（想${times}次）`;
				
				if (gameState.actionLimit > 1) {
					result += `（行动${gameState.actionCount}/${gameState.actionLimit}）`;
				}
				
				// ★★★ 显示详细的分数变化过程 ★★★
				const guaranteedCount = scoreChanges.filter(c => c.wasGuaranteed).length;
				result += `，idea分 ${oldScore} → ${currentScore}`;
				if (guaranteedCount > 0) {
					result += `（${guaranteedCount}次保底生效）`;
				}
				
				addLog('想idea', `为"${paper.title.substring(0, 15)}..."思考idea`, result);
				renderPaperSlots();
				changeSan(-baseSanCost);
				updateBuffs();
			});
		}

		function doExperiment() {
			// ★★★ 新增：处理预购订阅（做实验时购买gpt和租gpu）★★★
			processSubscriptions('experiment');

			if (gameState.actionCount >= gameState.actionLimit) {
				showModal('❌ 操作失败', `<p>本月行动次数已用完！（${gameState.actionCount}/${gameState.actionLimit}）</p>`,
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			// 检查debuff（只在第一次生效）
			const hasOverheat = gameState.buffs.temporary.some(b => b.type === 'exp_overheat');
			const hasSlack = gameState.buffs.temporary.some(b => b.type === 'slack_debuff');
			
			// 订阅buff（每次都生效）
			const gptSub = gameState.buffs.temporary.find(b => b.type === 'exp_san_reduce');
			const hasGptSub = !!gptSub;
			
			let baseSanCost = 3;
			if (hasGptSub) {
				baseSanCost = Math.max(1, baseSanCost - 1);
			}
			
			const actualSanCost = Math.abs(getActualSanChange(-baseSanCost));
			
			if (gameState.san < actualSanCost) {
				const tipText = actualSanCost !== baseSanCost 
					? `<p>SAN值不足！基础消耗${baseSanCost}点，怠惰×${gameState.reversedAwakened ? 3 : 2}后需要${actualSanCost}点SAN值。</p>` 
					: `<p>SAN值不足！需要至少${baseSanCost}点SAN值。</p>`;
				showModal('❌ 操作失败', tipText, 
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			const available = gameState.papers.map((p, i) => ({ paper: p, index: i }))
				.filter(({ paper }) => paper && !paper.reviewing && paper.ideaScore > 0);
			if (available.length === 0) {
				showModal('无法操作', '<p>没有可用的论文！需要先有idea分大于0的论文。</p>', 
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			showPaperSelectModal('做实验', available, (index) => {
				gameState.actionCount++;
				gameState.actionUsed = gameState.actionCount >= gameState.actionLimit;
				gameState.expClickCount = (gameState.expClickCount || 0) + 1;
				
				const paper = gameState.papers[index];
				const oldScore = paper.expScore;
				
				let times = 1 + countBuff('exp_times');
				
				// ★★★ 新增：技能加成 ★★★
				let effectiveResearch = gameState.research;
				let skillUsed = false;
				let skillSource = '';
				
				if (gameState.nextActionBonus > 0 && gameState.nextActionBonusType === 'exp') {
					effectiveResearch += gameState.nextActionBonus;
					skillUsed = true;
					skillSource = gameState.nextActionBonusSource === 'senior' ? '师兄师姐救我' : '导师救我';
					// ★★★ 标记论文使用了帮助技能（用于高分论文成就检测）★★★
					paper.usedHelpSkill = true;
					gameState.nextActionBonus = 0;
					gameState.nextActionBonusSource = null;
					gameState.nextActionBonusType = null;
				}

				// ★★★ 修改：使用effectiveResearch计算分数 ★★★
				let currentScore = oldScore;
				let scoreChanges = [];
				
				for (let i = 0; i < times; i++) {
					const permanentOnly = (i > 0);
					let gen = calculateScoreWithResearch('exp', effectiveResearch, permanentOnly);  // ★ 使用新函数
					
					// ★★★ 订阅加成：每次都生效 ★★★
					if (hasGptSub && gptSub.bonusScore) {
						gen += gptSub.bonusScore;
					}
					
					// ★★★ debuff：只有第一次生效 ★★★
					if (i === 0) {
						if (hasOverheat) {
							gen = Math.floor(gen / 2);
						}
						if (hasSlack) {
							gen = Math.floor(gen / 2);
						}
					}
					
					// ★★★ 每次循环都触发保底机制 ★★★
					const newScore = Math.max(gen, currentScore + 1);
					scoreChanges.push({ generated: gen, result: newScore, wasGuaranteed: gen < currentScore + 1 });
					currentScore = newScore;
				}
				
				paper.expScore = currentScore;
				
				// 清除已生效的debuff
				if (hasOverheat) {
					gameState.buffs.temporary = gameState.buffs.temporary.filter(b => b.type !== 'exp_overheat');
				}
				
				// 疲劳累积
				if (gameState.expClickCount % 5 === 0) {
					gameState.buffs.temporary.push({ 
						type: 'exp_overheat', 
						name: '主机发烫：下次做实验总分÷2', 
						value: 0.5, 
						multiply: true, 
						permanent: false 
					});
					addLog('⚠️ 疲劳累积', '主机发烫', '连续做实验5次，下次做实验总分除以2');
				}
				
				consumeTempBuff('exp_times');
				consumeTempBuff('exp_bonus');
				
				// 构建日志
				let result = `SAN值-${actualSanCost}`;
				if (actualSanCost !== baseSanCost) {
					result += `（怠惰×${gameState.reversedAwakened ? 3 : 2}）`;
				}
				if (skillUsed) {
					result += `（${skillSource}生效！）`;
				}
				if (hasGptSub) result += '（GPT: 每次+4）';
				if (hasOverheat) result += '（首次主机发烫÷2）';
				if (hasSlack) result += '（首次松懈÷2）';
				if (times > 1) result += `（做${times}次）`;
				
				if (gameState.actionLimit > 1) {
					result += `（行动${gameState.actionCount}/${gameState.actionLimit}）`;
				}
				
				const guaranteedCount = scoreChanges.filter(c => c.wasGuaranteed).length;
				result += `，实验分 ${oldScore} → ${currentScore}`;
				if (guaranteedCount > 0) {
					result += `（${guaranteedCount}次保底生效）`;
				}
				
				addLog('做实验', `为"${paper.title.substring(0, 15)}..."做实验`, result);
				renderPaperSlots();
				changeSan(-baseSanCost);
				updateBuffs();
			});
		}

		function writePaper() {
			// ★★★ 新增：处理预购订阅（写论文时购买claude）★★★
			processSubscriptions('write');

			if (gameState.actionCount >= gameState.actionLimit) {
				showModal('❌ 操作失败', `<p>本月行动次数已用完！（${gameState.actionCount}/${gameState.actionLimit}）</p>`,
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			// 检查debuff（只在第一次生效）
			const hasWritersBlock = gameState.buffs.temporary.some(b => b.type === 'write_block');
			const hasSlack = gameState.buffs.temporary.some(b => b.type === 'slack_debuff');
			
			// 订阅buff（每次都生效）
			const claudeSub = gameState.buffs.temporary.find(b => b.type === 'write_san_reduce_temp');
			const hasClaudeSub = !!claudeSub;
			
			const hasKeyboard = gameState.buffs.permanent.some(b => b.type === 'write_san_reduce');
			let baseSanCost = hasKeyboard ? 3 : 4;
			
			if (hasClaudeSub) {
				baseSanCost = Math.max(1, baseSanCost - 1);
			}
			
			const actualSanCost = Math.abs(getActualSanChange(-baseSanCost));
			
			if (gameState.san < actualSanCost) {
				const tipText = actualSanCost !== baseSanCost 
					? `<p>SAN值不足！基础消耗${baseSanCost}点，怠惰×${gameState.reversedAwakened ? 3 : 2}后需要${actualSanCost}点SAN值。</p>` 
					: `<p>SAN值不足！需要至少${baseSanCost}点SAN值。</p>`;
				showModal('❌ 操作失败', tipText, 
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			const available = gameState.papers.map((p, i) => ({ paper: p, index: i }))
				.filter(({ paper }) => paper && !paper.reviewing && paper.expScore > 0);
			if (available.length === 0) {
				showModal('无法操作', '<p>没有可用的论文！需要先有实验分大于0的论文。</p>', 
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}
			
			showPaperSelectModal('写论文', available, (index) => {
				gameState.actionCount++;
				gameState.actionUsed = gameState.actionCount >= gameState.actionLimit;
				gameState.writeClickCount = (gameState.writeClickCount || 0) + 1;
				
				const paper = gameState.papers[index];
				const oldScore = paper.writeScore;
				
				let times = 1 + countBuff('write_times');
				
				// ★★★ 新增：技能加成 ★★★
				let effectiveResearch = gameState.research;
				let skillUsed = false;
				let skillSource = '';
				
				if (gameState.nextActionBonus > 0 && gameState.nextActionBonusType === 'write') {
					effectiveResearch += gameState.nextActionBonus;
					skillUsed = true;
					skillSource = gameState.nextActionBonusSource === 'senior' ? '师兄师姐救我' : '导师救我';
					// ★★★ 标记论文使用了帮助技能（用于高分论文成就检测）★★★
					paper.usedHelpSkill = true;
					gameState.nextActionBonus = 0;
					gameState.nextActionBonusSource = null;
					gameState.nextActionBonusType = null;
				}

				// ★★★ 修改：使用effectiveResearch计算分数 ★★★
				let currentScore = oldScore;
				let scoreChanges = [];
				
				for (let i = 0; i < times; i++) {
					const permanentOnly = (i > 0);
					let gen = calculateScoreWithResearch('write', effectiveResearch, permanentOnly);  // ★ 使用新函数
					
					// ★★★ 订阅加成：每次都生效 ★★★
					if (hasClaudeSub && claudeSub.bonusScore) {
						gen += claudeSub.bonusScore;
					}
					
					// ★★★ debuff：只有第一次生效 ★★★
					if (i === 0) {
						if (hasWritersBlock) {
							gen = Math.floor(gen / 2);
						}
						if (hasSlack) {
							gen = Math.floor(gen / 2);
						}
					}
					
					// ★★★ 每次循环都触发保底机制 ★★★
					const newScore = Math.max(gen, currentScore + 1);
					scoreChanges.push({ generated: gen, result: newScore, wasGuaranteed: gen < currentScore + 1 });
					currentScore = newScore;
				}
				
				paper.writeScore = currentScore;
				
				// 清除已生效的debuff
				if (hasWritersBlock) {
					gameState.buffs.temporary = gameState.buffs.temporary.filter(b => b.type !== 'write_block');
				}
				
				// 疲劳累积
				if (gameState.writeClickCount % 5 === 0) {
					gameState.buffs.temporary.push({ 
						type: 'write_block', 
						name: '无从下笔：下次写论文总分÷2', 
						value: 0.5, 
						multiply: true, 
						permanent: false 
					});
					addLog('⚠️ 疲劳累积', '无从下笔', '连续写论文5次，下次写论文总分除以2');
				}
				
				consumeTempBuff('write_times');
				consumeTempBuff('write_bonus');
				
				// 构建日志
				let result = `SAN值-${actualSanCost}`;
				if (actualSanCost !== baseSanCost) {
					result += `（怠惰×${gameState.reversedAwakened ? 3 : 2}）`;
				}
				if (skillUsed) {
					result += `（${skillSource}生效！）`;
				}
				if (hasKeyboard) result += '（机械键盘生效）';
				if (hasClaudeSub) result += '（Claude: 每次+4）';
				if (hasWritersBlock) result += '（首次无从下笔÷2）';
				if (hasSlack) result += '（首次松懈÷2）';
				if (times > 1) result += `（写${times}次）`;
				
				if (gameState.actionLimit > 1) {
					result += `（行动${gameState.actionCount}/${gameState.actionLimit}）`;
				}
				
				const guaranteedCount = scoreChanges.filter(c => c.wasGuaranteed).length;
				result += `，写作分 ${oldScore} → ${currentScore}`;
				if (guaranteedCount > 0) {
					result += `（${guaranteedCount}次保底生效）`;
				}
				
				addLog('写论文', `为"${paper.title.substring(0, 15)}..."写作`, result);
				renderPaperSlots();
				changeSan(-baseSanCost);
				updateBuffs();
			});
		}

		// ★★★ 修改：支持自定义科研值 + permanentOnly ★★★
		function calculateScoreWithResearch(type, customResearch, permanentOnly = false) {
			const base = customResearch * (0.5 + Math.random());
			const randomBonus = Math.floor(Math.random() * 6);
			let score = Math.round(base + randomBonus);

			let bonus = 0, multiplier = 1;
			const buffType = type + '_bonus';
			
			const buffsToCheck = permanentOnly 
				? gameState.buffs.permanent 
				: [...gameState.buffs.permanent, ...gameState.buffs.temporary];
			
			buffsToCheck.forEach(b => {
				if (b.type === buffType) {
					if (b.multiply) {
						multiplier += (b.value - 1);
					} else {
						bonus += b.value;
					}
				}
			});
			
			multiplier = Math.max(0, multiplier);
			return Math.max(0, Math.round(score * multiplier + bonus));
		}

		// ★★★ 修改：增加 permanentOnly 参数 ★★★
		function calculateScore(type, permanentOnly = false) {
			const base = gameState.research * (0.5 + Math.random());
			const randomBonus = Math.floor(Math.random() * 6);
			let score = Math.round(base + randomBonus);

			let bonus = 0, multiplier = 1;
			const buffType = type + '_bonus';
			
			// ★★★ 根据参数决定使用哪些buff ★★★
			const buffsToCheck = permanentOnly 
				? gameState.buffs.permanent 
				: [...gameState.buffs.permanent, ...gameState.buffs.temporary];
			
			buffsToCheck.forEach(b => {
				if (b.type === buffType) {
					if (b.multiply) {
						multiplier += (b.value - 1);
					} else {
						bonus += b.value;
					}
				}
			});
			
			multiplier = Math.max(0, multiplier);
			return Math.max(0, Math.round(score * multiplier + bonus));
		}

        function countBuff(type) {
            let count = 0;
            [...gameState.buffs.permanent, ...gameState.buffs.temporary].forEach(b => {
                if (b.type === type) count += b.value;
            });
            return count;
        }

        function consumeTempBuff(type) {
            gameState.buffs.temporary = gameState.buffs.temporary.filter(b => b.type !== type);
        }
		
        
		// ==================== 新增：统一审稿事件队列系统 ====================

		/**
		 * 开始处理本月的审稿结果
		 * @param {Array} slots - 待处理的审稿槽位索引数组（已按顺序）
		 * @param {Function} onComplete - 所有审稿和开会处理完成后的回调
		 */
		function startReviewProcessing(slots, onComplete) {
			if (!slots || slots.length === 0) {
				if (onComplete) onComplete();
				return;
			}
			
			// 初始化处理状态
			gameState._reviewProcessing = {
				pendingSlots: [...slots],        // 待处理的审稿槽位（按顺序）
				acceptedByConference: {},        // 按会议分组的中稿论文 { confKey: { confInfo, confLocation, papers: [] } }
				pendingConferences: [],          // 待处理的开会事件
				onComplete: onComplete           // 完成回调
			};
			
			// 开始处理第一个审稿结果
			processNextReviewInQueue();
		}

		/**
		 * 处理队列中的下一个审稿结果
		 */
		function processNextReviewInQueue() {
			const state = gameState._reviewProcessing;
			if (!state) return;
			
			if (state.pendingSlots.length === 0) {
				// 所有审稿结果已处理，开始处理开会事件
				prepareConferencesInQueue();
				return;
			}
			
			const slotIdx = state.pendingSlots.shift();
			const paper = gameState.papers[slotIdx];
			
			if (paper && paper.reviewing) {
				processPaperResult(slotIdx);
			} else {
				// 槽位已不在审稿状态，跳过处理下一个
				processNextReviewInQueue();
			}
		}

		/**
		 * 记录中稿论文的会议信息（在handlePaperAccepted中调用）
		 */
		function recordAcceptedPaperConference(paper, grade, acceptType) {
			const state = gameState._reviewProcessing;
			if (!state) return;
			
			const confInfo = paper.conferenceInfo || getConferenceInfo(paper.submittedMonth || gameState.month, grade, gameState.year);
			const confLocation = paper.conferenceLocation || getConferenceLocation(paper.title);
			
			// 生成会议唯一标识
			const confKey = `${confInfo.name}_${confInfo.year}`;
			
			if (!state.acceptedByConference[confKey]) {
				state.acceptedByConference[confKey] = {
					confInfo: confInfo,
					confLocation: confLocation,
					grade: grade,
					papers: []
				};
			}
			
			state.acceptedByConference[confKey].papers.push({
				title: paper.title,
				grade: grade,
				acceptType: acceptType
			});
		}

		/**
		 * 准备开会事件队列
		 */
		function prepareConferencesInQueue() {
			const state = gameState._reviewProcessing;
			if (!state) return;
			
			const conferences = Object.values(state.acceptedByConference);
			
			// 检查一箭双雕成就
			conferences.forEach(conf => {
				if (conf.papers.length >= 2) {
					if (!gameState.achievementConditions) {
						gameState.achievementConditions = {};
					}
					gameState.achievementConditions.twoInOneConference = true;
				}
			});
			
			// 存储待处理的会议
			state.pendingConferences = conferences;
			
			// 开始处理开会事件
			processNextConferenceInQueue();
		}

		/**
		 * 处理队列中的下一个开会事件
		 */
		function processNextConferenceInQueue() {
			const state = gameState._reviewProcessing;
			if (!state) return;
			
			if (!state.pendingConferences || state.pendingConferences.length === 0) {
				// 所有开会事件已处理，完成审稿流程
				finishReviewProcessing();
				return;
			}
			
			const conf = state.pendingConferences.shift();
			// 显示合并后的开会选择弹窗
			showConferenceModalMerged(conf);
		}

		/**
		 * 完成审稿处理流程
		 */
		function finishReviewProcessing() {
			const state = gameState._reviewProcessing;
			const onComplete = state ? state.onComplete : null;
			
			// 清理处理状态
			delete gameState._reviewProcessing;
			
			// 执行完成回调（触发月末事件）
			if (onComplete) {
				setTimeout(onComplete, 100);
			}
		}

		/**
		 * 显示合并后的开会选择弹窗（支持同一会议多篇论文）
		 */
		function showConferenceModalMerged(confData) {
			const { confInfo, confLocation, papers, grade } = confData;
			const paperCount = papers.length;
			const isMultiple = paperCount >= 2;
			
			const favorCost = gameState.favor >= 6 ? 1 : 2;
			const proxyCost = gameState.social >= 6 ? 0 : 1;

			const favorText = gameState.favor >= 6 
				? '👨‍🏫 导师报销（好感度-1）' 
				: '👨‍🏫 导师报销（好感度-2）';
			const proxyText = gameState.social >= 6 
				? '👥 请同学代参加（免费）' 
				: '👥 请人代参加（金钱-1）';

			// 构建论文列表显示
			let papersListHtml = '';
			if (isMultiple) {
				papersListHtml = `
				<div style="margin:12px 0;padding:10px;background:linear-gradient(135deg,rgba(253,203,110,0.2),rgba(0,184,148,0.2));border-radius:8px;border:1px solid rgba(253,203,110,0.4);">
					<div style="font-size:0.85rem;font-weight:600;color:#d68910;margin-bottom:8px;">
						🏹 一箭双雕！同一会议中了${paperCount}篇论文
					</div>
					<div style="font-size:0.8rem;color:var(--text-secondary);">
						${papers.map((p, i) => `${i + 1}. ${p.title.substring(0, 25)}... (${p.grade}类-${p.acceptType})`).join('<br>')}
					</div>
				</div>`;
			}

			showModal('🎓 开会选择', 
				`<p>恭喜！${isMultiple ? `${paperCount}篇` : ''}论文被接收！需要参加学术会议进行展示。</p>
				 <div style="margin:15px 0;padding:12px;background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(162,155,254,0.1));border-radius:10px;border:1px solid rgba(108,92,231,0.2);">
					 <div style="font-size:0.9rem;font-weight:600;color:var(--primary-color);margin-bottom:5px;">📍 会议信息</div>
					 <div style="font-size:1rem;font-weight:700;">${confInfo.name} ${confInfo.year}</div>
					 <div style="font-size:0.85rem;color:var(--text-secondary);">${confInfo.fullName}</div>
					 <div style="font-size:0.85rem;margin-top:5px;">📌 ${confLocation.city}, ${confLocation.country}</div>
				 </div>
				 ${papersListHtml}
				 <p>请选择参会方式：</p>`, 
				[
				{ text: '💰 自己出钱（金钱-4）', class: 'btn-warning', action: () => {
					addLog('开会', `自费参加 ${confInfo.name} ${confInfo.year} @ ${confLocation.city}`, `金钱-4${isMultiple ? `，展示${paperCount}篇论文` : ''}`);
					closeModal();
					if (changeGold(-4)) {
						setTimeout(() => showConferenceEventModalMerged(confInfo, confLocation, papers), 200);
					} else {
						// 金钱不足导致游戏结束
						processNextConferenceInQueue();
					}
				}},
				{ text: favorText, class: 'btn-info', action: () => {
					const result = gameState.favor >= 6 
						? '导师爽快报销，好感度-1' 
						: '导师好感度-2';
					addLog('开会', `导师报销参加 ${confInfo.name} ${confInfo.year} @ ${confLocation.city}`, `${result}${isMultiple ? `，展示${paperCount}篇论文` : ''}`);
					closeModal();
					if (changeFavor(-favorCost)) {
						setTimeout(() => showConferenceEventModalMerged(confInfo, confLocation, papers), 200);
					} else {
						// 好感度不足导致游戏结束
						processNextConferenceInQueue();
					}
				}},
				{ text: proxyText, class: 'btn-primary', action: () => {
					if (gameState.social >= 6) {
						addLog('开会', `请同学代为参加 ${confInfo.name} ${confInfo.year}`, '同学义气帮忙，免费');
					} else {
						addLog('开会', `请人代为参加 ${confInfo.name} ${confInfo.year}`, '金钱-1');
						changeGold(-proxyCost);
					}
					closeModal();
					// 代参加不触发开会事件，直接处理下一个
					processNextConferenceInQueue();
				}}
			]);
		}

		/**
		 * 显示合并后的开会事件弹窗（支持同一会议多篇论文）
		 */
		function showConferenceEventModalMerged(confInfo, confLocation, papers) {
			const isMultiple = papers.length >= 2;
			const confString = `${confInfo.name} ${confInfo.year} @ ${confLocation.city}, ${confLocation.country}`;
			
			// 获取论文最高等级
			const gradeOrder = { 'A': 3, 'B': 2, 'C': 1 };
			let highestGrade = 'C';
			papers.forEach(p => {
				if (gradeOrder[p.grade] > gradeOrder[highestGrade]) {
					highestGrade = p.grade;
				}
			});
			const grade = highestGrade;
			
			// ==================== 定义基础选项（C类可用，不需要任何条件）====================
			const baseOptions = [
				{ text: '🏖️ 顺便旅游', fn: () => { 
					gameState.tourCount++;
					addLog('开会事件', `在${confLocation.city}顺便旅游`, 'SAN值+6');
					return changeSan(6);
				}},
				{ text: '☕ 茶歇+晚宴', fn: () => { 
					gameState.teaBreakCount++;
					addLog('开会事件', '茶歇+晚宴', 'SAN值+1，社交能力+1');
					return changeStats({ san: 1, social: 1 });
				}},
				{ text: '🔬 同行交流', fn: () => { 
					gameState.buffs.temporary.push({ type: 'exp_times', name: '下次做实验多做3次', value: 3, permanent: false }); 
					addLog('开会事件', '同行交流', '临时buff-下次做实验多做3次');
					updateBuffs();
					return true;
				}},
				{ text: '💡 广泛交流', fn: () => { 
					gameState.buffs.temporary.push({ type: 'idea_times', name: '下次想idea多想3次', value: 3, permanent: false }); 
					addLog('开会事件', '广泛交流', '临时buff-下次想idea多想3次');
					updateBuffs();
					return true;
				}},
				{ text: '🤝 找同学合作', fn: () => { 
					gameState.buffs.temporary.push({ type: 'exp_bonus', name: '下次做实验分数+5', value: 5, permanent: false }); 
					addLog('开会事件', '找同学合作', '临时buff-下次做实验分数+5');
					updateBuffs();
					return true;
				}},
				{ text: '🌟 找大牛交流', fn: () => { 
					gameState.buffs.temporary.push({ type: 'idea_bonus', name: '下次想idea分数×1.25', value: 1.25, multiply: true, permanent: false }); 
					gameState.metBigBull = true;
					addLog('开会事件', '找大牛交流', '临时buff-下次想idea分数×1.25');
					updateBuffs();
					return true;
				}},
				// 找企业交流是基础选项
				{ text: '🏢 找企业交流', fn: () => { 
					gameState.enterpriseCount = (gameState.enterpriseCount || 0) + 1;
					gameState.buffs.temporary.push({ type: 'exp_bonus', name: '下次做实验分数×1.25', value: 1.25, multiply: true, permanent: false }); 
					addLog('开会事件', '找企业交流', `临时buff-下次做实验分数×1.25（第${gameState.enterpriseCount}次）`);
					updateBuffs();
					
					if (gameState.enterpriseCount >= 3 && !gameState.ailabInternship && !gameState.permanentlyBlockedInternship) {
						setTimeout(() => showAILabInternshipModal(), 300);
					}
					return true;
				}}
			];

			// ==================== 定义高级选项（需要社交≥6）====================
			const advancedOptions = [];
			
			if (gameState.social >= 6) {
				// 找大牛合作
				if (!gameState.metBigBullCoop) {
					advancedOptions.push({ 
						text: '🎓 找大牛合作', 
						fn: () => { 
							gameState.buffs.temporary.push({ type: 'write_bonus', name: '下次写论文分数+8', value: 8, permanent: false }); 
							gameState.metBigBull = true;
							gameState.metBigBullCoop = true;
							addLog('开会事件', '【社交>=6】找大牛合作', '临时buff-下次写论文分数+8，社交能力+1');
							updateBuffs();
							return changeSocial(1);
						},
						category: 'advanced'
					});
				}
				
				// 和活泼的异性学者交流
				if (!gameState.metBeautiful && !gameState.permanentlyBlockedBeautifulLover && !gameState.hasLover) {
					advancedOptions.push({ 
						text: '💕 和活泼的异性学者交流', 
						fn: () => { 
							gameState.metBeautiful = true;
							gameState.beautifulCount = 1;
							addLog('开会事件', '【社交>=6】和活泼的异性学者交流', 'SAN值+5，社交能力+1');
							return changeStats({ san: 5, social: 1 });
						},
						category: 'advanced'
					});
				}
				
				// 和聪慧的异性学者交流
				if (!gameState.metSmart && !gameState.permanentlyBlockedSmartLover && !gameState.hasLover) {
					advancedOptions.push({ 
						text: '🧠 和聪慧的异性学者交流', 
						fn: () => { 
							gameState.buffs.temporary.push({ type: 'idea_times', name: '下次想idea多想2次', value: 2, permanent: false });
							gameState.metSmart = true;
							gameState.smartCount = 1;
							addLog('开会事件', '【社交>=6】和聪慧的异性学者交流', 'SAN值+1，社交能力+1，临时buff-下次想idea多想2次');
							updateBuffs();
							return changeStats({ san: 1, social: 1 });
						},
						category: 'advanced'
					});
				}
			}

			// ==================== 定义后续选项（需要触发过对应高级选项 + 满足能力要求）====================
			const followUpOptions = [];
			
			// 和上次那个大牛深入合作（需要科研≥12）
			if (gameState.research >= 12 && gameState.metBigBullCoop && !gameState.bigBullCooperation && !gameState.permanentlyBlockedBigBullCoop) {
				followUpOptions.push({ 
					text: '🌟 和上次那个大牛深入合作', 
					fn: () => {
						gameState.buffs.temporary.push({ type: 'write_bonus', name: '下次写论文分数+8', value: 8, permanent: false });
						gameState.bigBullDeepCount = (gameState.bigBullDeepCount || 0) + 1;
						addLog('开会事件', '【科研>=12】和上次那个大牛深入合作', '临时buff-下次写论文分数+8');
						updateBuffs();
						if (gameState.bigBullDeepCount >= 2 && !gameState.permanentlyBlockedBigBullCoop) {
							setTimeout(showBigBullCoopModal, 300);
						}
						return true;
					},
					category: 'followUp'
				});
			}

			// 和上次那个活泼的异性学者交流（需要社交≥12）
			if (gameState.social >= 12 && gameState.metBeautiful && !gameState.hasLover && !gameState.permanentlyBlockedBeautifulLover) {
				followUpOptions.push({ 
					text: '💕 和上次那个活泼的异性学者交流', 
					fn: () => {
						gameState.beautifulCount = (gameState.beautifulCount || 0) + 1;
						addLog('开会事件', '【社交>=12】和上次那个活泼的异性学者交流', 'SAN值+8，SAN值上限+3');
						gameState.sanMax += 3;
						changeSan(8);
						if (gameState.beautifulCount >= 2 && !gameState.permanentlyBlockedBeautifulLover) {
							setTimeout(() => showLoverModal('beautiful'), 300);
						}
						return true;
					},
					category: 'followUp'
				});
			}

			// 和上次那个聪慧的异性学者交流（需要社交≥12）
			if (gameState.social >= 12 && gameState.metSmart && !gameState.hasLover && !gameState.permanentlyBlockedSmartLover) {
				followUpOptions.push({ 
					text: '🧠 和上次那个聪慧的异性学者交流', 
					fn: () => {
						gameState.smartCount = (gameState.smartCount || 0) + 1;
						addLog('开会事件', '和【社交>=12】上次那个聪慧的异性学者交流', 'SAN值+1，科研能力+1');
						changeSan(1);
						changeResearch(1);
						if (gameState.smartCount >= 2 && !gameState.permanentlyBlockedSmartLover) {
							setTimeout(() => showLoverModal('smart'), 300);
						}
						return true;
					},
					category: 'followUp'
				});
			}

			// ==================== 根据会议等级选择选项 ====================
			let selected = [];
			
			if (grade === 'C') {
				selected = shuffle(baseOptions).slice(0, 3);
			} else if (grade === 'B') {
				const allOptions = [...baseOptions, ...advancedOptions, ...followUpOptions];
				selected = shuffle(allOptions).slice(0, 4);
			} else if (grade === 'A') {
				const highPriorityOptions = [...advancedOptions, ...followUpOptions];
				const allOptions = [...baseOptions, ...advancedOptions, ...followUpOptions];
				
				const shuffledHighPriority = shuffle(highPriorityOptions);
				const shuffledAll = shuffle(allOptions);
				
				const usedTexts = new Set();
				
				for (let i = 0; i < Math.min(2, shuffledHighPriority.length); i++) {
					selected.push(shuffledHighPriority[i]);
					usedTexts.add(shuffledHighPriority[i].text);
				}
				
				if (selected.length < 2) {
					for (const opt of shuffledAll) {
						if (!usedTexts.has(opt.text)) {
							selected.push(opt);
							usedTexts.add(opt.text);
							if (selected.length >= 2) break;
						}
					}
				}
				if (selected.length === 0) {
					selected = shuffle(baseOptions).slice(0, 4);
				}
				
				while (selected.length < 4) {
					const allOptions = [...baseOptions, ...advancedOptions, ...followUpOptions];
					const usedTexts = new Set(selected.map(s => s.text));
					let found = false;
					for (const opt of shuffle(allOptions)) {
						if (!usedTexts.has(opt.text)) {
							selected.push(opt);
							found = true;
							break;
						}
					}
					if (!found) break;
				}
			}
			// 显示弹窗
			showModal(`🎉 ${confString}`, 
				`<div style="margin-bottom:15px;">
					<p>你来到了<strong>${confLocation.city}</strong>参加<strong>${confInfo.name}</strong>（${grade}类）${isMultiple ? `，展示了${papers.length}篇论文` : ''}，在学术会议上，你可以选择：</p>
				</div>`, 
				selected.map(opt => ({
					text: opt.text, class: 'btn-primary', action: () => {
						closeModal();
						opt.fn();
						setTimeout(() => processNextConferenceInQueue(), 100);
					}
				}))
			);
		}		
		
