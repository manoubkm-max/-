import React from 'react';
import { BookOpen, Sparkles, Trophy, Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  activeTab: 'home' | 'lessons' | 'parser' | 'quiz' | 'chat';
  setActiveTab: (tab: 'home' | 'lessons' | 'parser' | 'quiz' | 'chat') => void;
  xpPoints: number;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  xpPoints,
  soundEnabled,
  setSoundEnabled,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2 text-right text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity"
        >
          <span className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black shadow-sm text-base">
            س
          </span>
          <span className="font-extrabold text-xl text-amber-600">سِرَاجُ النَّحْوِ</span>
        </button>

        {/* Zone 2: 4-5 concise navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('home')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'home'
                ? 'text-amber-600 font-bold border-b-2 border-amber-600'
                : 'hover:text-slate-900'
            }`}
          >
            الرئيسية
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'lessons'
                ? 'text-amber-600 font-bold border-b-2 border-amber-600'
                : 'hover:text-slate-900'
            }`}
          >
            📚 شَرْحُ الدُّرُوسِ
          </button>
          <button
            onClick={() => setActiveTab('parser')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'parser'
                ? 'text-amber-600 font-bold border-b-2 border-amber-600'
                : 'hover:text-slate-900'
            }`}
          >
            📝 الإِعْرَابُ التَّفَاعُلِيُّ
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'quiz'
                ? 'text-amber-600 font-bold border-b-2 border-amber-600'
                : 'hover:text-slate-900'
            }`}
          >
            🧩 التَّحَدِّي وَالاخْتِبَارَاتُ
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              activeTab === 'chat'
                ? 'text-amber-600 font-bold border-b-2 border-amber-600'
                : 'hover:text-slate-900'
            }`}
          >
            💬 حِوَارُ الأُسْتَاذِ سِرَاج
          </button>
        </nav>

        {/* Zone 3: 1 primary action / score cluster */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'كتم الصوت التلقائي' : 'تشغيل الصوت'}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs font-bold whitespace-nowrap shrink-0">
            <Trophy className="w-4 h-4 text-amber-600" />
            <span className="tabular-nums">{xpPoints}</span>
            <span>نقطة</span>
          </div>

          <button
            onClick={() => setActiveTab('quiz')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            تحدي اليوم
          </button>
        </div>
      </div>

      {/* Mobile nav drawer / sub-bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-2 bg-slate-50/90 text-xs font-medium text-slate-700 overflow-x-auto px-2">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'home' ? 'text-amber-600 font-bold' : ''}`}
        >
          الرئيسية
        </button>
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'lessons' ? 'text-amber-600 font-bold' : ''}`}
        >
          الدروس
        </button>
        <button
          onClick={() => setActiveTab('parser')}
          className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'parser' ? 'text-amber-600 font-bold' : ''}`}
        >
          الإعراب
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'quiz' ? 'text-amber-600 font-bold' : ''}`}
        >
          الاختبارات
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-2 py-1 rounded whitespace-nowrap ${activeTab === 'chat' ? 'text-amber-600 font-bold' : ''}`}
        >
          الأستاذ
        </button>
      </div>
    </header>
  );
};
