import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Plus, Trash2 } from 'lucide-react';
import { Project } from '../types';

interface ProcessProps {
  projects: Project[];
  onProjectClick: (project: Project) => void;
  isLoggedIn: boolean;
  onAddProject: () => void;
  onDeleteProject: (id: number) => void;
  title: string;
  setTitle: (v: string) => void;
  subtitle: string;
  setSubtitle: (v: string) => void;
}

const Process: React.FC<ProcessProps> = ({ 
    projects, 
    onProjectClick, 
    isLoggedIn, 
    onAddProject, 
    onDeleteProject,
    title,
    setTitle,
    subtitle,
    setSubtitle
}) => {
  
  // Helper to determine the best display image
  const getDisplayImage = (project: Project) => {
    const isPlaceholder = !project.image || project.image.includes('placehold.co') || project.image.includes('placeholder');
    
    // If specific cover exists and is not a placeholder, use it
    if (!isPlaceholder) return project.image;
    
    // Fallback: Try to find the first valid image in blocks
    if (project.blocks && project.blocks.length > 0) {
        const firstBlockImage = project.blocks.find(b => b.url && !b.url.includes('placehold.co'));
        if (firstBlockImage) return firstBlockImage.url;
    }
    
    // Final fallback: return the placeholder
    return project.image;
  };

  return (
    <section className="bg-[#111] text-white relative z-10">
      
      {/* Header */}
      <div className="pt-24 pb-12 px-6 md:px-12 bg-[#111]">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-end border-b border-gray-800 pb-8"
        >
            <div className="w-full">
                {isLoggedIn ? (
                    <textarea 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="font-heading text-6xl md:text-8xl uppercase leading-none bg-transparent focus:outline-none w-full border border-dashed border-gray-700 focus:border-[#00c05e] rounded p-2 text-white resize-none"
                        rows={2}
                    />
                ) : (
                    <h2 className="font-heading text-6xl md:text-8xl uppercase leading-none whitespace-pre-wrap">
                        {title}
                    </h2>
                )}
            </div>

            <div className="w-full md:w-auto mt-8 md:mt-0 flex flex-col md:items-end gap-6">
                {isLoggedIn ? (
                    <textarea 
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        className="text-gray-400 text-sm md:text-base bg-transparent focus:outline-none w-full md:w-96 text-right border border-dashed border-gray-700 focus:border-[#00c05e] rounded p-2 resize-none"
                        rows={3}
                    />
                ) : (
                    <p className="text-gray-400 text-sm md:text-base max-w-sm text-right ml-auto">
                        {subtitle}
                    </p>
                )}

                {/* Moved Add Project Button Here */}
                {isLoggedIn && (
                    <button 
                        onClick={onAddProject}
                        className="flex items-center gap-2 px-6 py-3 bg-[#00c05e] text-black rounded-full font-bold uppercase text-xs tracking-wider hover:bg-white transition-colors shadow-lg"
                    >
                        <Plus size={16} /> Add New Project
                    </button>
                )}
            </div>
        </motion.div>
      </div>

      {/* CSS Grid - Perfectly Rectangular Block */}
      <div className="w-full bg-[#111] grid grid-cols-1 md:grid-cols-3 auto-rows-[300px] md:auto-rows-[400px] gap-0">
        
        {projects.map((item, index) => {
          const displayImage = getDisplayImage(item);
          
          return (
          <motion.div
            key={item.id}
            layoutId={`project-${item.id}`} // Ensures Framer tracks this specific element across moves
            layout="position" // Specific optimization for position changes
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            // Physics-based transition for that "60fps" fluid feel
            transition={{ 
                layout: {
                    type: "spring",
                    stiffness: 45, // Lower stiffness = softer movement
                    damping: 12,   // Damping prevents it from wobbling too much
                    mass: 0.6      // Lighter mass makes it react faster
                },
                opacity: { duration: 0.4, delay: index * 0.05 } // Only delay the fade-in, not the movement
            }}
            className={`relative w-full h-full overflow-hidden group border-[0.5px] border-[#222] cursor-view-zone ${item.className}`}
          >
            
            {/* 1. Project Content & Click Trigger */}
            <div 
                className="w-full h-full cursor-pointer relative z-10"
                onClick={() => onProjectClick(item)}
            >
                {/* Image Container - Also animates layout to prevent image popping */}
                <motion.div className="w-full h-full overflow-hidden" layout>
                    <motion.img 
                      layout // Image itself animates its size
                      src={displayImage} 
                      alt={item.title} 
                      className="w-full h-full object-cover block transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110" 
                      loading="lazy"
                    />
                </motion.div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-between p-6 md:p-8 pointer-events-none">
                  <div className="flex justify-end">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-500 delay-100 text-black">
                          <ArrowUpRight size={20} />
                      </div>
                  </div>
                  
                  <div className="transform translate-y-10 group-hover:translate-y-0 transition-transform duration-500 delay-100 pr-12">
                      <span className="text-[10px] md:text-xs font-mono text-gray-300 uppercase tracking-widest block mb-1 md:mb-2">{item.category}</span>
                      <h3 className="font-heading text-2xl md:text-4xl uppercase text-white leading-none">{item.title}</h3>
                  </div>
                </div>
            </div>

            {/* 2. Delete Button - Sibling to content, higher Z-index */}
            {isLoggedIn && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation(); 
                        onDeleteProject(item.id);
                    }}
                    className="absolute bottom-6 right-6 z-[60] w-10 h-10 flex items-center justify-center bg-black/40 hover:bg-red-600 text-white backdrop-blur-md border border-white/20 hover:border-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 cursor-pointer shadow-lg"
                    title="Delete Project"
                >
                    <Trash2 size={16} className="pointer-events-none" />
                </button>
            )}

          </motion.div>
        );
        })}
      </div>
    </section>
  );
};

export default Process;