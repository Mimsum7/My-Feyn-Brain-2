import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Layout/Sidebar';
import { DocumentUpload } from './components/Upload/DocumentUpload';
import { StudySession } from './components/Study/StudySession';
import { SessionHistory } from './components/History/SessionHistory';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { UploadedDocument, StudySession as StudySessionType } from './types';
import { storage } from './utils/localStorage';
// import { TestTranscription } from "./components/TestTranscription";

function App() {
  const [currentView, setCurrentView] = useState<string>('upload');
  const [currentDocument, setCurrentDocument] = useState<UploadedDocument | null>(null);
  const [conceptSummary, setConceptSummary] = useState<string>('');
  const [recentSessions, setRecentSessions] = useState<Array<{
    id: string;
    title: string;
    date: string;
    score: number;
  }>>([]);

  useEffect(() => {
    // Cleanup old sessions on app load
    storage.cleanupOldSessions();
    
    // Load recent sessions for sidebar
    loadRecentSessions();
  }, []);

  const loadRecentSessions = () => {
    const sessions = storage.getSessions();
    const recentSessionsData = sessions
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10)
      .map(session => ({
        id: session.sessionID,
        title: session.documentTitle,
        date: new Date(session.timestamp).toLocaleDateString(),
        score: session.performanceMetrics.overallScore
      }));
    
    setRecentSessions(recentSessionsData);
  };

  const handleDocumentProcessed = (document: UploadedDocument, summary: string) => {
    setCurrentDocument(document);
    setConceptSummary(summary);
    setCurrentView('study');
  };

  const handleSessionComplete = (session: StudySessionType) => {
    // Update recent sessions
    loadRecentSessions();
    setCurrentView('analytics');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'upload':
        return (
          <DocumentUpload onDocumentProcessed={handleDocumentProcessed} />
        );
      
      case 'study':
        if (!currentDocument || !conceptSummary) {
          setCurrentView('upload');
          return null;
        }
        return (
          <StudySession
            document={currentDocument}
            conceptSummary={conceptSummary}
            onSessionComplete={handleSessionComplete}
          />
        );
      
      case 'history':
        return <SessionHistory />;
      
      case 'analytics':
        return <AnalyticsDashboard />;
      
      case 'settings':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-periwinkle-200 p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">Settings</h2>
              <p className="text-slate-600">
                Settings panel would include preferences for:
              </p>
              <ul className="mt-4 space-y-2 text-slate-600">
                <li>• Voice recording quality settings</li>
                <li>• AI question difficulty preferences</li>
                <li>• Session timeout configurations</li>
                <li>• Export format options</li>
                <li>• Accessibility preferences</li>
              </ul>
            </div>
          </div>
        );
      
      default:
        return (
          <DocumentUpload onDocumentProcessed={handleDocumentProcessed} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        recentSessions={recentSessions}
      />
      
      <main className="flex-1 overflow-auto">
  <div className="p-8">
    {renderCurrentView()}
    {/* <TestTranscription /> */}
  </div>
</main>

    </div>
  );
}

export default App;