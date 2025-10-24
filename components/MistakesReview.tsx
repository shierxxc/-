
import React, { useState } from 'react';
import { QuizResult, Question, Operation, MissedQuestion } from '../types';
import { GoogleGenAI } from '@google/genai';

interface MistakesReviewProps {
  result: QuizResult;
  onBack: () => void;
  ai: GoogleGenAI;
}

const getOperationSymbol = (operation: Operation) => {
    switch (operation) {
      case 'add': return '+';
      case 'subtract': return '-';
      case 'multiply': return '×';
      case 'divide': return '÷';
    }
};

const MistakeItem: React.FC<{ missed: MissedQuestion, ai: GoogleGenAI }> = ({ missed, ai }) => {
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const { question, userAnswer } = missed;

    const fetchExplanation = async () => {
        setIsFetching(true);
        setExplanation('');
        const symbol = getOperationSymbol(question.operation);
        const prompt = `为题目 "${question.num1} ${symbol} ${question.num2}" 生成解题思路。
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

        try {
            const stream = await ai.models.generateContentStream({
                model: 'gemini-flash-latest',
                contents: prompt
            });

            let fullText = "";
            for await (const chunk of stream) {
                fullText += chunk.text;
                setExplanation(fullText);
            }
        } catch (error) {
            console.error("Error fetching explanation:", error);
            setExplanation("抱歉，无法获取解题思路。");
        } finally {
            setIsFetching(false);
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <p className="text-2xl font-bold text-slate-700">
                    {question.num1} {getOperationSymbol(question.operation)} {question.num2} = ?
                </p>
                <div className="flex items-center gap-4 mt-2 sm:mt-0 text-lg">
                    <p><span className="text-red-500 font-semibold">你的答案: {userAnswer}</span></p>
                    <p><span className="text-green-500 font-semibold">正确答案: {question.answer}</span></p>
                </div>
            </div>
            {explanation === null && !isFetching && (
                <div className="text-right mt-2">
                    <button onClick={fetchExplanation} className="text-sm font-bold text-sky-600 hover:text-sky-800 transition-colors">
                        查看解题思路
                    </button>
                </div>
            )}
            {isFetching && (
                 <div className="mt-2 flex items-center gap-2 text-slate-500">
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                    <span>正在努力思考中...</span>
                </div>
            )}
            {explanation !== null && !isFetching && (
                <div className="mt-2 p-3 bg-sky-50 rounded text-slate-600 border-l-4 border-sky-300">
                    <p><span className="font-bold">思路：</span>{explanation}</p>
                </div>
            )}
        </div>
    );
};

const MistakesReview: React.FC<MistakesReviewProps> = ({ result, onBack, ai }) => {
  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-pink-500">错题回顾</h1>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-pink-100 text-pink-700 font-bold rounded-full hover:bg-pink-200 transition-colors"
        >
          返回记录
        </button>
      </div>
      <div className="space-y-4 max-h-[60vh] sm:max-h-[50vh] overflow-y-auto pr-2 bg-slate-50 p-4 rounded-lg">
        {result.missedQuestions.map((missed, index) => (
          <MistakeItem key={index} missed={missed} ai={ai} />
        ))}
      </div>
    </div>
  );
};

export default MistakesReview;
