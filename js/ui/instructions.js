		// ==================== 游戏说明系统 ====================

		function showGuide(type) {
			let title = '';
			let content = '';
			
			switch(type) {
				case 'basics':
					title = '📖 基础玩法与属性';
					content = `
		<div style="max-height:60vh;overflow-y:auto;font-size:0.85rem;line-height:1.6;">
			<div style="background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(162,155,254,0.1));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--primary-color);margin:0 0 8px 0;">🎯 游戏目标</h4>
				<ul style="margin:0;padding-left:20px;">
					<li><strong>硕士毕业</strong>：3年（36个月）内达到导师要求的科研分</li>
					<li><strong>博士毕业</strong>：5年（60个月）内达到导师要求的科研分</li>
					<li><strong>转博条件</strong>：硕士第2年或第3年12月达到导师要求即可转博</li>
					<li style="color:var(--warning-color);">⚠️ 毕业要求由入学时选择的导师决定！</li>
				</ul>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">📊 五大属性详解</h4>
				
				<div style="margin-bottom:10px;padding:8px;background:var(--card-bg);border-radius:6px;border-left:3px solid #e74c3c;">
					<strong>🧠 SAN值（精神状态）</strong>
					<div style="font-size:0.8rem;color:var(--text-secondary);">
						• 初始值：20/20<br>
						• 每月自然恢复：+1（逆位大多数+3/+4）<br>
						• <span style="color:var(--danger-color);">降为负数触发"不堪重负"结局</span><br>
						• 设计思路：模拟研究生的精神压力，需要平衡科研强度和休息
					</div>
				</div>
				
				<div style="margin-bottom:10px;padding:8px;background:var(--card-bg);border-radius:6px;border-left:3px solid #3498db;">
					<strong>🔬 科研能力</strong>
					<div style="font-size:0.8rem;color:var(--text-secondary);">
						• 初始值：1，上限：20<br>
						• 直接影响论文分数生成<br>
						• <strong>解锁论文槽</strong>：6→第2槽，12→第3槽，18→第4槽<br>
						• 公式影响：基础分 = 科研能力 × (0.5~1.5随机)<br>
						• 设计思路：核心成长属性，决定论文质量上限
					</div>
				</div>
				
				<div style="margin-bottom:10px;padding:8px;background:var(--card-bg);border-radius:6px;border-left:3px solid #9b59b6;">
					<strong>👥 社交能力</strong>
					<div style="font-size:0.8rem;color:var(--text-secondary);">
						• 初始值：1，上限：20<br>
						• 达到<strong>6级</strong>：解锁开会高级选项、让师弟分担无惩罚<br>
						• 达到<strong>12级</strong>：解锁恋人选项、更多合作机会<br>
						• <span style="color:var(--danger-color);">降为负数触发"被孤立"结局</span><br>
						• 设计思路：影响人际关系和事件选项，高社交能获得更多帮助
					</div>
				</div>
				
				<div style="margin-bottom:10px;padding:8px;background:var(--card-bg);border-radius:6px;border-left:3px solid #e91e63;">
					<strong>❤️ 导师好感度</strong>
					<div style="font-size:0.8rem;color:var(--text-secondary);">
						• 初始值：1，上限：20<br>
						• 达到<strong>6级</strong>：开会报销只扣1好感、导师更容易被说服<br>
						• 达到<strong>12级</strong>：获得更多资源支持<br>
						• <span style="color:var(--danger-color);">降为负数触发"逐出师门"结局</span><br>
						• 设计思路：模拟导学关系，影响资源获取和事件结果
					</div>
				</div>
				
				<div style="padding:8px;background:var(--card-bg);border-radius:6px;border-left:3px solid #f39c12;">
					<strong>💰 金币</strong>
					<div style="font-size:0.8rem;color:var(--text-secondary);">
						• 初始值：1<br>
						• 每月工资：由导师类型决定（硕士1~2/月，博士3~5/月）<br>
						• 用途：商店购物、开会费用、约会开销<br>
						• <span style="color:var(--danger-color);">降为负数触发"穷困潦倒"结局</span><br>
						• 设计思路：模拟经济压力，需要合理规划支出
					</div>
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--warning-color);margin:0 0 8px 0;">🎮 基本操作</h4>
				<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:6px;text-align:left;border-bottom:1px solid var(--border-color);">操作</th>
						<th style="padding:6px;text-align:center;border-bottom:1px solid var(--border-color);">消耗</th>
						<th style="padding:6px;text-align:left;border-bottom:1px solid var(--border-color);">效果</th>
					</tr>
					<tr><td style="padding:6px;">📖 看论文</td><td style="padding:6px;text-align:center;">SAN-2</td><td style="padding:6px;">下次想idea+1分，每5次科研+1</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">💼 打工</td><td style="padding:6px;text-align:center;">SAN-5</td><td style="padding:6px;">金钱+2</td></tr>
					<tr><td style="padding:6px;">💡 想idea</td><td style="padding:6px;text-align:center;">SAN-2</td><td style="padding:6px;">增加论文idea分数</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">🔬 做实验</td><td style="padding:6px;text-align:center;">SAN-3</td><td style="padding:6px;">增加论文实验分数</td></tr>
					<tr><td style="padding:6px;">✍️ 写论文</td><td style="padding:6px;text-align:center;">SAN-4</td><td style="padding:6px;">增加论文写作分数</td></tr>
				</table>
				<div style="margin-top:8px;font-size:0.75rem;color:var(--text-secondary);">
					⚠️ 每月只能执行1次持续操作（隐藏觉醒"勤能补拙"可增加到2次）
				</div>
			</div>
			
			<div style="background:linear-gradient(135deg,rgba(0,184,148,0.1),rgba(85,239,196,0.1));border-radius:10px;padding:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">💡 设计思路</h4>
				<div style="font-size:0.8rem;color:var(--text-secondary);">
					游戏模拟真实研究生生活的资源管理：
					<ul style="margin:5px 0;padding-left:20px;">
						<li><strong>精力有限</strong>：SAN值代表精神状态，过度劳累会崩溃</li>
						<li><strong>多维平衡</strong>：科研、社交、导师关系、经济都需要兼顾</li>
						<li><strong>属性门槛</strong>：6/12是关键节点，解锁更多选项</li>
						<li><strong>建议</strong>：前期优先将科研和社交提升到6，解锁更多可能性</li>
					</ul>
				</div>
			</div>
		</div>`;
					break;
					
				case 'paperScore':
					title = '📊 论文分数计算';
					content = `
		<div style="max-height:60vh;overflow-y:auto;font-size:0.85rem;line-height:1.6;">
			<div style="background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(162,155,254,0.1));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--primary-color);margin:0 0 8px 0;">📐 基础分数公式</h4>
				<div style="background:var(--card-bg);border-radius:8px;padding:10px;font-family:monospace;font-size:0.85rem;">
					<div style="color:var(--success-color);margin-bottom:5px;">// 单次操作生成分数</div>
					基础分 = round(科研能力 × 随机(0.5~1.5) + 随机(0~5))<br>
					最终分 = 基础分 × buff乘数 + buff加成<br><br>
					<div style="color:var(--success-color);margin-bottom:5px;">// 保底机制</div>
					实际分数 = max(生成分数, 当前分数 + 1)
				</div>
				<div style="margin-top:8px;font-size:0.8rem;color:var(--text-secondary);">
					💡 <strong>保底机制</strong>：无论生成多少分，每次操作至少让分数+1
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--warning-color);margin:0 0 8px 0;">📈 分数期望值计算</h4>
				<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:6px;border-bottom:1px solid var(--border-color);">科研能力</th>
						<th style="padding:6px;border-bottom:1px solid var(--border-color);">期望基础分</th>
						<th style="padding:6px;border-bottom:1px solid var(--border-color);">分数范围</th>
					</tr>
					<tr><td style="padding:6px;text-align:center;">1</td><td style="padding:6px;text-align:center;">3.5</td><td style="padding:6px;text-align:center;">1~7</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;text-align:center;">5</td><td style="padding:6px;text-align:center;">7.5</td><td style="padding:6px;text-align:center;">3~13</td></tr>
					<tr><td style="padding:6px;text-align:center;">10</td><td style="padding:6px;text-align:center;">12.5</td><td style="padding:6px;text-align:center;">5~20</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;text-align:center;">15</td><td style="padding:6px;text-align:center;">17.5</td><td style="padding:6px;text-align:center;">8~28</td></tr>
					<tr><td style="padding:6px;text-align:center;">20</td><td style="padding:6px;text-align:center;">22.5</td><td style="padding:6px;text-align:center;">10~35</td></tr>
				</table>
				<div style="margin-top:8px;font-size:0.75rem;color:var(--text-secondary);">
					公式：期望值 = 科研能力 × 1.0 + 2.5（随机部分期望）
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--danger-color);margin:0 0 8px 0;">⏳ 分数衰减机制</h4>
				<div style="background:var(--card-bg);border-radius:8px;padding:10px;font-family:monospace;font-size:0.85rem;">
					每月衰减：idea分数-1，实验分数-1（写作不衰减）<br>
					最低衰减至：1
				</div>
				<div style="margin-top:8px;font-size:0.8rem;color:var(--text-secondary);">
					⚠️ <strong>设计思路</strong>：模拟科研时效性，热点会过时，需要及时投稿<br>
					💡 隐藏觉醒"预见未来热点"可以完全禁止衰减
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">✨ Buff加成系统</h4>
				<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.8rem;">
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;">
						<strong>加法Buff（叠加）</strong><br>
						• 看论文：下次idea+1<br>
						• 导师指点：idea+5<br>
						• 同学合作：实验+5<br>
						• 大牛合作：写作+8
					</div>
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;">
						<strong>乘法Buff（叠加）</strong><br>
						• 大牛交流：idea×1.25<br>
						• 企业交流：实验×1.25<br>
						• AI Lab实习：实验×1.25
					</div>
				</div>
				<div style="margin-top:8px;font-size:0.75rem;color:var(--text-secondary);">
					计算顺序：先乘后加，即 最终分 = 基础分 × 乘数 + 加成
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:#e74c3c;margin:0 0 8px 0;">😰 Debuff惩罚系统</h4>
				<div style="font-size:0.8rem;">
					<div style="padding:8px;background:rgba(231,76,60,0.1);border-radius:6px;margin-bottom:6px;">
						<strong>疲劳累积</strong>（每连续操作5次触发）<br>
						• 灵感枯竭：下次想idea总分÷2<br>
						• 主机发烫：下次做实验总分÷2<br>
						• 无从下笔：下次写论文总分÷2
					</div>
					<div style="padding:8px;background:rgba(231,76,60,0.1);border-radius:6px;">
						<strong>松懈debuff</strong>（连续中稿3篇触发）<br>
						• 下月所有操作总分÷2<br>
						• 休息一个月自动消除
					</div>
				</div>
			</div>
			
			<div style="background:linear-gradient(135deg,rgba(0,184,148,0.1),rgba(85,239,196,0.1));border-radius:10px;padding:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">🎯 投稿分数参考</h4>
				<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:6px;">等级</th>
						<th style="padding:6px;">Poster参考</th>
						<th style="padding:6px;">Oral参考</th>
						<th style="padding:6px;">Best Paper</th>
					</tr>
					<tr><td style="padding:6px;text-align:center;color:#e74c3c;font-weight:bold;">A类</td><td style="padding:6px;text-align:center;">≥70</td><td style="padding:6px;text-align:center;">≥85</td><td style="padding:6px;text-align:center;">≥100</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;text-align:center;color:#f39c12;font-weight:bold;">B类</td><td style="padding:6px;text-align:center;">≥45</td><td style="padding:6px;text-align:center;">≥55</td><td style="padding:6px;text-align:center;">≥70</td></tr>
					<tr><td style="padding:6px;text-align:center;color:#27ae60;font-weight:bold;">C类</td><td style="padding:6px;text-align:center;">≥30</td><td style="padding:6px;text-align:center;">≥35</td><td style="padding:6px;text-align:center;">≥45</td></tr>
				</table>
				<div style="margin-top:8px;font-size:0.75rem;color:var(--text-secondary);">
					⚠️ 以上为参考值，实际录取受审稿人、会议热度等影响
				</div>
			</div>
		</div>`;
					break;
					
				case 'review':
					title = '📝 审稿机制详解';
					content = `
		<div style="max-height:60vh;overflow-y:auto;font-size:0.85rem;line-height:1.6;">
			<div style="background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(162,155,254,0.1));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--primary-color);margin:0 0 8px 0;">👨‍🔬 审稿人类型与概率</h4>
				<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:6px;text-align:left;">类型</th>
						<th style="padding:6px;text-align:center;">概率</th>
						<th style="padding:6px;text-align:left;">特点</th>
					</tr>
					<tr><td style="padding:6px;">普通审稿人</td><td style="padding:6px;text-align:center;">40%</td><td style="padding:6px;font-size:0.75rem;">标准评审，可能给改进建议(+3)</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;color:var(--success-color);">心软审稿人</td><td style="padding:6px;text-align:center;">10%</td><td style="padding:6px;font-size:0.75rem;">宽松评审，看最高两项分数</td></tr>
					<tr><td style="padding:6px;color:var(--primary-color);">资深大牛</td><td style="padding:6px;text-align:center;">10%</td><td style="padding:6px;font-size:0.75rem;">重视idea(×2)，给高质量建议(+8)</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;color:var(--danger-color);">恶意小同行</td><td style="padding:6px;text-align:center;">10%</td><td style="padding:6px;font-size:0.75rem;">严苛评审，看最低两项，SAN-1</td></tr>
					<tr><td style="padding:6px;color:var(--warning-color);">GPT审稿人</td><td style="padding:6px;text-align:center;">20%</td><td style="padding:6px;font-size:0.75rem;">随机权重评审</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;color:var(--danger-color);">39问题审稿人</td><td style="padding:6px;text-align:center;">10%</td><td style="padding:6px;font-size:0.75rem;">只看最低分(×3)，SAN-1</td></tr>
				</table>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--warning-color);margin:0 0 8px 0;">📐 有效分计算公式</h4>
				<div style="font-size:0.8rem;background:var(--card-bg);border-radius:8px;padding:10px;font-family:monospace;">
					<div style="margin-bottom:6px;"><strong>普通/GPT审稿人：</strong></div>
					有效分 = idea×w1 + exp×w2 + write×w3<br>
					<span style="color:var(--text-secondary);">// w1,w2,w3随机，各在0.8~1.4之间，总和为3</span><br><br>
					
					<div style="margin-bottom:6px;"><strong>资深大牛：</strong></div>
					有效分 = idea×2 + exp×0.5 + write×0.5<br><br>
					
					<div style="margin-bottom:6px;"><strong>心软审稿人：</strong></div>
					有效分 = 最高分×1.5 + 次高分×1.5<br><br>
					
					<div style="margin-bottom:6px;"><strong>恶意小同行：</strong></div>
					有效分 = 最低分×1.5 + 次低分×1.5<br><br>
					
					<div style="margin-bottom:6px;"><strong>39问题审稿人：</strong></div>
					有效分 = 最低分×3
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">🎯 录取阈值（A类为例）</h4>
				<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:6px;">审稿人</th>
						<th style="padding:6px;">Reject阈值</th>
						<th style="padding:6px;">Borderline阈值</th>
					</tr>
					<tr><td style="padding:6px;">普通/资深</td><td style="padding:6px;text-align:center;">&lt;50</td><td style="padding:6px;text-align:center;">&lt;80</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">心软</td><td style="padding:6px;text-align:center;">&lt;40</td><td style="padding:6px;text-align:center;">&lt;60</td></tr>
					<tr><td style="padding:6px;">GPT</td><td style="padding:6px;text-align:center;">&lt;40</td><td style="padding:6px;text-align:center;">&lt;90</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">恶意/39问题</td><td style="padding:6px;text-align:center;">&lt;70</td><td style="padding:6px;text-align:center;">&lt;100</td></tr>
				</table>
				<div style="margin-top:8px;font-size:0.75rem;color:var(--text-secondary);">
					判定：有效分 &lt; Reject阈值 → Reject(-1)；&lt; Borderline阈值 → Borderline(0)；否则 → Accept(+1)
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:#9b59b6;margin:0 0 8px 0;">⚖️ PC最终决定</h4>
				<div style="font-size:0.8rem;">
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;margin-bottom:6px;">
						<strong>总审稿分 = 三位审稿人分数之和</strong><br>
						• ≥1：直接录用<br>
						• =0（Borderline）：根据概率判定（基础50%~70%）<br>
						• =-1：小概率录用（基础30%~50%）<br>
						• ≤-2：直接拒稿
					</div>
					<div style="padding:8px;background:rgba(253,203,110,0.15);border-radius:6px;">
						<strong>Borderline录取概率公式</strong><br>
						基础概率 = 等级基础(A:50%,B:60%,C:70%)<br>
						分数修正 = sigmoid((论文分-基准分)/范围) × 12%<br>
						最终概率 = 基础概率 + 分数修正
					</div>
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--info-color);margin:0 0 8px 0;">🌡️ 会议热度调整</h4>
				<div style="font-size:0.8rem;color:var(--text-secondary);">
					<p>当累计投稿≥1000篇时，系统会根据全球投稿数据动态调整录取难度：</p>
					<ul style="margin:5px 0;padding-left:20px;">
						<li><strong>热门会议</strong>（投稿&gt;平均150%）：录取阈值略微提高</li>
						<li><strong>冷门会议</strong>（投稿&lt;平均50%）：录取阈值略微降低</li>
					</ul>
					<p style="color:var(--warning-color);">设计思路：模拟真实会议的竞争程度差异</p>
				</div>
			</div>
			
			<div style="background:linear-gradient(135deg,rgba(0,184,148,0.1),rgba(85,239,196,0.1));border-radius:10px;padding:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">💡 提高中稿率的策略</h4>
				<ul style="font-size:0.8rem;margin:0;padding-left:20px;">
					<li>均衡发展三项分数，避免明显短板</li>
					<li>资深大牛重视idea，需要保证idea分数高</li>
					<li>遇到恶意审稿人时，最低分很关键</li>
					<li>社交达人觉醒可以改变审稿人分布（增加好审稿人概率）</li>
					<li>拒稿后论文会获得改进建议，可重投</li>
				</ul>
			</div>
		</div>`;
					break;
					
				case 'citation':
					title = '📈 引用增长公式';
					content = `
		<div style="max-height:60vh;overflow-y:auto;font-size:0.85rem;line-height:1.6;">
			<div style="background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(162,155,254,0.1));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--primary-color);margin:0 0 8px 0;">📐 核心公式</h4>
				<div style="background:var(--card-bg);border-radius:8px;padding:12px;font-family:monospace;font-size:0.85rem;">
					<div style="color:var(--success-color);margin-bottom:8px;">// 每月引用增长计算</div>
					
					<strong>① 基础增速</strong><br>
					baseScore = max(0, 论文分数 - 2 × 发表月数)<br>
					baseGrowth = baseScore × 0.1<br><br>
					
					<strong>② 会议影响因子</strong><br>
					impactFactor = (该会议中稿均分/平均中稿均分) × (该会议投稿数/平均投稿数)<br>
					<span style="color:var(--text-secondary);">// 范围限制在 0.2 ~ 4.0</span><br><br>
					
					<strong>③ 推广倍率（加法叠加）</strong><br>
					promotionMultiplier = 1 + 各项加成之和<br><br>
					
					<strong>④ 最终增速</strong><br>
					finalGrowth = baseGrowth × impactFactor × promotionMultiplier
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--warning-color);margin:0 0 8px 0;">📊 推广加成明细</h4>
				<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:6px;text-align:left;">推广方式</th>
						<th style="padding:6px;text-align:center;">加成</th>
						<th style="padding:6px;text-align:center;">消耗</th>
					</tr>
					<tr><td style="padding:6px;">📄 挂arxiv</td><td style="padding:6px;text-align:center;color:var(--success-color);">+25%</td><td style="padding:6px;text-align:center;">SAN-3</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">💻 GitHub开源</td><td style="padding:6px;text-align:center;color:var(--success-color);">+50%</td><td style="padding:6px;text-align:center;">SAN-6</td></tr>
					<tr><td style="padding:6px;">📱 小红书宣传</td><td style="padding:6px;text-align:center;color:var(--success-color);">+25%</td><td style="padding:6px;text-align:center;">SAN-3</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">📰 量子位封面（仅A类）</td><td style="padding:6px;text-align:center;color:var(--success-color);">+25%有效分数</td><td style="padding:6px;text-align:center;">金钱-10</td></tr>
					<tr><td style="padding:6px;">📰 机器之心（仅S类）</td><td style="padding:6px;text-align:center;color:var(--success-color);">+25%有效分数</td><td style="padding:6px;text-align:center;">金钱-10</td></tr>
				</table>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--accent-color);margin:0 0 8px 0;">🏆 录取类型加成</h4>
				<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:0.8rem;">
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;text-align:center;">
						<div style="font-size:1.2rem;">📄</div>
						<strong>Poster</strong><br>
						<span style="color:var(--text-secondary);">基础倍率</span>
					</div>
					<div style="padding:8px;background:rgba(253,203,110,0.2);border-radius:6px;text-align:center;">
						<div style="font-size:1.2rem;">🎤</div>
						<strong>Oral</strong><br>
						<span style="color:var(--warning-color);">+50%</span>
					</div>
					<div style="padding:8px;background:rgba(253,121,168,0.2);border-radius:6px;text-align:center;">
						<div style="font-size:1.2rem;">🏆</div>
						<strong>Best Paper</strong><br>
						<span style="color:var(--accent-color);">+400%</span>
					</div>
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--info-color);margin:0 0 8px 0;">📉 分数衰减对引用的影响</h4>
				<div style="font-size:0.8rem;color:var(--text-secondary);">
					<p>公式中 <code>baseScore = max(0, 论文分数 - 2 × 发表月数)</code> 表示：</p>
					<ul style="margin:5px 0;padding-left:20px;">
						<li>论文发表后，基础分每月减少2点</li>
						<li>当基础分降到0时，引用增长停止</li>
						<li>高分论文的引用增长持续时间更长</li>
					</ul>
					<div style="margin-top:8px;padding:8px;background:var(--card-bg);border-radius:6px;">
						<strong>例：论文分数60</strong><br>
						可持续增长月数 = 60 ÷ 2 = 30个月<br>
						前10个月基础增速 = (60-20) × 0.1 = 4引用/月
					</div>
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">🔢 引用增长示例</h4>
				<div style="background:var(--card-bg);border-radius:8px;padding:10px;font-size:0.8rem;">
					<strong>假设：A类Oral论文，分数80，会议影响因子1.2</strong><br>
					推广：arxiv + GitHub开源<br><br>
					
					第1个月计算：<br>
					• baseScore = 80 - 2×1 = 78<br>
					• baseGrowth = 78 × 0.1 = 7.8<br>
					• promotionMultiplier = 1 + 0.5(Oral) + 0.25(arxiv) + 0.5(GitHub) = 2.25<br>
					• finalGrowth = 7.8 × 1.2 × 2.25 = <strong style="color:var(--success-color);">21.06</strong> 引用
				</div>
			</div>
			
			<div style="background:linear-gradient(135deg,rgba(0,184,148,0.1),rgba(85,239,196,0.1));border-radius:10px;padding:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">💡 最大化引用的策略</h4>
				<ul style="font-size:0.8rem;margin:0;padding-left:20px;">
					<li><strong>追求高分投稿</strong>：论文分数直接决定引用增长速度和持续时间</li>
					<li><strong>争取Oral/Best Paper</strong>：提供50%~400%的永久加成</li>
					<li><strong>及时推广</strong>：arxiv+GitHub+小红书组合可达+100%加成</li>
					<li><strong>同门合作buff</strong>：随机事件中约定互挂可获得+100%加成</li>
					<li><strong>A类论文用量子位，S类用机器之心</strong>：+25%有效分数</li>
				</ul>
			</div>
		</div>`;
					break;
					
				case 'events':
					title = '🎲 事件系统';
					content = `
		<div style="max-height:60vh;overflow-y:auto;font-size:0.85rem;line-height:1.6;">
			<div style="background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(162,155,254,0.1));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--primary-color);margin:0 0 8px 0;">📅 固定事件时间表</h4>
				<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:6px;">游戏月份</th>
						<th style="padding:6px;">现实对应</th>
						<th style="padding:6px;">事件</th>
					</tr>
					<tr><td style="padding:6px;text-align:center;">1月（第2年起）</td><td style="padding:6px;text-align:center;">9月</td><td style="padding:6px;">🎓 奖学金评定</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;text-align:center;">2月</td><td style="padding:6px;text-align:center;">10月</td><td style="padding:6px;">🎁 教师节</td></tr>
					<tr><td style="padding:6px;text-align:center;">5月</td><td style="padding:6px;text-align:center;">1月</td><td style="padding:6px;">❄️ 寒假（压岁钱+1，SAN+2）</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;text-align:center;">7月</td><td style="padding:6px;text-align:center;">3月</td><td style="padding:6px;">🎲 随机事件</td></tr>
					<tr><td style="padding:6px;text-align:center;">9月</td><td style="padding:6px;text-align:center;">5月</td><td style="padding:6px;">🏛️ CCIG领域年会</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;text-align:center;">11月</td><td style="padding:6px;text-align:center;">7月</td><td style="padding:6px;">☀️ 暑假（SAN+3）</td></tr>
					<tr><td style="padding:6px;text-align:center;">12月</td><td style="padding:6px;text-align:center;">8月</td><td style="padding:6px;">📝 学年总结（四选一奖励）</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;text-align:center;">偶数月</td><td style="padding:6px;text-align:center;">-</td><td style="padding:6px;">🎲 随机事件</td></tr>
				</table>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--warning-color);margin:0 0 8px 0;">🎓 奖学金要求</h4>
				<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:6px;">年份</th>
						<th style="padding:6px;">科研分要求</th>
						<th style="padding:6px;">奖金</th>
					</tr>
					<tr><td style="padding:6px;text-align:center;">第2年</td><td style="padding:6px;text-align:center;">≥1</td><td style="padding:6px;text-align:center;">5金币</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;text-align:center;">第3年</td><td style="padding:6px;text-align:center;">≥3</td><td style="padding:6px;text-align:center;">5金币</td></tr>
					<tr><td style="padding:6px;text-align:center;">第4年</td><td style="padding:6px;text-align:center;">≥6</td><td style="padding:6px;text-align:center;">8金币</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;text-align:center;">第5年</td><td style="padding:6px;text-align:center;">≥9</td><td style="padding:6px;text-align:center;">8金币</td></tr>
				</table>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">🎲 随机事件池（16种）</h4>
				<div style="font-size:0.8rem;display:grid;grid-template-columns:1fr 1fr;gap:6px;">
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">1. 指导本科生毕设</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">2. 帮导师审稿</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">3. 突然感冒</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">4. 导师安排做项目</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">5. 导师找你谈话</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">6. 实验室组会</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">7. 实验室团建</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">8. 导师经费充足</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">9. 学习新知识</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">10. 同门找你合作</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">11. 师兄师姐合作（社交≥6）</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">12. 导师抢一作</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">13. 服务器坏了</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">14. 指导师弟师妹（有论文后）</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">15. 玩游戏放松</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">16. 数据丢失（有进行中论文）</div>
				</div>
				<div style="margin-top:8px;font-size:0.75rem;color:var(--text-secondary);">
					每年事件池重置，每个事件每年只触发一次
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--accent-color);margin:0 0 8px 0;">🎉 开会事件</h4>
				<div style="font-size:0.8rem;">
					<p>论文中稿后需要参加会议，选择参会方式：</p>
					<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin:8px 0;">
						<div style="padding:6px;background:var(--card-bg);border-radius:4px;text-align:center;">
							💰 自费<br><span style="color:var(--danger-color);">金钱-4</span>
						</div>
						<div style="padding:6px;background:var(--card-bg);border-radius:4px;text-align:center;">
							👨‍🏫 导师报销<br><span style="color:var(--danger-color);">好感-1/-2</span>
						</div>
						<div style="padding:6px;background:var(--card-bg);border-radius:4px;text-align:center;">
							👥 代参加<br><span style="color:var(--text-secondary);">社交≥6免费</span>
						</div>
					</div>
					<p><strong>会议活动选项</strong>（亲自参加时随机3选）：</p>
					<ul style="margin:5px 0;padding-left:20px;font-size:0.75rem;">
						<li>🏖️ 顺便旅游（SAN+6）</li>
						<li>☕ 茶歇+晚宴（SAN+1，社交+1）</li>
						<li>🔬 同行交流（下次实验×3次）</li>
						<li>💡 广泛交流（下次idea×3次）</li>
						<li>🌟 找大牛交流（idea×1.25）→可发展为联合培养</li>
						<li>🏢 找企业交流（实验×1.25）→3次后解锁AI Lab实习</li>
						<li>💕 和异性学者交流（社交≥6）→可发展为恋人</li>
					</ul>
				</div>
			</div>
			
			<div style="background:linear-gradient(135deg,rgba(0,184,148,0.1),rgba(85,239,196,0.1));border-radius:10px;padding:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">💡 事件系统设计思路</h4>
				<ul style="font-size:0.8rem;margin:0;padding-left:20px;">
					<li><strong>属性门槛机制</strong>：社交≥6/12解锁更多选项，好感≥6减少惩罚</li>
					<li><strong>风险收益平衡</strong>：高收益选项通常有更高风险或消耗</li>
					<li><strong>累积效应</strong>：多次与大牛/企业/异性交流可解锁特殊发展路线</li>
					<li><strong>随机性控制</strong>：事件池机制确保玩家能体验到所有事件</li>
				</ul>
			</div>
		</div>`;
					break;
					
				case 'buffs':
					title = '✨ Buff与Debuff';
					content = `
		<div style="max-height:60vh;overflow-y:auto;font-size:0.85rem;line-height:1.6;">
			<div style="background:linear-gradient(135deg,rgba(0,184,148,0.15),rgba(85,239,196,0.15));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">✨ 永久Buff（获取后一直生效）</h4>
				<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:6px;text-align:left;">来源</th>
						<th style="padding:6px;text-align:left;">效果</th>
					</tr>
					<tr><td style="padding:6px;">🪑 人体工学椅（10金）</td><td style="padding:6px;">每月SAN+1</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">⌨️ 机械键盘（8金）</td><td style="padding:6px;">写论文SAN消耗-1</td></tr>
					<tr><td style="padding:6px;">🖥️ 4K显示器（8金）</td><td style="padding:6px;">看论文SAN消耗-1</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">🖥️ GPU服务器（12金）</td><td style="padding:6px;">每次做实验多做1次</td></tr>
					<tr><td style="padding:6px;">🌟 联合培养（大牛深入合作）</td><td style="padding:6px;">每次写论文+8分</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">🏢 AI Lab实习（企业交流3次）</td><td style="padding:6px;">做实验×1.25，每月金+2，SAN-3</td></tr>
					<tr><td style="padding:6px;">💕 恋人-活泼型</td><td style="padding:6px;">每月SAN+3，金-1</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">💕 恋人-聪慧型</td><td style="padding:6px;">每次想idea/实验/写论文+1次，金-1</td></tr>
					<tr><td style="padding:6px;">📖 指点迷津（大牛拒稿）</td><td style="padding:6px;">每次想idea+1分</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">📚 学习新知识</td><td style="padding:6px;">对应操作+1分</td></tr>
				</table>
			</div>
			
			<div style="background:linear-gradient(135deg,rgba(116,185,255,0.15),rgba(162,155,254,0.15));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--info-color);margin:0 0 8px 0;">⏱️ 临时Buff（使用后消失）</h4>
				<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:6px;text-align:left;">来源</th>
						<th style="padding:6px;text-align:left;">效果</th>
					</tr>
					<tr><td style="padding:6px;">📖 看论文</td><td style="padding:6px;">下次想idea+1分</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">🌟 大牛交流</td><td style="padding:6px;">下次想idea×1.25</td></tr>
					<tr><td style="padding:6px;">🏢 企业交流</td><td style="padding:6px;">下次做实验×1.25</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">🤝 同学合作</td><td style="padding:6px;">下次做实验+5分</td></tr>
					<tr><td style="padding:6px;">👨‍🎓 师兄指导</td><td style="padding:6px;">下次想idea+10分</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">💡 开会广泛交流</td><td style="padding:6px;">下次想idea多想3次</td></tr>
					<tr><td style="padding:6px;">🔬 开会同行交流</td><td style="padding:6px;">下次做实验多做3次</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">🤝 同门互挂</td><td style="padding:6px;">下篇中稿引用速度+100%</td></tr>
				</table>
			</div>
			
			<div style="background:linear-gradient(135deg,rgba(253,203,110,0.15),rgba(243,156,18,0.15));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--warning-color);margin:0 0 8px 0;">🤖 本月订阅Buff（月末消失）</h4>
				<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:6px;">商品</th>
						<th style="padding:6px;">价格</th>
						<th style="padding:6px;">效果</th>
					</tr>
					<tr><td style="padding:6px;">Gemini订阅</td><td style="padding:6px;text-align:center;">2金</td><td style="padding:6px;">本月想idea SAN-1，+4分</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">GPT订阅</td><td style="padding:6px;text-align:center;">4金</td><td style="padding:6px;">本月做实验 SAN-1，+4分</td></tr>
					<tr><td style="padding:6px;">Claude订阅</td><td style="padding:6px;text-align:center;">3金</td><td style="padding:6px;">本月写论文 SAN-1，+4分</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">租GPU服务器</td><td style="padding:6px;text-align:center;">2金</td><td style="padding:6px;">本月做实验多做1次</td></tr>
				</table>
			</div>
			
			<div style="background:linear-gradient(135deg,rgba(231,76,60,0.15),rgba(192,57,43,0.15));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--danger-color);margin:0 0 8px 0;">😰 Debuff（负面效果）</h4>
				<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:6px;text-align:left;">名称</th>
						<th style="padding:6px;text-align:left;">触发条件</th>
						<th style="padding:6px;text-align:left;">效果</th>
					</tr>
					<tr><td style="padding:6px;">💫 灵感枯竭</td><td style="padding:6px;">连续想idea 5次</td><td style="padding:6px;">下次想idea总分÷2</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">🔥 主机发烫</td><td style="padding:6px;">连续做实验 5次</td><td style="padding:6px;">下次做实验总分÷2</td></tr>
					<tr><td style="padding:6px;">✏️ 无从下笔</td><td style="padding:6px;">连续写论文 5次</td><td style="padding:6px;">下次写论文总分÷2</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">😴 松懈</td><td style="padding:6px;">连续中稿 3篇</td><td style="padding:6px;">下月所有操作总分÷2</td></tr>
					<tr><td style="padding:6px;">😈 被偷idea</td><td style="padding:6px;">同门学术交流50%</td><td style="padding:6px;">下次想idea总分÷2</td></tr>
				</table>
				<div style="margin-top:8px;font-size:0.75rem;color:var(--text-secondary);">
					💡 debuff在触发对应操作后自动消除；松懈debuff休息一个月可消除
				</div>
			</div>
			
			<div style="background:linear-gradient(135deg,rgba(0,184,148,0.1),rgba(85,239,196,0.1));border-radius:10px;padding:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">💡 Buff系统设计思路</h4>
				<ul style="font-size:0.8rem;margin:0;padding-left:20px;">
					<li><strong>叠加机制</strong>：同类型buff会叠加，乘法buff叠加为加法（两个×1.25 = ×1.5）</li>
					<li><strong>成就追踪</strong>：触发所有类型buff可获得"Buff之神"成就</li>
					<li><strong>策略性消耗</strong>：临时buff需要规划何时使用，配合订阅buff效果更佳</li>
					<li><strong>平衡设计</strong>：强力buff通常有消耗代价或获取条件</li>
				</ul>
			</div>
		</div>`;
					break;
					
				case 'characters':
					title = '👥 角色与觉醒系统';
					content = `
		<div style="max-height:60vh;overflow-y:auto;font-size:0.85rem;line-height:1.6;">
			<div style="background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(162,155,254,0.1));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--primary-color);margin:0 0 8px 0;">☀️ 正位角色一览</h4>
				<div style="font-size:0.8rem;">
					${characters.map(c => `
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;margin-bottom:6px;border-left:3px solid var(--primary-color);">
						<div style="display:flex;justify-content:space-between;align-items:center;">
							<strong>${c.icon} ${c.name}</strong>
							<span style="font-size:0.75rem;color:var(--text-secondary);">${c.bonus}</span>
						</div>
						<div style="font-size:0.75rem;color:var(--success-color);margin-top:4px;">
							⚡ 转博觉醒【${c.awakenName}】：${c.awakenDesc}
						</div>
						${c.hiddenAwakenName ? `
						<div style="font-size:0.75rem;color:#f39c12;margin-top:2px;">
							⚙️ 隐藏觉醒【${c.hiddenAwakenName}】：${c.hiddenAwakenDesc}
						</div>` : ''}
					</div>`).join('')}
				</div>
			</div>
			
			<div style="background:linear-gradient(135deg,rgba(155,89,182,0.1),rgba(231,76,60,0.1));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:#9b59b6;margin:0 0 8px 0;">🌑 逆位角色一览</h4>
				<div style="font-size:0.8rem;">
					${characters.filter(c => c.reversed).map(c => `
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;margin-bottom:6px;border-left:3px solid #9b59b6;">
						<div style="display:flex;justify-content:space-between;align-items:center;">
							<strong>${c.reversed.icon} ${c.reversed.name}</strong>
						</div>
						<div style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px;">${c.reversed.bonus}</div>
						<div style="font-size:0.75rem;color:#e74c3c;margin-top:2px;">
							⚡ 逆位觉醒【${c.reversed.awakenName}】：${c.reversed.awakenDesc}
						</div>
					</div>`).join('')}
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--warning-color);margin:0 0 8px 0;">⚙️ 隐藏觉醒触发条件</h4>
				<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:6px;text-align:left;">角色</th>
						<th style="padding:6px;text-align:left;">隐藏觉醒条件</th>
					</tr>
					<tr><td style="padding:6px;">大多数</td><td style="padding:6px;">转博时科研、社交、好感都≤3</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">院士转世</td><td style="padding:6px;">转博时无A类和B类论文</td></tr>
					<tr><td style="padding:6px;">社交达人</td><td style="padding:6px;">转博时社交≤6</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">富可敌国</td><td style="padding:6px;">转博时金币≤2</td></tr>
					<tr><td style="padding:6px;">导师子女</td><td style="padding:6px;">转博时好感度≤6</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;">天选之人</td><td style="padding:6px;">转博时科研=社交=好感（三项相等）</td></tr>
				</table>
				<div style="margin-top:8px;font-size:0.75rem;color:var(--text-secondary);">
					💡 满足条件时可在普通觉醒和隐藏觉醒之间选择
				</div>
			</div>
			
			<div style="background:linear-gradient(135deg,rgba(255,215,0,0.15),rgba(255,140,0,0.15));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:#d68910;margin:0 0 8px 0;"><span class="gold-icon">👤</span> 真·大多数（隐藏角色）</h4>
				<div style="font-size:0.8rem;">
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;">
						<strong><span class="gold-icon">👤</span> 解锁条件</strong>：6个角色的正位和逆位模式都达到博士毕业（共12个）<br><br>
						<strong>角色特点</strong>：<br>
						• 无初始属性加成<br>
						• 无转博觉醒效果<br>
						• 一切靠自己<br><br>
						<strong>🏆 专属真实结局</strong>：<br>
						• 真·博士毕业：博士毕业且发表≥3篇论文<br>
						• 真·献身科研：博士毕业且总引用>1000<br>
						• 真·感受生活：博士毕业且总引用<=1000且达成>=10成就
					</div>
				</div>
			</div>
			
			<div style="background:linear-gradient(135deg,rgba(0,184,148,0.1),rgba(85,239,196,0.1));border-radius:10px;padding:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">💡 角色选择建议</h4>
				<ul style="font-size:0.8rem;margin:0;padding-left:20px;">
					<li><strong>新手推荐</strong>：天选之人（全面发展）、院士转世（科研强势）</li>
					<li><strong>想快速毕业</strong>：院士转世（科研能力高，论文分数高）</li>
					<li><strong>想体验事件</strong>：社交达人（解锁更多选项）、导师子女（导师关系好）</li>
					<li><strong>想挑战高难度</strong>：逆位模式、真·大多数</li>
					<li><strong>隐藏觉醒流派</strong>：故意压低属性触发隐藏觉醒，获得独特能力</li>
				</ul>
			</div>
		</div>`;
					break;
					
				case 'strategy':
					title = '🎯 进阶策略攻略';
					content = `
		<div style="max-height:60vh;overflow-y:auto;font-size:0.85rem;line-height:1.6;">
			<div style="background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(162,155,254,0.1));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--primary-color);margin:0 0 8px 0;">📈 开局策略（第1年）</h4>
				<div style="font-size:0.8rem;">
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;margin-bottom:6px;">
						<strong>🎯 核心目标</strong>：科研分≥1（拿到第2年奖学金），属性提升到6
					</div>
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;margin-bottom:6px;">
						<strong>📊 推荐节奏</strong>：<br>
						• 前3个月：看论文攒buff，科研能力低时想idea效率低<br>
						• 第4-6月：开始写第一篇论文，目标C类<br>
						• 第7-9月：投稿+准备第二篇<br>
						• 第10-12月：争取中稿，准备转博判定
					</div>
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;">
						<strong>⚠️ 注意事项</strong>：<br>
						• 优先把科研提到6（解锁第2论文槽）<br>
						• 社交提到6（解锁更多事件选项）<br>
						• 保持SAN值≥5，避免崩溃<br>
						• 金钱留3-5备用，应对突发事件
					</div>
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">📝 论文写作最优策略</h4>
				<div style="font-size:0.8rem;">
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;margin-bottom:6px;">
						<strong>🔄 单篇论文流程</strong>：<br>
						1. 先攒buff（看论文、订阅AI工具）<br>
						2. 一口气想3-4次idea（配合buff）<br>
						3. 一口气做3-4次实验（租/买GPU）<br>
						4. 写2-3次论文<br>
						5. 立即投稿（避免衰减）
					</div>
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;margin-bottom:6px;">
						<strong>📊 分数分配建议</strong>：<br>
						• 尽量均衡，避免短板被恶意审稿人抓住<br>
						• idea稍高一点（大牛审稿人重视idea）<br>
						• 投稿前总分目标：A类≥70，B类≥45，C类≥30
					</div>
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;">
						<strong>⏰ 时机选择</strong>：<br>
						• 查看全球统计，选择投稿量较少的"冷门"会议<br>
						• 避免debuff期间投稿（先消化debuff）<br>
						• 转博前确保有论文在审，中稿可获得开会buff
					</div>
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--warning-color);margin:0 0 8px 0;">🔄 转博决策分析</h4>
				<div style="font-size:0.8rem;">
					<table style="width:100%;border-collapse:collapse;margin-bottom:8px;">
						<tr style="background:var(--card-bg);">
							<th style="padding:6px;">时机</th>
							<th style="padding:6px;">要求</th>
							<th style="padding:6px;">建议</th>
						</tr>
						<tr><td style="padding:6px;">第2年12月</td><td style="padding:6px;">科研分≥2</td><td style="padding:6px;">属性好就转，否则等</td></tr>
						<tr style="background:var(--card-bg);"><td style="padding:6px;">第3年12月</td><td style="padding:6px;">科研分≥3</td><td style="padding:6px;">最后机会，建议转</td></tr>
					</table>
					<div style="padding:8px;background:rgba(253,203,110,0.15);border-radius:6px;">
						<strong>💡 转博收益分析</strong>：<br>
						• 觉醒效果非常强力（属性翻倍/特殊能力）<br>
						• 博士工资更高（每月+3 vs +1）<br>
						• 有更多时间冲击高成就<br>
						• 解锁更高级结局（青椒、学术之星、未来院士）
					</div>
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--accent-color);margin:0 0 8px 0;">🏆 成就攻略精要</h4>
				<div style="font-size:0.8rem;">
					<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
						<div style="padding:6px;background:var(--card-bg);border-radius:4px;">
							<strong>❤️ 喜结良缘</strong><br>
							<span style="font-size:0.75rem;">社交≥12后多次与同一异性交流</span>
						</div>
						<div style="padding:6px;background:var(--card-bg);border-radius:4px;">
							<strong>🎯 百发百中</strong><br>
							<span style="font-size:0.75rem;">从不被拒稿（可只投C类保稳）</span>
						</div>
						<div style="padding:6px;background:var(--card-bg);border-radius:4px;">
							<strong>☕ 咖啡爱好者</strong><br>
							<span style="font-size:0.75rem;">每月都买冰美式</span>
						</div>
						<div style="padding:6px;background:var(--card-bg);border-radius:4px;">
							<strong>🏆 全收集</strong><br>
							<span style="font-size:0.75rem;">9种论文类型各中一篇</span>
						</div>
						<div style="padding:6px;background:var(--card-bg);border-radius:4px;">
							<strong>🧒 天才少年</strong><br>
							<span style="font-size:0.75rem;">转博时科研分已≥7</span>
						</div>
						<div style="padding:6px;background:var(--card-bg);border-radius:4px;">
							<strong>🔥 火力全开</strong><br>
							<span style="font-size:0.75rem;">4篇论文同时在审</span>
						</div>
					</div>
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--danger-color);margin:0 0 8px 0;">⚠️ 常见失败原因</h4>
				<div style="font-size:0.8rem;">
					<div style="padding:8px;background:rgba(231,76,60,0.1);border-radius:6px;margin-bottom:6px;">
						<strong>1. SAN值崩溃</strong><br>
						原因：连续高强度操作、逆位大多数的SAN减少翻倍<br>
						对策：保持SAN≥8，购买人体工学椅，适时休息
					</div>
					<div style="padding:8px;background:rgba(231,76,60,0.1);border-radius:6px;margin-bottom:6px;">
						<strong>2. 金钱耗尽</strong><br>
						原因：过度消费、恋人开销、事件选择不当<br>
						对策：保持金钱≥3，打工补充，合理规划开支
					</div>
					<div style="padding:8px;background:rgba(231,76,60,0.1);border-radius:6px;margin-bottom:6px;">
						<strong>3. 导师关系破裂</strong><br>
						原因：多次拒绝导师安排、教师节不送礼<br>
						对策：好感度低时多配合导师，送礼挽回
					</div>
					<div style="padding:8px;background:rgba(231,76,60,0.1);border-radius:6px;">
						<strong>4. 论文质量不足</strong><br>
						原因：科研能力太低、分数衰减、短板明显<br>
						对策：先提升科研能力，攒buff后集中写作
					</div>
				</div>
			</div>
			
			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:#9b59b6;margin:0 0 8px 0;">🌑 逆位模式攻略</h4>
				<div style="font-size:0.8rem;">
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;margin-bottom:6px;">
						<strong>怠惰之大多数</strong>：SAN减少翻倍，但每月回复+3<br>
						策略：减少消耗大的操作，利用高回复平衡
					</div>
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;margin-bottom:6px;">
						<strong>愚钝之院士转世</strong>：科研=0，全论文槽<br>
						策略：靠转化获得金钱和SAN，多写低分论文刷量
					</div>
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;margin-bottom:6px;">
						<strong>贪求之富可敌国</strong>：每月属性重置为1<br>
						策略：觉醒后变为半年重置+消费涨属性，疯狂花钱
					</div>
					<div style="padding:8px;background:var(--card-bg);border-radius:6px;">
						<strong>空想之天选之人</strong>：每月属性随机交换<br>
						策略：接受随机性，突破上限的属性会保留
					</div>
				</div>
			</div>
			
			<div style="background:linear-gradient(135deg,rgba(0,184,148,0.1),rgba(85,239,196,0.1));border-radius:10px;padding:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">🎯 最高结局路线</h4>
				<div style="font-size:0.8rem;">
					<div style="padding:10px;background:var(--card-bg);border-radius:6px;">
						<strong>👑 未来院士路线</strong>：<br>
						要求：A类≥5篇，引用>2000，联合培养<br><br>
						<strong>关键节点</strong>：<br>
						1. 第1年：C类保底拿奖学金，社交提到6<br>
						2. 第2年：冲A类，多参加开会认识大牛<br>
						3. 转博：触发觉醒，联合培养大牛<br>
						4. 博士期：稳定产出A类，做好推广涨引用<br>
						5. 毕业前：确保5篇A类+2000引用+联合培养<br><br>
						<strong>核心策略</strong>：<br>
						• 科研能力尽快到18（开全槽）<br>
						• 开会必须亲自去，发展大牛关系<br>
						• 每篇A类都做完整推广（arxiv+GitHub+小红书）<br>
						• Best Paper论文优先发展（引用×5）
					</div>
				</div>
			</div>
		</div>`;
					break;

				case 'advisor':
					title = '👨‍🏫 导师系统';
					content = `
		<div style="max-height:60vh;overflow-y:auto;font-size:0.85rem;line-height:1.6;">
			<div style="background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(162,155,254,0.1));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--primary-color);margin:0 0 8px 0;">👨‍🏫 导师类型一览</h4>
				<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:8px;">
					入学时会随机生成3位导师供选择，导师类型决定毕业难度和工资水平
				</div>
				<table style="width:100%;font-size:0.75rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:4px;">类型</th>
						<th style="padding:4px;">概率</th>
						<th style="padding:4px;">硕士毕业</th>
						<th style="padding:4px;">博士毕业</th>
						<th style="padding:4px;">工资(硕/博)</th>
					</tr>
					<tr><td style="padding:4px;">📚 副教授</td><td style="padding:4px;text-align:center;">40%</td><td style="padding:4px;text-align:center;">≥1分</td><td style="padding:4px;text-align:center;">≥7分</td><td style="padding:4px;text-align:center;">1/3</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:4px;">🎓 四级教授</td><td style="padding:4px;text-align:center;">25%</td><td style="padding:4px;text-align:center;">≥2分</td><td style="padding:4px;text-align:center;">≥9分</td><td style="padding:4px;text-align:center;">1.25/3</td></tr>
					<tr><td style="padding:4px;">⭐ 三级教授(四青)</td><td style="padding:4px;text-align:center;">20%</td><td style="padding:4px;text-align:center;">≥3分</td><td style="padding:4px;text-align:center;">≥12分</td><td style="padding:4px;text-align:center;">1.25/4</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:4px;">🌟 二级教授(杰青)</td><td style="padding:4px;text-align:center;">10%</td><td style="padding:4px;text-align:center;">≥4分</td><td style="padding:4px;text-align:center;">≥16分</td><td style="padding:4px;text-align:center;">1.5/5</td></tr>
					<tr><td style="padding:4px;color:#b8860b;">🏅 一级教授(院士)</td><td style="padding:4px;text-align:center;">5%</td><td style="padding:4px;text-align:center;">≥4分</td><td style="padding:4px;text-align:center;">≥20分</td><td style="padding:4px;text-align:center;">2/5</td></tr>
				</table>
				<div style="margin-top:6px;font-size:0.7rem;color:var(--text-secondary);">
					💡 工资1.25=每4个月发2元，1.5=每2个月发2元
				</div>
			</div>

			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--warning-color);margin:0 0 8px 0;">🎓 转博要求</h4>
				<table style="width:100%;font-size:0.75rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:4px;">导师类型</th>
						<th style="padding:4px;">第2年转博</th>
						<th style="padding:4px;">第3年转博</th>
					</tr>
					<tr><td style="padding:4px;">📚 副教授</td><td style="padding:4px;text-align:center;">≥2分</td><td style="padding:4px;text-align:center;">≥3分</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:4px;">🎓 四级教授</td><td style="padding:4px;text-align:center;">≥2分</td><td style="padding:4px;text-align:center;">≥4分</td></tr>
					<tr><td style="padding:4px;">⭐ 三级教授</td><td style="padding:4px;text-align:center;">≥3分</td><td style="padding:4px;text-align:center;">≥5分</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:4px;">🌟 二级教授</td><td style="padding:4px;text-align:center;">≥4分</td><td style="padding:4px;text-align:center;">≥6分</td></tr>
					<tr><td style="padding:4px;color:#b8860b;">🏅 一级教授</td><td style="padding:4px;text-align:center;">≥5分</td><td style="padding:4px;text-align:center;">≥7分</td></tr>
				</table>
			</div>

			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">📊 导师特点分析</h4>
				<div style="font-size:0.8rem;">
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;margin-bottom:4px;">
						<strong>📚 副教授（推荐新手）</strong><br>
						毕业要求最低，但工资也最低。适合想要稳定毕业的玩家。
					</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;margin-bottom:4px;">
						<strong>🌟 二级/一级教授</strong><br>
						毕业要求极高，但工资丰厚。适合追求高难度挑战的玩家。
					</div>
				</div>
			</div>

			<div style="background:linear-gradient(135deg,rgba(0,184,148,0.1),rgba(85,239,196,0.1));border-radius:10px;padding:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">💡 选择建议</h4>
				<ul style="font-size:0.8rem;margin:0;padding-left:20px;">
					<li><strong>新手</strong>：选择副教授或四级教授，毕业压力小</li>
					<li><strong>进阶</strong>：选择三级教授，平衡难度和收益</li>
					<li><strong>挑战</strong>：选择二级/一级教授，工资高但要求极高</li>
					<li><strong>逆位角色</strong>：建议选择副教授，降低Game Over风险</li>
				</ul>
			</div>
		</div>`;
					break;

				case 'shop':
					title = '🛒 成就商店与黑市';
					content = `
		<div style="max-height:60vh;overflow-y:auto;font-size:0.85rem;line-height:1.6;">
			<div style="background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(162,155,254,0.1));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--primary-color);margin:0 0 8px 0;">🏪 普通商店（金币）</h4>
				<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:4px;">商品</th>
						<th style="padding:4px;">价格</th>
						<th style="padding:4px;">效果</th>
					</tr>
					<tr><td style="padding:4px;">☕ 冰美式</td><td style="padding:4px;text-align:center;">2金</td><td style="padding:4px;">SAN+3起，每15杯+1（每月限1）</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:4px;">🤖 Gemini订阅</td><td style="padding:4px;text-align:center;">2金</td><td style="padding:4px;">本月想idea SAN-1，+4分</td></tr>
					<tr><td style="padding:4px;">🤖 GPT订阅</td><td style="padding:4px;text-align:center;">4金</td><td style="padding:4px;">本月做实验 SAN-1，+4分</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:4px;">🤖 Claude订阅</td><td style="padding:4px;text-align:center;">3金</td><td style="padding:4px;">本月写论文 SAN-1，+4分</td></tr>
					<tr><td style="padding:4px;">💻 租GPU</td><td style="padding:4px;text-align:center;">2金</td><td style="padding:4px;">本月做实验多做1次</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:4px;">🖥️ 买GPU</td><td style="padding:4px;text-align:center;">12金</td><td style="padding:4px;">永久每次做实验多做1次（可叠加）</td></tr>
					<tr><td style="padding:4px;">🪑 人体工学椅</td><td style="padding:4px;text-align:center;">10金</td><td style="padding:4px;">永久每月SAN+1</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:4px;">⌨️ 机械键盘</td><td style="padding:4px;text-align:center;">8金</td><td style="padding:4px;">永久写论文SAN-3（原-4）</td></tr>
					<tr><td style="padding:4px;">🖥️ 4K显示器</td><td style="padding:4px;text-align:center;">8金</td><td style="padding:4px;">永久看论文SAN-1（原-2）</td></tr>
				</table>
				<div style="margin-top:6px;font-size:0.75rem;color:var(--text-secondary);">
					💡 永久物品可半价出售，预购功能可自动购买订阅类物品
				</div>
			</div>

			<div style="background:linear-gradient(135deg,rgba(155,89,182,0.15),rgba(231,76,60,0.15));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:#9b59b6;margin:0 0 8px 0;">🌙 成就商店（成就币）</h4>
				<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:8px;">
					使用<strong>成就币</strong>购买特殊道具。每局开始时根据历史成就数获得成就币。
				</div>
				<div style="font-size:0.8rem;">
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;margin-bottom:4px;">
						<strong>📘 启研札记</strong>（6成就币）：科研≤3时，科研+1
					</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;margin-bottom:4px;">
						<strong>📗 研思进阶录</strong>（8成就币）：科研≤6时，科研+1
					</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;margin-bottom:4px;">
						<strong>📕 格物精要</strong>（10成就币）：科研≤10时，科研+1
					</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;margin-bottom:4px;">
						<strong>🔥 燃智术</strong>（5成就币）：科研上限-3，科研+1
					</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;margin-bottom:4px;">
						<strong>💀 燃躯术</strong>（5成就币）：SAN上限-3，SAN+6
					</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;margin-bottom:4px;">
						<strong>🌀 万象清零令</strong>（7成就币）：清除所有临时buff和debuff
					</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;margin-bottom:4px;">
						<strong>✨ 晦厄净除符</strong>（10成就币）：只清除所有debuff
					</div>
				</div>
				<div style="margin-top:8px;font-size:0.75rem;color:var(--text-secondary);">
					💡 商品每4个月自动刷新，可花费递增成就币手动刷新，可锁定商品
				</div>
			</div>

			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--warning-color);margin:0 0 8px 0;">🛡️ 护身符系统</h4>
				<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:4px;">护身符</th>
						<th style="padding:4px;">价格</th>
						<th style="padding:4px;">效果</th>
					</tr>
					<tr><td style="padding:4px;">🛡️ 理智护身符</td><td style="padding:4px;text-align:center;">8成就币</td><td style="padding:4px;">SAN≤0时触发，+n（n=持有数）</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:4px;">💰 零钱护身符</td><td style="padding:4px;text-align:center;">12成就币</td><td style="padding:4px;">金币≤0时触发，+n（n=持有数）</td></tr>
					<tr><td style="padding:4px;">🎁 好感护身符</td><td style="padding:4px;text-align:center;">18成就币</td><td style="padding:4px;">好感≤0时触发，+n（n=持有数）</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:4px;">🤝 社交护身符</td><td style="padding:4px;text-align:center;">18成就币</td><td style="padding:4px;">社交≤0时触发，+n（n=持有数）</td></tr>
				</table>
				<div style="margin-top:6px;font-size:0.75rem;color:var(--text-secondary);">
					⚠️ 护身符永久持有不消失，每种每月只触发1次，持有n个则触发时+n
				</div>
			</div>

			<div style="background:linear-gradient(135deg,rgba(0,184,148,0.1),rgba(85,239,196,0.1));border-radius:10px;padding:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">💡 购买建议</h4>
				<ul style="font-size:0.8rem;margin:0;padding-left:20px;">
					<li><strong>优先购买</strong>：理智护身符（最便宜，最常用）</li>
					<li><strong>逆位角色</strong>：必备多个理智护身符和零钱护身符</li>
					<li><strong>科研提升</strong>：根据当前科研等级选择对应的研究札记</li>
					<li><strong>应急道具</strong>：燃躯术可快速回SAN但会降低上限</li>
				</ul>
			</div>
		</div>`;
					break;

				case 'journal':
					title = '📰 期刊与Nature论文';
					content = `
		<div style="max-height:60vh;overflow-y:auto;font-size:0.85rem;line-height:1.6;">
			<div style="background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(162,155,254,0.1));border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--primary-color);margin:0 0 8px 0;">📈 论文槽升级系统</h4>
				<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:8px;">
					发表A类会议论文后，对应槽位可升级为<strong>期刊槽</strong>
				</div>
				<div style="padding:8px;background:var(--card-bg);border-radius:6px;margin-bottom:6px;">
					<strong>普通槽</strong> → 可投：A/B/C类会议，分数每月衰减
				</div>
				<div style="padding:8px;background:linear-gradient(135deg,rgba(155,89,182,0.2),rgba(142,68,173,0.2));border-radius:6px;">
					<strong style="color:#9b59b6;">期刊槽</strong> → <strong>只能</strong>投Nature系列，分数<strong>不衰减</strong>，直接中稿
				</div>
				<div style="margin-top:8px;font-size:0.75rem;color:var(--danger-color);">
					⚠️ 升级后无法恢复为普通槽，且不能再投ABC会议
				</div>
			</div>

			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:#b8860b;margin:0 0 8px 0;">🏆 Nature系列论文</h4>
				<table style="width:100%;font-size:0.8rem;border-collapse:collapse;">
					<tr style="background:var(--card-bg);">
						<th style="padding:6px;">类型</th>
						<th style="padding:6px;">科研分</th>
						<th style="padding:6px;">分数要求</th>
						<th style="padding:6px;">审稿</th>
					</tr>
					<tr><td style="padding:6px;">📚 Nature子刊</td><td style="padding:6px;text-align:center;color:var(--warning-color);font-weight:bold;">10分</td><td style="padding:6px;text-align:center;font-weight:bold;">≥250分</td><td style="padding:6px;text-align:center;color:#9b59b6;">直接中稿</td></tr>
					<tr style="background:var(--card-bg);"><td style="padding:6px;color:#b8860b;">🏆 Nature正刊</td><td style="padding:6px;text-align:center;color:#b8860b;font-weight:bold;">25分</td><td style="padding:6px;text-align:center;font-weight:bold;">≥500分</td><td style="padding:6px;text-align:center;color:#9b59b6;">直接中稿</td></tr>
				</table>
				<div style="margin-top:8px;font-size:0.75rem;color:var(--text-secondary);">
					💡 期刊槽分数不衰减，可以慢慢积累到目标分数
				</div>
			</div>

			<div style="background:var(--light-bg);border-radius:10px;padding:12px;margin-bottom:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">📐 期刊槽特点</h4>
				<div style="font-size:0.8rem;">
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;margin-bottom:4px;">
						📖 <strong>分数不衰减</strong>：idea/实验/写作分数永久保持
					</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;margin-bottom:4px;">
						✅ <strong>直接中稿</strong>：投稿后立即发表，无需等待审稿
					</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;margin-bottom:4px;">
						🎯 <strong>只能投期刊</strong>：升级后不能再投ABC会议
					</div>
					<div style="padding:6px;background:var(--card-bg);border-radius:4px;">
						🏆 <strong>高科研分</strong>：子刊10分，正刊25分
					</div>
				</div>
			</div>

			<div style="background:linear-gradient(135deg,rgba(0,184,148,0.1),rgba(85,239,196,0.1));border-radius:10px;padding:12px;">
				<h4 style="color:var(--success-color);margin:0 0 8px 0;">💡 冲击Nature的建议</h4>
				<ul style="font-size:0.8rem;margin:0;padding-left:20px;">
					<li><strong>前提条件</strong>：先在该槽位发表A类论文，然后升级为期刊槽</li>
					<li><strong>分数积累</strong>：期刊槽分数不衰减，可以慢慢积攒</li>
					<li><strong>分数目标</strong>：子刊需要250分，正刊需要500分</li>
					<li><strong>Buff组合</strong>：AI订阅+大牛联培+设备buff有助于提高分数</li>
					<li><strong>结局解锁</strong>：发表Nature正刊可解锁"诺奖之始"结局</li>
				</ul>
			</div>
		</div>`;
					break;

				default:
					title = '❓ 未知类型';
					content = '<p>请选择有效的说明类型。</p>';
			}
			
			showModal(title, content, [{ text: '关闭', class: 'btn-primary', action: closeModal }]);
		}

