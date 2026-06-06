const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);

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

        // 关闭所有弹窗
        async function closeModals() {
            for (let i = 0; i < 15; i++) {
                const btns = await page.$$('.modal button');
                let closed = false;
                for (const b of btns) {
                    const t = await b.textContent();
                    if (t.includes('跳过') || t.includes('确定') || t.includes('关闭') || t.includes('知道了')) {
                        await b.click().catch(() => {});
                        closed = true;
                        await page.waitForTimeout(100);
                    }
                }
                if (!closed) break;
                await page.waitForTimeout(100);
            }
        }
        await closeModals();

        // 测试多次下一月
        console.log('=== 测试操作按钮状态 ===');
        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => nextMonth());
            await page.waitForTimeout(500);
            await closeModals();

            const state = await page.evaluate(() => ({
                disabled: document.getElementById('btn-read')?.disabled,
                opacity: document.getElementById('btn-read')?.style?.opacity,
                pointerEvents: document.getElementById('btn-read')?.style?.pointerEvents,
                month: gameState.month,
                year: gameState.year
            }));
            console.log(`第${i+1}次: ${state.year}年${state.month}月 | disabled:${state.disabled} opacity:${state.opacity} pointerEvents:${state.pointerEvents} ${state.disabled === false ? '✅' : '❌'}`);
        }

        console.log('\n✅ 测试完成');
    } catch (e) {
        console.error('错误:', e.message);
    } finally {
        await browser.close();
    }
})();
