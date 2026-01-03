// ==================== UI特效系统 ====================

// ==================== 1. 按钮涟漪效果 ====================
function createRipple(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';

    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    button.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
        ripple.remove();
    });
}

// 为所有按钮添加涟漪效果
function initRippleEffects() {
    const buttons = document.querySelectorAll('.btn, .action-btn, .utility-btn, .guide-btn, .submit-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', createRipple);
    });
}

// ==================== 2. 月份切换动画 ====================
let lastMonth = null;
let lastYear = null;

function animateMonthChange(newMonth, newYear) {
    const monthEl = document.querySelector('.time-month');
    const yearEl = document.querySelector('.time-year');

    if (monthEl && newMonth !== lastMonth) {
        monthEl.classList.add('month-flip');
        setTimeout(() => monthEl.classList.remove('month-flip'), 600);
        lastMonth = newMonth;
    }

    if (yearEl && newYear !== lastYear) {
        yearEl.classList.add('year-flip');
        setTimeout(() => yearEl.classList.remove('year-flip'), 600);
        lastYear = newYear;
    }
}

// ==================== 3. 论文发表庆祝效果 ====================

// B类论文 - 银色光芒
function celebrateBPaper() {
    const container = document.getElementById('celebration-particles');
    if (!container) return;

    const particleCount = 15;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'celebration-particle silver-burst';

        const angle = (Math.PI * 2 / particleCount) * i;
        const distance = 60 + Math.random() * 50;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        container.appendChild(particle);

        setTimeout(() => particle.remove(), 1200);
    }
}

// C类论文 - 绿色光点
function celebrateCPaper() {
    const container = document.getElementById('celebration-particles');
    if (!container) return;

    const particleCount = 10;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'celebration-particle green-burst';

        const angle = (Math.PI * 2 / particleCount) * i;
        const distance = 40 + Math.random() * 40;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;

        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');

        container.appendChild(particle);

        setTimeout(() => particle.remove(), 1000);
    }
}

// ==================== 4. 成就解锁特效 ====================
function celebrateAchievement(achievementName) {
    const container = document.getElementById('celebration-particles');
    if (!container) return;

    // 创建成就徽章弹出
    const badge = document.createElement('div');
    badge.className = 'achievement-popup';
    badge.innerHTML = `
        <div class="achievement-popup-icon">🏆</div>
        <div class="achievement-popup-text">
            <div class="achievement-popup-title">成就解锁!</div>
            <div class="achievement-popup-name">${achievementName}</div>
        </div>
    `;

    container.appendChild(badge);

    // 添加光芒粒子
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const spark = document.createElement('div');
            spark.className = 'achievement-spark';
            const angle = (Math.PI * 2 / 12) * i;
            const distance = 80 + Math.random() * 40;
            spark.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            spark.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
            spark.style.left = '50%';
            spark.style.top = '50%';
            badge.appendChild(spark);
            setTimeout(() => spark.remove(), 800);
        }, i * 50);
    }

    // 移除徽章
    setTimeout(() => {
        badge.classList.add('achievement-popup-exit');
        setTimeout(() => badge.remove(), 500);
    }, 3000);
}

// ==================== 5. 人际关系特效 ====================

// 好感度变化时头像发光
function glowRelationshipAvatar(slotElement, isPositive) {
    if (!slotElement) return;

    const avatar = slotElement.querySelector('.relationship-avatar');
    if (!avatar) return;

    const glowClass = isPositive ? 'avatar-glow-positive' : 'avatar-glow-negative';
    avatar.classList.add(glowClass);

    setTimeout(() => avatar.classList.remove(glowClass), 1000);
}

// 关系升级心形粒子
function celebrateRelationshipUp(slotElement) {
    if (!slotElement) return;

    const rect = slotElement.getBoundingClientRect();
    const container = document.getElementById('celebration-particles');
    if (!container) return;

    const hearts = ['💕', '💗', '💖', '❤️', '💓'];

    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart-particle';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = (rect.left + rect.width / 2 + (Math.random() - 0.5) * 60) + 'px';
            heart.style.top = (rect.top + rect.height / 2) + 'px';

            container.appendChild(heart);

            setTimeout(() => heart.remove(), 1500);
        }, i * 100);
    }
}

// ==================== 初始化 ====================
function initUIEffects() {
    // 延迟初始化，确保DOM加载完成
    setTimeout(() => {
        initRippleEffects();
    }, 500);

    // 监听动态添加的按钮
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    const buttons = node.querySelectorAll ?
                        node.querySelectorAll('.btn, .action-btn, .utility-btn, .guide-btn, .submit-btn') : [];
                    buttons.forEach(btn => {
                        btn.addEventListener('click', createRipple);
                    });
                    // 如果节点本身就是按钮
                    if (node.matches && node.matches('.btn, .action-btn, .utility-btn, .guide-btn, .submit-btn')) {
                        node.addEventListener('click', createRipple);
                    }
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// 页面加载时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUIEffects);
} else {
    initUIEffects();
}

// 导出函数供其他模块使用
window.UIEffects = {
    createRipple,
    animateMonthChange,
    celebrateBPaper,
    celebrateCPaper,
    celebrateAchievement,
    glowRelationshipAvatar,
    celebrateRelationshipUp
};
