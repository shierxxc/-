import React, { useEffect } from 'react';
import { ClockIcon, StarIcon } from './Icons';
import { formatTime, playResultsSound } from '../utils/helpers';
import Confetti from './Confetti';

interface ResultsScreenProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  timeTaken: number | null;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ score, totalQuestions, onRestart, timeTaken }) => {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  let message = '';
  if (percentage === 100) {
    message = "满分！你真是个数学小天才！✨";
  } else if (percentage >= 80) {
    message = "太棒了！你真聪明！🚀";
  } else if (percentage >= 50) {
    message = "很努力了！继续练习吧！💪";
  } else {
    message = "别灰心，我们再来一次！😊";
  }

  useEffect(() => {
    playResultsSound(percentage);
  }, [percentage]);

  return (
    <div className="relative flex flex-col items-center gap-6 text-center animate-fade-in p-2 sm:p-6">
      {percentage >= 90 && <Confetti />}
      <h1 className="text-3xl sm:text-4xl font-bold text-pink-500">{message}</h1>
      
      <div className="w-full bg-sky-50/70 rounded-2xl p-6 flex items-center justify-center ring-1 ring-sky-100">
        <div className="text-center">
          <p className="text-slate-500 font-semibold mb-1">正确率</p>
          <p className="text-5xl sm:text-6xl font-bold text-sky-600 leading-none">
            {percentage}
            <span className="text-3xl text-slate-400 font-medium">%</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-base text-slate-500 bg-pink-50/70 px-4 py-2 rounded-full">
         <span className="font-semibold">答对 {score} / 共 {totalQuestions} 题</span>
         {timeTaken !== null && <div className="hidden sm:block w-px h-5 bg-pink-200"></div>}
         {timeTaken !== null && (
            <div className="flex items-center gap-1.5">
                <ClockIcon className="w-5 h-5 text-pink-400" />
                <span className="font-semibold">总用时:</span>
                <span className="font-bold text-pink-500">{formatTime(timeTaken)}</span>
            </div>
         )}
      </div>
      
      <button 
        onClick={onRestart}
        className="mt-4 w-full max-w-sm bg-sky-400 text-white font-bold text-xl py-4 rounded-full transition-transform hover:scale-105 hover:bg-sky-500 shadow-lg shadow-sky-200 focus:outline-none focus:ring-4 focus:ring-sky-300"
      >
        再玩一次
      </button>
    </div>
  );
};

export default ResultsScreen;