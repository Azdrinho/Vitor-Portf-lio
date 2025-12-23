import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, LogOut, Loader2, AlertCircle, Database, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AdminPanelProps {
  onClose: () => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onClose, 
  isLoggedIn, 
  setIsLoggedIn
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        setError(error.message);
        setLoading(false);
    } else {
        // Successful login
        setIsLoggedIn(true);
        setLoading(false);
        onClose();
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setLoading(false);
    onClose();
  };

  // Function to populate DB with demo content
  const handleSeedDatabase = async () => {
    if (!confirm("This will add demo content to your database. Continue?")) return;
    
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
        // 1. Seed Settings
        const settingsData = [
            { key: 'hero_title', value: 'Freelance' },
            { key: 'hero_subtitle', value: 'Designer & Developer' },
            { key: 'about_title', value: '/ABOUT' },
            { key: 'about_text', value: 'Vitor Gonzalez is a talented Freelance Designer & Developer based in Brazil, specializing in high-end digital experiences and brand identity.' },
            { key: 'about_footer', value: 'Currently working with Loom Corporate as a Product Designer' },
            { key: 'marquee_text', value: 'DESIGN BY VITOR ✸ DIGITAL PRODUCT AND BRAND ✸' },
            { key: 'work_desc', value: 'Mastering industry-standard tools to bring creative visions to life with precision and flair.' },
            { key: 'process_title', value: 'Visual Archive' },
            { key: 'process_subtitle', value: 'A collection of selected works and experiments.' },
            { key: 'footer_cta', value: "Let's Work Together" },
            { key: 'footer_big_text', value: 'VITOR GONZALEZ' }
        ];

        for (const item of settingsData) {
            await supabase.from('site_settings').upsert(item, { onConflict: 'key' });
        }

        // 2. Seed Skills
        const { count: skillsCount } = await supabase.from('skills').select('*', { count: 'exact', head: true });
        if (skillsCount === 0) {
            const skillsData = [
                { title: 'After Effects', category: 'Motion', color: '#00005b', proficiency: 90, icon_type: 'ae', sort_order: 1 },
                { title: 'Photoshop', category: 'Design', color: '#31a8ff', proficiency: 95, icon_type: 'ps', sort_order: 2 },
                { title: 'Illustrator', category: 'Vector', color: '#ff9a00', proficiency: 85, icon_type: 'ai', sort_order: 3 },
                { title: 'Premiere Pro', category: 'Video', color: '#00005b', proficiency: 80, icon_type: 'pr', sort_order: 4 },
                { title: 'Sony Vegas', category: 'Editing', color: '#333333', proficiency: 70, icon_type: 'vegas', sort_order: 5 },
            ];
            await supabase.from('skills').insert(skillsData);
        }

        // 3. Seed Projects (Only if empty to avoid duplicates on multiple clicks)
        const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
        
        if (projectCount === 0) {
            const projects = [
                {
                    title: "Loom Corporate",
                    category: "Product Design",
                    description: "A comprehensive dashboard redesign for a leading analytics platform.",
                    image: "https://placehold.co/800x600/111/FFF?text=Loom+Project",
                    layout_mode: "collage",
                    gap: 8,
                    likes: 124
                },
                {
                    title: "Vogue Editorial",
                    category: "Art Direction",
                    description: "Digital spread layout and typography for the September issue.",
                    image: "https://placehold.co/800x1000/222/FFF?text=Vogue+Editorial",
                    layout_mode: "pdf",
                    gap: 20,
                    likes: 89
                },
                {
                    title: "Nike Air Campaign",
                    category: "Motion Graphics",
                    description: "High energy social media assets for the new Air Max launch.",
                    image: "https://placehold.co/800x800/333/FFF?text=Nike+Motion",
                    layout_mode: "collage",
                    gap: 8,
                    likes: 256
                }
            ];

            // Insert projects and get IDs to insert blocks
            for (const p of projects) {
                const { data: proj, error } = await supabase.from('projects').insert(p).select().single();
                if (!error && proj) {
                    // Add dummy blocks for the project
                    const blocks = [
                        { project_id: proj.id, url: p.image, size: 'wide', sort_order: 0 },
                        { project_id: proj.id, url: "https://placehold.co/600x600/444/FFF?text=Detail+1", size: 'square', sort_order: 1 },
                        { project_id: proj.id, url: "https://placehold.co/600x800/555/FFF?text=Detail+2", size: 'tall', sort_order: 2 }
                    ];
                    await supabase.from('project_blocks').insert(blocks);
                }
            }
        }

        setSuccessMsg("Database populated successfully! Refreshing...");
        setTimeout(() => {
            window.location.reload();
        }, 1500);

    } catch (err: any) {
        console.error(err);
        setError("Error seeding data: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 w-full max-w-sm relative shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center justify-center text-center pt-4">
            
            {!isLoggedIn ? (
                <form onSubmit={handleLogin} className="w-full space-y-6">
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-4">
                            <Lock size={28} />
                        </div>
                        <h2 className="font-heading text-2xl uppercase mb-1">Admin Access</h2>
                        <p className="text-gray-500 text-sm">Enter credentials to edit website.</p>
                    </div>
                    
                    <div className="space-y-3 text-left">
                        <div>
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email"
                                className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black border border-transparent transition-all"
                                required
                            />
                        </div>
                        <div>
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full p-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-black border border-transparent transition-all"
                                required
                            />
                        </div>
                        
                        {error && (
                            <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-2 rounded text-left">
                                <AlertCircle size={14} className="shrink-0" /> {error}
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[#00c05e] text-white rounded-full font-bold uppercase tracking-wide hover:bg-black transition-colors shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : "Enter Editor Mode"}
                    </button>
                </form>
            ) : (
                <div className="w-full space-y-6">
                     <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                            <LogOut size={28} />
                        </div>
                        <h2 className="font-heading text-2xl uppercase mb-1">Log Out</h2>
                        <p className="text-gray-500 text-sm">Exit editor mode?</p>
                    </div>

                    {/* SEED DATA BUTTON */}
                    <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400 mb-3">Database Setup</p>
                        <button 
                            onClick={handleSeedDatabase}
                            disabled={loading}
                            className="w-full py-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl font-bold uppercase text-xs tracking-wide hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                        >
                             {loading ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
                             Restore Default Content
                        </button>
                        {successMsg && (
                             <div className="mt-2 text-green-600 text-xs flex items-center justify-center gap-1 font-bold">
                                 <CheckCircle2 size={12} /> {successMsg}
                             </div>
                        )}
                        {error && (
                            <div className="mt-2 text-red-500 text-xs">{error}</div>
                        )}
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        disabled={loading}
                        className="w-full py-4 bg-gray-100 text-black rounded-full font-bold uppercase tracking-wide hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign Out"}
                    </button>
                </div>
            )}

        </div>

      </motion.div>
    </motion.div>
  );
};

export default AdminPanel;