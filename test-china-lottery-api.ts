// 测试 chinaLotteryAPI.ts 的功能
import { fetchRecentLotteryHistory, fetchChinaLotteryData } from './services/chinaLotteryAPI.js';
import { LotteryType } from './types.js';

async function testChinaLotteryAPI() {
    console.log('🔍 开始测试 chinaLotteryAPI...');
    
    try {
        // 测试获取双色球最近5期开奖记录
        console.log('\n🔴 测试双色球最近5期开奖记录...');
        const unionLottoResults = await fetchRecentLotteryHistory(LotteryType.UNION_LOTTO, 5);
        console.log('双色球结果数量:', unionLottoResults.length);
        unionLottoResults.forEach((result, index) => {
            console.log(`  ${index + 1}. 第${result.issueNumber}期: ${result.front_area.join(' ')} | ${result.back_area.join(' ')}`);
        });
        
        // 测试获取大乐透最近5期开奖记录
        console.log('\n🔵 测试大乐透最近5期开奖记录...');
        const superLottoResults = await fetchRecentLotteryHistory(LotteryType.SUPER_LOTTO, 5);
        console.log('大乐透结果数量:', superLottoResults.length);
        superLottoResults.forEach((result, index) => {
            console.log(`  ${index + 1}. 第${result.issueNumber}期: ${result.front_area.join(' ')} | ${result.back_area.join(' ')}`);
        });
        
        // 测试获取最新的双色球开奖数据
        console.log('\n🆕 测试最新双色球开奖数据...');
        const latestUnionLotto = await fetchChinaLotteryData(LotteryType.UNION_LOTTO);
        if (latestUnionLotto) {
            console.log(`最新双色球: 第${latestUnionLotto.issueNumber}期 ${latestUnionLotto.front_area.join(' ')} | ${latestUnionLotto.back_area.join(' ')}`);
        } else {
            console.log('未获取到最新双色球数据');
        }
        
        // 测试获取最新的大乐透开奖数据
        console.log('\n🆕 测试最新大乐透开奖数据...');
        const latestSuperLotto = await fetchChinaLotteryData(LotteryType.SUPER_LOTTO);
        if (latestSuperLotto) {
            console.log(`最新大乐透: 第${latestSuperLotto.issueNumber}期 ${latestSuperLotto.front_area.join(' ')} | ${latestSuperLotto.back_area.join(' ')}`);
        } else {
            console.log('未获取到最新大乐透数据');
        }
        
        console.log('\n✅ 测试完成');
    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error);
    }
}

testChinaLotteryAPI();