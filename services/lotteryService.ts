import { LotteryType, type WinningNumbers, type PrizeInfo, type ScannedTicketData } from '../types';
import { getWinningNumbersFromDatabase, initializeDataService } from './dataFetchService';

// 缓存开奖号码数据（保留缓存机制提高性能）
const winningNumbersCache = new Map<string, WinningNumbers>();

// 初始化数据服务（在服务启动时调用）
initializeDataService();

// 手动更新开奖号码的函数（现在只是添加到缓存，因为数据源已统一）
export const updateWinningNumbers = (lotteryType: LotteryType, issueNumber: string, frontArea: string[], backArea: string[]): void => {
    const cacheKey = `${lotteryType}-${issueNumber}`;
    const winningNumbers: WinningNumbers = {
        lotteryType,
        issueNumber,
        front_area: frontArea,
        back_area: backArea
    };
    
    // 更新缓存
    winningNumbersCache.set(cacheKey, winningNumbers);
    
    console.log(`✅ 已手动设置${lotteryType}第${issueNumber}期开奖号码（缓存）`);
    console.log(`📊 开奖号码: 前区 ${frontArea.join(',')} | 后区 ${backArea.join(',')}`);
    console.log(`💡 注意：此数据仅在当前会话有效，建议通过官网数据抓取获取永久数据`);
};

export const getWinningNumbers = async (lotteryType: LotteryType, issueNumber: string): Promise<WinningNumbers | null> => {
    // 生成缓存键
    const cacheKey = `${lotteryType}-${issueNumber}`;
    
    // 第一层：检查内存缓存
    if (winningNumbersCache.has(cacheKey)) {
        console.log(`📋 从缓存获取${lotteryType}第${issueNumber}期开奖号码`);
        return winningNumbersCache.get(cacheKey)!;
    }
    
    // 第二层：从官网数据库查询（唯一数据源）
    const result = getWinningNumbersFromDatabase(lotteryType, issueNumber);
    
    if (result) {
        console.log(`🏛️ 从官网数据库获取${lotteryType}第${issueNumber}期开奖号码`);
        // 缓存到内存
        winningNumbersCache.set(cacheKey, result);
        return result;
    }
    
    // 未找到数据
    console.log(`⚠️ 未找到${lotteryType}第${issueNumber}期的开奖号码`);
    console.log(`💡 该期号可能：`);
    console.log(`   1. 尚未开奖`);
    console.log(`   2. 不在当前数据库范围内（仅包含最近100期）`);
    console.log(`   3. 期号输入错误`);
    
    return null;
};

// 验证开奖号码格式的函数
function validateWinningNumbers(winningNumbers: WinningNumbers): boolean {
    try {
        const { lotteryType, front_area, back_area } = winningNumbers;
        
        // 检查基本格式
        if (!Array.isArray(front_area) || !Array.isArray(back_area)) {
            return false;
        }
        
        // 验证双色球格式
        if (lotteryType === LotteryType.UNION_LOTTO) {
            if (front_area.length !== 6 || back_area.length !== 1) {
                return false;
            }
            
            // 验证前区号码范围 (01-33)
            const frontValid = front_area.every(num => {
                const n = parseInt(num);
                return n >= 1 && n <= 33;
            });
            
            // 验证后区号码范围 (01-16)
            const backValid = back_area.every(num => {
                const n = parseInt(num);
                return n >= 1 && n <= 16;
            });
            
            return frontValid && backValid;
        }
        
        // 验证超级大乐透格式
        if (lotteryType === LotteryType.SUPER_LOTTO) {
            if (front_area.length !== 5 || back_area.length !== 2) {
                return false;
            }
            
            // 验证前区号码范围 (01-35)
            const frontValid = front_area.every(num => {
                const n = parseInt(num);
                return n >= 1 && n <= 35;
            });
            
            // 验证后区号码范围 (01-12)
            const backValid = back_area.every(num => {
                const n = parseInt(num);
                return n >= 1 && n <= 12;
            });
            
            return frontValid && backValid;
        }
        
        return false;
    } catch (error) {
        console.error('验证开奖号码时出错:', error);
        return false;
    }
}

// ... existing code for prize checking functions ...

