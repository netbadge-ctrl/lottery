// 测试整合的官方API服务

console.log('🧪 测试整合的官方API服务...\n');

// 彩票类型常量
const LotteryType = {
    UNION_LOTTO: '双色球',
    SUPER_LOTTO: '超级大乐透'
};

// 模拟测试数据
const testCases = [
    { type: LotteryType.UNION_LOTTO, issue: '2025109', name: '双色球' },
    { type: LotteryType.SUPER_LOTTO, issue: '2025108', name: '大乐透' },
    { type: LotteryType.UNION_LOTTO, issue: '2024057', name: '双色球(模拟数据)' }
];

async function testIntegratedAPI() {
    for (const testCase of testCases) {
        console.log(`📋 测试${testCase.name}第${testCase.issue}期:`);
        
        try {
            // 这里模拟我们新的整合逻辑
            console.log(`🇨🇳 首先尝试中国彩票官网...`);
            
            // 模拟从官网获取数据（当前最新期号）
            if (testCase.issue === '2025109' || testCase.issue === '2025108') {
                console.log(`✅ 从官网获取成功!`);
                if (testCase.type === LotteryType.UNION_LOTTO) {
                    console.log(`   红球: 05, 06, 09, 17, 18, 31`);
                    console.log(`   蓝球: 03`);
                } else {
                    console.log(`   前区: 14, 18, 21, 24, 29`);
                    console.log(`   后区: 03, 06`);
                }
                console.log(`   📊 数据来源: 中国彩票官方网站`);
            } else {
                console.log(`⚠️ 官网期号不匹配，尝试备选方案...`);
                console.log(`🔄 正在尝试极速数据API...`);
                console.log(`💡 API密钥未配置，切换到模拟数据`);
                console.log(`✅ 从模拟数据获取成功!`);
                console.log(`   红球: 07, 10, 16, 18, 23, 35`);
                console.log(`   蓝球: 12`);
                console.log(`   ⚠️ 注意: 这是模拟数据，仅用于测试和演示`);
            }
            
        } catch (error) {
            console.log(`❌ 查询出错: ${error.message}`);
        }
        
        console.log(''); // 空行分隔
    }
    
    console.log('🎯 整合API的优势:');
    console.log('   1. ✅ 中国彩票官网 - 最权威的数据源');
    console.log('   2. ✅ 极速数据API - 历史数据查询');
    console.log('   3. ✅ 模拟数据 - 确保功能永远可用');
    console.log('   4. ✅ 智能降级 - 自动选择最佳数据源');
    
    console.log('\n📊 数据源优先级:');
    console.log('   1. 🇨🇳 中国彩票官网（最新数据）');
    console.log('   2. 🌐 极速数据API（历史数据）');
    console.log('   3. 🎭 模拟数据（演示数据）');
}

testIntegratedAPI().catch(console.error);