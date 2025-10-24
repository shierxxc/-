
import React, { useState, useCallback, useEffect } from 'react';
import { QuizSettings, Question, GameState, Feedback, QuizResult, MissedQuestion } from './types';
import { generateQuestions } from './utils/math';
import { loadHistory, saveHistory, playSound, loadStars, saveStars } from './utils/helpers';
import SettingsScreen from './components/SettingsScreen';
import QuizScreen from './components/QuizScreen';
import ResultsScreen from './components/ResultsScreen';
import HistoryScreen from './components/HistoryScreen';
import LevelDisplay from './components/LevelDisplay';
import LevelInfoModal from './components/LevelInfoModal';
import { GoogleGenAI, Modality } from "@google/genai";

const App: React.FC = () => {
  const [settings, setSettings] = useState<QuizSettings>({
    operationMode: 'add_subtract',
    range: 10,
    isTimerEnabled: false,
    numQuestions: 10,
  });

  const [gameState, setGameState] = useState<GameState>('settings');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<Feedback>('idle');
  
  // New states for timer, history, and explanations
  const [quizStartTime, setQuizStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<number | null>(null);
  const [finalTime, setFinalTime] = useState<number | null>(null);
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isFetchingExplanation, setIsFetchingExplanation] = useState(false);
  const [explanationAudio, setExplanationAudio] = useState<string | null>(null);
  const [isFetchingAudio, setIsFetchingAudio] = useState(false);
  
  // New features state
  const [totalStars, setTotalStars] = useState(0);
  const [justEarnedStar, setJustEarnedStar] = useState(false);
  const [missedQuestions, setMissedQuestions] = useState<MissedQuestion[]>([]);
  const [isLevelInfoModalOpen, setIsLevelInfoModalOpen] = useState(false);
  
  // State for AI client and API Key validation
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  useEffect(() => {
    // API Key validation and AI client initialization using Vite's env variables
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) {
      const errorMessage = "错误：未找到 API 密钥。请在 GitHub 仓库的 Settings > Secrets and variables > Actions 中设置名为 VITE_API_KEY 的密钥。";
      setApiKeyError(errorMessage);
      console.error(errorMessage);
      return;
    }
    try {
      const genAI = new GoogleGenAI({ apiKey });
      setAi(genAI);
    } catch (e) {
      console.error("初始化 GoogleGenAI 失败", e);
      setApiKeyError("错误：初始化 AI 服务失败。请检查您的 API 密钥是否有效。");
    }

    setHistory(loadHistory());
    setTotalStars(loadStars());
  }, []);

  const startTimer = () => {
    if (settings.isTimerEnabled) {
      const startTime = Date.now();
      setQuizStartTime(startTime);
      setElapsedTime(0);
      const interval = setInterval(() => {
        setElapsedTime(Math.round((Date.now() - startTime) / 1000));
      }, 1000);
      setTimerInterval(interval as unknown as number);
    }
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
      const endTime = Math.round((Date.now() - (quizStartTime ?? Date.now())) / 1000);
      setFinalTime(endTime);
      return endTime;
    }
    return null;
  };

  const startQuiz = useCallback(() => {
    const newQuestions = generateQuestions(settings);
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswer('');
    setFeedback('idle');
    setExplanation(null);
    setExplanationAudio(null);
    setFinalTime(null);
    setMissedQuestions([]);
    setGameState('quiz');
    startTimer();
  }, [settings]);

  const getOperationSymbol = (operation: Question['operation']) => {
    switch (operation) {
      case 'add': return '+';
      case 'subtract': return '-';
      case 'multiply': return '×';
      case 'divide': return '÷';
    }
  };
  
  const fetchExplanationAudio = async (text: string) => {
    if (!ai) return;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Zephyr' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            setExplanationAudio(base64Audio);
        }
    } catch (error) {
        console.error("Error fetching explanation audio:", error);
    } finally {
        setIsFetchingAudio(false);
    }
  };

  const fetchExplanation = async (q: Question) => {
    if (!ai) return;
    const symbol = getOperationSymbol(q.operation);
    const prompt = `为题目 "${q.num1} ${symbol} ${q.num2}" 生成解题思路。
**严格遵循以下规则：**
1. 始终以“先算个位：”开始。
2. 接着描述个位计算过程。如果涉及借位或进位，必须明确说明。
3. 然后，用“再算十位：”继续。
4. 接着描述十位计算过程。
5. 最后用“所以，答案是...”结尾。
6. 全程使用阿拉伯数字，不要使用任何Markdown、特殊符号或汉字数字。
7. 语言必须简洁、标准化，总字数控制在50字以内。

**例如，对于 72 - 18，正确的回答是：**
“先算个位：2减8不够减，向十位借1，变成12减8等于4。再算十位：7被借走1还剩6，6减1等于5。所以，答案是54。”`;
    
    setExplanation('');
    setIsFetchingExplanation(true);

    try {
      const stream = await ai.models.generateContentStream({
        model: 'gemini-flash-latest',
        contents: prompt
      });

      let fullExplanationText = "";
      setIsFetchingExplanation(false); 

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullExplanationText += chunkText;
        setExplanation(fullExplanationText);
      }

      if (fullExplanationText) {
        setIsFetchingAudio(true);
        fetchExplanationAudio(fullExplanationText);
      }

    } catch (error) {
      console.error("Error fetching explanation:", error);
      setExplanation("抱歉，无法获取解题思路。请检查网络连接或稍后再试。");
      setIsFetchingExplanation(false);
    }
  };

  const handleAnswer = () => {
    if (feedback !== 'idle') return;
    const isCorrect = userAnswer === questions[currentQuestionIndex].answer.toString();
    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback('correct');
      playSound('correct');
      const newTotalStars = totalStars + 1;
      setTotalStars(newTotalStars);
      saveStars(newTotalStars);
      setJustEarnedStar(true);
      setTimeout(() => setJustEarnedStar(false), 500);
    } else {
      setFeedback('incorrect');
      playSound('incorrect');
      setMissedQuestions(prev => [...prev, { question: questions[currentQuestionIndex], userAnswer }]);
      fetchExplanation(questions[currentQuestionIndex]);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer('');
      setFeedback('idle');
      setExplanation(null);
      setExplanationAudio(null);
    } else {
      const timeTaken = stopTimer();
      const newResult: QuizResult = {
        id: new Date().toISOString(),
        score,
        totalQuestions: settings.numQuestions,
        timeTaken,
        date: Date.now(),
        settings,
        missedQuestions,
      };
      const updatedHistory = [newResult, ...history];
      setHistory(updatedHistory);
      saveHistory(updatedHistory);
      setGameState('results');
    }
  };

  const restartQuiz = () => {
    if (timerInterval) clearInterval(timerInterval);
    setGameState('settings');
  };
  
  const viewHistory = () => {
    setGameState('history');
  }

  const renderContent = () => {
    // If there is an API key error, show it instead of the app content
    if (apiKeyError) {
      return (
        <div className="text-center p-4 bg-red-100 border-2 border-red-300 rounded-lg">
          <h2 className="text-2xl font-bold text-red-700 mb-2">应用启动失败</h2>
          <p className="text-red-600">{apiKeyError}</p>
          <p className="text-slate-500 mt-4 text-sm">对于本地开发，请在项目根目录创建 `.env.local` 文件并添加 `VITE_API_KEY=你的密钥`。</p>
        </div>
      );
    }
    
    switch (gameState) {
      case 'quiz':
        return (
          <QuizScreen
            question={questions[currentQuestionIndex]}
            settings={settings}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={settings.numQuestions}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            feedback={feedback}
            onAnswer={handleAnswer}
            onNext={nextQuestion}
            elapsedTime={elapsedTime}
            explanation={explanation}
            isFetchingExplanation={isFetchingExplanation}
            explanationAudio={explanationAudio}
            isFetchingAudio={isFetchingAudio}
          />
        );
      case 'results':
        return (
          <ResultsScreen
            score={score}
            totalQuestions={settings.numQuestions}
            onRestart={restartQuiz}
            timeTaken={finalTime}
          />
        );
      case 'history':
        return (
          <HistoryScreen history={history} onBack={restartQuiz} ai={ai!} />
        );
      case 'settings':
      default:
        return (
          <SettingsScreen
            settings={settings}
            setSettings={setSettings}
            onStartQuiz={startQuiz}
            onViewHistory={viewHistory}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans">
      <LevelInfoModal 
        isOpen={isLevelInfoModalOpen} 
        onClose={() => setIsLevelInfoModalOpen(false)} 
      />
      <header className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-pink-400">
              数学答题系统
          </h1>
          {!apiKeyError && (
            <LevelDisplay 
              totalStars={totalStars} 
              justEarnedStar={justEarnedStar}
              onOpenRules={() => setIsLevelInfoModalOpen(true)}
            />
          )}
      </header>
      <main className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl shadow-pink-200/60 p-6 sm:p-10 text-slate-700 transition-all duration-500 mt-20 sm:mt-16">
        {renderContent()}
      </main>
       <footer className="mt-6 text-center text-pink-400 text-sm">
            <p>为小学习者们倾心打造！✨</p>
        </footer>
    </div>
  );
};

export default App;
