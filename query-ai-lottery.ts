import { LotteryType } from './types';
import { getWinningNumbersByAI } from './services/aiLotteryService';
import { addVerifiedWinningNumbers } from './services/reliableLotteryService';

// 使用AI实时查询指定期号的开奖号码
async function queryLotteryResultByAI(lotteryType: LotteryType, issueNumber: string) {
    console.log(`🤖 开始使用AI查询${lotteryType}第${issueNumber}期开奖号码...`);
    console.log('');
    
    try {
        // 使用AI查询开奖号码
        const result = await getWinningNumbersByAI(lotteryType, issueNumber);
        
        if (result) {
            console.log(`✅ AI查询成功！`);
            console.log(`📊 ${lotteryType}第${issueNumber}期开奖号码:`);
            console.log(`   前区: ${result.front_area.join(', ')}`);
            console.log(`   后区: ${result.back_area.join(', ')}`);
            console.log('');
            
            // 询问用户是否保存到数据库
            console.log('🔍 请验证上述开奖号码是否正确');
            console.log('💡 如果数据正确，可以调用以下代码将其保存到数据库:');
            console.log(`addVerifiedWinningNumbers({`);
            console.log(`    lotteryType: LotteryType.${lotteryType === '双色球' ? 'UNION_LOTTO' : 'SUPER_LOTTO'},`);
            console.log(`    issueNumber: '${issueNumber}',`);
            console.log(`    front_area: [${result.front_area.map(n => `'${n}'`).join(', ')}],`);
            console.log(`    back_area: [${result.back_area.map(n => `'${n}'`).join(', ')}]`);
            console.log(`});`);
            
            return result;
        } else {
            console.log(`❌ AI查询失败，无法获取${lotteryType}第${issueNumber}期开奖号码`);
            console.log('');
            console.log('💡 可能的原因:');
            console.log('   1. API访问限制或网络问题');
            console.log('   2. 该期号尚未开奖');
            console.log('   3. AI无法识别或解析开奖信息');
            console.log('');
            console.log('🔧 建议: 请手动查询官方开奖结果后使用"修正开奖号码"功能添加');
            
            return null;
        }
    } catch (error) {
        console.error(`❌ 查询过程中发生错误:`, error);
        return null;
    }
}

// 查询双色球2024057期
async function querySSQ2024057() {
    console.log('🎯 专门查询双色球2024057期开奖号码');
    console.log('==========================================');
    console.log('');
    
    const result = await queryLotteryResultByAI(LotteryType.UNION_LOTTO, '2024057');
    
    if (result) {
        console.log('');
        console.log('🎉 查询完成！请验证上述号码的准确性。');
        console.log('📝 如果号码正确，请在应用中使用"修正开奖号码"功能保存。');
    } else {
        console.log('');
        console.log('😔 很抱歉，AI查询未能获取到有效结果。');
        console.log('🌐 建议您访问官方网站查询准确的开奖号码。');
    }
    
    return result;
}

// 如果是直接运行这个文件
if (typeof window === 'undefined') {
    querySSQ2024057().catch(console.error);
}

export { queryLotteryResultByAI, querySSQ2024057 };