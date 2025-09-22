// 简单的数据抓取测试脚本
// 测试实际的数据抓取和存储功能

// 定义彩票类型枚举
const LotteryType = {
    UNION_LOTTO: 'UNION_LOTTO',
    SUPER_LOTTO: 'SUPER_LOTTO'
};

// 模拟浏览器环境
global.localStorage = {
    _data: {},
    setItem(key, value) {
        this._data[key] = value;
        console.log(`💾 存储数据: ${key}`);
    },
    getItem(key) {
        const value = this._data[key] || null;
        if (value) {
            console.log(`📖 读取数据: ${key}`);
        }
        return value;
    },
    removeItem(key) {
        delete this._data[key];
        console.log(`🗑️ 删除数据: ${key}`);
    },
    clear() {
        this._data = {};
        console.log('🧹 清空所有数据');
    }
};

// 动态导入服务模块
async function testDataFetchService() {
    try {
        console.log('🚀 开始测试数据抓取服务...\n');
        
        // 导入数据抓取服务
        const { fetchHistoryData, fetchLatestData, getDatabaseStats, initializeDataService } = 
            await import('./services/dataFetchService.js');
        
        console.log('1️⃣ 初始化数据服务...');
        initializeDataService();
        
        console.log('\n2️⃣ 检查当前数据库状态...');
        const initialStats = getDatabaseStats();
        console.log('📊 初始数据库状态:', initialStats);
        
        console.log('\n3️⃣ 尝试抓取最新开奖数据...');
        await fetchLatestData();
        
        console.log('\n4️⃣ 检查抓取后的数据库状态...');
        const afterLatestStats = getDatabaseStats();
        console.log('📊 抓取最新数据后:', afterLatestStats);
        
        console.log('\n5️⃣ 尝试抓取过去10期历史数据...');
        await fetchHistoryData(10);
        
        console.log('\n6️⃣ 检查最终数据库状态...');
        const finalStats = getDatabaseStats();
        console.log('📊 最终数据库状态:', finalStats);
        
        console.log('\n✅ 数据抓取服务测试完成！');
        
        // 测试数据查询
        console.log('\n7️⃣ 测试数据查询功能...');
        const { getWinningNumbers } = await import('./services/lotteryService.js');
        
        if (finalStats.latestUnionLotto !== '无') {
            console.log(`🔍 查询双色球第${finalStats.latestUnionLotto}期...`);
            const unionLottoResult = await getWinningNumbers(LotteryType.UNION_LOTTO, finalStats.latestUnionLotto);
            if (unionLottoResult) {
                console.log('✅ 双色球查询成功:', unionLottoResult);
            } else {
                console.log('❌ 双色球查询失败');
            }
        }
        
        if (finalStats.latestSuperLotto !== '无') {
            console.log(`🔍 查询大乐透第${finalStats.latestSuperLotto}期...`);
            const superLottoResult = await getWinningNumbers(LotteryType.SUPER_LOTTO, finalStats.latestSuperLotto);
            if (superLottoResult) {
                console.log('✅ 大乐透查询成功:', superLottoResult);
            } else {
                console.log('❌ 大乐透查询失败');
            }
        }
        
        console.log('\n🎉 完整系统测试完成！');
        
    } catch (error) {
        console.error('❌ 测试过程中发生错误:', error);
    }
}

// 运行测试
testDataFetchService();