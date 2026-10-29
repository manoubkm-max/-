import React, { useState } from 'react';
import { CURRICULUM_LESSONS, Lesson } from '../data/curriculum';
import { BookOpen, Sparkles, CheckCircle2, HelpCircle, Volume2, Search, ArrowRight, Star, RefreshCw } from 'lucide-react';
import { speakArabic } from '../utils/speech';

interface LessonsSectionProps {
  selectedLessonId?: string;
  onRewardXP: (points: number) => void;
  onOpenParserWithExample: (sentence: string) => void;
}

export const LessonsSection: React.FC<LessonsSectionProps> = ({
  selectedLessonId,
  onRewardXP,
  onOpenParserWithExample,
}) => {
  const [activeLesson, setActiveLesson] = useState<Lesson>(() => {
    if (selectedLessonId) {
      const found = CURRICULUM_LESSONS.find((l) => l.id === selectedLessonId);
      if (found) return found;
    }
    return CURRICULUM_LESSONS[0];
  });

  const [categoryFilter, setCategoryFilter] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [loadingCustom, setLoadingCustom] = useState<boolean>(false);
  const [customError, setCustomError] = useState<string | null>(null);

  // Quick check quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmittedQuiz, setHasSubmittedQuiz] = useState<boolean>(false);
  const [quizScoreAwarded, setQuizScoreAwarded] = useState<boolean>(false);

  // Filter lessons
  const filteredLessons = CURRICULUM_LESSONS.filter((lesson) => {
    const matchesCategory = categoryFilter === 'الكل' || lesson.category === categoryFilter;
    const matchesSearch =
      lesson.title.includes(searchQuery) ||
      lesson.shortRule.includes(searchQuery) ||
      lesson.grade.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleSelectLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setSelectedOption(null);
    setHasSubmittedQuiz(false);
    setQuizScoreAwarded(false);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleCheckQuiz = () => {
    if (selectedOption === null) return;
    setHasSubmittedQuiz(true);
    if (selectedOption === activeLesson.quickQuiz.correctIndex && !quizScoreAwarded) {
      onRewardXP(15);
      setQuizScoreAwarded(true);
    }
  };

  // Ask AI for custom lesson explanation
  const handleGenerateCustomLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim()) return;

    setLoadingCustom(true);
    setCustomError(null);

    try {
      const res = await fetch('/api/grammar/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: customTopic.trim() }),
      });

      if (!res.ok) {
        throw new Error('تعذر إعداد الدرس حالياً');
      }

      const data = await res.json();
      const customLessonObj: Lesson = {
        id: 'custom-' + Date.now(),
        title: data.title || customTopic,
        grade: 'شرح مخصص بالذكاء الاصطناعي',
        category: 'أساسيات',
        shortRule: data.shortRule || '',
        stepByStepExample: {
          sentence: data.stepByStepExample?.sentence || '',
          explanation: data.stepByStepExample?.explanation || '',
          breakdown: [
            {
              part: data.stepByStepExample?.sentence || '',
              role: 'تطبيق القاعدة',
              detail: data.stepByStepExample?.explanation || '',
            },
          ],
        },
        summaryTable: data.summaryTable || [],
        goldenNote: data.goldenNote || '',
        quickQuiz: data.quickQuiz || {
          question: 'هل فهمت هذه القاعدة يا بطل؟',
          options: ['نعم، القاعدة واضحة وسهلة جداً!', 'أحتاج لإعادة قراءتها بتأنٍ'],
          correctIndex: 0,
          explanation: 'رائع يا بطل! واصل التعلم.',
        },
      };

      setActiveLesson(customLessonObj);
      setSelectedOption(null);
      setHasSubmittedQuiz(false);
      setQuizScoreAwarded(false);
      setCustomTopic('');
    } catch (err: any) {
      setCustomError('حدث خطأ أثناء إعداد الشرح، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoadingCustom(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search & Custom Explainer Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              <span>مَوْسُوعَةُ دُرُوسِ النَّحْوِ لِلْمَرْحَلَةِ الْمُتَوَسِّطَةِ</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              اختر درساً مقرراً أو اكتب أي قاعدة تريد من الأستاذ سراج شرحها لك فوراً!
            </p>
          </div>

          {/* Ask AI for custom rule */}
          <form onSubmit={handleGenerateCustomLesson} className="w-full sm:w-auto flex items-center gap-2">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="اطلب شرح أي درس (مثال: المفعول المطلق)..."
              className="text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-64"
            />
            <button
              type="submit"
              disabled={loadingCustom || !customTopic.trim()}
              className="px-3.5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              {loadingCustom ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>جارٍ الشرح...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>اشرح لي</span>
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

        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 shrink-0">التصنيف:</span>
          {['الكل', 'مرفوعات', 'منصوبات', 'مجرورات', 'أفعال', 'توابع'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap font-medium ${
                categoryFilter === cat
                  ? 'bg-amber-600 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Zone Display: List on Right / Active Lesson Card on Left (RTL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side (Large): The Active Lesson Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Header of Lesson */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold mb-1.5">
                  <span>{activeLesson.grade}</span>
                  <span aria-hidden="true">·</span>
                  <span>قسم: {activeLesson.category}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {activeLesson.title}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakArabic(activeLesson.shortRule + ' ' + activeLesson.goldenNote)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  title="استمع إلى الشرح الصوتي"
                >
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>استمع للدرس</span>
                </button>
              </div>
            </div>

            {/* Part 1: The Rule in short, clear lines */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span>الْقَاعِدَةُ النَّحْوِيَّةُ الْمُبَسَّطَةُ:</span>
              </h3>
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 text-slate-800 text-sm sm:text-base leading-relaxed font-medium">
                {activeLesson.shortRule}
              </div>
            </div>

            {/* Part 2: Step-by-step everyday example */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <span>مِثَالٌ تَطْبِيقِيٌّ مِنْ وَاقِعِنَا (خُطْوَةً بِخُطْوَةٍ):</span>
              </h3>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="text-base sm:text-lg font-bold text-blue-900 bg-white border border-blue-100 rounded-lg p-3 text-center">
                  « {activeLesson.stepByStepExample.sentence} »
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {activeLesson.stepByStepExample.explanation}
                </p>

                {/* Breakdown list */}
                {activeLesson.stepByStepExample.breakdown && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/70">
                    {activeLesson.stepByStepExample.breakdown.map((item, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-100 text-xs">
                        <div className="font-bold text-slate-900">{item.part}</div>
                        <div className="text-amber-700 font-semibold">{item.role}</div>
                        <div className="text-slate-500 mt-0.5">{item.detail}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => onOpenParserWithExample(activeLesson.stepByStepExample.sentence)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline"
                  >
                    <span>افتح هذه الجملة في الإعراب التفاعلي المفصل 🔍</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Part 3: Summary Table */}
            {activeLesson.summaryTable && activeLesson.summaryTable.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>جَدْوَلُ الْخُلَاصَةِ وَالتَّمْيِيزِ:</span>
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">العنصر / الحالة</th>
                        <th className="py-2.5 px-3">العلامة أو الحكم النحوي</th>
                        <th className="py-2.5 px-3">مثال توضيحي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {activeLesson.summaryTable.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{row.concept}</td>
                          <td className="py-2.5 px-3">{row.sign}</td>
                          <td className="py-2.5 px-3 font-medium text-amber-700">{row.example}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Part 4: The Golden Note (الملاحظة الذهبية) */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>الْمُلَاحَظَةُ الذَّهَبِيَّةُ (سِرُّ التَّفَوُّقِ فِي الامْتِحَانِ):</span>
              </h3>
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl p-4 text-amber-950 text-xs sm:text-sm font-medium leading-relaxed">
                ✨ {activeLesson.goldenNote}
              </div>
            </div>

            {/* Part 5: Instant Quick Check Quiz */}
            {activeLesson.quickQuiz && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>تَحَقَّقْ مِنْ فَهْمِكَ الْفَوْرِيِّ (اكْسِبْ +15 نُقْطَةً):</span>
                  </h4>
                  {quizScoreAwarded && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      +15 نقطة مضافة لحسابك! 🏆
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    {activeLesson.quickQuiz.question}
                  </p>

                  <div className="space-y-2">
                    {activeLesson.quickQuiz.options.map((opt, idx) => {
                      const isSelected = selectedOption === idx;
                      const isCorrect = idx === activeLesson.quickQuiz.correctIndex;
                      let optionClasses = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100';

                      if (hasSubmittedQuiz) {
                        if (isCorrect) {
                          optionClasses = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                        } else if (isSelected) {
                          optionClasses = 'bg-rose-50 border-rose-300 text-rose-900';
                        }
                      } else if (isSelected) {
                        optionClasses = 'bg-amber-50 border-amber-500 text-amber-900 font-semibold';
                      }

                      return (
                        <button
                          key={idx}
                          disabled={hasSubmittedQuiz}
                          onClick={() => setSelectedOption(idx)}
                          className={`w-full text-right p-3 rounded-lg border text-xs sm:text-sm transition-all flex items-center justify-between ${optionClasses}`}
                        >
                          <span>{opt}</span>
                          {hasSubmittedQuiz && isCorrect && (
                            <span className="text-xs font-bold text-emerald-700">✓ إجابة صحيحة</span>
                          )}
                          {hasSubmittedQuiz && isSelected && !isCorrect && (
                            <span className="text-xs font-bold text-rose-600">✕ حاول مجدداً</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {!hasSubmittedQuiz ? (
                    <button
                      onClick={handleCheckQuiz}
                      disabled={selectedOption === null}
                      className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      تحقق من إجابتي الآن
                    </button>
                  ) : (
                    <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <div className="font-bold">
                        {selectedOption === activeLesson.quickQuiz.correctIndex
                          ? '🌟 أحسنت يا بطل! إجابة دقيقة وصحيحة 100%'
                          : '💡 محاولة ممتازة! انتبه للشرح التالي لتثبيت الفكرة:'}
                      </div>
                      <p>{activeLesson.quickQuiz.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Lessons Index Directory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 sticky top-20">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                فِهْرِسُ دُرُوسِ الْمُتَوَسِّطِ ({filteredLessons.length}):
              </h3>
              <span className="text-xs text-slate-400">منهاج معتمد</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن درس بالاسم..."
                className="w-full text-xs pr-9 pl-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredLessons.map((lesson) => {
                const isActive = lesson.id === activeLesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                    className={`w-full text-right p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                      isActive
                        ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                        : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isActive ? 'text-amber-900' : 'text-slate-800'}`}>
                        {lesson.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {lesson.grade.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 line-clamp-1">
                      {lesson.shortRule}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
