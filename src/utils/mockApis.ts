import { PerformanceMetrics } from '../types';

// TODO: REPLACE WITH REAL OPENAI API
// Create a .env file in your project root with:
// VITE_OPENAI_API_KEY=your_openai_api_key_here
// VITE_OPENAI_MODEL=gpt-4 (or your preferred model)

// Mock OpenAI GPT-4 API
export const mockGPTAPI = {
  async generateConceptSummary(text: string): Promise<string> {
    // TODO: REPLACE WITH REAL OPENAI API CALL
    // Example implementation:
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator. Generate a concise summary of key concepts from the provided text that would be suitable for the Feynman technique.'
          },
          {
            role: 'user',
            content: `Please identify and summarize the key concepts from this text:\n\n${text}`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
    */
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return `Key concepts identified in your text:\n\n• Core principles and fundamental ideas\n• Important relationships between concepts\n• Critical processes and mechanisms\n• Practical applications and examples\n\nThis content covers essential topics that are perfect for the Feynman technique. Try explaining these concepts in your own simple words!`;
  },

  async evaluateExplanation(original: string, explanation: string): Promise<PerformanceMetrics> {
    // TODO: REPLACE WITH REAL OPENAI API CALL
    // Example implementation:
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator evaluating student explanations using the Feynman technique. Rate the explanation on accuracy (0-100), completeness (0-100), use of own words (0-100), and logical flow (0-100). Return a JSON object with these scores and an overall category.'
          },
          {
            role: 'user',
            content: `Original text: ${original}\n\nStudent explanation: ${explanation}\n\nPlease evaluate this explanation and return scores as JSON.`
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      })
    });
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
    */
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock evaluation based on explanation length and content
    const accuracy = Math.random() * 40 + 60; // 60-100%
    const completeness = Math.random() * 30 + 70; // 70-100%
    const ownWords = Math.random() * 20 + 80; // 80-100%
    const logicalFlow = Math.random() * 25 + 75; // 75-100%
    
    const overallScore = (accuracy + completeness + ownWords + logicalFlow) / 4;
    
    let category: PerformanceMetrics['category'];
    if (overallScore >= 80) category = 'Well Understood';
    else if (overallScore >= 60) category = 'Almost There';
    else category = 'Needs Attention';
    
    return {
      accuracy: Math.round(accuracy),
      completeness: Math.round(completeness),
      ownWords: Math.round(ownWords),
      logicalFlow: Math.round(logicalFlow),
      category,
      overallScore: Math.round(overallScore)
    };
  },

  async generateFollowUpQuestions(explanation: string, performanceMetrics: PerformanceMetrics): Promise<string[]> {
    // TODO: REPLACE WITH REAL OPENAI API CALL
    // Example implementation:
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Generate 2-3 follow-up questions to help the student deepen their understanding using the Feynman technique. Questions should encourage simpler explanations and real-world connections.'
          },
          {
            role: 'user',
            content: `Student explanation: ${explanation}\n\nPerformance: ${JSON.stringify(performanceMetrics)}\n\nGenerate appropriate follow-up questions.`
          }
        ],
        max_tokens: 300,
        temperature: 0.8
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content.split('\n').filter(q => q.trim());
    */
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const questions = [
      "Can you explain this concept as if you were teaching it to a 5-year-old?",
      "What would happen if this principle didn't exist?",
      "How does this relate to something you encounter in daily life?",
      "What's the most important thing someone should remember about this topic?",
      "Can you think of an analogy that might help explain this better?"
    ];
    
    // Return 2-3 random questions based on performance
    const numQuestions = performanceMetrics.overallScore < 70 ? 3 : 2;
    return questions.sort(() => Math.random() - 0.5).slice(0, numQuestions);
  }
};

// TODO: REPLACE WITH REAL ASSEMBLYAI API
// Add to your .env file:
// VITE_ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here

// Mock AssemblyAI API
export const mockAssemblyAI = {
  startTranscription(onTranscript: (text: string) => void, onComplete: () => void) {
    // TODO: REPLACE WITH REAL ASSEMBLYAI REAL-TIME TRANSCRIPTION
    // Example implementation:
    /*
    const socket = new WebSocket('wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000', [
      'token',
      import.meta.env.VITE_ASSEMBLYAI_API_KEY
    ]);
    
    socket.onopen = () => {
      // Start recording audio from microphone
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              // Convert audio data to base64 and send to AssemblyAI
              const reader = new FileReader();
              reader.onloadend = () => {
                const base64data = reader.result.split(',')[1];
                socket.send(JSON.stringify({ audio_data: base64data }));
              };
              reader.readAsDataURL(event.data);
            }
          };
          mediaRecorder.start(100); // Send data every 100ms
        });
    };
    
    socket.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.message_type === 'PartialTranscript') {
        onTranscript(data.text);
      } else if (data.message_type === 'FinalTranscript') {
        onTranscript(data.text);
      }
    };
    
    return {
      stop: () => {
        socket.close();
        onComplete();
      }
    };
    */
    
    let isRecording = true;
    const mockPhrases = [
      "So basically, this concept is about...",
      "The main idea here is that...",
      "What I understand from this is...",
      "The key point seems to be...",
      "In simpler terms, this means..."
    ];
    
    let phraseIndex = 0;
    
    const interval = setInterval(() => {
      if (!isRecording || phraseIndex >= mockPhrases.length) {
        clearInterval(interval);
        onComplete();
        return;
      }
      
      onTranscript(mockPhrases[phraseIndex]);
      phraseIndex++;
    }, 2000);
    
    return {
      stop: () => {
        isRecording = false;
        clearInterval(interval);
        onComplete();
      }
    };
  }
};

// TODO: REPLACE WITH REAL ELEVENLABS API
// Add to your .env file:
// VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
// VITE_ELEVENLABS_VOICE_ID=your_preferred_voice_id (optional)

// Mock ElevenLabs API
export const mockElevenLabs = {
  async convertTextToSpeech(text: string): Promise<string> {
    // TODO: REPLACE WITH REAL ELEVENLABS API CALL
    // Example implementation:
    /*
    const voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Default voice
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });
    
    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
    */
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    // Return a mock audio URL (in real implementation, this would be actual audio)
    return `data:audio/mp3;base64,mock-audio-${Date.now()}`;
  }
};