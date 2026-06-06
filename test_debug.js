const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // 监听所有日志
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('❌') || text.includes('错误') || text.includes('error') || text.includes('SAN') || text.includes('读文献') || text.includes('选题')) {
            console.log(`[CONSOLE] ${text}`);
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

    // 获取初始属性
    const getVal = async (id) => (await page.$(`#${id}`))?.textContent() || '?';
    console.log('\n=== 初始属性 ===');
    console.log(`SAN: ${await getVal('san-value')}`);
    console.log(`金币: ${await getVal('gold-value')}`);

    // 开启新论文
    const newPaperBtn = await page.$('text=开启新论文');
    if (newPaperBtn) {
        await newPaperBtn.click({ force: true });
        await page.waitForTimeout(1000);
        // 关闭弹窗
        for (let i = 0; i < 5; i++) {
            const btns = await page.$$('.modal button');
            for (const btn of btns) {
                const text = await btn.textContent();
                if (text.includes('确定') || text.includes('关闭')) {
                    await btn.click().catch(() => {});
                    await page.waitForTimeout(200);
                }
            }
            await page.waitForTimeout(200);
        }
        console.log('✅ 开启新论文');
    }

    // 测试读文献
    console.log('\n=== 测试读文献 ===');
    console.log(`读文献前 SAN: ${await getVal('san-value')}`);
    await page.click('#btn-read', { force: true });
    await page.waitForTimeout(1000);
    // 关闭弹窗
    for (let i = 0; i < 5; i++) {
        const btns = await page.$$('.modal button');
        for (const btn of btns) {
            const text = await btn.textContent();
            if (text.includes('确定') || text.includes('关闭')) {
                await btn.click().catch(() => {});
                await page.waitForTimeout(200);
            }
        }
        await page.waitForTimeout(200);
    }
    console.log(`读文献后 SAN: ${await getVal('san-value')}`);

    // 测试下一月
    console.log('\n=== 测试下一月 ===');
    console.log(`下一月前 时间: ${await getVal('time-year')} ${await getVal('time-month')}`);
    await page.click('#btn-next', { force: true });
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
    console.log(`下一月后 时间: ${await getVal('time-year')} ${await getVal('time-month')}`);
    console.log(`下一月后 SAN: ${await getVal('san-value')}`);
    console.log(`下一月后 金币: ${await getVal('gold-value')}`);

    // 检查日志
    const logContent = await page.$('#log-content');
    if (logContent) {
        const logHtml = await logContent.innerHTML();
        console.log(`\n=== 日志 ===`);
        console.log(`日志长度: ${logHtml.length}`);
        // 提取最后几条日志
        const logLines = logHtml.match(/<div[^>]*>.*?<\/div>/g) || [];
        console.log(`日志条数: ${logLines.length}`);
        if (logLines.length > 0) {
            console.log('最后3条日志:');
            logLines.slice(-3).forEach(l => console.log(`  ${l.replace(/<[^>]*>/g, '').substring(0, 80)}`));
        }
    }

    await page.screenshot({ path: 'test_debug.png', fullPage: true });
    console.log('\n✅ 测试完成');

    await page.waitForTimeout(3000);
    await browser.close();
})();
