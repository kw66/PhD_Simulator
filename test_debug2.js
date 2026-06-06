const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('SAN') || text.includes('读文献') || text.includes('金币') || text.includes('错误') || text.includes('error')) {
            console.log(`[LOG] ${text}`);
        }
    });

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

    // 获取游戏状态
    const state = await page.evaluate(() => {
        return {
            san: gameState.san,
            sanMax: gameState.sanMax,
            gold: gameState.gold,
            research: gameState.research,
            month: gameState.month,
            year: gameState.year,
            actionCount: gameState.actionCount,
            actionLimit: gameState.actionLimit,
            paperSlots: gameState.paperSlots,
            papers: gameState.papers.map(p => p ? '有' : '无'),
            discipline: gameState.discipline
        };
    });
    console.log('\n=== 游戏状态 ===');
    console.log(JSON.stringify(state, null, 2));

    // 开启新论文
    console.log('\n=== 开启新论文 ===');
    await page.evaluate(() => {
        createNewPaper(0);
        return gameState.papers[0] ? gameState.papers[0].title : '无';
    });
    console.log('论文已创建');

    // 读文献
    console.log('\n=== 读文献 ===');
    const beforeSan = await page.evaluate(() => gameState.san);
    console.log(`读文献前 SAN: ${beforeSan}`);

    await page.evaluate(() => {
        readPaper();
        return gameState.san;
    });

    const afterSan = await page.evaluate(() => gameState.san);
    console.log(`读文献后 SAN: ${afterSan}`);
    console.log(`SAN变化: ${beforeSan} → ${afterSan}`);

    // 下一月
    console.log('\n=== 下一月 ===');
    const beforeMonth = await page.evaluate(() => ({ year: gameState.year, month: gameState.month }));
    console.log(`下一月前: ${beforeMonth.year}年${beforeMonth.month}月`);

    await page.evaluate(() => {
        nextMonth();
        return { year: gameState.year, month: gameState.month };
    });

    const afterMonth = await page.evaluate(() => ({ year: gameState.year, month: gameState.month }));
    console.log(`下一月后: ${afterMonth.year}年${afterMonth.month}月`);

    await page.screenshot({ path: 'test_debug2.png', fullPage: true });
    console.log('\n✅ 测试完成');

    await page.waitForTimeout(3000);
    await browser.close();
})();
