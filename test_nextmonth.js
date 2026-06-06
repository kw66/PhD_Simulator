const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // 监听所有日志
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('❌') || text.includes('错误') || text.includes('error') || text.includes('下一月') || text.includes('nextMonth')) {
            console.log(`[LOG] ${text}`);
        }
    });
    page.on('pageerror', error => console.log(`[PAGE_ERROR] ${error.message}`));

    await page.goto('http://localhost:8080/index_liberal_arts.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 快速开始游戏
    await page.click('text=人文学科');
    await page.waitForTimeout(300);
    await page.click('text=中国语言文学');
    await page.waitForTimeout(300);
    await page.evaluate(() => selectCharacterFromRune('normal', false));
    await page.waitForTimeout(300);
    await page.click('#start-btn', { force: true });
    await page.waitForTimeout(3000);

    // 选择导师
    const advisorOpt = await page.$('.advisor-option');
    if (advisorOpt) await advisorOpt.click();
    await page.waitForTimeout(2000);

    // 关闭弹窗
    for (let i = 0; i < 10; i++) {
        const btns = await page.$$('.modal button');
        for (const btn of btns) {
            const text = await btn.textContent();
            if (text.includes('确定') || text.includes('关闭') || text.includes('继续') || text.includes('知道了')) {
                await btn.click().catch(() => {});
                await page.waitForTimeout(200);
            }
        }
        await page.waitForTimeout(200);
    }

    console.log('=== 测试下一月按钮 ===\n');

    // 检查按钮状态
    const nextBtn = await page.$('#btn-next');
    if (nextBtn) {
        const visible = await nextBtn.isVisible();
        const disabled = await nextBtn.getAttribute('disabled');
        const text = await nextBtn.textContent();
        console.log(`按钮可见: ${visible}`);
        console.log(`按钮禁用: ${disabled}`);
        console.log(`按钮文本: ${text.trim()}`);
    }

    // 测试直接调用nextMonth函数
    console.log('\n--- 测试直接调用nextMonth ---');
    const before = await page.evaluate(() => ({
        year: gameState.year,
        month: gameState.month,
        totalMonths: gameState.totalMonths,
        san: gameState.san,
        gold: gameState.gold
    }));
    console.log(`调用前: ${before.year}年${before.month}月, 总月数${before.totalMonths}, SAN:${before.san}, 金币:${before.gold}`);

    await page.evaluate(() => {
        console.log('调用nextMonth...');
        nextMonth();
        console.log('nextMonth调用完成');
    });
    await page.waitForTimeout(3000);

    const after = await page.evaluate(() => ({
        year: gameState.year,
        month: gameState.month,
        totalMonths: gameState.totalMonths,
        san: gameState.san,
        gold: gameState.gold
    }));
    console.log(`调用后: ${after.year}年${after.month}月, 总月数${after.totalMonths}, SAN:${after.san}, 金币:${after.gold}`);
    console.log(`时间变化: ${before.year}年${before.month}月 → ${after.year}年${after.month}月`);

    // 测试点击按钮
    console.log('\n--- 测试点击按钮 ---');
    const before2 = await page.evaluate(() => ({
        year: gameState.year,
        month: gameState.month
    }));

    if (nextBtn && await nextBtn.isVisible()) {
        await nextBtn.click({ force: true });
        console.log('点击了下一月按钮');
    }
    await page.waitForTimeout(3000);

    const after2 = await page.evaluate(() => ({
        year: gameState.year,
        month: gameState.month
    }));
    console.log(`点击后: ${after2.year}年${after2.month}月`);

    // 检查弹窗
    console.log('\n--- 检查弹窗 ---');
    const overlay = await page.$('#modal-overlay.active');
    console.log(`弹窗遮罩可见: ${!!overlay}`);
    if (overlay) {
        const title = await page.$('#modal-title');
        if (title) {
            console.log(`弹窗标题: ${await title.textContent()}`);
        }
    }

    // 检查isNextMonthProcessing标志
    const isProcessing = await page.evaluate(() => isNextMonthProcessing);
    console.log(`\nisNextMonthProcessing: ${isProcessing}`);

    await page.screenshot({ path: 'test_nextmonth.png', fullPage: true });
    console.log('\n✅ 测试完成');

    await page.waitForTimeout(3000);
    await browser.close();
})();
