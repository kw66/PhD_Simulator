# 📋 文科版研究生模拟器 — 功能需求文档 (FRD)

> 版本: v1.1
> 日期: 2026-06-07
> 状态: 第二次代码审计完成 + 36 个 Bug 已修复
> 基线: 基于代码审计 + 统一设计方案 + 36 个 Bug 修复
> 仓库: https://github.com/mengyuchun/PhD_Simulator
> 共享 Supabase 数据库（与原项目 kw66/PhD_Simulator 同实例）

---

## 一、文档说明

### 1.1 目的

本文档定义文科版研究生模拟器的**待实现功能**和**待修复问题**，作为后续开发的参考依据。已完整实现且无需调整的系统不在本文档范围内。

### 1.2 优先级定义

| 优先级 | 含义 | 预期周期 |
|--------|------|---------|
| P0 | 必须完成，影响核心体验 | 1 周内 |
| P1 | 重要内容，显著提升品质 | 2 周内 |
| P2 | 锦上添花，可分批迭代 | 1 个月内 |
| P3 | 远期规划，视资源决定 | 不限 |

### 1.3 需求状态

| 状态 | 含义 |
|------|------|
| 🟡 待开发 | 尚未开始 |
| 🔵 开发中 | 正在进行 |
| 🟢 已完成 | 开发完毕并通过验收 |
| ⚪ 已取消 | 不再计划实现 |

---

## 二、P0 — 必须完成

### FRD-001 清理调试日志

| 字段 | 内容 |
|------|------|
| 优先级 | P0 |
| 状态 | 🟡 待开发 |
| 影响文件 | `stats.js`, `online.js`, `endings.js`, `characters.js`, `gameLoop.js`, `panels.js`, `modals.js`, `review.js`, `la_save.js` 等 13+ 个文件 |

**描述**：项目中存在 150+ 处 `console.log` 调试语句，包括 emoji 标记日志（✅❌⚠️📊）、注释标注为"添加调试日志"的临时代码。这些语句污染浏览器控制台，影响性能，暴露内部逻辑。

**需求**：

1. 引入简单的日志级别控制机制，例如：
   ```javascript
   const LOG_LEVEL = (typeof IS_LIBERAL_ARTS !== 'undefined') ? 'warn' : 'debug';
   const logger = {
       debug: (...args) => LOG_LEVEL === 'debug' && console.log(...args),
       info:  (...args) => ['debug','info'].includes(LOG_LEVEL) && console.log(...args),
       warn:  (...args) => console.warn(...args),
       error: (...args) => console.error(...args),
   };
   ```
2. 将所有 `console.log` 替换为 `logger.debug` 或 `logger.info`
3. 保留所有 `console.error` 和 `console.warn`（合理的错误处理）
4. 生产环境默认 `LOG_LEVEL = 'warn'`

**验收标准**：
- [ ] 浏览器控制台在正常游玩时无 `console.log` 输出
- [ ] 仅 warn/error 级别日志可见
- [ ] 开发者可通过修改 `LOG_LEVEL` 开启详细日志

---

### FRD-002 验证文科版操作消耗

| 字段 | 内容 |
|------|------|
| 优先级 | P0 |
| 状态 | 🟡 待开发 |
| 影响文件 | `papers.js` |

**描述**：设计方案规定文科版操作 SAN 消耗低于理科版（读文献 SAN-1、选题 SAN-1、资料搜集 SAN-2、写论文 SAN-3、打工 SAN-3 起），但需验证 `papers.js` 中的实际代码是否已应用这些值。

**需求**：

1. 检查 `papers.js` 中以下操作的 SAN 消耗值：
   - `readLiterature()` / 读文献
   - `thinkIdea()` / 选题
   - `doExperiment()` / 资料搜集
   - `writePaper()` / 写论文
   - 打工相关函数
2. 如果仍使用理科版值，通过 `IS_LIBERAL_ARTS` 开关覆盖为文科版值
3. 如果已实现，记录实际值并更新设计方案文档

**验收标准**：
- [ ] 文科版模式下，各操作 SAN 消耗与设计方案一致
- [ ] 理科版模式不受影响
- [ ] 数值变更在 UI 上有对应提示

---

### FRD-003 验证文科版毕业要求

| 字段 | 内容 |
|------|------|
| 优先级 | P0 |
| 状态 | 🟡 待开发 |
| 影响文件 | `relationships.js`, `gameLoop.js` |

**描述**：设计方案规定文科版毕业要求低于理科版（优秀硕士≥3、博士毕业≥5、优秀博士 A 类≥2），需验证是否已生效。

