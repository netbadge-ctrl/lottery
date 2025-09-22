import { LotteryType } from '../types.js';
import { fetchOfficialWinningNumbers } from '../services/officialLotteryAPI.js';

console.log('🧪 测试新的API服务（包含模拟数据备选方案）...\n');

const testCases = [
    { type: LotteryType.UNION_LOTTO, issue: '2024057', name: '双色球' },
    { type: LotteryType.UNION_LOTTO, issue: '2024056', name: '双色球' },
    { type: LotteryType.SUPER_LOTTO, issue: '2024057', name: '大乐透' },
    { type: LotteryType.SUPER_LOTTO, issue: '2024999', name: '大乐透' }, // 不存在的期号
];

async function testNewAPI() {
    for (const testCase of testCases) {
        console.log(`📋 测试${testCase.name}第${testCase.issue}期:`);
        
        try {
            const result = await fetchOfficialWinningNumbers(testCase.type, testCase.issue);
            
            if (result) {
                console.log(`✅ 查询成功!`);
                console.log(`   期号: ${result.issueNumber}`);
                console.log(`   前区号码: ${result.front_area.join(', ')}`);
                console.log(`   后区号码: ${result.back_area.join(', ')}`);
            } else {
                console.log(`❌ 未找到数据`);
            }
        } catch (error) {
            console.log(`❌ 查询出错: ${error.message}`);
        }
        
        console.log(''); // 空行分隔
    }
}

testNewAPI().catch(console.error);