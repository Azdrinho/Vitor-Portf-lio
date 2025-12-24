import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, Heart, Save, Sliders, Image as ImageIcon, FileText, Check, Trash2, GripVertical, Plus, LayoutGrid } from 'lucide-react';
import { Project, BlockData, BlockSize } from '../types';

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
  isLoggedIn: boolean;
  onSave: (updatedProject: Project) => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, isLoggedIn, onSave }) => {
  
  // -- Local State for Editing --
  const [title, setTitle] = useState(project.title);
  const [category, setCategory] = useState(project.category);
  const [description, setDescription] = useState(project.description || "");
  const [gap, setGap] = useState(project.gap ?? 8);
  
  // -- Like System State --
  const [likes, setLikes] = useState(project.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  
  // Initialize blocks: Use saved blocks if available, otherwise generate from simple images array
  const [blocks, setBlocks] = useState<BlockData[]>(() => {
    if (project.blocks && project.blocks.length > 0) {
      return project.blocks;
    }
    
    // Fallback generation for legacy projects
    const initialUrls = project.images && project.images.length > 0 
      ? project.images 
      : [project.image, project.image, project.image];
    
    return initialUrls.map((url, index) => {
       // Auto-assign some varied sizes for initial look
       let size: BlockSize = 'square';
       if (index === 0) size = 'wide';
       if (index === 3) size = 'wide';
       
       return {
         id: Math.random().toString(36).substr(2, 9),
         url,
         size
       };
    });
  });
  
  const [layoutMode, setLayoutMode] = useState<'collage' | 'pdf'>(project.layoutMode || 'collage');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // -- Refs for Image Upload --
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // -- Effects --
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // -- Handlers --

  const handleSave = () => {
    // We primarily save the structured 'blocks' now.
    // Also update legacy 'images' array for backward compatibility if needed elsewhere
    const plainImages = blocks.map(b => b.url);
    const updatedCoverImage = plainImages.length > 0 ? plainImages[0] : project.image;

    onSave({
      ...project,
      title,
      category,
      description,
      images: plainImages,
      blocks: blocks, // Persist structure
      gap,
      layoutMode,
      image: updatedCoverImage,
      likes 
    });
    
    setHasUnsavedChanges(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLiked) return; // Prevent spamming

    const newLikes = likes + 1;
    setLikes(newLikes);
    setHasLiked(true);

    // Persist immediately
    onSave({
        ...project,
        likes: newLikes
    });
  };

  // --- Block Management ---

  const handleDeleteBlock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (blocks.length <= 1) {
        alert("Projects must have at least one image.");
        return;
    }
    setBlocks(prev => prev.filter(b => b.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleAddBlock = () => {
    const newBlock: BlockData = {
        id: Math.random().toString(36).substr(2, 9),
        url: "https://picsum.photos/800/600?random=" + Math.floor(Math.random() * 1000),
        size: 'square'
    };
    setBlocks([...blocks, newBlock]);
    setHasUnsavedChanges(true);
  };

  const handleChangeSize = (id: string, newSize: BlockSize) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, size: newSize } : b));
    setHasUnsavedChanges(true);
  };

  // --- Upload Logic ---

  const triggerImageUpload = (id: string) => {
    setActiveBlockId(id);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeBlockId) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBlocks(prev => prev.map(block => 
            block.id === activeBlockId 
                ? { ...block, url: event.target.result as string }
                : block
          ));
          setHasUnsavedChanges(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulation of PDF import
      const pdfMockPages = [
         "https://placehold.co/800x1100/EEE/31343C?text=PDF+Page+1",
         "https://placehold.co/800x1100/EEE/31343C?text=PDF+Page+2",
         "https://placehold.co/800x1100/EEE/31343C?text=PDF+Page+3",
      ];
      
      const newBlocks: BlockData[] = pdfMockPages.map(url => ({
        id: Math.random().toString(36).substr(2, 9),
        url,
        size: 'wide'
      }));

      setBlocks(newBlocks);
      setLayoutMode('pdf');
      setGap(20);
      setHasUnsavedChanges(true);
    }
  };

  // Utility to map size names to Tailwind grid classes
  const getSizeClass = (size: BlockSize) => {
      switch(size) {
          case 'wide': return 'md:col-span-2 md:row-span-1 h-[40vh] md:h-[50vh]';
          case 'tall': return 'md:col-span-1 md:row-span-2 h-[60vh] md:h-[80vh]';
          case 'big': return 'md:col-span-2 md:row-span-2 h-[60vh] md:h-[80vh]';
          case 'square': default: return 'md:col-span-1 md:row-span-1 h-[40vh]';
      }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-white overflow-hidden flex flex-col"
      onClick={onClose}
    >
      
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleImageFileChange}
        onClick={(e) => e.stopPropagation()}
      />

      {/* --- Header --- */}
      <div 
        className="w-full bg-white z-30 flex justify-between items-start pt-8 px-6 md:px-12 pb-4 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
         {/* Left Side: Title & Description */}
         <div className="flex flex-col w-full max-w-4xl">
            
            {/* Category */}
            <div className="mb-2">
                {isLoggedIn ? (
                <input 
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); setHasUnsavedChanges(true); }}
                    className="text-xs font-bold uppercase tracking-widest text-[#00c05e] bg-transparent focus:outline-none w-full placeholder-gray-300"
                    placeholder="CATEGORY"
                />
                ) : (
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{category}</span>
                )}
            </div>

            {/* Title */}
            <div className="mb-4">
                {isLoggedIn ? (
                <input 
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setHasUnsavedChanges(true); }}
                    className="font-heading text-4xl md:text-6xl uppercase leading-none bg-transparent focus:outline-none w-full placeholder-gray-200"
                    placeholder="PROJECT TITLE"
                />
                ) : (
                <h2 className="font-heading text-4xl md:text-6xl uppercase leading-none">{title}</h2>
                )}
            </div>

            {/* Description */}
            <div className="w-full">
                {isLoggedIn ? (
                    <div className="relative group">
                        <textarea 
                            value={description}
                            onChange={(e) => { setDescription(e.target.value); setHasUnsavedChanges(true); }}
                            placeholder="Add a brief description about this project..."
                            className="w-full text-lg md:text-xl font-light text-gray-600 bg-transparent focus:text-black focus:outline-none resize-none overflow-hidden min-h-[3em] placeholder-gray-200"
                            style={{ height: 'auto' }}
                            rows={2}
                            spellCheck={false}
                        />
                        <span className="absolute -left-6 top-1 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            <FileText size={16} />
                        </span>
                    </div>
                ) : (
                    description && (
                        <p className="text-lg md:text-xl font-light text-gray-600 leading-relaxed max-w-2xl">
                            {description}
                        </p>
                    )
                )}
            </div>

         </div>
         
         {/* Close Button */}
         <div className="flex items-center gap-4">
            <button 
              onClick={onClose}
              className="w-12 h-12 bg-gray-100 hover:bg-black hover:text-white rounded-full flex items-center justify-center transition-colors duration-300"
            >
              <X size={24} />
            </button>
         </div>
      </div>

      {/* --- Scrollable Content --- */}
      <div className="flex-1 overflow-y-auto w-full bg-white px-6 md:px-12 pb-40" onClick={onClose}>
        <div className="container mx-auto pt-8" onClick={(e) => e.stopPropagation()}>
            
            <Reorder.Group 
                axis={layoutMode === 'pdf' ? "y" : undefined}
                values={blocks} 
                onReorder={(newOrder) => {
                    setBlocks(newOrder);
                    setHasUnsavedChanges(true);
                }}
                className={
                    layoutMode === 'pdf' 
                    ? "flex flex-col items-center w-full gap-8" 
                    : "grid grid-cols-1 md:grid-cols-2 w-full auto-rows-min"
                }
                style={layoutMode === 'collage' ? { gap: `${gap}px` } : {}}
            >
                {blocks.map((block) => {
                    return (
                        <Reorder.Item 
                            key={block.id} 
                            value={block}
                            dragListener={isLoggedIn}
                            drag={layoutMode === 'pdf' ? "y" : true}
                            className={`relative group bg-gray-100 overflow-hidden ${layoutMode === 'collage' ? getSizeClass(block.size) : 'w-full h-auto'}`}
                            whileDrag={{ scale: 1.02, zIndex: 50, boxShadow: "0px 20px 40px rgba(0,0,0,0.1)" }}
                        >
                           <img 
                              src={block.url} 
                              alt="Project Asset" 
                              className={`w-full h-full object-cover block pointer-events-none select-none ${layoutMode === 'pdf' ? 'h-auto' : ''}`}
                           />
                           
                           {/* --- EDITOR OVERLAY --- */}
                           {isLoggedIn && (
                             <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 backdrop-blur-[2px]">
                                
                                {/* Drag Indicator (Center) */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
                                    <GripVertical size={48} />
                                </div>

                                {/* Top Actions */}
                                <div className="absolute top-4 right-4 flex gap-2">
                                     {/* Replace Image Button (Icon Only) */}
                                     <button 
                                      onClick={(e) => { e.stopPropagation(); triggerImageUpload(block.id); }}
                                      className="p-2 bg-white/10 hover:bg-white hover:text-black text-white rounded-full transition-all backdrop-blur-md border border-white/20"
                                      title="Replace Image"
                                     >
                                       <ImageIcon size={18} />
                                     </button>

                                     {/* Delete Button */}
                                     <button 
                                      onClick={(e) => handleDeleteBlock(block.id, e)}
                                      className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-md border border-white/20"
                                      title="Delete Block"
                                    >
                                       <Trash2 size={18} />
                                    </button>
                                </div>

                                {/* Bottom Bar: MODERN SIZE CONTROLS */}
                                {layoutMode === 'collage' && (
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                                        <div className="flex items-center gap-2 bg-[#1a1a1a]/90 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-2xl scale-90 md:scale-100">
                                            
                                            {/* Square (1x1) */}
                                            <button 
                                                onClick={() => handleChangeSize(block.id, 'square')}
                                                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${
                                                    block.size === 'square' 
                                                    ? 'bg-[#00c05e] text-black shadow-[0_0_15px_rgba(0,192,94,0.4)]' 
                                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                                }`}
                                                title="Square"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                                                </svg>
                                            </button>

                                            {/* Wide (2x1) */}
                                            <button 
                                                onClick={() => handleChangeSize(block.id, 'wide')}
                                                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${
                                                    block.size === 'wide' 
                                                    ? 'bg-[#00c05e] text-black shadow-[0_0_15px_rgba(0,192,94,0.4)]' 
                                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                                }`}
                                                title="Wide"
                                            >
                                                <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="1" y="1" width="16" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
                                                </svg>
                                            </button>

                                            {/* Tall (1x2) */}
                                            <button 
                                                onClick={() => handleChangeSize(block.id, 'tall')}
                                                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${
                                                    block.size === 'tall' 
                                                    ? 'bg-[#00c05e] text-black shadow-[0_0_15px_rgba(0,192,94,0.4)]' 
                                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                                }`}
                                                title="Tall"
                                            >
                                                <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="1" y="1" width="8" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
                                                </svg>
                                            </button>

                                            {/* Big (2x2) */}
                                            <button 
                                                onClick={() => handleChangeSize(block.id, 'big')}
                                                className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${
                                                    block.size === 'big' 
                                                    ? 'bg-[#00c05e] text-black shadow-[0_0_15px_rgba(0,192,94,0.4)]' 
                                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                                }`}
                                                title="Big"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="1" y="1" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
                                                </svg>
                                            </button>

                                        </div>
                                    </div>
                                )}

                             </div>
                           )}
                        </Reorder.Item>
                    );
                })}
            </Reorder.Group>

            {/* Add New Block Button */}
            {isLoggedIn && (
                <button 
                    onClick={handleAddBlock}
                    className="mt-8 w-full py-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#00c05e] hover:text-[#00c05e] hover:bg-green-50/50 transition-all group"
                >
                    <Plus size={32} className="group-hover:scale-110 transition-transform" />
                    <span className="font-bold uppercase tracking-widest text-xs">Add New Content Block</span>
                </button>
            )}

             {/* Bottom Action (View Only) with Functional Like Button */}
             {!isLoggedIn && (
               <div className="text-center pt-24 pb-12">
                  <button 
                    onClick={handleLike}
                    className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-black text-white rounded-full font-bold uppercase tracking-wider overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={hasLiked}
                  >
                     <span className={`absolute inset-0 w-full h-full bg-[#00c05e] translate-y-full transition-transform duration-300 ${hasLiked ? 'translate-y-0' : 'group-hover:translate-y-0'}`}></span>
                     <span className="relative flex items-center gap-3">
                       <Heart 
                         size={20} 
                         className={`transition-colors duration-300 ${hasLiked ? 'fill-white text-white' : 'group-hover:text-white'}`} 
                         fill={hasLiked ? "currentColor" : "none"}
                       /> 
                       <span>{hasLiked ? "Appreciated" : "Appreciate Project"}</span>
                       <span className="bg-white/20 px-2 py-0.5 rounded text-sm min-w-[2rem] text-center ml-1">
                         {likes}
                       </span>
                     </span>
                  </button>
               </div>
            )}
        </div>
      </div>

      {/* --- ADMIN TOOLBAR --- */}
      <AnimatePresence>
        {isLoggedIn && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-[#111] text-white py-4 px-6 md:px-12 border-t border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
               
               {/* Controls Left */}
               <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="relative">
                     <input 
                       type="file" 
                       accept=".pdf" 
                       id="pdf-upload" 
                       className="hidden" 
                       onChange={handlePDFUpload}
                     />
                     <label 
                       htmlFor="pdf-upload"
                       className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-400 hover:text-white cursor-pointer transition-colors"
                     >
                        <FileText size={16} /> Import PDF
                     </label>
                  </div>

                  <div className="h-4 w-[1px] bg-gray-700 hidden md:block"></div>

                  <div className="flex items-center gap-3">
                     <LayoutGrid size={16} className="text-gray-400" />
                     <div className="flex items-center gap-2">
                         <span className="text-[10px] uppercase text-gray-500 w-12">Gap: {gap}px</span>
                         <input 
                           type="range" 
                           min="0" 
                           max="60" 
                           value={gap} 
                           onChange={(e) => { setGap(parseInt(e.target.value)); setHasUnsavedChanges(true); }}
                           className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00c05e]"
                         />
                     </div>
                  </div>
               </div>

               {/* Controls Right */}
               <div className="flex items-center gap-4">
                  <AnimatePresence>
                     {showSavedToast && (
                        <motion.div 
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0 }}
                           className="flex items-center gap-2 text-[#00c05e] font-bold text-xs uppercase"
                        >
                           <Check size={14} /> Saved!
                        </motion.div>
                     )}
                  </AnimatePresence>

                  {hasUnsavedChanges && !showSavedToast && (
                     <span className="text-[10px] uppercase tracking-widest text-yellow-500 animate-pulse">Unsaved Changes</span>
                  )}
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-[#00c05e] text-white rounded-full font-bold uppercase text-xs tracking-wide hover:bg-white hover:text-black transition-all"
                  >
                     <Save size={16} /> Save Changes
                  </button>
               </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default ProjectModal;