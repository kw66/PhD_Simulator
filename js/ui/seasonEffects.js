// ==================== 季节主题系统 ====================

// 季节配置
const SeasonConfig = {
    spring: {
        months: [3, 4, 5],
        particles: ['🌸', '🌷', '🌺'],
        academicSymbols: ['🔬', '📚', '🎓', '💡'],
        className: 'season-spring',
        particleClass: 'particle-spring'
    },
    summer: {
        months: [6, 7, 8],
        particles: [], // 使用光斑效果，不用emoji
        academicSymbols: ['📖', '🧪', '📝', '🎓'],
        className: 'season-summer',
        particleClass: 'particle-summer'
    },
    autumn: {
        months: [9, 10, 11],
        particles: ['🍂', '🍁', '🍃'],
        academicSymbols: ['🔬', '⚗️', '📚', '🎓'],
        className: 'season-autumn',
        particleClass: 'particle-autumn'
    },
    winter: {
        months: [12, 1, 2],
        particles: ['❄', '❅', '❆'],
        academicSymbols: ['🧪', '📖', '💡', '🎓'],
        className: 'season-winter',
        particleClass: 'particle-winter'
    }
};

// 当前季节
let currentSeason = null;
let particleInterval = null;
let activeParticles = [];
const MAX_PARTICLES = 15;

// 移动端检测
function isMobileDevice() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 开始页面科研符号配置
const StartPageSymbols = ['🔬', '📚', '🎓', '💡', '📖', '🧪', '⚗️', '📝', '🔭', '💻', '📊', '🧬'];
const RainbowColors = [
    '#ff6b6b', // 红
    '#ff9f43', // 橙
    '#feca57', // 黄
    '#48dbfb', // 青
    '#0abde3', // 蓝
    '#5f27cd', // 紫
    '#ff6b9d', // 粉
    '#10ac84', // 绿
    '#ee5a24', // 橙红
    '#3498db'  // 天蓝
];
let startPageParticleInterval = null;

// 获取季节
function getSeason(month) {
    // 游戏中月份1-12对应实际月份
    // 入学是9月，所以月份1=9月（秋季）
    const realMonth = ((month - 1 + 8) % 12) + 1; // 将游戏月份转换为实际月份

    for (const [season, config] of Object.entries(SeasonConfig)) {
        if (config.months.includes(realMonth)) {
            return season;
        }
    }
    return 'autumn'; // 默认秋季
}

// 初始化粒子容器
function initParticleContainers() {
    // 季节粒子容器
    if (!document.getElementById('season-particles')) {
        const container = document.createElement('div');
        container.id = 'season-particles';
        document.body.insertBefore(container, document.body.firstChild);
    }

    // 庆祝粒子容器
    if (!document.getElementById('celebration-particles')) {
        const container = document.createElement('div');
        container.id = 'celebration-particles';
        document.body.appendChild(container);
    }
}

// 更新季节主题
function updateSeasonTheme(gameMonth) {
    const newSeason = getSeason(gameMonth);

    if (newSeason !== currentSeason) {
        // 移除旧季节类
        if (currentSeason) {
            document.body.classList.remove(SeasonConfig[currentSeason].className);
        }

        // 添加新季节类
        document.body.classList.add(SeasonConfig[newSeason].className);
        currentSeason = newSeason;

        // 清除旧粒子
        clearParticles();

        // 启动新粒子效果
        startParticleEffect(newSeason);
    }
}

// 清除所有粒子
function clearParticles() {
    const container = document.getElementById('season-particles');
    if (container) {
        container.innerHTML = '';
    }
    activeParticles = [];

    if (particleInterval) {
        clearInterval(particleInterval);
        particleInterval = null;
    }
}

// 创建单个粒子（游戏界面 - 只有季节粒子，无学术符号）
function createParticle(season) {
    const config = SeasonConfig[season];
    const container = document.getElementById('season-particles');
    if (!container) return;

    // 如果该季节没有粒子（如夏季），则跳过
    if (config.particles.length === 0) return;

    const particle = document.createElement('div');
    particle.className = 'season-particle';
    particle.classList.add(config.particleClass);
    particle.textContent = config.particles[Math.floor(Math.random() * config.particles.length)];

    // 随机位置
    particle.style.left = Math.random() * 100 + '%';
    // 从顶部开始，直接下落
    particle.style.top = '-30px';
    // 随机动画时长（8-14秒）
    const animDuration = 8 + Math.random() * 6;
    particle.style.animationDuration = animDuration + 's';

    container.appendChild(particle);
    activeParticles.push(particle);

    // 动画结束后移除
    const removeDelay = animDuration * 1000 + 500;
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
        const index = activeParticles.indexOf(particle);
        if (index > -1) {
            activeParticles.splice(index, 1);
        }
    }, removeDelay);
}

// 启动粒子效果
function startParticleEffect(season) {
    // 移动端不显示季节粒子效果
    if (isMobileDevice()) {
        return;
    }

    // 初始创建几个粒子
    for (let i = 0; i < 5; i++) {
        setTimeout(() => createParticle(season), i * 500);
    }

    // 定期创建新粒子
    particleInterval = setInterval(() => {
        if (activeParticles.length < MAX_PARTICLES) {
            createParticle(season);
        }
    }, 2000);
}

// ==================== 开始页面效果 ====================

// 清除所有季节效果（返回开始页面时调用）
function clearSeasonEffects() {
    // 移除季节类
    if (currentSeason) {
        document.body.classList.remove(SeasonConfig[currentSeason].className);
        currentSeason = null;
    }
    // 清除粒子
    clearParticles();
}

