# PhD_Simulator
[点击即玩](https://kw66.github.io/PhD_Simulator/)
用AI从0开始制作“研究生模拟器”小游戏
试了几个AI，claude opus 4.5 thinking真的强，完全可以支持这个体量和复杂度的游戏开发，基本能一次跑通，debug也很在行。
Gemini 3 pro就差点意思了，调了好几天都不行，特别是debug，总是信誓旦旦修好了，结果始终不行，还会自作主张修改要求，不太听话。
deepseek和kimi也稍微尝试了下，总体来说略差于gemini吧，但也有优势之处。
GPT5.1也稍微尝试了下，初步感觉和gemini差不多。

需要做的就是想好游戏逻辑，提问不要很混乱就行。最初版本的提问见promopt.txt。gemini生成的版本见gemini.html。
最初大概3000行代码，还是比较精简就实验游戏核心功能的，后面逐步添加了各种各样的功能就写到了15000行，目前的AI直接处理代码长度还是建议在几千行以下，不然可能会遗忘一些内容。
