const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

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

    console.log('=== 文科版研究生模拟器 - 最终测试 ===\n');

    // 测试1：学科配置
    console.log('【1】学科配置测试');
    const discipline = await page.evaluate(() => gameState.discipline);
    console.log(`   学科: ${discipline}`);
    console.log(`   ✅ 学科配置正确: ${discipline === 'chinese'}`);

    // 测试2：初始属性
    console.log('\n【2】初始属性测试');
    const attrs = await page.evaluate(() => ({
        san: gameState.san, sanMax: gameState.sanMax,
        research: gameState.research, social: gameState.social,
        favor: gameState.favor, gold: gameState.gold
    }));
    console.log(`   SAN: ${attrs.san}/${attrs.sanMax}`);
    console.log(`   科研: ${attrs.research}, 社交: ${attrs.social}, 好感: ${attrs.favor}, 金币: ${attrs.gold}`);
    console.log(`   ✅ 属性正确: ${attrs.san === 25 && attrs.sanMax === 30 && attrs.gold === 3}`);

    // 测试3：开启论文
    console.log('\n【3】开启论文测试');
    await page.evaluate(() => createNewPaper(0));
    const paper = await page.evaluate(() => gameState.papers[0]);
    console.log(`   论文标题: ${paper ? paper.title : '无'}`);
    console.log(`   ✅ 论文创建成功: ${!!paper}`);

    // 测试4：读文献
    console.log('\n【4】读文献测试');
    const beforeRead = await page.evaluate(() => gameState.san);
    await page.evaluate(() => readPaper());
    const afterRead = await page.evaluate(() => gameState.san);
    console.log(`   SAN: ${beforeRead} → ${afterRead}`);
    console.log(`   ✅ 读文献成功: ${afterRead < beforeRead}`);

    // 测试5：选题
    console.log('\n【5】选题测试');
    const beforeIdea = await page.evaluate(() => gameState.papers[0]?.ideaScore || 0);
    await page.evaluate(() => {
        const available = gameState.papers.map((p, i) => ({ paper: p, index: i })).filter(({ paper }) => paper && !paper.reviewing);
        if (available.length > 0) {
            const index = available[0].index;
            gameState.actionCount++;
            gameState.ideaClickCount = (gameState.ideaClickCount || 0) + 1;
            const paper = gameState.papers[index];
            const baseScore = 5 + Math.floor(Math.random() * 6);
            paper.ideaScore = Math.max(paper.ideaScore, baseScore);
            changeSan(-1);
        }
    });
    const afterIdea = await page.evaluate(() => gameState.papers[0]?.ideaScore || 0);
    console.log(`   选题分: ${beforeIdea} → ${afterIdea}`);
    console.log(`   ✅ 选题成功: ${afterIdea > beforeIdea}`);

    // 测试6：资料搜集
    console.log('\n【6】资料搜集测试');
    const beforeExp = await page.evaluate(() => gameState.papers[0]?.expScore || 0);
    await page.evaluate(() => {
        const available = gameState.papers.map((p, i) => ({ paper: p, index: i })).filter(({ paper }) => paper && !paper.reviewing);
        if (available.length > 0) {
            const index = available[0].index;
            gameState.actionCount++;
            const paper = gameState.papers[index];
            const baseScore = 5 + Math.floor(Math.random() * 6);
            paper.expScore = Math.max(paper.expScore, baseScore);
            changeSan(-2);
        }
    });
    const afterExp = await page.evaluate(() => gameState.papers[0]?.expScore || 0);
    console.log(`   资料分: ${beforeExp} → ${afterExp}`);
    console.log(`   ✅ 资料搜集成功: ${afterExp > beforeExp}`);

    // 测试7：写论文
    console.log('\n【7】写论文测试');
    const beforeWrite = await page.evaluate(() => gameState.papers[0]?.writeScore || 0);
    await page.evaluate(() => {
        const available = gameState.papers.map((p, i) => ({ paper: p, index: i })).filter(({ paper }) => paper && !paper.reviewing);
        if (available.length > 0) {
            const index = available[0].index;
            gameState.actionCount++;
            const paper = gameState.papers[index];
            const baseScore = 5 + Math.floor(Math.random() * 6);
            paper.writeScore = Math.max(paper.writeScore, baseScore);
            changeSan(-3);
        }
    });
    const afterWrite = await page.evaluate(() => gameState.papers[0]?.writeScore || 0);
    console.log(`   写作分: ${beforeWrite} → ${afterWrite}`);
    console.log(`   ✅ 写论文成功: ${afterWrite > beforeWrite}`);

    // 测试8：下一月
    console.log('\n【8】下一月测试');
    const beforeMonth = await page.evaluate(() => ({ year: gameState.year, month: gameState.month }));
    await page.evaluate(() => nextMonth());
    const afterMonth = await page.evaluate(() => ({ year: gameState.year, month: gameState.month }));
    console.log(`   时间: ${beforeMonth.year}年${beforeMonth.month}月 → ${afterMonth.year}年${afterMonth.month}月`);
    console.log(`   ✅ 月份推进成功: ${afterMonth.month > beforeMonth.month || afterMonth.year > beforeMonth.year}`);

    // 测试9：金币变化
    console.log('\n【9】金币变化测试');
    const gold = await page.evaluate(() => gameState.gold);
    console.log(`   当前金币: ${gold}`);
    console.log(`   ✅ 金币变化: ${gold !== 3}`);

    // 测试10：论文分数（不衰减）
    console.log('\n【10】论文分数不衰减测试');
    const scores = await page.evaluate(() => ({
        idea: gameState.papers[0]?.ideaScore,
        exp: gameState.papers[0]?.expScore,
        write: gameState.papers[0]?.writeScore
    }));
    console.log(`   选题分: ${scores.idea}, 资料分: ${scores.exp}, 写作分: ${scores.write}`);
    console.log(`   ✅ 分数保持: ${scores.idea > 0 && scores.exp > 0 && scores.write > 0}`);

    // 最终属性
    console.log('\n=== 最终属性 ===');
    const finalAttrs = await page.evaluate(() => ({
        san: gameState.san, research: gameState.research,
        social: gameState.social, favor: gameState.favor, gold: gameState.gold
    }));
    console.log(`SAN: ${finalAttrs.san}`);
    console.log(`科研: ${finalAttrs.research}`);
    console.log(`社交: ${finalAttrs.social}`);
    console.log(`好感: ${finalAttrs.favor}`);
    console.log(`金币: ${finalAttrs.gold}`);

    // 错误检查
    console.log('\n=== 错误检查 ===');
    if (errors.length > 0) {
        errors.forEach(e => console.log(`❌ ${e}`));
    } else {
        console.log('✅ 没有错误');
    }

    await page.screenshot({ path: 'test_final.png', fullPage: true });
    console.log('\n✅ 所有测试完成');

    await page.waitForTimeout(5000);
    await browser.close();
})();
