# 🎓 PhD Simulator

<div align="center">

一个从 0 开始用 AI 持续迭代的浏览器小游戏。  
体验研究生生涯，在科研、导师、社交、金钱与 SAN 之间做平衡，努力顺利毕业。

[🎮 原版](https://kw66.github.io/PhD_Simulator/) ·
[📚 文科版](mengyuchun.github.io/PhD_Simulator/index_liberal_arts.html) ·
[🏠 原版作者主页](https://kw66.github.io/) ·
[📝 原版作者初始 Prompt](./promopt.txt)

</div>

<p align="center">
  <img src="./assets/readme-cover.jpg" alt="PhD Simulator cover" width="92%">
</p>

## ✨ 项目简介

《研究生模拟器》是一个以研究生科研生活为主题的网页小游戏。  
你需要在有限时间内推进论文、管理 SAN、处理导学关系、维持社交与经济状态，并在不同事件与选择中走向不同结局。

这个项目最初由 AI 根据 prompt 从零生成，之后在真实可玩版本上持续迭代，逐步扩展成一个包含多系统、多事件、多角色、多结局的完整小游戏。

## 👥 作者与致谢

| 角色 | 作者 | 贡献范围 |
|------|------|---------|
| **原作者** | **[kw66](https://github.com/kw66)** (Xulin Li) | 理工版全部内容：核心游戏引擎、论文/导师/关系/商店/事件/结局等系统、UI 框架、在线功能 |
| **文科版作者** | **[mengyuchun](https://github.com/mengyuchun)** (木叶 | 文科版扩展：学科选择系统、35 个文科事件、33 个学科结局、16 个学科角色、44 个商店道具、12 诅咒/12 祝福、8 种审稿人、18 种实习、恋人系统、生涯总结、新手引导、社交分享、移动端优化等 |

> 文科版基于原版理工科研究生模拟器扩展开发，核心引擎与通用模块由原作者 [kw66](https://github.com/kw66) 构建。文科版的所有 `la_*.js` 配置文件、`disciplines.js`、`index_liberal_arts.html` 由 [木叶](https://github.com/mengyuchun) 编写。

## 🎮 核心玩法

- 硕士阶段需要在 **3 年（36 个月）** 内达到导师要求的科研分。
- 达成条件后可以选择转博，博士阶段需要在 **5 年（60 个月）** 内继续推进毕业目标。
- 游戏中需要平衡：
  - 🧠 SAN 值
  - 🔬 科研能力
  - 👥 社交能力
  - ❤️ 导师好感
  - 💰 金钱资源
- 任一关键属性跌破底线，都可能触发不良结局。

## 📚 文科版

文科版基于理工版扩展，面向中国文科类研究生，采用**二分法学科架构**：

```
📖 人文学科：中国语言文学 / 历史学 / 哲学 / 外国语言文学
📊 社会学科：新闻传播学 / 信息资源管理 / 社会学 / 教育学
```

与理工版的主要差异：

| 维度 | 理工版 | 文科版 |
|------|--------|--------|
| SAN 归零 | Game Over | 进入颓废状态（debuff） |
| 金币归零 | Game Over | 进入贫困状态（可借钱/打工） |
| 论文分数 | 每月衰减 10% | 只增不减 |
| 录取率 | 基准 | +10% 加成 |
| 事件系统 | CS 科研事件 | 35 个文科专属事件 + 16 个通用事件 |
| 角色系统 | 6 个角色 | 4 通用 + 16 学科特色（8 学科×2）+ 8 逆位 |
| 结局 | 通用结局 | 33 个结局（含 15 个学科特色结局 + 3 个真实结局） |
| 商店 | 通用道具 | 12 通用 + 32 学科专属（8 学科×4）+ 10 成就币商品 |
| 难度 | 通用诅咒/祝福 | 12 诅咒 + 12 祝福（文科定制） |
| 审稿 | 标准审稿人 | 8 种审稿人类型（含格式审查员、引用绑架者等） |
| 导师 | 标准导师 | 5 级导师等级 × 7 种学校类型 |
| 恋人 | 无 | 2 种恋人类型（聪慧/活泼），各有独立 buff 机制 |
| 实习 | AI Lab | 18 种实习选项（3 通用 + 15 学科专属） |
| 成就 | 通用成就 | 23 通用 + 11 跨学科成就 |

详细设计见 [文科版设计方案](./文科版研究生模拟器_统一设计方案.md)。  
功能需求见 [文科版 FRD](./文科版研究生模拟器_FRD.md)。

## 🧠 系统亮点

| 系统 | 内容 |
| --- | --- |
| 🎭 角色与模式 | 多个初始角色、正位/逆位设定、隐藏觉醒与差异化成长路线 |
| 📄 论文系统 | 看论文、想 idea、做实验、写论文、投稿、审稿、开会、引用增长 |
| 👨‍🏫 导师系统 | 不同导师有不同毕业要求、资源条件、工资水平与事件分支 |
| 🤝 关系系统 | 同门、学者、恋爱、合作、交流与人脉分支共同影响成长 |
| 🛍️ 商店与 Buff | 装备、消耗品、永久效果、成就币商店、临时与长期增益 |
| 🎲 事件与结局 | 随机事件、固定节点、实习、联合培养、特殊成就与多种结局 |

## 🚀 快速开始

| 方式 | 理工版 | 文科版 |
| --- | --- | --- |
| 在线试玩 | [kw66.github.io/PhD_Simulator](https://kw66.github.io/PhD_Simulator/) | [kw66.github.io/PhD_Simulator/index_liberal_arts.html](https://kw66.github.io/PhD_Simulator/index_liberal_arts.html) |
| 本地运行 | 浏览器打开 [index.html](./index.html) | 浏览器打开 [index_liberal_arts.html](./index_liberal_arts.html) |

历史版本：[gemini.html](./gemini.html)、[index_v0.5.html](./index_v0.5.html)、[index0.html](./index0.html)

## 🗂️ 仓库结构

| 路径 | 说明 | 作者 |
| --- | --- | --- |
| [index.html](./index.html) | 理工版入口 | kw66 |
| [index_liberal_arts.html](./index_liberal_arts.html) | 文科版入口（8 个学科可选） | mengyuchun |
| [css/styles.css](./css/styles.css) | 全局样式与界面视觉 | kw66 |
| [js/core/](./js/core) | 核心引擎（游戏循环、状态、属性） | kw66 |
| [js/config/gameData.js](./js/config/gameData.js) | 理工版游戏数据 | kw66 |
| [js/config/la_*.js](./js/config) | 文科版配置文件（22 个） | mengyuchun |
| [js/config/disciplines.js](./js/config/disciplines.js) | 学科选择系统 | mengyuchun |
| [js/features/](./js/features) | 玩法模块（论文、商店、关系等） | kw66 |
| [js/systems/](./js/systems) | 底层系统（存档、审稿、统计、在线） | kw66 |
| [js/ui/](./js/ui) | 界面层 | kw66 |
| [文科版研究生模拟器_统一设计方案.md](./文科版研究生模拟器_统一设计方案.md) | 文科版完整设计文档 | mengyuchun |
| [文科版研究生模拟器_FRD.md](./文科版研究生模拟器_FRD.md) | 文科版功能需求文档 | mengyuchun |
| [promopt.txt](./promopt.txt) | 最初用于生成游戏原型的 prompt | kw66 |
| [gemini.html](./gemini.html) | 早期 AI 生成版本存档 | kw66 |
| [index_v0.5.html](./index_v0.5.html) / [index0.html](./index0.html) | 历史快照 | kw66 |

## 🤖 AI 开发说明

这个项目并不是"一次生成完"的静态产物，而是在 AI 辅助下反复迭代出来的可玩作品。

- 最初版本来自 [promopt.txt](./promopt.txt) 中的 prompt
- 早期尝试保留在 [gemini.html](./gemini.html)
- 后续逐步从单文件原型演进为 `css/ + js/` 的模块化结构
- 近期主要开发与维护工作以 **GPT-5.4** 和 **Claude** 为主
- 文科版由木叶(https://github.com/mengyuchun) 通过Claude Code驱动完成架构设计与代码实现

<details open>

</details>

## 📄 License

本项目为开源项目，遵循原仓库的开源协议。  
文科版扩展内容由 [mengyuchun](https://github.com/mengyuchun) 贡献，遵循相同的开源协议。
