import { LotteryType, type WinningNumbers } from '../types';
import { lotteryAPI } from './apiClient';

// 初始化API连接测试
const initializeAPIConnection = async (): Promise<void> => {
    try {
        const health = await lotteryAPI.testConnection();
        if (health.status === 'ok') {
            console.log('✅ API服务连接成功');
            console.log(`📊 数据库状态: ${health.database}`);
        } else {
            console.error('❌ API服务连接失败');
        }
    } catch (error) {
        console.error('❌ API连接测试失败:', error);
    }
};

// 通过API抓取指定数量的历史数据
export async function fetchHistoryData(count: number = 100): Promise<void> {
    console.log(`🕐 开始通过API抓取过去${count}期开奖数据...`);
    
    try {
        const result = await lotteryAPI.fetchHistoryData(count);
        
        if (result.success) {
            console.log('✅ 历史数据抓取完成!');
            console.log(`   双色球: ${result.data.unionLotto}期`);
            console.log(`   大乐透: ${result.data.superLotto}期`);
            console.log(`   总计: ${result.data.total}期`);
        } else {
            throw new Error('API返回失败状态');
        }
        
    } catch (error) {
        console.error('❌ 抓取历史数据失败:', error);
        throw error;
    }
}

// 通过API抓取最新开奖数据
export async function fetchLatestData(): Promise<void> {
    console.log('🔄 正在通过API抓取最新开奖数据...');
    
    try {
        const result = await lotteryAPI.fetchLatestData();
        
        if (result.success) {
            console.log('✅ 最新开奖数据已更新!');
            result.data.forEach((item: any) => {
                console.log(`   ${item.type === 'unionLotto' ? '双色球' : '大乐透'}: 第${item.issueNumber}期`);
            });
        } else {
            throw new Error('API返回失败状态');
        }
        
    } catch (error) {
        console.error('❌ 抓取最新数据失败:', error);
        throw error;
    }
}

// 通过API查询开奖号码
export async function getWinningNumbersFromDatabase(lotteryType: LotteryType, issueNumber: string): Promise<WinningNumbers | null> {
    try {
        const result = await lotteryAPI.getLotteryResult(lotteryType, issueNumber);
        
        if (result) {
            console.log(`📚 通过API获取${lotteryType}第${issueNumber}期开奖数据`);
            return result;
        }
        
        return null;
    } catch (error) {
        console.error('API查询开奖号码失败:', error);
        return null;
    }
}

// 通过API获取数据库统计信息
export async function getDatabaseStats(): Promise<{ [key: string]: any }> {
    try {
        return await lotteryAPI.getDatabaseStats();
    } catch (error) {
        console.error('获取数据库统计信息失败:', error);
        return {
            database: 'PostgreSQL (via API)',
            error: '无法连接到API服务'
        };
    }
}

// 通过API清空数据库
export async function clearDatabase(): Promise<void> {
    try {
        const result = await lotteryAPI.clearDatabase();
        if (result.success) {
            console.log('🗑️ 已清空PostgreSQL数据库中的所有开奖数据');
        } else {
            throw new Error('API返回失败状态');
        }
    } catch (error) {
        console.error('清空数据库失败:', error);
        throw error;
    }
}

// 全局定时器引用，防止重复创建
let dailyFetchTimer: NodeJS.Timeout | null = null;

// 设置定时任务（每天上午10点抓取数据）
export function setupDailyFetch(): void {
    // 如果已经有定时器在运行，先清除它
    if (dailyFetchTimer) {
        clearTimeout(dailyFetchTimer);
        dailyFetchTimer = null;
        console.log('🔄 清除已存在的定时任务');
    }
    
    console.log('⏰ 设置每日定时抓取任务...');
    
    // 计算下次上午10点的时间
    function getNext10AM(): Date {
        const now = new Date();
        const next10AM = new Date();
        next10AM.setHours(10, 0, 0, 0);
        
        // 如果已经过了今天的10点，设置为明天的10点
        if (now.getTime() > next10AM.getTime()) {
            next10AM.setDate(next10AM.getDate() + 1);
        }
        
        return next10AM;
    }
    
    // 计算到下次10点的毫秒数
    function getTimeUntilNext10AM(): number {
        const next10AM = getNext10AM();
        return next10AM.getTime() - Date.now();
    }
    
    // 定时执行函数
    function scheduleDailyFetch(): void {
        const timeUntil10AM = getTimeUntilNext10AM();
        
        console.log(`⏰ 下次数据抓取时间: ${getNext10AM().toLocaleString()}`);
        
        dailyFetchTimer = setTimeout(async () => {
            console.log('🕙 定时任务触发 - 开始抓取最新开奖数据');
            await fetchLatestData();
            
            // 递归设置下一次任务
            scheduleDailyFetch();
        }, timeUntil10AM);
    }
    
    // 启动定时任务
    scheduleDailyFetch();
}

// 清除定时任务
export function clearDailyFetch(): void {
    if (dailyFetchTimer) {
        clearTimeout(dailyFetchTimer);
        dailyFetchTimer = null;
        console.log('🚫 已清除定时抓取任务');
    }
}

// 防止重复初始化的标志
let isServiceInitialized = false;

// 初始化数据服务
export async function initializeDataService(): Promise<void> {
    // 防止重复初始化
    if (isServiceInitialized) {
        console.log('ℹ️ 开奖数据服务已经初始化，跳过重复初始化');
        return;
    }
    
    console.log('🚀 初始化API开奖数据服务...');
    
    // 初始化API连接
    await initializeAPIConnection();
    
    // 设置定时任务
    setupDailyFetch();
    
    isServiceInitialized = true;
    console.log('✅ API开奖数据服务已启动');
}

// 重置服务状态（用于测试或重新初始化）
export function resetDataService(): void {
    clearDailyFetch();
    isServiceInitialized = false;
    console.log('🔄 数据服务状态已重置');
}

// 获取最新开奖数据
export async function getLatestWinningNumbers(lotteryType: LotteryType): Promise<WinningNumbers | null> {
    try {
        const results = await lotteryAPI.getLatestResults();
        return lotteryType === LotteryType.UNION_LOTTO ? results.unionLotto : results.superLotto;
    } catch (error) {
        console.error('获取最新开奖数据失败:', error);
        return null;
    }
}

// 获取所有彩票的最新开奖数据
export async function getAllLatestWinningNumbers(): Promise<{ unionLotto: WinningNumbers | null, superLotto: WinningNumbers | null }> {
    try {
        return await lotteryAPI.getLatestResults();
    } catch (error) {
        console.error('获取所有最新开奖数据失败:', error);
        return { unionLotto: null, superLotto: null };
    }
}