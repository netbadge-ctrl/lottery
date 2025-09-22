import { LotteryType, type WinningNumbers } from '../types';

// 智谱AI API配置
const API_KEY = (import.meta as any).env?.VITE_ZHIPU_API_KEY || '7b713299c0ca485bb47543dfe1ec1ae5.2GGZuD0d0qRsIjfg';
const API_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// 使用AI获取开奖号码
export const getWinningNumbersByAI = async (lotteryType: LotteryType, issueNumber: string): Promise<WinningNumbers | null> => {
    try {
        const lotteryName = lotteryType === LotteryType.UNION_LOTTO ? '双色球' : '超级大乐透';
        
        // 多次查询验证机制
        const prompts = [
            `${lotteryName} - 第 ${issueNumber} 期 开奖结果`,
            `${issueNumber}期${lotteryName}开奖号码`,
            `请告诉我${lotteryName}第${issueNumber}期的开奖结果`
        ];

        const results = [];
        
        for (const currentPrompt of prompts) {
            try {
                const requestBody = {
                    model: "glm-4.5-flash",
                    messages: [
                        {
                            role: "user",
                            content: currentPrompt
                        }
                    ],
                    temperature: 0.1,
                    max_tokens: 1000
                };

                const response = await fetch(API_BASE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    continue;
                }

                const data = await response.json();
                
                if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                    continue;
                }

                const content = data.choices[0].message.content;
                console.log(`AI查询 "${currentPrompt}" 回复:`, content.substring(0, 200) + '...');
                
                const extracted = extractNumbersFromText(content, lotteryType);
                if (extracted) {
                    results.push(extracted);
                }
                
                // 添加延迟避免API限制
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error(`查询失败: ${currentPrompt}`, error);
                continue;
            }
        }

        // 验证结果一致性
        if (results.length === 0) {
            console.log('所有查询都未能提取到有效号码');
            return null;
        }

        // 找到最常见的结果
        const mostCommon = findMostCommonResult(results);
        if (mostCommon) {
            console.log(`✅ 多次验证后确定${lotteryName}第${issueNumber}期开奖号码:`, mostCommon);
            return {
                lotteryType,
                issueNumber,
                front_area: mostCommon.front_area,
                back_area: mostCommon.back_area
            };
        }

        console.log('多次查询结果不一致，无法确定准确号码');
        return null;

    } catch (error) {
        console.error("使用AI获取开奖号码时出错:", error);
        return null;
    }
};

// 找到最常见的结果
function findMostCommonResult(results: { front_area: string[], back_area: string[] }[]): { front_area: string[], back_area: string[] } | null {
    if (results.length === 0) return null;
    if (results.length === 1) return results[0];
    
    // 将结果转换为字符串进行比较
    const resultStrings = results.map(r => JSON.stringify(r));
    const counts = new Map<string, number>();
    
    resultStrings.forEach(str => {
        counts.set(str, (counts.get(str) || 0) + 1);
    });
    
    // 找到出现次数最多的结果
    let maxCount = 0;
    let mostCommon = null;
    
    for (const [resultStr, count] of counts.entries()) {
        if (count > maxCount) {
            maxCount = count;
            mostCommon = JSON.parse(resultStr);
        }
    }
    
    // 如果最高频次大于1，说明有一致性
    if (maxCount > 1) {
        console.log(`发现一致结果，出现${maxCount}次:`, mostCommon);
        return mostCommon;
    }
    
    // 如果所有结果都不同，返回第一个
    console.log('所有查询结果都不同，返回第一个结果');
    return results[0];
}

// 从文本中提取号码的辅助函数
function extractNumbersFromText(text: string, lotteryType: LotteryType): { front_area: string[], back_area: string[] } | null {
    try {
        console.log('🔍 正在分析AI回复文本:', text.substring(0, 300) + '...');
        
        // 查找红球/前区号码的多种模式
        const redBallPatterns = [
            /红球[：:号码]*\s*([0-9、，,\s]+)/,
            /前区[：:号码]*\s*([0-9、，,\s]+)/,
            /红球号码[：:]*\s*([0-9、，,\s]+)/,
            /(?:红球|前区).*?([0-9]+[、，,\s]+[0-9]+[、，,\s]+[0-9]+[、，,\s]+[0-9]+[、，,\s]+[0-9]+[、，,\s]+[0-9]+)/
        ];
        
        // 查找蓝球/后区号码的多种模式
        const blueBallPatterns = [
            /蓝球[：:号码]*\s*([0-9]+)/,
            /后区[：:号码]*\s*([0-9]+)/,
            /蓝球号码[：:]*\s*([0-9]+)/
        ];
        
        let frontArea: string[] = [];
        let backArea: string[] = [];
        
        // 尝试提取红球/前区号码
        for (const pattern of redBallPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const numbers = match[1]
                    .replace(/[、，]/g, ',')
                    .split(/[,\s]+/)
                    .map(n => n.trim())
                    .filter(n => n && /^\d+$/.test(n))
                    .map(n => n.padStart(2, '0'));
                
                if (lotteryType === LotteryType.UNION_LOTTO && numbers.length === 6) {
                    frontArea = numbers;
                    console.log('✅ 提取到红球号码:', frontArea);
                    break;
                } else if (lotteryType === LotteryType.SUPER_LOTTO && numbers.length === 5) {
                    frontArea = numbers;
                    console.log('✅ 提取到前区号码:', frontArea);
                    break;
                }
            }
        }
        
        // 尝试提取蓝球/后区号码
        for (const pattern of blueBallPatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                const number = match[1].trim().padStart(2, '0');
                if (/^\d+$/.test(number)) {
                    if (lotteryType === LotteryType.UNION_LOTTO) {
                        backArea = [number];
                        console.log('✅ 提取到蓝球号码:', backArea);
                        break;
                    }
                }
            }
        }
        
        // 对于大乐透，需要特殊处理后区两个号码
        if (lotteryType === LotteryType.SUPER_LOTTO && backArea.length === 0) {
            const backPatterns = [
                /后区.*?([0-9]+[、，,\s]+[0-9]+)/,
                /蓝球.*?([0-9]+[、，,\s]+[0-9]+)/
            ];
            
            for (const pattern of backPatterns) {
                const match = text.match(pattern);
                if (match && match[1]) {
                    const numbers = match[1]
                        .replace(/[、，]/g, ',')
                        .split(/[,\s]+/)
                        .map(n => n.trim())
                        .filter(n => n && /^\d+$/.test(n))
                        .map(n => n.padStart(2, '0'));
                    
                    if (numbers.length === 2) {
                        backArea = numbers;
                        console.log('✅ 提取到后区号码:', backArea);
                        break;
                    }
                }
            }
        }
        
        // 验证提取结果
        if (frontArea.length > 0 && backArea.length > 0) {
            const result = { front_area: frontArea, back_area: backArea };
            console.log('🎯 成功提取号码:', result);
            return result;
        } else {
            console.log('❌ 未能提取到完整的号码信息');
            console.log('   前区号码:', frontArea);
            console.log('   后区号码:', backArea);
            return null;
        }
        
    } catch (error) {
        console.error('从文本提取号码失败:', error);
        return null;
    }
}