**需求**：

1. 检查 `relationships.js` 中导师毕业要求的数值
2. 检查 `gameLoop.js` 中 `checkGraduation()` 的判定逻辑
3. 确认文科版模式下毕业要求与设计方案一致

**验收标准**：
- [ ] 文科版毕业要求与设计方案数值表一致
- [ ] 理科版毕业要求不受影响
- [ ] 不同导师类型的差异化要求正确生效

---

### FRD-004 完善 .gitignore

| 字段 | 内容 |
|------|------|
| 优先级 | P0 |
| 状态 | 🟢 已完成 |
| 影响文件 | `.gitignore` |

**描述**：`.gitignore` 已补充 `.claude/`、`.env`、`*.log`、`.DS_Store`、`Thumbs.db` 等规则。

---

## 三、P1 — 重要内容

### FRD-005 生活类事件

| 字段 | 内容 |
|------|------|
| 优先级 | P1 |
| 状态 | 🟡 待开发 |
| 影响文件 | `events.js`, `la_events.js` |

**描述**：当前文科版事件以学术类为主，缺少贴近研究生日常生活的事件。需要新增生活类事件增强代入感。

**需求**：

新增以下生活类事件，每个事件包含 2-3 个选项和对应效果：

| 事件 | 选项 | 效果 |
|------|------|------|
| 食堂涨价 | 继续吃食堂 / 自己做饭 / 点外卖 | 金钱-1 / SAN-1 金钱+1 / 金钱-2 SAN+1 |
| 宿舍矛盾 | 忍让 / 沟通解决 / 换宿舍 | SAN-2 / 社交+1 / 金钱-2 SAN+1 |
| 家里催婚 | 敷衍应对 / 认真沟通 / 带对象回家 | SAN-1 / SAN+1 / 好感+1（需有恋人） |
| 同学聚会 | 积极参加 / 委婉拒绝 / 带论文去 | SAN+1 社交+1 / SAN+1 / SAN-1 科研+1 |
| 论文被拒后 | 认真修改 / 换期刊 / 放弃这篇 | SAN-2 论文+2 / SAN-1 / SAN+1 |
| 导师催稿 | 加班赶工 / 解释困难 / 求助同学 | SAN-3 写作+2 / 好感条件判定 / 社交条件判定 |
| 图书馆占座 | 早起占座 / 网上预约 / 去咖啡厅 | SAN-1 科研+1 / 无事 / 金钱-1 SAN+1 |
| 论文被引用 | 高兴 / 继续研究 / 分享朋友圈 | SAN+2 / 科研+1 / 社交+1 |

**验收标准**：
- [ ] 每个事件有 2-3 个选项，选项文本和效果与上表一致
- [ ] 条件选项（好感/社交判定）正确触发
- [ ] 事件在文科版模式下可正常触发
- [ ] 事件出现频率合理（不喧宾夺主）

---

### FRD-006 导师互动事件补充

| 字段 | 内容 |
|------|------|
| 优先级 | P1 |
| 状态 | 🟡 待开发 |
| 影响文件 | `events.js` |

**描述**：当前导师互动主要通过随机事件触发，缺少主动型互动事件。需要补充读书报告、学术讨论等常规互动。

**需求**：

新增以下导师互动事件：

| 事件 | 触发条件 | 效果 |
|------|---------|------|
| 读书报告 | 每月 10% 概率 | 好感+1，科研+1 |
| 论文修改指导 | 有论文在写时 15% 概率 | 好感+1，写作+1 |
| 学术讨论 | 科研≥6 时 10% 概率 | 好感+1，选题+1 |
| 生日祝福 | 每年第 1 个月 | 好感+2 |
| 教师节礼物 | 每年第 2 个月 | 选项：送礼物（好感+1~3，金钱-1~2）/ 不送（无效果） |
| 帮导师干活 | 随机 8% 概率 | 选项：答应（好感+1，SAN-2）/ 拒绝（好感-1） |

**验收标准**：
- [ ] 事件按设定概率触发
- [ ] 生日/教师节事件每年仅触发一次
- [ ] 好感/社交条件判定正确

---

### FRD-007 修复留言板 XSS 残余

| 字段 | 内容 |
|------|------|
| 优先级 | P1 |
| 状态 | 🟡 待开发 |
| 影响文件 | `online.js` |

**描述**：留言板的 `onclick` 事件处理器中使用模板字符串直接拼接用户输入，`escapeHtml()` 不能防御 `onclick` 属性中的单引号逃逸。

