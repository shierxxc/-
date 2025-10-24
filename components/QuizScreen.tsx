
import React, { useRef, useEffect, useState } from 'react';
import { Question, QuizSettings, Feedback } from '../types';
import { CheckIcon, XIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from './Icons';
import { formatTime, decode, decodeAudioData } from '../utils/helpers';

interface QuizScreenProps {
  question: Question;
  settings: QuizSettings;
  questionNumber: number;
  totalQuestions: number;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  feedback: Feedback;
  onAnswer: () => void;
  onNext: () => void;
  elapsedTime: number;
  explanation: string | null;
  isFetchingExplanation: boolean;
  explanationAudio: string | null;
  isFetchingAudio: boolean;
}

const getOperationSymbol = (operation: Question['operation']) => {
  switch (operation) {
    case 'add': return '+';
    case 'subtract': return '-';
    case 'multiply': return '×';
    case 'divide': return '÷';
  }
};

const QuizScreen: React.FC<QuizScreenProps> = ({
  question,
  settings,
  questionNumber,
  totalQuestions,
  userAnswer,
  setUserAnswer,
  feedback,
  onAnswer,
  onNext,
  elapsedTime,
  explanation,
  isFetchingExplanation,
  explanationAudio,
  isFetchingAudio,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const explanationRef = useRef<HTMLDivElement>(null);
  
  // Refs and state for Web Audio API
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const isAnswered = feedback !== 'idle';

  useEffect(() => {
    if (feedback === 'idle' && inputRef.current) {
      inputRef.current.focus();
    } else if (isAnswered && nextButtonRef.current) {
      nextButtonRef.current.focus();
    }
  }, [question, feedback, isAnswered]);

  useEffect(() => {
    if(explanationRef.current) {
        explanationRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [explanation]);
  
  // Initialize and clean up AudioContext
  useEffect(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
    } else {
        console.error("Web Audio API is not supported in this browser.");
    }
    
    return () => {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current.disconnect();
        }
        audioContextRef.current?.close().catch(e => console.error("Error closing AudioContext", e));
    };
  }, []);
  
  // Decode audio when explanationAudio prop changes, then autoplay
  useEffect(() => {
    if (!explanationAudio) {
        setAudioBuffer(null);
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
        }
        return;
    }

    const decodeAndPlay = async () => {
        if (!audioContextRef.current) return;
        try {
            const decodedBytes = decode(explanationAudio);
            const buffer = await decodeAudioData(decodedBytes, audioContextRef.current);
            setAudioBuffer(buffer);
            playBuffer(buffer, audioContextRef.current);
        } catch (err) {
            console.error("Failed to decode or play audio:", err);
        }
    };

    decodeAndPlay();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [explanationAudio]);

  const playBuffer = (buffer: AudioBuffer, ctx: AudioContext) => {
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = () => {
        setIsPlaying(false);
        audioSourceRef.current = null;
    };
    source.start(0);
    audioSourceRef.current = source;
    setIsPlaying(true);
  };
  
  const handlePlayPause = () => {
    if (!audioContextRef.current || !audioBuffer) return;

    if (isPlaying && audioSourceRef.current) {
        audioSourceRef.current.stop();
    } else {
        playBuffer(audioBuffer, audioContextRef.current);
    }
  };
  
  const feedbackBorderStyle =
    feedback === 'correct' ? 'border-green-400' :
    feedback === 'incorrect' ? 'border-red-400' :
    'border-slate-300';
    
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="w-full">
        <div className="flex justify-between text-sm font-bold text-slate-500 mb-1">
            <span>第 {questionNumber} / {totalQuestions} 题</span>
            {settings.isTimerEnabled && (
                <span className="font-bold text-slate-500">
                    用时: {formatTime(elapsedTime)}
                </span>
            )}
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div className="bg-sky-400 h-2.5 rounded-full" style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}></div>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); isAnswered ? onNext() : onAnswer(); }} className="w-full">
        <div className="flex flex-col items-center justify-center p-6 bg-sky-50 rounded-2xl w-full min-h-[220px] gap-6">
            <p className="text-6xl sm:text-8xl font-bold tracking-wider text-slate-800">
                {question.num1}
                <span className="mx-4 font-normal">{getOperationSymbol(question.operation)}</span>
                {question.num2}
            </p>
            <div className="relative w-full max-w-xs">
                <input
                    ref={inputRef}
                    type="number"
                    placeholder="答案是?"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={isAnswered}
                    className={`w-full text-center text-4xl font-bold p-3 border-4 ${feedbackBorderStyle} rounded-xl outline-none transition-colors focus:border-sky-400 bg-white placeholder-slate-400`}
                />
                {feedback === 'correct' && <CheckIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 text-green-500" />}
                {feedback === 'incorrect' && <XIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 text-red-500" />}
            </div>
        </div>
      </form>

      {isAnswered ? (
         <button ref={nextButtonRef} onClick={onNext} className="w-full bg-pink-400 text-white font-bold text-xl py-4 rounded-full transition-transform hover:scale-105 hover:bg-pink-500 shadow-lg shadow-pink-200 focus:outline-none focus:ring-4 focus:ring-pink-300">
           {questionNumber === totalQuestions ? '完成' : '下一题'}
         </button>
      ): (
         <button onClick={onAnswer} disabled={!userAnswer} className="w-full bg-sky-400 text-white font-bold text-xl py-4 rounded-full transition-transform hover:scale-105 hover:bg-sky-500 shadow-lg shadow-sky-200 disabled:bg-slate-300 disabled:shadow-none disabled:hover:scale-100">
           检查答案
         </button>
      )}

      {feedback === 'incorrect' && (
        <div ref={explanationRef} className="w-full text-left p-4 bg-red-50 border-2 border-red-200 rounded-lg mt-4 animate-fade-in">
          <p className="font-bold text-lg text-red-600">正确答案是：{question.answer}</p>
          <div className="mt-2 text-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">解题思路：</h3>
              <button onClick={handlePlayPause} disabled={isFetchingAudio || !explanationAudio} className="text-red-500 disabled:text-slate-400 transition-colors p-1 rounded-full hover:bg-red-100 disabled:hover:bg-transparent">
                {isFetchingAudio ? (
                    <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                ) : isPlaying ? (
                    <SpeakerWaveIcon className="w-6 h-6" />
                ) : (
                    <SpeakerXMarkIcon className="w-6 h-6" />
                )}
              </button>
            </div>
            {isFetchingExplanation ? (
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>正在努力思考中...</span>
                </div>
            ) : (
                <div className="whitespace-pre-wrap">{explanation}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizScreen;
