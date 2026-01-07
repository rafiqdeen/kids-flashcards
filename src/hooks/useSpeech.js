import { useCallback, useRef } from 'react';

export function useSpeech() {
  const utteranceRef = useRef(null);

  const speak = useCallback((text, options = {}) => {
    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Kid-friendly settings
    utterance.rate = options.rate || 0.8; // Slower for kids
    utterance.pitch = options.pitch || 1.1; // Slightly higher pitch
    utterance.volume = options.volume || 1;

    // Try to use a friendly voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) => voice.name.includes('Samantha') ||
                 voice.name.includes('Karen') ||
                 voice.name.includes('Google') ||
                 voice.lang.startsWith('en')
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const speakLetter = useCallback((letter) => {
    speak(letter, { rate: 0.7, pitch: 1.2 });
  }, [speak]);

  const speakWord = useCallback((word) => {
    speak(word, { rate: 0.75, pitch: 1.1 });
  }, [speak]);

  const speakNumber = useCallback((number) => {
    speak(number.toString(), { rate: 0.7, pitch: 1.2 });
  }, [speak]);

  const speakPhrase = useCallback((phrase) => {
    speak(phrase, { rate: 0.8, pitch: 1.0 });
  }, [speak]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  return {
    speak,
    speakLetter,
    speakWord,
    speakNumber,
    speakPhrase,
    stop,
  };
}
