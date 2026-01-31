
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { WorkItem, DEFAULT_THEME, ItemType, Project, PDFTheme, ProjectAsset, ProjectExpense, GlobalSettings } from './types';
import { treeService } from './services/treeService';
import { excelService, ImportResult } from './services/excelService';
import { TreeTable } from './components/TreeTable';
import { ThemeEditor } from './components/ThemeEditor';
import { WorkItemModal } from './components/WorkItemModal';
import { EvolutionChart } from './components/EvolutionChart';
import { PrintReport } from './components/PrintReport';
import { AssetManager } from './components/AssetManager';
import { ExpenseManager } from './components/ExpenseManager';
import { financial } from './utils/math';
import { useProjectState } from './hooks/useProjectState';
import { 
  Plus, TrendingUp, Database, Moon, Sun, HardHat, Search, Briefcase, 
  PieChart, Layers, FileSpreadsheet, UploadCloud, Menu, CheckCircle2, 
  Printer, Trash2, Edit2, Percent, Download, Lock, Undo2, Redo2, 
  ChevronRight, Settings, PlusCircle, BarChart3, Home, Clock, 
  AlertTriangle, FileText, DollarSign, Wallet, X, HardDrive, Info, Share2, Building2
} from 'lucide-react';

type ViewMode = 'global-dashboard' | 'project-workspace' | 'system-settings';
type ProjectTab = 'wbs' | 'branding' | 'stats' | 'documents' | 'expenses';

