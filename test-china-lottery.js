// 测试中国彩票官网API

console.log('🧪 测试中国彩票官网API...\n');

// 彩票类型常量
const LotteryType = {
    UNION_LOTTO: '双色球',
    SUPER_LOTTO: '超级大乐透'
};

// 模拟从官网获取的HTML内容
const mockHtml = `
双色球25109期 · 25-09-21 周日
*05**06**09**17**18**31**03*

大乐透25108期 · 25-09-20 周六
*14**18**21**24**29**03**06*
`;

function testParsePattern() {
    console.log('🔍 测试数据解析模式...\n');
    
    // 测试双色球解析
    const unionLottoPattern = /双色球(\d+)期[\s\S]*?(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*/;
    const unionMatch = mockHtml.match(unionLottoPattern);
    
    if (unionMatch) {
        const [, period, ...numbers] = unionMatch;
        console.log('✅ 双色球解析成功:');
        console.log(`   期号: 20${period}`);
        console.log(`   红球: ${numbers.slice(0, 6).join(', ')}`);
        console.log(`   蓝球: ${numbers[6]}`);
    } else {
        console.log('❌ 双色球解析失败');
    }
    
    console.log('');
    
    // 测试大乐透解析
    const superLottoPattern = /大乐透(\d+)期[\s\S]*?(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*\*(\d{2})\*/;
    const superMatch = mockHtml.match(superLottoPattern);
    
    if (superMatch) {
        const [, period, ...numbers] = superMatch;
        console.log('✅ 大乐透解析成功:');
        console.log(`   期号: 20${period}`);
        console.log(`   前区: ${numbers.slice(0, 5).join(', ')}`);
        console.log(`   后区: ${numbers.slice(5, 7).join(', ')}`);
    } else {
        console.log('❌ 大乐透解析失败');
    }
}

async function testRealAPI() {
    console.log('\n🌐 测试真实API调用...\n');
    
    try {
        const url = 'https://m.china-lottery.cn/home/nation?frm=z_baidu';
        
        console.log('📡 正在请求官网数据...');
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
            }
        });
        
        if (response.ok) {
            const html = await response.text();
            console.log('✅ 成功获取官网页面');
            console.log(`📊 页面大小: ${html.length} 字符`);
            
            // 检查是否包含预期的彩票数据
            if (html.includes('双色球') && html.includes('大乐透')) {
                console.log('✅ 页面包含双色球和大乐透数据');
                
                // 简单提取示例
                const unionMatch = html.match(/双色球(\d+)期/);
                const superMatch = html.match(/大乐透(\d+)期/);
                
                if (unionMatch) {
                    console.log(`📋 最新双色球期号: 20${unionMatch[1]}`);
                }
                if (superMatch) {
                    console.log(`📋 最新大乐透期号: 20${superMatch[1]}`);
                }
            } else {
                console.log('⚠️ 页面格式可能已变化');
            }
        } else {
            console.log(`❌ 请求失败: ${response.status}`);
        }
        
    } catch (error) {
        console.log(`❌ 网络错误: ${error.message}`);
    }
}

// 运行测试
console.log('🎯 开始测试中国彩票官网数据解析...\n');
testParsePattern();
testRealAPI().catch(console.error);