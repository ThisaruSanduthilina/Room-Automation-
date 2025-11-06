import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { processVoiceCommand, textToSpeech } from '../openai';
import './VoiceAssistant.css';
import raisyLogo from '../logo/raisylogo.png';

const VoiceAssistant = ({ currentLedStatus, onLedCommand, onLedStatusChange }) => {
  const [mode, setMode] = useState('idle'); // idle, listening, processing, speaking, wake_word_listening
  const [useOpenAITTS] = useState(true); // Always use OpenAI TTS
  const [error, setError] = useState(null);
  const [lastResponse, setLastResponse] = useState('');
  const [wakeWordEnabled, setWakeWordEnabled] = useState(false);
  const [wakeWord, setWakeWord] = useState('hey assistant');
  const [isWakeWordListening, setIsWakeWordListening] = useState(false);

  const { isListening, transcript, error: voiceError, startListening, stopListening, resetTranscript } = useVoiceRecognition();
  const { speak, playAudio, stop: stopSpeaking } = useSpeechSynthesis();

  // Subscribe to Firebase real-time updates
  useEffect(() => {
    const ledsRef = ref(database, 'LEDs');

    const unsubscribe = onValue(ledsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data && onLedStatusChange) {
          const newLeds = {
            LED1: data.LED1 || 0,
            LED2: data.LED2 || 0,
            LED3: data.LED3 || 0,
            LED4: data.LED4 || 0
          };
          onLedStatusChange(newLeds);
        }
      } catch (err) {
        console.error('Error reading from Firebase:', err);
      }
    });

    return () => unsubscribe();
  }, [onLedStatusChange]);

  // Toggle wake word listening mode
  const toggleWakeWordMode = () => {
    if (isWakeWordListening) {
      stopListening();
      setIsWakeWordListening(false);
      setMode('idle');
    } else {
      setError(null);
      resetTranscript();
      startListening();
      setIsWakeWordListening(true);
      setMode('wake_word_listening');
    }
  };

  // Handle voice activation
  const handleVoiceActivation = async () => {
    if (mode === 'listening') {
      stopListening();
      return;
    }

    if (mode === 'speaking') {
      stopSpeaking();
      setMode('idle');
      return;
    }

    setError(null);
    resetTranscript();
    startListening();
    setMode('listening');
  };

  // Process transcript for wake word detection or command processing
  useEffect(() => {
    const transcriptLower = transcript.toLowerCase().trim();

    // Wake word detection mode
    if (mode === 'wake_word_listening' && transcript) {
      if (transcriptLower.includes(wakeWord.toLowerCase())) {
        // Wake word detected! Switch to command listening
        console.log('Wake word detected!');
        resetTranscript();
        setMode('listening');
        // Keep listening for the actual command
      }
      // Continue listening for wake word (don't stop)
      return;
    }

    // Regular command processing when listening stops
    if (transcript && !isListening && mode === 'listening') {
      handleVoiceCommand(transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, isListening, mode]);

  // Auto-restart listening for wake word after command completes
  useEffect(() => {
    if (mode === 'idle' && isWakeWordListening && wakeWordEnabled) {
      // Restart listening for wake word after a brief delay
      const timer = setTimeout(() => {
        resetTranscript();
        startListening();
        setMode('wake_word_listening');
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, isWakeWordListening, wakeWordEnabled]);

  // Handle voice command processing
  const handleVoiceCommand = async (text) => {
    if (!text.trim()) {
      setMode('idle');
      return;
    }

    // Clean up the transcript - remove extra spaces, lowercase for better matching
    const cleanedText = text.trim().toLowerCase();
    console.log('Processing voice command:', cleanedText);

    setMode('processing');

    try {
      // Process command with OpenAI
      const result = await processVoiceCommand(cleanedText, currentLedStatus);

      // Execute immediate LED commands
      if (result.action === 'control_led' && result.leds && result.state !== undefined) {
        result.leds.forEach(ledName => {
          onLedCommand(ledName, result.state);
        });
      }

      // Execute scheduled LED commands
      if (result.action === 'schedule_led' && result.leds && result.state !== undefined && result.delay) {
        result.leds.forEach(ledName => {
          setTimeout(() => {
            onLedCommand(ledName, result.state);
          }, result.delay);
        });
      }

      // Speak response
      setLastResponse(result.response);
      await speakResponse(result.response);

    } catch (err) {
      console.error('Command processing error:', err);

      // More user-friendly error message
      let errorMessage = 'Sorry, I had trouble understanding that. Could you try again?';

      if (err.message.includes('API key')) {
        errorMessage = 'Sorry, there is a configuration issue. Please check the API key.';
      } else if (err.message.includes('network') || err.message.includes('connection')) {
        errorMessage = 'Sorry, I am having trouble connecting. Please check your internet connection.';
      }

      setError(err.message);
      setLastResponse(errorMessage);
      await speakResponse(errorMessage);
    } finally {
      // Always return to idle after processing
      setTimeout(() => {
        if (mode !== 'speaking') {
          setMode('idle');
        }
      }, 500);
    }
  };

  // Speak response using selected TTS method
  const speakResponse = async (text) => {
    setMode('speaking');
    try {
      if (useOpenAITTS) {
        // Use OpenAI TTS for better voice quality
        const audioUrl = await textToSpeech(text);

        // If audioUrl is null, OpenAI TTS failed, fallback to browser TTS
        if (audioUrl) {
          await playAudio(audioUrl);
        } else {
          console.log('Falling back to browser TTS');
          await speak(text);
        }
      } else {
        // Use browser's built-in TTS
        await speak(text);
      }
    } catch (err) {
      console.error('Speech error:', err);
      // Fallback to browser TTS
      try {
        await speak(text);
      } catch (fallbackErr) {
        console.error('Fallback speech error:', fallbackErr);
      }
    } finally {
      setMode('idle');
    }
  };

  // Get status text
  const getStatusText = () => {
    switch (mode) {
      case 'wake_word_listening':
        return `Waiting for "${wakeWord}"...`;
      case 'listening':
        return transcript || 'Listening...';
      case 'processing':
        return 'Processing...';
      case 'speaking':
        return 'Speaking...';
      default:
        return 'Tap to speak';
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (mode) {
      case 'wake_word_listening':
        return '#9c27b0'; // Purple for wake word mode
      case 'listening':
        return '#4caf50';
      case 'processing':
        return '#ff9800';
      case 'speaking':
        return '#2196f3';
      default:
        return '#9e9e9e';
    }
  };

  // Calculate active bulbs count
  const activeBulbsCount = Object.values(currentLedStatus).filter(status => status === 1).length;

  return (
    <div className="voice-assistant">
      <div className="assistant-container">
        {/* Header with Stats */}
        <div className="assistant-header">
          <div className="header-content">
            <div className="brand-section">
              <div className="brand-icon">
                <img src={raisyLogo} alt="Raisy Logo" className="logo-image" />
              </div>
              <div className="brand-text">
                <h1>Smart Office</h1>
                <p>Voice Controlled Assistant</p>
              </div>
            </div>
            <div className="stats-section">
              <div className="stat-card">
                <span className="stat-value">{activeBulbsCount}/4</span>
                <span className="stat-label">Active</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{mode === 'idle' ? '●' : '●'}</span>
                <span className="stat-label">{mode === 'idle' ? 'Ready' : 'Active'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bulb Status Icons at Top - Clickable Switches */}
        <div className="led-status-icons">
          {['LED1', 'LED2', 'LED3', 'LED4'].map((ledName, index) => (
            <div
              key={ledName}
              className="led-mini-card clickable"
              onClick={() => {
                const newState = currentLedStatus[ledName] === 1 ? 0 : 1;
                onLedCommand(ledName, newState);
              }}
              title={`Click to toggle Bulb ${index + 1}`}
            >
              <div className={`led-mini-bulb ${currentLedStatus[ledName] === 1 ? 'active' : ''}`}>
                <div className="led-mini-glow"></div>
              </div>
              <span className="led-mini-label">Bulb {index + 1}</span>
            </div>
          ))}
        </div>

        {/* Large Alexa-like circular button */}
        <div className="voice-button-wrapper">
          <button
            className={`voice-button ${mode}`}
            onClick={handleVoiceActivation}
            disabled={mode === 'processing'}
          >
            <div className="voice-ring" style={{ borderColor: getStatusColor() }}>
              <div className="voice-ring-inner" style={{ borderColor: getStatusColor() }}>
                <div className="voice-icon" style={{ backgroundColor: getStatusColor() }}>
                  {mode === 'wake_word_listening' && (
                    <div className="wake-word-indicator">
                      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '100px', height: '100px' }}>
                        <path d="M17 20c-.29 0-.56-.06-.76-.15-.71-.37-1.21-.88-1.71-2.38-.51-1.56-1.47-2.29-2.39-3-.79-.61-1.61-1.24-2.32-2.53C9.29 10.98 9 9.93 9 9c0-2.8 2.2-5 5-5s5 2.2 5 5h2c0-3.93-3.07-7-7-7S7 5.07 7 9c0 1.26.38 2.65 1.07 3.9.91 1.65 1.98 2.48 2.85 3.15.81.62 1.39 1.07 1.71 2.05.6 1.82 1.37 2.84 2.73 3.55.51.23 1.07.35 1.64.35 2.21 0 4-1.79 4-4h-2c0 1.1-.9 2-2 2zM7.64 2.64L6.22 1.22C4.23 3.21 3 5.96 3 9s1.23 5.79 3.22 7.78l1.41-1.41C6.01 13.74 5 11.49 5 9s1.01-4.74 2.64-6.36z"/>
                      </svg>
                    </div>
                  )}
                  {mode === 'listening' && (
                    <div className="sound-wave">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  )}
                  {mode === 'processing' && (
                    <div className="processing-spinner"></div>
                  )}
                  {mode === 'speaking' && (
                    <div className="speaking-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  )}
                  {mode === 'idle' && (
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </button>
          <p className="voice-status" style={{ color: getStatusColor() }}>
            {getStatusText()}
          </p>
          {transcript && (mode === 'listening' || mode === 'processing') && (
            <p className="transcript-display">"{transcript}"</p>
          )}
          {lastResponse && mode === 'idle' && (
            <p className="last-response">{lastResponse}</p>
          )}
        </div>

        {/* Error message */}
        {(error || voiceError) && (
          <div className="voice-error">
            {error || voiceError}
          </div>
        )}

        {/* Wake Word Settings */}
        <div className="voice-settings">
          <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Wake Word Settings</h3>

          <div className="setting-toggle">
            <input
              type="checkbox"
              id="wakeWordToggle"
              checked={wakeWordEnabled}
              onChange={(e) => {
                setWakeWordEnabled(e.target.checked);
                if (e.target.checked) {
                  toggleWakeWordMode();
                } else if (isWakeWordListening) {
                  toggleWakeWordMode();
                }
              }}
            />
            <label htmlFor="wakeWordToggle">
              Enable continuous wake word detection
            </label>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <label htmlFor="wakeWordInput" style={{ display: 'block', marginBottom: '0.5rem', color: '#333' }}>
              Wake Word:
            </label>
            <input
              type="text"
              id="wakeWordInput"
              value={wakeWord}
              onChange={(e) => setWakeWord(e.target.value)}
              placeholder="e.g., hey assistant"
              disabled={wakeWordEnabled}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                width: '100%',
                fontSize: '1rem'
              }}
            />
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
              {wakeWordEnabled
                ? `Currently listening for "${wakeWord}"`
                : 'Enter a wake word and enable the feature above'}
            </p>
          </div>

          {wakeWordEnabled && (
            <div className="wake-word-status" style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#f0f0f0',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '1.5rem' }}>🎤</span>
              <p style={{ margin: '0.5rem 0 0 0', color: '#9c27b0', fontWeight: '600' }}>
                Always Listening for Wake Word
              </p>
            </div>
          )}
        </div>

        {/* Voice commands help */}
        <div className="voice-help">
          <h4>Voice Commands Help</h4>
          <ul>
            <li>Turn on/off bulb 1, 2, 3, or 4</li>
            <li>Turn on/off all bulbs</li>
            <li>What's the status of the bulbs?</li>
            <li>Turn on bulb 1 in 5 seconds</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default VoiceAssistant;
