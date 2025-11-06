import { useState, useRef, useCallback } from 'react';

// Custom hook for voice recognition using Web Speech API
export const useVoiceRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const timeoutRef = useRef(null);
  const silenceTimeoutRef = useRef(null);

  // Initialize Speech Recognition
  const initRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser');
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Enhanced configuration for better accuracy and faster response
    recognition.continuous = false; // Stop after getting a result for faster response
    recognition.interimResults = true; // Get results as you speak
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy

    return recognition;
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition();
      if (!recognitionRef.current) return;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
        setTranscript('');

        // Clear any existing timeouts
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // Maximum listening time: 10 seconds
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            console.log('Listening timeout - stopping recognition');
            recognitionRef.current.stop();
          }
        }, 10000);
      };

      recognitionRef.current.onresult = (event) => {
        // Clear silence timeout on any result
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // Get the most recent result
        const lastResultIndex = event.results.length - 1;
        const result = event.results[lastResultIndex];

        // Show interim results immediately
        if (!result.isFinal) {
          const interimTranscript = result[0].transcript;
          setTranscript(interimTranscript.trim());

          // Auto-stop after 2 seconds of getting interim results
          silenceTimeoutRef.current = setTimeout(() => {
            if (recognitionRef.current && interimTranscript.trim().length > 0) {
              console.log('Auto-stopping after silence');
              recognitionRef.current.stop();
            }
          }, 2000);
        } else {
          // Final result - use the best transcript
          let bestTranscript = result[0].transcript;
          let bestConfidence = result[0].confidence;

          // Check if there are better alternatives
          for (let i = 1; i < result.length; i++) {
            if (result[i].confidence > bestConfidence) {
              bestTranscript = result[i].transcript;
              bestConfidence = result[i].confidence;
            }
          }

          console.log('Voice Recognition - Transcript:', bestTranscript, 'Confidence:', bestConfidence);
          setTranscript(bestTranscript.trim());

          // Stop immediately after final result
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);

        // Clear timeouts on error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // Ignore 'no-speech' and 'aborted' errors (these are normal)
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setError(`Speech recognition error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        // Clear all timeouts
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        setIsListening(false);
      };
    }

    try {
      recognitionRef.current.start();
    } catch (err) {
      setError(`Failed to start recognition: ${err.message}`);
    }
  }, [initRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    // Clear all timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript
  };
};
