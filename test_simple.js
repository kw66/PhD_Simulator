const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('http://localhost:8080/index_liberal_arts.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 快速开始
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
            if (text.includes('跳过') || text.includes('确定') || text.includes('关闭')) {
                await btn.click().catch(() => {});
                await page.waitForTimeout(200);
            }
        }
        await page.waitForTimeout(200);
    }

    // 测试
    console.log('=== 简单测试 ===');

    // 开启论文
    await page.evaluate(() => createNewPaper(0));
    const paper = await page.evaluate(() => gameState.papers[0]);
    console.log('论文标题:', paper?.title);
    console.log('选题分:', paper?.ideaScore);

    // 设置分数
    await page.evaluate(() => { gameState.papers[0].ideaScore = 10; });
    console.log('设置选题分后:', await page.evaluate(() => gameState.papers[0]?.ideaScore));

    // 下一月
    await page.evaluate(() => nextMonth());
    console.log('下一月后选题分:', await page.evaluate(() => gameState.papers[0]?.ideaScore));
    console.log('分数保持:', await page.evaluate(() => gameState.papers[0]?.ideaScore === 10));

    console.log('\n✅ 测试完成');
    await browser.close();
})().catch(e => console.error('错误:', e.message));
