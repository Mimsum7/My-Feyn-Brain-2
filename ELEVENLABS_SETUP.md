# ElevenLabs API Integration

This document explains how to set up and use the ElevenLabs API integration for text-to-speech functionality in the Feyn Brain application.

## Setup

### 1. Get ElevenLabs API Key

1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Sign up for an account
3. Navigate to your profile settings
4. Copy your API key

### 2. Configure Environment Variables

Create a `.env` file in your project root (if it doesn't exist) and add:

```env
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
```

**Note:** The `VITE_ELEVENLABS_VOICE_ID` is optional. If not provided, the application will use the default voice ID `pNInz6obpgDQGcFmaJgB`.

### 3. Choose a Voice (Optional)

You can customize the voice used for text-to-speech:

1. Visit the [ElevenLabs Voice Library](https://elevenlabs.io/voice-library)
2. Browse available voices
3. Copy the voice ID from the URL or voice details
4. Add it to your `.env` file as `VITE_ELEVENLABS_VOICE_ID`

## Implementation Details

### Files Modified

- `src/utils/elevenLabsApi.ts` - New file containing the ElevenLabs API integration
- `src/components/Study/StudySession.tsx` - Updated to use real ElevenLabs API instead of mock
- `src/utils/mockApis.ts` - Removed ElevenLabs mock implementation

### Key Features

1. **Real-time Text-to-Speech**: Converts AI-generated questions to natural-sounding speech
2. **Audio Playback Management**: Proper cleanup of audio resources to prevent memory leaks
3. **Error Handling**: Graceful error handling with user-friendly messages
4. **Voice Customization**: Support for different ElevenLabs voices
5. **TypeScript Support**: Fully typed implementation

### API Methods

The `ElevenLabsAPI` class provides the following methods:

- `convertTextToSpeech(text: string): Promise<string>` - Converts text to speech and returns audio URL
- `getAvailableVoices(): Promise<any[]>` - Fetches available voices from ElevenLabs
- `getVoiceDetails(voiceId: string): Promise<any>` - Gets details for a specific voice

### Usage in StudySession

The text-to-speech functionality is automatically triggered when:

1. A user reaches the questions phase of their study session
2. The AI assistant plays a question aloud
3. The user clicks the play button in the AI assistant interface

## Error Handling

The integration includes comprehensive error handling:

- **Missing API Key**: Shows alert asking user to configure the API key
- **Network Errors**: Logs errors and shows user-friendly messages
- **Audio Playback Errors**: Handles audio loading and playback failures
- **Resource Cleanup**: Automatically cleans up audio URLs to prevent memory leaks

## Testing

To test the integration:

1. Ensure your `.env` file has the correct API key
2. Start the development server: `npm run dev`
3. Upload a document and start a study session
4. Reach the questions phase
5. Click the play button to hear the AI-generated questions

## Troubleshooting

### Common Issues

1. **"ElevenLabs API key not configured"**
   - Check that `VITE_ELEVENLABS_API_KEY` is set in your `.env` file
   - Ensure the `.env` file is in the project root directory

2. **"Failed to play audio"**
   - Verify your ElevenLabs API key is valid
   - Check your internet connection
   - Ensure you have sufficient ElevenLabs credits

3. **Audio not playing**
   - Check browser console for errors
   - Ensure your browser supports audio playback
   - Try refreshing the page

### Debug Mode

To enable debug logging, add this to your browser console:

```javascript
localStorage.setItem('debug', 'elevenlabs');
```

## API Limits

Be aware of ElevenLabs API limits:

- **Free Tier**: Limited characters per month
- **Paid Tiers**: Higher limits based on subscription
- **Rate Limiting**: API calls are rate-limited

Monitor your usage in the ElevenLabs dashboard to avoid hitting limits during development.

## Future Enhancements

Potential improvements for the ElevenLabs integration:

1. **Voice Selection UI**: Allow users to choose voices from the application
2. **Audio Speed Control**: Adjust playback speed
3. **Offline Caching**: Cache frequently used audio
4. **Multiple Languages**: Support for different languages
5. **Custom Voice Training**: Integration with custom voice training features 