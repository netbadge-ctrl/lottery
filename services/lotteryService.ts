import { LotteryType, type WinningNumbers, type PrizeInfo, type ScannedTicketData } from '../types';

// Mock database of winning numbers
const winningNumbersDB: WinningNumbers[] = [
    {
        lotteryType: LotteryType.UNION_LOTTO,
        issueNumber: "2024088",
        front_area: ["03", "09", "10", "20", "29", "30"],
        back_area: ["11"],
    },
    {
        lotteryType: LotteryType.UNION_LOTTO,
        issueNumber: "2024087",
        front_area: ["01", "07", "15", "18", "22", "25"],
        back_area: ["05"],
    },
    {
        lotteryType: LotteryType.SUPER_LOTTO,
        issueNumber: "24088",
        front_area: ["04", "11", "18", "21", "33"],
        back_area: ["06", "09"],
    },
    {
        lotteryType: LotteryType.SUPER_LOTTO,
        issueNumber: "24087",
        front_area: ["02", "09", "16", "23", "30"],
        back_area: ["01", "07"],
    }
];

export const getWinningNumbers = (lotteryType: LotteryType, issueNumber: string): WinningNumbers | null => {
    // Super Lotto issue numbers are often shorter on tickets (e.g., 24088 vs 2024088)
    const normalizedIssue = issueNumber.startsWith('2024') && issueNumber.length > 5 ? issueNumber.substring(2) : issueNumber;
    const fullIssue = issueNumber.length < 7 ? `20${issueNumber}` : issueNumber;

    const result = winningNumbersDB.find(record => 
        record.lotteryType === lotteryType && 
        (record.issueNumber === issueNumber || record.issueNumber === normalizedIssue || record.issueNumber === fullIssue)
    );
    return result || null;
};

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