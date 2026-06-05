const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // 监听控制台输出
    const consoleLogs = [];
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        consoleLogs.push(`[${type}] ${text}`);
        if (type === 'error' || text.includes('❌')) {
            console.log(`[ERROR] ${text}`);
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
    await page.waitForTimeout(3000);

    // 2. 检查页面标题
    const title = await page.title();
    console.log(`   页面标题: ${title}`);

    // 3. 点击人文学科
    console.log('\n2. 选择学科...');
    const humanitiesBtn = await page.$('text=人文学科');
    if (humanitiesBtn) {
        await humanitiesBtn.click();
        await page.waitForTimeout(1000);
        console.log('   ✅ 点击人文学科');
    }

    // 4. 选择中国语言文学
    await page.waitForTimeout(500);
    const chineseBtn = await page.$('text=中国语言文学');
    if (chineseBtn) {
        await chineseBtn.click();
        await page.waitForTimeout(1000);
        console.log('   ✅ 选择中国语言文学');
    }

    // 5. 等待角色区域显示并选择角色
    console.log('\n3. 选择角色...');
    await page.waitForTimeout(1000);

    // 尝试点击第一个角色卡片
    const characterCards = await page.$$('.constellation-rune');
    console.log(`   找到 ${characterCards.length} 个角色卡片`);

    if (characterCards.length > 0) {
        // 点击第一个角色
        await characterCards[0].click();
        await page.waitForTimeout(500);
        console.log('   ✅ 选择第一个角色');
    }

    // 6. 等待开始按钮启用
    await page.waitForTimeout(1000);

    // 7. 点击开始按钮
    console.log('\n4. 点击开始按钮...');
    const startBtn = await page.$('#start-btn');
    if (startBtn) {
        const isDisabled = await startBtn.getAttribute('disabled');
        console.log(`   开始按钮禁用状态: ${isDisabled}`);

        if (isDisabled === null) {
            await startBtn.click();
            console.log('   ✅ 点击开始按钮');
        } else {
            console.log('   ⚠️ 开始按钮被禁用');
            // 尝试强制点击
            await startBtn.click({ force: true });
            console.log('   ✅ 强制点击开始按钮');
        }
    }

    // 8. 等待游戏加载
    console.log('\n5. 等待游戏加载...');
    await page.waitForTimeout(5000);

    // 9. 检查控制台输出
    console.log('\n6. 检查控制台输出...');
    const errorLogs = consoleLogs.filter(log => log.includes('[error]') || log.includes('❌'));
    if (errorLogs.length > 0) {
        console.log('   发现错误:');
        errorLogs.forEach(log => console.log(`     ${log}`));
    } else {
        console.log('   ✅ 没有发现错误');
    }

    // 10. 检查是否有导师选择弹窗
    console.log('\n7. 检查导师选择弹窗...');
    const modalTitle = await page.$('#modal-title');
    if (modalTitle) {
        const titleText = await modalTitle.textContent();
        console.log(`   弹窗标题: ${titleText}`);
        if (titleText.includes('导师')) {
            console.log('   ✅ 导师选择弹窗已显示!');
        }
    } else {
        console.log('   未找到弹窗标题');
    }

    // 11. 检查游戏界面
    console.log('\n8. 检查游戏界面...');
    const gameScreen = await page.$('#game-screen');
    if (gameScreen) {
        const isVisible = await gameScreen.isVisible();
        console.log(`   游戏界面: ${isVisible ? '可见' : '隐藏'}`);
    }

    // 12. 检查操作按钮
    console.log('\n9. 检查操作按钮...');
    const buttons = ['btn-read', 'btn-idea', 'btn-experiment', 'btn-write'];
    for (const btnId of buttons) {
        const btn = await page.$(`#${btnId}`);
        if (btn) {
            const text = await btn.textContent();
            console.log(`   ${btnId}: ${text.trim()}`);
        }
    }

    // 13. 截图保存
    console.log('\n10. 保存截图...');
    await page.screenshot({ path: 'test_screenshot.png', fullPage: true });
    console.log('   ✅ 截图已保存到 test_screenshot.png');

    console.log('\n=== 测试完成 ===');

    // 保持浏览器打开，方便观察
    await page.waitForTimeout(10000);
    await browser.close();
})();
