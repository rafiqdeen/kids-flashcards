import { useCallback, useRef, useState, useEffect } from 'react';

export function useSpeech() {
  const utteranceRef = useRef(null);
  const [voices, setVoices] = useState([]);
  const [indianVoice, setIndianVoice] = useState(null);

  // Load voices when available
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);

      // Get all Indian English voices
      const indianVoices = availableVoices.filter(
        (voice) => voice.lang === 'en-IN' || voice.lang.startsWith('en-IN')
      );

      // Prioritize female Indian voice
      // Known female Indian voices: Veena (Apple), female variants
      let selectedVoice = indianVoices.find(
        (voice) => voice.name.includes('Veena') ||
                   voice.name.toLowerCase().includes('female') ||
                   voice.name.includes('Lekha')
      );

      // If no specific female voice found, try any Indian voice that's not Rishi (male)
      if (!selectedVoice) {
        selectedVoice = indianVoices.find(
          (voice) => !voice.name.includes('Rishi')
        ) || indianVoices[0];
      }

      // Fallback to any voice with India in name
      if (!selectedVoice) {
        selectedVoice = availableVoices.find(
          (voice) => voice.name.includes('Veena') ||
                     voice.name.toLowerCase().includes('india')
        );
      }

      if (selectedVoice) {
        setIndianVoice(selectedVoice);
        console.log('Indian voice selected:', selectedVoice.name, selectedVoice.lang);
      } else {
        console.log('No Indian voice found. Available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));
      }
    };

    // Load voices immediately
    loadVoices();

    // Also listen for voiceschanged event (needed for Chrome)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speak = useCallback((text, options = {}) => {
    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Kid-friendly settings - slower and clearer with feminine pitch
    utterance.rate = options.rate || 0.7; // Slower for kids
    utterance.pitch = options.pitch || 1.3; // Higher pitch for feminine sound
    utterance.volume = options.volume || 1;

    // Set Indian English language
    utterance.lang = 'en-IN';

    // Use Indian voice if available
    if (indianVoice) {
      utterance.voice = indianVoice;
    } else {
      // Try to find female Indian voice again from current voices
      const currentVoices = window.speechSynthesis.getVoices();
      const indianVoices = currentVoices.filter(v => v.lang === 'en-IN' || v.lang.startsWith('en-IN'));
      // Prefer female voice (Veena)
      const female = indianVoices.find(v => v.name.includes('Veena') || !v.name.includes('Rishi'));
      if (female) {
        utterance.voice = female;
      } else if (indianVoices.length > 0) {
        utterance.voice = indianVoices[0];
      }
    }

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [indianVoice]);

  const speakLetter = useCallback((letter) => {
    // Spell out the letter clearly with feminine pitch
    speak(letter, { rate: 0.6, pitch: 1.3 });
  }, [speak]);

  const speakWord = useCallback((word) => {
    speak(word, { rate: 0.65, pitch: 1.3 });
  }, [speak]);

  const speakNumber = useCallback((number) => {
    speak(number.toString(), { rate: 0.6, pitch: 1.3 });
  }, [speak]);

  const speakPhrase = useCallback((phrase) => {
    speak(phrase, { rate: 0.7, pitch: 1.3 });
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
