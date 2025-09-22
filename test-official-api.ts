import { LotteryType } from './types';
import { fetchOfficialWinningNumbers, fetchSupportedLotteryTypes } from './services/officialLotteryAPI';
import { getWinningNumbers } from './services/lotteryService';

async function testOfficialAPI() {
    console.log('🧪 测试聚合数据官方API接口');
    console.log('==========================================');
    console.log('');
    
    // 首先获取支持的彩票类型
    console.log('📋 获取支持的彩票类型...');
    try {
        const types = await fetchSupportedLotteryTypes();
        if (types && types.length > 0) {
            console.log('✅ 支持的彩票类型:');
            types.slice(0, 10).forEach((type: any) => {
                console.log(`   ${type.lottery_id}: ${type.lottery_name}`);
            });
            console.log(`   ... 共${types.length}种彩票`);
        }
    } catch (error) {
        console.error('❌ 获取彩票类型失败:', error);
    }
    
    console.log('');
    console.log('🎲 测试双色球开奖号码查询...');
    
    // 测试双色球最新期开奖号码
    try {
        console.log('📋 查询双色球最新期开奖号码...');
        const result = await fetchOfficialWinningNumbers(LotteryType.UNION_LOTTO, '');
        
        if (result) {
            console.log('✅ 成功获取双色球开奖号码:');
            console.log(`   期号: ${result.issueNumber}`);
            console.log(`   前区: ${result.front_area.join(', ')}`);
            console.log(`   后区: ${result.back_area.join(', ')}`);
        } else {
            console.log('❌ 未能获取到开奖号码');
        }
    } catch (error) {
        console.error('❌ 查询失败:', error);
    }
    
    console.log('');
    console.log('🎯 测试通过lotteryService查询...');
    
    // 测试通过lotteryService查询
    try {
        const result = await getWinningNumbers(LotteryType.UNION_LOTTO, '2024057');
        
        if (result) {
            console.log('✅ 通过lotteryService成功获取:');
            console.log(`   期号: ${result.issueNumber}`);
            console.log(`   前区: ${result.front_area.join(', ')}`);
            console.log(`   后区: ${result.back_area.join(', ')}`);
        } else {
            console.log('❌ lotteryService未能获取到数据');
        }
    } catch (error) {
        console.error('❌ lotteryService查询失败:', error);
    }
    
    console.log('');
    console.log('⚠️ 注意事项:');
    console.log('1. 需要有效的聚合数据API密钥才能正常工作');
    console.log('2. 请在环境变量中设置 VITE_JUHE_API_KEY');
    console.log('3. 免费版本每日有调用次数限制');
    console.log('4. 如果API密钥无效，所有查询都会失败');
    
    console.log('');
    console.log('🏁 API测试完成');
}

// 如果是直接运行这个文件
if (typeof window === 'undefined') {
    testOfficialAPI().catch(console.error);
}

export { testOfficialAPI };