**需求**：

将 `onclick` 中的字符串拼接改为 `data-*` 属性 + `addEventListener` 方式：

```javascript
// 当前（有风险）
onclick="setReplyTo(${msg.id}, '${escapeHtml(msg.nickname)}', '${escapeHtml(msg.content)}')"

// 改为（安全）
data-reply-id="${msg.id}" data-reply-name="${escapeHtml(msg.nickname)}"
// JS 中通过 addEventListener 绑定
```

**验收标准**：
- [ ] 留言板回复功能正常工作
- [ ] 包含单引号的昵称不会导致 JS 注入
- [ ] 通过手动测试验证（输入 `'>alert(1)</alert>` 作为昵称）

---

### FRD-008 清理死代码字段

| 字段 | 内容 |
|------|------|
| 优先级 | P1 |
| 状态 | 🟡 待开发 |
| 影响文件 | `state.js`, `save.js` |

**描述**：`gameState` 中存在 5 个确认未使用的字段，占用状态空间且增加存档体积。

**需求**：

以下字段从 `getInitialState()` 中移除，并在 `save.js` 的加载逻辑中添加兼容处理（旧存档包含这些字段时忽略）：

| 字段 | 原用途 | 移除原因 |
|------|--------|---------|
| `firstJournalMonth` | 首次发表月份 | 从未被赋值，始终为 0 |
| `citation100Month` | 达到 100 引用的月份 | 被赋值但从未被读取 |
| `citation1000Month` | 达到 1000 引用的月份 | 被赋值但从未被读取 |
| `nextIdeaResearchBonus` | 下次选题科研加成 | 从未在游戏逻辑中使用 |
| `nextIdeaBonusSource` | 加成来源 | 从未在游戏逻辑中使用 |

**验收标准**：
- [ ] 字段从 `state.js` 中移除
- [ ] 旧存档加载不报错
- [ ] 新存档不包含这些字段
- [ ] 游戏功能不受影响

---

## 四、P2 — 锦上添花

### FRD-009 剧情对话系统

| 字段 | 内容 |
|------|------|
| 优先级 | P2 |
| 状态 | 🟡 待开发 |
| 影响文件 | `events.js`, `modals.js` |

**描述**：为重要事件添加剧情对话弹窗，增强沉浸感和故事感。对话以导师、同门、恋人等角色的口吻呈现。

**需求**：

1. 设计对话数据结构：
   ```javascript
   const DIALOG = {
       paper_accepted: {
           scenes: [
               { speaker: '系统', text: '你打开邮箱，看到了期刊的录用通知。' },
               { speaker: '你', text: '中了！！！' },
               { speaker: '导师', text: '不错，继续努力。' },
               { speaker: '旁白', text: '虽然只有四个字，但你知道这是导师最高的评价。' }
           ],
           effects: { san: 10, research: 2, favor: 2 }
       }
   };
   ```

2. 为以下场景编写对话：

| 场景 | 对话要点 |
|------|---------|
| 论文被接收 | 激动 → 给导师发消息 → 导师简短回复 |
| 论文被拒 | 失望 → 看审稿意见 → 决定修改重投 |
| 开题报告被否 | 紧张 → 导师指出问题 → 获得指导方向 |
| 深夜写论文 | 疲惫 → 再写一点 → 决定睡觉 |
| 收到家人快递 | 惊喜 → 拆开 → 感受到家的温暖 |
| 导师请吃饭 | 欢呼 → 吃饭聊天 → 感受师门温暖 |
| 和同学聚餐 | 干杯 → 聊论文进度 → 互相鼓励 |
| 图书馆偶遇 | 惊喜 → 聊研究 → 获得推荐文献 |

3. 季节氛围文案（每季度随机触发 1 次）：

| 季节 | 文案 |
|------|------|
| 春 | 🌸 校园里的樱花开了，你忍不住停下来看了一会儿。 |
| 夏 | ☀️ 热得不想出门，空调房里写论文。 |
| 秋 | 🍂 银杏叶黄了，校园变得好美。 |
| 冬 | ❄️ 好冷，不想起床...再睡五分钟... |

4. 导师对话按好感度分段：

| 好感度 | 导师口吻 |
|--------|---------|
| 1-5 | 冷淡、批评为主："你这个选题不太行，回去重新想想。" |
| 6-12 | 正常指导："这个方向还可以，但是要多读文献。" |
| 13-20 | 鼓励认可："你最近进展不错，我看好你。" |

