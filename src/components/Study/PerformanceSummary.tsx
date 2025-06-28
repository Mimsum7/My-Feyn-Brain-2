import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  TrendingUp, 
  Brain,
  Download,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { StudySession } from '../../types';

interface PerformanceSummaryProps {
  session: StudySession;
  onComplete: () => void;
}

export const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({ 
  session, 
  onComplete 
}) => {
  const { performanceMetrics } = session;
  
  const getCategoryIcon = () => {
    switch (performanceMetrics.category) {
      case 'Well Understood':
        return CheckCircle;
      case 'Almost There':
        return AlertTriangle;
      case 'Needs Attention':
        return XCircle;
      default:
        return Brain;
    }
  };

  const getCategoryColor = () => {
    switch (performanceMetrics.category) {
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
      score: performanceMetrics.accuracy,
      description: 'How correctly you explained the concepts'
    },
    {
      name: 'Completeness',
      score: performanceMetrics.completeness,
      description: 'How thoroughly you covered the material'
    },
    {
      name: 'Own Words',
      score: performanceMetrics.ownWords,
      description: 'How well you used your own explanations'
    },
    {
      name: 'Logical Flow',
      score: performanceMetrics.logicalFlow,
      description: 'How well-structured your explanation was'
    }
  ];

  const getAllCategoriesFeedback = () => {
    const { accuracy, completeness, ownWords, logicalFlow } = performanceMetrics;
    
    return {
      'Well Understood': {
        icon: CheckCircle,
        color: 'text-green-600 bg-green-50 border-green-200',
        dotColor: 'bg-green-500',
        points: [
          'Demonstrated clear understanding of core concepts',
          'Explained ideas using your own words effectively',
          'Maintained logical flow throughout explanation',
          'Covered all key aspects comprehensively'
        ]
      },
      'Almost There': {
        icon: AlertTriangle,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        dotColor: 'bg-blue-500',
        points: [
          accuracy < 80 ? 'Some concepts need clarification' : 'Good grasp of main concepts',
          completeness < 80 ? 'Could cover more details' : 'Thorough coverage of material',
          ownWords < 80 ? 'Try using more of your own explanations' : 'Good use of personal explanations',
          logicalFlow < 80 ? 'Work on organizing ideas more clearly' : 'Well-structured explanation'
        ]
      },
      'Needs Attention': {
        icon: XCircle,
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        dotColor: 'bg-purple-500',
        points: [
          'Review fundamental concepts more thoroughly',
          'Practice explaining without relying on memorized text',
          'Focus on understanding rather than memorization',
          'Break down complex ideas into simpler parts'
        ]
      }
    };
  };

  const exportSession = () => {
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

  const CategoryIcon = getCategoryIcon();
  const allCategoriesFeedback = getAllCategoriesFeedback();

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-periwinkle-200 p-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className={`inline-flex items-center justify-center w-16 h-16 rounded-full border-2 ${getCategoryColor()} mb-4`}
          >
            <CategoryIcon className="w-8 h-8" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {performanceMetrics.overallScore}%
          </h2>
          
          <div className={`inline-flex items-center px-4 py-2 rounded-full border ${getCategoryColor()} font-medium mb-4`}>
            {performanceMetrics.category}
          </div>
          
          <p className="text-slate-600 max-w-md mx-auto">
            {performanceMetrics.category === 'Well Understood' && 
              "Excellent work! You have a strong grasp of these concepts. Consider teaching them to others to reinforce your understanding."}
            {performanceMetrics.category === 'Almost There' && 
              "Good progress! You understand most concepts but there are a few areas that could use some review and practice."}
            {performanceMetrics.category === 'Needs Attention' && 
              "This topic needs more study. Focus on the fundamental concepts and try explaining them again once you've reviewed the material."}
          </p>
        </div>
      </motion.div>

      {/* Detailed Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-sm border border-periwinkle-200 p-6"
      >
        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Performance Breakdown
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-800">{metric.name}</h4>
                <span className={`font-bold ${getScoreColor(metric.score)}`}>
                  {metric.score}%
                </span>
              </div>
              
              <div className="w-full bg-periwinkle-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.score}%` }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 1, ease: "easeOut" }}
                  className={`h-2 rounded-full ${getProgressColor(metric.score)}`}
                />
              </div>
              
              <p className="text-sm text-slate-600">{metric.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* All Categories Detailed Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm border border-periwinkle-200 p-6"
      >
        <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center">
          <Brain className="w-5 h-5 mr-2" />
          Performance Categories Analysis
        </h3>
        
        <div className="space-y-6">
          {Object.entries(allCategoriesFeedback).map(([categoryName, categoryData], categoryIndex) => {
            const Icon = categoryData.icon;
            const isCurrentCategory = categoryName === performanceMetrics.category;
            
            return (
              <motion.div
                key={categoryName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + categoryIndex * 0.1 }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCurrentCategory 
                    ? categoryData.color + ' ring-2 ring-offset-2 ring-opacity-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center mb-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    isCurrentCategory ? categoryData.color.split(' ')[1] : 'bg-gray-200'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      isCurrentCategory ? categoryData.color.split(' ')[0] : 'text-gray-500'
                    }`} />
                  </div>
                  <h4 className={`font-semibold ${
                    isCurrentCategory ? categoryData.color.split(' ')[0] : 'text-gray-600'
                  }`}>
                    {categoryName}
                    {isCurrentCategory && (
                      <span className="ml-2 text-xs px-2 py-1 bg-white rounded-full border">
                        Your Result
                      </span>
                    )}
                  </h4>
                </div>
                
                <div className="space-y-2">
                  {categoryData.points.map((point, pointIndex) => (
                    <motion.div
                      key={pointIndex}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + categoryIndex * 0.1 + pointIndex * 0.05 }}
                      className="flex items-start space-x-3"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        isCurrentCategory ? categoryData.dotColor : 'bg-gray-400'
                      }`} />
                      <p className={`text-sm ${
                        isCurrentCategory ? 'text-slate-700' : 'text-gray-600'
                      }`}>
                        {point}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Session Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-periwinkle-200 p-6"
      >
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Session Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-800 mb-2">Document</h4>
            <p className="text-slate-600">{session.documentTitle}</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 mb-2">Date</h4>
            <p className="text-slate-600">
              {new Date(session.timestamp).toLocaleDateString()} at{' '}
              {new Date(session.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 mb-2">Questions Asked</h4>
            <p className="text-slate-600">{session.aiQuestions.length} questions</p>
          </div>
          <div>
            <h4 className="font-medium text-slate-800 mb-2">Responses Given</h4>
            <p className="text-slate-600">{session.userResponses.length} responses</p>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={exportSession}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-periwinkle-100 text-periwinkle-700 rounded-lg hover:bg-periwinkle-200 transition-colors"
        >
          <Download className="w-5 h-5" />
          <span>Export Session</span>
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Start New Session</span>
        </button>
        
        <button
          onClick={onComplete}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-periwinkle-500 to-blue-500 text-white rounded-lg hover:from-periwinkle-600 hover:to-blue-600 transition-colors"
        >
          <span>View Analytics</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
};