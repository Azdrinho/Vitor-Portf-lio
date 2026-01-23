import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ChevronLeft, ChevronRight, X, LayoutGrid, Image as ImageIcon, Upload, Loader2, Link, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { uploadImage } from '../lib/storage';

// --- Assets / Image Mappings for Slideshows (Fallback) ---
const SLIDESHOW_MAPPINGS: Record<string, string[]> = {
  default: [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=600"
  ]
};

// --- Icon Components Library ---
const Icons: Record<string, React.FC<{ className?: string }>> = {
  ae: ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <rect width="100" height="100" rx="10" fill="#00005b" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#d29bfd" fontSize="45" fontFamily="sans-serif" fontWeight="bold">Ae</text>
    </svg>
  ),
  ps: ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <rect width="100" height="100" rx="10" fill="#001e36" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#31a8ff" fontSize="45" fontFamily="sans-serif" fontWeight="bold">Ps</text>
    </svg>
  ),
  ai: ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <rect width="100" height="100" rx="10" fill="#331c00" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#ff9a00" fontSize="45" fontFamily="sans-serif" fontWeight="bold">Ai</text>
    </svg>
  ),
  pr: ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <rect width="100" height="100" rx="10" fill="#00005b" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#d29bfd" fontSize="45" fontFamily="sans-serif" fontWeight="bold">Pr</text>
    </svg>
  ),
  xd: ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none">
      <rect width="100" height="100" rx="10" fill="#470137" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#ff61f6" fontSize="45" fontFamily="sans-serif" fontWeight="bold">Xd</text>
    </svg>
  ),
  generic: ({ className }) => (
    <div className={`${className} bg-gray-800 flex items-center justify-center rounded-lg`}>
        <LayoutGrid className="text-white w-1/2 h-1/2" />
    </div>
  )
};

type IconType = keyof typeof Icons;

interface SoftwareItem {
    id: number;
    title: string;
    category: string;
    color: string;
    proficiency: number;
    iconType: IconType;
    images?: string[]; // Custom images for the slideshow
}

interface WorkProps {
  isLoggedIn?: boolean;
  description?: string;
  setDescription?: (v: string) => void;
}

