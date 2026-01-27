import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, Heart, Save, Sliders, Image as ImageIcon, FileText, Check, Trash2, GripVertical, Plus, LayoutGrid, Loader2, Link, Rows, Camera, Download, ArrowRight, Video, Youtube, Clapperboard } from 'lucide-react';
import { Project, BlockData, BlockSize, BlockType } from '../types';
import { uploadImage } from '../lib/storage';

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
         size,
         type: 'image'
       };
    });
  });
  
  const [layoutMode, setLayoutMode] = useState<'collage' | 'pdf'>(project.layoutMode || 'collage');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // -- Behance/Video Import State --
  const [showBehanceInput, setShowBehanceInput] = useState(false);
  const [behanceUrl, setBehanceUrl] = useState('');
  const [isImportingBehance, setIsImportingBehance] = useState(false);

  // -- Refs for Media Upload --
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
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
    let finalCover = coverImage;
    const isPlaceholder = !finalCover || finalCover.includes('placehold.co') || finalCover.includes('placeholder');
    
    if (isPlaceholder && blocks.length > 0 && blocks[0].url) {
        finalCover = blocks[0].url;
        setCoverImage(finalCover);
    }

    onSave({
      ...project,
      title,
      category,
      description,
      blocks: blocks,
      gap,
      layoutMode,
      image: finalCover,
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
        alert("Projects must have at least one image/video.");
        return;
    }
    setBlocks(prev => prev.filter(b => b.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleAddBlock = (type: BlockType = 'image') => {
    const newBlock: BlockData = {
        id: Math.random().toString(36).substr(2, 9),
        url: type === 'image' 
            ? "https://placehold.co/800x600/EEE/31343C?text=Upload+Image"
            : "https://placehold.co/800x600/111/FFF?text=Video+Media",
        size: 'square',
        type
    };
    setBlocks([...blocks, newBlock]);
    setHasUnsavedChanges(true);
  };

  // Helper to convert regular YouTube/Vimeo links to embed links
  const processEmbedUrl = (url: string) => {
    let processed = url.trim();
    
    // YouTube
    if (processed.includes('youtube.com/watch?v=')) {
        const id = processed.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${id}`;
    }
    if (processed.includes('youtu.be/')) {
        const id = processed.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
    }
    // Vimeo
    if (processed.includes('vimeo.com/')) {
        const id = processed.split('vimeo.com/')[1]?.split('?')[0];
        return `https://player.vimeo.com/video/${id}`;
    }
    return processed;
  };

  const handleMediaImport = async () => {
    if (!behanceUrl.trim()) return;
    setIsImportingBehance(true);

    try {
        const urlToCheck = behanceUrl.trim();
        const isBehanceGallery = urlToCheck.includes('behance.net/gallery');
        const isVideoEmbed = urlToCheck.includes('youtube.com') || urlToCheck.includes('youtu.be') || urlToCheck.includes('vimeo.com');

        if (isVideoEmbed) {
            const embedUrl = processEmbedUrl(urlToCheck);
            const newBlock: BlockData = {
                id: Math.random().toString(36).substr(2, 9),
                url: embedUrl,
                size: 'wide',
                type: 'video'
            };
            setBlocks(prev => [...prev, newBlock]);
            setHasUnsavedChanges(true);
            setShowBehanceInput(false);
            setBehanceUrl('');
        } else if (isBehanceGallery) {
             const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(urlToCheck)}`;
             const res = await fetch(proxyUrl);
             if (!res.ok) throw new Error('Network response was not ok');
             const html = await res.text();
             const imgRegex = /(https:\/\/(mir-s3-cdn-cf|m1)\.behance\.net\/project_modules\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.(jpg|png|jpeg|webp|gif))/gi;
             const found = html.match(imgRegex);
             
             if (found && found.length > 0) {
                 const unique = [...new Set(found)];
                 const newBlocks: BlockData[] = unique.map(url => ({
                     id: Math.random().toString(36).substr(2, 9),
                     url: url,
                     size: 'wide',
                     type: 'image'
                 }));
                 setBlocks(prev => [...prev, ...newBlocks]);
                 if ((!coverImage || coverImage.includes('placehold.co')) && newBlocks.length > 0) {
                     setCoverImage(newBlocks[0].url);
                 }
                 setHasUnsavedChanges(true);
                 setShowBehanceInput(false);
                 setBehanceUrl('');
             }
        } else {
             const newBlock: BlockData = {
                 id: Math.random().toString(36).substr(2, 9),
                 url: urlToCheck,
                 size: 'big',
                 type: urlToCheck.match(/\.(mp4|webm|ogg)$/i) ? 'video' : 'image'
             };
             setBlocks(prev => [...prev, newBlock]);
             setHasUnsavedChanges(true);
             setShowBehanceInput(false);
             setBehanceUrl('');
        }
    } catch (e: any) {
        console.error("Import error", e);
        alert("Could not import media. Please check the URL.");
    } finally {
        setIsImportingBehance(false);
    }
  };

  const handleChangeSize = (id: string, newSize: BlockSize) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, size: newSize } : b));
    setHasUnsavedChanges(true);
  };

  // --- Upload Logic (Blocks) ---

  const triggerMediaUpload = (id: string, type: BlockType = 'image') => {
    setActiveBlockId(id);
    if (type === 'video') {
        if (videoInputRef.current) {
            videoInputRef.current.value = '';
            videoInputRef.current.click();
        }
    } else {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    }
  };

  const handleMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: BlockType) => {
    const file = e.target.files?.[0];
    if (file && activeBlockId) {
      setIsUploading(true);
      const publicUrl = await uploadImage(file, 'portfolio');
      if (publicUrl) {
          setBlocks(prev => prev.map(block => 
            block.id === activeBlockId 
                ? { ...block, url: publicUrl, type }
                : block
          ));
          setHasUnsavedChanges(true);
      }
      setIsUploading(false);
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

  const getSizeClass = (size: BlockSize) => {
      switch(size) {
          case 'wide': return 'md:col-span-2 md:row-span-1 h-[40vh] md:h-[50vh]';
          case 'tall': return 'md:col-span-1 md:row-span-2 h-[60vh] md:h-[80vh]';
          case 'big': return 'md:col-span-2 md:row-span-2 h-[60vh] md:h-[80vh]';
          case 'square': default: return 'md:col-span-1 md:row-span-1 h-[40vh]';
      }
  };

  // Helper to render image or video
  const renderMedia = (block: BlockData) => {
      const isVideo = block.type === 'video' || block.url.match(/\.(mp4|webm|ogg)$/i) || block.url.includes('youtube.com') || block.url.includes('vimeo.com') || block.url.includes('player.vimeo');

      if (isVideo) {
          if (block.url.includes('youtube.com') || block.url.includes('vimeo.com') || block.url.includes('player.vimeo')) {
              return (
                  <iframe 
                    src={block.url} 
                    className="w-full h-full border-0" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowFullScreen
                  />
              );
          }
          return (
              <video 
                src={block.url} 
                className="w-full h-full object-cover" 
                autoPlay 
                muted 
                loop 
                playsInline 
                controls={!isLoggedIn} 
              />
          );
      }
      return (
          <img 
            src={block.url} 
            alt="Asset" 
            className={`w-full h-full object-contain bg-[#f3f3f3] block pointer-events-none select-none ${layoutMode === 'pdf' ? 'h-auto w-full' : ''}`}
          />
      );
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
      <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => handleMediaFileChange(e, 'image')} />
      <input type="file" accept="video/*" ref={videoInputRef} className="hidden" onChange={(e) => handleMediaFileChange(e, 'video')} />
      <input type="file" accept="image/*" ref={coverInputRef} className="hidden" onChange={handleCoverFileChange} />

      {/* --- Close Button --- */}
      <div className="absolute top-6 right-6 z-50">
        <button onClick={onClose} className="w-12 h-12 bg-gray-100 hover:bg-black hover:text-white rounded-full flex items-center justify-center transition-colors shadow-md">
            <X size={24} />
        </button>
      </div>

      {/* --- Scrollable Content --- */}
      <div className="flex-1 overflow-y-auto w-full bg-white px-6 md:px-12 pb-40 pt-20" onClick={onClose}>
        <div className="container mx-auto" onClick={(e) => e.stopPropagation()}>
            
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl mb-12">
                <div className="relative group shrink-0 w-32 h-32 md:w-48 md:h-48 bg-gray-100 rounded-lg overflow-hidden shadow-sm self-start">
                    <img 
                        src={(!coverImage || coverImage.includes('placehold.co')) && blocks.length > 0 ? blocks[0].url : coverImage} 
                        alt="Cover" 
                        className="w-full h-full object-cover" 
                    />
                    {isLoggedIn && (
                        <div onClick={triggerCoverUpload} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer hover:bg-black/50">
                            {isUploadingCover ? <Loader2 size={24} className="animate-spin" /> : <Camera size={24} />}
                            <span className="text-[10px] font-bold uppercase tracking-widest mt-2">Change Cover</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col w-full">
                    <div className="mb-2">
                        {isLoggedIn ? (
                        <input value={category} onChange={(e) => { setCategory(e.target.value); setHasUnsavedChanges(true); }} className="text-xs font-bold uppercase tracking-widest text-[#00c05e] bg-transparent focus:outline-none w-full placeholder-gray-300" placeholder="CATEGORY" />
                        ) : (
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{category}</span>
                        )}
                    </div>
                    <div className="mb-4">
                        {isLoggedIn ? (
                        <input value={title} onChange={(e) => { setTitle(e.target.value); setHasUnsavedChanges(true); }} className="font-heading text-4xl md:text-6xl uppercase leading-none bg-transparent focus:outline-none w-full placeholder-gray-200" placeholder="PROJECT TITLE" />
                        ) : (
                        <h2 className="font-heading text-4xl md:text-6xl uppercase leading-none">{title}</h2>
                        )}
                    </div>
                    <div className="w-full">
                        {isLoggedIn ? (
                            <div className="relative group">
                                <textarea value={description} onChange={(e) => { setDescription(e.target.value); setHasUnsavedChanges(true); }} placeholder="Add a brief description about this project..." className="w-full text-lg md:text-xl font-light text-gray-600 bg-transparent focus:text-black focus:outline-none resize-none overflow-hidden min-h-[3em] placeholder-gray-200" rows={2} spellCheck={false} />
                                <span className="absolute -left-6 top-1 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"><FileText size={16} /></span>
                            </div>
                        ) : (
                            description && <p className="text-lg md:text-xl font-light text-gray-600 leading-relaxed max-w-2xl">{description}</p>
                        )}
                    </div>
                </div>
            </div>

            <Reorder.Group axis={layoutMode === 'pdf' ? "y" : undefined} values={blocks} onReorder={(newOrder) => { setBlocks(newOrder); setHasUnsavedChanges(true); }} className={layoutMode === 'pdf' ? "flex flex-col items-center w-full gap-0" : "grid grid-cols-1 md:grid-cols-2 w-full auto-rows-min"} style={layoutMode === 'collage' ? { gap: `${gap}px` } : {}}>
                {blocks.map((block) => (
                    <Reorder.Item key={block.id} value={block} dragListener={isLoggedIn} className={`relative group bg-gray-100 overflow-hidden ${layoutMode === 'collage' ? getSizeClass(block.size) : 'w-full h-auto'}`} whileDrag={{ scale: 1.02, zIndex: 50, boxShadow: "0px 20px 40px rgba(0,0,0,0.1)" }}>
                       
                       {renderMedia(block)}

                       {isUploading && activeBlockId === block.id && (
                           <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center backdrop-blur-sm">
                               <div className="flex flex-col items-center gap-2 text-white"><Loader2 size={32} className="animate-spin text-[#00c05e]" /><span className="text-xs font-bold uppercase tracking-widest">Uploading...</span></div>
                           </div>
                       )}
                       
                       {isLoggedIn && !isUploading && (
                         <div className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 backdrop-blur-[2px]">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/30 pointer-events-none"><GripVertical size={48} /></div>
                            <div className="absolute top-4 left-4">
                                <span className="bg-black/50 text-white text-[9px] font-bold uppercase px-2 py-1 rounded-full border border-white/10 flex items-center gap-1">
                                    {block.type === 'video' ? <Video size={10} /> : <ImageIcon size={10} />}
                                    {block.type || 'image'}
                                </span>
                            </div>
                            <div className="absolute top-4 right-4 flex gap-2">
                                 <button onClick={(e) => { e.stopPropagation(); triggerMediaUpload(block.id, block.type || 'image'); }} className="p-2 bg-white/10 hover:bg-white hover:text-black text-white rounded-full transition-all backdrop-blur-md border border-white/20" title="Replace Media">
                                   <ImageIcon size={18} />
                                 </button>
                                 <button onClick={(e) => handleDeleteBlock(block.id, e)} className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-md border border-white/20" title="Delete Block">
                                   <Trash2 size={18} />
                                </button>
                            </div>
                            {layoutMode === 'collage' && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                                    <div className="flex items-center gap-2 bg-[#1a1a1a]/90 backdrop-blur-xl p-1.5 rounded-full border border-white/10 shadow-2xl scale-90 md:scale-100">
                                        {['square', 'wide', 'tall', 'big'].map((s) => (
                                            <button key={s} onClick={() => handleChangeSize(block.id, s as BlockSize)} className={`w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 ${block.size === s ? 'bg-[#00c05e] text-black shadow-[0_0_15px_rgba(0,192,94,0.4)]' : 'text-gray-400 hover:text-white hover:bg-white/10'}`} title={s.charAt(0).toUpperCase() + s.slice(1)}>
                                                {s === 'square' && <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>}
                                                {s === 'wide' && <svg width="18" height="10" viewBox="0 0 18 10" fill="none"><rect x="1" y="1" width="16" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>}
                                                {s === 'tall' && <svg width="10" height="16" viewBox="0 0 10 16" fill="none"><rect x="1" y="1" width="8" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>}
                                                {s === 'big' && <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" /></svg>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                         </div>
                       )}
                    </Reorder.Item>
                ))}
            </Reorder.Group>

            {isLoggedIn && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => handleAddBlock('image')} className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-400 hover:text-black hover:bg-gray-50 transition-all group">
                        <Plus size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold uppercase tracking-widest text-xs">Add Image</span>
                    </button>
                    <button onClick={() => handleAddBlock('video')} className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-gray-400 hover:text-black hover:bg-gray-50 transition-all group">
                        <Clapperboard size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold uppercase tracking-widest text-xs">Add Video File</span>
                    </button>
                    <div className="w-full">
                        {!showBehanceInput ? (
                            <button onClick={() => setShowBehanceInput(true)} className="w-full h-full py-6 border-2 border-dashed border-[#00c05e]/30 rounded-xl flex flex-col items-center justify-center gap-2 text-[#00c05e] hover:border-[#00c05e] hover:bg-[#00c05e]/5 transition-all group">
                                <Link size={24} className="group-hover:scale-110 transition-transform" />
                                <span className="font-bold uppercase tracking-widest text-xs">Import Embed / Behance</span>
                            </button>
                        ) : (
                            <div className="w-full h-full p-4 border-2 border-[#00c05e] rounded-xl flex flex-col gap-3 bg-[#00c05e]/5">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00c05e] flex items-center gap-2"><Download size={12}/> Import Media</span>
                                <div className="flex gap-2">
                                    <input autoFocus value={behanceUrl} onChange={(e) => setBehanceUrl(e.target.value)} placeholder="YouTube, Vimeo, Behance..." className="flex-1 bg-white text-sm p-2 rounded border border-[#00c05e]/30 focus:outline-none focus:border-[#00c05e] text-black" onKeyDown={(e) => e.key === 'Enter' && handleMediaImport()} />
                                    <button onClick={handleMediaImport} disabled={isImportingBehance} className="bg-[#00c05e] text-white p-2 rounded hover:bg-black transition-colors disabled:opacity-50">
                                        {isImportingBehance ? <Loader2 size={18} className="animate-spin"/> : <ArrowRight size={18} />}
                                    </button>
                                </div>
                                <div className="flex justify-between items-center"><p className="text-[9px] text-gray-500">Supports YT, Vimeo, and Behance.</p><button onClick={() => setShowBehanceInput(false)} className="text-[9px] uppercase font-bold text-gray-400 hover:text-black">Cancel</button></div>
                            </div>
                        )}
                    </div>
                </div>
            )}

             <div className="text-center pt-24 pb-12">
                  {isLoggedIn ? (
                      <div className="inline-flex flex-col items-center gap-4">
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Project Appreciations (Fake count)</span>
                          <div className="flex items-center gap-3 bg-gray-100 p-2 px-6 rounded-full border border-gray-200 shadow-sm">
                              <Heart size={20} className="text-[#00c05e] fill-[#00c05e]" />
                              <input 
                                type="number" 
                                value={likes} 
                                onChange={(e) => { setLikes(parseInt(e.target.value) || 0); setHasUnsavedChanges(true); }}
                                className="bg-transparent text-2xl font-bold w-32 focus:outline-none text-center"
                              />
                          </div>
                      </div>
                  ) : (
                      <button onClick={handleLike} className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-black text-white rounded-full font-bold uppercase tracking-wider overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed" disabled={hasLiked}>
                         <span className={`absolute inset-0 w-full h-full bg-[#00c05e] translate-y-full transition-transform duration-300 ${hasLiked ? 'translate-y-0' : 'group-hover:translate-y-0'}`}></span>
                         <span className="relative flex items-center gap-3">
                           <Heart size={20} className={`transition-colors duration-300 ${hasLiked ? 'fill-white text-white' : 'group-hover:text-white'}`} fill={hasLiked ? "currentColor" : "none"} /> 
                           <span>{hasLiked ? "Appreciated" : "Appreciate Project"}</span>
                           <span className="bg-white/20 px-2 py-0.5 rounded text-sm min-w-[2rem] text-center ml-1">{likes}</span>
                         </span>
                      </button>
                  )}
             </div>
        </div>
      </div>

      <AnimatePresence>
        {isLoggedIn && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-0 left-0 right-0 z-[70] bg-[#111] text-white py-4 px-6 md:px-12 border-t border-gray-800" onClick={(e) => e.stopPropagation()}>
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-6 w-full md:w-auto">
                  <button onClick={() => { setLayoutMode(layoutMode === 'collage' ? 'pdf' : 'collage'); setHasUnsavedChanges(true); }} className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide transition-colors ${layoutMode === 'pdf' ? 'text-[#00c05e]' : 'text-gray-400 hover:text-white'}`}>
                     {layoutMode === 'collage' ? <Rows size={16}/> : <LayoutGrid size={16}/>}
                     {layoutMode === 'collage' ? "Switch to Stack (Long)" : "Switch to Grid"}
                  </button>
                  <div className="h-4 w-[1px] bg-gray-700 hidden md:block"></div>
                  <div className="flex items-center gap-3">
                     <LayoutGrid size={16} className="text-gray-400" />
                     <div className="flex items-center gap-2">
                         <span className="text-[10px] uppercase text-gray-500 w-12">Gap: {gap}px</span>
                         <input type="range" min="0" max="60" value={gap} onChange={(e) => { setGap(parseInt(e.target.value)); setHasUnsavedChanges(true); }} className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00c05e]" />
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-4">
                  <AnimatePresence>{showSavedToast && <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-[#00c05e] font-bold text-xs uppercase"><Check size={14} /> Saved!</motion.div>}</AnimatePresence>
                  {hasUnsavedChanges && !showSavedToast && <span className="text-[10px] uppercase tracking-widest text-yellow-500 animate-pulse">Unsaved Changes</span>}
                  <button onClick={handleSave} disabled={isUploading} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold uppercase text-xs tracking-wide transition-all ${isUploading ? "bg-gray-600 cursor-not-allowed text-gray-400" : "bg-[#00c05e] text-white hover:bg-white hover:text-black"}`}>
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