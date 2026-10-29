import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { WelcomeBanner } from './components/WelcomeBanner';
import { LessonsSection } from './components/LessonsSection';
import { ParserSection } from './components/ParserSection';
import { QuizSection } from './components/QuizSection';
import { ChatSection } from './components/ChatSection';
import bannerImg from './assets/images/arabic_grammar_banner_1792063922394.jpg';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'lessons' | 'parser' | 'quiz' | 'chat'>('home');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('fael');
  const [parserSentence, setParserSentence] = useState<string>('');
  const [xpPoints, setXpPoints] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('seraj_arabic_xp');
      return saved ? parseInt(saved, 10) : 50;
    }
    return 50;
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('seraj_arabic_xp', xpPoints.toString());
    }
  }, [xpPoints]);

  const handleRewardXP = (points: number) => {
    setXpPoints((prev) => prev + points);
  };

  const handleOpenLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setActiveTab('lessons');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenParserWithExample = (sentence: string) => {
    setParserSentence(sentence);
    setActiveTab('parser');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        xpPoints={xpPoints}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Tab 1: Home / Welcome */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            <WelcomeBanner
              onSelectAction={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onQuickLesson={handleOpenLesson}
            />

            {/* Visual Classroom Banner Card */}
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-xs h-48 sm:h-64 bg-slate-900">
              <img
                src={bannerImg}
                alt="تعلم النحو العربي برحابة وإتقان"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-85"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white space-y-2">
                <span className="text-xs font-bold text-amber-400 tracking-wider">
                  مَرْحَلَةُ التَّعْلِيمِ الْمُتَوَسِّطِ (11-15 سَنَة)
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold leading-snug">
                  «لُغَتُنَا الْجَمِيلَةُ.. فَهْمٌ قَبْلَ الْحِفْظِ، وَإِبْدَاعٌ فِي كُلِّ إِعْرَابٍ»
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-2xl">
                  صُمم هذا التطبيق التفاعلي خصيصاً لمساعدتك على التفوق في مادة اللغة العربية وقواعد النحو بأسلوب عصري محفز.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Lessons Explanation */}
        {activeTab === 'lessons' && (
          <LessonsSection
            selectedLessonId={selectedLessonId}
            onRewardXP={handleRewardXP}
            onOpenParserWithExample={handleOpenParserWithExample}
          />
        )}

        {/* Tab 3: Interactive Parsing */}
        {activeTab === 'parser' && (
          <ParserSection
            initialSentence={parserSentence}
            onRewardXP={handleRewardXP}
          />
        )}

        {/* Tab 4: Quizzes & Challenges */}
        {activeTab === 'quiz' && (
          <QuizSection
            onRewardXP={handleRewardXP}
            onOpenLesson={handleOpenLesson}
          />
        )}

        {/* Tab 5: Direct Interactive Chat with Tutor Seraj */}
        {activeTab === 'chat' && (
          <ChatSection
            onSelectAction={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRewardXP={handleRewardXP}
          />
        )}
      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-amber-500 text-white font-black text-xs flex items-center justify-center">
              س
            </span>
            <span className="font-bold text-slate-800">سِرَاجُ النَّحْوِ</span>
            <span>—</span>
            <span>معلم النحو التفاعلي لتلاميذ التعليم المتوسط</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setActiveTab('lessons');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors"
            >
              شرح الدروس
            </button>
            <button
              onClick={() => {
                setActiveTab('parser');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors"
            >
              إعراب الجمل
            </button>
            <button
              onClick={() => {
                setActiveTab('quiz');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors"
            >
              التحديات
            </button>
            <button
              onClick={() => {
                setActiveTab('chat');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors"
            >
              الأستاذ سراج
            </button>
          </div>

          <div>
            <span>جميع الحقوق محفوظة © {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
