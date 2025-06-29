# AssemblyAI API Integration

This document explains how to set up and use the AssemblyAI API integration for real-time speech transcription in the Feyn Brain application.

## Setup

### 1. Get AssemblyAI API Key

1. Visit [AssemblyAI](https://www.assemblyai.com/)
2. Sign up for an account
3. Navigate to your account settings
4. Copy your API key

### 2. Configure Environment Variables

Create a `.env` file in your project root (if it doesn't exist) and add:

```env
VITE_ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here
```

## Implementation Details

### Files Modified

- `src/utils/assemblyAIApi.ts` - New file containing the AssemblyAI API integration
- `src/components/Study/StudySession.tsx` - Updated to use real AssemblyAI API instead of mock
- `src/utils/mockApis.ts` - Removed AssemblyAI mock implementation

### Key Features

1. **Real-time Transcription**: Live speech-to-text conversion using WebSocket connection
2. **Microphone Integration**: Automatic microphone access and audio recording
3. **Error Handling**: Comprehensive error handling for connection and permission issues
4. **Browser Compatibility**: Checks for required browser APIs
5. **Resource Management**: Proper cleanup of audio streams and WebSocket connections
6. **TypeScript Support**: Fully typed implementation

### API Methods

The `AssemblyAIAPI` class provides the following methods:

#### Instance Methods
- `startTranscription(onTranscript, onComplete, onError): TranscriptionService` - Starts real-time transcription

#### Static Methods
- `checkBrowserSupport(): { supported: boolean; errors: string[] }` - Checks if browser supports required APIs
- `requestMicrophonePermission(): Promise<boolean>` - Requests microphone access

### Usage in StudySession

The transcription functionality is automatically triggered when:

1. A user starts explaining a concept (explain phase)
2. A user answers AI-generated questions (questions phase)
3. The user clicks the microphone button to start recording

## Technical Implementation

### WebSocket Connection

The integration uses AssemblyAI's real-time WebSocket API:

- **Endpoint**: `wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000`
- **Authentication**: API key passed as WebSocket protocol
- **Audio Format**: 16kHz mono audio stream
- **Data Format**: Base64-encoded audio chunks sent every 100ms

### Audio Processing

1. **Microphone Access**: Requests audio stream with specific constraints
2. **MediaRecorder**: Records audio in WebM format with Opus codec
3. **Data Conversion**: Converts audio chunks to base64 for transmission
4. **Real-time Streaming**: Sends audio data continuously to AssemblyAI

### Message Types

The WebSocket connection handles various message types:

- `SessionBegins` - Transcription session started
- `PartialTranscript` - Interim transcription results
- `FinalTranscript` - Final transcription results
- `SessionTerminated` - Session ended
- `Error` - Error messages from the service

## Error Handling

The integration includes comprehensive error handling:

- **Missing API Key**: Shows alert asking user to configure the API key
- **Browser Support**: Checks for required APIs (MediaDevices, WebSocket, MediaRecorder)
- **Microphone Permissions**: Handles permission denial gracefully
- **Network Errors**: Handles WebSocket connection failures
- **Audio Recording Errors**: Manages audio stream issues

## Browser Requirements

The AssemblyAI integration requires the following browser APIs:

- **MediaDevices API**: For microphone access
- **WebSocket API**: For real-time communication
- **MediaRecorder API**: For audio recording
- **FileReader API**: For audio data conversion

### Supported Browsers

- Chrome 66+
- Firefox 60+
- Safari 14+
- Edge 79+

## Testing

To test the integration:

1. Ensure your `.env` file has the correct API key
2. Start the development server: `npm run dev`
3. Upload a document and start a study session
4. Click the microphone button to start recording
5. Speak clearly and watch for real-time transcription

## Troubleshooting

### Common Issues

1. **"Browser not supported"**
   - Check that you're using a modern browser
   - Ensure HTTPS is enabled (required for microphone access)

2. **"Microphone permission denied"**
   - Check browser microphone permissions
   - Try refreshing the page and allowing microphone access
   - Check if microphone is being used by another application

3. **"Connection error"**
   - Verify your AssemblyAI API key is valid
   - Check your internet connection
   - Ensure you have sufficient AssemblyAI credits
   - Make sure your API key is in the correct format (alphanumeric, 32-64 characters)
   - Check that you're not behind a restrictive firewall or proxy

4. **"WebSocket connection failed"**
   - This usually indicates an authentication issue
   - Verify your API key is correct and active
   - Check that you're using HTTPS (required for WebSocket connections)
   - Ensure your browser supports WebSocket connections
   - Try refreshing the page and checking the browser console for detailed error messages

5. **"Invalid AssemblyAI API key format"**
   - AssemblyAI API keys should be alphanumeric and 32-64 characters long
   - Make sure there are no extra spaces or special characters
   - Copy the API key directly from your AssemblyAI dashboard
   - Check that the environment variable is properly set in your `.env` file

6. **No transcription appearing**
   - Speak clearly and at a normal volume
   - Check that your microphone is working
   - Look for error messages in the browser console

7. **"Maximum call stack size exceeded"**
   - This was a bug that has been fixed in the latest version
   - The issue was caused by circular calls between stop functions
   - If you encounter this, please update to the latest version

### Debug Mode

To enable debug logging, check the browser console for detailed logs:

- WebSocket connection status
- Audio recording events
- Transcription messages
- Error details

## API Limits

Be aware of AssemblyAI API limits:

- **Free Tier**: Limited transcription hours per month
- **Paid Tiers**: Higher limits based on subscription
- **Rate Limiting**: API calls are rate-limited
- **Concurrent Sessions**: Limited concurrent transcription sessions

Monitor your usage in the AssemblyAI dashboard to avoid hitting limits.

## Security Considerations

- **API Key**: Never expose your API key in client-side code (use environment variables)
- **HTTPS**: Always use HTTPS in production (required for microphone access)
- **Permissions**: Only request microphone access when needed
- **Data Privacy**: Audio data is processed by AssemblyAI servers

## Performance Optimization

- **Audio Quality**: Uses optimal audio settings for transcription accuracy
- **Network Efficiency**: Sends audio data in small chunks to minimize latency
- **Resource Cleanup**: Properly cleans up audio streams and connections
- **Error Recovery**: Graceful handling of connection interruptions

## Future Enhancements

Potential improvements for the AssemblyAI integration:

1. **Language Support**: Support for multiple languages
2. **Custom Models**: Integration with custom speech recognition models
3. **Speaker Diarization**: Identify different speakers
4. **Sentiment Analysis**: Analyze speech sentiment
5. **Offline Mode**: Fallback to browser-based speech recognition
6. **Audio Visualization**: Real-time audio waveform display 