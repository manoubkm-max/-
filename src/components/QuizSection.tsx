import React, { useState } from 'react';
import { QUIZ_BANK, QuizQuestion } from '../data/quizBank';
import { HelpCircle, CheckCircle2, XCircle, Sparkles, RefreshCw, Trophy, Lightbulb, ArrowLeft, ArrowRight, Star } from 'lucide-react';
import { speakArabic } from '../utils/speech';

interface QuizSectionProps {
  onRewardXP: (points: number) => void;
  onOpenLesson: (lessonId: string) => void;
}

export const QuizSection: React.FC<QuizSectionProps> = ({
  onRewardXP,
  onOpenLesson,
}) => {
  const [levelFilter, setLevelFilter] = useState<'الكل' | 'مبتدئ' | 'متوسط' | 'بطل النحو'>('الكل');
  const [currentQuestions, setCurrentQuestions] = useState<QuizQuestion[]>(QUIZ_BANK);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Answering states
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [userScore, setUserScore] = useState<number>(0);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<string>>(new Set());

  // AI Quiz generation state
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  const [aiTopic, setAiTopic] = useState<string>('');
  const [customError, setCustomError] = useState<string | null>(null);

  const activeQuestions = currentQuestions.filter((q) => {
    if (levelFilter === 'الكل') return true;
    return q.level === levelFilter;
  });

  const question = activeQuestions[currentIndex] || activeQuestions[0] || QUIZ_BANK[0];

  const handleSelectOption = (idx: number) => {
    if (hasCheckedAnswer) return;
    setSelectedOptionIndex(idx);
  };

  const handleCheckAnswer = () => {
    if (selectedOptionIndex === null) return;
    setHasCheckedAnswer(true);

    const isCorrect = selectedOptionIndex === question.correctIndex;
    if (isCorrect && !answeredQuestionIds.has(question.id)) {
      setUserScore((prev) => prev + 1);
      setAnsweredQuestionIds((prev) => new Set(prev).add(question.id));
      onRewardXP(20);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOptionIndex(null);
    setHasCheckedAnswer(false);
    setShowHint(false);
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrevQuestion = () => {
    setSelectedOptionIndex(null);
    setHasCheckedAnswer(false);
    setShowHint(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleGenerateAiQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setAiGenerating(true);
    setCustomError(null);

    try {
      const res = await fetch('/api/grammar/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic || 'قواعد النحو العربي للمرحلة المتوسطة',
          difficulty: levelFilter === 'الكل' ? 'متوسط' : levelFilter,
        }),
      });

      if (!res.ok) {
        throw new Error('فشل إنشاء الأسئلة');
      }

      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        const formatted: QuizQuestion[] = data.questions.map((q: any, i: number) => ({
          id: 'ai-q-' + Date.now() + '-' + i,
          topic: data.topic || aiTopic || 'نحو عام',
          level: 'متوسط',
          type: 'mcq',
          question: q.question,
          contextSentence: q.contextSentence || '',
          options: q.options || [],
          correctIndex: q.correctIndex ?? 0,
          hint: q.hint || 'تذكر القاعدة الأساسية في هذا الباب.',
          explanation: q.explanation || 'إجابة ممتازة.',
        }));

        setCurrentQuestions(formatted);
        setCurrentIndex(0);
        setSelectedOptionIndex(null);
        setHasCheckedAnswer(false);
        setShowHint(false);
        setAiTopic('');
      }
    } catch (err: any) {
      setCustomError('تعذر توليد أسئلة جديدة حالياً، يمكنك التدرب على بنك الأسئلة المتوفر.');
    } finally {
      setAiGenerating(false);
    }
  };

  const isCurrentCorrect = hasCheckedAnswer && selectedOptionIndex === question.correctIndex;

  return (
    <div className="space-y-8">
      {/* Top Banner / Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <span>مَيْدَانُ التَّحَدِّي وَاخْتِبَارَاتِ النَّحْوِ التَّفَاعُلِيَّةِ</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              حل بنفسك أولاً، وسنصحح لك فوراً ونكافئك بنقاط الأبطال!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>نتيجتك في الجولة:</span>
              <span className="tabular-nums font-black text-amber-700">{userScore}</span>
              <span>/</span>
              <span className="tabular-nums">{activeQuestions.length}</span>
            </div>
          </div>
        </div>

        {/* Level Filters & AI Quiz Form */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 shrink-0">المستوى:</span>
            {(['الكل', 'مبتدئ', 'متوسط', 'بطل النحو'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  setLevelFilter(lvl);
                  setCurrentIndex(0);
                  setSelectedOptionIndex(null);
                  setHasCheckedAnswer(false);
                  setShowHint(false);
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
                  levelFilter === lvl
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* AI Generator Button */}
          <form onSubmit={handleGenerateAiQuiz} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="اطلب أسئلة لموضوع معين (مثال: إن وأخواتها)..."
              className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 w-full md:w-60"
            />
            <button
              type="submit"
              disabled={aiGenerating}
              className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-xs"
            >
              {aiGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>توليد...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>تحدٍّ جديد ✨</span>
                </>
              )}
            </button>
          </form>
        </div>

        {customError && (
          <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {customError}
          </div>
        )}
      </div>

      {/* Main Question Card */}
      {question && (
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* Question Header & Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                السؤال {currentIndex + 1} من {activeQuestions.length}
              </span>
              <span className="text-amber-700 font-semibold">{question.topic}</span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-500">{question.level}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => speakArabic(question.question + (question.contextSentence ? ' ' + question.contextSentence : ''))}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                title="استمع إلى السؤال"
              >
                <HelpCircle className="w-4 h-4 text-amber-600" />
              </button>

              <button
                onClick={() => setShowHint(!showHint)}
                className="px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>تلميح ذكي</span>
              </button>
            </div>
          </div>

          {/* Hint callout */}
          {showHint && (
            <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-3 text-xs text-amber-900 font-medium flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>تلميح الأستاذ سراج: {question.hint}</span>
            </div>
          )}

          {/* Question Text */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {question.question}
            </h3>

            {question.contextSentence && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-base sm:text-xl font-extrabold text-blue-900 text-center tracking-wide">
                « {question.contextSentence} »
              </div>
            )}
          </div>

          {/* Options List */}
          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-500">
              {!hasCheckedAnswer
                ? 'اختر إجابتك أولاً ثم انقر زر «تحقق من إجابتي»:'
                : 'نتيجة التحقق وتصحيح السؤال:'}
            </div>

            <div className="space-y-2.5">
              {question.options.map((optionText, idx) => {
                const isSelected = selectedOptionIndex === idx;
                const isCorrect = idx === question.correctIndex;

                let cardStyle = 'bg-white border-slate-200 hover:border-amber-400 hover:bg-slate-50/60 text-slate-800';

                if (hasCheckedAnswer) {
                  if (isCorrect) {
                    cardStyle = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold';
                  } else if (isSelected) {
                    cardStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-medium';
                  } else {
                    cardStyle = 'bg-white border-slate-200 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  cardStyle = 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-xs';
                }

                return (
                  <button
                    key={idx}
                    disabled={hasCheckedAnswer}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-right p-3.5 sm:p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 text-xs sm:text-sm ${cardStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{optionText}</span>
                    </div>

                    {hasCheckedAnswer && isCorrect && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>صحيح</span>
                      </span>
                    )}

                    {hasCheckedAnswer && isSelected && !isCorrect && (
                      <span className="flex items-center gap-1 text-xs font-bold text-rose-700 shrink-0">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>خاطئ</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button: Check or Next */}
          <div className="pt-2">
            {!hasCheckedAnswer ? (
              <button
                onClick={handleCheckAnswer}
                disabled={selectedOptionIndex === null}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-extrabold text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>تَحَقَّقْ مِنْ إِجَابَتِي الآنَ</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <div className="space-y-4">
                {/* Immediate Feedback Box adhering to prompt persona */}
                <div
                  className={`p-5 rounded-xl border-2 space-y-2 ${
                    isCurrentCorrect
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                      : 'bg-amber-50/80 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {isCurrentCorrect ? (
                      <>
                        <Sparkles className="w-5 h-5 text-emerald-600" />
                        <span>أَحْسَنْتَ يَا بَطَلَ النَّحْوِ! إِجَابَةٌ رَائِعَةٌ وَذَكِيَّةٌ (+20 نقطة) 🏆</span>
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-5 h-5 text-amber-600" />
                        <span>مُحَاوَلَةٌ مُمْتَازَةٌ، اقْتَرَبْتَ جِدّاً مِنَ الإِجَابَةِ الصَّحِيحَةِ! 🌟</span>
                      </>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm leading-relaxed font-medium">
                    {question.explanation}
                  </p>

                  {question.ruleLessonId && (
                    <div className="pt-2">
                      <button
                        onClick={() => onOpenLesson(question.ruleLessonId!)}
                        className="text-xs font-bold text-amber-800 hover:underline inline-flex items-center gap-1"
                      >
                        <span>مراجعة الدرس الكامل لهذه القاعدة 📚</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Next / Previous Controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentIndex === 0}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>

                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-2 shadow-xs"
                  >
                    <span>
                      {currentIndex < activeQuestions.length - 1 ? 'السؤال التالي' : 'إعادة التحدي من البداية'}
                    </span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
