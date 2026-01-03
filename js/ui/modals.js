        // ==================== 弹窗系统 ====================
        let modalCallbacks = [];

        // ★★★ 弹窗类型检测（基于标题关键词）★★★
        function detectModalType(title) {
            const titleLower = title.toLowerCase();

            // 成就相关
            if (titleLower.includes('成就') || titleLower.includes('🏆') || titleLower.includes('解锁')) {
                return 'achievement';
            }

            // 毕业相关
            if (titleLower.includes('毕业') || titleLower.includes('🎓')) {
                return 'graduation';
            }

            // 论文中稿
            if ((titleLower.includes('中稿') || titleLower.includes('录用') || titleLower.includes('接收')) &&
                !titleLower.includes('拒稿')) {
                return 'paper-accepted';
            }

            // 拒稿
            if (titleLower.includes('拒稿') || titleLower.includes('被拒')) {
                return 'rejected';
            }

            // 转博
            if (titleLower.includes('转博') || titleLower.includes('博士')) {
                return 'phd-upgrade';
            }

            // 里程碑事件
            if (titleLower.includes('里程碑') || titleLower.includes('觉醒') ||
                titleLower.includes('nature') || titleLower.includes('best paper')) {
                return 'milestone';
            }

            // 好事件
            if (titleLower.includes('恭喜') || titleLower.includes('成功') ||
                titleLower.includes('获得') || titleLower.includes('奖') ||
                titleLower.includes('✨') || titleLower.includes('🎉') ||
                titleLower.includes('💰') || titleLower.includes('好感+')) {
                return 'good';
            }

            // 坏事件
            if (titleLower.includes('警告') || titleLower.includes('失败') ||
                titleLower.includes('危险') || titleLower.includes('惩罚') ||
                titleLower.includes('⚠') || titleLower.includes('❌') ||
                titleLower.includes('损失') || titleLower.includes('扣')) {
                return 'bad';
            }

            // 随机事件
            if (titleLower.includes('随机') || titleLower.includes('🎲') ||
                titleLower.includes('意外')) {
                return 'random';
            }

            // 选择事件
            if (titleLower.includes('选择') || titleLower.includes('⚖') ||
                titleLower.includes('决定')) {
                return 'choice';
            }

            return ''; // 默认无特殊主题
        }

        function showModal(title, content, buttons, options = {}) {
            const modalEl = document.getElementById('modal');
            const overlayEl = document.getElementById('modal-overlay');

            // 移除所有主题类
            modalEl.className = 'modal';

            // 检测并应用主题
            const modalType = options.type || detectModalType(title);
            if (modalType) {
                modalEl.classList.add('modal-' + modalType);
            }

            // 特殊效果：坏事件震动
            if (modalType === 'bad' && options.shake !== false) {
                setTimeout(() => {
                    modalEl.classList.add('modal-shake');
                    setTimeout(() => modalEl.classList.remove('modal-shake'), 500);
                }, 100);
            }

            document.getElementById('modal-title').textContent = title;
            document.getElementById('modal-content').innerHTML = content;
            modalCallbacks = buttons.map(b => b.action);
            document.getElementById('modal-buttons').innerHTML = buttons.map((b, i) =>
                `<button class="btn ${b.class}" onclick="modalCallbacks[${i}]()">${b.text}</button>`
            ).join('');
            overlayEl.classList.add('active');

            // 触发庆祝特效
            if (typeof SeasonEffects !== 'undefined') {
                if (modalType === 'paper-accepted' || modalType === 'achievement') {
                    SeasonEffects.celebrateGoldBurst();
                } else if (modalType === 'milestone') {
                    SeasonEffects.celebrateConfetti();
                } else if (modalType === 'graduation') {
                    SeasonEffects.celebrateGraduation();
                }
            }
        }

        function closeModal() {
            document.getElementById('modal-overlay').classList.remove('active');
            // ★★★ 修复：弹窗关闭后确保移动端操作栏正确显示 ★★★
            ensureMobileQuickBar();
        }

        // ★★★ 修复：确保移动端操作栏正确显示的函数 ★★★
        function ensureMobileQuickBar() {
            const quickBar = document.getElementById('mobile-quick-bar');
            const gameScreen = document.getElementById('game-screen');
            // 如果游戏界面正在显示，确保操作栏也显示
            if (quickBar && gameScreen && gameScreen.style.display === 'block') {
                if (!quickBar.classList.contains('game-active')) {
                    quickBar.classList.add('game-active');
                }
            }
        }

        // ★★★ 修复：页面可见性变化时检查操作栏 ★★★
        document.addEventListener('visibilitychange', function() {
            if (document.visibilityState === 'visible') {
                setTimeout(ensureMobileQuickBar, 100);
            }
        });

        // ★★★ 修复：窗口获得焦点时检查操作栏 ★★★
        window.addEventListener('focus', function() {
            setTimeout(ensureMobileQuickBar, 100);
        });

        function showPaperSelectModal(action, papers, callback) {
            let html = `<p style="font-size:0.9rem;">请选择要进行"${action}"的论文：</p><div style="display:flex;flex-direction:column;gap:8px;margin-top:10px;">`;
            papers.forEach(({ paper, index }) => {
                const total = paper.ideaScore + paper.expScore + paper.writeScore;
                html += `<div style="padding:12px;background:var(--light-bg);border-radius:10px;cursor:pointer;border:2px solid transparent;transition:all 0.3s;"
                    onmouseover="this.style.borderColor='var(--primary-color)'"
                    onmouseout="this.style.borderColor='transparent'"
                    onclick="paperSelectCallback(${index})">
                    <div style="font-weight:600;margin-bottom:5px;font-size:0.85rem;">${paper.title.substring(0, 30)}${paper.title.length > 30 ? '...' : ''}</div>
                    <div style="display:flex;gap:10px;font-size:0.75rem;color:var(--text-secondary);">
                        <span>💡${paper.ideaScore}</span>
                        <span>🔬${paper.expScore}</span>
                        <span>✍️${paper.writeScore}</span>
                        <span style="color:var(--primary-color);font-weight:600;">总分:${total}</span>
                    </div>
                </div>`;
            });
            html += '</div>';
            window.paperSelectCallback = (idx) => { closeModal(); callback(idx); };
            showModal(`📝 选择论文 - ${action}`, html, [{ text: '取消', class: 'btn-info', action: closeModal }]);
        }

        // ==================== 日志系统 ====================
        function addLog(event, detail, result = '') {
            const logContent = document.getElementById('log-content');
            const remaining = (gameState.maxYears * 12) - gameState.totalMonths;
            const degreeText = gameState.degree === 'master' ? '硕' : '博';
            const dateStr = `${degreeText}${gameState.year}-${gameState.month}月 剩${remaining}月`;
            const isNegative = result && (result.includes('-') || result.includes('拒稿') || result.includes('不满') || result.includes('失败') || result.includes('落选'));
            const isAchievement = event.includes('成就') || event.includes('🏆');

            // ★★★ 日志分类系统 ★★★
            const fullText = `${event} ${detail} ${result}`.toLowerCase();
            let logType = '';
            let isImportant = false;

            // 警告类（最高优先级）
            if (fullText.includes('警告') || fullText.includes('危险') || fullText.includes('注意') ||
                fullText.includes('破产') || fullText.includes('退学') || fullText.includes('崩溃') ||
                fullText.includes('san') && (fullText.includes('过低') || fullText.includes('归零'))) {
                logType = 'log-warning';
                isImportant = true;
            }
            // 成就/里程碑类
            else if (isAchievement || fullText.includes('毕业') || fullText.includes('解锁') ||
                     fullText.includes('升级') || fullText.includes('里程碑')) {
                logType = 'log-milestone';
                isImportant = true;
            }
            // 论文类
            else if (fullText.includes('论文') || fullText.includes('投稿') || fullText.includes('中稿') ||
                     fullText.includes('拒稿') || fullText.includes('审稿') || fullText.includes('期刊') ||
                     fullText.includes('会议') || fullText.includes('paper') || fullText.includes('投递') ||
                     fullText.includes('写作') || fullText.includes('实验') || fullText.includes('idea')) {
                logType = 'log-paper';
                // 中稿是重要事件
                if (fullText.includes('中稿') || fullText.includes('接收') || fullText.includes('录用')) {
                    isImportant = true;
                }
            }
            // 金钱类
            else if (fullText.includes('金币') || fullText.includes('金钱') || fullText.includes('打工') ||
                     fullText.includes('购买') || fullText.includes('消费') || fullText.includes('报酬') ||
                     fullText.includes('收入') || fullText.includes('支出') || fullText.includes('商店') ||
                     result.includes('💰') || result.includes('¥')) {
                logType = 'log-money';
            }
            // 关系类
            else if (fullText.includes('好感') || fullText.includes('关系') || fullText.includes('导师') ||
                     fullText.includes('师兄') || fullText.includes('师姐') || fullText.includes('恋人') ||
                     fullText.includes('交流') || fullText.includes('约会') || fullText.includes('任务') ||
                     fullText.includes('师弟') || fullText.includes('师妹') || fullText.includes('💕')) {
                logType = 'log-relationship';
            }
            // 系统类（时间、入学等）
            else if (fullText.includes('入学') || fullText.includes('开学') || fullText.includes('学期') ||
                     fullText.includes('新的一年') || fullText.includes('月份') || event.includes('📅')) {
                logType = 'log-system';
            }

            const entry = document.createElement('div');
            entry.className = `log-entry ${isNegative ? 'negative' : ''} ${isAchievement ? 'achievement' : ''} ${logType} ${isImportant ? 'log-important' : ''}`;
            entry.style.position = 'relative';
            entry.style.overflow = 'hidden';
            entry.innerHTML = `<div class="date">[${dateStr}] ${event}</div><div class="event">${detail}</div>${result ? `<div class="result">→ ${result}</div>` : ''}`;
            logContent.insertBefore(entry, logContent.firstChild);
            while (logContent.children.length > 100) logContent.removeChild(logContent.lastChild);

            // ★★★ 新增：保存最后一条日志信息（用于失败结局显示）★★★
            gameState.lastLog = {
                dateStr: dateStr,
                event: event,
                detail: detail,
                result: result
            };
        }

        // ==================== 工具函数 ====================
        function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

        function shuffle(arr) {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        }

        function scrollToPanel(panelId) {
            const panel = document.getElementById(panelId);
            if (panel) {
                panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }

        // ==================== 会议相关函数 ====================
        
        // 计算真实年份：游戏第1年第1月 = 2030年9月
        function getRealYear(gameYear, gameMonth) {
            const baseYear = 2029;
            return baseYear + gameYear + (gameMonth >= 5 ? 1 : 0);
        }

        // 获取会议信息
        function getConferenceInfo(gameMonth, grade, gameYear) {
            const conf = CONFERENCES[gameMonth][grade];
            const realYear = getRealYear(gameYear, gameMonth);
            
            // 处理ICCV/ECCV轮换
            if (conf.alternates) {
                const isOddYear = realYear % 2 === 1;
                const selected = isOddYear ? conf.alternates.odd : conf.alternates.even;
                return {
                    name: selected.name,
                    fullName: selected.fullName,
                    field: conf.field,
                    year: realYear,
					month: gameMonth,
                };
            }
            
            return {
                name: conf.name,
                fullName: conf.fullName,
                field: conf.field,
                year: realYear
            };
        }

        // 获取会议地点（基于论文标题hash，保证同一论文地点固定）
        // ★★★ 重命名避免与 gameData.js 中的 getConferenceLocation 冲突 ★★★
        function getConferenceLocationByHash(paperTitle) {
            if (!paperTitle || typeof paperTitle !== 'string') {
                return CONFERENCE_LOCATIONS[0];  // 安全返回默认值
            }
            const hash = paperTitle.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            return CONFERENCE_LOCATIONS[hash % CONFERENCE_LOCATIONS.length];
        }

        // 格式化会议显示字符串
        function formatConferenceString(confInfo, location) {
            return `${confInfo.name} ${confInfo.year} @ ${location.city}, ${location.country}`;
        }

		// ==================== 投稿统计系统 ====================

		let submissionStatsCache = null;
		let submissionStatsCacheTime = 0;
		const SUBMISSION_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时缓存

		// 加载投稿统计数据（从缓存表读取）
		async function loadSubmissionStats() {
			// 检查内存缓存
			if (submissionStatsCache && (Date.now() - submissionStatsCacheTime < SUBMISSION_CACHE_DURATION)) {
				console.log('使用内存缓存的投稿统计');
				return submissionStatsCache;
			}
			
			// 检查localStorage缓存
			const localCacheKey = 'graduateSimulator_submissionStats';
			const cached = getLocalCache(localCacheKey);
			if (cached) {
				console.log('使用本地缓存的投稿统计');
				submissionStatsCache = cached;
				submissionStatsCacheTime = Date.now();
				return cached;
			}
			
			if (!window.supabaseClient) {
				console.log('Supabase未初始化，使用默认统计');
				const defaultStats = getDefaultSubmissionStats();
				submissionStatsCache = defaultStats;
				submissionStatsCacheTime = Date.now();
				return defaultStats;
			}
			
			try {
				console.log('📊 从缓存表加载投稿统计...');
				
				const { data, error } = await window.supabaseClient
					.from('stats_submissions_cache')
					.select('game_month, grade, is_reversed, submissions, accepted, poster, oral, best_paper, avg_score_rejected, avg_score_poster, avg_score_oral, avg_score_best_paper, p90_accepted_score, p99_accepted_score');
				
				if (error) throw error;
				
				if (!data || data.length === 0) {
					console.log('缓存表为空，使用默认统计');
					return getDefaultSubmissionStats();
				}
				
				// 组装统计数据
				const stats = {};
				
				data.forEach(row => {
					const key = `${row.game_month}_${row.grade}_${row.is_reversed}`;
					stats[key] = {
						submissions: row.submissions || 0,
						accepted: row.accepted || 0,
						poster: row.poster || 0,
						oral: row.oral || 0,
						bestPaper: row.best_paper || 0,
						acceptRate: row.submissions > 0 ? row.accepted / row.submissions : 0,
						avgScoreRejected: parseFloat(row.avg_score_rejected) || 0,
						avgScorePoster: parseFloat(row.avg_score_poster) || 0,
						avgScoreOral: parseFloat(row.avg_score_oral) || 0,
						avgScoreBestPaper: parseFloat(row.avg_score_best_paper) || 0,
						p90AcceptedScore: row.p90_accepted_score || 0,
						p99AcceptedScore: row.p99_accepted_score || 0
					};
				});
				
				// 填充缺失的月份/等级组合（使用默认值）
				const defaultStats = getDefaultSubmissionStats();
				for (let month = 1; month <= 12; month++) {
					for (const grade of ['A', 'B', 'C']) {
						for (const reversed of [true, false]) {
							const key = `${month}_${grade}_${reversed}`;
							if (!stats[key]) {
								stats[key] = defaultStats[key];
							}
						}
					}
				}
				
				// 更新缓存
				submissionStatsCache = stats;
				submissionStatsCacheTime = Date.now();
				setLocalCache(localCacheKey, stats);
				
				console.log('✅ 投稿统计加载完成，共', data.length, '条记录');
				return stats;
				
			} catch (e) {
				console.error('加载投稿统计失败:', e);
				return getDefaultSubmissionStats();
			}
		}

		function calcAvg(arr) {
			if (!arr || arr.length === 0) return 0;
			return arr.reduce((a, b) => a + b, 0) / arr.length;
		}



		// 获取默认统计数据
		function getDefaultSubmissionStats() {
			const stats = {};
			
			for (let month = 1; month <= 12; month++) {
				for (const grade of ['A', 'B', 'C']) {
					for (const reversed of [true, false]) {
						const key = `${month}_${grade}_${reversed}`;
						const target = TARGET_ACCEPTANCE_RATES[grade];
						
						stats[key] = {
							submissions: 100,  // ★★★ 关键修改：设为100使hasEnoughData为true ★★★
							accepted: Math.round(100 * target.target),  // ★★★ 新增：计算对应的录用数 ★★★
							poster: Math.round(100 * target.target * 0.7),
							oral: Math.round(100 * target.target * 0.25),
							bestPaper: Math.round(100 * target.target * 0.05),
							acceptRate: target.target,
							avgScoreRejected: grade === 'A' ? 40 : grade === 'B' ? 25 : 15,
							avgScorePoster: grade === 'A' ? 70 : grade === 'B' ? 45 : 30,
							avgScoreOral: grade === 'A' ? 90 : grade === 'B' ? 60 : 40,
							avgScoreBestPaper: grade === 'A' ? 105 : grade === 'B' ? 75 : 50,
							p90AcceptedScore: grade === 'A' ? 85 : grade === 'B' ? 55 : 35,
							p99AcceptedScore: grade === 'A' ? 100 : grade === 'B' ? 70 : 45
						};
					}
				}
			}
			
			return stats;
		}

        // 获取当前月份的统计
        function getMonthStats(gameMonth, grade, isReversed) {
            if (!gameState.submissionStats) {
                return getDefaultSubmissionStats()[`${gameMonth}_${grade}_${isReversed}`];
            }
            return gameState.submissionStats[`${gameMonth}_${grade}_${isReversed}`] ||
                   getDefaultSubmissionStats()[`${gameMonth}_${grade}_${isReversed}`];
        }

		// ==================== 全局函数暴露（供onclick调用）====================
		window.showModal = showModal;
		window.closeModal = closeModal;
		window.ensureMobileQuickBar = ensureMobileQuickBar;
		window.showPaperSelectModal = showPaperSelectModal;
		window.addLog = addLog;
		window.rand = rand;
		window.shuffle = shuffle;
		window.scrollToPanel = scrollToPanel;
		window.getRealYear = getRealYear;
		window.getConferenceInfo = getConferenceInfo;
		window.getConferenceLocationByHash = getConferenceLocationByHash;
		window.formatConferenceString = formatConferenceString;
		window.getMonthStats = getMonthStats;
		window.loadSubmissionStats = loadSubmissionStats;
		window.getDefaultSubmissionStats = getDefaultSubmissionStats;

