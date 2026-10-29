import React, { useState } from 'react';
import { SAMPLE_SENTENCES, SampleSentence, ParsedWord } from '../data/sampleSentences';
import { Sparkles, Edit3, CheckCircle2, HelpCircle, Volume2, Copy, Check, RefreshCw, Star, BookOpen } from 'lucide-react';
import { speakArabic } from '../utils/speech';

interface ParserSectionProps {
  initialSentence?: string;
  onRewardXP: (points: number) => void;
}

export const ParserSection: React.FC<ParserSectionProps> = ({
  initialSentence = '',
  onRewardXP,
}) => {
  const [inputText, setInputText] = useState<string>(
    initialSentence || SAMPLE_SENTENCES[0].text
  );
  const [activeSentenceData, setActiveSentenceData] = useState<SampleSentence>(
    SAMPLE_SENTENCES[0]
  );
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Self-testing mode for a word
  const [testMode, setTestMode] = useState<boolean>(false);
  const [userGuessPosition, setUserGuessPosition] = useState<string>('');
  const [testFeedback, setTestFeedback] = useState<string | null>(null);

  // Arabic Diacritics (تشكيل) helpers
  const tashkeelList = [
    { label: 'فَتْحَة', char: '\u064E' },
    { label: 'ضَمَّة', char: '\u064F' },
    { label: 'كَسْرَة', char: '\u0650' },
    { label: 'سُكُون', char: '\u0652' },
    { label: 'تَنْوِين فَتْح', char: '\u064B' },
    { label: 'تَنْوِين ضَمّ', char: '\u064C' },
    { label: 'تَنْوِين كَسْر', char: '\u064D' },
    { label: 'شَدَّة', char: '\u0651' },
  ];

  const addTashkeel = (char: string) => {
    setInputText((prev) => prev + char);
  };

  const handleParse = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    // Check if it matches a pre-parsed sample
    const sampleMatch = SAMPLE_SENTENCES.find(
      (s) => s.text === trimmed || s.text.replace(/[\u064B-\u0652]/g, '') === trimmed.replace(/[\u064B-\u0652]/g, '')
    );

    if (sampleMatch) {
      setActiveSentenceData(sampleMatch);
      setSelectedWordIndex(0);
      setTestMode(false);
      setTestFeedback(null);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/grammar/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: trimmed }),
      });

      if (!response.ok) {
        throw new Error('تعذر إعراب الجملة حالياً.');
      }

      const data = await response.json();
      const customSentence: SampleSentence = {
        id: 'parsed-' + Date.now(),
        text: data.sentence || trimmed,
        category: 'إعراب مخصص',
        difficulty: 'متوسط',
        sentenceType: data.sentenceType || 'جملة فعلية',
        summary: data.summary || 'تم إعراب الجملة بواسطة الأستاذ سراج.',
        goldenRule: data.goldenRule || 'دائماً انتبه لحركة الحرف الأخير في الكلمة لتحديد علامة الإعراب.',
        words: (data.words || []).map((w: any) => ({
          word: w.word,
          type: w.type || 'اسم',
          position: w.position || 'معرب',
          status: w.status || 'مرفوع',
          mark: w.mark || 'الضمة الظاهرة',
          fullParsing: w.fullParsing || '',
          whyReason: w.whyReason || 'وفقاً لموقعها في الجملة.',
        })),
      };

      setActiveSentenceData(customSentence);
      setSelectedWordIndex(0);
      setTestMode(false);
      setTestFeedback(null);
      onRewardXP(10); // Reward student for parsing a new sentence
    } catch (err: any) {
      // Fallback: build a quick reasonable breakdown or show friendly guidance
      setErrorMsg('واجهنا صعوبة مؤقتة في معالجة الجملة، يمكنك تجربة إحدى الجمل النموذجية أدناه.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: SampleSentence) => {
    setInputText(sample.text);
    setActiveSentenceData(sample);
    setSelectedWordIndex(0);
    setTestMode(false);
    setTestFeedback(null);
  };

  const handleCopyParsing = () => {
    const fullText = activeSentenceData.words
      .map((w) => `• ${w.word}: ${w.fullParsing} (السبب: ${w.whyReason})`)
      .join('\n');
    const output = `إعراب جملة: «${activeSentenceData.text}»\nنوع الجملة: ${activeSentenceData.sentenceType}\n\n${fullText}\n\nسِرّ إعرابي: ${activeSentenceData.goldenRule}`;

    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentWord = activeSentenceData.words[selectedWordIndex] || activeSentenceData.words[0];

  const handleCheckSelfTest = (chosenPosition: string) => {
    setUserGuessPosition(chosenPosition);
    if (!currentWord) return;

    if (currentWord.position.includes(chosenPosition) || currentWord.fullParsing.includes(chosenPosition)) {
      setTestFeedback('🌟 أحسنت يا بطل! إجابة عبقرية، لقد حددت الموقع الإعرابي الصحيح!');
      onRewardXP(10);
    } else {
      setTestFeedback(`💡 محاولة جيدة! في الحقيقة، موقع الكلمة هو (${currentWord.position}) لأنها: ${currentWord.whyReason}`);
    }
  };

  // Helper colors for word types
  const getTypeBadgeStyle = (type: string) => {
    if (type.includes('فعل')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (type.includes('اسم')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (type.includes('حرف')) return 'bg-purple-50 text-purple-700 border-purple-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const getStatusBadgeStyle = (status: string) => {
    if (status.includes('مرفوع')) return 'bg-emerald-100 text-emerald-800';
    if (status.includes('منصوب')) return 'bg-sky-100 text-sky-800';
    if (status.includes('مجرور')) return 'bg-amber-100 text-amber-800';
    if (status.includes('مجزوم')) return 'bg-rose-100 text-rose-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-8">
      {/* Input Box & Parsing Controller */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-amber-600" />
            <span>مُعْرِبُ الْجُمَلِ التَّفَاعُلِيُّ لِطُلَّابِ الْمُتَوَسِّطِ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            أدخل أي جملة تريد إعرابها، أو اختر من الجمل المقترحة، واكتشف إعراب كل كلمة وسر إعرابها!
          </p>
        </div>

        <form onSubmit={handleParse} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="اكتب جملتك هنا مع التشكيل أو بدونه (مثال: حَفِظَ الطَّالِبُ الْقَصِيدَةَ)..."
              className="w-full text-base sm:text-lg font-bold text-slate-900 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 pr-4 pl-28 bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="absolute left-2 top-2 bottom-2 px-5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جارٍ الإعراب...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>أَعْرِبِ الْجُمْلَةَ</span>
                </>
              )}
            </button>
          </div>

          {/* Tashkeel helper row */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-slate-400 text-[11px] shrink-0">أدوات التشكيل السريع:</span>
            {tashkeelList.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => addTashkeel(t.char)}
                title={t.label}
                className="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 text-sm font-bold rounded-md border border-slate-200 transition-colors"
              >
                {t.char}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setInputText('')}
              className="mr-auto text-[11px] text-slate-400 hover:text-rose-600 underline"
            >
              مسح النص
            </button>
          </div>
        </form>

        {errorMsg && (
          <div className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {errorMsg}
          </div>
        )}

        {/* Curated Sample Sentences Strip */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-xs font-semibold text-slate-600">
            أو جرب إعراب إحدى الجمل النموذجية المختارة:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_SENTENCES.map((sample) => (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all text-right ${
                  inputText === sample.text
                    ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                « {sample.text} »
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Sentence Visualizer & Parsing Board */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Sentence Summary Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold mb-1">
              <span>{activeSentenceData.sentenceType}</span>
              <span aria-hidden="true">·</span>
              <span>{activeSentenceData.words.length} كلمات</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              {activeSentenceData.summary}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => speakArabic(activeSentenceData.text)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="استمع لنطق الجملة"
            >
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span>استمع للجملة</span>
            </button>

            <button
              onClick={handleCopyParsing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="نسخ الإعراب الكامل"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>نسخ الإعراب</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Word Chips Row - Colored and Interactive */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700">
            انقر على أي كلمة لعرض إعرابها التفصيلي وسبب إعرابها:
          </div>

          <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50/70 border border-slate-200 rounded-xl justify-center sm:justify-start">
            {activeSentenceData.words.map((w, index) => {
              const isSelected = selectedWordIndex === index;
              return (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedWordIndex(index);
                    setTestMode(false);
                    setTestFeedback(null);
                  }}
                  className={`group relative p-3 sm:p-4 rounded-xl text-center border-2 transition-all flex flex-col items-center gap-1 min-w-[100px] ${
                    isSelected
                      ? 'bg-amber-50 border-amber-500 shadow-md scale-105'
                      : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-xs'
                  }`}
                >
                  <span className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-amber-800">
                    {w.word}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getTypeBadgeStyle(w.type)}`}>
                      {w.type}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${getStatusBadgeStyle(w.status)}`}>
                      {w.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium truncate max-w-[90px]">
                    {w.position}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Deep Dive Card for Selected Word */}
        {currentWord && (
          <div className="bg-gradient-to-br from-amber-50/40 via-white to-slate-50 border-2 border-amber-300/80 rounded-2xl p-6 sm:p-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200/60">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-amber-800 bg-white px-4 py-2 rounded-xl border border-amber-300 shadow-xs">
                  « {currentWord.word} »
                </span>
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className={`px-2.5 py-0.5 rounded-full border ${getTypeBadgeStyle(currentWord.type)}`}>
                      نوع الكلمة: {currentWord.type}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full ${getStatusBadgeStyle(currentWord.status)}`}>
                      الحالة: {currentWord.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    علامة الإعراب: <span className="font-bold text-slate-800">{currentWord.mark}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => speakArabic(currentWord.word + ': ' + currentWord.fullParsing)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  <span>نطق الإعراب</span>
                </button>

                <button
                  onClick={() => {
                    setTestMode(!testMode);
                    setTestFeedback(null);
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>{testMode ? 'إلغاء الاختبار' : 'اختبر نفسك في هذه الكلمة!'}</span>
                </button>
              </div>
            </div>

            {/* Test yourself interactive drawer */}
            {testMode && (
              <div className="bg-amber-100/60 border border-amber-300 rounded-xl p-4 space-y-3">
                <div className="text-xs font-bold text-amber-900">
                  🎯 ما هو الموقع الإعرابي لكلمة ({currentWord.word}) حسب فهمك؟
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['فاعل', 'مفعول به', 'مبتدأ', 'خبر', 'اسم مجرور', 'نعت', 'حال', 'مضاف إليه'].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => handleCheckSelfTest(pos)}
                      className="p-2 text-xs font-bold bg-white hover:bg-amber-50 border border-amber-200 rounded-lg text-slate-800 hover:text-amber-800 transition-colors"
                    >
                      {pos}
                    </button>
                  ))}
                </div>
                {testFeedback && (
                  <div className="p-3 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800">
                    {testFeedback}
                  </div>
                )}
              </div>
            )}

            {/* Detailed Full Parsing */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>الإِعْرَابُ التَّامُّ وَالْمُفَصَّلُ:</span>
              </h4>
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-sm sm:text-base font-bold text-slate-900 leading-relaxed shadow-xs">
                {currentWord.fullParsing}
              </div>
            </div>

            {/* Crucial Section: WHY was it parsed like this? */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>لِمَاذَا تَمَّ إِعْرَابُهَا بِهَذَا الشَّكْلِ؟ (الشَّرْحُ الْمُبَسَّطُ):</span>
              </h4>
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs sm:text-sm text-blue-950 font-medium leading-relaxed">
                💡 {currentWord.whyReason}
              </div>
            </div>
          </div>
        )}

        {/* Complete Sentence Table */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>جَدْوَلُ إِعْرَابِ الْجُمْلَةِ كَامِلَةً:</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">الكلمة</th>
                  <th className="py-2.5 px-3">نوعها</th>
                  <th className="py-2.5 px-3">موقعها وحالتها</th>
                  <th className="py-2.5 px-3">العلامة الإعرابية</th>
                  <th className="py-2.5 px-3">لماذا؟</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {activeSentenceData.words.map((w, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setSelectedWordIndex(idx)}
                    className={`cursor-pointer hover:bg-amber-50/60 transition-colors ${
                      idx === selectedWordIndex ? 'bg-amber-50/90 font-medium' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900">{w.word}</td>
                    <td className="py-2.5 px-3">{w.type}</td>
                    <td className="py-2.5 px-3 font-semibold text-amber-800">{w.position} ({w.status})</td>
                    <td className="py-2.5 px-3">{w.mark}</td>
                    <td className="py-2.5 px-3 text-slate-600 max-w-xs">{w.whyReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Golden Sentence Tip */}
        <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <Star className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-amber-900">سِرٌّ نَحْوِيٌّ لِهَذِهِ الْجُمْلَةِ:</h5>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              {activeSentenceData.goldenRule}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