**验收标准**：
- [ ] 对话以打字机效果逐字显示
- [ ] 玩家可点击跳过或自动播放
- [ ] 对话结束后正确应用效果（SAN/科研/好感等）
- [ ] 季节文案每季度最多触发 1 次
- [ ] 导师对话口吻与当前好感度匹配

---

### FRD-010 日常/季节事件

| 字段 | 内容 |
|------|------|
| 优先级 | P2 |
| 状态 | 🟡 待开发 |
| 影响文件 | `events.js` |

**描述**：当前事件以学术类为主，缺少日常小事和季节特色事件。需要新增轻量级事件增加生活气息。

**需求**：

**日常事件**（每月 1-2 次，效果轻微）：

| 事件 | 效果 |
|------|------|
| 喝奶茶 | SAN+2，金钱-1 |
| 追剧 | SAN+3 |
| 运动 | SAN+2 |
| 睡懒觉 | SAN+4 |
| 整理笔记 | 科研+1 |
| 和同学聊天 | 社交+1 |

**季节事件**（每季 1 次）：

| 季节 | 事件 | 选项 |
|------|------|------|
| 春 | 踏青 | 一起去（SAN+3 社交+1）/ 留实验室（科研+1）/ 自己玩（SAN+2） |
| 夏 | 避暑 | 图书馆蹭空调（科研+1）/ 宿舍吹空调（SAN+2）/ 游泳（SAN+3） |
| 秋 | 赏秋 | 拍照（SAN+2 社交+1）/ 写论文（科研+1）/ 和恋人散步（SAN+3 好感+1，需有恋人） |
| 冬 | 取暖 | 图书馆（科研+1）/ 宿舍（SAN+2）/ 吃火锅（SAN+3 金钱-2） |

**验收标准**：
- [ ] 日常事件效果轻微，不影响核心平衡
- [ ] 季节事件每季度最多触发 1 次
- [ ] 需要恋人条件的选项在无恋人时隐藏

---

### FRD-011 音效系统实现

| 字段 | 内容 |
|------|------|
| 优先级 | P2 |
| 状态 | 🟡 待开发 |
| 影响文件 | `la_music.js` |

**描述**：`la_music.js` 已建立音效框架，但所有音效使用空 base64 占位符，`LA_MUSIC` 的 `src` 为空字符串。需要填充实际音效资源。

**需求**：

1. 准备以下音效资源（建议使用免费音效库如 freesound.org）：

| 操作 | 音效 | 时长 |
|------|------|------|
| 按钮点击 | 清脆点击声 | <0.5s |
| 中稿通知 | 欢呼声/叮咚声 | 1-2s |
| 拒稿通知 | 叹息声 | 1-2s |
| 属性提升 | 上升音 | <0.5s |
| 属性下降 | 下降音 | <0.5s |
| 成就解锁 | 奖杯声 | 1-2s |
| 月份推进 | 翻页声 | <0.5s |

2. 音效开关：在设置中添加音效开关，默认关闭（避免打扰）
3. 音量控制：使用 Web Audio API 或 `<audio>` 元素，支持音量调节

**验收标准**：
- [ ] 音效在对应操作时正确播放
- [ ] 默认关闭，玩家可手动开启
- [ ] 不影响游戏性能（音效预加载）
- [ ] 移动端兼容

---

### FRD-012 CDN 版本锁定与 SRI 校验

| 字段 | 内容 |
|------|------|
| 优先级 | P2 |
| 状态 | 🟡 待开发 |
| 影响文件 | `index.html`, `index_liberal_arts.html` |

**描述**：Supabase SDK 仅锁定主版本 `@2`，且所有 CDN 引用缺少 `integrity` 属性。

**需求**：

1. 锁定 Supabase SDK 到具体版本：
   ```html
   <!-- 当前 -->
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   <!-- 改为 -->
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0" crossorigin="anonymous"></script>
   ```

2. 为所有 CDN 引用添加 SRI 校验（integrity + crossorigin）：
   - Font Awesome
   - Supabase SDK
   - html2canvas（careerSummary.js 中动态加载的版本）

**验收标准**：
- [ ] 所有 CDN 引用有具体版本号
- [ ] 所有 CDN 引用有 `integrity` 和 `crossorigin` 属性
- [ ] 页面正常加载，无 SRI 校验失败

---

## 五、P3 — 远期规划

### FRD-013 特殊模式：学科交叉模式

| 字段 | 内容 |
|------|------|
| 优先级 | P3 |
| 状态 | 🟡 待开发 |
| 影响文件 | 新增 `la_cross_play.js`, 修改 `characters.js` |

