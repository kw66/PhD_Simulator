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

        console.log('=== 下一月前 ===');
        const overlayBefore = await page.$('#modal-overlay.active');
        console.log(`弹窗遮罩: ${overlayBefore ? '存在' : '不存在'}`);

        // 下一月
        await page.evaluate(() => nextMonth());
        await page.waitForTimeout(1000);

        console.log('\n=== 下一月后（关闭弹窗前）===');
        const overlayAfter = await page.$('#modal-overlay.active');
        console.log(`弹窗遮罩: ${overlayAfter ? '存在' : '不存在'}`);

        if (overlayAfter) {
            const title = await page.$('#modal-title');
            if (title) {
                console.log(`弹窗标题: ${await title.textContent()}`);
            }
            const content = await page.$('#modal-content');
            if (content) {
                const text = await content.textContent();
                console.log(`弹窗内容: ${text.substring(0, 100)}...`);
            }
        }

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

        console.log('\n=== 下一月后（关闭弹窗后）===');
        const overlayAfterClose = await page.$('#modal-overlay.active');
        console.log(`弹窗遮罩: ${overlayAfterClose ? '存在' : '不存在'}`);

        // 检查按钮状态
        const btnState = await page.evaluate(() => ({
            disabled: document.getElementById('btn-read')?.disabled,
            opacity: document.getElementById('btn-read')?.style?.opacity,
            pointerEvents: document.getElementById('btn-read')?.style?.pointerEvents,
            actionCount: gameState.actionCount,
            actionLimit: gameState.actionLimit
        }));
        console.log(`\n按钮状态: ${JSON.stringify(btnState)}`);

        console.log('\n✅ 测试完成');
    } catch (e) {
        console.error('错误:', e.message);
    } finally {
        await browser.close();
    }
})();
