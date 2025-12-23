import React from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';

const Navbar: React.FC = () => {
  
  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
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
        
        {/* Navigation Links - Now grouped on the right */}
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
          className="bg-[#00c05e] text-white px-8 py-3 rounded-full text-sm font-bold tracking-wide shadow-lg cursor-pointer"
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
        <button className="md:hidden bg-white p-2 rounded-full border border-gray-200">
           <Menu size={20} />
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;