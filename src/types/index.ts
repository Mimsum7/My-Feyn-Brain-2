export interface StudySession {
  sessionID: string;
  timestamp: number;
  originalText: string;
  userExplanation: string;
  aiQuestions: string[];
  userResponses: string[];
  performanceMetrics: PerformanceMetrics;
  documentTitle: string;
}

export interface PerformanceMetrics {
  accuracy: number;
  completeness: number;
  ownWords: number;
  logicalFlow: number;
  category: 'Well Understood' | 'Almost There' | 'Needs Attention';
  overallScore: number;
}

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string;
  uploadedAt: number;
}

export interface AIAssistantState {
  isListening: boolean;
  isProcessing: boolean;
  isPlaying: boolean;
  currentQuestion: string;
  passCount: number;
}

export type StudyPhase = 'upload' | 'explain' | 'questions' | 'summary';