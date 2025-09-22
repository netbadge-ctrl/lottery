import { LotteryType, type WinningNumbers } from '../types';

// 经过验证的开奖号码数据库
// 这些数据都是经过人工验证的准确开奖结果
export const verifiedWinningNumbers: WinningNumbers[] = [
    {
        lotteryType: LotteryType.UNION_LOTTO,
        issueNumber: "2024014",
        front_area: ["01", "02", "10", "22", "24", "25"],
        back_area: ["13"],
    },
    // 可以继续添加更多经过验证的开奖数据
];

// 获取经过验证的开奖号码
export const getVerifiedWinningNumbers = (lotteryType: LotteryType, issueNumber: string): WinningNumbers | null => {
    // 处理期号格式
    const normalizedIssue = issueNumber.startsWith('2024') && issueNumber.length > 5 ? issueNumber.substring(2) : issueNumber;
    const fullIssue = issueNumber.length < 7 ? `20${issueNumber}` : issueNumber;
    
    const result = verifiedWinningNumbers.find(record => 
        record.lotteryType === lotteryType && 
        (record.issueNumber === issueNumber || 
         record.issueNumber === normalizedIssue || 
         record.issueNumber === fullIssue)
    );
    
    if (result) {
        console.log(`✅ 找到经过验证的${lotteryType}第${issueNumber}期开奖号码`);
    }
    
    return result || null;
};

// 添加新的验证数据
export const addVerifiedWinningNumbers = (winningNumbers: WinningNumbers): void => {
    // 检查是否已存在
    const existingIndex = verifiedWinningNumbers.findIndex(
        record => record.lotteryType === winningNumbers.lotteryType && 
                 record.issueNumber === winningNumbers.issueNumber
    );
    
    if (existingIndex >= 0) {
        // 更新现有数据
        verifiedWinningNumbers[existingIndex] = winningNumbers;
        console.log(`🔄 更新验证数据: ${winningNumbers.lotteryType}第${winningNumbers.issueNumber}期`);
    } else {
        // 添加新数据
        verifiedWinningNumbers.push(winningNumbers);
        console.log(`➕ 添加验证数据: ${winningNumbers.lotteryType}第${winningNumbers.issueNumber}期`);
    }
};