        // ==================== 游戏结局 ====================
        function triggerEnding(type) {
            // ★★★ 设置游戏结束标志，防止其他弹窗覆盖结局弹窗 ★★★
            gameState.gameEnded = true;

            let title, desc, emoji;
            let endingType = type;
            
            switch (type) {
				case 'isolated':
				title = '被孤立';
				desc = '你的社交能力降为负数，最终被同学和导师孤立，无法继续学业...';
				emoji = '😔';
				break;
                case 'burnout': title = '不堪重负'; desc = '繁重的科研压力压垮了你，你最终选择了离开...'; emoji = '😢'; break;
                case 'expelled': title = '逐出师门'; desc = '导师对你彻底失望，你被劝退了...'; emoji = '😭'; break;
                case 'poor': title = '穷困潦倒'; desc = '你连饭都吃不起了，只能含恨离开...'; emoji = '💸'; break;
                case 'delay': title = '延毕'; desc = '你没能在规定时间内完成毕业要求，只能延期毕业...'; emoji = '⏰'; break;
                case 'quit': title = '主动退学'; desc = '你决定放弃学业，开启人生新篇章...也许这也是一种勇气。'; emoji = '🚪'; break;
				case 'master':
					if (gameState.isTrueNormal) {
						const tempAchievements = collectAchievements('master');
						const achievementCount = tempAchievements.length;
						if (achievementCount >= 10 && gameState.totalCitations < 1000) {
							title = '真·感受生活';
							desc = '科研不是全部，你体验了丰富多彩的研究生生活。';
							emoji = '🌈';
							endingType = 'true_life';
							break;
						}
					}
					if (gameState.totalScore >= 4) { 
						title = '优秀硕士毕业'; 
						desc = '恭喜！你以优异的成绩完成了硕士学业，未来可期！'; 
						emoji = '🌟'; 
						endingType = 'excellent_master';
					} else { 
						title = '硕士毕业'; 
						desc = '恭喜！你顺利完成了硕士学业！'; 
						emoji = '🎓'; 
					}
					break;
                case 'phd':
                    const e = getPhDEndingType();
                    title = e.title; desc = e.desc; emoji = e.emoji;
                    endingType = e.type;
                    break;
            }
			// ★★★ 记录博士通关（用于解锁真·大多数）★★★
			if (HARD_ENDINGS.includes(endingType)) {
				recordCharacterPhdUnlock(gameState.character, gameState.isReversed);
			}
            
            recordEnding(endingType, title);

            const achievements = collectAchievements(endingType);
            recordAchievements(achievements);

            // ★★★ 游戏结束时批量写入投稿数据（节省数据库流量）★★★
            batchRecordSubmissions();

            showEndingModal(title, desc, emoji, endingType);
        }

		function getPhDEndingType() {
			const { paperA, totalCitations, bigBullCooperation, publishedPapers, isTrueNormal } = gameState;
			const totalPapers = publishedPapers.length;

			// ★★★ 新增：S类论文向下兼容A类（Nature/Nature子刊计入A类数量）★★★
			const paperS = (gameState.paperNature || 0) + (gameState.paperNatureSub || 0);
			const effectivePaperA = paperA + paperS;
			
			// ★★★ 真实结局判定（优先级最高）★★★
			if (isTrueNormal) {
				// 计算当前成就数量（用于真·感受生活判定）
				const tempAchievements = collectAchievements('phd');
				const achievementCount = tempAchievements.length;

				// 优先级1：真·诺奖之始（发表Nature论文）
				if ((gameState.paperNature || 0) >= 1) {
					return { type: 'true_nobel_start', title: '真·诺奖之始', desc: '没有任何外挂，你凭借自己的努力发表了Nature论文！', emoji: '🏅' };
				}

				// 优先级2：真·投身科研（引用≥1000）
				if (totalCitations >= 1000) {
					return { type: 'true_devotion', title: '真·投身科研', desc: '你用最朴素的方式，达到了科研的巅峰。', emoji: '💫' };
				}

				// 优先级3：真·博士毕业（发表≥3篇论文）
				if (totalPapers >= 3) {
					return { type: 'true_phd', title: '真·博士毕业', desc: '没有任何外挂，你凭借自己的努力完成了博士学业。', emoji: '🌟' };
				}

				// 优先级4：真·感受生活（12个成就）
				if (achievementCount >= 12) {
					return { type: 'true_life', title: '真·感受生活', desc: '科研不是全部，你体验了丰富多彩的研究生生活。', emoji: '🌈' };
				}

				// 真·大多数但未达成真实结局条件，返回普通博士结局
				return { type: 'phd', title: '博士毕业', desc: '恭喜！你顺利完成了博士学业！', emoji: '🎓' };
			}
			
			// ★★★ 新增：Nature论文结局（优先级很高）★★★
			if ((gameState.paperNature || 0) >= 1)
				return { type: 'nobel_start', title: '诺奖之始', desc: '发表Nature论文，你已踏上诺奖之路！', emoji: '🏅' };

			// 原有结局判定（使用effectivePaperA，S类论文计入A类数量）
			if (effectivePaperA >= 5 && totalCitations > 2000 && bigBullCooperation)
				return { type: 'future_academician', title: '未来院士', desc: '你的学术成就令人瞩目，成功去大牛组当副教授！', emoji: '👑' };
			if (effectivePaperA >= 5 && totalCitations > 1000 && bigBullCooperation)
				return { type: 'academic_star', title: '学术之星', desc: '你的才华被大牛赏识，成功去大牛组飞升疾走！', emoji: '⭐' };
			if (effectivePaperA >= 5 && totalCitations > 1000)
				return { type: 'become_advisor', title: '我就是导师', desc: '恭喜！你成功留校成为副教授！', emoji: '👨‍🏫' };
			if (effectivePaperA >= 4 && totalCitations > 500)
				return { type: 'green_pepper', title: '青椒', desc: '恭喜！你成功留校飞升疾走！', emoji: '🌶️' };
			if (effectivePaperA >= 3)
				return { type: 'excellent_phd', title: '优秀博士毕业', desc: '恭喜！你以优异的成绩完成了博士学业！', emoji: '🏆' };
			return { type: 'phd', title: '博士毕业', desc: '恭喜！你顺利完成了博士学业！', emoji: '🎓' };
		}

		function collectAchievements(endingType) {
			const a = [];

			// 定义顺利毕业的结局类型
			const graduationEndings = ['master', 'excellent_master', 'phd', 'excellent_phd', 'green_pepper', 'become_advisor', 'academic_star', 'future_academician', 'nobel_start', 'true_nobel_start', 'true_phd', 'true_devotion', 'true_life'];
			const isGraduated = graduationEndings.includes(endingType);

			// ★★★ 以下成就不需要顺利毕业也可以获得 ★★★
			if (gameState.hasLover) a.push('❤️ 喜结良缘');
			if (gameState.gold >= 30) a.push('💰 家财万贯');
			if (gameState.research > 15 && gameState.social > 15 && gameState.favor > 15 && gameState.gold > 15) a.push('⬡ 六边形战士');
			if (gameState.research >= 20) a.push('🏆 诺奖选手');
			if (gameState.social >= 20) a.push('🌸 交际花');
			if (gameState.favor >= 20) a.push('🤝 铁杆师生');
			if (gameState.teaBreakCount >= 3) a.push('☕ 我爱茶歇');
			if (gameState.tourCount >= 3) a.push('🏖️ 公费旅游');
			if (gameState.publishedPapers.length >= 10) a.push('🤖 论文机器');
			if (gameState.totalCitations >= 1000) a.push('📚 千引大佬');
			const coffeeBonus = 3 + Math.floor((gameState.coffeeBoughtCount || 0) / 15);
			if (coffeeBonus >= 6) a.push('☕ 绝世咖啡');
			if (gameState.triggeredBuffTypes && ALL_BUFF_TYPES.every(type => gameState.triggeredBuffTypes.includes(type))) a.push('✨ Buff之神');
			if (gameState.achievementConditions && gameState.achievementConditions.highScorePaper) a.push('📜 高分论文');
			if (gameState.achievementConditions && gameState.achievementConditions.unanimousImprovement) a.push('🍀 幸运儿');
			if (gameState.achievementConditions && gameState.achievementConditions.allBadReviewers) a.push('😭 倒霉蛋');
			// ★★★ 修改：全收集只需要6类（去掉best paper）★★★
			const requiredTypes = [
				'A-Poster', 'A-Oral',
				'B-Poster', 'B-Oral',
				'C-Poster', 'C-Oral'
			];
			if (gameState.paperTypeCollection && requiredTypes.every(type => gameState.paperTypeCollection.has(type))) a.push('🏆 全收集');
			if (gameState.rejectedCount >= 5) a.push('👊 越战越勇');
			if (gameState.achievementConditions && gameState.achievementConditions.rejectedPhdTwice) a.push('🧠 人间清醒');
			if (gameState.maxConcurrentReviews >= 4) a.push('🔥 火力全开');
			if (gameState.achievementConditions && gameState.achievementConditions.tripleRejected) a.push('🍚 食之无味');
			if (gameState.achievementConditions && gameState.achievementConditions.bought5GPUs) a.push('🤖 机械飞升');
			if (gameState.achievementConditions && gameState.achievementConditions.fullFurnitureSet) a.push('🛋️ 全套家具');
			if (gameState.achievementConditions && gameState.achievementConditions.phdRequirementMetEarly) a.push('🧒 天才少年');

			const hasCPaperOver100 = gameState.publishedPapers.some(p => p.grade === 'C' && p.citations > 100);
			if (hasCPaperOver100) a.push('💎 无法埋没');
			if (gameState.publishedPapers.length > 0 && gameState.publishedPapers[0].citations > 200) a.push('🔔 不鸣则已');
			const stats = [gameState.research, gameState.favor, gameState.social];
			const maxStat = Math.max(...stats);
			const minStat = Math.min(...stats);
			if (maxStat - minStat > 12) a.push('📊 严重偏科');
			if ((gameState.workCount || 0) >= 10) a.push('💼 打工狂人');
			if ((gameState.readCount || 0) >= 20) a.push('📖 爱看论文');
			if (gameState.achievementConditions && gameState.achievementConditions.twoInOneConference) a.push('🏹 一箭双雕');
			if (gameState.achievementConditions && gameState.achievementConditions.savedByPC) a.push('🎣 力挽狂澜');
			const rejectedLoverTwice = (gameState.rejectedBeautifulLoverCount >= 2) || (gameState.rejectedSmartLoverCount >= 2);
			if (rejectedLoverTwice && gameState.hasLover) { a.push('💕 我在等你');}
			const rejectedBigBullTwice = (gameState.rejectedBigBullCoopCount >= 2);
			const rejectedInternshipTwice = (gameState.rejectedInternshipCount >= 2);
			if (rejectedBigBullTwice && rejectedInternshipTwice) { a.push('🏠 偏安一隅');}

			// ★★★ 以下成就结局时判定（不需要顺利毕业）★★★
			if (gameState.san > 20) a.push('⚡ 精力满满');
			// 百发百中：前5次投稿全部命中
			const first5Submissions = (gameState.submissionHistory || []).slice(0, 5);
			if (first5Submissions.length >= 5 && first5Submissions.every(s => s.accepted)) a.push('🎯 百发百中');
			// ★★★ 修改：S类论文也算高端论文 ★★★
			const paperS_achievement = (gameState.paperNature || 0) + (gameState.paperNatureSub || 0);
			if ((gameState.paperA > 0 || paperS_achievement > 0) && gameState.paperB === 0 && gameState.paperC === 0) a.push('🎻 曲高和寡');
			if (rejectedLoverTwice && !gameState.hasLover) { a.push('💔 不入爱河');}
			// 强身健体：打羽毛球后成功规避了感冒事件
			if (gameState.achievementConditions && gameState.achievementConditions.badmintonAvoidedCold) a.push('💪 强身健体');

			// ★★★ 新增9个成就 ★★★
			if (gameState.badmintonChampionCount >= 1) a.push('🏸 羽球冠军');
			if (gameState.achievementConditions && gameState.achievementConditions.magicTowerMaster) a.push('🗼 穞堵臸猭畍');
			if (gameState.achievementConditions && gameState.achievementConditions.terraria300) a.push('🌲 300颗够吗');
			if (gameState.achievementConditions && gameState.achievementConditions.thankYouPlaying) a.push('🎓 感谢游玩');
			if (gameState.achievementConditions && gameState.achievementConditions.sickly) a.push('🤧 体弱多病');
			if (gameState.achievementConditions && gameState.achievementConditions.topStudent) a.push('🏅 三好学生');
			if (gameState.achievementConditions && gameState.achievementConditions.loveLife) a.push('❤️‍🩹 爱惜生命');
			if (gameState.achievementConditions && gameState.achievementConditions.nearDeath) a.push('💀 命悬一线');
			if (gameState.achievementConditions && gameState.achievementConditions.ktvKing) a.push('🎤 K歌之王');
			if (gameState.achievementConditions && gameState.achievementConditions.loveMyTeacher) a.push('💌 吾爱吾师');
			// ★★★ 新增3个成就 ★★★
			if (gameState.achievementConditions && gameState.achievementConditions.projectKing) a.push('👔 项目之王');
			if (gameState.achievementConditions && gameState.achievementConditions.learnToSayNo) a.push('🙅 学会拒绝');
			if (gameState.achievementConditions && gameState.achievementConditions.pokerGod) a.push('🃏 赌神转世');

			// ★★★ 新增5个成就 ★★★
			if ((gameState.paperNature || 0) >= 1) a.push('📰 Nature在手');
			if (gameState.achievementConditions && gameState.achievementConditions.upgradedEquipment) a.push('🪑 高级装备');
			// ★★★ 修复：人脉广阔需要5个角色且每个角色的亲和度或亲密度>=12 ★★★
			const hasWideConnections = gameState.relationships &&
				gameState.relationships.length >= 5 &&
				gameState.relationships.every(r => (r.affinity || 0) >= 12 || (r.intimacy || 0) >= 12);
			if (hasWideConnections) a.push('🤝 人脉广阔');
			// ★★★ 修复：顶尖大组需要5个角色且每个角色的科研能力或科研资源>=12 ★★★
			const isTopGroup = gameState.relationships &&
				gameState.relationships.length >= 5 &&
				gameState.relationships.every(r => (r.research || 0) >= 12 || (r.researchResource || 0) >= 12);
			if (isTopGroup) a.push('🔬 顶尖大组');
			if (gameState.achievementConditions && gameState.achievementConditions.journeyEnd) a.push('🏁 旅途的终点');
			// ★★★ 新增2个成就 ★★★
			// 全部升级：升级四个论文槽为期刊槽
			const allSlotsUpgraded = gameState.upgradedSlots && gameState.upgradedSlots.length >= 4;
			if (allSlotsUpgraded) a.push('⬆️ 全部升级');
			// 青出于蓝：你的论文引用数超过导师
			const advisor = gameState.relationships && gameState.relationships.find(r => r.type === 'advisor');
			const advisorCitations = advisor ? (advisor.citations || 0) : 0;
			if (advisorCitations > 0 && gameState.totalCitations > advisorCitations) a.push('📖 青出于蓝');
			// ★★★ 新增：好事成双 - 发表2篇Nature ★★★
			if ((gameState.paperNature || 0) >= 2) a.push('📰📰 好事成双');
			// ★★★ 新增：倒买倒卖 - 卖东西累计超过20金币 ★★★
			if ((gameState.totalSoldCoins || 0) > 20) a.push('💸 倒买倒卖');
			// ★★★ 新增：整装待发 - 同时拥有电动车+遮阳伞+羽绒服 ★★★
			if (gameState.bikeUpgrade === 'ebike' && gameState.hasParasol && gameState.hasDownJacket) a.push('🎒 整装待发');

			// ★★★ 以下成就仍然需要顺利毕业 ★★★
			if (!isGraduated) {
				return a;
			}

			// ★★★ 修改：检查毕业前一个月结束时的状态 ★★★
			if (gameState.achievementConditions && gameState.achievementConditions.allOutBeforeGrad) a.push('🏋️ 全力以赴');

			return a;
		}

		// ★★★ 新增：游戏内成就检测（实时检测可达成的成就）★★★
		function checkInGameAchievements() {
			const earnedThisGame = gameState.earnedAchievementsThisGame || [];
			const newAchievements = [];

			// 检测各种可在游戏中途达成的成就
			const achievementsToCheck = [];

			// 属性相关
			if (gameState.gold >= 30) achievementsToCheck.push('💰 家财万贯');
			if (gameState.research > 15 && gameState.social > 15 && gameState.favor > 15 && gameState.gold > 15) achievementsToCheck.push('⬡ 六边形战士');
			if (gameState.research >= 20) achievementsToCheck.push('🏆 诺奖选手');
			if (gameState.social >= 20) achievementsToCheck.push('🌸 交际花');
			if (gameState.favor >= 20) achievementsToCheck.push('🤝 铁杆师生');
			// ★★★ 修复：精力满满是"结局时"成就，不应在游戏中途检测 ★★★
			// if (gameState.san > 20) achievementsToCheck.push('⚡ 精力满满');
			const stats = [gameState.research, gameState.favor, gameState.social];
			const maxStat = Math.max(...stats);
			const minStat = Math.min(...stats);
			if (maxStat - minStat > 12) achievementsToCheck.push('📊 严重偏科');

			// 恋爱相关
			if (gameState.hasLover) achievementsToCheck.push('❤️ 喜结良缘');

			// 活动相关
			if (gameState.teaBreakCount >= 3) achievementsToCheck.push('☕ 我爱茶歇');
			if (gameState.tourCount >= 3) achievementsToCheck.push('🏖️ 公费旅游');
			if ((gameState.workCount || 0) >= 10) achievementsToCheck.push('💼 打工狂人');
			if ((gameState.readCount || 0) >= 20) achievementsToCheck.push('📖 爱看论文');

			// 论文相关
			if (gameState.publishedPapers.length >= 10) achievementsToCheck.push('🤖 论文机器');
			if (gameState.totalCitations >= 1000) achievementsToCheck.push('📚 千引大佬');
			if (gameState.rejectedCount >= 5) achievementsToCheck.push('👊 越战越勇');
			if (gameState.maxConcurrentReviews >= 4) achievementsToCheck.push('🔥 火力全开');
			const hasCPaperOver100 = gameState.publishedPapers.some(p => p.grade === 'C' && p.citations > 100);
			if (hasCPaperOver100) achievementsToCheck.push('💎 无法埋没');
			if (gameState.publishedPapers.length > 0 && gameState.publishedPapers[0].citations > 200) achievementsToCheck.push('🔔 不鸣则已');
			// ★★★ 修改：S类论文也算高端论文 ★★★
			const paperS_check = (gameState.paperNature || 0) + (gameState.paperNatureSub || 0);
			if ((gameState.paperA > 0 || paperS_check > 0) && gameState.paperB === 0 && gameState.paperC === 0) achievementsToCheck.push('🎻 曲高和寡');
			// 百发百中：前5次投稿全部命中
			const first5Submissions = (gameState.submissionHistory || []).slice(0, 5);
			if (first5Submissions.length >= 5 && first5Submissions.every(s => s.accepted)) achievementsToCheck.push('🎯 百发百中');

			// 咖啡相关
			const coffeeBonus = 3 + Math.floor((gameState.coffeeBoughtCount || 0) / 15);
			if (coffeeBonus >= 6) achievementsToCheck.push('☕ 绝世咖啡');

			// Buff相关
			if (gameState.triggeredBuffTypes && typeof ALL_BUFF_TYPES !== 'undefined' && ALL_BUFF_TYPES.every(type => gameState.triggeredBuffTypes.includes(type))) achievementsToCheck.push('✨ Buff之神');

			// 条件类成就
			if (gameState.achievementConditions) {
				if (gameState.achievementConditions.highScorePaper) achievementsToCheck.push('📜 高分论文');
				if (gameState.achievementConditions.unanimousImprovement) achievementsToCheck.push('🍀 幸运儿');
				if (gameState.achievementConditions.allBadReviewers) achievementsToCheck.push('😭 倒霉蛋');
				if (gameState.achievementConditions.tripleRejected) achievementsToCheck.push('🍚 食之无味');
				if (gameState.achievementConditions.bought5GPUs) achievementsToCheck.push('🤖 机械飞升');
				if (gameState.achievementConditions.fullFurnitureSet) achievementsToCheck.push('🛋️ 全套家具');
				if (gameState.achievementConditions.phdRequirementMetEarly) achievementsToCheck.push('🧒 天才少年');
				if (gameState.achievementConditions.rejectedPhdTwice) achievementsToCheck.push('🧠 人间清醒');
				if (gameState.achievementConditions.twoInOneConference) achievementsToCheck.push('🏹 一箭双雕');
				if (gameState.achievementConditions.savedByPC) achievementsToCheck.push('🎣 力挽狂澜');
				if (gameState.achievementConditions.badmintonAvoidedCold) achievementsToCheck.push('💪 强身健体');
				// ★★★ 新增9个成就检测 ★★★
				if (gameState.achievementConditions.magicTowerMaster) achievementsToCheck.push('🗼 穞堵臸猭畍');
				if (gameState.achievementConditions.terraria300) achievementsToCheck.push('🌲 300颗够吗');
				if (gameState.achievementConditions.thankYouPlaying) achievementsToCheck.push('🎓 感谢游玩');
				if (gameState.achievementConditions.sickly) achievementsToCheck.push('🤧 体弱多病');
				if (gameState.achievementConditions.topStudent) achievementsToCheck.push('🏅 三好学生');
				if (gameState.achievementConditions.loveLife) achievementsToCheck.push('❤️‍🩹 爱惜生命');
				if (gameState.achievementConditions.nearDeath) achievementsToCheck.push('💀 命悬一线');
				if (gameState.achievementConditions.ktvKing) achievementsToCheck.push('🎤 K歌之王');
				if (gameState.achievementConditions.loveMyTeacher) achievementsToCheck.push('💌 吾爱吾师');
				// ★★★ 新增3个成就检测 ★★★
				if (gameState.achievementConditions.projectKing) achievementsToCheck.push('👔 项目之王');
				if (gameState.achievementConditions.learnToSayNo) achievementsToCheck.push('🙅 学会拒绝');
				if (gameState.achievementConditions.pokerGod) achievementsToCheck.push('🃏 赌神转世');
			}
			// 羽球冠军
			if (gameState.badmintonChampionCount >= 1) achievementsToCheck.push('🏸 羽球冠军');

			// ★★★ 修改：全收集只需要6类（去掉best paper）★★★
			const requiredPaperTypes = [
				'A-Poster', 'A-Oral',
				'B-Poster', 'B-Oral',
				'C-Poster', 'C-Oral'
			];
			if (gameState.paperTypeCollection && requiredPaperTypes.every(type => gameState.paperTypeCollection.has(type))) achievementsToCheck.push('🏆 全收集');

			// 社交事件相关
			const rejectedLoverTwice = (gameState.rejectedBeautifulLoverCount >= 2) || (gameState.rejectedSmartLoverCount >= 2);
			if (rejectedLoverTwice && gameState.hasLover) achievementsToCheck.push('💕 我在等你');
			if (rejectedLoverTwice && !gameState.hasLover) achievementsToCheck.push('💔 不入爱河');
			const rejectedBigBullTwice = (gameState.rejectedBigBullCoopCount >= 2);
			const rejectedInternshipTwice = (gameState.rejectedInternshipCount >= 2);
			if (rejectedBigBullTwice && rejectedInternshipTwice) achievementsToCheck.push('🏠 偏安一隅');

			// ★★★ 新增5个成就检测 ★★★
			if ((gameState.paperNature || 0) >= 1) achievementsToCheck.push('📰 Nature在手');
			if (gameState.achievementConditions && gameState.achievementConditions.upgradedEquipment) achievementsToCheck.push('🪑 高级装备');
			// ★★★ 修复：人脉广阔需要5个角色且每个角色的亲和度或亲密度>=12 ★★★
			const hasWideConnections_check = gameState.relationships &&
				gameState.relationships.length >= 5 &&
				gameState.relationships.every(r => (r.affinity || 0) >= 12 || (r.intimacy || 0) >= 12);
			if (hasWideConnections_check) achievementsToCheck.push('🤝 人脉广阔');
			// ★★★ 修复：顶尖大组需要5个角色且每个角色的科研能力或科研资源>=12 ★★★
			const isTopGroup_check = gameState.relationships &&
				gameState.relationships.length >= 5 &&
				gameState.relationships.every(r => (r.research || 0) >= 12 || (r.researchResource || 0) >= 12);
			if (isTopGroup_check) achievementsToCheck.push('🔬 顶尖大组');
			if (gameState.achievementConditions && gameState.achievementConditions.journeyEnd) achievementsToCheck.push('🏁 旅途的终点');
			// ★★★ 新增2个成就检测 ★★★
			// 全部升级：升级四个论文槽为期刊槽
			const allSlotsUpgraded_check = gameState.upgradedSlots && gameState.upgradedSlots.length >= 4;
			if (allSlotsUpgraded_check) achievementsToCheck.push('⬆️ 全部升级');
			// 青出于蓝：你的论文引用数超过导师
			const advisor_check = gameState.relationships && gameState.relationships.find(r => r.type === 'advisor');
			const advisorCitations_check = advisor_check ? (advisor_check.citations || 0) : 0;
			if (advisorCitations_check > 0 && gameState.totalCitations > advisorCitations_check) achievementsToCheck.push('📖 青出于蓝');

			// ★★★ 新增6个成就检测 ★★★
			// 超级体魄：SAN上限达到45
			if ((gameState.sanMax || 20) >= 45) achievementsToCheck.push('💪 超级体魄');
			// 超级大脑：科研能力上限达到30
			if ((gameState.researchMax || 20) >= 30) achievementsToCheck.push('🧠 超级大脑');
			// 画龙点睛：全靠保底机制一次性为论文某一项分数提升达到20分
			if (gameState.achievementConditions && gameState.achievementConditions.floorBoost20) achievementsToCheck.push('✨ 画龙点睛');
			// 人情练达：和关系栏的所有角色共计交流50次
			const totalInteractCount_check = gameState.relationships ?
				gameState.relationships.reduce((sum, r) => sum + (r.stats?.interactCount || 0), 0) : 0;
			if (totalInteractCount_check >= 50) achievementsToCheck.push('🤝 人情练达');
			// 得力干将：完成导师任务12次
			const advisorForTask_check = gameState.relationships && gameState.relationships.find(r => r.type === 'advisor');
			if (advisorForTask_check && (advisorForTask_check.stats?.completedCount || 0) >= 12) achievementsToCheck.push('🎖️ 得力干将');
			// 琴瑟和鸣：完成恋人恋爱任务12次
			const loverForTask_check = gameState.relationships && gameState.relationships.find(r => r.type === 'lover');
			if (loverForTask_check && (loverForTask_check.stats?.completedCount || 0) >= 12) achievementsToCheck.push('💕 琴瑟和鸣');
			// ★★★ 新增：自然风干 - 论文的idea和实验分由于时间流逝都衰减为1 ★★★
			if (gameState.naturallyDried) achievementsToCheck.push('🍂 自然风干');
			// ★★★ 新增：骑行大佬 - 累计骑自行车减少30SAN ★★★
			if ((gameState.bikeSanSpent || 0) >= 30) achievementsToCheck.push('🚴 骑行大佬');
			// ★★★ 新增：好事成双 - 发表2篇Nature ★★★
			if ((gameState.paperNature || 0) >= 2) achievementsToCheck.push('📰📰 好事成双');
			// ★★★ 新增：倒买倒卖 - 卖东西累计超过20金币 ★★★
			if ((gameState.totalSoldCoins || 0) > 20) achievementsToCheck.push('💸 倒买倒卖');
			// ★★★ 新增：整装待发 - 同时拥有电动车+遮阳伞+羽绒服 ★★★
			if (gameState.bikeUpgrade === 'ebike' && gameState.hasParasol && gameState.hasDownJacket) achievementsToCheck.push('🎒 整装待发');

			// 检查哪些是新获得的
			achievementsToCheck.forEach(ach => {
				if (!earnedThisGame.includes(ach)) {
					newAchievements.push(ach);
				}
			});

			// 为新成就添加奖励
			newAchievements.forEach(ach => {
				gameState.earnedAchievementsThisGame.push(ach);
				gameState.achievementCoins = (gameState.achievementCoins || 0) + 5;
				addLog('🏆 成就达成', ach, '获得5成就币！');
			});

			return newAchievements;
		}


		function showEndingModal(title, desc, emoji, endingType) {
			currentEndingData = { title, desc, emoji, endingType };

			const achievements = collectAchievements(endingType);
			savePlayerRecord(endingType, achievements, gameState.isReversed);
			const locked = ALL_ACHIEVEMENTS.filter(x => !achievements.includes(x));

			const failedEndings = ['quit', 'burnout', 'expelled', 'poor', 'delay', 'isolated'];  // ★★★ 修复：添加isolated ★★★
			const successEndings = ['master', 'excellent_master', 'phd', 'excellent_phd', 'green_pepper', 'become_advisor', 'academic_star', 'future_academician'];
			// ★★★ 新增：真大多数成功结局不显示AI Lab推广 ★★★
			const trueNormalSuccessEndings = ['true_phd', 'true_devotion', 'true_life'];
			const isFailed = failedEndings.includes(endingType);
			const isSuccess = successEndings.includes(endingType);
			const isTrueNormalSuccess = trueNormalSuccessEndings.includes(endingType);

			// ★★★ 新增：生成失败原因信息 ★★★
			let failReasonHtml = '';
			if (isFailed && endingType !== 'quit' && endingType !== 'delay' && gameState.lastLog) {
				const log = gameState.lastLog;
				const resultText = log.result ? ` → ${log.result}` : '';
				failReasonHtml = `
				<div style="background:linear-gradient(135deg,rgba(254,202,202,0.5),rgba(254,178,178,0.5));border-radius:12px;padding:12px;margin-bottom:15px;border:1px solid rgba(239,68,68,0.3);">
					<div style="font-size:0.75rem;color:#b91c1c;font-weight:600;margin-bottom:6px;">💔 压垮骆驼的最后一根稻草</div>
					<div style="font-size:0.85rem;color:#7f1d1d;line-height:1.4;">
						<div style="opacity:0.7;">[${log.dateStr}] ${log.event}</div>
						<div style="font-weight:500;">${log.detail}${resultText}</div>
					</div>
				</div>`;
			}

			// ★★★ 移除顶部玩家统计 ★★★
		let html = `
			<div style="text-align:center;margin-bottom:15px;">
				<div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:10px;">
					<span style="font-size:2.5rem;">${emoji}</span>
					<span style="font-size:1.5rem;font-weight:700;color:var(--primary-color);">${title}</span>
				</div>
				<div style="color:var(--text-secondary);line-height:1.5;font-size:0.9rem;">${desc}</div>
			</div>`;

			// ★★★ 玩家统计放到作者广告栏上方 ★★★
			html += renderPlayerStatsHTML('default');

			// ★★★ 新增：显示难度信息 ★★★
			const diffPoints = gameState.difficultyPoints || 0;
			if (diffPoints > 0) {
				const activeCurses = gameState.activeCurses || {};
				let curseList = [];
				Object.keys(activeCurses).forEach(curseId => {
					const count = activeCurses[curseId];
					if (count > 0 && typeof CURSES !== 'undefined' && CURSES[curseId]) {
						const curse = CURSES[curseId];
						curseList.push(count > 1 ? `${curse.icon}${curse.name}×${count}` : `${curse.icon}${curse.name}`);
					}
				});
				html += `
				<div style="background:linear-gradient(135deg,rgba(74,25,66,0.15),rgba(139,0,0,0.1));border-radius:12px;padding:10px 14px;margin-bottom:12px;border:1px solid rgba(231,76,60,0.3);">
					<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
						<div style="display:flex;align-items:center;gap:8px;">
							<span style="font-size:1.2rem;">💀</span>
							<span style="font-size:0.85rem;font-weight:600;color:#c0392b;">难度 ${diffPoints}</span>
						</div>
						<div style="font-size:0.75rem;color:#8b0000;">${curseList.join(' ')}</div>
					</div>
				</div>`;
			}

			// ★★★ 新增：显示失败原因（放在统计栏下方）★★★
			html += failReasonHtml;

			if (isFailed) {
				html += `
				<div style="background:linear-gradient(135deg,rgba(251,207,232,0.6),rgba(245,208,254,0.6));border-radius:16px;padding:15px;margin-bottom:12px;text-align:center;">
					<div style="font-size:0.9rem;margin-bottom:10px;color:#6b7280;">💪 不要灰心！科研之路漫漫，来日方长~</div>
					<a href="http://xhslink.com/o/8czcPQfNziK" target="_blank" 
					   style="display:inline-block;padding:10px 24px;
							  background:linear-gradient(135deg,#ec4899,#a855f7);
							  color:white;text-decoration:none;border-radius:25px;font-size:0.85rem;font-weight:600;
							  box-shadow:0 4px 15px rgba(236,72,153,0.35);transition:all 0.3s ease;"
					   onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 6px 20px rgba(236,72,153,0.45)'"
					   onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px rgba(236,72,153,0.35)'">
						<i class="fas fa-palette"></i> 作者向你传授科研绘图心得
					</a>
				</div>`;
			}
			
			// ★★★ 修改：真·大多数成功结局不显示AI Lab推广 ★★★
			if (isSuccess && !isTrueNormalSuccess) {
				html += `
				<div style="background:linear-gradient(135deg,rgba(254,249,195,0.7),rgba(254,240,138,0.7));border-radius:16px;padding:15px;margin-bottom:12px;text-align:center;">
					<div style="font-size:0.9rem;margin-bottom:10px;color:#6b7280;">🎉 恭喜毕业！新的征程即将开始~</div>
					<a href="http://xhslink.com/o/AC6pvxkgOhv" target="_blank" 
					   style="display:inline-block;padding:10px 24px;
							  background:linear-gradient(135deg,#10b981,#059669);
							  color:white;text-decoration:none;border-radius:25px;font-size:0.85rem;font-weight:600;
							  box-shadow:0 4px 15px rgba(16,185,129,0.35);transition:all 0.3s ease;"
					   onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 6px 20px rgba(16,185,129,0.45)'"
					   onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px rgba(16,185,129,0.35)'">
						<i class="fas fa-building"></i> 作者诚邀你来上海AI Lab实习
					</a>
				</div>`;
			}

			const isTrueEnding = endingType === 'true_phd' || endingType === 'true_devotion';
			if (isTrueEnding) {
				html += `
				<div style="background:linear-gradient(135deg,rgba(255,215,0,0.2),rgba(255,140,0,0.2));border-radius:16px;padding:15px;margin-bottom:12px;border:2px solid rgba(255,140,0,0.5);">
					<div style="text-align:center;margin-bottom:12px;">
						<div style="font-size:1.5rem;margin-bottom:8px;">🎊</div>
						<div style="font-size:1.1rem;font-weight:700;color:#d68910;">恭喜你达成了真实结局！</div>
					</div>
					<div style="background:white;border-radius:10px;padding:15px;font-size:0.85rem;line-height:1.8;">
						<div style="margin-bottom:12px;"><strong style="color:#d68910;">📝 作者寄语：</strong></div>
						<div style="margin-bottom:10px;"><strong>如果你是在读研究生：</strong><br>祝你在读研路上一帆风顺，不忘初心，聪明勇敢有力气！💪</div>
						<div style="margin-bottom:10px;"><strong>如果你还没开始读研/读博：</strong><br>这是一个初步体会研究生生活的游戏，好好想想自己想要的是什么。🤔</div>
						<div><strong>如果你已经毕业了：</strong><br>那就权当重温那段逝去的时光吧，在游戏里大杀四方！🎮</div>
					</div>
					<div style="text-align:center;margin-top:12px;font-size:0.8rem;color:var(--text-secondary);">—— 感谢游玩《研究生模拟器》——</div>
				</div>`;
			}

			// ★★★ 调整顺序：生涯总结在前 ★★★
			// 生涯总结 - 浅粉黄渐变背景
			html += `<div style="background:linear-gradient(180deg,rgba(254,215,170,0.5) 0%,rgba(252,165,165,0.4) 100%);border-radius:16px;padding:15px;margin-bottom:12px;">
				<div style="text-align:center;margin-bottom:12px;">
					<button onclick="showCareerSummary()"
							style="display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 20px;
								   background:linear-gradient(135deg,#667eea,#764ba2);
								   color:white;border:none;border-radius:25px;font-size:0.9rem;font-weight:600;
								   cursor:pointer;box-shadow:0 4px 15px rgba(102,126,234,0.4);
								   transition:all 0.3s ease;font-family:inherit;"
							onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(102,126,234,0.5)'"
							onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px rgba(102,126,234,0.4)'">
						<i class="fas fa-book-open"></i>
						📖 回顾我的研究生生涯
					</button>
				</div>
				<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;font-size:0.8rem;color:#374151;">
					<div>👤 角色：${gameState.characterName}</div>
					<div>📅 历时：${gameState.totalMonths}个月</div>
					<div>📊 科研分：${gameState.totalScore}</div>
					<div>📝 论文数：${gameState.publishedPapers.length}</div>
					<div><span style="color:#e74c3c;font-weight:bold;">🅰️</span> A类：${gameState.paperA} <span style="color:#3498db;font-weight:bold;margin-left:6px;">🅱️</span> B类：${gameState.paperB}</div>
					<div>©️ C类：${gameState.paperC} 📈 引用：${gameState.totalCitations}</div>
					<div>🏆 Nature：${gameState.paperNature || 0} 📚 子刊：${gameState.paperNatureSub || 0}</div>
					<div>👥 关系人数：${(gameState.relationships || []).length}</div>
					<div>🧠 科研：${gameState.research} 👥 社交：${gameState.social}</div>
					<div>❤️ 好感：${gameState.favor} 💰 金币：${gameState.gold}</div>
				</div>
				<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;font-size:0.75rem;">
					<span style="padding:3px 8px;border-radius:12px;${gameState.hasLover ? 'background:rgba(236,72,153,0.2);color:#ec4899;' : 'background:rgba(156,163,175,0.2);color:#9ca3af;'}">
						💕 恋人${gameState.hasLover ? ' ✓' : ' ✗'}
					</span>
					<span style="padding:3px 8px;border-radius:12px;${gameState.bigBullCooperation ? 'background:rgba(16,185,129,0.2);color:#10b981;' : 'background:rgba(156,163,175,0.2);color:#9ca3af;'}">
						🎓 联培${gameState.bigBullCooperation ? ' ✓' : ' ✗'}
					</span>
					<span style="padding:3px 8px;border-radius:12px;${gameState.ailabInternship ? 'background:rgba(59,130,246,0.2);color:#3b82f6;' : 'background:rgba(156,163,175,0.2);color:#9ca3af;'}">
						🏢 实习${gameState.ailabInternship ? ' ✓' : ' ✗'}
					</span>
				</div>
			</div>`;

			if (achievements.length > 0) {
				// 成就卡片 - 浅粉黄渐变背景
				html += `
					<div style="background:linear-gradient(180deg,rgba(254,215,170,0.5) 0%,rgba(252,165,165,0.4) 100%);border-radius:16px;padding:15px;margin-bottom:12px;">
						<div style="font-weight:600;margin-bottom:10px;color:#d97706;">
							<i class="fas fa-trophy"></i> 达成成就 (${achievements.length})
						</div>
						<div style="display:flex;flex-wrap:wrap;gap:8px;">
							${achievements.map(a => `
								<span style="padding:6px 12px;background:white;border-radius:20px;font-size:0.8rem;color:#374151;border:1px solid #e5e7eb;cursor:pointer;transition:all 0.2s ease;"
									  onclick="showSingleAchievementRequirement('${a}')"
									  onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'"
									  onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='none'">
									${a}
								</span>
							`).join('')}
						</div>
					</div>`;
			}

			// ★★★ 重开按钮放在成就框之后 ★★★
			html += `
			<div style="text-align:center;margin-top:8px;">
				<button onclick="restartGame()"
						style="display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 35px;
							   background:linear-gradient(135deg,#8b5cf6,#a78bfa);
							   color:white;border:none;border-radius:25px;font-size:1rem;font-weight:600;
							   cursor:pointer;box-shadow:0 4px 15px rgba(139,92,246,0.35);
							   transition:all 0.3s ease;font-family:inherit;"
						onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 6px 20px rgba(139,92,246,0.45)'"
						onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 15px rgba(139,92,246,0.35)'">
					<i class="fas fa-redo"></i>
					<i class="fas fa-gamepad"></i>
					我要重开
				</button>
			</div>`;

			showModal('', html, []);
		}
        
		function showSingleAchievementRequirement(name) {
			const req = ACHIEVEMENT_REQUIREMENTS[name];
			if (!req) return;
			
			// ✅ 修复：正确判断成就是否达成
			const currentAchievements = currentEndingData 
				? collectAchievements(currentEndingData.endingType) 
				: [];
			const achieved = currentAchievements.includes(name);
            
            showModal('🏆 成就要求', `
                <div style="text-align:center;margin-bottom:15px;">
                    <div style="font-size:2rem;margin-bottom:10px;">${name.split(' ')[0]}</div>
                    <div style="font-size:1.1rem;font-weight:600;">${name}</div>
                    ${achieved ? '<div style="color:var(--success-color);margin-top:5px;">✓ 已达成</div>' : ''}
                </div>
                <div style="background:var(--light-bg);border-radius:10px;padding:15px;">
                    <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:5px;">达成条件：</div>
                    <div style="font-size:0.9rem;">${req}</div>
                </div>
            `, [{ 
                text: currentEndingData ? '返回结局' : '关闭', 
                class: 'btn-primary', 
                action: () => {
                    closeModal();
                    if (currentEndingData) {
                        setTimeout(() => {
                            showEndingModal(currentEndingData.title, currentEndingData.desc, currentEndingData.emoji, currentEndingData.endingType);
                        }, 100);
                    }
                }
            }]);
        }

        async function showEndingStatistics() {
            showModal('📊 全球统计', '<div style="text-align:center;padding:20px;"><i class="fas fa-spinner fa-spin"></i> 加载中...</div>', []);
            
            const stats = await getGlobalStats();
            
            if (!stats) {
                showModal('📊 全球统计', '<p style="text-align:center;color:var(--text-secondary);">暂无统计数据</p>', 
                    [{ 
                        text: currentEndingData ? '返回结局' : '关闭', 
                        class: 'btn-primary', 
                        action: () => {
                            closeModal();
                            if (currentEndingData) {
                                setTimeout(() => {
                                    showEndingModal(currentEndingData.title, currentEndingData.desc, currentEndingData.emoji, currentEndingData.endingType);
                                }, 100);
                            }
                        }
                    }]);
                return;
            }
            
            const mode = gameState.isReversed ? 'reversed' : 'normal';
            const modeStats = stats[mode];
            const modeIcon = gameState.isReversed ? '🌑' : '☀️';
            const modeName = gameState.isReversed ? '逆位' : '正位';
            
            let totalEndings = 0;
            for (const count of Object.values(modeStats.endings)) {
                totalEndings += count;
            }
            
            let html = `
                <div style="margin-bottom:15px;text-align:center;">
                    <span style="font-size:0.9rem;color:var(--primary-color);font-weight:600;">${modeIcon} ${modeName}模式统计</span>
                    <span style="font-size:0.75rem;color:var(--text-secondary);margin-left:10px;">共 ${totalEndings} 局游戏</span>
                </div>
                
                <div style="margin-bottom:15px;">
                    <div style="font-weight:600;font-size:0.85rem;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
                        <span>📜 结局统计</span>
                        <span style="font-size:0.7rem;color:var(--text-secondary);cursor:pointer;" onclick="showEndingRequirements()">
                            <i class="fas fa-question-circle"></i> 查看要求
                        </span>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:6px;max-height:180px;overflow-y:auto;">
            `;
            
            for (const [type, name] of Object.entries(ENDING_NAMES)) {
                const count = modeStats.endings[type] || 0;
                const percent = totalEndings > 0 ? ((count / totalEndings) * 100).toFixed(1) : 0;
                const barWidth = totalEndings > 0 ? (count / totalEndings) * 100 : 0;

                // ★★★ 修改：低于1%时显示人数 ★★★
                let displayText;
                if (parseFloat(percent) < 1 && count > 0) {
                    displayText = `<span style="color:var(--warning-color);font-weight:600;">${count}人 <span style="color:var(--text-secondary);font-weight:400;">(&lt;1%)</span></span>`;
                } else {
                    displayText = `<span style="color:var(--primary-color);font-weight:600;">${count} <span style="color:var(--text-secondary);font-weight:400;">(${percent}%)</span></span>`;
                }

                html += `
                    <div style="padding:6px 8px;background:var(--light-bg);border-radius:6px;cursor:pointer;" onclick="showSingleEndingRequirement('${type}')">
                        <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:3px;">
                            <span>${name}</span>
                            ${displayText}
                        </div>
                        <div style="height:4px;background:var(--border-color);border-radius:2px;overflow:hidden;">
                            <div style="width:${barWidth}%;height:100%;background:var(--primary-color);border-radius:2px;"></div>
                        </div>
                    </div>
                `;
            }
            
            html += `</div></div>
                
                <div>
                    <div style="font-weight:600;font-size:0.85rem;margin-bottom:8px;">🏆 成就统计</div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;max-height:120px;overflow-y:auto;">
            `;
            
            for (const ach of ALL_ACHIEVEMENTS) {
                const count = modeStats.achievements[ach] || 0;
                const opacity = count > 0 ? '1' : '0.5';
                html += `
                    <div style="padding:4px 8px;background:var(--light-bg);border-radius:6px;font-size:0.7rem;opacity:${opacity};cursor:pointer;" onclick="showSingleAchievementRequirement('${ach}')">
                        ${ach} <strong style="color:var(--success-color);">${count}</strong>
                    </div>
                `;
            }
            
            html += '</div></div>';
            
            showModal('📊 全球统计', html, [{ 
                text: currentEndingData ? '返回结局' : '关闭', 
                class: 'btn-primary', 
                action: () => {
                    closeModal();
                    if (currentEndingData) {
                        setTimeout(() => {
                            showEndingModal(currentEndingData.title, currentEndingData.desc, currentEndingData.emoji, currentEndingData.endingType);
                        }, 100);
                    }
                }
            }]);
        }

        function showEndingRequirements() {
            let html = '<div style="max-height:60vh;overflow-y:auto;">';
            
            for (const [type, name] of Object.entries(ENDING_NAMES)) {
                const req = ENDING_REQUIREMENTS[type] || '未知';
                html += `
                    <div style="padding:10px;background:var(--light-bg);border-radius:8px;margin-bottom:8px;">
                        <div style="font-weight:600;font-size:0.85rem;margin-bottom:4px;">${name}</div>
                        <div style="font-size:0.75rem;color:var(--text-secondary);">${req}</div>
                    </div>
                `;
            }
            html += '</div>';
            
            showModal('📜 结局达成要求', html, [{ 
                text: currentEndingData ? '返回结局' : '关闭', 
                class: 'btn-primary', 
                action: () => {
                    closeModal();
                    if (currentEndingData) {
                        setTimeout(() => {
                            showEndingModal(currentEndingData.title, currentEndingData.desc, currentEndingData.emoji, currentEndingData.endingType);
                        }, 100);
                    }
                }
            }]);
        }

        function showSingleEndingRequirement(type) {
            const name = ENDING_NAMES[type];
            const req = ENDING_REQUIREMENTS[type] || '未知';
            
            showModal('📜 结局要求', `
                <div style="text-align:center;margin-bottom:15px;">
                    <div style="font-size:1.1rem;font-weight:600;">${name}</div>
                </div>
                <div style="background:var(--light-bg);border-radius:10px;padding:15px;">
                    <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:5px;">达成条件：</div>
                    <div style="font-size:0.9rem;">${req}</div>
                </div>
            `, [{ 
                text: currentEndingData ? '返回结局' : '关闭', 
                class: 'btn-primary', 
                action: () => {
                    closeModal();
                    if (currentEndingData) {
                        setTimeout(() => {
                            showEndingModal(currentEndingData.title, currentEndingData.desc, currentEndingData.emoji, currentEndingData.endingType);
                        }, 100);
                    }
                }
            }]);
        }
		
		function showAchievementRequirements() {
			let html = '<div style="max-height:60vh;overflow-y:auto;">';
			
			// ✅ 修复：使用当前结局数据判断成就
			const currentAchievements = currentEndingData 
				? collectAchievements(currentEndingData.endingType) 
				: [];
			
			for (const [name, req] of Object.entries(ACHIEVEMENT_REQUIREMENTS)) {
				const achieved = currentAchievements.includes(name);
				html += `
					<div style="padding:10px;background:var(--light-bg);border-radius:8px;margin-bottom:8px;${achieved ? 'border-left:3px solid var(--success-color);' : ''}">
						<div style="font-weight:600;font-size:0.85rem;margin-bottom:4px;">
							${name} ${achieved ? '<span style="color:var(--success-color);">✓</span>' : ''}
						</div>
						<div style="font-size:0.75rem;color:var(--text-secondary);">${req}</div>
					</div>
				`;
			}
			html += '</div>';
			
			showModal('🏆 成就达成要求', html, [{ 
				text: currentEndingData ? '返回结局' : '关闭', 
				class: 'btn-primary', 
				action: () => {
					closeModal();
					if (currentEndingData) {
						setTimeout(() => {
							showEndingModal(currentEndingData.title, currentEndingData.desc, 
										   currentEndingData.emoji, currentEndingData.endingType);
						}, 100);
					}
				}
			}]);
		}
        // ==================== 重开确认 ====================
        function confirmRestart() {
            if (gameState.totalMonths > 0) {
                showModal('⚠️ 确认重开', 
                    '<p>确定要放弃当前游戏吗？</p><p style="color:var(--danger-color);font-size:0.85rem;">这将触发"主动退学"结局！</p>', 
                    [
                        { text: '继续游戏', class: 'btn-info', action: closeModal },
                        { text: '😢 主动退学', class: 'btn-danger', action: () => {
                            closeModal();
                            triggerEnding('quit');
                        }}
                    ]
                );
            } else {
                restartGame();
            }
        }

        function restartGame() {
            closeModal();
            
            currentEndingData = null;
            
            document.getElementById('mobile-quick-bar').classList.remove('game-active');
            
            selectedCharacter = null;
            document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
            
            document.getElementById('start-btn').disabled = true;
            document.getElementById('game-screen').style.display = 'none';
            document.getElementById('start-screen').classList.remove('hidden');

            const wasReversed = gameState.isReversed;
            if (wasReversed) {
                document.getElementById('normal-mode-btn').classList.remove('active');
                document.getElementById('reversed-mode-btn').classList.add('active', 'reversed-active');
            } else {
                document.body.classList.remove('reversed-theme');
                isReversedMode = false;
                document.getElementById('normal-mode-btn').classList.add('active');
                document.getElementById('reversed-mode-btn').classList.remove('active', 'reversed-active');
            }

            renderCharacterGrid();
            // 游戏结束返回时不刷新留言板/全球统计，等用户刷新页面时再更新（节省数据库流量）
            // loadGlobalStatsDisplay();
            // updateAllStatsDisplay();
        }

		// ==================== Meta进度系统 ====================
		const META_KEY = 'graduateSimulatorMeta';
		const GAME_START_DATE = '2025-12-15T00:00:00Z';

		function getLocalMeta() {
			const meta = localStorage.getItem(META_KEY);
			return meta ? JSON.parse(meta) : { normal: {}, reversed: {} };
		}

		function saveLocalMeta(meta) {
			localStorage.setItem(META_KEY, JSON.stringify(meta));
		}

		function getCharacterLocalRecord(characterId, isReversed) {
			const meta = getLocalMeta();
			const mode = isReversed ? 'reversed' : 'normal';
			return meta[mode]?.[characterId] || { maxScore: 0, maxCitations: 0, maxAchievements: 0, maxDifficulty: 0 };
		}

		function updateLocalMeta(character, isReversed, score, citations, achievementCount, endingType) {
			// ★★★ 新增：只有好结局才统计 ★★★
			const goodEndings = ['master', 'excellent_master', 'phd', 'excellent_phd', 'green_pepper', 'become_advisor', 'academic_star', 'future_academician', 'true_phd', 'true_devotion', 'true_life'];
			if (!goodEndings.includes(endingType)) {
				console.log('非毕业结局，不更新本地最高记录');
				return null;
			}

			const meta = getLocalMeta();
			const mode = isReversed ? 'reversed' : 'normal';

			if (!meta[mode]) meta[mode] = {};
			if (!meta[mode][character]) {
				meta[mode][character] = { maxScore: 0, maxCitations: 0, maxAchievements: 0, maxDifficulty: 0 };
			}

			const record = meta[mode][character];
			const difficultyPoints = gameState.difficultyPoints || 0;

			if (score > record.maxScore) record.maxScore = score;
			if (citations > record.maxCitations) record.maxCitations = citations;
			if (achievementCount > record.maxAchievements) record.maxAchievements = achievementCount;
			if (difficultyPoints > (record.maxDifficulty || 0)) record.maxDifficulty = difficultyPoints;

			saveLocalMeta(meta);
			return record;
		}

		// 全球角色记录缓存
		let globalCharacterRecords = null;
		let globalCharacterRecordsTime = 0;

		// ==================== 优化后：从缓存表获取角色记录 ====================
		async function getGlobalCharacterRecords() {
			// 先检查本地缓存
			const cached = getLocalCache(CACHE_KEYS.CHARACTER_RECORDS);
			if (cached) {
				console.log('使用本地缓存的角色记录');
				globalCharacterRecords = cached;
				globalCharacterRecordsTime = Date.now();
				return cached;
			}
			
			if (!supabase) return null;
			
			try {
				console.log('📊 从缓存表加载角色记录...');
				
				const { data, error } = await supabase
					.from('stats_character_records_cache')
					.select('character_id, is_reversed, record_type, max_score, max_citations, max_achievements');
				
				if (error) throw error;
				
				// 初始化数据结构
				const records = { normal: {}, reversed: {} };
				
				// 初始化所有角色
				const allCharIds = ['normal', 'genius', 'social', 'rich', 'teacher-child', 'chosen', 'true-normal'];
				allCharIds.forEach(charId => {
					records.normal[charId] = {
						today: { maxScore: 0, maxCitations: 0, maxAchievements: 0 },
						history: { maxScore: 0, maxCitations: 0, maxAchievements: 0 }
					};
					// 真·大多数只有正位
					if (charId !== 'true-normal') {
						records.reversed[charId] = {
							today: { maxScore: 0, maxCitations: 0, maxAchievements: 0 },
							history: { maxScore: 0, maxCitations: 0, maxAchievements: 0 }
						};
					}
				});
				
				// 填充缓存数据
				(data || []).forEach(row => {
					const mode = row.is_reversed ? 'reversed' : 'normal';
					const charId = row.character_id;
					const recordType = row.record_type; // 'today' or 'history'
					
					if (records[mode] && records[mode][charId] && records[mode][charId][recordType]) {
						records[mode][charId][recordType] = {
							maxScore: row.max_score || 0,
							maxCitations: row.max_citations || 0,
							maxAchievements: row.max_achievements || 0
						};
					}
				});
				
				// 更新缓存
				globalCharacterRecords = records;
				globalCharacterRecordsTime = Date.now();
				setLocalCache(CACHE_KEYS.CHARACTER_RECORDS, records);
				
				console.log('✅ 角色记录加载完成');
				return records;
				
			} catch (e) {
				console.error('获取角色记录失败:', e);
				return globalCharacterRecords || null;
			}
		}