// --- Slideshow Component ---
const CardSlideshow: React.FC<{ images: string[] }> = ({ images }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000); // 4 seconds per slide
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="absolute inset-0 w-full h-full">
      <AnimatePresence mode="popLayout">
        <motion.img
          key={images[index]}
          src={images[index]}
          alt="Slide"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      {/* Dark Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
    </div>
  );
};

const Work: React.FC<WorkProps> = ({ 
    isLoggedIn = false, 
    description = "Mastering industry-standard tools...", 
    setDescription 
}) => {
  const [items, setItems] = useState<SoftwareItem[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Icon Selector State
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [activeItemId, setActiveItemId] = useState<number | null>(null);

  // Image Manager State
  const [managingImagesId, setManagingImagesId] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState(''); // New state for URL input

  const fetchSkills = async () => {
    const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('sort_order', { ascending: true });
    
    if (error) {
        console.error("Error fetching skills:", error);
    } else {
        setItems(data.map((item: any) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            color: item.color,
            proficiency: item.proficiency,
            iconType: item.icon_type as IconType,
            images: item.images || [] // Fetch images array
        })));
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // --- CRUD Operations ---

  const handleAddItem = async () => {
    const newItem = {
        title: "New Skill",
        category: "Software",
        color: "#00c05e", 
        proficiency: 50,
        icon_type: 'generic',
        sort_order: items.length + 1,
        images: SLIDESHOW_MAPPINGS.default
    };

    const { data, error } = await supabase.from('skills').insert([newItem]).select().single();
    
    if (error) {
        console.error("Error adding skill:", error);
    } else {
        setItems([...items, {
            id: data.id,
            title: data.title,
            category: data.category,
            color: data.color,
            proficiency: data.proficiency,
            iconType: data.icon_type,
            images: data.images
        }]);
    }
  };

  const handleDeleteItem = async (id: number) => {
    if(!confirm("Delete this skill card?")) return;
    setItems(prev => prev.filter(item => item.id !== id));
    await supabase.from('skills').delete().eq('id', id);
  };

  const handleUpdateItem = async (id: number, field: keyof SoftwareItem, value: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    const dbField = field === 'iconType' ? 'icon_type' : field;
    await supabase.from('skills').update({ [dbField]: value }).eq('id', id);
  };

  // --- Icon Logic ---

  const openIconSelector = (id: number) => {
      setActiveItemId(id);
      setShowIconSelector(true);
  };

  const selectIcon = (iconKey: string) => {
      if (activeItemId !== null) {
          handleUpdateItem(activeItemId, 'iconType', iconKey);
      }
      setShowIconSelector(false);
      setActiveItemId(null);
  };

  // --- Slideshow Image Logic ---

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && managingImagesId) {
        setIsUploading(true);
        // Changed bucket from 'skills' to 'portfolio' to avoid "Bucket not found" error
        const url = await uploadImage(file, 'portfolio');
        
        if (url) {
            const currentItem = items.find(i => i.id === managingImagesId);
            if (currentItem) {
                const newImages = [...(currentItem.images || []), url];
                await handleUpdateItem(managingImagesId, 'images', newImages);
            }
        }
        setIsUploading(false);
    }
  };

  const handleAddUrl = async () => {
    if (!imageUrlInput.trim() || !managingImagesId) return;
    
    const currentItem = items.find(i => i.id === managingImagesId);
    if (currentItem) {
        const newImages = [...(currentItem.images || []), imageUrlInput.trim()];
        await handleUpdateItem(managingImagesId, 'images', newImages);
        setImageUrlInput(''); // Clear input after adding
    }
  };

  const handleDeleteImage = async (imageId: number, imageUrl: string) => {
      const currentItem = items.find(i => i.id === imageId);
      if (currentItem && currentItem.images) {
          const newImages = currentItem.images.filter(img => img !== imageUrl);
          await handleUpdateItem(imageId, 'images', newImages);
      }
  };

  // --- Scroll Logic ---

  const scroll = (direction: 'left' | 'right') => {
      if (scrollContainerRef.current) {
          const cardWidth = 370; 
          const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
          scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
  };

  return (
    // Reduced bottom padding here (pb-8)
    <section id="work" className="relative pt-24 pb-8 md:pt-32 bg-[#EAEAEA] border-t border-gray-300">
      
      {/* Background Decorative */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-5">
         <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full border-[100px] border-black/20" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 mb-10">
        
        {/* Intro */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="w-full max-w-2xl">
              {isLoggedIn && setDescription ? (
                 <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-2xl md:text-3xl font-light text-gray-800 leading-snug bg-transparent border border-dashed border-gray-400 focus:border-[#00c05e] rounded-xl p-4 focus:outline-none resize-none"
                    rows={4}
                 />
              ) : (
                <p className="text-2xl md:text-3xl font-light text-gray-800 leading-snug">
                    {description}
                </p>
              )}
          </div>

          <div className="flex items-center gap-4">
             {isLoggedIn && (
                <button 
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-6 py-3 bg-[#00c05e] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-lg"
                >
                    <Plus size={16} /> Add Skill
                </button>
            )}
             
             {/* Navigation Buttons */}
             <button 
                onClick={() => scroll('left')}
                className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all active:scale-95 bg-white"
             >
                <ChevronLeft size={24} />
             </button>
             <button 
                onClick={() => scroll('right')}
                className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-all active:scale-95 bg-white shadow-lg"
             >
                <ChevronRight size={24} />
             </button>
          </div>
        </div>
      </div>

      {/* Carousel Container - MOVED OUTSIDE CONTAINER for full bleed */}
      {/* Added px-6 md:px-12 to align start with container */}
      <div 
            ref={scrollContainerRef}
            className="flex w-full overflow-x-auto gap-6 px-6 md:px-12 pb-4 snap-x snap-mandatory hide-scrollbar z-10 relative"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <AnimatePresence>
          {items.map((tool) => {
            const IconComponent = Icons[tool.iconType] || Icons.generic;
            // Use custom images if available, otherwise fallback
            const slideImages = (tool.images && tool.images.length > 0) ? tool.images : SLIDESHOW_MAPPINGS.default;

            return (
              <motion.div
                layout 
                key={tool.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="relative flex-shrink-0 w-[300px] md:w-[350px] h-[500px] snap-center group"
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl bg-black">
                    
                    {/* Slideshow Background */}
                    <CardSlideshow images={slideImages} />

                    {/* Admin Controls */}
                    {isLoggedIn && (
                        <div className="absolute top-4 left-0 right-0 px-4 flex justify-between z-30">
                            {/* Manage Images Button */}
                            <button 
                                onClick={() => setManagingImagesId(tool.id)} 
                                className="p-2 bg-black/50 backdrop-blur text-white rounded-full hover:bg-[#00c05e] hover:text-black transition-colors"
                                title="Manage Slideshow Images"
                            >
                                <ImageIcon size={16} />
                            </button>
                            
                            {/* Delete Card Button */}
                            <button 
                                onClick={() => handleDeleteItem(tool.id)} 
                                className="p-2 bg-black/50 backdrop-blur text-white rounded-full hover:bg-red-600 transition-colors"
                                title="Delete Skill"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}

                    {/* Card Content Overlay */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-end z-20 pointer-events-none">
                        <div className="pointer-events-auto">
                            <div className="flex items-end gap-4 mb-4">
                                {/* Small Icon Box */}
                                <div 
                                    onClick={() => isLoggedIn && openIconSelector(tool.id)}
                                    className={`w-16 h-16 rounded-xl overflow-hidden shadow-lg shrink-0 bg-white/10 backdrop-blur-sm ${isLoggedIn ? 'cursor-pointer hover:ring-2 hover:ring-[#00c05e]' : ''}`}
                                >
                                    <IconComponent className="w-full h-full" />
                                </div>
                                
                                <div className="flex flex-col pb-1 w-full">
                                    {isLoggedIn ? (
                                        <input 
                                            value={tool.title}
                                            onChange={(e) => handleUpdateItem(tool.id, 'title', e.target.value)}
                                            className="font-heading text-3xl uppercase text-white bg-transparent focus:outline-none w-full leading-none mb-1 drop-shadow-md"
                                        />
                                    ) : (
                                        <h3 className="font-heading text-3xl uppercase text-white leading-none drop-shadow-md">
                                            {tool.title}
                                        </h3>
                                    )}

                                    {isLoggedIn ? (
                                        <input 
                                            value={tool.category}
                                            onChange={(e) => handleUpdateItem(tool.id, 'category', e.target.value)}
                                            className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-transparent focus:outline-none"
                                        />
                                    ) : (
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                            {tool.category}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar Container */}
                            <div className="w-full">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-gray-500">Mastery</span>
                                    {isLoggedIn ? (
                                        <input 
                                            type="number" min="0" max="100" value={tool.proficiency}
                                            onChange={(e) => handleUpdateItem(tool.id, 'proficiency', parseInt(e.target.value))}
                                            className="text-sm font-bold text-white bg-transparent text-right w-12 focus:outline-none"
                                        />
                                    ) : (
                                        <span className="text-sm font-bold text-white">{tool.proficiency}%</span>
                                    )}
                                </div>
                                
                                {/* Bar & Slider */}
                                <div className="relative w-full h-1.5 bg-white/20 rounded-full">
                                    <motion.div 
                                        className="absolute top-0 left-0 h-full rounded-full bg-white z-10"
                                        initial={{ width: "0%" }}
                                        whileInView={{ width: `${tool.proficiency}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                                    />
                                    
                                    {/* Editor Slider (Range Input) */}
                                    {isLoggedIn && (
                                        <input 
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={tool.proficiency}
                                            onChange={(e) => handleUpdateItem(tool.id, 'proficiency', parseInt(e.target.value))}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                            title="Drag to adjust mastery"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
          
          {/* Spacer at end of scroll to prevent last item sticking to edge */}
          <div className="w-6 shrink-0" />
      </div>

      {/* ICON SELECTOR MODAL */}
      <AnimatePresence>
        {showIconSelector && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={() => setShowIconSelector(false)}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-heading text-2xl uppercase">Select Icon</h3>
                        <button onClick={() => setShowIconSelector(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                    </div>
                    
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6">
                        {Object.keys(Icons).map((key) => {
                            const Comp = Icons[key];
                            return (
                                <button 
                                    key={key}
                                    onClick={() => selectIcon(key)}
                                    className="flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-200"
                                >
                                    <div className="w-16 h-16 group-hover:scale-110 transition-transform">
                                        <Comp className="w-full h-full" />
                                    </div>
                                    <span className="text-xs uppercase font-bold text-gray-400 group-hover:text-black">{key}</span>
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* IMAGES MANAGER MODAL */}
      <AnimatePresence>
        {managingImagesId !== null && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                onClick={() => setManagingImagesId(null)}
            >
                 <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h3 className="font-heading text-2xl uppercase">Manage Slideshow Images</h3>
                        <button onClick={() => setManagingImagesId(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                    </div>

                    {/* Image Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                        {/* Current Images */}
                        {items.find(i => i.id === managingImagesId)?.images?.map((img, idx) => (
                            <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden group shadow-md bg-gray-100">
                                <img src={img} alt="slide" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => handleDeleteImage(managingImagesId!, img)}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        
                        {/* Add New Button (File Upload) */}
                        <div className="relative aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 hover:border-[#00c05e] hover:bg-[#00c05e]/5 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer group">
                             <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleUploadImage}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isUploading}
                             />
                             {isUploading ? <Loader2 className="animate-spin text-[#00c05e]" /> : <Upload className="text-gray-400 group-hover:text-[#00c05e]" />}
                             <span className="text-xs font-bold uppercase text-gray-400 group-hover:text-[#00c05e]">{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                        </div>
                    </div>

                    {/* Add by Link Section */}
                    <div className="pt-4 border-t border-gray-100">
                        <label className="text-xs font-bold uppercase text-gray-500 block mb-2 flex items-center gap-2">
                             <Link size={14} /> Or Add via URL
                        </label>
                        <div className="flex gap-2">
                            <input
                                value={imageUrlInput}
                                onChange={(e) => setImageUrlInput(e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="flex-1 p-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#00c05e] text-sm"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                            />
                            <button 
                                onClick={handleAddUrl}
                                disabled={!imageUrlInput.trim()}
                                className="bg-[#00c05e] text-white px-4 rounded-xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>

                    <p className="text-[10px] text-gray-400 mt-4">
                        Images are displayed in the order added. Supports direct image links (jpg, png, webp).
                    </p>

                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
};

export default Work;