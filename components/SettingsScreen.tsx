
import React from 'react';
import { QuizSettings, OperationMode, Range } from '../types';
import { ClockIcon } from './Icons';

interface SettingsScreenProps {
  settings: QuizSettings;
  setSettings: React.Dispatch<React.SetStateAction<QuizSettings>>;
  onStartQuiz: () => void;
  onViewHistory: () => void;
}

const SettingsOption = <T extends string | number | boolean>({
  label,
  value,
  selectedValue,
  onChange,
}: {
  label: string;
  value: T;
  selectedValue: T;
  onChange: (value: T) => void;
}) => (
  <button
    onClick={() => onChange(value)}
    className={`px-4 py-2 rounded-full text-sm sm:text-base transition-all duration-200 ${
      selectedValue === value
        ? 'bg-pink-400 text-white font-bold shadow-md'
        : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
    }`}
  >
    {label}
  </button>
);

const SettingsScreen: React.FC<SettingsScreenProps> = ({ settings, setSettings, onStartQuiz, onViewHistory }) => {
  return (
      <div className="flex flex-col gap-8 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-pink-500">一起来练习数学吧！</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="font-bold text-lg text-slate-600">要做哪种题目呢？</h2>
            <div className="flex flex-wrap gap-2">
              <SettingsOption label="加减混合" value="add_subtract" selectedValue={settings.operationMode} onChange={v => setSettings(s => ({ ...s, operationMode: v as OperationMode }))} />
              <SettingsOption label="乘除混合" value="multiply_divide" selectedValue={settings.operationMode} onChange={v => setSettings(s => ({ ...s, operationMode: v as OperationMode }))} />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-bold text-lg text-slate-600">数字范围是多少？</h2>
            <div className="flex flex-wrap gap-2">
              <SettingsOption label="10以内" value={10} selectedValue={settings.range} onChange={v => setSettings(s => ({ ...s, range: v as Range }))} />
              <SettingsOption label="100以内" value={100} selectedValue={settings.range} onChange={v => setSettings(s => ({ ...s, range: v as Range }))} />
              <SettingsOption label="1000以内" value={1000} selectedValue={settings.range} onChange={v => setSettings(s => ({ ...s, range: v as Range }))} />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-bold text-lg text-slate-600">要做几道题呢？</h2>
            <div className="flex items-center justify-start">
              <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.numQuestions}
                  onChange={(e) => {
                      const value = e.target.value;
                      const num = value === '' ? 1 : parseInt(value, 10);
                      if (!isNaN(num) && num > 0) {
                          setSettings(s => ({ ...s, numQuestions: Math.min(50, Math.max(1, num)) }));
                      }
                  }}
                  className="w-24 text-center text-2xl font-bold p-2 border-2 border-slate-300 rounded-lg outline-none transition-colors focus:border-pink-400 bg-slate-100"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-bold text-lg text-slate-600">要计时吗？</h2>
            <div className="flex flex-wrap gap-2">
              <SettingsOption label="开启" value={true} selectedValue={settings.isTimerEnabled} onChange={v => setSettings(s => ({ ...s, isTimerEnabled: v }))} />
              <SettingsOption label="关闭" value={false} selectedValue={settings.isTimerEnabled} onChange={v => setSettings(s => ({ ...s, isTimerEnabled: v }))} />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <button 
            onClick={onStartQuiz}
            className="sm:flex-1 w-full bg-sky-400 text-white font-bold text-xl py-4 rounded-full transition-transform hover:scale-105 hover:bg-sky-500 shadow-lg shadow-sky-200">
            开始答题！
          </button>
          <button
              onClick={onViewHistory}
              className="w-full sm:w-auto px-6 bg-pink-400 text-white font-bold py-4 rounded-full transition-transform hover:scale-105 hover:bg-pink-500 shadow-lg shadow-pink-200 flex items-center justify-center gap-2">
              <ClockIcon className="w-6 h-6" />
              <span>查看记录</span>
          </button>
        </div>
      </div>
  );
};

export default SettingsScreen;
