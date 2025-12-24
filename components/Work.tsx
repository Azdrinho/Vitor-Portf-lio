import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Cpu, ChevronLeft, ChevronRight, X, LayoutGrid } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// Lazy load the heavy animation
const SphereAnimation = React.lazy(() => import('./SphereAnimation'));

// --- Icon Components Library ---
const Icons: Record<string, React.FC<{ color: string }>> = {
  ae: ({ color }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
      <rect width="100" height="100" rx="22" fill="#00005b" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#d29bfd" fontSize="40" fontFamily="sans-serif" fontWeight="bold">Ae</text>
    </svg>
  ),
  ps: ({ color }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
      <rect width="100" height="100" rx="22" fill="#001e36" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#31a8ff" fontSize="40" fontFamily="sans-serif" fontWeight="bold">Ps</text>
    </svg>
  ),
  ai: ({ color }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
      <rect width="100" height="100" rx="22" fill="#331c00" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#ff9a00" fontSize="40" fontFamily="sans-serif" fontWeight="bold">Ai</text>
    </svg>
  ),
  pr: ({ color }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
      <rect width="100" height="100" rx="22" fill="#00005b" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#d29bfd" fontSize="40" fontFamily="sans-serif" fontWeight="bold">Pr</text>
    </svg>
  ),
  vegas: ({ color }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
      <rect width="100" height="100" rx="22" fill="#1a1a1a" />
      <path d="M30 30 L50 75 L70 30" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  figma: ({ color }) => (
     <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
       <rect width="100" height="100" rx="22" fill="#1e1e1e" />
       <path d="M25 25C25 31.9 30.6 37.5 37.5 37.5H50V25H37.5C30.6 25 25 30.6 25 37.5V25Z" fill="#F24E1E"/>
       <path d="M25 62.5C25 55.6 30.6 50 37.5 50H50V62.5H37.5C30.6 62.5 25 56.9 25 50V62.5Z" fill="#A259FF"/>
       <path d="M25 75C25 81.9 30.6 87.5 37.5 87.5C44.4 87.5 50 81.9 50 75V62.5H37.5C30.6 62.5 25 68.1 25 75Z" fill="#1ABCFE"/>
       <path d="M50 25H62.5C69.4 25 75 30.6 75 37.5C75 44.4 69.4 50 62.5 50H50V25Z" fill="#FF7262"/>
       <path d="M62.5 50C69.4 50 75 55.6 75 62.5C75 69.4 69.4 75 62.5 75H50V50H62.5Z" fill="#1ABCFE"/>
     </svg>
  ),
  blender: ({ color }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
        <rect width="100" height="100" rx="22" fill="#e87d0d" />
        <path d="M50 20 L50 80 M20 50 L80 50" stroke="white" strokeWidth="8" />
        <circle cx="50" cy="50" r="15" fill="white" />
    </svg>
  ),
  code: ({ color }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
        <rect width="100" height="100" rx="22" fill="#007acc" />
        <path d="M30 50 L45 35 M30 50 L45 65 M70 50 L55 35 M70 50 L55 65" stroke="white" strokeWidth="8" strokeLinecap="round" />
    </svg>
  ),
  xd: ({ color }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
      <rect width="100" height="100" rx="22" fill="#470137" />
      <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#ff61f6" fontSize="40" fontFamily="sans-serif" fontWeight="bold">Xd</text>
    </svg>
  ),
  davinci: ({ color }) => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none">
      <rect width="100" height="100" rx="22" fill="#000" />
      <circle cx="35" cy="35" r="15" fill="#ff0000" opacity="0.8"/>
      <circle cx="65" cy="35" r="15" fill="#00ff00" opacity="0.8"/>
      <circle cx="50" cy="65" r="15" fill="#0000ff" opacity="0.8"/>
    </svg>
  ),
  generic: ({ color }) => (
    <div className={`w-full h-full rounded-2xl flex items-center justify-center bg-[#EAEAEA] shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff]`}>
        <Cpu size={40} color={color} strokeWidth={1.5} />
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
}

interface WorkProps {
  isLoggedIn?: boolean;
  description?: string;
  setDescription?: (v: string) => void;
}

const Work: React.FC<WorkProps> = ({ 
    isLoggedIn = false, 
    description = "Mastering industry-standard tools...", 
    setDescription 
}) => {
  const [items, setItems] = useState<SoftwareItem[]>([]);
  const [hoveredTool, setHoveredTool] = useState<number | null>(null);
  
  // Icon Selector State
  const [showIconSelector, setShowIconSelector] = useState(false);
  const [activeItemId, setActiveItemId] = useState<number | null>(null);

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
            iconType: item.icon_type as IconType
        })));
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleAddItem = async () => {
    const newItem = {
        title: "New Skill",
        category: "Software",
        color: "#00c05e", 
        proficiency: 50,
        icon_type: 'generic',
        sort_order: items.length + 1
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
            iconType: data.icon_type
        }]);
    }
  };

  const handleDeleteItem = async (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
    await supabase.from('skills').delete().eq('id', id);
  };

  const handleUpdateItem = async (id: number, field: keyof SoftwareItem, value: any) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    const dbField = field === 'iconType' ? 'icon_type' : field;
    await supabase.from('skills').update({ [dbField]: value }).eq('id', id);
  };

  const handleMoveItem = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === items.length - 1) return;

    const newItems = [...items];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
  };

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

  return (
    <section id="work" className="relative py-24 md:py-32 bg-[#EAEAEA] px-6 md:px-12 overflow-hidden">
      <div className="container mx-auto">
        
        {/* Intro */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-20">
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
          
          <div className="mt-8 md:mt-0 relative hidden md:block">
             <motion.div 
                whileHover={{ scale: 1.1 }}
                className="w-32 h-32 flex items-center justify-center cursor-pointer"
             >
                <Suspense fallback={<div className="w-full h-full rounded-full bg-gray-200 animate-pulse" />}>
                   <SphereAnimation />
                </Suspense>
             </motion.div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-8 border-b border-gray-300 pb-4 flex justify-between items-end">
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">Software Proficiency</span>
            
            {isLoggedIn && (
                <button 
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00c05e] text-white rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-lg"
                >
                    <Plus size={14} /> Add Skill
                </button>
            )}
        </div>

        {/* Grid */}
        <div className="flex flex-wrap -mx-4 relative">
          <AnimatePresence>
          {items.map((tool, index) => {
            const isHovered = hoveredTool === tool.id;
            const IconComponent = Icons[tool.iconType] || Icons.generic;

            return (
              <motion.div
                layout 
                key={tool.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full md:w-1/2 lg:w-1/3 p-4"
                onMouseEnter={() => setHoveredTool(tool.id)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                <div className={`relative group bg-[#EAEAEA] rounded-[2rem] p-8 h-full transition-all duration-300 overflow-visible flex flex-col justify-between min-h-[280px] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] hover:shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]`}>
                    
                    {/* Controls */}
                    {isLoggedIn && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button onClick={() => handleMoveItem(index, 'left')} disabled={index === 0} className="p-2 bg-[#EAEAEA] shadow-md rounded-full text-gray-500 hover:text-black"><ChevronLeft size={16} /></button>
                        <button onClick={() => handleMoveItem(index, 'right')} disabled={index === items.length - 1} className="p-2 bg-[#EAEAEA] shadow-md rounded-full text-gray-500 hover:text-black"><ChevronRight size={16} /></button>
                        <button onClick={() => handleDeleteItem(tool.id)} className="p-2 bg-[#EAEAEA] shadow-md text-red-400 rounded-full hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                    )}

                    {/* Icon & Title */}
                    <div>
                        <div 
                            className="w-20 h-20 mb-6 transition-transform duration-500 ease-out cursor-pointer relative"
                            style={{ transform: isHovered ? 'scale(1.1) translateY(-5px)' : 'scale(1)' }}
                            onClick={() => isLoggedIn && openIconSelector(tool.id)}
                        >
                            <IconComponent color={isHovered ? tool.color : "#888"} />
                            {isLoggedIn && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 hover:opacity-100 transition-opacity">
                                    <LayoutGrid className="text-white" />
                                </div>
                            )}
                        </div>

                        {isLoggedIn ? (
                            <input 
                                value={tool.title}
                                onChange={(e) => handleUpdateItem(tool.id, 'title', e.target.value)}
                                className={`font-heading text-4xl uppercase bg-transparent w-full focus:outline-none border-b border-dashed border-gray-400 focus:border-black ${isHovered ? 'text-black' : 'text-gray-400'}`}
                            />
                        ) : (
                            <h3 className={`font-heading text-4xl uppercase transition-colors duration-300 tracking-tight ${isHovered ? 'text-black' : 'text-gray-400'}`}>
                                {tool.title}
                            </h3>
                        )}

                        {isLoggedIn ? (
                            <input 
                                value={tool.category}
                                onChange={(e) => handleUpdateItem(tool.id, 'category', e.target.value)}
                                className="text-xs font-bold text-gray-400 mt-3 block tracking-widest uppercase bg-transparent w-full focus:outline-none focus:text-black"
                            />
                        ) : (
                            <span className="text-xs font-bold text-gray-400 mt-3 block tracking-widest uppercase">
                                {tool.category}
                            </span>
                        )}
                    </div>

                    {/* Proficiency */}
                    <div className="mt-8">
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Mastery</span>
                            {isLoggedIn ? (
                                <div className="flex items-center">
                                    <input 
                                        type="number" min="0" max="100" value={tool.proficiency}
                                        onChange={(e) => handleUpdateItem(tool.id, 'proficiency', parseInt(e.target.value))}
                                        className={`text-2xl font-heading bg-transparent w-16 text-right focus:outline-none ${isHovered ? 'text-black' : 'text-gray-300'}`}
                                    />
                                    <span className="text-xl text-gray-300">%</span>
                                </div>
                            ) : (
                                <span className={`text-2xl font-heading transition-colors duration-300 ${isHovered ? 'text-black' : 'text-gray-300'}`}>{tool.proficiency}%</span>
                            )}
                        </div>
                        <div className="w-full h-[8px] bg-[#EAEAEA] rounded-full mt-2 shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff]">
                            <motion.div 
                                className="h-full rounded-full"
                                style={{ backgroundColor: isHovered ? tool.color : "#d1d5db", boxShadow: isHovered ? `0 0 10px ${tool.color}` : "none" }}
                                initial={{ width: "0%" }}
                                animate={{ width: `${tool.proficiency}%` }} 
                                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            />
                        </div>
                    </div>
                </div>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>
      </div>

      {/* ICON SELECTOR MODAL */}
      <AnimatePresence>
        {showIconSelector && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
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
                                        <Comp color="#00c05e" />
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

    </section>
  );
};

export default Work;