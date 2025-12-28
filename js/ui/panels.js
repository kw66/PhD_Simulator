
		// ==================== 面板折叠功能（完整版）====================

		// 折叠状态存储
		const collapseStates = {};

		// 初始化折叠状态（从localStorage读取）
		function initCollapseStates() {
			const saved = localStorage.getItem('graduateSimulator_collapseStates');
			if (saved) {
				try {
					Object.assign(collapseStates, JSON.parse(saved));
				} catch (e) {
					console.warn('读取折叠状态失败:', e);
				}
			}
		}

		// 保存折叠状态
		function saveCollapseStates() {
			localStorage.setItem('graduateSimulator_collapseStates', JSON.stringify(collapseStates));
		}

		// 切换折叠状态
		function toggleCollapse(panelId) {
			const content = document.getElementById(`${panelId}-content`);
			const icon = document.getElementById(`${panelId}-collapse-icon`);
			const panel = document.getElementById(panelId);
			
			if (!content) {
				console.warn(`找不到面板内容: ${panelId}-content`);
				return;
			}
			
			const isCollapsed = content.classList.toggle('collapsed');
			collapseStates[panelId] = isCollapsed;
			
			// 更新图标
			if (icon) {
				icon.classList.toggle('rotated', isCollapsed);
			}
			
			// 更新面板样式
			if (panel) {
				panel.classList.toggle('panel-collapsed', isCollapsed);
			}
			
			saveCollapseStates();
		}

		// 应用保存的折叠状态
		function applyCollapseStates() {
			for (const [panelId, isCollapsed] of Object.entries(collapseStates)) {
				const content = document.getElementById(`${panelId}-content`);
				const icon = document.getElementById(`${panelId}-collapse-icon`);
				const panel = document.getElementById(panelId);
				
				if (content && isCollapsed) {
					content.classList.add('collapsed');
					if (icon) {
						icon.classList.add('rotated');
					}
					if (panel) {
						panel.classList.add('panel-collapsed');
					}
				}
			}
		}

		// 展开所有面板
		function expandAllPanels() {
			const panelIds = ['graduation-panel', 'attributes-panel', 'research-panel', 
							  'log-panel', 'buff-panel', 'action-panel', 'workstation-panel'];
			
			panelIds.forEach(panelId => {
				const content = document.getElementById(`${panelId}-content`);
				const icon = document.getElementById(`${panelId}-collapse-icon`);
				const panel = document.getElementById(panelId);
				
				if (content) {
					content.classList.remove('collapsed');
					collapseStates[panelId] = false;
				}
				if (icon) {
					icon.classList.remove('rotated');
				}
				if (panel) {
					panel.classList.remove('panel-collapsed');
				}
			});
			
			saveCollapseStates();
		}

		// 收起所有面板
		function collapseAllPanels() {
			const panelIds = ['graduation-panel', 'attributes-panel', 'research-panel', 
							  'log-panel', 'buff-panel', 'action-panel', 'workstation-panel'];
			
			panelIds.forEach(panelId => {
				const content = document.getElementById(`${panelId}-content`);
				const icon = document.getElementById(`${panelId}-collapse-icon`);
				const panel = document.getElementById(panelId);
				
				if (content) {
					content.classList.add('collapsed');
					collapseStates[panelId] = true;
				}
				if (icon) {
					icon.classList.add('rotated');
				}
				if (panel) {
					panel.classList.add('panel-collapsed');
				}
			});
			
			saveCollapseStates();
		}

		// 切换全部展开/收起
		let allCollapsed = false;
		function toggleAllPanels() {
			if (allCollapsed) {
				expandAllPanels();
				allCollapsed = false;
				document.getElementById('collapse-all-btn-text').textContent = '收起全部';
				document.getElementById('collapse-all-btn-icon').className = 'fas fa-compress-alt';
			} else {
				collapseAllPanels();
				allCollapsed = true;
				document.getElementById('collapse-all-btn-text').textContent = '展开全部';
				document.getElementById('collapse-all-btn-icon').className = 'fas fa-expand-alt';
			}
		}

		// ==================== 开始页面折叠功能 ====================

		// 开始页面区块折叠状态（每次进入都折叠）
		const startSectionStates = {
			guide: true,
			message: true,
			stats: true
		};

		function initStartSectionStates() {
			// 不再从localStorage读取，每次进入都使用默认折叠状态
		}

		function saveStartSectionStates() {
			// 不再保存状态，每次进入都折叠
		}

		// 懒加载标记
		let statsLoaded = false;
		let messageBoardTriggered = false;

		function toggleStartSection(sectionId) {
			const body = document.getElementById(`${sectionId}-body`);
			const icon = document.getElementById(`${sectionId}-collapse-icon`);
			const header = body?.previousElementSibling;

			if (!body) {
				console.warn(`找不到区块: ${sectionId}-body`);
				return;
			}

			const isCollapsed = body.classList.toggle('collapsed');
			startSectionStates[sectionId] = isCollapsed;

			if (header) {
				header.classList.toggle('collapsed', isCollapsed);
			}

			if (icon) {
				icon.style.transform = isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
			}

			// ★★★ 懒加载：展开时才加载数据 ★★★
			if (!isCollapsed) {
				if (sectionId === 'stats' && !statsLoaded) {
					statsLoaded = true;
					console.log('📊 懒加载全球统计...');
					if (typeof loadGlobalStatsDisplay === 'function') {
						loadGlobalStatsDisplay();
					}
				}
				if (sectionId === 'message' && !messageBoardTriggered) {
					messageBoardTriggered = true;
					console.log('💬 懒加载留言板...');
					if (typeof loadMessagesOnDemand === 'function') {
						loadMessagesOnDemand();
					}
				}
			}
		}

		function applyStartSectionStates() {
			// 每次进入都强制折叠这些区块
			const sectionsToCollapse = ['guide', 'message', 'stats'];

			sectionsToCollapse.forEach(sectionId => {
				const body = document.getElementById(`${sectionId}-body`);
				const icon = document.getElementById(`${sectionId}-collapse-icon`);
				const header = body?.previousElementSibling;

				if (body) {
					body.classList.add('collapsed');
					startSectionStates[sectionId] = true;
					if (header) header.classList.add('collapsed');
					if (icon) icon.style.transform = 'rotate(-90deg)';
				}
			});
		}
	
