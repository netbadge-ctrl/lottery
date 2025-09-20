
export enum LotteryType {
    UNION_LOTTO = "双色球",
    SUPER_LOTTO = "超级大乐透",
}

export interface TicketNumbers {
    front_area: string[];
    back_area: string[];
}

export interface ScannedTicketData {
    lotteryType: LotteryType;
    issueNumber: string;
    numbers: TicketNumbers[];
}

export interface WinningNumbers {
    lotteryType: LotteryType;
    issueNumber: string;
    front_area: string[];
    back_area: string[];
}

export interface PrizeInfo {
    prizeTier: string;
    prizeAmount: string;
    isWinner: boolean;
    matchedFront: string[];
    matchedBack: string[];
}

export interface AnalyzedResult {
    scannedData: ScannedTicketData;
    winningNumbers: WinningNumbers;
    prizeResults: PrizeInfo[];
}