**描述**：通关任意 2 个不同学科后解锁的新模式，允许玩家选择跨学科研究方向。

**需求**：

1. 解锁条件：本地 localStorage 记录已通关学科，≥2 个时解锁
2. 进入模式时选择两个学科作为主/辅方向
3. 论文标题混合两个学科风格
4. 审稿人来自不同学科（跨学科专家概率提升）
5. 新增跨学科专属成就和结局

**验收标准**：
- [ ] 未满足解锁条件时不可选择
- [ ] 跨学科论文标题风格正确混合
- [ ] 跨学科专属内容可正常触发

---

### FRD-014 特殊模式：学术圈模拟模式

| 字段 | 内容 |
|------|------|
| 优先级 | P3 |
| 状态 | 🟡 待开发 |
| 影响文件 | 新增文件 |

**描述**：通关 3 个不同学科后解锁的全新视角模式，从审稿人/编辑/导师的角度体验学术圈。

**需求**：

1. 解锁条件：通关 3 个不同学科
2. 提供 3 种视角选择：
   - **审稿人视角**：审阅论文，决定录用/拒稿
   - **期刊编辑视角**：管理期刊，处理投稿
   - **导师视角**：指导研究生，管理课题组
3. 每种视角有独立的游戏目标和胜利条件

**验收标准**：
- [ ] 解锁条件正确
- [ ] 至少 1 种视角可完整游玩
- [ ] 有独立的结局系统

---

### FRD-015 在线排行榜扩展

| 字段 | 内容 |
|------|------|
| 优先级 | P3 |
| 状态 | 🟡 待开发 |
| 影响文件 | `online.js`, `la_online.js` |

**描述**：当前在线系统仅有基础统计，需要扩展学科维度的统计和排行榜。

**需求**：

新增 Supabase 统计维度：

| 统计项 | 说明 |
|--------|------|
| 学科分布 | 各学科选择人数占比（饼图） |
| 学科通关率 | 各学科博士毕业率 |
| 学科平均分 | 各学科平均科研分 |
| 学科最难结局 | 各学科达成率最低的结局 |

新增排行榜：

| 排行榜 | 排序依据 |
|--------|---------|
| 总科研分排行 | 所有学科混排 |
| 学科内排行 | 按学科分组 |
| 速通排行 | 最短时间博士毕业 |
| 成就收集排行 | 单局最多成就 |

**验收标准**：
- [ ] 统计数据正确写入 Supabase
- [ ] 排行榜页面可正常展示
- [ ] 学科筛选功能正常

---

### FRD-016 代码质量重构

| 字段 | 内容 |
|------|------|
| 优先级 | P3 |
| 状态 | 🟡 待开发 |
| 影响文件 | 多个核心文件 |

**描述**：代码审计发现多个结构性问题，需要长期逐步重构。

**需求**（按子项拆分，可独立实施）：

| 子项 | 说明 | 影响文件 |
|------|------|---------|
| 拆分上帝函数 | `nextMonthInternal()` 858 行，按职责拆分为 `handleMonthStart()`、`processDecay()`、`checkEvents()`、`checkGraduation()` 等 | `gameLoop.js` |
| 提取内联 CSS | `addCareerSummaryStyles()` 2226 行 CSS 移至独立 `careerSummary.css` | `careerSummary.js` |
| 消除 `!important` | styles.css 中 130+ 处 `!important`，通过提高选择器特异性替代 | `styles.css` |
| 合并重复选择器 | `.achievement-item` 在第 102 行和 113 行重复定义 | `styles.css` |
| 引入 ES Module | 将 `window.*` 全局导出改为 `<script type="module">` + `import/export` | 全部 JS 文件 |

**验收标准**：
- [ ] 每个子项可独立提交，不破坏现有功能
- [ ] 重构后游戏行为不变
- [ ] 通过手动回归测试

---

## 六、需求追踪矩阵

