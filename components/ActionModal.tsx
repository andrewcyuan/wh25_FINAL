'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionModalProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  icon: React.ReactNode;
  color: string;
  onClose: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  title,
  description,
  icon,
  color,
  onClose
}) => {
  // Map color string to tailwind classes
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    green: 'bg-green-500 hover:bg-green-600',
    yellow: 'bg-yellow-500 hover:bg-yellow-600',
    purple: 'bg-purple-500 hover:bg-purple-600'
  };

  // Background overlay animations
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  // Modal animations
  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={onClose}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
          />
          
          <motion.div 
            className="relative w-full max-w-3xl p-10 mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={modalVariants}
          >
            <div className="absolute top-3 right-3">
              <button 
                onClick={onClose}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center mb-6">
              <div className={`p-4 rounded-lg ${color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300' : 
                                                color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300' : 
                                                color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-300' : 
                                                'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300'}`}>
                <div className="text-2xl">
                  {icon}
                </div>
              </div>
              <h3 className="ml-4 text-2xl font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>

            <div className="mt-2 mb-6 text-lg">
              {description}
            </div>

            <div className="flex justify-end">
              <button
                onClick={onClose}
                className={`px-6 py-3 text-lg rounded-lg text-white ${colorClasses[color]} transition-colors`}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ActionModal;
