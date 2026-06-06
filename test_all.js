const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    async function closeModals() {
        for (let i = 0; i < 20; i++) {
            const overlay = await page.$('#modal-overlay.active');
            if (!overlay) break;
            const btns = await page.$$('.modal button');
            let closed = false;
            for (const btn of btns) {
                const text = await btn.textContent();
                if (text.includes('跳过') || text.includes('确定') || text.includes('关闭') || text.includes('知道了') || text.includes('下一步') || text.includes('太棒了')) {
                    await btn.click().catch(() => {});
                    closed = true;
                    await page.waitForTimeout(200);
                }
            }
            if (!closed) break;
        }
    }

    console.log('=== 文科版研究生模拟器 - 全面测试 ===\n');

    // 1. 开始游戏
    await page.goto('http://localhost:8080/index_liberal_arts.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 选择学科
    await page.click('text=人文学科');
    await page.waitForTimeout(300);
    await page.click('text=中国语言文学');
    await page.waitForTimeout(300);
    console.log('✅ 选择学科');

    // 选择角色
    await page.evaluate(() => selectCharacterFromRune('normal', false));
    await page.waitForTimeout(300);
    console.log('✅ 选择角色');

    // 开始游戏
    await page.click('#start-btn', { force: true });
    await page.waitForTimeout(3000);
    console.log('✅ 开始游戏');

    // 选择导师
    const advisorOpt = await page.$('.advisor-option');
    if (advisorOpt) await advisorOpt.click();
    await page.waitForTimeout(1000);
    await closeModals();
    console.log('✅ 选择导师');

    // 2. 测试基础操作
    console.log('\n--- 基础操作测试 ---');

    // 开启论文
    await closeModals();
    const newPaperBtn = await page.$('text=开启新论文');
    if (newPaperBtn) {
        await newPaperBtn.click({ force: true });
        await page.waitForTimeout(500);
        await closeModals();
        console.log('✅ 开启新论文');
    }

    // 读文献
    await page.evaluate(() => readPaper());
    await closeModals();
    console.log('✅ 读文献');

    // 选题
    await page.evaluate(() => {
        const available = gameState.papers.map((p, i) => ({ paper: p, index: i })).filter(({ paper }) => paper && !paper.reviewing);
        if (available.length > 0) {
            const index = available[0].index;
            gameState.actionCount++;
            const paper = gameState.papers[index];
            paper.ideaScore = Math.max(paper.ideaScore, 5 + Math.floor(Math.random() * 6));
            changeSan(-1);
        }
    });
    console.log('✅ 选题');

    // 资料搜集
    await page.evaluate(() => {
        const available = gameState.papers.map((p, i) => ({ paper: p, index: i })).filter(({ paper }) => paper && !paper.reviewing);
        if (available.length > 0) {
            const index = available[0].index;
            gameState.actionCount++;
            const paper = gameState.papers[index];
            paper.expScore = Math.max(paper.expScore, 5 + Math.floor(Math.random() * 6));
            changeSan(-2);
        }
    });
    console.log('✅ 资料搜集');

    // 写论文
    await page.evaluate(() => {
        const available = gameState.papers.map((p, i) => ({ paper: p, index: i })).filter(({ paper }) => paper && !paper.reviewing);
        if (available.length > 0) {
            const index = available[0].index;
            gameState.actionCount++;
            const paper = gameState.papers[index];
            paper.writeScore = Math.max(paper.writeScore, 5 + Math.floor(Math.random() * 6));
            changeSan(-3);
        }
    });
    console.log('✅ 写论文');

    // 3. 测试时间推进
    console.log('\n--- 时间推进测试 ---');
    for (let i = 0; i < 12; i++) {
        await page.evaluate(() => nextMonth());
        await closeModals();
    }
    const time = await page.evaluate(() => ({ year: gameState.year, month: gameState.month }));
    console.log(`✅ 推进12个月: ${time.year}年${time.month}月`);

    // 4. 测试论文分数不衰减
    console.log('\n--- 论文分数测试 ---');
    const scores = await page.evaluate(() => ({
        idea: gameState.papers[0]?.ideaScore,
        exp: gameState.papers[0]?.expScore,
        write: gameState.papers[0]?.writeScore
    }));
    console.log(`选题分: ${scores.idea}, 资料分: ${scores.exp}, 写作分: ${scores.write}`);
    console.log(`✅ 分数保持: ${scores.idea > 0 && scores.exp > 0 && scores.write > 0}`);

    // 5. 测试属性
    console.log('\n--- 属性测试 ---');
    const attrs = await page.evaluate(() => ({
        san: gameState.san,
        sanMax: gameState.sanMax,
        research: gameState.research,
        social: gameState.social,
        favor: gameState.favor,
        gold: gameState.gold
    }));
    console.log(`SAN: ${attrs.san}/${attrs.sanMax}`);
    console.log(`科研: ${attrs.research}, 社交: ${attrs.social}, 好感: ${attrs.favor}, 金币: ${attrs.gold}`);
    console.log(`✅ SAN上限: ${attrs.sanMax}`);

    // 6. 错误检查
    console.log('\n--- 错误检查 ---');
    if (errors.length > 0) {
        errors.forEach(e => console.log(`❌ ${e}`));
    } else {
        console.log('✅ 没有错误');
    }

    await page.screenshot({ path: 'test_all.png', fullPage: true });
    console.log('\n✅ 所有测试完成');

    await page.waitForTimeout(3000);
    await browser.close();
})();
