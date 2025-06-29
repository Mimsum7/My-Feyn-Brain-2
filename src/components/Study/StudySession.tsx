import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, RotateCcw } from 'lucide-react';
import { UploadedDocument, StudySession as StudySessionType, StudyPhase, AIAssistantState } from '../../types';
import { AIAssistant } from './AIAssistant';
import { RecordingInterface } from './RecordingInterface';
import { PerformanceSummary } from './PerformanceSummary';
import { mockGPTAPI, mockAssemblyAI } from '../../utils/mockApis';
import { elevenLabsAPI } from '../../utils/elevenLabsApi';
import { storage } from '../../utils/localStorage';

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

  // Audio playback refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrl = useRef<string | null>(null);

  // TODO: REPLACE WITH REAL TRANSCRIPTION SERVICE
  // These variables will hold the real transcription service instances
  let transcriptionService: any = null;
  let silenceTimer: NodeJS.Timeout | null = null;

  const startListening = () => {
    setAiState(prev => ({ ...prev, isListening: true }));
    setCurrentTranscript('');

    // Reset silence timer
    if (silenceTimer) clearTimeout(silenceTimer);

    // TODO: REPLACE WITH REAL ASSEMBLYAI TRANSCRIPTION
    // The mockAssemblyAI.startTranscription call should be replaced with real AssemblyAI integration
    transcriptionService = mockAssemblyAI.startTranscription(
      (text: string) => {
        setCurrentTranscript(prev => prev + (prev ? ' ' : '') + text);
        
        // Reset silence timer on new speech
        if (silenceTimer) clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
          stopListening();
        }, 10000); // 10 second timeout
      },
      () => {
        // Remove the stopListening() call from here to prevent infinite recursion
        // The transcription service completion is handled by the stopListening function itself
      }
    );
  };

  const stopListening = () => {
    if (transcriptionService) {
      transcriptionService.stop();
      transcriptionService = null;
    }
    
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      silenceTimer = null;
    }

    setAiState(prev => ({ ...prev, isListening: false }));
    
    if (currentTranscript.trim()) {
      if (phase === 'explain') {
        setFullExplanation(prev => prev + (prev ? ' ' : '') + currentTranscript);
        processExplanation(currentTranscript);
      } else if (phase === 'questions') {
        const newResponses = [...userResponses, currentTranscript];
        setUserResponses(newResponses);
        
        if (currentQuestionIndex < aiQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setAiState(prev => ({ 
            ...prev, 
            currentQuestion: aiQuestions[currentQuestionIndex + 1],
            passCount: 0
          }));
          setHasQuestionBeenPlayed(false);
        } else {
          // All questions answered, move to summary
          setPhase('summary');
          generateFinalSummary(newResponses);
        }
      }
    }
  };

  const processExplanation = async (explanation: string) => {
    setAiState(prev => ({ ...prev, isProcessing: true }));
    
    try {
      // TODO: REPLACE WITH REAL OPENAI API CALLS
      // These mockGPTAPI calls should be replaced with real OpenAI API integration
      const metrics = await mockGPTAPI.evaluateExplanation(document.content, explanation);
      const questions = await mockGPTAPI.generateFollowUpQuestions(explanation, metrics);
      
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
      setHasQuestionBeenPlayed(false); // Reset for first question
    } catch (error) {
      console.error('Error processing explanation:', error);
      setAiState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const generateFinalSummary = async (responses: string[]) => {
    const finalSession: StudySessionType = {
      ...session,
      userResponses: responses,
      timestamp: Date.now()
    };
    
    storage.saveSession(finalSession);
    setSession(finalSession);
  };

  const playQuestion = async () => {
    if (!aiState.currentQuestion) return;
    
    setAiState(prev => ({ ...prev, isPlaying: true }));
    
    try {
      // Use real ElevenLabs API
      const audioUrl = await elevenLabsAPI.convertTextToSpeech(aiState.currentQuestion);
      
      // Clean up previous audio if exists
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (currentAudioUrl.current) {
        URL.revokeObjectURL(currentAudioUrl.current);
      }
      
      // Create new audio element
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
        audioRef.current = null;
      };
      
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      setAiState(prev => ({ ...prev, isPlaying: false }));
      
      // Show user-friendly error message
      if (error instanceof Error && error.message.includes('VITE_ELEVENLABS_API_KEY')) {
        alert('ElevenLabs API key not configured. Please add VITE_ELEVENLABS_API_KEY to your .env file.');
      } else {
        alert('Failed to play audio. Please check your ElevenLabs API key and try again.');
      }
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (currentAudioUrl.current) {
      URL.revokeObjectURL(currentAudioUrl.current);
      currentAudioUrl.current = null;
    }
    setAiState(prev => ({ ...prev, isPlaying: false }));
  };

  const handlePass = () => {
    // Move to next question immediately on pass
    if (currentQuestionIndex < aiQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAiState(prev => ({ 
        ...prev, 
        currentQuestion: aiQuestions[currentQuestionIndex + 1],
        passCount: 0 // Reset pass count for new question
      }));
      setHasQuestionBeenPlayed(false); // Reset for new question
    } else {
      // No more questions available, end session
      setPhase('summary');
      generateFinalSummary(userResponses);
    }
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
        return 'Explain the key concepts from your document in your own words, as if teaching someone else.';
      case 'questions':
        return 'Answer the AI\'s follow-up questions to deepen your understanding.';
      case 'summary':
        return 'Review your performance and areas for improvement.';
      default:
        return '';
    }
  };

  // Auto-play question when it changes
  useEffect(() => {
    if (phase === 'questions' && aiState.currentQuestion && !hasQuestionBeenPlayed) {
      // Small delay to ensure the question is set before playing
      const timer = setTimeout(() => {
        playQuestion();
        setHasQuestionBeenPlayed(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [aiState.currentQuestion, phase, hasQuestionBeenPlayed]);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (currentAudioUrl.current) {
        URL.revokeObjectURL(currentAudioUrl.current);
      }
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
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
          <div className="flex items-center space-x-4">
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
      </div>

      {/* Progress Indicator */}
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
            initial={{ width: 0 }}
            animate={{ 
              width: phase === 'explain' ? '33%' : phase === 'questions' ? '66%' : '100%' 
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {phase === 'summary' ? (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PerformanceSummary
                  session={session}
                  onComplete={() => onSessionComplete(session)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="recording"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-sm border border-periwinkle-200 overflow-hidden"
              >
                <RecordingInterface
                  isListening={aiState.isListening}
                  isProcessing={aiState.isProcessing}
                  transcript={currentTranscript}
                  fullTranscript={phase === 'explain' ? fullExplanation : userResponses.join(' ')}
                  onStartListening={startListening}
                  onStopListening={stopListening}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Document Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-periwinkle-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-3">Key Concepts</h3>
            <div className="prose prose-sm text-slate-600">
              {conceptSummary.split('\n').map((line, index) => (
                <p key={index} className="mb-2">{line}</p>
              ))}
            </div>
          </div>

          {/* Session Progress */}
          {phase === 'questions' && (
            <div className="bg-white rounded-lg shadow-sm border border-periwinkle-200 p-6">
              <h3 className="font-semibold text-slate-800 mb-3">Progress</h3>
              <div className="space-y-2">
                {aiQuestions.map((question, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      index === currentQuestionIndex
                        ? 'bg-blue-50 border border-blue-200'
                        : index < currentQuestionIndex
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-periwinkle-50 border border-periwinkle-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-800">
                        Question {index + 1}
                      </span>
                      <div className="flex items-center space-x-1">
                        {index < currentQuestionIndex && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                        {index === currentQuestionIndex && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant */}
      {phase !== 'summary' && phase === 'questions' && (
        <AIAssistant
          state={aiState}
          onStartListening={startListening}
          onStopListening={stopListening}
          onPlayAudio={playQuestion}
          onStopAudio={stopAudio}
          onPass={handlePass}
          hasBeenPlayed={hasQuestionBeenPlayed}
        />
      )}
    </div>
  );
};