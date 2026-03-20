import { Question, Personality, Player } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Info, ArrowRight, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import Markdown from 'react-markdown';

interface Props {
  question: Question;
  personality: Personality;
  player: Player;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  isLast: boolean;
}

export default function TriviaQuestion({ question, personality, player, onAnswer, onNext, isLast }: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setSelectedAnswer(null);
    setShowExplanation(false);
  }, [question]);

  const handleSelect = (option: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(option);
    onAnswer(option);
    setTimeout(() => setShowExplanation(true), 1000);
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        key={question.id}
        className="space-y-6"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <User size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Turno de:</p>
              <p className="text-lg font-black text-zinc-900">{player.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-indigo-100 bg-white shadow-sm">
              <img 
                src={personality.avatarUrl} 
                alt={personality.name} 
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 rounded-2xl bg-indigo-50 p-4 text-indigo-900 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-wider opacity-60">{personality.name} dice:</p>
              <h2 className="mt-1 text-xl font-bold leading-tight">{question.text}</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrectOption = option === question.correctAnswer;
            const showCorrect = selectedAnswer && isCorrectOption;
            const showWrong = selectedAnswer && isSelected && !isCorrectOption;

            return (
              <motion.button
                key={idx}
                whileHover={!selectedAnswer ? { scale: 1.02, backgroundColor: '#f8fafc' } : {}}
                whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                onClick={() => handleSelect(option)}
                disabled={!!selectedAnswer}
                className={`relative flex items-center justify-between rounded-xl border-2 p-5 text-left font-medium transition-all duration-300 ${
                  isSelected 
                    ? isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : 'border-rose-500 bg-rose-50 text-rose-900'
                    : showCorrect 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-zinc-100 bg-white text-zinc-700'
                } ${!selectedAnswer && 'hover:border-indigo-200 hover:shadow-md'}`}
              >
                <span>{option}</span>
                {showCorrect && <CheckCircle2 className="text-emerald-500" size={20} />}
                {showWrong && <XCircle className="text-rose-500" size={20} />}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className={`rounded-2xl border-2 p-6 ${isCorrect ? 'border-emerald-100 bg-emerald-50/30' : 'border-rose-100 bg-rose-50/30'}`}>
              <div className="flex items-start gap-4">
                <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  <Info size={16} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold ${isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
                    {isCorrect ? '¡Brillante!' : 'No exactamente...'}
                  </h4>
                  <div className="mt-2 prose prose-sm max-w-none text-zinc-600">
                    <Markdown>{question.explanation}</Markdown>
                  </div>
                  
                  <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    onClick={onNext}
                    className={`mt-6 flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-white transition-all hover:shadow-lg ${
                      isCorrect ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {isLast ? 'Ver Resultados' : 'Siguiente Pregunta'}
                    <ArrowRight size={18} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
