// ==================== 文科版音乐音效系统 ====================

// 音效配置
const LA_SOUND_EFFECTS = {
    button_click: { src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=', volume: 0.3 },
    success: { src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=', volume: 0.5 },
    failure: { src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=', volume: 0.4 },
    level_up: { src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=', volume: 0.6 },
    paper_accept: { src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=', volume: 0.5 },
    paper_reject: { src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=', volume: 0.4 },
    achievement: { src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=', volume: 0.6 },
    month_change: { src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=', volume: 0.2 }
};

// 音乐配置
const LA_MUSIC = {
    background: { src: '', volume: 0.3, loop: true },
    ending: { src: '', volume: 0.4, loop: false }
};

// 音频上下文
let audioContext = null;
let isMusicEnabled = false;
let isSoundEnabled = true;

// 初始化音频系统
function initAudioSystem() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.warn('音频系统初始化失败:', e);
    }
}

// 播放音效
function playSound(soundName) {
    if (!isSoundEnabled || !audioContext) return;

    const sound = LA_SOUND_EFFECTS[soundName];
    if (!sound) return;

    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 440;
        oscillator.type = 'sine';

        gainNode.gain.value = sound.volume;
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        // 静默处理
    }
}

// 切换音效
function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    return isSoundEnabled;
}

// 切换音乐
function toggleMusic() {
    isMusicEnabled = !isMusicEnabled;
    return isMusicEnabled;
}

// 显示音频设置
function showAudioSettings() {
    const html = `
        <div style="text-align:center;margin-bottom:15px;">
            <div style="font-size:2rem;margin-bottom:8px;">🔊</div>
            <div style="font-size:1rem;font-weight:600;">音频设置</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--light-bg);border-radius:8px;">
                <span>🔊 音效</span>
                <button class="btn ${isSoundEnabled ? 'btn-success' : 'btn-secondary'}" onclick="toggleSound();showAudioSettings();" style="padding:4px 12px;">
                    ${isSoundEnabled ? '开启' : '关闭'}
                </button>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--light-bg);border-radius:8px;">
                <span>🎵 背景音乐</span>
                <button class="btn ${isMusicEnabled ? 'btn-success' : 'btn-secondary'}" onclick="toggleMusic();showAudioSettings();" style="padding:4px 12px;">
                    ${isMusicEnabled ? '开启' : '关闭'}
                </button>
            </div>
        </div>
    `;

    showModal('🔊 音频设置', html, [
        { text: '关闭', class: 'btn-info', action: closeModal }
    ]);
}

// 全局导出
window.LA_SOUND_EFFECTS = LA_SOUND_EFFECTS;
window.LA_MUSIC = LA_MUSIC;
window.initAudioSystem = initAudioSystem;
window.playSound = playSound;
window.toggleSound = toggleSound;
window.toggleMusic = toggleMusic;
window.showAudioSettings = showAudioSettings;
