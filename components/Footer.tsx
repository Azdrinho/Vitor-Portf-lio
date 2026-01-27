
import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Settings } from 'lucide-react';

// Lazy load heavy 3D animation
const TunnelAnimation = React.lazy(() => import('./TunnelAnimation'));

interface FooterProps {
  onAdminClick: () => void;
  isLoggedIn?: boolean;
  ctaText?: string;
  setCtaText?: (v: string) => void;
  bigText?: string;
  setBigText?: (v: string) => void;
}

const Footer: React.FC<FooterProps> = ({ 
    onAdminClick, 
    isLoggedIn = false,
    ctaText = "Let's Work Together",
    setCtaText,
    bigText = "VITOR GONZALEZ",
    setBigText
}) => {
  return (
    <footer id="contact" className="bg-[#EAEAEA] pt-24 pb-12 px-6 md:px-12 relative overflow-hidden">
      <div className="w-full flex flex-col h-full justify-between">
        
        {/* CTA Top - Layout ajustado para alinhamento vertical */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch mb-24 md:mb-48 gap-12">
           <div className="flex flex-col items-start gap-4 w-full max-w-2xl">
              <ArrowUpRight size={64} className="text-black shrink-0 mb-2" />
              
              {isLoggedIn && setCtaText ? (
                 <textarea 
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="font-heading text-5xl md:text-7xl uppercase leading-none w-full bg-transparent focus:outline-none border border-dashed border-gray-400 focus:border-black rounded p-2 resize-none"
                    rows={2}
                 />
              ) : (
                <h2 className="font-heading text-5xl md:text-7xl uppercase leading-none whitespace-pre-wrap">
                    {ctaText}
                </h2>
              )}

           </div>

           <motion.a 
             href="https://wa.me/5548992079358"
             target="_blank"
             rel="noopener noreferrer"
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             className="w-full md:w-auto md:min-w-[400px] lg:min-w-[500px] flex items-center justify-center text-center px-12 py-16 border border-gray-400 rounded-full text-xl md:text-3xl font-heading font-bold uppercase tracking-widest hover:bg-black hover:text-white hover:border-black transition-all duration-300 cursor-pointer bg-transparent"
           >
             Send Me a Message
           </motion.a>
        </div>

        {/* Bottom Giant Text + Animation */}
        <div className="relative border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-between items-end gap-8">
           <div className="w-full flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-12">
               <div className="w-full md:w-auto flex-grow">
                   {isLoggedIn && setBigText ? (
                       <input 
                          value={bigText}
                          onChange={(e) => setBigText(e.target.value)}
                          className="font-heading text-[10vw] md:text-[15vw] leading-none w-full bg-transparent focus:outline-none border-b border-dashed border-gray-400 focus:border-black text-center md:text-left uppercase tracking-tighter"
                       />
                   ) : (
                    <h1 className="font-heading text-[15vw] leading-none text-center md:text-left text-black uppercase tracking-tighter">
                        {bigText}
                    </h1>
                   )}
               </div>
               
               {/* Tunnel Animation - Lazy Loaded */}
               <div className="hidden md:flex items-center justify-center mb-6 md:mr-10">
                   <div className="relative w-32 h-32 flex items-center justify-center">
                       <div className="absolute transform scale-[0.6]">
                           <div style={{ width: 200, height: 200 }}>
                                <Suspense fallback={<div className="w-full h-full bg-gray-300 rounded-full animate-pulse opacity-50"></div>}>
                                    <TunnelAnimation />
                                </Suspense>
                           </div>
                       </div>
                   </div>
               </div>
           </div>
        </div>

        {/* Copyright & Socials */}
        <div className="flex flex-col md:flex-row justify-between items-center text-xs md:text-sm font-medium text-gray-500 mt-16 uppercase tracking-wide">
           <p>© 2026 Design by Vitor. All Right Reserved.</p>
           
           <div className="flex flex-wrap justify-center gap-6 mt-4 md:mt-0 items-center">
              <a href="https://www.behance.net/vitorgonzalezz?" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Behance</a>
              <a href="https://www.instagram.com/vitorgonzalezzz/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Instagram</a>
              <a href="https://www.linkedin.com/in/vitor-gonzalez-379096210/" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">LinkedIn</a>
              
              {/* Admin Button Moved Here */}
              <button 
                onClick={onAdminClick} 
                className="hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
                title="Admin Access"
              >
                Admin <Settings size={12} className="mb-[2px]" />
              </button>
           </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
