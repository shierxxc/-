
import React, { useState } from 'react';
import { QuizResult } from '../types';
import { formatTime, getOperationModeText } from '../utils/helpers';
import MistakesReview from './MistakesReview';
import { GoogleGenAI } from '@google/genai';

interface HistoryScreenProps {
  history: QuizResult[];
  onBack: () => void;
  ai: GoogleGenAI;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ history, onBack, ai }) => {
  const [reviewingResult, setReviewingResult] = useState<QuizResult | null>(null);

  if (reviewingResult) {
    return (
      <MistakesReview
        result={reviewingResult}
        onBack={() => setReviewingResult(null)}
        ai={ai}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-pink-500">历史记录</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-pink-100 text-pink-700 font-bold rounded-full hover:bg-pink-200 transition-colors"
        >
          返回
        </button>
      </div>
      
      {history.length === 0 ? (
        <p className="text-center text-slate-500 p-8">还没有答题记录哦，快去开始一次练习吧！</p>
      ) : (
        <div className="space-y-4 max-h-[60vh] sm:max-h-[50vh] overflow-y-auto pr-2">
          {history.map((result) => (
            <div key={result.id} className="bg-sky-50/80 p-5 rounded-xl shadow-sm w-full">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="font-bold text-slate-700 text-lg">
                        {new Date(result.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-slate-500">
                            {new Date(result.date).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-sky-500">
                        {Math.round((result.score / result.totalQuestions) * 100)}%
                        </p>
                        <p className="text-sm text-slate-500">{result.score}/{result.totalQuestions} 题</p>
                    </div>
                </div>
                <div className="border-t border-sky-200/50 my-3"></div>
                <div className="flex items-center justify-between text-center text-sm text-slate-600">
                    <div className="flex-1">
                        <p className="font-semibold text-xs text-slate-400">题目类型</p>
                        <p className="font-medium">{getOperationModeText(result.settings.operationMode)}</p>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-xs text-slate-400">题量</p>
                        <p className="font-medium">{result.totalQuestions}</p>
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-xs text-slate-400">用时</p>
                        <p className="font-medium">{result.timeTaken !== null ? formatTime(result.timeTaken) : '未计时'}</p>
                    </div>
                    {result.missedQuestions && result.missedQuestions.length > 0 && (
                        <div className="flex-1">
                            <button
                                onClick={() => setReviewingResult(result)}
                                className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-full hover:bg-red-200 transition-colors">
                                查看错题
                            </button>
                        </div>
                    )}
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;
