
import React, { useState, useEffect } from 'react';
import { useProjectState } from './hooks/useProjectState';
import { projectService } from './services/projectService';

// Componentes Modulares
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { SettingsView } from './components/SettingsView';
import { ProjectWorkspace } from './components/ProjectWorkspace';

import { Menu } from 'lucide-react';

type ViewMode = 'global-dashboard' | 'project-workspace' | 'system-settings';

const App: React.FC = () => {
  const { 
    projects, groups, activeProject, activeProjectId, setActiveProjectId, 
    globalSettings, setGlobalSettings,
    updateActiveProject, updateProjects, updateGroups, bulkUpdate, finalizeMeasurement,
    undo, redo, canUndo, canRedo
  } = useProjectState();

  const [viewMode, setViewMode] = useState<ViewMode>('global-dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('promeasure_theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('promeasure_theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const handleOpenProject = (id: string) => {
    setActiveProjectId(id);
    setViewMode('project-workspace');
    setMobileMenuOpen(false);
  };

  const handleCreateProject = (groupId: string | null = null) => {
    const newProj = projectService.createProject(
      'Novo Empreendimento', 
      globalSettings.defaultCompanyName, 
      groupId
    );
    updateProjects([...projects, newProj]);
    handleOpenProject(newProj.id);
  };

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar 
        isOpen={sidebarOpen} setIsOpen={setSidebarOpen}
        mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen}
        viewMode={viewMode} setViewMode={setViewMode}
        projects={projects} groups={groups} activeProjectId={activeProjectId}
        onOpenProject={handleOpenProject} onCreateProject={handleCreateProject}
        isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="no-print lg:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 shrink-0 z-50">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-600 dark:text-slate-300"><Menu size={24} /></button>
          <span className="ml-4 text-xs font-black uppercase tracking-widest truncate">
            {viewMode === 'global-dashboard' ? 'Dashboard' : (viewMode === 'system-settings' ? 'Configurações' : activeProject?.name)}
          </span>
        </header>

        {viewMode === 'global-dashboard' && (
          <DashboardView 
            projects={projects} groups={groups}
            onOpenProject={handleOpenProject} 
            onCreateProject={handleCreateProject} 
            onUpdateProjects={updateProjects}
            onUpdateGroups={updateGroups}
            onBulkUpdate={bulkUpdate}
          />
        )}

        {viewMode === 'system-settings' && (
          <SettingsView settings={globalSettings} onUpdate={setGlobalSettings} projectCount={projects.length} />
        )}

        {viewMode === 'project-workspace' && activeProject && (
          <ProjectWorkspace 
            project={activeProject}
            onUpdateProject={updateActiveProject}
            onCloseMeasurement={finalizeMeasurement}
            canUndo={canUndo} canRedo={canRedo} onUndo={undo} onRedo={redo}
          />
        )}
      </main>
    </div>
  );
};

export default App;
