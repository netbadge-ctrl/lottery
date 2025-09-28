import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Spinner } from './components/Spinner';
import { scanLotteryTicket } from './services/geminiService';
import { getWinningNumbers, checkPrizes } from './services/lotteryService';
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

            const winningNumbers = getWinningNumbers(initialScan.lotteryType, initialScan.issueNumber);

            if (!winningNumbers) {
                setError(`未找到期号 ${initialScan.issueNumber} 的开奖号码。请检查期号是否正确。`);
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

    const isLoading = isScanning || isCheckingPrizes;

    return (
        <div className="bg-slate-900 min-h-screen font-sans text-slate-200">
            <Header />
            <main className="container mx-auto max-w-4xl px-4 sm:px-6 py-8">
                <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl shadow-indigo-900/20 p-6 sm:p-8">
                    {!scannedData && !isScanning && (
                         <div className="max-w-2xl mx-auto">
                            <ImageUploader
                                onImageChange={handleImageChange}
                                previewUrl={previewUrl}
                                onScan={handleScan}
                                hasImage={!!imageFile}
                            />
                        </div>
                    )}
                    
                    {isScanning && <Spinner />}

                    {error && !isLoading && !scannedData && (
                        <div className="text-center">
                             <p className="text-red-400 font-semibold">{error}</p>
                             <button
                                 onClick={handleReset}
                                 className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
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
        </div>
    );
}

export default App;