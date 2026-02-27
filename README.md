# PhD_Simulator
[点击即玩](https://kw66.github.io/PhD_Simulator/)

[将这段话输入ai中可以生成游戏的最初版本](https://github.com/kw66/PhD_Simulator/blob/main/promopt.txt)

2026.2.28———————————————————————————————

后续用的都是在命令行里调用GPT和Claude或者Gemini，省去了网页端的复制粘贴，可以直接改本地文件，可以分段读取修改整个新项目（现在已经几万行代码了）
Claude Opus4.5是最好用的，后面出了4.6。但也是最贵的，网上找了[全球AI中转](https://globalai.vip/register?aff=Wgrs)或者[米醋中转](https://www.openclaudecode.cn/register?aff=dA1r)便宜一点。
GPT5.2也不错，但是太慢了。后面出了GPT5.3codex便宜大碗，可以平替Claude Opus4.6，也是找了[codexfor中转](https://codex-for.me/?invite=1643)或者[rightcode中转](https://right.codes/register?aff=babe96da)。
AI之间也可以相互调用，需要配置MCP，skill等，还装了[CCswitch](https://github.com/farion1231/cc-switch)来管理几个中转网站。
PS，10天写完博士大论文全靠claude！

2025.12.28——————————————————————————————

用AI从0开始制作“研究生模拟器”小游戏
试了几个AI，claude opus 4.5是最强的，无需太多提问技巧，就可以支持这个体量和复杂度的游戏开发，基本能一次跑通，debug也很在行，缺点是贵。
Gemini 3 pro就差点意思了，功能一复杂就有bug，关键是debug不是很在行，总是信誓旦旦修好了，结果始终不行，还会自作主张修改要求，不太听话。
deepseek和kimi也稍微尝试了下，总体来说略差于gemini吧。GPT5.1也稍微尝试了下，初步感觉和gemini差不多。GPT5.2还没试。

需要做的就是想好游戏逻辑，提问不要很混乱就行。最初版本的提问见promopt.txt。gemini生成的版本见gemini.html。
最初大概3000行代码，还是比较精简就实验游戏核心功能的，后面逐步添加了各种各样的功能就写到了15000+行，然后太长了拆分成多个文件整理一下，后面又持续加了很多功能。
由于上下文长度限制，代码长后不建议在网页端对话，建议在命令行里使用，这样ai可以写本地文件（不用复制粘贴）并可以自己调用搜索命令快速定位读取，超出长度还会自动压缩总结。
