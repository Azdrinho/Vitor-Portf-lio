
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, User, Plus, Trash2, Camera, Loader2 } from 'lucide-react';
import { uploadImage } from '../lib/storage';

interface Testimonial {
  id: string;
  text: string;
  author: string;
  role: string;
  avatar?: string;
}

interface TestimonialsProps {
  isLoggedIn: boolean;
  data: Testimonial[];
  onUpdate: (id: string, field: keyof Testimonial, value: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

const Testimonials: React.FC<TestimonialsProps> = ({ 
  isLoggedIn, 
  data = [],
  onUpdate,
  onAdd,
  onDelete
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (data.length === 0) {
      setActiveIndex(0);
    } else if (activeIndex >= data.length) {
      setActiveIndex(Math.max(0, data.length - 1));
    }
  }, [data.length, activeIndex]);

  const handleNext = useCallback(() => {
    if (isAnimating || data.length <= 1) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev + 1) % data.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, data.length]);

  const handlePrev = useCallback(() => {
    if (isAnimating || data.length <= 1) return;
    setIsAnimating(true);
    setActiveIndex((prev) => (prev - 1 + data.length) % data.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, data.length]);

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (data.length <= 1) return;
    autoPlayRef.current = setInterval(handleNext, 8000);
  }, [handleNext, data.length]);

  useEffect(() => {
    startAutoPlay();
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [startAutoPlay, data.length]);

  const getFontSizeClass = (text: string = "") => {
    const len = text.length;
    if (len < 100) return "text-xl md:text-3xl lg:text-4xl";
    return "text-base md:text-xl lg:text-2xl";
  };

  if (data.length === 0) {
    return isLoggedIn ? (
      <section className="bg-[#111] py-20 flex flex-col items-center justify-center gap-6 border-t border-white/5">
        <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Nenhum depoimento</p>
        <button type="button" onClick={onAdd} className="flex items-center gap-2 px-6 py-3 bg-[#00c05e] text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white cursor-pointer relative z-10">
          <Plus size={16} /> Adicionar Depoimento
        </button>
      </section>
    ) : null;
  }

  const current = data[activeIndex] || data[0];

  return (
    <section className="bg-[#111] py-16 md:py-20 border-t border-white/5 overflow-hidden relative">
      <input type="file" ref={fileInputRef} onChange={async (e) => {
        const file = e.target.files?.[0];
        if (file && isLoggedIn && current) {
          setIsUploading(true);
          const url = await uploadImage(file, 'portfolio');
          if (url) onUpdate(current.id, 'avatar', url);
          setIsUploading(false);
        }
      }} className="hidden" accept="image/*" />
      
      <div className="w-full px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 md:gap-16">
          <div className="w-full md:w-5/12 flex flex-col justify-start relative z-10">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="font-heading text-6xl md:text-8xl uppercase leading-[0.85] text-white">Client<br /><span className="text-[#00c05e]">Feedback</span></h2>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex gap-2">
                    <button type="button" onClick={handlePrev} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-[#00c05e] hover:text-black transition-all cursor-pointer" disabled={data.length <= 1}><ChevronUp size={18} /></button>
                    <button type="button" onClick={handleNext} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-[#00c05e] hover:text-black transition-all cursor-pointer" disabled={data.length <= 1}><ChevronDown size={18} /></button>
                </div>
                <div className="flex flex-col ml-4">
                  <span className="text-white font-heading text-xl leading-none">{String(activeIndex + 1).padStart(2, '0')}</span>
                  <span className="text-gray-600 text-[8px] font-bold uppercase mt-0.5">of {String(data.length).padStart(2, '0')}</span>
                </div>
                {isLoggedIn && <button type="button" onClick={onAdd} className="ml-4 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-[#00c05e] hover:text-black rounded-full text-[10px] font-bold uppercase transition-all cursor-pointer"><Plus size={14} /> Add</button>}
              </div>
            </motion.div>
          </div>

          <div className="w-full md:w-7/12 relative min-h-[300px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5 }}
                className="relative z-10"
              >
                <div className="mb-6 relative">
                  {isLoggedIn ? (
                    <textarea 
                        value={current.text} 
                        onChange={(e) => onUpdate(current.id, 'text', e.target.value)} 
                        className={`w-full bg-transparent font-sans ${getFontSizeClass(current.text)} text-gray-200 leading-tight border-b border-dashed border-gray-800 focus:outline-none focus:border-[#00c05e] resize-none min-h-[140px]`} 
                    />
                  ) : (
                    <p className={`font-sans ${getFontSizeClass(current.text)} text-gray-100 leading-[1.2] font-light italic`}>{current.text}</p>
                  )}
                </div>

                <div className="w-full h-[1px] bg-white/5 mb-6 overflow-hidden">
                  <motion.div key={current.id + '-progress'} initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 8, ease: "linear" }} className="h-full bg-[#00c05e]/40" />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div onClick={() => isLoggedIn && fileInputRef.current?.click()} className={`relative w-12 h-12 rounded-xl overflow-hidden bg-gray-800 border border-white/10 shrink-0 ${isLoggedIn ? 'cursor-pointer group' : ''}`}>
                      {current.avatar ? <img src={current.avatar} alt={current.author} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-600"><User size={20} /></div>}
                      {isLoggedIn && <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">{isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}</div>}
                    </div>
                    <div className="flex flex-col">
                      {isLoggedIn ? (
                        <>
                          <input value={current.author} onChange={(e) => onUpdate(current.id, 'author', e.target.value)} className="bg-transparent text-white font-bold uppercase text-xs border-b border-dashed border-gray-800 focus:outline-none w-full" />
                          <input value={current.role} onChange={(e) => onUpdate(current.id, 'role', e.target.value)} className="bg-transparent text-[#00c05e] font-mono text-[10px] uppercase border-b border-dashed border-gray-800 focus:outline-none w-full mt-0.5" />
                        </>
                      ) : (
                        <>
                          <span className="text-white font-bold uppercase text-xs tracking-[0.2em]">{current.author}</span>
                          <span className="text-[#00c05e] font-mono text-[10px] uppercase opacity-80 mt-0.5">{current.role}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {isLoggedIn && (
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Clicou no lixo para ID:", current.id);
                        onDelete(current.id);
                      }}
                      className="p-3 bg-red-600 text-white rounded-full hover:bg-white hover:text-red-600 transition-all shadow-xl cursor-pointer pointer-events-auto active:scale-90"
                      title="Deletar este depoimento"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
