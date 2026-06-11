// ==================== 文科版移动端优化系统 ====================

// 移动端检测
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           window.innerWidth <= 768;
}

// 触摸滑动支持
function initTouchSwipe(element, onSwipeLeft, onSwipeRight) {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;

    element.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;

        const diffX = startX - endX;
        const diffY = startY - endY;

        // 水平滑动距离大于垂直滑动距离，且水平滑动距离大于50px
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0 && onSwipeLeft) {
                onSwipeLeft();
            } else if (diffX < 0 && onSwipeRight) {
                onSwipeRight();
            }
        }
    }, { passive: true });
}

// 长按支持
function initLongPress(element, callback, duration = 500) {
    let timer = null;

    element.addEventListener('touchstart', (e) => {
        timer = setTimeout(() => {
            callback(e);
        }, duration);
    }, { passive: true });

    element.addEventListener('touchend', () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }, { passive: true });

    element.addEventListener('touchmove', () => {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }, { passive: true });
}

// 移动端适配样式
function applyMobileStyles() {
    if (!isMobileDevice()) return;
    if (document.getElementById('la-mobile-styles')) return; // 防重复注入

    const style = document.createElement('style');
    style.id = 'la-mobile-styles';
    style.textContent = `
        @media (max-width: 768px) {
            .game-container {
                flex-direction: column !important;
            }

            .left-column, .middle-column, .right-column, .rightmost-column {
                width: 100% !important;
                max-width: 100% !important;
            }

            .panel {
                margin-bottom: 10px;
            }

            .action-grid {
                grid-template-columns: repeat(3, 1fr) !important;
            }

            .modal {
                width: 95% !important;
                max-width: 95% !important;
                margin: 10px auto !important;
            }

            .discipline-card {
                min-width: 100% !important;
            }

            .category-header {
                font-size: 0.85rem !important;
            }

            .slide-content {
                padding: 15px !important;
            }

            .slide-title {
                font-size: 1.2rem !important;
            }
        }
    `;

    document.head.appendChild(style);
}

// 移动端快捷操作
function initMobileQuickActions() {
    if (!isMobileDevice()) return;

    // 添加移动端快捷按钮
    const quickBar = document.getElementById('mobile-quick-bar');
    if (quickBar) {
        quickBar.style.display = 'flex';
    }
}

// 初始化移动端优化
function initMobileOptimization() {
    applyMobileStyles();
    initMobileQuickActions();

    // 添加触摸滑动支持
    const slidesContainer = document.querySelector('.slides-container');
    if (slidesContainer) {
        initTouchSwipe(slidesContainer,
            () => { if (typeof nextSlide === 'function') nextSlide(); },
            () => { if (typeof prevSlide === 'function') prevSlide(); }
        );
    }
}

// 全局导出
window.isMobileDevice = isMobileDevice;
window.initTouchSwipe = initTouchSwipe;
window.initLongPress = initLongPress;
window.applyMobileStyles = applyMobileStyles;
window.initMobileQuickActions = initMobileQuickActions;
window.initMobileOptimization = initMobileOptimization;
