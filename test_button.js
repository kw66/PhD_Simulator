const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultTimeout(10000);

    try {
        await page.goto('http://localhost:8080/index_liberal_arts.html', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);

        // 快速开始游戏
        await page.click('text=人文学科');
        await page.waitForTimeout(200);
        await page.click('text=中国语言文学');
        await page.waitForTimeout(200);
        await page.evaluate(() => selectCharacterFromRune('normal', false));
        await page.waitForTimeout(200);
        await page.click('#start-btn', { force: true });
        await page.waitForTimeout(2500);

        // 选择导师
        const ao = await page.$('.advisor-option');
        if (ao) await ao.click();
        await page.waitForTimeout(800);

        // 关闭弹窗
        for (let i = 0; i < 15; i++) {
            const btns = await page.$$('.modal button');
            let c = false;
            for (const b of btns) {
                const t = await b.textContent();
                if (t.includes('跳过') || t.includes('确定') || t.includes('关闭') || t.includes('知道了')) {
                    await b.click().catch(() => {});
                    c = true;
                    await page.waitForTimeout(100);
                }
            }
            if (!c) break;
            await page.waitForTimeout(100);
        }

        // 检查初始状态
        const before = await page.evaluate(() => ({
            actionCount: gameState.actionCount,
            actionLimit: gameState.actionLimit,
            btnReadDisabled: document.getElementById('btn-read')?.disabled,
            btnReadOpacity: document.getElementById('btn-read')?.style?.opacity,
            btnReadPointerEvents: document.getElementById('btn-read')?.style?.pointerEvents
        }));
        console.log('=== 初始状态 ===');
        console.log(`actionCount: ${before.actionCount}`);
        console.log(`actionLimit: ${before.actionLimit}`);
        console.log(`btn-read disabled: ${before.btnReadDisabled}`);
        console.log(`btn-read opacity: ${before.btnReadOpacity}`);
        console.log(`btn-read pointerEvents: ${before.btnReadPointerEvents}`);

        // 下一月
        await page.evaluate(() => nextMonth());
        await page.waitForTimeout(500);

        // 关闭弹窗
        for (let i = 0; i < 15; i++) {
            const btns = await page.$$('.modal button');
            let c = false;
            for (const b of btns) {
                const t = await b.textContent();
                if (t.includes('跳过') || t.includes('确定') || t.includes('关闭') || t.includes('知道了')) {
                    await b.click().catch(() => {});
                    c = true;
                    await page.waitForTimeout(100);
                }
            }
            if (!c) break;
            await page.waitForTimeout(100);
        }

        // 检查下一月后状态
        const after = await page.evaluate(() => ({
            actionCount: gameState.actionCount,
            actionLimit: gameState.actionLimit,
            btnReadDisabled: document.getElementById('btn-read')?.disabled,
            btnReadOpacity: document.getElementById('btn-read')?.style?.opacity,
            btnReadPointerEvents: document.getElementById('btn-read')?.style?.pointerEvents
        }));
        console.log('\n=== 下一月后 ===');
        console.log(`actionCount: ${after.actionCount}`);
        console.log(`actionLimit: ${after.actionLimit}`);
        console.log(`btn-read disabled: ${after.btnReadDisabled}`);
        console.log(`btn-read opacity: ${after.btnReadOpacity}`);
        console.log(`btn-read pointerEvents: ${after.btnReadPointerEvents}`);

        console.log('\n✅ 测试完成');
    } catch (e) {
        console.error('错误:', e.message);
    } finally {
        await browser.close();
    }
})();
