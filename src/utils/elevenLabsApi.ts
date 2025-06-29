// ElevenLabs API Integration
// Environment variables required:
// VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
// VITE_ELEVENLABS_VOICE_ID=your_preferred_voice_id (optional)

interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
}

interface ElevenLabsRequest {
  text: string;
  model_id: string;
  voice_settings: ElevenLabsVoiceSettings;
}

export class ElevenLabsAPI {
  private apiKey: string;
  private voiceId: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    this.voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB'; // Default voice
    
    if (!this.apiKey) {
      throw new Error('VITE_ELEVENLABS_API_KEY is required in environment variables');
    }
  }

  async convertTextToSpeech(text: string): Promise<string> {
    try {
      const requestBody: ElevenLabsRequest = {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      };

      const response = await fetch(`${this.baseUrl}/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${errorData.detail || 'Unknown error'}`);
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('Error converting text to speech:', error);
      throw error;
    }
  }

  async getAvailableVoices(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching available voices:', error);
      throw error;
    }
  }

  async getVoiceDetails(voiceId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/voices/${voiceId}`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voice details: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching voice details:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const elevenLabsAPI = new ElevenLabsAPI(); 