import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Cpu, ChevronLeft, ChevronRight } from 'lucide-react';
import SphereAnimation from './SphereAnimation';
import { supabase } from '../lib/supabaseClient';

// --- Icon Components ---
const AfterEffectsIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#00005b" stroke="none" />
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#d29bfd" fontSize="40" fontFamily="sans-serif" fontWeight="bold">Ae</text>
  </svg>
);

const PhotoshopIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#001e36" stroke="none"/>
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#31a8ff" fontSize="40" fontFamily="sans-serif" fontWeight="bold">Ps</text>
  </svg>
);

const IllustratorIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#331c00" stroke="none"/>
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#ff9a00" fontSize="40" fontFamily="sans-serif" fontWeight="bold">Ai</text>
  </svg>
);

const PremiereIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#00005b" stroke="none"/>
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fill="#d29bfd" fontSize="40" fontFamily="sans-serif" fontWeight="bold">Pr</text>
  </svg>
);

const VegasIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" rx="22" fill="#1a1a1a" stroke="none"/>
    <path d="M30 30 L50 75 L70 30" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Neumorphic Inset Icon Holder
const GenericIcon = ({ color }: { color: string }) => (
    <div className={`w-full h-full rounded-2xl flex items-center justify-center bg-[#EAEAEA] shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff]`}>
        <Cpu size={40} color={color} strokeWidth={1.5} />
    </div>
  );

// --- Data Structure ---

