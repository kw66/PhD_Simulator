        // ==================== 下一个月 ====================
		function nextMonth() {
			// ★★★ 新增：重置行动次数 ★★★
			gameState.actionCount = 0;
			gameState.actionUsed = false;

			// ★★★ 自动存档（每3个月，在月份增加前保存当前状态）★★★
			autoSave();

			// ★★★ 全力以赴成就：在进入毕业月之前记录状态 ★★★
			const maxMonthsForAllOut = gameState.maxYears * 12;
			if (gameState.totalMonths + 1 === maxMonthsForAllOut) {
				// 即将进入毕业月，记录当前状态（毕业前一个月结束时）
				if (gameState.san === 0 && gameState.gold === 0) {
					gameState.achievementConditions = gameState.achievementConditions || {};
					gameState.achievementConditions.allOutBeforeGrad = true;
				}
			}

			gameState.month++;
			gameState.totalMonths++;

			// ★★★ 黑市：重置护身符每月使用记录 ★★★
			resetAmuletMonthlyUsage();

			// ============================================
			// ★★★ 月初结算顺序优化：先重置类 ★★★
			// ============================================

			// ★★★ 空想之天选之人：月初最先执行属性交换 ★★★
			if (gameState.isReversed && gameState.character === 'chosen') {
				processChosenSwap();
			}

			// ★★★ 检查并处理松懈debuff ★★★
			const hadSlackBuff = gameState.buffs.temporary.some(b => b.type === 'slack_debuff');
			if (hadSlackBuff) {
				gameState.buffs.temporary = gameState.buffs.temporary.filter(b => b.type !== 'slack_debuff');
				addLog('状态恢复', '松懈debuff消除', '经过休整，状态恢复正常');
			}

			// ★★★ 清除本月限定的buff ★★★
			gameState.buffs.temporary = gameState.buffs.temporary.filter(b => !b.thisMonthOnly);

			// ★★★ 处理刹那系buff的月初惩罚 ★★★
			const flashPenalties = gameState.buffs.temporary.filter(b => b.applyNextMonth);
			flashPenalties.forEach(penalty => {
				if (penalty.type === 'flash_research_penalty') {
					const oldVal = gameState.research;
					gameState.research = Math.max(0, gameState.research + penalty.value);
					addLog('刹那后遗', '刹那灵光', `科研能力 ${oldVal}→${gameState.research}`);
				} else if (penalty.type === 'flash_favor_penalty') {
					const oldVal = gameState.favor;
					gameState.favor = Math.max(0, gameState.favor + penalty.value);
					addLog('刹那后遗', '刹那亲和', `导师好感 ${oldVal}→${gameState.favor}`);
				} else if (penalty.type === 'flash_social_penalty') {
					const oldVal = gameState.social;
					gameState.social = Math.max(0, gameState.social + penalty.value);
					addLog('刹那后遗', '刹那魅力', `社交能力 ${oldVal}→${gameState.social}`);
				}
			});
			// 移除已处理的刹那惩罚buff
			gameState.buffs.temporary = gameState.buffs.temporary.filter(b => !b.applyNextMonth);

			// ★★★ 贪求之富可敌国：月初属性变化 ★★★
			if (gameState.isReversed && gameState.character === 'rich') {
				if (gameState.reversedAwakened) {
					// ★★★ 觉醒后：每月属性降低15%（上取整）★★★
					const oldSan = gameState.san;
					const oldResearch = gameState.research;
					const oldSocial = gameState.social;
					const oldFavor = gameState.favor;

					const sanLoss = Math.ceil(gameState.san * 0.15);
					const researchLoss = Math.ceil(gameState.research * 0.15);
					const socialLoss = Math.ceil(gameState.social * 0.15);
					const favorLoss = Math.ceil(gameState.favor * 0.15);

					gameState.san = Math.max(1, gameState.san - sanLoss);
					gameState.research = Math.max(1, gameState.research - researchLoss);
					gameState.social = Math.max(1, gameState.social - socialLoss);
					gameState.favor = Math.max(1, gameState.favor - favorLoss);

					addLog('逆位效果', '贪求之月度衰减',
						`SAN ${oldSan}→${gameState.san}(-${sanLoss}), 科研 ${oldResearch}→${gameState.research}(-${researchLoss}), 社交 ${oldSocial}→${gameState.social}(-${socialLoss}), 好感 ${oldFavor}→${gameState.favor}(-${favorLoss})`);
				} else {
					// 觉醒前：每月重置为1
					const oldSan = gameState.san;
					const oldResearch = gameState.research;
					const oldSocial = gameState.social;
					const oldFavor = gameState.favor;

					gameState.san = 1;
					gameState.research = 1;
					gameState.social = 1;
					gameState.favor = 1;

					addLog('逆位效果', '贪求之每月重置',
						`SAN ${oldSan}→1, 科研 ${oldResearch}→1, 社交 ${oldSocial}→1, 好感 ${oldFavor}→1`);
				}
			}

			if (gameState.month > 12) {
				gameState.month = 1;
				gameState.year++;
				gameState.phdChoiceMadeThisYear = false;  // 新的一年重置标志
				// ★★★ 新增：每年重置随机事件池 ★★★
				yearlyResetRandomEventPool();
			}

			// ★★★ 新增：月初为本月可投会议生成随机地点（4个月后论文中稿时使用）★★★
			generateMonthlyConferenceLocations();

			// ============================================
			// ★★★ 金币结算：先重置类（已处理），再+金币 ★★★
			// ============================================

			// ★★★ 修改：工资就是导师提供的 ★★★
			const salary = getAdvisorSalary(gameState.degree);

			// ★★★ 贪求之富可敌国：每月加金（未觉醒+3，觉醒后+6%上取整）★★★
			let extraGold = 0;
			if (gameState.isReversed && gameState.character === 'rich') {
				if (gameState.reversedAwakened) {
					extraGold = Math.ceil(gameState.gold * 0.06);
				} else {
					extraGold = 3;
				}
			}

			// 先加金币（+金币类）
			const wageBonus = gameState.monthlyWageBonus || 0;  // 隐藏觉醒：不求暴富但求稳定
			gameState.gold += salary + extraGold + wageBonus;

			// ============================================
			// ★★★ SAN结算：先+SAN类 ★★★
			// ============================================

			// 基础SAN回复
			let sanRecovery = 1;
			if (gameState.isReversed && gameState.character === 'normal') {
				if (gameState.slothAwakened) {
					// ★★★ 修改：觉醒后每月SAN+已损SAN的10%（上取整）★★★
					const lostSanSloth = gameState.sanMax - gameState.san;
					sanRecovery = 3 + Math.ceil(lostSanSloth * 0.1);
				} else {
					sanRecovery = 3;
				}
			}
			gameState.san = Math.min(gameState.sanMax, gameState.san + sanRecovery);

			// ★★★ 恋人（活泼）SAN加成（+SAN类）- 改为回复已损失SAN的百分比 ★★★
			if (gameState.hasLover && gameState.loverType === 'beautiful') {
				// ★★★ 基础10% + 额外百分比加成（每次约会循环第3阶段+2%）★★★
				const baseRecoveryRate = 0.10;  // 基础10%
				const extraRecoveryRate = (gameState.beautifulLoverExtraRecoveryRate || 0) / 100;  // 额外百分比
				const totalRecoveryRate = baseRecoveryRate + extraRecoveryRate;

				const lostSanBeautiful = gameState.sanMax - gameState.san;
				const beautifulRecovery = Math.ceil(lostSanBeautiful * totalRecoveryRate);
				gameState.san = Math.min(gameState.sanMax, gameState.san + beautifulRecovery);
			}

			// ★★★ 人体工学椅效果（+SAN类）★★★
			if (gameState.buffs.permanent.some(b => b.type === 'monthly_san')) {
				gameState.san = Math.min(gameState.sanMax, gameState.san + 1);
			}
			// ★★★ 高级人体工学椅效果（+2 SAN）★★★
			if (gameState.buffs.permanent.some(b => b.type === 'monthly_san_2')) {
				gameState.san = Math.min(gameState.sanMax, gameState.san + 2);
			}
			// ★★★ 电动沙发按摩椅效果（+10%已损失SAN，上取整）★★★
			if (gameState.buffs.permanent.some(b => b.type === 'monthly_san_lost_10')) {
				const lostSan = gameState.sanMax - gameState.san;
				const recovery = Math.ceil(lostSan * 0.1);
				gameState.san = Math.min(gameState.sanMax, gameState.san + recovery);
			}
			// ★★★ 头悬梁锥刺股椅效果（+20%当前SAN，上取整）★★★
			if (gameState.buffs.permanent.some(b => b.type === 'monthly_san_current_20')) {
				const recovery = Math.ceil(gameState.san * 0.2);
				gameState.san = Math.min(gameState.sanMax, gameState.san + recovery);
			}

			// ★★★ 强身健体效果（+SAN类）★★★
			if (gameState.buffs.permanent.some(b => b.type === 'monthly_san_recovery')) {
				gameState.san = Math.min(gameState.sanMax, gameState.san + 1);
			}

			// ★★★ 新增：季节效果（+SAN类）★★★
			const currentSeason = getCurrentSeason();
			if (currentSeason.key === 'autumn') {
				// 秋季：秋高气爽，每月回复SAN+1
				gameState.san = Math.min(gameState.sanMax, gameState.san + 1);
			} else if (currentSeason.key === 'winter') {
				// 冬季：寒风刺骨，每月回复SAN-1（羽绒服可使其无效）
				if (!gameState.hasDownJacket) {
					gameState.san = Math.max(0, gameState.san - 1);
				}
			}

			// ★★★ 新增：小电驴季节加成（+SAN类）★★★
			if (gameState.bikeUpgrade === 'ebike') {
				if (currentSeason.key === 'spring' || currentSeason.key === 'autumn') {
					gameState.san = Math.min(gameState.sanMax, gameState.san + 1);
				}
			}

			// ============================================
			// ★★★ 金币结算：-金币类 ★★★
			// ============================================

			// 基础开销
			gameState.gold -= 1;

			// 恋人约会开销
			if (gameState.hasLover) {
				gameState.gold -= 2;  // ★★★ 修改：约会开销从1改为2 ★★★

				// 富可敌国觉醒：恋爱开销也算消费
				if (gameState.isReversed && gameState.character === 'rich' && gameState.reversedAwakened) {
					gameState.goldSpentTotal = (gameState.goldSpentTotal || 0) + 1;

					const attributeGains = Math.floor(gameState.goldSpentTotal / 6);
					const previousGains = Math.floor((gameState.goldSpentTotal - 1) / 6);
					const newGains = attributeGains - previousGains;

					if (newGains > 0) {
						gameState.san = Math.min(gameState.sanMax, gameState.san + newGains);
						gameState.research = Math.min(20, gameState.research + newGains);
						gameState.social = Math.min(20, gameState.social + newGains);
						gameState.favor = Math.min(20, gameState.favor + newGains);
						addLog('逆位效果', '金钱觉醒', `累计消费${gameState.goldSpentTotal}金 → SAN+${newGains}, 科研+${newGains}, 社交+${newGains}, 好感+${newGains}`);
						// ★★★ 修复：科研和社交增加时检查解锁 ★★★
						checkResearchUnlock();
						checkSocialUnlock();
					}
				}

				// ★★★ 黑市：零钱护身符检查 ★★★
				checkAmuletEffects();

				if (gameState.gold < 0) {
					triggerEnding('poor');
					return;
				}
			}

			// ============================================
			// ★★★ SAN结算：-SAN类 ★★★
			// ============================================

			// ★★★ AILab 实习效果（-SAN类）★★★
			if (gameState.ailabInternship) {
				// ★★★ 修改：白手起家术 - 实习收入翻倍 ★★★
				const internshipIncome = gameState.incomeDoubled ? 4 : 2;
				gameState.gold += internshipIncome;  // 实习收入

				const baseSanCost = 2;  // ★★★ 修改：实习SAN消耗从3改为2 ★★★
				const actualSanCost = Math.abs(getActualSanChange(-baseSanCost));
				gameState.san -= actualSanCost;

				// ★★★ 黑市：理智护身符检查 ★★★
				checkAmuletEffects();

				if (gameState.san < 0) {
					triggerEnding('burnout');
					return;
				}
			}

			// ★★★ 指导师弟师妹效果（-SAN类）★★★
			const mentorshipBuff = gameState.buffs.permanent.find(b => b.type === 'mentorship');
			if(mentorshipBuff) {
				const baseSanCost = 1;
				const actualSanCost = Math.abs(getActualSanChange(-baseSanCost));

				changeSan(-baseSanCost);

				const researchBonus = gameState.research;
				gameState.totalCitations += researchBonus;
				gameState.publishedPapers.forEach(paper => {
					paper.citations += Math.floor(researchBonus / gameState.publishedPapers.length);
				});

				let sanText = `SAN-${actualSanCost}`;
				if (gameState.isReversed && gameState.character === 'normal') {
					sanText += `（怠惰×${gameState.reversedAwakened ? 3 : 2}）`;
				}
				addLog('长期合作', '指导师弟师妹的成果', `${sanText}，总引用+${researchBonus}`);
			}

			// ★★★ 新增：自行车每月效果（-SAN类）★★★
			if (gameState.hasBike && gameState.bikeUpgrade !== 'ebike') {
				// 平把公路车或弯把公路车
				let bikeSanCost = 1;  // 平把公路车每月-1
				let sanThreshold = 6;  // 平把公路车每累计6后SAN上限+1

				if (gameState.bikeUpgrade === 'road') {
					bikeSanCost = 2;  // 弯把公路车每月-2
					sanThreshold = 5;  // 弯把公路车每累计5后SAN上限+1
				}

				// 扣除SAN
				gameState.san = Math.max(0, gameState.san - bikeSanCost);

				// 累计骑行消耗
				gameState.bikeSanSpent = (gameState.bikeSanSpent || 0) + bikeSanCost;

				// 检查是否达到SAN上限提升阈值
				const prevThresholdCount = Math.floor((gameState.bikeSanSpent - bikeSanCost) / sanThreshold);
				const newThresholdCount = Math.floor(gameState.bikeSanSpent / sanThreshold);
				if (newThresholdCount > prevThresholdCount) {
					gameState.sanMax = (gameState.sanMax || 20) + 1;
					addLog('骑行效果', gameState.bikeUpgrade === 'road' ? '弯把公路车' : '平把公路车',
						`累计骑行消耗${gameState.bikeSanSpent}SAN，SAN上限+1 → ${gameState.sanMax}`);
				}

				// ★★★ 黑市：理智护身符检查 ★★★
				checkAmuletEffects();

				if (gameState.san < 0) {
					triggerEnding('burnout');
					return;
				}
			}

			// ============================================
			// ★★★ 连续低SAN月数统计（用于感冒概率）★★★
			// ============================================
			if (gameState.san <= 3) {
				gameState.consecutiveLowSanMonths = (gameState.consecutiveLowSanMonths || 0) + 1;
			} else {
				gameState.consecutiveLowSanMonths = 0;
			}

			// ============================================
			// ★★★ 月初结算完成，处理自动订阅 ★★★
			// ============================================
			// 重置月度商品
			shopItems.forEach(item => {
				if (item.monthlyOnce) item.boughtThisMonth = false;
			});

			// ★★★ 处理预购订阅（月初金钱结算后自动购买冰美式）★★★
			processSubscriptions('nextMonth');


			// ★★★ 修改：论文分数衰减（支持预见未来热点，期刊槽送审后不衰减）★★★
			let decayLogs = [];
			gameState.papers.forEach((paper, idx) => {
				if (paper && !paper.reviewing) {
					// ★★★ 修改：期刊槽送审后进入修改阶段不衰减，其他情况正常衰减 ★★★
					const isJournalRevising = paper.journalRevising === true;
					if (gameState.noDecay || isJournalRevising) {
						// 不衰减（预见未来热点 或 期刊送审修改阶段）
					} else {
						let decayInfo = [];

						// ★★★ 记录衰减前的分数，用于成就检测 ★★★
						const prevIdeaScore = paper.ideaScore;
						const prevExpScore = paper.expScore;

						// ★★★ 修改：基于当前分数的10%衰减，最少1 ★★★
						if (paper.ideaScore > 1) {
							const ideaDecay = Math.max(1, Math.floor(paper.ideaScore * 0.1));
							paper.ideaScore = Math.max(1, paper.ideaScore - ideaDecay);
							decayInfo.push(`idea-${ideaDecay}`);
						}
						if (paper.expScore > 1) {
							const expDecay = Math.max(1, Math.floor(paper.expScore * 0.1));
							paper.expScore = Math.max(1, paper.expScore - expDecay);
							decayInfo.push(`实验-${expDecay}`);
						}

						// ★★★ 新增：自然风干成就检测（衰减前至少有一个>1，衰减后都=1）★★★
						if ((prevIdeaScore > 1 || prevExpScore > 1) && paper.ideaScore === 1 && paper.expScore === 1) {
							gameState.naturallyDried = true;
						}

						if (decayInfo.length > 0) {
							decayLogs.push(`槽${idx + 1}:${decayInfo.join('，')}`);
						}
					}
				}
			});

			// 审稿进度
			let pendingReviewSlots = [];
			gameState.papers.forEach((paper, idx) => {
				if (paper && paper.reviewing) {
					paper.reviewMonths--;

					// ★★★ 新增：每月时效性衰减 ★★★
					if (!gameState.noDecay) {
						// ★★★ 记录衰减前的分数，用于成就检测 ★★★
						const prevIdeaScore = paper.ideaScore;
						const prevExpScore = paper.expScore;

						// 基于当前分数的10%衰减，最少1
						const ideaDecay = Math.max(1, Math.floor(paper.ideaScore * 0.1));
						const expDecay = Math.max(1, Math.floor(paper.expScore * 0.1));

						paper.ideaScore = Math.max(1, paper.ideaScore - ideaDecay);
						paper.expScore = Math.max(1, paper.expScore - expDecay);

						// 记录累计衰减（用于显示）
						paper.totalIdeaDecay = (paper.totalIdeaDecay || 0) + ideaDecay;
						paper.totalExpDecay = (paper.totalExpDecay || 0) + expDecay;

						// ★★★ 新增：自然风干成就检测（衰减前至少有一个>1，衰减后都=1）★★★
						if ((prevIdeaScore > 1 || prevExpScore > 1) && paper.ideaScore === 1 && paper.expScore === 1) {
							gameState.naturallyDried = true;
						}
					}
					if (paper.reviewMonths <= 0) {
						paper.reviewMonths = 0;
						pendingReviewSlots.push(idx);  // 按槽位顺序收集
					}
				}
			});

			// 更新引用
			updateCitations();

			// ★★★ 新增：更新人际关系进度 ★★★
			updateRelationshipProgress();

			let logResult = `工资+${salary}`;
			// ★★★ 新增：显示隐藏觉醒工资加成 ★★★
			if (wageBonus > 0) {
				logResult += `，稳定+${wageBonus}`;
			}
			logResult += `，开销-1`;
			if (extraGold > 0) logResult += `，逆位额外+${extraGold}金`;
			logResult += `，休息SAN+${sanRecovery}`;
			if (gameState.hasLover) {
				if (gameState.loverType === 'beautiful') {
					logResult += '，恋人SAN+3';
				}
				logResult += '，约会-1金';
			}
			if (gameState.ailabInternship) {
				const actualSanCost = Math.abs(getActualSanChange(-3));
				logResult += `，实习+2金，实习SAN-${actualSanCost}`;
			}
			
			if (gameState.buffs.permanent.some(b => b.type === 'monthly_san')) {
				logResult += '，工学椅SAN+1';
			}
			// ★★★ 新增：季节SAN效果日志 ★★★
			if (currentSeason.key === 'autumn') {
				logResult += '，秋高气爽SAN+1';
			} else if (currentSeason.key === 'winter') {
				if (gameState.hasDownJacket) {
					logResult += '，羽绒服抵御寒风';
				} else {
					logResult += '，寒风刺骨SAN-1';
				}
			}
			// ★★★ 新增：小电驴季节加成日志 ★★★
			if (gameState.bikeUpgrade === 'ebike' && (currentSeason.key === 'spring' || currentSeason.key === 'autumn')) {
				logResult += '，小电驴SAN+1';
			}
			// ★★★ 新增：自行车骑行消耗日志 ★★★
			if (gameState.hasBike && gameState.bikeUpgrade !== 'ebike') {
				const bikeCost = gameState.bikeUpgrade === 'road' ? 2 : 1;
				logResult += `，骑行SAN-${bikeCost}`;
			}
			addLog('进入下一月', `第${gameState.year}年第${gameState.month}月 ${currentSeason.icon}${currentSeason.buff}`, logResult);

			// ★★★ 修改：衰减日志（预见未来热点时显示不同信息）★★★
			if (gameState.noDecay) {
				// 每5个月提示一次，避免日志刷屏
				if (gameState.totalMonths % 5 === 0) {
					addLog('预见热点', '论文分数保持稳定', 'idea和实验分数不衰减');
				}
			} else if (decayLogs.length > 0) {
				addLog('时效性降低', '论文分数自然衰减', decayLogs.join('；'));
			}

			// ★★★ 关键修改：审稿事件优先处理 ★★★
			// 如果有待处理的审稿结果，先处理审稿，完成后再触发月末事件
			if (pendingReviewSlots.length > 0) {
				// 定义月末事件回调
				const triggerMonthlyEvents = () => {
					// ★★★ 12月特殊处理：审稿完成后重新检查转博条件 ★★★
					if (gameState.month === 12) {
						// 重新计算转博条件（此时totalScore已经是审稿后的最新值）
						const requirements = getAdvisorRequirements();
						const canPhD = gameState.degree === 'master' && (
							(gameState.year === 2 && gameState.totalScore >= requirements.phdYear2) ||
							(gameState.year === 3 && gameState.totalScore >= requirements.phdYear3)
						);
						
						if (canPhD) {
							// 满足转博条件，显示转博选择弹窗（转博流程内部会触发学年总结）
							checkGraduation();
						} else {
							// 不满足转博条件，显示遗憾弹窗后再进入学年总结
							showMissedPhDOpportunityModal(requirements);
						}
						// ★★★ 12月的毕业检查由学年总结回调处理，这里直接返回 ★★★
						updateAllUI();
						renderPaperSlots();
						return;
					} else if (gameState.month === 5) {
						// ★★★ 修改：延毕年（第6年）没有寒假事件 ★★★
						if (!gameState.isNatureExtensionYear || gameState.year !== 6) {
							triggerWinterVacationEvent();
						}
					} else if (gameState.month === 7) {
						triggerOtherRandomEvent();  // ★★★ 新增：第7月随机事件 ★★★
					} else if (gameState.month === 3 && gameState.year === gameState.feedbackEventYear && !gameState.feedbackEventTriggered) {
						triggerFeedbackEvent();  // ★★★ 新增：第3年或第5年第3月留言事件 ★★★
					} else if (gameState.month === 9) {
						triggerCCIGEvent();  // ★★★ 新增：第9月CCIG事件 ★★★
					} else if (gameState.month === 11) {
						// ★★★ 修改：延毕年（第6年）没有暑假事件 ★★★
						if (!gameState.isNatureExtensionYear || gameState.year !== 6) {
							triggerSummerVacationEvent();
						}
					} else if (gameState.month === 1 && gameState.year >= 2) {
						// ★★★ 修改：延毕年（第6年）没有奖学金事件 ★★★
						if (!gameState.isNatureExtensionYear || gameState.year !== 6) {
							triggerScholarshipEvent();
						}
					} else if (gameState.month === 2) {
						triggerTeachersDayEvent();
					} else if (gameState.month % 2 === 0) {
						triggerOtherRandomEvent();
					}
					
					// 非12月时检查毕业
					checkGraduation();
					checkInGameAchievements();  // ★★★ 新增：检测游戏内成就 ★★★
					updateAllUI();
					renderPaperSlots();
				};
				
				// 开始审稿事件处理流程，完成后触发月末事件
				startReviewProcessing(pendingReviewSlots, triggerMonthlyEvents);
				
				updateAllUI();
				renderPaperSlots();
				return;  // ★★★ 提前返回，等待审稿流程完成 ★★★
			}

			// 没有审稿结果时，正常触发月末事件
			if (gameState.month === 12) {
				const requirements = getAdvisorRequirements();
				const canPhD = gameState.degree === 'master' && (
					(gameState.year === 2 && gameState.totalScore >= requirements.phdYear2) ||
					(gameState.year === 3 && gameState.totalScore >= requirements.phdYear3)
				);

				if (canPhD) {
					checkGraduation();
					updateAllUI();
					renderPaperSlots();
					return;
				} else {
					// ★★★ 修复：在显示弹窗之前先更新UI，确保按钮可用性正确 ★★★
					updateAllUI();
					renderPaperSlots();
					// 不满足转博条件，显示遗憾弹窗后再进入学年总结
					showMissedPhDOpportunityModal(requirements);
					return;
				}
			} else if (gameState.month === 5) {
				// ★★★ 修改：延毕年（第6年）没有寒假事件 ★★★
				if (!gameState.isNatureExtensionYear || gameState.year !== 6) {
					triggerWinterVacationEvent();
				}
			} else if (gameState.month === 7) {
				triggerOtherRandomEvent();  // ★★★ 新增：第7月随机事件 ★★★
			} else if (gameState.month === 3 && gameState.year === gameState.feedbackEventYear && !gameState.feedbackEventTriggered) {
				triggerFeedbackEvent();  // ★★★ 新增：第3年或第5年第3月留言事件 ★★★
			} else if (gameState.month === 9) {
				triggerCCIGEvent();  // ★★★ 新增：第9月CCIG事件 ★★★
			} else if (gameState.month === 11) {
				// ★★★ 修改：延毕年（第6年）没有暑假事件 ★★★
				if (!gameState.isNatureExtensionYear || gameState.year !== 6) {
					triggerSummerVacationEvent();
				}
			} else if (gameState.month === 1 && gameState.year >= 2) {
				// ★★★ 修改：延毕年（第6年）没有奖学金事件 ★★★
				if (!gameState.isNatureExtensionYear || gameState.year !== 6) {
					triggerScholarshipEvent();
				}
			} else if (gameState.month === 2) {
				triggerTeachersDayEvent();
			} else if (gameState.month % 2 === 0) {
				triggerOtherRandomEvent();
			}

			checkGraduation();
			checkInGameAchievements();  // ★★★ 新增：检测游戏内成就 ★★★
			updateAllUI();
			renderPaperSlots();
		}

        // 空想之天选之人：属性随机交换
		function processChosenSwap() {
			// 获取当前上限
			const researchMax = gameState.researchMax || 20;
			const socialMax = gameState.socialMax || 20;
			const favorMax = gameState.favorMax || 20;
			
			if (gameState.reversedAwakened) {
				const values = [gameState.research, gameState.social, gameState.favor, gameState.san, gameState.gold];
				const shuffled = shuffle([...values]);
				
				const oldStats = `科研${gameState.research}/${researchMax} 社交${gameState.social}/${socialMax} 好感${gameState.favor}/${favorMax} SAN${gameState.san}/${gameState.sanMax} 金${gameState.gold}`;
				
				// ★★★ 新逻辑：如果交换后的值超过上限，则提升上限 ★★★
				const newResearch = Math.max(0, shuffled[0]);
				const newSocial = Math.max(0, shuffled[1]);
				const newFavor = Math.max(0, shuffled[2]);
				const newSan = Math.max(0, shuffled[3]);
				const newGold = shuffled[4];
				
				// 更新上限（如果新值超过当前上限）
				if (newResearch > researchMax) gameState.researchMax = newResearch;
				if (newSocial > socialMax) gameState.socialMax = newSocial;
				if (newFavor > favorMax) gameState.favorMax = newFavor;
				if (newSan > gameState.sanMax) gameState.sanMax = newSan;
				
				// 设置新值
				gameState.research = newResearch;
				gameState.social = newSocial;
				gameState.favor = newFavor;
				gameState.san = newSan;
				gameState.gold = newGold;
				
				const newResearchMax = gameState.researchMax;
				const newSocialMax = gameState.socialMax;
				const newFavorMax = gameState.favorMax;
				
				const newStats = `科研${gameState.research}/${newResearchMax} 社交${gameState.social}/${newSocialMax} 好感${gameState.favor}/${newFavorMax} SAN${gameState.san}/${gameState.sanMax} 金${gameState.gold}`;
				
				// 检查是否有上限突破
				const breakthroughs = [];
				if (newResearchMax > researchMax) breakthroughs.push(`科研上限${researchMax}→${newResearchMax}`);
				if (newSocialMax > socialMax) breakthroughs.push(`社交上限${socialMax}→${newSocialMax}`);
				if (newFavorMax > favorMax) breakthroughs.push(`好感上限${favorMax}→${newFavorMax}`);
				if (gameState.sanMax > (gameState.sanMax - (newSan > gameState.sanMax - (newSan - shuffled[3]) ? newSan - shuffled[3] : 0))) {
					// 这个判断比较复杂，简化处理
				}
				
				const breakthroughText = breakthroughs.length > 0 ? `，上限突破：${breakthroughs.join('，')}` : '';
				addLog('命运轮盘', '全属性随机交换', `${oldStats} → ${newStats}${breakthroughText}`);
			} else {
				const stats1 = [gameState.research, gameState.social, gameState.favor];
				const shuffled1 = shuffle([...stats1]);
				
				const stats2 = [gameState.san, gameState.gold];
				const shuffled2 = shuffle([...stats2]);
				
				const oldStats = `科研${gameState.research}/${researchMax} 社交${gameState.social}/${socialMax} 好感${gameState.favor}/${favorMax} | SAN${gameState.san}/${gameState.sanMax} 金${gameState.gold}`;
				
				// ★★★ 新逻辑：如果交换后的值超过上限，则提升上限 ★★★
				const newResearch = Math.max(0, shuffled1[0]);
				const newSocial = Math.max(0, shuffled1[1]);
				const newFavor = Math.max(0, shuffled1[2]);
				const newSan = Math.max(0, shuffled2[0]);
				const newGold = shuffled2[1];
				
				// 更新上限
				if (newResearch > researchMax) gameState.researchMax = newResearch;
				if (newSocial > socialMax) gameState.socialMax = newSocial;
				if (newFavor > favorMax) gameState.favorMax = newFavor;
				if (newSan > gameState.sanMax) gameState.sanMax = newSan;
				
				// 设置新值
				gameState.research = newResearch;
				gameState.social = newSocial;
				gameState.favor = newFavor;
				gameState.san = newSan;
				gameState.gold = newGold;
				
				const newResearchMax = gameState.researchMax;
				const newSocialMax = gameState.socialMax;
				const newFavorMax = gameState.favorMax;
				
				const newStats = `科研${gameState.research}/${newResearchMax} 社交${gameState.social}/${newSocialMax} 好感${gameState.favor}/${newFavorMax} | SAN${gameState.san}/${gameState.sanMax} 金${gameState.gold}`;
				
				// 检查是否有上限突破
				const breakthroughs = [];
				if (newResearchMax > researchMax) breakthroughs.push(`科研上限→${newResearchMax}`);
				if (newSocialMax > socialMax) breakthroughs.push(`社交上限→${newSocialMax}`);
				if (newFavorMax > favorMax) breakthroughs.push(`好感上限→${newFavorMax}`);
				
				const breakthroughText = breakthroughs.length > 0 ? `，✨上限突破：${breakthroughs.join('，')}` : '';
				addLog('命运轮盘', '属性随机交换', `${oldStats} → ${newStats}${breakthroughText}`);
			}

			// ★★★ 修复：社交增加时检查解锁 ★★★
			checkSocialUnlock();
			checkResearchUnlock();
		}

		// ★★★ 新增：计算会议/期刊影响因子 ★★★
		function getConferenceImpactFactor(conferenceInfo, grade, journalType) {
			// ★★★ 期刊论文（Nature/子刊）固定影响因子1.0 ★★★
			if (grade === 'S' || journalType === 'nature' || journalType === 'nature-sub') {
				return 1.0;
			}

			// 如果没有统计数据，返回基础因子1.0
			if (!gameState.submissionStats || !conferenceInfo) {
				return 1.0;
			}
			
			const currentMonth = conferenceInfo.month || gameState.month || 1;
			const isReversed = gameState.isReversed;
			
			// 获取该会议的统计
			const currentKey = `${currentMonth}_${grade}_${isReversed}`;
			const currentStats = gameState.submissionStats[currentKey];
			
			if (!currentStats || currentStats.submissions < 10) {
				return 1.0;
			}
			
			// ★★★ 计算该会议的中稿均分 ★★★
			const currentAcceptedScores = [];
			if (currentStats.avgScorePoster > 0) currentAcceptedScores.push({ score: currentStats.avgScorePoster, count: currentStats.poster || 0 });
			if (currentStats.avgScoreOral > 0) currentAcceptedScores.push({ score: currentStats.avgScoreOral, count: currentStats.oral || 0 });
			if (currentStats.avgScoreBestPaper > 0) currentAcceptedScores.push({ score: currentStats.avgScoreBestPaper, count: currentStats.bestPaper || 0 });
			
			let currentAvgAcceptedScore = 0;
			let currentTotalAccepted = 0;
			currentAcceptedScores.forEach(item => {
				currentAvgAcceptedScore += item.score * item.count;
				currentTotalAccepted += item.count;
			});
			currentAvgAcceptedScore = currentTotalAccepted > 0 ? currentAvgAcceptedScore / currentTotalAccepted : 0;
			
			// ★★★ 计算同级别所有会议的平均投稿数量 ★★★
			let sameLevelTotalSubmissions = 0;
			let sameLevelConferenceCount = 0;
			
			for (let month = 1; month <= 12; month++) {
				const key = `${month}_${grade}_${isReversed}`;
				const stats = gameState.submissionStats[key];
				
				if (stats && stats.submissions >= 10) {
					sameLevelTotalSubmissions += stats.submissions;
					sameLevelConferenceCount++;
				}
			}
			
			// 同级别平均投稿数
			const sameLevelAvgSubmissions = sameLevelConferenceCount > 0 
				? sameLevelTotalSubmissions / sameLevelConferenceCount 
				: currentStats.submissions;
			
			// ★★★ 计算全体论文（所有等级A/B/C）的平均中稿均分 ★★★
			let allGradesTotalScore = 0;
			let allGradesCount = 0;
			
			for (const g of ['A', 'B', 'C']) {
				for (let month = 1; month <= 12; month++) {
					const key = `${month}_${g}_${isReversed}`;
					const stats = gameState.submissionStats[key];
					
					if (stats && stats.submissions >= 10) {
						// 计算该会议的中稿均分
						const acceptedScores = [];
						if (stats.avgScorePoster > 0) acceptedScores.push({ score: stats.avgScorePoster, count: stats.poster || 0 });
						if (stats.avgScoreOral > 0) acceptedScores.push({ score: stats.avgScoreOral, count: stats.oral || 0 });
						if (stats.avgScoreBestPaper > 0) acceptedScores.push({ score: stats.avgScoreBestPaper, count: stats.bestPaper || 0 });
						
						let avgScore = 0;
						let totalAccepted = 0;
						acceptedScores.forEach(item => {
							avgScore += item.score * item.count;
							totalAccepted += item.count;
						});
						avgScore = totalAccepted > 0 ? avgScore / totalAccepted : 0;
						
						if (avgScore > 0) {
							allGradesTotalScore += avgScore;
							allGradesCount++;
						}
					}
				}
			}
			
			// 全体论文平均分
			const allGradesAvgScore = allGradesCount > 0 ? allGradesTotalScore / allGradesCount : currentAvgAcceptedScore;
			
			// 如果没有有效数据，返回基础因子
			if (sameLevelAvgSubmissions === 0 || allGradesAvgScore === 0 || currentAvgAcceptedScore === 0) {
				return 1.0;
			}
			
			// ★★★ 新公式：影响因子 = (论文投稿数/同级别论文平均投稿数) * (论文平均分/全体论文平均分) ★★★
			const submissionRatio = currentStats.submissions / sameLevelAvgSubmissions;
			const scoreRatio = currentAvgAcceptedScore / allGradesAvgScore;
			
			let impactFactor = submissionRatio * scoreRatio;
			
			// 限制范围，避免极端值（0.2 ~ 4.0）
			impactFactor = Math.max(0.2, Math.min(4.0, impactFactor));
			
			return impactFactor;
		}

		function updateCitations() {
			gameState.publishedPapers.forEach(paper => {
				paper.monthsSincePublish = (paper.monthsSincePublish || 0) + 1;

				// 初始化小数累积字段
				if (paper.pendingCitationFraction === undefined) {
					paper.pendingCitationFraction = 0;
				}

				// ★★★ 初始化有效分数（首次使用中稿分数）★★★
				if (paper.effectiveScore === undefined) {
					paper.effectiveScore = paper.score;
				}

				// ★★★ 新计算方式：有效分数每月衰减当前值的5%（上取整）★★★
				// 注意：院士转博觉醒和期刊"分数不衰减"只对未中稿论文生效，已发表论文的引用计算不受影响
				const decay = Math.ceil(paper.effectiveScore * 0.05);
				paper.effectiveScore = Math.max(0, paper.effectiveScore - decay);

				// 基础增速 = 有效分数 * 0.1
				let baseGrowth = paper.effectiveScore * 0.1;

				// ★★★ 会议/期刊影响因子 ★★★
				const impactFactor = getConferenceImpactFactor(paper.conferenceInfo, paper.grade, paper.journalType);

				// ★★★ 推广倍率（加法效果）★★★
				let promotionRate = 0;  // 额外倍率（从0开始累加）

				// 接收类型加成（仅会议论文有效）
				if (paper.acceptType === 'Oral') {
					promotionRate += 0.5;  // oral提供50%倍率
				} else if (paper.acceptType === 'Best Paper') {
					promotionRate += 4.0;  // best paper提供400%倍率
				}

				// 推广加成
				if (paper.promotions?.arxiv) promotionRate += 0.25;
				if (paper.promotions?.github) promotionRate += 0.5;
				if (paper.promotions?.xiaohongshu) promotionRate += 0.25;

				// 同门合作加成（期刊论文不享受，因为不是所有人都能中S类）
				if (paper.grade !== 'S') {
					const fellowBonus = ((paper.citationMultiplier || 1) - 1) * 100 / 100;
					promotionRate += fellowBonus;
				}

				// 最终推广倍率 = 1 + 累加的所有加成
				const promotionMultiplier = 1 + promotionRate;

				// 最终增速 = 基础增速 × 影响因子 × 推广倍率
				const finalGrowth = baseGrowth * impactFactor * promotionMultiplier;

				// 加上之前累积的小数部分
				const totalGrowth = finalGrowth + paper.pendingCitationFraction;

				// 下取整得到本月实际增加的引用
				const actualGain = Math.floor(totalGrowth);

				// 保存小数部分到下个月
				paper.pendingCitationFraction = totalGrowth - actualGain;

				// 增加引用
				if (actualGain > 0) {
					paper.citations += actualGain;
					gameState.totalCitations += actualGain;

					// ★★★ 新增：检查引用里程碑 ★★★
					if (!gameState.citation100Month && gameState.totalCitations >= 100) {
						gameState.citation100Month = gameState.totalMonths;
						addCareerMilestone('citation_100', '总引用突破100', `论文开始被同行认可`);
					}
					if (!gameState.citation1000Month && gameState.totalCitations >= 1000) {
						gameState.citation1000Month = gameState.totalMonths;
						addCareerMilestone('citation_1000', '总引用突破1000', `成为领域内的知名学者`);
					}
				}
			});
		}
		
        // ==================== 毕业检查 ====================
        function checkGraduation() {
            if (gameState.pendingPhDChoice) {
                return;
            }

            // ★★★ 新增：延毕发Nature选择等待中 ★★★
            if (gameState.pendingNatureExtension) {
                return;
            }

            const maxMonths = gameState.maxYears * 12;

			if (gameState.degree === 'master') {
				// ★★★ 新增：检查本年度是否已做过转博选择 ★★★
				if (!gameState.phdChoiceMadeThisYear) {
					const requirements = getAdvisorRequirements();
					if ((gameState.year === 2 && gameState.month === 12 && gameState.totalScore >= requirements.phdYear2) ||
						(gameState.year === 3 && gameState.month === 12 && gameState.totalScore >= requirements.phdYear3)) {
						showPhDOptionModal();
						return;
					}
				}
			}

            // ★★★ 新增：博士第5年第12月延毕发Nature选择 ★★★
            if (gameState.degree === 'phd' && gameState.year === 5 && gameState.month === 12 && !gameState.natureExtensionChoiceMade) {
                const gradRequirements = getAdvisorRequirements();
                const hasNaturePaper = (gameState.paperNature || 0) >= 1 || (gameState.paperNatureSub || 0) >= 1;
                const meetsGradRequirement = gameState.totalScore >= gradRequirements.phdGrad;

                if (hasNaturePaper && meetsGradRequirement) {
                    showNatureExtensionModal();
                    return;
                }
            }

            // ★★★ 修改：毕业检查使用导师要求 ★★★
            if (gameState.totalMonths >= maxMonths) {
                const gradRequirements = getAdvisorRequirements();
                if (gameState.degree === 'master') {
                    if (gameState.totalScore >= gradRequirements.masterGrad) {
                        triggerEnding('master');
                    } else {
                        triggerEnding('delay');
                    }
                } else if (gameState.degree === 'phd') {
                    if (gameState.totalScore >= gradRequirements.phdGrad) {
                        triggerEnding('phd');
                    } else {
                        triggerEnding('delay');
                    }
                }
                return;
            }
        }

		// ★★★ 新增：延毕发Nature选择弹窗 ★★★
		function showNatureExtensionModal() {
			gameState.pendingNatureExtension = true;

			const hasNature = (gameState.paperNature || 0) >= 1;
			const hasNatureSub = (gameState.paperNatureSub || 0) >= 1;
			const paperType = hasNature ? 'Nature正刊' : 'Nature子刊';

			showModal('🏆 导师挽留',
				`<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:3rem;margin-bottom:10px;">🔬</div>
					<div style="font-size:1.1rem;font-weight:600;color:var(--primary-color);">导师：我有个想法...</div>
				</div>
				<div style="background:linear-gradient(135deg,rgba(155,89,182,0.1),rgba(142,68,173,0.1));border-radius:12px;padding:15px;margin-bottom:15px;border:2px solid rgba(155,89,182,0.3);">
					<p style="margin-bottom:10px;">你已经发表过<strong style="color:#9b59b6;">${paperType}</strong>，展现了顶尖的科研实力！</p>
					<p style="margin-bottom:10px;">导师希望你能<strong>延毕一年</strong>，集全组之力冲击<strong style="color:#b8860b;">Nature正刊</strong>！</p>
					<p style="font-size:0.85rem;color:var(--text-secondary);">这将是载入史册的成就！</p>
				</div>
				<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:15px;">
					<div style="font-size:0.85rem;color:var(--warning-color);margin-bottom:8px;">⚠️ 延毕年特殊规则：</div>
					<ul style="font-size:0.8rem;color:var(--text-secondary);margin:0;padding-left:20px;">
						<li>游戏时间延长1年（共6年）</li>
						<li>延毕年<strong>没有</strong>奖学金评定</li>
						<li>延毕年<strong>没有</strong>寒暑假事件</li>
						<li>全力冲击Nature！</li>
					</ul>
				</div>`,
				[
					{ text: '🎓 按时毕业', class: 'btn-info', action: () => {
						gameState.pendingNatureExtension = false;
						gameState.natureExtensionChoiceMade = true;
						addLog('导师挽留', '选择按时毕业', '婉拒了导师的挽留');
						closeModal();
						// 触发学年总结，然后正常毕业
						setTimeout(() => triggerYearEndSummaryEvent(), 200);
					}},
					{ text: '🔬 延毕冲Nature！', class: 'btn-primary', action: () => {
						gameState.pendingNatureExtension = false;
						gameState.natureExtensionChoiceMade = true;
						gameState.isNatureExtensionYear = true;  // 标记延毕年
						gameState.maxYears = 6;  // 延长1年
						addLog('导师挽留', '选择延毕冲击Nature', '游戏时间延长至6年，全力冲击Nature！');
						closeModal();
						// 触发学年总结
						setTimeout(() => triggerYearEndSummaryEvent(), 200);
					}}
				]
			);
		}

		// ★★★ 新增：转博未达标弹窗 ★★★
		function showMissedPhDOpportunityModal(requirements) {
			// 只在第2年或第3年的12月显示（硕士阶段）
			if (gameState.degree !== 'master' || (gameState.year !== 2 && gameState.year !== 3)) {
				triggerYearEndSummaryEvent();
				return;
			}

			const isSecondYear = gameState.year === 2;
			const requiredScore = isSecondYear ? requirements.phdYear2 : requirements.phdYear3;
			const currentScore = gameState.totalScore;
			const gap = requiredScore - currentScore;

			const yearText = isSecondYear ? '第二年' : '第三年';
			const nextChanceText = isSecondYear
				? `<p style="color:var(--success-color);font-size:0.85rem;">💡 不用灰心！明年还有一次转博机会，需要科研分≥${requirements.phdYear3}分</p>`
				: `<p style="color:var(--text-secondary);font-size:0.85rem;">这是硕士阶段最后的转博机会，将继续完成硕士学业</p>`;

			showModal('😔 转博未达标',
				`<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:3rem;margin-bottom:10px;">📉</div>
					<div style="font-size:1.1rem;font-weight:600;color:var(--danger-color);">很遗憾，${yearText}转博未达到要求</div>
				</div>
				<div style="background:var(--light-bg);border-radius:10px;padding:15px;margin-bottom:15px;">
					<div style="display:flex;justify-content:space-between;margin-bottom:8px;">
						<span>转博要求</span>
						<span style="font-weight:600;color:var(--primary-color);">≥${requiredScore}分</span>
					</div>
					<div style="display:flex;justify-content:space-between;margin-bottom:8px;">
						<span>当前科研分</span>
						<span style="font-weight:600;color:var(--danger-color);">${currentScore}分</span>
					</div>
					<div style="display:flex;justify-content:space-between;">
						<span>差距</span>
						<span style="font-weight:600;color:var(--warning-color);">${gap}分</span>
					</div>
				</div>
				${nextChanceText}`,
				[{ text: '继续', class: 'btn-primary', action: () => {
					closeModal();
					// 关闭弹窗后触发学年总结
					setTimeout(() => triggerYearEndSummaryEvent(), 200);
				}}]
			);
		}

		function showPhDOptionModal() {
			// ★★★ 修改：使用导师要求 ★★★
			const requirements = getAdvisorRequirements();

			if (gameState.totalScore >= requirements.phdGrad) {
				gameState.achievementConditions = gameState.achievementConditions || {};
				gameState.achievementConditions.phdRequirementMetEarly = true;
			}

			gameState.pendingPhDChoice = true;

			const isSecondYear = gameState.year === 2;
			const notPhDText = isSecondYear ? '继续读硕士' : '硕士毕业';
			const requirementText = isSecondYear ? `≥${requirements.phdYear2}分` : `≥${requirements.phdYear3}分`;
			const notPhDDesc = isSecondYear
				? `<p style="color:var(--text-secondary);font-size:0.85rem;">选择继续读硕士，明年还有一次转博机会，但竞争更激烈，需要科研分≥${requirements.phdYear3}分</p>`
				: '';

			showModal('🎓 转博选择',
				`<p>恭喜！你的科研成绩优异（${requirementText}），获得了转博资格！</p>
				 <p>是否选择继续攻读博士学位？</p>
				 <p style="color:var(--text-secondary);font-size:0.85rem;">博士毕业要求：科研分≥${requirements.phdGrad}，学习年限5年</p>
				 ${notPhDDesc}
				 <div style="margin-top:12px;padding:10px;background:linear-gradient(135deg,rgba(253,203,110,0.15),rgba(0,184,148,0.15));border-radius:8px;border-left:3px solid var(--success-color);">
					 <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">
						 💡 <strong>神秘老人：</strong>如果你取得了每一年的奖学金、拥有一篇A类论文，那么祝贺你，你的前期是比较成功的！
					 </p>
				 </div>`,
				[
					{ text: notPhDText, class: 'btn-info', action: () => { 
						gameState.pendingPhDChoice = false;
						gameState.phdChoiceMadeThisYear = true; 
						gameState.phdOpportunitiesRejected = (gameState.phdOpportunitiesRejected || 0) + 1;
						if (gameState.phdOpportunitiesRejected >= 2) {
							gameState.achievementConditions = gameState.achievementConditions || {};
							gameState.achievementConditions.rejectedPhdTwice = true;
						}
						closeModal();
						
						if (isSecondYear) {
							addLog('转博选择', '选择继续读硕士', '明年还有一次转博机会');
							updateAllUI();
							
							// ★★★ 继续读硕士后触发学年总结 ★★★
							setTimeout(() => triggerYearEndSummaryEvent(), 300);
						} else {
							// ★★★ 第3年选择硕士毕业：先学年总结，再毕业 ★★★
							addLog('转博选择', '选择硕士毕业', '准备毕业');
							// 触发学年总结，学年总结回调中的 checkGraduation() 会触发毕业
							setTimeout(() => triggerYearEndSummaryEvent(), 300);
						}
					}},
					{ text: '📚 转为博士', class: 'btn-primary', action: () => {
						gameState.pendingPhDChoice = false;
						gameState.phdChoiceMadeThisYear = true;
						gameState.degree = 'phd';
						gameState.maxYears = 5;
						// ★★★ 新增：记录转博里程碑 ★★★
						addCareerMilestone('phd_convert', '转博成功', '开启博士之旅');
						closeModal();
						// ★★★ 转博渡劫弹窗，渡劫完成后会触发学年总结 ★★★
						setTimeout(() => showPhDTribulationModal(), 200);
					}}
				]
			);
		}

        // ★★★ 关键修改：转博觉醒函数 ★★★

		function showPhDTribulationModal() {
			const character = gameState.character;
			
			// ★★★ 修复：防御性检查，优先处理真·大多数 ★★★
			if (character === 'true-normal' || gameState.isTrueNormal) {
				// 确保状态一致
				gameState.isTrueNormal = true;

				// ★★★ 新增：往昔荣光效果 - 成就币翻倍 ★★★
				const oldAchievementCoins = gameState.achievementCoins;
				gameState.achievementCoins = gameState.achievementCoins * 2;
				// ★★★ 成就商店刷新间隔变为2个月 ★★★
				gameState.achievementShopRefreshInterval = 2;
				gameState.trueNormalAwakened = true;

				const html = `
					<div style="text-align:center;">
						<div style="font-size:4rem;margin-bottom:15px;"><span class="gold-icon">👤</span></div>
						<div style="font-size:1.5rem;font-weight:700;background:linear-gradient(135deg,#ffd700,#ff8c00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:10px;">
							转博成功
						</div>
						<div style="font-size:0.95rem;color:var(--text-secondary);margin-bottom:20px;">
							作为真·大多数，你的往昔经历化为力量！
						</div>
					</div>

					<div style="background:linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,140,0,0.15));border-radius:12px;padding:15px;margin-bottom:15px;border:2px solid rgba(255,140,0,0.3);">
						<div style="text-align:center;margin-bottom:12px;">
							<div style="font-size:1.3rem;font-weight:700;color:#d68910;margin-bottom:5px;">✨ 往昔荣光</div>
							<div style="font-size:0.85rem;color:var(--text-secondary);font-style:italic;">过去的成就不会被遗忘</div>
						</div>
						<div style="background:white;border-radius:8px;padding:12px;text-align:center;">
							<div style="font-size:0.9rem;color:var(--text-secondary);">
								成就币翻倍：${oldAchievementCoins} → ${gameState.achievementCoins}<br>
								成就商店刷新间隔：1月 → 2月<br>
								更多机会获取强力道具！
							</div>
						</div>
					</div>

					<div style="text-align:center;padding:10px;background:var(--light-bg);border-radius:8px;font-size:0.85rem;">
						<div style="color:#d68910;font-weight:600;margin-bottom:5px;">📜 真实的博士之路</div>
						<div style="color:var(--text-secondary);">博士毕业要求：科研分 ≥ 7</div>
					</div>
				`;

				showModal('🎓 真·转博', html, [
					{ text: '✨ 往昔荣光！', class: 'btn-warning', action: () => {
						addLog('真·转博', '触发【往昔荣光】', `成就币 ${oldAchievementCoins} → ${gameState.achievementCoins}，商店刷新间隔变为2月`);
						closeModal();
						updateAllUI();
						renderPaperSlots();
						
						// ★★★ 转博后触发学年总结 ★★★
						setTimeout(() => triggerYearEndSummaryEvent(), 300);
					}}
				]);
				
				return;
			}
			
			const charData = characters.find(c => c.id === character);
			
			// ★★★ 新增：角色数据不存在时的错误处理 ★★★
			if (!charData) {
				console.error('无法找到角色数据:', character);
				showModal('⚠️ 错误', '<p>角色数据加载失败，请重新开始游戏。</p>', 
					[{ text: '确定', class: 'btn-primary', action: () => {
						closeModal();
						restartGame();
					}}]);
				return;
			}
			
			// ★★★ 逆位角色觉醒（保持原有逻辑不变）★★★
			if (gameState.isReversed) {
				gameState.reversedAwakened = true;
				
				let effectName = '';
				let effectDesc = '';
				let bonusDetails = [];
				
				switch (character) {
					case 'normal': // 怠惰之大多数
						effectName = '💀 极致怠惰';
						effectDesc = '懒惰的极致就是一切都翻倍...包括痛苦';
						const oldR1 = gameState.research, oldS1 = gameState.social, oldF1 = gameState.favor;
						const oldSanMax1 = gameState.sanMax;
						gameState.research = Math.min(20, gameState.research * 2);
						gameState.social = Math.min(20, gameState.social * 2);
						gameState.favor = Math.min(20, gameState.favor * 2);
						// ★★★ 修改：SAN上限+50%（上取整）★★★
						const sanMaxGain = Math.ceil(gameState.sanMax * 0.5);
						gameState.sanMax = gameState.sanMax + sanMaxGain;
						// ★★★ 标记怠惰觉醒，用于每月SAN恢复计算 ★★★
						gameState.slothAwakened = true;
						// ★★★ 金币不翻倍 ★★★
						bonusDetails.push(`科研 ${oldR1} → ${gameState.research}`);
						bonusDetails.push(`社交 ${oldS1} → ${gameState.social}`);
						bonusDetails.push(`好感 ${oldF1} → ${gameState.favor}`);
						bonusDetails.push(`SAN上限 ${oldSanMax1} → ${gameState.sanMax}（+50%上取整）`);
						bonusDetails.push('💰 金币不翻倍');
						bonusDetails.push('⚠️ SAN减少变为3倍');
						bonusDetails.push('✨ 每月SAN+已损SAN的10%（上取整）');

						const mentorshipBuff = gameState.buffs.permanent.find(b => b.type === 'mentorship');
						if (mentorshipBuff) {
							mentorshipBuff.desc = '每月SAN-3（怠惰×3），总引用+科研能力值';
						}
						// ★★★ 修复：社交增加时检查解锁 ★★★
						checkSocialUnlock();
						break;
						
					case 'genius': // 愚钝之院士转世
						effectName = '🎭 大智若愚';
						effectDesc = '真正的智慧不在于科研数值';
						bonusDetails.push('科研提升转化效果升级');
						bonusDetails.push('每1点科研提升 → 好感+2, SAN+6, 社交+2, 金+6');
						break;
						
					case 'social': // 嫉妒之社交达人
						effectName = '👁️ 嫉妒重置';
						effectDesc = '社交能力重置，触发连带效果';
						const oldSocialVal = gameState.social;
						if (oldSocialVal > 5) {
							const decrease = oldSocialVal - 5;
							gameState.research = Math.min(20, gameState.research + decrease);
							gameState.favor = Math.min(20, gameState.favor + decrease);
							bonusDetails.push(`社交 ${oldSocialVal} → 5`);
							bonusDetails.push(`触发嫉妒转化：科研+${decrease}, 好感+${decrease}`);
						} else if (oldSocialVal < 5) {
							const increase = 5 - oldSocialVal;
							gameState.san = Math.min(gameState.sanMax, gameState.san + increase);
							gameState.gold += increase;
							bonusDetails.push(`社交 ${oldSocialVal} → 5`);
							bonusDetails.push(`触发嫉妒反馈：SAN+${increase}, 金钱+${increase}`);
						} else {
							bonusDetails.push('社交已经是5，无变化');
						}
						gameState.social = 5;
						break;
						
					case 'rich':
						effectName = '💸 金钱的力量';
						effectDesc = '属性每月衰减，但金钱生金钱，消费金币提升属性';
						gameState.goldSpentTotal = 0;
						bonusDetails.push('✨ 每月SAN/科研/社交/好感降低15%（上取整）');
						bonusDetails.push('✨ 每花费4金币 → SAN+1, 科研+1, 社交+1, 好感+1');
						bonusDetails.push('✨ 每月金钱+6%（上取整）');
						bonusDetails.push('💰 用钱生钱，对抗衰减！');
						break;

					case 'teacher-child': // 玩世之导师子女
						effectName = '🃏 变本加厉';
						effectDesc = '叛逆到底，但收益依旧';
						bonusDetails.push('好感归零时重置为4（原为6）');
						bonusDetails.push('重置时仍获得：社交+1，科研+1，金币+2');
						break;
						
					case 'chosen': // 空想之天选之人
						effectName = '🎲 命运轮盘';
						effectDesc = '五属性全部加入轮盘赌局';
						bonusDetails.push('每月随机交换升级');
						bonusDetails.push('科研/社交/好感/SAN/金 全部参与交换');
						break;
				}
				
				checkResearchUnlock(true);
				
				const html = `
					<div style="text-align:center;">
						<div style="font-size:4rem;margin-bottom:15px;animation:pulse 1s infinite;">🌑</div>
						<div style="font-size:1.5rem;font-weight:700;background:linear-gradient(135deg,#9b59b6,#e74c3c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:10px;">
							逆位觉醒！
						</div>
						<div style="font-size:0.95rem;color:var(--text-secondary);margin-bottom:20px;">
							黑暗中蕴含的力量已被激活...
						</div>
					</div>
					
					<div style="background:linear-gradient(135deg,rgba(155,89,182,0.2),rgba(231,76,60,0.2));border-radius:12px;padding:15px;margin-bottom:15px;border:2px solid rgba(231,76,60,0.5);">
						<div style="text-align:center;margin-bottom:12px;">
							<div style="font-size:1.3rem;font-weight:700;color:#e74c3c;margin-bottom:5px;">${effectName}</div>
							<div style="font-size:0.85rem;color:var(--text-secondary);font-style:italic;">${effectDesc}</div>
						</div>
						<div style="background:rgba(0,0,0,0.2);border-radius:8px;padding:12px;">
							<div style="font-size:0.8rem;color:#a0a0a0;margin-bottom:8px;text-align:center;">🌙 觉醒效果 🌙</div>
							<div style="display:flex;flex-direction:column;gap:6px;">
								${bonusDetails.map(detail => `
									<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:6px 12px;background:linear-gradient(135deg,rgba(155,89,182,0.2),rgba(231,76,60,0.2));border-radius:6px;font-size:0.85rem;font-weight:500;color:#e74c3c;">
										${detail.startsWith('⚠️') || detail.startsWith('✨') || detail.startsWith('💰') ? '' : '<i class="fas fa-moon"></i>'} ${detail}
									</div>
								`).join('')}
							</div>
						</div>
					</div>
					
					<div style="text-align:center;padding:10px;background:rgba(0,0,0,0.1);border-radius:8px;font-size:0.85rem;">
						<div style="color:#9b59b6;font-weight:600;margin-bottom:5px;">📜 继续你的黑暗旅程</div>
						<div style="color:var(--text-secondary);">博士毕业要求：科研分 ≥ 7</div>
					</div>
				`;
				
				showModal('🌑 逆位觉醒', html, [
					{ text: '🌙 拥抱黑暗', class: 'btn-danger', action: () => {
						addLog('逆位觉醒', `触发【${effectName}】`, bonusDetails.join('，'));
						// ★★★ 新增：添加觉醒里程碑 ★★★
						addCareerMilestone('awaken', '逆位觉醒', effectName);
						closeModal();
						updateAllUI();
						renderPaperSlots();

						// ★★★ 逆位觉醒后触发学年总结 ★★★
						setTimeout(() => triggerYearEndSummaryEvent(), 300);
					}}
				]);
				
				return;
			}
			
			// ★★★ 正位角色：检查是否满足隐藏觉醒条件 ★★★
			const hasHiddenAwaken = charData.hiddenAwakenCondition && charData.hiddenAwakenCondition(gameState);
			
			if (hasHiddenAwaken) {
				// 显示二选一弹窗
				showAwakenChoiceModal(charData);
			} else {
				// 直接触发普通觉醒
				applyNormalAwaken(charData);
			}
		}

		// ★★★ 新增：显示觉醒二选一弹窗 ★★★
		function showAwakenChoiceModal(charData) {
			const character = gameState.character;
			
			const html = `
				<div style="text-align:center;">
					<div style="font-size:3rem;margin-bottom:15px;animation:pulse 1s infinite;">⚡</div>
					<div style="font-size:1.3rem;font-weight:700;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:10px;">
						渡劫成功！觉醒分支出现！
					</div>
					<div style="font-size:0.9rem;color:var(--text-secondary);margin-bottom:20px;">
						你满足了隐藏觉醒的触发条件，请选择你的觉醒路线：
					</div>
				</div>
				
				<div style="display:flex;flex-direction:column;gap:15px;margin-bottom:20px;">
					<!-- 普通觉醒选项 -->
					<div style="background:linear-gradient(135deg,rgba(102,126,234,0.15),rgba(118,75,162,0.15));border-radius:12px;padding:15px;border:2px solid rgba(102,126,234,0.3);cursor:pointer;transition:all 0.3s;" 
						 onmouseover="this.style.borderColor='rgba(102,126,234,0.8)';this.style.transform='translateY(-2px)'"
						 onmouseout="this.style.borderColor='rgba(102,126,234,0.3)';this.style.transform='translateY(0)'"
						 onclick="selectAwaken('normal')">
						<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
							<span style="font-size:1.5rem;">${charData.awakenIcon}</span>
							<span style="font-size:1.1rem;font-weight:700;color:#667eea;">${charData.awakenName}</span>
						</div>
						<div style="font-size:0.85rem;color:var(--text-secondary);">${charData.awakenDesc}</div>
					</div>
					
					<!-- 隐藏觉醒选项 -->
					<div style="background:linear-gradient(135deg,rgba(253,203,110,0.2),rgba(243,156,18,0.2));border-radius:12px;padding:15px;border:2px dashed rgba(243,156,18,0.5);cursor:pointer;transition:all 0.3s;position:relative;" 
						 onmouseover="this.style.borderColor='rgba(243,156,18,1)';this.style.transform='translateY(-2px)'"
						 onmouseout="this.style.borderColor='rgba(243,156,18,0.5)';this.style.transform='translateY(0)'"
						 onclick="selectAwaken('hidden')">
						<div style="position:absolute;top:-8px;right:10px;background:linear-gradient(135deg,#f39c12,#e74c3c);color:white;padding:2px 8px;border-radius:10px;font-size:0.65rem;font-weight:600;">⚙️ 隐藏觉醒</div>
						<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
							<span style="font-size:1.5rem;">${charData.hiddenAwakenIcon}</span>
							<span style="font-size:1.1rem;font-weight:700;color:#f39c12;">${charData.hiddenAwakenName}</span>
						</div>
						<div style="font-size:0.85rem;color:var(--text-secondary);">${charData.hiddenAwakenDesc}</div>
					</div>
				</div>
				
				<div style="text-align:center;padding:10px;background:var(--light-bg);border-radius:8px;font-size:0.8rem;color:var(--text-secondary);">
					<i class="fas fa-info-circle"></i> 选择后无法更改，请谨慎决定！
				</div>
			`;
			
			// 定义全局选择函数
			window.selectAwaken = function(type) {
				closeModal();
				if (type === 'hidden') {
					applyHiddenAwaken(charData);
				} else {
					applyNormalAwaken(charData);
				}
			};
			
			showModal('⚡ 觉醒选择', html, []);
		}

		// ★★★ 新增：应用隐藏觉醒效果 ★★★
		function applyHiddenAwaken(charData) {
			const character = gameState.character;
			gameState.hiddenAwakened = true;
			gameState.hiddenAwakenType = character;
			
			let effectName = charData.hiddenAwakenIcon + ' ' + charData.hiddenAwakenName;
			let effectDesc = charData.hiddenAwakenDesc;
			let bonusDetails = [];
			
			switch (character) {
				case 'normal': // 勤能补拙
					gameState.actionLimit = 2;
					bonusDetails.push('每月行动次数：1 → 2');
					bonusDetails.push('看论文/打工/想idea/做实验/写论文每月可执行2次');
					break;
					
				case 'genius': // 预见未来热点
					gameState.noDecay = true;
					bonusDetails.push('论文idea分数不再每月衰减');
					bonusDetails.push('论文实验分数不再每月衰减');
					bonusDetails.push('✨ 论文质量将更加稳定！');
					break;
					
				case 'social': // 师兄师姐救我
					// ★★★ 修改：社交变为6 + 技能 ★★★
					const oldSocialHidden = gameState.social;
					gameState.social = 6;
					// ★★★ 修复：检查并解锁人际关系槽 ★★★
					checkSocialUnlock();
					gameState.hasSeniorHelpSkill = true;
					gameState.seniorHelpUses = 3;
					bonusDetails.push(`社交能力 ${oldSocialHidden} → 6`);
					bonusDetails.push('获得主动技能【师兄师姐救我】');
					bonusDetails.push('使用后：下次生产论文时科研能力视为 科研+社交');
					bonusDetails.push('⚠️ 此技能可使用3次');
					break;

				case 'rich': // 白手起家术
					// ★★★ 修改：打工/实习金钱翻倍 ★★★
					gameState.incomeDoubled = true;
					bonusDetails.push('后续打工的金钱收入翻倍');
					bonusDetails.push('后续实习的金钱收入翻倍');
					bonusDetails.push('💰 白手起家，财富翻倍！');
					break;

				case 'teacher-child': // 导师救我
					// ★★★ 修改：好感度变为6 + 技能 ★★★
					const oldFavorHidden = gameState.favor;
					gameState.favor = 6;
					gameState.hasTeacherHelpSkill = true;
					gameState.teacherHelpUses = 3;
					bonusDetails.push(`导师好感度 ${oldFavorHidden} → 6`);
					bonusDetails.push('获得主动技能【导师救我】');
					bonusDetails.push('使用后：下次生产论文时科研能力视为 科研+好感度');
					bonusDetails.push('⚠️ 此技能可使用3次');
					break;
					
				case 'chosen': // 孤注一掷
					// 需要让玩家选择保留哪个属性
					showAllInChoiceModal();
					return; // 提前返回，由选择弹窗处理后续
			}
			
			checkResearchUnlock(true);
			showHiddenAwakenResultModal(effectName, effectDesc, bonusDetails);
		}

		// ★★★ 新增：孤注一掷属性选择弹窗 ★★★
		function showAllInChoiceModal() {
			const currentVal = gameState.research; // 三项相等
			const transferVal = (currentVal - 1) * 2; // 两项变1后转移的值
			
			const html = `
				<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:2.5rem;margin-bottom:10px;">🎯</div>
					<div style="font-size:1.1rem;font-weight:600;color:#f39c12;margin-bottom:5px;">孤注一掷</div>
					<div style="font-size:0.85rem;color:var(--text-secondary);">选择你要强化的属性，其他两项将变为1</div>
				</div>
				
				<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:15px;text-align:center;">
					<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:5px;">当前属性均为 ${currentVal}</div>
					<div style="font-size:0.85rem;">选择后：主属性 +${transferVal}，其他两项变为1</div>
				</div>
				
				<div style="display:flex;flex-direction:column;gap:10px;">
					<button class="btn btn-primary" style="width:100%;padding:12px;" onclick="applyAllIn('research')">
						<i class="fas fa-flask"></i> 强化科研能力 → ${currentVal + transferVal}
					</button>
					<button class="btn btn-success" style="width:100%;padding:12px;" onclick="applyAllIn('social')">
						<i class="fas fa-users"></i> 强化社交能力 → ${currentVal + transferVal}
					</button>
					<button class="btn btn-accent" style="width:100%;padding:12px;" onclick="applyAllIn('favor')">
						<i class="fas fa-heart"></i> 强化导师好感度 → ${currentVal + transferVal}
					</button>
				</div>
			`;
			
			window.applyAllIn = function(targetStat) {
				const oldVal = gameState.research; // 三项相等
				const transferVal = (oldVal - 1) * 2;
				const newVal = Math.min(20, oldVal + transferVal);
				
				const bonusDetails = [];
				
				if (targetStat === 'research') {
					gameState.research = newVal;
					gameState.social = 1;
					gameState.favor = 1;
					bonusDetails.push(`科研能力 ${oldVal} → ${newVal}`);
					bonusDetails.push(`社交能力 ${oldVal} → 1`);
					bonusDetails.push(`导师好感度 ${oldVal} → 1`);
				} else if (targetStat === 'social') {
					gameState.research = 1;
					gameState.social = newVal;
					gameState.favor = 1;
					bonusDetails.push(`科研能力 ${oldVal} → 1`);
					bonusDetails.push(`社交能力 ${oldVal} → ${newVal}`);
					bonusDetails.push(`导师好感度 ${oldVal} → 1`);
				} else {
					gameState.research = 1;
					gameState.social = 1;
					gameState.favor = newVal;
					bonusDetails.push(`科研能力 ${oldVal} → 1`);
					bonusDetails.push(`社交能力 ${oldVal} → 1`);
					bonusDetails.push(`导师好感度 ${oldVal} → ${newVal}`);
				}
				
				gameState.hiddenAwakened = true;
				gameState.hiddenAwakenType = 'chosen';
				
				closeModal();
				// ★★★ 修复：社交增加时检查解锁 ★★★
				checkSocialUnlock();
				checkResearchUnlock(true);
				showHiddenAwakenResultModal('🎯 孤注一掷', '将全部力量集中到一点！', bonusDetails);
			};
			
			showModal('🎯 孤注一掷 - 选择强化属性', html, []);
		}

		// ★★★ 新增：显示隐藏觉醒结果弹窗 ★★★
		function showHiddenAwakenResultModal(effectName, effectDesc, bonusDetails) {
			const html = `
				<div style="text-align:center;">
					<div style="font-size:4rem;margin-bottom:15px;animation:pulse 1s infinite;">⚙️</div>
					<div style="font-size:1.5rem;font-weight:700;background:linear-gradient(135deg,#f39c12,#e74c3c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:10px;">
						隐藏觉醒触发！
					</div>
					<div style="font-size:0.95rem;color:var(--text-secondary);margin-bottom:20px;">
						你发现了不同寻常的道路...
					</div>
				</div>
				
				<div style="background:linear-gradient(135deg,rgba(253,203,110,0.2),rgba(243,156,18,0.2));border-radius:12px;padding:15px;margin-bottom:15px;border:2px solid rgba(243,156,18,0.5);">
					<div style="text-align:center;margin-bottom:12px;">
						<div style="font-size:1.3rem;font-weight:700;color:#f39c12;margin-bottom:5px;">${effectName}</div>
						<div style="font-size:0.85rem;color:var(--text-secondary);font-style:italic;">${effectDesc}</div>
					</div>
					<div style="background:white;border-radius:8px;padding:12px;">
						<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:8px;text-align:center;">⚙️ 觉醒效果 ⚙️</div>
						<div style="display:flex;flex-direction:column;gap:6px;">
							${bonusDetails.map(detail => `
								<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:6px 12px;background:linear-gradient(135deg,rgba(253,203,110,0.15),rgba(243,156,18,0.15));border-radius:6px;font-size:0.85rem;font-weight:500;color:#d68910;">
									${detail.startsWith('⚠️') || detail.startsWith('✨') ? '' : '<i class="fas fa-star"></i>'} ${detail}
								</div>
							`).join('')}
						</div>
					</div>
				</div>
				
				<div style="text-align:center;padding:10px;background:var(--light-bg);border-radius:8px;font-size:0.85rem;">
					<div style="color:var(--primary-color);font-weight:600;margin-bottom:5px;">📜 开启博士修炼之路</div>
					<div style="color:var(--text-secondary);">博士毕业要求：科研分 ≥ 7</div>
				</div>
			`;
			
			showModal('⚙️ 隐藏觉醒', html, [
				{ text: '🎯 踏上独特之路', class: 'btn-warning', action: () => {
					addLog('隐藏觉醒', `触发【${effectName}】`, bonusDetails.join('，'));
					closeModal();
					updateAllUI();
					renderPaperSlots();
					
					// ★★★ 隐藏觉醒后触发学年总结 ★★★
					setTimeout(() => triggerYearEndSummaryEvent(), 300);
				}}
			]);
		}

		// ★★★ 新增：应用普通觉醒效果（原有逻辑提取） ★★★
		function applyNormalAwaken(charData) {
			const character = gameState.character;
			let effectName = '';
			let effectDesc = '';
			let bonusDetails = [];
			
			switch (character) {
				case 'genius':
					effectName = '🧬 学术天赋觉醒';
					effectDesc = '院士转世的血脉开始沸腾，过往成就化为实力！';
					// ★★★ 修改：S类论文计入A类数量（Nature/Nature子刊 > A类）★★★
					const paperS_genius = (gameState.paperNature || 0) + (gameState.paperNatureSub || 0);
					const aCount = (gameState.paperA || 0) + paperS_genius;
					if (aCount > 0) {
						// 每篇A/S类论文科研+2，上限+4
						const researchGain = aCount * 2;
						const maxGain = aCount * 4;
						gameState.researchMax = (gameState.researchMax || 20) + maxGain;
						gameState.research = Math.min(gameState.researchMax, gameState.research + researchGain);
						const aOnlyCount = gameState.paperA || 0;
						const sCount = paperS_genius;
						const paperText = sCount > 0 ? `A/S类论文 ${aCount} 篇（A×${aOnlyCount}, S×${sCount}）` : `A类论文 ${aCount} 篇`;
						bonusDetails.push(paperText);
						bonusDetails.push(`科研能力 +${researchGain}`);
						bonusDetails.push(`科研能力上限 +${maxGain}（现为${gameState.researchMax}）`);
					} else {
						bonusDetails.push('暂无A类或S类论文，继续努力！');
					}
					break;
					
				case 'social':
					effectName = '🌐 人脉网络激活';
					effectDesc = '社交达人的人脉全面绽放，冥冥之中影响了审稿人分布！';
					gameState.socialAwakened = true;

					// ★★★ 修改：实际用于计算的社交能力为 min(20, 社交+5) ★★★
					const actualSocialVal = Math.min(20, gameState.social + 5);
					const socialVal = actualSocialVal;
					let normalP = Math.max(0, 0.40 - socialVal * 0.01);
					let kindP = 0.10 + socialVal * 0.005;
					let expertP = 0.10 + socialVal * 0.01;
					let hostileP = Math.max(0, 0.10 - socialVal * 0.005);
					let gptP = Math.max(0, 0.20 - socialVal * 0.005);
					let questionsP = Math.max(0, 0.10 - socialVal * 0.005);

					const totalP = normalP + kindP + expertP + hostileP + gptP + questionsP;
					normalP /= totalP;
					kindP /= totalP;
					expertP /= totalP;
					hostileP /= totalP;
					gptP /= totalP;
					questionsP /= totalP;

					gameState.reviewerDistribution = {
						normal: normalP,
						kind: kindP,
						expert: expertP,
						hostile: hostileP,
						gpt: gptP,
						questions: questionsP
					};

					bonusDetails.push(`转博时社交: ${gameState.social}（+5加成后按${actualSocialVal}计算）`);
					bonusDetails.push(`审稿人分布已永久改变`);
					break;
					
				case 'rich':
					effectName = '💎 财富倍增术';
					effectDesc = '富可敌国的底蕴显现，金币储备瞬间翻三倍！';
					const oldGold = gameState.gold;
					gameState.gold = gameState.gold * 3;
					bonusDetails.push(`金币 ${oldGold} → ${gameState.gold} (×3)`);
					break;
					
				case 'teacher-child':
					effectName = '👑 血脉共鸣';
					effectDesc = '导师子女的身份优势凸显，好感度转化为科研能力和工资！';
					// ★★★ 修改：每5好感度提升1科研，0.5月工资 ★★★
					const oldFavorTC = gameState.favor;
					const researchGainTC = Math.floor(oldFavorTC / 5);
					const wageGainTC = Math.floor(oldFavorTC / 5) * 0.5;
					if (researchGainTC > 0) {
						gameState.research = Math.min(gameState.researchMax || 20, gameState.research + researchGainTC);
						gameState.monthlyWageBonus = (gameState.monthlyWageBonus || 0) + wageGainTC;
						bonusDetails.push(`好感度 ${oldFavorTC}（每5点转化）`);
						bonusDetails.push(`科研能力 +${researchGainTC}`);
						bonusDetails.push(`每月工资 +${wageGainTC}`);
					} else {
						bonusDetails.push(`好感度不足5，暂无转化`);
					}
					break;
					
				case 'chosen':
					effectName = '✨ 查缺补漏';
					effectDesc = '天选之人的命运齿轮转动，短板瞬间补齐！';
					const maxStat = Math.max(gameState.research, gameState.social, gameState.favor);
					const oldStats = { research: gameState.research, social: gameState.social, favor: gameState.favor };
					gameState.research = Math.min(20, maxStat);
					gameState.social = Math.min(20, maxStat);
					gameState.favor = Math.min(20, maxStat);
					if (oldStats.research !== maxStat) bonusDetails.push(`科研能力 ${oldStats.research} → ${gameState.research}`);
					if (oldStats.social !== maxStat) bonusDetails.push(`社交能力 ${oldStats.social} → ${gameState.social}`);
					if (oldStats.favor !== maxStat) bonusDetails.push(`导师好感度 ${oldStats.favor} → ${gameState.favor}`);
					if (bonusDetails.length === 0) bonusDetails.push('属性已达最优，无需补齐');
					break;
					
				case 'normal':
				default:
					effectName = '🔥 我命由我不由天';
					effectDesc = '平凡之人爆发出惊人潜力，全面突破自我极限！';
					const oldR = gameState.research, oldS = gameState.social, oldF = gameState.favor, oldG = gameState.gold;
					gameState.research = Math.min(20, gameState.research * 2);
					gameState.social = Math.min(20, gameState.social * 2);
					gameState.favor = Math.min(20, gameState.favor * 2);
					bonusDetails.push(`科研能力 ${oldR} → ${gameState.research} (×2)`);
					bonusDetails.push(`社交能力 ${oldS} → ${gameState.social} (×2)`);
					bonusDetails.push(`导师好感度 ${oldF} → ${gameState.favor} (×2)`);
					break;
			}

			// ★★★ 修复：社交增加时检查解锁 ★★★
			checkSocialUnlock();
			checkResearchUnlock(true);
			
			const html = `
				<div style="text-align:center;">
					<div style="font-size:4rem;margin-bottom:15px;animation:pulse 1s infinite;">⚡</div>
					<div style="font-size:1.5rem;font-weight:700;background:linear-gradient(135deg,#667eea,#764ba2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:10px;">
						渡劫成功！
					</div>
					<div style="font-size:0.95rem;color:var(--text-secondary);margin-bottom:20px;">
						恭喜突破硕士境界，晋升博士修炼者！
					</div>
				</div>
				
				<div style="background:linear-gradient(135deg,rgba(102,126,234,0.15),rgba(118,75,162,0.15));border-radius:12px;padding:15px;margin-bottom:15px;border:2px solid rgba(102,126,234,0.3);">
					<div style="text-align:center;margin-bottom:12px;">
						<div style="font-size:1.3rem;font-weight:700;color:#667eea;margin-bottom:5px;">${effectName}</div>
						<div style="font-size:0.85rem;color:var(--text-secondary);font-style:italic;">${effectDesc}</div>
					</div>
					<div style="background:white;border-radius:8px;padding:12px;">
						<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:8px;text-align:center;">✨ 获得加成 ✨</div>
						<div style="display:flex;flex-direction:column;gap:6px;">
							${bonusDetails.map(detail => `
								<div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:6px 12px;background:linear-gradient(135deg,rgba(0,184,148,0.1),rgba(85,239,196,0.1));border-radius:6px;font-size:0.9rem;font-weight:500;color:var(--success-color);">
									<i class="fas fa-arrow-up"></i> ${detail}
								</div>
							`).join('')}
						</div>
					</div>
				</div>
				
				<div style="text-align:center;padding:10px;background:var(--light-bg);border-radius:8px;font-size:0.85rem;">
					<div style="color:var(--primary-color);font-weight:600;margin-bottom:5px;">📜 新的修炼目标</div>
					<div style="color:var(--text-secondary);">博士毕业要求：科研分 ≥ 7</div>
					<div style="color:var(--text-secondary);">修炼年限：5年</div>
				</div>
			`;
			
			if (!document.getElementById('tribulation-style')) {
				const style = document.createElement('style');
				style.id = 'tribulation-style';
				style.textContent = `
					@keyframes pulse {
						0%, 100% { transform: scale(1); opacity: 1; }
						50% { transform: scale(1.1); opacity: 0.8; }
					}
				`;
				document.head.appendChild(style);
			}
			
			showModal('⚡ 转博渡劫', html, [
				{ text: '🎯 开启博士修炼之路', class: 'btn-primary', action: () => {
					addLog('转博渡劫', `触发【${effectName}】`, bonusDetails.join('，'));
					closeModal();
					updateAllUI();
					renderPaperSlots();
					
					// ★★★ 正位觉醒后触发学年总结 ★★★
					setTimeout(() => triggerYearEndSummaryEvent(), 300);
				}}
			]);
		}
		
