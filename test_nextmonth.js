const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

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
    await page.waitForTimeout(1000);

    // 关闭所有弹窗（包括新手引导）
    async function closeAllModals() {
        for (let i = 0; i < 20; i++) {
            const overlay = await page.$('#modal-overlay.active');
            if (!overlay) break;
            const btns = await page.$$('.modal button');
            let closed = false;
            for (const btn of btns) {
                const text = await btn.textContent();
                if (text.includes('跳过') || text.includes('确定') || text.includes('关闭') || text.includes('知道了') || text.includes('下一步')) {
                    await btn.click().catch(() => {});
                    closed = true;
                    await page.waitForTimeout(200);
                }
            }
            if (!closed) break;
        }
    }

    // 关闭新手引导
    await closeAllModals();
    await page.waitForTimeout(500);

    console.log('=== 测试下一月按钮 ===\n');

    // 检查按钮状态
    const nextBtn = await page.$('#btn-next');
    if (nextBtn) {
        const visible = await nextBtn.isVisible();
        const disabled = await nextBtn.getAttribute('disabled');
        console.log(`按钮可见: ${visible}`);
        console.log(`按钮禁用: ${disabled}`);
    }

    // 测试多次点击下一月
    console.log('\n--- 测试多次点击下一月 ---');
    for (let i = 0; i < 5; i++) {
        await closeAllModals();
        const before = await page.evaluate(() => ({ year: gameState.year, month: gameState.month }));

        if (nextBtn && await nextBtn.isVisible()) {
            await nextBtn.click({ force: true });
            await page.waitForTimeout(1000);
        }
        await closeAllModals();

        const after = await page.evaluate(() => ({ year: gameState.year, month: gameState.month }));
        console.log(`第${i+1}次: ${before.year}年${before.month}月 → ${after.year}年${after.month}月 ${after.month > before.month || after.year > before.year ? '✅' : '❌'}`);
    }

    // 检查最终状态
    const finalState = await page.evaluate(() => ({
        year: gameState.year,
        month: gameState.month,
        san: gameState.san,
        gold: gameState.gold
    }));
    console.log(`\n最终状态: ${finalState.year}年${finalState.month}月, SAN:${finalState.san}, 金币:${finalState.gold}`);

    await page.screenshot({ path: 'test_nextmonth.png', fullPage: true });
    console.log('\n✅ 测试完成');

    await page.waitForTimeout(3000);
    await browser.close();
})();
