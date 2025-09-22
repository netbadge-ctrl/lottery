// 新的历史数据API测试脚本
// 使用动态导入来正确导入TypeScript模块

async function runTests() {
    console.log('📚 开始测试历史数据抓取功能...\n');
    
    try {
        // 动态导入TypeScript模块
        const chinaLotteryAPI = await import('./services/chinaLotteryAPI.js');
        const { LotteryType } = await import('./types.js');
        
        console.log('🔴 测试双色球历史数据抓取...');
        const unionLottoResults = await chinaLotteryAPI.fetchRecentLotteryHistory(LotteryType.UNION_LOTTO, 5);
        
        if (unionLottoResults && unionLottoResults.length > 0) {
            console.log(`✅ 成功获取双色球历史页面，找到 ${unionLottoResults.length} 期开奖记录`);
            console.log('📋 最近5期开奖记录:');
            for (let i = 0; i < Math.min(5, unionLottoResults.length); i++) {
                const record = unionLottoResults[i];
                console.log(`   第${record.issueNumber}期: ${record.front_area.join(' ')} | ${record.back_area.join(' ')}`);
            }
        } else {
            console.log('⚠️ 未找到双色球开奖记录');
        }
        
        console.log('\n🔵 测试大乐透历史数据抓取...');
        const superLottoResults = await chinaLotteryAPI.fetchRecentLotteryHistory(LotteryType.SUPER_LOTTO, 5);
        
        if (superLottoResults && superLottoResults.length > 0) {
            console.log(`✅ 成功获取大乐透历史页面，找到 ${superLottoResults.length} 期开奖记录`);
            console.log('📋 最近5期开奖记录:');
            for (let i = 0; i < Math.min(5, superLottoResults.length); i++) {
                const record = superLottoResults[i];
                console.log(`   第${record.issueNumber}期: ${record.front_area.join(' ')} | ${record.back_area.join(' ')}`);
            }
        } else {
            console.log('⚠️ 未找到大乐透开奖记录');
        }
        
        console.log('\n🎉 测试完成！');
    } catch (error) {
        console.error('❌ 测试失败:', error);
    }
}

runTests();