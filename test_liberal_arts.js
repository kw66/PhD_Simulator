const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    // 监听控制台输出
    const errors = [];
    page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error' || text.includes('❌')) {
            errors.push(text);
        }
    });
    page.on('pageerror', error => errors.push(error.message));

    console.log('=== 文科版研究生模拟器自动化测试 ===\n');

    // 1. 打开页面
    await page.goto('http://localhost:8080/index_liberal_arts.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 2. 选择学科
    await page.click('text=人文学科');
    await page.waitForTimeout(500);
    await page.click('text=中国语言文学');
    await page.waitForTimeout(500);

    // 3. 选择角色
    const runes = await page.$$('.constellation-rune');
    if (runes.length > 0) await runes[0].click();
    await page.waitForTimeout(500);

    // 4. 点击开始
    await page.click('#start-btn', { force: true });
    await page.waitForTimeout(3000);

    // 5. 选择导师（点击第一个选项）
    const advisorOptions = await page.$$('.advisor-option');
    if (advisorOptions.length > 0) {
        await advisorOptions[0].click();
        console.log('✅ 选择导师');
    }
    await page.waitForTimeout(2000);

    // 6. 关闭可能的弹窗
    const closeBtns = await page.$$('.modal button');
    for (const btn of closeBtns) {
        const text = await btn.textContent();
        if (text.includes('确定') || text.includes('关闭') || text.includes('继续')) {
            await btn.click().catch(() => {});
            await page.waitForTimeout(500);
        }
    }

    // 7. 检查论文工作站
    console.log('\n=== 检查论文工作站 ===');
    const paperSlots = await page.$('#paper-slots');
    if (paperSlots) {
        const html = await paperSlots.innerHTML();
        console.log(`论文工作站内容长度: ${html.length}`);
        console.log(`包含"开启新论文": ${html.includes('开启新论文')}`);
        console.log(`包含"论文槽": ${html.includes('论文槽')}`);
        if (html.length < 50) {
            console.log(`内容: ${html}`);
        }
    }

    // 8. 检查操作按钮
    console.log('\n=== 检查操作按钮 ===');
    for (const id of ['btn-read', 'btn-idea', 'btn-experiment', 'btn-write']) {
        const btn = await page.$(`#${id}`);
        if (btn) {
            const text = await btn.textContent();
            console.log(`${id}: ${text.trim().split('\n')[0]}`);
        }
    }

    // 9. 检查属性面板
    console.log('\n=== 检查属性面板 ===');
    for (const id of ['san-value', 'research-value', 'social-value', 'favor-value', 'gold-value']) {
        const el = await page.$(`#${id}`);
        if (el) {
            const text = await el.textContent();
            console.log(`${id}: ${text}`);
        }
    }

    // 10. 检查错误
    console.log('\n=== 错误检查 ===');
    if (errors.length > 0) {
        errors.forEach(e => console.log(`❌ ${e}`));
    } else {
        console.log('✅ 没有发现错误');
    }

    // 11. 截图
    await page.screenshot({ path: 'test_screenshot.png', fullPage: true });
    console.log('\n✅ 截图已保存');

    await page.waitForTimeout(5000);
    await browser.close();
})();
