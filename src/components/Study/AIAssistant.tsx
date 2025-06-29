import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Brain, Volume2, Square } from 'lucide-react';
import { AIAssistantState } from '../../types';

interface AIAssistantProps {
  state: AIAssistantState;
  onStartListening: () => void;
  onStopListening: () => void;
  onPlayAudio: () => void;
  onStopAudio: () => void;
  onPass: () => void;
  hasBeenPlayed?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  state,
  onStartListening,
  onStopListening,
  onPlayAudio,
  onStopAudio,
  onPass,
  hasBeenPlayed = false
}) => {
  const pulseVariants = {
    idle: {
      scale: 1,
      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
    },
    listening: {
      scale: [1, 1.1, 1],
      boxShadow: [
        '0 4px 20px rgba(139, 92, 246, 0.3)',
        '0 8px 40px rgba(96, 165, 250, 0.6)',
        '0 4px 20px rgba(139, 92, 246, 0.3)'
      ]
    },
    processing: {
      rotate: 360,
      scale: 1.05,
      boxShadow: '0 6px 30px rgba(59, 130, 246, 0.4)'
    },
    playing: {
      scale: [1, 1.05, 1],
      boxShadow: [
        '0 4px 20px rgba(34, 197, 94, 0.3)',
        '0 8px 40px rgba(34, 197, 94, 0.5)',
        '0 4px 20px rgba(34, 197, 94, 0.3)'
      ]
    }
  };

  const getAnimationState = () => {
    if (state.isPlaying) return 'playing';
    if (state.isProcessing) return 'processing';
    if (state.isListening) return 'listening';
    return 'idle';
  };

  const getBackgroundColor = () => {
    if (state.isPlaying) return 'bg-gradient-to-br from-green-500 to-emerald-600';
    if (state.isProcessing) return 'bg-gradient-to-br from-blue-500 to-indigo-600';
    if (state.isListening) return 'bg-gradient-to-br from-blue-500 to-purple-500';
    return 'bg-gradient-to-br from-periwinkle-500 to-blue-500';
  };

  const getIcon = () => {
    if (state.isPlaying) return Volume2;
    if (state.isProcessing) return Brain;
    if (state.isListening) return Mic;
    return state.isListening ? MicOff : Mic;
  };

  const Icon = getIcon();

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex flex-col items-center space-y-4">
        {/* Current Question Display */}
        {state.currentQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-sm p-4 bg-white rounded-lg shadow-lg border border-periwinkle-200"
          >
            <p className="text-sm font-medium text-slate-800 mb-3">{state.currentQuestion}</p>
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={onPlayAudio}
                  disabled={state.isPlaying}
                  className="px-3 py-1 bg-periwinkle-100 text-periwinkle-700 rounded text-xs font-medium hover:bg-periwinkle-200 disabled:opacity-50 transition-colors"
                >
                  {state.isPlaying ? 'Playing...' : hasBeenPlayed ? 'Repeat' : 'Play'}
                </button>
                {state.isPlaying && (
                  <button
                    onClick={onStopAudio}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors"
                  >
                    Stop
                  </button>
                )}
              </div>
              <button
                onClick={onPass}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium hover:bg-gray-200 transition-colors"
              >
                Pass
              </button>
            </div>
          </motion.div>
        )}

        {/* AI Assistant Circle */}
        <motion.button
          className={`w-16 h-16 rounded-full ${getBackgroundColor()} text-white shadow-lg flex items-center justify-center transition-all duration-300`}
          variants={pulseVariants}
          animate={getAnimationState()}
          transition={{
            duration: state.isListening ? 1.5 : state.isProcessing ? 2 : 1,
            repeat: state.isListening || state.isPlaying ? Infinity : 0,
            ease: "easeInOut"
          }}
          onClick={state.isListening ? onStopListening : onStartListening}
          disabled={state.isProcessing || state.isPlaying}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className="w-7 h-7" />
        </motion.button>

        {/* Status Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-xs font-medium text-slate-700">
            {state.isPlaying
              ? 'Playing Question'
              : state.isProcessing
              ? 'Analyzing...'
              : state.isListening
              ? 'Listening...'
              : 'Tap to Record'}
          </p>
          {state.isListening && (
            <p className="text-xs text-blue-600 mt-1">
              10s silence auto-timeout
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};