import { LotteryType, type WinningNumbers } from '../types';
import { fetchRecentLotteryHistory, fetchChinaLotteryData } from './chinaLotteryAPI';

// 数据库结构：本地存储的开奖数据
interface LotteryDatabase {
    lastUpdate: string;
    data: {
        [LotteryType.UNION_LOTTO]: WinningNumbers[];
        [LotteryType.SUPER_LOTTO]: WinningNumbers[];
    };
}

// 本地数据库
let lotteryDatabase: LotteryDatabase = {
    lastUpdate: '',
    data: {
        [LotteryType.UNION_LOTTO]: [],
        [LotteryType.SUPER_LOTTO]: []
    }
};

// 从localStorage加载数据
function loadFromLocalStorage(): void {
    try {
        const stored = localStorage.getItem('lottery_official_database');
        if (stored) {
            const parsed = JSON.parse(stored);
            lotteryDatabase = {
                ...lotteryDatabase,
                ...parsed
            };
            console.log(`📚 从本地存储加载开奖数据库，上次更新: ${lotteryDatabase.lastUpdate}`);
            console.log(`   双色球: ${lotteryDatabase.data[LotteryType.UNION_LOTTO].length}期`);
            console.log(`   大乐透: ${lotteryDatabase.data[LotteryType.SUPER_LOTTO].length}期`);
        }
    } catch (error) {
        console.error('加载本地数据失败:', error);
    }
}

// 保存到localStorage
function saveToLocalStorage(): void {
    try {
        localStorage.setItem('lottery_official_database', JSON.stringify(lotteryDatabase));
        console.log('💾 开奖数据已保存到本地存储');
    } catch (error) {
        console.error('保存本地数据失败:', error);
    }
}

// 从官网抓取指定数量的历史数据
export async function fetchHistoryData(count: number = 100): Promise<void> {
    console.log(`🕐 开始从官网抓取过去${count}期开奖数据...`);
    
    try {
        // 抓取双色球历史数据
        console.log('🔴 正在抓取双色球历史数据...');
        const unionLottoHistory = await fetchRecentLotteryHistory(LotteryType.UNION_LOTTO, count);
        
        // 抓取大乐透历史数据
        console.log('🔵 正在抓取大乐透历史数据...');
        const superLottoHistory = await fetchRecentLotteryHistory(LotteryType.SUPER_LOTTO, count);
        
        // 更新本地数据库
        lotteryDatabase.data[LotteryType.UNION_LOTTO] = unionLottoHistory;
        lotteryDatabase.data[LotteryType.SUPER_LOTTO] = superLottoHistory;
        lotteryDatabase.lastUpdate = new Date().toISOString();
        
        // 保存到本地存储
        saveToLocalStorage();
        
        console.log('✅ 历史数据抓取完成!');
        console.log(`   双色球: ${unionLottoHistory.length}期`);
        console.log(`   大乐透: ${superLottoHistory.length}期`);
        console.log(`   更新时间: ${lotteryDatabase.lastUpdate}`);
        
    } catch (error) {
        console.error('❌ 抓取历史数据失败:', error);
    }
}

