import { StudySession, UploadedDocument } from '../types';

const STORAGE_KEYS = {
  SESSIONS: 'feyn_brain_sessions',
  DOCUMENTS: 'feyn_brain_documents',
  SETTINGS: 'feyn_brain_settings'
};

export const storage = {
  // Session management
  getSessions(): StudySession[] {
    try {
      const sessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return sessions ? JSON.parse(sessions) : [];
    } catch {
      return [];
    }
  },

  saveSession(session: StudySession): void {
    try {
      const sessions = this.getSessions();
      const existingIndex = sessions.findIndex(s => s.sessionID === session.sessionID);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.push(session);
      }
      
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  },

  deleteSession(sessionID: string): void {
    try {
      const sessions = this.getSessions().filter(s => s.sessionID !== sessionID);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  },

  // Document management
  getDocuments(): UploadedDocument[] {
    try {
      const documents = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return documents ? JSON.parse(documents) : [];
    } catch {
      return [];
    }
  },

  saveDocument(document: UploadedDocument): void {
    try {
      const documents = this.getDocuments();
      documents.push(document);
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  },

  deleteDocument(documentId: string): void {
    try {
      const documents = this.getDocuments().filter(d => d.id !== documentId);
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  },

  // Data cleanup
  cleanupOldSessions(): void {
    try {
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const sessions = this.getSessions().filter(s => s.timestamp > thirtyDaysAgo);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to cleanup old sessions:', error);
    }
  },

  // Export functionality
  exportSessions(): string {
    return JSON.stringify({
      sessions: this.getSessions(),
      documents: this.getDocuments(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
};