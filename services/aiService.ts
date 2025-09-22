import type { ScannedTicketData } from '../types';

// 智谱AI API配置
const API_KEY = (import.meta as any).env?.VITE_ZHIPU_API_KEY || '7b713299c0ca485bb47543dfe1ec1ae5.2GGZuD0d0qRsIjfg';
const API_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

if (!API_KEY) {
    console.error("VITE_ZHIPU_API_KEY environment variable not set!");
}

// 将文件转换为base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const scanLotteryTicket = async (base64Image: string, mimeType: string): Promise<ScannedTicketData | null> => {
    try {
        const prompt = `请仔细分析这张中国彩票图片，识别以下信息：

1. 彩票类型（必须是"双色球"或"超级大乐透"）
2. 期号（例如"2024014"）
3. 所有投注号码（包括单式和复式投注）

重要说明：
- 这可能是复式投注彩票，请识别所有的投注组合
- 复式投注会有多组号码组合
- 请仔细识别每一行的投注号码

请严格按照以下JSON格式返回数据：

{
  "lotteryType": "双色球" 或 "超级大乐透",
  "issueNumber": "期号",
  "numbers": [
    {
      "front_area": ["前区号码数组，两位数字符串"],
      "back_area": ["后区号码数组，两位数字符串"]
    }
  ]
}

彩票规则：
- 双色球：前区6个红球(01-33)，后区1个蓝球(01-16)
- 超级大乐透：前区5个号码(01-35)，后区2个号码(01-12)
- 复式投注：可能有多组不同的号码组合
- 所有号码必须格式化为两位数字符串（如"01"、"15"）

请确保识别出图片中的所有投注组合！`;

        const requestBody = {
            model: "glm-4v-plus",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`
                            }
                        }
                    ]
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
            throw new Error(`智谱AI API请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error('智谱AI API返回数据格式错误');
        }

        const content = data.choices[0].message.content;
        
        // 尝试提取JSON内容
        let jsonText = content.trim();
        
        // 如果内容包含```json标记，提取其中的JSON
        const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            jsonText = jsonMatch[1];
        } else {
            // 尝试找到第一个{和最后一个}之间的内容
            const startIndex = jsonText.indexOf('{');
            const endIndex = jsonText.lastIndexOf('}');
            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                jsonText = jsonText.substring(startIndex, endIndex + 1);
            }
        }

        const parsedData = JSON.parse(jsonText);

        // 基本验证
        if (parsedData && parsedData.lotteryType && parsedData.issueNumber && Array.isArray(parsedData.numbers)) {
            // 验证彩票类型
            if (!['双色球', '超级大乐透'].includes(parsedData.lotteryType)) {
                console.error('无效的彩票类型:', parsedData.lotteryType);
                return null;
            }
            
            return parsedData as ScannedTicketData;
        }

        console.error('解析的数据格式不正确:', parsedData);
        return null;

    } catch (error) {
        console.error("调用智谱AI API时出错:", error);
        return null;
    }
};
