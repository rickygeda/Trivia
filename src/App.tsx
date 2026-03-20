import { useState, useEffect, useCallback } from 'react';
import { Personality, Question, GameState, GameSession, Player } from './types';
import { PERSONALITIES, TOPICS } from './constants';
import { generateTriviaQuestions } from './services/gemini';
import TopicCard from './components/TopicCard';
import TriviaQuestion from './components/TriviaQuestion';
import GameSummary from './components/GameSummary';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, Trophy, ChevronRight, Loader2, Info, X, Users, UserPlus, UserMinus } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [session, setSession] = useState<GameSession>({
    personality: PERSONALITIES[0],
    topic: '',
    difficulty: 'Intermedio',
    questionsCount: 10,
    questions: [],
    currentQuestionIndex: 0,
    players: [],
    currentPlayerIndex: 0,
    history: [],
  });
  const [loading, setLoading] = useState(false);
  const [hostMessage, setHostMessage] = useState<string>('¡Bienvenido! Prepárate para el desafío. ¿Qué tema quieres explorar hoy?');
  const [playerNames, setPlayerNames] = useState<string[]>(['Jugador 1']);

  const handleTopicSelect = (topic: string) => {
    setSession(prev => ({ ...prev, topic }));
  };

  const handlePlayerCountChange = (count: number) => {
    const newNames = [...playerNames];
    if (count > playerNames.length) {
      for (let i = playerNames.length; i < count; i++) {
        newNames.push(`Jugador ${i + 1}`);
      }
    } else {
      newNames.splice(count);
    }
    setPlayerNames(newNames);
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const startGame = async () => {
    if (!session.personality || !session.topic) return;
    setLoading(true);
    setHostMessage(`Generando ${session.questionsCount} preguntas de nivel ${session.difficulty} sobre ${session.topic}...`);
    
    const questions = await generateTriviaQuestions(session.topic, session.personality, session.questionsCount, session.difficulty);
    
    if (questions.length > 0) {
      const initialPlayers: Player[] = playerNames.map((name, i) => ({
        id: `p${i}`,
        name: name || `Jugador ${i + 1}`,
        score: 0
      }));

      setSession(prev => ({ 
        ...prev, 
        questions, 
        currentQuestionIndex: 0, 
        players: initialPlayers,
        currentPlayerIndex: 0,
        history: [] 
      }));
      setGameState('PLAYING');
    setHostMessage(`¡Comencemos! ${initialPlayers[0].name}, aquí tienes tu primera pregunta.`);
    } else {
      setHostMessage(`Vaya, parece que he extraviado mis tarjetas de trivia. Probemos con otro tema.`);
    }
    setLoading(false);
  };

  const handleAnswer = (answer: string) => {
    const currentQuestion = session.questions[session.currentQuestionIndex];
    const currentPlayer = session.players[session.currentPlayerIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    const updatedPlayers = [...session.players];
    if (isCorrect) {
      updatedPlayers[session.currentPlayerIndex].score += 1;
    }

    setSession(prev => ({
      ...prev,
      players: updatedPlayers,
      history: [...prev.history, { questionId: currentQuestion.id, userId: currentPlayer.id, userAnswer: answer, isCorrect }]
    }));

    if (isCorrect) {
      setHostMessage(`¡Exacto, ${currentPlayer.name}! ${currentQuestion.explanation}`);
    } else {
      setHostMessage(`No exactamente, ${currentPlayer.name}. La respuesta correcta era ${currentQuestion.correctAnswer}. ${currentQuestion.explanation}`);
    }
  };

  const nextQuestion = () => {
    if (session.currentQuestionIndex < session.questions.length - 1) {
      const nextPlayerIndex = (session.currentPlayerIndex + 1) % session.players.length;
      setSession(prev => ({ 
        ...prev, 
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        currentPlayerIndex: nextPlayerIndex
      }));
      setHostMessage(`Turno de ${session.players[nextPlayerIndex].name}. ¿Listo?`);
    } else {
      setGameState('SUMMARY');
      setHostMessage(`¡Y ese es el final del juego! Veamos el ranking final.`);
    }
  };

  const restartGame = () => {
    setSession(prev => ({ ...prev, currentQuestionIndex: 0, currentPlayerIndex: 0, history: [] }));
    setGameState('TOPIC_SELECTION');
    setHostMessage(`¿Listo para otra ronda? ¡Elige un tema!`);
  };

  const goHome = () => {
    setSession({
      personality: PERSONALITIES[0],
      topic: '',
      difficulty: 'Intermedio',
      questionsCount: 10,
      questions: [],
      currentQuestionIndex: 0,
      players: [],
      currentPlayerIndex: 0,
      history: [],
    });
    setGameState('LOBBY');
    setHostMessage(`¡Bienvenido! Elige una configuración para empezar.`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
              <Brain size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-zinc-900">PersonaTrivia <span className="text-indigo-600">AI</span></h1>
          </div>
          
          <div className="flex items-center gap-4">
            {gameState !== 'LOBBY' && (
              <button
                onClick={goHome}
                className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
              >
                <X size={14} />
                <span>Salir</span>
              </button>
            )}
            {gameState === 'PLAYING' && (
              <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-bold text-zinc-600">
                <Sparkles size={14} className="text-indigo-500" />
                <span>Pregunta {session.currentQuestionIndex + 1}/{session.questions.length}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <AnimatePresence mode="wait">
          {gameState === 'LOBBY' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center"
            >
              <div className="relative mb-8">
                <div className="absolute -inset-4 rounded-full bg-indigo-500/20 blur-2xl" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-600 text-white shadow-2xl shadow-indigo-200">
                  <Brain size={48} />
                </div>
              </div>
              <h2 className="text-5xl font-black tracking-tight text-zinc-900 sm:text-6xl">
                La Experiencia <br />
                <span className="text-indigo-600">Trivia IA</span>
              </h2>
              <p className="mt-6 max-w-lg text-lg text-zinc-500 leading-relaxed">
                Ponte a prueba con trivia dinámica generada por IA basada en datos reales y curiosidades.
              </p>
              <button
                onClick={() => setGameState('PLAYER_SETUP')}
                className="group mt-10 flex items-center gap-3 rounded-2xl bg-indigo-600 px-8 py-5 text-lg font-bold text-white shadow-xl shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-2xl active:scale-95"
              >
                Iniciar Nuevo Juego
                <ChevronRight size={24} className="transition-transform group-hover:translate-x-1" />
              </button>
            </motion.div>
          )}

          {gameState === 'PLAYER_SETUP' && (
            <motion.div
              key="player-setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mx-auto max-w-xl space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-black tracking-tight text-zinc-900">Configuración de Partida</h2>
                <p className="mt-2 text-zinc-500">Personaliza tu experiencia de trivia.</p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Jugadores</h3>
                  <div className="flex items-center justify-between rounded-3xl bg-white p-6 shadow-xl shadow-zinc-200/50">
                    <button
                      onClick={() => handlePlayerCountChange(Math.max(1, playerNames.length - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200"
                    >
                      <UserMinus size={20} />
                    </button>
                    <div className="flex flex-col items-center">
                      <span className="text-3xl font-black text-indigo-600">{playerNames.length}</span>
                    </div>
                    <button
                      onClick={() => handlePlayerCountChange(Math.min(6, playerNames.length + 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200"
                    >
                      <UserPlus size={20} />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Dificultad</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {(['Fácil', 'Intermedio', 'Difícil'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setSession(prev => ({ ...prev, difficulty: level }))}
                        className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                          session.difficulty === level
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Preguntas</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {([5, 10, 15, 20] as const).map((count) => (
                      <button
                        key={count}
                        onClick={() => setSession(prev => ({ ...prev, questionsCount: count }))}
                        className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                          session.questionsCount === count
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-white text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Nombres</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {playerNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-zinc-100">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 text-xs font-bold">
                        {i + 1}
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handlePlayerNameChange(i, e.target.value)}
                        placeholder={`Jugador ${i + 1}`}
                        className="w-full bg-transparent text-sm font-bold text-zinc-900 outline-none placeholder:text-zinc-300"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setGameState('TOPIC_SELECTION')}
                  className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-10 py-4 font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-xl active:scale-95"
                >
                  Continuar a Temas
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'TOPIC_SELECTION' && (
            <motion.div
              key="topic"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-black tracking-tight text-zinc-900">Selecciona un Tema</h2>
                <p className="mt-2 text-zinc-500">¿Sobre qué te gustaría que te preguntaran hoy?</p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {TOPICS.map(topic => (
                  <TopicCard
                    key={topic}
                    topic={topic}
                    isSelected={session.topic === topic}
                    onSelect={handleTopicSelect}
                  />
                ))}
              </div>
              <div className="flex flex-col items-center gap-4 pt-4">
                <button
                  disabled={!session.topic || loading}
                  onClick={startGame}
                  className={`flex items-center gap-3 rounded-2xl px-12 py-5 text-lg font-bold text-white transition-all ${
                    session.topic && !loading ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl' : 'bg-zinc-200 cursor-not-allowed'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Generando...
                    </>
                  ) : (
                    <>
                      Iniciar Trivia
                      <Sparkles size={20} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'PLAYING' && session.questions.length > 0 && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-8 lg:grid-cols-3"
            >
              <div className="lg:col-span-2">
                <TriviaQuestion
                  question={session.questions[session.currentQuestionIndex]}
                  personality={session.personality!}
                  player={session.players[session.currentPlayerIndex]}
                  onAnswer={handleAnswer}
                  onNext={nextQuestion}
                  isLast={session.currentQuestionIndex === session.questions.length - 1}
                />
              </div>
              
              <div className="space-y-6">
                <div className="rounded-3xl bg-white p-6 shadow-xl shadow-zinc-200/50">
                  <div className="mb-4 flex items-center gap-2 border-b border-zinc-100 pb-4">
                    <Trophy size={20} className="text-amber-500" />
                    <h3 className="font-black uppercase tracking-wider text-zinc-900">Ranking</h3>
                  </div>
                  <div className="space-y-3">
                    {[...session.players].sort((a, b) => b.score - a.score).map((player, i) => (
                      <div 
                        key={player.id} 
                        className={`flex items-center justify-between rounded-xl p-3 transition-colors ${
                          player.id === session.players[session.currentPlayerIndex].id 
                            ? 'bg-indigo-50 ring-1 ring-indigo-200' 
                            : 'bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold ${
                            i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-zinc-200 text-zinc-500'
                          }`}>
                            {i + 1}
                          </span>
                          <span className="font-bold text-zinc-700">{player.name}</span>
                        </div>
                        <span className="font-black text-indigo-600">{player.score}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-indigo-600 p-6 text-white shadow-xl shadow-indigo-200">
                  <div className="flex items-center gap-3">
                    <Users size={20} />
                    <span className="text-sm font-bold uppercase tracking-widest opacity-80">Turno Actual</span>
                  </div>
                  <p className="mt-2 text-2xl font-black">{session.players[session.currentPlayerIndex].name}</p>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'SUMMARY' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GameSummary
                session={session}
                onRestart={restartGame}
                onHome={goHome}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info */}
      <footer className="mt-auto border-t border-zinc-200 bg-white py-8">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-zinc-400">
            <Info size={14} />
            <p className="text-xs font-medium uppercase tracking-widest">Impulsado por Gemini 2.5 y 3.1</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
