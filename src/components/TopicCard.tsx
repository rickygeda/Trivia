import { motion } from 'motion/react';
import { BookOpen, Brain, Globe, Music, Sparkles, Trophy, Cpu, Utensils } from 'lucide-react';

const TOPIC_ICONS: Record<string, any> = {
  'General Knowledge': Brain,
  'Science & Nature': Sparkles,
  'History & Geography': Globe,
  'Pop Culture & Movies': Music,
  'Sports & Games': Trophy,
  'Art & Literature': BookOpen,
  'Technology & Future': Cpu,
  'Food & Drink': Utensils,
};

interface Props {
  topic: string;
  isSelected: boolean;
  onSelect: (topic: string) => void;
}

export default function TopicCard({ topic, isSelected, onSelect }: Props) {
  const Icon = TOPIC_ICONS[topic] || Brain;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(topic)}
      className={`group relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-6 text-center transition-all duration-300 ${
        isSelected 
          ? 'border-indigo-500 bg-indigo-50/50 shadow-lg ring-4 ring-indigo-500/10' 
          : 'border-zinc-100 bg-white hover:border-indigo-200 hover:shadow-xl'
      }`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl transition-colors duration-300 ${
        isSelected ? 'bg-indigo-500 text-white' : 'bg-zinc-50 text-zinc-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
      }`}>
        <Icon size={24} />
      </div>
      
      <span className={`text-sm font-bold tracking-tight transition-colors duration-300 ${
        isSelected ? 'text-indigo-900' : 'text-zinc-700 group-hover:text-indigo-900'
      }`}>
        {topic}
      </span>
      
      {isSelected && (
        <motion.div 
          layoutId="topic-active"
          className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-indigo-500"
        />
      )}
    </motion.div>
  );
}
