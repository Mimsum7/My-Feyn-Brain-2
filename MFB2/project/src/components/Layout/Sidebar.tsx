import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Mic, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Search,
  Clock,
  FileText,
  History
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  recentSessions: Array<{ id: string; title: string; date: string; score: number }>;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  recentSessions 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { id: 'upload', label: 'Upload Document', icon: Upload },
    { id: 'study', label: 'Study Session', icon: Mic },
    { id: 'history', label: 'Session History', icon: History },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const filteredSessions = recentSessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className="bg-white border-r border-periwinkle-200 h-screen flex flex-col sticky top-0 z-40"
    >
      {/* Header */}
      <div className="p-4 border-b border-periwinkle-200">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-3"
              >
                <img 
                  src="/Feyn Brain.png" 
                  alt="Feyn Brain Logo" 
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <h1 className="font-bold text-slate-800">My Feyn Brain</h1>
                  <p className="text-xs text-slate-600">Teach it. Master it.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-periwinkle-100 rounded-lg transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <Menu className="w-5 h-5 text-slate-600" /> : <X className="w-5 h-5 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* Search */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 border-b border-periwinkle-200"
          >
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-periwinkle-300 rounded-lg focus:ring-2 focus:ring-periwinkle-500 focus:border-transparent text-sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-periwinkle-50 text-periwinkle-600 border border-periwinkle-200'
                    : 'hover:bg-periwinkle-50 text-slate-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-periwinkle-600' : 'text-slate-400'}`} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-medium"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        {/* Recent Sessions */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4 border-t border-periwinkle-200"
            >
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Recent Sessions
              </h3>
              <div className="space-y-2">
                {filteredSessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    onClick={() => onViewChange('history')}
                    className="p-3 bg-periwinkle-50 rounded-lg hover:bg-periwinkle-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800 line-clamp-2">
                          {session.title}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-slate-600">{session.date}</p>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            session.score >= 80 
                              ? 'bg-green-100 text-green-700'
                              : session.score >= 60
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {session.score}%
                          </div>
                        </div>
                      </div>
                      <FileText className="w-4 h-4 text-slate-400 group-hover:text-slate-600 ml-2" />
                    </div>
                  </div>
                ))}
                {filteredSessions.length === 0 && (
                  <p className="text-sm text-slate-600 text-center py-4">
                    No sessions found
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};