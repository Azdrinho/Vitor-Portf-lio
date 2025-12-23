import React from 'react';
import { motion } from 'framer-motion';

interface MarqueeProps {
  isLoggedIn?: boolean;
  text?: string;
  setText?: (v: string) => void;
}

const Marquee: React.FC<MarqueeProps> = ({ 
    isLoggedIn = false, 
    text = "DESIGN BY VITOR ✸ DIGITAL PRODUCT AND BRAND ✸", 
    setText 
}) => {
  return (
    <div className="bg-[#111] py-8 overflow-hidden border-t border-gray-800 relative group">
      
      {/* Edit Overlay (Visible when logged in and hovering) */}
      {isLoggedIn && setText && (
        <div className="absolute top-0 left-0 right-0 z-20 flex justify-center -translate-y-full group-hover:translate-y-2 transition-transform duration-300">
           <input 
             value={text}
             onChange={(e) => setText(e.target.value)}
             className="bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-full px-6 py-2 w-1/2 text-center focus:outline-none focus:bg-white/20"
             placeholder="Edit Marquee Text"
           />
        </div>
      )}

      <motion.div 
        className="flex whitespace-nowrap items-center"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      >
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center text-white font-heading text-4xl md:text-6xl uppercase tracking-tighter px-4">
             <span className="mx-4">{text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default Marquee;