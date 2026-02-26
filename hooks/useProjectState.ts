
import { useState, useCallback, useEffect } from 'react';
import { Project, ProjectGroup, GlobalSettings, BiddingProcess, Supplier, CompanyCertificate, GlobalStockItem, GlobalStockMovement, StockRequest } from '../types';
import { journalService } from '../services/journalService';

interface State {
  projects: Project[];
  biddings: BiddingProcess[];
  groups: ProjectGroup[];
  suppliers: Supplier[];
  globalStock: GlobalStockItem[];
  globalMovements: GlobalStockMovement[];
  stockRequests: StockRequest[];
  activeProjectId: string | null;
  activeBiddingId: string | null;
  globalSettings: GlobalSettings;
}

const INITIAL_SETTINGS: GlobalSettings = {
  defaultCompanyName: 'Sua Empresa de Engenharia',
  companyCnpj: '',
  userName: 'Usuário ProMeasure',
  language: 'pt-BR',
  currencySymbol: 'R$',
  certificates: []
};

const MAX_HISTORY = 20;

const INITIAL_STOCK: GlobalStockItem[] = [
  { id: 's1', name: 'Cimento CP-II', unit: 'Saco 50kg', currentQuantity: 450, minQuantity: 100, averagePrice: 32.50, lastEntryDate: new Date().toISOString(), status: 'normal', order: 0 },
  { id: 's2', name: 'Areia Lavada', unit: 'm³', currentQuantity: 15, minQuantity: 20, averagePrice: 120.00, lastEntryDate: new Date().toISOString(), status: 'critical', order: 1 },
  { id: 's3', name: 'Brita nº 1', unit: 'm³', currentQuantity: 40, minQuantity: 15, averagePrice: 115.00, lastEntryDate: new Date().toISOString(), status: 'normal', order: 2 },
  { id: 's4', name: 'Tijolo Cerâmico 9x19x19', unit: 'Milheiro', currentQuantity: 8, minQuantity: 5, averagePrice: 850.00, lastEntryDate: new Date().toISOString(), status: 'normal', order: 3 },
  { id: 's5', name: 'Aço CA-50 10mm', unit: 'Barra 12m', currentQuantity: 120, minQuantity: 50, averagePrice: 65.00, lastEntryDate: new Date().toISOString(), status: 'normal', order: 4 },
];

const INITIAL_MOVEMENTS: GlobalStockMovement[] = [
  { id: 'm1', itemId: 's1', type: 'entry', quantity: 500, date: new Date(Date.now() - 86400000 * 2).toISOString(), responsible: 'Almoxarife Central', originDestination: 'Pátio Central', notes: 'Compra via Pregão 01/2024' },
  { id: 'm2', itemId: 's1', type: 'exit', quantity: 50, date: new Date(Date.now() - 86400000).toISOString(), responsible: 'Eng. João', originDestination: 'Reforma Escola Municipal', notes: 'Fundação' },
];

const INITIAL_REQUESTS: StockRequest[] = [
  { id: 'r1', projectId: 'p1', projectName: 'Reforma Escola Municipal', itemId: 's2', itemName: 'Areia Lavada', quantity: 10, date: new Date().toISOString(), status: 'pending' },
];

