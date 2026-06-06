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
            // 点击advisor-option
            const advisorOpt = await page.$('.advisor-option');
            if (advisorOpt) { await advisorOpt.click().catch(() => {}); await page.waitForTimeout(200); continue; }
            // 点击论文选择项
            const paperOpt = await page.$('.paper-select-item');
            if (paperOpt) { await paperOpt.click().catch(() => {}); await page.waitForTimeout(200); continue; }
            // 点击按钮
            const btns = await page.$$('.modal button');
            let closed = false;
            for (const btn of btns) {
                const text = await btn.textContent();
                if (text.includes('确定') || text.includes('关闭') || text.includes('继续') || text.includes('知道了') || text.includes('太棒了')) {
                    await btn.click().catch(() => {});
                    closed = true;
                    await page.waitForTimeout(200);
                    break;
                }
            }
            if (!closed) break;
        }
    }

    async function getAttr(id) {
        const el = await page.$(`#${id}`);
        return el ? await el.textContent() : '?';
    }

    console.log('=== 文科版研究生模拟器 - 全面功能测试 ===\n');

    await page.goto('http://localhost:8080/index_liberal_arts.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 选择学科
    await page.click('text=人文学科');
    await page.waitForTimeout(300);
    await page.click('text=中国语言文学');
    await page.waitForTimeout(300);
    console.log('✅ 选择学科: 中国语言文学');

    // 选择角色
    await page.evaluate(() => selectCharacterFromRune('normal', false));
    await page.waitForTimeout(300);
    console.log('✅ 选择角色');

    // 开始游戏
    await page.click('#start-btn', { force: true });
    await page.waitForTimeout(3000);
    console.log('✅ 开始游戏');

    // 选择导师
    await closeModals();
    await page.waitForTimeout(1000);
    await closeModals();
    console.log('✅ 选择导师');

    // 检查初始属性
    console.log('\n--- 初始属性 ---');
    console.log(`SAN: ${await getAttr('san-value')}`);
    console.log(`科研: ${await getAttr('research-value')}`);
    console.log(`社交: ${await getAttr('social-value')}`);
    console.log(`好感: ${await getAttr('favor-value')}`);
    console.log(`金币: ${await getAttr('gold-value')}`);

    // 开启新论文
    await closeModals();
    const newPaperBtn = await page.$('text=开启新论文');
    if (newPaperBtn) {
        await newPaperBtn.click({ force: true });
        await page.waitForTimeout(1000);
        await closeModals();
        console.log('\n✅ 开启新论文');
    }

    // 读文献（不需要选论文）
    await closeModals();
    await page.click('#btn-read', { force: true });
    await page.waitForTimeout(500);
    await closeModals();
    console.log('✅ 读文献');

    // 选题（需要选论文）
    await closeModals();
    await page.click('#btn-idea', { force: true });
    await page.waitForTimeout(500);
    // 选择第一个论文
    const paperItem1 = await page.$('.paper-select-item, [onclick*="selectPaper"]');
    if (paperItem1) {
        await paperItem1.click({ force: true });
        await page.waitForTimeout(500);
    }
    await closeModals();
    console.log('✅ 选题');

    // 资料搜集（需要选论文）
    await closeModals();
    await page.click('#btn-experiment', { force: true });
    await page.waitForTimeout(500);
    const paperItem2 = await page.$('.paper-select-item, [onclick*="selectPaper"]');
    if (paperItem2) {
        await paperItem2.click({ force: true });
        await page.waitForTimeout(500);
    }
    await closeModals();
    console.log('✅ 资料搜集');

    // 写论文（需要选论文）
    await closeModals();
    await page.click('#btn-write', { force: true });
    await page.waitForTimeout(500);
    const paperItem3 = await page.$('.paper-select-item, [onclick*="selectPaper"]');
    if (paperItem3) {
        await paperItem3.click({ force: true });
        await page.waitForTimeout(500);
    }
    await closeModals();
    console.log('✅ 写论文');

    // 检查属性变化
    console.log('\n--- 操作后属性 ---');
    console.log(`SAN: ${await getAttr('san-value')}`);
    console.log(`科研: ${await getAttr('research-value')}`);

    // 下一月
    await closeModals();
    await page.click('#btn-next', { force: true });
    await page.waitForTimeout(2000);
    await closeModals();
    console.log('\n✅ 下一月');

    // 检查时间
    console.log(`时间: ${await getAttr('time-year')} ${await getAttr('time-month')}`);

    // 检查属性变化
    console.log('\n--- 下月后属性 ---');
    console.log(`SAN: ${await getAttr('san-value')}`);
    console.log(`金币: ${await getAttr('gold-value')}`);

    // 打开商店
    await closeModals();
    const shopBtn = await page.$('text=商店');
    if (shopBtn && await shopBtn.isVisible()) {
        await shopBtn.click({ force: true });
        await page.waitForTimeout(1000);
        const modalTitle = await page.$('#modal-title');
        if (modalTitle) {
            console.log(`\n✅ 商店: ${await modalTitle.textContent()}`);
        }
        await closeModals();
    }

    // 检查日志
    const logContent = await page.$('#log-content');
    if (logContent) {
        const logHtml = await logContent.innerHTML();
        console.log(`\n--- 日志 ---`);
        console.log(`日志长度: ${logHtml.length}`);
        console.log(`包含游戏开始: ${logHtml.includes('游戏开始')}`);
        console.log(`包含导师: ${logHtml.includes('导师')}`);
    }

    // 错误检查
    console.log('\n--- 错误检查 ---');
    if (errors.length > 0) {
        errors.forEach(e => console.log(`❌ ${e}`));
    } else {
        console.log('✅ 没有错误');
    }

    // 截图
    await page.screenshot({ path: 'test_final.png', fullPage: true });
    console.log('\n✅ 测试完成');

    await page.waitForTimeout(5000);
    await browser.close();
})();
