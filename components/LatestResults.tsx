import React, { useState, useEffect } from 'react';
import { LotteryType, type WinningNumbers } from '../types';
import { getAllLatestWinningNumbers } from '../services/dataFetchService';

interface LatestResultsProps {
    onRefresh?: () => void;
}

export const LatestResults: React.FC<LatestResultsProps> = ({ onRefresh }) => {
    const [latestResults, setLatestResults] = useState<{
        unionLotto: WinningNumbers | null;
        superLotto: WinningNumbers | null;
    }>({ unionLotto: null, superLotto: null });

    const refreshResults = () => {
        const results = getAllLatestWinningNumbers();
        setLatestResults(results);
        if (onRefresh) {
            onRefresh();
        }
    };

    useEffect(() => {
        refreshResults();
    }, []);

    const formatNumbers = (numbers: string[]) => {
        return numbers.map((num, index) => (
            <span
                key={index}
                className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white bg-red-500 rounded-full mx-1"
            >
                {num}
            </span>
        ));
    };

    const formatBackNumbers = (numbers: string[], lotteryType: LotteryType) => {
        const bgColor = lotteryType === LotteryType.UNION_LOTTO ? 'bg-blue-500' : 'bg-blue-600';
        return numbers.map((num, index) => (
            <span
                key={index}
                className={`inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-white ${bgColor} rounded-full mx-1`}
            >
                {num}
            </span>
        ));
    };

    const renderLotteryResult = (result: WinningNumbers | null, title: string, description: string) => {
        if (!result) {
            return (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">{title}</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
                    <div className="mt-2 text-gray-400 dark:text-gray-500">暂无开奖数据</div>
                </div>
            );
        }

        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center mb-3">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h4>
                    <span className="text-sm text-gray-500 dark:text-gray-400">第{result.issueNumber}期</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{description}</p>
                <div className="flex flex-wrap items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">前区:</span>
                    {formatNumbers(result.front_area)}
                    <span className="text-sm text-gray-600 dark:text-gray-300 mx-2">
                        {result.lotteryType === LotteryType.UNION_LOTTO ? '蓝球:' : '后区:'}
                    </span>
                    {formatBackNumbers(result.back_area, result.lotteryType)}
                </div>
            </div>
        );
    };

    return (
        <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    🏆 最新开奖结果
                </h3>
                <button
                    onClick={refreshResults}
                    className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg transition-colors duration-200"
                >
                    刷新
                </button>
            </div>
            
            <div className="space-y-4">
                {renderLotteryResult(
                    latestResults.unionLotto,
                    '🔴 双色球',
                    '前区6个红球(01-33) + 后区1个蓝球(01-16)'
                )}
                
                {renderLotteryResult(
                    latestResults.superLotto,
                    '🎯 超级大乐透',
                    '前区5个号码(01-35) + 后区2个号码(01-12)'
                )}
            </div>

            {(!latestResults.unionLotto && !latestResults.superLotto) && (
                <div className="mt-4 text-center">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                        💡 点击"数据管理"按钮来获取最新开奖数据
                    </p>
                </div>
            )}
        </div>
    );
};