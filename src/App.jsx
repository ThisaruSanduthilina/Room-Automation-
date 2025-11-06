import { useState, useCallback } from 'react';
import { ref, set } from 'firebase/database';
import { database } from './firebase';
import VoiceAssistant from './components/VoiceAssistant';
import './App.css';

function App() {
  const [currentLedStatus, setCurrentLedStatus] = useState({
    LED1: 0,
    LED2: 0,
    LED3: 0,
    LED4: 0
  });

  // Handle LED status updates from Firebase
  const handleLedStatusChange = useCallback((newStatus) => {
    setCurrentLedStatus(newStatus);
  }, []);

  // Handle LED commands from voice assistant
  const handleVoiceLedCommand = useCallback(async (ledName, state) => {
    try {
      const ledRef = ref(database, `LEDs/${ledName}`);
      await set(ledRef, state);

      // Update local state
      setCurrentLedStatus(prev => ({
        ...prev,
        [ledName]: state
      }));
    } catch (error) {
      console.error('Error setting LED from voice command:', error);
      throw error;
    }
  }, []);

  return (
    <div className="App">
      {/* Voice Assistant Section - Full Screen */}
      <VoiceAssistant
        currentLedStatus={currentLedStatus}
        onLedCommand={handleVoiceLedCommand}
        onLedStatusChange={handleLedStatusChange}
      />
    </div>
  );
}

export default App;
