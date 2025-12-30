        // ==================== 通用属性修改函数（支持逆位）====================
        // 计算实际SAN变化值（考虑怠惰之大多数的翻倍效果和季节buff）
        function getActualSanChange(delta) {
            if (delta < 0) {
                // 怠惰之大多数效果
                if (gameState.isReversed && gameState.character === 'normal') {
                    const multiplier = gameState.reversedAwakened ? 3 : 2;
                    delta = delta * multiplier;
                }
                // ★★★ 新增：季节buff（对扣SAN操作生效）★★★
                const seasonMod = getSeasonSanModifier();
                if (seasonMod !== 0) {
                    delta = delta + seasonMod;  // 春季-1（减少扣除），夏季+1（增加扣除）
                    if (delta > 0) delta = 0;  // 最低扣0
                }
            }
            return delta;
        }

        function changeSan(delta) {
            if (delta < 0) {
                // 怠惰之大多数效果
                if (gameState.isReversed && gameState.character === 'normal') {
                    const multiplier = gameState.reversedAwakened ? 3 : 2;
                    delta = delta * multiplier;
                }
                // ★★★ 新增：季节buff（对扣SAN操作生效）★★★
                const seasonMod = getSeasonSanModifier();
                if (seasonMod !== 0) {
                    delta = delta + seasonMod;  // 春季-1（减少扣除），夏季+1（增加扣除）
                    if (delta > 0) delta = 0;  // 最低扣0
                }
            }

            if (delta > 0) {
                gameState.san = Math.min(gameState.sanMax, gameState.san + delta);
            } else {
                gameState.san += delta;
            }
            updateAllUI();
            // ★★★ 黑市：理智护身符检查 ★★★
            checkAmuletEffects();
            if (gameState.san < 0) {
                triggerEnding('burnout');
                return false;
            }
            return true;
        }

        // ★★★ 关键修改：changeGold函数 ★★★
		function changeGold(delta) {
			// ★★★ 修改：贪求之富可敌国觉醒后每花费4金币属性各+1 ★★★
			if (gameState.isReversed && gameState.character === 'rich' && gameState.reversedAwakened && delta < 0) {
				const spent = Math.abs(delta);
				gameState.goldSpentTotal = (gameState.goldSpentTotal || 0) + spent;

				// ★★★ 修改：每消费4金币，SAN/科研/社交/好感各+1 ★★★
				const attributeGains = Math.floor(gameState.goldSpentTotal / 4);
				const previousGains = Math.floor((gameState.goldSpentTotal - spent) / 4);
				const newGains = attributeGains - previousGains;

				if (newGains > 0) {
					gameState.san = Math.min(gameState.sanMax, gameState.san + newGains);
					gameState.research = Math.min(20, gameState.research + newGains);
					gameState.social = Math.min(20, gameState.social + newGains);
					gameState.favor = Math.min(20, gameState.favor + newGains);
					addLog('逆位效果', '金钱觉醒', `累计消费${gameState.goldSpentTotal}金 → SAN+${newGains}, 科研+${newGains}, 社交+${newGains}, 好感+${newGains}`);
					// ★★★ 修复：科研和社交增加时检查解锁 ★★★
					checkResearchUnlock();
					checkSocialUnlock();
				}
			}

			gameState.gold += delta;
			// ★★★ 新增：赤贫学子诅咒 - 金币上限检查 ★★★
			clampGold();
			updateAllUI();
			// ★★★ 黑市：零钱护身符检查 ★★★
			checkAmuletEffects();
			if (gameState.gold < 0) {
				triggerEnding('poor');
				return false;
			}
			return true;
		}

		// ★★★ 新增：金币上限限制函数（赤贫学子诅咒）★★★
		function clampGold() {
			if (gameState.goldMax !== undefined && gameState.gold > gameState.goldMax) {
				gameState.gold = gameState.goldMax;
			}
		}

		function changeFavor(delta) {
			const favorMax = gameState.favorMax || 20;

			// ★★★ 玩世之导师子女：全新能力 - 好感不会低于0，归零时重置 ★★★
			if (gameState.isReversed && gameState.character === 'teacher-child') {
				// 正常应用好感度变化（不反转）
				if (delta > 0) {
					gameState.favor = Math.min(favorMax, gameState.favor + delta);
				} else {
					gameState.favor += delta;
				}

				// 好感度归零检测
				if (gameState.favor <= 0) {
					// ★★★ 修改：未觉醒时重置为6，觉醒后重置为4，但不超过上限 ★★★
					const resetValue = (gameState.reversedAwakened === true) ? 4 : 6;
					gameState.favor = Math.min(favorMax, resetValue);
					gameState.social = Math.min(gameState.socialMax || 20, gameState.social + 1);
					gameState.research = Math.min(gameState.researchMax || 20, gameState.research + 1);
					gameState.gold += 2;
					clampGold();  // ★★★ 赤贫学子诅咒 ★★★

					if (gameState.reversedAwakened) {
						addLog('逆位效果', '变本加厉（觉醒）', `好感度归零，重置为${Math.min(favorMax, resetValue)} → 社交+1, 科研+1, 金币+2`);
					} else {
						addLog('逆位效果', '变本加厉', `好感度归零，重置为${Math.min(favorMax, resetValue)} → 社交+1, 科研+1, 金币+2`);
					}
				}

				updateAllUI();
				// 玩世之导师子女不会因好感度触发退学
				return true;
			}
			
			// 非导师子女的原有逻辑
			if (delta > 0) {
				gameState.favor = Math.min(favorMax, gameState.favor + delta);
			} else {
				gameState.favor += delta;
			}

			updateAllUI();
			// ★★★ 黑市：好感护身符检查 ★★★
			checkAmuletEffects();
			if (gameState.favor < 0) {
				triggerEnding('expelled');
				return false;
			}
			return true;
		}

		function changeResearch(delta) {
			// 愚钝之院士转世：科研能力固定为0
			if (gameState.isReversed && gameState.character === 'genius') {
				if (delta > 0) {
					gameState.blockedResearchGains += delta;
					if (gameState.reversedAwakened === true) {
						// ★★★ 修改：觉醒后金+8，SAN+8，社交+2，好感+2 ★★★
						const sanGain = delta * 8;
						const goldGain = delta * 8;
						const favorGain = delta * 2;
						const socialGain = delta * 2;
						gameState.san = Math.min(gameState.sanMax, gameState.san + sanGain);
						gameState.gold += goldGain;
						clampGold();  // ★★★ 赤贫学子诅咒 ★★★
						gameState.favor = Math.min(20, gameState.favor + favorGain);
						gameState.social = Math.min(20, gameState.social + socialGain);
						addLog('逆位效果', '大智若愚', `科研提升被转化 → SAN+${sanGain}, 金+${goldGain}, 好感+${favorGain}, 社交+${socialGain}`);
					} else {
						// ★★★ 修改：未觉醒时金+4，SAN+4，社交+1，好感+1 ★★★
						const sanGain = delta * 4;
						const goldGain = delta * 4;
						const socialGain = delta * 1;
						const favorGain = delta * 1;
						gameState.san = Math.min(gameState.sanMax, gameState.san + sanGain);
						gameState.gold += goldGain;
						clampGold();  // ★★★ 赤贫学子诅咒 ★★★
						gameState.social = Math.min(20, gameState.social + socialGain);
						gameState.favor = Math.min(20, gameState.favor + favorGain);
						addLog('逆位效果', '愚钝转化', `科研提升被转化 → SAN+${sanGain}, 金+${goldGain}, 社交+${socialGain}, 好感+${favorGain}`);
					}
				}
				gameState.research = 0;
				updateAllUI();
				return true;
			}
            
			if (delta > 0) {
				// ★★★ 修改：使用动态上限 ★★★
				const maxResearch = gameState.researchMax || 20;
				gameState.research = Math.min(maxResearch, gameState.research + delta);
				checkResearchUnlock();
			} else {
				gameState.research = Math.max(0, gameState.research + delta);
			}
			updateAllUI();
			return true;
		}

		function changeSocial(delta) {
			const oldSocial = gameState.social;
			const socialMax = gameState.socialMax || 20;

			if (delta > 0) {
				gameState.social = Math.min(socialMax, gameState.social + delta);
				// ★★★ 新增：社交能力提升时检查解锁 ★★★
				checkSocialUnlock();
			} else {
				gameState.social += delta;
			}

			// ★★★ 黑市：社交护身符检查 ★★★
			checkAmuletEffects();

			// 检查社交能力是否为负数
			if (gameState.social < 0) {
				triggerEnding('isolated'); // 触发"被孤立"结局
				return false;
			}

			// 其他逻辑（如逆位角色的效果）
			if (gameState.isReversed && gameState.character === 'social') {
				const change = gameState.social - oldSocial;
				if (change < 0) {
					const amount = Math.abs(change);
					changeResearch(amount);
					gameState.favor = Math.min(gameState.favorMax || 20, gameState.favor + amount);
					addLog('逆位效果', '嫉妒转化', `社交-${amount} → 科研+${amount}, 好感+${amount}`);
				} else if (change > 0) {
					gameState.san = Math.min(gameState.sanMax, gameState.san + change);
					gameState.gold += change;
					clampGold();  // ★★★ 赤贫学子诅咒 ★★★
					addLog('逆位效果', '嫉妒反馈', `社交+${change} → SAN+${change}, 金钱+${change}`);
				}
			}

			updateAllUI();
			return true;
		}


        // ★★★ 关键修改：changeStats函数 ★★★
        function changeStats(changes) {
            let gameOver = false;
            
            if (changes.sanMax) gameState.sanMax += changes.sanMax;
            
            if (changes.san) {
                let sanDelta = changes.san;
                if (gameState.isReversed && gameState.character === 'normal' && sanDelta < 0) {
                    const multiplier = gameState.reversedAwakened ? 3 : 2;
                    sanDelta = sanDelta * multiplier;
                }
                
                if (sanDelta > 0) {
                    gameState.san = Math.min(gameState.sanMax, gameState.san + sanDelta);
                } else {
                    gameState.san += sanDelta;
                }
                if (gameState.san < 0) gameOver = 'burnout';
            }
            
			if (changes.gold) {
				// ★★★ 修改：贪求之富可敌国觉醒后每花费4金币属性各+1 ★★★
				if (gameState.isReversed && gameState.character === 'rich' && gameState.reversedAwakened && changes.gold < 0) {
					const spent = Math.abs(changes.gold);
					gameState.goldSpentTotal = (gameState.goldSpentTotal || 0) + spent;
					
					// ★★★ 修改：6改为4 ★★★
					const attributeGains = Math.floor(gameState.goldSpentTotal / 4);
					const previousGains = Math.floor((gameState.goldSpentTotal - spent) / 4);
					const newGains = attributeGains - previousGains;
					
					if (newGains > 0) {
						gameState.san = Math.min(gameState.sanMax, gameState.san + newGains);
						gameState.research = Math.min(20, gameState.research + newGains);
						gameState.social = Math.min(20, gameState.social + newGains);
						gameState.favor = Math.min(20, gameState.favor + newGains);
						addLog('逆位效果', '金钱觉醒', `累计消费${gameState.goldSpentTotal}金 → SAN+${newGains}, 科研+${newGains}, 社交+${newGains}, 好感+${newGains}`);
					}
				}
				gameState.gold += changes.gold;
				clampGold();  // ★★★ 赤贫学子诅咒 ★★★
				if (gameState.gold < 0 && !gameOver) gameOver = 'poor';
			}
            
			if (changes.favor) {
				const favorMax = gameState.favorMax || 20;
				
				// ★★★ 玩世之导师子女：全新能力 ★★★
				if (gameState.isReversed && gameState.character === 'teacher-child') {
					if (changes.favor > 0) {
						gameState.favor = Math.min(favorMax, gameState.favor + changes.favor);
					} else {
						gameState.favor += changes.favor;
					}

					// ✅ 添加归零条件判断
					if (gameState.favor <= 0) {
						// ★★★ 修改：未觉醒时重置为6，觉醒后重置为4，但不超过上限 ★★★
						const resetValue = (gameState.reversedAwakened === true) ? 4 : 6;
						gameState.favor = Math.min(favorMax, resetValue);
						gameState.social = Math.min(gameState.socialMax || 20, gameState.social + 1);
						gameState.research = Math.min(gameState.researchMax || 20, gameState.research + 1);
						gameState.gold += 2;
						clampGold();  // ★★★ 赤贫学子诅咒 ★★★

						if (gameState.reversedAwakened) {
							addLog('逆位效果', '变本加厉（觉醒）', `好感度归零，重置为${Math.min(favorMax, resetValue)} → 社交+1, 科研+1, 金币+2`);
						} else {
							addLog('逆位效果', '变本加厉', `好感度归零，重置为${Math.min(favorMax, resetValue)} → 社交+1, 科研+1, 金币+2`);
						}
					}
					// 玩世之导师子女不会因好感度触发退学
				} else {
					// 非导师子女的原有逻辑
					if (changes.favor > 0) {
						gameState.favor = Math.min(favorMax, gameState.favor + changes.favor);
					} else {
						gameState.favor += changes.favor;
					}
					if (gameState.favor < 0 && !gameOver) gameOver = 'expelled';
				}
			}
            
			if (changes.research) {
				if (gameState.isReversed && gameState.character === 'genius') {
					if (changes.research > 0) {
						gameState.blockedResearchGains += changes.research;
						// ★★★ 修改：觉醒后8倍，未觉醒4倍（使用严格布尔比较）★★★
						const sanGain = changes.research * (gameState.reversedAwakened === true ? 8 : 4);
						const goldGain = changes.research * (gameState.reversedAwakened === true ? 8 : 4);
						gameState.san = Math.min(gameState.sanMax, gameState.san + sanGain);
						gameState.gold += goldGain;
						clampGold();  // ★★★ 赤贫学子诅咒 ★★★
						// ★★★ 修改：未觉醒也有社交和好感加成（使用严格布尔比较）★★★
						if (gameState.reversedAwakened === true) {
							gameState.favor = Math.min(20, gameState.favor + changes.research * 2);
							gameState.social = Math.min(20, gameState.social + changes.research * 2);
						} else {
							gameState.favor = Math.min(20, gameState.favor + changes.research * 1);
							gameState.social = Math.min(20, gameState.social + changes.research * 1);
						}
					}
					gameState.research = 0;
				} else {
                    if (changes.research > 0) {
                        gameState.research = Math.min(20, gameState.research + changes.research);
                        checkResearchUnlock();
                    } else {
                        gameState.research = Math.max(0, gameState.research + changes.research);
                    }
                }
            }
            
			if (changes.social) {
				const oldSocial = gameState.social;
				const socialMax = gameState.socialMax || 20;  // ★★★ 新增 ★★★
				if (changes.social > 0) {
					gameState.social = Math.min(socialMax, gameState.social + changes.social);  // ★★★ 修改 ★★★
					// ★★★ 新增：社交能力提升时检查解锁 ★★★
					checkSocialUnlock();
				} else {
					gameState.social = Math.max(0, gameState.social + changes.social);
				}

				// 嫉妒之社交达人
				if (gameState.isReversed && gameState.character === 'social') {
					const change = gameState.social - oldSocial;
					if (change < 0) {
						const amount = Math.abs(change);
						changeResearch(amount);
						gameState.favor = Math.min(gameState.favorMax || 20, gameState.favor + amount);  // ★★★ 修改 ★★★
						addLog('逆位效果', '嫉妒转化', `社交-${amount} → 科研+${amount}, 好感+${amount}`);
					} else if (change > 0) {
						gameState.san = Math.min(gameState.sanMax, gameState.san + change);
						gameState.gold += change;
						clampGold();  // ★★★ 赤贫学子诅咒 ★★★
						addLog('逆位效果', '嫉妒反馈', `社交+${change} → SAN+${change}, 金钱+${change}`);
					}
				}
			}
            
            updateAllUI();

            // ★★★ 黑市：护身符效果检查（可能重置属性归零状态）★★★
            checkAmuletEffects();

            // ★★★ 重新检查是否还需要触发结局 ★★★
            gameOver = false;
            if (gameState.san < 0) gameOver = 'burnout';
            if (gameState.gold < 0 && !gameOver) gameOver = 'poor';
            if (gameState.favor < 0 && !gameOver && !(gameState.isReversed && gameState.character === 'teacher-child')) gameOver = 'expelled';

            if (gameOver) {
                triggerEnding(gameOver);
                return false;
            }
            return true;
        }
		
