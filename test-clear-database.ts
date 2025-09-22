import { clearVerifiedDatabase, getStatistics } from './services/reliableLotteryService';

// 测试清空数据库功能
function testClearDatabase() {
    console.log('🧪 测试清空数据库功能');
    console.log('');
    
    // 显示清空前的统计
    console.log('📊 清空前的数据库统计:');
    const statsBefore = getStatistics();
    console.log(statsBefore);
    console.log('');
    
    // 执行清空操作
    console.log('🗑️ 执行清空操作...');
    clearVerifiedDatabase();
    console.log('');
    
    // 显示清空后的统计
    console.log('📊 清空后的数据库统计:');
    const statsAfter = getStatistics();
    console.log(statsAfter);
    console.log('');
    
    // 验证结果
    if (statsAfter.total === 0) {
        console.log('✅ 数据库清空成功！');
    } else {
        console.log('❌ 数据库清空失败！');
    }
}

// 如果是直接运行这个文件
if (typeof window === 'undefined') {
    testClearDatabase();
}

export { testClearDatabase };