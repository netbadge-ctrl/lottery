import React from 'react';
import { TicketIcon } from './icons/TicketIcon';

export const Header: React.FC = () => {
    return (
        <header className="bg-slate-900/80 backdrop-blur-lg sticky top-0 z-10 border-b border-slate-700/50">
            <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-4">
                <div className="flex items-center space-x-3">
                    <TicketIcon className="w-8 h-8 text-indigo-400" />
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                        AI彩票识别
                    </h1>
                </div>
            </div>
        </header>
    );
};