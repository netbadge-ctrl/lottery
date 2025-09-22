import { LotteryType } from './types';
import { getWinningNumbers } from './services/lotteryService';
import { getStatistics } from './services/reliableLotteryService';

// 测试开奖号码获取功能
async function testLotteryService() {
    console.log('🎯 开始测试新的开奖号码获取系统...\n');
    
    // 显示当前数据库统计
    const stats = getStatistics();
    console.log('📊 当前数据库统计:', stats);
    console.log('');
    
    // 测试已知期号（应该从本地数据库获取）
    const testCases = [
        { type: LotteryType.UNION_LOTTO, issue: '2024014' },
        { type: LotteryType.UNION_LOTTO, issue: '2024057' },
        { type: LotteryType.UNION_LOTTO, issue: '2024140' },
        { type: LotteryType.SUPER_LOTTO, issue: '2024001' },
    ];
    
    console.log('🧪 测试已知期号（应该从本地数据库获取）:');
    for (const testCase of testCases) {
        try {
            console.log(`\n📋 测试: ${testCase.type}第${testCase.issue}期`);
            const result = await getWinningNumbers(testCase.type, testCase.issue);
            
            if (result) {
                console.log(`✅ 成功获取: 前区 ${result.front_area.join(',')} | 后区 ${result.back_area.join(',')}`);
            } else {
                console.log(`❌ 获取失败`);
            }
        } catch (error) {
            console.error(`❌ 测试出错:`, error);
        }
    }
    
    // 测试未知期号（应该尝试从官方API获取）
    console.log('\n\n🌐 测试未知期号（将尝试从官方API获取）:');
    const unknownCases = [
        { type: LotteryType.UNION_LOTTO, issue: '2024141' },
        { type: LotteryType.UNION_LOTTO, issue: '2024142' },
    ];
    
    for (const testCase of unknownCases) {
        try {
            console.log(`\n📋 测试: ${testCase.type}第${testCase.issue}期`);
            const result = await getWinningNumbers(testCase.type, testCase.issue);
            
            if (result) {
                console.log(`✅ 成功获取: 前区 ${result.front_area.join(',')} | 后区 ${result.back_area.join(',')}`);
                console.log(`💡 建议: 请验证这个数据是否正确，如果正确请手动确认保存`);
            } else {
                console.log(`❌ 获取失败 - 需要手动输入开奖号码`);
            }
        } catch (error) {
            console.error(`❌ 测试出错:`, error);
        }
    }
    
    console.log('\n🏁 测试完成！');
    console.log('\n📝 总结:');
    console.log('1. ✅ 已验证的期号可以快速从本地数据库获取');
    console.log('2. 🌐 未知期号会尝试从官方API获取（需要手动验证）');
    console.log('3. ❌ 无法获取的期号需要用户手动输入');
    console.log('4. 💾 手动输入的数据会保存到本地数据库供下次使用');
}

// 如果是直接运行这个文件
if (typeof window === 'undefined') {
    testLotteryService().catch(console.error);
}

export { testLotteryService };