const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    const allLogs = [];
    page.on('console', msg => allLogs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', error => allLogs.push(`[PAGE_ERROR] ${error.message}`));

    console.log('=== 文科版研究生模拟器 - 全面功能测试 ===\n');

    // 1. 打开页面
    await page.goto('http://localhost:8080/index_liberal_arts.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 2. 选择学科
    console.log('【1】学科选择测试');
    await page.click('text=社会学科');
    await page.waitForTimeout(500);
    await page.click('text=新闻传播学');
    await page.waitForTimeout(500);
    console.log('   ✅ 选择：社会学科 → 新闻传播学');

    // 3. 选择角色
    console.log('\n【2】角色选择测试');
    await page.waitForTimeout(1000);
    await page.evaluate(() => selectCharacterFromRune('normal', false));
    await page.waitForTimeout(500);
    console.log('   ✅ 选择角色');

    // 4. 开始游戏
    console.log('\n【3】开始游戏测试');
    await page.click('#start-btn', { force: true });
    await page.waitForTimeout(3000);
    console.log('   ✅ 点击开始按钮');

    // 5. 选择导师
    console.log('\n【4】导师选择测试');
    const modalTitle = await page.$('#modal-title');
    if (modalTitle) {
        const title = await modalTitle.textContent();
        console.log(`   弹窗标题: ${title}`);
        if (title.includes('导师')) {
            const advisorOption = await page.$('.advisor-option');
            if (advisorOption) {
                await advisorOption.click();
                console.log('   ✅ 选择导师');
            }
        }
    }
    await page.waitForTimeout(2000);

    // 关闭所有弹窗
    async function closeAllModals() {
        for (let i = 0; i < 15; i++) {
            const overlay = await page.$('#modal-overlay.active');
            if (!overlay) break;
            const btns = await page.$$('.modal button');
            let closed = false;
            for (const btn of btns) {
                const text = await btn.textContent();
                if (text.includes('确定') || text.includes('关闭') || text.includes('继续') || text.includes('知道了') || text.includes('开始')) {
                    await btn.click().catch(() => {});
                    closed = true;
                    await page.waitForTimeout(300);
                }
            }
            if (!closed) break;
            await page.waitForTimeout(300);
        }
    }
    await closeAllModals();

    // 6. 检查论文工作站
    console.log('\n【5】论文工作站测试');
    const paperSlots = await page.$('#paper-slots');
    if (paperSlots) {
        const html = await paperSlots.innerHTML();
        console.log(`   内容长度: ${html.length}`);
        console.log(`   包含"开启新论文": ${html.includes('开启新论文')}`);
    }

    // 7. 测试开启新论文
    console.log('\n【6】开启新论文测试');
    await closeAllModals();
    const newPaperBtn = await page.$('text=开启新论文');
    if (newPaperBtn) {
        await newPaperBtn.click({ force: true });
        await page.waitForTimeout(1000);
        console.log('   ✅ 点击开启新论文');
        await closeAllModals();
    } else {
        console.log('   ❌ 未找到开启新论文按钮');
    }

    // 8. 测试操作按钮
    console.log('\n【7】操作按钮测试');
    for (const id of ['btn-read', 'btn-idea', 'btn-experiment', 'btn-write']) {
        const btn = await page.$(`#${id}`);
        if (btn) {
            const visible = await btn.isVisible();
            const text = await btn.textContent();
            console.log(`   ${id}: ${visible ? '✅ 可见' : '❌ 不可见'} - ${text.trim().split('\n')[0]}`);
        }
    }

    // 9. 测试读文献
    console.log('\n【8】读文献测试');
    await closeAllModals();
    const readBtn = await page.$('#btn-read');
    if (readBtn && await readBtn.isVisible()) {
        await readBtn.click({ force: true });
        await page.waitForTimeout(1000);
        await closeAllModals();
        console.log('   ✅ 点击读文献');
    }

    // 10. 测试选题
    console.log('\n【9】选题测试');
    await closeAllModals();
    const ideaBtn = await page.$('#btn-idea');
    if (ideaBtn && await ideaBtn.isVisible()) {
        await ideaBtn.click({ force: true });
        await page.waitForTimeout(1000);
        await closeAllModals();
        console.log('   ✅ 点击选题');
    }

    // 11. 测试资料搜集
    console.log('\n【10】资料搜集测试');
    await closeAllModals();
    const expBtn = await page.$('#btn-experiment');
    if (expBtn && await expBtn.isVisible()) {
        await expBtn.click({ force: true });
        await page.waitForTimeout(1000);
        await closeAllModals();
        console.log('   ✅ 点击资料搜集');
    }

    // 12. 测试写论文
    console.log('\n【11】写论文测试');
    await closeAllModals();
    const writeBtn = await page.$('#btn-write');
    if (writeBtn && await writeBtn.isVisible()) {
        await writeBtn.click({ force: true });
        await page.waitForTimeout(1000);
        await closeAllModals();
        console.log('   ✅ 点击写论文');
    }

    // 13. 测试下一月
    console.log('\n【12】下一月测试');
    await closeAllModals();
    const nextBtn = await page.$('#btn-next');
    if (nextBtn && await nextBtn.isVisible()) {
        await nextBtn.click({ force: true });
        await page.waitForTimeout(2000);
        await closeAllModals();
        console.log('   ✅ 点击下一月');
    }

    // 14. 检查时间显示
    console.log('\n【13】时间显示测试');
    const timeYear = await page.$('#time-year');
    const timeMonth = await page.$('#time-month');
    if (timeYear && timeMonth) {
        console.log(`   年份: ${await timeYear.textContent()}`);
        console.log(`   月份: ${await timeMonth.textContent()}`);
    }

    // 15. 检查属性变化
    console.log('\n【14】属性变化测试');
    for (const id of ['san-value', 'research-value', 'social-value', 'favor-value', 'gold-value']) {
        const el = await page.$(`#${id}`);
        if (el) {
            console.log(`   ${id}: ${await el.textContent()}`);
        }
    }

    // 16. 检查商店
    console.log('\n【15】商店测试');
    await closeAllModals();
    const shopBtn = await page.$('text=商店');
    if (shopBtn && await shopBtn.isVisible()) {
        await shopBtn.click({ force: true });
        await page.waitForTimeout(1000);
        const modalTitle = await page.$('#modal-title');
        if (modalTitle) {
            console.log(`   商店标题: ${await modalTitle.textContent()}`);
        }
        await closeAllModals();
    }

    // 17. 检查日志
    console.log('\n【16】游戏日志测试');
    const logContent = await page.$('#log-content');
    if (logContent) {
        const logHtml = await logContent.innerHTML();
        console.log(`   日志长度: ${logHtml.length}`);
        console.log(`   包含"读文献": ${logHtml.includes('读文献')}`);
        console.log(`   包含"选题": ${logHtml.includes('选题')}`);
        console.log(`   包含"资料搜集": ${logHtml.includes('资料搜集')}`);
    }

    // 18. 检查错误
    console.log('\n【17】错误检查');
    const criticalErrors = allLogs.filter(l => l.includes('[PAGE_ERROR]') || (l.includes('[error]') && !l.includes('404') && !l.includes('Failed to load resource')));
    if (criticalErrors.length > 0) {
        console.log('   发现关键错误:');
        criticalErrors.forEach(e => console.log(`   ❌ ${e}`));
    } else {
        console.log('   ✅ 没有关键错误');
    }

    // 19. 截图
    await page.screenshot({ path: 'test_comprehensive.png', fullPage: true });
    console.log('\n✅ 测试完成，截图已保存');

    await page.waitForTimeout(5000);
    await browser.close();
})();
