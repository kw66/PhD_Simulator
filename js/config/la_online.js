// ==================== 文科版在线统计系统 ====================

// 文科版在线统计配置
const LA_ONLINE_STATS_CONFIG = {
    // 学科分布统计
    disciplineDistribution: true,
    // 学科通关率
    disciplineCompletionRate: true,
    // 学科平均分
    disciplineAverageScore: true,
    // 学科最难结局
    disciplineHardestEnding: true,
    // 学科热门角色
    disciplinePopularCharacter: true,
    // 学科平均游戏时长
    disciplineAveragePlayTime: true
};

// 文科版排行榜配置
const LA_LEADERBOARD_CONFIG = {
    // 总科研分排行
    totalScore: true,
    // 学科内排行
    disciplineScore: true,
    // 速通排行
    speedrun: true,
    // 收集成就排行
    achievements: true,
    // 引用数排行
    citations: true
};

// 记录文科版游戏统计
function recordLiberalArtsStats(gameState, endingType) {
    if (!gameState.discipline) return;

    const stats = {
        discipline: gameState.discipline,
        category: gameState.disciplineCategory,
        character: gameState.character,
        ending: endingType,
        totalScore: gameState.totalScore || 0,
        totalCitations: gameState.totalCitations || 0,
        totalMonths: gameState.totalMonths || 0,
        achievements: (gameState.achievements || []).length,
        isReversed: gameState.isReversed || false,
        timestamp: Date.now()
    };

    // 保存到本地存储
    saveLiberalArtsStats(stats);

    // 如果有在线系统，同步到服务器
    if (typeof recordGameEnd === 'function') {
        recordGameEnd(stats);
    }
}

// 保存文科版统计到本地存储
function saveLiberalArtsStats(stats) {
    try {
        const key = 'la_game_stats';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push(stats);

        // 只保留最近100条记录
        if (existing.length > 100) {
            existing.splice(0, existing.length - 100);
        }

        localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
        console.warn('保存文科版统计失败:', e);
    }
}

// 获取文科版统计
function getLiberalArtsStats() {
    try {
        const key = 'la_game_stats';
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
        console.warn('获取文科版统计失败:', e);
        return [];
    }
}

// 获取学科分布统计
function getDisciplineDistribution() {
    const stats = getLiberalArtsStats();
    const distribution = {};

    stats.forEach(s => {
        if (!distribution[s.discipline]) {
            distribution[s.discipline] = 0;
        }
        distribution[s.discipline]++;
    });

    return distribution;
}

// 获取学科通关率
function getDisciplineCompletionRate() {
    const stats = getLiberalArtsStats();
    const attempts = {};
    const completions = {};

    stats.forEach(s => {
        if (!attempts[s.discipline]) {
            attempts[s.discipline] = 0;
            completions[s.discipline] = 0;
        }
        attempts[s.discipline]++;

        const graduationEndings = ['master', 'excellent_master', 'phd', 'excellent_phd', 'academic_newstar', 'university_teacher', 'field_expert', 'intellectual'];
        if (graduationEndings.includes(s.ending)) {
            completions[s.discipline]++;
        }
    });

    const rates = {};
    for (const discipline in attempts) {
        rates[discipline] = attempts[discipline] > 0 ? (completions[discipline] / attempts[discipline] * 100).toFixed(1) : 0;
    }

    return rates;
}

// 获取学科平均分
function getDisciplineAverageScore() {
    const stats = getLiberalArtsStats();
    const scores = {};

    stats.forEach(s => {
        if (!scores[s.discipline]) {
            scores[s.discipline] = [];
        }
        scores[s.discipline].push(s.totalScore);
    });

    const averages = {};
    for (const discipline in scores) {
        const arr = scores[discipline];
        averages[discipline] = arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0;
    }

    return averages;
}

// 显示文科版统计面板
function showLiberalArtsStatsPanel() {
    const distribution = getDisciplineDistribution();
    const completionRate = getDisciplineCompletionRate();
    const averageScore = getDisciplineAverageScore();

    let html = `
        <div style="max-height:400px;overflow-y:auto;">
            <div style="margin-bottom:15px;">
                <div style="font-weight:600;margin-bottom:8px;">📊 学科分布</div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;">
    `;

    for (const discipline in distribution) {
        const info = getDisciplineById(discipline);
        if (info) {
            html += `<span style="padding:4px 8px;background:var(--light-bg);border-radius:6px;font-size:0.75rem;">${info.icon} ${info.name}: ${distribution[discipline]}次</span>`;
        }
    }

    html += `
                </div>
            </div>
            <div style="margin-bottom:15px;">
                <div style="font-weight:600;margin-bottom:8px;">📈 学科通关率</div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;">
    `;

    for (const discipline in completionRate) {
        const info = getDisciplineById(discipline);
        if (info) {
            html += `<span style="padding:4px 8px;background:var(--light-bg);border-radius:6px;font-size:0.75rem;">${info.icon} ${info.name}: ${completionRate[discipline]}%</span>`;
        }
    }

    html += `
                </div>
            </div>
            <div>
                <div style="font-weight:600;margin-bottom:8px;">🎯 学科平均分</div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;">
    `;

    for (const discipline in averageScore) {
        const info = getDisciplineById(discipline);
        if (info) {
            html += `<span style="padding:4px 8px;background:var(--light-bg);border-radius:6px;font-size:0.75rem;">${info.icon} ${info.name}: ${averageScore[discipline]}分</span>`;
        }
    }

    html += `
                </div>
            </div>
        </div>
    `;

    showModal('📊 文科版统计', html, [
        { text: '关闭', class: 'btn-info', action: closeModal }
    ]);
}

// 全局导出
window.LA_ONLINE_STATS_CONFIG = LA_ONLINE_STATS_CONFIG;
window.LA_LEADERBOARD_CONFIG = LA_LEADERBOARD_CONFIG;
window.recordLiberalArtsStats = recordLiberalArtsStats;
window.getLiberalArtsStats = getLiberalArtsStats;
window.getDisciplineDistribution = getDisciplineDistribution;
window.getDisciplineCompletionRate = getDisciplineCompletionRate;
window.getDisciplineAverageScore = getDisciplineAverageScore;
window.showLiberalArtsStatsPanel = showLiberalArtsStatsPanel;
