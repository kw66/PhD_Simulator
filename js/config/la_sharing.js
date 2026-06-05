// ==================== 文科版社交分享系统 ====================

// 分享平台配置
const LA_SHARING_PLATFORMS = {
    wechat: {
        name: '微信',
        icon: '💬',
        color: '#07C160',
        generateText: (data) => generateShareText(data, 'wechat')
    },
    weibo: {
        name: '微博',
        icon: '📱',
        color: '#E6162D',
        generateText: (data) => generateShareText(data, 'weibo')
    },
    xiaohongshu: {
        name: '小红书',
        icon: '📕',
        color: '#FE2C55',
        generateText: (data) => generateShareText(data, 'xiaohongshu')
    },
    zhihu: {
        name: '知乎',
        icon: '📘',
        color: '#0084FF',
        generateText: (data) => generateShareText(data, 'zhihu')
    }
};

// 生成分享文本
function generateShareText(data, platform) {
    const { discipline, character, ending, totalScore, totalCitations, achievements, totalMonths } = data;

    const disciplineInfo = getDisciplineById(discipline);
    const disciplineName = disciplineInfo ? disciplineInfo.name : '未知学科';
    const disciplineIcon = disciplineInfo ? disciplineInfo.icon : '📚';

    const endingName = LA_ENDING_NAMES[ending] || ending;
    const achievementCount = achievements ? achievements.length : 0;

    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    const durationText = years > 0 ? `${years}年${months > 0 ? months + '个月' : ''}` : `${months}个月`;

    let text = '';

    switch (platform) {
        case 'wechat':
            text = `🎓 我在文科研究生模拟器中${endingName}！\n\n`;
            text += `${disciplineIcon} 学科：${disciplineName}\n`;
            text += `👤 角色：${character}\n`;
            text += `📊 科研分：${totalScore}\n`;
            text += `📚 总引用：${totalCitations}\n`;
            text += `🏆 成就：${achievementCount}个\n`;
            text += `⏱️ 时长：${durationText}\n\n`;
            text += `#文科研究生模拟器 #${disciplineName}`;
            break;

        case 'weibo':
            text = `🎓 我在文科研究生模拟器中${endingName}！${disciplineIcon} ${disciplineName} | 👤 ${character} | 📊 科研分${totalScore} | 📚 引用${totalCitations} | 🏆 ${achievementCount}个成就 | ⏱️ ${durationText} #文科研究生模拟器`;
            break;

        case 'xiaohongshu':
            text = `🎓 文科研究生模拟器通关记录\n\n`;
            text += `✅ 结局：${endingName}\n`;
            text += `${disciplineIcon} 学科：${disciplineName}\n`;
            text += `👤 角色：${character}\n`;
            text += `📊 科研分：${totalScore}\n`;
            text += `📚 总引用：${totalCitations}\n`;
            text += `🏆 成就：${achievementCount}个\n`;
            text += `⏱️ 游戏时长：${durationText}\n\n`;
            text += `这个游戏真的很有意思，模拟了文科研究生的真实生活！推荐给大家～\n\n`;
            text += `#文科研究生模拟器 #${disciplineName} #研究生生活 #学术`;
            break;

        case 'zhihu':
            text = `# 文科研究生模拟器通关记录\n\n`;
            text += `## 基本信息\n`;
            text += `- **结局**：${endingName}\n`;
            text += `- **学科**：${disciplineIcon} ${disciplineName}\n`;
            text += `- **角色**：${character}\n\n`;
            text += `## 游戏数据\n`;
            text += `- **科研分**：${totalScore}\n`;
            text += `- **总引用**：${totalCitations}\n`;
            text += `- **成就数量**：${achievementCount}个\n`;
            text += `- **游戏时长**：${durationText}\n\n`;
            text += `这个游戏很好地模拟了文科研究生的学术生涯，推荐体验。`;
            break;
    }

    return text;
}

// 显示分享弹窗
function showShareModal(gameState, endingType) {
    const shareData = {
        discipline: gameState.discipline,
        character: gameState.characterName,
        ending: endingType,
        totalScore: gameState.totalScore || 0,
        totalCitations: gameState.totalCitations || 0,
        achievements: gameState.achievements || [],
        totalMonths: gameState.totalMonths || 0
    };

    let html = `
        <div style="text-align:center;margin-bottom:15px;">
            <div style="font-size:2rem;margin-bottom:8px;">📤</div>
            <div style="font-size:1rem;font-weight:600;">分享你的研究生生涯</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;">
    `;

    for (const [platform, config] of Object.entries(LA_SHARING_PLATFORMS)) {
        html += `
            <button class="btn" onclick="shareToPlatform('${platform}')" style="
                display:flex;align-items:center;gap:10px;padding:12px;
                background:${config.color}15;border:1px solid ${config.color}40;
                border-radius:8px;cursor:pointer;transition:all 0.2s;
            ">
                <span style="font-size:1.5rem;">${config.icon}</span>
                <span style="font-weight:600;color:${config.color};">分享到${config.name}</span>
            </button>
        `;
    }

    html += `
        </div>
        <div style="margin-top:12px;padding:8px;background:var(--light-bg);border-radius:6px;font-size:0.75rem;color:var(--text-secondary);">
            💡 分享内容将复制到剪贴板，你可以粘贴到对应平台
        </div>
    `;

    showModal('📤 分享', html, [
        { text: '关闭', class: 'btn-info', action: closeModal }
    ]);

    // 保存分享数据到全局
    window.currentShareData = shareData;
}

// 分享到指定平台
function shareToPlatform(platform) {
    const data = window.currentShareData;
    if (!data) return;

    const config = LA_SHARING_PLATFORMS[platform];
    if (!config) return;

    const text = config.generateText(data);

    // 复制到剪贴板
    navigator.clipboard.writeText(text).then(() => {
        showModal('✅ 复制成功', `<p>分享内容已复制到剪贴板！</p><p>请打开<strong>${config.name}</strong>粘贴发布。</p>`,
            [{ text: '确定', class: 'btn-primary', action: closeModal }]);
    }).catch(() => {
        // 如果clipboard API不可用，使用传统方法
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        showModal('✅ 复制成功', `<p>分享内容已复制到剪贴板！</p><p>请打开<strong>${config.name}</strong>粘贴发布。</p>`,
            [{ text: '确定', class: 'btn-primary', action: closeModal }]);
    });
}

// 全局导出
window.LA_SHARING_PLATFORMS = LA_SHARING_PLATFORMS;
window.generateShareText = generateShareText;
window.showShareModal = showShareModal;
window.shareToPlatform = shareToPlatform;
