import React from 'react';
import { TicketIcon } from './icons/TicketIcon';

export const Header: React.FC = () => {
    return (
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg sticky top-0 z-10 shadow-sm">
            <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-4">
                <div className="flex items-center space-x-3">
                    <TicketIcon className="w-8 h-8 text-indigo-500" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        AI彩票识别
                    </h1>
                </div>
            </div>
        </header>
    );
};