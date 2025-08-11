'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor } from 'lucide-react';
import { Project } from '@/types/portfolio';

interface FloatingButtonsProps {
  onCompareClick: () => void;
  onPresentationClick: () => void;
  selectedProjects: Project[];
}

export default function FloatingButtons({ 
  onCompareClick, 
  onPresentationClick, 
  selectedProjects 
}: FloatingButtonsProps) {
  const [hoveredButton, setHoveredButton] = useState<'presentation' | 'compare' | null>(null);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-24 right-4 z-40 flex items-center gap-3"
    >
      {/* Presentation Button */}
      <motion.button
        onMouseEnter={() => setHoveredButton('presentation')}
        onMouseLeave={() => setHoveredButton(null)}
        onClick={onPresentationClick}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl relative overflow-hidden group"
        style={{
          borderRadius: '28px', // Oval shape - half of height
          padding: '14px 24px', // More horizontal padding for oval
          minWidth: '56px',     // Ensure consistent width
          height: '56px',       // Fixed height for oval
        }}
        animate={{
          paddingRight: hoveredButton === 'presentation' ? '40px' : '24px',
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.4, 0, 0.2, 1] // Custom easing for smooth animation
        }}
        whileHover={{ 
          scale: 1.02,
          y: -2,
        }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2 relative z-10">
          <Monitor className="w-6 h-6 flex-shrink-0" />
          <AnimatePresence>
            {hoveredButton === 'presentation' && (
              <motion.span
                initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                animate={{ opacity: 1, width: 'auto', marginLeft: 8 }}
                exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="whitespace-nowrap font-medium text-sm"
              >
                Presentación
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        
        {/* Subtle gradient overlay for hover effect */}
        <motion.div
          className="absolute inset-0 bg-white rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: hoveredButton === 'presentation' ? 0.1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>

      {/* Compare Button */}
      <motion.button
        onMouseEnter={() => setHoveredButton('compare')}
        onMouseLeave={() => setHoveredButton(null)}
        onClick={onCompareClick}
        className="bg-accent text-white shadow-lg hover:shadow-xl relative overflow-hidden group"
        style={{
          borderRadius: '28px', // Oval shape - half of height
          padding: '14px 24px', // More horizontal padding for oval
          minWidth: '56px',     // Ensure consistent width
          height: '56px',       // Fixed height for oval
        }}
        animate={{
          paddingRight: hoveredButton === 'compare' ? '40px' : '24px',
        }}
        transition={{ 
          duration: 0.4, 
          ease: [0.4, 0, 0.2, 1] // Custom easing for smooth animation
        }}
        whileHover={{ 
          scale: 1.02,
          y: -2,
        }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center gap-2 relative z-10">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
            />
          </svg>
          <AnimatePresence>
            {hoveredButton === 'compare' && (
              <motion.span
                initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                animate={{ opacity: 1, width: 'auto', marginLeft: 8 }}
                exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="whitespace-nowrap font-medium text-sm"
              >
                Comparar {selectedProjects.length > 0 && `(${selectedProjects.length})`}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Counter Badge */}
        <AnimatePresence>
          {selectedProjects.length > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30 
              }}
              className="absolute -top-2 -right-2 bg-white text-accent rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold shadow-md"
            >
              {selectedProjects.length}
            </motion.span>
          )}
        </AnimatePresence>
        
        {/* Subtle gradient overlay for hover effect */}
        <motion.div
          className="absolute inset-0 bg-white rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: hoveredButton === 'compare' ? 0.1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.button>
    </motion.div>
  );
}