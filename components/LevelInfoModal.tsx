import React, { useEffect, useState } from 'react';
import { loadStars, calculateProgress } from '../utils/helpers';
import { StarIcon, MoonIcon, SunIcon, CrownIcon, XIcon } from './Icons';

interface LevelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProgressBar: React.FC<{ current: number; target: number; color: string }> = ({ current, target, color }) => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    return (
        <div className="w-full bg-slate-200 rounded-full h-4">
            <div
                className={`h-4 rounded-full transition-all duration-500 ${color}`}
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};


const LevelInfoModal: React.FC<LevelInfoModalProps> = ({ isOpen, onClose }) => {
    const [totalStars, setTotalStars] = useState(0);

    // The modal re-reads the latest star count whenever it opens
    useEffect(() => {
        if (isOpen) {
            setTotalStars(loadStars());
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    const { progressToMoon, progressToSun, progressToCrown } = calculateProgress(totalStars);

    return (
        <div 
            className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fade-in-fast"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative text-slate-700"
                onClick={e => e.stopPropagation()}
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                    <XIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-pink-500 text-center mb-4">等级规则</h2>
                
                <div className="space-y-4 text-center text-lg font-semibold">
                    <div className="flex items-center justify-center gap-4">
                        <span>100</span> <StarIcon className="w-6 h-6 text-yellow-400" /> <span>= 1</span> <MoonIcon className="w-6 h-6 text-indigo-400" />
                    </div>
                     <div className="flex items-center justify-center gap-4">
                        <span>10</span> <MoonIcon className="w-6 h-6 text-indigo-400" /> <span>= 1</span> <SunIcon className="w-6 h-6 text-orange-400" />
                    </div>
                     <div className="flex items-center justify-center gap-4">
                        <span>5</span> <SunIcon className="w-6 h-6 text-orange-400" /> <span>= 1</span> <CrownIcon className="w-6 h-6 text-amber-400" />
                    </div>
                </div>

                <div className="border-t my-6"></div>

                <h3 className="text-xl font-bold text-pink-500 text-center mb-4">你的进度</h3>
                <div className="space-y-5">
                    <div>
                        <div className="flex justify-between items-center mb-1 text-sm font-semibold">
                            <span className="text-slate-600">下一颗月亮</span>
                            <span className="text-indigo-500">{progressToMoon.current} / {progressToMoon.target} <span className="text-xs">🌟</span></span>
                        </div>
                        <ProgressBar {...progressToMoon} color="bg-indigo-400" />
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-1 text-sm font-semibold">
                            <span className="text-slate-600">下一颗太阳</span>
                            <span className="text-orange-500">{progressToSun.current} / {progressToSun.target} <span className="text-xs">🌙</span></span>
                        </div>
                        <ProgressBar {...progressToSun} color="bg-orange-400" />
                    </div>
                     <div>
                        <div className="flex justify-between items-center mb-1 text-sm font-semibold">
                            <span className="text-slate-600">下一顶皇冠</span>
                            <span className="text-amber-500">{progressToCrown.current} / {progressToCrown.target} <span className="text-xs">☀️</span></span>
                        </div>
                        <ProgressBar {...progressToCrown} color="bg-amber-400" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LevelInfoModal;