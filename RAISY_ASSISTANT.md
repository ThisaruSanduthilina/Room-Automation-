# Meet Raisy - Your Friendly Smart Bulb Assistant 💡

## What's New?

### 1. ✅ Changed from LEDs to Bulbs
- All references changed from "LED" to "Bulb"
- Say "Turn on bulb 1" instead of "Turn on LED 1"
- Labels now show "Bulb 1", "Bulb 2", "Bulb 3", "Bulb 4"

### 2. ✅ Meet Raisy - Your Personal Assistant
- Assistant name: **Raisy**
- Female voice (OpenAI Shimmer)
- Friendly, warm, and enthusiastic personality
- Responds to greetings naturally

### 3. ✅ Natural Conversations
Raisy now understands and responds to:

#### Greetings:
- "Hey Raisy" → "Hi! I'm Raisy, your smart bulb assistant. How can I help you today?"
- "Hello Raisy" → Warm greeting response
- "Hi" → Friendly response

#### Bulb Control:
- "Turn on bulb 1" → Controls the first bulb
- "Turn off bulb 3" → Controls the third bulb
- "Turn on bulb 2 and bulb 4" → Controls multiple bulbs
- "Turn on all bulbs" → Turns all bulbs on
- "Turn off everything" → Turns all bulbs off

#### Status Queries:
- "Which bulbs are on?" → Tells you the current status
- "What's the status?" → Reports all bulb states
- "Are any bulbs on?" → Checks and responds

## Raisy's Personality

Raisy is:
- 🌟 **Friendly** - Talks like a helpful friend
- 😊 **Warm** - Uses encouraging and positive language
- 💬 **Conversational** - Responds naturally, not robotic
- ✨ **Enthusiastic** - Shows excitement when helping you

## Example Conversations

### Greeting Raisy
```
You: "Hey Raisy"
Raisy: "Hi! I'm Raisy, your smart bulb assistant. How can I help you today?"
```

### Controlling Bulbs
```
You: "Turn on bulb 1"
Raisy: "Sure! Turning on bulb 1 for you."
```

```
You: "Turn off all bulbs"
Raisy: "Got it! Turning off all bulbs."
```

### Checking Status
```
You: "Which bulbs are on?"
Raisy: "Right now, bulbs 1 and 3 are on, while bulbs 2 and 4 are off."
```

### Multiple Bulbs
```
You: "Turn on bulb 2 and bulb 3"
Raisy: "Sure! Turning on bulb 2 and bulb 3 for you."
```

## Voice Commands Guide

### Say These Commands:

1. **Greetings**
   - "Hey Raisy"
   - "Hello Raisy"
   - "Hi Raisy"

2. **Single Bulb Control**
   - "Turn on bulb 1"
   - "Turn off bulb 2"
   - "Switch on bulb 3"
   - "Switch off bulb 4"

3. **Multiple Bulbs**
   - "Turn on bulb 1 and bulb 2"
   - "Turn off bulb 2 and bulb 3"
   - "Turn on bulb 1, 2, and 3"

4. **All Bulbs**
   - "Turn on all bulbs"
   - "Turn off all bulbs"
   - "Turn everything on"
   - "Turn everything off"

5. **Status Check**
   - "Which bulbs are on?"
   - "What's the status?"
   - "Are any bulbs on?"

6. **Natural Language** (Raisy understands these too!)
   - "Can you turn on bulb one?"
   - "Please turn off bulb number 3"
   - "I need all the bulbs on"
   - "Switch off the lights"

## Technical Details

### Bulb Mapping
- **Bulb 1** → LED1 → GPIO Pin 2
- **Bulb 2** → LED2 → GPIO Pin 4
- **Bulb 3** → LED3 → GPIO Pin 5
- **Bulb 4** → LED4 → GPIO Pin 18

### Voice
- **Name**: Raisy
- **Voice Model**: OpenAI Shimmer (female)
- **Language**: English
- **Personality**: Friendly, warm, helpful

## Interface Updates

```
┌─────────────────────────────────────┐
│  [Bulb 1] [Bulb 2] [Bulb 3] [Bulb 4] │  ← Status Icons
│                                      │
│          ╭─────────────╮            │
│          │   Raisy      │            │
│          │  [Voice UI] │            │  ← Large Button
│          ╰─────────────╯            │
│                                      │
│         "Tap to speak"               │
│                                      │
│        Try saying:                  │
│        🎤 "Hey Raisy"                │
│        🎤 "Turn on bulb 1"          │
│        🎤 "Turn off all bulbs"      │
└─────────────────────────────────────┘
```

## Tips for Best Experience

1. **Speak clearly** and naturally - Raisy understands casual speech
2. **Say "bulb"** not "LED" for better understanding
3. **Use numbers** - "bulb 1", "bulb 2", etc.
4. **Be friendly** - Raisy responds better to polite requests!
5. **Greet Raisy** - Say "Hey Raisy" to start a conversation

## Try It Now!

1. Run: `npm run dev`
2. Allow microphone permission
3. Tap the large circular button
4. Say: **"Hey Raisy"**
5. Wait for Raisy's warm greeting
6. Try: **"Turn on bulb 1"**
7. Enjoy your friendly smart bulb assistant! 🎉

---

**Remember**: Raisy is here to help! Treat her like a friend, and she'll make controlling your bulbs a delightful experience. 💡✨
