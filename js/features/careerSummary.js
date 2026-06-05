		// ==================== 生涯总结滑动卡片 ====================

		let currentSlide = 0;
		let totalSlides = 9;  // ★★★ 修改：减少到9页（去掉重要的第一次）★★★
		let touchStartX = 0;
		let touchEndX = 0;

		// ==================== 角色自述语录 ====================
		const CHARACTER_QUOTES = {
			'normal': {
				positive: '平凡之路，终见曙光。我用最普通的方式，走完了这段不普通的旅程。',
				negative: '也许我不是最聪明的，但我从未放弃过努力。'
			},
			'genius': {
				positive: '天赋是起点，努力才是终点。感谢这段旅程让我明白了这个道理。',
				negative: '聪明有时候也是一种负担，但我学会了如何与它相处。'
			},
			'social': {
				positive: '朋友遍天下，人脉即资源。感谢每一位在路上帮助过我的人。',
				negative: '有时候太在意别人的看法，反而迷失了自己。'
			},
			'rich': {
				positive: '金钱可以解决很多问题，但解决不了的，我用努力来补。',
				negative: '家里的支持让我没有后顾之忧，但我也想证明自己的价值。'
			},
			'teacher-child': {
				positive: '站在父母的肩膀上，我看到了更远的风景，也承担了更大的责任。',
				negative: '有时候压力很大，但这就是我选择的路。'
			},
			'chosen': {
				positive: '命运眷顾我，让我遇到了最好的时机和机会。',
				negative: '运气好只是暂时的，实力才是永恒的追求。'
			},
			'true-normal': {
				positive: '没有任何外挂，我凭自己的双手完成了这段旅程。',
				negative: '真实的科研之路，每一步都是自己走出来的。'
			}
		};

		// ==================== 导师描述 ====================
		const ADVISOR_DESCRIPTIONS = {
			'bigboss': {
				title: '学术大牛型导师',
				desc: '资源丰富、人脉广泛，但一年见不上几次面。邮件回复以天计算，组会以月计算。',
				quote: '"有什么问题问师兄师姐，我最近在忙一个大项目..."'
			},
			'handson': {
				title: '亲力亲为型导师',
				desc: '事无巨细都要过问，改论文改到你怀疑人生，但成长速度也是最快的。',
				quote: '"这个地方再改改，我觉得可以更好..."'
			},
			'laissez': {
				title: '放养型导师',
				desc: '给你充分的自由度，但也意味着你需要自己摸索前进的方向。',
				quote: '"你自己看着办吧，有问题再来找我。"'
			},
			'industry': {
				title: '产业合作型导师',
				desc: '项目多、资金足，但可能会被拉去做横向项目，学术产出要自己抓。',
				quote: '"这个月的项目进度怎么样了？"'
			},
			'young': {
				title: '青年教师型导师',
				desc: '刚起步的课题组，资源有限但关系亲近，一起成长的感觉。',
				quote: '"我们一起努力，把这个方向做起来！"'
			},
			'default': {
				title: '普通导师',
				desc: '中规中矩，该有的都有，该管的都管。',
				quote: '"按计划推进就好。"'
			}
		};

		// ==================== 人际关系描述 ====================
		const RELATION_DESCRIPTIONS = {
			'advisor': {
				icon: '👨‍🏫',
				typeName: '导师',
				getDesc: (r) => {
					// ★★★ 文科版：使用文科版导师描述 ★★★
					if (typeof IS_LIBERAL_ARTS !== 'undefined' && IS_LIBERAL_ARTS && typeof getLiberalArtsAdvisorDescription === 'function') {
						const advisorInfo = getLiberalArtsAdvisorDescription(r.advisorType);
						return advisorInfo.desc;
					}
					const advisorInfo = ADVISOR_DESCRIPTIONS[r.advisorType] || ADVISOR_DESCRIPTIONS['default'];
					return advisorInfo.desc;
				},
				getQuote: (r) => {
					// ★★★ 文科版：使用文科版导师描述 ★★★
					if (typeof IS_LIBERAL_ARTS !== 'undefined' && IS_LIBERAL_ARTS && typeof getLiberalArtsAdvisorDescription === 'function') {
						const advisorInfo = getLiberalArtsAdvisorDescription(r.advisorType);
						return advisorInfo.quote;
					}
					const advisorInfo = ADVISOR_DESCRIPTIONS[r.advisorType] || ADVISOR_DESCRIPTIONS['default'];
					return advisorInfo.quote;
				}
			},
			'lover': {
				icon: '❤️',
				typeName: '恋人',
				getDesc: (r) => {
					if (gameState.loverType === 'beautiful') {
						return '你的开心果，每天都能让你心情变好。约会虽然花钱，但看到TA的笑容一切都值了。';
					} else {
						return '你的灵魂伴侣，学术上的最佳拍档。一起讨论问题的时光总是过得特别快。';
					}
				},
				getQuote: (r) => {
					if (gameState.loverType === 'beautiful') {
						return '"今天去哪玩？我发现了一家新开的店！"';
					} else {
						return '"你这个idea很有意思，我们可以一起试试。"';
					}
				}
			},
			'senior': {
				icon: '👨‍🎓',
				getTypeName: (r) => r && r.gender === 'male' ? '师兄' : (r && r.gender === 'female' ? '师姐' : '师兄/师姐'),
				getDesc: (r) => '实验室里的前辈，踩过的坑比你走过的路还多。关键时刻的一句话，能省你好几个月。',
				getQuote: (r) => '"这个问题我之前也遇到过，你可以试试..."'
			},
			'junior': {
				icon: '👶',
				getTypeName: (r) => r && r.gender === 'male' ? '师弟' : (r && r.gender === 'female' ? '师妹' : '师弟/师妹'),
				getDesc: (r) => '需要你指导的后辈，教会他们的同时，你也在成长。',
				getQuote: (r) => '"师兄/师姐，这个地方我不太懂..."'
			},
			'classmate': {
				icon: '🧑‍🤝‍🧑',
				typeName: '同门',
				getDesc: (r) => '一起入学的战友，互相吐槽、互相帮助，一起走过这段难忘的时光。',
				getQuote: (r) => '"今晚一起去吃饭？最近压力好大。"'
			},
			'bigbull': {
				icon: '🌟',
				typeName: '学术大牛',
				getDesc: (r) => '业界大佬，一封推荐信能让你少奋斗好几年。',
				getQuote: (r) => '"你的研究很有潜力，保持联系。"'
			},
			'default': {
				icon: '👤',
				typeName: '朋友',
				getDesc: (r) => '研究生路上结识的朋友，虽然不常见面，但情谊长存。',
				getQuote: (r) => '"有空一起聚聚？"'
			}
		};

		// 显示生涯总结
		function showCareerSummary() {
			closeModal();
			currentSlide = 0;

			// 创建全屏容器
			const container = document.createElement('div');
			container.id = 'career-summary-container';
			container.innerHTML = generateCareerSummaryHTML();
			document.body.appendChild(container);

			// 添加触摸事件
			const slidesContainer = container.querySelector('.slides-container');
			slidesContainer.addEventListener('touchstart', handleTouchStart, { passive: true });
			slidesContainer.addEventListener('touchend', handleTouchEnd, { passive: true });

			// 添加键盘事件
			document.addEventListener('keydown', handleKeyDown);

			// 添加样式
			addCareerSummaryStyles();

			// 延迟显示动画
			setTimeout(() => {
				container.classList.add('visible');
				// 启动粒子动画
				startParticleAnimation();
			}, 50);
		}

		// 关闭生涯总结
		function closeCareerSummary() {
			const container = document.getElementById('career-summary-container');
			if (container) {
				container.classList.remove('visible');
				stopParticleAnimation();
				setTimeout(() => {
					container.remove();
					document.removeEventListener('keydown', handleKeyDown);
					// ★★★ 移除生涯总结样式，防止影响主游戏 ★★★
					const styles = document.getElementById('career-summary-styles');
					if (styles) {
						styles.remove();
					}
					// 返回结局弹窗
					if (currentEndingData) {
						showEndingModal(currentEndingData.title, currentEndingData.desc, currentEndingData.emoji, currentEndingData.endingType);
					}
				}, 300);
			}
		}

		// 生成HTML
		function generateCareerSummaryHTML() {
			const slides = [
				generateSlide1_Journey(),
				generateSlide2_Stats(),
				generateSlide3_Highlights(),
				generateSlide4_Lowlights(),
				generateSlide5_Leisure(),
				generateSlide7_BlessingsCurses(),  // ★★★ 祝福与诅咒页 ★★★
				generateSlide8_Relationships(),
				generateSlide9_Achievements(),
				generateSlide10_Share()
			];

			return `
				<div class="career-summary-wrapper">
					<canvas id="particles-canvas" class="particles-canvas"></canvas>
					<div class="slides-container" style="transform: translateX(0%);">
						${slides.map((slide, index) => `
							<div class="slide slide-${index + 1}" data-index="${index}">
								${slide}
							</div>
						`).join('')}
					</div>
					<div class="slide-indicators">
						${slides.map((_, index) => `
							<div class="indicator ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>
						`).join('')}
					</div>
					<div class="slide-nav">
						<button class="nav-btn prev-btn" onclick="prevSlide()" style="visibility: hidden;">
							<i class="fas fa-chevron-left"></i>
						</button>
						<button class="nav-btn next-btn" onclick="nextSlide()">
							<i class="fas fa-chevron-right"></i>
						</button>
					</div>
					<button class="close-summary-btn" onclick="closeCareerSummary()">
						<i class="fas fa-times"></i>
					</button>
				</div>
			`;
		}

		// ==================== 8张卡片内容生成 ====================

		// 卡片1：旅程概览（含角色自述）
		function generateSlide1_Journey() {
			const charData = characters.find(c => c.id === gameState.character);
			const displayData = gameState.isReversed && charData?.reversed ? charData.reversed : charData;
			const icon = displayData?.icon || '👤';
			const endingEmoji = currentEndingData?.emoji || '🎓';
			const endingTitle = currentEndingData?.title || '结局';

			const years = Math.floor(gameState.totalMonths / 12);
			const months = gameState.totalMonths % 12;
			const durationText = years > 0 ? `${years}年${months > 0 ? months + '个月' : ''}` : `${months}个月`;

			// ★★★ 新增：计算入学年份和结束年份 ★★★
			const baseYear = 2030;  // 游戏基准年份（2030年9月入学）
			const entryYear = baseYear;
			const endYear = baseYear + years + (months > 0 ? 1 : 0);
			const entryYearText = `${entryYear}年9月`;
			const endYearText = `${endYear}年${((gameState.month - 1 + 8) % 12) + 1}月`;

			// ★★★ 判断是否为毕业结局 ★★★
			const graduationEndings = ['master', 'excellent_master', 'phd', 'excellent_phd', 'green_pepper', 'become_advisor', 'academic_star', 'future_academician', 'nobel_start', 'true_phd', 'true_devotion', 'true_life', 'true_nobel_start', 'academic_newstar', 'university_teacher', 'field_expert', 'intellectual', 'national_scholar', 'writer_scholar', 'cultural_inheritor', 'independent_scholar', 'cultural_official', 'famous_journalist', 'think_tank_expert', 'social_activist', 'education_reformer', 'data_scientist', 'enterprise_consultant'];
			const isGraduated = graduationEndings.includes(currentEndingData?.endingType);
			const endActionText = isGraduated ? '毕业' : '结束';

			// 获取角色自述（文科版使用学科特定引用）
			const isPositiveEnding = graduationEndings.includes(currentEndingData?.endingType);
			let characterQuote;
			if (typeof IS_LIBERAL_ARTS !== 'undefined' && IS_LIBERAL_ARTS && typeof getLiberalArtsCharacterQuote === 'function') {
				characterQuote = getLiberalArtsCharacterQuote(gameState.character, gameState.discipline, isPositiveEnding);
			} else {
				const charQuotes = CHARACTER_QUOTES[gameState.character] || CHARACTER_QUOTES['normal'];
				characterQuote = isPositiveEnding ? charQuotes.positive : charQuotes.negative;
			}

			return `
				<div class="slide-content journey-slide">
					<div class="slide-bg journey-bg"></div>
					<div class="floating-elements">
						<div class="float-item float-1">📚</div>
						<div class="float-item float-2">💡</div>
						<div class="float-item float-3">🎓</div>
					</div>
					<div class="slide-inner">
						<h2 class="slide-title animate-title">我的研究生之旅</h2>
						<div class="journey-flow animate-fade-up">
							<div class="journey-start">
								<div class="journey-icon bounce-in">${icon}</div>
								<div class="journey-label">${gameState.characterName}</div>
								<div class="journey-sublabel">${gameState.isReversed ? '逆位' : '正位'}</div>
								<div class="journey-year">${entryYearText} 入学</div>
							</div>
							<div class="journey-arrow">
								<div class="arrow-line animated-line"></div>
								<div class="arrow-duration">${durationText}</div>
							</div>
							<div class="journey-end">
								<div class="journey-icon bounce-in delay-1">${endingEmoji}</div>
								<div class="journey-label">${endingTitle}</div>
								<div class="journey-sublabel">${gameState.degree === 'phd' ? '博士' : '硕士'}</div>
								<div class="journey-year">${endYearText} ${endActionText}</div>
							</div>
						</div>
						<div class="character-quote animate-fade-up delay-2">
							<div class="quote-icon">💭</div>
							<div class="quote-text">"${characterQuote}"</div>
							<div class="quote-author">—— ${gameState.characterName}</div>
						</div>
					</div>
				</div>
			`;
		}

		// 卡片2：数据统计（含Nature统计）
		function generateSlide2_Stats() {
			const acceptRate = gameState.totalSubmissions > 0
				? Math.round((gameState.totalAccepts / gameState.totalSubmissions) * 100)
				: 0;

			const paperNature = gameState.paperNature || 0;
			const paperNatureSub = gameState.paperNatureSub || 0;
			const hasTopPaper = paperNature > 0 || paperNatureSub > 0;

			return `
				<div class="slide-content stats-slide">
					<div class="slide-bg stats-bg"></div>
					<div class="slide-inner">
						<h2 class="slide-title animate-title">数据统计</h2>
						${hasTopPaper ? `
							<div class="top-paper-banner animate-fade-up">
								<div class="banner-glow"></div>
								<div class="banner-content">
									${paperNature > 0 ? `<span class="nature-badge">🏆 Nature ×${paperNature}</span>` : ''}
									${paperNatureSub > 0 ? `<span class="nature-sub-badge">🌟 Nature子刊 ×${paperNatureSub}</span>` : ''}
								</div>
							</div>
						` : ''}
						<div class="stats-grid animate-fade-up delay-1">
							<div class="stat-card stat-animate" style="--delay: 0">
								<div class="stat-value counter" data-target="${gameState.publishedPapers.length}">${gameState.publishedPapers.length}</div>
								<div class="stat-label">发表论文</div>
								<div class="stat-bar"><div class="stat-bar-fill" style="width: ${Math.min(100, gameState.publishedPapers.length * 10)}%"></div></div>
							</div>
							<div class="stat-card stat-animate" style="--delay: 1">
								<div class="stat-value counter" data-target="${gameState.totalCitations}">${gameState.totalCitations}</div>
								<div class="stat-label">总引用</div>
								<div class="stat-bar"><div class="stat-bar-fill" style="width: ${Math.min(100, gameState.totalCitations / 10)}%"></div></div>
							</div>
							<div class="stat-card stat-animate" style="--delay: 2">
								<div class="stat-value counter" data-target="${gameState.totalSubmissions || 0}">${gameState.totalSubmissions || 0}</div>
								<div class="stat-label">投稿次数</div>
							</div>
							<div class="stat-card stat-animate" style="--delay: 3">
								<div class="stat-value">${acceptRate}<span class="stat-unit">%</span></div>
								<div class="stat-label">中稿率</div>
								<div class="stat-ring" style="--percent: ${acceptRate}"></div>
							</div>
						</div>
						<div class="stats-extra animate-fade-up delay-2">
							<div class="extra-item"><span class="extra-icon">💡</span><span>想idea ${gameState.ideaClickCount || 0}次</span></div>
							<div class="extra-item"><span class="extra-icon">🔬</span><span>做实验 ${gameState.expClickCount || 0}次</span></div>
							<div class="extra-item"><span class="extra-icon">✍️</span><span>写论文 ${gameState.writeClickCount || 0}次</span></div>
							<div class="extra-item"><span class="extra-icon">📚</span><span>看论文 ${gameState.readCount || 0}次</span></div>
							<div class="extra-item"><span class="extra-icon">☕</span><span>喝咖啡 ${gameState.coffeeBoughtCount || 0}次</span></div>
							<div class="extra-item"><span class="extra-icon">💼</span><span>打工 ${gameState.workCount || 0}次</span></div>
						</div>
					</div>
				</div>
			`;
		}

		// 卡片3：高光时刻
		function generateSlide3_Highlights() {
			const highlights = getHighlightMilestones();

			return `
				<div class="slide-content highlights-slide">
					<div class="slide-bg highlights-bg"></div>
					<div class="sparkle-container">
						<div class="sparkle s1">✨</div>
						<div class="sparkle s2">⭐</div>
						<div class="sparkle s3">🌟</div>
						<div class="sparkle s4">💫</div>
					</div>
					<div class="slide-inner">
						<h2 class="slide-title animate-title">高光时刻</h2>
						${highlights.length > 0 ? `
							<div class="milestones-list">
								${highlights.map((m, i) => `
									<div class="milestone-item highlight-item animate-slide-in" style="--delay: ${i * 0.1}s">
										<div class="milestone-icon">🌟</div>
										<div class="milestone-main">
											<div class="milestone-time">第${m.year || Math.ceil(m.month/12)}年第${m.monthInYear || ((m.month-1)%12+1)}月</div>
											<div class="milestone-title">${m.title}</div>
											${m.detail ? `<div class="milestone-detail">${m.detail}</div>` : ''}
										</div>
									</div>
								`).join('')}
							</div>
						` : `
							<div class="empty-message animate-fade-up">
								<div class="empty-icon pulse">🌟</div>
								<div class="empty-text">平凡的日子也有闪光</div>
								<div class="empty-sub">每一天的努力都是高光</div>
							</div>
						`}
						${gameState.peakStats ? `
							<div class="peak-stats animate-fade-up delay-2">
								<div class="peak-item glow-effect">
									<span class="peak-icon">🧠</span>
									<span class="peak-label">科研巅峰</span>
									<span class="peak-value">${gameState.peakStats.maxResearch}</span>
								</div>
								<div class="peak-item glow-effect">
									<span class="peak-icon">👥</span>
									<span class="peak-label">社交巅峰</span>
									<span class="peak-value">${gameState.peakStats.maxSocial}</span>
								</div>
								<div class="peak-item glow-effect">
									<span class="peak-icon">💰</span>
									<span class="peak-label">最高金币</span>
									<span class="peak-value">${gameState.peakStats.maxGold}</span>
								</div>
							</div>
						` : ''}
					</div>
				</div>
			`;
		}

		// 卡片4：至暗时刻
		function generateSlide4_Lowlights() {
			const lowlights = getLowlightMilestones();

			return `
				<div class="slide-content lowlights-slide">
					<div class="slide-bg lowlights-bg"></div>
					<div class="rain-effect"></div>
					<div class="slide-inner">
						<h2 class="slide-title animate-title">至暗时刻</h2>
						${lowlights.length > 0 ? `
							<div class="milestones-list">
								${lowlights.map((m, i) => `
									<div class="milestone-item lowlight-item animate-slide-in" style="--delay: ${i * 0.1}s">
										<div class="milestone-icon">🌑</div>
										<div class="milestone-main">
											<div class="milestone-time">第${m.year || Math.ceil(m.month/12)}年第${m.monthInYear || ((m.month-1)%12+1)}月</div>
											<div class="milestone-title">${m.title}</div>
											${m.detail ? `<div class="milestone-detail">${m.detail}</div>` : ''}
										</div>
									</div>
								`).join('')}
							</div>
						` : `
							<div class="empty-message animate-fade-up">
								<div class="empty-icon">🍀</div>
								<div class="empty-text">一路顺风</div>
								<div class="empty-sub">愿你的好运继续延续</div>
							</div>
						`}
						<div class="lowlight-stats animate-fade-up delay-2">
							<div class="lowlight-stat">
								<div class="lowlight-icon">📝</div>
								<div class="lowlight-label">被拒次数</div>
								<div class="lowlight-value">${gameState.totalRejects || 0}</div>
							</div>
							${gameState.peakStats ? `
								<div class="lowlight-stat">
									<div class="lowlight-icon">💔</div>
									<div class="lowlight-label">SAN最低</div>
									<div class="lowlight-value">${gameState.peakStats.minSan}</div>
								</div>
							` : ''}
						</div>
						<div class="lowlight-extra animate-fade-up delay-3">
							${(gameState.hostileReviewerCount || 0) > 0 ? `
								<div class="lowlight-extra-item">
									<span class="lowlight-extra-icon">😈</span>
									<span>遇到恶意小同行 ${gameState.hostileReviewerCount}次</span>
								</div>
							` : ''}
							${(gameState.questionsReviewerCount || 0) > 0 ? `
								<div class="lowlight-extra-item">
									<span class="lowlight-extra-icon">❓</span>
									<span>遇到39问审稿人 ${gameState.questionsReviewerCount}次</span>
								</div>
							` : ''}
							${(gameState.coldCount || 0) > 0 ? `
								<div class="lowlight-extra-item">
									<span class="lowlight-extra-icon">🤧</span>
									<span>感冒 ${gameState.coldCount}次</span>
								</div>
							` : ''}
							${(gameState.serverCrashCount || 0) > 0 ? `
								<div class="lowlight-extra-item">
									<span class="lowlight-extra-icon">💥</span>
									<span>服务器崩溃 ${gameState.serverCrashCount}次</span>
								</div>
							` : ''}
							${(gameState.dataLossCount || 0) > 0 ? `
								<div class="lowlight-extra-item">
									<span class="lowlight-extra-icon">💾</span>
									<span>数据丢失 ${gameState.dataLossCount}次</span>
								</div>
							` : ''}
							${(gameState.ideaStolenCount || 0) > 0 ? `
								<div class="lowlight-extra-item">
									<span class="lowlight-extra-icon">🦊</span>
									<span>idea被偷 ${gameState.ideaStolenCount}次</span>
								</div>
							` : ''}
						</div>
						<div class="encouragement animate-fade-up delay-4">
							<div class="encourage-text">"低谷是为了让你更好地起跳"</div>
						</div>
					</div>
				</div>
			`;
		}

		// 卡片5：科研之余（生活点滴）
		function generateSlide5_Leisure() {
			const tourCount = gameState.tourCount || 0;
			const teaBreakCount = gameState.teaBreakCount || 0;
			const badmintonCount = gameState.badmintonCount || 0;
			const dinnerCount = gameState.dinnerCount || 0;
			const meetingCount = gameState.meetingCount || 0;
			const enterpriseCount = gameState.enterpriseCount || 0;

			// 计算总活动次数
			const totalActivities = tourCount + teaBreakCount + badmintonCount + dinnerCount;

			// 生成活动卡片
			const activities = [
				{ icon: '🏖️', name: '会议旅游', count: tourCount, desc: '会议结束后的放松时光' },
				{ icon: '☕', name: '茶歇晚宴', count: teaBreakCount, desc: '学术社交的好机会' },
				{ icon: '🏸', name: '羽毛球', count: badmintonCount, desc: '实验室的运动时光' },
				{ icon: '🍜', name: '聚餐', count: dinnerCount, desc: '和同门一起吃饭' },
				{ icon: '🎓', name: '学术会议', count: meetingCount, desc: '展示研究成果' },
				{ icon: '🏢', name: '企业交流', count: enterpriseCount, desc: '探索产业界机会' }
			].filter(a => a.count > 0);

			// 生成生活感悟
			let lifeQuote = '';
			if (totalActivities >= 10) {
				lifeQuote = '科研之路也有诗和远方';
			} else if (totalActivities >= 5) {
				lifeQuote = '劳逸结合，方能行稳致远';
			} else if (totalActivities >= 1) {
				lifeQuote = '偶尔的放松让科研更有动力';
			} else {
				lifeQuote = '专注科研的日子里，生活也别忘了精彩';
			}

			return `
				<div class="slide-content leisure-slide">
					<div class="slide-bg leisure-bg"></div>
					<div class="leisure-bubbles">
						<div class="bubble b1">🎮</div>
						<div class="bubble b2">🎵</div>
						<div class="bubble b3">📸</div>
						<div class="bubble b4">🌈</div>
					</div>
					<div class="slide-inner">
						<h2 class="slide-title animate-title">科研之余</h2>
						${activities.length > 0 ? `
							<div class="leisure-grid animate-fade-up">
								${activities.map((a, i) => `
									<div class="leisure-card animate-pop-in" style="--delay: ${i * 0.1}s">
										<div class="leisure-icon">${a.icon}</div>
										<div class="leisure-count">${a.count}</div>
										<div class="leisure-name">${a.name}</div>
										<div class="leisure-desc">${a.desc}</div>
									</div>
								`).join('')}
							</div>
							<div class="leisure-summary animate-fade-up delay-2">
								<div class="summary-icon">🌟</div>
								<div class="summary-stat">
									<span class="stat-number">${totalActivities}</span>
									<span class="stat-label">次课余活动</span>
								</div>
							</div>
						` : `
							<div class="empty-message animate-fade-up">
								<div class="empty-icon pulse">📚</div>
								<div class="empty-text">专心科研</div>
								<div class="empty-sub">一心扑在学术上的日子</div>
							</div>
						`}
						<div class="leisure-quote animate-fade-up delay-3">
							<div class="quote-decoration">❝</div>
							<div class="quote-content">${lifeQuote}</div>
							<div class="quote-decoration">❞</div>
						</div>
					</div>
				</div>
			`;
		}

		// 卡片6：重要的第一次
		function generateSlide6_FirstTimes() {
			const firstTimes = getFirstTimeMilestones();

			return `
				<div class="slide-content firsttimes-slide">
					<div class="slide-bg firsttimes-bg"></div>
					<div class="slide-inner">
						<h2 class="slide-title animate-title">重要的第一次</h2>
						${firstTimes.length > 0 ? `
							<div class="timeline-container">
								<div class="timeline-line"></div>
								${firstTimes.map((m, index) => `
									<div class="timeline-item animate-pop-in" style="--delay: ${index * 0.15}s">
										<div class="timeline-dot ${getTimelineDotClass(m.type)}"></div>
										<div class="timeline-card">
											<div class="timeline-month">第${m.month}月</div>
											<div class="timeline-title">${m.title}</div>
											${m.detail ? `<div class="timeline-detail">${m.detail}</div>` : ''}
										</div>
									</div>
								`).join('')}
							</div>
						` : `
							<div class="empty-message animate-fade-up">
								<div class="empty-icon">📜</div>
								<div class="empty-text">每一天都是新的开始</div>
							</div>
						`}
					</div>
				</div>
			`;
		}

		// ★★★ 新增：卡片7：祝福与诅咒 ★★★
		function generateSlide7_BlessingsCurses() {
			const diffPoints = gameState.difficultyPoints || 0;
			const activeCurses = gameState.activeCurses || {};
			const activeBlessings = gameState.activeBlessings || {};

			// 获取选择的诅咒列表
			const cursesList = [];
			if (typeof CURSES !== 'undefined') {
				Object.keys(activeCurses).forEach(curseId => {
					const count = activeCurses[curseId];
					if (count > 0 && CURSES[curseId]) {
						const curse = CURSES[curseId];
						cursesList.push({
							icon: curse.icon,
							name: curse.name,
							count: count,
							desc: curse.desc,
							points: curse.pointCosts[count - 1] || 0
						});
					}
				});
			}

			// ★★★ 获取选择的祝福列表 ★★★
			const blessingsList = [];
			if (typeof BLESSINGS !== 'undefined') {
				Object.keys(activeBlessings).forEach(blessingId => {
					const count = activeBlessings[blessingId];
					if (count > 0 && BLESSINGS[blessingId]) {
						const blessing = BLESSINGS[blessingId];
						blessingsList.push({
							icon: blessing.icon,
							name: blessing.name,
							count: count,
							desc: blessing.desc,
							points: blessing.pointCosts[count - 1] || 0
						});
					}
				});
			}

			// ★★★ 计算祝福负分 ★★★
			let blessingPoints = 0;
			blessingsList.forEach(b => { blessingPoints += b.points; });

			// ★★★ 逆位角色无法使用祝福 ★★★
			const isReversed = gameState.isReversed || false;

			return `
				<div class="slide-content curses-slide">
					<div class="slide-bg curses-bg"></div>
					<div class="skull-particles">
						<div class="skull-float s1">💀</div>
						<div class="skull-float s2">🦴</div>
						<div class="skull-float s3">☠️</div>
					</div>
					<div class="slide-inner">
						<h2 class="slide-title animate-title">祝福与诅咒</h2>

						<!-- 祝福区域 -->
						<div class="blessings-section animate-fade-up">
							<div class="section-header">
								<span class="section-icon">✨</span>
								<span class="section-title">祝福</span>
								${blessingPoints < 0 ? `<span class="difficulty-badge-slide blessing-badge">${blessingPoints}分</span>` : ''}
							</div>
							${isReversed ? `
								<div class="blessings-empty">
									<div class="empty-icon">🚫</div>
									<div class="empty-text">无法被祝福者</div>
									<div class="empty-sub">逆位角色无法接受祝福</div>
								</div>
							` : (blessingsList.length > 0 ? `
								<div class="blessings-list-slide">
									${blessingsList.map((blessing, i) => `
										<div class="blessing-card animate-pop-in" style="--delay: ${i * 0.1}s">
											<div class="blessing-card-icon">${blessing.icon}</div>
											<div class="blessing-card-info">
												<div class="blessing-card-name">${blessing.name}${blessing.count > 1 ? ` ×${blessing.count}` : ''}</div>
												<div class="blessing-card-desc">${blessing.desc}</div>
											</div>
											<div class="blessing-card-points">${blessing.points}</div>
										</div>
									`).join('')}
								</div>
								<div class="blessings-summary animate-fade-up delay-2">
									<span class="summary-icon">⭐</span>
									<span class="summary-text">共获得 <strong>${blessingsList.length}</strong> 项祝福</span>
								</div>
							` : `
								<div class="blessings-empty">
									<div class="empty-icon">😇</div>
									<div class="empty-text">无祝福加成</div>
									<div class="empty-sub">凭自己的实力通关</div>
								</div>
							`)}
						</div>

						<!-- 诅咒区域 -->
						<div class="curses-section animate-fade-up delay-1">
							<div class="section-header">
								<span class="section-icon">💀</span>
								<span class="section-title">诅咒</span>
								${diffPoints > 0 ? `<span class="difficulty-badge-slide">${diffPoints}分</span>` : ''}
							</div>
							${cursesList.length > 0 ? `
								<div class="curses-list-slide">
									${cursesList.map((curse, i) => `
										<div class="curse-card animate-pop-in" style="--delay: ${i * 0.1}s">
											<div class="curse-card-icon">${curse.icon}</div>
											<div class="curse-card-info">
												<div class="curse-card-name">${curse.name}${curse.count > 1 ? ` ×${curse.count}` : ''}</div>
												<div class="curse-card-desc">${curse.desc}</div>
											</div>
											<div class="curse-card-points">+${curse.points}</div>
										</div>
									`).join('')}
								</div>
								<div class="curses-summary animate-fade-up delay-2">
									<span class="summary-icon">☠️</span>
									<span class="summary-text">共承受 <strong>${cursesList.length}</strong> 项诅咒</span>
								</div>
							` : `
								<div class="curses-empty">
									<div class="empty-icon">😇</div>
									<div class="empty-text">无诅咒加成</div>
									<div class="empty-sub">轻松模式通关</div>
								</div>
							`}
						</div>
					</div>
				</div>
			`;
		}

		// 卡片8：人际关系（增强版 - 动态分页）
		function generateSlide8_Relationships() {
			const relationships = gameState.relationships || [];
			const advisor = relationships.find(r => r.type === 'advisor');
			const lover = relationships.find(r => r.type === 'lover');
			const bigbull = relationships.find(r => r.type === 'bigbull');
			const others = relationships.filter(r => r.type !== 'advisor' && r.type !== 'lover' && r.type !== 'bigbull');

			// ★★★ 计算总的任务次数和交流次数 ★★★
			let totalTaskCount = 0;
			let totalInteractCount = 0;
			relationships.forEach(r => {
				const stats = r.stats || {};
				totalTaskCount += stats.taskCount || 0;
				totalInteractCount += stats.interactCount || 0;
			});

			// ★★★ 生成关系列表（单页显示所有关系）★★★
			const generateRelationItem = (relation, type) => {
				const desc = RELATION_DESCRIPTIONS[type] || RELATION_DESCRIPTIONS['default'];
				const typeName = desc.getTypeName ? desc.getTypeName(relation) : desc.typeName;
				const stats = relation.stats || {};
				const taskCount = stats.taskCount || 0;
				const interactCount = stats.interactCount || 0;

				return `
					<div class="relation-row">
						<span class="relation-row-icon">${desc.icon}</span>
						<span class="relation-row-name">${relation.name}</span>
						<span class="relation-row-type">${typeName}</span>
						<span class="relation-row-stats">
							<span class="row-stat">📋${taskCount}</span>
							<span class="row-stat">💬${interactCount}</span>
						</span>
					</div>
				`;
			};

			// 生成所有关系行
			let relationRows = '';
			if (advisor) relationRows += generateRelationItem(advisor, 'advisor');
			if (lover) relationRows += generateRelationItem(lover, 'lover');
			if (bigbull) relationRows += generateRelationItem(bigbull, 'bigbull');
			others.forEach(r => {
				relationRows += generateRelationItem(r, r.type);
			});

			return `
				<div class="slide-content relationships-slide">
					<div class="slide-bg relationships-bg"></div>
					<div class="heart-particles"></div>
					<div class="slide-inner">
						<h2 class="slide-title animate-title">人际关系</h2>

						<!-- 总计统计 -->
						<div class="relation-total-stats animate-fade-up">
							<div class="total-stat-item">
								<span class="total-stat-icon">👥</span>
								<span class="total-stat-value">${relationships.length}</span>
								<span class="total-stat-label">结识人数</span>
							</div>
							<div class="total-stat-item">
								<span class="total-stat-icon">📋</span>
								<span class="total-stat-value">${totalTaskCount}</span>
								<span class="total-stat-label">完成任务</span>
							</div>
							<div class="total-stat-item">
								<span class="total-stat-icon">💬</span>
								<span class="total-stat-value">${totalInteractCount}</span>
								<span class="total-stat-label">交流次数</span>
							</div>
						</div>

						<!-- 关系列表 -->
						<div class="relation-list-container animate-fade-up delay-1">
							${relationRows || '<div class="empty-message"><div class="empty-icon">😔</div><div class="empty-text">独行侠模式</div></div>'}
						</div>

						<!-- 徽章 -->
						<div class="relation-badges animate-fade-up delay-2">
							${gameState.hasLover ? '<span class="summary-badge love-badge">❤️ 有情人终成眷属</span>' : ''}
							${gameState.bigBullCooperation ? '<span class="summary-badge collab-badge">🌟 大牛联培</span>' : ''}
						</div>
					</div>
				</div>
			`;
		}

		// ★★★ 新增：紧凑版关系卡片（VIP区域用）★★★
		function generateRelationCardCompact(relation, type, index) {
			const desc = RELATION_DESCRIPTIONS[type] || RELATION_DESCRIPTIONS['default'];
			const relationQuote = typeof desc.getQuote === 'function' ? desc.getQuote(relation) : '';
			const typeName = desc.getTypeName ? desc.getTypeName(relation) : desc.typeName;

			// ★★★ 根据类型生成详细属性信息 ★★★
			let statsHtml = '';
			if (type === 'advisor') {
				const advisorInfo = ADVISOR_DESCRIPTIONS[relation.advisorType] || ADVISOR_DESCRIPTIONS['default'];
				statsHtml = `
					<div class="compact-stats">
						<span class="compact-stat">🔬${relation.researchResource || 0}</span>
						<span class="compact-stat">💖${relation.affinity || 0}</span>
						<span class="compact-stat">📄${relation.papers || 0}</span>
					</div>
					<div class="compact-title">${advisorInfo.title}</div>
				`;
			} else if (type === 'lover') {
				const loverTypeText = gameState.loverType === 'smart' ? '聪慧型' : '活泼型';
				statsHtml = `
					<div class="compact-stats">
						<span class="compact-stat">🔬${relation.research || 0}</span>
						<span class="compact-stat">💕${relation.intimacy || 0}</span>
						<span class="compact-stat-tag">${loverTypeText}</span>
					</div>
				`;
			} else if (type === 'bigbull') {
				statsHtml = `
					<div class="compact-stats">
						<span class="compact-stat">🌟 学术大牛</span>
					</div>
				`;
			}

			return `
				<div class="relation-card-compact animate-slide-in" style="--delay: ${index * 0.1}s">
					<div class="compact-avatar">${desc.icon}</div>
					<div class="compact-info">
						<div class="compact-type">${typeName}</div>
						<div class="compact-name">${relation.name}</div>
						${statsHtml}
					</div>
					<div class="compact-quote">${relationQuote}</div>
				</div>
			`;
		}

		// ★★★ 新增：迷你版关系卡片（实验室成员用）★★★
		function generateRelationCardMini(relation, type, index) {
			const desc = RELATION_DESCRIPTIONS[type] || RELATION_DESCRIPTIONS['default'];
			const stats = relation.stats || {};
			const helpCount = stats.helpReceivedCount || 0;
			const interactCount = stats.interactCount || 0;
			const typeName = desc.getTypeName ? desc.getTypeName(relation) : desc.typeName;

			return `
				<div class="relation-card-mini animate-pop-in" style="--delay: ${index * 0.05}s">
					<div class="mini-header">
						<span class="mini-icon">${desc.icon}</span>
						<span class="mini-name">${relation.name}</span>
					</div>
					<div class="mini-type">${typeName}</div>
					<div class="mini-stats">
						${helpCount > 0 ? `<span class="mini-stat">🎁${helpCount}</span>` : ''}
						${interactCount > 0 ? `<span class="mini-stat">💬${interactCount}</span>` : ''}
					</div>
				</div>
			`;
		}

		// 生成关系卡片（增强版）
		function generateRelationCard(relation, type, index) {
			const desc = RELATION_DESCRIPTIONS[type] || RELATION_DESCRIPTIONS['default'];
			const relationDesc = typeof desc.getDesc === 'function' ? desc.getDesc(relation) : '';
			const relationQuote = typeof desc.getQuote === 'function' ? desc.getQuote(relation) : '';
			const typeName = desc.getTypeName ? desc.getTypeName(relation) : desc.typeName;

			// ★★★ 使用真实统计数据 ★★★
			const stats = relation.stats || { taskCount: 0, interactCount: 0, completedCount: 0, helpReceivedCount: 0 };
			const taskCount = stats.taskCount || 0;
			const interactCount = stats.interactCount || 0;
			const completedCount = stats.completedCount || 0;
			const helpReceivedCount = stats.helpReceivedCount || 0;

			// 获取最终属性值
			let finalAttrHtml = '';
			if (type === 'advisor') {
				finalAttrHtml = `
					<div class="relation-stat">
						<span class="stat-icon">🔬</span>
						<span class="stat-text">科研资源 ${relation.researchResource || 0}</span>
					</div>
					<div class="relation-stat">
						<span class="stat-icon">💖</span>
						<span class="stat-text">亲和度 ${relation.affinity || 0}</span>
					</div>
				`;
			} else if (type === 'lover') {
				finalAttrHtml = `
					<div class="relation-stat">
						<span class="stat-icon">🔬</span>
						<span class="stat-text">科研能力 ${relation.research || 0}</span>
					</div>
					<div class="relation-stat">
						<span class="stat-icon">💕</span>
						<span class="stat-text">亲密度 ${relation.intimacy || 0}</span>
					</div>
				`;
			} else if (['senior', 'junior', 'peer'].includes(type)) {
				finalAttrHtml = `
					<div class="relation-stat">
						<span class="stat-icon">🔬</span>
						<span class="stat-text">科研能力 ${relation.research || 0}</span>
					</div>
					<div class="relation-stat">
						<span class="stat-icon">💖</span>
						<span class="stat-text">亲和度 ${relation.affinity || 0}</span>
					</div>
				`;
			}

			return `
				<div class="relation-card-enhanced animate-slide-in" style="--delay: ${index * 0.1}s">
					<div class="relation-header">
						<div class="relation-avatar">${desc.icon}</div>
						<div class="relation-info">
							<div class="relation-type-tag">${typeName}</div>
							<div class="relation-name">${relation.name}</div>
						</div>
					</div>
					<div class="relation-body">
						<div class="relation-desc">${relationDesc}</div>
						<div class="relation-quote">${relationQuote}</div>
					</div>
					<div class="relation-footer">
						<div class="relation-stats-grid">
							${finalAttrHtml}
							<div class="relation-stat">
								<span class="stat-icon">📋</span>
								<span class="stat-text">推进任务 ${taskCount}次</span>
							</div>
							<div class="relation-stat">
								<span class="stat-icon">💬</span>
								<span class="stat-text">交流 ${interactCount}次</span>
							</div>
							<div class="relation-stat">
								<span class="stat-icon">🎁</span>
								<span class="stat-text">获得帮助 ${helpReceivedCount}次</span>
							</div>
						</div>
					</div>
				</div>
			`;
		}

		// 单身卡片
		function generateSingleCard() {
			return `
				<div class="relation-card-enhanced single-card animate-slide-in" style="--delay: 0.1s">
					<div class="relation-header">
						<div class="relation-avatar">💪</div>
						<div class="relation-info">
							<div class="relation-type-tag">情感状态</div>
							<div class="relation-name">单身贵族</div>
						</div>
					</div>
					<div class="relation-body">
						<div class="relation-desc">专注科研，心无旁骛。也许缘分还在路上，也许独自一人也是一种选择。</div>
						<div class="relation-quote">"先把自己变得更优秀吧！"</div>
					</div>
				</div>
			`;
		}

		// 卡片9：成就墙
		function generateSlide9_Achievements() {
			const achievements = currentEndingData ? collectAchievements(currentEndingData.endingType) : [];

			return `
				<div class="slide-content achievements-slide">
					<div class="slide-bg achievements-bg"></div>
					<div class="trophy-glow"></div>
					<div class="slide-inner">
						<h2 class="slide-title animate-title">成就墙</h2>
						${achievements.length > 0 ? `
							<div class="achievements-showcase">
								${achievements.map((a, i) => `
									<div class="achievement-item animate-pop-in" style="--delay: ${i * 0.05}s">
										<div class="achievement-icon">${a.split(' ')[0]}</div>
										<div class="achievement-text">${a.split(' ').slice(1).join(' ')}</div>
									</div>
								`).join('')}
							</div>
							<div class="achievement-summary animate-fade-up delay-2">
								<div class="summary-ring">
									<div class="ring-fill" style="--percent: ${Math.min(100, achievements.length * 2)}"></div>
									<div class="ring-text">${achievements.length}</div>
								</div>
								<div class="summary-label">成就达成</div>
							</div>
						` : `
							<div class="empty-message animate-fade-up">
								<div class="empty-icon bounce">🎯</div>
								<div class="empty-text">下次加油！</div>
								<div class="empty-sub">成就等你来解锁</div>
							</div>
						`}
					</div>
				</div>
			`;
		}

		// 卡片10：分享页（增强版）
		function generateSlide10_Share() {
			const charData = characters.find(c => c.id === gameState.character);
			const displayData = gameState.isReversed && charData?.reversed ? charData.reversed : charData;
			const icon = displayData?.icon || '👤';
			const endingEmoji = currentEndingData?.emoji || '🎓';
			const endingTitle = currentEndingData?.title || '结局';
			const achievements = currentEndingData ? collectAchievements(currentEndingData.endingType) : [];

			const paperNature = gameState.paperNature || 0;
			const paperNatureSub = gameState.paperNatureSub || 0;

			// ★★★ 新增：计算入学和毕业年份 ★★★
			const baseYear = 2030;  // 2030年9月入学
			const years = Math.floor(gameState.totalMonths / 12);
			const months = gameState.totalMonths % 12;
			const gradYear = baseYear + years + (months > 0 ? 1 : 0);
			const gradMonth = ((gameState.month - 1 + 8) % 12) + 1;

			// ★★★ 判断是否为毕业结局 ★★★
			const graduationEndings = ['master', 'excellent_master', 'phd', 'excellent_phd', 'green_pepper', 'become_advisor', 'academic_star', 'future_academician', 'nobel_start', 'true_phd', 'true_devotion', 'true_life', 'true_nobel_start', 'academic_newstar', 'university_teacher', 'field_expert', 'intellectual', 'national_scholar', 'writer_scholar', 'cultural_inheritor', 'independent_scholar', 'cultural_official', 'famous_journalist', 'think_tank_expert', 'social_activist', 'education_reformer', 'data_scientist', 'enterprise_consultant'];
			const isGraduated = graduationEndings.includes(currentEndingData?.endingType);

			// ★★★ 新增：计算中稿率 ★★★
			const acceptRate = gameState.totalSubmissions > 0
				? Math.round((gameState.totalAccepts / gameState.totalSubmissions) * 100)
				: 0;

			// ★★★ 新增：计算人际关系数量 ★★★
			const relationCount = (gameState.relationships || []).length;

			// ★★★ 新增：计算活动总次数 ★★★
			const tourCount = gameState.tourCount || 0;
			const teaBreakCount = gameState.teaBreakCount || 0;
			const badmintonCount = gameState.badmintonCount || 0;
			const meetingCount = gameState.meetingCount || 0;

			// ★★★ 新增：计算里程碑数量 ★★★
			const milestoneCount = (gameState.careerMilestones || []).length;

			// ★★★ 删除：不再使用标签，改为显示毕业属性 ★★★

			// ★★★ 新增：获取难度分 ★★★
			const difficultyPoints = gameState.difficultyPoints || 0;

			// ★★★ 新增：获取人际关系信息 ★★★
			const relationships = gameState.relationships || [];
			const advisor = relationships.find(r => r.type === 'advisor');
			const lover = relationships.find(r => r.type === 'lover');
			const hasLover = gameState.hasLover || false;
			const hasBigBull = gameState.bigBullCooperation || false;
			const hasInternship = gameState.internshipCompleted || false;

			return `
				<div class="slide-content share-slide">
					<div class="slide-bg share-bg"></div>
					<div class="confetti-container"></div>
					<div class="slide-inner">
						<h2 class="slide-title animate-title">分享你的故事</h2>
						<div id="share-poster" class="share-poster-enhanced animate-fade-up">
							<div class="poster-bg-pattern"></div>
							<div class="poster-header">
								<div class="poster-logo">🎓</div>
								<div class="poster-title">研究生模拟器</div>
								<div class="poster-subtitle">毕业纪念卡</div>
							</div>
							<div class="poster-main">
								<!-- 玩家游戏统计 -->
								${renderPlayerStatsHTML('poster')}

								<div class="poster-journey">
									<div class="journey-from">
										<span class="p-icon">${icon}</span>
										<span class="p-name">${gameState.characterName}</span>
										<span class="p-year">${baseYear}.9入学</span>
									</div>
									<div class="journey-arrow-p">
										<span class="arrow-text">${gameState.totalMonths}个月</span>
										<div class="arrow-line-p"></div>
									</div>
									<div class="journey-to">
										<span class="p-icon">${endingEmoji}</span>
										<span class="p-name">${endingTitle}</span>
										<span class="p-year">${gradYear}.${gradMonth}${isGraduated ? '毕业' : '结束'}</span>
									</div>
								</div>

								<!-- 核心数据 -->
								<div class="poster-stats-grid">
									<div class="p-stat">
										<div class="p-stat-value">${gameState.publishedPapers.length}</div>
										<div class="p-stat-label">论文</div>
									</div>
									<div class="p-stat">
										<div class="p-stat-value">${gameState.totalCitations}</div>
										<div class="p-stat-label">引用</div>
									</div>
									<div class="p-stat">
										<div class="p-stat-value">${achievements.length}</div>
										<div class="p-stat-label">成就</div>
									</div>
									<div class="p-stat ${difficultyPoints > 0 ? 'p-stat-difficulty' : ''}">
										<div class="p-stat-value">${difficultyPoints > 0 ? '💀' + difficultyPoints : '0'}</div>
										<div class="p-stat-label">难度</div>
									</div>
								</div>

								<!-- 论文分布（精简：合并ABC和Nature） -->
								<div class="poster-paper-row">
									<span class="paper-item a-item">A×${gameState.paperA || 0}</span>
									<span class="paper-item b-item">B×${gameState.paperB || 0}</span>
									<span class="paper-item c-item">C×${gameState.paperC || 0}</span>
									${paperNature > 0 ? `<span class="paper-item nature-item">🏆N×${paperNature}</span>` : ''}
									${paperNatureSub > 0 ? `<span class="paper-item naturesub-item">🌟子×${paperNatureSub}</span>` : ''}
								</div>

								<!-- 毕业属性 -->
								<div class="poster-final-stats">
									<div class="final-stat-item">
										<span class="final-stat-value">${gameState.sanMax}</span>
										<span class="final-stat-label">SAN上限</span>
									</div>
									<div class="final-stat-item">
										<span class="final-stat-value">${gameState.research}</span>
										<span class="final-stat-label">科研</span>
									</div>
									<div class="final-stat-item">
										<span class="final-stat-value">${gameState.social}</span>
										<span class="final-stat-label">社交</span>
									</div>
									<div class="final-stat-item">
										<span class="final-stat-value">${gameState.favor}</span>
										<span class="final-stat-label">好感</span>
									</div>
									<div class="final-stat-item">
										<span class="final-stat-value">${gameState.gold}</span>
										<span class="final-stat-label">金币</span>
									</div>
								</div>

								<!-- 成就（限制最多4个） -->
								${achievements.length > 0 ? `
									<div class="poster-achievements">
										${achievements.slice(0, 4).map(a => `<span class="p-ach">${a.split(' ')[0]}</span>`).join('')}
										${achievements.length > 4 ? `<span class="p-ach-more">+${achievements.length - 4}</span>` : ''}
									</div>
								` : ''}

								<!-- 人际关系信息 -->
								<div class="poster-relations">
									${advisor ? `<span class="p-relation">👨‍🏫 ${advisor.name}</span>` : ''}
									${lover ? `<span class="p-relation">❤️ ${lover.name}</span>` : ''}
								</div>

								<!-- 成就勾选项 -->
								<div class="poster-checkboxes">
									<span class="p-checkbox ${hasLover ? 'checked' : ''}">
										<span class="checkbox-icon">${hasLover ? '☑' : '☐'}</span>
										<span class="checkbox-label">恋爱</span>
									</span>
									<span class="p-checkbox ${hasBigBull ? 'checked' : ''}">
										<span class="checkbox-icon">${hasBigBull ? '☑' : '☐'}</span>
										<span class="checkbox-label">联培</span>
									</span>
									<span class="p-checkbox ${hasInternship ? 'checked' : ''}">
										<span class="checkbox-icon">${hasInternship ? '☑' : '☐'}</span>
										<span class="checkbox-label">实习</span>
									</span>
								</div>
							</div>
							<div class="poster-footer">
								<div class="footer-text">我的研究生生涯</div>
								<div class="footer-date">${new Date().toLocaleDateString('zh-CN')}</div>
							</div>
						</div>
						<div class="share-buttons animate-fade-up delay-1">
							<button class="share-btn save-btn" onclick="saveSharePoster()">
								<i class="fas fa-download"></i> 保存海报
							</button>
						</div>
						<div class="share-actions animate-fade-up delay-2">
							<button class="action-btn return-btn" onclick="closeCareerSummary()">
								<i class="fas fa-arrow-left"></i> 返回结局
							</button>
							<button class="action-btn restart-btn" onclick="closeCareerSummary();setTimeout(restartGame, 300);">
								<i class="fas fa-redo"></i> 重新开始
							</button>
						</div>
					</div>
				</div>
			`;
		}

		// ==================== 辅助函数 ====================

		function getTimelineDotClass(type) {
			const classes = {
				'first_submit': 'dot-submit',
				'first_accept': 'dot-accept',
				'first_reject': 'dot-reject',
				'first_A': 'dot-a',
				'first_B': 'dot-b',
				'first_C': 'dot-c',
				'first_oral': 'dot-oral',
				'first_best_paper': 'dot-best',
				'first_nature': 'dot-nature',
				'first_nature_sub': 'dot-nature-sub',
				'first_work': 'dot-work',
				'first_conference': 'dot-conference',
				'first_mentoring': 'dot-mentoring',
				'phd_convert': 'dot-phd',
				'lover': 'dot-lover',
				'awaken': 'dot-awaken'
			};
			return classes[type] || 'dot-default';
		}

		function getHighlightMilestones() {
			const milestones = gameState.careerMilestones || [];
			const highlightTypes = ['first_accept', 'first_A', 'first_oral', 'first_best_paper', 'first_A_best_paper', 'first_nature', 'first_nature_sub', 'phd_convert', 'lover', 'awaken', 'scholarship', 'citations_100', 'citations_1000'];
			return milestones.filter(m => highlightTypes.includes(m.type));
		}

		function getLowlightMilestones() {
			const milestones = gameState.careerMilestones || [];
			const lowlightTypes = ['first_reject', 'triple_reject', 'san_low'];
			return milestones.filter(m => lowlightTypes.includes(m.type));
		}

		function getFirstTimeMilestones() {
			const milestones = gameState.careerMilestones || [];
			// ★★★ 扩展更多第一次事件类型 ★★★
			const firstTypes = [
				'first_submit',      // 第一次投稿
				'first_accept',      // 第一次中稿
				'first_reject',      // 第一次被拒
				'first_A',           // 第一次A类
				'first_B',           // 第一次B类
				'first_C',           // 第一次C类
				'first_oral',        // 第一次Oral
				'first_best_paper',  // 第一次Best Paper
				'first_nature',      // 第一次Nature
				'first_nature_sub',  // 第一次Nature子刊
				'first_work',        // 第一次打工
				'first_conference',  // 第一次开会
				'first_mentoring',   // 第一次指导师弟师妹
				'phd_convert',       // 硕转博
				'lover',             // 恋人
				'awaken'             // 觉醒
			];
			return milestones.filter(m => firstTypes.includes(m.type));
		}

		// ==================== 粒子动画 ====================
		let particleAnimationId = null;

		function startParticleAnimation() {
			const canvas = document.getElementById('particles-canvas');
			if (!canvas) return;

			const ctx = canvas.getContext('2d');
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;

			const particles = [];
			const particleCount = 30;

			for (let i = 0; i < particleCount; i++) {
				particles.push({
					x: Math.random() * canvas.width,
					y: Math.random() * canvas.height,
					size: Math.random() * 3 + 1,
					speedX: (Math.random() - 0.5) * 0.5,
					speedY: (Math.random() - 0.5) * 0.5,
					opacity: Math.random() * 0.5 + 0.2
				});
			}

			function animate() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				particles.forEach(p => {
					p.x += p.speedX;
					p.y += p.speedY;

					if (p.x < 0) p.x = canvas.width;
					if (p.x > canvas.width) p.x = 0;
					if (p.y < 0) p.y = canvas.height;
					if (p.y > canvas.height) p.y = 0;

					ctx.beginPath();
					ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
					ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
					ctx.fill();
				});

				particleAnimationId = requestAnimationFrame(animate);
			}

			animate();
		}

		function stopParticleAnimation() {
			if (particleAnimationId) {
				cancelAnimationFrame(particleAnimationId);
				particleAnimationId = null;
			}
		}

		// ==================== 滑动控制 ====================

		function nextSlide() {
			if (currentSlide < totalSlides - 1) {
				currentSlide++;
				updateSlidePosition();
			}
		}

		function prevSlide() {
			if (currentSlide > 0) {
				currentSlide--;
				updateSlidePosition();
			}
		}

		function goToSlide(index) {
			currentSlide = index;
			updateSlidePosition();
		}

		function updateSlidePosition() {
			const container = document.querySelector('.slides-container');
			if (container) {
				container.style.transform = `translateX(-${currentSlide * 100}%)`;
			}

			// 更新指示器
			document.querySelectorAll('.indicator').forEach((ind, i) => {
				ind.classList.toggle('active', i === currentSlide);
			});

			// 更新导航按钮
			const prevBtn = document.querySelector('.prev-btn');
			const nextBtn = document.querySelector('.next-btn');
			if (prevBtn) prevBtn.style.visibility = currentSlide === 0 ? 'hidden' : 'visible';
			if (nextBtn) nextBtn.style.visibility = currentSlide === totalSlides - 1 ? 'hidden' : 'visible';
		}

		function handleTouchStart(e) {
			touchStartX = e.changedTouches[0].screenX;
		}

		function handleTouchEnd(e) {
			touchEndX = e.changedTouches[0].screenX;
			handleSwipe();
		}

		function handleSwipe() {
			const swipeThreshold = 50;
			const diff = touchStartX - touchEndX;

			if (Math.abs(diff) > swipeThreshold) {
				if (diff > 0) {
					nextSlide();
				} else {
					prevSlide();
				}
			}
		}

		function handleKeyDown(e) {
			if (e.key === 'ArrowRight') nextSlide();
			else if (e.key === 'ArrowLeft') prevSlide();
			else if (e.key === 'Escape') closeCareerSummary();
		}

		// ★★★ 人际关系子页面切换 ★★★
		function switchRelationSubpage(index) {
			const subpages = document.querySelectorAll('.relation-subpage');
			const dots = document.querySelectorAll('.subpage-dot');

			subpages.forEach((page, i) => {
				if (i === index) {
					page.classList.add('active');
				} else {
					page.classList.remove('active');
				}
			});

			dots.forEach((dot, i) => {
				if (i === index) {
					dot.classList.add('active');
				} else {
					dot.classList.remove('active');
				}
			});
		}

		// ==================== 分享海报 ====================

		async function saveSharePoster() {
			const poster = document.getElementById('share-poster');
			if (!poster) return;

			try {
				// 检查是否已加载 html2canvas
				if (typeof html2canvas === 'undefined') {
					// 动态加载 html2canvas
					await loadHtml2Canvas();
				}

				const canvas = await html2canvas(poster, {
					backgroundColor: '#ffffff',
					scale: 2,
					useCORS: true,
					logging: false
				});

				// 创建下载链接
				const link = document.createElement('a');
				link.download = `研究生模拟器_${gameState.characterName}_${Date.now()}.png`;
				link.href = canvas.toDataURL('image/png');
				link.click();

			} catch (error) {
				console.error('保存海报失败:', error);
				alert('保存海报失败，请尝试截图保存');
			}
		}

		function loadHtml2Canvas() {
			return new Promise((resolve, reject) => {
				const script = document.createElement('script');
				script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
				script.onload = resolve;
				script.onerror = reject;
				document.head.appendChild(script);
			});
		}

		// ==================== 样式 ====================

		function addCareerSummaryStyles() {
			if (document.getElementById('career-summary-styles')) return;

			const styles = document.createElement('style');
			styles.id = 'career-summary-styles';
			styles.textContent = `
				#career-summary-container {
					position: fixed;
					top: 0;
					left: 0;
					width: 100vw;
					height: 100vh;
					z-index: 10000;
					background: #000;
					opacity: 0;
					transition: opacity 0.3s ease;
				}

				#career-summary-container.visible {
					opacity: 1;
				}

				.particles-canvas {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					pointer-events: none;
					z-index: 1;
				}

				.career-summary-wrapper {
					width: 100%;
					height: 100%;
					overflow: hidden;
					position: relative;
				}

				.slides-container {
					display: flex;
					height: 100%;
					transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
					position: relative;
					z-index: 2;
				}

				.slide {
					min-width: 100%;
					height: 100%;
					position: relative;
					overflow: hidden;
				}

				.slide-content {
					width: 100%;
					height: 100%;
					display: flex;
					flex-direction: column;
					position: relative;
				}

				.slide-bg {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					z-index: 0;
				}

				.slide-inner {
					position: relative;
					z-index: 1;
					padding: 50px 20px 80px;
					height: 100%;
					overflow-y: auto;
					display: flex;
					flex-direction: column;
					align-items: center;
				}

				.slide-title {
					font-size: 1.6rem;
					font-weight: 700;
					margin-bottom: 25px;
					text-align: center;
					color: #fff;
					text-shadow: 0 2px 15px rgba(0,0,0,0.3);
				}

				/* ==================== 动画效果 ==================== */
				@keyframes fadeUp {
					from { opacity: 0; transform: translateY(20px); }
					to { opacity: 1; transform: translateY(0); }
				}

				@keyframes slideIn {
					from { opacity: 0; transform: translateX(-20px); }
					to { opacity: 1; transform: translateX(0); }
				}

				@keyframes popIn {
					0% { opacity: 0; transform: scale(0.8); }
					70% { transform: scale(1.05); }
					100% { opacity: 1; transform: scale(1); }
				}

				@keyframes bounceIn {
					0% { opacity: 0; transform: scale(0.3); }
					50% { transform: scale(1.1); }
					70% { transform: scale(0.9); }
					100% { opacity: 1; transform: scale(1); }
				}

				@keyframes pulse {
					0%, 100% { transform: scale(1); }
					50% { transform: scale(1.1); }
				}

				@keyframes float {
					0%, 100% { transform: translateY(0); }
					50% { transform: translateY(-10px); }
				}

				@keyframes sparkle {
					0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
					50% { opacity: 1; transform: scale(1) rotate(180deg); }
				}

				@keyframes lineGrow {
					from { width: 0; }
					to { width: 60px; }
				}

				.animate-title { animation: fadeUp 0.6s ease-out; }
				.animate-fade-up { animation: fadeUp 0.6s ease-out both; }
				.animate-slide-in { animation: slideIn 0.5s ease-out both; animation-delay: var(--delay, 0s); }
				.animate-pop-in { animation: popIn 0.4s ease-out both; animation-delay: var(--delay, 0s); }
				.bounce-in { animation: bounceIn 0.6s ease-out; }
				.pulse { animation: pulse 2s infinite; }
				.bounce { animation: float 2s ease-in-out infinite; }
				.delay-1 { animation-delay: 0.15s; }
				.delay-2 { animation-delay: 0.3s; }
				.delay-3 { animation-delay: 0.45s; }

				/* ==================== 卡片1：旅程概览 ==================== */
				.journey-bg {
					background: linear-gradient(135deg, #5b6cae 0%, #8b5fa3 50%, #a8729a 100%);
				}

				.floating-elements {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					pointer-events: none;
					overflow: hidden;
				}

				.float-item {
					position: absolute;
					font-size: 2rem;
					opacity: 0.3;
					animation: float 4s ease-in-out infinite;
				}

				.float-1 { top: 15%; left: 10%; animation-delay: 0s; }
				.float-2 { top: 25%; right: 15%; animation-delay: 1s; }
				.float-3 { bottom: 20%; left: 20%; animation-delay: 2s; }

				.journey-flow {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 15px;
					margin: 20px 0;
				}

				.journey-start, .journey-end {
					text-align: center;
					padding: 18px;
					background: rgba(255,255,255,0.12);
					border-radius: 18px;
					backdrop-filter: blur(10px);
					border: 1px solid rgba(255,255,255,0.15);
				}

				.journey-icon {
					font-size: 2.5rem;
					margin-bottom: 8px;
				}

				.journey-label {
					font-size: 1rem;
					font-weight: 600;
					color: #fff;
				}

				.journey-sublabel {
					font-size: 0.75rem;
					color: rgba(255,255,255,0.7);
					margin-top: 4px;
				}

				.journey-year {
					font-size: 0.7rem;
					color: rgba(255,255,255,0.6);
					margin-top: 6px;
					padding: 3px 8px;
					background: rgba(255,255,255,0.1);
					border-radius: 10px;
					display: inline-block;
				}

				.journey-arrow {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 6px;
				}

				.arrow-line {
					width: 50px;
					height: 2px;
					background: rgba(255,255,255,0.4);
					position: relative;
				}

				.animated-line {
					animation: lineGrow 1s ease-out 0.5s both;
				}

				.arrow-line::after {
					content: '→';
					position: absolute;
					right: -12px;
					top: -10px;
					font-size: 1.2rem;
					color: rgba(255,255,255,0.7);
				}

				.arrow-duration {
					font-size: 0.75rem;
					color: rgba(255,255,255,0.8);
					background: rgba(255,255,255,0.15);
					padding: 3px 10px;
					border-radius: 10px;
				}

				.character-quote {
					margin-top: 25px;
					padding: 18px;
					background: rgba(255,255,255,0.1);
					border-radius: 15px;
					max-width: 320px;
					text-align: center;
					border: 1px solid rgba(255,255,255,0.1);
				}

				.quote-icon {
					font-size: 1.5rem;
					margin-bottom: 8px;
				}

				.quote-text {
					font-size: 0.9rem;
					line-height: 1.6;
					color: rgba(255,255,255,0.95);
					font-style: italic;
				}

				.quote-author {
					margin-top: 10px;
					font-size: 0.8rem;
					color: rgba(255,255,255,0.6);
				}

				/* ==================== 卡片2：数据统计 ==================== */
				.stats-bg {
					background: linear-gradient(135deg, #2d8a6e 0%, #4aa88a 50%, #6bc4a6 100%);
				}

				.top-paper-banner {
					margin-bottom: 20px;
					padding: 12px 20px;
					background: linear-gradient(135deg, rgba(255,215,0,0.25), rgba(255,165,0,0.25));
					border-radius: 25px;
					border: 1px solid rgba(255,215,0,0.4);
					position: relative;
					overflow: hidden;
				}

				.banner-glow {
					position: absolute;
					top: -50%;
					left: -50%;
					width: 200%;
					height: 200%;
					background: radial-gradient(ellipse, rgba(255,215,0,0.3) 0%, transparent 70%);
					animation: pulse 3s infinite;
				}

				.banner-content {
					position: relative;
					display: flex;
					gap: 15px;
					justify-content: center;
					flex-wrap: wrap;
				}

				.nature-badge, .nature-sub-badge {
					font-size: 0.9rem;
					font-weight: 600;
					color: #fff;
					text-shadow: 0 1px 3px rgba(0,0,0,0.3);
				}

				.stats-grid {
					display: grid;
					grid-template-columns: repeat(2, 1fr);
					gap: 12px;
					max-width: 320px;
					width: 100%;
				}

				.stat-card {
					background: rgba(255,255,255,0.15);
					border-radius: 14px;
					padding: 16px;
					text-align: center;
					backdrop-filter: blur(10px);
					border: 1px solid rgba(255,255,255,0.1);
					position: relative;
					overflow: hidden;
				}

				.stat-animate {
					animation: popIn 0.4s ease-out both;
					animation-delay: calc(var(--delay) * 0.1s);
				}

				.stat-value {
					font-size: 1.8rem;
					font-weight: 700;
					color: #fff;
				}

				.stat-unit {
					font-size: 1rem;
				}

				.stat-label {
					font-size: 0.8rem;
					color: rgba(255,255,255,0.75);
					margin-top: 4px;
				}

				.stat-bar {
					margin-top: 8px;
					height: 4px;
					background: rgba(255,255,255,0.2);
					border-radius: 2px;
					overflow: hidden;
				}

				.stat-bar-fill {
					height: 100%;
					background: rgba(255,255,255,0.6);
					border-radius: 2px;
					transition: width 1s ease-out;
				}

				.paper-breakdown {
					margin-top: 20px;
					max-width: 320px;
					width: 100%;
					background: rgba(255,255,255,0.1);
					border-radius: 12px;
					padding: 15px;
				}

				.breakdown-title {
					font-size: 0.85rem;
					color: rgba(255,255,255,0.8);
					margin-bottom: 12px;
					text-align: center;
				}

				.breakdown-item {
					display: flex;
					align-items: center;
					gap: 10px;
					margin-bottom: 8px;
				}

				.breakdown-label {
					width: 35px;
					font-size: 0.8rem;
					color: rgba(255,255,255,0.8);
				}

				.breakdown-bar {
					flex: 1;
					height: 8px;
					background: rgba(255,255,255,0.2);
					border-radius: 4px;
					overflow: hidden;
				}

				.bar-fill {
					height: 100%;
					border-radius: 4px;
					transition: width 1s ease-out;
				}

				.a-bar .bar-fill { background: linear-gradient(90deg, #ff6b6b, #ee5a5a); }
				.b-bar .bar-fill { background: linear-gradient(90deg, #feca57, #f39c12); }
				.c-bar .bar-fill { background: linear-gradient(90deg, #48dbfb, #0abde3); }

				.breakdown-value {
					width: 25px;
					font-size: 0.85rem;
					color: #fff;
					text-align: right;
				}

				.stats-extra {
					margin-top: 18px;
					display: grid;
					grid-template-columns: repeat(2, 1fr);
					gap: 8px;
					max-width: 320px;
				}

				.extra-item {
					display: flex;
					align-items: center;
					gap: 6px;
					font-size: 0.8rem;
					color: rgba(255,255,255,0.85);
					background: rgba(255,255,255,0.1);
					padding: 8px 12px;
					border-radius: 8px;
				}

				.extra-icon {
					font-size: 1rem;
				}

				/* ==================== 卡片3：高光时刻 ==================== */
				.highlights-bg {
					background: linear-gradient(135deg, #c08a9e 0%, #d0a0ae 50%, #ddb5bd 100%);
				}

				.sparkle-container {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					pointer-events: none;
					overflow: hidden;
				}

				.sparkle {
					position: absolute;
					font-size: 1.5rem;
					animation: sparkle 3s infinite;
				}

				.s1 { top: 10%; left: 15%; animation-delay: 0s; }
				.s2 { top: 20%; right: 20%; animation-delay: 0.7s; }
				.s3 { bottom: 30%; left: 10%; animation-delay: 1.4s; }
				.s4 { bottom: 15%; right: 15%; animation-delay: 2.1s; }

				.milestones-list {
					max-width: 340px;
					width: 100%;
				}

				.milestone-item {
					display: flex;
					gap: 12px;
					padding: 14px;
					background: rgba(255,255,255,0.12);
					border-radius: 12px;
					margin-bottom: 10px;
					backdrop-filter: blur(10px);
					border: 1px solid rgba(255,255,255,0.1);
				}

				.milestone-icon {
					font-size: 1.3rem;
				}

				.milestone-main {
					flex: 1;
				}

				.milestone-time {
					font-size: 0.7rem;
					color: rgba(255,255,255,0.6);
				}

				.milestone-title {
					font-size: 0.95rem;
					font-weight: 600;
					color: #fff;
					margin-top: 2px;
				}

				.milestone-detail {
					font-size: 0.75rem;
					color: rgba(255,255,255,0.7);
					margin-top: 4px;
				}

				.empty-message {
					text-align: center;
					padding: 35px;
				}

				.empty-icon {
					font-size: 3.5rem;
					margin-bottom: 12px;
				}

				.empty-text {
					font-size: 1rem;
					color: rgba(255,255,255,0.9);
				}

				.empty-sub {
					font-size: 0.8rem;
					color: rgba(255,255,255,0.6);
					margin-top: 5px;
				}

				.peak-stats {
					display: flex;
					gap: 12px;
					margin-top: 20px;
					flex-wrap: wrap;
					justify-content: center;
				}

				.peak-item {
					display: flex;
					align-items: center;
					gap: 6px;
					background: rgba(255,255,255,0.15);
					padding: 10px 14px;
					border-radius: 20px;
					font-size: 0.8rem;
					color: #fff;
					border: 1px solid rgba(255,255,255,0.2);
				}

				.glow-effect {
					box-shadow: 0 0 15px rgba(255,255,255,0.2);
				}

				.peak-icon {
					font-size: 1rem;
				}

				.peak-label {
					color: rgba(255,255,255,0.8);
				}

				.peak-value {
					font-weight: 700;
				}

				/* ==================== 卡片4：至暗时刻 ==================== */
				.lowlights-bg {
					background: linear-gradient(135deg, #3d4a6b 0%, #4a5a7d 50%, #5a6a8f 100%);
				}

				.rain-effect {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background: linear-gradient(transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%);
					background-size: 100% 10px;
					animation: rain 0.5s linear infinite;
					pointer-events: none;
					opacity: 0.5;
				}

				@keyframes rain {
					0% { background-position: 0 0; }
					100% { background-position: 0 10px; }
				}

				.lowlight-stats {
					display: flex;
					gap: 20px;
					margin-top: 25px;
					justify-content: center;
				}

				.lowlight-stat {
					text-align: center;
					background: rgba(255,255,255,0.1);
					padding: 15px 20px;
					border-radius: 12px;
				}

				.lowlight-icon {
					font-size: 1.5rem;
					margin-bottom: 5px;
				}

				.lowlight-label {
					font-size: 0.75rem;
					color: rgba(255,255,255,0.7);
				}

				.lowlight-value {
					font-size: 1.5rem;
					font-weight: 700;
					color: #fff;
				}

				.lowlight-extra {
					margin-top: 20px;
					display: flex;
					flex-wrap: wrap;
					gap: 8px;
					justify-content: center;
					max-width: 340px;
				}

				.lowlight-extra-item {
					display: flex;
					align-items: center;
					gap: 6px;
					background: rgba(255,255,255,0.1);
					padding: 8px 12px;
					border-radius: 20px;
					font-size: 0.75rem;
					color: rgba(255,255,255,0.85);
				}

				.lowlight-extra-icon {
					font-size: 0.9rem;
				}

				.encouragement {
					margin-top: 25px;
					padding: 15px 20px;
					background: rgba(255,255,255,0.08);
					border-radius: 12px;
					border-left: 3px solid rgba(255,255,255,0.3);
				}

				.encourage-text {
					font-size: 0.9rem;
					color: rgba(255,255,255,0.85);
					font-style: italic;
				}

				/* ==================== 卡片5：科研之余 ==================== */
				.leisure-bg {
					background: linear-gradient(135deg, #5ab09c 0%, #8ed9c5 50%, #a0dce0 100%);
				}

				.leisure-bubbles {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					pointer-events: none;
					overflow: hidden;
				}

				.bubble {
					position: absolute;
					font-size: 1.8rem;
					opacity: 0.25;
					animation: float 5s ease-in-out infinite;
				}

				.b1 { top: 12%; left: 8%; animation-delay: 0s; }
				.b2 { top: 22%; right: 12%; animation-delay: 1.2s; }
				.b3 { bottom: 28%; left: 15%; animation-delay: 2.4s; }
				.b4 { bottom: 18%; right: 10%; animation-delay: 3.6s; }

				.leisure-grid {
					display: grid;
					grid-template-columns: repeat(2, 1fr);
					gap: 10px;
					max-width: 320px;
					width: 100%;
				}

				.leisure-card {
					background: rgba(255,255,255,0.18);
					border-radius: 14px;
					padding: 14px;
					text-align: center;
					backdrop-filter: blur(10px);
					border: 1px solid rgba(255,255,255,0.2);
				}

				.leisure-icon {
					font-size: 2rem;
					margin-bottom: 6px;
				}

				.leisure-count {
					font-size: 1.6rem;
					font-weight: 700;
					color: #fff;
				}

				.leisure-name {
					font-size: 0.85rem;
					font-weight: 600;
					color: rgba(255,255,255,0.95);
					margin-top: 2px;
				}

				.leisure-desc {
					font-size: 0.7rem;
					color: rgba(255,255,255,0.7);
					margin-top: 4px;
				}

				.leisure-summary {
					display: flex;
					align-items: center;
					gap: 12px;
					padding: 12px 18px;
					background: rgba(255,255,255,0.15);
					border-radius: 20px;
					margin-top: 18px;
				}

				.summary-icon {
					font-size: 1.5rem;
				}

				.summary-stat {
					display: flex;
					align-items: baseline;
					gap: 6px;
				}

				.stat-number {
					font-size: 1.8rem;
					font-weight: 700;
					color: #fff;
				}

				.leisure-quote {
					margin-top: 20px;
					display: flex;
					align-items: center;
					gap: 8px;
					font-size: 0.9rem;
					color: rgba(255,255,255,0.9);
					font-style: italic;
				}

				.quote-decoration {
					font-size: 1.2rem;
					color: rgba(255,255,255,0.6);
				}

				.quote-content {
					flex: 1;
					text-align: center;
				}

				/* ==================== 卡片6：重要的第一次 ==================== */
				.firsttimes-bg {
					background: linear-gradient(135deg, #d4a0a0 0%, #e0b8b8 50%, #ecd0d0 100%);
				}

				.timeline-container {
					position: relative;
					max-width: 340px;
					width: 100%;
					padding-left: 30px;
				}

				.timeline-line {
					position: absolute;
					left: 10px;
					top: 0;
					bottom: 0;
					width: 2px;
					background: rgba(120,80,80,0.3);
				}

				.timeline-item {
					position: relative;
					margin-bottom: 15px;
				}

				.timeline-dot {
					position: absolute;
					left: -24px;
					top: 5px;
					width: 10px;
					height: 10px;
					border-radius: 50%;
					background: #fff;
					border: 2px solid #a08080;
				}

				.dot-submit { border-color: #3498db; background: #3498db; }
				.dot-accept { border-color: #2ecc71; background: #2ecc71; }
				.dot-reject { border-color: #95a5a6; background: #95a5a6; }
				.dot-a { border-color: #e74c3c; background: #e74c3c; }
				.dot-b { border-color: #3498db; background: #3498db; }
				.dot-c { border-color: #27ae60; background: #27ae60; }
				.dot-oral { border-color: #e67e22; background: #e67e22; }
				.dot-best { border-color: #f1c40f; background: #f1c40f; }
				.dot-nature { border-color: #9b59b6; background: linear-gradient(135deg, #9b59b6, #8e44ad); }
				.dot-nature-sub { border-color: #3498db; background: linear-gradient(135deg, #3498db, #2980b9); }
				.dot-work { border-color: #f39c12; background: #f39c12; }
				.dot-conference { border-color: #1abc9c; background: #1abc9c; }
				.dot-mentoring { border-color: #fd79a8; background: #fd79a8; }
				.dot-phd { border-color: #9b59b6; background: #9b59b6; }
				.dot-lover { border-color: #e91e63; background: #e91e63; }
				.dot-awaken { border-color: #ff6b6b; background: linear-gradient(135deg, #ff6b6b, #ee5a5a); }

				.timeline-card {
					background: rgba(255,255,255,0.35);
					padding: 12px 15px;
					border-radius: 10px;
					border: 1px solid rgba(255,255,255,0.5);
				}

				.timeline-month {
					font-size: 0.7rem;
					color: rgba(100,70,70,0.7);
				}

				.timeline-title {
					font-size: 0.9rem;
					font-weight: 600;
					color: #5a4040;
					margin-top: 2px;
				}

				.timeline-detail {
					font-size: 0.75rem;
					color: rgba(100,70,70,0.7);
					margin-top: 4px;
				}

				/* ==================== 卡片6：人际关系 ==================== */
				.relationships-bg {
					background: linear-gradient(135deg, #8e7cc3 0%, #a899d4 50%, #c2b8e5 100%);
				}

				.heart-particles {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					pointer-events: none;
				}

				.relations-list {
					display: flex;
					flex-direction: column;
					gap: 12px;
					max-width: 340px;
					width: 100%;
				}

				.relation-card-enhanced {
					background: rgba(255,255,255,0.18);
					border-radius: 14px;
					padding: 14px;
					backdrop-filter: blur(10px);
					border: 1px solid rgba(255,255,255,0.2);
				}

				.relation-header {
					display: flex;
					align-items: center;
					gap: 12px;
					margin-bottom: 10px;
				}

				.relation-avatar {
					font-size: 2rem;
					width: 50px;
					height: 50px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: rgba(255,255,255,0.2);
					border-radius: 50%;
				}

				.relation-info {
					flex: 1;
				}

				.relation-type-tag {
					font-size: 0.65rem;
					color: rgba(255,255,255,0.7);
					background: rgba(255,255,255,0.15);
					padding: 2px 8px;
					border-radius: 10px;
					display: inline-block;
				}

				.relation-name {
					font-size: 1rem;
					font-weight: 600;
					color: #fff;
					margin-top: 3px;
				}

				.relation-body {
					padding: 10px 0;
					border-top: 1px solid rgba(255,255,255,0.1);
				}

				.relation-desc {
					font-size: 0.8rem;
					color: rgba(255,255,255,0.85);
					line-height: 1.5;
				}

				.relation-quote {
					font-size: 0.75rem;
					color: rgba(255,255,255,0.65);
					font-style: italic;
					margin-top: 8px;
					padding-left: 10px;
					border-left: 2px solid rgba(255,255,255,0.3);
				}

				.relation-footer {
					padding-top: 10px;
					border-top: 1px solid rgba(255,255,255,0.1);
				}

				.relation-stats-grid {
					display: flex;
					flex-wrap: wrap;
					gap: 6px 12px;
				}

				.relation-stat {
					display: flex;
					align-items: center;
					gap: 4px;
					font-size: 0.7rem;
					color: rgba(255,255,255,0.8);
					background: rgba(255,255,255,0.08);
					padding: 4px 8px;
					border-radius: 10px;
				}

				.stat-icon {
					font-size: 0.75rem;
				}

				.relation-summary {
					margin-top: 18px;
					text-align: center;
				}

				.summary-text {
					font-size: 0.9rem;
					color: rgba(255,255,255,0.9);
				}

				.highlight-num {
					font-weight: 700;
					font-size: 1.1rem;
				}

				.summary-badge {
					display: inline-block;
					margin-top: 10px;
					margin-right: 8px;
					padding: 5px 12px;
					background: rgba(255,255,255,0.2);
					border-radius: 15px;
					font-size: 0.75rem;
					color: #fff;
				}

				/* ★★★ 新增：人际关系动态布局 ★★★ */
				.relations-container {
					width: 100%;
					max-width: 340px;
					display: flex;
					flex-direction: column;
					gap: 15px;
				}

				/* ★★★ 新增：人际关系子页面分页 ★★★ */
				.relation-subpages {
					width: 100%;
					max-width: 340px;
					position: relative;
				}

				.relation-subpage {
					display: none;
					flex-direction: column;
					gap: 15px;
					animation: fadeUp 0.3s ease-out;
				}

				.relation-subpage.active {
					display: flex;
				}

				.relation-subpage-nav {
					display: flex;
					justify-content: center;
					gap: 8px;
					margin-top: 15px;
				}

				.subpage-dot {
					width: 8px;
					height: 8px;
					border-radius: 50%;
					background: rgba(255,255,255,0.3);
					cursor: pointer;
					transition: all 0.2s;
				}

				.subpage-dot.active {
					background: #fff;
					transform: scale(1.3);
				}

				.subpage-dot:hover {
					background: rgba(255,255,255,0.6);
				}

				.section-label {
					font-size: 0.75rem;
					color: rgba(255,255,255,0.7);
					margin-bottom: 10px;
					padding-left: 5px;
					border-left: 2px solid rgba(255,255,255,0.4);
				}

				.relation-vip-section {
					background: rgba(255,255,255,0.08);
					border-radius: 14px;
					padding: 12px;
					border: 1px solid rgba(255,255,255,0.15);
				}

				/* ★★★ 新增：人际关系单页布局样式 ★★★ */
				.relation-total-stats {
					display: flex;
					justify-content: center;
					gap: 20px;
					margin-bottom: 15px;
				}

				.total-stat-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					background: rgba(255,255,255,0.12);
					padding: 12px 18px;
					border-radius: 12px;
					min-width: 70px;
				}

				.total-stat-icon {
					font-size: 1.3rem;
					margin-bottom: 4px;
				}

				.total-stat-value {
					font-size: 1.4rem;
					font-weight: 700;
					color: #fff;
				}

				.total-stat-label {
					font-size: 0.65rem;
					color: rgba(255,255,255,0.7);
					margin-top: 2px;
				}

				.relation-list-container {
					width: 100%;
					max-width: 340px;
					max-height: 280px;
					overflow-y: auto;
					background: rgba(255,255,255,0.05);
					border-radius: 12px;
					padding: 8px;
				}

				.relation-row {
					display: flex;
					align-items: center;
					gap: 10px;
					padding: 10px 12px;
					background: rgba(255,255,255,0.08);
					border-radius: 10px;
					margin-bottom: 6px;
				}

				.relation-row:last-child {
					margin-bottom: 0;
				}

				.relation-row-icon {
					font-size: 1.3rem;
					width: 32px;
					text-align: center;
				}

				.relation-row-name {
					flex: 1;
					font-size: 0.9rem;
					font-weight: 600;
					color: #fff;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.relation-row-type {
					font-size: 0.65rem;
					color: rgba(255,255,255,0.6);
					background: rgba(255,255,255,0.1);
					padding: 2px 8px;
					border-radius: 8px;
				}

				.relation-row-stats {
					display: flex;
					gap: 8px;
				}

				.row-stat {
					font-size: 0.7rem;
					color: rgba(255,255,255,0.8);
					background: rgba(255,255,255,0.1);
					padding: 3px 6px;
					border-radius: 6px;
				}

				.relation-badges {
					display: flex;
					justify-content: center;
					gap: 8px;
					margin-top: 12px;
					flex-wrap: wrap;
				}

				.vip-cards {
					display: flex;
					flex-direction: column;
					gap: 10px;
				}

				.relation-card-compact {
					display: flex;
					align-items: center;
					gap: 12px;
					padding: 12px;
					background: rgba(255,255,255,0.12);
					border-radius: 12px;
					backdrop-filter: blur(10px);
				}

				.compact-avatar {
					font-size: 1.8rem;
					width: 45px;
					height: 45px;
					display: flex;
					align-items: center;
					justify-content: center;
					background: rgba(255,255,255,0.15);
					border-radius: 50%;
					flex-shrink: 0;
				}

				.compact-info {
					flex: 1;
					min-width: 0;
				}

				.compact-type {
					font-size: 0.65rem;
					color: rgba(255,255,255,0.6);
					background: rgba(255,255,255,0.1);
					padding: 2px 6px;
					border-radius: 8px;
					display: inline-block;
				}

				.compact-name {
					font-size: 0.9rem;
					font-weight: 600;
					color: #fff;
					margin-top: 3px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.compact-stats {
					display: flex;
					gap: 6px;
					margin-top: 4px;
					flex-wrap: wrap;
				}

				.compact-stat {
					font-size: 0.65rem;
					color: rgba(255,255,255,0.8);
					background: rgba(255,255,255,0.1);
					padding: 2px 6px;
					border-radius: 6px;
				}

				.compact-stat-tag {
					font-size: 0.6rem;
					color: #fff;
					background: linear-gradient(135deg, rgba(233,30,99,0.5), rgba(156,39,176,0.5));
					padding: 2px 8px;
					border-radius: 8px;
					font-weight: 500;
				}

				.compact-title {
					font-size: 0.6rem;
					color: rgba(255,255,255,0.6);
					margin-top: 2px;
					font-style: italic;
				}

				.compact-quote {
					font-size: 0.7rem;
					color: rgba(255,255,255,0.5);
					font-style: italic;
					max-width: 100px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.relation-lab-section {
					background: rgba(255,255,255,0.05);
					border-radius: 12px;
					padding: 12px;
				}

				.lab-member-grid {
					display: grid;
					grid-template-columns: repeat(2, 1fr);
					gap: 8px;
				}

				.relation-card-mini {
					background: rgba(255,255,255,0.12);
					border-radius: 10px;
					padding: 10px;
					text-align: center;
				}

				.mini-header {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 6px;
					margin-bottom: 4px;
				}

				.mini-icon {
					font-size: 1.2rem;
				}

				.mini-name {
					font-size: 0.8rem;
					font-weight: 600;
					color: #fff;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
				}

				.mini-type {
					font-size: 0.6rem;
					color: rgba(255,255,255,0.6);
					margin-bottom: 4px;
				}

				.mini-stats {
					display: flex;
					justify-content: center;
					gap: 8px;
				}

				.mini-stat {
					font-size: 0.65rem;
					color: rgba(255,255,255,0.7);
					background: rgba(255,255,255,0.1);
					padding: 2px 6px;
					border-radius: 8px;
				}

				.relation-friend-section {
					background: rgba(255,255,255,0.03);
					border-radius: 10px;
					padding: 10px;
				}

				.friend-tags {
					display: flex;
					flex-wrap: wrap;
					gap: 6px;
					justify-content: center;
				}

				.friend-tag {
					display: flex;
					align-items: center;
					gap: 4px;
					background: rgba(255,255,255,0.12);
					padding: 5px 10px;
					border-radius: 15px;
					font-size: 0.75rem;
					color: #fff;
				}

				.friend-icon {
					font-size: 0.85rem;
				}

				.friend-name {
					color: rgba(255,255,255,0.9);
				}

				.summary-badges {
					display: flex;
					flex-wrap: wrap;
					justify-content: center;
					gap: 6px;
					margin-top: 10px;
				}

				.summary-badge.senior-badge {
					background: rgba(52, 152, 219, 0.3);
				}

				.summary-badge.junior-badge {
					background: rgba(253, 121, 168, 0.3);
				}

				/* ==================== 卡片7：成就墙 ==================== */
				.achievements-bg {
					background: linear-gradient(135deg, #c9954c 0%, #d9a86e 50%, #e9bb90 100%);
				}

				.trophy-glow {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					width: 200px;
					height: 200px;
					background: radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%);
					animation: pulse 3s infinite;
				}

				.achievements-showcase {
					display: flex;
					flex-wrap: wrap;
					gap: 10px;
					justify-content: center;
					max-width: 340px;
				}

				.achievement-item {
					display: flex;
					align-items: center;
					gap: 6px;
					background: rgba(255,255,255,0.2);
					padding: 8px 12px;
					border-radius: 20px;
					backdrop-filter: blur(10px);
					border: 1px solid rgba(255,255,255,0.25);
				}

				.achievement-icon {
					font-size: 1.1rem;
				}

				.achievement-text {
					font-size: 0.75rem;
					color: #fff;
					font-weight: 500;
				}

				.achievement-summary {
					margin-top: 25px;
					display: flex;
					flex-direction: column;
					align-items: center;
				}

				.summary-ring {
					width: 70px;
					height: 70px;
					border-radius: 50%;
					background: conic-gradient(
						rgba(255,255,255,0.8) calc(var(--percent) * 1%),
						rgba(255,255,255,0.2) calc(var(--percent) * 1%)
					);
					display: flex;
					align-items: center;
					justify-content: center;
					position: relative;
				}

				.summary-ring::before {
					content: '';
					position: absolute;
					width: 54px;
					height: 54px;
					background: linear-gradient(135deg, #c9954c 0%, #d9a86e 100%);
					border-radius: 50%;
				}

				.ring-text {
					position: relative;
					font-size: 1.5rem;
					font-weight: 700;
					color: #fff;
				}

				.summary-label {
					margin-top: 10px;
					font-size: 0.85rem;
					color: rgba(255,255,255,0.8);
				}

				/* ==================== 卡片8：分享页 ==================== */
				.share-bg {
					background: linear-gradient(135deg, #5b6cae 0%, #7a7cb8 50%, #9a8cc2 100%);
				}

				.confetti-container {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					pointer-events: none;
				}

				.share-poster-enhanced {
					background: #fff;
					border-radius: 16px;
					max-width: 280px;
					width: 100%;
					box-shadow: 0 15px 50px rgba(0,0,0,0.25);
					overflow: hidden;
					position: relative;
				}

				.poster-bg-pattern {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background: linear-gradient(45deg, #f8f9fa 25%, transparent 25%),
								linear-gradient(-45deg, #f8f9fa 25%, transparent 25%),
								linear-gradient(45deg, transparent 75%, #f8f9fa 75%),
								linear-gradient(-45deg, transparent 75%, #f8f9fa 75%);
					background-size: 20px 20px;
					opacity: 0.3;
				}

				.poster-header {
					position: relative;
					text-align: center;
					padding: 20px 15px 15px;
					background: linear-gradient(135deg, #667eea, #764ba2);
				}

				.poster-logo {
					font-size: 2rem;
					margin-bottom: 5px;
				}

				.poster-title {
					font-size: 1.1rem;
					font-weight: 700;
					color: #fff;
				}

				.poster-subtitle {
					font-size: 0.75rem;
					color: rgba(255,255,255,0.8);
					margin-top: 3px;
				}

				.poster-main {
					position: relative;
					padding: 20px 15px;
				}

				.poster-journey {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 10px;
					margin-bottom: 15px;
				}

				.journey-from, .journey-to {
					text-align: center;
				}

				.p-icon {
					display: block;
					font-size: 2rem;
					margin-bottom: 5px;
				}

				.p-name {
					font-size: 0.75rem;
					color: #666;
				}

				.p-year {
					display: block;
					font-size: 0.55rem;
					color: #999;
					margin-top: 2px;
				}

				.journey-arrow-p {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 4px;
				}

				.arrow-text {
					font-size: 0.65rem;
					color: #999;
				}

				.arrow-line-p {
					width: 30px;
					height: 2px;
					background: linear-gradient(90deg, #667eea, #764ba2);
					position: relative;
				}

				.arrow-line-p::after {
					content: '→';
					position: absolute;
					right: -10px;
					top: -8px;
					font-size: 1rem;
					color: #764ba2;
				}

				.poster-stats-grid {
					display: grid;
					grid-template-columns: repeat(4, 1fr);
					gap: 8px;
					margin-bottom: 10px;
				}

				.p-stat {
					text-align: center;
					padding: 8px 5px;
					background: #f8f9fa;
					border-radius: 8px;
				}

				.p-stat-value {
					font-size: 1.2rem;
					font-weight: 700;
					color: #333;
				}

				.p-stat-label {
					font-size: 0.6rem;
					color: #999;
				}

				/* ★★★ 新增：论文分布行 ★★★ */
				.poster-paper-row {
					display: flex;
					justify-content: center;
					gap: 6px;
					margin-bottom: 8px;
					flex-wrap: wrap;
				}

				.paper-item {
					font-size: 0.65rem;
					padding: 3px 8px;
					border-radius: 10px;
					font-weight: 600;
				}

				.paper-item.a-item {
					background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
					color: white;
				}

				.paper-item.b-item {
					background: linear-gradient(135deg, #feca57, #f39c12);
					color: #333;
				}

				.paper-item.c-item {
					background: linear-gradient(135deg, #48dbfb, #0abde3);
					color: white;
				}

				.paper-item.nature-item {
					background: linear-gradient(135deg, #ffd700, #ff8c00);
					color: #333;
				}

				.paper-item.naturesub-item {
					background: linear-gradient(135deg, #a29bfe, #6c5ce7);
					color: white;
				}

				/* ★★★ 新增：社交活动行 ★★★ */
				.poster-social-row {
					display: flex;
					justify-content: center;
					gap: 8px;
					margin-bottom: 10px;
					flex-wrap: wrap;
				}

				.social-item {
					font-size: 0.6rem;
					color: #666;
					background: #f0f0f0;
					padding: 3px 8px;
					border-radius: 8px;
				}

				/* ★★★ 新增：毕业属性行 ★★★ */
				.poster-final-stats {
					display: flex;
					justify-content: center;
					gap: 8px;
					margin: 10px 0;
					flex-wrap: wrap;
				}

				.final-stat-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1));
					padding: 6px 10px;
					border-radius: 8px;
					min-width: 45px;
				}

				.final-stat-icon {
					font-size: 0.9rem;
				}

				.final-stat-value {
					font-size: 0.85rem;
					font-weight: 700;
					color: #333;
				}

				.final-stat-label {
					font-size: 0.55rem;
					color: #666;
				}

				/* ★★★ 删除：不再使用标签样式 ★★★ */

				.poster-special {
					display: flex;
					justify-content: center;
					gap: 8px;
					margin-bottom: 10px;
				}

				.special-badge {
					font-size: 0.7rem;
					padding: 4px 10px;
					border-radius: 12px;
					font-weight: 600;
				}

				.special-badge.nature {
					background: linear-gradient(135deg, #ffd700, #ffb347);
					color: #8b4513;
				}

				.special-badge.naturesub {
					background: linear-gradient(135deg, #87ceeb, #4169e1);
					color: #fff;
				}

				.poster-achievements {
					display: flex;
					justify-content: center;
					gap: 6px;
					flex-wrap: wrap;
				}

				.p-ach {
					font-size: 1.2rem;
				}

				.p-ach-more {
					font-size: 0.7rem;
					color: #999;
					background: #f0f0f0;
					padding: 2px 8px;
					border-radius: 10px;
				}

				/* ★★★ 人际关系信息 ★★★ */
				.poster-relations {
					display: flex;
					justify-content: center;
					gap: 12px;
					margin: 8px 0;
					flex-wrap: wrap;
				}

				.p-relation {
					font-size: 0.7rem;
					color: #666;
					background: linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1));
					padding: 4px 10px;
					border-radius: 12px;
					border: 1px solid rgba(102,126,234,0.2);
				}

				/* ★★★ 勾选项 ★★★ */
				.poster-checkboxes {
					display: flex;
					justify-content: center;
					gap: 10px;
					margin: 8px 0;
				}

				.p-checkbox {
					display: flex;
					align-items: center;
					gap: 3px;
					font-size: 0.65rem;
					color: #999;
					padding: 3px 8px;
					border-radius: 8px;
					background: #f5f5f5;
				}

				.p-checkbox.checked {
					color: #667eea;
					background: linear-gradient(135deg, rgba(102,126,234,0.15), rgba(118,75,162,0.15));
				}

				.checkbox-icon {
					font-size: 0.8rem;
				}

				.p-checkbox.checked .checkbox-icon {
					color: #27ae60;
				}

				.checkbox-label {
					font-weight: 500;
				}

				.poster-footer {
					position: relative;
					text-align: center;
					padding: 12px 15px;
					background: #f8f9fa;
					border-top: 1px dashed #e0e0e0;
				}

				.footer-text {
					font-size: 0.8rem;
					color: #666;
					font-weight: 500;
				}

				.footer-date {
					font-size: 0.65rem;
					color: #999;
					margin-top: 3px;
				}

				.share-buttons {
					margin-top: 20px;
				}

				.share-btn {
					display: inline-flex;
					align-items: center;
					gap: 8px;
					padding: 12px 28px;
					border: none;
					border-radius: 25px;
					font-size: 0.95rem;
					font-weight: 600;
					cursor: pointer;
					transition: all 0.3s;
					font-family: inherit;
				}

				.save-btn {
					background: #fff;
					color: #667eea;
					box-shadow: 0 4px 15px rgba(0,0,0,0.15);
				}

				.save-btn:hover {
					transform: translateY(-2px);
					box-shadow: 0 6px 20px rgba(0,0,0,0.2);
				}

				.share-actions {
					display: flex;
					gap: 12px;
					margin-top: 18px;
				}

				#career-summary-container .action-btn {
					display: inline-flex;
					align-items: center;
					gap: 6px;
					padding: 10px 18px;
					border: 2px solid rgba(255,255,255,0.4);
					border-radius: 20px;
					background: transparent;
					color: #fff;
					font-size: 0.85rem;
					cursor: pointer;
					transition: all 0.3s;
					font-family: inherit;
				}

				#career-summary-container .action-btn:hover {
					background: rgba(255,255,255,0.15);
					border-color: rgba(255,255,255,0.6);
				}

				/* ==================== 导航控件 ==================== */
				.slide-indicators {
					position: absolute;
					bottom: 25px;
					left: 50%;
					transform: translateX(-50%);
					display: flex;
					gap: 8px;
					z-index: 100;
				}

				.indicator {
					width: 8px;
					height: 8px;
					border-radius: 50%;
					background: rgba(255,255,255,0.35);
					cursor: pointer;
					transition: all 0.3s;
				}

				.indicator.active {
					background: #fff;
					transform: scale(1.3);
				}

				.slide-nav {
					position: absolute;
					top: 50%;
					left: 0;
					right: 0;
					transform: translateY(-50%);
					display: flex;
					justify-content: space-between;
					padding: 0 12px;
					pointer-events: none;
					z-index: 100;
				}

				.nav-btn {
					width: 42px;
					height: 42px;
					border-radius: 50%;
					border: none;
					background: rgba(255,255,255,0.25);
					color: #fff;
					font-size: 1.1rem;
					cursor: pointer;
					pointer-events: auto;
					transition: all 0.3s;
					backdrop-filter: blur(10px);
				}

				.nav-btn:hover {
					background: rgba(255,255,255,0.4);
					transform: scale(1.1);
				}

				.close-summary-btn {
					position: absolute;
					top: 15px;
					right: 15px;
					width: 36px;
					height: 36px;
					border-radius: 50%;
					border: none;
					background: rgba(255,255,255,0.2);
					color: #fff;
					font-size: 1rem;
					cursor: pointer;
					z-index: 100;
					transition: all 0.3s;
					backdrop-filter: blur(10px);
				}

				.close-summary-btn:hover {
					background: rgba(255,255,255,0.35);
				}

				/* ==================== 卡片7：祝福与诅咒 ==================== */
				.curses-bg {
					background: linear-gradient(135deg, #2d1f3d 0%, #4a2c4a 50%, #5d3a5d 100%);
				}

				.skull-particles {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					pointer-events: none;
					overflow: hidden;
				}

				.skull-float {
					position: absolute;
					font-size: 2rem;
					opacity: 0.15;
					animation: float 5s ease-in-out infinite;
				}

				.skull-float.s1 { top: 15%; left: 12%; animation-delay: 0s; }
				.skull-float.s2 { top: 28%; right: 15%; animation-delay: 1.5s; }
				.skull-float.s3 { bottom: 25%; left: 18%; animation-delay: 3s; }

				.blessings-section, .curses-section {
					width: 100%;
					max-width: 340px;
					background: rgba(255,255,255,0.08);
					border-radius: 14px;
					padding: 15px;
					margin-bottom: 15px;
				}

				.section-header {
					display: flex;
					align-items: center;
					gap: 8px;
					margin-bottom: 12px;
					padding-bottom: 8px;
					border-bottom: 1px solid rgba(255,255,255,0.15);
				}

				.section-icon {
					font-size: 1.2rem;
				}

				.section-title {
					font-size: 1rem;
					font-weight: 600;
					color: #fff;
				}

				.difficulty-badge-slide {
					margin-left: auto;
					padding: 3px 10px;
					background: linear-gradient(135deg, #e74c3c, #c0392b);
					color: white;
					border-radius: 12px;
					font-size: 0.75rem;
					font-weight: 600;
				}

				.blessings-empty, .curses-empty {
					text-align: center;
					padding: 20px;
					color: rgba(255,255,255,0.6);
				}

				.blessings-empty .empty-icon, .curses-empty .empty-icon {
					font-size: 2.5rem;
					margin-bottom: 8px;
				}

				.blessings-empty .empty-text, .curses-empty .empty-text {
					font-size: 0.9rem;
					color: rgba(255,255,255,0.8);
				}

				.blessings-empty .empty-sub, .curses-empty .empty-sub {
					font-size: 0.75rem;
					color: rgba(255,255,255,0.5);
					margin-top: 4px;
				}

				.curses-list-slide {
					display: flex;
					flex-direction: column;
					gap: 10px;
				}

				.curse-card {
					display: flex;
					align-items: center;
					gap: 12px;
					padding: 12px;
					background: rgba(231, 76, 60, 0.15);
					border-radius: 10px;
					border: 1px solid rgba(231, 76, 60, 0.3);
				}

				.curse-card-icon {
					font-size: 1.5rem;
				}

				.curse-card-info {
					flex: 1;
				}

				.curse-card-name {
					font-size: 0.9rem;
					font-weight: 600;
					color: #fff;
				}

				.curse-card-desc {
					font-size: 0.7rem;
					color: rgba(255,255,255,0.6);
					margin-top: 2px;
				}

				.curse-card-points {
					font-size: 0.85rem;
					font-weight: 600;
					color: #e74c3c;
					padding: 4px 10px;
					background: rgba(231, 76, 60, 0.2);
					border-radius: 10px;
				}

				.curses-summary {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 8px;
					margin-top: 12px;
					padding: 10px;
					background: rgba(255,255,255,0.08);
					border-radius: 10px;
				}

				.curses-summary .summary-icon {
					font-size: 1.2rem;
				}

				.curses-summary .summary-text {
					font-size: 0.85rem;
					color: rgba(255,255,255,0.85);
				}

				.curses-summary .summary-text strong {
					color: #e74c3c;
				}

				/* ★★★ 祝福卡片样式 ★★★ */
				.blessings-list-slide {
					display: flex;
					flex-direction: column;
					gap: 10px;
				}

				.blessing-card {
					display: flex;
					align-items: center;
					gap: 12px;
					padding: 12px;
					background: rgba(16, 185, 129, 0.15);
					border-radius: 10px;
					border: 1px solid rgba(16, 185, 129, 0.3);
				}

				.blessing-card-icon {
					font-size: 1.5rem;
				}

				.blessing-card-info {
					flex: 1;
				}

				.blessing-card-name {
					font-size: 0.9rem;
					font-weight: 600;
					color: #fff;
				}

				.blessing-card-desc {
					font-size: 0.7rem;
					color: rgba(255,255,255,0.6);
					margin-top: 2px;
				}

				.blessing-card-points {
					font-size: 0.85rem;
					font-weight: 600;
					color: #10b981;
					padding: 4px 10px;
					background: rgba(16, 185, 129, 0.2);
					border-radius: 10px;
				}

				.blessings-summary {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 8px;
					margin-top: 12px;
					padding: 10px;
					background: rgba(255,255,255,0.08);
					border-radius: 10px;
				}

				.blessings-summary .summary-icon {
					font-size: 1.2rem;
				}

				.blessings-summary .summary-text {
					font-size: 0.85rem;
					color: rgba(255,255,255,0.85);
				}

				.blessings-summary .summary-text strong {
					color: #10b981;
				}

				.difficulty-badge-slide.blessing-badge {
					background: linear-gradient(135deg, #10b981, #059669);
				}

				/* 难度统计样式 */
				.p-stat-difficulty {
					background: linear-gradient(135deg, rgba(231, 76, 60, 0.15), rgba(192, 57, 43, 0.15)) !important;
					border: 1px solid rgba(231, 76, 60, 0.3);
				}

				.p-stat-difficulty .p-stat-value {
					color: #c0392b;
				}

				/* ==================== 移动端适配 ==================== */
				@media (max-width: 480px) {
					.slide-inner {
						padding: 40px 15px 70px;
					}

					.slide-title {
						font-size: 1.4rem;
						margin-bottom: 20px;
					}

					.journey-icon {
						font-size: 2rem;
					}

					.stat-value {
						font-size: 1.5rem;
					}

					.stats-grid {
						gap: 8px;
					}

					.stat-card {
						padding: 12px;
					}

					.share-poster-enhanced {
						max-width: 260px;
					}
				}
			`;
			document.head.appendChild(styles);
		}
