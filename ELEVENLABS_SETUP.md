# ElevenLabs Voice AI Setup Guide

This guide will help you implement real ElevenLabs text-to-speech functionality in your Feyn Brain application.

## Step 1: Get Your ElevenLabs API Key

1. **Sign up for ElevenLabs**
   - Go to [https://elevenlabs.io/](https://elevenlabs.io/)
   - Create a free account (includes 10,000 characters per month)
   - For more usage, consider upgrading to a paid plan

2. **Get Your API Key**
   - Log into your ElevenLabs account
   - Go to your [Profile Settings](https://elevenlabs.io/profile)
   - Copy your API key from the "API Key" section

3. **Add to Environment Variables**
   - Create a `.env` file in your project root (if it doesn't exist)
   - Add your API key:
   ```env
   VITE_ELEVENLABS_API_KEY=your_api_key_here
   ```

## Step 2: Choose a Voice (Optional)

ElevenLabs offers many high-quality voices. Here are some popular options:

### Free Voices (Available on all plans):
- `pNInz6obpgDQGcFmaJgB` - **Rachel** (default, clear female voice)
- `EXAVITQu4vr4xnSDxMaL` - **Bella** (warm female voice)
- `VR6AewLTigWG4xSOukaG` - **Arnold** (deep male voice)
- `TxGEqnHWrfWFTfGW9XjX` - **Josh** (young male voice)

### Premium Voices (Require paid subscription):
- `jsCqWAovK2LkecY7zXl4` - **Freya** (British female voice)
- `21m00Tcm4TlvDq8ikWAM` - **Rachel** (alternative version)
- `AZnzlk1XvdvUeBnXmlld` - **Domi** (confident female voice)
- `CYw3kZ02Hs0563khs1Fj` - **Dave** (conversational male voice)

Add your chosen voice to your `.env` file:
```env
VITE_ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
```

If you don't specify a voice ID, it will default to Rachel.

## Step 3: Enable the Real Implementation

The code is already set up to use the real ElevenLabs API! Here's what's already implemented:

### In `src/utils/mockApis.ts`:
- Real API call to ElevenLabs text-to-speech endpoint
- Proper error handling and fallback to mock
- Audio blob creation and URL generation
- Configurable voice settings

### In `src/components/Study/StudySession.tsx`:
- Real audio playback using the AudioManager
- Proper cleanup of audio resources
- Error handling for failed audio playback

## Step 4: Test the Implementation

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Upload a document and start a study session**

3. **When you reach the questions phase:**
   - Click the "Play" button next to a question
   - You should hear the AI voice reading the question aloud
   - The voice will be generated using ElevenLabs API

## Step 5: Customize Voice Settings (Optional)

You can customize the voice characteristics by modifying the `voice_settings` in `src/utils/mockApis.ts`:

```javascript
voice_settings: {
  stability: 0.5,        // 0-1: Lower = more variable, Higher = more stable
  similarity_boost: 0.5, // 0-1: Lower = more creative, Higher = more similar
  style: 0.0,           // 0-1: Only available for some voices
  use_speaker_boost: true // Boost similarity to original speaker
}
```

### Voice Settings Explained:
- **Stability (0-1)**: Controls how consistent the voice sounds
  - Lower values (0.1-0.3): More expressive and variable
  - Higher values (0.7-0.9): More stable and consistent
  
- **Similarity Boost (0-1)**: Controls how similar the output is to the original voice
  - Lower values (0.1-0.3): More creative interpretation
  - Higher values (0.7-0.9): Closer to the original voice sample
  
- **Style (0-1)**: Available for some voices, controls speaking style
- **Speaker Boost**: Enhances similarity to the original speaker

## Step 6: Monitor Usage

- Check your usage at [https://elevenlabs.io/usage](https://elevenlabs.io/usage)
- Free tier includes 10,000 characters per month
- Each question typically uses 50-200 characters
- Consider upgrading if you need more usage

## Troubleshooting

### Common Issues:

1. **"API key not found" error**
   - Make sure your `.env` file is in the project root
   - Restart your development server after adding the API key
   - Check that the key starts with `VITE_`

2. **"Failed to play audio" error**
   - Check your internet connection
   - Verify your API key is correct
   - Check the browser console for detailed error messages

3. **No sound playing**
   - Check your browser's audio settings
   - Make sure your device volume is up
   - Some browsers require user interaction before playing audio

4. **Voice sounds different than expected**
   - Try different voice IDs from the list above
   - Adjust the voice settings (stability, similarity_boost)
   - Some voices may require a paid subscription

### Browser Compatibility:
- Chrome: Full support
- Firefox: Full support
- Safari: Full support
- Edge: Full support

## Cost Optimization Tips

1. **Use shorter questions**: The AI generates concise questions to minimize character usage
2. **Cache audio**: Consider implementing audio caching for repeated questions
3. **Monitor usage**: Keep track of your monthly character usage
4. **Choose appropriate voice**: Some premium voices may cost more

## Next Steps

Once ElevenLabs is working, you might want to:
1. Implement OpenAI for better AI analysis
2. Add AssemblyAI for real speech transcription
3. Add voice selection in the UI
4. Implement audio caching for better performance

The application is designed to gracefully fall back to mock implementations if any API is unavailable, so you can implement these services incrementally.