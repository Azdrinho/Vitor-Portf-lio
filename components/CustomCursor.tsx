import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';

export type CursorType = 'default' | 'pointer' | 'drag' | 'view' | 'none';

const CustomCursor: React.FC = () => {
  const [cursorType, setCursorType] = useState<CursorType>('default');
  const [isVisible, setIsVisible] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth springs for high-end feel
  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Automatic detection for common interactive elements
      const target = e.target as HTMLElement;
      const isPointer = target.closest('a, button, input, textarea, [role="button"]');
      const isDrag = target.closest('.cursor-drag-zone');
      const isView = target.closest('.cursor-view-zone');

      if (isDrag) setCursorType('drag');
      else if (isView) setCursorType('view');
      else if (isPointer) setCursorType('pointer');
      else setCursorType('default');
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (typeof window === 'undefined' || !isVisible) return null;

  const variants = {
    default: {
      width: 16,
      height: 16,
      backgroundColor: "rgba(0, 0, 0, 1)",
      border: "none",
    },
    pointer: {
      width: 48,
      height: 48,
      backgroundColor: "rgba(0, 192, 94, 0.2)",
      border: "1px solid #00c05e",
    },
    drag: {
      width: 80,
      height: 80,
      backgroundColor: "#111",
      border: "1px solid rgba(255,255,255,0.2)",
    },
    view: {
      width: 80,
      height: 80,
      backgroundColor: "#00c05e",
      border: "none",
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full flex items-center justify-center mix-blend-normal overflow-hidden hidden md:flex"
      style={{
        x: cursorX,
        y: cursorY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      animate={variants[cursorType === 'none' ? 'default' : cursorType]}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <AnimatePresence mode="wait">
        {cursorType === 'drag' && (
          <motion.span
            key="drag"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="text-[10px] font-bold text-white uppercase tracking-tighter"
          >
            Drag
          </motion.span>
        )}
        {cursorType === 'view' && (
          <motion.span
            key="view"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="text-[10px] font-bold text-black uppercase tracking-tighter"
          >
            View
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CustomCursor;