# My Feyn Brain - AI-Powered Learning with the Feynman Technique

A modern web application that helps you master any subject using the Feynman technique, powered by AI for personalized feedback and guidance.

## Features

- **Document Upload**: Support for DOCX and TXT files
- **AI-Powered Analysis**: Automatic concept extraction and summary generation
- **Voice Recording**: Real-time transcription of your explanations
- **Intelligent Questioning**: AI-generated follow-up questions to deepen understanding
- **Performance Analytics**: Detailed metrics on accuracy, completeness, and more
- **Session History**: Track your learning progress over time
- **Text-to-Speech**: AI voice reads questions aloud

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for the following services:
  - OpenAI (for AI analysis and question generation)
  - AssemblyAI (for real-time speech transcription)
  - ElevenLabs (for text-to-speech functionality)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd my-feyn-brain
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit the `.env` file and add your API keys:
```env
GROQ_API_KEY=your_groq_api_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
```

5. Install additional dependencies for file processing:
```bash
npm install mammoth
```

### API Integration Setup

The application currently uses mock APIs for development. To integrate with real APIs:

#### 1. OpenAI Integration
- Replace mock calls in `src/utils/mockApis.ts`
- Implement real OpenAI API calls for:
  - Concept summary generation
  - Explanation evaluation
  - Follow-up question generation

#### 2. AssemblyAI Integration
- Replace mock transcription in `src/utils/mockApis.ts`
- Implement real-time WebSocket transcription
- Set up microphone access and audio streaming

#### 3. ElevenLabs Integration
- Replace mock text-to-speech in `src/utils/mockApis.ts`
- Implement real audio generation and playback

#### 4. File Processing
- Replace mock file processing in `src/components/Upload/DocumentUpload.tsx`
- Implement real DOCX and TXT parsing

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## API Keys Setup

### OpenAI API
1. Visit [OpenAI API](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env` file as `VITE_OPENAI_API_KEY`

### AssemblyAI API
1. Visit [AssemblyAI](https://www.assemblyai.com/)
2. Sign up and get your API key
3. Add it to your `.env` file as `VITE_ASSEMBLYAI_API_KEY`

### ElevenLabs API
1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Sign up and get your API key
3. Add it to your `.env` file as `VITE_ELEVENLABS_API_KEY`
4. Optionally, choose a voice ID and add it as `VITE_ELEVENLABS_VOICE_ID`

## File Structure

```
src/
├── components/
│   ├── Analytics/          # Analytics dashboard and charts
│   ├── History/           # Session history and management
│   ├── Layout/            # Sidebar and layout components
│   ├── Study/             # Core study session components
│   └── Upload/            # Document upload functionality
├── types/                 # TypeScript type definitions
├── utils/
│   ├── localStorage.ts    # Local storage management
│   └── mockApis.ts       # Mock API implementations (replace with real APIs)
└── App.tsx               # Main application component
```

## Technologies Used

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons
- **Vite** for build tooling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
