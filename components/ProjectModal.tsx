import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, Heart, Save, Sliders, Image as ImageIcon, FileText, Check, Trash2, GripVertical, Plus, LayoutGrid, Loader2, Link, Rows, Camera, Download, ArrowRight } from 'lucide-react';
import { Project, BlockData, BlockSize } from '../types';
import { uploadImage } from '../lib/storage'; // Import upload utility

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
  
  // -- Cover Image State --
  const [coverImage, setCoverImage] = useState(project.image);
  
  // -- Like System State --
  const [likes, setLikes] = useState(project.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  
  // Initialize blocks
  const [blocks, setBlocks] = useState<BlockData[]>(() => {
    if (project.blocks && project.blocks.length > 0) {
      return project.blocks;
    }
    const initialUrls = project.images && project.images.length > 0 
      ? project.images 
      : [project.image, project.image, project.image];
    
    return initialUrls.map((url, index) => {
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
  const [isUploading, setIsUploading] = useState(false); // General upload loading state
  const [isUploadingCover, setIsUploadingCover] = useState(false); // Specific cover upload state

  // -- Behance Import State --
  const [showBehanceInput, setShowBehanceInput] = useState(false);
  const [behanceUrl, setBehanceUrl] = useState('');
  const [isImportingBehance, setIsImportingBehance] = useState(false);

  // -- Refs for Image Upload --
  const fileInputRef = useRef<HTMLInputElement>(null); // For blocks
  const coverInputRef = useRef<HTMLInputElement>(null); // For cover
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
    const plainImages = blocks.map(b => b.url);
    
    // Logic: If cover image is placeholder or empty, and we have blocks, use the first block as cover
    let finalCover = coverImage;
    const isPlaceholder = !finalCover || finalCover.includes('placehold.co') || finalCover.includes('placeholder');
    
    if (isPlaceholder && blocks.length > 0 && blocks[0].url) {
        finalCover = blocks[0].url;
        setCoverImage(finalCover); // Update local state for immediate feedback
    }

    onSave({
      ...project,
      title,
      category,
      description,
      images: plainImages,
      blocks: blocks,
      gap,
      layoutMode,
      image: finalCover, // Save the calculated cover
      likes 
    });
    
    setHasUnsavedChanges(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLiked) return; 

    const newLikes = likes + 1;
    setLikes(newLikes);
    setHasLiked(true);

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
        url: "https://placehold.co/800x600/EEE/31343C?text=Upload+Image", // Placeholder until upload
        size: 'square'
    };
    setBlocks([...blocks, newBlock]);
    setHasUnsavedChanges(true);
  };

  const handleBehanceImport = async () => {
    if (!behanceUrl.trim()) return;
    setIsImportingBehance(true);

    try {
        const urlToCheck = behanceUrl.trim();
        const isGallery = urlToCheck.includes('behance.net/gallery');
        
        if (isGallery) {
             // 1. Fetch via Proxy
             const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlToCheck)}`;
             const res = await fetch(proxyUrl);
             if (!res.ok) throw new Error('Network response was not ok');
             const html = await res.text();
             
             // 2. Flexible Regex for Behance Images
             const imgRegex = /(https:\/\/(mir-s3-cdn-cf|m1)\.behance\.net\/project_modules\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.(jpg|png|jpeg|webp|gif))/gi;
             const found = html.match(imgRegex);
             
             if (found && found.length > 0) {
                 const unique = [...new Set(found)]; // remove duplicates
                 
                 const newBlocks: BlockData[] = unique.map(url => ({
                     id: Math.random().toString(36).substr(2, 9),
                     url: url,
                     size: 'wide' // Default to wide for project images
                 }));
                 setBlocks(prev => [...prev, ...newBlocks]);

                 // Auto-set cover image if current is placeholder
                 const isPlaceholder = !coverImage || coverImage.includes('placehold.co');
                 if (isPlaceholder && newBlocks.length > 0) {
                     setCoverImage(newBlocks[0].url);
                 }

                 setHasUnsavedChanges(true);
                 setShowBehanceInput(false);
                 setBehanceUrl('');
                 alert(`Successfully imported ${unique.length} images from Behance project.`);
             } else {
                 throw new Error("No image links found in the page source.");
             }
        } else {
             // Treat as direct link
             const newBlock: BlockData = {
                 id: Math.random().toString(36).substr(2, 9),
                 url: urlToCheck,
                 size: 'big'
             };
             setBlocks(prev => [...prev, newBlock]);
             setHasUnsavedChanges(true);
             setShowBehanceInput(false);
             setBehanceUrl('');
        }
    } catch (e: any) {
        console.error("Behance import error", e);
        const errorMessage = e.message || "Unknown error";
        
        if (confirm(`Could not automatically scrape images (${errorMessage}). \n\nDo you want to add this URL as a single direct image instead?`)) {
             const newBlock: BlockData = {
                 id: Math.random().toString(36).substr(2, 9),
                 url: behanceUrl,
                 size: 'big'
             };
             setBlocks(prev => [...prev, newBlock]);
             setHasUnsavedChanges(true);
             setShowBehanceInput(false);
             setBehanceUrl('');
        }
    } finally {
        setIsImportingBehance(false);
    }
  };

  const handleChangeSize = (id: string, newSize: BlockSize) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, size: newSize } : b));
    setHasUnsavedChanges(true);
  };

  // --- Upload Logic (Blocks) ---

  const triggerImageUpload = (id: string) => {
    setActiveBlockId(id);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeBlockId) {
      setIsUploading(true);
      
      const publicUrl = await uploadImage(file, 'portfolio');

      if (publicUrl) {
          setBlocks(prev => prev.map(block => 
            block.id === activeBlockId 
                ? { ...block, url: publicUrl }
                : block
          ));
          setHasUnsavedChanges(true);
      }
      
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // --- Upload Logic (Cover) ---
  const triggerCoverUpload = () => {
    if (coverInputRef.current) {
        coverInputRef.current.click();
    }
  };

  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setIsUploadingCover(true);
        const publicUrl = await uploadImage(file, 'portfolio');
        if (publicUrl) {
            setCoverImage(publicUrl);
            setHasUnsavedChanges(true);
        }
        setIsUploadingCover(false);
    }
  }


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
      
      {/* Hidden Inputs */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        className="hidden" 
        onChange={handleImageFileChange}
        onClick={(e) => e.stopPropagation()}
      />
      <input 
        type="file" 
        accept="image/*" 
        ref={coverInputRef} 
        className="hidden" 
        onChange={handleCoverFileChange}
        onClick={(e) => e.stopPropagation()}
      />

      {/* --- Close Button (Fixed Overlay) --- */}
      <div className="absolute top-6 right-6 z-50">
        <button 
            onClick={onClose}
            className="w-12 h-12 bg-gray-100 hover:bg-black hover:text-white rounded-full flex items-center justify-center transition-colors duration-300 shadow-md"
        >
            <X size={24} />
        </button>
      </div>

      {/* --- Scrollable Content --- */}
      <div className="flex-1 overflow-y-auto w-full bg-white px-6 md:px-12 pb-40 pt-20" onClick={onClose}>
        <div className="container mx-auto" onClick={(e) => e.stopPropagation()}>
            
            {/* Header / Project Info - MOVED INSIDE SCROLLABLE AREA */}
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl mb-12">
            
                {/* Cover Image Editor */}
                <div className="relative group shrink-0 w-32 h-32 md:w-48 md:h-48 bg-gray-100 rounded-lg overflow-hidden shadow-sm self-start">
                    {/* Updated to check for placeholder in preview mode too */}
                    <img 
                        src={(!coverImage || coverImage.includes('placehold.co')) && blocks.length > 0 ? blocks[0].url : coverImage} 
                        alt="Cover" 
                        className="w-full h-full object-cover" 
                    />
                    
                    {/* Upload Overlay */}
                    {isLoggedIn && (
                        <div 
                            onClick={triggerCoverUpload}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer hover:bg-black/50"
                        >
                            {isUploadingCover ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                            <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Change Cover</span>
                        </div>
                    )}
                </div>

                {/* Text Inputs */}
                <div className="flex flex-col w-full">
                    
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
            </div>

            {/* Grid Content */}
            <Reorder.Group 
                axis={layoutMode === 'pdf' ? "y" : undefined}
                values={blocks} 
                onReorder={(newOrder) => {
                    setBlocks(newOrder);
                    setHasUnsavedChanges(true);
                }}
                className={
                    layoutMode === 'pdf' 
                    ? "flex flex-col items-center w-full gap-0" // Gap 0 for seamless scrolling
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
                              className={`w-full h-full object-contain bg-[#f3f3f3] block pointer-events-none select-none ${layoutMode === 'pdf' ? 'h-auto w-full' : ''}`}
                           />

                           {/* Upload Loading Overlay */}
                           {isUploading && activeBlockId === block.id && (
                               <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center backdrop-blur-sm">
                                   <div className="flex flex-col items-center gap-2 text-white">
                                       <Loader2 size={32} className="animate-spin text-[#00c05e]" />
                                       <span className="text-xs font-bold uppercase tracking-widest">Uploading...</span>
                                   </div>
                               </div>
                           )}
                           
                           {/* --- EDITOR OVERLAY --- */}
                           {isLoggedIn && !isUploading && (
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

                                {/* Bottom Bar: MODERN SIZE CONTROLS (Only in Grid Mode) */}
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

            {/* Add New Block Buttons */}
            {isLoggedIn && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={handleAddBlock}
                        className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-400 hover:text-black hover:bg-gray-50 transition-all group"
                    >
                        <Plus size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold uppercase tracking-widest text-xs">Add Placeholder</span>
                    </button>

                    <div className="w-full">
                        {!showBehanceInput ? (
                            <button 
                                onClick={() => setShowBehanceInput(true)}
                                className="w-full h-full py-6 border-2 border-dashed border-[#00c05e]/30 rounded-xl flex flex-col items-center justify-center gap-2 text-[#00c05e] hover:border-[#00c05e] hover:bg-[#00c05e]/5 transition-all group"
                            >
                                <Link size={24} className="group-hover:scale-110 transition-transform" />
                                <span className="font-bold uppercase tracking-widest text-xs">Import from Behance / URL</span>
                            </button>
                        ) : (
                            <div className="w-full h-full p-4 border-2 border-[#00c05e] rounded-xl flex flex-col gap-3 bg-[#00c05e]/5">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00c05e] flex items-center gap-2">
                                    <Download size={12}/> Import Images
                                </span>
                                <div className="flex gap-2">
                                    <input 
                                        autoFocus
                                        value={behanceUrl}
                                        onChange={(e) => setBehanceUrl(e.target.value)}
                                        placeholder="Paste Behance Project URL or Image Link..."
                                        className="flex-1 bg-white text-sm p-2 rounded border border-[#00c05e]/30 focus:outline-none focus:border-[#00c05e] text-black"
                                        onKeyDown={(e) => e.key === 'Enter' && handleBehanceImport()}
                                    />
                                    <button 
                                        onClick={handleBehanceImport}
                                        disabled={isImportingBehance}
                                        className="bg-[#00c05e] text-white p-2 rounded hover:bg-black transition-colors disabled:opacity-50"
                                    >
                                        {isImportingBehance ? <Loader2 size={18} className="animate-spin"/> : <ArrowRight size={18} />}
                                    </button>
                                </div>
                                <div className="flex justify-between items-center">
                                     <p className="text-[9px] text-gray-500">
                                        Supports <strong>behance.net/gallery/...</strong> or direct links.
                                     </p>
                                     <button onClick={() => setShowBehanceInput(false)} className="text-[9px] uppercase font-bold text-gray-400 hover:text-black">Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
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
                  
                  {/* Layout Switcher */}
                  <button 
                    onClick={() => { setLayoutMode(layoutMode === 'collage' ? 'pdf' : 'collage'); setHasUnsavedChanges(true); }}
                    className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-colors ${layoutMode === 'pdf' ? 'text-[#00c05e]' : 'text-gray-400 hover:text-white'}`}
                  >
                     {layoutMode === 'collage' ? <Rows size={16}/> : <LayoutGrid size={16}/>}
                     {layoutMode === 'collage' ? "Switch to Stack (Long)" : "Switch to Grid"}
                  </button>

                  <div className="h-4 w-[1px] bg-gray-700 hidden md:block"></div>

                  {/* Gap Control */}
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
                    disabled={isUploading}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase text-xs tracking-wide transition-all ${
                        isUploading 
                            ? "bg-gray-600 cursor-not-allowed text-gray-400" 
                            : "bg-[#00c05e] text-white hover:bg-white hover:text-black"
                    }`}
                  >
                     {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                     {isUploading ? "Uploading..." : "Save Changes"}
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