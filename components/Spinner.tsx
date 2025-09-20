import React, { useState, useEffect } from 'react';

const messages = [
  "正在分析彩票图片...",
  "正在识别彩票号码...",
  "正在请求AI分析...",
  "正在核对幸运号码...",
  "正在计算中奖金额...",
  "请稍等片刻..."
];

export const Spinner: React.FC = () => {
  const [message, setMessage] = useState(messages[0]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-600 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="text-slate-600 dark:text-slate-300 font-semibold text-center transition-opacity duration-500">{message}</p>
    </div>
  );
};