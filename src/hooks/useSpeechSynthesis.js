import { useState, useCallback } from 'react';

// Custom hook for speech synthesis
export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Speak text using Web Speech API
  const speak = useCallback((text) => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis is not supported'));
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        resolve();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      window.speechSynthesis.speak(utterance);
    });
  }, []);

  // Play audio from URL (for OpenAI TTS)
  const playAudio = useCallback((audioUrl) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);

      audio.onloadeddata = () => {
        setIsSpeaking(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl); // Clean up
        resolve();
      };

      audio.onerror = (error) => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl); // Clean up
        reject(new Error('Audio playback error'));
      };

      audio.play().catch(reject);
    });
  }, []);

  // Stop speaking
  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    playAudio,
    stop,
    isSpeaking
  };
};
