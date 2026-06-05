const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false }); // 有头模式，方便观察
    const page = await browser.newPage();

    // 监听控制台输出
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (type === 'error') {
            console.log(`[ERROR] ${text}`);
        } else if (text.includes('❌') || text.includes('错误')) {
            console.log(`[WARN] ${text}`);
        } else if (text.includes('✅') || text.includes('🔧') || text.includes('🚀')) {
            console.log(`[INFO] ${text}`);
        }
    });

    // 监听页面错误
    page.on('pageerror', error => {
        console.log(`[PAGE ERROR] ${error.message}`);
    });

    console.log('=== 开始测试文科版研究生模拟器 ===\n');

    // 1. 打开页面
    console.log('1. 打开页面...');
    await page.goto('http://localhost:8080/index_liberal_arts.html');
    await page.waitForTimeout(2000);

    // 2. 检查页面标题
    const title = await page.title();
    console.log(`   页面标题: ${title}`);

    // 3. 检查学科选择是否存在
    const disciplineSection = await page.$('#discipline-section');
    console.log(`   学科选择区域: ${disciplineSection ? '存在' : '不存在'}`);

    // 4. 点击人文学科
    console.log('\n2. 选择学科...');
    const humanitiesBtn = await page.$('text=人文学科');
    if (humanitiesBtn) {
        await humanitiesBtn.click();
        await page.waitForTimeout(500);
        console.log('   ✅ 点击人文学科');
    }

    // 5. 选择中国语言文学
    const chineseBtn = await page.$('text=中国语言文学');
    if (chineseBtn) {
        await chineseBtn.click();
        await page.waitForTimeout(500);
        console.log('   ✅ 选择中国语言文学');
    }

    // 6. 选择角色
    console.log('\n3. 选择角色...');
    const characterCards = await page.$$('.character-card');
    if (characterCards.length > 0) {
        await characterCards[0].click();
        await page.waitForTimeout(500);
        console.log(`   ✅ 选择角色 (共${characterCards.length}个可选)`);
    }

    // 7. 点击开始按钮
    console.log('\n4. 点击开始按钮...');
    const startBtn = await page.$('#start-btn');
    if (startBtn) {
        await startBtn.click();
        console.log('   ✅ 点击开始按钮');
    }

    // 8. 等待游戏加载
    await page.waitForTimeout(3000);

    // 9. 检查是否弹出导师选择
    console.log('\n5. 检查导师选择弹窗...');
    const modal = await page.$('#modal');
    const modalTitle = await page.$('#modal-title');
    if (modalTitle) {
        const titleText = await modalTitle.textContent();
        console.log(`   弹窗标题: ${titleText}`);
        if (titleText.includes('导师')) {
            console.log('   ✅ 导师选择弹窗已显示!');
        }
    } else {
        console.log('   ❌ 未找到弹窗');
    }

    // 10. 检查游戏界面
    console.log('\n6. 检查游戏界面...');
    const gameScreen = await page.$('#game-screen');
    if (gameScreen) {
        const isVisible = await gameScreen.isVisible();
        console.log(`   游戏界面: ${isVisible ? '可见' : '隐藏'}`);
    }

    // 11. 检查操作按钮
    console.log('\n7. 检查操作按钮...');
    const buttons = ['btn-read', 'btn-idea', 'btn-experiment', 'btn-write'];
    for (const btnId of buttons) {
        const btn = await page.$(`#${btnId}`);
        if (btn) {
            const text = await btn.textContent();
            console.log(`   ${btnId}: ${text.trim()}`);
        }
    }

    console.log('\n=== 测试完成 ===');

    // 保持浏览器打开，方便观察
    await page.waitForTimeout(10000);
    await browser.close();
})();
