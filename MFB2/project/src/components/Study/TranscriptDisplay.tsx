import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Type } from 'lucide-react';

interface TranscriptDisplayProps {
  transcript: string;
  fullTranscript: string;
  isListening: boolean;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
  fullTranscript,
  isListening
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, fullTranscript]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-96 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Type className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Live Transcript</h3>
        </div>
        <div className="flex items-center space-x-2">
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center space-x-2"
            >
              <Mic className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-500">Recording</span>
            </motion.div>
          ) : (
            <div className="flex items-center space-x-2">
              <MicOff className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Transcript Content */}
      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto">
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
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Mic className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Ready to Listen</p>
              <p className="text-sm">
                Click the AI assistant to start recording your explanation
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer with word count */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>
            Words: {(fullTranscript + ' ' + transcript).trim().split(/\s+/).filter(Boolean).length}
          </span>
          {isListening && (
            <span className="text-blue-600 font-medium">
              10s silence auto-timeout
            </span>
          )}
        </div>
      </div>
    </div>
  );
};