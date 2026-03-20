import { GameSession } from '../types';
import { motion } from 'motion/react';
import { Trophy, RotateCcw, Home, CheckCircle2, XCircle, Users, Medal } from 'lucide-react';

interface Props {
  session: GameSession;
  onRestart: () => void;
  onHome: () => void;
}

export default function GameSummary({ session, onRestart, onHome }: Props) {
  const sortedPlayers = [...session.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  
  return (
    <div className="mx-auto max-w-2xl space-y-8 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl bg-indigo-600 p-8 text-center text-white shadow-2xl"
      >
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-indigo-400/20 blur-3xl" />
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative z-10"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
            <Trophy size={40} className="text-yellow-400" />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight">¡Juego Terminado!</h2>
          <p className="mt-2 text-indigo-100 opacity-80">
            {session.players.length > 1 
              ? `¡Felicidades a ${winner.name} por la victoria!` 
              : `Has completado el cuestionario de ${session.topic}.`}
          </p>
          
          <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
              <Medal size={14} />
              <span>Ranking Final</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {sortedPlayers.map((player, i) => (
                <div 
                  key={player.id} 
                  className={`flex items-center justify-between rounded-2xl p-4 backdrop-blur-md ${
                    i === 0 ? 'bg-white/20 ring-1 ring-white/30' : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black ${
                      i === 0 ? 'bg-amber-400 text-amber-900' : 'bg-white/10 text-white'
                    }`}>
                      {i + 1}
                    </span>
                    <span className="text-lg font-bold">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black">{player.score}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-zinc-400" />
          <h3 className="text-lg font-bold text-zinc-900">Revisión de Preguntas</h3>
        </div>
        <div className="space-y-3">
          {session.history.map((item, idx) => {
            const question = session.questions.find(q => q.id === item.questionId);
            const player = session.players.find(p => p.id === item.userId);
            if (!question || !player) return null;
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="flex items-start gap-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm"
              >
                <div className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${item.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                  {item.isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      {player.name}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-zinc-900">{question.text}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-zinc-100 px-2 py-1 text-zinc-500">
                      Respuesta: <span className={item.isCorrect ? 'font-bold text-emerald-600' : 'font-bold text-rose-600'}>{item.userAnswer}</span>
                    </span>
                    {!item.isCorrect && (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 font-bold text-emerald-600">
                        Correcta: {question.correctAnswer}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onRestart}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-indigo-600 py-4 font-bold text-white transition-all hover:bg-indigo-700 hover:shadow-lg active:scale-95"
        >
          <RotateCcw size={20} />
          Jugar de Nuevo
        </button>
        <button
          onClick={onHome}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-zinc-200 bg-white py-4 font-bold text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 active:scale-95"
        >
          <Home size={20} />
          Volver al Inicio
        </button>
      </div>
    </div>
  );
}
