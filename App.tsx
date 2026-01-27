
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Marquee from './components/Marquee';
import Work from './components/Work';
import Process from './components/Process';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import ProjectModal from './components/ProjectModal';
import AdminPanel from './components/AdminPanel';
import CustomCursor from './components/CustomCursor';
import { supabase } from './lib/supabaseClient';
import { Project, BlockData, BlockSize, BlockType } from './types';

const reflowGrid = (projects: Project[]): Project[] => {
  const newProjects = [...projects];
  let i = 0;
  let pattern = 0;

  while (i < newProjects.length) {
    const remaining = newProjects.length - i;
    if (pattern === 0 && remaining >= 2) {
        newProjects[i].className = "md:col-span-2 md:row-span-2";
        newProjects[i+1].className = "md:col-span-1 md:row-span-2";
        i += 2; pattern = 1;
    } else if (pattern === 1 && remaining >= 3) {
        newProjects[i].className = "md:col-span-1 md:row-span-1";
        newProjects[i+1].className = "md:col-span-1 md:row-span-1";
        newProjects[i+2].className = "md:col-span-1 md:row-span-1";
        i += 3; pattern = 2;
    } else if (pattern === 2 && remaining >= 2) {
        newProjects[i].className = "md:col-span-2 md:row-span-1";
        newProjects[i+1].className = "md:col-span-1 md:row-span-1";
        i += 2; pattern = 3;
    } else if (pattern === 3 && remaining >= 2) {
        newProjects[i].className = "md:col-span-1 md:row-span-2";
        newProjects[i+1].className = "md:col-span-2 md:row-span-2";
        i += 2; pattern = 4;
    } else if (pattern === 4 && remaining >= 2) {
        newProjects[i].className = "md:col-span-1 md:row-span-1";
        newProjects[i+1].className = "md:col-span-2 md:row-span-1";
        i += 2; pattern = 0; 
    } else {
        newProjects[i].className = "md:col-span-1 md:row-span-1";
        i += 1; pattern = 0; 
    }
  }
  return newProjects;
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  
  const [settings, setSettings] = useState<Record<string, string>>({
    hero_title: "Freelance",
    hero_subtitle: "Designer & Developer",
    hero_image: "https://pikaso.cdnpk.net/private/production/2896258270/upload.png?token=exp=1766793600~hmac=2c97790b8d7ad380363ac432f166f4bda712d727f48dcdceefd435b6a6c6d21b&preview=1",
    about_text: "Carregando conteúdo...",
    about_title: "/SOBRE",
    about_footer: "Carregando...",
    marquee_text: "DESIGN BY VITOR ✸",
    work_desc: "Carregando...",
    process_title: "Visual Archive",
    process_subtitle: "Carregando...",
    footer_cta: "Let's Work Together",
    footer_big_text: "VITOR GONZALEZ",
    testimonials_json: "[]"
  });

  const saveToSupabase = async (key: string, value: string) => {
    const { error } = await supabase.from('site_settings').upsert({ key, value });
    if (error) console.error(`Erro persistência (${key}):`, error.message);
  };

  const fetchProjects = async () => {
    try {
      const { data: projectsData, error } = await supabase.from('projects').select(`*, project_blocks (*)`).order('created_at', { ascending: false });
      if (error) throw error;
      const formatted = (projectsData || []).map((p: any) => ({
            id: p.id, title: p.title, category: p.category, image: p.image, description: p.description, className: "", layoutMode: p.layout_mode, gap: p.gap, likes: p.likes,
            blocks: (p.project_blocks || []).sort((a: any, b: any) => a.sort_order - b.sort_order).map((b: any) => ({
                id: b.id, url: b.url, size: b.size, type: b.type || 'image'
            }))
      }));
      setProjects(reflowGrid(formatted));
    } catch (e) { console.error(e); }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error) throw error;
      const newSettings = { ...settings };
      data.forEach((item: any) => { newSettings[item.key] = item.value; });
      setSettings(newSettings);
      return newSettings;
    } catch (e) { console.error(e); return settings; }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setIsLoggedIn(!!session));
    supabase.auth.onAuthStateChange((_event, session) => setIsLoggedIn(!!session));
    const init = async () => {
        await fetchSettings();
        await fetchProjects();
        setTimeout(() => setLoading(false), 800);
    };
    init();
  }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    saveToSupabase(key, value);
  };

  const updateTestimonial = (id: string, field: string, value: string) => {
    setSettings(prev => {
        const currentList = JSON.parse(prev.testimonials_json || '[]');
        const newList = currentList.map((t: any) => t.id === id ? { ...t, [field]: value } : t);
        const updatedJson = JSON.stringify(newList);
        saveToSupabase('testimonials_json', updatedJson);
        return { ...prev, testimonials_json: updatedJson };
    });
  };

  const addTestimonial = () => {
    setSettings(prev => {
        const currentList = JSON.parse(prev.testimonials_json || '[]');
        const newItem = { 
          id: 't-' + Date.now(), 
          text: "Clique para editar este depoimento...", 
          author: "Novo Cliente", 
          role: "Cargo", 
          avatar: "" 
        };
        const updatedJson = JSON.stringify([...currentList, newItem]);
        saveToSupabase('testimonials_json', updatedJson);
        return { ...prev, testimonials_json: updatedJson };
    });
  };

  const deleteTestimonial = (idToDelete: string) => {
    console.log("App: Executando exclusão do depoimento:", idToDelete);
    setSettings(prev => {
      const currentList = JSON.parse(prev.testimonials_json || '[]');
      const newList = currentList.filter((t: any) => String(t.id) !== String(idToDelete));
      const updatedJson = JSON.stringify(newList);
      saveToSupabase('testimonials_json', updatedJson);
      return { ...prev, testimonials_json: updatedJson };
    });
  };

  const handleUpdateProject = async (p: Project) => {
    setProjects(prev => prev.map(item => item.id === p.id ? p : item));
    setSelectedProject(p);
    await supabase.from('projects').update({ title: p.title, category: p.category, description: p.description, image: p.image, layout_mode: p.layoutMode, gap: p.gap, likes: p.likes }).eq('id', p.id);
  };

  let testimonialsData = [];
  try {
    testimonialsData = JSON.parse(settings.testimonials_json || '[]');
  } catch(e) {
    console.error("Erro ao processar JSON de depoimentos", e);
    testimonialsData = [];
  }

  return (
    <div className="bg-[#EAEAEA] min-h-screen text-black overflow-hidden relative">
      <CustomCursor />
      <AnimatePresence mode="wait">{loading && <Loader key="loader" />}</AnimatePresence>
      <AnimatePresence>{selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} isLoggedIn={isLoggedIn} onSave={handleUpdateProject} />}</AnimatePresence>
      <AnimatePresence>{showAdminPanel && <AdminPanel onClose={() => setShowAdminPanel(false)} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}</AnimatePresence>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: loading ? 0 : 1 }} transition={{ duration: 1.2 }} className="relative z-0">
        <Navbar />
        <main>
          <Hero isLoggedIn={isLoggedIn} title={settings.hero_title} setTitle={(v) => updateSetting('hero_title', v)} subtitle={settings.hero_subtitle} setSubtitle={(v) => updateSetting('hero_subtitle', v)} heroImage={settings.hero_image} setHeroImage={(v) => updateSetting('hero_image', v)} />
          <About isLoggedIn={isLoggedIn} text={settings.about_text} setText={(v) => updateSetting('about_text', v)} title={settings.about_title} setTitle={(v) => updateSetting('about_title', v)} footerText={settings.about_footer} setFooterText={(v) => updateSetting('about_footer', v)} />
          <Marquee isLoggedIn={isLoggedIn} text={settings.marquee_text} setText={(v) => updateSetting('marquee_text', v)} />
          <Work isLoggedIn={isLoggedIn} description={settings.work_desc} setDescription={(v) => updateSetting('work_desc', v)} />
          <Process projects={projects} onProjectClick={setSelectedProject} isLoggedIn={isLoggedIn} onAddProject={fetchProjects} onDeleteProject={(id) => { setProjects(prev => reflowGrid(prev.filter(p => p.id !== id))); supabase.from('projects').delete().eq('id', id); }} title={settings.process_title} setTitle={(v) => updateSetting('process_title', v)} subtitle={settings.process_subtitle} setSubtitle={(v) => updateSetting('process_subtitle', v)} />
          <Testimonials 
            isLoggedIn={isLoggedIn} 
            data={testimonialsData} 
            onUpdate={updateTestimonial} 
            onAdd={addTestimonial} 
            onDelete={deleteTestimonial} 
          />
        </main>
        <Footer onAdminClick={() => setShowAdminPanel(true)} isLoggedIn={isLoggedIn} ctaText={settings.footer_cta} setCtaText={(v) => updateSetting('footer_cta', v)} bigText={settings.footer_big_text} setBigText={(v) => updateSetting('footer_big_text', v)} />
      </motion.div>
    </div>
  );
};

export default App;
