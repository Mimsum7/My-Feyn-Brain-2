import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  FileText, 
  Eye, 
  Trash2, 
  Download,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { StudySession } from '../../types';
import { storage } from '../../utils/localStorage';
import { SessionDetailModal } from './SessionDetailModal';

export const SessionHistory: React.FC = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<StudySession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    filterAndSortSessions();
  }, [sessions, searchQuery, selectedCategory, selectedTimeRange, sortBy, sortOrder]);

  const loadSessions = () => {
    const allSessions = storage.getSessions();
    setSessions(allSessions);
  };

  const filterAndSortSessions = () => {
    let filtered = [...sessions];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.userExplanation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(session =>
        session.performanceMetrics.category === selectedCategory
      );
    }

    // Filter by time range
    if (selectedTimeRange !== 'all') {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      let cutoffTime = now;

      switch (selectedTimeRange) {
        case '7':
          cutoffTime = now - (7 * dayMs);
          break;
        case '30':
          cutoffTime = now - (30 * dayMs);
          break;
        case '90':
          cutoffTime = now - (90 * dayMs);
          break;
      }

      filtered = filtered.filter(session => session.timestamp >= cutoffTime);
    }

    // Sort sessions
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.timestamp - b.timestamp;
          break;
        case 'score':
          comparison = a.performanceMetrics.overallScore - b.performanceMetrics.overallScore;
          break;
        case 'title':
          comparison = a.documentTitle.localeCompare(b.documentTitle);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredSessions(filtered);
  };

  const handleDeleteSession = (sessionId: string) => {
    storage.deleteSession(sessionId);
    loadSessions();
    setShowDeleteConfirm(null);
  };

  const exportSession = (session: StudySession) => {
    const dataStr = JSON.stringify(session, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `feyn-brain-session-${session.sessionID}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Well Understood':
        return CheckCircle;
      case 'Almost There':
        return AlertTriangle;
      case 'Needs Attention':
        return XCircle;
      default:
        return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Well Understood':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Almost There':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Needs Attention':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    return 'text-purple-600';
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Session History</h1>
        <p className="text-lg text-slate-600">
          View and manage your past study sessions
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-periwinkle-200 p-6 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sessions by document title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-periwinkle-300 rounded-lg focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-periwinkle-500" />
            
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-periwinkle-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="Well Understood">Well Understood</option>
                <option value="Almost There">Almost There</option>
                <option value="Needs Attention">Needs Attention</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-periwinkle-500" />
            </div>

            <div className="relative">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="appearance-none bg-white border border-periwinkle-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-periwinkle-500" />
            </div>

            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as 'date' | 'score' | 'title');
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="appearance-none bg-white border border-periwinkle-300 rounded-lg px-4 py-3 pr-8 focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="score-desc">Highest Score</option>
                <option value="score-asc">Lowest Score</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-periwinkle-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredSessions.map((session, index) => {
            const CategoryIcon = getCategoryIcon(session.performanceMetrics.category);
            
            return (
              <motion.div
                key={session.sessionID}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm border border-periwinkle-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="p-6 border-b border-periwinkle-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-periwinkle-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-periwinkle-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 line-clamp-2">
                          {session.documentTitle}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(session.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className={`text-lg font-bold ${getScoreColor(session.performanceMetrics.overallScore)}`}>
                      {session.performanceMetrics.overallScore}%
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(session.performanceMetrics.category)}`}>
                      <CategoryIcon className="w-4 h-4 mr-1" />
                      {session.performanceMetrics.category}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <BarChart3 className="w-4 h-4" />
                      <span>{session.aiQuestions.length} questions</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(session.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-periwinkle-100 text-periwinkle-700 rounded-lg hover:bg-periwinkle-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    
                    <button
                      onClick={() => exportSession(session)}
                      className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                      title="Export Session"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteConfirm(session.sessionID)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredSessions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <FileText className="w-16 h-16 text-periwinkle-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No sessions found</h3>
          <p className="text-slate-600">
            {searchQuery || selectedCategory !== 'all' || selectedTimeRange !== 'all'
              ? 'Try adjusting your filters or search query'
              : 'Start your first study session to see it here'}
          </p>
        </motion.div>
      )}

      {/* Session Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <SessionDetailModal
            session={selectedSession}
            onClose={() => setSelectedSession(null)}
            onDelete={(sessionId) => {
              handleDeleteSession(sessionId);
              setSelectedSession(null);
            }}
            onExport={exportSession}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Delete Session</h3>
                  <p className="text-sm text-slate-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-slate-700 mb-6">
                Are you sure you want to delete this study session? All associated data will be permanently removed.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteSession(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};