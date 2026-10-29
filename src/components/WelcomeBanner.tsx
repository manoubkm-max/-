import React from 'react';
import { BookOpen, Edit3, HelpCircle, Sparkles, Award, ArrowLeft, Lightbulb } from 'lucide-react';
import mascotImg from '../assets/images/arabic_tutor_mascot_1792063922273.jpg';

interface WelcomeBannerProps {
  onSelectAction: (action: 'lessons' | 'parser' | 'quiz' | 'chat') => void;
  onQuickLesson: (lessonId: string) => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  onSelectAction,
  onQuickLesson,
}) => {
  return (
    <div className="space-y-8">
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden relative">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
          {/* Mascot Image with resilient fallback container */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-2xl overflow-hidden bg-amber-400 border-2 border-white/30 shadow-md">
            <img
              src={mascotImg}
              alt="الأستاذ سراج - معلم النحو التفاعلي"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Resilient fallback in case image file fails to load
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Dialogue & Greeting */}
          <div className="flex-1 text-center md:text-right space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold tracking-wide text-amber-50">
              <Sparkles className="w-3.5 h-3.5" />
              <span>مَرْحَباً بِكَ يَا بَطَلَ اللُّغَةِ الْعَرَبِيَّةِ!</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              أهلاً بك في رحابِ «سِرَاجِ النَّحْوِ» التَّفَاعُلِيّ! 🌟
            </h1>
            <p className="text-amber-100 text-sm sm:text-base leading-relaxed max-w-2xl">
              أنا معلمك التفاعلي، رفيقك الودود لجعل قواعد النحو العربي بسيطة ومفهومة، والإعراب لعبة ذكية وسهلة تناسب عقلك المبدع! ماذا تود أن نفعل اليوم معاً؟
            </p>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* The 3 Core Choices explicitly requested */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>اخْتَرْ مَاذَا تُرِيدُ أَنْ نَبْدَأَ بِهِ الْيَوْمَ:</span>
          </h2>
          <span className="text-xs text-slate-500">اختر أحد الخيارات الثلاثة أدناه</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option 1: Lessons */}
          <button
            onClick={() => onSelectAction('lessons')}
            className="group relative bg-white border border-slate-200 hover:border-amber-400 hover:shadow-md rounded-xl p-5 text-right transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl group-hover:scale-105 transition-transform">
                📚
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                  1. شَرْحُ دَرْسٍ مُعَيَّنٍ فِي النَّحْوِ
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  قواعد مبسطة في أسطر قصيرة، أمثلة من حياتك اليومية مشروحة خطوة بخطوة، وجداول خلاصة وملاحظات ذهبية.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>تصفح الدروس المقررة</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Option 2: Parsing */}
          <button
            onClick={() => onSelectAction('parser')}
            className="group relative bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md rounded-xl p-5 text-right transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-2xl group-hover:scale-105 transition-transform">
                📝
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  2. إِعْرَابُ جُمْلَةٍ مِنْ اخْتِيَارِكَ
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  أدخل أي جملة وسنقوم بإعراب كل كلمة مع بيان نوعها وموقعها وحالتها، مع تعليل مبسط: "لماذا أعربناها هكذا؟".
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600">
              <span>افتح معرب الجمل الذكي</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Option 3: Quiz & Challenges */}
          <button
            onClick={() => onSelectAction('quiz')}
            className="group relative bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md rounded-xl p-5 text-right transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-2xl group-hover:scale-105 transition-transform">
                🧩
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                  3. التَّحَدِّي وَاخْتِبَارَاتٌ قَصِيرَةٌ
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  تحديات خيارات متعددة واكتشاف الخطأ؛ حاول بنفسك أولاً، وسنصحح لك فوراً مع شرح دقيق وتشجيع مستمر!
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600">
              <span>خض التحدي واكسب النقاط</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Quick Launch & Golden Tip Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Middle School Lessons */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>دروس المرحلة المتوسطة الأكثر طلباً:</span>
            </h3>
            <button
              onClick={() => onSelectAction('lessons')}
              className="text-xs text-amber-600 hover:underline font-semibold"
            >
              عرض كل الدروس
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'fael', name: 'الفاعل وعلامات رفعه' },
              { id: 'mafool-bih', name: 'المفعول به وعلامات نصبه' },
              { id: 'kana-akhawatuha', name: 'كان وأخواتها' },
              { id: 'inna-akhawatuha', name: 'إنَّ وأخواتها' },
              { id: 'mudarea-marfoo-mansoob-majzoom', name: 'إعراب الفعل المضارع' },
              { id: 'asma-khamsa', name: 'الأسماء الخمسة (واي)' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onQuickLesson(item.id)}
                className="text-right p-2.5 rounded-lg border border-slate-100 hover:border-amber-300 hover:bg-amber-50/50 transition-colors text-xs font-semibold text-slate-700 hover:text-amber-800"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Golden Grammar Secret / Tip of the Day */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>سر نحوي ذهبي للامتحانات 💡</span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              "الإعراب فرعُ المعنى؛ اسأل نفسك دائماً قبل الإعراب: ما المعنى الذي تؤديه الكلمة في الجملة؟ مَن فعل؟ وعلى مَن وقع الفعل؟ وكيف كانت الهيئة؟ هذا هو المفتاح!"
            </p>
          </div>

          <button
            onClick={() => onSelectAction('chat')}
            className="w-full py-2 px-3 text-xs font-bold text-amber-800 bg-white border border-amber-300 hover:bg-amber-100/50 rounded-lg transition-colors text-center shadow-xs"
          >
            اسأل الأستاذ سراج عن أي سؤال نحوي 💬
          </button>
        </div>
      </div>
    </div>
  );
};
