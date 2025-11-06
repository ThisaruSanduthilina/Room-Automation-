import OpenAI from 'openai';

// OpenAI Configuration
// Get your API key from: https://platform.openai.com/api-keys
// Set VITE_OPENAI_API_KEY in your .env file
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Initialize OpenAI client
// Use a dummy key if not set to prevent initialization errors
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY || 'sk-dummy-key-for-initialization',
  dangerouslyAllowBrowser: true // Note: In production, use a backend server
});

// System prompt for Bulb control assistant
const SYSTEM_PROMPT = `You are Raisy, a friendly and helpful voice assistant controlling 4 smart bulbs (Bulb 1, Bulb 2, Bulb 3, Bulb 4) connected to an ESP32 device.

Your name is Raisy. When users greet you with "Hey Raisy", "Hello Raisy", or just "Raisy", respond warmly and ask how you can help.

Your capabilities:
- Turn individual bulbs on/off (e.g., "turn on bulb 1", "turn off bulb 3")
- Control multiple bulbs (e.g., "turn on bulb 1 and bulb 2")
- Turn all bulbs on/off (e.g., "turn on all bulbs", "turn off everything")
- Schedule bulbs for later (e.g., "turn on bulb 1 in 5 seconds", "turn off bulb 2 after 10 seconds", "turn on bulb 3 in 1 minute")
- Check bulb status (e.g., "which bulbs are on?", "what's the status?")
- Friendly conversation and greetings

IMPORTANT - Voice Recognition Tolerance:
You MUST be very flexible and forgiving with voice recognition errors. Users may have accents or the speech recognition may mishear words.
Accept these variations and similar phrases:
- "turn on/off", "on", "off", "switch on/off", "power on/off", "activate", "deactivate", "enable", "disable"
- "bulb", "bulbs", "light", "lights", "lamp", "lamps"
- "1", "one", "first", "won"
- "2", "two", "second", "to", "too"
- "3", "three", "third", "tree"
- "4", "four", "fourth", "for"
- "all", "everything", "all of them", "every", "everyone"
- Ignore filler words like "please", "can you", "could you", "I want", "I need"
- Be flexible with word order: "bulb 1 turn on" = "turn on bulb 1"

Current bulb status will be provided to you in each request.

Personality: You are Raisy - warm, friendly, helpful, and enthusiastic. Use a conversational tone like talking to a friend.
Keep responses brief and natural. When executing commands, confirm what you did in a friendly way.

For immediate bulb commands, respond in JSON format:
{
  "action": "control_led",
  "leds": ["LED1", "LED2"],
  "state": 1,
  "response": "Sure! Turning on bulb 1 and bulb 2 for you."
}

For scheduled/timed bulb commands, respond in JSON format:
{
  "action": "schedule_led",
  "leds": ["LED1"],
  "state": 1,
  "delay": 5000,
  "response": "Got it! I'll turn on bulb 1 in 5 seconds."
}

For status queries:
{
  "action": "status",
  "response": "Right now, bulbs 1 and 3 are on, while bulbs 2 and 4 are off."
}

For greetings (Hey Raisy, Hello, Hi, etc.):
{
  "action": "chat",
  "response": "Hi! I'm Raisy, your smart bulb assistant. How can I help you today?"
}

For general chat:
{
  "action": "chat",
  "response": "Your friendly conversational response"
}

Important Mapping Rules:
- "bulb 1", "bulb one", "light 1", "light one", "first bulb", "first light", "won", "lamp 1" → LED1
- "bulb 2", "bulb two", "light 2", "light two", "second bulb", "second light", "to", "too", "lamp 2" → LED2
- "bulb 3", "bulb three", "light 3", "light three", "third bulb", "third light", "tree", "lamp 3" → LED3
- "bulb 4", "bulb four", "light 4", "light four", "fourth bulb", "fourth light", "for", "lamp 4" → LED4
- "all", "all bulbs", "all lights", "everything", "every bulb", "all of them" → ["LED1", "LED2", "LED3", "LED4"]
- Always use "bulb" terminology in responses, not "LED"
- For time delays, convert to milliseconds: 1 second = 1000ms, 1 minute = 60000ms
- Parse time phrases: "in 5 seconds" = 5000ms, "after 10 seconds" = 10000ms, "in 1 minute" = 60000ms, "in 2 minutes" = 120000ms
- "delay" field should be in milliseconds
- Be VERY flexible: if the command is even remotely close to a bulb command, interpret it generously`;

// Process voice command with GPT
export async function processVoiceCommand(transcript, currentLedStatus) {
  try {
    // Check if API key is set
    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'sk-dummy-key-for-initialization') {
      throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your environment variables.');
    }

    const statusText = Object.entries(currentLedStatus)
      .map(([led, status]) => `${led}: ${status === 1 ? 'ON' : 'OFF'}`)
      .join(', ');

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Current LED status: ${statusText}\n\nUser command: "${transcript}"\n\nRespond in JSON format as specified in your instructions.`
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent responses
      max_tokens: 250,
      top_p: 0.9, // Better quality responses
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    });

    const content = response.choices[0].message.content.trim();

    // Try to parse JSON response
    try {
      // Remove markdown code blocks if present
      const jsonContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      return JSON.parse(jsonContent);
    } catch (parseError) {
      // If not JSON, treat as plain text response
      return {
        action: 'chat',
        response: content
      };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);

    // Provide more specific error messages
    if (error.status === 401) {
      throw new Error('OpenAI API key is invalid or expired. Please check your API key.');
    } else if (error.status === 429) {
      throw new Error('Rate limit reached. Please wait a moment and try again.');
    } else if (error.status === 500 || error.status === 503) {
      throw new Error('OpenAI service is temporarily unavailable. Please try again.');
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      throw new Error('Connection error. Check your internet connection or try again.');
    } else {
      throw new Error(`Failed to process command: ${error.message}`);
    }
  }
}

// Convert text to speech using OpenAI TTS
export async function textToSpeech(text) {
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'shimmer', // Female voice - Options: alloy, echo, fable, onyx, nova, shimmer
      input: text,
      speed: 1.0
    });

    // Convert response to audio blob
    const buffer = await mp3.arrayBuffer();
    const blob = new Blob([buffer], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);

    return url;
  } catch (error) {
    console.error('Text-to-speech error:', error);

    // Provide more specific error messages
    if (error.status === 401) {
      throw new Error('OpenAI API key is invalid. TTS unavailable.');
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      console.warn('TTS connection error, will use browser fallback');
      return null; // Return null to trigger fallback to browser TTS
    } else {
      console.warn('TTS error, will use browser fallback');
      return null; // Return null to trigger fallback to browser TTS
    }
  }
}

// Transcribe audio using OpenAI Whisper
export async function transcribeAudio(audioBlob) {
  try {
    // Convert blob to file
    const file = new File([audioBlob], 'audio.webm', { type: audioBlob.type });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en'
    });

    return transcription.text;
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

export { openai };
