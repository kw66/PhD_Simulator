const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);

    // 收集所有控制台日志
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));

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
        for (let i = 0; i < 15; i++) {
            const btns = await page.$$('.modal button');
            let closed = false;
            for (const btn of btns) {
                const text = await btn.textContent();
                if (text.includes('跳过') || text.includes('确定') || text.includes('关闭') || text.includes('知道了')) {
                    await btn.click().catch(() => {});
                    closed = true;
                    await page.waitForTimeout(100);
                }
            }
            if (!closed) break;
            await page.waitForTimeout(100);
        }

        // 清空日志
        logs.length = 0;

        // 点击下一月
        console.log('=== 点击下一月 ===');
        await page.evaluate(() => nextMonth());
        await page.waitForTimeout(2000);

        // 关闭弹窗
        for (let i = 0; i < 15; i++) {
            const btns = await page.$$('.modal button');
            let closed = false;
            for (const btn of btns) {
                const text = await btn.textContent();
                if (text.includes('跳过') || text.includes('确定') || text.includes('关闭') || text.includes('知道了')) {
                    await btn.click().catch(() => {});
                    closed = true;
                    await page.waitForTimeout(100);
                }
            }
            if (!closed) break;
            await page.waitForTimeout(100);
        }

        // 检查日志中的 updateActionButtons 信息
        console.log('\n=== 控制台日志 ===');
        const actionLogs = logs.filter(l => l.includes('updateActionButtons') || l.includes('🔧'));
        if (actionLogs.length > 0) {
            actionLogs.forEach(l => console.log(l));
        } else {
            console.log('❌ 没有找到 updateActionButtons 日志！');
        }

        // 检查按钮状态
        const btnState = await page.evaluate(() => {
            const btn = document.getElementById('btn-read');
            return {
                disabled: btn?.disabled,
                opacity: btn?.style?.opacity,
                pointerEvents: btn?.style?.pointerEvents,
                actionCount: gameState.actionCount,
                actionLimit: gameState.actionLimit
            };
        });
        console.log('\n=== 按钮状态 ===');
        console.log(JSON.stringify(btnState, null, 2));

        console.log('\n✅ 测试完成');
    } catch (e) {
        console.error('错误:', e.message);
    } finally {
        await browser.close();
    }
})();
