        // ==================== 存档系统 ====================
        const SAVE_KEY = 'graduateSimulatorSaves';
        const MAX_SAVES = 10;

		// ==================== 自动存档系统 ====================
		const AUTO_SAVE_KEY = 'graduateSimulatorAutoSaves';
		const MAX_AUTO_SAVES = 20;  // 最多保存20个自动存档

        function getSaves() {
            const saves = localStorage.getItem(SAVE_KEY);
            return saves ? JSON.parse(saves) : [];
        }
		
		// 检查存档是否在有效时间范围内（北京时间2025年12月13日8点之后）
		function isValidSaveTime(saveTime) {
			if (!saveTime) return false;
			
			// 截止时间：北京时间 2025-12-13 08:00
			const cutoffTimeStr = '2025-12-15 08:00';
			
			// 直接字符串比较（存档时间格式: "YYYY-MM-DD HH:mm"）
			return saveTime >= cutoffTimeStr;
		}

		// 获取有效存档（过滤旧存档）
		function getValidSaves() {
			const saves = getSaves();
			return saves.map(save => {
				if (save && !isValidSaveTime(save.saveTime)) {
					return null; // 旧存档视为空
				}
				return save;
			});
		}
		

        function saveSaves(saves) {
            localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
        }

		function openSaveModal() {
			const saves = getSaves();
			let html = '<div style="margin-bottom:15px;color:var(--text-secondary);font-size:0.85rem;">选择存档槽位（最多10个）：</div>';
			html += '<div style="max-height:400px;overflow-y:auto;">';

			for (let i = 0; i < MAX_SAVES; i++) {
				const save = saves[i];
				const isOldSave = save && !isValidSaveTime(save.saveTime);
				
				if (save && !isOldSave) {
					// 有效存档
					const modeIcon = save.isReversed ? '🌑' : '☀️';
					html += `
						<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--light-bg);border-radius:8px;margin-bottom:8px;">
							<div style="flex:1;">
								<div style="font-weight:600;font-size:0.9rem;">${modeIcon} 槽位 ${i + 1}: ${save.characterName}</div>
								<div style="font-size:0.75rem;color:var(--text-secondary);">
									${save.degree === 'master' ? '硕士' : '博士'} | 第${save.year}年第${save.month}月 | 科研分:${save.totalScore}
								</div>
								<div style="font-size:0.7rem;color:var(--text-secondary);">
									保存于: ${save.saveTime}
								</div>
							</div>
							<button class="btn btn-primary" style="padding:5px 12px;font-size:0.75rem;" onclick="saveGame(${i})">
								<i class="fas fa-save"></i> 覆盖
							</button>
						</div>`;
				} else {
					// 空槽位或旧存档（显示为可新建）
					const oldSaveHint = isOldSave ? '<div style="font-size:0.65rem;color:var(--danger-color);">旧版存档已失效</div>' : '';
					html += `
						<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--light-bg);border-radius:8px;margin-bottom:8px;opacity:0.7;">
							<div style="flex:1;">
								<div style="font-weight:600;font-size:0.9rem;">槽位 ${i + 1}: 空</div>
								<div style="font-size:0.75rem;color:var(--text-secondary);">暂无存档</div>
								${oldSaveHint}
							</div>
							<button class="btn btn-success" style="padding:5px 12px;font-size:0.75rem;" onclick="saveGame(${i})">
								<i class="fas fa-plus"></i> 新建
							</button>
						</div>`;
				}
			}

			html += '</div>';  // 关闭滚动容器
			showModal('💾 存档', html, [{ text: '取消', class: 'btn-info', action: closeModal }]);
		}

		function openLoadModal() {
			const saves = getValidSaves(); // 使用过滤后的存档

			if (saves.filter(s => s).length === 0) {
				showModal('📂 读档', '<p style="text-align:center;color:var(--text-secondary);">暂无有效存档</p><p style="text-align:center;font-size:0.8rem;color:var(--danger-color);">注：2025-12-15 08:00前的存档已失效</p>',
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			let html = '<div style="margin-bottom:15px;color:var(--text-secondary);font-size:0.85rem;">选择要读取的存档（最多10个）：</div>';
			html += '<div style="max-height:400px;overflow-y:auto;">';

			for (let i = 0; i < MAX_SAVES; i++) {
				const save = saves[i];
				if (save) {
					const modeIcon = save.isReversed ? '🌑' : '☀️';
					html += `
						<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--light-bg);border-radius:8px;margin-bottom:8px;">
							<div style="flex:1;">
								<div style="font-weight:600;font-size:0.9rem;">${modeIcon} 槽位 ${i + 1}: ${save.characterName}</div>
								<div style="font-size:0.75rem;color:var(--text-secondary);">
									${save.degree === 'master' ? '硕士' : '博士'} | 第${save.year}年第${save.month}月 | 科研分:${save.totalScore}
								</div>
								<div style="font-size:0.7rem;color:var(--text-secondary);">
									A类:${save.paperA} B类:${save.paperB} C类:${save.paperC} | 保存于: ${save.saveTime}
								</div>
							</div>
							<button class="btn btn-primary" style="padding:5px 12px;font-size:0.75rem;" onclick="loadGame(${i})">
								<i class="fas fa-folder-open"></i> 读取
							</button>
							<button class="btn btn-danger" style="padding:5px 12px;font-size:0.75rem;" onclick="deleteSave(${i})">
								<i class="fas fa-trash"></i>
							</button>
						</div>`;
				}
			}

			html += '</div>';  // 关闭滚动容器
			showModal('📂 读档', html, [{ text: '取消', class: 'btn-info', action: closeModal }]);
		}

		function openLoadModalFromStart() {
			const saves = getValidSaves(); // 使用过滤后的存档

			if (saves.filter(s => s).length === 0) {
				showModal('📂 读档', '<p style="text-align:center;color:var(--text-secondary);">暂无有效存档</p><p style="text-align:center;font-size:0.8rem;color:var(--danger-color);">注：2025-12-15 08:00前的存档已失效</p>',
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			let html = '<div style="margin-bottom:15px;color:var(--text-secondary);font-size:0.85rem;">选择要读取的存档（最多10个）：</div>';
			html += '<div style="max-height:400px;overflow-y:auto;">';

			for (let i = 0; i < MAX_SAVES; i++) {
				const save = saves[i];
				if (save) {
					const modeIcon = save.isReversed ? '🌑' : '☀️';
					html += `
						<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--light-bg);border-radius:8px;margin-bottom:8px;">
							<div style="flex:1;">
								<div style="font-weight:600;font-size:0.9rem;">${modeIcon} 槽位 ${i + 1}: ${save.characterName}</div>
								<div style="font-size:0.75rem;color:var(--text-secondary);">
									${save.degree === 'master' ? '硕士' : '博士'} | 第${save.year}年第${save.month}月 | 科研分:${save.totalScore}
								</div>
								<div style="font-size:0.7rem;color:var(--text-secondary);">
									A类:${save.paperA} B类:${save.paperB} C类:${save.paperC} | 保存于: ${save.saveTime}
								</div>
							</div>
							<button class="btn btn-primary" style="padding:5px 12px;font-size:0.75rem;" onclick="loadGame(${i})">
								<i class="fas fa-folder-open"></i> 读取
							</button>
						</div>`;
				}
			}

			html += '</div>';  // 关闭滚动容器
			showModal('📂 读档', html, [{ text: '取消', class: 'btn-info', action: closeModal }]);
		}

        function saveGame(slot) {
            const saves = getSaves();
            const now = new Date();
            const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
            
            const shopState = shopItems.map(item => ({
                id: item.id,
                bought: item.bought || false,
                boughtThisMonth: item.boughtThisMonth || false
            }));
            
            const papersCopy = gameState.papers.map(paper => {
                if (paper === null) return null;
                return {
                    title: paper.title,
                    ideaScore: paper.ideaScore,
                    expScore: paper.expScore,
                    writeScore: paper.writeScore,
                    reviewing: paper.reviewing || false,
                    reviewMonths: paper.reviewing ? Math.min(4, Math.max(0, paper.reviewMonths)) : 0,
                    submittedGrade: paper.submittedGrade || null,
                    submittedScore: paper.submittedScore || 0,
					submittedMonth: paper.submittedMonth || null,
					conferenceInfo: paper.conferenceInfo || null,
					conferenceLocation: paper.conferenceLocation || null,
					submittedIdeaScore: paper.submittedIdeaScore || null,
					submittedExpScore: paper.submittedExpScore || null,
					submittedWriteScore: paper.submittedWriteScore || null,
					// ★★★ 修复：期刊投稿状态 ★★★
					journalRevising: paper.journalRevising || false,
					journalRevisingType: paper.journalRevisingType || null,
                };
            });
            
            const publishedPapersCopy = gameState.publishedPapers.map(paper => ({
                title: paper.title,
                grade: paper.grade,
                acceptType: paper.acceptType,
                score: paper.score,
                citations: paper.citations,
                monthsSincePublish: paper.monthsSincePublish || 0,
                promotions: paper.promotions ? { ...paper.promotions } : { arxiv: false, github: false, xiaohongshu: false, quantumbit: false },
                citationMultiplier: paper.citationMultiplier || 1,
				conferenceInfo: paper.conferenceInfo || null,
				conferenceLocation: paper.conferenceLocation || null,
				pendingCitationFraction: paper.pendingCitationFraction || 0,
				effectiveScore: paper.effectiveScore || paper.score,
				journalType: paper.journalType || null,
				journalName: paper.journalName || null
            }));
            
            const buffsCopy = {
                permanent: gameState.buffs.permanent.map(b => ({ ...b })),
                temporary: gameState.buffs.temporary.map(b => ({ ...b }))
            };
            
            const saveData = {
                character: gameState.character,
                characterName: gameState.characterName,
                degree: gameState.degree,
                year: gameState.year,
                month: gameState.month,
                totalMonths: gameState.totalMonths,
                maxYears: gameState.maxYears,
                san: gameState.san,
                sanMax: gameState.sanMax,
                research: gameState.research,
                social: gameState.social,
                favor: gameState.favor,
                gold: gameState.gold,
                
                paperA: gameState.paperA,
                paperB: gameState.paperB,
                paperC: gameState.paperC,
                totalScore: gameState.totalScore,
                totalCitations: gameState.totalCitations,
                publishedPapers: publishedPapersCopy,
                paperSlots: gameState.paperSlots,
                papers: papersCopy,
                
                buffs: buffsCopy,
                
                actionUsed: gameState.actionUsed,
                readCount: gameState.readCount,
				workCount: gameState.workCount || 0,
                firstPaperAccepted: gameState.firstPaperAccepted,
                firstAPaperAccepted: gameState.firstAPaperAccepted,
                firstNatureAccepted: gameState.firstNatureAccepted || false,
                firstNatureSubAccepted: gameState.firstNatureSubAccepted || false,
                hasLover: gameState.hasLover,
                loverType: gameState.loverType,
                bigBullCooperation: gameState.bigBullCooperation,
                bigBullCitationBonusApplied: gameState.bigBullCitationBonusApplied || 0,
                rejectedCount: gameState.rejectedCount,
                teaBreakCount: gameState.teaBreakCount,
                tourCount: gameState.tourCount,
                dinnerCount: gameState.dinnerCount || 0,
                badmintonCount: gameState.badmintonCount || 0,
                meetingCount: gameState.meetingCount || 0,
                metBigBull: gameState.metBigBull,
                metBeautiful: gameState.metBeautiful,
                metSmart: gameState.metSmart,
                bigBullDeepCount: gameState.bigBullDeepCount,
                beautifulCount: gameState.beautifulCount,
                smartCount: gameState.smartCount,
                
                availableRandomEvents: [...gameState.availableRandomEvents],
                usedRandomEvents: [...gameState.usedRandomEvents],
                totalRandomEventCount: gameState.totalRandomEventCount || 0,
                triggeredBuffTypes: [...(gameState.triggeredBuffTypes || [])],
                coffeeBoughtCount: gameState.coffeeBoughtCount || 0,
                goldSpentTotal: gameState.goldSpentTotal || 0,
                
                isReversed: gameState.isReversed,
                reversedAwakened: gameState.reversedAwakened,
                blockedResearchGains: gameState.blockedResearchGains,
                goldLocked: gameState.goldLocked,
                statsLocked: gameState.statsLocked,
                
                pendingPhDChoice: gameState.pendingPhDChoice || false,
                // ★★★ 新增：延毕发Nature相关字段 ★★★
                pendingNatureExtension: gameState.pendingNatureExtension || false,
                natureExtensionChoiceMade: gameState.natureExtensionChoiceMade || false,
                isNatureExtensionYear: gameState.isNatureExtensionYear || false,
                pendingConference: gameState.pendingConference || null,
                enterpriseCount: gameState.enterpriseCount || 0,
                ailabInternship: gameState.ailabInternship || false,
                firstBestPaperAccepted: gameState.firstBestPaperAccepted || false,
				firstABestPaperAccepted: gameState.firstABestPaperAccepted || false,
                
                // ★★★ 新增：逆位富可敌国的保存字段 ★★★
                lastResetMonth: gameState.lastResetMonth || 0,
				socialAwakened: gameState.socialAwakened || false,
				reviewerDistribution: gameState.reviewerDistribution || null,
				// ★★★ 新增：社交达人和导师子女觉醒字段 ★★★
				totalRelationshipsMet: gameState.totalRelationshipsMet || 0,
				autoAdvisorChat: gameState.autoAdvisorChat || false,
				badmintonYear: gameState.badmintonYear || -1,
				ideaClickCount: gameState.ideaClickCount || 0,
				expClickCount: gameState.expClickCount || 0,
				writeClickCount: gameState.writeClickCount || 0,
				consecutiveAccepts: gameState.consecutiveAccepts || 0,
				lastIdeaScore: gameState.lastIdeaScore || 0,
				lastExpScore: gameState.lastExpScore || 0,
				lastWriteScore: gameState.lastWriteScore || 0,
				// 在 saveData 对象中添加以下字段
				hiddenAwakened: gameState.hiddenAwakened || false,
				hiddenAwakenType: gameState.hiddenAwakenType || null,
				actionLimit: gameState.actionLimit || 1,
				actionCount: gameState.actionCount || 0,
				noDecay: gameState.noDecay || false,
				hasSeniorHelpSkill: gameState.hasSeniorHelpSkill || false,
				usedSeniorHelpSkill: gameState.usedSeniorHelpSkill || false,
				hasTeacherHelpSkill: gameState.hasTeacherHelpSkill || false,
				usedTeacherHelpSkill: gameState.usedTeacherHelpSkill || false,
				monthlyWageBonus: gameState.monthlyWageBonus || 0,
				nextIdeaResearchBonus: gameState.nextIdeaResearchBonus || 0,
				nextIdeaBonusSource: gameState.nextIdeaBonusSource || null,
				isTrueNormal: gameState.isTrueNormal || false,
				researchMax: gameState.researchMax || 20,
				socialMax: gameState.socialMax || 20,
				favorMax: gameState.favorMax || 20,
				achievementCoins: gameState.achievementCoins || 0,
				earnedAchievementsThisGame: [...(gameState.earnedAchievementsThisGame || [])],  // ★★★ 新增 ★★★
				// ★★★ 修复：保存黑市状态 ★★★
				blackMarketState: blackMarketState ? {
					currentItems: blackMarketState.currentItems.map(item => ({
						id: item.item.id,
						locked: item.locked
					})),
					refreshCount: blackMarketState.refreshCount || 0,
					lastAutoRefreshMonth: blackMarketState.lastAutoRefreshMonth || 0,
					amuletUsedThisMonth: {...(blackMarketState.amuletUsedThisMonth || {})}
				} : null,
				// ★★★ 修复：保存护身符状态 ★★★
				amulets: gameState.amulets ? {...gameState.amulets} : null,
				// ★★★ 新增：商店机制字段 ★★★
				freeRefreshTickets: gameState.freeRefreshTickets || 0,
				refreshDiscount: gameState.refreshDiscount || 0,
				chainPurchaseLevel: gameState.chainPurchaseLevel || 0,
				memberCardLevel: gameState.memberCardLevel || 0,
				hasAutoRestock: gameState.hasAutoRestock || false,
				hasDisplayStand: gameState.hasDisplayStand || false,

                rejectedPapers: {...(gameState.rejectedPapers || {})},
                maxConcurrentReviews: gameState.maxConcurrentReviews || 0,
                phdOpportunitiesRejected: gameState.phdOpportunitiesRejected || 0,
                gpuServersBought: gameState.gpuServersBought || 0,
                furnitureBought: {...(gameState.furnitureBought || {})},
                chairUpgrade: gameState.chairUpgrade || null,
                achievementConditions: {...(gameState.achievementConditions || {})},
                paperTypeCollection: gameState.paperTypeCollection ? [...gameState.paperTypeCollection] : [],
				// ★★★ 新增：高级选项触发记录 ★★★
				metBigBullCoop: gameState.metBigBullCoop || false,

				// ★★★ 新增：拒绝次数和永久阻止状态 ★★★
				rejectedBeautifulLoverCount: gameState.rejectedBeautifulLoverCount || 0,
				rejectedSmartLoverCount: gameState.rejectedSmartLoverCount || 0,
				rejectedInternshipCount: gameState.rejectedInternshipCount || 0,
				rejectedBigBullCoopCount: gameState.rejectedBigBullCoopCount || 0,
				permanentlyBlockedBeautifulLover: gameState.permanentlyBlockedBeautifulLover || false,
				permanentlyBlockedSmartLover: gameState.permanentlyBlockedSmartLover || false,
				permanentlyBlockedInternship: gameState.permanentlyBlockedInternship || false,
				permanentlyBlockedBigBullCoop: gameState.permanentlyBlockedBigBullCoop || false,
				seniorHelpUses: gameState.seniorHelpUses || 0,
				teacherHelpUses: gameState.teacherHelpUses || 0,
				nextActionBonus: gameState.nextActionBonus || 0,
				nextActionBonusSource: gameState.nextActionBonusSource || null,
				nextActionBonusType: gameState.nextActionBonusType || null,
                
                // ★★★ 新增：投稿统计相关 ★★★
                submissionStats: gameState.submissionStats,
                pendingConferenceInfo: gameState.pendingConferenceInfo,
                shopState: shopState,
                saveTime: timeStr,

                // ★★★ 新增：人际关系系统保存 ★★★
                relationships: gameState.relationships ? JSON.parse(JSON.stringify(gameState.relationships)) : [],
                selectedAdvisor: gameState.selectedAdvisor ? {...gameState.selectedAdvisor} : null,

                // ★★★ 新增：S类期刊论文保存 ★★★
                paperS: gameState.paperS || 0,
                paperNature: gameState.paperNature || 0,
                paperNatureSub: gameState.paperNatureSub || 0,
                upgradedSlots: gameState.upgradedSlots ? [...gameState.upgradedSlots] : [],
                // ★★★ 新增：永久解锁记录 ★★★
                paperSlotsUnlocked: gameState.paperSlotsUnlocked || gameState.paperSlots || 1,
                relationshipSlotsUnlocked: gameState.relationshipSlotsUnlocked || 2,
                // ★★★ 新增：生涯里程碑和统计数据 ★★★
                careerMilestones: gameState.careerMilestones || [],
                peakStats: gameState.peakStats || null,
                totalSubmissions: gameState.totalSubmissions || 0,
                totalAccepts: gameState.totalAccepts || 0,
                totalRejects: gameState.totalRejects || 0,
                // ★★★ 修复：保存难度诅咒相关状态 ★★★
                difficultyPoints: gameState.difficultyPoints || 0,
                activeCurses: gameState.activeCurses ? {...gameState.activeCurses} : {},
                researchDecay: gameState.researchDecay || 0,
                researchDecayPeriod: gameState.researchDecayPeriod || 0,
                socialDecay: gameState.socialDecay || 0,
                socialDecayPeriod: gameState.socialDecayPeriod || 0,
                favorDecay: gameState.favorDecay || 0,
                favorDecayPeriod: gameState.favorDecayPeriod || 0,
                monthlySanDrain: gameState.monthlySanDrain || 0,
                monthlyExpenseBonus: gameState.monthlyExpenseBonus || 0,
                phdRequirementBonus: gameState.phdRequirementBonus || 0,
                graduationRequirementBonus: gameState.graduationRequirementBonus || 0,
                // ★★★ 新增：保存祝福相关状态 ★★★
                activeBlessings: gameState.activeBlessings ? {...gameState.activeBlessings} : {},
                monthlySanRecoveryPercent: gameState.monthlySanRecoveryPercent || 0,
                monthlyGoldPercent: gameState.monthlyGoldPercent || 0,
                researchGrowthPercent: gameState.researchGrowthPercent || 0,
                researchGrowthPeriod: gameState.researchGrowthPeriod || 0,
                socialGrowthPercent: gameState.socialGrowthPercent || 0,
                socialGrowthPeriod: gameState.socialGrowthPeriod || 0,
                favorGrowthPercent: gameState.favorGrowthPercent || 0,
                favorGrowthPeriod: gameState.favorGrowthPeriod || 0,
				// ★★★ 修复：订阅/预购状态 ★★★
				subscriptions: gameState.subscriptions ? {...gameState.subscriptions} : null,
				// ★★★ 修复：自行车和装备状态 ★★★
				hasBike: gameState.hasBike || false,
				bikeUpgrade: gameState.bikeUpgrade || null,
				bikeSanSpent: gameState.bikeSanSpent || 0,
				hasDownJacket: gameState.hasDownJacket || false,
				hasParasol: gameState.hasParasol || false,
				incomeDoubled: gameState.incomeDoubled || false,
				internshipAPaperCount: gameState.internshipAPaperCount || 0,
				goldMax: gameState.goldMax,
				slothAwakened: gameState.slothAwakened || false,
				beautifulLoverExtraRecoveryRate: gameState.beautifulLoverExtraRecoveryRate || 0,
				// ★★★ 修复：保存成就点数商店状态 ★★★
				achievementPointShop: gameState.achievementPointShop ? {
					purchaseCount: gameState.achievementPointShop.purchaseCount || 0,
					accumulated: gameState.achievementPointShop.accumulated ? {...gameState.achievementPointShop.accumulated} : { san: 0, research: 0, social: 0, favor: 0, gold: 0 }
				} : null
            };
            
            saves[slot] = saveData;
            saveSaves(saves);
            closeModal();
            
            showModal('✅ 存档成功', `<p style="text-align:center;">游戏已保存到槽位 ${slot + 1}</p>`, 
                [{ text: '确定', class: 'btn-primary', action: closeModal }]);
            
            addLog('系统', '游戏已存档', `槽位 ${slot + 1}`);
        }

        function loadGame(slot) {
            const saves = getSaves();
            const save = saves[slot];
            
            if (!save) {
                showModal('❌ 读档失败', '<p>该存档不存在！</p>', 
                    [{ text: '确定', class: 'btn-primary', action: closeModal }]);
                return;
            }
            
            showModal('⚠️ 确认读档', 
                `<p>确定要读取槽位 ${slot + 1} 的存档吗？</p><p style="color:var(--danger-color);font-size:0.85rem;">当前游戏进度将丢失！</p>`, 
                [
                    { text: '取消', class: 'btn-info', action: closeModal },
                    { text: '确定读取', class: 'btn-primary', action: () => {
                        if (save.shopState) {
                            save.shopState.forEach(savedItem => {
                                const item = shopItems.find(i => i.id === savedItem.id);
                                if (item) {
                                    item.bought = savedItem.bought;
                                    item.boughtThisMonth = savedItem.boughtThisMonth;
                                }
                            });
                        }
                        
                        gameState = {
                            character: save.character,
                            characterName: save.characterName,
                            degree: save.degree,
                            year: save.year,
                            month: save.month,
                            totalMonths: save.totalMonths,
                            maxYears: save.maxYears,
                            san: save.san,
                            sanMax: save.sanMax,
                            research: save.research,
                            social: save.social,
                            favor: save.favor,
                            gold: save.gold,
                            
                            paperA: save.paperA,
                            paperB: save.paperB,
                            paperC: save.paperC,
                            totalScore: save.totalScore,
                            totalCitations: save.totalCitations,
							publishedPapers: save.publishedPapers.map(p => ({
								...p,
								promotions: p.promotions ? { ...p.promotions } : { arxiv: false, github: false, xiaohongshu: false, quantumbit: false },
								citationMultiplier: p.citationMultiplier || 1,
								monthsSincePublish: p.monthsSincePublish || 0,
								// ★★★ 新增字段 ★★★
								pendingCitationFraction: p.pendingCitationFraction || 0,
								conferenceInfo: p.conferenceInfo || null,
								conferenceLocation: p.conferenceLocation || null,
								effectiveScore: p.effectiveScore || p.score,
								journalType: p.journalType || null,
								journalName: p.journalName || null
							})),
                            paperSlots: save.paperSlots,
                            
							papers: save.papers.map(p => {
								if (p === null) return null;
								return {
									title: p.title,
									ideaScore: p.ideaScore,
									expScore: p.expScore,
									writeScore: p.writeScore,
									reviewing: p.reviewing || false,
									reviewMonths: p.reviewing ? Math.min(4, Math.max(0, p.reviewMonths || 0)) : 0,
									submittedGrade: p.submittedGrade || null,
									submittedScore: p.submittedScore || 0,
									// ★★★ 新增字段 ★★★
									submittedMonth: p.submittedMonth || null,
									conferenceInfo: p.conferenceInfo || null,
									conferenceLocation: p.conferenceLocation || null,
									submittedIdeaScore: p.submittedIdeaScore || null,
									submittedExpScore: p.submittedExpScore || null,
									submittedWriteScore: p.submittedWriteScore || null,
									// ★★★ 修复：期刊投稿状态 ★★★
									journalRevising: p.journalRevising || false,
									journalRevisingType: p.journalRevisingType || null,
								};
							}),
                            
                            buffs: {
                                permanent: save.buffs.permanent.map(b => ({ ...b })),
                                temporary: save.buffs.temporary.map(b => ({ ...b }))
                            },
                            
                            actionUsed: save.actionUsed,
                            readCount: save.readCount,
							workCount: save.workCount || 0,
                            firstPaperAccepted: save.firstPaperAccepted,
                            firstAPaperAccepted: save.firstAPaperAccepted,
                            firstNatureAccepted: save.firstNatureAccepted || false,
                            firstNatureSubAccepted: save.firstNatureSubAccepted || false,
                            hasLover: save.hasLover,
                            loverType: save.loverType,
                            bigBullCooperation: save.bigBullCooperation,
                            bigBullCitationBonusApplied: save.bigBullCitationBonusApplied || 0,
                            rejectedCount: save.rejectedCount,
                            teaBreakCount: save.teaBreakCount,
                            tourCount: save.tourCount,
                            dinnerCount: save.dinnerCount || 0,
                            badmintonCount: save.badmintonCount || 0,
                            meetingCount: save.meetingCount || 0,
                            metBigBull: save.metBigBull,
                            metBeautiful: save.metBeautiful,
                            metSmart: save.metSmart,
                            bigBullDeepCount: save.bigBullDeepCount,
                            beautifulCount: save.beautifulCount,
                            smartCount: save.smartCount,
                            enterpriseCount: save.enterpriseCount || 0,
                            ailabInternship: save.ailabInternship || false,
                            firstBestPaperAccepted: save.firstBestPaperAccepted || false,
							firstABestPaperAccepted: save.firstABestPaperAccepted || false,
                            goldSpentTotal: save.goldSpentTotal || 0,
                            
                            availableRandomEvents: save.availableRandomEvents ? [...save.availableRandomEvents] : [],
                            usedRandomEvents: save.usedRandomEvents ? [...save.usedRandomEvents] : [],
                            totalRandomEventCount: save.totalRandomEventCount || 0,
                            triggeredBuffTypes: save.triggeredBuffTypes ? [...save.triggeredBuffTypes] : [],
                            coffeeBoughtCount: save.coffeeBoughtCount || 0,
                            
                            pendingPhDChoice: save.pendingPhDChoice || false,
                            // ★★★ 新增：延毕发Nature相关字段 ★★★
                            pendingNatureExtension: save.pendingNatureExtension || false,
                            natureExtensionChoiceMade: save.natureExtensionChoiceMade || false,
                            isNatureExtensionYear: save.isNatureExtensionYear || false,
                            pendingConference: save.pendingConference || null,

                            isReversed: save.isReversed === true,
                            reversedAwakened: save.reversedAwakened === true,
                            blockedResearchGains: save.blockedResearchGains || 0,
                            
                            
                            // ★★★ 新增：逆位富可敌国的读档字段 ★★★
                            lastResetMonth: save.lastResetMonth || 0,
							socialAwakened: save.socialAwakened || false,
							reviewerDistribution: save.reviewerDistribution || null,
							// ★★★ 新增：社交达人和导师子女觉醒字段 ★★★
							totalRelationshipsMet: save.totalRelationshipsMet || 0,
							autoAdvisorChat: save.autoAdvisorChat || false,
							badmintonYear: save.badmintonYear || -1,
							ideaClickCount: save.ideaClickCount || 0,
							expClickCount: save.expClickCount || 0,
							writeClickCount: save.writeClickCount || 0,
							consecutiveAccepts: save.consecutiveAccepts || 0,
							// 在 gameState 赋值中添加以下字段
							hiddenAwakened: save.hiddenAwakened || false,
							hiddenAwakenType: save.hiddenAwakenType || null,
							actionLimit: save.actionLimit || 1,
							actionCount: save.actionCount || 0,
							noDecay: save.noDecay || false,
							hasSeniorHelpSkill: save.hasSeniorHelpSkill || false,
							usedSeniorHelpSkill: save.usedSeniorHelpSkill || false,
							hasTeacherHelpSkill: save.hasTeacherHelpSkill || false,
							usedTeacherHelpSkill: save.usedTeacherHelpSkill || false,
							monthlyWageBonus: save.monthlyWageBonus || 0,
							nextIdeaResearchBonus: save.nextIdeaResearchBonus || 0,
							nextIdeaBonusSource: save.nextIdeaBonusSource || null,
							isTrueNormal: save.isTrueNormal || false,
							researchMax: save.researchMax || 20,
							socialMax: save.socialMax || 20,
							favorMax: save.favorMax || 20,
							// ★★★ 新增：高级选项触发记录 ★★★
							metBigBullCoop: save.metBigBullCoop || false,

							// ★★★ 新增：拒绝次数和永久阻止状态 ★★★
							rejectedBeautifulLoverCount: save.rejectedBeautifulLoverCount || 0,
							rejectedSmartLoverCount: save.rejectedSmartLoverCount || 0,
							rejectedInternshipCount: save.rejectedInternshipCount || 0,
							rejectedBigBullCoopCount: save.rejectedBigBullCoopCount || 0,
							permanentlyBlockedBeautifulLover: save.permanentlyBlockedBeautifulLover || false,
							permanentlyBlockedSmartLover: save.permanentlyBlockedSmartLover || false,
							permanentlyBlockedInternship: save.permanentlyBlockedInternship || false,
							permanentlyBlockedBigBullCoop: save.permanentlyBlockedBigBullCoop || false,
							seniorHelpUses: save.seniorHelpUses || 0,
							teacherHelpUses: save.teacherHelpUses || 0,
							nextActionBonus: save.nextActionBonus || 0,
							nextActionBonusSource: save.nextActionBonusSource || null,
							nextActionBonusType: save.nextActionBonusType || null,            
							
                            rejectedPapers: save.rejectedPapers ? {...save.rejectedPapers} : {},
                            furnitureBought: save.furnitureBought ? {...save.furnitureBought} : {
                                chair: false,
                                monitor: false,
                                keyboard: false
                            },
                            chairUpgrade: save.chairUpgrade || null,
                            achievementConditions: save.achievementConditions ? {...save.achievementConditions} : {
                                highScorePaper: false,
                                unanimousImprovement: false,
                                allBadReviewers: false,
                                tripleRejected: false,
                                bought5GPUs: false,
                                fullFurnitureSet: false,
                                phdRequirementMetEarly: false,
                                rejectedPhdTwice: false
                            },
                            maxConcurrentReviews: save.maxConcurrentReviews || 0,
                            phdOpportunitiesRejected: save.phdOpportunitiesRejected || 0,
                            gpuServersBought: save.gpuServersBought || 0,
                            paperTypeCollection: new Set(save.paperTypeCollection || []),
                            // ★★★ 新增：投稿统计相关 ★★★
                            submissionStats: save.submissionStats || null,
                            pendingConferenceInfo: save.pendingConferenceInfo || null,

                            // ★★★ 新增：人际关系系统恢复 ★★★
                            relationships: save.relationships ? JSON.parse(JSON.stringify(save.relationships)) : [],
                            selectedAdvisor: save.selectedAdvisor ? {...save.selectedAdvisor} : null,

                            // ★★★ 新增：S类期刊论文恢复 ★★★
                            paperS: save.paperS || 0,
                            paperNature: save.paperNature || 0,
                            paperNatureSub: save.paperNatureSub || 0,
                            upgradedSlots: save.upgradedSlots ? [...save.upgradedSlots] : [],
                            // ★★★ 新增：永久解锁记录恢复 ★★★
                            paperSlotsUnlocked: save.paperSlotsUnlocked || save.paperSlots || 1,
                            relationshipSlotsUnlocked: save.relationshipSlotsUnlocked || 2,
                            // ★★★ 新增：生涯里程碑和统计数据恢复 ★★★
                            careerMilestones: save.careerMilestones || [],
                            peakStats: save.peakStats || null,
                            totalSubmissions: save.totalSubmissions || 0,
                            totalAccepts: save.totalAccepts || 0,
                            totalRejects: save.totalRejects || 0
                        };
                        
                        if (!gameState.availableRandomEvents || gameState.availableRandomEvents.length === 0) {
                            if (!gameState.usedRandomEvents || gameState.usedRandomEvents.length === 0) {
                                resetRandomEventPool();
                            }
                        }
                        
                        if (gameState.isReversed) {
                            document.body.classList.add('reversed-theme');
                            isReversedMode = true;
                        } else {
                            document.body.classList.remove('reversed-theme');
                            isReversedMode = false;
                        }
						
						// ★★★ 修复：恢复黑市状态 ★★★
						if (save.blackMarketState) {
							blackMarketState.currentItems = save.blackMarketState.currentItems.map(savedItem => {
								const item = blackMarketItems.find(i => i.id === savedItem.id);
								return item ? { item, locked: savedItem.locked } : null;
							}).filter(Boolean);
							blackMarketState.refreshCount = save.blackMarketState.refreshCount || 0;
							blackMarketState.lastAutoRefreshMonth = save.blackMarketState.lastAutoRefreshMonth || 0;
							blackMarketState.amuletUsedThisMonth = save.blackMarketState.amuletUsedThisMonth || {};
						}
						// ★★★ 修复：恢复护身符状态 ★★★
						gameState.amulets = save.amulets ? {...save.amulets} : null;
						gameState.achievementCoins = save.achievementCoins || 0;
						gameState.earnedAchievementsThisGame = save.earnedAchievementsThisGame ? [...save.earnedAchievementsThisGame] : [];
						// ★★★ 新增：恢复商店机制字段 ★★★
						gameState.freeRefreshTickets = save.freeRefreshTickets || 0;
						gameState.refreshDiscount = save.refreshDiscount || 0;
						gameState.chainPurchaseLevel = save.chainPurchaseLevel || 0;
						gameState.memberCardLevel = save.memberCardLevel || 0;
						gameState.hasAutoRestock = save.hasAutoRestock || false;
						gameState.hasDisplayStand = save.hasDisplayStand || false;

						// ★★★ 修复：恢复难度诅咒相关状态 ★★★
						gameState.difficultyPoints = save.difficultyPoints || 0;
						gameState.activeCurses = save.activeCurses ? {...save.activeCurses} : {};
						gameState.researchDecay = save.researchDecay || 0;
						gameState.researchDecayPeriod = save.researchDecayPeriod || 0;
						gameState.socialDecay = save.socialDecay || 0;
						gameState.socialDecayPeriod = save.socialDecayPeriod || 0;
						gameState.favorDecay = save.favorDecay || 0;
						gameState.favorDecayPeriod = save.favorDecayPeriod || 0;
						gameState.monthlySanDrain = save.monthlySanDrain || 0;
						gameState.monthlyExpenseBonus = save.monthlyExpenseBonus || 0;
						gameState.phdRequirementBonus = save.phdRequirementBonus || 0;
						gameState.graduationRequirementBonus = save.graduationRequirementBonus || 0;

						// ★★★ 新增：恢复祝福相关状态 ★★★
						gameState.activeBlessings = save.activeBlessings ? {...save.activeBlessings} : {};
						gameState.monthlySanRecoveryPercent = save.monthlySanRecoveryPercent || 0;
						gameState.monthlyGoldPercent = save.monthlyGoldPercent || 0;
						gameState.researchGrowthPercent = save.researchGrowthPercent || 0;
						gameState.researchGrowthPeriod = save.researchGrowthPeriod || 0;
						gameState.socialGrowthPercent = save.socialGrowthPercent || 0;
						gameState.socialGrowthPeriod = save.socialGrowthPeriod || 0;
						gameState.favorGrowthPercent = save.favorGrowthPercent || 0;
						gameState.favorGrowthPeriod = save.favorGrowthPeriod || 0;

						// ★★★ 修复：恢复订阅/预购状态 ★★★
						if (save.subscriptions) {
							gameState.subscriptions = {...save.subscriptions};
						}
						// ★★★ 修复：恢复自行车和装备状态 ★★★
						gameState.hasBike = save.hasBike || false;
						gameState.bikeUpgrade = save.bikeUpgrade || null;
						gameState.bikeSanSpent = save.bikeSanSpent || 0;
						gameState.hasDownJacket = save.hasDownJacket || false;
						gameState.hasParasol = save.hasParasol || false;
						gameState.incomeDoubled = save.incomeDoubled || false;
						gameState.internshipAPaperCount = save.internshipAPaperCount || 0;
						gameState.goldMax = save.goldMax;
						gameState.slothAwakened = save.slothAwakened || false;
						gameState.beautifulLoverExtraRecoveryRate = save.beautifulLoverExtraRecoveryRate || 0;
						// ★★★ 修复：恢复成就点数商店状态 ★★★
						if (save.achievementPointShop) {
							gameState.achievementPointShop = {
								purchaseCount: save.achievementPointShop.purchaseCount || 0,
								accumulated: save.achievementPointShop.accumulated ? {...save.achievementPointShop.accumulated} : { san: 0, research: 0, social: 0, favor: 0, gold: 0 }
							};
						}

                        document.getElementById('start-screen').classList.add('hidden');
                        document.getElementById('game-screen').style.display = 'block';
                        document.getElementById('mobile-quick-bar').classList.add('game-active');
                        
                        updateAllUI();
                        renderPaperSlots();
                        
                        closeModal();
                        addLog('系统', '读取存档成功', `槽位 ${slot + 1}`);
                        
                        let pendingReviews = [];
                        gameState.papers.forEach((paper, idx) => {
                            if (paper && paper.reviewing && paper.reviewMonths <= 0) {
                                pendingReviews.push(idx);
                            }
                        });

                        if (pendingReviews.length > 0) {
                            pendingReviews.forEach((idx, i) => {
                                setTimeout(() => {
                                    if (gameState.papers[idx] && gameState.papers[idx].reviewing) {
                                        processPaperResult(idx);
                                    }
                                }, 500 + i * 300);
                            });
                        } else {
                            let reviewingInfo = '';
                            gameState.papers.forEach((paper, idx) => {
                                if (paper && paper.reviewing) {
                                    reviewingInfo += `<br>• 槽位${idx + 1}: ${paper.submittedGrade}类审稿中，剩余${paper.reviewMonths}月`;
                                }
                            });
                            
                            const modeText = gameState.isReversed ? '（逆位模式）' : '（正位模式）';
                            showModal('✅ 读档成功', 
                                `<p style="text-align:center;">已读取槽位 ${slot + 1} 的存档 ${modeText}</p>
                                 <p style="font-size:0.85rem;color:var(--text-secondary);">
                                    当前进度：第${gameState.year}年第${gameState.month}月<br>
                                    科研分：${gameState.totalScore}
                                    ${reviewingInfo ? '<br><strong>审稿中的论文：</strong>' + reviewingInfo : ''}
                                 </p>`, 
                                [{ text: '继续游戏', class: 'btn-primary', action: closeModal }]);
                        }
                    }}
                ]
            );
        }

        function deleteSave(slot) {
            showModal('⚠️ 确认删除',
                `<p>确定要删除槽位 ${slot + 1} 的存档吗？</p><p style="color:var(--danger-color);font-size:0.85rem;">此操作不可恢复！</p>`,
                [
                    { text: '取消', class: 'btn-info', action: closeModal },
                    { text: '确定删除', class: 'btn-danger', action: () => {
                        const saves = getSaves();
                        saves[slot] = null;
                        saveSaves(saves);
                        closeModal();
                        openLoadModal();
                    }}
                ]
            );
        }

		// ==================== 自动存档函数 ====================

		function getAutoSaves() {
			const saves = localStorage.getItem(AUTO_SAVE_KEY);
			return saves ? JSON.parse(saves) : [];
		}

		function saveAutoSaves(saves) {
			localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(saves));
		}

		function clearAutoSaves() {
			localStorage.removeItem(AUTO_SAVE_KEY);
		}

		// 创建存档数据（复用逻辑）
		function createSaveData() {
			const now = new Date();
			const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

			const shopState = shopItems.map(item => ({
				id: item.id,
				bought: item.bought || false,
				boughtThisMonth: item.boughtThisMonth || false
			}));

			const papersCopy = gameState.papers.map(paper => {
				if (paper === null) return null;
				return {
					title: paper.title,
					ideaScore: paper.ideaScore,
					expScore: paper.expScore,
					writeScore: paper.writeScore,
					reviewing: paper.reviewing || false,
					reviewMonths: paper.reviewing ? Math.min(4, Math.max(0, paper.reviewMonths)) : 0,
					submittedGrade: paper.submittedGrade || null,
					submittedScore: paper.submittedScore || 0,
					submittedMonth: paper.submittedMonth || null,
					conferenceInfo: paper.conferenceInfo || null,
					conferenceLocation: paper.conferenceLocation || null,
					submittedIdeaScore: paper.submittedIdeaScore || null,
					submittedExpScore: paper.submittedExpScore || null,
					submittedWriteScore: paper.submittedWriteScore || null,
					// ★★★ 修复：期刊投稿状态 ★★★
					journalRevising: paper.journalRevising || false,
					journalRevisingType: paper.journalRevisingType || null,
				};
			});

			const publishedPapersCopy = gameState.publishedPapers.map(paper => ({
				title: paper.title,
				grade: paper.grade,
				acceptType: paper.acceptType,
				score: paper.score,
				citations: paper.citations,
				monthsSincePublish: paper.monthsSincePublish || 0,
				promotions: paper.promotions ? { ...paper.promotions } : { arxiv: false, github: false, xiaohongshu: false, quantumbit: false },
				citationMultiplier: paper.citationMultiplier || 1,
				conferenceInfo: paper.conferenceInfo || null,
				conferenceLocation: paper.conferenceLocation || null,
				pendingCitationFraction: paper.pendingCitationFraction || 0,
				effectiveScore: paper.effectiveScore || paper.score,
				journalType: paper.journalType || null,
				journalName: paper.journalName || null
			}));

			const buffsCopy = {
				permanent: gameState.buffs.permanent.map(b => ({ ...b })),
				temporary: gameState.buffs.temporary.map(b => ({ ...b }))
			};

			return {
				character: gameState.character,
				characterName: gameState.characterName,
				degree: gameState.degree,
				year: gameState.year,
				month: gameState.month,
				totalMonths: gameState.totalMonths,
				maxYears: gameState.maxYears,
				san: gameState.san,
				sanMax: gameState.sanMax,
				research: gameState.research,
				social: gameState.social,
				favor: gameState.favor,
				gold: gameState.gold,

				paperA: gameState.paperA,
				paperB: gameState.paperB,
				paperC: gameState.paperC,
				totalScore: gameState.totalScore,
				totalCitations: gameState.totalCitations,
				publishedPapers: publishedPapersCopy,
				paperSlots: gameState.paperSlots,
				papers: papersCopy,

				buffs: buffsCopy,

				actionUsed: gameState.actionUsed,
				readCount: gameState.readCount,
				workCount: gameState.workCount || 0,
				firstPaperAccepted: gameState.firstPaperAccepted,
				firstAPaperAccepted: gameState.firstAPaperAccepted,
				firstNatureAccepted: gameState.firstNatureAccepted || false,
				firstNatureSubAccepted: gameState.firstNatureSubAccepted || false,
				hasLover: gameState.hasLover,
				loverType: gameState.loverType,
				bigBullCooperation: gameState.bigBullCooperation,
				bigBullCitationBonusApplied: gameState.bigBullCitationBonusApplied || 0,
				rejectedCount: gameState.rejectedCount,
				teaBreakCount: gameState.teaBreakCount,
				tourCount: gameState.tourCount,
				dinnerCount: gameState.dinnerCount || 0,
				badmintonCount: gameState.badmintonCount || 0,
				meetingCount: gameState.meetingCount || 0,
				metBigBull: gameState.metBigBull,
				metBeautiful: gameState.metBeautiful,
				metSmart: gameState.metSmart,
				bigBullDeepCount: gameState.bigBullDeepCount,
				beautifulCount: gameState.beautifulCount,
				smartCount: gameState.smartCount,

				availableRandomEvents: [...gameState.availableRandomEvents],
				usedRandomEvents: [...gameState.usedRandomEvents],
				totalRandomEventCount: gameState.totalRandomEventCount || 0,
				triggeredBuffTypes: [...(gameState.triggeredBuffTypes || [])],
				coffeeBoughtCount: gameState.coffeeBoughtCount || 0,
				goldSpentTotal: gameState.goldSpentTotal || 0,

				isReversed: gameState.isReversed,
				reversedAwakened: gameState.reversedAwakened,
				blockedResearchGains: gameState.blockedResearchGains,
				goldLocked: gameState.goldLocked,
				statsLocked: gameState.statsLocked,

				pendingPhDChoice: gameState.pendingPhDChoice || false,
				// ★★★ 新增：延毕发Nature相关字段 ★★★
				pendingNatureExtension: gameState.pendingNatureExtension || false,
				natureExtensionChoiceMade: gameState.natureExtensionChoiceMade || false,
				isNatureExtensionYear: gameState.isNatureExtensionYear || false,
				pendingConference: gameState.pendingConference || null,
				enterpriseCount: gameState.enterpriseCount || 0,
				ailabInternship: gameState.ailabInternship || false,
				firstBestPaperAccepted: gameState.firstBestPaperAccepted || false,
				firstABestPaperAccepted: gameState.firstABestPaperAccepted || false,

				lastResetMonth: gameState.lastResetMonth || 0,
				socialAwakened: gameState.socialAwakened || false,
				reviewerDistribution: gameState.reviewerDistribution || null,
				// ★★★ 新增：社交达人和导师子女觉醒字段 ★★★
				totalRelationshipsMet: gameState.totalRelationshipsMet || 0,
				autoAdvisorChat: gameState.autoAdvisorChat || false,
				badmintonYear: gameState.badmintonYear || -1,
				ideaClickCount: gameState.ideaClickCount || 0,
				expClickCount: gameState.expClickCount || 0,
				writeClickCount: gameState.writeClickCount || 0,
				consecutiveAccepts: gameState.consecutiveAccepts || 0,
				lastIdeaScore: gameState.lastIdeaScore || 0,
				lastExpScore: gameState.lastExpScore || 0,
				lastWriteScore: gameState.lastWriteScore || 0,
				hiddenAwakened: gameState.hiddenAwakened || false,
				hiddenAwakenType: gameState.hiddenAwakenType || null,
				actionLimit: gameState.actionLimit || 1,
				actionCount: gameState.actionCount || 0,
				noDecay: gameState.noDecay || false,
				hasSeniorHelpSkill: gameState.hasSeniorHelpSkill || false,
				usedSeniorHelpSkill: gameState.usedSeniorHelpSkill || false,
				hasTeacherHelpSkill: gameState.hasTeacherHelpSkill || false,
				usedTeacherHelpSkill: gameState.usedTeacherHelpSkill || false,
				monthlyWageBonus: gameState.monthlyWageBonus || 0,
				nextIdeaResearchBonus: gameState.nextIdeaResearchBonus || 0,
				nextIdeaBonusSource: gameState.nextIdeaBonusSource || null,
				isTrueNormal: gameState.isTrueNormal || false,
				researchMax: gameState.researchMax || 20,
				socialMax: gameState.socialMax || 20,
				favorMax: gameState.favorMax || 20,
				achievementCoins: gameState.achievementCoins || 0,
				earnedAchievementsThisGame: [...(gameState.earnedAchievementsThisGame || [])],
				// ★★★ 修复：保存黑市状态到自动存档 ★★★
				blackMarketState: blackMarketState ? {
					currentItems: blackMarketState.currentItems.map(item => ({
						id: item.item.id,
						locked: item.locked
					})),
					refreshCount: blackMarketState.refreshCount || 0,
					lastAutoRefreshMonth: blackMarketState.lastAutoRefreshMonth || 0,
					amuletUsedThisMonth: {...(blackMarketState.amuletUsedThisMonth || {})}
				} : null,
				// ★★★ 修复：保存护身符状态 ★★★
				amulets: gameState.amulets ? {...gameState.amulets} : null,
				// ★★★ 新增：商店机制字段 ★★★
				freeRefreshTickets: gameState.freeRefreshTickets || 0,
				refreshDiscount: gameState.refreshDiscount || 0,
				chainPurchaseLevel: gameState.chainPurchaseLevel || 0,
				memberCardLevel: gameState.memberCardLevel || 0,
				hasAutoRestock: gameState.hasAutoRestock || false,
				hasDisplayStand: gameState.hasDisplayStand || false,

				rejectedPapers: {...(gameState.rejectedPapers || {})},
				maxConcurrentReviews: gameState.maxConcurrentReviews || 0,
				phdOpportunitiesRejected: gameState.phdOpportunitiesRejected || 0,
				gpuServersBought: gameState.gpuServersBought || 0,
				furnitureBought: {...(gameState.furnitureBought || {})},
				chairUpgrade: gameState.chairUpgrade || null,
				achievementConditions: {...(gameState.achievementConditions || {})},
				paperTypeCollection: gameState.paperTypeCollection ? [...gameState.paperTypeCollection] : [],
				metBigBullCoop: gameState.metBigBullCoop || false,

				rejectedBeautifulLoverCount: gameState.rejectedBeautifulLoverCount || 0,
				rejectedSmartLoverCount: gameState.rejectedSmartLoverCount || 0,
				rejectedInternshipCount: gameState.rejectedInternshipCount || 0,
				rejectedBigBullCoopCount: gameState.rejectedBigBullCoopCount || 0,
				permanentlyBlockedBeautifulLover: gameState.permanentlyBlockedBeautifulLover || false,
				permanentlyBlockedSmartLover: gameState.permanentlyBlockedSmartLover || false,
				permanentlyBlockedInternship: gameState.permanentlyBlockedInternship || false,
				permanentlyBlockedBigBullCoop: gameState.permanentlyBlockedBigBullCoop || false,
				seniorHelpUses: gameState.seniorHelpUses || 0,
				teacherHelpUses: gameState.teacherHelpUses || 0,
				nextActionBonus: gameState.nextActionBonus || 0,
				nextActionBonusSource: gameState.nextActionBonusSource || null,
				nextActionBonusType: gameState.nextActionBonusType || null,

				submissionStats: gameState.submissionStats,
				pendingConferenceInfo: gameState.pendingConferenceInfo,
				shopState: shopState,
				saveTime: timeStr,

				// ★★★ 新增：人际关系系统保存 ★★★
				relationships: gameState.relationships ? JSON.parse(JSON.stringify(gameState.relationships)) : [],
				selectedAdvisor: gameState.selectedAdvisor ? {...gameState.selectedAdvisor} : null,

				// ★★★ 新增：S类期刊论文保存 ★★★
				paperS: gameState.paperS || 0,
				paperNature: gameState.paperNature || 0,
				paperNatureSub: gameState.paperNatureSub || 0,
				upgradedSlots: gameState.upgradedSlots ? [...gameState.upgradedSlots] : [],
				// ★★★ 新增：永久解锁记录 ★★★
				paperSlotsUnlocked: gameState.paperSlotsUnlocked || gameState.paperSlots || 1,
				relationshipSlotsUnlocked: gameState.relationshipSlotsUnlocked || 2,
				// ★★★ 新增：生涯里程碑和统计数据 ★★★
				careerMilestones: gameState.careerMilestones || [],
				peakStats: gameState.peakStats || null,
				totalSubmissions: gameState.totalSubmissions || 0,
				totalAccepts: gameState.totalAccepts || 0,
				totalRejects: gameState.totalRejects || 0,
				// ★★★ 修复：保存难度诅咒相关状态 ★★★
				difficultyPoints: gameState.difficultyPoints || 0,
				activeCurses: gameState.activeCurses ? {...gameState.activeCurses} : {},
				researchDecay: gameState.researchDecay || 0,
				researchDecayPeriod: gameState.researchDecayPeriod || 0,
				socialDecay: gameState.socialDecay || 0,
				socialDecayPeriod: gameState.socialDecayPeriod || 0,
				favorDecay: gameState.favorDecay || 0,
				favorDecayPeriod: gameState.favorDecayPeriod || 0,
				monthlySanDrain: gameState.monthlySanDrain || 0,
				monthlyExpenseBonus: gameState.monthlyExpenseBonus || 0,
				phdRequirementBonus: gameState.phdRequirementBonus || 0,
				graduationRequirementBonus: gameState.graduationRequirementBonus || 0,
				// ★★★ 新增：保存祝福相关状态 ★★★
				activeBlessings: gameState.activeBlessings ? {...gameState.activeBlessings} : {},
				monthlySanRecoveryPercent: gameState.monthlySanRecoveryPercent || 0,
				monthlyGoldPercent: gameState.monthlyGoldPercent || 0,
				researchGrowthPercent: gameState.researchGrowthPercent || 0,
				researchGrowthPeriod: gameState.researchGrowthPeriod || 0,
				socialGrowthPercent: gameState.socialGrowthPercent || 0,
				socialGrowthPeriod: gameState.socialGrowthPeriod || 0,
				favorGrowthPercent: gameState.favorGrowthPercent || 0,
				favorGrowthPeriod: gameState.favorGrowthPeriod || 0,
				// ★★★ 修复：订阅/预购状态 ★★★
				subscriptions: gameState.subscriptions ? {...gameState.subscriptions} : null,
				// ★★★ 修复：自行车和装备状态 ★★★
				hasBike: gameState.hasBike || false,
				bikeUpgrade: gameState.bikeUpgrade || null,
				bikeSanSpent: gameState.bikeSanSpent || 0,
				hasDownJacket: gameState.hasDownJacket || false,
				hasParasol: gameState.hasParasol || false,
				incomeDoubled: gameState.incomeDoubled || false,
				internshipAPaperCount: gameState.internshipAPaperCount || 0,
				goldMax: gameState.goldMax,
				slothAwakened: gameState.slothAwakened || false,
				beautifulLoverExtraRecoveryRate: gameState.beautifulLoverExtraRecoveryRate || 0,
				// ★★★ 修复：保存成就点数商店状态到自动存档 ★★★
				achievementPointShop: gameState.achievementPointShop ? {
					purchaseCount: gameState.achievementPointShop.purchaseCount || 0,
					accumulated: gameState.achievementPointShop.accumulated ? {...gameState.achievementPointShop.accumulated} : { san: 0, research: 0, social: 0, favor: 0, gold: 0 }
				} : null
			};
		}

		// 自动存档（每3个月触发一次，从第3月开始）
		function autoSave() {
			// 检查是否应该自动存档：第3, 6, 9, 12月...
			if (gameState.totalMonths < 3 || gameState.totalMonths % 3 !== 0) {
				return;
			}

			const autoSaves = getAutoSaves();
			const saveData = createSaveData();

			// 添加自动存档标签
			saveData.autoSaveLabel = `第${gameState.year}年第${gameState.month}月`;
			saveData.isAutoSave = true;
			// 添加唯一标识符用于去重
			saveData.saveKey = `${gameState.year}-${gameState.month}`;

			// ★★★ 去重逻辑：同一时间点只保留一个存档 ★★★
			// 查找是否已存在同一时间点的存档
			const existingIndex = autoSaves.findIndex(save =>
				save && save.saveKey === saveData.saveKey
			);

			if (existingIndex !== -1) {
				// 已存在同一时间点的存档，覆盖它
				autoSaves[existingIndex] = saveData;
				addLog('系统', '自动存档', `已覆盖 ${saveData.autoSaveLabel} 的存档`);
			} else {
				// 不存在同一时间点的存档，插入到最前面
				autoSaves.unshift(saveData);
				addLog('系统', '自动存档', `已保存 ${saveData.autoSaveLabel} 的进度`);
			}

			// 保留最近20个
			while (autoSaves.length > MAX_AUTO_SAVES) {
				autoSaves.pop();
			}

			saveAutoSaves(autoSaves);
		}

		// 打开自动存档读取弹窗
		function openAutoSaveModal() {
			const autoSaves = getAutoSaves();

			if (autoSaves.length === 0) {
				showModal('🔄 自动存档',
					`<p style="text-align:center;color:var(--text-secondary);">暂无自动存档</p>
					 <p style="text-align:center;font-size:0.8rem;color:var(--text-secondary);">游戏每3个月（第3、6、9、12月...）自动保存一次</p>`,
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			let html = `
				<div style="margin-bottom:10px;color:var(--text-secondary);font-size:0.8rem;">
					<i class="fas fa-info-circle"></i> 自动存档每3个月保存一次，开始新游戏后清空
				</div>
				<div style="max-height:400px;overflow-y:auto;">
			`;

			autoSaves.forEach((save, index) => {
				const modeIcon = save.isReversed ? '🌑' : '☀️';
				html += `
					<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--light-bg);border-radius:8px;margin-bottom:8px;">
						<div style="flex:1;">
							<div style="font-weight:600;font-size:0.9rem;">
								${modeIcon} ${save.autoSaveLabel || `第${save.year}年第${save.month}月`}
								<span style="font-size:0.7rem;color:var(--text-secondary);margin-left:5px;">${save.characterName}</span>
							</div>
							<div style="font-size:0.75rem;color:var(--text-secondary);">
								${save.degree === 'master' ? '硕士' : '博士'} | 科研分:${save.totalScore} | A:${save.paperA} B:${save.paperB} C:${save.paperC}
							</div>
							<div style="font-size:0.7rem;color:var(--text-secondary);">
								SAN:${save.san} 科研:${save.research} 社交:${save.social} 好感:${save.favor} 金:${save.gold}
							</div>
						</div>
						<button class="btn btn-primary" style="padding:5px 12px;font-size:0.75rem;" onclick="loadAutoSave(${index})">
							<i class="fas fa-undo"></i> 回溯
						</button>
					</div>
				`;
			});

			html += '</div>';

			showModal('🔄 自动存档', html, [
				{ text: '清空全部', class: 'btn-danger', action: confirmClearAutoSaves },
				{ text: '关闭', class: 'btn-info', action: closeModal }
			]);
		}

		// 确认清空自动存档
		function confirmClearAutoSaves() {
			showModal('⚠️ 确认清空',
				`<p>确定要清空所有自动存档吗？</p><p style="color:var(--danger-color);font-size:0.85rem;">此操作不可恢复！</p>`,
				[
					{ text: '取消', class: 'btn-info', action: openAutoSaveModal },
					{ text: '确定清空', class: 'btn-danger', action: () => {
						clearAutoSaves();
						closeModal();
						showModal('✅ 已清空', '<p style="text-align:center;">所有自动存档已清空</p>',
							[{ text: '确定', class: 'btn-primary', action: closeModal }]);
					}}
				]
			);
		}

		// 读取自动存档
		function loadAutoSave(index) {
			const autoSaves = getAutoSaves();
			const save = autoSaves[index];

			if (!save) {
				showModal('❌ 读取失败', '<p>该自动存档不存在！</p>',
					[{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			showModal('⚠️ 确认回溯',
				`<p>确定要回溯到 <strong>${save.autoSaveLabel}</strong> 吗？</p>
				 <p style="color:var(--warning-color);font-size:0.85rem;">当前游戏进度将丢失！</p>
				 <div style="background:var(--light-bg);padding:10px;border-radius:8px;margin-top:10px;font-size:0.8rem;">
					<div>科研分: ${save.totalScore} | SAN: ${save.san}</div>
					<div>论文: A×${save.paperA} B×${save.paperB} C×${save.paperC}</div>
				 </div>`,
				[
					{ text: '取消', class: 'btn-info', action: openAutoSaveModal },
					{ text: '确定回溯', class: 'btn-warning', action: () => {
						loadGameFromSave(save);
						addLog('系统', '回溯成功', `已回溯到 ${save.autoSaveLabel}`);
					}}
				]
			);
		}

		// 通用的从存档数据加载游戏（复用逻辑）
		function loadGameFromSave(save) {
			if (save.shopState) {
				save.shopState.forEach(savedItem => {
					const item = shopItems.find(i => i.id === savedItem.id);
					if (item) {
						item.bought = savedItem.bought;
						item.boughtThisMonth = savedItem.boughtThisMonth;
					}
				});
			}

			gameState = {
				character: save.character,
				characterName: save.characterName,
				degree: save.degree,
				year: save.year,
				month: save.month,
				totalMonths: save.totalMonths,
				maxYears: save.maxYears,
				san: save.san,
				sanMax: save.sanMax,
				research: save.research,
				social: save.social,
				favor: save.favor,
				gold: save.gold,

				paperA: save.paperA,
				paperB: save.paperB,
				paperC: save.paperC,
				totalScore: save.totalScore,
				totalCitations: save.totalCitations,
				publishedPapers: save.publishedPapers.map(p => ({
					...p,
					promotions: p.promotions ? { ...p.promotions } : { arxiv: false, github: false, xiaohongshu: false, quantumbit: false },
					citationMultiplier: p.citationMultiplier || 1,
					monthsSincePublish: p.monthsSincePublish || 0,
					pendingCitationFraction: p.pendingCitationFraction || 0,
					conferenceInfo: p.conferenceInfo || null,
					conferenceLocation: p.conferenceLocation || null,
					effectiveScore: p.effectiveScore || p.score,
					journalType: p.journalType || null,
					journalName: p.journalName || null
				})),
				paperSlots: save.paperSlots,

				papers: save.papers.map(p => {
					if (p === null) return null;
					return {
						title: p.title,
						ideaScore: p.ideaScore,
						expScore: p.expScore,
						writeScore: p.writeScore,
						reviewing: p.reviewing || false,
						reviewMonths: p.reviewing ? Math.min(4, Math.max(0, p.reviewMonths || 0)) : 0,
						submittedGrade: p.submittedGrade || null,
						submittedScore: p.submittedScore || 0,
						submittedMonth: p.submittedMonth || null,
						conferenceInfo: p.conferenceInfo || null,
						conferenceLocation: p.conferenceLocation || null,
						submittedIdeaScore: p.submittedIdeaScore || null,
						submittedExpScore: p.submittedExpScore || null,
						submittedWriteScore: p.submittedWriteScore || null,
						// ★★★ 修复：期刊投稿状态 ★★★
						journalRevising: p.journalRevising || false,
						journalRevisingType: p.journalRevisingType || null,
					};
				}),

				buffs: {
					permanent: save.buffs.permanent.map(b => ({ ...b })),
					temporary: save.buffs.temporary.map(b => ({ ...b }))
				},

				actionUsed: save.actionUsed,
				readCount: save.readCount,
				workCount: save.workCount || 0,
				firstPaperAccepted: save.firstPaperAccepted,
				firstAPaperAccepted: save.firstAPaperAccepted,
				firstNatureAccepted: save.firstNatureAccepted || false,
				firstNatureSubAccepted: save.firstNatureSubAccepted || false,
				hasLover: save.hasLover,
				loverType: save.loverType,
				bigBullCooperation: save.bigBullCooperation,
				bigBullCitationBonusApplied: save.bigBullCitationBonusApplied || 0,
				rejectedCount: save.rejectedCount,
				teaBreakCount: save.teaBreakCount,
				tourCount: save.tourCount,
				dinnerCount: save.dinnerCount || 0,
				badmintonCount: save.badmintonCount || 0,
				meetingCount: save.meetingCount || 0,
				metBigBull: save.metBigBull,
				metBeautiful: save.metBeautiful,
				metSmart: save.metSmart,
				bigBullDeepCount: save.bigBullDeepCount,
				beautifulCount: save.beautifulCount,
				smartCount: save.smartCount,
				enterpriseCount: save.enterpriseCount || 0,
				ailabInternship: save.ailabInternship || false,
				firstBestPaperAccepted: save.firstBestPaperAccepted || false,
				firstABestPaperAccepted: save.firstABestPaperAccepted || false,
				goldSpentTotal: save.goldSpentTotal || 0,

				availableRandomEvents: save.availableRandomEvents ? [...save.availableRandomEvents] : [],
				usedRandomEvents: save.usedRandomEvents ? [...save.usedRandomEvents] : [],
				totalRandomEventCount: save.totalRandomEventCount || 0,
				triggeredBuffTypes: save.triggeredBuffTypes ? [...save.triggeredBuffTypes] : [],
				coffeeBoughtCount: save.coffeeBoughtCount || 0,

				pendingPhDChoice: save.pendingPhDChoice || false,
				// ★★★ 新增：延毕发Nature相关字段 ★★★
				pendingNatureExtension: save.pendingNatureExtension || false,
				natureExtensionChoiceMade: save.natureExtensionChoiceMade || false,
				isNatureExtensionYear: save.isNatureExtensionYear || false,
				pendingConference: save.pendingConference || null,

				isReversed: save.isReversed === true,
				reversedAwakened: save.reversedAwakened === true,
				blockedResearchGains: save.blockedResearchGains || 0,

				lastResetMonth: save.lastResetMonth || 0,
				socialAwakened: save.socialAwakened || false,
				reviewerDistribution: save.reviewerDistribution || null,
				// ★★★ 新增：社交达人和导师子女觉醒字段 ★★★
				totalRelationshipsMet: save.totalRelationshipsMet || 0,
				autoAdvisorChat: save.autoAdvisorChat || false,
				badmintonYear: save.badmintonYear || -1,
				ideaClickCount: save.ideaClickCount || 0,
				expClickCount: save.expClickCount || 0,
				writeClickCount: save.writeClickCount || 0,
				consecutiveAccepts: save.consecutiveAccepts || 0,
				hiddenAwakened: save.hiddenAwakened || false,
				hiddenAwakenType: save.hiddenAwakenType || null,
				actionLimit: save.actionLimit || 1,
				actionCount: save.actionCount || 0,
				noDecay: save.noDecay || false,
				hasSeniorHelpSkill: save.hasSeniorHelpSkill || false,
				usedSeniorHelpSkill: save.usedSeniorHelpSkill || false,
				hasTeacherHelpSkill: save.hasTeacherHelpSkill || false,
				usedTeacherHelpSkill: save.usedTeacherHelpSkill || false,
				monthlyWageBonus: save.monthlyWageBonus || 0,
				nextIdeaResearchBonus: save.nextIdeaResearchBonus || 0,
				nextIdeaBonusSource: save.nextIdeaBonusSource || null,
				isTrueNormal: save.isTrueNormal || false,
				researchMax: save.researchMax || 20,
				socialMax: save.socialMax || 20,
				favorMax: save.favorMax || 20,
				metBigBullCoop: save.metBigBullCoop || false,

				rejectedBeautifulLoverCount: save.rejectedBeautifulLoverCount || 0,
				rejectedSmartLoverCount: save.rejectedSmartLoverCount || 0,
				rejectedInternshipCount: save.rejectedInternshipCount || 0,
				rejectedBigBullCoopCount: save.rejectedBigBullCoopCount || 0,
				permanentlyBlockedBeautifulLover: save.permanentlyBlockedBeautifulLover || false,
				permanentlyBlockedSmartLover: save.permanentlyBlockedSmartLover || false,
				permanentlyBlockedInternship: save.permanentlyBlockedInternship || false,
				permanentlyBlockedBigBullCoop: save.permanentlyBlockedBigBullCoop || false,
				seniorHelpUses: save.seniorHelpUses || 0,
				teacherHelpUses: save.teacherHelpUses || 0,
				nextActionBonus: save.nextActionBonus || 0,
				nextActionBonusSource: save.nextActionBonusSource || null,
				nextActionBonusType: save.nextActionBonusType || null,

				rejectedPapers: save.rejectedPapers ? {...save.rejectedPapers} : {},
				furnitureBought: save.furnitureBought ? {...save.furnitureBought} : {
					chair: false,
					monitor: false,
					keyboard: false
				},
				chairUpgrade: save.chairUpgrade || null,
				achievementConditions: save.achievementConditions ? {...save.achievementConditions} : {
					highScorePaper: false,
					unanimousImprovement: false,
					allBadReviewers: false,
					tripleRejected: false,
					bought5GPUs: false,
					fullFurnitureSet: false,
					phdRequirementMetEarly: false,
					rejectedPhdTwice: false
				},
				maxConcurrentReviews: save.maxConcurrentReviews || 0,
				phdOpportunitiesRejected: save.phdOpportunitiesRejected || 0,
				gpuServersBought: save.gpuServersBought || 0,
				paperTypeCollection: new Set(save.paperTypeCollection || []),
				submissionStats: save.submissionStats || null,
				pendingConferenceInfo: save.pendingConferenceInfo || null,

				// ★★★ 新增：人际关系系统恢复 ★★★
				relationships: save.relationships ? JSON.parse(JSON.stringify(save.relationships)) : [],
				selectedAdvisor: save.selectedAdvisor ? {...save.selectedAdvisor} : null,

				// ★★★ 新增：S类期刊论文恢复 ★★★
				paperS: save.paperS || 0,
				paperNature: save.paperNature || 0,
				paperNatureSub: save.paperNatureSub || 0,
				upgradedSlots: save.upgradedSlots ? [...save.upgradedSlots] : [],
				// ★★★ 新增：永久解锁记录恢复 ★★★
				paperSlotsUnlocked: save.paperSlotsUnlocked || save.paperSlots || 1,
				relationshipSlotsUnlocked: save.relationshipSlotsUnlocked || 2,
				// ★★★ 新增：生涯里程碑和统计数据恢复 ★★★
				careerMilestones: save.careerMilestones || [],
				peakStats: save.peakStats || null,
				totalSubmissions: save.totalSubmissions || 0,
				totalAccepts: save.totalAccepts || 0,
				totalRejects: save.totalRejects || 0
			};

			if (!gameState.availableRandomEvents || gameState.availableRandomEvents.length === 0) {
				if (!gameState.usedRandomEvents || gameState.usedRandomEvents.length === 0) {
					resetRandomEventPool();
				}
			}

			if (gameState.isReversed) {
				document.body.classList.add('reversed-theme');
				isReversedMode = true;
			} else {
				document.body.classList.remove('reversed-theme');
				isReversedMode = false;
			}

			// ★★★ 修复：恢复黑市状态 ★★★
			if (save.blackMarketState) {
				blackMarketState.currentItems = save.blackMarketState.currentItems.map(savedItem => {
					const item = blackMarketItems.find(i => i.id === savedItem.id);
					return item ? { item, locked: savedItem.locked } : null;
				}).filter(Boolean);
				blackMarketState.refreshCount = save.blackMarketState.refreshCount || 0;
				blackMarketState.lastAutoRefreshMonth = save.blackMarketState.lastAutoRefreshMonth || 0;
				blackMarketState.amuletUsedThisMonth = save.blackMarketState.amuletUsedThisMonth || {};
			}
			// ★★★ 修复：恢复护身符状态 ★★★
			gameState.amulets = save.amulets ? {...save.amulets} : null;
			gameState.achievementCoins = save.achievementCoins || 0;
			gameState.earnedAchievementsThisGame = save.earnedAchievementsThisGame ? [...save.earnedAchievementsThisGame] : [];
			// ★★★ 新增：恢复商店机制字段 ★★★
			gameState.freeRefreshTickets = save.freeRefreshTickets || 0;
			gameState.refreshDiscount = save.refreshDiscount || 0;
			gameState.chainPurchaseLevel = save.chainPurchaseLevel || 0;
			gameState.memberCardLevel = save.memberCardLevel || 0;
			gameState.hasAutoRestock = save.hasAutoRestock || false;
			gameState.hasDisplayStand = save.hasDisplayStand || false;

			// ★★★ 修复：恢复难度诅咒相关状态 ★★★
			gameState.difficultyPoints = save.difficultyPoints || 0;
			gameState.activeCurses = save.activeCurses ? {...save.activeCurses} : {};
			gameState.researchDecay = save.researchDecay || 0;
			gameState.researchDecayPeriod = save.researchDecayPeriod || 0;
			gameState.socialDecay = save.socialDecay || 0;
			gameState.socialDecayPeriod = save.socialDecayPeriod || 0;
			gameState.favorDecay = save.favorDecay || 0;
			gameState.favorDecayPeriod = save.favorDecayPeriod || 0;
			gameState.monthlySanDrain = save.monthlySanDrain || 0;
			gameState.monthlyExpenseBonus = save.monthlyExpenseBonus || 0;
			gameState.phdRequirementBonus = save.phdRequirementBonus || 0;
			gameState.graduationRequirementBonus = save.graduationRequirementBonus || 0;

			// ★★★ 新增：恢复祝福相关状态 ★★★
			gameState.activeBlessings = save.activeBlessings ? {...save.activeBlessings} : {};
			gameState.monthlySanRecoveryPercent = save.monthlySanRecoveryPercent || 0;
			gameState.monthlyGoldPercent = save.monthlyGoldPercent || 0;
			gameState.researchGrowthPercent = save.researchGrowthPercent || 0;
			gameState.researchGrowthPeriod = save.researchGrowthPeriod || 0;
			gameState.socialGrowthPercent = save.socialGrowthPercent || 0;
			gameState.socialGrowthPeriod = save.socialGrowthPeriod || 0;
			gameState.favorGrowthPercent = save.favorGrowthPercent || 0;
			gameState.favorGrowthPeriod = save.favorGrowthPeriod || 0;

			// ★★★ 修复：恢复订阅/预购状态 ★★★
			if (save.subscriptions) {
				gameState.subscriptions = {...save.subscriptions};
			}
			// ★★★ 修复：恢复自行车和装备状态 ★★★
			gameState.hasBike = save.hasBike || false;
			gameState.bikeUpgrade = save.bikeUpgrade || null;
			gameState.bikeSanSpent = save.bikeSanSpent || 0;
			gameState.hasDownJacket = save.hasDownJacket || false;
			gameState.hasParasol = save.hasParasol || false;
			gameState.incomeDoubled = save.incomeDoubled || false;
			gameState.internshipAPaperCount = save.internshipAPaperCount || 0;
			gameState.goldMax = save.goldMax;
			gameState.slothAwakened = save.slothAwakened || false;
			gameState.beautifulLoverExtraRecoveryRate = save.beautifulLoverExtraRecoveryRate || 0;
			// ★★★ 修复：恢复成就点数商店状态（自动存档）★★★
			if (save.achievementPointShop) {
				gameState.achievementPointShop = {
					purchaseCount: save.achievementPointShop.purchaseCount || 0,
					accumulated: save.achievementPointShop.accumulated ? {...save.achievementPointShop.accumulated} : { san: 0, research: 0, social: 0, favor: 0, gold: 0 }
				};
			}

			document.getElementById('start-screen').classList.add('hidden');
			document.getElementById('game-screen').style.display = 'block';
			document.getElementById('mobile-quick-bar').classList.add('game-active');

			updateAllUI();
			renderPaperSlots();
			closeModal();

			// 处理待审稿结果
			let pendingReviews = [];
			gameState.papers.forEach((paper, idx) => {
				if (paper && paper.reviewing && paper.reviewMonths <= 0) {
					pendingReviews.push(idx);
				}
			});

			if (pendingReviews.length > 0) {
				pendingReviews.forEach((idx, i) => {
					setTimeout(() => {
						if (gameState.papers[idx] && gameState.papers[idx].reviewing) {
							processPaperResult(idx);
						}
					}, 500 + i * 300);
				});
			}
		}

		// ==================== 全局函数暴露（供onclick调用）====================
		window.saveGame = saveGame;
		window.loadGame = loadGame;
		window.deleteSave = deleteSave;
		window.loadAutoSave = loadAutoSave;
		window.openLoadModalFromStart = openLoadModalFromStart;
		window.openAutoSaveModal = openAutoSaveModal;