// 创建开始页面科研符号粒子（随机位置浮动效果，只在蓝色背景区域）
function createStartPageParticle() {
    const container = document.getElementById('season-particles');
    if (!container) return;

    const particle = document.createElement('div');
    particle.className = 'season-particle particle-startpage';
    particle.textContent = StartPageSymbols[Math.floor(Math.random() * StartPageSymbols.length)];

    // 随机彩虹颜色
    const color = RainbowColors[Math.floor(Math.random() * RainbowColors.length)];
    particle.style.color = color;
    particle.style.textShadow = `0 0 8px ${color}, 0 0 15px ${color}40`;

    // 只在左右两侧边缘区域生成（避开中心白色卡片区域和上下区域）
    // 随机选择出现在左侧或右侧
    const zone = Math.floor(Math.random() * 2);
    let left, top;

    if (zone === 0) {
        // 左侧区域
        left = Math.random() * 10;
        top = 10 + Math.random() * 80;
    } else {
        // 右侧区域
        left = 90 + Math.random() * 10;
        top = 10 + Math.random() * 80;
    }

    particle.style.left = left + '%';
    particle.style.top = top + '%';

    // 随机动画时长（4-8秒）
    const animDuration = 4 + Math.random() * 4;
    particle.style.animationDuration = animDuration + 's';
    // 随机延迟，让粒子不同步
    particle.style.animationDelay = (Math.random() * 2) + 's';

    container.appendChild(particle);
    activeParticles.push(particle);

    // 动画循环后移除并创建新的
    const removeDelay = (animDuration + 2) * 1000 * 2;
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
        const index = activeParticles.indexOf(particle);
        if (index > -1) {
            activeParticles.splice(index, 1);
        }
    }, removeDelay);
}

// 启动开始页面粒子效果
function startStartPageParticles() {
    // 先清除所有季节效果
    clearSeasonEffects();

    // 移动端不显示粒子效果
    if (isMobileDevice()) {
        return;
    }

    // 停止之前的开始页面粒子
    if (startPageParticleInterval) {
        clearInterval(startPageParticleInterval);
    }

    // 初始创建更多粒子（立即显示效果）
    for (let i = 0; i < 8; i++) {
        setTimeout(() => createStartPageParticle(), i * 300);
    }

    // 定期创建新粒子
    startPageParticleInterval = setInterval(() => {
        if (activeParticles.length < MAX_PARTICLES) {
            createStartPageParticle();
        }
    }, 1500);
}

// 停止开始页面粒子效果（进入游戏时调用）
function stopStartPageParticles() {
    if (startPageParticleInterval) {
        clearInterval(startPageParticleInterval);
        startPageParticleInterval = null;
    }
    clearParticles();
}

// ==================== 庆祝特效 ====================

// 金色粒子爆发（论文中稿）
function celebrateGoldBurst(x, y) {
    const container = document.getElementById('celebration-particles');
    if (!container) return;

    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'celebration-particle celebration-gold';

        // 随机方向
        const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.5;
        const distance = 80 + Math.random() * 60;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.left = (x || window.innerWidth / 2) + 'px';
        particle.style.top = (y || window.innerHeight / 2) + 'px';
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        container.appendChild(particle);

        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1500);
    }
}

// 全屏撒花彩带（Best Paper）
function celebrateConfetti() {
    const container = document.getElementById('celebration-particles');
    if (!container) return;

    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6', '#e91e63'];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'celebration-particle celebration-confetti';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = '-20px';
            particle.style.animationDuration = (2 + Math.random() * 2) + 's';

            container.appendChild(particle);

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 4000);
        }, i * 50);
    }
}

// 学士帽抛起（毕业）
function celebrateGraduation() {
    const container = document.getElementById('celebration-particles');
    if (!container) return;

    const hatCount = 8;

    for (let i = 0; i < hatCount; i++) {
        setTimeout(() => {
            const hat = document.createElement('div');
            hat.className = 'celebration-particle graduation-hat';
            hat.textContent = '🎓';
            hat.style.left = (15 + Math.random() * 70) + '%';
            hat.style.bottom = '20%';
            hat.style.animationDelay = Math.random() * 0.3 + 's';

            container.appendChild(hat);

            setTimeout(() => {
                if (hat.parentNode) {
                    hat.parentNode.removeChild(hat);
                }
            }, 2500);
        }, i * 150);
    }

    // 同时撒花
    celebrateConfetti();
}

// A类论文金光闪烁
function celebrateAPaper() {
    celebrateGoldBurst();
}

// 初始化
function initSeasonEffects() {
    initParticleContainers();

    // 如果在开始页面，显示数学符号粒子
    const startScreen = document.getElementById('start-screen');
    const gameScreen = document.getElementById('game-screen');

    // 检测是否在开始页面：开始页面存在且没有hidden类，或者游戏界面不显示
    const isStartPage = startScreen && !startScreen.classList.contains('hidden');
    const isGameHidden = !gameScreen || gameScreen.style.display === 'none' || gameScreen.style.display === '';

    if (isStartPage || isGameHidden) {
        // 在开始页面，启动科研符号粒子
        startStartPageParticles();
    } else if (typeof gameState !== 'undefined' && gameState.month) {
        // 如果游戏已经开始，应用季节主题
        updateSeasonTheme(gameState.month);
    }
}

// 页面加载时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSeasonEffects);
} else {
    initSeasonEffects();
}

// 导出函数供其他模块使用
window.SeasonEffects = {
    updateTheme: updateSeasonTheme,
    celebrateGoldBurst,
    celebrateConfetti,
    celebrateGraduation,
    celebrateAPaper,
    clearParticles,
    clearSeasonEffects,
    startStartPageParticles,
    stopStartPageParticles
};
