// 历史数据API测试脚本
// 专门测试从中国彩票官网抓取历史数据的功能

import { fetchChinaLotteryData, fetchHistoryLotteryData, fetchRecentLotteryHistory } from './services/chinaLotteryAPI.js';
import { LotteryType } from './types.js';

console.log('📚 开始测试历史数据抓取功能...\n');

// 测试双色球历史数据抓取
async function testUnionLottoHistory() {
    console.log('🔴 测试双色球历史数据抓取...');
    
    try {
        const results = await fetchRecentLotteryHistory(LotteryType.UNION_LOTTO, 5);
        
        if (results && results.length > 0) {
            console.log(`✅ 成功获取双色球历史页面，找到 ${results.length} 期开奖记录`);
            console.log('📋 最近5期开奖记录:');
            for (let i = 0; i < Math.min(5, results.length); i++) {
                const record = results[i];
                console.log(`   第${record.issueNumber}期: ${record.front_area.join(' ')} | ${record.back_area.join(' ')}`);
            }
            return true;
        } else {
            console.log('⚠️ 未找到双色球开奖记录');
            return false;
        }
    } catch (error) {
        console.log(`❌ 双色球历史数据抓取失败: ${error.message}`);
        return false;
    }
}

// 测试大乐透历史数据抓取
async function testSuperLottoHistory() {
    console.log('\n🔵 测试大乐透历史数据抓取...');
    
    try {
        const results = await fetchRecentLotteryHistory(LotteryType.SUPER_LOTTO, 5);
        
        if (results && results.length > 0) {
            console.log(`✅ 成功获取大乐透历史页面，找到 ${results.length} 期开奖记录`);
            console.log('📋 最近5期开奖记录:');
            for (let i = 0; i < Math.min(5, results.length); i++) {
                const record = results[i];
                console.log(`   第${record.issueNumber}期: ${record.front_area.join(' ')} | ${record.back_area.join(' ')}`);
            }
            return true;
        } else {
            console.log('⚠️ 未找到大乐透开奖记录');
            return false;
        }
    } catch (error) {
        console.log(`❌ 大乐透历史数据抓取失败: ${error.message}`);
        return false;
    }
}

// 测试最新开奖数据
async function testLatestData() {
    console.log('\n🆕 测试最新开奖数据抓取...');
    
    try {
        // 测试双色球最新开奖数据
        const unionLottoData = await fetchChinaLotteryData(LotteryType.UNION_LOTTO);
        if (unionLottoData) {
            console.log(`✅ 双色球第${unionLottoData.issueNumber}期: ${unionLottoData.front_area.join(' ')} | ${unionLottoData.back_area.join(' ')}`);
        } else {
            console.log('⚠️ 未找到双色球最新开奖数据');
        }
        
        // 测试大乐透最新开奖数据
        const superLottoData = await fetchChinaLotteryData(LotteryType.SUPER_LOTTO);
        if (superLottoData) {
            console.log(`✅ 大乐透第${superLottoData.issueNumber}期: ${superLottoData.front_area.join(' ')} | ${superLottoData.back_area.join(' ')}`);
        } else {
            console.log('⚠️ 未找到大乐透最新开奖数据');
        }
        
        return (unionLottoData !== null) || (superLottoData !== null);
    } catch (error) {
        console.log(`❌ 最新开奖数据抓取失败: ${error.message}`);
        return false;
    }
}

// 运行所有测试
async function runHistoryTests() {
    console.log('🎯 开始历史数据抓取测试\n');
    console.log('='.repeat(60));
    
    const results = [];
    
    results.push(await testUnionLottoHistory());
    results.push(await testSuperLottoHistory());
    results.push(await testLatestData());
    
    console.log('\n' + '='.repeat(60));
    console.log('📋 测试结果汇总:');
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log(`✅ 通过: ${passed}/${total}`);
    console.log(`❌ 失败: ${total - passed}/${total}`);
    
    if (passed === total) {
        console.log('\n🎉 所有历史数据测试通过！');
        console.log('📈 系统数据抓取功能正常，可以开始抓取过去100期数据。');
    } else {
        console.log('\n⚠️ 部分测试失败，请检查网络连接或页面结构是否发生变化。');
    }
    
    return passed === total;
}

// 开始测试
runHistoryTests().catch(console.error);