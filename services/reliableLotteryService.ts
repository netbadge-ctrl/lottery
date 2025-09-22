import { LotteryType, type WinningNumbers } from '../types';

// 可靠的开奖号码数据库 - 基于用户验证的真实数据
const verifiedWinningNumbers: WinningNumbers[] = [
    // 双色球历史开奖数据
    {
        lotteryType: LotteryType.UNION_LOTTO,
        issueNumber: '2024057',
        front_area: ['03', '07', '12', '18', '22', '29'],
        back_area: ['16']
    }
];

// 缓存
const cache = new Map<string, WinningNumbers>();

// 清空数据库的函数
export const clearVerifiedDatabase = (): void => {
    // 清空验证数据库
    verifiedWinningNumbers.length = 0;
    
    // 清空缓存
    cache.clear();
    
    console.log('🗑️ 本地验证数据库已清空');
    console.log('📊 当前数据库统计:', getStatistics());
};

// 获取开奖号码 - 优先使用验证数据库
export const getReliableWinningNumbers = async (lotteryType: LotteryType, issueNumber: string): Promise<WinningNumbers | null> => {
    const cacheKey = `${lotteryType}-${issueNumber}`;
    
    // 检查缓存
    if (cache.has(cacheKey)) {
        console.log(`✅ 从缓存获取${issueNumber}期开奖号码`);
        return cache.get(cacheKey)!;
    }
    
    // 规范化期号格式，支持多种输入格式
    const normalizedIssues = getNormalizedIssueNumbers(issueNumber);
    
    // 检查验证数据库（尝试多种期号格式）
    for (const normalizedIssue of normalizedIssues) {
        const verified = verifiedWinningNumbers.find(
            item => item.lotteryType === lotteryType && item.issueNumber === normalizedIssue
        );
        
        if (verified) {
            console.log(`✅ 从验证数据库获取${normalizedIssue}期开奖号码:`, verified);
            
            // 创建标准化结果
            const result = {
                ...verified,
                issueNumber // 使用原始输入的期号
            };
            
            cache.set(cacheKey, result);
            return result;
        }
    }
    
    console.log(`❌ 未找到${issueNumber}期的验证开奖数据`);
    return null;
};

// 规范化期号格式的辅助函数
function getNormalizedIssueNumbers(issueNumber: string): string[] {
    const normalized = [];
    
    // 原始输入
    normalized.push(issueNumber);
    
    // 如果是2024xxx格式，尝试去掉前缀
    if (issueNumber.startsWith('2024') && issueNumber.length === 7) {
        normalized.push(issueNumber.substring(4));
    }
    
    // 如果是xxx格式，尝试加上前缀
    if (issueNumber.length === 3) {
        normalized.push(`2024${issueNumber}`);
    }
    
    // 如果是短格式，尝试补零
    if (issueNumber.length < 3) {
        const padded = issueNumber.padStart(3, '0');
        normalized.push(padded);
        normalized.push(`2024${padded}`);
    }
    
    return [...new Set(normalized)]; // 去重
}

// 添加验证过的开奖号码
export const addVerifiedWinningNumbers = (winningNumbers: WinningNumbers): void => {
    const cacheKey = `${winningNumbers.lotteryType}-${winningNumbers.issueNumber}`;
    
    // 验证号码格式
    if (!validateWinningNumbersFormat(winningNumbers)) {
        console.error('❌ 开奖号码格式不正确，无法添加到验证数据库');
        return;
    }
    
    // 检查是否已存在
    const existingIndex = verifiedWinningNumbers.findIndex(
        item => item.lotteryType === winningNumbers.lotteryType && 
                item.issueNumber === winningNumbers.issueNumber
    );
    
    if (existingIndex >= 0) {
        // 更新现有数据
        verifiedWinningNumbers[existingIndex] = winningNumbers;
        console.log(`🔄 更新${winningNumbers.issueNumber}期开奖数据`);
    } else {
        // 添加新数据
        verifiedWinningNumbers.push(winningNumbers);
        console.log(`➕ 添加${winningNumbers.issueNumber}期开奖数据`);
    }
    
    // 更新缓存
    cache.set(cacheKey, winningNumbers);
    
    // 在实际应用中，这里应该保存到持久化存储
    console.log('💾 开奖数据已保存到本地数据库');
    console.log(`📊 数据库现有${getStatistics().total}期已验证数据`);
};

// 验证开奖号码格式
function validateWinningNumbersFormat(winningNumbers: WinningNumbers): boolean {
    try {
        const { lotteryType, front_area, back_area } = winningNumbers;
        
        if (!Array.isArray(front_area) || !Array.isArray(back_area)) {
            return false;
        }
        
        if (lotteryType === LotteryType.UNION_LOTTO) {
            // 双色球验证
            if (front_area.length !== 6 || back_area.length !== 1) {
                return false;
            }
            
            const frontValid = front_area.every(num => {
                const n = parseInt(num);
                return !isNaN(n) && n >= 1 && n <= 33;
            });
            
            const backValid = back_area.every(num => {
                const n = parseInt(num);
                return !isNaN(n) && n >= 1 && n <= 16;
            });
            
            return frontValid && backValid;
        }
        
        if (lotteryType === LotteryType.SUPER_LOTTO) {
            // 大乐透验证
            if (front_area.length !== 5 || back_area.length !== 2) {
                return false;
            }
            
            const frontValid = front_area.every(num => {
                const n = parseInt(num);
                return !isNaN(n) && n >= 1 && n <= 35;
            });
            
            const backValid = back_area.every(num => {
                const n = parseInt(num);
                return !isNaN(n) && n >= 1 && n <= 12;
            });
            
            return frontValid && backValid;
        }
        
        return false;
    } catch (error) {
        console.error('验证开奖号码格式时出错:', error);
        return false;
    }
}

// 获取所有已验证的期号列表
export const getVerifiedIssues = (lotteryType: LotteryType): string[] => {
    return verifiedWinningNumbers
        .filter(item => item.lotteryType === lotteryType)
        .map(item => item.issueNumber)
        .sort();
};

// 统计信息
export const getStatistics = () => {
    const shuangseqiu = verifiedWinningNumbers.filter(item => item.lotteryType === LotteryType.UNION_LOTTO).length;
    const daletou = verifiedWinningNumbers.filter(item => item.lotteryType === LotteryType.SUPER_LOTTO).length;
    
    return {
        total: verifiedWinningNumbers.length,
        shuangseqiu,
        daletou,
        coverage: `双色球${shuangseqiu}期，大乐透${daletou}期`
    };
};