| FRD | 需求 | 优先级 | 状态 | 影响文件 |
|-----|------|--------|------|---------|
| 001 | 清理调试日志 | P0 | 🟡 | 13+ 文件 |
| 002 | 验证操作消耗 | P0 | 🟡 | papers.js |
| 003 | 验证毕业要求 | P0 | 🟡 | relationships.js, gameLoop.js |
| 004 | 完善 .gitignore | P0 | 🟢 | .gitignore |
| 005 | 生活类事件 | P1 | 🟡 | events.js |
| 006 | 导师互动事件 | P1 | 🟡 | events.js |
| 007 | 修复留言板 XSS | P1 | 🟡 | online.js |
| 008 | 清理死代码字段 | P1 | 🟡 | state.js, save.js |
| 009 | 剧情对话系统 | P2 | 🟡 | events.js, modals.js |
| 010 | 日常/季节事件 | P2 | 🟡 | events.js |
| 011 | 音效系统 | P2 | 🟡 | la_music.js |
| 012 | CDN 锁定与 SRI | P2 | 🟡 | index.html 等 |
| 013 | 学科交叉模式 | P3 | 🟡 | 新增文件 |
| 014 | 学术圈模拟模式 | P3 | 🟡 | 新增文件 |
| 015 | 在线排行榜扩展 | P3 | 🟡 | online.js, la_online.js |
| 016 | 代码质量重构 | P3 | 🟡 | 多个核心文件 |

**矩阵说明：**
- v1.0 时 16 个需求项均为 🟡 待开发
- v1.1 时 FRD-004 已完成（仅此一项）
- 36 个 Bug 修复不计入此矩阵（见第七节专项追踪）

**v1.1 → v1.2 优先级建议：**
- 若时间有限，下一步优先实现 **FRD-001（清理调试日志）**——已通过 36 个 Bug 修复验证日志污染程度，是技术债清理的切入点
- 其次 **FRD-008（清理死代码字段）**——与 v1.1 已删除的 `LA_ACCEPTANCE_RATES`、`level6/7` 等死代码一脉相承
- **FRD-007（XSS 修复）** 安全相关，应在公开访问前完成

---

## 七、已完成的 Bug 修复追踪（2026-06-07）

> 本节记录通过代码审计发现并已修复的全部 Bug。第一轮 + 第二轮 + 发布前审计共发现 36 个，全部修复并通过 Acorn 2022 严格语法检查（45 个 JS 文件）。

### 7.1 第一轮审计（9 个 Bug）— 全部 ✅

| 编号 | 位置 | 问题 | 修复方案 | 状态 |
|------|------|------|---------|------|
| F-1 | `gameLoop.js:495-506` | 大括号结构错误 | 添加缺失 `}`，删除 906 行多余 `}` | ✅ |
| F-2 | `attributes.js` 四个 `change*` 函数 | 未判断 LA 模式 | 添加 `IS_LIBERAL_ARTS` 分支 | ✅ |
| F-3 | `la_difficulty.js:277` | 日志描述错误 | 修正日志文字 | ✅ |
| F-4 | `la_events.js` 多个问题 | 科研 +/- 符号、chance 事件、双重触发 | 修复符号、避免重复触发 | ✅ |
| F-5 | `la_advisors.js:27` | `titles` 字段名错误 | 改为 `title`（单数） | ✅ |
| F-6 | `la_internship.js` | 金钱可能为负 + 按钮类相同 | 添加 `clampGold()`、按钮类差异化 | ✅ |
| F-7 | `characters.js` | `init` 未暴露到 window | `window.init = init` | ✅ |
| F-8 | `state.js` | `gameState` 未暴露、LA 字段未初始化 | 暴露 `gameState`、初始化 3 个 LA 字段 | ✅ |
| F-9 | `test_liberal_arts.js:50` | 弹窗匹配正则不完整 | 扩展正则 | ✅ |

### 7.2 第二轮审计（24 个 Bug）— 全部 ✅

#### P0 — 核心功能（3 个）

| 编号 | 位置 | 问题 | 修复方案 |
|------|------|------|---------|
| S-1 | `la_save.js:22` | `paperTypeCollection` 是 Set，JSON 序列化失败 | 保存端转数组，加载端还原 Set |
| S-2 | `endings.js:20-42` master 分支 | 无 `IS_LIBERAL_ARTS` 判断 | 在 `la_endings.js` 新增 `getLiberalArtsMasterEndingType()`，master 分支调用 |
| S-3 | `la_endings.js:94` | paperS 双倍计数 | 修正公式 `paperS = paperNature + paperNatureSub` |

#### P1 — 重要功能（6 个）

