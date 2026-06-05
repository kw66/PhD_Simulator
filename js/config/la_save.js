// ==================== 文科版存档系统扩展 ====================

// 文科版存档数据结构
const LA_SAVE_DATA_STRUCTURE = {
    version: '1.0',
    discipline: null,
    disciplineCategory: null,
    gameState: null,
    achievements: [],
    statistics: {},
    timestamp: null
};

// 保存文科版游戏
function saveLiberalArtsGame(slotName = 'auto') {
    if (!gameState || !gameState.discipline) return false;

    const saveData = {
        ...LA_SAVE_DATA_STRUCTURE,
        discipline: gameState.discipline,
        disciplineCategory: gameState.disciplineCategory,
        gameState: { ...gameState },
        achievements: gameState.achievements || [],
        statistics: {
            totalScore: gameState.totalScore || 0,
            totalCitations: gameState.totalCitations || 0,
            publishedPapers: (gameState.publishedPapers || []).length,
            totalMonths: gameState.totalMonths || 0
        },
        timestamp: Date.now()
    };

    try {
        const key = `la_save_${slotName}`;
        localStorage.setItem(key, JSON.stringify(saveData));
        return true;
    } catch (e) {
        console.error('保存游戏失败:', e);
        return false;
    }
}

// 加载文科版游戏
function loadLiberalArtsGame(slotName = 'auto') {
    try {
        const key = `la_save_${slotName}`;
        const data = localStorage.getItem(key);

        if (!data) return null;

        const saveData = JSON.parse(data);

        // 验证存档数据
        if (!saveData.gameState || !saveData.discipline) {
            console.warn('存档数据无效');
            return null;
        }

        return saveData;
    } catch (e) {
        console.error('加载游戏失败:', e);
        return null;
    }
}

// 获取所有存档
function getAllLiberalArtsSaves() {
    const saves = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('la_save_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data && data.gameState) {
                    saves.push({
                        slotName: key.replace('la_save_', ''),
                        discipline: data.discipline,
                        disciplineCategory: data.disciplineCategory,
                        character: data.gameState.characterName,
                        totalScore: data.gameState.totalScore || 0,
                        totalMonths: data.gameState.totalMonths || 0,
                        timestamp: data.timestamp
                    });
                }
            } catch (e) {
                // 忽略无效存档
            }
        }
    }

    return saves.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

// 删除存档
function deleteLiberalArtsSave(slotName) {
    try {
        const key = `la_save_${slotName}`;
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error('删除存档失败:', e);
        return false;
    }
}

// 显示存档管理界面
function showSaveManagement() {
    const saves = getAllLiberalArtsSaves();

    let html = `
        <div style="text-align:center;margin-bottom:15px;">
            <div style="font-size:2rem;margin-bottom:8px;">💾</div>
            <div style="font-size:1rem;font-weight:600;">存档管理</div>
            <div style="font-size:0.8rem;color:var(--text-secondary);">共 ${saves.length} 个存档</div>
        </div>
        <div style="max-height:400px;overflow-y:auto;">
    `;

    if (saves.length === 0) {
        html += '<div style="text-align:center;padding:20px;color:var(--text-secondary);">暂无存档</div>';
    } else {
        saves.forEach(save => {
            const date = save.timestamp ? new Date(save.timestamp).toLocaleString() : '未知时间';
            const disciplineInfo = getDisciplineById(save.discipline);
            const disciplineName = disciplineInfo ? disciplineInfo.name : '未知学科';
            const disciplineIcon = disciplineInfo ? disciplineInfo.icon : '📚';

            const years = Math.floor(save.totalMonths / 12);
            const months = save.totalMonths % 12;
            const durationText = years > 0 ? `${years}年${months}月` : `${months}月`;

            html += `
                <div style="display:flex;align-items:center;gap:10px;padding:10px;margin-bottom:8px;background:var(--light-bg);border-radius:8px;border:1px solid var(--border-color);">
                    <span style="font-size:1.5rem;">${disciplineIcon}</span>
                    <div style="flex:1;">
                        <div style="font-weight:600;font-size:0.9rem;">${disciplineName} - ${save.character}</div>
                        <div style="font-size:0.75rem;color:var(--text-secondary);">
                            科研分: ${save.totalScore} | 时长: ${durationText} | ${date}
                        </div>
                    </div>
                    <div style="display:flex;gap:4px;">
                        <button class="btn btn-primary" onclick="loadSaveAndStart('${save.slotName}')" style="padding:4px 8px;font-size:0.75rem;">
                            加载
                        </button>
                        <button class="btn btn-danger" onclick="confirmDeleteSave('${save.slotName}')" style="padding:4px 8px;font-size:0.75rem;">
                            删除
                        </button>
                    </div>
                </div>
            `;
        });
    }

    html += '</div>';

    showModal('💾 存档管理', html, [
        { text: '关闭', class: 'btn-info', action: closeModal }
    ]);
}

// 加载存档并开始游戏
function loadSaveAndStart(slotName) {
    const saveData = loadLiberalArtsGame(slotName);
    if (!saveData) {
        showModal('❌ 加载失败', '<p>存档数据无效或已损坏！</p>',
            [{ text: '确定', class: 'btn-primary', action: closeModal }]);
        return;
    }

    // 恢复游戏状态
    gameState = saveData.gameState;
    selectedDiscipline = saveData.discipline;
    selectedDisciplineCategory = saveData.disciplineCategory;

    // 应用学科配置
    if (typeof applyDisciplineConfig === 'function') {
        applyDisciplineConfig();
    }

    // 切换到游戏界面
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-screen').style.display = 'block';

    // 更新UI
    if (typeof updateAllUI === 'function') {
        updateAllUI();
    }
    if (typeof renderPaperSlots === 'function') {
        renderPaperSlots();
    }
    if (typeof renderRelationshipPanel === 'function') {
        renderRelationshipPanel();
    }

    addLog('系统', '读档成功', `加载了${slotName}的存档`);
    closeModal();
}

// 确认删除存档
function confirmDeleteSave(slotName) {
    showModal('确认删除', `<p>确定要删除存档 <strong>${slotName}</strong> 吗？</p><p>此操作不可撤销！</p>`,
        [
            { text: '取消', class: 'btn-secondary', action: closeModal },
            { text: '确定删除', class: 'btn-danger', action: () => {
                deleteLiberalArtsSave(slotName);
                closeModal();
                showSaveManagement();
                addLog('系统', '删除存档', `删除了${slotName}的存档`);
            }}
        ]
    );
}

// 全局导出
window.LA_SAVE_DATA_STRUCTURE = LA_SAVE_DATA_STRUCTURE;
window.saveLiberalArtsGame = saveLiberalArtsGame;
window.loadLiberalArtsGame = loadLiberalArtsGame;
window.getAllLiberalArtsSaves = getAllLiberalArtsSaves;
window.deleteLiberalArtsSave = deleteLiberalArtsSave;
window.showSaveManagement = showSaveManagement;
window.loadSaveAndStart = loadSaveAndStart;
window.confirmDeleteSave = confirmDeleteSave;
