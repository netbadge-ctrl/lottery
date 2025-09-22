// 查询2024057期双色球开奖结果
const API_KEY = '7b713299c0ca485bb47543dfe1ec1ae5.2GGZuD0d0qRsIjfg';
const API_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

async function query2024057() {
    const prompt = "双色球 - 第 2024057 期 开奖结果";
    
    try {
        const requestBody = {
            model: "glm-4.5-flash",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1,
            max_tokens: 500
        };

        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        console.log('=== 双色球第2024057期AI查询结果 ===');
        console.log('AI回复:', content);
        
        // 提取红球号码
        const redMatch = content.match(/(?:红球|前区)[:：]\s*(\d+(?:\s*[,，、]\s*\d+)*)/);
        // 提取蓝球号码
        const blueMatch = content.match(/(?:蓝球|后区)[:：]\s*(\d+)/);
        
        if (redMatch && blueMatch) {
            const redBalls = redMatch[1].split(/[,，、]/).map(n => n.trim().padStart(2, '0'));
            const blueBalls = [blueMatch[1].trim().padStart(2, '0')];
            
            console.log('\n提取的开奖号码:');
            console.log('红球:', redBalls.join(', '));
            console.log('蓝球:', blueBalls.join(', '));
            
            console.log('\n格式化为代码:');
            console.log(`{
    lotteryType: LotteryType.UNION_LOTTO,
    issueNumber: '2024057',
    front_area: [${redBalls.map(n => `'${n}'`).join(', ')}],
    back_area: [${blueBalls.map(n => `'${n}'`).join(', ')}]
}`);
        } else {
            console.log('❌ 未能提取到号码格式');
        }
        
    } catch (error) {
        console.error('查询失败:', error);
    }
}

query2024057();