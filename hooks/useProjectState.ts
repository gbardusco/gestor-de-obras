
import { useState, useCallback, useEffect } from 'react';
import { Project, ProjectGroup, MeasurementSnapshot, GlobalSettings } from '../types';
import { treeService } from '../services/treeService';

interface State {
  projects: Project[];
  groups: ProjectGroup[];
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
        groups: parsed.groups || [],
        projects: (parsed.projects || []).map((p: any) => ({
          ...p,
          groupId: p.groupId || null,
          assets: p.assets || [],
          expenses: p.expenses || []
        })),
        globalSettings: parsed.globalSettings || INITIAL_SETTINGS
      };
    }
    return {
      projects: [],
      groups: [],
      activeProjectId: null,
      globalSettings: INITIAL_SETTINGS
    };
  });
  const [future, setFuture] = useState<State[]>([]);

  useEffect(() => {
    localStorage.setItem('promeasure_v4_data', JSON.stringify(present));
  }, [present]);

  const bulkUpdate = useCallback((updates: Partial<State> | ((prev: State) => Partial<State>)) => {
    setPresent(prev => {
      const resolvedUpdates = typeof updates === 'function' ? updates(prev) : updates;
      setPast(p => [...p, prev].slice(-20));
      setFuture([]);
      return { ...prev, ...resolvedUpdates };
    });
  }, []);

  const undo = useCallback(() => {
    setPresent(prev => {
      if (past.length === 0) return prev;
      const previous = past[past.length - 1];
      setPast(past.slice(0, past.length - 1));
      setFuture(f => [prev, ...f]);
      return previous;
    });
  }, [past]);

  const redo = useCallback(() => {
    setPresent(prev => {
      if (future.length === 0) return prev;
      const next = future[0];
      setFuture(future.slice(1));
      setPast(p => [...p, prev]);
      return next;
    });
  }, [future]);

  const finalizeMeasurement = useCallback(() => {
    setPresent(prev => {
      const activeProject = prev.projects.find(p => p.id === prev.activeProjectId);
      if (!activeProject) return prev;

      const stats = treeService.calculateBasicStats(activeProject.items, activeProject.bdi);
      const tree = treeService.buildTree(activeProject.items);
      const processedTree = tree.map((r, i) => treeService.processRecursive(r, '', i, activeProject.bdi));
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

      const updatedProjects = prev.projects.map(p => 
        p.id === prev.activeProjectId ? {
          ...p,
          items: nextPeriodItems,
          history: [...(p.history || []), snapshot],
          measurementNumber: (p.measurementNumber || 1) + 1,
          referenceDate: new Date().toLocaleDateString('pt-BR')
        } : p
      );

      return { ...prev, projects: updatedProjects };
    });
  }, []);

  return {
    ...present,
    activeProject: present.projects.find(p => p.id === present.activeProjectId) || null,
    setGlobalSettings: (s: GlobalSettings) => bulkUpdate({ globalSettings: s }),
    setActiveProjectId: (id: string | null) => setPresent(prev => ({ ...prev, activeProjectId: id })),
    updateActiveProject: (data: Partial<Project>) => bulkUpdate(prev => ({ projects: prev.projects.map(p => p.id === prev.activeProjectId ? { ...p, ...data } : p) })),
    updateProjects: (projects: Project[]) => bulkUpdate({ projects }),
    updateGroups: (groups: ProjectGroup[]) => bulkUpdate({ groups }),
    bulkUpdate,
    finalizeMeasurement,
    undo, redo, canUndo: past.length > 0, canRedo: future.length > 0
  };
};