const App: React.FC = () => {
  const { 
    projects, activeProject, activeProjectId, setActiveProjectId, 
    globalSettings, setGlobalSettings,
    updateActiveProject, updateProjects, finalizeMeasurement,
    undo, redo, canUndo, canRedo
  } = useProjectState();

  const [viewMode, setViewMode] = useState<ViewMode>('global-dashboard');
  const [projectTab, setProjectTab] = useState<ProjectTab>('wbs');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedSnapshot, setSelectedSnapshot] = useState<number | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ItemType>('item');
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);
  const [targetParentId, setTargetParentId] = useState<string | null>(null);
  const [renameModal, setRenameModal] = useState({ isOpen: false, id: '', name: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '' });
  const [closeMeasurementModal, setCloseMeasurementModal] = useState(false);
  const [importSummary, setImportSummary] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentItems = useMemo(() => {
    if (!activeProject) return [];
    if (selectedSnapshot === null) return activeProject.items;
    const snap = activeProject.history?.find(h => h.measurementNumber === selectedSnapshot);
    return snap ? snap.items : [];
  }, [activeProject, selectedSnapshot]);

  const isReadOnly = selectedSnapshot !== null;

  const processedTree = useMemo(() => {
    if (!activeProject) return [];
    const tree = treeService.buildTree(currentItems);
    return tree.map((root, idx) => treeService.processRecursive(root, '', idx, activeProject.bdi));
  }, [activeProject, currentItems]);

  const flattenedList = useMemo(() => 
    treeService.flattenTree(processedTree, expandedIds)
  , [processedTree, expandedIds]);

  const stats = useMemo(() => {
    const totals = {
      contract: financial.sum(processedTree.map(n => n.contractTotal || 0)),
      current: financial.sum(processedTree.map(n => n.currentTotal || 0)),
      accumulated: financial.sum(processedTree.map(n => n.accumulatedTotal || 0)),
      balance: financial.sum(processedTree.map(n => n.balanceTotal || 0)),
      expenses: financial.sum((activeProject?.expenses || []).map(e => e.amount))
    };
    return { 
      ...totals, 
      progress: totals.contract > 0 ? (totals.accumulated / totals.contract) * 100 : 0,
      margin: totals.accumulated - totals.expenses
    };
  }, [processedTree, activeProject?.expenses]);

  const handleOpenProject = (id: string) => {
    setActiveProjectId(id);
    setViewMode('project-workspace');
    setProjectTab('wbs');
    setSelectedSnapshot(null);
    setMobileMenuOpen(false);
  };

  const handleCreateProject = () => {
    const newProj: Project = {
      id: crypto.randomUUID(),
      name: 'Novo Empreendimento',
      companyName: globalSettings.defaultCompanyName,
      measurementNumber: 1,
      referenceDate: new Date().toLocaleDateString('pt-BR'),
      logo: null,
      items: [],
      history: [],
      theme: { ...DEFAULT_THEME },
      bdi: 25,
      assets: [],
      expenses: [],
      config: { strict: false, printCards: true, printSubtotals: true }
    };
    updateProjects([...projects, newProj]);
    handleOpenProject(newProj.id);
  };

  const handleReorder = (sourceId: string, targetId: string, position: 'before' | 'after' | 'inside') => {
    if (!activeProject || isReadOnly) return;
    const newItems = treeService.reorderItems(activeProject.items, sourceId, targetId, position);
    updateActiveProject({ items: newItems });
  };

  return (
    <div className={`flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 ${isDarkMode ? 'dark' : ''}`}>
      <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx, .xls" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          setIsImporting(true);
          excelService.parseAndValidate(file).then(setImportSummary).finally(() => setIsImporting(false));
        }
      }} />

      {/* SIDEBAR RESPONSIVA */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-[110] lg:relative lg:translate-x-0 transition-transform duration-300 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col ${sidebarOpen ? 'w-72' : 'w-20'} ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"><HardHat size={20} /></div>
            {sidebarOpen && <span className="text-sm font-black tracking-tighter uppercase">ProMeasure <span className="text-indigo-500">Pro</span></span>}
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-2 text-slate-400"><X size={20} /></button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <NavItem active={viewMode === 'global-dashboard'} onClick={() => { setViewMode('global-dashboard'); setMobileMenuOpen(false); }} icon={<Home size={18}/>} label="Dashboard Principal" open={sidebarOpen} />
          <NavItem active={viewMode === 'system-settings'} onClick={() => { setViewMode('system-settings'); setMobileMenuOpen(false); }} icon={<Settings size={18}/>} label="Configurações Globais" open={sidebarOpen} />
          
          <div className="py-4 px-3 flex items-center justify-between">
            {sidebarOpen && <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Empreendimentos</h3>}
            <button onClick={handleCreateProject} className="text-indigo-500 hover:scale-110 transition-transform"><PlusCircle size={16}/></button>
          </div>

          <div className="space-y-1">
            {projects.map(p => (
              <button key={p.id} onClick={() => handleOpenProject(p.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${activeProjectId === p.id && viewMode === 'project-workspace' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                <Briefcase size={16} className="shrink-0" />
                {sidebarOpen && <span className="text-xs truncate text-left">{p.name}</span>}
              </button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 gap-2 flex flex-col">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center gap-3 p-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
            {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
            {sidebarOpen && <span className="text-xs font-bold uppercase tracking-widest">Modo {isDarkMode ? 'Claro' : 'Escuro'}</span>}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex w-full items-center gap-3 p-3 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
             <Menu size={18} />
             {sidebarOpen && <span className="text-xs font-bold uppercase tracking-widest">Recolher Menu</span>}
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* MOBILE TOP BAR */}
        <header className="lg:hidden h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 shrink-0 z-50">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 text-slate-600 dark:text-slate-300"><Menu size={24} /></button>
          <span className="ml-4 text-xs font-black uppercase tracking-widest truncate">
            {viewMode === 'global-dashboard' ? 'Dashboard' : (viewMode === 'system-settings' ? 'Configurações' : activeProject?.name)}
          </span>
        </header>

        {viewMode === 'global-dashboard' && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-12 custom-scrollbar animate-in fade-in duration-500">
             <div className="max-w-6xl mx-auto space-y-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div>
                      <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Central de Obras</h1>
                      <p className="text-slate-500 font-medium">Gestão de {projects.length} empreendimentos ativos.</p>
                   </div>
                   <button onClick={handleCreateProject} className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all">
                      <Plus size={16} /> Novo Empreendimento
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {projects.map(p => {
                      const projStats = treeService.calculateBasicStats(p.items, p.bdi);
                      return (
                        <div key={p.id} onClick={() => handleOpenProject(p.id)} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:border-indigo-500 transition-all cursor-pointer relative overflow-hidden">
                           <div className="flex justify-between items-start mb-6">
                              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-2xl"><Briefcase size={20}/></div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); setRenameModal({isOpen: true, id: p.id, name: p.name}); }} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={16}/></button>
                                <button onClick={(e) => { e.stopPropagation(); setDeleteModal({isOpen: true, id: p.id}); }} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={16}/></button>
                              </div>
                           </div>
                           <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1 truncate">{p.name}</h3>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Medição Atual: #{p.measurementNumber}</p>
                           <div className="space-y-4">
                              <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                                 <span className="text-slate-400">Progresso</span>
                                 <span className="text-indigo-600">{projStats.progress.toFixed(1)}%</span>
                              </div>
                              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${projStats.progress}%` }} />
                              </div>
                           </div>
                        </div>
                      )
                   })}
                </div>
             </div>
          </div>
        )}

        {viewMode === 'system-settings' && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-12 animate-in slide-in-from-bottom-4 duration-500">
            <div className="max-w-4xl mx-auto space-y-10">
              <header>
                <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">Configurações Globais</h1>
                <p className="text-slate-500 font-medium">Configure as preferências do seu workspace.</p>
              </header>

              <div className="grid grid-cols-1 gap-8">
                {/* CONFIGURAÇÃO DA EMPRESA */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><Building2 size={24}/></div>
                    <div>
                      <h3 className="font-black uppercase text-xs tracking-widest">Perfil da Empreiteira</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Nome padrão para novos projetos</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1 tracking-widest">Nome da Empresa</label>
                      <input 
                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 dark:text-white text-sm font-black focus:border-indigo-500 outline-none transition-all"
                        value={globalSettings.defaultCompanyName}
                        onChange={(e) => setGlobalSettings({ ...globalSettings, defaultCompanyName: e.target.value })}
                        placeholder="Ex: Alvorada Engenharia e Construções LTDA"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><HardDrive size={24}/></div>
                      <h3 className="font-black uppercase text-xs tracking-widest">Armazenamento</h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Os dados são salvos localmente no navegador (IndexedDB). Tamanho estimado: {Math.round(JSON.stringify(projects).length / 1024)} KB.</p>
                    <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">Online / Local</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl"><Trash2 size={24}/></div>
                      <h3 className="font-black uppercase text-xs tracking-widest">Resete do Sistema</h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Remova permanentemente todos os registros, históricos e configurações do dispositivo.</p>
                    <button onClick={() => { if(confirm("CUIDADO: Isso apagará TODOS os projetos e configurações. Continuar?")) { localStorage.clear(); window.location.reload(); } }} className="w-full py-4 border-2 border-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 transition-colors active:scale-95">Apagar Tudo</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'project-workspace' && activeProject && (
          <div className="flex-1 flex flex-col overflow-hidden">
             <header className="min-h-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between px-6 md:px-10 py-4 md:py-0 shrink-0 z-40 gap-4">
                <div className="flex flex-col gap-1 overflow-hidden">
                   <div className="hidden md:flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <Home size={12} className="cursor-pointer hover:text-indigo-500" onClick={() => setViewMode('global-dashboard')} />
                      <ChevronRight size={10} />
                      <span className="text-slate-500 truncate">{activeProject.name}</span>
                   </div>
                   <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
                      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner whitespace-nowrap">
                         <TabBtn active={projectTab === 'wbs'} onClick={() => setProjectTab('wbs')} label="Planilha EAP" icon={<Layers size={14}/>} />
                         <TabBtn active={projectTab === 'stats'} onClick={() => setProjectTab('stats')} label="Análise Fís-Fin" icon={<BarChart3 size={14}/>} />
                         <TabBtn active={projectTab === 'expenses'} onClick={() => setProjectTab('expenses')} label="Gestão Gastos" icon={<DollarSign size={14}/>} />
                         <TabBtn active={projectTab === 'documents'} onClick={() => setProjectTab('documents')} label="Documentação" icon={<FileText size={14}/>} />
                         <TabBtn active={projectTab === 'branding'} onClick={() => setProjectTab('branding')} label="Configurações" icon={<Settings size={14}/>} />
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-2 sm:gap-4">
                   {!isReadOnly && (
                     <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-inner">
                        <button disabled={!canUndo} onClick={undo} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-all shadow-sm"><Undo2 size={16}/></button>
                        <button disabled={!canRedo} onClick={redo} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg disabled:opacity-30 transition-all shadow-sm"><Redo2 size={16}/></button>
                     </div>
                   )}
                   <div className="flex items-center gap-2">
                    <button onClick={() => window.print()} title="Imprimir Relatório" className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"><Printer size={18}/></button>
                    {!isReadOnly && (
                      <button onClick={() => setCloseMeasurementModal(true)} disabled={!stats.current && !activeProject.items.some(it => it.currentQuantity > 0)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${(stats.current || activeProject.items.some(it => it.currentQuantity > 0)) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                          <Lock size={14}/> <span className="hidden xs:inline">Fechar Medição</span>
                      </button>
                    )}
                   </div>
                </div>
             </header>

             <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-10 bg-slate-50 dark:bg-slate-950">
                <div className="max-w-[1600px] mx-auto space-y-8">
                   {projectTab === 'wbs' && (
                     <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                           <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                              <button disabled={isReadOnly} onClick={() => { setTargetParentId(null); setModalType('item'); setEditingItem(null); setIsModalOpen(true); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 disabled:opacity-30 text-white font-black uppercase tracking-widest text-[9px] rounded-xl shadow-lg shadow-indigo-500/10"><Plus size={14}/> Novo Item</button>
                              <button disabled={isReadOnly} onClick={() => { setTargetParentId(null); setModalType('category'); setEditingItem(null); setIsModalOpen(true); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 disabled:opacity-30 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black uppercase tracking-widest text-[9px] rounded-xl"><Layers size={14}/> Novo Grupo</button>
                              <div className="hidden sm:block w-px h-6 bg-slate-100 dark:bg-slate-800 mx-1" />
                              
                              {/* FERRAMENTAS RESTAURADAS */}
                              <button onClick={() => excelService.downloadTemplate()} className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-indigo-600 transition-colors" title="Download Template Profissional">
                                <FileSpreadsheet size={16}/> <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Template</span>
                              </button>
                              <button disabled={isReadOnly || isImporting} onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-emerald-600 transition-colors" title="Importar Planilha XLSX">
                                {isImporting ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : <UploadCloud size={16}/>}
                                <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Importar</span>
                              </button>
                              <button onClick={() => excelService.exportProjectToExcel(activeProject, flattenedList)} className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-blue-600 transition-colors" title="Exportar Projeto para Excel">
                                <Download size={16}/> <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Exportar</span>
                              </button>
                           </div>
                           <div className="relative w-full lg:w-96">
                              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                              <input placeholder="Buscar na estrutura..." className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 pl-11 pr-4 py-3 rounded-xl text-xs outline-none focus:border-indigo-500 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                           </div>
                        </div>

                        <div className="table-container">
                          <TreeTable 
                            data={flattenedList} expandedIds={expandedIds} 
                            onToggle={id => { const n = new Set(expandedIds); n.has(id) ? n.delete(id) : n.add(id); setExpandedIds(n); }} 
                            onExpandAll={() => setExpandedIds(new Set(currentItems.filter(i => i.type === 'category').map(i => i.id)))}
                            onCollapseAll={() => setExpandedIds(new Set())}
                            onDelete={id => !isReadOnly && updateActiveProject({ items: activeProject.items.filter(i => i.id !== id && i.parentId !== id) })}
                            onUpdateQuantity={(id, qty) => !isReadOnly && updateActiveProject({ items: activeProject.items.map(it => it.id === id ? { ...it, currentQuantity: qty } : it) })}
                            onUpdatePercentage={(id, pct) => !isReadOnly && updateActiveProject({ items: activeProject.items.map(it => it.id === id ? { ...it, currentQuantity: financial.round((pct/100) * it.contractQuantity), currentPercentage: pct } : it) })}
                            onAddChild={(pid, type) => { if(!isReadOnly) { setTargetParentId(pid); setModalType(type); setEditingItem(null); setIsModalOpen(true); } }}
                            onEdit={item => { if(!isReadOnly) { setEditingItem(item); setModalType(item.type); setIsModalOpen(true); } }}
                            onReorder={handleReorder}
                            searchQuery={searchQuery}
                            isReadOnly={isReadOnly}
                          />
                        </div>
                     </div>
                   )}

                   {projectTab === 'stats' && (
                     <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                           <KpiCard label="Valor Contrato" value={financial.formatBRL(stats.contract)} icon={<Briefcase size={20}/>} progress={100} color="indigo" />
                           <KpiCard label="Executado Total" value={financial.formatBRL(stats.accumulated)} icon={<PieChart size={20}/>} progress={stats.progress} color="emerald" />
                           <KpiCard label="Gastos Reais" value={financial.formatBRL(stats.expenses)} icon={<Wallet size={20}/>} progress={(stats.expenses / stats.contract) * 100} color="rose" />
                           <KpiCard label="Saldo Margem" value={financial.formatBRL(stats.margin)} icon={<DollarSign size={20}/>} progress={(stats.margin / stats.accumulated) * 100} color={stats.margin >= 0 ? 'emerald' : 'rose'} highlight />
                           <KpiCard label="Saldo Reman." value={financial.formatBRL(stats.balance)} icon={<Database size={20}/>} progress={100 - stats.progress} color="slate" />
                        </div>
                        <EvolutionChart history={activeProject.history || []} currentProgress={stats.progress} />
                     </div>
                   )}

                   {projectTab === 'branding' && (
                     <div className="space-y-12 animate-in fade-in duration-500">
                        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm max-w-4xl mx-auto">
                           <div className="flex items-center gap-4 mb-10">
                              <div className="p-4 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-500/20"><Percent size={24} /></div>
                              <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white">Taxa de BDI</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Multiplicador aplicado a todos os itens sem BDI</p>
                              </div>
                           </div>
                           <div className="flex flex-col sm:flex-row items-center gap-10">
                              <div className="flex-1 w-full">
                                 <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Percentual (%)</label>
                                 <div className="relative">
                                    <input disabled={isReadOnly} type="number" step="0.01" className="w-full px-8 py-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-4xl font-black focus:border-indigo-500 outline-none pr-20 dark:text-slate-100 transition-all" value={activeProject.bdi} onChange={(e) => updateActiveProject({ bdi: parseFloat(e.target.value) || 0 })} />
                                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300">%</span>
                                 </div>
                              </div>
                              <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800 text-center flex flex-col justify-center">
                                 <p className="text-[9px] font-black text-indigo-400 uppercase mb-2 tracking-widest">Fator Multiplicador</p>
                                 <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{(1 + activeProject.bdi/100).toFixed(4)}x</p>
                              </div>
                           </div>
                        </div>
                        <ThemeEditor theme={activeProject.theme} onChange={(theme: PDFTheme) => !isReadOnly && updateActiveProject({ theme })} />
                     </div>
                   )}

                   {projectTab === 'expenses' && <ExpenseManager expenses={activeProject.expenses || []} onAdd={(e) => updateActiveProject({ expenses: [...activeProject.expenses, e] })} onUpdate={(id, d) => updateActiveProject({ expenses: activeProject.expenses.map(ex => ex.id === id ? {...ex, ...d} : ex) })} onDelete={(id) => updateActiveProject({ expenses: activeProject.expenses.filter(ex => ex.id !== id) })} workItems={activeProject.items} measuredValue={stats.accumulated} isReadOnly={isReadOnly} />}
                   {projectTab === 'documents' && <AssetManager assets={activeProject.assets || []} onAdd={(a) => updateActiveProject({ assets: [...activeProject.assets, a] })} onDelete={(id) => updateActiveProject({ assets: activeProject.assets.filter(as => as.id !== id) })} isReadOnly={isReadOnly} />}
                </div>
             </div>
          </div>
        )}
      </main>

      {/* MODAL DE ENCERRAMENTO */}
      {closeMeasurementModal && activeProject && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] p-12 shadow-2xl border border-white/10 text-center">
              <div className="w-24 h-24 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"><Lock size={42} /></div>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-4 uppercase tracking-tighter">Congelar Período?</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-10 font-medium leading-relaxed">A medição <strong>#{activeProject.measurementNumber}</strong> será salva permanentemente.<br/>O valor do período é <strong>{financial.formatBRL(stats.current)}</strong>.</p>
              <div className="flex gap-4">
                <button onClick={() => setCloseMeasurementModal(false)} className="flex-1 py-5 text-xs font-black uppercase text-slate-400 hover:text-slate-600 transition-colors tracking-widest">Voltar</button>
                <button onClick={() => { finalizeMeasurement(); setCloseMeasurementModal(false); }} className="flex-[2] py-5 bg-indigo-600 text-white rounded-[2rem] text-xs font-black uppercase shadow-xl shadow-indigo-500/20 active:scale-95 transition-all tracking-widest">Confirmar e Abrir Próxima</button>
              </div>
           </div>
        </div>
      )}

      {activeProject && isModalOpen && (
        <WorkItemModal 
          isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={(data) => {
            if (editingItem) {
              updateActiveProject({ items: activeProject.items.map(it => it.id === editingItem.id ? { ...it, ...data } : it) });
            } else {
              const parentId = targetParentId || data.parentId || null;
              const newItem: WorkItem = {
                id: crypto.randomUUID(), parentId, name: data.name || 'Novo Registro', type: data.type || modalType, wbs: '', order: activeProject.items.filter(i => i.parentId === parentId).length,
                unit: data.unit || 'un', contractQuantity: data.contractQuantity || 0, unitPrice: 0, unitPriceNoBdi: data.unitPriceNoBdi || 0, contractTotal: 0,
                previousQuantity: 0, previousTotal: 0, currentQuantity: 0, currentTotal: 0, currentPercentage: 0,
                accumulatedQuantity: 0, accumulatedTotal: 0, accumulatedPercentage: 0, balanceQuantity: 0, balanceTotal: 0
              };
              updateActiveProject({ items: [...activeProject.items, newItem] });
              if (newItem.parentId) setExpandedIds(new Set([...expandedIds, newItem.parentId]));
            }
          }} 
          editingItem={editingItem} type={modalType} categories={activeProject.items.filter(i => i.type === 'category') || []} 
          projectBdi={activeProject.bdi || 0} 
        />
      )}
      
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl text-center">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={24} /></div>
              <h3 className="text-xl font-black mb-4 dark:text-white uppercase tracking-tight">Excluir Obra?</h3>
              <p className="text-xs text-slate-500 mb-10 leading-relaxed font-medium">Os dados e o histórico desta obra serão permanentemente removidos.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal({isOpen: false, id: ''})} className="flex-1 py-4 text-xs font-black uppercase text-slate-400">Voltar</button>
                <button onClick={() => { updateProjects(projects.filter(p => p.id !== deleteModal.id)); setActiveProjectId(null); setViewMode('global-dashboard'); setDeleteModal({isOpen: false, id: ''}); }} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase shadow-lg shadow-rose-500/20 active:scale-95 transition-all tracking-widest">Sim, Excluir</button>
              </div>
           </div>
        </div>
      )}
      
      {importSummary && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[3rem] p-12 shadow-2xl border border-white/10">
            <div className="flex items-center gap-6 mb-10 text-emerald-500">
              <div className="p-5 bg-emerald-500/10 rounded-[2rem]"><CheckCircle2 size={56} /></div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-slate-800 dark:text-white">Planilha Importada</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-12">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-8 rounded-3xl text-center border border-indigo-100">
                <p className="text-[32px] font-black text-indigo-600">{importSummary.stats.categories}</p>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Grupos</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-3xl text-center border border-emerald-100">
                <p className="text-[32px] font-black text-emerald-600">{importSummary.stats.items}</p>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Serviços</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setImportSummary(null)} className="flex-1 py-5 text-xs font-black uppercase text-slate-400 hover:text-slate-600 transition-colors tracking-widest">Cancelar</button>
              <button onClick={() => { activeProject && updateActiveProject({ items: [...activeProject.items, ...importSummary.items] }); setImportSummary(null); }} className="flex-[2] py-5 bg-emerald-600 text-white rounded-[2rem] text-xs font-black uppercase shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all tracking-widest">Confirmar Tudo</button>
            </div>
          </div>
        </div>
      )}

      {activeProject && <PrintReport project={activeProject} data={flattenedList} stats={stats} />}
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label, open }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}`}>
    <div className="shrink-0">{icon}</div>
    {open && <span className="text-[11px] font-black uppercase tracking-widest truncate text-left">{label}</span>}
  </button>
);

const TabBtn = ({ active, onClick, label, icon }: any) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>
    {icon} <span className="hidden sm:inline">{label}</span>
  </button>
);

const KpiCard = ({ label, value, icon, progress, color, highlight = false }: any) => {
  const colors: any = { indigo: 'text-indigo-600', emerald: 'text-emerald-600', rose: 'text-rose-600', slate: 'text-slate-600' };
  return (
    <div className={`p-8 rounded-[32px] border shadow-sm hover:shadow-xl transition-all relative overflow-hidden group ${highlight ? 'bg-slate-50 border-indigo-200 dark:bg-indigo-950/10 dark:border-indigo-900' : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-800'}`}>
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:${colors[color]} transition-colors`}>{icon}</div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <p className={`text-2xl font-black tracking-tighter mb-4 ${colors[color]}`}>{value}</p>
      <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-current opacity-70 transition-all duration-1000" style={{ width: `${Math.min(100, Math.abs(progress || 0))}%`, color: `var(--tw-text-opacity)` }} />
      </div>
    </div>
  );
};

export default App;
