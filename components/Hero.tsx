import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Camera, Loader2, Upload } from 'lucide-react';
import { uploadImage } from '../lib/storage';

interface HeroProps {
  isLoggedIn?: boolean;
  title?: string;
  setTitle?: (v: string) => void;
  subtitle?: string;
  setSubtitle?: (v: string) => void;
  heroImage?: string;
  setHeroImage?: (v: string) => void;
}

const Hero: React.FC<HeroProps> = ({ 
  isLoggedIn = false, 
  title = "Freelance", 
  setTitle, 
  subtitle = "Designer & Developer", 
  setSubtitle,
  heroImage,
  setHeroImage
}) => {
  const { scrollY } = useScroll();
  // Move text slightly slower than scroll to create depth
  const textY = useTransform(scrollY, [0, 500], [0, 150]);
  
  // Upload Logic
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && setHeroImage) {
        setIsUploading(true);
        const url = await uploadImage(file, 'portfolio');
        if (url) {
            setHeroImage(url);
        }
        setIsUploading(false);
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#EAEAEA]">
      
      {/* Background Circles - Layer 0 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          
          {/* Inner Circle System */}
          <div className="absolute w-[50vw] h-[50vw]">
             {/* The Track (Line) */}
             <div className="absolute inset-0 border border-gray-400/30 rounded-full" />
             
             {/* The Orbiter (Rotating Container) */}
             <motion.div 
                className="absolute inset-0 w-full h-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
             >
                {/* The Dot (Planet) */}
                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full" />
             </motion.div>
          </div>

          {/* Outer Circle System */}
          <div className="absolute w-[70vw] h-[70vw]">
             {/* The Track (Line) */}
             <div className="absolute inset-0 border border-gray-400/20 rounded-full" />
             
             {/* The Orbiter (Rotating Container - Counter Clockwise) */}
             <motion.div 
                className="absolute inset-0 w-full h-full"
                animate={{ rotate: -360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
             >
                {/* The Dot (Planet) */}
                <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black rounded-full" />
             </motion.div>
          </div>

      </div>

      {/* Giant Background Text - Layer 1 (Behind Image) */}
      <motion.div 
        style={{ y: textY }}
        className="absolute inset-0 flex items-center justify-center z-[1] pointer-events-none select-none"
      >
        <h1 className="font-heading text-[22vw] md:text-[24vw] leading-none uppercase text-black tracking-tighter text-center whitespace-nowrap">
          GONZALEZ
        </h1>
      </motion.div>

      {/* Content Wrapper (Info Text) - Layer 20 (Top) */}
      <div className="absolute inset-0 z-[20] w-full h-full pointer-events-none">
          {/* We use a full-width container to position elements relative to the viewport/screen edges */}
          <div className="relative w-full h-full">
             
             {/* Left Info - Positioned specifically to overlap the top-left of the 'G' */}
             <motion.div 
               initial={{ opacity: 0, x: -30 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.5, duration: 0.8 }}
               className="hidden md:flex flex-col gap-1 absolute top-[18%] left-[11vw] pointer-events-auto text-left"
             >
               {isLoggedIn && setTitle ? (
                 <input 
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   className="text-[#222] text-xl font-sans font-medium leading-tight tracking-normal bg-transparent focus:outline-none border-b border-dashed border-gray-400 focus:border-black w-40"
                 />
               ) : (
                 <span className="text-[#222] text-xl font-sans font-medium leading-tight tracking-normal">
                   {title}
                 </span>
               )}

               {isLoggedIn && setSubtitle ? (
                 <input 
                   value={subtitle}
                   onChange={(e) => setSubtitle(e.target.value)}
                   className="text-black text-3xl font-sans font-medium leading-none tracking-tight bg-transparent focus:outline-none border-b border-dashed border-gray-400 focus:border-black w-72"
                 />
               ) : (
                 <span className="text-black text-3xl font-sans font-medium leading-none tracking-tight">
                   {subtitle}
                 </span>
               )}
             </motion.div>

             {/* Right Info: Scroll Down - Fixed to bottom right */}
             <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="absolute bottom-12 right-6 md:right-12 flex flex-col items-center gap-4 pointer-events-auto"
              >
                 <span className="text-xs font-semibold uppercase tracking-widest text-black">Scroll down</span>
                 <div className="h-12 w-[1px] bg-black"></div>
              </motion.div>
          </div>
      </div>

      {/* Center Image - Layer 10 (Middle) */}
      <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 left-0 w-full z-[10] flex justify-center items-end pointer-events-none"
      >
           <img 
             src={heroImage || "https://pikaso.cdnpk.net/private/production/2896258270/upload.png?token=exp=1766793600~hmac=2c97790b8d7ad380363ac432f166f4bda712d727f48dcdceefd435b6a6c6d21b&preview=1"} 
             alt="Vitor Gonzalez" 
             className="h-[80vh] md:h-[90vh] w-auto max-w-none object-contain drop-shadow-2xl"
           />

           {/* UPLOAD BUTTON OVERLAY (ADMIN ONLY) */}
           {isLoggedIn && setHeroImage && (
             <div className="absolute bottom-20 z-[30] pointer-events-auto">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <button 
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    className="flex items-center gap-2 px-6 py-3 bg-black/80 backdrop-blur-md text-white rounded-full font-bold uppercase text-xs tracking-wider border border-white/20 hover:bg-[#00c05e] hover:text-black transition-all shadow-xl"
                >
                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                    {isUploading ? "Uploading..." : "Change Hero Photo"}
                </button>
             </div>
           )}

      </motion.div>

    </section>
  );
};

export default Hero;