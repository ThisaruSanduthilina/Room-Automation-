# LED Control Panel - React Firebase App with Voice Control

A modern web interface to control 4 LEDs connected to an ESP32 microcontroller through Firebase Realtime Database, featuring **Alexa-like voice assistant** powered by OpenAI.

## Features

### LED Control
- Real-time LED control and monitoring
- Modern, responsive UI with animated LED indicators
- Toggle individual LEDs or control all at once
- Live synchronization with ESP32 device
- Visual feedback with glowing LED animations
- Mobile-friendly design

### Voice Assistant (NEW!)
- **Two-way voice conversation** like Alexa
- Control LEDs with natural voice commands
- OpenAI GPT-4 powered natural language understanding
- OpenAI Text-to-Speech for high-quality voice responses
- Web Speech API for voice recognition
- Alexa-style circular interface with animated states
- Conversation history tracking
- Fallback to browser TTS if needed

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- **OpenAI API key** (for voice assistant)
- ESP32 with the provided Arduino code uploaded
- Modern browser with microphone access (Chrome, Edge, or Safari recommended)

## Setup Instructions

### 1. Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `riseoffice-22ca4`
3. Click on the gear icon ⚙️ > **Project settings**
4. Scroll down to **Your apps** section
5. Click on the web icon `</>` or **Add app** if you haven't created a web app
6. Copy the `firebaseConfig` object

### 2. Configure Firebase in the Project

Open `src/firebase.js` and replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "riseoffice-22ca4.firebaseapp.com",
  databaseURL: "https://riseoffice-22ca4-default-rtdb.firebaseio.com",
  projectId: "riseoffice-22ca4",
  storageBucket: "riseoffice-22ca4.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Set Firebase Rules (Test Mode)

For testing purposes, set your Firebase Realtime Database rules to allow public access:

1. Go to Firebase Console > Realtime Database
2. Click on the **Rules** tab
3. Set the following rules:

```json
{
  "rules": {
    ".read": "true",
    ".write": "true"
  }
}
```

**⚠️ WARNING:** These rules are for testing only. For production, implement proper authentication.

### 4. Get OpenAI API Key (For Voice Assistant)

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API Keys**: https://platform.openai.com/api-keys
4. Click **Create new secret key**
5. Copy the API key (it starts with `sk-`)
6. **Important**: Save it securely - you won't be able to see it again!

### 5. Configure OpenAI API Key

Create a `.env` file in the root directory:

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Alternative**: If you don't want to use a `.env` file, you can directly edit `src/openai.js` and replace `YOUR_OPENAI_API_KEY` with your actual key (not recommended for production).

### 6. Install Dependencies

```bash
npm install
```

### 7. Run the Development Server

```bash
npm run dev
```

The app will open in your browser at `http://localhost:3000`

**Important**: When you first use voice features, your browser will ask for microphone permissions. Click **Allow**.

### 8. Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## Project Structure

```
officeAutomation/
├── src/
│   ├── components/
│   │   ├── LEDControl.jsx       # Main LED control component
│   │   ├── LEDControl.css       # LED control styles
│   │   ├── VoiceAssistant.jsx   # Voice assistant component
│   │   └── VoiceAssistant.css   # Voice assistant styles
│   ├── hooks/
│   │   ├── useVoiceRecognition.js  # Voice recognition hook
│   │   └── useSpeechSynthesis.js   # Text-to-speech hook
│   ├── firebase.js              # Firebase configuration
│   ├── openai.js                # OpenAI API integration
│   ├── App.jsx                  # Root component
│   ├── App.css                  # App styles
│   └── main.jsx                 # Entry point
├── .env                         # Environment variables (create this)
├── .env.example                 # Environment variables template
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── vite.config.js              # Vite configuration
└── README.md                    # This file
```

## How It Works

### Manual Control
1. **ESP32 Device**: Reads LED status from Firebase path `LEDs/LED1`, `LEDs/LED2`, etc.
2. **Firebase Realtime Database**: Acts as a bridge between the web app and ESP32
3. **React Web App**:
   - Subscribes to real-time updates from Firebase
   - Displays current LED status with visual indicators
   - Allows users to toggle LEDs by clicking buttons
   - Changes are instantly reflected on both the web app and ESP32

### Voice Control
1. **User speaks** to the Alexa-like interface (tap the circular button)
2. **Browser captures audio** using Web Speech API
3. **OpenAI Whisper** transcribes speech to text (optional, falls back to browser)
4. **GPT-4 processes** the command and understands intent
5. **LED control** updates Firebase database
6. **OpenAI TTS** generates natural voice response
7. **Assistant speaks back** confirming the action
8. **ESP32 responds** to database changes in real-time

