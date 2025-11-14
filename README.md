MyFeynBrain
AI-Powered Learning Using the Feynman Technique

MyFeynBrain is an interactive learning web application that helps you explain concepts aloud, get AI-generated feedback, answer dynamic follow-up questions, and receive an overall understanding score—all based on the Feynman Technique.

The system uses Groq for fast transcription and AI reasoning, and ElevenLabs for natural voice playback of AI-generated questions.

Features:
Voice-Based Learning
Real-time audio recording in the browser
Groq Whisper-large-v3 Turbo transcription
Accurate text extraction from your spoken explanation

AI Understanding Evaluation:
GPT-OSS-120B (Groq) evaluates your explanation
AI scores your understanding
Generates a breakdown of:
Accuracy
Completeness
Clarity
Confidence
Missing concepts

Dynamic Follow-Up Questions
AI creates context-aware follow-up questions based on what you actually said
Spoken aloud using ElevenLabs TTS
You respond by voice using the same recording button

Session Summary
Final evaluation after your explanation + answers
Weighted scoring
“Well understood / Almost there / Needs attention” tags

Local Storage Persistence
All sessions saved locally on your device
No authentication or cloud database required

Tech Stack
Frontend
React + TypeScript
Vite
TailwindCSS
Framer Motion
Lucide Icons

AI Backend
Groq (Transcription + GPT-OSS-120B reasoning)
ElevenLabs (Text-to-speech)
Node.js + Express server
Multer for audio uploads

Installation
1️⃣ Clone the repository
git clone <your-repo-url>
cd MyFeynBrain

2️⃣ Install dependencies
npm install

3️⃣ Create your .env file
cp .env.example .env

4️⃣ Add your API keys
# === GROQ AI (REQUIRED) ===
GROQ_API_KEY=your_groq_key_here

# === ELEVENLABS (REQUIRED) ===
VITE_ELEVENLABS_API_KEY=your_elevenlabs_key_here
VITE_ELEVENLABS_VOICE_ID=your_voice_id_here

TTS Model (must be free-tier compatible)
VITE_ELEVENLABS_MODEL=eleven_flash_v2


⚠️ Note: Free ElevenLabs accounts cannot use eleven_monolingual_v1.
Use: eleven_flash_v2 or any other free-tier listed model.

5️⃣ Start the frontend
npm run dev

6️⃣ Start the backend server
node server.js


App runs at:

Frontend: http://localhost:5173
Backend:  http://localhost:5000

Security & Storage
Why the app has no authentication
This is a local-first educational tool
No user accounts or cloud sync needed
Reduces complexity and cost
Avoids storing sensitive audio or personal data on servers

Where data is stored
Type of Data	Storage Method	Location
Session summaries	Browser LocalStorage	On your device
Audio recordings	Temporary server files during upload	Deleted after transcription
Study history	Browser LocalStorage	On your device

Security Measures
API keys are loaded server-side (never exposed to browser)
CORS restricted to local development origin
Audio uploads validated + restricted to safe formats
Temporary audio files auto-renamed and never publicly served

Project Structure
src/
├── components/
│   ├── Study/               # Recording, questions, evaluation UI
│   ├── Analytics/           # Result visualization
│   ├── History/             # Session history UI
│   ├── Upload/              # Document upload (future)
│   └── Layout/              # Sidebar, layout, navigation
│
├── utils/
│   ├── localStorage.ts      # Persistent session storage
│   ├── elevenLabsApi.ts     # TTS integration
│   └── groqApi.ts           # Transcription + GPT-OSS calls
│
└── server.js                # Node backend for audio + AI

API Usage Summary
🟦 Groq API
Used for:
Speech-to-text transcription (whisper-large-v3-turbo)
GPT-OSS-120B evaluation + reasoning
Dynamic question generation

🟪 ElevenLabs API
Used for:
TTS playback of AI questions
Uses free-tier models (e.g., eleven_flash_v2)

Development

Run Vite dev server:
npm run dev


Run backend server:
node server.js