// 抓取最新开奖数据并更新数据库
export async function fetchLatestData(): Promise<void> {
    console.log('🔄 正在从官网抓取最新开奖数据...');
    
    try {
        // 获取最新数据
        const latestUnionLotto = await fetchChinaLotteryData(LotteryType.UNION_LOTTO);
        const latestSuperLotto = await fetchChinaLotteryData(LotteryType.SUPER_LOTTO);
        
        let hasUpdates = false;
        
        // 更新双色球数据
        if (latestUnionLotto) {
            const existingIndex = lotteryDatabase.data[LotteryType.UNION_LOTTO]
                .findIndex(item => item.issueNumber === latestUnionLotto.issueNumber);
            
            if (existingIndex === -1) {
                // 新数据，添加到数组开头
                lotteryDatabase.data[LotteryType.UNION_LOTTO].unshift(latestUnionLotto);
                console.log(`✅ 新增双色球第${latestUnionLotto.issueNumber}期数据`);
                hasUpdates = true;
            } else {
                // 更新现有数据
                lotteryDatabase.data[LotteryType.UNION_LOTTO][existingIndex] = latestUnionLotto;
                console.log(`🔄 更新双色球第${latestUnionLotto.issueNumber}期数据`);
                hasUpdates = true;
            }
        }
        
        // 更新大乐透数据
        if (latestSuperLotto) {
            const existingIndex = lotteryDatabase.data[LotteryType.SUPER_LOTTO]
                .findIndex(item => item.issueNumber === latestSuperLotto.issueNumber);
            
            if (existingIndex === -1) {
                // 新数据，添加到数组开头
                lotteryDatabase.data[LotteryType.SUPER_LOTTO].unshift(latestSuperLotto);
                console.log(`✅ 新增大乐透第${latestSuperLotto.issueNumber}期数据`);
                hasUpdates = true;
            } else {
                // 更新现有数据
                lotteryDatabase.data[LotteryType.SUPER_LOTTO][existingIndex] = latestSuperLotto;
                console.log(`🔄 更新大乐透第${latestSuperLotto.issueNumber}期数据`);
                hasUpdates = true;
            }
        }
        
        if (hasUpdates) {
            lotteryDatabase.lastUpdate = new Date().toISOString();
            saveToLocalStorage();
            console.log('💾 数据库已更新并保存');
        } else {
            console.log('ℹ️ 没有新的开奖数据');
        }
        
    } catch (error) {
        console.error('❌ 抓取最新数据失败:', error);
    }
}

// 从本地数据库查询开奖号码
export function getWinningNumbersFromDatabase(lotteryType: LotteryType, issueNumber: string): WinningNumbers | null {
    const data = lotteryDatabase.data[lotteryType];
    const result = data.find(item => item.issueNumber === issueNumber);
    
    if (result) {
        console.log(`📚 从本地数据库获取${lotteryType}第${issueNumber}期开奖数据`);
        return result;
    }
    
    return null;
}

// 获取数据库统计信息
export function getDatabaseStats(): { [key: string]: any } {
    return {
        lastUpdate: lotteryDatabase.lastUpdate,
        unionLottoCount: lotteryDatabase.data[LotteryType.UNION_LOTTO].length,
        superLottoCount: lotteryDatabase.data[LotteryType.SUPER_LOTTO].length,
        totalRecords: lotteryDatabase.data[LotteryType.UNION_LOTTO].length + 
                     lotteryDatabase.data[LotteryType.SUPER_LOTTO].length,
        latestUnionLotto: lotteryDatabase.data[LotteryType.UNION_LOTTO][0]?.issueNumber || '无',
        latestSuperLotto: lotteryDatabase.data[LotteryType.SUPER_LOTTO][0]?.issueNumber || '无'
    };
}

// 清空数据库
export function clearDatabase(): void {
    lotteryDatabase = {
        lastUpdate: '',
        data: {
            [LotteryType.UNION_LOTTO]: [],
            [LotteryType.SUPER_LOTTO]: []
        }
    };
    
    try {
        localStorage.removeItem('lottery_official_database');
        console.log('🗑️ 已清空开奖数据库');
    } catch (error) {
        console.error('清空数据库失败:', error);
    }
}

// 设置定时任务（每天上午10点抓取数据）
export function setupDailyFetch(): void {
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
        
        setTimeout(async () => {
            console.log('🕙 定时任务触发 - 开始抓取最新开奖数据');
            await fetchLatestData();
            
            // 递归设置下一次任务
            scheduleDailyFetch();
        }, timeUntil10AM);
    }
    
    // 启动定时任务
    scheduleDailyFetch();
}

// 初始化数据服务
export function initializeDataService(): void {
    console.log('🚀 初始化开奖数据服务...');
    
    // 加载本地数据
    loadFromLocalStorage();
    
    // 设置定时任务
    setupDailyFetch();
    
    console.log('✅ 开奖数据服务已启动');
}

// 获取最新开奖数据
export function getLatestWinningNumbers(lotteryType: LotteryType): WinningNumbers | null {
    const data = lotteryDatabase.data[lotteryType];
    return data.length > 0 ? data[0] : null;
}

// 获取所有彩票的最新开奖数据
export function getAllLatestWinningNumbers(): { unionLotto: WinningNumbers | null, superLotto: WinningNumbers | null } {
    return {
        unionLotto: getLatestWinningNumbers(LotteryType.UNION_LOTTO),
        superLotto: getLatestWinningNumbers(LotteryType.SUPER_LOTTO)
    };
}

// 导出数据库访问函数
export { lotteryDatabase };