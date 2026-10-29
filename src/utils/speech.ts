/**
 * Helper to speak Arabic text cleanly using the browser's native SpeechSynthesis
 */
export function speakArabic(text: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    // Clean markdown symbols for cleaner voice
    const cleanText = text
      .replace(/[*#_`~[\]]/g, '')
      .replace(/\(.*?\)/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9; // Slightly slower for clear educational delivery

    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find((v) => v.lang.startsWith('ar'));
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error('Speech synthesis error:', err);
    return false;
  }
}

export function stopArabicSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
