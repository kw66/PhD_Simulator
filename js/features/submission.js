		// ==================== 论文投稿与审稿 ====================
		function submitPaper(slot, grade) {
			const paper = gameState.papers[slot];
			if (!paper || paper.reviewing) return;
			if (paper.ideaScore <= 0 || paper.expScore <= 0 || paper.writeScore <= 0) return;

			const confInfo = getConferenceInfo(gameState.month, grade, gameState.year);
			const location = getConferenceLocation(paper.title);

			paper.reviewing = true;
			paper.reviewMonths = 4;
			paper.submittedGrade = grade;
			paper.submittedScore = paper.ideaScore + paper.expScore + paper.writeScore;
			paper.submittedMonth = gameState.month;
			paper.conferenceInfo = confInfo;
			paper.conferenceLocation = location;

			// ✅ 新增：保存投稿时的分数快照
			paper.submittedIdeaScore = paper.ideaScore;
			paper.submittedExpScore = paper.expScore;
			paper.submittedWriteScore = paper.writeScore;
			// ★★★ 新增：初始化累计衰减 ★★★
			paper.totalIdeaDecay = 0;
			paper.totalExpDecay = 0;

            const currentReviews = gameState.papers.filter(p => p?.reviewing).length;
            gameState.maxConcurrentReviews = Math.max(gameState.maxConcurrentReviews || 0, currentReviews);

            // ★★★ 新增：记录投稿统计和里程碑 ★★★
            gameState.totalSubmissions = (gameState.totalSubmissions || 0) + 1;
            if (gameState.totalSubmissions === 1) {
                addCareerMilestone('first_submit', '第一次投稿', `${confInfo.name}（${grade}类）`);
            }

            // ★★★ 修改日志，显示会议名称 ★★★
            addLog('投稿', `将"${paper.title.substring(0, 15)}..."投至${confInfo.name} ${confInfo.year}（${grade}类）`, `总分${paper.submittedScore}，进入4个月审稿期`);
            renderPaperSlots();
        }

        function abandonPaper(slot) {
            const paper = gameState.papers[slot];
            if (!paper || paper.reviewing) return;
            
            showModal('确认放弃', '<p>确定要放弃这篇论文吗？所有进度将丢失！</p>', [
                { text: '取消', class: 'btn-info', action: closeModal },
                { text: '确定放弃', class: 'btn-danger', action: () => {
                    addLog('放弃论文', `放弃了"${paper.title.substring(0, 15)}..."`, '论文槽已清空');
                    gameState.papers[slot] = null;
                    closeModal();
                    renderPaperSlots();
                }}
            ]);
        }
		
		function generateReviewer() {
			// ★★★ 社交达人觉醒后使用固定的概率分布 ★★★
			if (gameState.socialAwakened && gameState.reviewerDistribution) {
				const dist = gameState.reviewerDistribution;
				
				const r = Math.random();
				let cumulative = 0;
				
				cumulative += dist.normal;
				if (r < cumulative) return { type: 'normal', name: '普通审稿人' };
				
				cumulative += dist.kind;
				if (r < cumulative) return { type: 'kind', name: '心软审稿人' };
				
				cumulative += dist.expert;
				if (r < cumulative) return { type: 'expert', name: '资深大牛' };
				
				cumulative += dist.hostile;
				if (r < cumulative) return { type: 'hostile', name: '恶意小同行' };
				
				cumulative += dist.gpt;
				if (r < cumulative) return { type: 'gpt', name: 'GPT审稿人' };
				
				return { type: 'questions', name: '39个问题审稿人' };
			}
			
			// 默认分布
			const r = Math.random();
			if (r < 0.40) return { type: 'normal', name: '普通审稿人' };
			if (r < 0.50) return { type: 'kind', name: '心软审稿人' };
			if (r < 0.60) return { type: 'expert', name: '资深大牛' };
			if (r < 0.70) return { type: 'hostile', name: '恶意小同行' };
			if (r < 0.90) return { type: 'gpt', name: 'GPT审稿人' };
			return { type: 'questions', name: '39个问题审稿人' };
		}


		function handlePaperAccepted(paper, grade, acceptType, slot, extraInfo) {
			// ★★★ 新增：记录投稿历史（用于百发百中成就）★★★
			gameState.submissionHistory = gameState.submissionHistory || [];
			gameState.submissionHistory.push({
				title: paper.title,
				grade: grade,
				accepted: true,
				month: extraInfo?.submittedMonth || gameState.month,
				year: gameState.year
			});

			// ★★★ 新增：更新中稿统计 ★★★
			gameState.totalAccepts = (gameState.totalAccepts || 0) + 1;

			// ★★★ 新增：检查并应用引用倍增buff ★★★
			let citationBuff = 1;
			const citationMultiplyBuff = gameState.buffs.temporary.find(b => b.type === 'citation_multiply');
			if (citationMultiplyBuff) {
				citationBuff = citationMultiplyBuff.value;
				gameState.buffs.temporary = gameState.buffs.temporary.filter(b => b.type !== 'citation_multiply');
				addLog('Buff生效', '同门合作', `本篇论文引用速度+${(citationBuff-1)*100}%（与推广加成叠加）`);
			}

			const scoreMap = { 'A': 4, 'B': 2, 'C': 1 };
			const sanGain = {
				'A': { 'Poster': 6, 'Oral': 8, 'Best Paper': 12 },
				'B': { 'Poster': 3, 'Oral': 4, 'Best Paper': 5 },
				'C': { 'Poster': 2, 'Oral': 2, 'Best Paper': 3 }
			};
			const favorGain = {
				'A': { 'Poster': 2, 'Oral': 3, 'Best Paper': 4 },
				'B': { 'Poster': 1, 'Oral': 1, 'Best Paper': 2 },
				'C': { 'Poster': 0, 'Oral': 0, 'Best Paper': 1 }
			};

			const paperRankMap = {
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

			const currentRank = paperRankMap[`${grade}-${acceptType}`];

			const higherOrEqualCount = gameState.publishedPapers.filter(p => {
				const pRank = paperRankMap[`${p.grade}-${p.acceptType}`];
				return pRank >= currentRank;
			}).length;

			const baseSan = sanGain[grade][acceptType];
			const baseFavor = favorGain[grade][acceptType];

			const actualSanGain = Math.max(1, baseSan - higherOrEqualCount);
			const favorReduction = Math.floor(higherOrEqualCount / 2);
			const actualFavorGain = baseFavor > 0 ? Math.max(0, baseFavor - favorReduction) : 0;

			const hasDecay = actualSanGain < baseSan || actualFavorGain < baseFavor;

			gameState.san = Math.min(gameState.sanMax, gameState.san + actualSanGain);
			gameState.favor = Math.min(20, gameState.favor + actualFavorGain);
			gameState.totalScore += scoreMap[grade];

			if (grade === 'A') {
				gameState.paperA++;
				// ★★★ 新增：标记该槽位已发表过A类论文（用于槽位升级）★★★
				if (!gameState.slotPublishedA) gameState.slotPublishedA = [false, false, false, false];
				gameState.slotPublishedA[slot] = true;
			}
			else if (grade === 'B') gameState.paperB++;
			else gameState.paperC++;

			let bonusResearch = 0;
			if (!gameState.firstPaperAccepted) {
				gameState.firstPaperAccepted = true;
				bonusResearch++;
				addLog('首次发表论文', '科研能力+1', '首次发表论文奖励');
				// ★★★ 新增：记录第一次中稿里程碑 ★★★
				const confInfo = paper.conferenceInfo || getConferenceInfo(gameState.month, grade, gameState.year);
				addCareerMilestone('first_accept', '第一篇论文接收', `${confInfo.name}（${grade}类 ${acceptType}）`);
			}
			if (grade === 'A' && !gameState.firstAPaperAccepted) {
				gameState.firstAPaperAccepted = true;
				bonusResearch++;
				addLog('首次发表A类论文', '科研能力+1', '首次发表A类论文奖励');
				// ★★★ 新增：记录第一次A类里程碑 ★★★
				const confInfo = paper.conferenceInfo || getConferenceInfo(gameState.month, grade, gameState.year);
				addCareerMilestone('first_A', '第一篇A类论文', `${confInfo.name}（${acceptType}）`);
			}
			if (acceptType === 'Best Paper' && !gameState.firstBestPaperAccepted) {
				gameState.firstBestPaperAccepted = true;
				bonusResearch++;
				addLog('首次发表Best Paper', '科研能力+1', '首次发表Best Paper奖励');
				// ★★★ 新增：记录第一次Best Paper里程碑 ★★★
				const confInfo = paper.conferenceInfo || getConferenceInfo(gameState.month, grade, gameState.year);
				addCareerMilestone('first_best_paper', '第一个Best Paper', `${confInfo.name}（${grade}类）`);
			}
			// ★★★ 新增：记录第一次Oral ★★★
			if (acceptType === 'Oral' && !gameState.firstOralMonth) {
				gameState.firstOralMonth = gameState.totalMonths;
				const confInfo = paper.conferenceInfo || getConferenceInfo(gameState.month, grade, gameState.year);
				addCareerMilestone('first_oral', '第一个Oral', `${confInfo.name}（${grade}类）`);
			}
			if (grade === 'A' && acceptType === 'Best Paper' && !gameState.firstABestPaperAccepted) {
				gameState.firstABestPaperAccepted = true;
				bonusResearch++;
				addLog('首次发表A类Best Paper', '科研能力+1', '首次发表A类Best Paper奖励');
				// ★★★ 新增：记录A类Best Paper里程碑 ★★★
				const confInfo = paper.conferenceInfo || getConferenceInfo(gameState.month, grade, gameState.year);
				addCareerMilestone('first_A_best_paper', 'A类Best Paper', `${confInfo.name} - 学术巅峰！`);
			}
			if (bonusResearch > 0) {
				changeResearch(bonusResearch);
			}

			gameState.consecutiveAccepts = (gameState.consecutiveAccepts || 0) + 1;
			
			if (gameState.consecutiveAccepts >= 3) {
				gameState.buffs.temporary.push({ 
					type: 'slack_debuff', 
					name: '松懈：下月所有操作总分÷2', 
					value: 0.5, 
					multiply: true, 
					permanent: false,
					expiresOnRest: true
				});
				addLog('⚠️ 志得意满', '连续中稿3篇', '获得松懈debuff，下月想idea/做实验/写论文总分÷2（休息一个月可消除）');
				gameState.consecutiveAccepts = 0;
			}

			const finalScore = paper.submittedScore || (paper.ideaScore + paper.expScore + paper.writeScore);

			// ★★★ 记录录取数据 ★★★
			const resultStr = acceptType.toLowerCase().replace(/\s+/g, '_');
			recordSubmission(
				extraInfo?.submittedMonth || gameState.month,
				grade,
				paper.submittedScore,
				resultStr,
				gameState.isReversed
			);
			
			gameState.publishedPapers.push({
				title: paper.title,
				grade,
				acceptType,
				score: finalScore,
				citations: 0,
				monthsSincePublish: 0,
				promotions: { arxiv: false, github: false, xiaohongshu: false, quantumbit: false },
				citationMultiplier: citationBuff,
				pendingCitationFraction: 0,
				conferenceInfo: paper.conferenceInfo ? {
					...paper.conferenceInfo,
					month: paper.submittedMonth || gameState.month
				} : {
					name: grade + '类会议',
					year: getRealYear(gameState.year, gameState.month),
					month: paper.submittedMonth || gameState.month
				},
				conferenceLocation: paper.conferenceLocation
			});

			if (gameState.publishedPapers.length === 1 && !gameState.availableRandomEvents.includes(14)) {
				gameState.availableRandomEvents.push(14);
				addLog('系统', '新事件解锁', '指导师弟师妹事件已解锁');
			}

			gameState.paperTypeCollection = gameState.paperTypeCollection || new Set();
			gameState.paperTypeCollection.add(`${grade}-${acceptType}`);

			// ★★★ 修改日志，显示会议名称 ★★★
			const confInfo = paper.conferenceInfo || getConferenceInfo(gameState.month, grade, gameState.year);
			let result = `SAN+${actualSanGain}，好感+${actualFavorGain}，科研分+${scoreMap[grade]}`;
			if (bonusResearch > 0) result += `，科研能力+${bonusResearch}`;
			
			if (hasDecay) {
				result += `（已发${higherOrEqualCount}篇同级或更高，边际效益递减）`;
			}
			
			if (gameState.consecutiveAccepts > 0) {
				result += `（连续中稿${gameState.consecutiveAccepts}/3）`;
			}
			
			addLog('🎉 论文中稿', `${confInfo.name} ${confInfo.year} 接收为${acceptType}`, result);

			// ★★★ 关键修改：根据是否在队列模式下决定后续处理 ★★★
			if (gameState._reviewProcessing) {
				// 在队列模式下，记录会议信息，稍后统一处理开会事件
				recordAcceptedPaperConference(paper, grade, acceptType);
				
				// 清空论文槽
				gameState.papers[slot] = null;
				
				// 继续处理下一个审稿结果
				setTimeout(() => processNextReviewInQueue(), 100);
				
				updateBuffs();
				renderPaperSlots();
				updateAllUI();
				return;  // 不触发开会弹窗，稍后统一处理
			}
			
			// ★★★ 非队列模式（兼容旧逻辑，如读档后触发）★★★
			gameState.pendingConferenceInfo = {
				info: paper.conferenceInfo,
				location: paper.conferenceLocation,
				grade: grade
			};

			gameState.papers[slot] = null;

			// 检查转博条件
			const canPhD = gameState.degree === 'master' && (
				(gameState.year === 2 && gameState.month === 12 && gameState.totalScore >= 2) ||
				(gameState.year === 3 && gameState.month === 12 && gameState.totalScore >= 3)
			);

			if (canPhD) {
				gameState.pendingConference = grade;
				setTimeout(() => showPhDOptionModal(), 300);
			} else {
				setTimeout(() => showConferenceModal(grade), 300);
			}
			
			updateBuffs();
		}

		// ==================== 显示所有会议信息 ====================
		function showAllConferencesInfo() {
			let html = '<div style="max-height:60vh;overflow-y:auto;">';
			
			html += `
			<table style="width:100%;border-collapse:collapse;font-size:0.75rem;">
				<thead>
					<tr style="background:var(--light-bg);">
						<th style="padding:6px;text-align:left;border-bottom:2px solid var(--border-color);">月份</th>
						<th style="padding:6px;text-align:left;border-bottom:2px solid var(--border-color);">等级</th>
						<th style="padding:6px;text-align:left;border-bottom:2px solid var(--border-color);">会议名称</th>
						<th style="padding:6px;text-align:center;border-bottom:2px solid var(--border-color);">性格</th>
						<th style="padding:6px;text-align:center;border-bottom:2px solid var(--border-color);">投稿数</th>
						<th style="padding:6px;text-align:center;border-bottom:2px solid var(--border-color);">中稿率</th>
						<th style="padding:6px;text-align:center;border-bottom:2px solid var(--border-color);">中稿均分</th>
						<th style="padding:6px;text-align:center;border-bottom:2px solid var(--border-color);">影响因子</th>
					</tr>
				</thead>
				<tbody>
			`;
			
			const grades = ['A', 'B', 'C'];
			const gradeColors = { A: '#e17055', B: '#fdcb6e', C: '#00b894' };
			
			function gameMonthToRealMonth(gameMonth) {
				return ((gameMonth - 1 + 8) % 12) + 1;
			}
			
			for (let month = 1; month <= 12; month++) {
				const realMonth = gameMonthToRealMonth(month);
				
				for (let gradeIdx = 0; gradeIdx < grades.length; gradeIdx++) {
					const grade = grades[gradeIdx];
					const confInfo = getConferenceInfo(month, grade, gameState.year || 1);
					const stats = getMonthStats(month, grade, gameState.isReversed || false);
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
					// ★★★ 新增：获取会议性格 ★★★
					const personality = getBaseConferencePersonality(month, grade);
					const personalityDesc = getConferencePersonalityDescription(personality);
					
					const acceptRate = stats && stats.submissions >= 10 
						? (stats.acceptRate * 100).toFixed(1) + '%' 
						: '-';
					const submissions = stats ? stats.submissions : 0;
					const ifValue = stats && stats.submissions >= 10 
						? impactFactor.toFixed(2) 
						: '-';
					
					const rowBg = month % 2 === 0 ? 'var(--light-bg)' : 'transparent';
					const isCurrentMonth = gameState.month === month;
					const highlightStyle = isCurrentMonth ? 'border-left:3px solid var(--primary-color);' : '';
					
					const showMonth = gradeIdx === 0;
					const monthCell = showMonth 
						? `<td style="padding:5px 6px;border-bottom:1px solid var(--border-color);vertical-align:middle;" rowspan="3">
							<div style="font-weight:600;${isCurrentMonth ? 'color:var(--primary-color);' : ''}">
								${isCurrentMonth ? '📍 ' : ''}第${month}月
							</div>
							<div style="font-size:0.65rem;color:var(--text-secondary);">（${realMonth}月）</div>
						   </td>`
						: '';
					
					html += `
					<tr style="background:${rowBg};${highlightStyle}">
						${monthCell}
						<td style="padding:5px 6px;border-bottom:1px solid var(--border-color);">
							<span style="padding:2px 6px;background:${gradeColors[grade]}22;color:${gradeColors[grade]};border-radius:4px;font-weight:600;">${grade}</span>
						</td>
						<td style="padding:5px 6px;border-bottom:1px solid var(--border-color);font-weight:500;">${confInfo.name}</td>
						<td style="padding:5px 6px;border-bottom:1px solid var(--border-color);text-align:center;font-size:0.7rem;">${personalityDesc}</td>
						<td style="padding:5px 6px;border-bottom:1px solid var(--border-color);text-align:center;">${submissions}</td>
						<td style="padding:5px 6px;border-bottom:1px solid var(--border-color);text-align:center;">${acceptRate}</td>
						<td style="padding:5px 6px;border-bottom:1px solid var(--border-color);text-align:center;">${avgAcceptedScore}</td>
						<td style="padding:5px 6px;border-bottom:1px solid var(--border-color);text-align:center;">${ifValue}</td>
					</tr>
					`;
				}
			}
			
			html += '</tbody></table></div>';
			
			html += `
			<div style="margin-top:12px;padding:10px;background:var(--light-bg);border-radius:8px;font-size:0.75rem;color:var(--text-secondary);">
				<div style="margin-bottom:6px;"><strong>📖 说明：</strong></div>
				<div>• <strong>性格标签</strong>：🔥严格/😊宽松 | 🎲多抽奖/📊少抽奖 | 🍀BL友好/💀BL严苛 | 🌪️玄学/📏稳定</div>
				<div>• <strong>影响因子</strong>：根据中稿量和均分计算的影响力</div>
				<div>• <strong>玩家驱动</strong>：投稿行为会影响会议的录取率和性格</div>
				<div style="margin-top:6px;color:var(--warning-color);">
					<i class="fas fa-info-circle"></i> 投稿数≥10时才显示详细统计数据
				</div>
			</div>
			`;
			
			showModal('📊 全部会议信息一览', html, [
				{ text: '关闭', class: 'btn-primary', action: closeModal }
			]);
		}

        // ==================== 开会系统 ====================
        function showConferenceModal(grade) {
            const favorCost = gameState.favor >= 6 ? 1 : 2;
            const proxyCost = gameState.social >= 6 ? 0 : 1;

            const favorText = gameState.favor >= 6 
                ? '👨‍🏫 导师报销（好感度-1）' 
                : '👨‍🏫 导师报销（好感度-2）';
            const proxyText = gameState.social >= 6 
                ? '👥 请同学代参加（免费）' 
                : '👥 请人代参加（金钱-1）';

            // ★★★ 获取会议信息 ★★★
            let confInfo, confLocation;
            if (gameState.pendingConferenceInfo) {
                confInfo = gameState.pendingConferenceInfo.info;
                confLocation = gameState.pendingConferenceInfo.location;
            } else {
                confInfo = getConferenceInfo(gameState.month, grade, gameState.year);
                confLocation = CONFERENCE_LOCATIONS[Math.floor(Math.random() * CONFERENCE_LOCATIONS.length)];
            }
            
            const confString = formatConferenceString(confInfo, confLocation);

            showModal('🎓 开会选择', 
                `<p>恭喜论文被接收！需要参加学术会议进行展示。</p>
                 <div style="margin:15px 0;padding:12px;background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(162,155,254,0.1));border-radius:10px;border:1px solid rgba(108,92,231,0.2);">
                     <div style="font-size:0.9rem;font-weight:600;color:var(--primary-color);margin-bottom:5px;">📍 会议信息</div>
                     <div style="font-size:1rem;font-weight:700;">${confInfo.name} ${confInfo.year}</div>
                     <div style="font-size:0.85rem;color:var(--text-secondary);">${confInfo.fullName}</div>
                     <div style="font-size:0.85rem;margin-top:5px;">📌 ${confLocation.city}, ${confLocation.country}</div>
                 </div>
                 <p>请选择参会方式：</p>`, 
                [
                { text: '💰 自己出钱（金钱-4）', class: 'btn-warning', action: () => {
                    addLog('开会', `自费参加 ${confInfo.name} ${confInfo.year} @ ${confLocation.city}`, '金钱-4');
                    closeModal();
                    if (changeGold(-4)) {
                        setTimeout(() => showConferenceEventModal(confInfo, confLocation, grade), 200);
                    }
                }},
                { text: favorText, class: 'btn-info', action: () => {
                    const result = gameState.favor >= 6 
                        ? '导师爽快报销，好感度-1' 
                        : '导师好感度-2';
                    addLog('开会', `导师报销参加 ${confInfo.name} ${confInfo.year} @ ${confLocation.city}`, result);
                    closeModal();
                    if (changeFavor(-favorCost)) {
                        setTimeout(() => showConferenceEventModal(confInfo, confLocation, grade), 200);
                    }
                }},
                { text: proxyText, class: 'btn-primary', action: () => {
                    if (gameState.social >= 6) {
                        addLog('开会', `请同学代为参加 ${confInfo.name} ${confInfo.year}`, '同学义气帮忙，免费');
                        closeModal();
                        // 清除会议信息
                        gameState.pendingConferenceInfo = null;
                    } else {
                        addLog('开会', `请人代为参加 ${confInfo.name} ${confInfo.year}`, '金钱-1');
                        closeModal();
                        changeGold(-proxyCost);
                        // 清除会议信息
                        gameState.pendingConferenceInfo = null;
                    }
                }}
            ]);
        }

		function showConferenceEventModal(confInfo, confLocation, grade) {
			// 清除会议信息
			gameState.pendingConferenceInfo = null;

			// ★★★ 新增：记录开会次数 ★★★
			gameState.meetingCount = (gameState.meetingCount || 0) + 1;
			
			// 如果没有传入会议信息，使用默认值
			if (!confInfo) {
				confInfo = { name: '学术会议', year: getRealYear(gameState.year, gameState.month), fullName: 'Academic Conference' };
			}
			if (!confLocation) {
				confLocation = CONFERENCE_LOCATIONS[Math.floor(Math.random() * CONFERENCE_LOCATIONS.length)];
			}
			// 如果没有传入grade，默认为C
			if (!grade) {
				grade = 'C';
			}
			
			const confString = `${confInfo.name} ${confInfo.year} @ ${confLocation.city}, ${confLocation.country}`;
			
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
				{ text: '🏢 找企业交流', fn: () => { 
					gameState.enterpriseCount = (gameState.enterpriseCount || 0) + 1;
					gameState.buffs.temporary.push({ type: 'exp_bonus', name: '下次做实验分数×1.25', value: 1.25, multiply: true, permanent: false }); 
					addLog('开会事件', '找企业交流', `临时buff-下次做实验分数×1.25（第${gameState.enterpriseCount}次）`);
					updateBuffs();
					
					// 第3次及以后触发实习邀请（需要未实习、未永久阻止、导师好感度≥6）
					if (gameState.enterpriseCount >= 3 && !gameState.ailabInternship && !gameState.permanentlyBlockedInternship && gameState.favor >= 6) {
						setTimeout(() => showAILabInternshipModal(), 300);
					}
					return true;
				}}
			];

			// ==================== 定义高级选项（需要社交≥6）====================
			const advancedOptions = [];
			
			if (gameState.social >= 6) {
				// 找大牛合作 - 如果已触发过则不再出现（用后续选项替代）
				if (!gameState.metBigBullCoop) {
					advancedOptions.push({ 
						text: '🎓 找大牛合作', 
						fn: () => { 
							gameState.buffs.temporary.push({ type: 'write_bonus', name: '下次写论文分数+8', value: 8, permanent: false }); 
							gameState.metBigBull = true;
							gameState.metBigBullCoop = true;  // 标记已触发
							addLog('开会事件', '【社交>=6】找大牛合作', '临时buff-下次写论文分数+8，社交能力+1');
							updateBuffs();
							return changeSocial(1);
						},
						category: 'advanced'
					});
				}
				
				// 和活泼的异性学者交流 - 如果已触发过则不再出现（用后续选项替代）
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
				
				// 和聪慧的异性学者交流 - 如果已触发过则不再出现（用后续选项替代）
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
			
			// 和上次那个大牛深入合作（需要科研≥12 + 触发过找大牛合作 + 未联培 + 未永久阻止）
			if (gameState.research >= 12 && gameState.metBigBullCoop && !gameState.bigBullCooperation && !gameState.permanentlyBlockedBigBullCoop) {
				followUpOptions.push({ 
					text: '🌟 和上次那个大牛深入合作', 
					fn: () => {
						gameState.buffs.temporary.push({ type: 'write_bonus', name: '下次写论文分数+8', value: 8, permanent: false });
						gameState.bigBullDeepCount = (gameState.bigBullDeepCount || 0) + 1;
						addLog('开会事件', '【科研>=12】和上次那个大牛深入合作', '临时buff-下次写论文分数+8');
						updateBuffs();
						// 第2次及以后触发联培选择
						if (gameState.bigBullDeepCount >= 2 && !gameState.permanentlyBlockedBigBullCoop) {
							setTimeout(showBigBullCoopModal, 300);
						}
						return true;
					},
					category: 'followUp'
				});
			}

			// 和上次那个活泼的异性学者交流（需要社交≥12 + 触发过 + 没有恋人 + 未永久阻止）
			if (gameState.social >= 12 && gameState.metBeautiful && !gameState.hasLover && !gameState.permanentlyBlockedBeautifulLover) {
				followUpOptions.push({ 
					text: '💕 和上次那个活泼的异性学者交流', 
					fn: () => {
						gameState.beautifulCount = (gameState.beautifulCount || 0) + 1;
						addLog('开会事件', '【社交>=12】和上次那个活泼的异性学者交流', 'SAN值+8，SAN值上限+3');
						gameState.sanMax += 3;
						changeSan(8);
						// 第2次及以后触发恋人选择
						if (gameState.beautifulCount >= 2 && !gameState.permanentlyBlockedBeautifulLover) {
							setTimeout(() => showLoverModal('beautiful'), 300);
						}
						return true;
					},
					category: 'followUp'
				});
			}

			// 和上次那个聪慧的异性学者交流（需要社交≥12 + 触发过 + 没有恋人 + 未永久阻止）
			if (gameState.social >= 12 && gameState.metSmart && !gameState.hasLover && !gameState.permanentlyBlockedSmartLover) {
				followUpOptions.push({ 
					text: '🧠 和上次那个聪慧的异性学者交流', 
					fn: () => {
						gameState.smartCount = (gameState.smartCount || 0) + 1;
						addLog('开会事件', '【社交>=12】和上次那个聪慧的异性学者交流', 'SAN值+1，科研能力+1');
						changeSan(1);
						changeResearch(1);
						// 第2次及以后触发恋人选择
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
				// C类会议：只从基础选项中选择3个
				selected = shuffle(baseOptions).slice(0, 3);
				
			} else if (grade === 'B') {
				// B类会议：从所有可用选项中随机选择4个
				const allOptions = [...baseOptions, ...advancedOptions, ...followUpOptions];
				selected = shuffle(allOptions).slice(0, 4);
				
			} else if (grade === 'A') {
				// A类会议：前2个优先从高级选项或后续选项中选，第3，4个从全部选
				const highPriorityOptions = [...advancedOptions, ...followUpOptions];
				const allOptions = [...baseOptions, ...advancedOptions, ...followUpOptions];
				
				// 打乱高优先级选项和所有选项
				const shuffledHighPriority = shuffle(highPriorityOptions);
				const shuffledAll = shuffle(allOptions);
				
				// 选择前两个（优先从高优先级中选）
				const usedTexts = new Set();
				
				for (let i = 0; i < Math.min(2, shuffledHighPriority.length); i++) {
					selected.push(shuffledHighPriority[i]);
					usedTexts.add(shuffledHighPriority[i].text);
				}
				
				// 如果高优先级选项不足2个，从所有选项中补充
				if (selected.length < 2) {
					for (const opt of shuffledAll) {
						if (!usedTexts.has(opt.text)) {
							selected.push(opt);
							usedTexts.add(opt.text);
							if (selected.length >= 2) break;
						}
					}
				}			
				// 确保至少有选项可选
				if (selected.length === 0) {
					selected = shuffle(baseOptions).slice(0, 4);
				}
				
				// 确保有4个选项（如果可用选项不足4个则尽量多选）
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
					<p>你来到了<strong>${confLocation.city}</strong>参加<strong>${confInfo.name}</strong>（${grade}类），在学术会议上，你可以选择：</p>
				</div>`, 
				selected.map(opt => ({
					text: opt.text, class: 'btn-primary', action: () => {
						closeModal();
						opt.fn();
					}
				}))
			);
		}

		function showLoverModal(type) {
			// 检查是否被永久阻止（分类型检查）
			if (type === 'beautiful' && gameState.permanentlyBlockedBeautifulLover) {
				return;
			}
			if (type === 'smart' && gameState.permanentlyBlockedSmartLover) {
				return;
			}
			// 已有恋人不能再谈
			if (gameState.hasLover) {
				return;
			}
			
			const desc = type === 'beautiful' 
				? '你和那个活泼的异性学者越来越熟悉了' 
				: '你和那个聪慧的异性学者越来越默契了';
			
			const bonusDesc = type === 'beautiful'
				? '<div style="margin-top:10px;padding:8px;background:rgba(253,121,168,0.1);border-radius:8px;font-size:0.8rem;"><strong>恋人效果：</strong><br>✨ SAN值立即回满<br>✨ SAN上限+4<br>✨ 每月SAN+3<br>💸 每月金钱-1（约会开销）</div>'
				: '<div style="margin-top:10px;padding:8px;background:rgba(116,185,255,0.1);border-radius:8px;font-size:0.8rem;"><strong>恋人效果：</strong><br>✨ SAN+1，科研能力+1<br>✨ 每次想idea/做实验/写论文多一次<br>💸 每月金钱-1（约会开销）</div>';
			
			// 获取对应类型的拒绝次数
			const rejectCount = type === 'beautiful' 
				? (gameState.rejectedBeautifulLoverCount || 0) 
				: (gameState.rejectedSmartLoverCount || 0);
			
			const loverTypeName = type === 'beautiful' ? '活泼' : '聪慧';
			
			// 显示拒绝次数警告
			let warningText = '';
			if (rejectCount === 0) {
				warningText = `<div style="margin-top:10px;padding:8px;background:rgba(253,203,110,0.2);border-radius:8px;font-size:0.75rem;color:#d68910;"><i class="fas fa-exclamation-triangle"></i> 提示：如果拒绝${loverTypeName}恋人2次，将永久无法再与${loverTypeName}异性学者发展恋情</div>`;
			} else if (rejectCount === 1) {
				warningText = `<div style="margin-top:10px;padding:8px;background:rgba(231,76,60,0.2);border-radius:8px;font-size:0.75rem;color:#e74c3c;"><i class="fas fa-exclamation-triangle"></i> <strong>警告：</strong>这是与${loverTypeName}异性学者的最后一次机会！</div>`;
			}
			
			showModal('💕 发展关系', `<p>${desc}，是否成为恋人？</p>${bonusDesc}${warningText}`, [
				{ text: '还是算了', class: 'btn-info', action: () => {
					// 分类型增加拒绝次数
					if (type === 'beautiful') {
						gameState.rejectedBeautifulLoverCount = (gameState.rejectedBeautifulLoverCount || 0) + 1;
						if (gameState.rejectedBeautifulLoverCount >= 2) {
							gameState.permanentlyBlockedBeautifulLover = true;
							addLog('关系选择', '再次拒绝了活泼异性学者', '与活泼异性学者的缘分已尽');
						} else {
							addLog('关系选择', '暂时拒绝了活泼异性学者', '下次还有机会');
						}
					} else {
						gameState.rejectedSmartLoverCount = (gameState.rejectedSmartLoverCount || 0) + 1;
						if (gameState.rejectedSmartLoverCount >= 2) {
							gameState.permanentlyBlockedSmartLover = true;
							addLog('关系选择', '再次拒绝了聪慧异性学者', '与聪慧异性学者的缘分已尽');
						} else {
							addLog('关系选择', '暂时拒绝了聪慧异性学者', '下次还有机会');
						}
					}
					closeModal();
				}},
				{ text: '❤️ 成为恋人', class: 'btn-accent', action: () => {
					gameState.hasLover = true;
					gameState.loverType = type;
					// ★★★ 新增：记录恋人月份 ★★★
					gameState.firstLoverMonth = gameState.totalMonths;
					// ★★★ 新增：记录恋人里程碑 ★★★
					const loverTypeName = type === 'beautiful' ? '活泼的' : '聪慧的';
					addCareerMilestone('lover', '遇见爱情', `与${loverTypeName}异性学者成为恋人`);
					if (type === 'beautiful') {
						gameState.san = gameState.sanMax;
						gameState.sanMax += 4;
						addLog('💕 恋爱', '和活泼的异性学者成为恋人', 'SAN值回满，SAN上限+4，每月SAN+3，每月金钱-1');
					} else {
						changeResearch(1);
						gameState.buffs.permanent.push(
							{ type: 'idea_times', name: '每次想idea多想1次', value: 1, permanent: true },
							{ type: 'exp_times', name: '每次做实验多做1次', value: 1, permanent: true },
							{ type: 'write_times', name: '每次写论文多写1次', value: 1, permanent: true }
						);
						addLog('💕 恋爱', '和聪慧的异性学者成为恋人', 'SAN+1，科研能力+1，永久buff-每次想idea/做实验/写论文多一次，每月金钱-1');
						changeSan(1);
					}
					closeModal();
					updateAllUI();
					updateBuffs();

					// ★★★ 新增：恋人自动加入关系网 ★★★
					const loverDescription = type === 'beautiful'
						? '你的恋人，活泼开朗，每月让你心情愉悦'
						: '你的恋人，聪慧过人，在科研上给你很大帮助';
					const loverPerson = createRelationshipPerson('lover', {
						description: loverDescription
					});
					setTimeout(() => {
						showAddToNetworkModal(loverPerson);
					}, 300);
				}}
			]);
		}

		function showAILabInternshipModal() {
			// 检查是否被永久阻止
			if (gameState.permanentlyBlockedInternship || gameState.ailabInternship) {
				return;
			}
			
			const sanCost = gameState.isReversed && gameState.character === 'normal' 
				? (gameState.reversedAwakened ? 9 : 6) 
				: 3;
			
			// 显示拒绝次数警告
			const rejectCount = gameState.rejectedInternshipCount || 0;
			let warningText = '';
			if (rejectCount === 0) {
				warningText = '<p style="font-size:0.75rem;color:#d68910;margin-top:10px;"><i class="fas fa-info-circle"></i> 提示：如果拒绝2次，将永久无法再获得实习机会（但找企业交流选项仍然存在）</p>';
			} else if (rejectCount === 1) {
				warningText = '<p style="font-size:0.8rem;color:#e74c3c;margin-top:10px;"><i class="fas fa-exclamation-triangle"></i> <strong>警告：</strong>这是最后一次实习机会！再次拒绝将永久错过</p>';
			}
			
			showModal('🏢 实习邀请', 
				`<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:2.5rem;margin-bottom:10px;">🤖</div>
					<div style="font-size:1.1rem;font-weight:600;color:var(--primary-color);">上海AI Lab 远程实习邀请</div>
				</div>
				<p>你在企业交流中表现出色，AI Lab 的L研究员对你印象深刻，向你发出了远程实习邀请！</p>
				
				<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin:15px 0;">
					<div style="font-size:0.85rem;font-weight:600;margin-bottom:8px;">📋 实习待遇：</div>
					<div style="display:flex;flex-direction:column;gap:6px;font-size:0.85rem;">
						<div style="display:flex;align-items:center;gap:8px;">
							<span style="color:var(--success-color);">✓</span>
							<span>永久buff：做实验分数 ×1.25</span>
						</div>
						<div style="display:flex;align-items:center;gap:8px;">
							<span style="color:var(--success-color);">✓</span>
							<span>每月金钱 +2（实习工资）</span>
						</div>
						<div style="display:flex;align-items:center;gap:8px;">
							<span style="color:var(--danger-color);">✗</span>
							<span>每月SAN -${sanCost}（工作压力）${sanCost !== 3 ? '（怠惰效果）' : ''}</span>
						</div>
					</div>
				</div>
				
				<p style="font-size:0.8rem;color:var(--text-secondary);text-align:center;">
					远程实习可以兼顾学业，但需要承担额外的工作压力
				</p>
				${warningText}`,
				[
					{ text: '婉拒邀请', class: 'btn-info', action: () => {
						gameState.rejectedInternshipCount = (gameState.rejectedInternshipCount || 0) + 1;
						
						if (gameState.rejectedInternshipCount >= 2) {
							gameState.permanentlyBlockedInternship = true;
							addLog('实习邀请', '再次婉拒了AI Lab的实习邀请', '实习机会已永久关闭');
						} else {
							addLog('实习邀请', '暂时婉拒了AI Lab的实习邀请', '下次企业交流还有机会');
						}
						
						closeModal();
					}},
					{ text: '🚀 接受实习', class: 'btn-primary', action: () => {
						gameState.ailabInternship = true;
						gameState.buffs.permanent.push({ 
							type: 'exp_bonus', 
							name: '实习加成：做实验分数×1.25', 
							value: 1.25, 
							multiply: true, 
							permanent: true 
						});
						addLog('实习邀请', '接受了AI Lab的远程实习', '永久buff-做实验分数×1.25，每月金钱+2，每月SAN-3');
						closeModal();
						updateBuffs();
						updateAllUI();
					}}
				]
			);
		}

		function showBigBullCoopModal() {
			// 检查是否被永久阻止或已联培
			if (gameState.permanentlyBlockedBigBullCoop || gameState.bigBullCooperation) {
				return;
			}
			
			// 显示拒绝次数警告
			const rejectCount = gameState.rejectedBigBullCoopCount || 0;
			let warningText = '';
			if (rejectCount === 0) {
				warningText = '<p style="font-size:0.75rem;color:#d68910;margin-top:10px;"><i class="fas fa-info-circle"></i> 提示：如果拒绝2次，将永久无法再获得联合培养机会</p>';
			} else if (rejectCount === 1) {
				warningText = '<p style="font-size:0.8rem;color:#e74c3c;margin-top:10px;"><i class="fas fa-exclamation-triangle"></i> <strong>警告：</strong>这是最后一次联培机会！再次拒绝将永久错过</p>';
			}
			
			showModal('🌟 联合培养', 
				`<p>大牛对你的科研能力印象深刻，提议与你的导师联合培养你，是否接受？</p>
				<div style="margin-top:10px;padding:10px;background:var(--light-bg);border-radius:8px;font-size:0.85rem;">
					<strong>联合培养效果：</strong><br>
					✨ 永久buff：每次写论文分数+8<br>
					✨ 解锁"学术之星"等高级结局条件
				</div>
				${warningText}`, 
				[
					{ text: '婉拒', class: 'btn-info', action: () => {
						gameState.rejectedBigBullCoopCount = (gameState.rejectedBigBullCoopCount || 0) + 1;
						
						if (gameState.rejectedBigBullCoopCount >= 2) {
							gameState.permanentlyBlockedBigBullCoop = true;
							addLog('联合培养', '再次婉拒了联合培养', '联培机会已永久关闭');
						} else {
							addLog('联合培养', '暂时婉拒了联合培养', '继续深入合作还有机会');
						}
						
						closeModal();
					}},
					{ text: '✨ 接受联合培养', class: 'btn-primary', action: () => {
						gameState.bigBullCooperation = true;
						gameState.buffs.permanent.push({ type: 'write_bonus', name: '每次写论文分数+8', value: 8, permanent: true });
						addLog('联合培养', '导师与大牛联合培养', '永久buff-每次写论文分数+8');
						closeModal();
						updateBuffs();
					}}
				]
			);
		}