type IconType = 'ae' | 'ps' | 'ai' | 'pr' | 'vegas' | 'generic';

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

  // Fetch Skills from Supabase
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

  const renderIcon = (type: IconType, color: string) => {
    switch (type) {
        case 'ae': return <AfterEffectsIcon color={color} />;
        case 'ps': return <PhotoshopIcon color={color} />;
        case 'ai': return <IllustratorIcon color={color} />;
        case 'pr': return <PremiereIcon color={color} />;
        case 'vegas': return <VegasIcon color={color} />;
        default: return <GenericIcon color={color} />;
    }
  };

  const handleAddItem = async () => {
    const newItem = {
        title: "New Skill",
        category: "Software",
        color: "#00c05e", // Default Green
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
    // Optimistic UI
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    
    // DB Update
    // Map frontend field to DB field if necessary (iconType -> icon_type)
    const dbField = field === 'iconType' ? 'icon_type' : field;
    await supabase.from('skills').update({ [dbField]: value }).eq('id', id);
  };

  const handleMoveItem = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === items.length - 1) return;

    const newItems = [...items];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    
    // Swap
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);

    // Update sort order in DB for both items
    // (This works simply for now, for robust sorting we might update all indices)
    // Note: Since we don't have sort_order in local state explicitly for logic, we assume array index is order.
  };

  return (
    // Changed bg-white to bg-[#EAEAEA] to match the global theme for Neumorphism
    <section id="work" className="relative py-24 md:py-32 bg-[#EAEAEA] px-6 md:px-12 overflow-hidden">
      <div className="container mx-auto">
        
        {/* Introduction */}
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
                <SphereAnimation />
             </motion.div>
          </div>
        </div>

        {/* Header with Add Button */}
        <div className="mb-8 border-b border-gray-300 pb-4 flex justify-between items-end">
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-400">Software Proficiency</span>
            
            {isLoggedIn && (
                <button 
                    onClick={handleAddItem}
                    className="flex items-center gap-2 px-4 py-2 bg-[#00c05e] text-white rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-colors shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] hover:shadow-none hover:translate-y-[1px]"
                >
                    <Plus size={14} /> Add Skill
                </button>
            )}
        </div>

        {/* Grid Layout */}
        <div className="flex flex-wrap -mx-4 relative">
          <AnimatePresence>
          {items.map((tool, index) => {
            const isHovered = hoveredTool === tool.id;

            return (
              <motion.div
                layout // Automatic layout animation when array order changes
                key={tool.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="w-full md:w-1/2 lg:w-1/3 p-4"
                onMouseEnter={() => setHoveredTool(tool.id)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                
                {/* 
                   NEUMORPHISM CARD STYLE 
                */}
                <div 
                   className={`
                      relative group bg-[#EAEAEA] rounded-[2rem] p-8 h-full
                      transition-all duration-300 overflow-visible flex flex-col justify-between 
                      min-h-[280px]
                      shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]
                      hover:shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]
                   `}
                >
                    {/* Editor Controls */}
                    {isLoggedIn && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleMoveItem(index, 'left'); }}
                            disabled={index === 0}
                            className="p-2 bg-[#EAEAEA] shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] rounded-full text-gray-500 hover:text-black active:shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] transition-all"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleMoveItem(index, 'right'); }}
                            disabled={index === items.length - 1}
                            className="p-2 bg-[#EAEAEA] shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] rounded-full text-gray-500 hover:text-black active:shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] transition-all"
                        >
                            <ChevronRight size={16} />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteItem(tool.id); }}
                            className="p-2 bg-[#EAEAEA] shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] text-red-400 rounded-full hover:text-red-600 active:shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff] transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                    )}

                    {/* Top Section: Icon and Title */}
                    <div className="pointer-events-none">
                        <div 
                            className="w-20 h-20 mb-6 transition-transform duration-500 ease-out"
                            style={{
                                transform: isHovered ? 'scale(1.1) translateY(-5px)' : 'scale(1)'
                            }}
                        >
                            {renderIcon(tool.iconType, isHovered ? tool.color : "#888")}
                        </div>

                        {isLoggedIn ? (
                            <input 
                                value={tool.title}
                                onChange={(e) => handleUpdateItem(tool.id, 'title', e.target.value)}
                                onPointerDown={(e) => e.stopPropagation()} 
                                className={`pointer-events-auto font-heading text-4xl uppercase bg-transparent w-full focus:outline-none border-b border-dashed border-gray-400 focus:border-black ${isHovered ? 'text-black' : 'text-gray-400'}`}
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
                                onPointerDown={(e) => e.stopPropagation()} 
                                className="pointer-events-auto text-xs font-bold text-gray-400 mt-3 block tracking-widest uppercase bg-transparent w-full focus:outline-none focus:text-black"
                            />
                        ) : (
                            <span className="text-xs font-bold text-gray-400 mt-3 block tracking-widest uppercase">
                                {tool.category}
                            </span>
                        )}
                    </div>

                    {/* Bottom Section: Proficiency Number and Bar */}
                    <div className="mt-8">
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Mastery</span>
                            
                            {isLoggedIn ? (
                                <div className="flex items-center pointer-events-auto">
                                    <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={tool.proficiency}
                                        onChange={(e) => handleUpdateItem(tool.id, 'proficiency', parseInt(e.target.value))}
                                        onPointerDown={(e) => e.stopPropagation()} 
                                        className={`text-2xl font-heading bg-transparent w-16 text-right focus:outline-none ${isHovered ? 'text-black' : 'text-gray-300'}`}
                                    />
                                    <span className="text-xl text-gray-300">%</span>
                                </div>
                            ) : (
                                <span className={`text-2xl font-heading transition-colors duration-300 ${isHovered ? 'text-black' : 'text-gray-300'}`}>
                                    {tool.proficiency}%
                                </span>
                            )}
                        </div>
                        
                        {/* 
                            NEUMORPHIC PROGRESS BAR
                        */}
                        <div className="w-full h-[8px] bg-[#EAEAEA] rounded-full mt-2 shadow-[inset_2px_2px_5px_#bebebe,inset_-2px_-2px_5px_#ffffff]">
                            <motion.div 
                                className="h-full rounded-full relative"
                                style={{ 
                                    backgroundColor: isHovered ? tool.color : "#d1d5db",
                                    boxShadow: isHovered ? `0 0 10px ${tool.color}` : "none"
                                }}
                                initial={{ width: "0%" }}
                                animate={{ width: `${tool.proficiency}%` }} // Always show proficiency, highlight on hover
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
    </section>
  );
};

export default Work;