import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Marquee from './components/Marquee';
import Work from './components/Work';
import Process from './components/Process';
import Footer from './components/Footer';
import ProjectModal from './components/ProjectModal';
import AdminPanel from './components/AdminPanel';
import { supabase } from './lib/supabaseClient';
import { Project, BlockData, BlockSize } from './types';

// --- LAYOUT ALGORITHM ---
const reflowGrid = (projects: Project[]): Project[] => {
  const newProjects = [...projects];
  let i = 0;
  let pattern = 0;

  while (i < newProjects.length) {
    const remaining = newProjects.length - i;
    
    // Pattern 0: Big Left (Needs 2)
    if (pattern === 0 && remaining >= 2) {
        newProjects[i].className = "md:col-span-2 md:row-span-2";
        newProjects[i+1].className = "md:col-span-1 md:row-span-2";
        i += 2;
        pattern = 1;
    }
    // Pattern 1: Three Small (Needs 3)
    else if (pattern === 1 && remaining >= 3) {
        newProjects[i].className = "md:col-span-1 md:row-span-1";
        newProjects[i+1].className = "md:col-span-1 md:row-span-1";
        newProjects[i+2].className = "md:col-span-1 md:row-span-1";
        i += 3;
        pattern = 2;
    }
    // Pattern 2: Wide Left (Needs 2)
    else if (pattern === 2 && remaining >= 2) {
        newProjects[i].className = "md:col-span-2 md:row-span-1";
        newProjects[i+1].className = "md:col-span-1 md:row-span-1";
        i += 2;
        pattern = 3;
    }
    // Pattern 3: Big Right (Needs 2)
    else if (pattern === 3 && remaining >= 2) {
        newProjects[i].className = "md:col-span-1 md:row-span-2";
        newProjects[i+1].className = "md:col-span-2 md:row-span-2";
        i += 2;
        pattern = 4;
    }
    // Pattern 4: Wide Right (Needs 2)
    else if (pattern === 4 && remaining >= 2) {
        newProjects[i].className = "md:col-span-1 md:row-span-1";
        newProjects[i+1].className = "md:col-span-2 md:row-span-1";
        i += 2;
        pattern = 0; // Loop back
    }
    // Fallback: Single Square
    else {
        newProjects[i].className = "md:col-span-1 md:row-span-1";
        i += 1;
        pattern = 0; 
    }
  }
  return newProjects;
};

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  // -- Global Content State --
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Settings State
  const [settings, setSettings] = useState<Record<string, string>>({
    hero_title: "Freelance",
    hero_subtitle: "Designer & Developer",
    about_text: "Loading content...",
    about_title: "/ABOUT",
    about_footer: "Loading...",
    marquee_text: "DESIGN BY VITOR ✸",
    work_desc: "Loading...",
    process_title: "Visual Archive",
    process_subtitle: "Loading...",
    footer_cta: "Let's Work Together",
    footer_big_text: "VITOR GONZALEZ"
  });

  // -- Admin State --
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- SUPABASE FETCHING ---
  
  const fetchProjects = async () => {
    try {
      // Optimized: Fetch projects AND their blocks in a single relational query.
      // Selecting specific columns helps performance.
      const { data: projectsData, error: projError } = await supabase
        .from('projects')
        .select(`
            *,
            project_blocks (
                id,
                url,
                size,
                sort_order
            )
        `)
        .order('created_at', { ascending: false })
        .limit(50); // Safety limit to prevent timeouts

      if (projError) throw projError;

      // Merge data
      const formattedProjects: Project[] = (projectsData || []).map((p: any) => {
        // Sort blocks manually as nested sort behavior can vary
        const blocks = p.project_blocks || [];
        blocks.sort((a: any, b: any) => a.sort_order - b.sort_order);

        return {
            id: p.id,
            title: p.title,
            category: p.category,
            image: p.image,
            description: p.description,
            className: "", // Calculated by reflow
            layoutMode: p.layout_mode as 'collage' | 'pdf',
            gap: p.gap,
            likes: p.likes,
            blocks: blocks.map((b: any) => ({
                id: b.id,
                url: b.url,
                size: b.size as BlockSize
            }))
        };
      });

      setProjects(reflowGrid(formattedProjects));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (error) throw error;
      
      const newSettings = { ...settings };
      data.forEach((item: any) => {
        newSettings[item.key] = item.value;
      });
      setSettings(newSettings);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
        setIsLoggedIn(!!session);
    });

    // Listen for auth changes
    const {
        data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsLoggedIn(!!session);
    });

    const initData = async () => {
        await Promise.all([fetchProjects(), fetchSettings()]);
        // Keep the loader for at least 2.5s for the effect
        setTimeout(() => setLoading(false), 2500);
    };
    initData();

    return () => subscription.unsubscribe();
  }, []);


  // --- HANDLERS ---

  // Helper to update a setting in DB
  const updateSetting = async (key: string, value: string) => {
    // Update local immediately
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Update DB (Debounce could be added here for performance)
    const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value });
        
    if (error) console.error(`Error saving ${key}:`, error);
  };

  const handleAddProject = async () => {
    // Insert empty project
    const { data, error } = await supabase
        .from('projects')
        .insert([{
            title: "New Project",
            category: "Uncategorized",
            image: "https://placehold.co/600x600/111/333?text=Cover+Image",
            description: "Enter project description here...",
        }])
        .select()
        .single();

    if (error) {
        console.error("Error creating project:", error);
        return;
    }

    // Refetch to update grid
    await fetchProjects();
    
    // Open for editing
    // We need to construct the Project object manually to match local types immediately or just use the fetched one
    const newProject: Project = {
        id: data.id,
        title: data.title,
        category: data.category,
        image: data.image,
        className: "",
        description: data.description,
        likes: 0,
        blocks: [],
        layoutMode: 'collage',
        gap: 8
    };
    setSelectedProject(newProject);
  };

  const handleUpdateProject = async (updatedProject: Project) => {
    // Optimistic Update
    const newList = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    setProjects(newList);
    setSelectedProject(updatedProject);

    // 1. Update Project Details
    const { error: projError } = await supabase
        .from('projects')
        .update({
            title: updatedProject.title,
            category: updatedProject.category,
            description: updatedProject.description,
            image: updatedProject.image,
            layout_mode: updatedProject.layoutMode,
            gap: updatedProject.gap,
            likes: updatedProject.likes
        })
        .eq('id', updatedProject.id);

    if (projError) console.error("Error updating project details:", projError);

    // 2. Update Blocks
    // Strategy: Delete all blocks for this project and re-insert (simplest for syncing order/removals)
    // NOTE: In production, you might want to diff changes to avoid ID churn, but this is fine for now.
    
    if (updatedProject.blocks) {
        // Delete old
        await supabase.from('project_blocks').delete().eq('project_id', updatedProject.id);
        
        // Prepare new
        const blocksToInsert = updatedProject.blocks.map((b, index) => ({
            project_id: updatedProject.id,
            url: b.url,
            size: b.size,
            sort_order: index
        }));

        if (blocksToInsert.length > 0) {
            const { error: blocksError } = await supabase
                .from('project_blocks')
                .insert(blocksToInsert);
            
            if (blocksError) console.error("Error updating blocks:", blocksError);
        }
    }
  };

  const handleDeleteProject = async (id: number) => {
    // Optimistic UI
    const filtered = projects.filter(p => p.id !== id);
    setProjects(reflowGrid(filtered));

    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
        console.error("Error deleting project:", error);
        // Revert fetch if needed, but for now we assume success
        fetchProjects();
    }
  };

  return (
    <div className="bg-[#EAEAEA] min-h-screen text-black overflow-hidden relative">
      <AnimatePresence mode="wait">
        {loading && <Loader key="loader" />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)}
            isLoggedIn={isLoggedIn}
            onSave={handleUpdateProject}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAdminPanel && (
          <AdminPanel 
            onClose={() => setShowAdminPanel(false)}
            isLoggedIn={isLoggedIn}
            setIsLoggedIn={setIsLoggedIn}
          />
        )}
      </AnimatePresence>

      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-0"
        >
          <Navbar />
          <main>
            <Hero 
              isLoggedIn={isLoggedIn}
              title={settings.hero_title}
              setTitle={(v) => updateSetting('hero_title', v)}
              subtitle={settings.hero_subtitle}
              setSubtitle={(v) => updateSetting('hero_subtitle', v)}
            />
            <About 
              isLoggedIn={isLoggedIn}
              text={settings.about_text}
              setText={(v) => updateSetting('about_text', v)}
              title={settings.about_title}
              setTitle={(v) => updateSetting('about_title', v)}
              footerText={settings.about_footer}
              setFooterText={(v) => updateSetting('about_footer', v)}
            />
            <Marquee 
              isLoggedIn={isLoggedIn}
              text={settings.marquee_text}
              setText={(v) => updateSetting('marquee_text', v)}
            />
            <Work 
              isLoggedIn={isLoggedIn}
              description={settings.work_desc}
              setDescription={(v) => updateSetting('work_desc', v)}
            />
            <Process 
              projects={projects} 
              onProjectClick={setSelectedProject}
              isLoggedIn={isLoggedIn}
              onAddProject={handleAddProject}
              onDeleteProject={handleDeleteProject}
              title={settings.process_title}
              setTitle={(v) => updateSetting('process_title', v)}
              subtitle={settings.process_subtitle}
              setSubtitle={(v) => updateSetting('process_subtitle', v)}
            />
          </main>
          
          <Footer 
            onAdminClick={() => setShowAdminPanel(true)} 
            isLoggedIn={isLoggedIn}
            ctaText={settings.footer_cta}
            setCtaText={(v) => updateSetting('footer_cta', v)}
            bigText={settings.footer_big_text}
            setBigText={(v) => updateSetting('footer_big_text', v)}
          />
        </motion.div>
      )}
    </div>
  );
};

export default App;