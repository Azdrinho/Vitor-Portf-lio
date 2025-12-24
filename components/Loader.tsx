import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Loader: React.FC = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Faster loading simulation for a snappier feel
    const duration = 1200; // Reduced from 2000 to match App.tsx quicker timeout
    const steps = 30;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const increment = Math.floor(Math.random() * 15) + 5; 
        return Math.min(prev + increment, 100);
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white overflow-hidden"
      initial={{ y: 0 }}
      exit={{ 
        y: "-100%", 
        transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
      }}
    >
      <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
        
        {/* Main Title - Minimalist & Bold */}
        <div className="flex items-baseline gap-3 mb-6 overflow-hidden">
          <motion.h1 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className="font-heading text-4xl md:text-6xl uppercase tracking-tighter text-white"
          >
            Design by Vitor
          </motion.h1>
        </div>

        {/* Progress Container - Architectural Line */}
        <div className="w-full h-[1px] bg-gray-800 relative overflow-hidden">
             {/* The Moving Line */}
             <motion.div 
                className="h-full bg-white absolute left-0 top-0"
                initial={{ width: "0%" }}
                animate={{ width: `${count}%` }}
                transition={{ ease: "linear", duration: 0.1 }}
             />
        </div>

        {/* Meta Data Row */}
        <div className="w-full flex justify-between items-center mt-3">
            <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-mono text-[10px] uppercase tracking-widest text-gray-500"
            >
                Portfolio 2024
            </motion.span>

            <motion.span 
                className="font-mono text-2xl md:text-3xl font-light text-white tabular-nums"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                {count}%
            </motion.span>
        </div>

      </div>
    </motion.div>
  );
};

export default Loader;