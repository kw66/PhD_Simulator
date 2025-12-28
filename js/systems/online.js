		// ==================== 在线人数系统（改进版）====================
		let onlineSessionId = null;
		let onlineHeartbeatTimer = null;

		// 生成会话ID
		function getOnlineSessionId() {
			let id = sessionStorage.getItem('graduate_online_session');
			if (!id) {
				id = Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
				sessionStorage.setItem('graduate_online_session', id);
			}
			return id;
		}

		// 启动在线追踪
		function startOnlineTracking() {
			if (!window.supabaseClient) return;

			onlineSessionId = getOnlineSessionId();

			// 立即发送一次心跳并检查历史在线
			sendOnlineHeartbeat();
			checkAndRecordMaxOnline();

			// 每300秒发送心跳（优化：减少数据库调用和流量）
			onlineHeartbeatTimer = setInterval(() => {
				sendOnlineHeartbeat();
			}, 300 * 1000);

			// 页面关闭时清理
			window.addEventListener('beforeunload', () => {
				if (onlineSessionId && window.supabaseClient) {
					// 使用 sendBeacon 确保请求发送
					const url = `${SUPABASE_URL}/rest/v1/online_users?session_id=eq.${onlineSessionId}`;
					navigator.sendBeacon(url, '');
				}
			});
		}

		// 发送心跳（优化：使用 RPC 合并多个数据库操作为一次调用）
		async function sendOnlineHeartbeat() {
			if (!window.supabaseClient || !onlineSessionId) return;

			try {
				// 使用 RPC 函数：一次调用完成 upsert + 清理 + 计数
				const { data, error } = await window.supabaseClient.rpc('heartbeat', {
					p_session_id: onlineSessionId
				});

				if (error) {
					// RPC 不可用时回退到原有逻辑
					console.warn('心跳RPC失败，使用回退方式:', error);
					await sendOnlineHeartbeatFallback();
				}
			} catch (e) {
				console.error('心跳发送失败:', e);
			}
		}

		// 心跳回退方法（RPC不可用时使用）
		async function sendOnlineHeartbeatFallback() {
			try {
				await window.supabaseClient
					.from('online_users')
					.upsert({
						session_id: onlineSessionId,
						last_seen: new Date().toISOString()
					});

				const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
				await window.supabaseClient
					.from('online_users')
					.delete()
					.lt('last_seen', fiveMinutesAgo);
			} catch (e) {
				console.error('心跳回退失败:', e);
			}
		}

		// ★★★ 核心函数：检查并记录历史最高在线 ★★★
		async function checkAndRecordMaxOnline() {
			if (!window.supabaseClient) return null;

			// 使用重试机制确保写入
			const maxRetries = 3;

			for (let attempt = 1; attempt <= maxRetries; attempt++) {
				try {
					// 1. 获取当前在线人数
					const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
					const { count: currentOnline, error: countError } = await window.supabaseClient
						.from('online_users')
						.select('*', { count: 'exact', head: true })
						.gte('last_seen', threeMinutesAgo);

					if (countError) throw countError;

					const onlineCount = currentOnline || 0;

					if (onlineCount === 0) {
						return { current: 0, max: await getHistoryMaxOnline() };
					}

					// 2. 查询历史最大在线人数（从 online_records 表）
					const historyMax = await getHistoryMaxOnline();

					// 3. 如果当前在线大于历史最大，追加新记录
					if (onlineCount > historyMax) {
						const { error: insertError } = await window.supabaseClient
							.from('online_records')
							.insert({
								online_count: onlineCount,
								recorded_at: new Date().toISOString()
							});

						if (insertError) {
							console.error(`记录在线人数失败 (尝试 ${attempt}/${maxRetries}):`, insertError);
							if (attempt < maxRetries) {
								await new Promise(r => setTimeout(r, 500 * attempt)); // 延迟重试
								continue;
							}
						} else {
							console.log(`✅ 新的历史最高在线：${onlineCount} (超过之前的 ${historyMax})`);
							return { current: onlineCount, max: onlineCount };
						}
					}

					return { current: onlineCount, max: Math.max(onlineCount, historyMax) };

				} catch (e) {
					console.error(`检查在线记录失败 (尝试 ${attempt}/${maxRetries}):`, e);
					if (attempt < maxRetries) {
						await new Promise(r => setTimeout(r, 500 * attempt));
					} // 关闭 if
				} // 关闭 catch
			} // <--- 在这里添加一个大括号，关闭 for 循环

			return null;
		}

		// ★★★ 获取历史最高在线人数（从追加记录表中查询最大值）★★★
		async function getHistoryMaxOnline() {
			if (!window.supabaseClient) return 0;

			try {
				// 查询 online_records 表中的最大值
				const { data, error } = await window.supabaseClient
					.from('online_records')
					.select('online_count')
					.order('online_count', { ascending: false })
					.limit(1)
					.maybeSingle();  // 使用 maybeSingle 避免无数据时报错

				if (error) {
					console.error('获取历史最高在线失败:', error);
					return 0;
				}

				return data?.online_count || 0;
			} catch (e) {
				console.error('获取历史最高在线异常:', e);
				return 0;
			}
		}

		// 获取今日北京时间0点的UTC时间
		function getTodayStartUTC() {
			// 当前UTC时间 + 8小时 = 北京时间
			const beijingNow = new Date(Date.now() + 8 * 60 * 60 * 1000);

			// 取北京时间的年月日
			const yyyy = beijingNow.getUTCFullYear();
			const mm = String(beijingNow.getUTCMonth() + 1).padStart(2, '0');
			const dd = String(beijingNow.getUTCDate()).padStart(2, '0');

			// 北京时间今日0点的ISO格式
			const beijingMidnight = `${yyyy}-${mm}-${dd}T00:00:00+08:00`;

			// 转为UTC ISO字符串返回
			return new Date(beijingMidnight).toISOString();
		}

		// 获取今日北京日期字符串 (YYYY-MM-DD)
		function getTodayDateString() {
			const beijingNow = new Date(Date.now() + 8 * 60 * 60 * 1000);
			const yyyy = beijingNow.getUTCFullYear();
			const mm = String(beijingNow.getUTCMonth() + 1).padStart(2, '0');
			const dd = String(beijingNow.getUTCDate()).padStart(2, '0');
			return `${yyyy}-${mm}-${dd}`;
		}

		// ★★★ 修改后的获取所有统计数据函数（使用 allSettled 确保部分失败不影响其他统计）★★★
		async function getAllStats() {
			if (!window.supabaseClient) {
				console.warn('getAllStats: window.supabaseClient 未初始化');
				return null;
			}

			try {
				const todayStart = getTodayStartUTC();
				const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();

				// 使用 allSettled 确保即使某个查询失败，其他查询仍能返回结果
				const results = await Promise.allSettled([
					// 当前在线
					window.supabaseClient
						.from('online_users')
						.select('*', { count: 'exact', head: true })
						.gte('last_seen', threeMinutesAgo),
					// 历史最高在线（从追加记录表查询）
					window.supabaseClient
						.from('online_records')
						.select('online_count')
						.order('online_count', { ascending: false })
						.limit(1)
						.maybeSingle(),
					// 今日PV
					window.supabaseClient
						.from('site_visits')
						.select('*', { count: 'exact', head: true })
						.eq('type', 'pv')
						.gte('created_at', todayStart),
					// 今日UV
					window.supabaseClient
						.from('site_visits')
						.select('*', { count: 'exact', head: true })
						.eq('type', 'uv')
						.gte('created_at', todayStart),
					// 今日游戏数
					window.supabaseClient
						.from('game_endings')
						.select('*', { count: 'exact', head: true })
						.gte('created_at', todayStart)
				]);

				// 安全提取结果，失败的查询返回默认值
				const getResult = (index, defaultVal = null) => {
					const r = results[index];
					if (r.status === 'fulfilled' && !r.value.error) {
						return r.value;
					}
					if (r.status === 'rejected') {
						console.warn(`统计查询 ${index} 失败:`, r.reason);
					} else if (r.value?.error) {
						console.warn(`统计查询 ${index} 错误:`, r.value.error);
					}
					return defaultVal;
				};

				const onlineResult = getResult(0, { count: 0 });
				const maxOnlineResult = getResult(1, { data: null });
				const todayPvResult = getResult(2, { count: 0 });
				const todayUvResult = getResult(3, { count: 0 });
				const todayGamesResult = getResult(4, { count: 0 });

				const currentOnline = onlineResult?.count || 0;
				const historyMax = maxOnlineResult?.data?.online_count || 0;

				// 如果当前在线大于历史最高，记录新纪录
				if (currentOnline > historyMax && currentOnline > 0) {
					// 异步写入，不阻塞返回
					window.supabaseClient
						.from('online_records')
						.insert({
							online_count: currentOnline,
							recorded_at: new Date().toISOString()
						})
						.then(({ error }) => {
							if (error) {
								console.error('追加在线记录失败:', error);
							} else {
								console.log(`✅ 新历史最高在线已记录：${currentOnline}`);
							}
						});
				}

				return {
					online: currentOnline,
					maxOnline: Math.max(currentOnline, historyMax),
					todayPv: todayPvResult?.count || 0,
					todayUv: todayUvResult?.count || 0,
					todayGames: todayGamesResult?.count || 0
				};
			} catch (e) {
				console.error('获取统计失败:', e);
				// 返回默认值而不是 null，确保 UI 能显示 0
				return {
					online: 0,
					maxOnline: 0,
					todayPv: 0,
					todayUv: 0,
					todayGames: 0
				};
			}
		}

		// 更新统计显示
		async function updateAllStatsDisplay() {
			console.log('正在更新统计显示...');

			const stats = await getAllStats();

			console.log('获取到的统计:', stats);

			// 即使 stats 为 null 也显示默认值 0
			const displayStats = stats || { online: 0, maxOnline: 0, todayPv: 0, todayUv: 0, todayGames: 0 };

			const el = (id) => document.getElementById(id);
			if (el('online-count-value')) el('online-count-value').textContent = displayStats.online;
			if (el('max-online-value')) el('max-online-value').textContent = displayStats.maxOnline;
			if (el('today-pv-value')) el('today-pv-value').textContent = displayStats.todayPv;
			if (el('today-uv-value')) el('today-uv-value').textContent = displayStats.todayUv;
			if (el('today-games-value')) el('today-games-value').textContent = displayStats.todayGames;

			if (stats) {
				console.log('✅ 统计显示已更新');
			} else {
				console.warn('⚠️ 统计数据获取失败，显示默认值 0');
			}
		}

		// ==================== 留言板系统 ====================
		const MESSAGES_PER_PAGE = 10;
		let currentMessagePage = 1;
		let totalMessagePages = 1;
		let replyToMessage = null;
		let messagesCache = null;
		let messagesCacheTime = 0;
		const MESSAGES_CACHE_DURATION = 5 * 60 * 1000;  // 留言缓存5分钟（优化：减少重复请求）

		// 加载留言（优化：添加短期缓存减少重复请求）
		async function loadMessages(page = 1, forceRefresh = false) {
			const listEl = document.getElementById('message-list');
			const paginationEl = document.getElementById('message-pagination');

			if (!window.supabaseClient) {
				listEl.innerHTML = '<div class="no-messages"><i class="fas fa-database"></i><div>留言服务暂不可用</div></div>';
				return;
			}

			// 检查缓存（同一页面且未过期时使用缓存）
			const cacheKey = `page_${page}`;
			if (!forceRefresh && messagesCache && messagesCache.key === cacheKey &&
				Date.now() - messagesCacheTime < MESSAGES_CACHE_DURATION) {
				renderMessagesFromCache(listEl, paginationEl);
				return;
			}

			listEl.innerHTML = '<div style="text-align:center;color:var(--text-secondary);font-size:0.85rem;padding:20px;"><i class="fas fa-spinner fa-spin"></i> 加载留言中...</div>';

			try {
				// 获取主留言总数
				const { count: totalCount, error: countError } = await window.supabaseClient
					.from('messages')
					.select('*', { count: 'exact', head: true })
					.is('parent_id', null);

				if (countError) throw countError;

				totalMessagePages = Math.max(1, Math.ceil(totalCount / MESSAGES_PER_PAGE));
				currentMessagePage = Math.min(page, totalMessagePages);

				// 获取当前页的主留言（优化：只选择需要的字段减少流量）
				const offset = (currentMessagePage - 1) * MESSAGES_PER_PAGE;
				const { data: mainMessages, error: mainError } = await window.supabaseClient
					.from('messages')
					.select('id, nickname, content, created_at, parent_id')
					.is('parent_id', null)
					.order('created_at', { ascending: false })
					.range(offset, offset + MESSAGES_PER_PAGE - 1);

				if (mainError) throw mainError;

				if (!mainMessages || mainMessages.length === 0) {
					listEl.innerHTML = '<div class="no-messages"><i class="fas fa-comment-slash"></i><div>暂无留言，来做第一个留言的人吧！</div></div>';
					paginationEl.style.display = 'none';
					return;
				}

				// 获取这些主留言的所有回复（优化：只选择需要的字段减少流量）
				const mainIds = mainMessages.map(m => m.id);
				const { data: replies, error: repliesError } = await window.supabaseClient
					.from('messages')
					.select('id, nickname, content, created_at, parent_id')
					.in('parent_id', mainIds)
					.order('created_at', { ascending: true });

				if (repliesError) throw repliesError;

				// 缓存结果
				messagesCache = {
					key: cacheKey,
					mainMessages,
					replies: replies || [],
					totalPages: totalMessagePages,
					currentPage: currentMessagePage
				};
				messagesCacheTime = Date.now();

				renderMessagesFromCache(listEl, paginationEl);

			} catch (e) {
				console.error('加载留言失败:', e);
				listEl.innerHTML = `<div class="no-messages"><i class="fas fa-exclamation-triangle"></i><div>加载失败，请稀后重试</div><button class="btn btn-info" onclick="loadMessages(${currentMessagePage})" style="margin-top:10px;"><i class="fas fa-redo"></i> 重试</button></div>`;
			}
		}

		// 从缓存渲染留言
		function renderMessagesFromCache(listEl, paginationEl) {
			if (!messagesCache) return;

			const { mainMessages, replies } = messagesCache;

			// 按parent_id分组回复
			const repliesMap = {};
			replies.forEach(reply => {
				if (!repliesMap[reply.parent_id]) {
					repliesMap[reply.parent_id] = [];
				}
				repliesMap[reply.parent_id].push(reply);
			});

			// 渲染留言
			listEl.innerHTML = mainMessages.map(msg => renderMessage(msg, repliesMap[msg.id] || [])).join('');

			// 更新分页
			updatePagination();
			paginationEl.style.display = totalMessagePages > 1 ? 'block' : 'none';
		}

		// 渲染单条留言
		function renderMessage(msg, replies = []) {
			const time = formatMessageTime(msg.created_at);
			const replyCount = replies.length;

			let repliesHtml = '';
			if (replyCount > 0) {
				// 只显示前1条回复
				const visibleReplies = replies.slice(0, 1);
				const hiddenReplies = replies.slice(1);
				const hasMore = hiddenReplies.length > 0;

				repliesHtml = `
					<div class="message-replies">
						${visibleReplies.map(reply => `
							<div class="message-item reply">
								<div class="message-header">
									<span class="message-nickname">${escapeHtml(reply.nickname)}</span>
									<span class="message-time">${formatMessageTime(reply.created_at)}</span>
								</div>
								<div class="message-content">${escapeHtml(reply.content)}</div>
							</div>
						`).join('')}
						${hasMore ? `
							<div class="hidden-replies" id="hidden-replies-${msg.id}" style="display:none;">
								${hiddenReplies.map(reply => `
									<div class="message-item reply">
										<div class="message-header">
											<span class="message-nickname">${escapeHtml(reply.nickname)}</span>
											<span class="message-time">${formatMessageTime(reply.created_at)}</span>
										</div>
										<div class="message-content">${escapeHtml(reply.content)}</div>
									</div>
								`).join('')}
							</div>
							<button class="expand-replies-btn" id="expand-btn-${msg.id}" onclick="toggleReplies(${msg.id}, ${hiddenReplies.length})" style="background:none;border:none;color:var(--primary-color);cursor:pointer;font-size:0.75rem;padding:4px 0;width:100%;text-align:left;">
								<i class="fas fa-chevron-down"></i> 展开更多回复 (${hiddenReplies.length}条)
							</button>
						` : ''}
					</div>
				`;
			}

			return `
				<div class="message-item" data-id="${msg.id}">
					<div class="message-header">
						<span class="message-nickname">${escapeHtml(msg.nickname)}</span>
						<span class="message-time">${time}</span>
					</div>
					<div class="message-content">${escapeHtml(msg.content)}</div>
					<div class="message-actions">
						<button onclick="setReplyTo(${msg.id}, '${escapeHtml(msg.nickname)}', '${escapeHtml(msg.content.substring(0, 30))}')">
							<i class="fas fa-reply"></i> 回复
						</button>
						${replyCount > 0 ? `<span class="reply-count"><i class="fas fa-comments"></i> ${replyCount} 条回复</span>` : ''}
					</div>
					${repliesHtml}
				</div>
			`;
		}

		// 展开/收起回复
		function toggleReplies(msgId, hiddenCount) {
			const hiddenEl = document.getElementById(`hidden-replies-${msgId}`);
			const btnEl = document.getElementById(`expand-btn-${msgId}`);
			if (!hiddenEl || !btnEl) return;

			if (hiddenEl.style.display === 'none') {
				hiddenEl.style.display = 'block';
				btnEl.innerHTML = `<i class="fas fa-chevron-up"></i> 收起回复`;
			} else {
				hiddenEl.style.display = 'none';
				btnEl.innerHTML = `<i class="fas fa-chevron-down"></i> 展开更多回复 (${hiddenCount}条)`;
			}
		}

		// 格式化时间
		function formatMessageTime(dateStr) {
			const date = new Date(dateStr);
			const now = new Date();
			const diff = now - date;

			// 1分钟内
			if (diff < 60 * 1000) {
				return '刚刚';
			}
			// 1小时内
			if (diff < 60 * 60 * 1000) {
				return `${Math.floor(diff / 60 / 1000)} 分钟前`;
			}
			// 24小时内
			if (diff < 24 * 60 * 60 * 1000) {
				return `${Math.floor(diff / 60 / 60 / 1000)} 小时前`;
			}
			// 7天内
			if (diff < 7 * 24 * 60 * 60 * 1000) {
				return `${Math.floor(diff / 24 / 60 / 60 / 1000)} 天前`;
			}
			// 更早
			return `${date.getMonth() + 1}月${date.getDate()}日`;
		}

		// HTML转义
		function escapeHtml(text) {
			const div = document.createElement('div');
			div.textContent = text;
			return div.innerHTML;
		}

		// 设置回复目标
		function setReplyTo(id, nickname, preview) {
			replyToMessage = { id, nickname };
			document.getElementById('reply-indicator').style.display = 'block';
			document.getElementById('reply-to-name').textContent = nickname;
			document.getElementById('reply-preview').textContent = preview.length >= 30 ? preview + '...' : preview;
			document.getElementById('msg-content').focus();
			document.getElementById('msg-content').placeholder = `回复 ${nickname}...`;
		}

		// 取消回复
		function cancelReply() {
			replyToMessage = null;
			document.getElementById('reply-indicator').style.display = 'none';
			document.getElementById('msg-content').placeholder = '说点什么吧...（支持回复其他人的留言）';
		}

		// 发表留言
		async function postMessage() {
			const nicknameInput = document.getElementById('msg-nickname');
			const contentInput = document.getElementById('msg-content');

			const nickname = nicknameInput.value.trim();
			const content = contentInput.value.trim();

			if (!nickname) {
				showModal('❌ 提示', '<p>请输入昵称！</p>', [{ text: '确定', class: 'btn-primary', action: closeModal }]);
				nicknameInput.focus();
				return;
			}

			if (!content) {
				showModal('❌ 提示', '<p>请输入留言内容！</p>', [{ text: '确定', class: 'btn-primary', action: closeModal }]);
				contentInput.focus();
				return;
			}

			if (nickname.length > 10) {
				showModal('❌ 提示', '<p>昵称不能超过10个字符！</p>', [{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			if (content.length > 100) {
				showModal('❌ 提示', '<p>留言内容不能超过100个字符！</p>', [{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			if (!window.supabaseClient) {
				showModal('❌ 错误', '<p>留言服务暂不可用</p>', [{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			try {
				const messageData = {
					nickname: nickname,
					content: content,
					parent_id: replyToMessage ? replyToMessage.id : null
				};

				const { error } = await window.supabaseClient.from('messages').insert(messageData);

				if (error) throw error;

				// 清空输入
				contentInput.value = '';
				cancelReply();

				// 保存昵称到本地
				localStorage.setItem('graduateSimulator_nickname', nickname);

				// 如果是回复，刷新当前页；如果是新留言，跳转到第一页（强制刷新缓存）
				if (replyToMessage) {
					await loadMessages(currentMessagePage, true);
				} else {
					await loadMessages(1, true);
				}

				showModal('✅ 成功', '<p>留言发表成功！</p>', [{ text: '确定', class: 'btn-primary', action: closeModal }]);

			} catch (e) {
				console.error('发表留言失败:', e);
				showModal('❌ 错误', '<p>发表失败，请稍后重试</p>', [{ text: '确定', class: 'btn-primary', action: closeModal }]);
			}
		}

		// 翻页
		function changeMessagePage(delta) {
			const newPage = currentMessagePage + delta;
			if (newPage >= 1 && newPage <= totalMessagePages) {
				loadMessages(newPage);
			}
		}

		// 更新分页UI
		function updatePagination() {
			document.getElementById('page-info').textContent = `第 ${currentMessagePage} / ${totalMessagePages} 页`;
			document.getElementById('prev-page-btn').disabled = currentMessagePage <= 1;
			document.getElementById('next-page-btn').disabled = currentMessagePage >= totalMessagePages;
		}

		// 初始化留言板（懒加载：不自动加载，等用户展开时才请求）
		let messageBoardLoaded = false;

		function initMessageBoard() {
			// 恢复保存的昵称
			const savedNickname = localStorage.getItem('graduateSimulator_nickname');
			if (savedNickname) {
				document.getElementById('msg-nickname').value = savedNickname;
			}
			// 留言数据在用户展开留言板时由 panels.js 触发加载
		}

		// 按需加载留言（用户展开时触发）
		function loadMessagesOnDemand() {
			if (messageBoardLoaded) return;
			messageBoardLoaded = true;
			loadMessages(1);
		}

		// ==================== 游戏内留言事件 ====================
		function triggerFeedbackEvent() {
			if (gameState.feedbackEventTriggered) return;
			gameState.feedbackEventTriggered = true;

			const yearsText = gameState.feedbackEventYear === 3 ? '2' : '4';
			const savedNickname = localStorage.getItem('graduateSimulator_nickname') || '';

			const content = `
				<p style="margin-bottom:15px;">研究生生涯已经${yearsText}年多了，你有什么想分享的吗？可以是本局感想、bug提交、游戏建议、攻略心得等。</p>
				<div style="margin-bottom:10px;">
					<input type="text" id="feedback-nickname" placeholder="昵称（最多10字符）" maxlength="10"
						value="${escapeHtml(savedNickname)}"
						style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--card-bg);color:var(--text-color);font-size:0.9rem;box-sizing:border-box;">
				</div>
				<div>
					<textarea id="feedback-content" placeholder="写点什么吧...（最多100字符）" maxlength="100"
						style="width:100%;height:80px;padding:8px 12px;border:1px solid var(--border-color);border-radius:6px;background:var(--card-bg);color:var(--text-color);font-size:0.9rem;resize:none;box-sizing:border-box;"></textarea>
				</div>
			`;

			showModal('💬 分享时刻', content, [
				{ text: '暂时没有呢', class: 'btn-secondary', action: closeModal },
				{ text: '我要提交', class: 'btn-primary', action: submitFeedback }
			]);
		}

		// 提交游戏内反馈
		async function submitFeedback() {
			const nicknameInput = document.getElementById('feedback-nickname');
			const contentInput = document.getElementById('feedback-content');

			const nickname = nicknameInput.value.trim();
			const content = contentInput.value.trim();

			if (!nickname) {
				showModal('❌ 提示', '<p>请输入昵称！</p>', [{ text: '确定', class: 'btn-primary', action: () => { closeModal(); triggerFeedbackEvent(); } }]);
				return;
			}

			if (!content) {
				showModal('❌ 提示', '<p>请输入留言内容！</p>', [{ text: '确定', class: 'btn-primary', action: () => { closeModal(); triggerFeedbackEvent(); } }]);
				return;
			}

			if (nickname.length > 10) {
				showModal('❌ 提示', '<p>昵称不能超过10个字符！</p>', [{ text: '确定', class: 'btn-primary', action: () => { closeModal(); triggerFeedbackEvent(); } }]);
				return;
			}

			if (content.length > 100) {
				showModal('❌ 提示', '<p>留言内容不能超过100个字符！</p>', [{ text: '确定', class: 'btn-primary', action: () => { closeModal(); triggerFeedbackEvent(); } }]);
				return;
			}

			if (!window.supabaseClient) {
				showModal('❌ 错误', '<p>留言服务暂不可用</p>', [{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			try {
				const messageData = {
					nickname: nickname,
					content: `[游戏内反馈] ${content}`,
					parent_id: null
				};

				const { error } = await window.supabaseClient.from('messages').insert(messageData);

				if (error) throw error;

				// 保存昵称到本地
				localStorage.setItem('graduateSimulator_nickname', nickname);

				// 清除缓存以便下次加载时能看到新留言
				messagesCache = null;

				showModal('✅ 感谢反馈', '<p>你的留言已提交，感谢分享！</p>', [{ text: '确定', class: 'btn-primary', action: closeModal }]);

			} catch (e) {
				console.error('提交反馈失败:', e);
				showModal('❌ 错误', '<p>提交失败，请稍后重试</p>', [{ text: '确定', class: 'btn-primary', action: closeModal }]);
			}
		}

		// ==================== 全局函数暴露（供onclick和其他模块调用）====================
		window.startOnlineTracking = startOnlineTracking;
		window.updateAllStatsDisplay = updateAllStatsDisplay;
		window.getAllStats = getAllStats;
		window.loadMessages = loadMessages;
		window.loadMessagesOnDemand = loadMessagesOnDemand;
		window.postMessage = postMessage;
		window.setReplyTo = setReplyTo;
		window.cancelReply = cancelReply;
		window.changeMessagePage = changeMessagePage;
		window.toggleReplies = toggleReplies;
		window.initMessageBoard = initMessageBoard;
		window.triggerFeedbackEvent = triggerFeedbackEvent;
