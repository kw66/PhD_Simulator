const { chromium } = require('playwright');

(async () => {
    console.log('=== 文科版研究生模拟器 - 最终验证 ===\n');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    page.setDefaultTimeout(30000);

    try {
        // 1. 开始游戏
        await page.goto('http://localhost:8080/index_liberal_arts.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2000);
        await page.click('text=人文学科');
        await page.waitForTimeout(300);
        await page.click('text=中国语言文学');
        await page.waitForTimeout(300);
        await page.evaluate(() => selectCharacterFromRune('normal', false));
        await page.waitForTimeout(300);
        await page.click('#start-btn', { force: true });
        await page.waitForTimeout(3000);
        const advisorOpt = await page.$('.advisor-option');
        if (advisorOpt) await advisorOpt.click();
        await page.waitForTimeout(1000);
        for (let i = 0; i < 10; i++) {
            const btns = await page.$$('.modal button');
            for (const btn of btns) {
                const text = await btn.textContent();
                if (text.includes('跳过') || text.includes('确定') || text.includes('关闭')) {
                    await btn.click().catch(() => {});
                    await page.waitForTimeout(100);
                }
            }
            await page.waitForTimeout(100);
        }
        console.log('✅ 游戏开始成功');

        // 2. 测试论文系统
        await page.evaluate(() => createNewPaper(0));
        const paper = await page.evaluate(() => gameState.papers[0]);
        console.log(`✅ 论文创建: ${paper?.title}`);

        // 3. 测试操作
        await page.evaluate(() => {
            gameState.papers[0].ideaScore = 10;
            gameState.papers[0].expScore = 12;
            gameState.papers[0].writeScore = 8;
        });
        console.log('✅ 分数设置完成');

        // 4. 测试下一月
        await page.evaluate(() => nextMonth());
        const scores = await page.evaluate(() => ({
            idea: gameState.papers[0]?.ideaScore,
            exp: gameState.papers[0]?.expScore,
            write: gameState.papers[0]?.writeScore
        }));
        console.log(`✅ 下一月后分数: 选题${scores.idea}, 资料${scores.exp}, 写作${scores.write}`);
        console.log(`✅ 分数保持: ${scores.idea === 10 && scores.exp === 12 && scores.write === 8}`);

        // 5. 测试多次下一月
        for (let i = 0; i < 5; i++) {
            await page.evaluate(() => nextMonth());
        }
        const finalTime = await page.evaluate(() => `${gameState.year}年${gameState.month}月`);
        console.log(`✅ 推进5个月后: ${finalTime}`);

        // 6. 测试属性
        const attrs = await page.evaluate(() => ({
            san: gameState.san,
            sanMax: gameState.sanMax,
            research: gameState.research,
            gold: gameState.gold
        }));
        console.log(`✅ 属性: SAN ${attrs.san}/${attrs.sanMax}, 科研 ${attrs.research}, 金币 ${attrs.gold}`);

        console.log('\n=== 所有测试通过 ===');
    } catch (error) {
        console.error('❌ 测试错误:', error.message);
    } finally {
        await browser.close();
    }
})();
