const API_KEY = '7b713299c0ca485bb47543dfe1ec1ae5.2GGZuD0d0qRsIjfg';
const API_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

const lotteryType = 'DOUBLE_COLOR_BALL';
const lotteryName = '双色球';
const issueNumber = '2024016';

const prompt = `${lotteryName} - 第 ${issueNumber} 期 开奖结果`;

async function queryLottery() {
    try {
        const requestBody = {
            model: 'glm-4.5-flash',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
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

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        console.log('=== 双色球第2024016期AI查询结果 ===');
        console.log('AI原始回复:', content);
        
        try {
            const cleanContent = content.replace(/```json|```/g, '').trim();
            const result = JSON.parse(cleanContent);
            console.log('解析后的结果:', JSON.stringify(result, null, 2));
        } catch (e) {
            console.log('JSON解析失败，原始文本:', content);
        }
        
    } catch (error) {
        console.error('查询失败:', error.message);
    }
}

queryLottery();