const checkUnionLottoPrize = (userFront: string[], userBack: string[], winFront: string[], winBack: string[]): PrizeInfo => {
    const frontMatches = userFront.filter(num => winFront.includes(num));
    const backMatches = userBack.filter(num => winBack.includes(num));

    const prize = { matchedFront: frontMatches, matchedBack: backMatches, isWinner: true };

    if (frontMatches.length === 6 && backMatches.length === 1) return { ...prize, prizeTier: "一等奖", prizeAmount: "浮动奖金" };
    if (frontMatches.length === 6 && backMatches.length === 0) return { ...prize, prizeTier: "二等奖", prizeAmount: "浮动奖金" };
    if (frontMatches.length === 5 && backMatches.length === 1) return { ...prize, prizeTier: "三等奖", prizeAmount: "¥3,000" };
    if (frontMatches.length === 5 && backMatches.length === 0) return { ...prize, prizeTier: "四等奖", prizeAmount: "¥200" };
    if (frontMatches.length === 4 && backMatches.length === 1) return { ...prize, prizeTier: "四等奖", prizeAmount: "¥200" };
    if (frontMatches.length === 4 && backMatches.length === 0) return { ...prize, prizeTier: "五等奖", prizeAmount: "¥10" };
    if (frontMatches.length === 3 && backMatches.length === 1) return { ...prize, prizeTier: "五等奖", prizeAmount: "¥10" };
    if (frontMatches.length < 3 && backMatches.length === 1) return { ...prize, prizeTier: "六等奖", prizeAmount: "¥5" };

    return { ...prize, isWinner: false, prizeTier: "未中奖", prizeAmount: "¥0" };
};

const checkSuperLottoPrize = (userFront: string[], userBack: string[], winFront: string[], winBack: string[]): PrizeInfo => {
    const frontMatches = userFront.filter(num => winFront.includes(num));
    const backMatches = userBack.filter(num => winBack.includes(num));

    const prize = { matchedFront: frontMatches, matchedBack: backMatches, isWinner: true };

    if (frontMatches.length === 5 && backMatches.length === 2) return { ...prize, prizeTier: "一等奖", prizeAmount: "浮动奖金" };
    if (frontMatches.length === 5 && backMatches.length === 1) return { ...prize, prizeTier: "二等奖", prizeAmount: "浮动奖金" };
    if (frontMatches.length === 5 && backMatches.length === 0) return { ...prize, prizeTier: "三等奖", prizeAmount: "¥10,000" };
    if (frontMatches.length === 4 && backMatches.length === 2) return { ...prize, prizeTier: "四等奖", prizeAmount: "¥3,000" };
    if (frontMatches.length === 4 && backMatches.length === 1) return { ...prize, prizeTier: "五等奖", prizeAmount: "¥300" };
    if (frontMatches.length === 3 && backMatches.length === 2) return { ...prize, prizeTier: "六等奖", prizeAmount: "¥200" };
    if (frontMatches.length === 4 && backMatches.length === 0) return { ...prize, prizeTier: "七等奖", prizeAmount: "¥100" };
    if (frontMatches.length === 3 && backMatches.length === 1) return { ...prize, prizeTier: "八等奖", prizeAmount: "¥15" };
    if (frontMatches.length === 2 && backMatches.length === 2) return { ...prize, prizeTier: "八等奖", prizeAmount: "¥15" };
    if (frontMatches.length === 3 && backMatches.length === 0) return { ...prize, prizeTier: "九等奖", prizeAmount: "¥5" };
    if (frontMatches.length === 1 && backMatches.length === 2) return { ...prize, prizeTier: "九等奖", prizeAmount: "¥5" };
    if (frontMatches.length === 2 && backMatches.length === 1) return { ...prize, prizeTier: "九等奖", prizeAmount: "¥5" };
    if (frontMatches.length === 0 && backMatches.length === 2) return { ...prize, prizeTier: "九等奖", prizeAmount: "¥5" };

    return { ...prize, isWinner: false, prizeTier: "未中奖", prizeAmount: "¥0" };
};

export const checkPrizes = (scannedData: ScannedTicketData, winningNumbers: WinningNumbers): PrizeInfo[] => {
    return scannedData.numbers.map(ticket => {
        if (scannedData.lotteryType === LotteryType.UNION_LOTTO) {
            return checkUnionLottoPrize(ticket.front_area, ticket.back_area, winningNumbers.front_area, winningNumbers.back_area);
        } else if (scannedData.lotteryType === LotteryType.SUPER_LOTTO) {
            return checkSuperLottoPrize(ticket.front_area, ticket.back_area, winningNumbers.front_area, winningNumbers.back_area);
        }
        // Fallback for unknown type
        return { isWinner: false, prizeTier: "未知的彩票类型", prizeAmount: "¥0", matchedFront: [], matchedBack: [] };
    });
};