export const useProjectState = () => {
  const [present, setPresent] = useState<State>(() => {
    const saved = localStorage.getItem('promeasure_v4_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          globalStock: parsed.globalStock || INITIAL_STOCK,
          globalMovements: parsed.globalMovements || INITIAL_MOVEMENTS,
          stockRequests: parsed.stockRequests || INITIAL_REQUESTS,
          projects: (parsed.projects || []).map((p: any) => ({
            ...p,
            workforce: p.workforce || [],
            laborContracts: p.laborContracts || [], // Garantia de inicialização
            stock: p.stock || [], // Garantia de inicialização
            expenses: (p.expenses || []).map((e: any) => ({
              ...e,
              status: e.status || (e.isPaid ? 'PAID' : 'PENDING')
            }))
          }))
        };
      } catch (e) {
        console.error("Erro ao carregar dados salvos:", e);
      }
    }
    return { 
      projects: [], 
      biddings: [], 
      groups: [], 
      suppliers: [], 
      globalStock: INITIAL_STOCK, 
      globalMovements: INITIAL_MOVEMENTS, 
      stockRequests: INITIAL_REQUESTS, 
      activeProjectId: null, 
      activeBiddingId: null, 
      globalSettings: INITIAL_SETTINGS 
    };
  });

  const [past, setPast] = useState<State[]>([]);
  const [future, setFuture] = useState<State[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem('promeasure_v4_data', JSON.stringify(present));
    } catch (e) {
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert("CRÍTICO: Limite excedido! Remova fotos ou obras antigas.");
      }
    }
  }, [present]);

  const commit = useCallback((updater: (prev: State) => State) => {
    setPresent(prev => {
      const next = updater(prev);
      if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      
      setPast(pastPrev => [...pastPrev, prev].slice(-MAX_HISTORY));
      setFuture([]);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPresent(prev => {
      if (past.length === 0) return prev;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      setFuture(f => [prev, ...f].slice(0, MAX_HISTORY));
      setPast(newPast);
      return previous;
    });
  }, [past]);

  const redo = useCallback(() => {
    setPresent(prev => {
      if (future.length === 0) return prev;
      const next = future[0];
      const newFuture = future.slice(1);
      setPast(p => [...p, prev].slice(-MAX_HISTORY));
      setFuture(newFuture);
      return next;
    });
  }, [future]);

  const updateActiveProject = useCallback((data: Partial<Project>) => {
    commit(prev => {
      const activeIdx = prev.projects.findIndex(p => p.id === prev.activeProjectId);
      if (activeIdx === -1) return prev;

      const active = prev.projects[activeIdx];
      let autoLogs: any[] = [];
      if (data.expenses) autoLogs = [...autoLogs, ...journalService.checkExpenseStatusDeltas(active.expenses, data.expenses)];
      if (data.items) autoLogs = [...autoLogs, ...journalService.checkWorkItemDeltas(active.items, data.items)];

      const updatedProject: Project = { 
        ...active, 
        ...data,
        journal: {
          ...active.journal,
          entries: autoLogs.length > 0 ? [...autoLogs, ...active.journal.entries] : active.journal.entries
        }
      };

      const updatedProjects = [...prev.projects];
      updatedProjects[activeIdx] = updatedProject;
      return { ...prev, projects: updatedProjects };
    });
  }, [commit]);

  return {
    ...present,
    activeProject: present.projects.find(p => p.id === present.activeProjectId) || null,
    updateActiveProject,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    setActiveProjectId: (id: string | null) => commit(prev => ({ ...prev, activeProjectId: id })),
    updateProjects: (projects: Project[]) => commit(prev => ({ ...prev, projects })),
    updateGroups: (groups: ProjectGroup[]) => commit(prev => ({ ...prev, groups })),
    updateSuppliers: (suppliers: Supplier[]) => commit(prev => ({ ...prev, suppliers })),
    updateBiddings: (biddings: BiddingProcess[]) => commit(prev => ({ ...prev, biddings })),
    updateGlobalStock: (stock: GlobalStockItem[]) => commit(prev => ({ ...prev, globalStock: stock })),
    updateGlobalMovements: (movements: GlobalStockMovement[]) => commit(prev => ({ ...prev, globalMovements: movements })),
    updateStockRequests: (requests: StockRequest[]) => commit(prev => ({ ...prev, stockRequests: requests })),
    updateCertificates: (certificates: CompanyCertificate[]) => commit(prev => ({ 
      ...prev, 
      globalSettings: { ...prev.globalSettings, certificates } 
    })),
    setGlobalSettings: (s: GlobalSettings) => commit(prev => ({ ...prev, globalSettings: s })),
    bulkUpdate: (updates: Partial<State>) => commit(prev => ({ ...prev, ...updates }))
  };
};
