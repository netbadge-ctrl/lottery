import React from 'react';
import type { AnalyzedResult, PrizeInfo, ScannedTicketData, TicketNumbers, WinningNumbers } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface ResultDisplayProps {
  previewUrl: string | null;
  scannedData: ScannedTicketData;
  winningNumbers?: WinningNumbers;
  prizeResults?: PrizeInfo[];
  isCheckingPrizes: boolean;
  error: string | null;
  onReset: () => void;
}

const NumberChip: React.FC<{ num: string; isMatched?: boolean; isBackArea?: boolean }> = ({ num, isMatched = false, isBackArea = false }) => {
    const baseClasses = "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300";
    const colorClasses = isBackArea
        ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
        : "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300";
    const matchedClasses = isMatched
        ? "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-green-500 scale-110"
        : "opacity-60";
    const unCheckedClasses = isMatched === undefined ? "" : matchedClasses;


    return <div className={`${baseClasses} ${colorClasses} ${unCheckedClasses}`}>{num}</div>;
};

const TicketPrizeDisplay: React.FC<{
    prizeInfo?: PrizeInfo;
    isCheckingPrizes: boolean;
}> = ({ prizeInfo, isCheckingPrizes }) => {
    if (isCheckingPrizes) {
        return (
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 animate-pulse">
                    <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-indigo-500 rounded-full animate-spin"></div>
                    <span className="font-semibold">正在核对中奖...</span>
                </div>
            </div>
        );
    }

    if (!prizeInfo) return null;

    return (
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
            {prizeInfo.isWinner ? (
                <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="font-bold">{prizeInfo.prizeTier}</span>
                </div>
            ) : (
                <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400">
                    <XCircleIcon className="w-5 h-5" />
                    <span className="font-semibold">{prizeInfo.prizeTier}</span>
                </div>
            )}
            <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{prizeInfo.prizeAmount}</span>
        </div>
    );
};


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ previewUrl, scannedData, winningNumbers, prizeResults, isCheckingPrizes, error, onReset }) => {
  
  const totalWinnings = prizeResults?.reduce((sum, current) => {
    if (current.isWinner && current.prizeAmount.startsWith('¥')) {
      const amount = parseFloat(current.prizeAmount.replace('¥', '').replace(',', ''));
      return sum + amount;
    }
    return sum;
  }, 0) ?? 0;

  const hasFloatingBonus = prizeResults?.some(p => p.prizeAmount === '浮动奖金');

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-8 lg:space-y-0">
            {/* Image Preview Column */}
            {previewUrl && (
                <div className="lg:w-2/5 xl:w-1/3 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">您的彩票照片</h3>
                    <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-700/50 rounded-lg overflow-hidden shadow-md">
                        <img src={previewUrl} alt="彩票照片" className="w-full h-full object-contain" />
                    </div>
                </div>
            )}

            {/* Results Column */}
            <div className="flex-grow space-y-6">
                <div className="text-center lg:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">识别结果</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{scannedData.lotteryType} - 第 {scannedData.issueNumber} 期</p>
                </div>
              
                {winningNumbers && (
                    <div className="space-y-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg animate-fade-in">
                        <h3 className="font-semibold text-slate-600 dark:text-slate-300">本期开奖号码</h3>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {winningNumbers.front_area.map(num => (
                                    <div key={num} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg bg-red-500 text-white">{num}</div>
                                ))}
                            </div>
                            <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-600 mx-1 sm:mx-2"></div>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {winningNumbers.back_area.map(num => (
                                    <div key={num} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-lg bg-blue-500 text-white">{num}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    <h3 className="font-semibold text-slate-600 dark:text-slate-300">您的彩票号码</h3>
                    {scannedData.numbers.map((ticket, index) => {
                         const prizeInfo = prizeResults?.[index];
                         return (
                            <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                        {ticket.front_area.map(num => (
                                            <NumberChip key={num} num={num} isMatched={prizeInfo?.matchedFront.includes(num)} />
                                        ))}
                                    </div>
                                    <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-600 mx-1 sm:mx-2"></div>
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                        {ticket.back_area.map(num => (
                                            <NumberChip key={num} num={num} isMatched={prizeInfo?.matchedBack.includes(num)} isBackArea />
                                        ))}
                                    </div>
                                </div>
                                 <TicketPrizeDisplay prizeInfo={prizeInfo} isCheckingPrizes={isCheckingPrizes} />
                            </div>
                        )
                    })}
                </div>

                {error && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center">
                        <p className="font-semibold text-yellow-700 dark:text-yellow-400">{error}</p>
                    </div>
                )}
            </div>
        </div>
        
        {prizeResults && (
            <div className="text-center pt-6 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
                <p className="text-lg text-slate-600 dark:text-slate-300">总计中奖金额</p>
                <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 mt-1">
                    ¥{totalWinnings.toLocaleString()}
                    {hasFloatingBonus && <span className="text-lg font-medium text-slate-500 dark:text-slate-400"> + 浮动奖金</span>}
                </p>
                {totalWinnings === 0 && !hasFloatingBonus && <p className="mt-2 text-slate-500 dark:text-slate-400">很遗憾，未中奖。下次好运！</p>}
            </div>
        )}

      <button
        onClick={onReset}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800"
      >
        扫描下一张
      </button>
    </div>
  );
};