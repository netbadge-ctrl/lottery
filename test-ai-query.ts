import { LotteryType } from './types';
import { getWinningNumbers } from './services/lotteryService';

// 测试AI自动查询功能
async function testAIQuery() {
    console.log('🧪 测试AI自动查询功能');
    console.log('==========================================');
    console.log('');
    
    // 测试一个不在本地数据库中的期号
    const testIssue = '2024056'; // 假设这个期号不在本地数据库中
    
    console.log(`📋 尝试查询双色球第${testIssue}期开奖号码（本地数据库中没有）`);
    console.log('⏳ 这将触发AI自动查询功能...');
    console.log('');
    
    try {
        const result = await getWinningNumbers(LotteryType.UNION_LOTTO, testIssue);
        
        if (result) {
            console.log('🎉 AI查询成功！');
            console.log(`📊 双色球第${result.issueNumber}期开奖号码:`);
            console.log(`   前区(红球): ${result.front_area.join(', ')}`);
            console.log(`   后区(蓝球): ${result.back_area.join(', ')}`);
            console.log('');
            console.log('💡 提示：这些号码来自AI查询，请验证准确性后使用"修正开奖号码"功能保存');
            
        } else {
            console.log('❌ AI查询失败');
            console.log('💡 可能的原因：');
            console.log('   1. 该期号尚未开奖或不存在');
            console.log('   2. AI无法找到相关开奖信息');
            console.log('   3. 网络连接问题');
            console.log('');
            console.log('🔧 建议：请手动查询官方开奖结果并使用"修正开奖号码"功能添加');
        }
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error);
    }
    
    console.log('');
    console.log('🏁 AI查询测试完成');
}

// 如果是直接运行这个文件
if (typeof window === 'undefined') {
    testAIQuery().catch(console.error);
}

export { testAIQuery };