## Database Structure

```
LEDs/
├── LED1: 0 or 1
├── LED2: 0 or 1
├── LED3: 0 or 1
└── LED4: 0 or 1
```

- `0` = LED OFF
- `1` = LED ON

## ESP32 Pin Mapping

- LED1 → GPIO Pin 2
- LED2 → GPIO Pin 4
- LED3 → GPIO Pin 5
- LED4 → GPIO Pin 18

## Voice Commands Examples

Try saying these commands to the voice assistant:

### Individual LED Control
- "Turn on LED 1"
- "Turn off LED 3"
- "Switch on LED 2"
- "Switch off LED 4"

### Multiple LEDs
- "Turn on LED 1 and LED 2"
- "Turn off LED 3 and LED 4"
- "Turn on LED 1, 2, and 3"

### All LEDs
- "Turn on all lights"
- "Turn off all lights"
- "Turn everything on"
- "Turn everything off"

### Status Queries
- "Which lights are on?"
- "What's the status?"
- "Show me the LED status"
- "Are any lights on?"

### Natural Conversation
- "Hello, how are you?"
- "What can you do?"
- "Help me control the lights"

## Troubleshooting

### Firebase Connection Error

- Verify your Firebase configuration in `src/firebase.js`
- Check that Firebase Realtime Database rules allow read/write access
- Ensure your Firebase project is active

### LEDs Not Responding

- Check that your ESP32 is connected to WiFi
- Verify the ESP32 code is uploaded and running
- Check Serial Monitor for ESP32 status messages
- Ensure Firebase database URL matches in both Arduino code and React app

### Voice Assistant Not Working

- **Microphone Permission**: Allow microphone access when prompted
- **OpenAI API Key**: Verify your API key in `.env` or `src/openai.js`
- **API Credits**: Check your OpenAI account has available credits
- **Browser Support**: Use Chrome, Edge, or Safari for best compatibility
- **HTTPS**: Voice features may require HTTPS in production (use localhost for development)
- **Console Errors**: Check browser console (F12) for detailed error messages

### OpenAI API Errors

- **"API key is invalid"**: Check your API key is correct and active
- **"Insufficient quota"**: Add credits to your OpenAI account
- **"Rate limit exceeded"**: Wait a moment and try again
- **CORS errors**: This is expected with browser-based OpenAI calls; use `.env` file

### Build Errors

- Delete `node_modules` folder and run `npm install` again
- Clear npm cache: `npm cache clean --force`
- Check Node.js version: `node --version` (should be v14+)

## Technologies Used

- **React 18** - UI framework
- **Firebase SDK v10** - Realtime database
- **OpenAI GPT-4** - Natural language understanding
- **OpenAI Whisper** - Speech-to-text (optional)
- **OpenAI TTS** - Text-to-speech with natural voices
- **Web Speech API** - Browser voice recognition & synthesis
- **Vite** - Build tool and dev server
- **CSS3** - Styling and animations

## Security Notes

**⚠️ IMPORTANT**: The current setup uses client-side OpenAI API calls, which exposes your API key in the browser. This is acceptable for personal projects but NOT recommended for production.

### For Production Deployment:

1. **Create a Backend Server**:
   - Move OpenAI API calls to a Node.js/Express backend
   - Store API keys securely on the server
   - Add authentication to API endpoints

2. **Firebase Security**:
   - Enable Firebase Authentication
   - Update database rules to require authentication
   - Use environment variables for Firebase config

3. **General Security**:
   - Enable HTTPS (required for microphone access)
   - Implement rate limiting
   - Add user authentication
   - Monitor API usage and costs

4. **OpenAI API Key**:
   - Never commit `.env` file to git (it's already in `.gitignore`)
   - Rotate API keys regularly
   - Set usage limits in OpenAI dashboard
   - Monitor API usage and costs

### Cost Considerations

OpenAI API usage is not free:
- **GPT-4**: ~$0.03 per request (varies by token usage)
- **TTS**: ~$0.015 per 1000 characters
- **Whisper**: ~$0.006 per minute

Estimated cost: ~$0.05-0.10 per voice interaction. Monitor your usage at https://platform.openai.com/usage

## License

MIT License - Feel free to use and modify for your projects.

## Support

For issues or questions, please check:
- Firebase Console for database status
- ESP32 Serial Monitor for device logs
- Browser Console for web app errors
