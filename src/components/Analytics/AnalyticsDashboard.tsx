import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Award, 
  Brain,
  ChevronDown,
  Filter,
  Download
} from 'lucide-react';
import { StudySession } from '../../types';
import { storage } from '../../utils/localStorage';

export const AnalyticsDashboard: React.FC = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const allSessions = storage.getSessions();
    setSessions(allSessions);
  }, []);

  const getFilteredSessions = () => {
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
      default:
        cutoffTime = 0;
    }

    return sessions.filter(session => {
      const timeFilter = session.timestamp >= cutoffTime;
      const categoryFilter = selectedCategory === 'all' || 
        session.performanceMetrics.category === selectedCategory;
      return timeFilter && categoryFilter;
    });
  };

  const filteredSessions = getFilteredSessions();

  const getOverallStats = () => {
    if (filteredSessions.length === 0) {
      return {
        totalSessions: 0,
        averageScore: 0,
        wellUnderstood: 0,
        needsAttention: 0,
        improvementTrend: 0
      };
    }

    const totalSessions = filteredSessions.length;
    const averageScore = Math.round(
      filteredSessions.reduce((sum, s) => sum + s.performanceMetrics.overallScore, 0) / totalSessions
    );
    
    const wellUnderstood = filteredSessions.filter(
      s => s.performanceMetrics.category === 'Well Understood'
    ).length;
    
    const needsAttention = filteredSessions.filter(
      s => s.performanceMetrics.category === 'Needs Attention'
    ).length;

    // Calculate improvement trend (last 5 vs first 5 sessions)
    const sortedSessions = [...filteredSessions].sort((a, b) => a.timestamp - b.timestamp);
    let improvementTrend = 0;
    
    if (sortedSessions.length >= 5) {
      const firstFive = sortedSessions.slice(0, 5);
      const lastFive = sortedSessions.slice(-5);
      
      const firstAvg = firstFive.reduce((sum, s) => sum + s.performanceMetrics.overallScore, 0) / 5;
      const lastAvg = lastFive.reduce((sum, s) => sum + s.performanceMetrics.overallScore, 0) / 5;
      
      improvementTrend = Math.round(lastAvg - firstAvg);
    }

    return {
      totalSessions,
      averageScore,
      wellUnderstood,
      needsAttention,
      improvementTrend
    };
  };

  const stats = getOverallStats();

  const getRecentSessions = () => {
    return [...filteredSessions]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  };

  const exportAnalytics = () => {
    const analyticsData = {
      stats,
      sessions: filteredSessions,
      filters: {
        timeRange: selectedTimeRange,
        category: selectedCategory
      },
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `feyn-brain-analytics-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    trend 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string;
    trend?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-periwinkle-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {trend !== undefined && trend !== 0 && (
            <div className={`flex items-center mt-2 text-sm ${
              trend > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
              <span>{Math.abs(trend)}% {trend > 0 ? 'improvement' : 'decline'}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Analytics Dashboard</h1>
        <p className="text-lg text-slate-600">
          Track your learning progress and identify areas for improvement
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-periwinkle-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-periwinkle-500" />
            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="appearance-none bg-white border border-periwinkle-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-periwinkle-500" />
              </div>
              
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none bg-white border border-periwinkle-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent"
                >
                  <option value="all">All categories</option>
                  <option value="Well Understood">Well Understood</option>
                  <option value="Almost There">Almost There</option>
                  <option value="Needs Attention">Needs Attention</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-periwinkle-500" />
              </div>
            </div>
          </div>
          
          <button
            onClick={exportAnalytics}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-periwinkle-500 to-blue-500 text-white rounded-lg hover:from-periwinkle-600 hover:to-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={Calendar}
          color="bg-gradient-to-br from-periwinkle-500 to-blue-500"
        />
        <StatCard
          title="Average Score"
          value={`${stats.averageScore}%`}
          icon={BarChart3}
          color="bg-gradient-to-br from-green-500 to-emerald-500"
          trend={stats.improvementTrend}
        />
        <StatCard
          title="Well Understood"
          value={stats.wellUnderstood}
          icon={Award}
          color="bg-gradient-to-br from-emerald-500 to-green-500"
        />
        <StatCard
          title="Needs Attention"
          value={stats.needsAttention}
          icon={Brain}
          color="bg-gradient-to-br from-purple-500 to-indigo-500"
        />
      </div>

      {/* Recent Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-periwinkle-200"
      >
        <div className="px-6 py-4 border-b border-periwinkle-200">
          <h2 className="text-xl font-semibold text-slate-800">Recent Sessions</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-periwinkle-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Questions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-periwinkle-200">
              {getRecentSessions().map((session) => (
                <tr key={session.sessionID} className="hover:bg-periwinkle-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-800">
                      {session.documentTitle}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      session.performanceMetrics.overallScore >= 80 
                        ? 'text-green-600'
                        : session.performanceMetrics.overallScore >= 60
                        ? 'text-blue-600'
                        : 'text-purple-600'
                    }`}>
                      {session.performanceMetrics.overallScore}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      session.performanceMetrics.category === 'Well Understood'
                        ? 'bg-green-100 text-green-800'
                        : session.performanceMetrics.category === 'Almost There'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {session.performanceMetrics.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {session.aiQuestions.length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {getRecentSessions().length === 0 && (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-periwinkle-300 mx-auto mb-4" />
              <p className="text-slate-600">No sessions found for the selected filters</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};