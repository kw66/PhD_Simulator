const { chromium } = require('playwright');

(async () => {
    console.log('=== 开始测试 ===');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    // 设置超时
    page.setDefaultTimeout(30000);

    try {
        console.log('1. 打开页面...');
        await page.goto('http://localhost:8080/index_liberal_arts.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
        await page.waitForTimeout(2000);

        console.log('2. 选择学科...');
        await page.click('text=人文学科', { timeout: 5000 });
        await page.waitForTimeout(300);
        await page.click('text=中国语言文学', { timeout: 5000 });
        await page.waitForTimeout(300);

        console.log('3. 选择角色...');
        await page.evaluate(() => selectCharacterFromRune('normal', false));
        await page.waitForTimeout(300);

        console.log('4. 开始游戏...');
        await page.click('#start-btn', { force: true, timeout: 5000 });
        await page.waitForTimeout(3000);

        console.log('5. 选择导师...');
        const advisorOpt = await page.$('.advisor-option');
        if (advisorOpt) {
            await advisorOpt.click({ timeout: 5000 });
            console.log('   ✅ 选择导师');
        }
        await page.waitForTimeout(1000);

        console.log('6. 关闭弹窗...');
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

        console.log('7. 开启论文...');
        await page.evaluate(() => createNewPaper(0));
        const paper = await page.evaluate(() => gameState.papers[0]);
        console.log(`   论文标题: ${paper?.title}`);

        console.log('8. 设置分数...');
        await page.evaluate(() => {
            gameState.papers[0].ideaScore = 10;
            gameState.papers[0].expScore = 12;
            gameState.papers[0].writeScore = 8;
        });

        console.log('9. 下一月...');
        await page.evaluate(() => nextMonth());

        console.log('10. 检查分数...');
        const scores = await page.evaluate(() => ({
            idea: gameState.papers[0]?.ideaScore,
            exp: gameState.papers[0]?.expScore,
            write: gameState.papers[0]?.writeScore
        }));
        console.log(`   选题分: ${scores.idea} (期望: 10)`);
        console.log(`   资料分: ${scores.exp} (期望: 12)`);
        console.log(`   写作分: ${scores.write} (期望: 8)`);
        console.log(`   分数保持: ${scores.idea === 10 && scores.exp === 12 && scores.write === 8 ? '✅' : '❌'}`);

        console.log('\n=== 测试完成 ===');
    } catch (error) {
        console.error('测试错误:', error.message);
    } finally {
        await browser.close();
    }
})();
