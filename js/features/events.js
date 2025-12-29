        // ==================== 寒假暑假事件 ====================
        function triggerWinterVacationEvent() {
			// ★★★ 修改：恢复已损失SAN的10%（上取整）★★★
			const lostSan = gameState.sanMax - gameState.san;
			const sanRecovery = Math.ceil(lostSan * 0.1);
			const finalSan = Math.min(gameState.sanMax, gameState.san + sanRecovery);

            showModal('❄️ 寒假',
                `<p>寒假到了！回家过年，收到了长辈的压岁钱，好好休息一下吧～</p>
				 <p style="font-size:0.85rem;color:var(--text-secondary);">已损失SAN: ${lostSan}，恢复10%: +${sanRecovery}</p>
                 <div style="text-align:center;font-size:2rem;margin:15px 0;">🧧🏠🎆</div>`,
                [{
                    text: '🎊 新年快乐！',
                    class: 'btn-accent',
					action: () => {
						gameState.gold += 1;
						clampGold();  // ★★★ 赤贫学子诅咒 ★★★
						gameState.san = finalSan;
						addLog('❄️ 寒假', '回家过年', `压岁钱+1，SAN值+${sanRecovery}（恢复已损失的10%）`);
						closeModal();
						updateAllUI();
					}
                }]
            );
        }

        function triggerSummerVacationEvent() {
			// ★★★ 修改：恢复已损失SAN的20%（上取整）★★★
			const lostSan = gameState.sanMax - gameState.san;
			const sanRecovery = Math.ceil(lostSan * 0.2);
			const finalSan = Math.min(gameState.sanMax, gameState.san + sanRecovery);

            showModal('☀️ 暑假',
                `<p>暑假来啦！虽然科研不能停，但可以稍微放松一下，调整状态～</p>
				 <p style="font-size:0.85rem;color:var(--text-secondary);">已损失SAN: ${lostSan}，恢复20%: +${sanRecovery}</p>
                 <div style="text-align:center;font-size:2rem;margin:15px 0;">🏖️🍉🌴</div>`,
                [{
                    text: '😎 好好休息！',
                    class: 'btn-success',
					action: () => {
						gameState.san = finalSan;
						addLog('☀️ 暑假', '暑假休息', `SAN值+${sanRecovery}（恢复已损失的20%）`);
						closeModal();
						updateAllUI();
					}
                }]
            );
        }
        
        // ==================== 随机事件系统 ====================
		function triggerScholarshipEvent() {
			const req = { 2: 1, 3: 3, 4: 6, 5: 9 }[gameState.year] || 9;
			// ★★★ 修改：10元改为8元 ★★★
			const reward = { 2: 5, 3: 5, 4: 8, 5: 8 }[gameState.year] || 8;

			if (gameState.totalScore >= req) {
				gameState.gold += reward;
				clampGold();  // ★★★ 赤贫学子诅咒 ★★★
				// ★★★ 新增：奖学金总计数 ★★★
				gameState.scholarshipCount = (gameState.scholarshipCount || 0) + 1;
				// ★★★ 新增：连续获奖计数 ★★★
				gameState.consecutiveScholarships = (gameState.consecutiveScholarships || 0) + 1;
				if (gameState.consecutiveScholarships >= 3) {
					gameState.achievementConditions = gameState.achievementConditions || {};
					gameState.achievementConditions.topStudent = true;
				}
				showModal('🎓 奖学金', `<p>恭喜！你的科研分达到${gameState.totalScore}分，满足本年度奖学金要求（≥${req}分），获得奖学金${reward}金币！</p>`,
					[{ text: '太棒了！', class: 'btn-primary', action: () => {
						addLog('奖学金', `第${gameState.year}年奖学金`, `科研分${gameState.totalScore}≥${req}，金钱+${reward}（连续${gameState.consecutiveScholarships}年）`);
						closeModal(); updateAllUI();
					}}]);
			} else {
				// ★★★ 新增：重置连续获奖计数 ★★★
				gameState.consecutiveScholarships = 0;
				showModal('🎓 奖学金', `<p>遗憾落选！本年度奖学金要求科研分≥${req}，你目前${gameState.totalScore}分。</p>`,
					[{ text: '继续努力', class: 'btn-info', action: () => {
						addLog('奖学金', `第${gameState.year}年奖学金`, `科研分${gameState.totalScore}<${req}，遗憾落选`);
						closeModal();
					}}]);
			}
		}

        function triggerTeachersDayEvent() {
            showModal('🎁 教师节', '<p>教师节到了，你准备送导师什么礼物？</p>', [
                { text: '什么也不送', class: 'btn-info', action: () => {
                    // ★★★ 重置连续邮票计数 ★★★
                    gameState.consecutiveStampGifts = 0;
                    closeModal();
                    if (gameState.favor >= 6) {
                        addLog('教师节', '什么也不送', '无事发生');
                        updateAllUI();
                    } else {
                        addLog('教师节', '什么也不送', '导师对你略有不满，导师好感度-1');
                        changeFavor(-1);
                    }
                }},
                { text: '🍵 赠送茶叶（1金）', class: 'btn-primary', action: () => {
                    // ★★★ 重置连续邮票计数 ★★★
                    gameState.consecutiveStampGifts = 0;
                    addLog('教师节', '赠送茶叶', '金钱-1，导师开心收下茶叶，导师好感度+1');
                    closeModal();
                    gameState.favor = Math.min(20, gameState.favor + 1);
                    changeGold(-1);
                }},
                { text: '📮 赠送邮票（3金）', class: 'btn-warning', action: () => {
                    // ★★★ 连续邮票计数 ★★★
                    gameState.consecutiveStampGifts = (gameState.consecutiveStampGifts || 0) + 1;
                    let logText = '金钱-3，导师开心收下邮票并点了点头，导师好感度+2';
                    if (gameState.consecutiveStampGifts >= 3) {
                        gameState.achievementConditions = gameState.achievementConditions || {};
                        gameState.achievementConditions.loveMyTeacher = true;
                        logText += `（连续${gameState.consecutiveStampGifts}年）`;
                    }
                    addLog('教师节', '赠送邮票', logText);
                    closeModal();
                    gameState.favor = Math.min(20, gameState.favor + 2);
                    changeGold(-3);
                }}
            ]);
        }
		// ==================== CCIG国内学术会议事件 ====================
		function triggerCCIGEvent() {
			const year = gameState.year;
			const location = CCIG_LOCATIONS[(year - 1) % 5]; // 1-5年对应索引0-4
			const realYear = getRealYear(year, 9);
			
			showModal('🏛️ CCIG中国图象图形学学会年会',
				`<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:2rem;margin-bottom:10px;">🇨🇳</div>
					<div style="font-size:1.1rem;font-weight:600;color:var(--primary-color);">CCIG ${realYear}</div>
					<div style="font-size:0.85rem;color:var(--text-secondary);">中国图象图形学学会年会</div>
					<div style="font-size:0.9rem;margin-top:8px;">📍 ${location}，中国</div>
				</div>
				<p>一年一度的CCIG国内学术会议即将在<strong>${location}</strong>举办，是否参加？</p>`,
				[
					{ text: '❌ 不去参加', class: 'btn-info', action: () => {
						addLog('CCIG', `不参加CCIG ${realYear} @ ${location}`, '无事发生');
						closeModal();
						updateAllUI();
					}},
					{ text: '👨‍🏫 导师报销', class: 'btn-primary', action: () => {
						closeModal();
						if (gameState.favor >= 6) {
							addLog('CCIG', `导师报销参加CCIG @ ${location}`, '导师爽快答应');
							setTimeout(() => showCCIGActivityModal(location, realYear), 200);
						} else {
							addLog('CCIG', `导师报销参加CCIG @ ${location}`, '导师略有不满，好感度-1');
							if (changeFavor(-1)) {
								setTimeout(() => showCCIGActivityModal(location, realYear), 200);
							}
						}
					}},
					{ text: '💰 自费前往（金币-2）', class: 'btn-warning', action: () => {
						addLog('CCIG', `自费参加CCIG @ ${location}`, '金币-2');
						closeModal();
						if (changeGold(-2)) {
							setTimeout(() => showCCIGActivityModal(location, realYear), 200);
						}
					}}
				]
			);
		}

		function showCCIGActivityModal(location, realYear) {
			showModal('🏛️ CCIG参会活动',
				`<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:1.5rem;margin-bottom:8px;">📍 ${location}</div>
					<div style="font-size:0.9rem;color:var(--text-secondary);">CCIG ${realYear}</div>
				</div>
				<p>你来到了<strong>${location}</strong>参加CCIG，在会议期间你打算：</p>`,
				[
					{ text: '📚 认真听报告', class: 'btn-primary', action: () => {
						gameState.buffs.temporary.push({
							type: 'idea_bonus',
							name: '下次想idea分数+5',
							value: 5,
							permanent: false
						});
						gameState.buffs.permanent.push({
							type: 'idea_bonus',
							name: '每次想idea分数+1',
							value: 1,
							permanent: true
						});
						addLog('CCIG活动', '认真听报告', '临时buff-下次想idea分数+5，永久buff-每次想idea分数+1');
						closeModal();
						updateBuffs();
						updateAllUI();
					}},
					{ text: '🏖️ 趁机旅游', class: 'btn-success', action: () => {
						addLog('CCIG活动', `在${location}趁机旅游`, 'SAN值+6');
						closeModal();
						changeSan(6);
					}},
					{ text: '🍜 请同学品尝美食（金币-2）', class: 'btn-warning', action: () => {
						closeModal();
						if (changeGold(-2)) {
							gameState.san = Math.min(gameState.sanMax, gameState.san + 2);
							changeSocial(1);
							addLog('CCIG活动', `请同学品尝${location}美食`, '金币-2，SAN值+2，社交能力+1');
							updateAllUI();
						}
					}}
				]
			);
		}
		// ★★★ 新增：学年总结事件 ★★★
		function triggerYearEndSummaryEvent() {
			// ★★★ 防止同一年重复触发学年总结 ★★★
			if (gameState.yearEndSummaryTriggeredThisYear === gameState.year) {
				// 已经触发过本年度的学年总结，直接检查毕业
				checkGraduation();
				updateAllUI();
				return;
			}
			gameState.yearEndSummaryTriggeredThisYear = gameState.year;

			// ★★★ 定义学年总结完成后的回调函数 ★★★
			const afterYearEndSummary = () => {
				// 学年总结完成后，检查是否需要触发毕业
				checkGraduation();
				updateAllUI();
			};
			
			showModal('📅 学年总结', 
				`<div style="text-align:center;margin-bottom:15px;">
					<div style="font-size:2.5rem;margin-bottom:10px;">📝</div>
					<div style="font-size:1.1rem;font-weight:600;color:var(--primary-color);">第${gameState.year}年学年总结</div>
					<div style="font-size:0.85rem;color:var(--text-secondary);margin-top:5px;">除了科研，你今年都干了什么？</div>
				</div>
				<p style="text-align:center;color:var(--text-secondary);font-size:0.85rem;">选择一项作为你今年的主要活动：</p>`,
				[
					{ text: '😴 都在睡大觉', class: 'btn-info', action: () => {
						addLog('学年总结', '今年除了科研都在睡大觉', 'SAN+5');
						closeModal();
						changeSan(5);
						afterYearEndSummary();
					}},
					{ text: '🎉 和同学玩耍', class: 'btn-success', action: () => {
						addLog('学年总结', '今年主要在和同学玩耍', '社交能力+1');
						closeModal();
						changeSocial(1);
						afterYearEndSummary();
					}},
					{ text: '👨‍🏫 帮导师干活', class: 'btn-accent', action: () => {
						addLog('学年总结', '今年主要在帮导师干活', '导师好感度+1');
						closeModal();
						changeFavor(1);
						afterYearEndSummary();
					}},
					{ text: '💼 偷偷实习', class: 'btn-warning', action: () => {
						addLog('学年总结', '今年偷偷在外面实习', '金钱+2');
						closeModal();
						changeGold(2);
						afterYearEndSummary();
					}}
				]
			);
		}

        function triggerOtherRandomEvent() {
            let availableEvents = [...gameState.availableRandomEvents];

            if (gameState.social >= 6 && !availableEvents.includes(11) && !gameState.usedRandomEvents.includes(11)) {
                availableEvents.push(11);
            }

            // ★★★ 移除自动重置逻辑，改为每年重置 ★★★
            if (availableEvents.length === 0) {
                // 本年度所有事件都已触发，不再触发新事件
                addLog('随机事件', '本年度事件已触发完毕', '等待新的一年');
                return;
            }

			// ★★★ 新增：7月固定事件池（合作类事件）★★★
			const julyEvents = [1, 10, 11, 14];
			if (gameState.month === 7) {
				// 7月只从合作类事件中选择
				availableEvents = availableEvents.filter(e => julyEvents.includes(e));
				// 如果没有可用的合作类事件，跳过本次随机事件
				if (availableEvents.length === 0) {
					addLog('随机事件', '7月合作事件已触发完毕', '等待下个月');
					return;
				}
			}

			// ★★★ 新增：前3次随机事件保护机制 ★★★
			const protectedEvents = [3, 12, 13, 16]; // 感冒、抢一作、服务器坏、数据丢失
			gameState.totalRandomEventCount = gameState.totalRandomEventCount || 0;
			if (gameState.totalRandomEventCount < 3) {
				// 前3次随机事件排除危险事件
				availableEvents = availableEvents.filter(e => !protectedEvents.includes(e));
				if (availableEvents.length === 0) {
					addLog('随机事件', '本年度事件已触发完毕', '等待新的一年');
					return;
				}
			}

			// ★★★ 感冒概率调整（根据连续低SAN月数）★★★
			const lowSanMonths = gameState.consecutiveLowSanMonths || 0;
			if (lowSanMonths > 0 && availableEvents.includes(3)) {
				// 增加感冒事件的权重：基础1倍 + 每连续1个月额外1倍
				const coldWeight = 1 + lowSanMonths;
				for (let i = 1; i < coldWeight; i++) {
					availableEvents.push(3);
				}
			}

            const eventIndex = Math.floor(Math.random() * availableEvents.length);
            const eventId = availableEvents[eventIndex];

			// ★★★ 新增：累计随机事件触发次数 ★★★
			gameState.totalRandomEventCount++;
			// ★★★ 新增：检查是否抵抗感冒（今年打过羽毛球）★★★
			if (eventId === 3 && gameState.badmintonYear === gameState.year) {
				// 从可用池中移除感冒事件
				gameState.availableRandomEvents = gameState.availableRandomEvents.filter(e => e !== 3);
				if (!gameState.usedRandomEvents.includes(3)) {
					gameState.usedRandomEvents.push(3);
				}

				// ★★★ 标记成就：强身健体 ★★★
				gameState.achievementConditions = gameState.achievementConditions || {};
				gameState.achievementConditions.badmintonAvoidedCold = true;

				// 显示抵抗感冒的提示
				showModal('💪 随机事件',
					`<p>本来你要感冒了...</p>
					 <div style="text-align:center;font-size:2rem;margin:15px 0;">🏸➡️🛡️</div>
					 <p>但是今年打过羽毛球强化了身体，成功抵抗了感冒！</p>`,
					[{
						text: '身体倍儿棒！',
						class: 'btn-success',
						action: () => {
							addLog('随机事件', '感冒来袭', '今年打过羽毛球，成功抵抗感冒！');
							closeModal();
							updateAllUI();
						}
					}]
				);
				return;
			}
			
			gameState.availableRandomEvents = gameState.availableRandomEvents.filter(e => e !== eventId);
			if (!gameState.usedRandomEvents.includes(eventId)) {
				gameState.usedRandomEvents.push(eventId);
			}
			
			const eventMap = {
				1: showRandomEvent1,
				2: showRandomEvent2,
				3: showRandomEvent3,
				4: showRandomEvent4,
				5: showRandomEvent5,
				6: showRandomEvent6,
				7: showRandomEvent7,
				8: showRandomEvent8,
				9: showRandomEvent9,
				10: showRandomEvent10,
				11: showRandomEvent11,
				12: showRandomEvent12,
				13: showRandomEvent13,
				14: showRandomEvent14,
				15: showRandomEvent15,
				16: showRandomEvent16,  // ★★★ 新增：数据丢失事件 ★★★
			};
			
			if (eventMap[eventId]) {
				eventMap[eventId]();
			}
		}

        function showRandomEvent1() {
            showModal('📚 随机事件', '<p>导师派你指导本科生毕设。</p>', [
                { text: '残忍拒绝', class: 'btn-danger', action: () => {
                    // ★★★ 拒绝指导本科生计数 ★★★
                    gameState.rejectedMentoring = true;
                    checkLearnToSayNo();
                    addLog('随机事件', '导师派你指导本科生毕设 - 残忍拒绝', '导师对你略有不满，导师好感度-1');
                    closeModal();
                    changeFavor(-1);
                }},
                { text: '亲力亲为', class: 'btn-primary', action: () => {
                    closeModal();
                    const baseSanCost = -3;
                    const actualSanCost = getActualSanChange(baseSanCost);
                    const sanText = (gameState.isReversed && gameState.character === 'normal') ? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` : `SAN值${actualSanCost}`;

                    const becomesJunior = Math.random() < 0.5;
                    if (becomesJunior) {
                        addLog('随机事件', '导师派你指导本科生毕设 - 亲力亲为', `本科生顺利毕业，后成为你的师弟师妹帮助你科研打下手，${sanText}，科研能力+1`);
                        changeResearch(1);
                    } else {
                        addLog('随机事件', '导师派你指导本科生毕设 - 亲力亲为', `本科生顺利毕业，${sanText}`);
                    }
                    changeSan(baseSanCost);

                    // ★★★ 新增：如果本科生成为师弟师妹，询问是否加入关系网 ★★★
                    if (becomesJunior) {
                        const juniorPerson = createRelationshipPerson('junior', {
                            description: '你亲手带过的本科生，现在成为了你的师弟师妹'
                        });
                        setTimeout(() => {
                            showAddToNetworkModal(juniorPerson);
                        }, 300);
                    }
                }},
                { text: '让师弟师妹去指导', class: 'btn-info', action: () => {
                    closeModal();
                    if (gameState.social < 6) {
                        addLog('随机事件', '导师派你指导本科生毕设 - 让师弟师妹去指导', '【社交<6】师弟师妹对你颇有微词，社交能力-1');
                        changeSocial(-1);
                    } else {
                        addLog('随机事件', '导师派你指导本科生毕设 - 让师弟师妹去指导', '【社交>=6】师弟师妹成功为你分忧');
                        updateAllUI();
                    }
                }}
            ]);
        }

        function showRandomEvent2() {
            showModal('📝 随机事件', '<p>导师让你帮他审稿。</p>', [
                { text: '以没时间为由拒绝', class: 'btn-danger', action: () => {
                    // ★★★ 拒绝审稿计数 ★★★
                    gameState.rejectedReview = true;
                    checkLearnToSayNo();
                    addLog('随机事件', '导师让你帮他审稿 - 以没时间为由拒绝', '导师对你略有不满，导师好感度-1');
                    closeModal();
                    changeFavor(-1);
                }},
                { text: '认真审稿', class: 'btn-primary', action: () => {
                    closeModal();
                    const baseSanCost = -2;
                    const actualSanCost = getActualSanChange(baseSanCost);
                    const sanText = (gameState.isReversed && gameState.character === 'normal') ? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` : `SAN值${actualSanCost}`;
                    
                    if (Math.random() < 0.5) {
                        gameState.buffs.temporary.push({ type: 'idea_bonus', name: '下次想idea分数+4', value: 4, permanent: false });
                        addLog('随机事件', '导师让你帮他审稿 - 认真审稿', `运气好得到了启发，${sanText}，临时buff-下次想idea分数+4`);
                        updateBuffs();
                    } else {
                        addLog('随机事件', '导师让你帮他审稿 - 认真审稿', `无事发生，${sanText}`);
                    }
                    changeSan(baseSanCost);
                }},
                { text: '交给师弟师妹', class: 'btn-info', action: () => {
                    closeModal();
                    if (gameState.social < 6) {
                        addLog('随机事件', '导师让你帮他审稿 - 交给师弟师妹', '【社交<6】师弟师妹对你颇有微词，社交能力-1');
                        changeSocial(-1);
                    } else {
                        addLog('随机事件', '导师让你帮他审稿 - 交给师弟师妹', '【社交>=6】师弟师妹成功为你分忧');
                        updateAllUI();
                    }
                }}
            ]);
        }

		function showRandomEvent3() {
			// ★★★ 新增：感冒计数 ★★★
			gameState.coldCount = (gameState.coldCount || 0) + 1;
			// 感冒后重置连续低SAN月数
			gameState.consecutiveLowSanMonths = 0;

			if (gameState.coldCount >= 3) {
				gameState.achievementConditions = gameState.achievementConditions || {};
				gameState.achievementConditions.sickly = true;
			}

			showModal('🤧 随机事件', '<p>突然感冒了。</p>', [
				{ text: '强撑', class: 'btn-danger', action: () => {
					closeModal();
					if (gameState.san>=8) {
						const baseSanCost = -8;
						const actualSanCost = getActualSanChange(baseSanCost);
						const sanText = (gameState.isReversed && gameState.character === 'normal')
							? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）`
							: `SAN值${actualSanCost}`;
						addLog('随机事件', '突然感冒了 - 强撑', `【SAN>=8】身体透支了，${sanText}`);
						changeSan(baseSanCost);
					} else {
						gameState.sanMax -= 4;
						// ★★★ 新增：SAN上限<=10成就检查 ★★★
						if (gameState.sanMax <= 10) {
							gameState.achievementConditions = gameState.achievementConditions || {};
							gameState.achievementConditions.nearDeath = true;
						}
						if (gameState.san > gameState.sanMax) {
							const sanReduced = gameState.san - gameState.sanMax;
							gameState.san = gameState.sanMax;
							addLog('随机事件', '突然感冒了 - 强撑', `【SAN<8】留下了永久病根，SAN上限-4，SAN值-${sanReduced}`);
						} else {
							addLog('随机事件', '突然感冒了 - 强撑', '【SAN<8】留下了永久病根，SAN上限-4');
						}
						updateAllUI();
					}
				}},
				{ text: '自己买感冒药', class: 'btn-primary', action: () => {
					addLog('随机事件', '突然感冒了 - 自己买感冒药', '喝999感冒灵好了，金钱-2');
					closeModal();
					changeGold(-2);
				}},
				{ text: '去医院看病', class: 'btn-info', action: () => {
					// ★★★ 新增：去医院计数 ★★★
					gameState.hospitalCount = (gameState.hospitalCount || 0) + 1;
					if (gameState.hospitalCount >= 3) {
						gameState.achievementConditions = gameState.achievementConditions || {};
						gameState.achievementConditions.loveLife = true;
					}
					addLog('随机事件', '突然感冒了 - 去医院看病', '医生妙手回春，你比生病前还精神，SAN值+2，金钱-4');
					gameState.san = Math.min(gameState.sanMax, gameState.san + 2);
					closeModal();
					changeGold(-4);
				}}
			]);
		}

        function showRandomEvent4() {
            showModal('💼 随机事件', '<p>导师安排你做项目。</p>', [
                { text: '横向项目', class: 'btn-warning', action: () => {
                    // ★★★ 项目完成计数 ★★★
                    gameState.projectCompletedCount = (gameState.projectCompletedCount || 0) + 1;
                    if (gameState.projectCompletedCount >= 3) {
                        gameState.achievementConditions = gameState.achievementConditions || {};
                        gameState.achievementConditions.projectKing = true;
                    }
                    const baseSanCost = -7;
                    const actualSanCost = getActualSanChange(baseSanCost);
                    const sanText = (gameState.isReversed && gameState.character === 'normal') ? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` : `SAN值${actualSanCost}`;
                    addLog('随机事件', '导师安排你做项目 - 横向项目', `成功结项，${sanText}，导师好感度+1，金钱+5`);
                    closeModal();
                    gameState.favor = Math.min(20, gameState.favor + 1);
                    gameState.gold += 5;
                    clampGold();  // ★★★ 赤贫学子诅咒 ★★★
                    changeSan(baseSanCost);
                }},
                { text: '纵向项目', class: 'btn-primary', action: () => {
                    // ★★★ 项目完成计数 ★★★
                    gameState.projectCompletedCount = (gameState.projectCompletedCount || 0) + 1;
                    if (gameState.projectCompletedCount >= 3) {
                        gameState.achievementConditions = gameState.achievementConditions || {};
                        gameState.achievementConditions.projectKing = true;
                    }
                    const baseSanCost = -5;
                    const actualSanCost = getActualSanChange(baseSanCost);
                    const sanText = (gameState.isReversed && gameState.character === 'normal') ? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` : `SAN值${actualSanCost}`;
                    addLog('随机事件', '导师安排你做项目 - 纵向项目', `成功结项，${sanText}，导师好感度+1，科研能力+1`);
                    closeModal();
                    gameState.favor = Math.min(20, gameState.favor + 1);
                    changeResearch(1);
                    changeSan(baseSanCost);
                }},
                { text: '拒绝项目', class: 'btn-danger', action: () => {
                    // ★★★ 拒绝项目计数 ★★★
                    gameState.rejectedProject = true;
                    checkLearnToSayNo();
                    closeModal();
                    if (gameState.research < 6) {
                        addLog('随机事件', '导师安排你做项目 - 拒绝项目', '【科研<6】导师对你比较不满，导师好感度-2');
                        changeFavor(-2);
                    } else if (gameState.research < 12) {
                        addLog('随机事件', '导师安排你做项目 - 拒绝项目', '【科研>=6】导师对你略为不满，导师好感度-1');
                        changeFavor(-1);
                    } else {
                        addLog('随机事件', '导师安排你做项目 - 拒绝项目', '【科研>=12】导师让你以科研为重');
                        updateAllUI();
                    }
                }},
                { text: '让师弟师妹分担', class: 'btn-info', action: () => {
                    closeModal();
                    if (gameState.social < 6) {
                        const baseSanCost = -2;
                        const actualSanCost = getActualSanChange(baseSanCost);
                        const sanText = (gameState.isReversed && gameState.character === 'normal') ? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` : `SAN值${actualSanCost}`;
                        addLog('随机事件', '导师安排你做项目 - 让师弟师妹分担一部分', `【社交<6】师弟师妹对你颇有微词，${sanText}，社交能力-1`);
                        changeSocial(-1);
                        changeSan(baseSanCost);
                    } else if (gameState.social < 12) {
                        const baseSanCost = -2;
                        const actualSanCost = getActualSanChange(baseSanCost);
                        const sanText = (gameState.isReversed && gameState.character === 'normal') ? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` : `SAN值${actualSanCost}`;
                        addLog('随机事件', '导师安排你做项目 - 让师弟师妹分担一部分', `【社交>=6】师弟师妹成功为你分忧，${sanText}`);
                        changeSan(baseSanCost);
                    } else {
                        addLog('随机事件', '导师安排你做项目 - 让师弟师妹分担一部分', '【社交>=12】师弟师妹主动全包了');
                        updateAllUI();
                    }
                }}
            ]);
        }

        // ★★★ 新增：检查学会拒绝成就 ★★★
        function checkLearnToSayNo() {
            if (gameState.rejectedProject && gameState.rejectedReview && gameState.rejectedMentoring) {
                gameState.achievementConditions = gameState.achievementConditions || {};
                gameState.achievementConditions.learnToSayNo = true;
            }
        }

        function showRandomEvent5() {
            showModal('💬 随机事件', '<p>导师找你谈话。</p>', [
                { text: '认真准备科研进展', class: 'btn-primary', action: () => {
                    closeModal();
                    if (gameState.research >= 6) {
                        gameState.buffs.temporary.push({ type: 'idea_bonus', name: '下次想idea分数+5', value: 5, permanent: false });
                        addLog('随机事件', '导师找你谈话 - 认真准备科研进展', '【科研>=6】导师顺着你的思路进行改进，临时buff-下次想idea分数+5');
                        updateBuffs();
                        updateAllUI();
                    } else {
                        addLog('随机事件', '导师找你谈话 - 认真准备科研进展', '【科研<6】导师发现你一直在摸鱼，导师好感度-1');
                        changeFavor(-1);
                    }
                }},
                { text: '向导师询问如何科研', class: 'btn-info', action: () => {
                    closeModal();
                    if (gameState.favor < 6) {
                        addLog('随机事件', '导师找你谈话 - 向导师询问如何科研', '【好感<6】导师感觉你事情很多，导师好感度-1');
                        changeFavor(-1);
                    } else {
                        addLog('随机事件', '导师找你谈话 - 向导师询问如何科研', '【好感>=6】导师传授你科研秘诀，科研能力+1');
                        changeResearch(1);
                    }
                }},
                { text: '告诉导师想要去短期实习', class: 'btn-warning', action: () => {
                    closeModal();
                    if (gameState.favor >= 6) {
                        const baseSanCost = -6;
                        const actualSanCost = getActualSanChange(baseSanCost);
                        const sanText = (gameState.isReversed && gameState.character === 'normal') ? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` : `SAN值${actualSanCost}`;
                        gameState.buffs.temporary.push({ type: 'exp_bonus', name: '下次做实验分数+5', value: 5, permanent: false });
                        gameState.gold += 5;
                        clampGold();  // ★★★ 赤贫学子诅咒 ★★★
                        addLog('随机事件', '导师找你谈话 - 告诉导师想要去短期实习', `【好感>=6】导师居然同意了但要兼顾科研，${sanText}，临时buff-下次做实验分数+5，金钱+5`);
                        updateBuffs();
                        changeSan(baseSanCost);
                    } else {
                        addLog('随机事件', '导师找你谈话 - 告诉导师想要去短期实习', '【好感<6】导师果然拒绝了，导师好感度-1');
                        changeFavor(-1);
                    }
                }}
            ]);
        }

        function showRandomEvent6() {
            showModal('📊 随机事件', '<p>实验室召开组会。</p>', [
                { text: '讲解一篇深奥论文', class: 'btn-primary', action: () => {
                    closeModal();
                    if (gameState.research < 6) {
                        addLog('随机事件', '实验室召开组会 - 讲解一篇深奥论文', '【科研<6】导师发现你不懂装懂，导师好感度-1');
                        changeFavor(-1);
                    } else {
                        addLog('随机事件', '实验室召开组会 - 讲解一篇深奥论文', '【科研>=6】导师夸赞了你的见解，导师好感度+1');
                        changeFavor(1);
                    }
                }},
                { text: '讲解系列论文', class: 'btn-warning', action: () => {
                    closeModal();
                    const baseSanCost = -3;
                    const actualSanCost = getActualSanChange(baseSanCost);
                    const sanText = (gameState.isReversed && gameState.character === 'normal') ? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` : `SAN值${actualSanCost}`;
                    
                    if (Math.random() < 0.5) {
                        addLog('随机事件', '实验室召开组会 - 讲解系列论文', `虽然很辛苦但导师大力夸赞了你的见解，${sanText}，导师好感度+2`);
                        gameState.favor = Math.min(20, gameState.favor + 2);
                    } else {
                        addLog('随机事件', '实验室召开组会 - 讲解系列论文', `虽然很辛苦但运气不好导师没来参会，${sanText}`);
                    }
                    changeSan(baseSanCost);
                }},
                { text: '偷偷水过去', class: 'btn-info', action: () => {
                    closeModal();
                    if (Math.random() < 0.5) {
                        addLog('随机事件', '实验室召开组会 - 偷偷水过去', '导师对你略有不满，导师好感度-1');
                        changeFavor(-1);
                    } else {
                        addLog('随机事件', '实验室召开组会 - 偷偷水过去', '运气好导师恰好没来');
                        updateAllUI();
                    }
                }}
            ]);
        }

        function showRandomEvent7() {
            showModal('🎉 随机事件', '<p>实验室组织团建。</p>', [
				{ text: '🏸 打羽毛球', class: 'btn-primary', action: () => {
					gameState.badmintonYear = gameState.year;
					// ★★★ 新增：羽毛球计数和冠军机制 ★★★
					gameState.badmintonCount = (gameState.badmintonCount || 0) + 1;

					let logText = '脖子和手臂得到了强化，今年不会感冒了，SAN值+2';

					// SAN>=20时获得冠军
					if (gameState.san >= 20) {
						gameState.badmintonChampionCount = (gameState.badmintonChampionCount || 0) + 1;
						changeSocial(1);
						logText += '，【冠军！】社交+1';

						// 一次冠军解锁成就
						if (gameState.badmintonChampionCount >= 1) {
							gameState.achievementConditions = gameState.achievementConditions || {};
							gameState.achievementConditions.badmintonChampion = true;
						}
					}

					// 打羽毛球3次获得强身健体buff
					if (gameState.badmintonCount === 3) {
						gameState.buffs.permanent.push({
							type: 'monthly_san_recovery',
							name: '强身健体',
							desc: '每月SAN回复+1',
							value: 1,
							permanent: true
						});
						logText += '，【强身健体】每月SAN回复+1';
					}

					addLog('随机事件', '实验室组织团建 - 打羽毛球', logText);
					closeModal();
					changeSan(2);
					updateBuffs();
				}},
                { text: '🃏 打德州扑克', class: 'btn-warning', action: () => {
                    closeModal();
                    if (Math.random() < 0.5) {
                        // 输钱：输掉所有钱，最多不超过4金币
                        const loseAmount = Math.min(gameState.gold, 4);
                        addLog('随机事件', '实验室组织团建 - 打德州扑克', `手气太差，金钱-${loseAmount}`);
                        changeGold(-loseAmount);
                    } else {
                        // 赢钱：金钱翻倍，最多不超过8金币
                        gameState.pokerWinCount = (gameState.pokerWinCount || 0) + 1;
                        if (gameState.pokerWinCount >= 3) {
                            gameState.achievementConditions = gameState.achievementConditions || {};
                            gameState.achievementConditions.pokerGod = true;
                        }
                        const winAmount = Math.min(gameState.gold, 8);
                        addLog('随机事件', '实验室组织团建 - 打德州扑克', `你翻出了皇家同花顺，金钱+${winAmount}`);
                        changeGold(winAmount);
                    }
                }},
                { text: '🎤 KTV唱歌', class: 'btn-accent', action: () => {
					// ★★★ 新增：KTV计数 ★★★
					gameState.ktvCount = (gameState.ktvCount || 0) + 1;
					let logText = '唱了猪猪侠主题曲，聪明勇敢有力气，社交能力+1';
					if (gameState.ktvCount >= 3) {
						gameState.achievementConditions = gameState.achievementConditions || {};
						gameState.achievementConditions.ktvKing = true;
					}
                    addLog('随机事件', '实验室组织团建 - KTV唱歌', logText);
                    closeModal();
                    changeSocial(1);
                }},
				{ text: '🍜 聚餐', class: 'btn-info', action: () => {
					// ★★★ 新增：聚餐计数 ★★★
					gameState.dinnerCount = (gameState.dinnerCount || 0) + 1;
					closeModal();
					if (Math.random() < 0.5) {
						addLog('随机事件', '实验室组织团建 - 聚餐', '吃饱了，金钱-2，SAN值+5');
						gameState.san = Math.min(gameState.sanMax, gameState.san + 5);
						changeGold(-2);
					} else {
						gameState.favor = Math.min(20, gameState.favor + 1);
						addLog('随机事件', '实验室组织团建 - 聚餐', '运气好导师请客，SAN值+5，导师好感度+1');
						changeSan(5);
					}
				}}
            ]);
        }

        function showRandomEvent8() {
            showModal('💰 随机事件', '<p>导师科研经费充足，你建议。</p>', [
                { text: '🖥️ 购买GPU服务器', class: 'btn-primary', action: () => {
                    closeModal();
                    if (Math.random() < 0.5) {
                        addLog('随机事件', '导师科研经费充足 - 购买高性能GPU服务器', '导师并不想买');
                    } else {
                        // 根据导师好感度分配显卡个数
                        let gpuCount, buffText;
                        if (gameState.favor <= 5) {
                            gpuCount = 1;
                            buffText = '【好感<=5】分到了1张显卡，永久buff-每次做实验多做一次';
                        } else if (gameState.favor <= 11) {
                            gpuCount = 2;
                            buffText = '【好感6-11】分到了2张显卡，永久buff-每次做实验多做两次';
                        } else {
                            gpuCount = 3;
                            buffText = '【好感>=12】分到了3张显卡，永久buff-每次做实验多做三次';
                        }
                        for (let i = 0; i < gpuCount; i++) {
                            gameState.buffs.permanent.push({ type: 'exp_times', name: '每次做实验多做一次', value: 1, permanent: true });
                        }
                        addLog('随机事件', '导师科研经费充足 - 购买高性能GPU服务器', buffText);
                        updateBuffs();
                    }
                    updateAllUI();
                }},
				{ text: '💵 多发劳务费', class: 'btn-warning', action: () => {
					closeModal();
					if (gameState.favor < 6) {
						addLog('随机事件', '导师科研经费充足 - 多发劳务费', `【好感<6】导师只发了一点点，金钱+2`);
						changeGold(2);
					} else if (gameState.favor < 12) {
						addLog('随机事件', '导师科研经费充足 - 多发劳务费', `【好感>=6】导师发了很多，金钱+4`);
						changeGold(4);
					} else {
						// ★★★ 修改：+8改为+6 ★★★
						addLog('随机事件', '导师科研经费充足 - 多发劳务费', `【好感>=12】导师全给你了，金钱+6`);
						changeGold(6);
					}
					updateAllUI();
				}},
                { text: '🪑 装修学生工位', class: 'btn-info', action: () => {
                    closeModal();
                    gameState.buffs.permanent.push(
                        { type: 'idea_bonus', name: '每次想idea分数+1', value: 1, permanent: true },
                        { type: 'write_bonus', name: '每次写论文分数+1', value: 1, permanent: true }
                    );
                    addLog('随机事件', '导师科研经费充足 - 装修学生工位', '非常舒适，永久buff-每次想idea分数+1，永久buff-每次写论文分数+1');
                    updateAllUI();
                    updateBuffs();
                }}
            ]);
        }

        function showRandomEvent9() {
            showModal('📖 随机事件', '<p>你打算学点新知识，你会选择。</p>', [
                { text: '📚 基础知识', class: 'btn-primary', action: () => {
                    closeModal();
                    if (gameState.research < 4) {
                        addLog('随机事件', '学习新知识 - 基础知识', '打好了基础，科研能力+1');
                        changeResearch(1);
                    } else {
                        addLog('随机事件', '学习新知识 - 基础知识', '对你没有什么帮助');
                        updateAllUI();
                    }
                }},
                { text: '🚀 最新技术', class: 'btn-warning', action: () => {
                    closeModal();
                    gameState.buffs.permanent.push({ type: 'idea_bonus', name: '每次想idea分数+1', value: 1, permanent: true });
                    addLog('随机事件', '学习新知识 - 最新技术', '永久buff-每次想idea分数+1');
                    updateAllUI();
                    updateBuffs();
                }},
                { text: '💻 代码知识', class: 'btn-info', action: () => {
                    closeModal();
                    gameState.buffs.permanent.push({ type: 'exp_bonus', name: '每次做实验分数+1', value: 1, permanent: true });
                    addLog('随机事件', '学习新知识 - 代码知识', '永久buff-每次做实验分数+1');
                    updateAllUI();
                    updateBuffs();
                }},
                { text: '🔮 深奥的知识', class: 'btn-accent', action: () => {
                    closeModal();
                    gameState.buffs.permanent.push({ type: 'write_bonus', name: '每次写论文分数+1', value: 1, permanent: true });
                    addLog('随机事件', '学习新知识 - 看起来很深奥的知识', '永久buff-每次写论文分数+1');
                    updateAllUI();
                    updateBuffs();
                }}
            ]);
        }

        function showRandomEvent10() {
            showModal('🤝 随机事件', '<p>同门找你合作论文，你会选择。</p>', [
                { text: '学术交流', class: 'btn-primary', action: () => {
                    closeModal();
					if (gameState.social < 6) {
						gameState.buffs.temporary.push({ type: 'idea_bonus', name: '下次想idea分数+5', value: 5, permanent: false });
						gameState.buffs.temporary.push({ type: 'idea_stolen', name: '下次想idea总分÷2', value: 0.5, multiply: true, permanent: false });
						addLog('随机事件', '同门找你合作论文 - 学术交流', '【社交<6】被同门窃取合作的idea，临时buff-下次想idea分数+5，临时debuff-下次想idea总分÷2');
					} else {
                        gameState.buffs.temporary.push({ type: 'idea_bonus', name: '下次想idea分数+5', value: 5, permanent: false });
                        addLog('随机事件', '同门找你合作论文 - 学术交流', '【社交>=6】共同进步，临时buff-下次想idea分数+5');
                    }
                    updateAllUI();
                    updateBuffs();
                }},
				{ text: '约定互挂论文', class: 'btn-warning', action: () => {
					closeModal();
					// ★★★ 新增：SAN-2 ★★★
					const baseSanCost = -2;
					const actualSanCost = getActualSanChange(baseSanCost);
					const sanText = (gameState.isReversed && gameState.character === 'normal') ? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` : `SAN值${actualSanCost}`;

					if (Math.random() < 0.5) {
						gameState.buffs.temporary.push({ type: 'citation_multiply', name: '下一篇中稿论文引用速度+100%', value: 2, permanent: false });
						addLog('随机事件', '同门找你合作论文 - 约定互挂论文', `运气好，你们一起中了论文，${sanText}，临时buff-下一篇中稿的论文引用速度+100%（与其他推广加成叠加）`);
					} else {
                        addLog('随机事件', '同门找你合作论文 - 约定互挂论文', `同门太菜了，一直没中论文，${sanText}`);
                    }
                    changeSan(baseSanCost);
                    updateBuffs();
                }},
                { text: '婉拒合作', class: 'btn-info', action: () => {
                    addLog('随机事件', '同门找你合作论文 - 婉拒合作', '无事发生');
                    closeModal();
                }},
                { text: '开展全面合作', class: 'btn-success', action: () => {
                    closeModal();
                    if (gameState.social < 6) {
                        const baseSanCost = -2;
                        const actualSanCost = getActualSanChange(baseSanCost);
                        const sanText = (gameState.isReversed && gameState.character === 'normal') ? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` : `SAN值${actualSanCost}`;
                        gameState.buffs.temporary.push(
                            { type: 'idea_times', name: '下次想idea多想1次', value: 1, permanent: false },
                            { type: 'write_times', name: '下次写论文多写1次', value: 1, permanent: false }
                        );
                        addLog('随机事件', '同门找你合作论文 - 开展全面合作', `【社交<6】艰难合作，临时buff-下次想idea多想1次，临时buff-下次写论文多写1次，${sanText}`);
                        changeSan(baseSanCost);
                        updateBuffs();
                    } else {
                        gameState.buffs.temporary.push(
                            { type: 'idea_times', name: '下次想idea多想1次', value: 1, permanent: false },
                            { type: 'write_times', name: '下次写论文多写1次', value: 1, permanent: false }
                        );
                        addLog('随机事件', '同门找你合作论文 - 开展全面合作', '【社交>=6】深入合作，临时buff-下次想idea多想1次，临时buff-下次写论文多写1次');
                        updateAllUI();
                        updateBuffs();

                        // ★★★ 修改：只有社交>=6时才能加入关系网 ★★★
                        const peerPerson = createRelationshipPerson('peer', {
                            description: '一起合作论文的同门，共同成长'
                        });
                        setTimeout(() => {
                            showAddToNetworkModal(peerPerson);
                        }, 300);
                    }
                }}
            ]);
        }

        function showRandomEvent11() {
            showModal('👨‍🎓 随机事件', '<p>师兄师姐找你合作论文，你会选择。</p>', [
                { text: '观望一下', class: 'btn-info', action: () => {
                    addLog('随机事件', '师兄师姐找你合作论文 - 观望一下', '师兄师姐先找了同门合作');
                    closeModal();
                }},
                { text: '浅浅合作', class: 'btn-primary', action: () => {
                    closeModal();
                    // ★★★ 新增：SAN-2 ★★★
                    const baseSanCost = -2;
                    const actualSanCost = getActualSanChange(baseSanCost);
                    const sanText = (gameState.isReversed && gameState.character === 'normal') ? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` : `SAN值${actualSanCost}`;
                    gameState.buffs.temporary.push({ type: 'idea_bonus', name: '下次想idea分数+10', value: 10, permanent: false });
                    addLog('随机事件', '师兄师姐找你合作论文 - 浅浅合作', `师兄师姐给了你一个idea，${sanText}，临时buff-下次想idea分数+10`);
                    changeSan(baseSanCost);
                    updateBuffs();
                }},
                { text: '深入合作', class: 'btn-warning', action: () => {
                    closeModal();
                    // ★★★ 修改：新增SAN-2，删除idea buff ★★★
                    const baseSanCost = -2;
                    const actualSanCost = getActualSanChange(baseSanCost);
                    const sanText = (gameState.isReversed && gameState.character === 'normal') ? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` : `SAN值${actualSanCost}`;
                    addLog('随机事件', '师兄师姐找你合作论文 - 深入合作', `遇到靠谱的师兄师姐，${sanText}，科研能力+1`);
                    changeResearch(1);
                    changeSan(baseSanCost);

                    // ★★★ 新增：深入合作后询问是否加入关系网 ★★★
                    const seniorPerson = createRelationshipPerson('senior', {
                        description: '一起深入合作论文的师兄师姐，靠谱可信赖'
                    });
                    setTimeout(() => {
                        showAddToNetworkModal(seniorPerson);
                    }, 300);
                }},
                { text: '拜入门下', class: 'btn-success', action: () => {
                    closeModal();
                    // ★★★ 修改：不增加科研，buff+5，新增SAN-2 ★★★
                    const baseSanCost = -2;
                    const actualSanCost = getActualSanChange(baseSanCost);
                    const sanText = (gameState.isReversed && gameState.character === 'normal') ? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` : `SAN值${actualSanCost}`;
                    gameState.buffs.permanent.push({ type: 'write_bonus', name: '每次写论文分数+5', value: 5, permanent: true });
                    addLog('随机事件', '师兄师姐找你合作论文 - 拜入门下', `你收获了第二导师，${sanText}，永久buff-每次写论文分数+5`);
                    changeSan(baseSanCost);
                    updateBuffs();

                    // ★★★ 新增：拜入门下后询问是否加入关系网 ★★★
                    const mentorSenior = createRelationshipPerson('senior', {
                        description: '你的第二导师，悉心指导你的科研之路'
                    });
                    setTimeout(() => {
                        showAddToNetworkModal(mentorSenior);
                    }, 300);
                }}
            ]);
        }

		function showRandomEvent12() {
			const isTeacherChild = gameState.character === 'teacher-child';
			
			const grabOptionText = isTeacherChild 
				? '劝说导师抢师弟师妹一作 🎁（导师子女：获得C类论文）' 
				: '劝说导师抢师弟师妹一作';
			const grabOptionClass = isTeacherChild ? 'btn-success' : 'btn-warning';  // 导师子女用绿色按钮突出显示
			
			showModal('⚠️ 随机事件', '<p>导师想要抢你论文的一作。</p>', [
				{ text: '向导师诉苦', class: 'btn-primary', action: () => {
					closeModal();
					if (gameState.favor >= 6) {
						addLog('随机事件', '导师想要抢你论文的一作 - 向导师诉苦', '【好感>=6】导师心软了');
						updateAllUI();
					} else {
						gameState.buffs.temporary.push({ type: 'idea_bonus', name: '下次想idea分数-5', value: -5, permanent: false });
						addLog('随机事件', '导师想要抢你论文的一作 - 向导师诉苦', '【好感<6】导师不要一作了，但也减少了指导，临时debuff-下次想idea分数-5');
						updateAllUI();
						updateBuffs();
					}
				}},
				{ text: grabOptionText, class: grabOptionClass, action: () => {  
					closeModal();
					if (gameState.character === 'teacher-child') {  
						const title = generatePaperTitle();
						gameState.publishedPapers.push({
							title: title,
							grade: 'C',
							acceptType: 'Poster',
							score: 15,
							citations: 0,
							monthsSincePublish: 0,
							promotions: { arxiv: false, github: false, xiaohongshu: false, quantumbit: false },
							citationMultiplier: 1
						});
						gameState.paperC++;
						gameState.totalScore += 1;
						addLog('随机事件', '导师想要抢你论文的一作 - 劝说导师抢师弟师妹一作', '导师抢来并给了你一篇C类论文，师弟师妹对你非常不满，社交能力-2');
						changeSocial(-2);
					} else {
						addLog('随机事件', '导师想要抢你论文的一作 - 劝说导师抢师弟师妹一作', '师弟师妹对你略有不满，社交能力-1');
						changeSocial(-1);
					}
					updateAllUI();
				}},
				{ text: '据理力争', class: 'btn-info', action: () => {
					closeModal();
					if (gameState.favor >= 6) {
						addLog('随机事件', '导师想要抢你论文的一作 - 据理力争', '【好感>=6】导师轻松被你说服');
						updateAllUI();
					} else {
						const baseSanCost = -2;
						const actualSanCost = getActualSanChange(baseSanCost);
						const sanText = (gameState.isReversed && gameState.character === 'normal') ? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` : `SAN值${actualSanCost}`;
						addLog('随机事件', '导师想要抢你论文的一作 - 据理力争', `【好感<6】导师艰难被你说服，${sanText}`);
						changeSan(baseSanCost);
					}
				}},
				{ text: '以死相逼', class: 'btn-danger', action: () => {
					gameState.gold += 2;
					clampGold();  // ★★★ 赤贫学子诅咒 ★★★
					gameState.favor = Math.max(0, gameState.favor - 2);
					addLog('随机事件', '导师想要抢你论文的一作 - 以死相逼', '导师转过来安抚你，金钱+2，导师好感度-2');
					closeModal();
					updateAllUI();
				}}
			]);
		}

        function showRandomEvent13() {
			// ★★★ 新增：服务器损坏计数 ★★★
			gameState.serverCrashCount = (gameState.serverCrashCount || 0) + 1;
            showModal('💻 随机事件', '<p>实验室服务器突然坏了。</p>', [
                { text: '催导师快修', class: 'btn-primary', action: () => {
                    closeModal();
                    gameState.buffs.permanent.push({ type: 'exp_bonus', name: '每次做实验分数-2', value: -2, permanent: true });
                    addLog('随机事件', '实验室服务器突然坏了 - 催导师快修', '导师每次坏了就帮你重启，永久debuff-每次做实验分数-2');
                    updateAllUI();
                    updateBuffs();
                }},
                { text: '举报同门挖矿', class: 'btn-warning', action: () => {
                    addLog('随机事件', '实验室服务器突然坏了 - 举报同门用服务器挖矿', '同门负责修好了，社交能力-2');
                    closeModal();
                    changeSocial(-2);
                }},
                { text: '自己重装系统', class: 'btn-info', action: () => {
                    closeModal();
                    const baseSanCost = -3;
                    const actualSanCost = getActualSanChange(baseSanCost);
                    const sanText = (gameState.isReversed && gameState.character === 'normal') ? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` : `SAN值${actualSanCost}`;
                    
                    if (Math.random() < 0.5) {
                        addLog('随机事件', '实验室服务器突然坏了 - 自己尝试重装系统', `运气好，费劲周折修好了，${sanText}`);
                    } else {
                        changeSocial(-1);
                        gameState.buffs.temporary.push({ type: 'exp_bonus', name: '下次实验总分÷2', value: 0.5, multiply: true, permanent: false });  // ★★★ 改为除2 ★★★
                        addLog('随机事件', '实验室服务器突然坏了 - 自己尝试重装系统', `服务器数据忘了备份了，临时debuff-下次实验分数×0.5，社交能力-1，${sanText}`);
                        updateBuffs();
                    }
                    changeSan(baseSanCost);
                }},
                { text: '淘宝找人修理', class: 'btn-danger', action: () => {
                    closeModal();
                    if (Math.random() < 0.5) {
                        addLog('随机事件', '实验室服务器突然坏了 - 淘宝找人修理', '运气好，遇到高手修好了，金币-2');
                        changeGold(-2);
                    } else {
                        const baseSanCost = -2;
                        const actualSanCost = getActualSanChange(baseSanCost);
                        const sanText = (gameState.isReversed && gameState.character === 'normal') ? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）` : `SAN值${actualSanCost}`;
                        addLog('随机事件', '实验室服务器突然坏了 - 淘宝找人修理', `遇到无良商家修了很久，金币-4，${sanText}`);
                        gameState.san += actualSanCost;
                        changeGold(-4);
                    }
                }}
            ]);
        }

        function showRandomEvent14() {
            // ★★★ 修改：被动效果不受季节buff影响，固定描述 ★★★
            const sanDescText = '每月SAN-1';

            showModal('👨‍🎓 随机事件', '<p>你已经初窥科研门道了，考虑指导师弟师妹：</p>', [
                { text: '精力有限算了', class: 'btn-info', action: () => {
                    addLog('随机事件', '指导师弟师妹 - 精力有限算了', '无事发生');
                    closeModal();
                }},
                { text: '最近有个idea可以合作一波', class: 'btn-primary', action: () => {
					// ★★★ 新增：记录第一次指导师弟师妹 ★★★
					if (!gameState.firstMentoringMonth) {
						gameState.firstMentoringMonth = gameState.totalMonths;
						addCareerMilestone('first_mentoring', '第一次指导师弟师妹', `开始传承学术薪火`);
					}
					// ★★★ 主动操作仍然使用季节buff ★★★
					const baseCost = 5;
					const actualCost = Math.abs(getActualSanChange(-baseCost));

					let sanText = `SAN-${actualCost}`;
					if (gameState.isReversed && gameState.character === 'normal') {
						sanText += `（怠惰×${gameState.reversedAwakened ? 3 : 2}）`;
					}
					addLog('随机事件', '指导师弟师妹 - 合作一个idea', `${sanText}，社交+1`);
					closeModal();
					changeSocial(1);
					changeSan(-baseCost);  // 直接扣除，如果变负会自动触发burnout结局

					// ★★★ 新增：合作后询问是否加入关系网 ★★★
					const juniorPerson = createRelationshipPerson('junior', {
						description: '和你合作idea的师弟师妹，潜力无限'
					});
					setTimeout(() => {
						showAddToNetworkModal(juniorPerson);
					}, 300);
				}},
                { text: '展开长期合作', class: 'btn-success', action: () => {
					// ★★★ 新增：记录第一次指导师弟师妹 ★★★
					if (!gameState.firstMentoringMonth) {
						gameState.firstMentoringMonth = gameState.totalMonths;
						addCareerMilestone('first_mentoring', '第一次指导师弟师妹', `开始传承学术薪火`);
					}
                    gameState.buffs.permanent.push({
                        type: 'mentorship',
                        name: '指导师弟师妹',
                        desc: `${sanDescText}，总引用+科研能力值`,
                        permanent: true
                    });
                    addLog('随机事件', '指导师弟师妹 - 展开长期合作', `${sanDescText}，总引用+科研能力值`);
                    closeModal();
                    updateBuffs();

                    // ★★★ 新增：长期合作后询问是否加入关系网 ★★★
                    const juniorPartner = createRelationshipPerson('junior', {
                        description: '你长期指导的师弟师妹，共同成长'
                    });
                    setTimeout(() => {
                        showAddToNetworkModal(juniorPartner);
                    }, 300);
                }}
            ]);
        }

		function showRandomEvent15() {
			// ★★★ 新增：游戏总次数统计 ★★★
			gameState.gamePlayCount = (gameState.gamePlayCount || 0) + 1;
			showModal('🎮 随机事件', '<p>学了一天你打算玩游戏放松一下。</p>', [
				{ text: '🌲 玩泰拉瑞亚', class: 'btn-success', action: () => {
					// ★★★ 新增：泰拉瑞亚计数 ★★★
					gameState.terrariaCount = (gameState.terrariaCount || 0) + 1;
					if (gameState.terrariaCount >= 3) {
						gameState.achievementConditions = gameState.achievementConditions || {};
						gameState.achievementConditions.terraria300 = true;
					}
					const baseSanCost = 4;
					const actualSanCost = Math.abs(getActualSanChange(-baseSanCost));
					const sanText = (gameState.isReversed && gameState.character === 'normal')
						? `SAN值-${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）`
						: `SAN值-${baseSanCost}`;
					addLog('随机事件', '玩游戏放松 - 玩泰拉瑞亚', `你和同学废寝忘食的联机，${sanText}，社交能力+1`);
					closeModal();
					changeSocial(1);
					changeSan(-baseSanCost);
				}},
				{ text: '🗼 玩魔塔50层', class: 'btn-primary', action: () => {
					// ★★★ 新增：魔塔计数 ★★★
					gameState.magicTowerCount = (gameState.magicTowerCount || 0) + 1;
					if (gameState.magicTowerCount >= 3) {
						gameState.achievementConditions = gameState.achievementConditions || {};
						gameState.achievementConditions.magicTowerMaster = true;
					}
					const baseSanCost = 6;
					const actualSanCost = Math.abs(getActualSanChange(-baseSanCost));
					const sanText = (gameState.isReversed && gameState.character === 'normal')
						? `SAN值-${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）`
						: `SAN值-${baseSanCost}`;
					addLog('随机事件', '玩游戏放松 - 玩魔塔50层', `你绞尽脑汁终于击败了骑士队长，${sanText}，科研能力+1`);
					closeModal();
					changeResearch(1);
					changeSan(-baseSanCost);
				}},
				{ text: '🎓 玩研究生模拟器', class: 'btn-info', action: () => {
					// ★★★ 新增：研究生模拟器计数 ★★★
					gameState.gradSimCount = (gameState.gradSimCount || 0) + 1;
					if (gameState.gradSimCount >= 3) {
						gameState.achievementConditions = gameState.achievementConditions || {};
						gameState.achievementConditions.thankYouPlaying = true;
					}
					addLog('随机事件', '玩游戏放松 - 玩研究生模拟器', '是个轻松愉快的小游戏呢，SAN值+2');
					closeModal();
					changeSan(2);
				}},
				{ text: '👑 玩王者荣耀', class: 'btn-warning', action: () => {
					const baseSanCost = 5;
					const actualSanCost = Math.abs(getActualSanChange(-baseSanCost));
					const sanText = (gameState.isReversed && gameState.character === 'normal')
						? `SAN值-${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）`
						: `SAN值-${baseSanCost}`;
					addLog('随机事件', '玩游戏放松 - 玩王者荣耀', `成为小代，${sanText}，金币+2`);
					closeModal();
					changeSan(-baseSanCost);
					changeGold(2);
				}}
			]);
		}

		// ★★★ 新增：事件16 - 数据丢失 ★★★
		function showRandomEvent16() {
			// 检查是否有未投稿且分数不为0的论文
			const hasValidPaper = gameState.papers.some(paper =>
				paper && !paper.reviewing && (paper.ideaScore > 0 || paper.expScore > 0 || paper.writeScore > 0)
			);

			if (!hasValidPaper) {
				// 没有符合条件的论文，跳过此事件
				addLog('随机事件', '数据丢失', '幸好你没有正在进行的论文，躲过一劫');
				// ★★★ 达成"躲过一劫"成就 ★★★
				gameState.achievementConditions = gameState.achievementConditions || {};
				gameState.achievementConditions.narrowEscape = true;
				return;
			}

			// ★★★ 新增：数据丢失计数（只有真正触发时才计数）★★★
			gameState.dataLossCount = (gameState.dataLossCount || 0) + 1;

			showModal('💾 随机事件', '<p>实验室服务器崩溃了，你的实验数据全部丢失！</p>', [
				{ text: '😤 熬夜补数据', class: 'btn-danger', action: () => {
					const baseSanCost = -6;
					const actualSanCost = getActualSanChange(baseSanCost);
					const sanText = (gameState.isReversed && gameState.character === 'normal')
						? `SAN值${actualSanCost}（怠惰×${gameState.reversedAwakened ? 3 : 2}）`
						: `SAN值${actualSanCost}`;
					addLog('随机事件', '数据丢失 - 熬夜补数据', `通宵重做实验，${sanText}`);
					closeModal();
					changeSan(baseSanCost);
				}},
				{ text: '😢 从头再来', class: 'btn-warning', action: () => {
					// 所有未投稿论文分数清0
					gameState.papers.forEach((paper, idx) => {
						if (paper && !paper.reviewing) {
							paper.ideaScore = 0;
							paper.expScore = 0;
							paper.writeScore = 0;
						}
					});
					addLog('随机事件', '数据丢失 - 从头再来', '所有未投稿论文分数清零');
					closeModal();
					renderPaperSlots();
					updateAllUI();
				}},
				{ text: '💰 花钱恢复', class: 'btn-primary', action: () => {
					addLog('随机事件', '数据丢失 - 花钱恢复', '找数据恢复公司，金钱-6');
					closeModal();
					changeGold(-6);
				}},
				{ text: '🤥 胡编乱造', class: 'btn-info', action: () => {
					// 永久debuff：论文引用除以2
					gameState.buffs.permanent.push({
						type: 'citation_halved',
						name: '学术不端',
						desc: '所有论文引用速度÷2',
						value: 0.5,
						permanent: true
					});
					addLog('随机事件', '数据丢失 - 胡编乱造', '伪造数据，永久debuff-所有论文引用速度÷2');
					closeModal();
					updateBuffs();
					updateAllUI();
				}}
			]);
		}

		// ==================== 第三年第三月留言事件 ====================
		function triggerMidtermMessageEvent() {
			// 检查是否已经触发过
			if (gameState.hasTriggeredMidtermMessage) return;
			gameState.hasTriggeredMidtermMessage = true;

			// 获取保存的昵称
			const savedNickname = localStorage.getItem('graduateSimulator_nickname') || '';

			showModal('',
				`<div style="position:relative;padding:20px 15px 10px;">
					<!-- 装饰性书签角 -->
					<div style="position:absolute;top:0;right:0;width:0;height:0;border-left:40px solid transparent;border-top:40px solid var(--primary-color);opacity:0.15;"></div>

					<!-- 标题区域 -->
					<div style="text-align:center;margin-bottom:20px;">
						<div style="display:inline-block;background:linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-size:1.5rem;font-weight:700;letter-spacing:2px;">
							研究生生涯过半
						</div>
						<div style="font-size:0.9rem;color:var(--text-secondary);margin-top:8px;font-style:italic;">
							"时光荏苒，转眼已是第三年..."
						</div>
					</div>

					<!-- 便签风格的留言区 -->
					<div style="background:linear-gradient(180deg, #fffef0 0%, #fefcf3 100%);border-radius:12px;padding:16px;margin-bottom:15px;box-shadow:0 2px 8px rgba(0,0,0,0.08);border:1px solid rgba(0,0,0,0.05);position:relative;">
						<!-- 便签顶部装饰条 -->
						<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:60px;height:4px;background:linear-gradient(90deg, var(--primary-color), var(--accent-color));border-radius:0 0 2px 2px;"></div>

						<div style="font-size:0.8rem;color:#888;margin-bottom:12px;text-align:center;padding-top:5px;">
							分享你的感想、吐槽、建议或发现的bug...
						</div>

						<!-- 昵称输入 -->
						<div style="margin-bottom:12px;">
							<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
								<span style="font-size:0.75rem;color:#666;font-weight:500;">昵称</span>
								<span style="font-size:0.7rem;color:#aaa;">最多10字</span>
							</div>
							<input type="text" id="midterm-nickname" placeholder="你的昵称" maxlength="10" value="${savedNickname}"
								style="width:100%;padding:10px 14px;border:2px solid #e8e4d9;border-radius:8px;font-size:0.9rem;background:#fff;color:#333;box-sizing:border-box;transition:border-color 0.2s,box-shadow 0.2s;outline:none;"
								onfocus="this.style.borderColor='var(--primary-color)';this.style.boxShadow='0 0 0 3px rgba(var(--primary-rgb),0.1)';"
								onblur="this.style.borderColor='#e8e4d9';this.style.boxShadow='none';">
						</div>

						<!-- 留言内容 -->
						<div>
							<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
								<span style="font-size:0.75rem;color:#666;font-weight:500;">留言内容</span>
								<span style="font-size:0.7rem;color:#aaa;">最多150字</span>
							</div>
							<textarea id="midterm-content" placeholder="写下你想说的话..." maxlength="150" rows="4"
								style="width:100%;padding:10px 14px;border:2px solid #e8e4d9;border-radius:8px;font-size:0.9rem;background:#fff;color:#333;resize:vertical;box-sizing:border-box;transition:border-color 0.2s,box-shadow 0.2s;outline:none;min-height:80px;line-height:1.5;"
								onfocus="this.style.borderColor='var(--primary-color)';this.style.boxShadow='0 0 0 3px rgba(var(--primary-rgb),0.1)';"
								onblur="this.style.borderColor='#e8e4d9';this.style.boxShadow='none';"></textarea>
						</div>
					</div>

					<!-- 底部提示 -->
					<div style="text-align:center;font-size:0.7rem;color:var(--text-secondary);opacity:0.7;">
						留言将同步到游戏留言板，与其他玩家分享
					</div>
				</div>`,
				[
					{ text: '下次再说', class: 'btn-info', action: () => {
						closeModal();
					}},
					{ text: '提交留言', class: 'btn-primary', action: () => {
						submitMidtermMessage();
					}}
				]
			);
		}

		// 提交留言
		async function submitMidtermMessage() {
			const nicknameInput = document.getElementById('midterm-nickname');
			const contentInput = document.getElementById('midterm-content');

			if (!nicknameInput || !contentInput) {
				closeModal();
				return;
			}

			const nickname = nicknameInput.value.trim();
			const content = contentInput.value.trim();

			// 验证
			if (!nickname) {
				showModal('❌ 提示', '<p>请输入昵称！</p>', [{ text: '确定', class: 'btn-primary', action: () => {
					triggerMidtermMessageEvent();  // 重新显示留言弹窗
				}}]);
				return;
			}

			if (!content) {
				showModal('❌ 提示', '<p>请输入留言内容！</p>', [{ text: '确定', class: 'btn-primary', action: () => {
					triggerMidtermMessageEvent();  // 重新显示留言弹窗
				}}]);
				return;
			}

			if (nickname.length > 10) {
				showModal('❌ 提示', '<p>昵称不能超过10个字符！</p>', [{ text: '确定', class: 'btn-primary', action: () => {
					triggerMidtermMessageEvent();
				}}]);
				return;
			}

			if (content.length > 150) {
				showModal('❌ 提示', '<p>留言内容不能超过150个字符！</p>', [{ text: '确定', class: 'btn-primary', action: () => {
					triggerMidtermMessageEvent();
				}}]);
				return;
			}

			if (!window.supabaseClient) {
				showModal('❌ 错误', '<p>留言服务暂不可用</p>', [{ text: '确定', class: 'btn-primary', action: closeModal }]);
				return;
			}

			try {
				const messageData = {
					nickname: nickname,
					content: content,
					parent_id: null
				};

				const { error } = await window.supabaseClient.from('messages').insert(messageData);

				if (error) throw error;

				// 保存昵称到本地
				localStorage.setItem('graduateSimulator_nickname', nickname);

				// 显示成功提示
				showModal('✅ 感谢分享',
					`<div style="text-align:center;">
						<div style="font-size:2rem;margin-bottom:10px;">💝</div>
						<p>感谢你的分享！</p>
						<p style="font-size:0.85rem;color:var(--text-secondary);">你的留言已同步到留言板</p>
					</div>`,
					[{ text: '继续游戏', class: 'btn-primary', action: closeModal }]
				);

			} catch (e) {
				console.error('发表留言失败:', e);
				showModal('❌ 错误', '<p>发表失败，请稍后重试</p>', [{ text: '确定', class: 'btn-primary', action: closeModal }]);
			}
		}

		// 导出函数
		window.triggerMidtermMessageEvent = triggerMidtermMessageEvent;
		window.submitMidtermMessage = submitMidtermMessage;
