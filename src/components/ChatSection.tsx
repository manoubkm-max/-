import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Volume2, Bot, User, RefreshCw, BookOpen, Edit3, Trophy } from 'lucide-react';
import { speakArabic } from '../utils/speech';
import mascotImg from '../assets/images/arabic_tutor_mascot_1792063922273.jpg';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

interface ChatSectionProps {
  onSelectAction: (tab: 'lessons' | 'parser' | 'quiz') => void;
  onRewardXP: (points: number) => void;
}

const INITIAL_WELCOME = `أهلاً بك يا بطل في واحة النحو العربي! 🌟 
أنا معلمك التفاعلي "الأستاذ سراج"، رفيقك لتبسيط قواعد لغتنا الجميلة وجعل الإعراب لعبة ممتعة وسهلة تناسب عقلك الذكي.

ماذا تود أن نفعل اليوم معاً؟
1. 📚 شرح درس معين في النحو.
2. 📝 إعراب جملة من اختيارك.
3. 🧩 التحدي والإجابة على أسئلة واختبارات قصيرة.

اختر أحد الأرقام أو الأزرار أدناه، أو اسألني مباشرة عن أي قاعدة تخطر ببالك! 😊`;

export const ChatSection: React.FC<ChatSectionProps> = ({
  onSelectAction,
  onRewardXP,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-0',
      role: 'assistant',
      content: INITIAL_WELCOME,
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (userText: string) => {
    const textToSend = userText.trim();
    if (!textToSend || isLoading) return;

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: textToSend,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/grammar/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('فشل الرد من الخادم');
      }

      const data = await response.json();
      const tutorReply: Message = {
        id: 'ast-' + Date.now(),
        role: 'assistant',
        content: data.reply || 'أحسنت يا بطل! يسعدني جداً إجابتك واستفسارك.',
      };

      setMessages((prev) => [...prev, tutorReply]);
      onRewardXP(5);
    } catch (err: any) {
      // Friendly local fallback response matching persona
      let fallbackText = 'أهلاً بك يا بطل! أنا معك دائماً. ';
      if (textToSend.includes('1') || textToSend.includes('شرح') || textToSend.includes('درس')) {
        fallbackText += 'يسعدني جداً أن أشرح لك أي درس! يمكنك الضغط على قسم «شرح الدروس» في الأعلى لاختيار درسك المفضل، أو كتابة اسم الدرس هنا مباشرة وسأشرحه لك بأبسط طريقة!';
      } else if (textToSend.includes('2') || textToSend.includes('إعراب') || textToSend.includes('أعرب')) {
        fallbackText += 'ممتاز! الإعراب سر الفهم. اكتب لي الجملة التي تريد إعرابها، أو توجه لقسم «الإعراب التفاعلي» لنعرب كل كلمة بالتفصيل واللون!';
      } else if (textToSend.includes('3') || textToSend.includes('اختبار') || textToSend.includes('تحدي')) {
        fallbackText += 'أنت شجاع وواثق من نفسك! انقر على قسم «التحدي والاختبارات» في الأعلى لتبدأ التحدي وتكسب نقاط الأبطال!';
      } else {
        fallbackText += 'سؤال رائع وتفكير ذكي! واصل استكشافك ولنتعلم معاً خطوة بخطوة.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: 'ast-' + Date.now(),
          role: 'assistant',
          content: fallbackText,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-amber-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 bg-amber-200 shrink-0">
            <img
              src={mascotImg}
              alt="الأستاذ سراج"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                الْأُسْتَاذُ سِرَاج (مُعَلِّمُ النَّحْوِ التَّفَاعُلِيُّ)
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                جاهز للمساعدة
              </span>
            </div>
            <p className="text-xs text-slate-500">
              خبير تربوي لتبسيط النحو والإعراب لتلاميذ المتوسط (11-15 سنة)
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([{ id: 'msg-0', role: 'assistant', content: INITIAL_WELCOME }]);
          }}
          className="text-xs text-slate-500 hover:text-amber-700 flex items-center gap-1 font-medium"
          title="بدء محادثة جديدة"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">محادثة جديدة</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/30">
        {messages.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAssistant ? '' : 'flex-row-reverse'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  isAssistant
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-700 text-white'
                }`}
              >
                {isAssistant ? 'س' : <User className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-1 ${isAssistant ? 'text-right' : 'text-left'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isAssistant
                      ? 'bg-white border border-slate-200 text-slate-900 shadow-xs'
                      : 'bg-amber-600 text-white font-medium rounded-tr-none'
                  }`}
                >
                  {msg.content}
                </div>

                {isAssistant && (
                  <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
                    <button
                      onClick={() => speakArabic(msg.content)}
                      className="hover:text-amber-700 flex items-center gap-1 transition-colors"
                      title="استمع إلى صوت الأستاذ سراج"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>قراءة صوتية</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              س
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tr-none shadow-xs text-xs text-slate-500 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
              <span>الأستاذ سراج يكتب لك رداً مفصلاً ومشجعاً...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestion Chips */}
      <div className="p-2 sm:px-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 shrink-0 text-[11px]">اقتراحات سريعة:</span>
        <button
          type="button"
          onClick={() => handleSendMessage('1. أريد شرح درس في النحو')}
          className="px-2.5 py-1 bg-white border border-slate-200 hover:border-amber-400 rounded-lg text-slate-700 whitespace-nowrap text-[11px] font-semibold"
        >
          📚 1. شرح درس
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage('2. أريد إعراب جملة من اختياري')}
          className="px-2.5 py-1 bg-white border border-slate-200 hover:border-amber-400 rounded-lg text-slate-700 whitespace-nowrap text-[11px] font-semibold"
        >
          📝 2. إعراب جملة
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage('3. أريد التحدي في اختبار قصير')}
          className="px-2.5 py-1 bg-white border border-slate-200 hover:border-amber-400 rounded-lg text-slate-700 whitespace-nowrap text-[11px] font-semibold"
        >
          🧩 3. تحدي الاختبارات
        </button>
        <button
          type="button"
          onClick={() => handleSendMessage('ما هو الفرق بين الفاعل ونائب الفاعل؟')}
          className="px-2.5 py-1 bg-white border border-slate-200 hover:border-amber-400 rounded-lg text-slate-700 whitespace-nowrap text-[11px] font-semibold"
        >
          ❓ الفرق بين الفاعل ونائب الفاعل
        </button>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="تحدث مع الأستاذ سراج (مثال: اشرح لي علامات إعراب جمع المذكر السالم)..."
            className="flex-1 text-xs sm:text-sm px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-50/50"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>إرسال</span>
            <Send className="w-4 h-4 -scale-x-100" />
          </button>
        </div>
      </form>
    </div>
  );
};
