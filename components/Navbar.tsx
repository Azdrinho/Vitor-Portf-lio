import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false); // Close mobile menu when clicking a link
    
    const element = document.getElementById(id);
    if (element) {
      // Offset to account for the fixed navbar height
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-40 px-6 py-6 md:px-12 flex justify-between items-center pointer-events-none"
      >
        {/* Left - Logo */}
        <div className="flex items-center gap-4 pointer-events-auto bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200">
          <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-xs rounded">
            III
          </div>
          <span className="font-semibold text-sm tracking-wide uppercase hidden sm:block">Design by Vitor</span>
        </div>

        {/* Right Side Container (Menu + Buttons) */}
        <div className="flex items-center gap-3 md:gap-4 pointer-events-auto">
          
          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center gap-8 bg-white/80 backdrop-blur-sm px-8 py-3 rounded-full border border-gray-200 shadow-sm mr-2">
            <a 
              href="#about" 
              onClick={(e) => scrollToSection(e, 'about')}
              className="text-sm font-medium hover:text-gray-500 transition-colors cursor-pointer"
            >
              ABOUT
            </a>
            <a 
              href="#work" 
              onClick={(e) => scrollToSection(e, 'work')}
              className="text-sm font-medium hover:text-gray-500 transition-colors cursor-pointer"
            >
              WORK
            </a>
            <a 
              href="#contact" 
              onClick={(e) => scrollToSection(e, 'contact')}
              className="text-sm font-medium hover:text-gray-500 transition-colors cursor-pointer"
            >
              CONTACT
            </a>
          </div>

          {/* HIRE ME Button - Solid Green with Pulse */}
          <motion.button 
            onClick={(e) => scrollToSection(e, 'contact')}
            className="bg-[#00c05e] text-white px-6 md:px-8 py-3 rounded-full text-xs md:text-sm font-bold tracking-wide shadow-lg cursor-pointer whitespace-nowrap"
            animate={{
              scale: [1, 1.02, 1],
              boxShadow: [
                "0 0 0 0px rgba(0, 192, 94, 0.6)",
                "0 0 0 8px rgba(0, 192, 94, 0)",
                "0 0 0 0px rgba(0, 192, 94, 0)"
              ]
            }}
            transition={{
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            whileHover={{ 
              scale: 1.05,
              backgroundColor: "#000", // Turns black on hover for contrast
              boxShadow: "0 0 0 0px rgba(0,0,0,0)" // Stop pulsing on hover
            }}
            whileTap={{ scale: 0.95 }}
          >
            HIRE ME
          </motion.button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden bg-white p-3 rounded-full border border-gray-200 shadow-sm active:scale-95 transition-transform"
          >
             <Menu size={20} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
              initial={{ opacity: 0, clipPath: "circle(0% at 100% 0%)" }}
              animate={{ opacity: 1, clipPath: "circle(150% at 100% 0%)" }}
              exit={{ opacity: 0, clipPath: "circle(0% at 100% 0%)" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="fixed inset-0 z-[60] bg-[#111] text-white flex flex-col items-center justify-center p-6"
          >
               <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-6 right-6 p-4 bg-white/10 rounded-full hover:bg-white/20 text-white transition-colors"
              >
                  <X size={24} />
              </button>

              <div className="flex flex-col gap-8 text-center">
                  {['ABOUT', 'WORK', 'CONTACT'].map((item, i) => (
                      <motion.a 
                          key={item}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + (i * 0.1) }}
                          href={`#${item.toLowerCase()}`}
                          onClick={(e) => scrollToSection(e, item.toLowerCase())}
                          className="font-heading text-6xl font-bold uppercase tracking-wider hover:text-[#00c05e] transition-colors"
                      >
                          {item}
                      </motion.a>
                  ))}
              </div>
               
              <div className="absolute bottom-12 text-gray-500 text-xs uppercase tracking-widest font-mono">
                  Design by Vitor © 2026
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;