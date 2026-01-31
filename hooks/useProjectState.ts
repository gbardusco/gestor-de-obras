
import { useState, useCallback, useEffect } from 'react';
import { Project, WorkItem, MeasurementSnapshot, DEFAULT_THEME, GlobalSettings } from '../types';
import { treeService } from '../services/treeService';

interface State {
  projects: Project[];
  activeProjectId: string | null;
  globalSettings: GlobalSettings;
}

const INITIAL_SETTINGS: GlobalSettings = {
  defaultCompanyName: 'Sua Empresa de Engenharia',
  userName: 'Usuário ProMeasure',
  language: 'pt-BR'
};

export const useProjectState = () => {
  const [past, setPast] = useState<State[]>([]);
  const [present, setPresent] = useState<State>(() => {
    const saved = localStorage.getItem('promeasure_v4_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        projects: parsed.projects.map((p: any) => ({
          ...p,
          assets: p.assets || [],
          expenses: p.expenses || []
        })),
        globalSettings: parsed.globalSettings || INITIAL_SETTINGS
      };
    }
    
    // Fallback para legado v4_projects se existir
    const legacySaved = localStorage.getItem('promeasure_v4_projects');
    const legacyParsed = legacySaved ? JSON.parse(legacySaved) : [];
    return {
      projects: legacyParsed,
      activeProjectId: legacyParsed.length > 0 ? legacyParsed[0].id : null,
      globalSettings: INITIAL_SETTINGS
    };
  });
  const [future, setFuture] = useState<State[]>([]);

  useEffect(() => {
    localStorage.setItem('promeasure_v4_data', JSON.stringify(present));
  }, [present]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const saveHistory = useCallback((newState: State) => {
    setPast(prev => [...prev, present].slice(-20)); // Limite de 20 níveis de undo
    setPresent(newState);
    setFuture([]);
  }, [present]);

  const undo = useCallback(() => {
    if (!canUndo) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setFuture(prev => [present, ...prev]);
    setPresent(previous);
    setPast(newPast);
  }, [canUndo, past, present]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setPast(prev => [...prev, present]);
    setPresent(next);
    setFuture(newFuture);
  }, [canRedo, future, present]);

  const updateProjects = useCallback((newProjects: Project[]) => {
    saveHistory({ ...present, projects: newProjects });
  }, [present, saveHistory]);

  const setGlobalSettings = useCallback((settings: GlobalSettings) => {
    saveHistory({ ...present, globalSettings: settings });
  }, [present, saveHistory]);

  const setActiveProjectId = useCallback((id: string | null) => {
    setPresent(prev => ({ ...prev, activeProjectId: id }));
  }, []);

  const updateActiveProject = useCallback((data: Partial<Project>) => {
    const newProjects = present.projects.map(p => 
      p.id === present.activeProjectId ? { ...p, ...data } : p
    );
    updateProjects(newProjects);
  }, [present, updateProjects]);

  const finalizeMeasurement = useCallback(() => {
    const activeProject = present.projects.find(p => p.id === present.activeProjectId);
    if (!activeProject) return;

    const tree = treeService.buildTree(activeProject.items);
    const processedTree = tree.map((r, i) => treeService.processRecursive(r, '', i, activeProject.bdi));
    const stats = treeService.calculateBasicStats(activeProject.items, activeProject.bdi);
    
    const processedItemsFlat = treeService.flattenTree(processedTree, new Set(activeProject.items.map(i => i.id)));

    const snapshot: MeasurementSnapshot = {
      measurementNumber: activeProject.measurementNumber,
      date: activeProject.referenceDate || new Date().toLocaleDateString('pt-BR'),
      items: JSON.parse(JSON.stringify(processedItemsFlat)),
      totals: {
        contract: stats.contract,
        period: stats.current,
        accumulated: stats.accumulated,
        progress: stats.progress
      }
    };

    const nextPeriodItems = activeProject.items.map(item => {
      if (item.type === 'item') {
        return {
          ...item,
          previousQuantity: (item.previousQuantity || 0) + (item.currentQuantity || 0),
          previousTotal: (item.previousTotal || 0) + (item.currentTotal || 0),
          currentQuantity: 0,
          currentTotal: 0,
          currentPercentage: 0
        };
      }
      return item;
    });

    updateActiveProject({
      items: nextPeriodItems,
      history: [...(activeProject.history || []), snapshot],
      measurementNumber: (activeProject.measurementNumber || 1) + 1,
      referenceDate: new Date().toLocaleDateString('pt-BR')
    });
  }, [present, updateActiveProject]);

  return {
    projects: present.projects,
    activeProjectId: present.activeProjectId,
    activeProject: present.projects.find(p => p.id === present.activeProjectId) || null,
    globalSettings: present.globalSettings,
    setGlobalSettings,
    setActiveProjectId,
    updateActiveProject,
    updateProjects,
    finalizeMeasurement,
    undo,
    redo,
    canUndo,
    canRedo
  };
};
