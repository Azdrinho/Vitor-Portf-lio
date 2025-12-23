import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface AboutProps {
  isLoggedIn?: boolean;
  text?: string;
  setText?: (v: string) => void;
  title?: string;
  setTitle?: (v: string) => void;
  footerText?: string;
  setFooterText?: (v: string) => void;
}

const About: React.FC<AboutProps> = ({ 
  isLoggedIn = false, 
  text = "Vitor Gonzalez is a talented Freelance Designer & Developer...",
  setText,
  title = "/ABOUT",
  setTitle,
  footerText = "Currently working with Loom Corporate as a Product Designer",
  setFooterText
}) => {
  return (
    <section id="about" className="relative z-20 bg-[#111] text-white py-24 md:py-32 rounded-t-[3rem] md:rounded-t-[4rem] -mt-10 overflow-hidden">
      <div className="container mx-auto px-6 md:px-12">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-20">
            {isLoggedIn && setTitle ? (
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="w-full md:w-2/3"
                >
                    <input 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="font-heading text-[15vw] md:text-[10vw] leading-[0.8] bg-transparent focus:outline-none border-b border-dashed border-gray-700 focus:border-[#00c05e] w-full text-white uppercase placeholder-gray-600"
                    />
                </motion.div>
            ) : (
                <motion.h2 
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="font-heading text-[15vw] md:text-[10vw] leading-[0.8] uppercase"
                >
                    {title}
                </motion.h2>
            )}

            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 font-mono text-sm mt-4 md:mt-8"
            >
              02/05
            </motion.span>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          
          {/* Big Arrow Icon */}
          <div className="col-span-1 md:col-span-4 flex justify-center md:justify-start">
             <motion.div
               initial={{ scale: 0 }}
               whileInView={{ scale: 1 }}
               viewport={{ once: true }}
               transition={{ type: "spring", stiffness: 100 }}
               className="w-32 h-32 md:w-48 md:h-48 bg-[#222] rounded-full flex items-center justify-center"
             >
                <ArrowUpRight size={64} className="text-gray-300" />
             </motion.div>
          </div>

          {/* Text Content */}
          <div className="col-span-1 md:col-span-8">
            
            {isLoggedIn && setText ? (
               <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
               >
                   <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="w-full bg-transparent border border-dashed border-gray-600 focus:border-[#00c05e] rounded-xl p-4 text-2xl md:text-4xl font-light leading-snug md:leading-tight text-white focus:outline-none resize-none"
                      rows={6}
                   />
               </motion.div>
            ) : (
                <motion.p 
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="text-2xl md:text-4xl font-light leading-snug md:leading-tight"
                >
                  "{text}"
                </motion.p>
            )}

            <motion.div 
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               transition={{ delay: 0.3 }}
               className="mt-12 pt-8 border-t border-gray-800 flex justify-between items-center"
            >
               {isLoggedIn && setFooterText ? (
                 <input 
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    className="w-full bg-transparent focus:outline-none border-b border-dashed border-gray-700 focus:border-[#00c05e] text-xs md:text-sm text-gray-400 uppercase tracking-widest placeholder-gray-600"
                 />
               ) : (
                 <span className="text-xs md:text-sm text-gray-400 uppercase tracking-widest">
                   {footerText}
                 </span>
               )}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;