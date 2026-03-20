export type Personality = {
  id: string;
  name: string;
  description: string;
  voice: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  systemInstruction: string;
  avatarUrl: string;
};

export type Question = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type Player = {
  id: string;
  name: string;
  score: number;
};

export type Difficulty = 'Fácil' | 'Intermedio' | 'Difícil';

export type GameState = 'LOBBY' | 'PLAYER_SETUP' | 'TOPIC_SELECTION' | 'PLAYING' | 'SUMMARY';

export type GameSession = {
  personality: Personality | null;
  topic: string;
  difficulty: Difficulty;
  questionsCount: number;
  questions: Question[];
  currentQuestionIndex: number;
  players: Player[];
  currentPlayerIndex: number;
  history: { questionId: string; userId: string; userAnswer: string; isCorrect: boolean }[];
};
