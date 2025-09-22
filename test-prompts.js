// 测试不同的提示词
const API_KEY = '7b713299c0ca485bb47543dfe1ec1ae5.2GGZuD0d0qRsIjfg';
const API_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

const prompts = [
    "双色球 - 第 2024016 期 开奖结果",
    "2024016期双色球开奖号码",
    "双色球2024016期中奖号码是什么",
    "请告诉我双色球第2024016期的开奖结果"
];

async function testPrompt(prompt, index) {
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
        
        console.log(`\n=== 提示词 ${index + 1}: "${prompt}" ===`);
        console.log('AI回复:', content.substring(0, 200) + (content.length > 200 ? '...' : ''));
        
        // 检查是否包含实际号码
        const hasNumbers = /\d{2}.*\d{2}.*\d{2}/.test(content);
        console.log('包含号码:', hasNumbers ? '✅' : '❌');
        
    } catch (error) {
        console.error(`提示词 ${index + 1} 测试失败:`, error.message);
    }
}

async function testAllPrompts() {
    for (let i = 0; i < prompts.length; i++) {
        await testPrompt(prompts[i], i);
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

testAllPrompts();