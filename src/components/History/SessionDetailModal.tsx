import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Calendar, 
  FileText, 
  BarChart3, 
  Download, 
  Trash2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Clock,
  MessageSquare
} from 'lucide-react';
import { StudySession } from '../../types';

interface SessionDetailModalProps {
  session: StudySession;
  onClose: () => void;
  onDelete: (sessionId: string) => void;
  onExport: (session: StudySession) => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  onClose,
  onDelete,
  onExport
}) => {
  const getCategoryIcon = () => {
    switch (session.performanceMetrics.category) {
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

  const getCategoryColor = () => {
    switch (session.performanceMetrics.category) {
      case 'Well Understood':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Almost There':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Needs Attention':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    return 'text-purple-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    return 'bg-purple-500';
  };

  const metrics = [
    {
      name: 'Accuracy',
      score: session.performanceMetrics.accuracy,
      description: 'How correctly you explained the concepts'
    },
    {
      name: 'Completeness',
      score: session.performanceMetrics.completeness,
      description: 'How thoroughly you covered the material'
    },
    {
      name: 'Own Words',
      score: session.performanceMetrics.ownWords,
      description: 'How well you used your own explanations'
    },
    {
      name: 'Logical Flow',
      score: session.performanceMetrics.logicalFlow,
      description: 'How well-structured your explanation was'
    }
  ];

  const CategoryIcon = getCategoryIcon();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-periwinkle-200 p-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-periwinkle-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-periwinkle-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{session.documentTitle}</h2>
                <div className="flex items-center space-x-4 mt-1 text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(session.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(session.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onExport(session)}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Export Session"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(session.sessionID)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                title="Delete Session"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Performance Overview */}
          <div className="bg-slate-50 rounded-lg p-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 ${getCategoryColor()} mb-4`}>
                <CategoryIcon className="w-8 h-8" />
              </div>
              
              <h3 className="text-3xl font-bold text-slate-800 mb-2">
                {session.performanceMetrics.overallScore}%
              </h3>
              
              <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getCategoryColor()} font-medium`}>
                {session.performanceMetrics.category}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance Breakdown
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metrics.map((metric) => (
                <div key={metric.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-800">{metric.name}</h4>
                    <span className={`font-bold ${getScoreColor(metric.score)}`}>
                      {metric.score}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-periwinkle-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getProgressColor(metric.score)}`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                  
                  <p className="text-sm text-slate-600">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* User Explanation */}
          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Your Explanation
            </h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {session.userExplanation || 'No explanation recorded'}
              </p>
            </div>
          </div>

          {/* AI Questions and Responses */}
          {session.aiQuestions.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Questions & Responses ({session.aiQuestions.length})
              </h3>
              
              <div className="space-y-4">
                {session.aiQuestions.map((question, index) => (
                  <div key={index} className="border border-periwinkle-200 rounded-lg p-4">
                    <div className="mb-3">
                      <h4 className="font-medium text-slate-800 mb-2">
                        Question {index + 1}
                      </h4>
                      <p className="text-slate-700 bg-blue-50 p-3 rounded-lg">
                        {question}
                      </p>
                    </div>
                    
                    {session.userResponses[index] && (
                      <div>
                        <h5 className="font-medium text-slate-800 mb-2">Your Response</h5>
                        <p className="text-slate-700 bg-green-50 p-3 rounded-lg">
                          {session.userResponses[index]}
                        </p>
                      </div>
                    )}
                    
                    {!session.userResponses[index] && (
                      <div className="text-sm text-slate-500 italic">
                        No response recorded
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Original Text Preview */}
          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Original Document Content
            </h3>
            <div className="bg-slate-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              <p className="text-slate-700 leading-relaxed">
                {session.originalText.substring(0, 500)}
                {session.originalText.length > 500 && '...'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};