| 编号 | 位置 | 问题 | 修复方案 |
|------|------|------|---------|
| S-4 | `la_text_replacements.js:21-22` | endings 键不匹配（缺 `！`） | 键加 `！`；`applyAllLATextReplacements` 遍历 `ENDING_REQUIREMENTS` |
| S-5 | `la_achievement_shop.js:200-207` | 三个商品效果未被读取 | `submission.js` 接入 `allKindReviewers`、`review.js` 接入 `guaranteedAccept`、`papers.js` 接入 `freeConference` |
| S-6 | `la_save.js` UI 入口 | 存档管理无可点击入口 | `index_liberal_arts.html` 添加"存档"按钮 |
| S-7 | 3 个 LA 子系统 | `achievement_shop` / `online` / `cross_discipline` 无 HTML 入口 | HTML 添加 3 个 quick-btn |
| S-8 | `la_review.js` 全部函数 | 0 处调用 | `review.js` 接入 `generateLAReviewer` / `getLAReviewThreshold` / `generateLAReviewComment` |
| S-9 | `endings.js:820` | `ENDING_NAMES` 不含 LA 类型 | 三个位置添加 `LA_ENDING_NAMES` / `LA_ENDING_REQUIREMENTS` 回退查找 |

#### P2 — 锦上添花（6 个已修，P2-6/P2-8 标记误报）

| 编号 | 位置 | 问题 | 修复方案 |
|------|------|------|---------|
| S-10 | `la_endings.js:175-176` | 重复"文采飞扬"emoji | 合并为一个条件 |
| S-11 | `la_music.js` 音效系统 | 未初始化 | `characters.js init()` 调用 `initAudioSystem()` |
| S-12 | `la_mobile.js` 移动端 | 未调用 | `characters.js init()` 调用 `initMobileOptimization()` |
| S-13 | `la_mobile.js applyMobileStyles` | style 重复追加 | 添加 `getElementById` guard |
| S-14 | `la_knowledge.js:66` | 函数名误导（实际是顺序遍历） | 注释明确为"顺序遍历" |
| S-15 | `la_endings.js` 5 个 `discipline &&` | 父级已检查 category | 删除冗余判断 |
| S-16 | `la_review.js` | `LA_ACCEPTANCE_RATES` 死代码 | 删除导出和定义 |

#### P3 — 清理（6 个）

| 编号 | 位置 | 问题 | 修复方案 |
|------|------|------|---------|
| S-17 | `la_achievement_shop.js` | 6 个商品 ID 中英文混用 | 全部改为英文小写（`san_kit`、`research_booster` 等） |
| S-18 | `la_career.js` | `LA_ADVISOR_DESCRIPTIONS` `level6/7` 死键 | 删除两个死键 |
| S-19 | `la_save.js` | 存档版本无迁移 | 添加 `LA_DATA_VERSION = '2.0'` + 迁移逻辑 |
| S-20 | `careerSummary.js:1153` | 海报时长格式不一致 | 复用 `${years}年${months}个月` 格式 |
| S-21 | `la_sharing.js` | `window.currentShareData` 永不清洗 | 复制完成后置 `null` |
| S-22 | `la_career.js:106` | 角色引用回退不完整 | 添加 `LA_CHARACTER_QUOTES.chinese.normal` 终极回退 |

### 7.3 发布前审计（3 个严重 Bug）— 全部 ✅

| 编号 | 位置 | 问题 | 修复方案 |
|------|------|------|---------|
| C-1 | `review.js:609, 753` | 用了不存在的 `gameState.disciplineType` 字段 | 改为 `typeof IS_LIBERAL_ARTS !== 'undefined' && IS_LIBERAL_ARTS` |
| C-2 | `submission.js:58` | `allKindReviewers` 永不清洗 | 第一次返回心软后立即 `false` + `addLog` |
| C-3 | `papers.js:2018-2020` | `freeConference` 在弹窗打开时立即重置 | 重置移入"自己出钱"按钮 handler |

### 7.4 文科版基础设施改进

| 编号 | 变更 | 描述 |
|------|------|------|
| I-1 | 项目仓库 | `kw66/PhD_Simulator` → `mengyuchun/PhD_Simulator` |
| I-2 | 作者署名 | `作者：落星峦（原项目）  |  文科版：木叶  |  测试：雁栖湖` |
| I-3 | 数据清除 | 双保险：① `LA_DATA_VERSION = '2.0'` 版本检查触发自动清空 ② 手动"清空所有数据"按钮 |
| I-4 | 通配清理 | `clearAllLiberalArtsData()` 清理所有 `graduateSimulator*` / `graduate_simulator*` / `la_*` / `phdsim_*` 前缀的 key（14+ 个 localStorage 项） |
| I-5 | 云端统计 | 决定保持与原项目共享 Supabase 数据库，文科版用户访问会写入 `ypefmpeekfucmarbbdov.supabase.co` |
| I-6 | 数据迁移 | 旧版本 v1.0 用户访问 v2.0 时自动清空旧存档和旧统计 |

