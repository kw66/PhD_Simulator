// ==================== 文科版学术年会事件 ====================

// 文科版学术年会地点
const LA_CONFERENCE_LOCATIONS = ['北京', '上海', '南京', '武汉', '成都', '广州', '西安', '杭州'];

// 文科版学科年会名称
const LA_ANNUAL_CONFERENCE_NAMES = {
    chinese: '中国语言文学学会年会',
    history: '中国历史学年会',
    philosophy: '中国哲学年会',
    foreign_lang: '中国外国文学学会年会',
    journalism: '中国新闻传播学年会',
    information: '中国图书馆学情报学年会',
    sociology: '中国社会学年会',
    education: '中国教育学年会'
};

// 获取文科版年会名称
function getLAConferenceName() {
    const discipline = gameState.discipline;
    if (discipline && LA_ANNUAL_CONFERENCE_NAMES[discipline]) {
        return LA_ANNUAL_CONFERENCE_NAMES[discipline];
    }
    return '全国学术年会';
}

// 文科版学术年会事件
function triggerLiberalArtsConferenceEvent() {
    const year = gameState.year;
    const location = LA_CONFERENCE_LOCATIONS[(year - 1) % LA_CONFERENCE_LOCATIONS.length];
    const conferenceName = getLAConferenceName();
    const realYear = getRealYear(year, 9);

    const advisorPayText = gameState.favor < 6 ? '👨‍🏫 导师报销（好感<6：好感-1）' : '👨‍🏫 导师报销（好感≥6：免费）';

    showModal(`🏛️ ${conferenceName}`,
        `<div style="text-align:center;margin-bottom:15px;">
            <div style="font-size:2rem;margin-bottom:10px;">📚</div>
            <div style="font-size:1.1rem;font-weight:600;color:var(--primary-color);">${conferenceName} ${realYear}</div>
            <div style="font-size:0.9rem;margin-top:8px;">📍 ${location}</div>
        </div>
        <p>一年一度的学术年会即将在<strong>${location}</strong>举办，是否参加？</p>`,
        [
            { text: '❌ 不去参加', class: 'btn-info', action: () => {
                addLog('学术年会', `不参加${conferenceName}`, '无事发生');
                closeModal();
                updateAllUI();
            }},
            { text: advisorPayText, class: 'btn-primary', action: () => {
                closeModal();
                if (gameState.favor >= 6) {
                    addLog('学术年会', `导师报销参加${conferenceName}`, '导师爽快答应');
                    setTimeout(() => showLiberalArtsConferenceActivityModal(location, conferenceName), 200);
                } else {
                    addLog('学术年会', `导师报销参加${conferenceName}`, '导师略有不满，好感度-1');
                    if (changeFavor(-1)) {
                        setTimeout(() => showLiberalArtsConferenceActivityModal(location, conferenceName), 200);
                    }
                }
            }},
            { text: '💰 自费前往（金钱-2）', class: 'btn-warning', action: () => {
                addLog('学术年会', `自费参加${conferenceName}`, '金币-2');
                closeModal();
                if (changeGold(-2)) {
                    setTimeout(() => showLiberalArtsConferenceActivityModal(location, conferenceName), 200);
                }
            }}
        ]
    );
}

// 文科版学术年会活动弹窗
function showLiberalArtsConferenceActivityModal(location, conferenceName) {
    showModal('📚 学术年会活动',
        `<div style="text-align:center;margin-bottom:15px;">
            <div style="font-size:1.5rem;margin-bottom:8px;">📍 ${location}</div>
            <div style="font-size:0.9rem;color:var(--text-secondary);">${conferenceName}</div>
        </div>
        <p>你来到了<strong>${location}</strong>参加学术年会，在会议期间你打算：</p>`,
        [
            { text: '📚 认真听报告（下次选题+5，永久选题+1）', class: 'btn-primary', action: () => {
                gameState.buffs.temporary.push({
                    type: 'idea_bonus',
                    name: '下次选题分数+5',
                    value: 5,
                    permanent: false
                });
                gameState.buffs.permanent.push({
                    type: 'idea_bonus',
                    name: '每次选题分数+1',
                    value: 1,
                    permanent: true
                });
                addLog('年会活动', '认真听报告', '临时buff-下次选题分数+5，永久buff-每次选题分数+1');
                closeModal();
                updateBuffs();
                updateAllUI();
            }},
            { text: '🏖️ 趁机旅游（SAN+6）', class: 'btn-success', action: () => {
                addLog('年会活动', `在${location}趁机旅游`, 'SAN值+6');
                closeModal();
                changeSan(6);
            }},
            { text: '🍜 请同学品尝美食（金钱-2，SAN+2，社交+1）', class: 'btn-warning', action: () => {
                closeModal();
                if (changeGold(-2)) {
                    gameState.san = Math.min(gameState.sanMax, gameState.san + 2);
                    changeSocial(1);
                    addLog('年会活动', `请同学品尝${location}美食`, '金币-2，SAN值+2，社交能力+1');
                    updateAllUI();
                }
            }}
        ]
    );
}

// 全局导出
window.LA_CONFERENCE_LOCATIONS = LA_CONFERENCE_LOCATIONS;
window.LA_ANNUAL_CONFERENCE_NAMES = LA_ANNUAL_CONFERENCE_NAMES;
window.getLAConferenceName = getLAConferenceName;
window.triggerLiberalArtsConferenceEvent = triggerLiberalArtsConferenceEvent;
window.showLiberalArtsConferenceActivityModal = showLiberalArtsConferenceActivityModal;
