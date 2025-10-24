
import React from 'react';
import { calculateLevel } from '../utils/helpers';
import { StarIcon, MoonIcon, SunIcon, CrownIcon, QuestionMarkCircleIcon } from './Icons';

interface LevelDisplayProps {
  totalStars: number;
  justEarnedStar: boolean;
  onOpenRules: () => void;
}

const LevelDisplay: React.FC<LevelDisplayProps> = ({ totalStars, justEarnedStar, onOpenRules }) => {
  const { crowns, suns, moons, stars } = calculateLevel(totalStars);

  return (
    <button 
        onClick={onOpenRules}
        className="flex items-center gap-2 bg-white/70 backdrop-blur-sm p-2 rounded-full shadow-md shadow-pink-100/50 transition-transform hover:scale-105"
        title="查看等级和规则"
    >
      <div className="flex items-center gap-1 pl-2">
        {/* Render high-tier icons */}
        {Array.from({ length: crowns }).map((_, i) => (
          <CrownIcon key={`c-${i}`} className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
        ))}
        {Array.from({ length: suns }).map((_, i) => (
          <SunIcon key={`s-${i}`} className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
        ))}
        {Array.from({ length: moons }).map((_, i) => (
          <MoonIcon key={`m-${i}`} className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
        ))}

        {/* Render stars with count, only if stars exist or it's the only rank.
            This ensures we don't show 'star 0' when a new moon is earned. */}
        {(stars > 0 || totalStars < 100) && (
             <div className="flex items-center gap-1">
                <StarIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${totalStars > 0 ? 'text-yellow-400' : 'text-slate-300'}`} />
                <span className={`text-slate-600 font-bold text-lg leading-none transition-transform duration-300 ${justEarnedStar ? 'scale-125 text-pink-500' : 'scale-100'}`}>
                    {stars}
                </span>
             </div>
        )}
      </div>
      
      <div className="w-px h-6 bg-pink-200/50 mx-1"></div>
      
      <div className="flex items-center gap-1 text-pink-500 pr-2">
        <QuestionMarkCircleIcon className="w-6 h-6" />
        <span className="font-bold text-sm hidden sm:inline">规则</span>
      </div>
    </button>
  );
};

export default LevelDisplay;
