		// ==================== 审稿系统 V3 ====================
		// 特性：
		// 1. 会议热度基于同等级平均投稿量计算
		// 2. 累计投稿≥1000时才启用非对称调整
		// 3. 初始状态下BL录取率基于论文分数计算
		// 4. 不同审稿人类型有不同的调整敏感度

		// ==================== 常量配置 ====================

		// 目标录取率
		const TARGET_ACCEPTANCE_RATES = {
			A: { min: 0.25, max: 0.35, target: 0.30 },
			B: { min: 0.35, max: 0.45, target: 0.40 },
			C: { min: 0.45, max: 0.65, target: 0.55 }
		};

		// 基础阈值配置
		const BASE_THRESHOLDS = {
			A: {
				kind:      { reject: 40, borderline: 60 },
				normal:    { reject: 50, borderline: 80 },
				expert:    { reject: 50, borderline: 80 },
				gpt:       { reject: 40, borderline: 90 },
				hostile:   { reject: 70, borderline: 100 },
				questions: { reject: 70, borderline: 100 }
			},
			B: {
				kind:      { reject: 25, borderline: 40 },
				normal:    { reject: 30, borderline: 50 },
				expert:    { reject: 30, borderline: 50 },
				gpt:       { reject: 25, borderline: 60 },
				hostile:   { reject: 40, borderline: 60 },
				questions: { reject: 40, borderline: 60 }
			},
			C: {
				kind:      { reject: 10, borderline: 20 },
				normal:    { reject: 15, borderline: 30 },
				expert:    { reject: 15, borderline: 30 },
				gpt:       { reject: 15, borderline: 40 },
				hostile:   { reject: 20, borderline: 40 },
				questions: { reject: 20, borderline: 40 }
			}
		};

		// 审稿人分组及调整敏感度
		const REVIEWER_GROUPS = {
			kind: 'lenient',
			normal: 'standard',
			expert: 'standard',
			gpt: 'standard',
			hostile: 'strict',
			questions: 'strict'
		};

		const ADJUSTMENT_SENSITIVITY = {
			lenient: 1.2,   // 宽松型：调整幅度放大
			standard: 1.0,  // 标准型：正常调整
			strict: 0.7     // 严格型：调整幅度缩小
		};

		// Borderline基础概率配置
		const BORDERLINE_BASE_CONFIG = {
			A: { baseRate: 0.50, scoreBaseline: 65, scoreRange: 30 },
			B: { baseRate: 0.60, scoreBaseline: 45, scoreRange: 25 },
			C: { baseRate: 0.70, scoreBaseline: 28, scoreRange: 20 }
		};

		// 启用调整的最小投稿量阈值
		const MIN_SUBMISSIONS_FOR_ADJUSTMENT = 100;

		// ==================== 会议热度计算 ====================

		/**
		 * 计算会议相对热度（基于同等级所有会议的平均投稿量）
		 * @param {number} submissions - 当前会议投稿量
		 * @param {string} grade - 等级 A/B/C
		 * @param {object} submissionStats - 所有月份的统计数据
		 * @param {boolean} isReversed - 是否逆位模式
		 * @returns {object} 热度信息
		 */
		function getConferencePopularity(submissions, grade, submissionStats, isReversed) {
			// 计算同等级所有会议的平均投稿量
			let totalSubmissions = 0;
			let conferenceCount = 0;
			
			for (let month = 1; month <= 12; month++) {
				const key = `${month}_${grade}_${isReversed}`;
				const stats = submissionStats ? submissionStats[key] : null;
				if (stats && stats.submissions > 0) {
					totalSubmissions += stats.submissions;
					conferenceCount++;
				}
			}
			
			// 平均投稿量（如果没有数据则使用默认值）
			const defaultAvg = { A: 200, B: 150, C: 100 }[grade];
			const avgSubmissions = conferenceCount > 0 ? totalSubmissions / conferenceCount : defaultAvg;
			
			// 相对热度比值
			const popularityRatio = submissions / avgSubmissions;
			
			// 热度分级
			let category;
			if (popularityRatio >= 1.5) category = 'very_hot';
			else if (popularityRatio >= 1.15) category = 'hot';
			else if (popularityRatio >= 0.85) category = 'normal';
			else if (popularityRatio >= 0.5) category = 'cold';
			else category = 'very_cold';
			
			// 目标录取率调整（热门会议目标录取率略低）
			// 每偏离平均50%，目标录取率调整±3%，上限±5%
			const targetAdjustment = Math.max(-0.05, Math.min(0.05, (1 - popularityRatio) * 0.06));
			
			return {
				submissions,
				avgSubmissions: Math.round(avgSubmissions),
				ratio: popularityRatio,
				category,
				targetAdjustment
			};
		}

		/*** 获取调整后的目标录取率*/
		function getAdjustedTargetRate(grade, monthStats, submissionStats, isReversed) {
			const baseTarget = TARGET_ACCEPTANCE_RATES[grade];
			
			if (!monthStats || monthStats.submissions < 50) {
				return {
					...baseTarget,
					popularity: null,
					adjusted: false
				};
			}
			
			const popularity = getConferencePopularity(
				monthStats.submissions,
				grade,
				submissionStats,
				isReversed
			);
			
			return {
				min: Math.max(0.10, baseTarget.min + popularity.targetAdjustment),
				max: Math.min(0.70, baseTarget.max + popularity.targetAdjustment),
				target: baseTarget.target + popularity.targetAdjustment,
				popularity,
				adjusted: true
			};
		}

		// ==================== 会议性格系统（新增）====================

		/**
		 * 获取会议的固定基础性格
		 * 基于月份和等级生成稳定的伪随机特性，保证每个会议有独特个性
		 */
		function getBaseConferencePersonality(gameMonth, grade) {
			const gradeNum = {'A': 1, 'B': 2, 'C': 3}[grade];
			const seed = gameMonth * 100 + gradeNum;
			
			// 简单的伪随机生成器（保证同一会议每次结果一致）
			const pseudoRandom = (n) => {
				const x = Math.sin(seed + n * 9999) * 10000;
				return x - Math.floor(x);
			};
			
			return {
				// 严格度：0.6-1.5，影响reject阈值（>1更严格，更容易reject）
				strictness: 0.6 + pseudoRandom(1) * 0.9,
				
				// BL区间宽度：0.5-1.5，影响borderline范围大小（>1范围更大，更多论文进入抽奖）
				borderlineWidth: 0.5 + pseudoRandom(2) * 1.0,
				
				// BL录取倾向：0.5-1.5，影响borderline录取概率（>1更容易中）
				borderlineLeniency: 0.5 + pseudoRandom(3) * 1.0,
				
				// 结果随机性：0-0.35，影响最终结果的随机波动（越高越看运气）
				volatility: pseudoRandom(4) * 0.35,
			};
		}

		/**
		 * 获取最终的会议性格（结合基础性格和历史投稿数据）
		 * 这实现了"玩家驱动"：玩家的投稿行为会影响会议特性
		 */
		function getConferencePersonality(gameMonth, grade, monthStats) {
			const base = getBaseConferencePersonality(gameMonth, grade);
			
			if (!monthStats || monthStats.submissions < 50) {
				return {
					...base,
					dataLevel: 'insufficient',
					adjustmentNote: '数据不足，使用基础性格'
				};
			}
			
			const targetRate = TARGET_ACCEPTANCE_RATES[grade].target;
			const actualRate = monthStats.acceptRate;
			const deviation = actualRate - targetRate;
			
			const strictnessAdjust = deviation * 0.8;
			const leniencyAdjust = -deviation * 0.6;
			
			// 使用 getConferencePopularity 计算真实平均值
			const popularity = getConferencePopularity(
				monthStats.submissions, 
				grade, 
				gameState.submissionStats,
				gameState.isReversed
			);
			const volumeRatio = popularity.ratio;
			const volatilityAdjust = volumeRatio > 1.5 ? -0.1 : volumeRatio < 0.5 ? 0.1 : 0;
			
			return {
				strictness: Math.max(0.5, Math.min(1.8, base.strictness + strictnessAdjust)),
				borderlineWidth: base.borderlineWidth,
				borderlineLeniency: Math.max(0.4, Math.min(1.8, base.borderlineLeniency + leniencyAdjust)),
				volatility: Math.max(0, Math.min(0.4, base.volatility + volatilityAdjust)),
				// ★★★ 删除 expertBonus ★★★
				dataLevel: monthStats.submissions >= 100 ? 'sufficient' : 'moderate',
				adjustmentNote: `录取率${(actualRate*100).toFixed(1)}%→严格度${strictnessAdjust > 0 ? '+' : ''}${(strictnessAdjust*100).toFixed(0)}%`
			};
		}

		/**
		 * 获取会议性格的描述文本（用于UI展示）
		 */
		function getConferencePersonalityDescription(personality) {
			const traits = [];
			
			// 第一行：严格度 + BL区间
			if (personality.strictness > 1.2) traits.push('🔥严格');
			else if (personality.strictness < 0.8) traits.push('😊宽松');
			else traits.push(null);  // 占位
			
			if (personality.borderlineWidth > 1.2) traits.push('🎲多抽奖');
			else if (personality.borderlineWidth < 0.8) traits.push('📊少抽奖');
			else traits.push(null);  // 占位
			
			// 第二行：BL友好度 + 波动性
			if (personality.borderlineLeniency > 1.2) traits.push('🍀BL友好');
			else if (personality.borderlineLeniency < 0.8) traits.push('💀BL严苛');
			else traits.push(null);  // 占位
			
			if (personality.volatility > 0.25) traits.push('🌪️玄学');
			else if (personality.volatility < 0.1) traits.push('📏稳定');
			else traits.push(null);  // 占位
			
			// 过滤掉null
			const row1 = [traits[0], traits[1]].filter(t => t !== null);
			const row2 = [traits[2], traits[3]].filter(t => t !== null);
			
			// 如果完全没有特征
			if (row1.length === 0 && row2.length === 0) {
				return '⚖️中庸';
			}
			
			// 组装文本，每行2个标签（用换行符分隔，兼容title属性）
			let text = '';
			if (row1.length > 0) {
				text += row1.join(' ');
			}
			if (row2.length > 0) {
				if (text) text += '\n';
				text += row2.join(' ');
			}

			return text;
		}

		// ==================== 核心：非对称调整系统 ====================

		// 增加会议性格的影响

		function calculateAsymmetricAdjustment(grade, monthStats, adjustedTarget) {
			// 获取会议性格
			const personality = getConferencePersonality(
				monthStats._gameMonth || 1, 
				grade, 
				monthStats
			);
			
			// 初始化结果
			const result = {
				thresholds: {},
				borderlineBaseRate: BORDERLINE_BASE_CONFIG[grade].baseRate,
				useScoreBasedBL: true,
				adjustmentEnabled: false,
				personality: personality,  // ★★★ 新增：存储性格信息 ★★★
				adjustmentDetails: {
					rejectChange: 0,
					borderlineChange: 0,
					blRateChange: 0,
					reason: ''
				}
			};
			
			// 复制基础阈值，并应用会议性格
			for (const reviewerType in BASE_THRESHOLDS[grade]) {
				const base = BASE_THRESHOLDS[grade][reviewerType];
				
				// ★★★ 修改：应用会议性格到基础阈值 ★★★
				// 严格度影响reject阈值
				const adjustedReject = Math.round(base.reject * personality.strictness);
				
				// BL区间宽度影响borderline阈值
				const blGap = base.borderline - base.reject;
				const adjustedBorderline = adjustedReject + Math.round(blGap * personality.borderlineWidth);
				
				result.thresholds[reviewerType] = {
					reject: adjustedReject,
					borderline: adjustedBorderline
				};
			}
			
			// ★★★ 修改：应用会议性格到BL基础录取率 ★★★
			result.borderlineBaseRate = BORDERLINE_BASE_CONFIG[grade].baseRate * personality.borderlineLeniency;
			result.borderlineBaseRate = Math.max(0.15, Math.min(0.95, result.borderlineBaseRate));
			
			// 条件：累计投稿未达到阈值
			if (monthStats.submissions < MIN_SUBMISSIONS_FOR_ADJUSTMENT) {
				result.adjustmentDetails.reason = 
					`累计投稿${monthStats.submissions}篇，未达到${MIN_SUBMISSIONS_FOR_ADJUSTMENT}篇调整阈值。` +
					`会议性格：${getConferencePersonalityDescription(personality)}`;
				return result;
			}
			
			// 启用调整
			result.adjustmentEnabled = true;
			result.useScoreBasedBL = false;
			
			const actualRate = monthStats.acceptRate;
			const targetRate = adjustedTarget.target;
			const deviation = actualRate - targetRate;
			
			// 在目标范围内不调整
			if (actualRate >= adjustedTarget.min && actualRate <= adjustedTarget.max) {
				result.adjustmentDetails.reason = 
					`录取率${(actualRate * 100).toFixed(1)}%在目标范围内。` +
					`会议性格：${getConferencePersonalityDescription(personality)}`;
				return result;
			}
			
			// 录取率过高
			if (deviation > 0) {
				return adjustForHighAcceptanceRate(grade, deviation, monthStats, result);
			}

			// 录取率过低
			if (deviation < 0) {
				return adjustForLowAcceptanceRate(grade, -deviation, monthStats, result);
			}
			
			return result;
		}

		/*** 录取率过高时的调整，策略：50%通过提高Reject阈值，50%通过降低BL概率*/
		function adjustForHighAcceptanceRate(grade, excess, monthStats, result) {
			const personality = result.personality;  // ★★★ 从result中获取 ★★★
			const halfExcess = excess / 2;
			const estimatedBLRatio = estimateBorderlineRatio(grade, monthStats);
			
			// 严格会议调整幅度更大
			const strictnessMultiplier = personality ? personality.strictness : 1.0;
			
			const rejectAdjustPercent = Math.min(0.40, halfExcess * 2 * strictnessMultiplier);
			const borderlineAdjustPercent = rejectAdjustPercent * 0.3;
			
			const baseBLRate = result.borderlineBaseRate;
			const blRateReduction = estimatedBLRatio > 0 ? halfExcess / estimatedBLRatio : halfExcess;
			result.borderlineBaseRate = Math.max(0.15, baseBLRate - blRateReduction * strictnessMultiplier);
			
			applyThresholdAdjustments(grade, result, rejectAdjustPercent, borderlineAdjustPercent, 'increase');
			
			result.adjustmentDetails = {
				rejectChange: rejectAdjustPercent,
				borderlineChange: borderlineAdjustPercent,
				blRateChange: -(baseBLRate - result.borderlineBaseRate),
				reason: `录取率过高(${(monthStats.acceptRate * 100).toFixed(1)}%)` +
						(personality ? `，${getConferencePersonalityDescription(personality)}` : '')
			};
			
			return result;
		}

		/*** 录取率过低时的调整，策略：优先提高BL概率（最高100%），不够再降低Reject阈值*/
		function adjustForLowAcceptanceRate(grade, deficit, monthStats, result) {
			const personality = result.personality;  // ★★★ 从result中获取 ★★★
			const estimatedBLRatio = estimateBorderlineRatio(grade, monthStats);
			const baseBLRate = result.borderlineBaseRate;
			
			// 宽松会议调整幅度更大
			const leniencyMultiplier = personality ? personality.borderlineLeniency : 1.0;
			
			const blRateRoom = 1.0 - baseBLRate;
			const maxBLContribution = estimatedBLRatio * blRateRoom;
			
			if (deficit <= maxBLContribution * leniencyMultiplier) {
				const blRateIncrease = estimatedBLRatio > 0 ? deficit / estimatedBLRatio : deficit;
				result.borderlineBaseRate = Math.min(1.0, baseBLRate + blRateIncrease * leniencyMultiplier);
				
				result.adjustmentDetails = {
					rejectChange: 0,
					borderlineChange: 0,
					blRateChange: result.borderlineBaseRate - baseBLRate,
					reason: `录取率偏低(${(monthStats.acceptRate * 100).toFixed(1)}%)` +
							(personality ? `，${getConferencePersonalityDescription(personality)}` : '')
				};
				
				return result;
			}
			
			result.borderlineBaseRate = 1.0;
			const remaining = deficit - maxBLContribution;
			const rejectAdjustPercent = Math.min(0.30, remaining * 2 * leniencyMultiplier);
			const borderlineAdjustPercent = rejectAdjustPercent * 0.15;
			
			applyThresholdAdjustments(grade, result, rejectAdjustPercent, borderlineAdjustPercent, 'decrease');
			
			result.adjustmentDetails = {
				rejectChange: -rejectAdjustPercent,
				borderlineChange: -borderlineAdjustPercent,
				blRateChange: 1.0 - baseBLRate,
				reason: `录取率过低(${(monthStats.acceptRate * 100).toFixed(1)}%)，BL概率100%` +
						(personality ? `，${getConferencePersonalityDescription(personality)}` : '')
			};
			
			return result;
		}

		/*** 应用阈值调整到各审稿人*/
		function applyThresholdAdjustments(grade, result, rejectPercent, borderlinePercent, direction) {
			const sign = direction === 'increase' ? 1 : -1;
			
			for (const reviewerType in result.thresholds) {
				const group = REVIEWER_GROUPS[reviewerType];
				const sensitivity = ADJUSTMENT_SENSITIVITY[group];
				const baseThreshold = BASE_THRESHOLDS[grade][reviewerType];
				
				// Reject阈值调整
				const rejectMultiplier = 1 + sign * rejectPercent * sensitivity;
				result.thresholds[reviewerType].reject = Math.round(
					baseThreshold.reject * Math.max(0.70, Math.min(1.35, rejectMultiplier))
				);
				
				// Borderline阈值调整
				const borderlineMultiplier = 1 + sign * borderlinePercent * sensitivity;
				result.thresholds[reviewerType].borderline = Math.round(
					baseThreshold.borderline * Math.max(0.85, Math.min(1.20, borderlineMultiplier))
				);
			}
		}

		/*** 估算Borderline区间比例*/
		function estimateBorderlineRatio(grade, monthStats) {
			// 如果有详细统计
			if (monthStats.borderlineCount !== undefined && monthStats.submissions > 0) {
				return monthStats.borderlineCount / monthStats.submissions;
			}
			
			// 基于录取率估算
			const acceptRate = monthStats.acceptRate || TARGET_ACCEPTANCE_RATES[grade].target;
			// 经验估算：Borderline区间约占 25%-35%
			return Math.min(0.40, Math.max(0.20, acceptRate * 0.8));
		}

		// ==================== Borderline录取概率计算 ====================

		function calculateFinalBorderlineRate(paperScore, grade, reviewScore, adjustment) {
			const config = BORDERLINE_BASE_CONFIG[grade];
			const personality = adjustment.personality || getBaseConferencePersonality(1, grade);
			
			let baseProbability;
			
			if (adjustment.useScoreBasedBL) {
				baseProbability = calculateScoreBasedBLRate(paperScore, grade, reviewScore);
			} else {
				baseProbability = adjustment.borderlineBaseRate;
				
				if (reviewScore === 1) {
					baseProbability = Math.min(0.95, baseProbability + 0.15);
				} else if (reviewScore === -1) {
					baseProbability = Math.max(0.15, baseProbability - 0.15);
				}
			}
			
			// 分数修正
			const scoreModifier = calculateScoreModifier(paperScore, grade);
			
			// ★★★ 新增：应用会议波动性（volatility）★★★
			// 高波动会议：最终概率会有更大的随机偏移
			const volatilityOffset = (Math.random() - 0.5) * 2 * personality.volatility;
			
			// 最终概率
			let finalRate = baseProbability + scoreModifier + volatilityOffset;
			
			return Math.max(0.08, Math.min(0.98, finalRate));
		}


		/*** 基于分数的BL录取率（用于未启用调整时）*/
		function calculateScoreBasedBLRate(paperScore, grade, reviewScore) {
			const config = BORDERLINE_BASE_CONFIG[grade];
			
			// 基础概率根据审稿总分
			let baseProbability;
			switch (reviewScore) {
				case 1:  baseProbability = config.baseRate + 0.25; break;  // 偏正面
				case 0:  baseProbability = config.baseRate; break;          // 中立
				case -1: baseProbability = config.baseRate - 0.20; break;   // 偏负面
				default: baseProbability = config.baseRate;
			}
			
			// 分数影响（使用sigmoid平滑）
			const normalizedScore = (paperScore - config.scoreBaseline) / config.scoreRange;
			const scoreInfluence = (2 / (1 + Math.exp(-normalizedScore)) - 1) * 0.25;
			
			return Math.max(0.15, Math.min(0.90, baseProbability + scoreInfluence));
		}

		/*** 计算分数修正（用于叠加到调整后的基础概率上） */
		function calculateScoreModifier(paperScore, grade) {
			const config = BORDERLINE_BASE_CONFIG[grade];
			const normalizedScore = (paperScore - config.scoreBaseline) / config.scoreRange;
			
			// sigmoid映射，最大±12%修正
			return (2 / (1 + Math.exp(-normalizedScore)) - 1) * 0.12;
		}

		// ==================== 审稿人评审 ====================

		/*** 计算有效分数（根据审稿人权重）*/
		function calculateEffectiveScore(reviewerType, ideaScore, expScore, writeScore) {
			const scores = [
				{ type: 'idea', value: ideaScore },
				{ type: 'exp', value: expScore },
				{ type: 'write', value: writeScore }
			];
			const sortedScores = [...scores].sort((a, b) => a.value - b.value);
			const minScore = sortedScores[0].value;
			const midScore = sortedScores[1].value;
			const maxScore = sortedScores[2].value;
			
			let effectiveScore;
			let weightInfo = '';
			
			switch (reviewerType) {
				case 'expert':
					effectiveScore = ideaScore * 2 + expScore * 0.5 + writeScore * 0.5;
					weightInfo = 'idea×2, exp×0.5, write×0.5';
					break;
				case 'kind':
					effectiveScore = maxScore * 1.5 + midScore * 1.5;
					weightInfo = '最高两项×1.5';
					break;
				case 'hostile':
					effectiveScore = minScore * 1.5 + midScore * 1.5;
					weightInfo = '最低两项×1.5';
					break;
				case 'questions':
					effectiveScore = minScore * 3;
					weightInfo = '最低项×3';
					break;
				
				// ★★★ 修改：GPT审稿人独立处理，随机性大幅增加 ★★★
				case 'gpt':
					// GPT审稿人：权重范围 0.2-1.8，远大于普通审稿人
					const gTotal = 3.0;  // 总权重固定为3
					const gR1 = Math.random() * 1.6;  // 第一个权重 0-1.6
					const gR2 = Math.random() * Math.min(1.6, gTotal - gR1);  // 第二个权重
					const gR3 = gTotal - gR1 - gR2;  // 第三个权重（保证总和为3）
					
					// 随机分配给三个维度
					const gWeights = [gR1, gR2, gR3].sort(() => Math.random() - 0.5);
					const gw1 = Math.max(0.2, Math.min(1.8, gWeights[0]));
					const gw2 = Math.max(0.2, Math.min(1.8, gWeights[1]));
					const gw3 = Math.max(0.2, Math.min(1.8, gWeights[2]));
					
					effectiveScore = ideaScore * gw1 + expScore * gw2 + writeScore * gw3;
					weightInfo = `idea×${gw1.toFixed(2)}, exp×${gw2.toFixed(2)}, write×${gw3.toFixed(2)} (GPT随机)`;
					break;
				
				case 'normal':
				default:
					// 普通审稿人：权重范围 0.8-1.4（较小波动）
					const r1 = Math.random() * 0.6;
					const r2 = Math.random() * (0.6 - r1);
					const r3 = 0.6 - r1 - r2;
					const extras = [r1, r2, r3].sort(() => Math.random() - 0.5);
					const w1 = 0.8 + extras[0];
					const w2 = 0.8 + extras[1];
					const w3 = 0.8 + extras[2];
					effectiveScore = ideaScore * w1 + expScore * w2 + writeScore * w3;
					weightInfo = `idea×${w1.toFixed(2)}, exp×${w2.toFixed(2)}, write×${w3.toFixed(2)}`;
					break;
			}
			
			return { effectiveScore: Math.round(effectiveScore), weightInfo };
		}

		/*** 获取单个审稿人的评审结果*/
		function getReviewResultV2(reviewer, grade, paperScore, ideaScore, expScore, writeScore, adjustment) {
			// 计算有效分
			const { effectiveScore, weightInfo } = calculateEffectiveScore(
				reviewer.type, ideaScore, expScore, writeScore
			);
			
			// 获取阈值（可能已调整）
			const threshold = adjustment.thresholds[reviewer.type];
			
			// 判定结果
			let decision, reviewScore;
			if (effectiveScore < threshold.reject) {
				decision = 'Reject';
				reviewScore = -1;
			} else if (effectiveScore < threshold.borderline) {
				decision = 'Borderline';
				reviewScore = 0;
			} else {
				decision = 'Accept';
				reviewScore = 1;
			}
			
			// 生成评语
			const comment = generateReviewComment(decision, reviewer.type);
			
			// 改进建议（仅特定审稿人提供）
			let improvement = 0, improvementType = '';
			if (reviewer.type === 'normal') {
				improvement = 3;
				improvementType = Math.random() < 0.5 ? 'idea' : 'exp';
			} else if (reviewer.type === 'expert') {
				improvement = 8;
				improvementType = Math.random() < 0.5 ? 'idea' : 'exp';
			}
			
			return {
				reviewer,
				decision,
				score: reviewScore,
				effectiveScore,
				weightInfo,
				thresholds: threshold,
				comment,
				improvement,
				improvementType,
				improvement2: 0,
				improvementType2: ''
			};
		}

		/*** 生成评语*/
		function generateReviewComment(decision, type) {
			if (type === 'questions') return '我有39个问题。';
			
			const positive = ['创新性强，实验充分', '写作清晰，贡献明确', '方法新颖，结果有说服力', '工作扎实，有重要贡献'];
			const negative = ['缺乏创新', '写作不足，表达不清', '实验不足，缺少对比', '贡献有限，增量工作'];
			const neutral = ['有一定创新但实验可加强', '想法有趣但写作需改进', '工作还可以但缺少深入分析'];
			
			if (decision === 'Accept') return positive[Math.floor(Math.random() * positive.length)];
			if (decision === 'Reject') return negative[Math.floor(Math.random() * negative.length)];
			
			const all = [...positive, ...negative, ...neutral];
			return all[Math.floor(Math.random() * all.length)];
		}

		// ==================== 录取类型判定 ====================

		/*** 确定录取类型（Poster/Oral/Best Paper）*/
		function determineAcceptTypeV2(paperScore, grade, monthStats) {
			// 获取分位数阈值
			let p90, p99;
			
			if (monthStats && monthStats.p90AcceptedScore) {
				p90 = monthStats.p90AcceptedScore;
				p99 = monthStats.p99AcceptedScore;
			} else {
				// 默认值
				p90 = { A: 85, B: 55, C: 35 }[grade];
				p99 = { A: 100, B: 70, C: 45 }[grade];
			}
			
			// Best Paper判定
			if (paperScore >= p99) {
				const bpChance = Math.min(0.50, 0.10 + (paperScore - p99) * 0.05);
				if (Math.random() < bpChance) {
					return 'Best Paper';
				}
			}
			
			// Oral判定
			if (paperScore >= p90) {
				const oralChance = Math.min(0.40, 0.15 + (paperScore - p90) * 0.03);
				if (Math.random() < oralChance) {
					return 'Oral';
				}
			}
			
			return 'Poster';
		}

		// ==================== 主处理函数 ====================

		/*** 处理论文审稿结果（主函数 - 替换原processPaperResult）*/
		function processPaperResult(slot) {
			const paper = gameState.papers[slot];
			if (!paper || !paper.reviewing) return;
			
			const grade = paper.submittedGrade;
			const submittedScore = paper.submittedScore;
			const submittedMonth = paper.submittedMonth || gameState.month;
			
			const submittedIdeaScore = paper.submittedIdeaScore || paper.ideaScore;
			const submittedExpScore = paper.submittedExpScore || paper.expScore;
			const submittedWriteScore = paper.submittedWriteScore || paper.writeScore;
			
			// 获取统计数据
			const monthStats = getMonthStats(submittedMonth, grade, gameState.isReversed);
			// ★★★ 新增：为monthStats添加月份信息，供性格系统使用 ★★★
			if (monthStats) {
				monthStats._gameMonth = submittedMonth;
			}
			
			// 计算调整后的目标录取率
			const adjustedTarget = getAdjustedTargetRate(
				grade, 
				monthStats, 
				gameState.submissionStats, 
				gameState.isReversed
			);
			
			// 计算非对称调整参数（现在包含会议性格）
			const adjustment = calculateAsymmetricAdjustment(grade, monthStats, adjustedTarget);
			
			// 记录审稿期间的分数变化
			const reviewMonthsPassed = 4;
			// ★★★ 修改：使用投稿时的分数快照作为起点 ★★★
			const beforeScores = {
				idea: paper.submittedIdeaScore || paper.ideaScore,
				exp: paper.submittedExpScore || paper.expScore,
				write: paper.submittedWriteScore || paper.writeScore,
				total: paper.submittedScore || (paper.ideaScore + paper.expScore + paper.writeScore)
			};
			
			// 生成审稿人并获取评审结果
			const reviewers = [generateReviewer(), generateReviewer(), generateReviewer()];
			const results = reviewers.map(reviewer => 
				getReviewResultV2(
					reviewer, grade, submittedScore,
					submittedIdeaScore,
					submittedExpScore,
					submittedWriteScore,
					adjustment
				)
			);
			
			// 汇总审稿分数
			const totalReviewScore = results.reduce((sum, r) => sum + r.score, 0);
			
			// PC决策（增加会议波动性影响）
			let accepted = false;
			let acceptType = null;
			let borderlineChance = null;
			const personality = adjustment.personality || getBaseConferencePersonality(submittedMonth, grade);
			
			if (totalReviewScore >= 1) {
				accepted = true;
			} else if (totalReviewScore === 0) {
				borderlineChance = calculateFinalBorderlineRate(
					submittedScore, grade, totalReviewScore, adjustment
				);
				accepted = Math.random() < borderlineChance;
			} else if (totalReviewScore === -1) {
				borderlineChance = calculateFinalBorderlineRate(
					submittedScore, grade, totalReviewScore, adjustment
				) * 0.5;
				accepted = Math.random() < borderlineChance;
			} else {
				accepted = false;
			}
			
			if (accepted) {
				acceptType = determineAcceptTypeV2(submittedScore, grade, monthStats);
			}
			
			// ★★★ 修改：基于投稿时分数计算时效性衰减，10%向下取整，最少为1 ★★★
			const ideaDecay = paper.totalIdeaDecay || 0;
			const expDecay = paper.totalExpDecay || 0;
			
			// 应用审稿人改进建议
			results.forEach(r => {
				if (r.improvement > 0) {
					if (r.improvementType === 'idea') paper.ideaScore += r.improvement;
					else if (r.improvementType === 'exp') paper.expScore += r.improvement;
					else if (r.improvementType === 'write') paper.writeScore += r.improvement;
				}
			});
			
			const afterScores = {
				idea: paper.ideaScore,
				exp: paper.expScore,
				write: paper.writeScore,
				total: paper.ideaScore + paper.expScore + paper.writeScore
			};
			
			checkReviewAchievements(results, afterScores);
			
			const extraInfo = {
				adjustment,
				adjustedTarget,
				borderlineChance,
				monthStats,
				submittedMonth,
				ideaDecay,
				expDecay,
				personality,  // ★★★ 新增：传递会议性格信息 ★★★
				badReviewerCount: results.filter(r => 
					r.reviewer.type === 'hostile' || r.reviewer.type === 'questions'
				).length,
				hasExpert: results.some(r => r.reviewer.type === 'expert')
			};
			
			showReviewResultModalV2(
				paper, grade, results, totalReviewScore, 
				acceptType, accepted, slot, 
				beforeScores, afterScores, extraInfo
			);
		}

		/** * 成就检测*/
		function checkReviewAchievements(results, afterScores) {
			gameState.achievementConditions = gameState.achievementConditions || {};
			
			// 高分论文
			if (afterScores.total >= 125) {
				gameState.achievementConditions.highScorePaper = true;
			}
			
			// ★★★ 修改：幸运儿 - 三位大牛审稿人（expert）的一致改进 ★★★
			const allExpertWithImprovement = results.every(r => 
				r.reviewer.type === 'expert' && r.improvement > 0
			);
			
			// 全部坏审稿人
			if (results.every(r => r.reviewer.type === 'hostile' || r.reviewer.type === 'questions')) {
				gameState.achievementConditions.allBadReviewers = true;
			}
		}

		// ==================== 审稿结果弹窗（3页分页版）====================

		// 全局变量存储当前审稿结果数据
		let currentReviewData = null;

		/*** 显示审稿结果弹窗（分页版）*/
		function showReviewResultModalV2(paper, grade, results, totalReviewScore, acceptType, accepted, slot, beforeScores, afterScores, extraInfo) {
			// 存储数据供分页使用
			currentReviewData = {
				paper, grade, results, totalReviewScore, acceptType, accepted, slot,
				beforeScores, afterScores, extraInfo
			};
			
			// 显示第一页
			showReviewResultPage(1);
		}

		/*** 渲染分页指示器 */
		function renderPageIndicator(currentPage, totalPages) {
			let dots = '';
			for (let i = 1; i <= totalPages; i++) {
				const isActive = i === currentPage;
				dots += `<span style="display:inline-block;width:10px;height:10px;background:${isActive ? 'var(--primary-color)' : 'var(--border-color)'};border-radius:50%;margin:0 3px;"></span>`;
			}
			return `<div style="text-align:center;padding:10px;color:var(--text-secondary);font-size:0.8rem;">${dots}</div>`;
		}

		/*** 渲染增强版全球统计*/
		function renderGlobalStatsEnhanced(confInfo, monthStats, grade) {
			if (!monthStats || monthStats.submissions < 20) {
				return `
				<div style="padding:12px;background:linear-gradient(135deg,rgba(116,185,255,0.1),rgba(162,155,254,0.1));border-radius:8px;margin-bottom:12px;font-size:0.8rem;border:1px solid rgba(116,185,255,0.3);">
					<div style="font-weight:600;color:var(--info-color);margin-bottom:8px;">
						<i class="fas fa-globe"></i> ${confInfo.name} 全球统计
					</div>
					<div style="text-align:center;color:var(--text-secondary);padding:10px;">
						数据不足，暂无统计信息
					</div>
				</div>`;
			}
			
			const acceptRate = ((monthStats.acceptRate || 0) * 100).toFixed(1);
			const posterRate = monthStats.submissions > 0 ? ((monthStats.poster || 0) / monthStats.submissions * 100).toFixed(1) : '0';
			const oralRate = monthStats.submissions > 0 ? ((monthStats.oral || 0) / monthStats.submissions * 100).toFixed(1) : '0';
			const bpRate = monthStats.submissions > 0 ? ((monthStats.bestPaper || 0) / monthStats.submissions * 100).toFixed(1) : '0';
			
			// 计算各档位参考分数
			const avgPoster = monthStats.avgScorePoster || (grade === 'A' ? 70 : grade === 'B' ? 45 : 30);
			const avgOral = monthStats.avgScoreOral || (grade === 'A' ? 90 : grade === 'B' ? 60 : 40);
			const avgBP = monthStats.avgScoreBestPaper || (grade === 'A' ? 105 : grade === 'B' ? 75 : 50);
			const avgRejected = monthStats.avgScoreRejected || (grade === 'A' ? 40 : grade === 'B' ? 25 : 15);
			
			// 计算中稿论文平均分
			const totalAccepted = (monthStats.poster || 0) + (monthStats.oral || 0) + (monthStats.bestPaper || 0);
			let avgAcceptedScore = '-';
			if (totalAccepted > 0 && monthStats.avgScorePoster) {
				const weightedSum = (monthStats.avgScorePoster * (monthStats.poster || 0)) + 
								  (monthStats.avgScoreOral * (monthStats.oral || 0)) + 
								  (monthStats.avgScoreBestPaper * (monthStats.bestPaper || 0));
				avgAcceptedScore = Math.round(weightedSum / totalAccepted);
			}
			
			return `
			<div style="padding:12px;background:linear-gradient(135deg,rgba(116,185,255,0.1),rgba(162,155,254,0.1));border-radius:8px;margin-bottom:12px;font-size:0.8rem;border:1px solid rgba(116,185,255,0.3);">
				<div style="font-weight:600;color:var(--info-color);margin-bottom:10px;">
					<i class="fas fa-globe"></i> ${confInfo.name} ${confInfo.year} 全球统计
				</div>
				
				<!-- 投稿概况 -->
				<div style="background:var(--card-bg);border-radius:6px;padding:10px;margin-bottom:8px;border:1px solid var(--border-color);">
					<div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:6px;">📊 投稿概况</div>
					<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center;">
						<div>
							<div style="font-size:1.1rem;font-weight:700;color:var(--primary-color);">${monthStats.submissions}</div>
							<div style="font-size:0.65rem;color:var(--text-secondary);">总投稿</div>
						</div>
						<div>
							<div style="font-size:1.1rem;font-weight:700;color:var(--success-color);">${monthStats.accepted || 0}</div>
							<div style="font-size:0.65rem;color:var(--text-secondary);">总录用</div>
						</div>
						<div>
							<div style="font-size:1.1rem;font-weight:700;color:var(--warning-color);">${acceptRate}%</div>
							<div style="font-size:0.65rem;color:var(--text-secondary);">录用率</div>
						</div>
					</div>
				</div>
				
				<!-- 录用分布 -->
				<div style="background:var(--card-bg);border-radius:6px;padding:10px;margin-bottom:8px;border:1px solid var(--border-color);">
					<div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:6px;">🏆 录用分布</div>
					<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center;">
						<div style="padding:6px;background:rgba(116,185,255,0.1);border-radius:4px;">
							<div style="font-size:0.9rem;font-weight:600;color:#74b9ff;">${monthStats.poster || 0}</div>
							<div style="font-size:0.6rem;color:var(--text-secondary);">Poster (${posterRate}%)</div>
						</div>
						<div style="padding:6px;background:rgba(253,203,110,0.1);border-radius:4px;">
							<div style="font-size:0.9rem;font-weight:600;color:#fdcb6e;">${monthStats.oral || 0}</div>
							<div style="font-size:0.6rem;color:var(--text-secondary);">Oral (${oralRate}%)</div>
						</div>
						<div style="padding:6px;background:rgba(253,121,168,0.1);border-radius:4px;">
							<div style="font-size:0.9rem;font-weight:600;color:#fd79a8;">${monthStats.bestPaper || 0}</div>
							<div style="font-size:0.6rem;color:var(--text-secondary);">Best (${bpRate}%)</div>
						</div>
					</div>
				</div>
				
				<!-- 分数参考 -->
				<div style="background:var(--card-bg);border-radius:6px;padding:10px;border:1px solid var(--border-color);">
					<div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:6px;">📈 分数参考（投稿时总分）</div>
					<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;font-size:0.75rem;">
						<div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(225,112,85,0.1);border-radius:4px;">
							<span>❌ 拒稿均分</span>
							<strong style="color:var(--danger-color);">${Math.round(avgRejected)}</strong>
						</div>
						<div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(0,184,148,0.1);border-radius:4px;">
							<span>✅ 中稿均分</span>
							<strong style="color:var(--success-color);">${avgAcceptedScore}</strong>
						</div>
						<div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(116,185,255,0.1);border-radius:4px;">
							<span>📄 Poster参考</span>
							<strong style="color:#74b9ff;">≥${Math.round(avgPoster)}</strong>
						</div>
						<div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(253,203,110,0.1);border-radius:4px;">
							<span>🎤 Oral参考</span>
							<strong style="color:#d68910;">≥${Math.round(avgOral)}</strong>
						</div>
						<div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(253,121,168,0.1);border-radius:4px;grid-column:span 2;">
							<span>🏆 Best Paper参考</span>
							<strong style="color:#fd79a8;">≥${Math.round(avgBP)}</strong>
						</div>
					</div>
					<div style="margin-top:6px;font-size:0.65rem;color:var(--text-secondary);text-align:center;">
						P90阈值: ${monthStats.p90AcceptedScore || '-'} | P99阈值: ${monthStats.p99AcceptedScore || '-'}
					</div>
				</div>
			</div>`;
		}

		/*** 显示审稿结果指定页*/
		function showReviewResultPage(pageNum) {
			const { paper, grade, results, totalReviewScore, acceptType, accepted, slot, beforeScores, afterScores, extraInfo } = currentReviewData;
			const { adjustment, adjustedTarget, borderlineChance, monthStats, ideaDecay, expDecay } = extraInfo;
			
			// 获取会议信息
			const confInfo = paper.conferenceInfo || getConferenceInfo(extraInfo.submittedMonth || gameState.month, grade, gameState.year);
			
			let html = '';
			let pageTitle = '';
			const totalPages = 3;
			
			if (pageNum === 1) {
				// ==================== 第一页：会议信息 + 全球统计 ====================
				pageTitle = '📝 审稿结果 (1/3)';
				
				// 会议和论文信息
				html += `<div style="padding:12px;background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(162,155,254,0.1));border-radius:10px;margin-bottom:12px;border:1px solid rgba(108,92,231,0.2);">
					<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:4px;">投稿会议</div>
					<div style="font-size:1.1rem;font-weight:700;color:var(--primary-color);margin-bottom:2px;">${confInfo.name} ${confInfo.year}</div>
					<div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:8px;">${confInfo.fullName} (${grade}类)</div>
					<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:4px;">论文标题</div>
					<div style="font-size:0.9rem;font-weight:500;word-break:break-word;">${paper.title}</div>
					<div style="margin-top:8px;font-size:0.8rem;color:var(--text-secondary);">
						投稿时总分：<strong style="color:var(--primary-color);">${paper.submittedScore}</strong>
					</div>
				</div>`;
				
				// 增强版全球统计
				html += renderGlobalStatsEnhanced(confInfo, monthStats, grade);
				
				// 分页指示
				html += renderPageIndicator(1, totalPages);
				
				showModal(pageTitle, html, [
					{ text: '查看审稿详情 →', class: 'btn-primary', action: () => showReviewResultPage(2) }
				]);
				
			} else if (pageNum === 2) {
				// ==================== 第二页：审稿人评审详情 ====================
				pageTitle = '📝 审稿详情 (2/3)';
				
				// 调整机制展示
				html += renderAdjustmentInfo(adjustment, adjustedTarget, monthStats);
				
				// 审稿人评审详情
				html += `<div style="font-weight:600;color:var(--primary-color);margin-bottom:8px;font-size:0.9rem;">
					<i class="fas fa-user-edit"></i> 审稿人评审 (总分: ${totalReviewScore >= 0 ? '+' : ''}${totalReviewScore})
				</div>`;
				
				results.forEach((r, idx) => {
					const color = r.decision === 'Accept' ? 'var(--success-color)' : 
								 r.decision === 'Reject' ? 'var(--danger-color)' : 'var(--warning-color)';
					
					const thresholdChanged = adjustment.adjustmentEnabled && 
						(adjustment.adjustmentDetails.rejectChange !== 0 || adjustment.adjustmentDetails.borderlineChange !== 0);
					
					const baseThreshold = BASE_THRESHOLDS[grade][r.reviewer.type];
					
					// 改进建议显示
					let improvementHtml = '';
					if (r.improvement > 0) {
						const typeName = r.improvementType === 'idea' ? 'Idea' : r.improvementType === 'exp' ? '实验' : '写作';
						improvementHtml = `<div style="font-size:0.7rem;color:var(--success-color);margin-top:3px;">💡 改进建议：${typeName}+${r.improvement}</div>`;
					}
					
					html += `<div style="padding:8px;background:var(--light-bg);border-radius:6px;margin-bottom:6px;font-size:0.85rem;border-left:3px solid ${color};">
						<div style="display:flex;justify-content:space-between;margin-bottom:4px;">
							<strong>审稿人${idx + 1}: ${r.reviewer.name}</strong>
							<span style="color:${color};font-weight:600;">${r.decision}(${r.score > 0 ? '+' : ''}${r.score})</span>
						</div>
						<div style="font-size:0.7rem;color:var(--text-secondary);margin-bottom:3px;">
							📐 权重: ${r.weightInfo} → 有效分<strong>${r.effectiveScore}</strong>
						</div>
						<div style="font-size:0.65rem;color:var(--text-secondary);margin-bottom:3px;">
							📊 阈值: Reject&lt;${r.thresholds.reject}${thresholdChanged ? `<span style="color:var(--info-color);">(原${baseThreshold.reject})</span>` : ''}, 
							BL&lt;${r.thresholds.borderline}${thresholdChanged ? `<span style="color:var(--info-color);">(原${baseThreshold.borderline})</span>` : ''}
						</div>
						<div style="font-size:0.8rem;color:var(--text-secondary);font-style:italic;">"${r.comment}"</div>
						${improvementHtml}
					</div>`;
				});
				
				// 分页指示
				html += renderPageIndicator(2, totalPages);
				
				showModal(pageTitle, html, [
					{ text: '← 返回结果', class: 'btn-info', action: () => showReviewResultPage(1) },
					{ text: '查看PC决定 →', class: 'btn-primary', action: () => showReviewResultPage(3) }
				]);
				
			} else if (pageNum === 3) {
				// ==================== 第三页：分数变化 + PC决定 ====================
				pageTitle = '📝 PC决定 (3/3)';
				
				// 分数变化说明
				html += renderScoreChangeInfo(beforeScores, afterScores, results, ideaDecay, expDecay);
				
				// PC Meta Review
				html += renderPCMetaReview(totalReviewScore, accepted, acceptType, borderlineChance, adjustment, paper.submittedScore);
				
				// 最终结果
				html += renderFinalResult(accepted, acceptType, confInfo, totalReviewScore, borderlineChance);
				
				// 分页指示
				html += renderPageIndicator(3, totalPages);
				
				showModal(pageTitle, html, [
					{ text: '← 返回详情', class: 'btn-info', action: () => showReviewResultPage(2) },
					{ text: '✓ 确定', class: 'btn-primary', action: () => {
						// 恶意审稿人惩罚
						if (extraInfo.badReviewerCount > 0) {
							const sanLoss = extraInfo.badReviewerCount;
							if (!changeSan(-sanLoss)) {
								currentReviewData = null;
								return;
							}
							addLog('审稿压力', `${extraInfo.badReviewerCount}个刁难审稿人`, `SAN-${sanLoss}`);
						}
						
						if (accepted) {
							if (totalReviewScore === -1) {
								gameState.achievementConditions = gameState.achievementConditions || {};
								gameState.achievementConditions.savedByPC = true;
								addLog('🎣 力挽狂澜', '审稿意见负面但被PC捞起', '达成隐藏成就条件！');
							}
							handlePaperAccepted(paper, grade, acceptType, slot, extraInfo);
						} else {
							// 记录拒稿数据
							recordSubmission(
								extraInfo.submittedMonth || gameState.month,
								grade,
								paper.submittedScore,
								'rejected',
								gameState.isReversed
							);

							// ★★★ 新增：记录投稿历史（用于百发百中成就）★★★
							gameState.submissionHistory = gameState.submissionHistory || [];
							gameState.submissionHistory.push({
								title: paper.title,
								grade: grade,
								accepted: false,
								month: extraInfo.submittedMonth || gameState.month,
								year: gameState.year
							});

							gameState.rejectedCount++;
							gameState.rejectedPapers[paper.title] = (gameState.rejectedPapers[paper.title] || 0) + 1;
							
							if (gameState.rejectedPapers[paper.title] >= 3) {
								gameState.achievementConditions.tripleRejected = true;
							}
							
							if (extraInfo.hasExpert) {
								const existingBuff = gameState.buffs.permanent.find(b => b.type === 'idea_bonus' && b.name === '指点迷津：每次想idea分数+1');
								if (!existingBuff) {
									gameState.buffs.permanent.push({ 
										type: 'idea_bonus', 
										name: '指点迷津：每次想idea分数+1', 
										value: 1, 
										permanent: true 
									});
									addLog('因祸得福', '资深大牛的指点迷津', '永久buff-每次想idea分数+1');
								}
							}
							
							gameState.consecutiveAccepts = 0;
							
							paper.reviewing = false;
							paper.submittedGrade = null;
							paper.submittedScore = null;
							paper.reviewMonths = 0;
							paper.submittedMonth = null;
							paper.conferenceInfo = null;
							paper.conferenceLocation = null;
							
							// ★★★ 关键修改：拒稿时也要继续处理队列 ★★★
							if (gameState._reviewProcessing) {
								setTimeout(() => processNextReviewInQueue(), 100);
							}
						}
						
						currentReviewData = null;
						closeModal();
						renderPaperSlots();
						updateAllUI();
					}}
				]);
			}
		}

		/*** 渲染调整机制信息*/
		function renderAdjustmentInfo(adjustment, adjustedTarget, monthStats) {
			if (!monthStats || monthStats.submissions < 30) {
				return '';
			}
			
			const popularity = adjustedTarget.popularity;
			const popularityText = {
				'very_hot': '🔥 非常热门',
				'hot': '🌡️ 热门',
				'normal': '📊 正常',
				'cold': '❄️ 冷门',
				'very_cold': '🧊 非常冷门'
			}[popularity?.category] || '📊 正常';
			
			const adjustmentStatus = adjustment.adjustmentEnabled 
				? `<span style="color:var(--success-color);">✓ 已启用</span>` 
				: `<span style="color:var(--text-secondary);">○ 未启用(需≥${MIN_SUBMISSIONS_FOR_ADJUSTMENT}篇)</span>`;
			
			// ★★★ 新增：会议性格显示 ★★★
			const personality = adjustment.personality;
			const personalityDesc = personality ? getConferencePersonalityDescription(personality) : '⚖️ 中庸';
			
			return `
			<div style="padding:10px;background:linear-gradient(135deg,rgba(253,203,110,0.1),rgba(243,156,18,0.1));border-radius:8px;margin-bottom:12px;font-size:0.8rem;">
				<div style="font-weight:600;color:#d68910;margin-bottom:6px;">
					<i class="fas fa-balance-scale"></i> 会议特性 ${adjustmentStatus}
				</div>
				<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
					<div>
						${popularityText}<br>
						<span style="font-size:0.7rem;color:var(--text-secondary);">
							投稿${monthStats.submissions}篇 / 平均${popularity?.avgSubmissions || '-'}篇
						</span>
					</div>
					<div>
						目标录取率：${(adjustedTarget.target * 100).toFixed(1)}%<br>
						<span style="font-size:0.7rem;color:var(--text-secondary);">
							实际：${((monthStats.acceptRate || 0) * 100).toFixed(1)}%
						</span>
					</div>
				</div>
				
				<!-- ★★★ 新增：会议性格标签 ★★★ -->
				<div style="margin-top:8px;padding:6px;background:var(--card-bg);border-radius:4px;border:1px solid var(--border-color);">
					<div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:4px;">📋 会议性格</div>
					<div style="font-size:0.85rem;font-weight:500;">${personalityDesc}</div>
					${personality ? `
					<div style="font-size:0.65rem;color:var(--text-secondary);margin-top:4px;display:flex;gap:8px;flex-wrap:wrap;">
						<span>严格度:${(personality.strictness*100).toFixed(0)}%</span>
						<span>BL范围:${(personality.borderlineWidth*100).toFixed(0)}%</span>
						<span>BL友好:${(personality.borderlineLeniency*100).toFixed(0)}%</span>
						<span>波动性:${(personality.volatility*100).toFixed(0)}%</span>
					</div>` : ''}
				</div>
				
				${adjustment.adjustmentEnabled ? `
				<div style="margin-top:6px;font-size:0.7rem;color:var(--text-secondary);border-top:1px dashed rgba(243,156,18,0.3);padding-top:6px;">
					${adjustment.adjustmentDetails.reason}
				</div>` : ''}
			</div>`;
		}

		/*** 渲染分数变化信息*/
		function renderScoreChangeInfo(beforeScores, afterScores, results, ideaDecay, expDecay) {
			const improvements = results.filter(r => r.improvement > 0);
			const totalImprovement = improvements.reduce((sum, imp) => sum + imp.improvement, 0);
			const totalDecay = ideaDecay + expDecay;
			const netChange = afterScores.total - beforeScores.total;
			
			if (totalImprovement === 0 && totalDecay === 0) {
				return '';
			}
			
			const netColor = netChange > 0 ? 'var(--success-color)' : netChange < 0 ? 'var(--danger-color)' : 'var(--text-secondary)';
			
			let html = `<div style="padding:12px;background:linear-gradient(135deg,rgba(108,92,231,0.1),rgba(116,185,255,0.1));border-radius:8px;margin-bottom:12px;font-size:0.85rem;border:1px solid var(--border-color);">
				<div style="font-weight:600;color:var(--primary-color);margin-bottom:10px;">
					<i class="fas fa-chart-line"></i> 论文分数变化（投稿时 → 现在）
				</div>`;
			
			// 衰减信息
			if (gameState.noDecay) {
				html += `<div style="margin-bottom:8px;padding:8px;background:rgba(0,184,148,0.1);border-radius:6px;border-left:3px solid var(--success-color);">
					<div style="font-size:0.8rem;color:var(--success-color);">🔮 预见未来热点生效，分数不衰减</div>
				</div>`;
			} else if (totalDecay > 0) {
				html += `<div style="margin-bottom:8px;padding:8px;background:rgba(225,112,85,0.1);border-radius:6px;border-left:3px solid var(--danger-color);">
					<div style="font-size:0.8rem;color:var(--danger-color);">
						⏳ 时效性降低（4个月累计）：Idea-${ideaDecay}, 实验-${expDecay}
					</div>
					<div style="font-size:0.7rem;color:var(--text-secondary);margin-top:4px;">
						每月衰减当前分数的10%（最少1），高分论文衰减更快
					</div>
				</div>`;
			}
						
			// 改进信息
			if (improvements.length > 0) {
				html += `<div style="margin-bottom:8px;padding:8px;background:rgba(0,184,148,0.1);border-radius:6px;border-left:3px solid var(--success-color);">
					<div style="font-size:0.8rem;color:var(--success-color);">💡 审稿人建议：`;
				improvements.forEach(imp => {
					const typeName = imp.improvementType === 'idea' ? 'Idea' : imp.improvementType === 'exp' ? '实验' : '写作';
					html += `${imp.reviewer.name}(${typeName}+${imp.improvement}) `;
				});
				html += `</div></div>`;
			}
			
			html += `<div style="text-align:center;padding:8px;background:var(--card-bg);border-radius:6px;border:1px solid var(--border-color);">
				投稿时：<strong>${beforeScores.total}</strong> → 现在：<span style="color:${netColor};font-weight:600;">${afterScores.total}</span>
				（净变化：<span style="color:${netColor};">${netChange >= 0 ? '+' : ''}${netChange}</span>）
			</div>`;
			
			html += '</div>';
			return html;
		}

		/*** 渲染PC Meta Review*/
		function renderPCMetaReview(totalReviewScore, accepted, acceptType, borderlineChance, adjustment, paperScore) {
			let pcDecisionText, pcReasonText;
			
			if (totalReviewScore >= 1) {
				pcDecisionText = `<span style="color:var(--success-color);">录用为${acceptType}</span>`;
				pcReasonText = '审稿人普遍认可，PC决定录用。';
			} else if (totalReviewScore === 0) {
				if (accepted) {
					pcDecisionText = `<span style="color:var(--success-color);">录用为${acceptType}</span>`;
					pcReasonText = `审稿人意见分歧（Borderline），PC综合评估后决定录用。`;
				} else {
					pcDecisionText = `<span style="color:var(--danger-color);">拒稿</span>`;
					pcReasonText = `审稿人意见分歧（Borderline），PC综合评估后决定拒稿。`;
				}
			} else if (totalReviewScore === -1) {
				if (accepted) {
					pcDecisionText = `<span style="color:var(--success-color);">录用为${acceptType}</span>`;
					pcReasonText = `审稿意见偏负面，但PC认为论文有价值，决定录用。`;
				} else {
					pcDecisionText = `<span style="color:var(--danger-color);">拒稿</span>`;
					pcReasonText = `审稿意见偏负面，PC建议修改后重投。`;
				}
			} else {
				pcDecisionText = `<span style="color:var(--danger-color);">拒稿</span>`;
				pcReasonText = '审稿人普遍不认可，PC决定拒稿。';
			}
			
			let blInfo = '';
			if (borderlineChance !== null) {
				const chancePercent = (borderlineChance * 100).toFixed(0);
				const sourceText = adjustment.adjustmentEnabled 
					? `基础${(adjustment.borderlineBaseRate * 100).toFixed(0)}%+分数修正` 
					: '基于论文分数计算';
				blInfo = `
				<div style="font-size:0.75rem;color:var(--text-secondary);margin-top:6px;padding-top:6px;border-top:1px dashed var(--border-color);">
					💡 Borderline录取概率：${chancePercent}%（${sourceText}）
				</div>`;
			}
			
			// ★★★ 修改：white 改为 var(--card-bg)，添加边框 ★★★
			return `
			<div style="padding:12px;background:linear-gradient(135deg,rgba(155,89,182,0.1),rgba(108,92,231,0.1));border-radius:8px;margin-bottom:12px;border:1px solid rgba(155,89,182,0.3);">
				<div style="font-weight:600;color:#9b59b6;margin-bottom:8px;">
					<i class="fas fa-user-tie"></i> PC Meta Review
				</div>
				<div style="background:var(--card-bg);border-radius:6px;padding:10px;border:1px solid var(--border-color);">
					<div style="font-size:0.8rem;margin-bottom:6px;">
						<strong>总审稿分：</strong>${totalReviewScore}（${totalReviewScore >= 1 ? '偏正面' : totalReviewScore === 0 ? '中立' : '偏负面'}）
					</div>
					<div style="font-size:0.8rem;margin-bottom:6px;">
						<strong>综合评估：</strong>${pcReasonText}
					</div>
					<div style="font-size:0.85rem;">
						<strong>PC决定：</strong>${pcDecisionText}
					</div>
					${blInfo}
				</div>
			</div>`;
		}

		/*** 渲染全球统计*/
		function renderGlobalStats(confInfo, monthStats, grade) {
			const acceptRate = ((monthStats.acceptRate || 0) * 100).toFixed(1);
			
			return `
			<div style="padding:12px;background:linear-gradient(135deg,rgba(116,185,255,0.1),rgba(162,155,254,0.1));border-radius:8px;margin-bottom:12px;font-size:0.8rem;border:1px solid rgba(116,185,255,0.3);">
				<div style="font-weight:600;color:var(--info-color);margin-bottom:8px;">
					<i class="fas fa-globe"></i> ${confInfo.name} 全球统计
				</div>
				<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;">
					<div>📝 投稿：<strong>${monthStats.submissions}</strong>篇</div>
					<div>✅ 录用：<strong>${monthStats.accepted || 0}</strong>篇</div>
					<div>📈 录用率：<strong>${acceptRate}%</strong></div>
					<div>🎯 Oral参考：≥${monthStats.p90AcceptedScore || '-'}分</div>
				</div>
			</div>`;
		}

		/*** 渲染最终结果*/
		function renderFinalResult(accepted, acceptType, confInfo, totalReviewScore, borderlineChance) {
			if (accepted) {
				const colors = { 'Poster': '#74b9ff', 'Oral': '#fdcb6e', 'Best Paper': '#fd79a8' };
				return `
				<div style="text-align:center;padding:12px;background:linear-gradient(135deg,${colors[acceptType]}33,${colors[acceptType]}66);border-radius:10px;">
					<div style="font-size:1.8rem;margin-bottom:8px;">🎉</div>
					<div style="font-size:1.1rem;font-weight:700;color:${colors[acceptType]};">
						恭喜！论文被 ${confInfo.name} ${confInfo.year} 接收为 ${acceptType}！
					</div>
				</div>`;
			} else {
				return `
				<div style="text-align:center;padding:12px;background:rgba(225,112,85,0.15);border-radius:10px;">
					<div style="font-size:1.8rem;margin-bottom:8px;">😢</div>
					<div style="font-size:1.1rem;font-weight:700;color:var(--danger-color);">
						很遗憾，论文被 ${confInfo.name} ${confInfo.year} 拒稿了
					</div>
					<div style="margin-top:6px;font-size:0.85rem;color:var(--text-secondary);">
						可根据审稿意见修改后重投其他会议
					</div>
				</div>`;
			}
		}

		// ==================== 辅助函数 ====================


        // 异步记录投稿数据
        async function recordSubmission(gameMonth, grade, submittedScore, result, isReversed) {
            if (!supabase) return;
            
            try {
                await supabase.from('paper_submissions').insert({
                    game_month: gameMonth,
                    grade: grade,
                    submitted_score: submittedScore,
                    result: result.toLowerCase().replace(' ', '_'),
                    is_reversed: isReversed
                });
                console.log('✅ 投稿记录已保存');
            } catch (e) {
                console.error('记录投稿失败:', e);
            }
        }

