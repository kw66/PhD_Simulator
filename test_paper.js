const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

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

    // 关闭弹窗
    for (let i = 0; i < 10; i++) {
        const btns = await page.$$('.modal button');
        for (const btn of btns) {
            const text = await btn.textContent();
            if (text.includes('跳过') || text.includes('确定') || text.includes('关闭') || text.includes('知道了')) {
                await btn.click().catch(() => {});
                await page.waitForTimeout(200);
            }
        }
        await page.waitForTimeout(200);
    }

    console.log('=== 论文系统测试 ===\n');

    // 检查初始论文槽
    const papers = await page.evaluate(() => gameState.papers);
    console.log('初始论文槽:', papers.map(p => p ? '有' : '无'));

    // 开启新论文
    await page.evaluate(() => createNewPaper(0));
    const paper = await page.evaluate(() => gameState.papers[0]);
    console.log('\n开启论文后:');
    console.log('  标题:', paper?.title);
    console.log('  选题分:', paper?.ideaScore);
    console.log('  资料分:', paper?.expScore);
    console.log('  写作分:', paper?.writeScore);

    // 读文献
    await page.evaluate(() => readPaper());
    console.log('\n读文献后 SAN:', await page.evaluate(() => gameState.san));

    // 选题
    await page.evaluate(() => {
        const paper = gameState.papers[0];
        if (paper) {
            paper.ideaScore = 10;
        }
    });
    const ideaScore = await page.evaluate(() => gameState.papers[0]?.ideaScore);
    console.log('选题后 选题分:', ideaScore);

    // 资料搜集
    await page.evaluate(() => {
        const paper = gameState.papers[0];
        if (paper) {
            paper.expScore = 12;
        }
    });
    const expScore = await page.evaluate(() => gameState.papers[0]?.expScore);
    console.log('资料搜集后 资料分:', expScore);

    // 写论文
    await page.evaluate(() => {
        const paper = gameState.papers[0];
        if (paper) {
            paper.writeScore = 8;
        }
    });
    const writeScore = await page.evaluate(() => gameState.papers[0]?.writeScore);
    console.log('写论文后 写作分:', writeScore);

    // 下一月
    await page.evaluate(() => nextMonth());
    console.log('\n下一月后:');
    console.log('  时间:', await page.evaluate(() => `${gameState.year}年${gameState.month}月`));
    console.log('  SAN:', await page.evaluate(() => gameState.san));

    // 检查论文分数是否衰减
    const afterScores = await page.evaluate(() => ({
        idea: gameState.papers[0]?.ideaScore,
        exp: gameState.papers[0]?.expScore,
        write: gameState.papers[0]?.writeScore
    }));
    console.log('\n论文分数（应不衰减）:');
    console.log('  选题分:', afterScores.idea, afterScores.idea === 10 ? '✅' : '❌');
    console.log('  资料分:', afterScores.exp, afterScores.exp === 12 ? '✅' : '❌');
    console.log('  写作分:', afterScores.write, afterScores.write === 8 ? '✅' : '❌');

    await page.screenshot({ path: 'test_paper.png', fullPage: true });
    console.log('\n✅ 测试完成');

    await page.waitForTimeout(3000);
    await browser.close();
})();
