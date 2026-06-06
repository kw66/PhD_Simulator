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
            ac: gameState.actionCount,
            al: gameState.actionLimit,
            bd: document.getElementById('btn-read')?.disabled,
            bo: document.getElementById('btn-read')?.style?.opacity,
            bp: document.getElementById('btn-read')?.style?.pointerEvents,
            overlay: !!document.getElementById('modal-overlay')?.classList?.contains('active')
        }));
        console.log('初始:', JSON.stringify(before));

        // 下一月
        await page.evaluate(() => nextMonth());
        await page.waitForTimeout(1000);

        // 检查下一月后状态（不关闭弹窗）
        const after = await page.evaluate(() => ({
            ac: gameState.actionCount,
            al: gameState.actionLimit,
            bd: document.getElementById('btn-read')?.disabled,
            bo: document.getElementById('btn-read')?.style?.opacity,
            bp: document.getElementById('btn-read')?.style?.pointerEvents,
            overlay: !!document.getElementById('modal-overlay')?.classList?.contains('active')
        }));
        console.log('下一月后（弹窗前）:', JSON.stringify(after));

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

        // 检查关闭弹窗后状态
        const afterClose = await page.evaluate(() => ({
            ac: gameState.actionCount,
            al: gameState.actionLimit,
            bd: document.getElementById('btn-read')?.disabled,
            bo: document.getElementById('btn-read')?.style?.opacity,
            bp: document.getElementById('btn-read')?.style?.pointerEvents,
            overlay: !!document.getElementById('modal-overlay')?.classList?.contains('active')
        }));
        console.log('下一月后（弹窗后）:', JSON.stringify(afterClose));

        console.log('✅ 测试完成');
    } catch (e) {
        console.error('错误:', e.message);
    } finally {
        await browser.close();
    }
})();