### 7.5 验证情况

- **语法验证**：45 个 JS 文件 Acorn 2022 严格模式全部通过
- **数据迁移验证**：本地版本 `phdsim_la_data_version` 从 v1.0 升级到 v2.0 时自动清空全部旧数据
- **作者链接**：原项目 `xhslink.com/m/A2DFslJF4mb` 保留，理科版不受影响

---

## 八、附录

### 8.1 涉及文件清单（v1.1 更新）

| 文件 | 路径 | 当前行数 | 涉及 FRD | 涉及 Bug 修复 |
|------|------|---------|---------|---------------|
| 游戏主循环 | `js/core/gameLoop.js` | 2152 | 003, 016 | F-1 |
| 全局状态 | `js/core/state.js` | 269 | 008 | F-8 |
| 属性系统 | `js/core/attributes.js` | 580 | 002 | F-2 |
| 论文系统 | `js/features/papers.js` | 2453 | 002 | S-5, C-3 |
| 事件系统 | `js/features/events.js` | 1613 | 005, 006, 009, 010 | F-4 |
| 关系系统 | `js/features/relationships.js` | 1964 | 003 | — |
| 结局系统 | `js/features/endings.js` | 1107 | — | S-2, S-9 |
| 生涯总结 | `js/features/careerSummary.js` | 3744 | 016 | S-20 |
| 投稿系统 | `js/features/submission.js` | 1049 | — | S-5, C-2 |
| 存档系统 | `js/config/la_save.js` | 304 | — | S-1, S-6, S-19, I-3, I-4 |
| 通用存档 | `js/systems/save.js` | 1795 | 008 | — |
| 在线系统 | `js/systems/online.js` | 791 | 007, 015 | — |
| 统计系统 | `js/systems/stats.js` | 1430 | 001 | I-5 |
| 审稿系统 | `js/systems/review.js` | 1493 | — | S-5, S-8, C-1 |
| 角色系统 | `js/features/characters.js` | 1384 | — | F-7, S-11, S-12 |
| 学科选择 | `js/config/disciplines.js` | 334 | — | — |
| 文科结局 | `js/config/la_endings.js` | 228 | — | S-2, S-3, S-10, S-15 |
| 文科生涯 | `js/config/la_career.js` | 119 | — | S-18, S-22 |
| 文科知识 | `js/config/la_knowledge.js` | 123 | — | S-14 |
| 文科移动端 | `js/config/la_mobile.js` | 148 | — | S-12, S-13 |
| 文科审稿 | `js/config/la_review.js` | 197 | — | S-8, S-16 |
| 文科分享 | `js/config/la_sharing.js` | 175 | — | S-21 |
| 文科成就商店 | `js/config/la_achievement_shop.js` | 216 | — | S-5, S-17 |
| 文科文本替换 | `js/config/la_text_replacements.js` | 134 | — | S-4 |
| 音效系统 | `js/config/la_music.js` | 109 | 011 | S-11 |
| 文科版入口 | `index_liberal_arts.html` | 567 | 012 | I-1, I-2, I-3 |
| 样式表 | `css/styles.css` | 7035 | 016 | — |

### 8.2 变更记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-06-07 | v1.0 | 初始版本，基于代码审计和统一设计方案创建 |
| 2026-06-07 | v1.1 | 第二次代码审计完成 + 36 个 Bug 全部修复 + 仓库迁移 + 作者署名更新 + 数据清除机制 |

### 8.3 v1.1 关键变更摘要

| 类别 | 数量 | 详情 |
|------|------|------|
| P0 Bug 修复 | 3 | Set 序列化、master 结局可达、paperS 双倍计数 |
| P1 Bug 修复 | 6 | text 替换键、商品效果、UI 入口、LA 审稿、ending 名字 |
| P2 Bug 修复 | 6 | 重复 emoji、音频/移动端初始化、style 去重、命名、冗余检查、死代码 |
| P3 Bug 修复 | 6 | 商品 ID、advisor 死键、存档迁移、时长格式、share 清洗、引用回退 |
| 发布前发现 | 3 | disciplineType 字段错误、allKindReviewers 永驻、freeConference 误消费 |
| 基础设施 | 6 | 仓库迁移、作者署名、数据清除（双保险）、云端统计共享、版本迁移 |
| **合计** | **30 项变更** | 涉及 17 个文件，+220 / -70 行 |

---

*本文档随开发进度持续更新。*
