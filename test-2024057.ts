import { LotteryType } from './types';
import { getWinningNumbers } from './services/lotteryService';

// 测试2024057期双色球开奖号码查询
async function test2024057() {
    console.log('🧪 测试双色球2024057期开奖号码查询');
    console.log('==========================================');
    console.log('');
    
    try {
        const result = await getWinningNumbers(LotteryType.UNION_LOTTO, '2024057');
        
        if (result) {
            console.log('✅ 成功获取开奖号码!');
            console.log(`📊 双色球第${result.issueNumber}期开奖号码:`);
            console.log(`   前区(红球): ${result.front_area.join(', ')}`);
            console.log(`   后区(蓝球): ${result.back_area.join(', ')}`);
            console.log('');
            
            // 验证号码格式
            const expectedFormat = {
                frontCount: 6,
                backCount: 1,
                frontRange: [1, 33],
                backRange: [1, 16]
            };
            
            let isValid = true;
            
            // 检查前区号码数量
            if (result.front_area.length !== expectedFormat.frontCount) {
                console.log(`❌ 前区号码数量错误: 期望${expectedFormat.frontCount}个，实际${result.front_area.length}个`);
                isValid = false;
            }
            
            // 检查后区号码数量
            if (result.back_area.length !== expectedFormat.backCount) {
                console.log(`❌ 后区号码数量错误: 期望${expectedFormat.backCount}个，实际${result.back_area.length}个`);
                isValid = false;
            }
            
            // 检查前区号码范围
            result.front_area.forEach((num, index) => {
                const n = parseInt(num);
                if (n < expectedFormat.frontRange[0] || n > expectedFormat.frontRange[1]) {
                    console.log(`❌ 前区第${index + 1}个号码 ${num} 超出范围 ${expectedFormat.frontRange[0]}-${expectedFormat.frontRange[1]}`);
                    isValid = false;
                }
            });
            
            // 检查后区号码范围
            result.back_area.forEach((num, index) => {
                const n = parseInt(num);
                if (n < expectedFormat.backRange[0] || n > expectedFormat.backRange[1]) {
                    console.log(`❌ 后区第${index + 1}个号码 ${num} 超出范围 ${expectedFormat.backRange[0]}-${expectedFormat.backRange[1]}`);
                    isValid = false;
                }
            });
            
            if (isValid) {
                console.log('✅ 开奖号码格式验证通过');
                console.log('🎉 双色球2024057期数据查询测试成功！');
            } else {
                console.log('❌ 开奖号码格式验证失败');
            }
            
        } else {
            console.log('❌ 未能获取到开奖号码');
            console.log('可能原因：');
            console.log('  1. 数据库中没有该期号的数据');
            console.log('  2. 网络连接问题');
            console.log('  3. API查询失败');
        }
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error);
    }
    
    console.log('');
    console.log('🏁 测试完成');
}

// 如果是直接运行这个文件
if (typeof window === 'undefined') {
    test2024057().catch(console.error);
}

export { test2024057 };