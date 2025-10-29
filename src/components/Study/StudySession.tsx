import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, RotateCcw } from 'lucide-react';
import {
  UploadedDocument,
  StudySession as StudySessionType,
  StudyPhase,
  AIAssistantState
} from '../../types';
// import { AIAssistant } from './AIAssistant';
import { RecordingInterface } from './RecordingInterface';
import { PerformanceSummary } from './PerformanceSummary';
import { groqAPI, evaluateExplanation } from "../../utils/groqApis";
import { elevenLabsAPI } from '../../utils/elevenLabsApi';
import { storage } from '../../utils/localStorage';
import { AIQuestionFlow } from "../AIQuestionFlow";
import { generateDynamicQuestions } from '../../utils/groqEvaluation';

interface StudySessionProps {
  document: UploadedDocument;
  conceptSummary: string;
  onSessionComplete: (session: StudySessionType) => void;
}

export const StudySession: React.FC<StudySessionProps> = ({
  document,
  conceptSummary,
  onSessionComplete
}) => {
  const [phase, setPhase] = useState<StudyPhase>('explain');
  const [_userAnswers, setUserAnswers] = useState<string[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [fullExplanation, setFullExplanation] = useState('');
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<string[]>([]);
  const [aiState, setAiState] = useState<AIAssistantState>({
    isListening: false,
    isProcessing: false,
    isPlaying: false,
    currentQuestion: '',
    passCount: 0
  });
  const [hasQuestionBeenPlayed, setHasQuestionBeenPlayed] = useState(false);
  const [session, setSession] = useState<StudySessionType>({
    sessionID: Date.now().toString(),
    timestamp: Date.now(),
    originalText: document.content,
    userExplanation: '',
    aiQuestions: [],
    userResponses: [],
    performanceMetrics: {
      accuracy: 0,
      completeness: 0,
      ownWords: 0,
      logicalFlow: 0,
      category: 'Needs Attention',
      overallScore: 0
    },
    documentTitle: document.name
  });

  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrl = useRef<string | null>(null);

  const transcriptionServiceRef = useRef<any>(null);
  let silenceTimer: NodeJS.Timeout | null = null;

// --- AUDIO RECORDING LOGIC (with Groq) ---

const startListening = async () => {
  setAiState(prev => ({ ...prev, isListening: true }));
  console.log("🎙️ Starting Groq recording...");

  try {
    transcriptionServiceRef.current = await groqAPI.startRecording(
      (text: string) => {
        console.log("📝 Partial Groq transcript:", text);
        setCurrentTranscript(prev => prev + (prev ? " " : "") + text);
      },
      () => console.log("✅ Groq recording completed.")
    );
  } catch (error) {
    console.error("❌ Error starting Groq recording:", error);
    setAiState(prev => ({ ...prev, isListening: false }));
  }
};

const stopListening = async () => {
  console.log("🛑 Stopping Groq recording...");

  if (!transcriptionServiceRef.current || !transcriptionServiceRef.current.stopRecording) {
    console.warn("⚠️ No active Groq recording session found.");
    return;
  }

  try {
    const transcript = await transcriptionServiceRef.current.stopRecording();
    transcriptionServiceRef.current = null;
    setAiState(prev => ({ ...prev, isListening: false }));

    if (transcript) {
      console.log("🎧 Final Groq transcript:", transcript);
      setCurrentTranscript(transcript);
      setFullExplanation(prev => prev + (prev ? " " : "") + transcript);

      if (phase === "explain") {
        processExplanation(transcript);
      } else if (phase === "questions") {
        const newResponses = [...userResponses, transcript];
        setUserResponses(newResponses);

        if (currentQuestionIndex < aiQuestions.length - 1) {
          const nextIndex = currentQuestionIndex + 1;
          const nextQuestion = aiQuestions[nextIndex];
        
          setCurrentQuestionIndex(nextIndex);
          setAiState(prev => ({
            ...prev,
            currentQuestion: nextQuestion,
            passCount: prev.passCount
          }));
        
          setHasQuestionBeenPlayed(false);
        
          // 🎧 Automatically speak next question
          await playQuestionAudio(nextQuestion);
        }              
      }
    }
  } catch (error) {
    console.error("❌ Error stopping Groq recording:", error);
    setAiState(prev => ({ ...prev, isListening: false }));
  }
};

  // NEW GROQ TRANSCRIPTION - Active implementation
  const uploadAndTranscribeRecording = async () => {
    try {
      console.log("🎧 Uploading and transcribing with Groq...");
      const formData = new FormData();

      const response = await fetch("http://localhost:5000/api/groq-transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("🗣️ Transcription result:", data);

      if (data.transcript) {
        const newSession = {
          id: Date.now().toString(),
          title: data.transcript.slice(0, 50) + "...",
          date: new Date().toLocaleDateString(),
          score: Math.floor(Math.random() * 40) + 60,
        };

        const existingSessions =
          JSON.parse(localStorage.getItem("sessions") || "[]");
        existingSessions.unshift(newSession);
        localStorage.setItem("sessions", JSON.stringify(existingSessions));

        console.log("✅ Transcript saved to session history!");
      }
    } catch (error) {
      console.error("❌ Error uploading or transcribing:", error);
    }
  };
  const generateDynamicQuestions = async (explanation: string) => {
    try {
      console.log("🧩 Generating dynamic questions from Groq...");
      const response = await fetch("http://localhost:5000/api/groq-generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          explanation,
          metrics: session.performanceMetrics
        }),
      });
  
      const data = await response.json();
  
      if (data.questions && Array.isArray(data.questions)) {
        console.log("✅ Groq questions:", data.questions);
        return data.questions;
      } else {
        console.warn("⚠️ Invalid Groq question response:", data);
        return [
          "Can you explain that again more simply?",
          "What is the main idea behind what you just said?",
          "Can you give a real-world example of that?"
        ];
      }
    } catch (err) {
      console.error("❌ Error fetching Groq questions:", err);
      return [
        "Can you explain that again more simply?",
        "What is the main idea behind what you just said?",
        "Can you give a real-world example of that?"
      ];
    }
  };
  
  // --- EXPLANATION PROCESSING ---
  const processExplanation = async (explanation: string) => {
    setAiState(prev => ({ ...prev, isProcessing: true }));
  
    try {
      // 1️⃣ Evaluate user's explanation with your current backend logic
      const metrics = await evaluateExplanation(document.content, explanation);
  
      // 2️⃣ Generate dynamic Groq questions (based on what the user said)
      const questions = await generateDynamicQuestions(explanation);
  
      // 3️⃣ Save state
      setAiQuestions(questions);
      setSession(prev => ({
        ...prev,
        userExplanation: explanation,
        performanceMetrics: metrics,
        aiQuestions: questions
      }));
  
      setPhase('questions');
      setCurrentQuestionIndex(0);
      setAiState(prev => ({
        ...prev,
        isProcessing: false,
        currentQuestion: questions[0],
        passCount: 0
      }));
  
      setHasQuestionBeenPlayed(false);
  
      // 🎧 Auto-speak first question with ElevenLabs
      if (questions.length > 0) {
        await playQuestionAudio(questions[0]);
      }
  
    } catch (error) {
      console.error("❌ Error processing explanation:", error);
      setAiState(prev => ({ ...prev, isProcessing: false }));
    }
  };  

  const generateFinalSummary = async (responses: string[]) => {
    setAiState(prev => ({ ...prev, isProcessing: true }));
  
    try {
      // Combine all answers + explanation
      const fullResponse = [fullExplanation, ...responses].join(" ");
  
      const metrics = await evaluateExplanation(document.content, fullResponse);
  
    const finalSession: StudySessionType = {
      ...session,
      userResponses: responses,
        performanceMetrics: metrics,
        timestamp: Date.now(),
    };

    storage.saveSession(finalSession);
    setSession(finalSession);
    } catch (err) {
      console.error("Error generating final summary:", err);
    } finally {
      setAiState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // --- AUDIO PLAYBACK (QUESTIONS) ---
  const playQuestion = async () => {
    if (!aiState.currentQuestion) return;
    setAiState(prev => ({ ...prev, isPlaying: true }));

    try {
      const audioUrl = await elevenLabsAPI.convertTextToSpeech(aiState.currentQuestion);

      if (audioRef.current) audioRef.current.pause();
      if (currentAudioUrl.current) URL.revokeObjectURL(currentAudioUrl.current);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      currentAudioUrl.current = audioUrl;

      audio.onended = () => {
        setAiState(prev => ({ ...prev, isPlaying: false }));
        audioRef.current = null;
      };

      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        setAiState(prev => ({ ...prev, isPlaying: false }));
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setAiState(prev => ({ ...prev, isPlaying: false }));
      alert('Failed to play audio. Check your ElevenLabs API key.');
    }
  };
  const playQuestionAudio = async (question: string) => {
    setAiState(prev => ({ ...prev, isPlaying: true }));
  
    try {
      const audioUrl = await elevenLabsAPI.convertTextToSpeech(question);
  
      if (audioRef.current) audioRef.current.pause();
      if (currentAudioUrl.current) URL.revokeObjectURL(currentAudioUrl.current);
  
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      currentAudioUrl.current = audioUrl;
  
      audio.onended = () => {
        setAiState(prev => ({ ...prev, isPlaying: false }));
        audioRef.current = null;
      };
  
      await audio.play();
    } catch (error) {
      console.error("🎧 ElevenLabs playback failed:", error);
      setAiState(prev => ({ ...prev, isPlaying: false }));
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1s cooldown
  };  

  const _stopAudio = () => {
    if (audioRef.current) audioRef.current.pause();
    if (currentAudioUrl.current) URL.revokeObjectURL(currentAudioUrl.current);
    setAiState(prev => ({ ...prev, isPlaying: false }));
  };

  const handlePass = () => {
    setAiState(prev => {
      const newPassCount = prev.passCount + 1;
  
      if (newPassCount >= 3) {
        // ✅ End after 3 passes
        setPhase("summary");
        generateFinalSummary(userResponses);
        return { ...prev, passCount: 0 };
      }
  
      // Otherwise, move to the next question
    if (currentQuestionIndex < aiQuestions.length - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        return {
        ...prev,
        currentQuestion: aiQuestions[currentQuestionIndex + 1],
          passCount: newPassCount,
        };
    } else {
        setPhase("summary");
      generateFinalSummary(userResponses);
        return { ...prev, passCount: newPassCount };
    }
    });
  
    setHasQuestionBeenPlayed(false);
  };
  const resetSession = () => {
    setPhase('explain');
    setCurrentTranscript('');
    setFullExplanation('');
    setAiQuestions([]);
    setCurrentQuestionIndex(0);
    setUserResponses([]);
    setHasQuestionBeenPlayed(false);
    setAiState({
      isListening: false,
      isProcessing: false,
      isPlaying: false,
      currentQuestion: '',
      passCount: 0
    });
  };

  // --- PHASE DISPLAY HELPERS ---
  const getPhaseTitle = () => {
    switch (phase) {
      case 'explain':
        return 'Explain the Concept';
      case 'questions':
        return `Question ${currentQuestionIndex + 1} of ${aiQuestions.length}`;
      case 'summary':
        return 'Session Summary';
      default:
        return '';
    }
  };

  const getPhaseInstructions = () => {
    switch (phase) {
      case 'explain':
        return 'Explain the key concepts from your document in your own words.';
      case 'questions':
        return 'Answer the AI’s follow-up questions to deepen your understanding.';
      case 'summary':
        return 'Review your performance and areas for improvement.';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (phase === 'questions' && aiState.currentQuestion && !hasQuestionBeenPlayed) {
      const timer = setTimeout(() => {
        playQuestion();
        setHasQuestionBeenPlayed(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [aiState.currentQuestion, phase, hasQuestionBeenPlayed]);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (currentAudioUrl.current) URL.revokeObjectURL(currentAudioUrl.current);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="bg-white rounded-lg shadow-sm border border-periwinkle-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-periwinkle-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-periwinkle-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{document.name}</h1>
              <p className="text-slate-600 mt-1">{getPhaseInstructions()}</p>
            </div>
          </div>
          {phase !== 'explain' && (
            <button
              onClick={resetSession}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-periwinkle-50 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </button>
          )}
        </div>
      </div>

      {/* PHASE PROGRESS */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-slate-800">{getPhaseTitle()}</h2>
          <div className="text-sm text-slate-600">
            Phase {phase === 'explain' ? '1' : phase === 'questions' ? '2' : '3'} of 3
          </div>
        </div>
        <div className="w-full bg-periwinkle-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-periwinkle-500 to-blue-500 h-2 rounded-full"
            animate={{
              width: phase === 'explain' ? '33%' : phase === 'questions' ? '66%' : '100%'
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {phase === 'summary' ? (
  <PerformanceSummary
    session={session}
    onComplete={() => onSessionComplete(session)}
  />
            ) : (
              <RecordingInterface
                isListening={aiState.isListening}
                isProcessing={aiState.isProcessing}
                transcript={currentTranscript}
    fullTranscript={
      phase === 'explain'
        ? fullExplanation
        : userResponses.join(' ')
    }
                onStartListening={startListening}
                onStopListening={stopListening}
    showPassButton={phase === 'questions'} 
    onPass={handlePass}                      
              />
            )}
          </AnimatePresence>
        </div>

        {/* SIDEBAR */}
          {phase === 'questions' && (
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-periwinkle-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-3">Progress</h3>
              <div className="space-y-2">
                {aiQuestions.map((_q, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg ${
                      i === currentQuestionIndex
                        ? 'bg-blue-50 border border-blue-200'
                        : i < currentQuestionIndex
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-periwinkle-50 border border-periwinkle-200'
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-800">
                      Question {i + 1}
                    </span>
                  </div>
                ))}
              </div>
              </div>
            </div>
          )}
      </div>

      {/*phase === 'questions' && (
        <AIAssistant
          state={aiState}
          onStartListening={startListening}
          onStopListening={stopListening}
          onPlayAudio={playQuestion}
          onStopAudio={stopAudio}
          onPass={handlePass}
          hasBeenPlayed={hasQuestionBeenPlayed}
        />
      )*/}

{phase === "questions" && (
  <AIQuestionFlow
    explanation={fullExplanation}
    onFinish={(answers) => {
      setUserAnswers(answers);
      setPhase("summary");
      generateFinalSummary(answers);
    }}
        />
      )}
    </div>
  );
};
