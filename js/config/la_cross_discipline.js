// ==================== 文科版跨学科成就系统 ====================

// 跨学科成就
const LA_CROSS_DISCIPLINE_ACHIEVEMENTS = [
    {
        id: 'cross_discipline_2',
        name: '🌍 学科跨界',
        icon: '🌍',
        desc: '在2个不同学科通关',
        condition: (stats) => {
            const disciplines = new Set(stats.map(s => s.discipline));
            return disciplines.size >= 2;
        },
        reward: { achievementCoins: 3 }
    },
    {
        id: 'cross_discipline_3',
        name: '📚 博学之士',
        icon: '📚',
        desc: '在3个不同学科通关',
        condition: (stats) => {
            const disciplines = new Set(stats.map(s => s.discipline));
            return disciplines.size >= 3;
        },
        reward: { achievementCoins: 5 }
    },
    {
        id: 'cross_discipline_all',
        name: '🏆 全科学霸',
        icon: '🏆',
        desc: '在所有8个学科通关',
        condition: (stats) => {
            const disciplines = new Set(stats.map(s => s.discipline));
            return disciplines.size >= 8;
        },
        reward: { achievementCoins: 10 }
    },
    {
        id: 'both_modes',
        name: '🔄 正反通吃',
        icon: '🔄',
        desc: '同一学科正位和逆位都通关',
        condition: (stats) => {
            const disciplineModes = {};
            stats.forEach(s => {
                if (!disciplineModes[s.discipline]) {
                    disciplineModes[s.discipline] = { normal: false, reversed: false };
                }
                if (s.isReversed) {
                    disciplineModes[s.discipline].reversed = true;
                } else {
                    disciplineModes[s.discipline].normal = true;
                }
            });
            return Object.values(disciplineModes).some(m => m.normal && m.reversed);
        },
        reward: { achievementCoins: 5 }
    },
    {
        id: 'all_characters',
        name: '🎭 千面学者',
        icon: '🎭',
        desc: '使用6个不同角色通关',
        condition: (stats) => {
            const characters = new Set(stats.map(s => s.character));
            return characters.size >= 6;
        },
        reward: { achievementCoins: 8 }
    },
    {
        id: 'speedrun',
        name: '⚡ 速通达人',
        icon: '⚡',
        desc: '在24个月内通关',
        condition: (stats) => {
            return stats.some(s => s.totalMonths <= 24);
        },
        reward: { achievementCoins: 5 }
    },
    {
        id: 'high_score',
        name: '📊 科研达人',
        icon: '📊',
        desc: '科研分达到20',
        condition: (stats) => {
            return stats.some(s => s.totalScore >= 20);
        },
        reward: { achievementCoins: 3 }
    },
    {
        id: 'high_citations',
        name: '📚 引用大佬',
        icon: '📚',
        desc: '总引用达到1000',
        condition: (stats) => {
            return stats.some(s => s.totalCitations >= 1000);
        },
        reward: { achievementCoins: 5 }
    },
    {
        id: 'achievement_collector',
        name: '🏆 成就收集者',
        icon: '🏆',
        desc: '单局获得10个以上成就',
        condition: (stats) => {
            return stats.some(s => s.achievements >= 10);
        },
        reward: { achievementCoins: 5 }
    },
    {
        id: 'humanities_master',
        name: '📖 人文学科大师',
        icon: '📖',
        desc: '在所有人文学科（中文、历史、哲学、外语）通关',
        condition: (stats) => {
            const humanities = ['chinese', 'history', 'philosophy', 'foreign_lang'];
            const completed = new Set(stats.filter(s => humanities.includes(s.discipline)).map(s => s.discipline));
            return completed.size >= 4;
        },
        reward: { achievementCoins: 8 }
    },
    {
        id: 'social_science_master',
        name: '📊 社会学科大师',
        icon: '📊',
        desc: '在所有社会学科（新传、信管、社会学、教育学）通关',
        condition: (stats) => {
            const socialScience = ['journalism', 'information', 'sociology', 'education'];
            const completed = new Set(stats.filter(s => socialScience.includes(s.discipline)).map(s => s.discipline));
            return completed.size >= 4;
        },
        reward: { achievementCoins: 8 }
    }
];

// 检查跨学科成就
function checkCrossDisciplineAchievements() {
    const stats = getLiberalArtsStats();
    if (!stats || stats.length === 0) return [];

    const achieved = [];

    LA_CROSS_DISCIPLINE_ACHIEVEMENTS.forEach(achievement => {
        if (achievement.condition(stats)) {
            achieved.push(achievement);
        }
    });

    return achieved;
}

// 显示跨学科成就面板
function showCrossDisciplineAchievements() {
    const stats = getLiberalArtsStats();
    const achieved = checkCrossDisciplineAchievements();

    let html = `
        <div style="text-align:center;margin-bottom:15px;">
            <div style="font-size:2rem;margin-bottom:8px;">🏆</div>
            <div style="font-size:1rem;font-weight:600;">跨学科成就</div>
            <div style="font-size:0.8rem;color:var(--text-secondary);">已达成: ${achieved.length}/${LA_CROSS_DISCIPLINE_ACHIEVEMENTS.length}</div>
        </div>
        <div style="max-height:400px;overflow-y:auto;">
    `;

    LA_CROSS_DISCIPLINE_ACHIEVEMENTS.forEach(achievement => {
        const isAchieved = achieved.some(a => a.id === achievement.id);
        const statusColor = isAchieved ? 'var(--success-color)' : 'var(--text-secondary)';
        const statusIcon = isAchieved ? '✅' : '🔒';

        html += `
            <div style="display:flex;align-items:center;gap:10px;padding:10px;margin-bottom:8px;background:${isAchieved ? 'rgba(16,185,129,0.1)' : 'var(--light-bg)'};border-radius:8px;border:1px solid ${isAchieved ? 'rgba(16,185,129,0.3)' : 'var(--border-color)'};">
                <span style="font-size:1.5rem;">${achievement.icon}</span>
                <div style="flex:1;">
                    <div style="font-weight:600;font-size:0.9rem;color:${statusColor};">${achievement.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-secondary);">${achievement.desc}</div>
                </div>
                <span style="font-size:1.2rem;">${statusIcon}</span>
            </div>
        `;
    });

    html += '</div>';

    showModal('🏆 跨学科成就', html, [
        { text: '关闭', class: 'btn-info', action: closeModal }
    ]);
}

// 全局导出
window.LA_CROSS_DISCIPLINE_ACHIEVEMENTS = LA_CROSS_DISCIPLINE_ACHIEVEMENTS;
window.checkCrossDisciplineAchievements = checkCrossDisciplineAchievements;
window.showCrossDisciplineAchievements = showCrossDisciplineAchievements;
