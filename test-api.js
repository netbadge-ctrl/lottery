// 测试极速数据免费彩票API接口
// API文档：https://www.jisuapi.com/api/caipiao/

// 测试配置
const TEST_CONFIG = {
    baseUrl: 'https://api.jisuapi.com/caipiao',
    apiKey: 'your_jisu_api_key_here', // 需要替换为实际的API密钥
    testCases: [
        { caipiaoid: 13, issueNumber: '2024057', name: '双色球' },
        { caipiaoid: 22, issueNumber: '2024057', name: '大乐透' }
    ]
};

async function testJisuAPI() {
    console.log('🧪 开始测试极速数据免费彩票API接口...\n');
    
    for (const testCase of TEST_CONFIG.testCases) {
        console.log(`📋 测试${testCase.name}第${testCase.issueNumber}期:`);
        
        try {
            const url = `${TEST_CONFIG.baseUrl}/query`;
            const params = new URLSearchParams({
                appkey: TEST_CONFIG.apiKey,
                caipiaoid: testCase.caipiaoid.toString(),
                issueno: testCase.issueNumber
            });
            
            const response = await fetch(`${url}?${params}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.status === 0) {
                const result = data.result;
                console.log(`✅ 查询成功!`);
                console.log(`   期号: ${result.issueno}`);
                console.log(`   开奖号码: ${result.number}`);
                if (result.refernumber) {
                    console.log(`   参考号码: ${result.refernumber}`);
                }
                console.log(`   开奖日期: ${result.opendate}`);
                if (result.saleamount) {
                    console.log(`   销售额: ${result.saleamount}元`);
                }
                
                // 解析开奖号码
                const numbers = result.number.trim().split(/\s+/);
                if (testCase.caipiaoid === 13) { // 双色球
                    console.log(`   🔴 红球: ${numbers.slice(0, 6).join(', ')}`);
                    const blueBall = result.refernumber || numbers[6];
                    console.log(`   🔵 蓝球: ${blueBall}`);
                } else if (testCase.caipiaoid === 22) { // 大乐透
                    console.log(`   ⚪ 前区: ${numbers.slice(0, 5).join(', ')}`);
                    console.log(`   🔵 后区: ${numbers.slice(5, 7).join(', ')}`);
                }
            } else {
                console.log(`❌ 查询失败: ${data.status} - ${data.msg}`);
                if (data.status === 201 || data.msg.includes('appkey')) {
                    console.log(`💡 提示: 请先申请极速数据API密钥并替换上面的 'your_jisu_api_key_here'`);
                    console.log(`📝 申请地址: https://www.jisuapi.com/api/caipiao/`);
                    console.log(`🎁 免费版每天可查询100次，注册即可获得!`);
                }
            }
        } catch (error) {
            console.log(`❌ 请求出错: ${error.message}`);
        }
        
        console.log(''); // 空行分隔
    }
    
    console.log('📖 极速数据API特点:');
    console.log('1. ✅ 完全免费 - 注册即可获得每天100次查询额度');
    console.log('2. ✅ 数据准确 - 官方权威数据源');
    console.log('3. ✅ 支持多种彩票 - 双色球、大乐透、3D等');
    console.log('4. ✅ 简单易用 - RESTful API，支持GET/POST请求');
    console.log('5. ✅ 实时更新 - 开奖后快速更新数据');
    console.log('\n🔗 申请地址: https://www.jisuapi.com/api/caipiao/');
}

// 运行测试
testJisuAPI().catch(console.error);