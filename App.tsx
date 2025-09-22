import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Spinner } from './components/Spinner';
import { LatestResults } from './components/LatestResults';
import { scanLotteryTicket } from './services/aiService';
import { getWinningNumbers, checkPrizes, updateWinningNumbers } from './services/lotteryService';
import { fetchHistoryData, fetchLatestData, getDatabaseStats, clearDatabase } from './services/dataFetchService';
import type { AnalyzedResult, ScannedTicketData } from './types';

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
};

function App() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isCheckingPrizes, setIsCheckingPrizes] = useState(false);
    const [scannedData, setScannedData] = useState<ScannedTicketData | null>(null);
    const [result, setResult] = useState<AnalyzedResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [showAdmin, setShowAdmin] = useState(false);
    const [showDataManager, setShowDataManager] = useState(false);
    const [isUpdatingData, setIsUpdatingData] = useState(false);

    const handleImageChange = useCallback((file: File) => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        const newPreviewUrl = URL.createObjectURL(file);
        setImageFile(file);
        setPreviewUrl(newPreviewUrl);
        setResult(null);
        setScannedData(null);
        setError(null);
    }, [previewUrl]);

    const handleScan = async () => {
        if (!imageFile) return;

        // Reset states for a new scan
        setIsScanning(true);
        setIsCheckingPrizes(false);
        setError(null);
        setResult(null);
        setScannedData(null);

        try {
            // Stage 1: Scan the ticket with AI
            const base64Image = await fileToBase64(imageFile);
            const initialScan = await scanLotteryTicket(base64Image, imageFile.type);

            if (!initialScan) {
                setError("AI无法识别图片中的彩票信息。请尝试使用更清晰的图片。");
                setIsScanning(false);
                return;
            }
            
            setScannedData(initialScan);
            setIsScanning(false);
            
            // Stage 2: Check for prizes
            setIsCheckingPrizes(true);
            
            // Simulate a slight delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));

            const winningNumbers = await getWinningNumbers(initialScan.lotteryType, initialScan.issueNumber);

            if (!winningNumbers) {
                setError(`未找到期号 ${initialScan.issueNumber} 的开奖号码。
                
可能原因：
                1. 该期号尚未开奖（请检查期号是否正确）
                2. 不在当前数据库范围内（仅包含最近100期）
                3. 期号输入错误
                
请点击"数据管理"更新开奖数据或手动输入正确的开奖结果。`);
                setIsCheckingPrizes(false);
                return; // Keep showing scanned data with the error
            }

            const prizeResults = checkPrizes(initialScan, winningNumbers);

            setResult({
                scannedData: initialScan,
                winningNumbers,
                prizeResults,
            });

        } catch (err) {
            console.error(err);
            setError("发生意外错误，请稍后重试。");
        } finally {
            setIsScanning(false);
            setIsCheckingPrizes(false);
        }
    };
    
    const handleReset = useCallback(() => {
        setImageFile(null);
        setResult(null);
        setError(null);
        setIsScanning(false);
        setIsCheckingPrizes(false);
        setScannedData(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
    }, [previewUrl]);

    const handleClearDatabase = async () => {
        try {
            await clearDatabase();
            setShowDataManager(false);
            // 如果正在显示结果，重新扫描以更新状态
            if (scannedData) {
                handleScan();
            }
        } catch (error) {
            console.error('清空数据库失败:', error);
        }
    };
    
    const handleFetchHistory = async () => {
        setIsUpdatingData(true);
        try {
            await fetchHistoryData(100);
            console.log('✅ 已成功抽取过去100期开奖数据');
        } catch (error) {
            console.error('❌ 抽取历史数据失败:', error);
        } finally {
            setIsUpdatingData(false);
        }
    };
    
    const handleFetchLatest = async () => {
        setIsUpdatingData(true);
        try {
            await fetchLatestData();
            console.log('✅ 已成功更新最新开奖数据');
        } catch (error) {
            console.error('❌ 更新最新数据失败:', error);
        } finally {
            setIsUpdatingData(false);
        }
    };

    const isLoading = isScanning || isCheckingPrizes;

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen font-sans text-slate-800 dark:text-slate-200">
            <Header />
            <main className="container mx-auto max-w-4xl px-4 sm:px-6 py-8">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 sm:p-8">
                    {!scannedData && !isScanning && (
                         <div className="max-w-2xl mx-auto">
                            <ImageUploader
                                onImageChange={handleImageChange}
                                previewUrl={previewUrl}
                                onScan={handleScan}
                                hasImage={!!imageFile}
                            />
                            <LatestResults />
                        </div>
                    )}
                    
                    {isScanning && <Spinner />}

                    {error && !isLoading && !scannedData && (
                        <div className="text-center">
                             <p className="text-red-500 font-semibold">{error}</p>
                             <button
                                 onClick={handleReset}
                                 className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                             >
                                 重新上传
                             </button>
                        </div>
                    )}

                    {scannedData && !isScanning && (
                         <ResultDisplay
                            previewUrl={previewUrl}
                            scannedData={scannedData}
                            winningNumbers={result?.winningNumbers}
                            prizeResults={result?.prizeResults}
                            isCheckingPrizes={isCheckingPrizes}
                            error={error}
                            onReset={handleReset}
                        />
                    )}
                </div>
            </main>
            
            {/* 数据管理按钮 */}
            {!scannedData && !isLoading && (
                <div className="fixed bottom-4 left-4 z-40">
                    <button
                        onClick={() => setShowDataManager(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg shadow-lg transition-colors flex items-center space-x-2 text-sm"
                        title="数据管理"
                    >
                        <span>📊</span>
                        <span>数据管理</span>
                    </button>
                </div>
            )}
            
            {/* 管理员快速修正按钮 */}
            {error && error.includes('未找到期号') && scannedData && (
                <div className="fixed bottom-4 right-4 z-40">
                    <button
                        onClick={() => setShowAdmin(true)}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg shadow-lg transition-colors flex items-center space-x-2"
                    >
                        <span>🔧</span>
                        <span>修正开奖号码</span>
                    </button>
                </div>
            )}
            
            {/* 数据管理面板 */}
            {showDataManager && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">📊 开奖数据管理</h3>
                        
                        <div className="space-y-4">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <p>当前数据源：中国彩票官网</p>
                                <p>数据范围：最近100期开奖记录</p>
                            </div>
                            
                            <button
                                onClick={handleFetchHistory}
                                disabled={isUpdatingData}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                                {isUpdatingData ? '正在抓取...' : '🔄 立即抓取过去100期数据'}
                            </button>
                            
                            <button
                                onClick={handleFetchLatest}
                                disabled={isUpdatingData}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                                {isUpdatingData ? '正在更新...' : '🆕 更新最新开奖数据'}
                            </button>
                            
                            <button
                                onClick={handleClearDatabase}
                                disabled={isUpdatingData}
                                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
                            >
                                🗑️ 清空本地数据库
                            </button>
                            
                            <div className="pt-4 border-t">
                                <button
                                    onClick={() => setShowDataManager(false)}
                                    className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                                >
                                    关闭
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;