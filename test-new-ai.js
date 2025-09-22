// 测试新的AI查询服务
const API_KEY = '7b713299c0ca485bb47543dfe1ec1ae5.2GGZuD0d0qRsIjfg';
const API_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

async function testNewAI() {
    const lotteryName = '双色球';
    const issueNumber = '2024016';
    
    const prompt = `${lotteryName} - 第 ${issueNumber} 期 开奖结果

请以JSON格式返回开奖号码：
{
  "front_area": ["红球号码，两位数格式"],
  "back_area": ["蓝球号码，两位数格式"]
}`;

    try {
        const requestBody = {
            model: "glm-4.5-flash",
            messages: [
                {
                    role: "user",
                    content: prompt
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

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        console.log('=== 新AI服务测试结果 ===');
        console.log('AI回复:', content);
        
        // 尝试提取JSON
        const jsonMatch = content.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
            try {
                const result = JSON.parse(jsonMatch[0]);
                console.log('提取的JSON:', JSON.stringify(result, null, 2));
                
                // 格式化号码
                if (result.front_area && result.back_area) {
                    const formatted = {
                        front_area: result.front_area.map(n => n.toString().padStart(2, '0')),
                        back_area: result.back_area.map(n => n.toString().padStart(2, '0'))
                    };
                    console.log('格式化后:', JSON.stringify(formatted, null, 2));
                }
            } catch (e) {
                console.log('JSON解析失败');
            }
        }
        
        // 尝试从文本提取
        const redMatch = content.match(/(?:红球|前区)[:：]\s*(\d+(?:\s*[,，]\s*\d+)*)/);
        const blueMatch = content.match(/(?:蓝球|后区)[:：]\s*(\d+(?:\s*[,，]\s*\d+)*)/);
        
        if (redMatch && blueMatch) {
            const frontArea = redMatch[1].split(/[,，]/).map(n => n.trim().padStart(2, '0'));
            const backArea = blueMatch[1].split(/[,，]/).map(n => n.trim().padStart(2, '0'));
            
            console.log('从文本提取的结果:');
            console.log('红球:', frontArea);
            console.log('蓝球:', backArea);
        }
        
    } catch (error) {
        console.error('测试失败:', error);
    }
}

testNewAI();