import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, ChevronDown, ChevronUp } from 'lucide-react';

interface RecordingInterfaceProps {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  fullTranscript: string;
  onStartListening: () => void;
  onStopListening: () => void;
}

export const RecordingInterface: React.FC<RecordingInterfaceProps> = ({
  isListening,
  isProcessing,
  transcript,
  fullTranscript,
  onStartListening,
  onStopListening
}) => {
  const [showTranscript, setShowTranscript] = useState(false);

  const audioLines = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Recording Section */}
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="text-center">
          {/* Recording Circle */}
          <motion.div
            className="relative mx-auto mb-8"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Outer Ring */}
            <motion.div
              className={`w-48 h-48 rounded-full border-4 ${
                isListening 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-periwinkle-300 bg-periwinkle-50'
              } flex items-center justify-center relative`}
              animate={isListening ? {
                boxShadow: [
                  '0 0 0 0 rgba(96, 165, 250, 0.4)',
                  '0 0 0 20px rgba(96, 165, 250, 0)',
                  '0 0 0 0 rgba(96, 165, 250, 0.4)'
                ]
              } : {}}
              transition={{
                duration: 2,
                repeat: isListening ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              {/* Inner Circle */}
              <motion.button
                onClick={isListening ? onStopListening : onStartListening}
                disabled={isProcessing}
                className={`w-32 h-32 rounded-full ${
                  isListening 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                    : 'bg-gradient-to-br from-periwinkle-500 to-blue-500'
                } text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 disabled:opacity-50`}
                whileTap={{ scale: 0.95 }}
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-3 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <motion.div
                    animate={isListening ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
                  >
                    {isListening ? (
                      <MicOff className="w-12 h-12" />
                    ) : (
                      <Mic className="w-12 h-12" />
                    )}
                  </motion.div>
                )}
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Audio Visualization Lines */}
          <div className="flex items-end justify-center space-x-2 mb-6">
            {audioLines.map((_, index) => (
              <motion.div
                key={index}
                className={`w-1 rounded-full ${
                  isListening ? 'bg-blue-500' : 'bg-periwinkle-300'
                }`}
                initial={{ height: 8 }}
                animate={isListening ? {
                  height: [8, 24, 16, 32, 12],
                  opacity: [0.3, 1, 0.7, 1, 0.5]
                } : { height: 8, opacity: 0.3 }}
                transition={{
                  duration: 1.5,
                  repeat: isListening ? Infinity : 0,
                  delay: index * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Status Text */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {isProcessing
                ? 'Processing...'
                : isListening
                ? 'Listening...'
                : 'Ready to Record'}
            </h2>
            <p className="text-slate-600">
              {isProcessing
                ? 'Analyzing your explanation'
                : isListening
                ? 'Speak clearly and explain the concept'
                : 'Click the microphone to start recording'}
            </p>
            {isListening && (
              <p className="text-sm text-blue-600 mt-2">
                10 second silence will auto-stop recording
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Transcript Toggle */}
      <div className="border-t border-periwinkle-200 bg-periwinkle-50">
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full p-4 flex items-center justify-center space-x-2 text-slate-700 hover:text-slate-900 hover:bg-periwinkle-100 transition-colors"
        >
          <span className="font-medium">
            {showTranscript ? 'Hide' : 'Show'} Transcript
          </span>
          {showTranscript ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronUp className="w-5 h-5" />
          )}
        </button>

        {/* Transcript Content */}
        <AnimatePresence>
          {showTranscript && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-white border-t border-periwinkle-200 max-h-64 overflow-y-auto">
                {fullTranscript || transcript ? (
                  <div className="space-y-4">
                    {/* Previous transcript */}
                    {fullTranscript && (
                      <div className="text-gray-700 leading-relaxed">
                        {fullTranscript}
                      </div>
                    )}
                    
                    {/* Current live transcript */}
                    {transcript && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-gray-900 leading-relaxed border-l-4 border-blue-400 pl-4 bg-blue-50 p-3 rounded-r-lg"
                      >
                        {transcript}
                        {isListening && (
                          <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="ml-1 text-blue-600"
                          >
                            |
                          </motion.span>
                        )}
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-slate-600">
                    <p>No transcript available yet</p>
                    <p className="text-sm mt-1">Start recording to see your words appear here</p>
                  </div>
                )}
                
                {/* Word count */}
                <div className="mt-4 pt-4 border-t border-periwinkle-200 text-sm text-slate-600">
                  Words: {(fullTranscript + ' ' + transcript).trim().split(/\s+/).filter(Boolean).length}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};