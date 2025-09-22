// 测试不同提示词直到获得正确结果
const API_KEY = '7b713299c0ca485bb47543dfe1ec1ae5.2GGZuD0d0qRsIjfg';
const API_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

// 正确答案
const correctAnswer = {
    red: ['07', '12', '20', '24', '32', '33'],
    blue: ['04']
};

const prompts = [
    "中国福利彩票双色球第2024016期开奖结果",
    "双色球2024016期开奖号码查询",
    "福彩双色球第2024016期中奖号码",
    "2024016期双色球开奖公告",
    "双色球第2024016期开奖信息",
    "查询双色球2024016期开奖结果",
    "福利彩票双色球2024016期开奖号码是多少",
    "双色球2024016期红球蓝球号码",
    "2024年第016期双色球开奖结果",
    "双色球24016期开奖号码"
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
        
        // 提取红球号码
        const redMatch = content.match(/(?:红球|前区)[:：]\s*(\d+(?:\s*[,，、]\s*\d+)*)/);
        // 提取蓝球号码
        const blueMatch = content.match(/(?:蓝球|后区)[:：]\s*(\d+)/);
        
        if (redMatch && blueMatch) {
            const redBalls = redMatch[1].split(/[,，、]/).map(n => n.trim().padStart(2, '0'));
            const blueBalls = [blueMatch[1].trim().padStart(2, '0')];
            
            console.log('提取的红球:', redBalls);
            console.log('提取的蓝球:', blueBalls);
            
            // 检查是否正确
            const redCorrect = JSON.stringify(redBalls.sort()) === JSON.stringify(correctAnswer.red.sort());
            const blueCorrect = JSON.stringify(blueBalls) === JSON.stringify(correctAnswer.blue);
            
            if (redCorrect && blueCorrect) {
                console.log('🎉 找到正确答案！');
                return true;
            } else {
                console.log('❌ 不正确');
                console.log('正确红球:', correctAnswer.red);
                console.log('正确蓝球:', correctAnswer.blue);
            }
        } else {
            console.log('❌ 未能提取到号码');
            console.log('AI回复:', content.substring(0, 150) + '...');
        }
        
        return false;
        
    } catch (error) {
        console.error(`提示词 ${index + 1} 测试失败:`, error.message);
        return false;
    }
}

async function findCorrectPrompt() {
    console.log('正在测试不同提示词，寻找能获得正确结果的方法...');
    console.log('正确答案: 红球 07,12,20,24,32,33 蓝球 04');
    
    for (let i = 0; i < prompts.length; i++) {
        const success = await testPrompt(prompts[i], i);
        if (success) {
            console.log(`\n✅ 成功！提示词 "${prompts[i]}" 获得了正确结果！`);
            break;
        }
        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

findCorrectPrompt();